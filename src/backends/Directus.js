// Base client
import { authentication, staticToken, createDirectus, readItems, rest } from "@directus/sdk";
import _ from "lodash";

import { DatabaseService, Service, ServiceError } from "../Backend";

/**
 * Directus backend implementation for a Directus composable client.
 *
 * ATTENTION: currently, this only supports static token authentication!
 */
export class DirectusClient extends Service {
    /**
     * Default configuration. This defines the configs that are passed to the
     * official Directus instance.
     */
    static defaultConfig() {
        return {
            ...{
                api: {
                    // Get these values from your firebase console. Add all service
                    // configs here too.
                    apiKey: "abcdefghijklmonpqrstuvwxyz",
                    url: "https://directus.somecompany.com",
                },
            },
            ...Service.defaultConfig(),
        };
    }

    /**
     * Create the backend service.
     *
     * @param {Object} config - The config as in @see Service.defaultConfig.
     *     Merged with the default.
     */
    constructor(config = {}) {
        super(_.merge(DirectusClient.defaultConfig(), config || {}));
    }

    /**
     * Init directus. Does not expect any context.
     *
     * @param  args - The context that was provided to the backend config.
     *
     * @return {Promise} The initialization promise.
     */
    async init(...args) {
        await super.init(...args);

        // The directus client is composable. Lets add all the features requested as
        // service:
        this._native = createDirectus(this.config.api.url).with(staticToken(this.config.api.apiKey));
        this.addFeature(authentication("cookie", { credentials: "include" }));
        this.native.setToken(this.config.api.apiKey);

        this._markReady();
    }

    /**
     * Extend the native client with a given feature.
     *
     * @param {Object} feature - The feature to add. Refer to the specific SDK doc
     *     for details
     */
    addFeature(feature) {
        this._native = this.native.with(feature);
    }
}

/**
 * A database service using Directus rest API.
 */
export class DirectusRestDBService extends DatabaseService {
    /**
     * Default configuration
     */
    static defaultConfig() {
        return {
            ...{},
            ...DatabaseService.defaultConfig(),
        };
    }

    /**
     * Create the backend service.
     *
     * @param {Object} config - The config as in @see Service.defaultConfig.
     *     Merged with the default.
     */
    constructor(config = {}) {
        super(_.merge(DirectusRestDBService.defaultConfig(), config || {}));
    }

    /**
     * Initialize the service. Managed by the Backend instance.
     *
     * @param  args - The context that was provided to the backend config.
     *
     * @return {Promise} Async promise
     */
    async init(...args) {
        await super.init(...args);

        this.backend.context.addFeature(rest({ credentials: "include" }));
        this._native = this.backend.context.native;
        this._markReady();
    }

    /**
     * Call the directus search feature.
     */
    async _search(collection, fields, words, options = {}) {
        // Ref to the directus docs

        const anyFieldContainsWord = (fields, word) => {
            return {
                _or: Array.from(fields, (field) => {
                    let result = {};
                    result[field] = { _icontains: word };
                    return result;
                }),
            };
        };

        const makeWordAndQuery = (fields, words) => {
            return {
                _and: Array.from(words, (word) => {
                    return anyFieldContainsWord(fields, word);
                }),
            };
        };

        let q = makeWordAndQuery(fields, words);

        return this.native.request(
            readItems(collection, {
                filter: q,
                limit: options.limit,
            }),
        );
    }
}
