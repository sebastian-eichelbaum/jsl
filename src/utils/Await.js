import _ from "lodash";

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

    /**
     * Use the double requestAnimationFrame-trick to wait until the DOM has been updated.
     *
     * @static
     * @async
     * @returns {Promise} Resolves once the DOM is updated.
     */
    static async domUpdate() {
        return new Promise((resolve) => {
            afterDomUpdate(resolve);
        });
    }
}

/**
 * Wrap a function to enforce sequential execution. This creates a promise queue that ensures the func is never called
 * in parallel.
 *
 * @note Uncought exceptions in func are cought to ensure the queue continues to work.
 *
 * @param {Function} func - The function to call. Any uncought exceptions in here are cought and ignored.
 * @returns {Function} A function wrapper that calls your function sequencially.
 */
export function makeSequential(func) {
    const ignore = (_) => {};
    let workQueue = Promise.resolve();
    return (...args) => {
        const result = workQueue.then(() => func(...args));
        workQueue = result.then(ignore, (e) => {
            console.error("Uncought exception", e);
        });
        return result;
    };
}

/**
 * Create a function that never runs in parallel but also ensures that only the latest invokation is executed. This
 * means, you can fire that often, but only the latest one is run after the currently running invokation has finished.
 * Perfect for debounced-api calls.
 *
 * @note Uncought exceptions in func are cought to ensure the queue continues to work.
 *
 * @param {Function} func - The function to call. Any uncought exceptions in here are cought and ignored.
 * @returns {Function} The wrapper.
 */
export function makeSingleRun(func) {
    const ignore = (_) => {};
    let workQueue = Promise.resolve();
    let currentIndex = 0;

    return (...args) => {
        currentIndex++;

        // capture the current index and scip execution if the index while calling this and during real execution is
        // different
        const closure = ((i) => {
            const myI = i;
            return (...args) => {
                if (myI === currentIndex) {
                    return func(...args);
                }
                return;
            };
        })(currentIndex);

        const result = workQueue.then(() => closure(...args));
        // It is important to catch any issues as one failing call might break the queue.
        workQueue = result.then(ignore, (e) => {
            console.error("Uncought exception", e);
        });
        return result;
    };
}

/**
 * Like @see makeSingleRun but adds a debounce
 *
 * @param {Function} func - the function to call
 * @param {Number} wait - time in ms to wait (debounce)
 * @param {Object} [options] - the lodash debounce options
 */
export function makeDebouncedSingleRun(func, wait, options = {}) {
    return _.debounce(makeSingleRun(func), wait, options);
}

/**
 * Wait for the given amount of time in millisec
 *
 * @param {Number} milliseconds - The time to sleep in milliseconds
 * @returns {Promise} promise
 */
export function wait(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

/**
 * Use the double-requestAnimationFrame trick as discussed in this issue: https://github.com/vuejs/vue/issues/9200
 *
 * @param {Function} callback - Function to call after DOM update.
 */
export function afterDomUpdate(callback) {
    requestAnimationFrame(() => {
        requestAnimationFrame(callback);
    });
}

/**
 * Awaits the next dom update.
 *
 * @returns {Promise} Resolves after dom update
 */
export function domUpdate() {
    return new Promise(afterDomUpdate);
}
