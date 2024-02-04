/**
 * A lot of helpers to iterate over things. Is stateless.
 */
export default class Iterate {
    /**
     * Iterate all object properties
     *
     * @static
     * @param {Object} iteratable - The object to iterate. If this is not an object, it is ognored.
     * @param {Function} callback - The callback(name, value) that can retun a promise
     *
     * @returns {Array} An array of callback results. If the callbacks are async, the array will contain promises. If
     * async behavior es required, used the async version.
     */
    static properties(iteratable, callback) {
        if (iteratable == null || !(iteratable instanceof Object)) {
            return [];
        }

        let results = [];

        for (const prop in iteratable) {
            if (!Object.prototype.hasOwnProperty.call(iteratable, prop)) {
                continue;
            }

            results.push(callback(prop, iteratable[prop]));
        }

        return results;
    }

    // @see properties, but returns a promise. Callbacks will be awaited..
    static async propertiesAsync(iteratable, callback) {
        return Promise.all(Iterate.properties(iteratable, callback));
    }

    /**
     * Iterate over some iteratable and call for each instance of a given type. If no or not all elements match, this does
     * not complain or throw.
     *
     * @param {any} iteratable - Either an instance of Type, an array that might contain Type instances, or an object
     *      whose properties are iterated.
     * @param {} Type The type to check for. "instanceof" is used for checking.
     * @param {Function} callback - The callback that will be triggered per match.
     *
     * @return {Array} - An array that will contain the callback results of all matched things inside iteratable. If the
     * callback is async, promises will be returned. Consider using instancesOfAsync.
     */
    static instancesOf(Type, iteratable, callback = (i) => i) {
        if (iteratable == null) {
            return [];
        }
        if (iteratable instanceof Type) {
            return [callback(iteratable)];
        }

        let results = [];
        if (Array.isArray(iteratable)) {
            for (const item of iteratable) {
                if (item instanceof Type) {
                    results.push(callback(item));
                }
            }
            return results;
        }

        for (const prop in iteratable) {
            if (!Object.prototype.hasOwnProperty.call(iteratable, prop)) {
                continue;
            }

            if (iteratable[prop] instanceof Type) {
                results.push(callback(iteratable[prop]));
            }
        }

        return results;
    }

    // @see instancesOf, async version.
    static async instancesOfAsync(Type, iteratable, callback = (i) => i) {
        return Promise.all(Iterate.instancesOf(Type, iteratable, callback));
    }

    /**
     * Like instanceOf, this iterates over all array elements of a given type and allows to map those and
     * re-assign. This cannot work async and probably breaks class instances.
     *
     * @param {Array|Object} iteratable - Must be an array or struct of things. Class instances will not work.
     * @param {} Type The type to check for. "instanceof" is used for checking.
     * @param {Function} callback - The callback that will be triggered per match.
     *
     * @return {any} Object/Array with mapped items.
     */
    static mapInstancesOf(Type, iteratable, callback) {
        if (iteratable == null) {
            return iteratable;
        }

        if (Array.isArray(iteratable)) {
            return iteratable.map((item) => {
                if (item instanceof Type) {
                    return callback(item);
                }
                return item;
            });
        }

        let result = {};
        for (const prop in iteratable) {
            if (!Object.prototype.hasOwnProperty.call(iteratable, prop)) {
                continue;
            }

            if (iteratable[prop] instanceof Type) {
                result[prop] = callback(iteratable[prop]);
            } else {
                result[prop] = iteratable[prop];
            }
        }

        return result;
    }

    /**
     * This iterates as array or object (depending on the iteratable) and maps each entry using a callbhack.
     *
     * @param {Array|Object} iteratable - Must be an array or struct of things.
     * @param {Function} callback - The callback that will be triggered per match.
     *
     * @return {any} Object/Array with mapped items.
     */
    static map(iteratable, callback) {
        if (iteratable == null) {
            return iteratable;
        }

        if (Array.isArray(iteratable)) {
            return iteratable.map((item) => {
                return callback(item);
            });
        }

        let result = {};
        for (const prop in iteratable) {
            if (!Object.prototype.hasOwnProperty.call(iteratable, prop)) {
                continue;
            }
            result[prop] = callback(iteratable[prop]);
        }

        return result;
    }
}
