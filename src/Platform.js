import _ from "lodash";

import { jslObject } from "jsl/Object";
import { TypeHelpers } from "jsl/utils/TypeHelpers";

import isElectron from "jsl/platforms/electron/isElectron";
import { assert, Test } from "jsl/Assert";

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
        this.m_forceClose = false;

        // OS asked to close
        window?.jslPlatform?.onClose(() => {
            // Allows to set a "force flag"
            if (this.m_forceClose === true) {
                window.close();
                return;
            }

            // If no custom handler is provided, just close.
            if (this.m_closeHandler == null) {
                window.close();
                return;
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

    /**
     * Check if the OS is in dark mode. Only works in browsers that support it.
        *
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
     *
     * @returns {Boolean} True if dark mode is active
     */
    get isDarkMode() {
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    // Open a link either directly or in a new tab/external browser
    openLink(href, external) {
        if (!Test.isNonEmptyString(href)) {
            return;
        }

        // console.log("Open " + href);
        if (external) {
            window.open(href, "_blank");
        } else {
            console.error("Open Link not implemented");
        }
    }

    /**
     * Open the given path in the desktop system's manner. On platforms that support this, this opens the dir/fiel in
     * some file explorer or an app that handles it.
     *
     * @param {Array<String>|String} path - The path to open. If this is an array, it will get merged.
     * @returns {Promise<>} Throws on error like invalid paths. Resolves AFTER the opened file has been closed again.
     */
    async openFile(path) {
        assert(
            Test.isString(path) || Test.arrayOnlyContainsString(path),
            "Path must be a string or an array of strings",
        );

        if (this.isWeb) {
            return;
        }

        return window.jslPlatform?.openFile?.(path);
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
     * Sets the force-close flag. If true, the window will close without asking the user.
     *
     * @param {Boolean} value - True to close without asking.
     */
    set forceClose(value) {
        this.m_forceClose = value || false;
    }

    /**
     * Gets the force-close flag. If true, the window will close without asking the user.
     *
     * @return {Boolean} - True to close without asking.
     */
    get forceClose() {
        return this.m_forceClose;
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
        assert(
            Test.isString(filePath) || Test.arrayOnlyContainsString(filePath),
            "Path must be a string or an array of strings",
        );

        return window.jslPlatform?.readTextFile?.(filePath);
    }

    /**
     * Write file from to path as text.
     *
     * @async
     * @param {String} filePath - Path to the file. Absolute.
     * @param {String} contents - File contents.
     *
     * @returns {Promise} Resolves on success.
     */
    async writeTextFile(filePath) {
        assert(
            Test.isString(filePath) || Test.arrayOnlyContainsString(filePath),
            "Path must be a string or an array of strings",
        );

        return window.jslPlatform?.writeTextFile?.(filePath, contents);
    }

    /**
     * Read file from path as text and parse as json.
     *
     * @async
     * @param {String} filePath - Path to the file. Absolute.
     * @returns {Promise<Object>} The parsed object from JSON.
     */
    async readJSONFile(filePath) {
        assert(
            Test.isString(filePath) || Test.arrayOnlyContainsString(filePath),
            "Path must be a string or an array of strings",
        );
        return window.jslPlatform?.readJSONFile?.(filePath);
    }

    /**
     * Write a file to path as JSON.
     *
     * @async
     * @param {String} filePath - Path to the file. Absolute.
     * @param {Object|Array} contents - File contents as object or array.
     * @returns {Promise} Resolves on success.
     */
    async writeJSONFile(filePath, contents) {
        assert(
            Test.isString(filePath) || Test.arrayOnlyContainsString(filePath),
            "Path must be a string or an array of strings",
        );
        return window.jslPlatform?.writeJSONFile?.(filePath, TypeHelpers.asPOD(contents));
    }

    /**
     * Reads a JSON file, calls an updater that modifies the data and writes the results to the same file.
     *
     * @async
     * @param {Array<String>|String} filePath - JSON file.
     * @param {Function} updater - Function that takes an object and returns the new object
     * @returns {Promise} Resolves on success
     */
    async updateJSONFile(filePath, updater) {
        return this.readJSONFile(filePath)
            .then((data) => updater(data))
            .then((updatedData) => this.writeJSONFile(filePath, updatedData));
    }

    /**
     * Ask the user to open a directory.
     *
     * @async
     * @param {String} [basePath] - Directory base. This is the dir to start in. If null, the OS deceides.
     * @returns {Promise<String>} Directory path or nullish if aborted.
     */
    async selectDir(basePath = null) {
        if (basePath != null) {
            assert(Test.isNonEmptyString(basePath), "basePath must be a non-empty string or null.");
        }

        return window.jslPlatform?.selectDir?.(basePath);
    }

    /**
     * Renove a given file/dir.
     *
     * @async
     * @param {String|Array<String>} path - A path to a dir or file
     * @param {Object} [config] - Allows to define recursive and force. If force is true, exceptions are ignored.
     * Recursion is enabled by default
     * @returns {Promise<>} The async promise
     */
    async rm(path, config = { recursive: true, force: false }) {
        assert(
            Test.isString(path) || Test.arrayOnlyContainsString(path),
            "Path must be a string or an array of strings",
        );

        return window.jslPlatform?.rm?.(path, config);
    }

    /**
     * Make dir. Unix is like mkdir -p.
     *
     * @async
     * @param {String|Array<String>} path - A path to a dir.
     * @returns {Promise<String>} The created or existing path
     */
    async mkdir(path) {
        assert(
            Test.isString(path) || Test.arrayOnlyContainsString(path),
            "Path must be a string or an array of strings",
        );

        return window.jslPlatform?.mkdir?.(path);
    }

    /**
     * Test if the given dir is existing.
     *
     * @async
     * @param {Array<String>|String} path - Path to dir.
     * @returns {Promise<Boolean>} Resolves ti Boolean True if the dir is existing.
     */
    async isDirExisting(path) {
        assert(
            Test.isString(path) || Test.arrayOnlyContainsString(path),
            "Path must be a string or an array of strings",
        );

        return window.jslPlatform?.isDirExisting?.(path);
    }

    /**
     * Test if the given file is existing.
     *
     * @async
     * @param {Array<String>|String} path - Path to file.
     * @returns {Promise<Boolean>} Resolves to Boolean True if the file is existing.
     */
    async isFileExisting(path) {
        assert(
            Test.isString(path) || Test.arrayOnlyContainsString(path),
            "Path must be a string or an array of strings",
        );

        return window.jslPlatform?.isFileExisting?.(path);
    }

    /**
     * Test if the given file is existing and executable. On windows, "exe" extension is added if not present.
     *
     * @async
     * @param {Array<String>|String} path - Path to file.
     * @returns {Promise<Boolean>} Resolves to Boolean True if the file is existing.
     */
    async isExecutable(path) {
        assert(
            Test.isString(path) || Test.arrayOnlyContainsString(path),
            "Path must be a string or an array of strings",
        );

        return window.jslPlatform?.isExecutable?.(path);
    }

    /**
     * Test if the given dir is empty.
     *
     * @async
     * @param {Array<String>|String} path - Pathg to dir.
     * @returns {Promise<Boolean>} Resolves ti Boolean True if the dir is existing but empty.
     */
    async isDirEmpty(path) {
        assert(
            Test.isString(path) || Test.arrayOnlyContainsString(path),
            "Path must be a string or an array of strings",
        );

        return window.jslPlatform?.isDirEmpty?.(path);
    }

    /**
     * Get the current working dir
     *
     * @async
     * @returns {Promise<string>} Resolves to the cwd of the current process
     */
    async cwd() {
        return window.jslPlatform?.cwd?.();
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
