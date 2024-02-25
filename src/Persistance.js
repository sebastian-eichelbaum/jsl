import { Test } from "./Assert";

/**
 * Simple localStorage persistance wrapper that allows namespaces. Namespaces can be nested and are separated using
 * "::".
 *
 * Usage:
 * import { persistance } from "@jsl/Persistance";
 * persistance.in("mru").get("workingDir");
 * persistance.in("mru").set("workingDir", "/home/user/stuff);
 */
export class Persist {
    /**
     * Persitant storage in a namespace.
     *
     * @param {String} [namespace] - Namespace or nullish
     */
    constructor(namespace = null) {
        this.m_namespace = Test.isNonEmptyString(namespace) ? namespace : "";
    }

    /**
     * Create a storage access wrapper using a given namespace
     *
     * @param {String} namespace - Namespace
     * @returns {Persist} Storage wrapper
     */
    in(namespace) {
        const ownNS = Test.isNonEmptyString(this.m_namespace) ? this.m_namespace + "::" : "";
        return new Persist(ownNS + (Test.isNonEmptyString(namespace) ? namespace : ""));
    }

    /**
     * Get the value stored for a key or null
     *
     * @param {String} name - The name of the key
     * @returns {Any} Some stored value or null
     */
    get(name) {
        return localStorage.getItem(this._makeKey(this.namespace, name));
    }

    /**
     * Set the given value
     *
     * @param {String} name - Key name
     * @param {Any} value - Some value
     */
    set(name, value) {
        localStorage.setItem(this._makeKey(this.namespace, name), value);
    }

    /**
     * Remove the key given
     *
     * @param {String} name - The key
     */
    remove(name) {
        localStorage.removeItem(this._makeKey(this.namespace, name));
    }

    /**
     * Get this namespace
     *
     * @returns {String} The namespace as string
     */
    get namespace() {
        return this.m_namespace;
    }

    /**
     * Make a storage key
     *
     * @param {String} namespace - namespace prefix
     * @param {String} name - key name
     * @returns {String} A key for storage
     */
    _makeKey(namespace, name) {
        return (Test.isNonEmptyString(namespace) ? namespace + "::" : "") + (Test.isNonEmptyString(name) ? name : "");
    }
}

// The global Persist instance
export let persistance = new Persist();
