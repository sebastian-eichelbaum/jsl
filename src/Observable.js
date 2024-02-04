/**
 * Implements the Observer Pattern.
 *
 * Example:
 *
 *  class Some{
 *  constructor(){ this.m_obs = Observable.make() };
 *  get obsProp () { return this.m_obs.observable; }
 *
 *  work()
 *  {
 *      // Notify ever listener
 *      this.m_obs.notify(...);
 *  }
 *  ...
 *  }
 *
 *  // On the subsciber-side
 *  someInstance.someObservableProp.subscribe((...args)=>{});
 */
export class Observable {
    /**
     * Make an observable.
     *
     * @static
     * @param {any} args - constructor args. Passed as is.
     * @returns {Object} The {notify, observable}.
     */
    static make(...args) {
        const obs = new Observable(...args);
        return {
            notify: (...args) => {
                obs.m_observers.forEach((o) => {
                    o?.(...args);
                });
            },
            observable: obs,
        };
    }

    /**
     * Create the observable. Do not use directly. You will not get the notifier.
     */
    constructor() {
        this.m_observers = [];
    }

    /**
     * Subscribe and call a given function when triggered.
     *
     * @param {Function} func - The callback
     * @throws {Error} - If the given thing is not a function
     * @returns {Observable} this
     */
    subscribe(func) {
        if (func != null && typeof func !== "function") {
            throw new Error("Observer.subscribe requires a function.");
        }
        if (func != null) {
            this.m_observers.push(func);
        }

        return this;
    }

    /**
     * Remove the given function from the subscriber list
     *
     * @param {Function} func - The function to remove
     * @returns {Observable} this.
     */
    unsubscribe(func) {
        this.m_observers = this.m_observers.filter((observer) => observer !== func);

        return this;
    }
}
