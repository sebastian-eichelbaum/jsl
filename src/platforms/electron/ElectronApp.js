import { app, protocol, net, BrowserWindow } from "electron";

import { shell } from "electron";

import path from "path";

import { jslObjectAsyncInit } from "@jsl/Object";
import { setupMain } from "./IPC";

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
            // The window configs.
            window: {
                // Default window width/height.
                width: 1280,

                // Default window width/height.
                height: 720,

                // Min width/height for the window. Depending on the OS and window manager, it is only a hint.
                minWidth: 1280,
                minHeight: 720,

                // If true, the applicaction will be in fullscreen when starting. (except in dev mode)
                fullscreen: false,

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
        };
    }

    /**
     * Construct the electron app skeleton. The actual app construction happens in init()
     *
     * @param {Object} config - The config as in @see defaultConfig
     */
    constructor(config) {
        super(config);
    }

    /**
     * Initialize the app and create the initial window.
     *
     * @async
     * @returns {Promise<ElectronApp>} This app instance
     */
    async init() {
        super.init();

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

            this._createWindow();
            resolve(this);
        });

        // Quit when all windows are closed. Even on OS X for now.
        app.on("window-all-closed", () => {
            if (process.platform !== "darwin") {
                app.quit();
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
     * Create the actual main window
     */
    _createWindow() {
        // Create the browser window.
        const mainWindow = new BrowserWindow({
            ...this.config.window,
            fullscreen: app.isPackaged ? this.config.window.fullscreen : false, // No fullscreen while developing

            webPreferences: {
                preload: path.join(__dirname, "preload.js"),

                // Security note:
                // The following features should stay disabled. They introduce a security risk, especially when the app
                // loads remote content!
                //
                // Replace with IPC!
                //nodeIntegration: true,
                //contextIsolation: false,
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
    }
}

// app.commandLine.appendSwitch('high-dpi-support', 1)
// app.commandLine.appendSwitch('force-device-scale-factor', 2)

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
//if (require("electron-squirrel-startup")) {
//    app.quit();
//}

/**
 * Make an electron app from a given config.
 *
 * @async
 * @param {Object} config - The config as @see ElectronApp.defaultConfig
 * @returns {Promise<ElectronApp>} The app after init.
 */
export async function makeElectronApp(config) {
    const app = new ElectronApp(config);
    await app.init();
    return app;
}
