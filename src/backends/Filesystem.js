import { Service, ServiceError, UserService, DatabaseService, StorageService } from "../Backend";

/**
 * The Storage service on the local filesystem. This does not work for web applications.
 */
export class FilesystemStorage extends StorageService {
    /**
     * Default configuration
     */
    static defaultConfig() {
        return {
            ...{
                // The protocoll to use. Electron for example disallows use of file://. The default JSL ElectronApp
                // provides a protocol "fs" to access the filesystem.
                protocol: "fs",
            },
            ...StorageService.defaultConfig(),
        };
    }

    /**
     * Create the backend service.
     *
     * @param {Object} config - The config as in @see Service.defaultConfig.
     *     Merged with the default.
     */
    constructor(config = {}) {
        super(config);
    }

    /**
     * Initialize the service. Managed by the Backend instance.
     *
     * @return {Promise} Async promise
     */
    async _init() {
        super._init();
    }

    // HACK: returns the merged root+path
    getMergedPath(path) {
        return path.handle.root + "/" + path.handle.path;
    }

    /**
     * Create a Firestore storage ref
     *
     * @param {String} path - The args as given to @see StorageService.path
     * @returns {any} - The firestore file ref handle
     */
    _makePath(path) {
        return { root: this.root, path: path };
    }

    /**
     * Generate the URL to load the file pointed to by path
     *
     * @param {Object} path - The path to convert - as generated by _makePath
     *
     * @return {Promise<String>} the URL
     */
    async _getUrlOfPath(path) {
        return this.config.protocol + ":///" + path.root + "/" + path.path;
        // HACK: the third slash is only needed for win
    }

    /**
     * Fetch the file from disk.
     *
     * @async
     * @param {Object} path - The path handle as returned by _makePath
     * @returns {Promise<Blob>} The blob
     */
    async _fetch(path) {
        return this._getUrlOfPath(path)
            .then((url) => {
                return fetch(url);
            })
            .then((response) => {
                return response.blob();
            });
    }
}
