/**
 * Construct the electron context bridge and ipc between main and renderer.
 *
 * Call this from prealod!
 */
export function connectIPCPreload() {
    const { contextBridge, ipcRenderer } = require("electron/renderer");

    contextBridge.exposeInMainWorld("jslOS", {
        os: (...args) => ipcRenderer.invoke("jslOS:os", ...args),
        homePath: (...args) => ipcRenderer.invoke("jslOS:homePath", ...args),
        appPath: (...args) => ipcRenderer.invoke("jslOS:appPath", ...args),
    });
}

/**
 * Function to proivide all the IPC functions in the main process.
 *
 * @param {ElectronApp} app - The JSL ElectronApp instance that called this in MAIN
 */
export function connectIPCMain(app) {
    const { ipcMain, dialog } = require("electron/renderer");
    const os = require("os");
    const electronApp = require("electron").app;

    ipcMain.handle("jslOS:os", async (_ev) => {
        return {
            isLinux: os.platform() === "linux",
            isMac: os.platform() === "darwin",
            isWindows: os.platform() === "win32",
        };
    });
    ipcMain.handle("jslOS:homePath", async (_ev) => {
        return electronApp.getPath("home");
    });
    ipcMain.handle("jslOS:appPath", async (_ev) => {
        return electronApp.getPath("userData");
    });
}

/**
 * Use to fetch OS Home path.
 */
export async function getHomePath() {
    return window?.jslOS?.homePath();
}

/**
 * Use to fetch OS Home path.
 */
export async function getAppPath() {
    return window?.jslOS?.appPath();
}

/**
 * Use to fetch OS info.
 */
export async function getOSInfo() {
    return window?.jslOS?.os();
}
