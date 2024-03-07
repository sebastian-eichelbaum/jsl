import _ from "lodash";

/**
 * The AutoUpdater default config
 *
 * @returns {Object} Default config
 */
export function defaultConfig() {
    return {
        // Where to look for the update? There are some special replacements:
        // %PLATFORM% will be replaced with "process.platform"
        // If the URL is nullish/empty, updates are disabled silently.
        server: null, // i.e. "https://www.example.com/static/MyApp/%PLATFORM%"

        // How often should be checked for updates? (in minutes). Set to null or <0 to disable
        interval: 60,

        // If true, there will be an update check directly during startup
        checkOnStartup: true,
    };
}

// Main process status flag
let _main_updateReady = false;
let _main_updateAvailable = false;

/**
 * Setup the auto update mechanism.
 *
 * NOTE: MUST be called when app is ready
 *
 * @param {ElectronApp} app - The JSL ElectronApp instance
 * @param {Object} config - The config as in @see defaultConfig.
 */
export function setup(app, config) {
    const { autoUpdater, dialog } = require("electron");

    const cfg = _.merge(defaultConfig(), config || {});
    if (cfg.server == null || cfg.server == "" || typeof cfg.server != "string") {
        return;
    }

    const url = cfg.server.replace("%PLATFORM%", process.platform);
    console.log("AutoUpdater URL: ", url);

    autoUpdater.setFeedURL({
        url: url,
        headers: {
            "Cache-Control": "no-cache", // Could add more subtlety here...
        },
    });

    const notifyUpdateNative = (releaseNotes, releaseName) => {
        const dialogOpts = {
            type: "info",
            buttons: ["Restart", "Later"],
            title: "Application Update",
            message: process.platform === "win32" ? releaseNotes : releaseName,
            detail: "A new version has been downloaded. Restart the application to apply the updates.",
        };

        dialog.showMessageBox(dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) autoUpdater.quitAndInstall();
        });
    };

    const notifyUpdateIPC = (releaseNotes, releaseName) => {
        app.mainWindow.webContents.send("onUpdateReady", {
            message: process.platform === "win32" ? releaseNotes : releaseName,
        });
    };

    const notifyUpdateStatusIPC = (cb) => {
        app.mainWindow.webContents.send(cb);
    };

    const notifyUpdateErrorIPC = (error) => {
        app.mainWindow.webContents.send("onUpdateError", { error: JSON.parse(JSON.stringify(error)) });
    };

    autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
        _main_updateReady = true;
        notifyUpdateIPC(releaseNotes, releaseName);
    });

    autoUpdater.on("checking-for-update", (event) => {
        notifyUpdateStatusIPC("onUpdateCheck");
    });

    autoUpdater.on("update-available", (event) => {
        notifyUpdateStatusIPC("onUpdateAvailable");
    });

    autoUpdater.on("update-not-available", (event) => {
        notifyUpdateStatusIPC("onUpdateUnavailable");
    });

    autoUpdater.on("error", (message) => {
        notifyUpdateErrorIPC(message);
    });

    if (cfg.checkOnStartup === true) {
        // Wait a minute to have the UI ready
        setTimeout(() => {
            autoUpdater.checkForUpdates();
        }, 1000 * 60);
    }

    if (cfg.interval == null || cfg.interval < 0) {
        return;
    }

    setInterval(
        () => {
            autoUpdater.checkForUpdates();
        },
        1000 * 60 * cfg.interval,
    );
}

/**
 * Construct the electron context bridge and ipc between main and renderer.
 *
 * Call this from prealod!
 */
export function connectIPCPreload() {
    const { contextBridge, ipcRenderer } = require("electron/renderer");

    contextBridge.exposeInMainWorld("jslAutoUpdater", {
        check: (...args) => ipcRenderer.invoke("jslAutoUpdater:check", ...args),
        updateStatus: (...args) => ipcRenderer.invoke("jslAutoUpdater:updateStatus", ...args),
        installAndRestart: (...args) => ipcRenderer.invoke("jslAutoUpdater:installAndRestart", ...args),

        onUpdateReady: (callback) => ipcRenderer.on("onUpdateReady", (_event, value) => callback(value)),
        onUpdateError: (callback) => ipcRenderer.on("onUpdateError", (_event, value) => callback(value)),
        onUpdateCheck: (callback) => ipcRenderer.on("onUpdateCheck", (_event, value) => callback(value)),
        onUpdateAvailable: (callback) => ipcRenderer.on("onUpdateAvailable", (_event, value) => callback(value)),
        onUpdateUnavailable: (callback) => ipcRenderer.on("onUpdateUnavailable", (_event, value) => callback(value)),
    });
}

/**
 * Function to proivide all the IPC functions in the main process.
 *
 * @param {ElectronApp} app - The JSL ElectronApp instance that called this in
 *     MAIN
 */
export function connectIPCMain(app) {
    const { ipcMain } = require("electron/renderer");
    const { autoUpdater } = require("electron");

    ipcMain.handle("jslAutoUpdater:check", async (_ev) => {
        autoUpdater.checkForUpdates();
        return 0;
    });
    ipcMain.handle("jslAutoUpdater:installAndRestart", async (_ev) => {
        try {
            autoUpdater.quitAndInstall();
        } catch (e) {}
        return 0;
    });
    ipcMain.handle("jslAutoUpdater:updateStatus", async (_ev) => {
        return { ready: _main_updateReady, available: _main_updateAvailable };
    });
}

/**
 * The render-thread adapter to the auto updater mechanism.
 */
export class AutoUpdater {
    // Default callback config
    static defaultCallbacks() {
        return {
            // Called when an update was loaded and can be applied.
            onUpdateReady: () => {
                console.log("Update ready.");
            },

            // Called on error. Usualyy when sevrer urls mismatch or an network error happended.
            onUpdateError: (error) => {
                console.error("Updater error: ", error);
            },

            // Called whenever an update check is triggered
            onUpdateCheck: () => {
                console.log("Update check");
            },

            // Called whenever an update check returned and available update
            onUpdateAvailable: () => {
                console.log("Update available");
            },

            // Called whenever an update check is triggered
            onUpdateUnavailable: () => {
                console.log("Update unavailable");
            },
        };
    }

    /**
     * Construct the AutoUpdater adapter.
     *
     * @param {Object} callbacks - Callback config as in @see defaultCallbacks
     */
    constructor(callbacks) {
        this.m_callbacks = _.merge(AutoUpdater.defaultCallbacks(), callbacks || {});

        window?.jslAutoUpdater?.onUpdateReady?.(() => {
            this.m_callbacks?.onUpdateReady?.();
        });

        window?.jslAutoUpdater?.onUpdateError?.((error) => {
            this.m_callbacks?.onUpdateError?.(error);
        });

        window?.jslAutoUpdater?.onUpdateCheck?.(() => {
            this.m_callbacks?.onUpdateCheck?.();
        });

        window?.jslAutoUpdater?.onUpdateAvailable?.(() => {
            this.m_callbacks?.onUpdateAvailable?.();
        });

        window?.jslAutoUpdater?.onUpdateUnavailable?.(() => {
            this.m_callbacks?.onUpdateUnavailable?.();
        });

        // In case we missed it, re-inform about an ready update
        window?.jslAutoUpdater?.updateStatus?.().then((status) => {
            if (status.available) {
                this.m_callbacks?.onUpdateAvailable?.();
            }

            if (status.ready) {
                this.m_callbacks?.onUpdateReady?.();
            }
        });
    }

    /**
     * Trigger an update check.
     *
     * @returns {Promise} Once done. Resolves regardless of availability of updates.
     */
    check() {
        return window.jslAutoUpdater?.check?.();
    }

    /**
     * Apply the update and restart. This triggers app.quit.
     */
    installAndRestart() {
        window.jslAutoUpdater?.installAndRestart?.();
    }
}

/**
 * Triggers an update check
 */
export function check() {
    return window.jslAutoUpdater?.check?.();
}

export const autoUpdater = null;
