import _ from "lodash";

// Provides platform specific functionality.
export class Platform {
    /**
     * Create the default config for this class.
     *
     * @return {Object} - The default config.
     */
    static defaultConfig() {
        return {
            // TODO
        };
    }

    /**
     * Consturtc the platform using the given config as @see Platform.defaultConfig.
     *
     * @param {Object} config The config as in @see Platform.defaultConfig/
     */
    constructor(config = {}) {
        this.m_config = _.merge(Platform.defaultConfig(), config);
    }

    /**
     * The config
     *
     * @return {Object} The config structured as in @see Platform.defaultConfig.
     */
    get config() {
        return this.m_config;
    }

    // Open a link either directly or in a new tab/external browser
    openLink(href, external) {
        //console.log("Open " + href);
        if (external) {
            window.open(href, "_blank");
        } else {
            console.error("Open Link not implemented");
        }
    }

    // If this is a standalone app, close it. If not, nothing happens.
    closeApp() {
        window.close();
    }

    /**
     * Returns true if this platforms allows to close the app. Browsers do not support it.
     */
    get canCloseApp() {
        return true;
    }
}

// The platform instance
export let platform = null;

/**
 * Construct the platform singleton and return the instance. If called multiple times, this throws.
 *
 * @param {Object} config The config as in @see Platform.defaultConfig
 *
 * @return {Object} The instance
 */
export function make(config) {
    if (platform != null) {
        throw new Error("Platform is instantiated already.");
    }

    platform = new Platform(config);
    return platform;
}
