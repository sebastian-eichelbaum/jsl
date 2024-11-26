import _ from "lodash";

/**
 * Base object in jsl. It provides a config and initializes it with the defaults from your class's "defaultConfig", if
 * any.
 *
 * Example:
 *
 * export class Cheese {
 *     static defaultConfig() {return {holes:42}}
 *
 *     constructor(config)
 *     {
 *         super(config);
 *
 *         // Use this.config. It is merged with your defaults.
 *     }
 * }
 */
export class jslObject {
    /**
     * Create the object.
     *
     * @param {Object} config - The config used by the derived object.
     */
    constructor(config = {}) {
        const defaultCfg = this?.constructor?.defaultConfig?.();
        this.m_config = _.merge(defaultCfg, config || {});
    }

    /**
     * Get the config.
     *
     * @return {Object} The config of this object
     */
    get config() {
        return this.m_config;
    }
}

/**
 * The base object for all jsl types that want a two-stage initialization. It is a convenient way to express to users
 * that your class requires a second init step.
 */
export class jslObjectAsyncInit extends jslObject {
    /**
     * Create the object. The object is not yet ready to use. Init in a second step calling init()
     *
     * @param {Object} config - The config used by the derived object.
     */
    constructor(config = {}) {
        super(config);
        this.m_objectAsyncInitOK = false;
        this.m_objectAsyncInitFailed = false;
        this.m_objectAsyncInitFailCause = null;

        this.m_objectAsyncInitInitPromise = new Promise((resolve, reject) => {
            this.m_objectAsyncInitInitPromiseResolve = resolve;
            this.m_objectAsyncInitInitPromiseReject = reject;
        });
    }

    /**
     * Initialize the object instance asynchronously. Once the promise resolves, init is done
     *
     * @return {Promise} The config of this object
     */
    async init(...args) {}

    /**
     * Get the promise that resolves or rejects once init succeeds or fails.
     *
     * @returns {Promise} Resolves after init succeeded. Rejects on error.
     */
    get initPromise() {
        return this.m_objectAsyncInitInitPromise;
    }

    /**
     * Check if the initialization is done
     *
     * @returns {Boolean} True if init is ok and the object can be used.
     */
    isInitOK() {
        return this.m_objectAsyncInitOK;
    }

    /**
     * Check if the initialization is failed
     *
     * @returns {Boolean} True if init failed and the object is not valid.
     */
    isInitFailed() {
        return this.m_objectAsyncInitFailed;
    }

    /**
     * Get the cause of the init failure if any.
     *
     * @returns {any} Cause of failure or undefined/null if unknown or not failed
     */
    getInitFailCause() {
        return this.m_objectAsyncInitFailCause;
    }

    /**
     * Implementers can call this to mark init failure.
     *
     * @param {Object} e - A cause/exception
     */
    _initFailed(e) {
        this.m_objectAsyncInitOK = false;
        this.m_objectAsyncInitFailed = true;
        this.m_objectAsyncInitFailCause = e;

        this.m_objectAsyncInitInitPromiseReject(e);
    }

    /**
     * Implementers can call this to mark init success.
     */
    _initOK() {
        this.m_objectAsyncInitOK = true;
        this.m_objectAsyncInitFailed = false;
        this.m_objectAsyncInitFailCause = null;

        this.m_objectAsyncInitInitPromiseResolve();
    }
}
