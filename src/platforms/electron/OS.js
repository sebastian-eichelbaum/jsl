/**
 * Construct the electron context bridge and ipc between main and renderer.
 *
 * Call this from prealod!
 */
export function connectIPCPreload() {
    const { contextBridge, ipcRenderer } = require("electron/renderer");

    contextBridge.exposeInMainWorld("jslOS", {
        os: (...args) => ipcRenderer.invoke("jslOS:os", ...args),
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

    ipcMain.handle("jslOS:os", async (_ev) => {
        return {
            isLinux: os.platform() === "linux",
            isMac: os.platform() === "darwin",
            isWindows: os.platform() === "win32",
        };
    });
}

/**
 * Use to fetch OS info.
 *
 */
export async function getOSInfo() {
    return window?.jslOS?.os();
}
