import _ from "lodash";

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
}
