import _ from "lodash";

import AppLogo from "jsl/assets/logos/app.png";
import AppCompactLogo from "jsl/assets/logos/app.png";
import CompanyLogo from "jsl/assets/logos/company.png";
import Favicon from "jsl/assets/favicon.png";

// Provides application customization points.
export class AppConfig {
    /**
     * Create the default config for this class.
     *
     * @return {Object} - The default config.
     */
    static defaultConfig() {
        return {
            // Version info. If null-ish, the macro __APP_VERSION__ is used.
            version: null,

            // Allows to specify a release channel name. If null, the env var __APP_CHANNEL__ is used. You might also
            // want to set this to __APP_CUSTOMIZATION_ID__
            channel: null,

            // The application name
            name: "MyApp",

            // The company name
            company: "MyCompany",

            // All options in AppConfig reflect values of the customer you are building this app for. This field allows
            // to provide info on WHO wrote this app. It is only shown in those "made by" sections of your app.
            //
            // ALWAYS provide this. Believe me, some day you will customize the app for a certain customer. So, set this
            // to your company/website to have a proper MadeBy field in your app.
            madeBy: {
                name: "RealAppName",
                company: "ThoseWhoWroteThis",
                url: "https://www.thosewhowrotethis.com",
            },

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

            // Some common mail adresses
            emails: {
                // Info
                info: "info@mycompany.de",

                // Contact
                contact: "contact@mycompany.de",

                // Support
                support: "support@mycompany.de",
            },

            // Logo URLs
            logos: {
                // A favicon
                favicon: Favicon,

                // A logo of the company
                company: CompanyLogo,
                // A logo of the app itself
                app: AppLogo,

                // A compact logo of the app itself
                // You can specify fiddle values for logos. This is true for all logos and shown here as an example
                // - very handy for finetuning size and placement of logos in the app bar for example.
                appCompact: {
                    url: AppCompactLogo,
                    // How much space should the logo image cover? Aspect ratio is always respected. See these as some
                    // kind of max sizes.
                    width: "125px",
                    height: "32px",

                    // Logos are usually some fancy text. This allows to shift the assumed baseline of that text
                    // from the bottom of the inage, upwards.
                    baselineShift: "0px",
                },

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

        // Set favicon as early as possible
        this.update();
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
        return this.config.version || __APP_VERSION__;
    }

    // The app channel
    get channel() {
        return this.config.channel || __APP_CHANNEL__;
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

    // The email info
    get emails() {
        return this.config.emails;
    }

    // Logos
    get logos() {
        return this.config.logos;
    }

    // Besides all white-labeling and customer adoption, who actually build this app?
    get madeBy() {
        return this.config.madeBy;
    }

    /**
     * Updates the site favicon and the title.
     */
    update() {
        if (document == null) {
            console.warn("Document not set. Cannot update AppConfig.");
        }

        // favicon
        var link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
        }
        link.href = this.config.logos.favicon;

        // title
        document.title = this.config.name;
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
