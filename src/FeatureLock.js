import { jslObject } from "@jsl/Object";
import { tt } from "@jsl/Localization";

import { computed, reactive } from "vue";

/**
 * Represents a single named lock.
 *
 * @extends jslObject
 */
export class FeatureLock extends jslObject {
    static defaultConfig() {
        return {
            // The ID of this lock
            id: "aLock",

            // The time it takes to unlock, in MS.
            unlockWait: 250,

            // If a wrong pin was given, the next unlock wait will be oldWait += oldWait * unlockWaitScale.
            // To double the wait time every wrong pin, use 1 here.
            unlockWaitScale: 1,

            // After this amount of time, the unlock wait timer resets. So, the user tries several times, ends up with a
            // wait of 5min and gives up. After 10 min, we want to reset the wait time to unlockWait again:
            // Time in MS
            unlockWaitResetAfter: 1 * 60 * 1000,
        };
    }

    constructor(config) {
        super(config);

        this.m_state = reactive({ locked: false });
        this.m_lockPin = null;
    }

    /**
     * Lock the feature using the given pin. If the lock is locked already, nothing happens (see relock)
     *
     * @param {string} pin - The pin to use
     * @param {Boolean} relock - If true, the lock will be relocked using this pin. (pin update)
     */
    async lock(pin, relock) {
        if (this.m_state.locked && !relock) {
            return;
        }

        this.m_state.locked = true;
        this.m_unlockWait = this.config.unlockWait;
        this.m_lastTriedUnlock = 0;
        this.m_lockPin = pin;
    }

    /**
     * Tries to unlock. If it fails, an exception is thrown. If already unlocked, nothing happens.
     *
     * @param {String} pin - The lock pin
     * @throws Error - if the pin is wrong.
     */
    async unlock(pin) {
        if (!this.m_state.locked) {
            return;
        }

        if (pin === this.m_lockPin) {
            this.m_state.locked = false;
            this.m_lockPin = null;
            return;
        }

        // This ensures an ever increasing amount of time to wait after a wrang entry
        if (this.m_lastTriedUnlock + this.config.unlockWaitResetAfter < Date.now()) {
            this.m_unlockWait = this.config.unlockWait;
        }
        this.m_lastTriedUnlock = Date.now();
        await new Promise((resolve) => setTimeout(resolve, this.m_unlockWait));
        this.m_unlockWait += this.m_unlockWait * this.config.unlockWaitScale;

        throw "common.msg.unlockFailedWrongPin";
    }

    /**
     * The lock id
     *
     * @returns {String} The lock id
     */
    get id() {
        return this.config.id;
    }

    /**
     * The VUE reactive lock state
     *
     * @returns {vue.Computed} reactive boolean, true if locked.
     */
    get locked() {
        // using computed makes the value read only
        return computed(() => this.m_state.locked);
    }

    /**
     * The VUE reactive lock state
     *
     * @returns {vue.Computed} reactive boolean, true if not locked.
     */
    get unlocked() {
        // using computed makes the value read only
        return computed(() => !this.m_state.locked);
    }
}

/**
 * A set of named feature locks.
 *
 * @extends jslObject
 */
export class FeatureLocks extends jslObject {
    static defaultConfig() {
        return {
            // Define the config of each newly created lock
            lockConfig: {
                ...FeatureLock.defaultConfig(),
            },
        };
    }

    constructor(config) {
        super(config);

        this.m_locks = [];
    }

    /**
     * Check if the named feature lock exists
     *
     * @param {String} id - The lock id
     * @returns {Boolean} True if it exists
     */
    hasLock(id) {
        return this.m_locks.find((l) => l.id == id) != null;
    }

    /**
     * Get the named feature lock or create one if it does not exist
     *
     * @param {String} id - The lock id
     * @returns {FeatureLock} The lock instance
     */
    getLock(id) {
        let lock = this.m_locks.find((l) => l.id == id);
        if (lock != null) {
            return lock;
        }

        lock = new FeatureLock({
            ...this.config.lockConfig,

            id: id,
        });
        this.m_locks.push(lock);
        return lock;
    }

    /**
     * Shortcut to get the lock for unattendedMode
     *
     * @returns {FeatureLock} The lock
     */
    get unattendedMode() {
        return this.getLock("unattendedMode");
    }
}

// The backend instance
export let featureLocks = null;

/**
 * Construct the feature lock singleton and return the instance. If called multiple
 * times, this throws.
 *
 * @note The instance is not initialized. Call await init somewhere.
 *
 * @param {Object} config The config as in @see FeatureLocks.defaultConfig
 *
 * @return {Object} The wrapper
 */
export function make(config) {
    if (featureLocks != null) {
        throw new Error("FeatureLocks is instantiated already.");
    }

    featureLocks = new FeatureLocks(config);
    return featureLocks;
}
