import * as platform from "./Platform";
import * as os from "./OS";
import * as childprocess from "./ChildProcess";
import * as autoUpdater from "./AutoUpdater";

/**
 * Connect the preload-side IPC
 */
export function setupPreload() {
    platform.connectIPCPreload();
    os.connectIPCPreload();
    childprocess.connectIPCPreload();
    autoUpdater.connectIPCPreload();
}

/**
 * Setup the IPC in the main process.
 *
 * @param {ElectronApp} app - The jsl ElectronApp owning this
 */
export function setupMain(app) {
    platform.connectIPCMain(app);
    os.connectIPCMain(app);
    childprocess.connectIPCMain(app);
    autoUpdater.connectIPCMain(app);
}
