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
