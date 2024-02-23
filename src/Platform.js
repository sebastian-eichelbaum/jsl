import _ from "lodash";

import { jslObject } from "@jsl/Object";

import isElectron from "@jsl/platforms/electron/isElectron";
import { assert, Test } from "@jsl/Assert";

// Provides platform specific functionality.
export class Platform extends jslObject {
    /**
     * Create the default config for this class.
     *
     * @return {Object} - The default config.
     */
    static defaultConfig() {
        return {
            // Allows to configure window manegement specific settings:
            windowManagement: {
                // If the platform supports it, allow the app to be closed programmatically?
                allowClose: true,
                // If the platform supports it, allow windows to be minimized programmatically?
                allowMinimize: true,
                // If the platform supports it, allow windows to be maximized programmatically?
                allowMaximize: true,
                // If the platform supports it, allow windows to be fullscreen-ed programmatically?d
                allowFullscreen: true,
                // Allow the user to drag the window using the jsl AppBar.
                allowDrag: true,
            },
        };
    }

    /**
     * Consturtc the platform using the given config as @see
     * Platform.defaultConfig.
     *
     * @param {Object} config The config as in @see Platform.defaultConfig/
     */
    constructor(config = {}) {
        super(config);

        this.m_closeHandler = null;

        // OS asked to close
        window?.jslPlatform?.onClose(() => {
            // If no custom handler is provided, just close.
            if (this.m_closeHandler == null) {
                window.close();
            }
            this.m_closeHandler?.();
        });
    }

    /**
     * The config
     *
     * @return {Object} The config structured as in @see Platform.defaultConfig.
     */
    get config() {
        return this.m_config;
    }

    /**
     * Checks if the app is running in a web browser (not in electron or other
     * wrappers).
     *
     * @returns {Boolean} True if in a web browser
     */
    get isWeb() {
        return !isElectron();
    }

    // Open a link either directly or in a new tab/external browser
    openLink(href, external) {
        // console.log("Open " + href);
        if (external) {
            window.open(href, "_blank");
        } else {
            console.error("Open Link not implemented");
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Window management

    /**
     * Returns true if this platforms allows to close the app. Browsers do not
     * support it.
     */
    get canCloseWindow() {
        return this.config.windowManagement.allowClose && !this.isWeb;
    }

    /**
     * Returns true if this platforms allows to minimize windows. Browsers do not
     * support it.
     */
    get canMinimizeWindow() {
        return this.config.windowManagement.allowMinimize && !this.isWeb;
    }

    /**
     * Returns true if this platforms allows to minimize windows. Browsers do not
     * support it.
     */
    get canMaximizeWindow() {
        return this.config.windowManagement.allowMaximize && !this.isWeb;
    }

    /**
     * Returns true if this platforms allows to minimize windows. Browsers do not
     * support it.
     */
    get canFullscreenWindow() {
        return this.config.windowManagement.allowFullscreen && !this.isWeb;
    }

    /**
     * Returns true if this platforms allows to drag windows using the jsl Appbar. Browsers do not
     * support it. NOTE: If the platform provides a window frame, it is always draggable using that frame. This value is
     * for custom window-frames like jsl AppBar.
     */
    get canDragWindow() {
        return this.config.windowManagement.allowDrag && !this.isWeb;
    }

    /**
     * Close the currently focussed window if supported.
     *
     * @param {Boolean} force - if true, the window is closed without asking.
     * @async
     * @returns {Promise<>} Async promise
     */
    async windowClose(force = false) {
        if (!this.canCloseWindow) {
            console.warn("Close is not supported on this platform");
            return;
        }
        return window.jslPlatform?.windowClose?.(force);
    }

    /**
     * Set the function that is triggered when a window close event comes in.
     *
     * @param {Function} handler - A function. If it is set (not nullish), it has to handle close!
     */
    set onClose(handler) {
        this.m_closeHandler = handler;
    }

    /**
     * Minimize the currently focussed window if supported.
     *
     * @param {Boolean|null} [state] - If true, minimizes the window. If false, unminimizes it. If null, state is
     * toggled.
     *
     * @returns {Promise<Boolean>} True if in minimized
     */
    async windowMinimize(state = null) {
        if (!this.canMinimizeWindow) {
            console.warn("Minimize is not supported on this platform");
            return false;
        }
        return window.jslPlatform?.windowMinimize?.(state);
    }

    /**
     * Maximize the currently focussed window if supported.
     *
     * @param {Boolean|null} [state] - If true, minimizes the window. If false, unminimizes it. If null, state is
     * toggled.
     *
     * @returns {Promise<Boolean>} True if in maximized
     */
    async windowMaximize(state = null) {
        if (!this.canMaximizeWindow) {
            console.warn("Maximize is not supported on this platform");
            return false;
        }

        return window.jslPlatform?.windowMaximize?.(state);
    }

    /**
     * Fullscreen the currently focussed window if supported.
     *
     * @param {Boolean|null} [state] - If true, minimizes the window. If false, unminimizes it. If null, state is
     * toggled.
     *
     * @returns {Promise<Boolean>} True if in fullscreen
     */
    async windowFullscreen(state = null) {
        if (!this.canFullscreenWindow) {
            console.warn("Fullscreen is not supported on this platform");
            return false;
        }

        return window.jslPlatform?.windowFullscreen?.(state);
    }

    /**
     * Check if the window is in fullscreen right now.
     *
     * @returns {Promise<Boolean>} True if in fullscreen
     */
    async windowIsFullscreen() {
        return window.jslPlatform?.windowIsFullscreen?.() || false;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // IO

    /**
     * Read file from path as text.
     *
     * @async
     * @param {String} filePath - Path to the file. Absolute.
     * @returns {Promise<String>} The file contents as UTF-8 string.
     */
    async readTextFile(filePath) {
        assert(Test.isNonEmptyString(filePath), "filePath must be a non-empty string.");
        return window.jslPlatform?.readTextFile?.(filePath);
    }

    /**
     * Read file from path as text and parse as json.
     *
     * @async
     * @param {String} filePath - Path to the file. Absolute.
     * @returns {Promise<Object>} The parsed object from JSON.
     */
    async readJSONFile(filePath) {
        assert(Test.isNonEmptyString(filePath), "filePath must be a non-empty string.");
        return window.jslPlatform?.readJSONFile?.(filePath);
    }
}

// The platform instance
export let platform = null;

/**
 * Construct the platform singleton and return the instance. If called multiple
 * times, this throws.
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
