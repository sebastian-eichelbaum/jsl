import { Test } from "@jsl/Assert";
import { jslObjectAsyncInit } from "@jsl/Object";

import { reactive } from "vue";

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
            // Describes to actual command to run
            execute: {
                // The absolute path to the executable to run or an array path.
                // On Windows, this automatically adds ".exe" if no file extension is
                // given
                executable: "", // "/home/seb/test.sh", ["home", "seb", "trst.sh"]

                // The working dir of the process. If nullish or empty, the currend CWD of
                // THIS main process is used.
                // If an array of strings is provided, the paths are joined
                cwd: null,

                // Arguments to pass. Must be strings or an empty array
                args: [],

                // If boolean true, the child process couples to the previous child of the
                // same executable
                reuse: false,

                // If boolean true and if the app is in prodction mode, the executable is searched in the application
                // resource path. This is the place where additional resources are placed if configured in 
                // forge.config.js in packagerConfig.extraResource:[...]
                isInResourcePath: false,
            },

            // Show the exact execution params when spawning?
            verbose: false,

            // A predcate that determines if an return code is OK or not.
            // Must return bool, takes an int return code
            okReturnCode: (returnCode) => returnCode === 0,
            // Map the given return code to some error message. Can be a localization string. Only called for return
            // codes that are not OK after testing with okReturnCode
            badReturnCodeMap: (returnCode) => "Bad error code",
        };
    }

    // The callbacks
    static defaultCallbacks() {
        return {
            /**
             * Called whenever the child process status changes
             *
             * @param {Object} status - The status as provided by jslChildProcess:spawn.
             * @param {Object} config - The config used for spawning the process.
             */
            onStatusUpdate: (status, config) => {
                // console.log("ChildProcess update:", status, config);
            },

            /**
             * Called whenever the program prints something to stdout
             *
             * @param {String} data - the new text on stdout
             */
            onStdOut: (data) => {
                // console.log("ChildProcess stdout:", data);
            },

            /**
             * Called whenever the program prints something to stderr
             *
             * @param {String} data - the new text on stderr
             */
            onStdErr: (data) => {
                // console.log("ChildProcess stderr:", data);
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
     * Construct and init the child process, then run.
     *
     * @static
     * @async
    Boolean* @param {Object} config - The config as in @see defaultConfig
     * @returns {Promise<Object>} The promise that resolves once the process is done, or fails on error. The process
     * status is returned. @see ChildProcess.run.
     */
    static async exec(config) {
        return ChildProcess.make(config).then((child) => child.run());
    }

    /**
     * Construct the child process. This does not spawn it.
     *
     * @param {Object} config - The config needed to run the process
     */
    constructor(config, callbacks) {
        super(config);

        this.m_key = null;
        this.m_state = reactive({
            valid: true,
            running: false,
            output: "",
            finished: false,
            failed: false,
            returnCode: undefined,
        });
        this.m_callbacks = _.merge(ChildProcess.defaultCallbacks(), callbacks || {});

        // Allow async tracking of the process:
        this.m_promiseResolve = null;
        this.m_promiseReject = null;
        this.m_promise = new Promise((res, rej) => {
            this.m_promiseResolve = res;
            this.m_promiseReject = rej;
        });

        window?.jslChildProcess?.onUpdateStatus((value) => {
            if (this.m_key !== value.key) {
                return;
            }
            this.m_state.running = value.status.running;

            this.m_state.output += "--- ChildProcess:status: " + JSON.stringify(value.status) + "\n";

            if (value.status.closed) {
                // Mark  failed if the return code is bad or the OS/node failed
                if (!value.status.failed && !this.config.okReturnCode(value.status.returnCode)) {
                    value.status.failed = true;
                    value.status.error = this.config.badReturnCodeMap?.(value.status.returnCode) || "Bad return code";
                }

                this.m_state.failed = value.status.failed;
                this.m_state.completed = true;
                this.m_state.returnCode = value.status.returnCode;

                if (this.m_state.failed) {
                    this.m_promiseReject({ status: value.status, config: value.config });
                } else {
                    this.m_promiseResolve({ status: value.status, config: value.config });
                }
            }

            this.m_callbacks?.onStatusUpdate?.(value.status, value.config);
        });

        window?.jslChildProcess?.onStreamOutUpdate((value) => {
            if (this.m_key !== value.key) {
                return;
            }

            const out = new TextDecoder().decode(value.data);
            this.m_state.output += out;
            this.m_callbacks?.onStdOut?.(out);
        });

        window?.jslChildProcess?.onStreamErrUpdate((value) => {
            if (this.m_key !== value.key) {
                return;
            }

            const out = new TextDecoder().decode(value.data);
            this.m_state.output += out;
            this.m_callbacks?.onStdErr?.(out);
        });

        window?.jslChildProcess?.onRemoved((value) => {
            if (this.m_key == value.key) {
                this.m_state.valid = false;
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

        return window?.jslChildProcess?.make?.(this.config.execute).then((key) => {
            this.m_key = key;
        });
    }

    /**
     * Spawn the process
     *
     * @async
     * @returns {Promise<>} The async promise. The promise finishes once the
     *     process has been started. To receive
     * updates on processes, use the onStatusUpdate callback.
     */
    async spawn() {
        if (!this.valid) {
            console.warn("Cannot spawn child process. Handle invalid.");
            return;
        }

        this.m_state.output = "--- ChildProcess.spawn: " + JSON.stringify(this.config) + "\n";
        if (this.config.verbose) {
            console.log("Spawning:", this.config.execute);
        }
        return window?.jslChildProcess?.spawn?.(this.m_key);
    }

    /**
     * Like spawn, runs the process but returns a promise that resolves once the program finishes.
     *
     * @async
     * @throws {Error} - If an invalid handle was given.
     * @returns {Promise<Object>} A promise that resolves once the program finishes. The final status of the process is
     * given: {status, config}.
     */
    async run() {
        if (!this.valid) {
            throw new Error("Cannot spawn child process. Handle invalid.");
        }

        this.m_state.output = "--- ChildProcess.run: " + JSON.stringify(this.config) + "\n";
        return window?.jslChildProcess?.spawn?.(this.m_key).then(() => {
            return this.m_promise;
        });
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

        this.m_state.output = "--- ChildProcess.kill" + "\n";
        return window?.jslChildProcess?.kill?.(this.m_key);
    }

    /**
     * Get the vue.reactive state of the process
     *
     * @returns {Object} an vue reactive state: {running, output, valid, completed, failed, returnCode}
     */
    get state() {
        return this.m_state;
    }

    /**
     * Check if the process is running.
     *
     * @returns {Boolean} True if running
     */
    get isRunning() {
        return this.m_state.running;
    }

    /**
     * Check if the process is done after running once.
     *
     * @returns {Boolean} True if it was running and is not running anymore
     */
    get completed() {
        return this.m_state.completed;
    }

    /**
     * Check if the process is done and has failed with a not-OK return code or got killed by the OS.
     *
     * @returns {Boolean} True if failed
     */
    get failed() {
        return this.m_state.failed;
    }

    /**
     * If true, the instance still referrs to a freshly created or still running
     * child.
     *
     * @returns {Boolean} True if still referring to a valid child definition in
     *     the main process
     */
    get valid() {
        return this.m_state.valid;
    }

    /**
     * The output so far (stderr and stdout) as string.
     *
     * @returns {String} output
     */
    get output() {
        return this.m_state.output;
    }

    /**
     * The returnCode after completed==true
     *
     * @returns {Number} return code
     */
    get returnCode() {
        return this.m_state.returnCode;
    }

    /**
     * The promise that resolves once the program finished or fails on error
     *
     * @returns {Promise} Fails on error and resolves on finished execution.
     */
    get runPromise() {
        return this.m_promise;
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
        onStreamOutUpdate: (callback) => ipcRenderer.on("onStreamOutUpdate", (_event, value) => callback(value)),
        onStreamErrUpdate: (callback) => ipcRenderer.on("onStreamErrUpdate", (_event, value) => callback(value)),
        // When the child handler with a certain key is removed. The render
        // ChildProcess marks itself as invalid in that case.
        onRemoved: (callback) => ipcRenderer.on("onRemoved", (_event, value) => callback(value)),
    });
}

/**
 * Function to proivide all the IPC functions in the main process.
 *
 * @param {ElectronApp} app - The JSL ElectronApp instance that called this in
 *     MAIN
 */
export function connectIPCMain(app) {
    const { ipcMain, dialog } = require("electron/renderer");
    const { spawn } = require("node:child_process");
    const kill = require("tree-kill");
    const os = require("os");
    const path = require("path");
    const fs = require("fs");

    let instances = [];
    const removeInst = (inst) => {
        instances = instances.filter((e) => inst.key !== e.key);
        app.mainWindow.webContents.send("onRemoved", { key: inst.key, status: inst.status });
    };

    const makePath = (p) => {
        if (Array.isArray(p)) {
            return path.join(...p);
        }
        return p;
    };

    /**
     * Add the "exe" extension on windows if not given
     *
     * @param {String} exe - the executable
     * @param {Boolean} isInResourcePath - if true, the resource path is preprended to the path itself.
     * @return {String} - the executable, added ".exe" on windows if not present
     */
    const fixExe = (exe, isInResourcePath) => {
        let fixedExe = app.isPackaged && isInResourcePath ? makePath([process.resourcesPath, exe]) : makePath(exe);
        if (os.platform() === "win32" && path.extname(fixedExe) !== ".exe") {
            fixedExe += ".exe";
        }

        return path.resolve(fixedExe);
    };

    let key = 0;

    ipcMain.handle("jslChildProcess:make", async (_ev, config) => {
        let inst = null;
        if (config.reuse === true) {
            inst = instances.find(
                (e) => e.config?.executable == fixExe(config.executable, inst.config.isInResourcePath),
            );
        }

        if (inst == null) {
            key++;
            inst = {
                key: key,
                config: config,
                process: null,
                status: {
                    running: false,
                    failed: false,
                    closed: false,
                    returnCode: null,
                },
            };
            instances.push(inst);
        }

        // fix CWD if its an array
        inst.config.cwd = makePath(inst.config.cwd);

        // Create CWD if it does not exist and is given
        if (Test.isNonEmptyString(inst.config.cwd)) {
            const dir = inst.config.cwd;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        }

        inst.config.executable = fixExe(inst.config.executable, inst.config.isInResourcePath);
        console.log(inst.config);
        console.log(config);

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
        inst.process = spawn(inst.config.executable, inst.config.args, {
            // Where to run. If null/undef, NODE starts the app in this main process'
            // cwd
            cwd: inst.config.cwd,

            // Do not run in a shell
            shell: false,

            // Hide the process window on windows?
            windowsHide: false,
        });

        inst.status.running = true;
        inst.process.on("close", (code) => {
            console.log("Spawned child closed: exit code: ", code);

            inst.status.running = false;
            inst.status.closed = true;
            inst.status.returnCode = code;
            inst.process = null;

            app.mainWindow.webContents.send("onUpdateStatus", {
                key: inst.key,
                config: inst.config,
                status: inst.status,
            });

            removeInst(inst);
        });

        inst.process.on("error", (err) => {
            console.error("Spawn failed: Failed to start subprocess: ", err);

            inst.status.running = false;
            inst.status.failed = true;
            inst.status.error = err.message;
            inst.process = null;

            app.mainWindow.webContents.send("onUpdateStatus", {
                key: inst.key,
                config: inst.config,
                status: inst.status,
            });

            removeInst(inst);
        });

        inst.process.stdout.on("data", (data) => {
            app.mainWindow.webContents.send("onStreamOutUpdate", { key: inst.key, data: data });
        });

        inst.process.stderr.on("data", (data) => {
            app.mainWindow.webContents.send("onStreamErrUpdate", { key: inst.key, data: data });
        });

        app.mainWindow.webContents.send("onUpdateStatus", { key: inst.key, config: inst.config, status: inst.status });

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
        // console.log("jslChildProcess:status: ", inst);
        return inst.status;
    });
}
