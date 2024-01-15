import _ from "lodash";
import { reactive } from "vue";

import { Translatable } from "@jsl/Localization";
import Iterate from "@jsl/utils/Iterate";
import Await from "@jsl/utils/Await";

/**
 * Service base. This provides the baseline for all Services.
 *
 * Services use a two-stage initialization. The constructor configures
 * everything, but the init function actually connects teh service itself.
 */
export class Service {
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
        this.m_config = _.merge(Service.defaultConfig(), config);
        this.m_context = null;
        this.m_ready = false;
    }

    /**
     * Get the config.
     *
     * @return {Object} The config of this service
     */
    get config() {
        return this.m_config;
    }

    /**
     * The service context, if any. This was passed in the config.
     *
     * @return {any} The context
     */
    get context() {
        return this.m_context;
    }
    /**
     * Initialize the service. Managed by the Backend instance.
     *
     * @param {any} context - The context that was provided to the backend config.
     *
     * @return {Promise} Async promise
     */
    async init(context) {
        this.m_context = context;
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
     * Triggers _onLocaleUpdate.
     *
     * @param {String} value - locale iso
     */
    set locale(value) {
        this.m_locale = value;
        this._onLocaleUpdate();
    }

    /**
     * Returns true once the service is ready. Some services get ready once they loaded any previous state.
     *
     * @return true if ready to be used.
     */
    get isReady() {
        return this.m_ready;
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

    /**
     * Called by the service implementers to mark their service ready to be used. Call this once the service is
     * configured, connected, loaded, ...
     */
    _markReady() {
        this.m_ready = true;
    }
}

/**
 * Represents an error that occured in the service. Its a string based error code and optional details.
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
        super(sender?.mapErrorCode?.(code.toString()), ServiceError.makeDetails(details, error));
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
     * @param {Object} config - The config as in @see Service.defaultConfig.
     *     Merged with the default.
     */
    constructor(config = {}) {
        super(_.merge(UserService.defaultConfig(), config || {}));

        this.m_user = reactive(UserService.defaultUser());
    }

    /**
     * Protected function to be called by implementers to notify about auth state changes.
     */
    _handleAuthUpdate() {
        this.config?.onAuthUpdate?.(this);
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
        this.m_initError = undefined;
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
     * @NOTE You should await and catch.
     *
     * @return {Promise} Async promise
     */
    async init() {
        if (this.isInitialized) {
            return;
        }

        // Init the contexts
        await Iterate.instancesOf(Service, this.config.context, async (item) => {
            await item.init();
        }).catch((error) => {
            this.m_initError = error;
            throw error;
        });

        await Iterate.instancesOf(Service, this.services, async (item) => {
            await item.init(this.config.context);
        }).catch((error) => {
            this.m_initError = error;
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
     * The backend user management.
     *
     * @return {UserBackend} The user management provider
     */
    get user() {
        return this.services?.user;
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
     * Test if the backend is ready. The backend is ready once all services (including those in the context set) are
     * ready.
     *
     * @return {Boolean} True if all services are ready.
     */
    get isReady() {
        let ready = true;
        Iterate.instancesOf(Service, this.config.context, (item) => {
            ready = ready && item.isReady;
        });
        Iterate.instancesOf(Service, this.services, (item) => {
            ready = ready && item.isReady;
        });

        return ready;
    }

    /**
     * Async helper to wait until the backend and all services are ready.
     *
     * @return {Promise} - the promise that resolves once the backend is ready.
     */
    async ready() {
        await Await.predicate(() => this.isReady);
        await new Promise((r) => {
            setTimeout(r, 500);
        });
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
