import { jslObjectAsyncInit } from "@jsl/Object";

import _ from "lodash";

/**
 * Represet a child process in the render thread.
 *
 * @extends jslObjectAsyncInit
 */
export class ChildProcess extends jslObjectAsyncInit {
    /**
     * Default configuration
     */
    static defaultConfig() {
        return {
            // The absolute path to the executable to run
            executable: "", // "/home/seb/test.sh",
            // If boolean true, the child process couples to the previous child of the same executable
            reuse: false,
        };
    }

    static defaultCallbacks() {
        return {
            /**
             * Called whenever the child process status changes
             *
             * @param {Object} status - The statuas as provided by jslChildProcess:spawn.
             */
            onStatusUpdate: (status) => {
                console.log("Status update:", status);
            },
        };
    }

    /**
     * Construct and init the child process.
     *
     * @static
     * @async
     * @param {Object} config - The config as in @see defaultConfig
     * @returns {Promise<ChildProcess>} The instance created.
     */
    static async make(config, callbacks) {
        let cp = new ChildProcess(config, callbacks);
        await cp.init();
        return cp;
    }

    /**
     * Construct the child process. This does not spawn it.
     *
     * @param {Object} config - The config needed to run the process
     */
    constructor(config, callbacks) {
        super(config);

        this.m_key = null;
        this.m_isValid = true;
        this.m_isRunning = false;
        this.m_callbacks = _.merge(ChildProcess.defaultCallbacks(), callbacks || {});

        window?.jslChildProcess?.onUpdateStatus((value) => {
            if (this.m_key == value.key) {
                this.m_isRunning = value.status.running;
                this.m_callbacks?.onStatusUpdate?.(value.status);
            }
        });

        window?.jslChildProcess?.onRemoved((value) => {
            if (this.m_key == value.key) {
                this.m_isValid = false;
            }
        });
    }

    /**
     * Make the main process instance.
     *
     * @async
     * @returns {Promise<>} Async promise
     */
    async init() {
        await super.init();

        return window?.jslChildProcess?.make?.(this.config).then((key) => {
            this.m_key = key;
        });
    }

    /**
     * Spawn the process
     *
     * @async
     * @returns {Promise<>} The async promise
     */
    async spawn() {
        if (!this.valid) {
            console.warn("Cannot spawn child process. Handle invalid.");
            return;
        }

        return window?.jslChildProcess?.spawn?.(this.m_key);
    }

    /**
     * Kill the process if it is running.
     *
     * @async
     * @returns {Promise<>} The async promise
     */
    async kill() {
        if (!this.valid) {
            console.warn("Cannot kill child process. Handle invalid.");
            return;
        }

        return window?.jslChildProcess?.kill?.(this.m_key);
    }

    /**
     * Check if the process is running.
     *
     * @async
     * @returns {Promise<Boolean>} True if running
     */
    async isRunning() {
        return this.m_isRunning;
    }

    /**
     * If true, the instance still referrs to a freshly created or still running child.
     *
     * @returns {Boolean} True if still referring to a valid child definition in the main process
     */
    get valid() {
        return this.m_isValid;
    }
}

/**
 * Construct the electron context bridge and ipc between main and renderer.
 *
 * Call this from prealod!
 */
export function connectIPCPreload() {
    const { contextBridge, ipcRenderer } = require("electron/renderer");

    contextBridge.exposeInMainWorld("jslChildProcess", {
        make: (...args) => ipcRenderer.invoke("jslChildProcess:make", ...args),
        spawn: (...args) => ipcRenderer.invoke("jslChildProcess:spawn", ...args),
        kill: (...args) => ipcRenderer.invoke("jslChildProcess:kill", ...args),
        status: (...args) => ipcRenderer.invoke("jslChildProcess:status", ...args),

        // Send status back to renderer
        onUpdateStatus: (callback) => ipcRenderer.on("onUpdateStatus", (_event, value) => callback(value)),
        // When the child handler with a certain key is removed. The render ChildProcess marks itself as invalid in that
        // case.
        onRemoved: (callback) => ipcRenderer.on("onRemoved", (_event, value) => callback(value)),
    });
}

/**
 * Function to proivide all the IPC functions in the main process.
 *
 * @param {ElectronApp} app - The JSL ElectronApp instance that called this in MAIN
 */
export function connectIPCMain(app) {
    const { ipcMain, dialog } = require("electron/renderer");
    const { spawn } = require("node:child_process");
    const kill = require("tree-kill");

    let instances = [];
    const removeInst = (inst) => {
        instances = instances.filter((e) => inst.key !== e.key);
        app.mainWindow.webContents.send("onRemoved", { key: inst.key, status: inst.status });
    };

    let key = 0;

    ipcMain.handle("jslChildProcess:make", async (_ev, config) => {
        let inst = null;
        if (config.reuse === true) {
            inst = instances.find((e) => e.config?.executable == config.executable);
        }

        if (inst == null) {
            key++;
            inst = {
                key: key,
                config: config,
                process: null,
                status: { running: false, failed: false, closed: false, returnCode: null },
            };
            instances.push(inst);
        }

        return inst.key;
    });

    ipcMain.handle("jslChildProcess:spawn", async (_ev, key) => {
        const inst = instances.find((e) => e.key == key);
        if (inst == null) {
            throw new Error("Spawn failed: could not find child instance: " + key);
        }

        if (inst.process != null) {
            throw new Error("Spawn failed: could not start already running process: " + key);
        }

        console.log("jslChildProcess:spawn: ", inst);
        inst.process = spawn(inst.config.executable, [], {
            // Do not run in a shell
            shell: false,

            // Hide the shell window on windows
            windowsHide: true,
        });

        inst.status.running = true;
        inst.process.on("close", (code) => {
            console.log("Spawned child closed: exit code: ", code);

            inst.status.running = false;
            inst.status.closed = true;
            inst.status.returnCode = code;
            inst.process = null;

            app.mainWindow.webContents.send("onUpdateStatus", { key: inst.key, status: inst.status });

            removeInst(inst);
        });

        inst.process.on("error", (err) => {
            console.error("Spawn failed: Failed to start subprocess: ", err);

            inst.status.running = false;
            inst.status.closed = false;
            inst.status.failed = true;
            inst.process = null;

            app.mainWindow.webContents.send("onUpdateStatus", { key: inst.key, status: inst.status });

            removeInst(inst);
        });

        app.mainWindow.webContents.send("onUpdateStatus", { key: inst.key, status: inst.status });

        return 0;
    });

    ipcMain.handle("jslChildProcess:kill", async (_ev, key) => {
        const inst = instances.find((e) => e.key == key);
        if (inst == null) {
            throw new Error("jslChildProcess:kill failed: could not find child instance: " + key);
        }
        if (inst.process == null) {
            throw new Error("jslChildProcess:kill failed: no process started yet: " + key);
        }

        console.log("jslChildProcess:kill: ", inst);

        const pid = inst.process?.pid;
        if (pid == null) {
            return;
        }
        kill(pid);

        return 0;
    });

    ipcMain.handle("jslChildProcess:status", async (_ev, key) => {
        const inst = instances.find((e) => e.key == key);
        if (inst == null) {
            throw new Error("jslChildProcess:status failed: could not find child instance: " + key);
        }
        //console.log("jslChildProcess:status: ", inst);
        return inst.status;
    });
}
