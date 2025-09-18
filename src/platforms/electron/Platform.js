/**
 * Construct the electron context bridge and ipc between main and renderer.
 *
 * Call this from prealod!
 */
export function connectIPCPreload() {
    const { contextBridge, ipcRenderer } = require("electron/renderer");

    // Expose the "platformAPI" to main
    contextBridge.exposeInMainWorld("jslPlatform", {
        // IO
        selectDir: (...args) => ipcRenderer.invoke("selectDir", ...args),
        openFile: (...args) => ipcRenderer.invoke("openFile", ...args),
        ensureDir: (...args) => ipcRenderer.invoke("ensureDir", ...args),
        rm: (...args) => ipcRenderer.invoke("rm", ...args),
        mkdir: (...args) => ipcRenderer.invoke("mkdir", ...args),
        isDirEmpty: (...args) => ipcRenderer.invoke("isDirEmpty", ...args),
        isDirExisting: (...args) => ipcRenderer.invoke("isDirExisting", ...args),
        isFileExisting: (...args) => ipcRenderer.invoke("isFileExisting", ...args),
        isExecutable: (...args) => ipcRenderer.invoke("isExecutable", ...args),
        readTextFile: (...args) => ipcRenderer.invoke("readTextFile", ...args),
        readJSONFile: (...args) => ipcRenderer.invoke("readJSONFile", ...args),
        writeTextFile: (...args) => ipcRenderer.invoke("writeTextFile", ...args),
        writeJSONFile: (...args) => ipcRenderer.invoke("writeJSONFile", ...args),
        cwd: (...args) => ipcRenderer.invoke("cwd", ...args),

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
    const os = require("os");
    const { shell } = require("electron");

    const process = require("process");

    const makePath = (p) => {
        if (Array.isArray(p)) {
            return path.normalize(path.join(...p));
        }
        return path.normalize(p);
    };

    const selectDir = async (_ev, basePath) => {
        let base = "";
        try {
            if (fs.lstatSync(basePath).isDirectory()) {
                base = basePath;
            }
        } catch (e) {}

        const { canceled, filePaths } = await dialog.showOpenDialog({
            defaultPath: base,
            properties: ["openDirectory"],
        });

        if (!canceled) {
            return filePaths[0];
        }
        return null;
    };
    ipcMain.handle("selectDir", selectDir);

    const openFile = async (_ev, p) => {
        p = makePath(p);

        const err = await shell.openPath(p);
        if (err !== "") {
            throw err;
        }
        return null;
    };
    ipcMain.handle("openFile", openFile);

    ipcMain.handle("cwd", async (_ev) => {
        return process.cwd();
    });

    const rm = async (_ev, p, opts) => {
        p = makePath(p);
        return fsp.rm(p, { recursive: opts?.recursive || false, force: opts?.force || false });
    };
    ipcMain.handle("rm", rm);

    const readTextFile = async (_ev, filePath) => {
        return fsp.readFile(makePath(filePath), "utf8");
    };
    ipcMain.handle("readTextFile", readTextFile);

    const readJSONFile = async (_ev, filePath) => {
        return readTextFile(null, makePath(filePath)).then((data) => {
            return JSON.parse(data);
        });
    };
    ipcMain.handle("readJSONFile", readJSONFile);

    const writeTextFile = async (_ev, filePath, data) => {
        return fsp.writeFile(makePath(filePath), data);
    };
    ipcMain.handle("writeTextFile", writeTextFile);

    const writeJSONFile = async (_ev, filePath, data) => {
        console.log(data);
        return writeTextFile(null, filePath, JSON.stringify(data, null, "  "));
    };
    ipcMain.handle("writeJSONFile", writeJSONFile);

    const mkdir = async (_ev, dir) => {
        dir = makePath(dir);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        return dir;
    };
    ipcMain.handle("mkdir", mkdir);

    const isDirEmpty = async (_ev, dir) => {
        dir = makePath(dir);

        try {
            const directory = await fsp.opendir(dir);
            const entry = await directory.read();
            await directory.close();
            return entry === null;
        } catch (error) {}
        return false;
    };
    ipcMain.handle("isDirEmpty", isDirEmpty);

    const isDirExisting = async (_ev, dir) => {
        try {
            if (fs.lstatSync(makePath(dir)).isDirectory()) {
                return true;
            }
        } catch (e) {}

        return false;
    };
    ipcMain.handle("isDirExisting", isDirExisting);

    const isFileExisting = async (_ev, dir) => {
        try {
            if (fs.lstatSync(makePath(dir)).isFile()) {
                return true;
            }
        } catch (e) {}

        return false;
    };
    ipcMain.handle("isFileExisting", isFileExisting);

    ipcMain.handle("isExecutable", async (_ev, exe) => {
        try {
            let fixedExe = makePath(exe);
            if (os.platform() === "win32" && path.extname(fixedExe) !== ".exe") {
                fixedExe += ".exe";
            }

            if (fs.lstatSync(fixedExe).isFile()) {
                return true;
            }
        } catch (e) {}

        return false;
    });

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
