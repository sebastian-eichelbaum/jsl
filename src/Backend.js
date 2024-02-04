import _ from "lodash";

import { reactive } from "vue";

import { Translatable } from "@jsl/Localization";
import Iterate from "@jsl/utils/Iterate";
import Await from "@jsl/utils/Await";

import { jslObjectAsyncInit } from "./Object";
import { Observable } from "./Observable";
import { Test } from "./Assert";

/**
 * Service base. This provides the baseline for all Services.
 *
 * Services use a two-stage initialization. The constructor configures
 * everything, but the init function actually connects teh service itself.
 */
export class Service extends jslObjectAsyncInit {
    /**
     * Default configuration
     */
    static defaultConfig() {
        return {
            // Allows to add a prefix to each error code. Very handy to map to translations easily.
            errorPrefix: "", // example: "user.msg.",
            // Allows to add a postfix to each error code. Very handy to map to translations easily.
            errorPostfix: "",
            // Allows to specify an error code mapper if needed.
            errorMap: (error) => {
                return error;
            },
        };
    }

    /**
     * Create the backend service.
     *
     * @param {Object} config - The config as in @see Service.defaultConfig.
     *     Merged with the default.
     */
    constructor(config = {}) {
        super(config);

        this.m_backend = null;
        this.m_client = null;

        this.m_requiredServices = [];
    }

    /**
     * The service context, if any. This was passed in the config.
     *
     * @return {any} The context
     */
    get context() {
        return this.backend.context;
    }

    /**
     * The backend reference that created this service.
     *
     * @returns {Backend} The backend instance.
     */
    get backend() {
        return this.m_backend;
    }

    /**
     * Get the native context if any (i.e. the SDK specific classes) - the native implementation of the thing that
     * represents the entry point to the backend service.
     *
     * @return {Object} The instantiated real backend implementation.
     */
    get native() {
        return this.m_client;
    }

    /**
     * Set the native client instance. Call this in your implementation. You can overwrite the value as some SDKs
     * compose their client in multuple steps
     *
     * @param {any} value - The client instance
     */
    set _native(value) {
        this.m_client = value;
    }

    /**
     * Initialize the service. Managed by the Backend instance.
     *
     * Do not override. Use _init in derived classes.
     *
     * @param {any} backend - The backend that manages this instance.
     *
     * @return {Promise} Async promise
     */
    async init(backend) {
        super.init();

        try {
            if (backend == null) {
                throw new Error("No backend given while initializing a service.");
            }
            this.m_backend = backend;

            // Check requirements
            this.requiredServices.forEach((req) => {
                if (this.backend.servicesByType(req).length == 0) {
                    console.error("Service requires: ", req);
                    throw new Error("Service requirements not fullfilled.");
                }
            });

            const result = await this._init(backend);

            this._initOK();
        } catch (e) {
            this._initFailed(e);
            throw e;
        }
    }

    /**
     * Implements the actual service initialization. This is the function to be overridden by deriving classes.
     *
     * @async
     *
     * @returns {Promise} The async promise
     */
    async _init() {}

    /**
     * Get the current locale used by the backend systems
     *
     * @return The locale iso
     */
    get locale() {
        return this.m_locale;
    }

    /**
     * Set the locale to use in the backend. Some backends allow to set locales for generating messages or locales.
     * Triggers _onLocaleUpdate.
     *
     * @param {String} value - locale iso
     */
    set locale(value) {
        this.m_locale = value;
        this._onLocaleUpdate();
    }

    /**
     * Get a list of service requirements. A service can depend on other services. These services are listed here. The
     * init function of the backend tests these.
     *
     * @return {Array<Service>} An array of required services
     */
    get requiredServices() {
        return this.m_requiredServices;
    }

    /**
     * Setthe list of required services. This has to be done during construction. Set this in your deriving class.
     *
     * @param {Array<Service>} value - An array of Service-derived types
     * @throws {Error} - If the value is not an array of service types
     */
    set _requiredServices(value) {
        if (!Array.isArray(value)) {
            throw new Error("Service requirements need to be an array of service types.");
        }

        this.m_requiredServices = value;
    }

    /**
     * A callback triggered when the locale of the service was changed. Override to get notified.
     */
    _onLocaleUpdate() {}

    /**
     * Make an error code that uses the user defined pre-/postfixes and error code mapper.
     *
     * @param {any} code The code, used as string
     *
     * @return {String} The error code as string including pre-/postfix
     */
    mapErrorCode(code) {
        const mappedCode = this.config.errorMap?.(code) || code;
        const prefix = this.config.errorPrefix?.toString() || "";
        const postfix = this.config.errorPostfix?.toString() || "";

        return prefix + mappedCode + postfix;
    }
}

/**
 * An throwable service error
 *
 * @extends Error
 */
export class ServiceException extends Error {
    /**
     * Create the error by giving an error code and some details
     *
     * @param {Service} service - sender service. Must not be nullish.
     * @param {String} code  - error code as string or anything else that can be converted to string.
     * @param {any} details - some details.
     * @param {any} error - An error of some type that will be added to the details as "error"
     *
     * @throws Error if the sender is not a service
     */
    constructor(service, code, details, error) {
        super("ServiceError. Guru Code: " + code);

        this.translatable = null;
        try {
            this.translatable = new ServiceError(service, code, details, error);
        } catch (e) {}

        this.message = this.translatable ? this.translatable.toString() : this.message;
        this.details = details;
        this.cause = error;
    }
}

/**
 * Represents an error that occured in the service. Its a string based error code and optional details.
 *
 * @NOTE: this is not an exception type. Its a translatable error message.
 */
export class ServiceError extends Translatable {
    /**
     * Tries to buidl a detail struct that includes the given error if it provides a code or can convert to string.
     * It adds the key "error" to the detail struct.
     *
     * @param {Object} details The struct to extend
     * @param {any} error the error to inject
     *
     * @return {...detail, {error: SeeAbove}}
     */
    static makeDetails(details, error) {
        if (!error) {
            return details;
        }

        if (error.code != null) {
            return { ...details, ...{ error: error.code.toString?.() || "unknown" } };
        }

        return { ...details, ...{ error: error.toString?.() || "unknown" } };
    }

    /**
     * Create the error by giving an error code and some details
     *
     * @param {Service} service - sender service. Must not be nullish.
     * @param {String} code  - error code as string or anything else that can be converted to string.
     * @param {any} details - some details.
     * @param {any} error - An error of some type that will be added to the details as "error"
     *
     * @throws Error if the sender is not a service
     */
    constructor(sender, code, details = null, error = null) {
        super(sender?.mapErrorCode?.(code.toString()), 1, ServiceError.makeDetails(details, error));
        if (!(sender instanceof Service)) {
            throw new Error("Given sender is not a service.");
        }

        this.m_sender = sender;
        this.m_rawCode = code;
    }

    /**
     * The sender.
     *
     * @return {Sender}  the sender
     */
    get sender() {
        return this.m_sender;
    }

    /**
     * The code as string.
     *
     * @return {String} code as string without service error mapping (prefix,map as defined in the service config)
     */
    get rawCode() {
        return this.m_rawCode;
    }

    /**
     * The code as string.
     *
     * @return {String} code as string after service error mapping (prefix,map as defined in the service config)
     */
    get code() {
        return super.tid;
    }

    /**
     * The optional details. Can be anything or null/undefined.
     *
     * @return {any} Error details.
     */
    get details() {
        return this.m_details;
    }
}

/**
 * Provides common user management functionality.
 */
export class UserService extends Service {
    /**
     * Default configuration
     */
    static defaultConfig() {
        return {
            ...{
                // Called whenever the authorization state for a user changes. The UserService instance is passed as
                // context
                onAuthUpdate: (userService) => {},
            },
            ...Service.defaultConfig(),
        };
    }

    /**
     * A user in UserService provides this interface by default. Specific services might add more info.
     */
    static defaultUser() {
        return {
            // Boolean being true if the user is logged in. If this is false, all other information are either empty or
            // undefined.
            isLoggedIn: false,

            // The UID. This is unique and should be used to key the user.
            uid: undefined,

            // Some providers allow anonymous users. If this is true, this user is anonymous. The Only valid value is
            // UID. After sign up, the UID stays the same and the other info will be available.
            isAnonymous: false,

            // User mail address
            email: undefined,
            // Is the mail address verified?
            isEmailVerified: false,

            // A name that the user has provided
            name: undefined,
            // If the auth provider delivers some photo URL, this will be in here.
            photoUrl: undefined,

            // Unix Timestamp of last login
            lastLoginTime: undefined,
            // Unix Timestamp of a user's signup.
            signupTime: undefined,
        };
    }

    /**
     * Create the backend service.
     *
     * @param {Object} config - The config as in @see UserService.defaultConfig.
     *     Merged with the default.
     */
    constructor(config = {}) {
        super(_.merge(UserService.defaultConfig(), config || {}));

        this.m_user = reactive(UserService.defaultUser());
        this.m_authUpdateObsrvable = Observable.make();
    }

    /**
     * Protected function to be called by implementers to notify about auth state changes.
     */
    _handleAuthUpdate() {
        // Listener from config
        this.config?.onAuthUpdate?.(this);

        // Additional listeners
        this.m_authUpdateObsrvable.notify(this);
    }

    /**
     * An observable that is called whenever the auth state changes.
     *
     * @returns {Observable} The observable to subscribe to.
     */
    /**
     * An observable that is called whenever the auth state changes.
     *
     * @param {Function} [callback] - The function or nullish to just get the observable
     * @returns {Observable} the observable
     */
    onAuthUpdate(callback = null) {
        return this.m_authUpdateObsrvable.observable.subscribe(callback);
    }

    /**
     * Get the user id of the currently authorized user. Null/undef if no user is
     * authorized.
     *
     * @return {String|undefined} The user id or nullish
     */
    get uid() {
        throw new Error("Abstract base member called.");
    }

    /**
     * Check if any user is authortized.
     *
     * @return {Boolean} true if logged in.
     */
    get isLoggedIn() {
        throw new Error("Abstract base member called.");
    }

    /**
     * Returns the current user state info as structured in @see UserService.defaultUser.
     *
     * @return {Object} The user info as reactive value.
     */
    get user() {
        return this.m_user;
    }

    /**
     * Called from a derived class whenever the user data has changed. This updates the reactive UserService.user
     * value accordingly.
     *
     * @param {Object} newUserData - new user data as in @see defaultUser
     */
    _updateUser(newUserData) {
        const usr = _.merge(UserService.defaultUser(), newUserData);

        // Setting the new values via "=" would set new refs for all nested props which breaks reactivity.
        Object.assign(this.m_user, usr);
    }

    /**
     * Login using email and password.
     *
     * @param {String} email The email. Will be trimmed before use.
     * @param {String} password The password.
     *
     * @return {Promise} Is successfull or throws ServiceError.
     */
    async login(email, password) {
        if (!email?.trim() || !password) {
            throw new ServiceError(this, "loginInvalidCredentials", { email, password });
        }

        return { email: email.trim(), password };
    }

    /**
     * Signup using email and password.
     *
     * @param {String} email The email. Will be trimmed before use.
     * @param {String} password The password.
     * @param {String} name A display nake for that user. Must not be empty.
     * @param {Object} details Additonal user details. Must be a plain object like {age: 33, company: "Company"}. Unvalidated.
     *
     * @return {Promise} Is successfull or throws ServiceError.
     */
    async signup(email, password, name, details = {}) {
        if (!email?.trim() || !password || !name?.trim()) {
            throw new ServiceError(this, "signupInvalidCredentials", { email, password, name, details });
        }

        return { email: email.trim(), password, name: name.trim(), dateOfSignup: Date.now(), details };
    }

    /**
     * Reset a user password.
     *
     * @param {String} email The email. Will be trimmed before use.
     *
     * @return {Promise} Is successfull or throws ServiceError.
     */
    async recover(email) {
        if (!email?.trim()) {
            throw new ServiceError(this, "recoverInvalidCredentials", { email });
        }

        return { email: email.trim() };
    }

    /**
     * Logout the current user.
     *
     * @return {Promise} Is successfull or throws ServiceError
     */
    async logout() {
        return {};
    }
}

/**
 * Example Service. Use as template for your Service.
 */
export class ExampleService extends Service {
    /**
     * Default configuration
     */
    static defaultConfig() {
        return {
            ...{
                // ?
            },
            ...Service.defaultConfig(),
        };
    }

    /**
     * Create the backend service.
     *
     * @param {Object} config - The config as in @see DatabaseService.defaultConfig.
     *     Merged with the default.
     */
    constructor(config = {}) {
        super(_.merge(ExampleService.defaultConfig(), config || {}));
        // The service config allows you to define requirements that are tested during init.
        // You should add them here instead of in the defaultConfig as it could be overridden by a user:
        this._requiredServices = [
            // DatabaseService
            // UserService
            // ...
        ];
    }

    /**
     * Initialize the service. Managed by the Backend instance.
     *
     * @return {Promise} Async promise
     */
    async _init() {
        // Called by Service.init.
    }
}

/**
 * Represents an API specific handle to something.
 */
export class NativeHandle {
    /**
     * Create the handle to a native API thing
     *
     * @param {any} handle - some arbitrary handle type
     */
    constructor(handle) {
        this.m_handle = handle;
    }

    /**
     * The API handler. You should not use or care about this. This is solely used by service
     * implementers
     *
     * @returns {any} Some handle
     */
    get handle() {
        return this.m_handle;
    }
}

/**
 * Represents an API specific handle to a collection.
 */
export class CollectionHandle extends NativeHandle {}

/**
 * Represents an API specific handle to a document (entry in a collection).
 */
export class DocumentHandle extends NativeHandle {}

/**
 * Represents an API specific handle to a query/filter.
 */
export class QueryHandle extends NativeHandle {}

/**
 * Represents an API specific timestamp.
 */
export class TimestampHandle extends NativeHandle {}

/**
 * Provides common DB functionality.
 */
export class DatabaseService extends Service {
    /**
     * Default configuration
     */
    static defaultConfig() {
        return {
            ...{
                // ?
            },
            ...Service.defaultConfig(),
        };
    }

    /**
     * Create the backend service.
     *
     * @param {Object} config - The config as in @see DatabaseService.defaultConfig.
     *     Merged with the default.
     */
    constructor(config = {}) {
        super(_.merge(DatabaseService.defaultConfig(), config || {}));
    }

    /**
     * The set of options that are supported for searching a collection by all backends.
     *
     * @returns {Object} default search options
     */
    static defaultSearchOptions() {
        return {
            // Limit the search results.
            limit: 100,
        };
    }

    /**
     * Create a backend-provider-specific handle for a collection. Some services only use strings, others require to
     * build an collection wrapper first. Create before using any of the search/query calls.
     *
     * @param {Object} name - A collection name.
     * @returns {CollectionHandle} API dependend collection handle
     */
    collection(name) {
        if (!Test.isNonEmptyStringOrInstanceOf(name, CollectionHandle)) {
            throw new Error("Collection must be given as CollectionHandle or non-empty string");
        }

        if (name instanceof CollectionHandle) {
            return name;
        }
        return new CollectionHandle(this._makeCollection(name));
    }

    /**
     * Create a backend-provider-specific handle for a document.
     *
     * @param {CollectionHandle|String} collection - A collection.
     * @param {String} id - The document ID.
     *
     * @returns {DocumentHandle} API dependend collection handle
     */
    doc(collection, id) {
        if (!Test.isNonEmptyStringOrInstanceOf(collection, CollectionHandle)) {
            throw new Error("Collection must be given as CollectionHandle or non-empty string");
        }
        if (!Test.isNonEmptyString(id)) {
            throw new Error("Document id must be given as non-empty string");
        }

        return new DocumentHandle(this._makeDoc(this.collection(collection).handle, id));
    }

    /**
     * Create a native timestamp.
     *
     * @param {any|TimestampHandle|Date|Number} t - Some timestamp-y thing that can be interpreted. Numbers are
     * interpeted as unix timestamp
     * @returns {TimestampHandle} the native handle
     */
    timestamp(t) {
        if (t instanceof TimestampHandle) {
            return t;
        }

        return new TimestampHandle(this._makeTimestamp(t));
    }

    /**
     * Search a given collection for anything that contains any of the given words. This is perfect for fuzzy matching
     * in a collection based on a set of words.
     *
     * @async
     * @param {String|CollectionHandle} collection - The collection name to search in
     * @param {Array<String>} fields - A set of fields to search in, at least one
     * @param {Array<String>} words - A set of words to search in the fields using case-insensitive matching. At least
     * one.
     * @param {Object} [options] - The search options as defined in @see defaultSearchOptions
     *
     * @returns {Promise<Array<Object>>} The results as list of objects
     */
    async search(collection, fields, words, options = {}) {
        if (
            !(
                typeof collection === "string" ||
                collection instanceof String ||
                collection instanceof CollectionHandle
            ) ||
            !collection
        ) {
            throw new Error("Collection must be given as string or CollectionHandle");
        }
        if (!Array.isArray(fields) || fields.length < 1) {
            throw new Error("Fields must be given as non-empty array");
        }
        if (!Array.isArray(words) || words.length < 1) {
            throw new Error("Words must be given as non-empty array");
        }

        return this._search(
            this.collection(collection).handle,
            fields,
            words,
            _.merge(DatabaseService.defaultSearchOptions(), options || {}),
        );
    }

    /**
     * Query a collection using a given query. Queries can be constructed using where,and,or,...
     *
     * @NOTE: this is just a subset of what each specific DB api can do. It is perfect to build simple queries but lacks
     * some of the advanced features your API (like firestore, supabase, directus, ...) can do. Thos specific features
     * often improve performance or cause less query-costs. Use @queryNative to utilize API specific queries.
     *
     * @WARN: Some API have limitations that others do not have. Check your backend API doc for details.
     *
     * @async
     * @param {CollectionHandle|String} collection - The collection to search
     * @param {Array<QueryHandle>} queries - The acutal list of queries - will be combined with AND
     * @throws {Error} - Validation errors.
     * @returns {Promise<Array>} The result data as Array of {id, data}.
     */
    async query(collection, ...queries) {
        if (
            !(
                typeof collection === "string" ||
                collection instanceof String ||
                collection instanceof CollectionHandle
            ) ||
            !collection
        ) {
            throw new Error("Collection must be given as string or CollectionHandle");
        }

        if (queries.length == 0) {
            throw new Error("Collection query must not be null");
        }

        if (!Test.arrayOnlyContainsInstancesOf(queries, QueryHandle)) {
            throw new Error("Collection queries must be QueryHandle");
        }

        return this._query(
            this.collection(collection).handle,
            Array.from(queries, (q) => q.handle),
        );
    }

    /**
     * Create a document from the DB
     *
     * @async
     * @param {DocumentHandle|CollectionHandle|String} collectionOrDocument - A collection as CollectionHandle or String
     * or a document as DocumentHandle
     * @param {String} [id] - If collectionOrDocument is not a DocumentHandle, use this as ID in the collection
     * @returns {Promise<Object>} The document or null if it does not exists
     */
    async getDoc(collectionOrDocument, id = null) {
        if (collectionOrDocument instanceof DocumentHandle) {
            return this._getDoc(collectionOrDocument.handle);
        }

        // If it is a string or CollectionHandle, use it and fetch the doc
        if (Test.isNonEmptyStringOrInstanceOf(collectionOrDocument, CollectionHandle)) {
            return this._getDoc(this.doc(this.collection(collectionOrDocument), id).handle);
        }

        throw new Error("Cannot retireve document. No collection or document given.");
    }

    /**
     * Generate a query constraint that filters by field matching a value using a given operator. This wraps around the
     * native operation. It is only a handle and cannot be used directly.
     *
     * @param {String} field - The field to match agains
     * @param {String} op - The operator to use. One of "==,!=,<=,>=,<,>"
     * @param {String|Array} value - A value. Depending on the operator, this is a string or an array of strings.
     *
     * @return {QueryHandle} Some API specific wrapper.
     */
    where(field, op, value) {
        if (!(typeof field === "string" || field instanceof String) || !field) {
            throw new Error("Where-query field must be a non-empty string");
        }
        if (!(typeof op === "string" || op instanceof String) || !op) {
            throw new Error("Where-query op must be a non-empty string");
        }

        if (!(typeof value === "string" || value instanceof String || Array.isArray(value))) {
            throw new Error("Where-query value must be a string or an array.");
        }

        // Override and return something usefull.
        return new QueryHandle(this._makeWhere(field, op, value));
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Protected interface - implemented by the API specific service
    //

    /**
     * Create an API specific collection handle
     *
     * @param {String} name - The collection name
     * @throws {Error} - If not implemented by the specific service
     *
     * @return {any} The API specific thing that represents a collection
     */
    _makeCollection(name) {
        throw new Error("Abstract function called.");
    }

    /**
     * Create an API specific document handle
     *
     * @param {String} id - The document id
     * @throws {Error} - If not implemented by the specific service
     *
     * @return {any} The API specific thing that represents a doc
     */
    _makeDoc(id) {
        throw new Error("Abstract function called.");
    }

    /**
     * Create an API specific document handle
     *
     * @param {Date|Number|any} t - The timestamp as JS date, unix time (if number) or something else, up to you to
     * interpret. Probably your own handle type.
     * @throws {Error} - If not implemented by the specific service
     *
     * @return {any} The API specific thing that represents a doc
     */
    _makeTimestamp(t) {
        throw new Error("Abstract function called.");
    }

    /**
     * Make the API specific "where" query handle
     *
     * @param {any} args - The args as given to @see DatabaseService.where
     *
     * @return {QnyueryHandle} The API specific thing that represents a where-query constraint
     */
    _makeWhere(...args) {
        throw new Error("Abstract function called.");
    }

    /**
     * Implements the search functionality as described in @see DatabaseService.search.
     *
     * @async
     * @param {any} args - The args passed to @see DatabaseService.search - The collection is your native handle
     * @throws {Error} - If unimplemented
     * @returns {Promise<Array>} The array of matches. The array is {...fields}
     */
    async _search(...args) {
        throw new Error("Abstract function called.");
    }

    /**
     * Implements the search functionality as described in @see DatabaseService.query.
     *
     * @async
     * @param {any} args - The args passed to @see DatabaseService.query - The collection is your native handle
     * @throws {Error} - If unimplemented
     * @returns {Promise<Array>} The array of matches. The array is {id, data}
     */
    async _query(...args) {
        throw new Error("Abstract function called.");
    }

    /**
     * Implements the fetch functionality as described in @see DatabaseService.getDoc.
     *
     * @async
     * @param {any} args - The args passed to @see DatabaseService.getDoc - The doc cis your native handle
     * @throws {Error} - If unimplemented
     * @returns {Promise<Object>} The document. MUST return null if the doc does not exists.
     */
    async _getDoc(...args) {
        throw new Error("Abstract function called.");
    }
}

/**
 * Represents an API specific file path in storage.
 */
export class StoragePathHandle extends NativeHandle {}

/**
 * Provides data storage facilities.
 */
export class StorageService extends Service {
    /**
     * Default configuration
     */
    static defaultConfig() {
        return {
            ...{},
            ...Service.defaultConfig(),
        };
    }

    /**
     * Create the backend service.
     *
     * @param {Object} config - The config as in @see StorageService.defaultConfig.
     *     Merged with the default.
     */
    constructor(config = {}) {
        super(_.merge(StorageService.defaultConfig(), config || {}));
    }

    /**
     * Create a backend-provider-specific handle for a path in storage. Some services only use strings, others require to
     * build an path wrapper first. Create before using any of the calls.
     *
     * @param {Object} path - A path name.
     * @returns {StoragePathHandle} API dependend path handle
     */
    path(path) {
        if (!Test.isNonEmptyStringOrInstanceOf(path, StoragePathHandle)) {
            throw new Error("Storage paths must be given as StoragePathHandle or non-empty string");
        }

        if (path instanceof StoragePathHandle) {
            return path;
        }
        return new StoragePathHandle(this._makePath(path));
    }

    /**
     * Create the URL that points to the file to load.
     *
     * @async
     * @param {StoragePathHandle|String} path - The path to get the URL for
     * @returns {Promise<String>} The url
     */
    async getUrlOfPath(path) {
        return this._getUrlOfPath(this.path(path).handle);
    }

    /**
     * Create an API specific path/file handle
     *
     * @param {String} path - The path
     * @throws {Error} - If not implemented by the specific service
     *
     * @return {any} The API specific thing that represents a path
     */
    _makePath(path) {
        throw new Error("Abstract function called.");
    }

    /**
     * Generate the URL to load the file pointed to by path
     *
     * @param {Object} path - The path to convert - as generated by _makePath
     *
     * @return {Promise<String>} the URL
     */
    async _getUrlOfPath(path) {
        throw new Error("Abstract function called.");
    }
}

// A wrapper around common backend tasks.
export class Backend {
    /**
     * Default configuration
     */
    static defaultConfig() {
        return {
            // Most services require a already initialized instance for that
            // particular service provider. I.e. Firebase needs a configured
            // firebase instance before any service can be used. Pass these
            // things here. There are no restriction or checks on that value.
            // It gets passed as is to the init functions of each Service
            // implementation.
            //
            // IF this is an Service instance, or an array that contains some
            // Service instance, their async init functions are called by the
            // backend before initialization of all other services.
            context: null /* new Firebase({ apiKey: "abcd-efgh-...", ... }) */,

            // The set of services to use. This is an object representing named
            // Service implementations. Some reserved names map to some
            // convenient getters but restrict on the matching service class:
            //  - "user" maps to "get Backend.user()", requires to be a UserService
            //  instance
            services: {
                // Provide a user backend. Set and init the Service instance
                // accordingly. user: new FirebaseUserService({
                // }),
            },

            // Default locale to use if no other locale was set
            locale: "en",

            // Frameworks like VUE require that things they listen to are wrapped by some proxy. This function is used
            // by services to make their own state reactive, so that the consuming framework can listen to changes.
            //makeReactiveState: (state)=>{return state}
        };
    }

    /**
     * Create the backend wrapper and the actual backend implementation instances.
     *
     * Throws if a service is not matching a required type.
     *
     * @param {Object} config - The config as in @see Backend.defaultConfig.
     *     Merged with the default.
     */
    constructor(config = {}) {
        this.m_config = _.merge(Backend.defaultConfig(), config);
        this.m_isInitialized = false;

        if (typeof this.services !== "object") {
            throw new Error("Backend config got a service config that is not an object.");
        }

        if (this.user && !(this.user instanceof UserService)) {
            throw new Error("Backend config added a user service which is not an instance of UserService.");
        }
    }

    /**
     * Get the config.
     *
     * @return {Object} The config of this backend
     */
    get config() {
        return this.m_config;
    }

    /**
     * Initialize all requested services. Must be called before using any service. Once run, isInitialized will return
     * true.
     *
     * @NOTE You should await and catch. If this succeeded, the backends are ready.
     *
     * @return {Promise} Async promise
     */
    async init() {
        if (this.m_isInitialized) {
            return;
        }
        this.m_isInitialized = true;

        // Init the contexts
        await Iterate.instancesOfAsync(Service, this.config.context, async (item) => {
            await item.init(this);
        }).catch((error) => {
            //console.error("Backend context init error", error);
            throw error;
        });

        await Iterate.instancesOfAsync(Service, this.services, async (item) => {
            await item.init(this);
        }).catch((error) => {
            //console.error("Backend service init error", error);
            throw error;
        });
    }

    /**
     * The backend services as object containing each service by name.
     *
     * @return {Object} The services
     */
    get services() {
        return this.config?.services;
    }

    /**
     * The backend services filtered by type.
     *
     * @param {Type} type - The type. Any Service derived type
     * @returns {Array<Service>} The services as array.
     */
    servicesByType(type) {
        return Iterate.instancesOf(type, this.services);
    }

    /**
     * The backend services filtered by type, the first match is returned.
     *
     * @param {Type} type - The type. Any Service derived type
     * @param {String} multipleMsg - if multiple instances match, print this warning to the console.
     *
     * @returns {Service} The first matching service
     */
    serviceByType(type, multipleMsg = null) {
        const srv = this.servicesByType(type);
        if (srv.length == 0) {
            return null;
        }
        if (srv.length > 1 && multipleMsg != null) {
            console.warn(multipleMsg);
        }
        return srv[0];
    }

    /**
     * The backend user management.
     *
     * @return {UserBackend} The user management provider
     */
    get user() {
        return this.services?.user;
    }

    /**
     * The backend database service, if any.
     *
     * @returns {DatabaseService} The service or null
     */
    get database() {
        return this.services?.database;
    }

    /**
     * Get the current locale used by the backend systems
     *
     * @return The locale iso
     */
    get locale() {
        return this.m_locale;
    }

    /**
     * Set the locale to use in the backend. Some backends allow to set locales for generating messages or locales.
     *
     * @param {String} value - locale iso
     */
    set locale(value) {
        this.m_locale = value;

        // Push to Service contexts
        Iterate.instancesOf(Service, this.config.context, (item) => {
            item.locale = this.locale;
        });

        // Push to all services
        Iterate.instancesOf(Service, this.services, (item) => {
            item.locale = this.locale;
        });
    }

    /**
     * Get the native context if any (i.e. DirectusClient, FirebaseApp, ....) - the native implementation of the thing that
     * represents the entry point to the backend service.
     *
     * @return {Object} The instantiated real backend implementation. For example, the firebase app as provided by
     * google, the directus client as provided by their sdk, ....
     */
    get native() {
        return this.m_config.context.native;
    }

    /**
     * The context that was given while constructing the backend.
     *
     * @returns {any} The context or undefined/null
     */
    get context() {
        return this.config.context;
    }
}

// The backend instance
export let backend = null;

/**
 * Construct the Backend singleton and return the instance. If called multiple
 * times, this throws.
 *
 * @note The instance is not initialized. Call await init somewhere.
 *
 * @param {Object} config The config as in @see Backend.defaultConfig
 *
 * @return {Object} The backend wrapper
 */
export function make(config) {
    if (backend != null) {
        throw new Error("Backend is instantiated already.");
    }

    backend = new Backend(config);
    return backend;
}
