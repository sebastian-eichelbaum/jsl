/**
 * Tests for conditions.
 */
export class Test {
    static _test(expectedTrue, message, got, onFail = null) {
        if (expectedTrue) {
            return true;
        }

        if (onFail != null) {
            let msg = "Test failed. Expected: " + message + ".";
            onFail(msg, got);
        }
        return false;
    }

    /**
     * Check if the value is a non empty string.
     *
     * @static
     * @param {any} x - The value to test
     *
     * @returns {Boolean} True if a non empty string
     */
    static isNonEmptyString(x, onFail = null) {
        return Test._test((x instanceof String || typeof x === "string") && !!x, "non-empty-string", x, onFail);
    }

    /**
     * Check if the value is an instance of something.
     *
     * @static
     * @param {any} x - The value to test
     * @param {any} instOf - A type or an array of types to check via instanceof
     *
     * @returns {Boolean} True if a non empty string
     */
    static isInstanceOf(x, instOf, onFail = null) {
        const ok =
            // If it is an instance of some type in the array
            (Array.isArray(instOf) &&
                instOf.some((type) => {
                    x instanceof type;
                })) ||
            // Or is itself that type
            x instanceof instOf;

        return Test._test(ok, "instance of type", x, onFail);
    }

    /**
     * Check if the value is a non empty string or an instance of some type.
     *
     * @static
     * @param {any} x - The value to test
     * @param {any} instOf - A type or an array of types to check via instanceof
     *
     * @returns {Boolean} True if a non empty string
     */
    static isNonEmptyStringOrInstanceOf(x, instOf, onFail = null) {
        return Test._test(
            Test.isInstanceOf(x, instOf, null) || Test.isNonEmptyString(x, null),
            "non-empty-string or instance of type",
            x,
            onFail,
        );
    }

    /**
     * Check if the value is a string.
     *
     * @static
     * @param {any} x - The value to test
     *
     * @returns {Boolean} True if succeeded.
     */
    static isString(x, onFail = null) {
        return Test._test(x instanceof String || typeof x === "string", "string", x, onFail);
    }

    /**
     * Check if the value is an array and contains only instances of the given type set
     *
     * @static
     * @param {any} x - The value to test
     * @param {Function} [onFail] - A function triggered on fail. @see Test._test
     *
     * @returns {Boolean} True if the test succeeded.
     */
    static arrayOnlyContainsString(x, onFail = null) {
        return Test._test(
            Array.isArray(x) && x.every((i) => Test.isString(i)),
            "Array containing only strings",
            x,
            onFail,
        );
    }

    /**
     * Check if the value is an array and contains only non-empty strings
     *
     * @static
     * @param {any} x - The value to test
     * @param {Function} [onFail] - A function triggered on fail. @see Test._test
     *
     * @returns {Boolean} True if the test succeeded.
     */
    static arrayOnlyContainsNonEmptyString(x, onFail = null) {
        return Test._test(
            Array.isArray(x) && x.every((i) => Test.isNonEmptyString(i)),
            "Array containing only non-empty strings",
            x,
            onFail,
        );
    }

    /**
     * Check if the value is an array and contains only instances of the given type set
     *
     * @static
     * @param {any} x - The value to test
     * @param {any} instOf - A type or an array of types to check via instanceof
     * @param {Function} [onFail] - A function triggered on fail. @see Test._test
     *
     * @returns {Boolean} True if the test succeeded.
     */
    static arrayOnlyContainsInstancesOf(x, instOf, onFail = null) {
        return Test._test(
            Array.isArray(x) && x.every((i) => Test.isInstanceOf(i, instOf)),
            "Array containing only instances of a type",
            x,
            onFail,
        );
    }
}

/**
 * Assert a test function and throw if it is false
 *
 * @param {Function|Bool} test - A function to be called with all arguments or a boolean
 * @param {String} msg - The message to show/throw on fail
 * @param {any} args - The arguments to pass to the test function if it is a function
 * @throws {Error} - An error on failure
 */
export function assert(test, msg, ...args) {
    if (typeof test === "function") {
        test(...args, (testMsg, got) => {
            console.error("Assert failed: " + msg + " - " + testMsg, got);
            throw new Error("Assert failed: " + msg + " - " + testMsg);
        });
    } else if (!test) {
        console.error("Assert failed: " + msg);
        throw new Error("Assert failed: " + msg);
    }
}
