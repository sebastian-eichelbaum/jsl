import { usePreferredDark } from "@vueuse/core";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import "@mdi/font/css/materialdesignicons.css";

// Ensure the main styles are available
import "@jsl/styles/main.scss";
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
     *
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
