/**
 * Base object in jsl. It provides a config.
 */
export class jslObject {
    /**
     * Create the object.
     *
     * @param {Object} config - The config used by the derived object.
     */
    constructor(config = {}) {
        this.m_config = config || {};
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
    }

    /**
     * Initialize the object instance asynchronously.
     *
     * @return {Promise} The config of this object
     */
    async init(...args) {}
}
