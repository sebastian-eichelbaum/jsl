import { app, protocol, net, BrowserWindow } from "electron";

import { shell } from "electron";

import path from "path";

import { jslObjectAsyncInit } from "jsl/Object";
import { Test } from "jsl/Assert";

import { setupMain } from "./IPC";
import * as AutoUpdater from "./AutoUpdater";

import _ from "lodash";

// Register the "fs" protocol.
protocol.registerSchemesAsPrivileged([
    {
        scheme: "fs",
        privileges: {
            secure: true,
            supportFetchAPI: true,
            bypassCSP: true,
        },
    },
]);

export class ElectronApp extends jslObjectAsyncInit {
    /**
     * Generate a default config.
     */
    static defaultConfig() {
        return {
            startup: {
                // Maximize the window on start (except in dev mode)
                maximized: false,
                // If true, the application will be in fullscreen when starting. (except in dev mode)
                fullscreen: false,
                // Must be set to a string to ensure a single instance. Apps using the same instance "id" are assumed to
                // be the same.
                singleInstance: null,
            },

            // The window configs.
            window: {
                // An title for the window. If null, the productName value from the top-level package.json is used.
                // (default behavior of electron)
                title: null,

                // Default window width/height.
                width: 1280,

                // Default window width/height.
                height: 720,

                // Min width/height for the window. Depending on the OS and window manager, it is only a hint.
                minWidth: 1280,
                minHeight: 720,

                // Use the usual OS/window manager window frame?
                frame: false,

                // Titlebar options. To disable the OS titlebar, set "hidden". Check
                //  https://www.electronjs.org/docs/latest/tutorial/window-customization
                titleBarStyle: "hidden",
                titleBarOverlay: false,
                /* OR:
                    // Custom style?
                    {
                        color: "#191919",
                        symbolColor: "#dddddd",
                        height: 60,
                    },
                */

                // Window background color if no content is present
                backgroundColor: "#191919",
            },

            security: {
                // Allows to disable the web security settings in electron.
                // If you get a lot of CORS issues with your backends, you might want to set this false. BUT do this
                // only for testing. It is not a permanent solution as it introduces some security risks.
                web: true,

                // Apply cors fixes for these urls.
                corsURLs: [], // ["https://cms.provider.com/*"],
            },

            // Setup the updater service - @see jsl/platforms/electron/AutoUpdater for details
            autoUpdater: AutoUpdater.defaultConfig(),
        };
    }

    /**
     * Default callbacks
     */
    static defaultCallbacks() {
        return {
            /**
             * Called when the app gets ready, but before creating the window. Perect for IPC setup.
             *
             * @param {ElectronApp} app - The app
             */
            onReady: (app) => {},
        };
    }

    /**
     * Construct the electron app skeleton. The actual app construction happens in init()
     *
     * @param {Object} config - The config as in @see defaultConfig
     * @param {Object} callbacks - The callbacks as in @see defaultCallbacks
     */
    constructor(config, callbacks) {
        super(config);
        this.m_callbacks = _.merge(ElectronApp.defaultCallbacks(), callbacks || {});
    }

    /**
     * Initialize the app and create the initial window.
     *
     * @async
     * @returns {Promise<ElectronApp>} This app instance
     */
    async init() {
        super.init();

        if (
            !!this.config.startup.singleInstance &&
            (typeof this.config.startup.singleInstance === "string" ||
                this.config.startup.singleInstance instanceof String)
        ) {
            // Ensure a single instance
            const instanceLock = app.requestSingleInstanceLock({ myKey: this.config.startup.singleInstance });
            if (!instanceLock) {
                app.quit();
            }
        }

        let resolve;
        const promise = new Promise((res, _rej) => {
            resolve = res;
        });

        // This method will be called when Electron has finished
        // initialization and is ready to create browser windows.
        // Some APIs can only be used after this event occurs.
        app.on("ready", () => {
            protocol.handle("fs", (request) => {
                // Remove the protocol and simply use "file"
                return net.fetch("file://" + request.url.slice("fs://".length));
            });

            setupMain(this);

            this.m_callbacks?.onReady?.(this);

            this._createWindow();

            AutoUpdater.setup(this, this.config.autoUpdater);

            resolve(this);
        });

        // Quit when all windows are closed. Even on OS X for now.
        app.on("window-all-closed", () => {
            if (process.platform !== "darwin") {
                app.quit();
            }
        });

        // Called when another instance was started - bring the window to the front
        app.on("second-instance", (event, commandLine, workingDirectory, additionalData) => {
            console.log("Another instance was started.");

            // Someone tried to run a second instance, we should focus our window.
            if (this.mainWindow) {
                if (this.mainWindow.isMinimized()) {
                    this.mainWindow.restore();
                }
                this.mainWindow.focus();
            }
        });

        //TODO: OS X: test if this works as expected:
        // When (re-)activating the app, especially important on OS X
        /*app.on("activate", () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                this._createWindow();
            }
        });
        */

        return promise;
    }

    /**
     * Get the main window of the app. This is the window created during startup.
     *
     * @returns {BrowserWindow} The electron BrowserWindow
     */
    get mainWindow() {
        return this.m_mainWindow;
    }

    /**
     * Get the focussed window. If only one window exists, this is the same as the main window.
     *
     * @returns {BrowserWindow} Electron BrowserWindow instance that is focussed or mainWindow
     */
    get focussedWindow() {
        return BrowserWindow.getFocusedWindow() || this.mainWindow;
    }

    /**
     * Teh native Electron app instance
     *
     * @returns {Electron.App} The electron app instance
     */
    get app() {
        return app;
    }

    /**
     * Check if the app is packaged/in production mode
     *
     * @returns {Boolean} True if this is an packaged/production app
     */
    get isPackaged() {
        return this.app.isPackaged;
    }

    /**
     * Create the actual main window
     */
    _createWindow() {
        // Create the browser window.
        const mainWindow = new BrowserWindow({
            ...this.config.window,
            fullscreen: app.isPackaged ? this.config.startup.fullscreen : false, // No fullscreen while developing

            // To avoid flicker, the window is not show n until its maximized-state is set properly.
            show: false,

            webPreferences: {
                preload: path.join(__dirname, "preload.js"),

                webSecurity: this.config.security.web,
            },
        });

        // URL Open handler:
        mainWindow.webContents.setWindowOpenHandler((details) => {
            // Open in external browser.
            shell.openExternal(details.url);
            // Prevent the app from opening the URL.
            return { action: "deny" };
        });

        // and load the index.html of the app.
        if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
            mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
        } else {
            mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
        }

        // Open the DevTools.
        if (import.meta.env.DEV) {
            mainWindow.webContents.openDevTools();
        }

        // Handle close internally - if the user closes the app using the OS tools, this will be triggered:
        mainWindow.on("close", function (e) {
            // Avoids a real close.
            e.preventDefault();
            // ... Ask the user instead
            mainWindow.show();
            mainWindow.webContents.send("onClose");
        });

        this.m_mainWindow = mainWindow;

        if (this.config.window.title != null && this.config.window.title != "") {
            this.m_mainWindow.setTitle(this.config.window.title);
        }

        if (app.isPackaged && this.config.startup.maximized) {
            mainWindow.maximize();
        }
        mainWindow.show();

        this._applyCorsFixes(this.m_mainWindow);
    }

    /**
     * Applies some header manipulations to ensure proper CORS security for a given set of provider URLs
     *
     * NOTE: this is in testing and probably wont work. As a fallback, set web security false TEMPORARILY
     *
     * @param {BrowserWindow} win - The window to set the handlers for
     */
    _applyCorsFixes(win) {
        if (!Test.arrayOnlyContainsNonEmptyString(this.config.security.corsURLs)) {
            return;
        }

        const corsHeaderFilter = {
            urls: this.config.security.corsURLs,
        };

        // Prevent issues with cors.
        win.webContents.session.webRequest.onBeforeSendHeaders(corsHeaderFilter, (details, callback) => {
            // console.log(details);
            callback({
                requestHeaders: {
                    ...details.requestHeaders,
                    // Origin: "*",
                    //"Access-Control-Allow-Credentials": true,
                    //"Access-Control-Allow-Headers": "*",
                },
            });
        });

        // Prevent issues with cors.
        win.webContents.session.webRequest.onHeadersReceived(corsHeaderFilter, (details, callback) => {
            //console.log(details);
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    //"Access-Control-Allow-Origin": ["http://localhost:5173"],
                    //"Access-Control-Allow-Credentials": true,
                    //"Access-Control-Allow-Headers": ["content-type", "authorization"],
                },
            });
        });
    }
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
//if (require("electron-squirrel-startup")) {
//    app.quit();
//}

/**
 * Make an electron app from a given config.
 *
 * @async
 * @param {Object} config - The config as @see ElectronApp.defaultConfig
 * @param {Object} callbacks - The callbacks as @see ElectronApp.defaultCallbacks
 * @returns {Promise<ElectronApp>} The app after init.
 */
export async function makeElectronApp(config, callbacks) {
    const app = new ElectronApp(config, callbacks);
    await app.init();
    return app;
}
