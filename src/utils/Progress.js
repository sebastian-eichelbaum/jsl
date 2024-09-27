import { ref } from "vue";

import { jslObject } from "jsl/Object";

// TODO: base class

/**
 * Tries to estimate a progress by erratic/indeterministic updates. This tracks the amount of items to load. When it goes up, no
 * progress is made. When it goes down, add to the progress.
 */
export class UndeterministicProgress extends jslObject {
    /**
     * Generate a default config.
     */
    static defaultConfig() {
        return {
            // If true, every add when 100 is reached causes the tracker to go into pending mode
            pendingOn100: true,

            // Set pending if the queue reaches zero again. Is ignored if autoFinishOnQueue0 is true.
            pendingOnQueue0: true,

            // If the tracker is running and the queue reaches zero again (no more pending stuff to load), finish the
            // tracker automatically. You should be sure that a temporarily empty queue means load=done.
            autoFinishOnQueue0: false,

            // If set, called for each percent and state update. The calling instance is passed.
            onUpdate: (_self) => {},

            // If set, called for each started progress. The calling instance is passed.
            onStart: (_self) => {},

            // If set, called for each finished progress. The calling instance is passed.
            onFinish: (_self) => {},
        };
    }

    /**
     * Create the progress tracker
     *
     * @param {Object} config - The config as in @see defaultConfog
     */
    constructor(config) {
        super(config);

        this.m_queue = 0;
        this.m_percent = 0;
        this.m_running = false;
    }

    /**
     * Start progress tracking. This resets percent to 0
     */
    start() {
        this.m_queue = 0;
        this.m_percent = 0;
        this.m_running = true;
        this.m_pending = true;
        this.config.onStart?.(this);
        this._update();
    }

    /**
     * Mark the loading as finished. Percent will be set to 100.
     */
    finish() {
        this.m_queue = 0;
        this.m_percent = 100;
        this.m_running = false;
        this.m_pending = false;
        this.config.onFinish?.(this);
        this._update();
    }

    /**
     * Add the given number to the current value in the internal loading queue.
     *
     * @param {Number} amount - The amount of new items to add. Negative numbers mean that items where loaded -
     * increasing the percentage accordingly.
     */
    add(amount = 1) {
        if (typeof amount !== "number" || amount === 0) {
            return;
        }

        if (!this.m_running) {
            this.start();
        }

        // First add ensures the tracker is not in pending state anymore
        if (this.m_pending === true && this.m_percent === 0) {
            // Be nice and show the user some progress.
            this.m_percent = 1;
            this.m_pending = false;
        }

        // If enabled and we reached 100, every consecutive add causes the pending flag to be set
        if (this.m_percent >= 100 && this.config.pendingOn100 === true) {
            this.m_pending = true;

            this._update();
            return;
        }

        // Negative amount means that something is now done.
        let p = 0;
        if (amount < 0) {
            p = -amount / this.m_queue;
            this.m_percent = Math.max(0, Math.min(100, this.m_percent + Math.max(0, 100 - this.m_percent) * p));
        }

        this.m_queue += amount;

        if (this.config.autoFinishOnQueue0 === true && this.m_queue === 0) {
            this.finish();
        }

        if (this.config.pendingOnQueue0 === true && this.m_queue === 0) {
            this.m_pending = true;
        }

        this._update();

        // console.log(amount, this.m_queue, this.percent);
    }

    /**
     * Sets the absolute amount of items to load.
     *
     * @param {Number} amount - The amount of items currently in your tracked loading queue
     */
    set(amount) {
        this.add(amount - this.m_queue);
    }

    /**
     * Like add, mark n item as done.
     *
     * @param {Number} [amount] - The amount of items that are now done.
     */
    done(amount = 1) {
        this.add(-amount);
    }

    /**
     * The estimated percentage
     *
     * @returns {Number} The estimated percentage in [0,100], rounded to integers.
     */
    get percent() {
        return Math.round(this.m_percent || 0);
    }

    /**
     * Return true if the tracker is active
     *
     * @returns {Boolean} True if the tracker is active
     */
    get isLoading() {
        return this.m_running;
    }

    /**
     * Return true if the tracker is pending. This happens after starting before adding the first item.
     *
     * @returns {Boolean} True if the tracker is active
     */
    get isPending() {
        // only if loading
        return this.isLoading && this.m_pending;
    }

    /**
     * Update internal state
     */
    _update() {
        this.config.onUpdate(this);
    }
}
