/**
 * Helpers to await certain situations.
 *
 * Be warned. Some of those helpers using polling. If a state flips regularly, polling might miss them. Also, be aware
 * that polling is bad practice - sometimes it is unavoidable though. In those cases, use these functions.
 */
export default class Await {
    /**
     * Wait for a given predicate to become true. This polls the predicate amd finishes once it gets true.
     *
     * WARN: uses polling.
     *
     * @param {Function} pred - the function being called regularly. Once this returns true, wait is done.
     * @param {Number} interval - polling interval in millisec. 500 by default.
     */
    static async predicate(pred, interval = 500) {
        await Await._poll(pred, interval);
    }

    /**
     * Implements an poll function that resolves once the given function returns true
     *
     * @param {Function} pred - the function being called regularly. Once this returns true, wait is done.
     * @param {Number} interval - polling interval in millisec. 500 by default.
     */
    static _poll(pred, interval = 500) {
        const poll = (resolve) => (pred() ? resolve() : setTimeout(() => poll(resolve), interval));
        return new Promise(poll);
    }
}
