import { usePreferredDark } from "@vueuse/core";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import "@mdi/font/css/materialdesignicons.css";

// Ensure the main styles are available
import "jsl/styles/main.scss";
// import "vuetify/styles";

import _ from "lodash";

// Helper class to manage creation and configuration of vuetify.
export class Vuetify {
    /**
     * Default configuration
     */
    static defaultConfig() {
        return {
            themes: {
                // Add arbitrary themes.
                // Ref to https://vuetifyjs.com/en/features/theme/
                // myDark: {
                //     dark: true,
                //     colors: {
                //         primary: "#8a0748",
                //         secondary: "#0b43a4",
                //         surface: "#252428",
                //     },
                //     // Alows provide more fine-grained control over some JSL components. Either use css rgb/rgba, hex
                //     // or named vuetify colors like "primary-darken-1"
                //     jsl: {
                //         // Default colors for jsl Windows.vue
                //         windowTitleBG: "#ff0000",
                //         scrollbarBG: "background",
                //         scrollbarFG: "primary",
                //
                //         // Style defaults are also supported
                //         style: {
                //             card: {
                //                 rounded: "xl",
                //                 elevation: 5,
                //             },
                //         }
                //
                //         // The components can define their own keys. Refer to the component you want to modify.
                //         // Search for "styleDefaultProp" in the component you want to modify
                //     }
                // },
            },

            // Explicitly disable certain themes by name.
            themeBlacklist: [
                // Vuetify always provides the themes "light" and "dark"
                // "light"
                // "dark"
            ],

            // The default theme. If null or empty, use the previously set theme or
            // light if nothing was set previously.
            defaultTheme: null,
        };
    }

    // Create the vuetify wrapper and the actual vuetify instance
    constructor(config = {}) {
        this.m_config = _.merge(Vuetify.defaultConfig(), config);
        this.m_vuetify = createVuetify({
            components,
            directives,
            icons: {
                defaultSet: "mdi",
            },
            theme: {
                defaultTheme: this.m_config.defaultTheme || this.getPreferredTheme(),
                themes: this.m_config.themes,
            },
        });
    }

    /**
     * Try to guess the preferred theme. This uses the previously set theme or
     * uses the dark/light preference of the user's browser/system.
     */
    getPreferredTheme() {
        const storedTheme = localStorage.getItem("jsl.vuetify.theme");
        if (storedTheme != null) {
            return storedTheme;
        }
        return usePreferredDark() ? "dark" : "light";
    }

    /**
     * Get a list of theme names. This respects the blacklist.
     *
     * @return {Array} the theme names after blacklisting.
     */
    get themes() {
        return Object.keys(this.m_vuetify.theme.themes.value).filter(
            (theme) => !this.m_config.themeBlacklist.includes(theme),
        );
    }

    /**
     * Get the name of the currently active theme.
     *
     * @return {String} the active theme
     */
    get theme() {
        return this.m_vuetify.theme.global.name.value;
    }

    /**
     * Get the current theme colors.
     *
     * @return {Object} The color object as defined by vuetify.
     */
    get themeColors() {
        return this.m_vuetify.theme.global.current.value.colors;
    }

    /**
     * Get the current theme config.
     *
     * @return {Object} The config object as defined by vuetify.
     */
    get themeConfig() {
        return this.m_vuetify.theme.global.current.value;
    }

    /**
     * Set the active theme if it exists. If not, the theme is not changed.
     *
     * @param {String} name The theme name
     */
    set theme(name) {
        if (!this.isValidTheme(name)) {
            return;
        }
        this.m_vuetify.theme.global.name.value = name;
    }

    /**
     * Test if the give theme name is valid. This respects the whitelist/blacklist.
     *
     * @param {String} themeName The theme name
     * @return {Boolean} true if the theme is available and not/blacklisted
     */
    isValidTheme(themeName) {
        return this.themes.includes(themeName);
    }

    /**
     * Get the actual vuetify instance to use in vue as plugin.
     *
     * @return
     */
    get vuetify() {
        return this.m_vuetify;
    }
}

// The vuetify instance
export let vuetify = null;

/**
 * Gets the currently active theme. Shortcut for vuetify.themeConfig
 *
 * @returns {Object} The current vuetify theme instance.
 */
export function useTheme() {
    return vuetify.themeConfig;
}

/**
 * Gets the currently active theme's JSL style extension. Shortcut for vuetify.themeConfig.jsl.style
 *
 * @returns {Object} The current style or an empty object if not present.
 */
export function useJslStyle() {
    return vuetify?.themeConfig?.jsl?.style || {};
}

/**
 * Construct the Vuetify singleton and return the vue plugin instance. If called multiple times, this throws.
 *
 * @param {Object} config The config as in @see Vuetify.defaultConfig
 *
 * @return {Object} The vue plugin
 */
export function make(config) {
    if (vuetify != null) {
        throw new Error("Vuetify is instantiated already.");
    }

    vuetify = new Vuetify(config);
    return vuetify;
}
