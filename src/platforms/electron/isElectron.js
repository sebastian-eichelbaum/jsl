/**
 * Check if the code is running in electron. See
 * https://github.com/electron/electron/issues/2288
 *
 * @returns {Boolean} True if in an electron context
 */
export default function isElectron() {
    // Inside the renderer process, "windows" is defined as a certain type. Check
    // this first:
    const isElectronWindow =
        typeof window !== "undefined" && typeof window.process === "object" && window.process.type === "renderer";

    // Inside the main process, JS can check the 'process' variable:
    const isElectronProcess =
        typeof process !== "undefined" && typeof process.versions === "object" && !!process.versions.electron;

    // If node integration is disabledm use navigator.agent
    const isElectronAgend =
        typeof navigator === "object" &&
        typeof navigator.userAgent === "string" &&
        navigator.userAgent.indexOf("Electron") >= 0;

    return isElectronWindow || isElectronProcess || isElectronAgend;
}
