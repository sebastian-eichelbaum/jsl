import _ from "lodash";

// Ensures JSON stringification to be more determinsitic, regardless of the underlying key order
import stringify from "json-stable-stringify";

/**
 * Helpers to convert, interpret or work with values of expected types a bit
 * more easily
 */
export class TypeHelpers {
    /**
     * Return the given value as number if it is a number, or a default if it is
     * not. Interprets strings.
     *
     * @param {any} x - The value to work with
     * @param {Number} def - A default to return
     * @returns {Number} Default or the value as number
     */
    static asNumberOr(x, def) {
        const asNum = Number(x);
        return isNaN(asNum) ? def : asNum;
    }

    /**
     * Interpret a value as boolean.
     *
     * @param {any|String|Number|Boolean} x - A boolean or a number!=0 or a string
     *     "yes","true"
     * @param {any} def - A default
     * @returns {Boolean|any} default or a boolean
     */
    static asBooleanOr(x, def) {
        if (typeof x === "boolean") {
            return x;
        }
        if (typeof x === "number") {
            return Boolean(x !== 0);
        }

        if (x == "true" || x == "TRUE" || x == "yes" || x == "YES") {
            return true;
        }
        return def;
    }

    /**
     * Ensures the value is an array that only contains values as returned by the
     * elemValidator.
     *
     * @param {any} x - an array. If not an array, def is returned.
     * @param {Function} elemValidator - A callback that gets the element and
     *     returns something that is acceped
     * @param {any} def - A default if x is not an array
     * @returns {Array|any} default or an array
     */
    static asArrayOr(x, elemValidator, def) {
        if (!Array.isArray(x)) {
            return def;
        }
        return Array.from(x, (i) => elemValidator(i));
    }

    /**
     * Ensures the value is an array that only contains values that are also in the given valid values array.
     *
     * @param {any} x - an array. If not an array, def is returned.
     * @param {Array} validValues - A set of accepted values.
     * @returns {Array|any} default or an array
     */
    static asArrayOf(x, validValues, def) {
        if (!Array.isArray(x)) {
            return [];
        }

        return x.filter((item) => validValues.includes(item));
    }

    /**
     * Makes sure the given value is an array. If not, it is made an array containing the given value.
     *
     * @static
     * @param {Array|any} x - If array, returned as is. If not not, returned as array containing it.
     * @returns {Array} x or x as array
     */
    static ensureArray(x) {
        if (!Array.isArray(x)) {
            return [x];
        }
        return x;
    }

    /**
     * Collect all the different keys in two objects
     *
     * @static
     * @param {Object} obj1 - object 1
     * @param {Object} obj2 - object 2
     * @param {Boolean} [compareRef] - If true, objects are compared by reference
     * @returns {Array} List of different keys
     */
    static objectDifference(obj1, obj2, compareRef = false) {
        return Object.keys(obj1).reduce((result, key) => {
            if (!obj2.hasOwnProperty(key)) {
                result.push(key);
            } else if (_.isEqual(obj1[key], obj2[key])) {
                const resultKeyIndex = result.indexOf(key);

                if (compareRef && obj1[key] !== obj2[key]) {
                    result[resultKeyIndex] = `${key} (ref)`;
                } else {
                    result.splice(resultKeyIndex, 1);
                }
            }
            return result;
        }, Object.keys(obj2));
    }

    /**
     * Creates an order independed JSON of both objects and checks if the JSON strings are different.
     *
     * @static
     * @param {Object} obj1 - Object 1
     * @param {Object} obj2 - Object 2
     *
     * @return {Boolean} true if they are different in their JSON representation
     */
    static areObjectsDifferent(obj1, obj2) {
        return stringify(obj1) !== stringify(obj2);
    }

    /**
     * Takes ans object and generates an object with the same data members (no functions, prototypes, ...) - aka POD,
     * Plain old Data like.
     *
     * @static
     * @param {Object} obj - An object to clone as raw object
     * @returns {Object} Object with the same fields that are not functions/prototypes/...
     */
    static asPOD(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Test if a given var is an object (and not null, and not an array)
     *
     * @static
     * @param {any} x - The variable to test
     * @returns {boolean} True if the variable is an object instance.
     */
    static isObject(x) {
        return typeof x === "object" && !Array.isArray(x) && x !== null;
    }

    /**
     * Test if the given variable is a function
     *
     * @static
     * @param {any} x - The variable to test
     * @returns {boolean} True if the variable is a function.
     */
    static isFunction(x) {
        return typeof x !== "function";
    }
}
