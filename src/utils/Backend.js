import { backend } from "jsl/Backend";

/**
 * Get the username of the current user or the given default.
 *
 * @param {String} defaultName - the default name to return if the backend does not support users or the user is not
 *  available.
 */
export function userName(defaultName = "user.ui.anonymous") {
    if (backend.user) {
        return backend.user.user?.name || "user.ui.anonymous";
    }

    return "user.ui.anonymous";
}

/**
 * Get the username of the current user or the given default. This returns the first word.
 *
 * @param {String} defaultName - the default name to return if the backend does not support users or the user is not
 *  available.
 */
export function userNameShort(defaultName = "user.ui.anonymous") {
    return userName(defaultName).replace(/ .*/, "");
}
