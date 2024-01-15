/**
 * A lot of helpers to iterate over things. Is stateless.
 */
export default class Iterate {
    /**
     * Iterate over some iteratable and call for each instance of a given type. If no or not all elements match, this does
     * not complain or throw.
     *
     * @param {any} iteratable - Either an instance of Type, an array that might contain Type instances, or an object
     *      whose properties are iterated.
     * @param {} Type The type to check for. "instanceof" is used for checking.
     * @param {Function} callback - The callback that will be triggered per match.
     *
     * @return {Promise} - A promise that will resolve once all callbacks are done.
     *      Its result is an array of all results of each called callback. I.e. use
     *      instancesOf(...).then((results)=>{console.log(results); // Array!});
     */
    static instancesOf(Type, iteratable, callback) {
        if (iteratable instanceof Type) {
            return Promise.all([callback(iteratable)]);
        }

        let promises = [];
        if (Array.isArray(iteratable)) {
            for (const item of iteratable) {
                if (item instanceof Type) {
                    promises.push(callback(item));
                }
            }
            return Promise.all(promises);
        }

        for (const prop in iteratable) {
            if (!Object.prototype.hasOwnProperty.call(iteratable, prop)) {
                continue;
            }

            if (iteratable[prop] instanceof Type) {
                promises.push(callback(iteratable[prop]));
            }
        }

        return Promise.all(promises);
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
        if (!iteratable) {
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
}
