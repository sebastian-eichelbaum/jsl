import { assert, Test } from "jsl/Assert";

/**
 * Encode an object as JSON in base 64. Ensures unicode is handled properly.
 *
 * @param {Object} value - The object to encude
 * @returns {String} The basde 64 encoded JSON object
 */
export function objectToBase64(value) {
    assert(typeof value === "object", "Given value must be an object");
    return btoa(
        // Ensure any unicode values are converted to a byte array before b64
        // encode.
        String.fromCodePoint(
            ...new TextEncoder().encode(
                // Ensure compact JSON
                JSON.stringify(value),
            ),
        ),
    );
}

/**
 * Decode a base64 string and parse as JSON.
 *
 * @param {String} base64 - The base64 string
 * @returns {Object} The parsed object
 */
export function base64ToObject(base64) {
    assert(Test.isNonEmptyString(base64), "Given base64 value must be a string.");
    return JSON.parse(
        // ensure proper encoding
        new TextDecoder().decode(
            Uint8Array.from(
                // base64 to binary data
                atob(base64),
                (m) => m.codePointAt(0),
            ),
        ),
    );
}

/**
 * Encode an string as base 64. Ensures unicode is handled properly.
 *
 * @param {Object} value - The string to encude
 * @returns {String} The basde 64 encoded string
 */
export function stringToBase64(value) {
    assert(Test.isString(value), "Given value must be a string");
    return btoa(
        // Ensure any unicode values are converted to a byte array before b64
        // encode.
        String.fromCodePoint(...new TextEncoder().encode(value)),
    );
}

/**
 * Decode a base64 string.
 *
 * @param {String} base64 - The base64 string
 * @returns {Object} The decoded string
 */
export function base64ToString(base64) {
    assert(Test.isNonEmptyString(base64), "Given base64 value must be a string.");
    return new TextDecoder().decode(
        Uint8Array.from(
            // base64 to binary data
            atob(base64),
            (m) => m.codePointAt(0),
        ),
    );
}
