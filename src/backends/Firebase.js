import { initializeApp } from "firebase/app";
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    updateProfile,
    updatePassword,
    signOut,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from "firebase/auth";

import {
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc,
    Timestamp,
    initializeFirestore,
    CACHE_SIZE_UNLIMITED,
    persistentMultipleTabManager,
    persistentLocalCache,
    setDoc,
    addDoc,
} from "firebase/firestore";

import { getDownloadURL, getStorage, ref } from "firebase/storage";

import { disableNetwork } from "firebase/firestore";

import _ from "lodash";

import { Service, ServiceError, UserService, DatabaseService, StorageService } from "../Backend";
import { wait } from "../utils/Await";

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

                // Firebase uses the name "[DEFAULT]" as cache key. If multiple apps use this key with the same
                // projectID and apiKey, the cache is shared. This can lead to issues for different build versions.
                // Define some key to ensure a build uses its own cache.
                cacheId: undefined,
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
     * @return {Promise} The initialization promise.
     */
    async _init() {
        super._init();

        if (this.config.cacheId == null) {
            this._native = initializeApp(this.config.api);
        } else {
            this._native = initializeApp(this.config.api, this.config.cacheId);
        }

        this.m_nativeDB = initializeFirestore(this.context.native, {
            localCache: persistentLocalCache({
                cacheSizeBytes: CACHE_SIZE_UNLIMITED,
            }),
        });
    }

    /**
     * The native DB service
     *
     * @returns {Object} Firebase Firestore instance
     */
    get db() {
        return this.m_nativeDB;
    }
}

/**
 * Provides the firebase user management as backend service.
 * To make this work, create a DB "users". Each document is keyed by user id. Ensure read/write rules for the authorized
 * user like this:
 *
 * '''
 * // User can read/write their own entry.
 * match /users/{document} {
 *     allow read: if request.auth.uid == document;
 *     allow write: if request.auth.uid == document;
 * }
 * '''
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
     * @return {Promise} Async promise
     */
    async _init() {
        super._init();

        this._native = getAuth(this.context.native);

        this._onLocaleUpdate();

        // Create a promise that can be resolved/rejected somewhere in a callback.
        let resolve;
        const promise = new Promise((res, rej) => {
            resolve = res;
        });

        onAuthStateChanged(this.native, async (fbUser) => {
            this._handleUserUpdate(fbUser, {});

            await this._fetchUserDetails()
                .then((details) => {
                    this._handleUserUpdate(fbUser, details);
                })
                .catch((e) => {
                    // Ensure that we remove any previus info on error.
                    this._handleUserUpdate(fbUser, {});
                });

            // A bit hacky but helps to let the UI update before hiding the init overlay.
            await wait(500);

            // On first auth update, mark the service ready
            resolve();

            this._handleAuthUpdate(this);
        });

        // Do not mark the service ready. Its done during the first onAuthStateChanged
        return promise;
    }

    /**
     * Updates the user state according to the firebase user info
     *
     * @param {Object} fbUser - Native firebase user
     * @param {Object} details - Additional user details, if any.
     */
    _handleUserUpdate(fbUser, details) {
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

                roles: {
                    admin: details?.roles?.admin || false,
                },
            });
        }
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
     * Fetch user details from the users collection for the current user.
     *
     * @async
     * @returns {Promise} Resolves with the details, if any. Returns {} if no details are available
     */
    async _fetchUserDetails() {
        const db = this.context.db;

        return getDoc(doc(db, "users", this.uid))
            .then((snap) => {
                return snap.exists() ? snap.data() : {};
            })
            .catch((e) => {
                // Ignore errors
                return {};
            });
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
            .then(() => {
                return setDoc(
                    doc(this.context.db, "users", this.uid),
                    { name: data.name, email: data.email, roles: { admin: false } },
                    { merge: true },
                ).catch((e) => {
                    console.error("Cannot create user details", e);
                });
            })
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
     * Update the user name. @see UserService.updateName
     */
    async updateName(name) {
        const data = await super.updateName(name);

        await updateProfile(this.native.currentUser, {
            displayName: data.name,
        })
            .then(() => {
                this._handleUserUpdate(this.native.currentUser);
            })
            .then(() => {
                return setDoc(doc(this.context.db, "users", this.uid), { name: data.name }, { merge: true }).catch(
                    (e) => {
                        console.error("Cannot update user details", e);
                    },
                );
            })
            .catch((error) => {
                console.error(error);
                throw new ServiceError(this, "updateUnknownError", data, error);
            });
    }

    /**
     * Update the user name. @see UserService.updatePassword
     */
    async updatePassword(oldPassword, password) {
        const data = await super.updatePassword(oldPassword, password);

        const user = this.native.currentUser;
        await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, data.oldPassword))
            .then(() => updatePassword(user, data.password))
            .then(() => {
                this._handleUserUpdate(this.native.currentUser);
            })
            .catch((error) => {
                switch (error.code) {
                    case "auth/invalid-email":
                    case "auth/user-not-found":
                    case "auth/user-disabled":
                        throw new ServiceError(this, "updateUnknownUser", data, error);
                    case "auth/invalid-credential":
                        throw new ServiceError(this, "updateInvalidPassword", data, error);
                    default:
                        console.error(error);
                        throw new ServiceError(this, "updateUnknownError", data, error);
                }
            });
    }

    /**
     * Send the verification mail. @see UserService.updatePassword
     */
    async sendVerificationMail() {
        const data = await super.sendVerificationMail();

        const user = this.native.currentUser;
        sendEmailVerification(user).catch((error) => {
            console.error(error);
            throw new ServiceError(this, "updateUnknownError", data, error);
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

/**
 * The Firebase Firestore database service.
 */
export class FirestoreService extends DatabaseService {
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
        super(config);
    }

    /**
     * Initialize the service. Managed by the Backend instance.
     *
     * @return {Promise} Async promise
     */
    async _init() {
        super._init();

        this._native = this.context.db; // Setup in the context service
    }

    /**
     * Make firestore collection instance
     *
     * @param {String} name - Collection name
     * @return {Object} The handle
     */
    _makeCollection(name) {
        return collection(this.native, name);
    }

    /**
     * Make firestore collection instance
     *
     * @param {any} collection - Collection as firebase collection
     * @param {String} id - Doc id
     * @return {Object} The handle
     */
    _makeDoc(collection, id) {
        return doc(collection, id);
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
        if (typeof t === "number") {
            return Timestamp.fromMillis(t);
        }
        if (t instanceof Date) {
            return Timestamp.fromDate(t);
        }

        if (t instanceof Timestamp) {
            return t;
        }

        throw new Error("Undefined timestamp");
    }

    /**
     * Create a Firestore where filter constraint
     *
     * @param {Arra} args - The args as given to @see DatabaseService.where
     * @returns {any} - The firestore where-handle
     */
    _makeWhere(...args) {
        return where(...args);
    }

    /**
     * Implements the search functionality as described in @see DatabaseService.query
     */
    async _query(collection, queries) {
        return getDocs(query(collection, ...queries)).then((snapshot) => {
            let result = [];

            // Re-format to fullfill the return value spec of DatabaseService.query
            snapshot.forEach((doc) => {
                result.push({
                    id: doc.id,
                    data: doc.data(),
                });
            });

            return result;
        });
    }

    /**
     * Implements the getDoc functionality as described in @see DatabaseService.getDoc
     */
    async _getDoc(doc) {
        return getDoc(doc).then((snapshot) => {
            if (!snapshot.exists()) {
                return null;
            }
            return snapshot.data();
        });
    }

    /**
     * Implements the setDoc functionality as described in @see DatabaseService.setDoc
     */
    async _setDoc(doc, data) {
        return setDoc(doc, data).then(() => {
            return doc.id;
        });
    }

    /**
     * Implements the addDoc functionality as described in @see DatabaseService.addDoc
     */
    async _addDoc(collection, data) {
        return addDoc(collection, data).then((doc) => {
            return doc.id;
        });
    }
}

/**
 * The Firebase Storage service.
 */
export class FirebaseStorage extends StorageService {
    /**
     * Default configuration
     */
    static defaultConfig() {
        return {
            ...{},
            ...StorageService.defaultConfig(),
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
    }

    /**
     * Initialize the service. Managed by the Backend instance.
     *
     * @return {Promise} Async promise
     */
    async _init() {
        super._init();

        this._native = getStorage(this.context.native);
    }

    /**
     * Create a Firestore storage ref
     *
     * @param {String} path - The args as given to @see StorageService.path
     * @returns {any} - The firestore file ref handle
     */
    _makePath(path) {
        return ref(this.native, this.root + "/" + path);
    }

    /**
     * Generate the URL to load the file pointed to by path
     *
     * @param {Object} path - The path to convert - as generated by _makePath
     *
     * @return {Promise<String>} the URL
     */
    async _getUrlOfPath(path) {
        return getDownloadURL(path);
    }

    /**
     * Fetch the file from firestore storage.
     *
     * @async
     * @param {Object} path - The path handle as returned by _makePath
     * @returns {Promise<Blob>} The blob
     */
    async _fetch(path) {
        return this._getUrlOfPath(path)
            .then((url) => {
                return fetch(url);
            })
            .then((response) => {
                return response.blob();
            });
    }
}
