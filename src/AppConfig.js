import _ from "lodash";

import DefaultLogo from "@jslassets/DefaultLogo.png";

// Provides application customization points.
export class AppConfig {
    /**
     * Create the default config for this class.
     *
     * @return {Object} - The default config.
     */
    static defaultConfig() {
        return {
            // Version info
            version: "1.0",

            // The application name
            name: "MyApp",

            // The company name
            company: "MyCompany",

            // Some of the URLs. Can be relative.
            urls: {
                // App base URL
                app: "https://www.mycompany.de/myapp",
                // Company website
                company: "https://www.mycompany.de",
                // Company Shop Website
                shop: "https://www.mycompany.de/shop",

                // Legal stuff
                legal: {
                    dataPrivacy: "https://www.mycompany.de/dataprivacy",
                    imprint: "https://www.mycompany.de/imprint",
                    termsAndConditions: "https://www.mycompany.de/terms",
                    licences: "vendor.licenses.txt",
                },
            },

            // Logo URLs
            logos: {
                // A logo of the company
                company: DefaultLogo,
                // A logo of the app itself
                app: DefaultLogo,
                // A compact logo of the app itself
                appCompact: DefaultLogo,

                // A HTML-ified logo. Allows to inject HTML as Logo. Takes precedence over the given "app" logo if
                // not nullish.
                appHTML: null,
                // A HTML-ified compact logo. Allows to inject HTML as Logo. Takes precedence over the given "appCompact"
                // logo if not nullish.
                appCompactHTML: null,
            },
        };
    }

    /**
     * Coastruct the app configuration using the given config as @see AppConfig.defaultConfig.
     *
     * @param {Object} config The config as in @see AppConfig.defaultConfig/
     */
    constructor(config = {}) {
        this.m_config = _.merge(AppConfig.defaultConfig(), config);
    }

    /**
     * The config
     *
     * @return {Object} The config structured as in @see AppConf.defaultConfig.
     */
    get config() {
        return this.m_config;
    }

    // The app name
    get name() {
        return this.config.name;
    }

    // The app version
    get version() {
        return this.config.version;
    }

    // The company name
    get company() {
        return this.config.company;
    }

    // The url info
    get url() {
        return this.config.urls;
    }

    // The url info
    get urls() {
        return this.config.urls;
    }

    // Logos
    get logos() {
        return this.config.logos;
    }
}

// The app config instance
export let appConfig = null;

/**
 * Construct the AppConfig singleton and return the instance. If called multiple times, this throws.
 *
 * @param {Object} config The config as in @see AppConf.defaultConfig
 *
 * @return {Object} The instance
 */
export function make(config) {
    if (appConfig != null) {
        throw new Error("AppConfig is instantiated already.");
    }

    appConfig = new AppConfig(config);
    return appConfig;
}
