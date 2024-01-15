import { appConfig as appConfigSingleton, make as makeAppConfig } from "@jsl/AppConfig";
import { backend as backendSingleton, make as makeBackend } from "@jsl/Backend";
import { localization as localizationSingleton, make as makeLocalization } from "@jsl/Localization";
import { make as makePlatform, platform as platformSingleton } from "@jsl/Platform";
import { make as makeVuetify, vuetify as vuetifySingleton } from "@jsl/Vuetify";
import _ from "lodash";
import { createApp, ref } from "vue";

/**
 * Wrapps around all the needed init steps to setup and build the Vue app.
 */
export class App {
    /**
     * Generate a default config.
     */
    static defaultConfig() {
        return {
            // The platform config as @see Platform.defaultConfig documents.
            platform: {},
            // The platform config as @see AppConfig.defaultConfig documents.
            appConfig: {},
            // The vuetify config as @see Vuetify.defaultConfig documents.
            vuetify: {},
            // The backend config as @see Backend.defaultConfig documents.
            backend: {},
            // The localization config as @see Localization.defaultConfig documents.
            localization: {},

            // As jsl creates the Vue app for you, you can configure some aspects.
            vue: {
                // Which component is the main (entry point component)?
                mainComponent: null,
                // The id of the div to moint the app into
                mountPoint: "#app",

                // Called before mount. This allows you to add more vue plugins as
                // needed.
                onSetup: (app) => {
                    // const pinia = createPinia();
                    // app.use(pinia)
                },
            },
        };
    }

    /**
     * Construct the vue app but do not yet init or mount.
     *
     * @param {Function} configFactory - A function that generates the  app config
     *     which basically is a collection of
     * configs for each subsystem. @see App.defaultConfig for some details. The
     * function gets passed the actual App instance. Use this in callbacks when
     * needed.
     */
    constructor(configFactory) {
        if (typeof configFactory !== "function") {
            throw new Error("App takes a factory function to create the config.", configFactory);
        }

        this.m_configFactory = configFactory;
        this.m_config = null; // _.merge(App.defaultConfig(), config);
        this.m_vueApp = null;
        this.m_isInit = false;
    }

    /**
     * Initialize all subsystems. Init order is AppConfig, Platform, Vuetify,
     * Localization, Backend.
     *
     * @return {Promise} A promise either denoting success or failure.
     */
    async init() {
        if (this.m_isInit) {
            return;
        }

        try {
            this.m_isInit = true;
            this.m_config = _.merge(App.defaultConfig(), this.m_configFactory(this));

            makeAppConfig(this.config.appConfig);
            makePlatform(this.config.platform);
            makeVuetify(this.config.vuetify);
            const localization = makeLocalization(this.config.localization);
            const backend = makeBackend(this.config.backend);

            // Init them.
            await localization.init();
            await backend.init();
            await backend.ready();

            // init vue
            this.m_vueApp = createApp(this.config.vue.mainComponent);
            this.m_vueApp.use(this.vuetify.vuetify);
            this.m_vueApp.use(this.localization.vuei18n);

            this.config.vue.onSetup?.(this.m_vueApp);
        } catch (error) {
            // TODO: Make init overlay show the error!
            throw error;
        }
    }

    /**
     * Mount and run! If the app is not yet initialized,
     */
    async run() {
        await this.init().then(() => {
            this.vueApp.mount(this.config.vue.mountPoint);
        });
    }

    /**
     * The app config as in @see App.defaultConfig
     *
     * @return {Object} the app config
     */
    get config() {
        return this.m_config;
    }

    /**
     * Get the singleton instance as created during construction/init.
     *
     * @return {import("@jsl/Platform").Platform} - the singleton jsl/Platform
     *     instance
     */
    get platform() {
        return platformSingleton;
    }

    /**
     * Get the singleton instance as created during construction/init.
     *
     * @return {import("@jsl/AppConfig").AppConfig} - the singleton jsl/AppConfig
     *     instance
     */
    get appConfig() {
        return appConfigSingleton;
    }

    /**
     * Get the singleton instance as created during construction/init.
     *
     * @return {import("@jsl/Vuetify").Vuetify} - the singleton jsl/Vuetify
     *     instance
     */
    get vuetify() {
        return vuetifySingleton;
    }

    /**
     * Get the singleton instance as created during construction/init.
     *
     * @return {import("@jsl/Backend").Backend} - the singleton jsl/Backend
     *     instance
     */
    get backend() {
        return backendSingleton;
    }

    /**
     * Get the singleton instance as created during construction/init.
     *
     * @return {import("@jsl/Localization").Localization} - the singleton
     *     jsl/Localization instance
     */
    get localization() {
        return localizationSingleton;
    }

    /**
     * Get te created vue app instance
     *
     * @return {import(vue).App} the vue app
     */
    get vueApp() {
        return this.m_vueApp;
    }
}

// The app instance
export let app = null;

/**
 * Construct the App singleton and return the instance. If called multiple
 * times, this throws.
 *
 * @param {Object} config The config as in @see App.defaultConfig
 *
 * @return {Object} The instance
 */
export function make(config) {
    if (app != null) {
        throw new Error("App is instantiated already.");
    }

    app = new App(config);
    return app;
}
