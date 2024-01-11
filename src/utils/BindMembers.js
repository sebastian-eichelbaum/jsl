/**
 * Binds the member functions in a given class to an instance of that class
 *
 * @param {Object} instance The instance to bind.
 *
 * @return {Object} that provides all member functions of the original instance, bound to that instance.
 */
export default function BindMembers (instance) {
    let obj = {};

    const prototype = Object.getPrototypeOf(instance);

    Object.getOwnPropertyNames(prototype).forEach((prop) => {
        if (prop == "constructor" || typeof prototype[prop] != "function") {
            return;
        }

        obj[prop] = prototype[prop].bind(instance);
    });

    return obj;
};
