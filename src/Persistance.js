import { Test } from "./Assert";

/**
 * Simple localStorage persistance wrapper that allows namespaces. Namespaces can be nested and are separated using
 * "::".
 *
 * Usage:
 * import { persistance } from "jsl/Persistance";
 * persistance.in("mru").get("workingDir");
 * persistance.in("mru").set("workingDir", "/home/user/stuff");
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
     * @param {any} defautlValue - A default that is returned when the key is not existing
     * @returns {Any} Some stored value or null. If the value was an object, it is parsed. Strings "undefined" and
     * "null" are mapped to null/undefined again (and used for default value mapping)
     */
    get(name, defautlValue = null) {
        let value = localStorage.getItem(this._makeKey(this.namespace, name));
        const objTag = "jslpersistanceobj_";

        if (value?.startsWith?.(objTag)) {
            return JSON.parse(value.replace(objTag, ""));
        }

        if (value === "undefined") {
            value = undefined;
        }

        if (value === "null") {
            value = null;
        }

        return value == null ? defautlValue : value;
    }

    /**
     * Set the given value
     *
     * @param {String} name - Key name
     * @param {Any} value - Some value - Objects are stored as JSON strings.
     */
    set(name, value) {
        const objTag = "jslpersistanceobj_";
        localStorage.setItem(
            this._makeKey(this.namespace, name),

            // Objects get JSONified and a type identifier is added for "get" to resolve the JSON object again
            typeof value === "object" ? objTag + JSON.stringify(value) : value,
        );
    }

    /**
     * Gets the given entry and calls the updater with it. The updater modifies the value and returns a new one. The new
     * value will be stored.
     *
     * @param {String} name - Item name
     * @param {any} defautlValue - A default that is returned when the key is not existing
     * @param {Function} updater - A functor taking a value and returning a new one
     */
    update(name, updater, defautlValue = null) {
        this.set(name, updater(this.get(name, defautlValue)));
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
