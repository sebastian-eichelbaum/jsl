/**
 * Construct the electron context bridge and ipc between main and renderer.
 *
 * Call this from prealod!
 */
export function connectIPCPreload() {
    const { contextBridge, ipcRenderer } = require("electron/renderer");

    // Expoze the "platformAPI" to main
    contextBridge.exposeInMainWorld("jslPlatform", {
        // IO
        openDir: (...args) => ipcRenderer.invoke("openDir", ...args),
        readTextFile: (...args) => ipcRenderer.invoke("readTextFile", ...args),
        readJSONFile: (...args) => ipcRenderer.invoke("readJSONFile", ...args),

        // Windowing
        windowClose: (...args) => ipcRenderer.invoke("windowClose", ...args),
        windowMinimize: (...args) => ipcRenderer.invoke("windowMinimize", ...args),
        windowMaximize: (...args) => ipcRenderer.invoke("windowMaximize", ...args),
        windowFullscreen: (...args) => ipcRenderer.invoke("windowFullscreen", ...args),
        windowIsFullscreen: (...args) => ipcRenderer.invoke("windowIsFullscreen", ...args),
        // Called once the user requests the main window to close. from main, listen in renderer
        onClose: (callback) => ipcRenderer.on("onClose", (_event, value) => callback(value)),
    });
}

/**
 * Function to proivide all the IPC functions in the main process.
 *
 * @param {ElectronApp} app - The JSL ElectronApp instance that called this in MAIN
 */
export function connectIPCMain(app) {
    const { ipcMain, dialog } = require("electron/renderer");
    const fs = require("fs");
    const fsp = require("fs").promises;
    const path = require("path");

    const handleDirOpen = async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ["openDirectory"],
        });

        if (!canceled) {
            return filePaths[0];
        }
        return null;
    };
    ipcMain.handle("openDir", handleDirOpen);

    const readTextFile = async (_ev, filePath) => {
        return fsp.readFile(filePath, "utf8");
    };
    ipcMain.handle("readTextFile", readTextFile);

    const readJSONFile = async (_ev, filePath) => {
        return fsp.readFile(filePath, "utf8").then((data) => {
            return JSON.parse(data);
        });
    };
    ipcMain.handle("readJSONFile", readJSONFile);

    const windowMinimize = async (_ev, state) => {
        if (state === true || (state == null && !app.focussedWindow.isMinimized())) {
            app.focussedWindow.minimize();
        } else if (state === false || (state == null && app.focussedWindow.isMinimized())) {
            app.focussedWindow.restore();
        }
        return app.focussedWindow.isMinimized();
    };
    ipcMain.handle("windowMinimize", windowMinimize);

    const windowMaximize = async (_ev, state) => {
        if (state === true || (state == null && !app.focussedWindow.isMaximized())) {
            app.focussedWindow.maximize();
        } else if (state === false || (state == null && app.focussedWindow.isMaximized())) {
            app.focussedWindow.unmaximize();
        }

        return app.focussedWindow.isMaximized();
    };
    ipcMain.handle("windowMaximize", windowMaximize);

    const windowFullscreen = async (_ev, state) => {
        if (state === true || (state == null && !app.focussedWindow.isFullScreen())) {
            app.focussedWindow.setFullScreen(true);
        } else if (state === false || (state == null && app.focussedWindow.isFullScreen())) {
            app.focussedWindow.setFullScreen(false);
        }
        return app.focussedWindow.isFullScreen();
    };
    ipcMain.handle("windowFullscreen", windowFullscreen);

    const windowIsFullscreen = async (_ev) => {
        return app.focussedWindow.isFullScreen();
    };
    ipcMain.handle("windowIsFullscreen", windowIsFullscreen);

    const windowClose = async (_ev, force) => {
        if (force === true) {
            // Skips the close, beforeunload, unload events and kills the window
            app.focussedWindow.destroy();
        } else {
            app.focussedWindow.close();
        }
    };
    ipcMain.handle("windowClose", windowClose);
}
