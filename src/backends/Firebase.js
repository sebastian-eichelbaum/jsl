import { initializeApp } from "firebase/app";
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    updateProfile,
    signOut,
} from "firebase/auth";

import _ from "lodash";

import { Service, ServiceError, UserService } from "../Backend";

/**
 * Firebase backend implementation for a firebase App. Create a firebase
 * project, create an app within to enable the firebase services.
 */
export class FirebaseApp extends Service {
    /**
     * Default configuration. This defines the configs that are passed to the
     * official firebase instance.
     *
     * IMPORTANT: Also check firebase.json, firestore.* and .firebaserc
     */
    static defaultConfig() {
        return {
            ...{
                // All api configs provided by firebase for an firebase app. Do not
                // think about it. Just copy it from firebase console.
                api: {
                    // Get these values from your firebase console. Add all service
                    // configs here too.
                    apiKey: "abcdefghijklmonpqrstuvwxyz",
                    projectId: "my-project-id",
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
        super(_.merge(FirebaseApp.defaultConfig(), config || {}));
    }

    /**
     * Init firebase.
     *
     * @param  args - The backend ref and more. @see Backend.init for details.
     *
     * @return {Promise} The initialization promise.
     */
    async init(...args) {
        await super.init(...args);

        this._native = initializeApp(this.config.api);
        this._markReady();
    }
}

/**
 * Provides the firebase user management as backend service
 */
export class FirebaseUserService extends UserService {
    /**
     * Default configuration
     */
    static defaultConfig() {
        return {
            ...{},
            ...UserService.defaultConfig(),
        };
    }

    /**
     * Create the backend service.
     *
     * @param {Object} config - The config as in @see Service.defaultConfig.
     *     Merged with the default.
     */
    constructor(config = {}) {
        super(_.merge(FirebaseUserService.defaultConfig(), config || {}));
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

        // Init
        this._native = getAuth(this.context.native);
        this._onLocaleUpdate();

        onAuthStateChanged(this.native, (fbUser) => {
            // On first auth update, mark the service ready
            this._markReady();

            // update the user state
            if (fbUser == null) {
                this._updateUser(UserService.defaultUser());
            } else {
                this._updateUser({
                    isLoggedIn: true,
                    uid: fbUser.uid,
                    isAnonymous: fbUser.isAnonymous || false,

                    email: fbUser.email,
                    isEmailVerified: fbUser.emailVerified || false,

                    name: fbUser.displayName,

                    lastLoginTime: fbUser.metadata.lastLoginAt || Date.now(),
                    signupTime: fbUser.metadata.createdAt,
                });
            }
            // console.log(fbUser);

            this.config.onAuthUpdate?.(this);
        });
    }

    /**
     * Get the user id of the currently authorized user. Null/undef if no user is
     * authorized.
     *
     * @return {String|undefined} The user id or nullish
     */
    get uid() {
        return this.native?.currentUser?.uid;
    }

    /**
     * Check if any user is authortized.
     *
     * @return {Boolean} true if logged in.
     */
    get isLoggedIn() {
        return this.native?.currentUser != null;
    }

    /**
     * Login using email and password. @see UserService.login.
     */
    async login(email, password) {
        const data = await super.login(email, password);

        await signInWithEmailAndPassword(this.native, data.email, data.password)
            .then((userCredential) => {
                // Load user info
            })
            .catch((error) => {
                switch (error.code) {
                    case "auth/wrong-password":
                    case "auth/invalid-email":
                    case "auth/invalid-credential":
                    case "auth/user-not-found":
                        throw new ServiceError(this, "loginInvalidCredentials", data, error);
                    case "auth/user-disabled":
                        throw new ServiceError(this, "loginUserDisabled", data, error);
                    default:
                        console.error("Unknown error", error.code);
                        throw new ServiceError(this, "loginUnknownError", data, error);
                }
            });
    }

    /**
     * Register using email and password. @see UserService.signup
     */
    async signup(email, password, name, details) {
        const data = await super.signup(email, password, name, details);

        await createUserWithEmailAndPassword(this.native, data.email, data.password)
            .then((userCredential) => updateProfile(userCredential.user, { displayName: data.name }))
            .then(() => sendEmailVerification(this.native.currentUser))
            .catch((error) => {
                switch (error.code) {
                    case "auth/email-already-in-use":
                        throw new ServiceError(this, "signupEmailInUse", data, error);
                    case "auth/invalid-email":
                    case "auth/weak-password":
                        throw new ServiceError(this, "signupInvalidCredentials", data, error);
                    default:
                        console.error("Unknown error", error);
                        throw new ServiceError(this, "signupUnknownError", data, error);
                }
            });
    }

    /**
     * Reset the user password. @see UserService.recover
     */
    async recover(email) {
        const data = await super.recover(email);

        await sendPasswordResetEmail(this.native, data.email).catch((error) => {
            switch (error.code) {
                case "auth/invalid-email":
                case "auth/user-not-found":
                    throw new ServiceError(this, "recoverUnknownUser", data, error);
                default:
                    console.error(error);
                    throw new ServiceError(this, "recoverUnknownError", data, error);
            }
        });
    }

    /**
     * Logout if logged in
     */
    async logout() {
        await super.logout();
        await signOut(this.native).catch((error) => {
            console.error(error);
            throw new ServiceError(this, "logoutUnknownError", data, error);
        });
    }

    /**
     * Use the locale as language code in firebase
     */
    _onLocaleUpdate() {
        if (this.native) {
            this.native.languageCode = this.locale;
        }
    }
}
