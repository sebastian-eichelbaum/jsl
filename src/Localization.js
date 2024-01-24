import { usePreferredLanguages } from "@vueuse/core";
import { createI18n } from "vue-i18n";

import _ from "lodash";

import Iterate from "@jsl/utils/Iterate";

import { de as jslDE } from "@jsllocales/de";
import { en as jslEN } from "@jsllocales/en";

// Utilities to manage languages in your app. This is the wrapper around the
// currently used i18n implementation (i.e. vuei18n). This automatically
// registers the jsl locales for de/en.
export class Localization {
    /**
     * Create the default locale config for this class.
     *
     * @return {Object} - The default config.
     */
    static defaultLocaleConfig() {
        return {
            // Two letter ISO 639 Code
            // TODO: support our letter iso codes.
            iso: "en",
            // Name of the locale in that language
            name: "English",
            // A set of translations. Can be structured as needed.
            translations: {
                /*example: {
                    hello: "hello",
                },*/
            },
        };
    }

    /**
     * Create the default config for this class.
     *
     * @return {Object} - The default config.
     */
    static defaultConfig() {
        return {
            // The list of locales. This pre-populated with the jsl provided locales (en-US, de-DE). When adding more
            // locales that do not provide all translations, the fallback mechanism tries to find the best match.
            //
            // Uniqueness is ensured for the iso code.
            locales: [jslEN, jslDE],

            // Add overrides to the official locale list. This allows to change specific keys in a locale or extend the
            // set of translations.
            overrides: [
                /*
                {
                    // Specify the iso code of the locale to manipulate
                    iso: "de",
                    // The translation keys to add or override.
                    translations: {
                        appSpecific: {
                            cheese: "Käse",
                        },
                    },
                },
                */
            ],

            // A list of locale iso to disable.
            blacklist: [],

            // The fallback locale used if a translation is not given in any matching locale. This must be one of the
            // locales given. If not, construction throws.
            fallback: "en",

            // Handle locale changes. Usually, this is used to forward locale info to backends. The new locale iso is
            // provided.
            onLocaleUpdate: (newLocale) => {},
        };
    }

    /**
     * Construct the localization system and init with the given config.
     *
     * @param {Object} config the config as in @see defaultConfig.
     */
    constructor(config) {
        this.m_config = _.merge(Localization.defaultConfig(), config);
        this.m_vuei18n = null;
        this.m_locales = [];

        this.m_config.locales.forEach((locale) => this._registerLocale(locale));

        if (this._findLocaleInfo(this.m_config.fallback) == null) {
            throw new Error(
                'The fallback locale "' + this.m_config.fallback + '" must be present in the locales array',
                this.m_locales,
            );
        }

        this.m_config.overrides.forEach((override) => this._mergeOverride(override));
    }

    /**
     * Init localization system and trigger initial callbacks.
     *
     * @return {Promise} - The init result
     */
    async init() {
        this._makeVuei18n();
    }

    /**
     * Register the given locale to the localization system.
     *
     * Throws if the vue i18n instance was initialized already.
     * Throws if the locale iso is not unique
     *
     * @param {Object} localeInfo - The locale info. See @see
     *     Localization.defaultConfig for details.
     */
    _registerLocale(localeInfo) {
        if (this.m_vuei18n != null) {
            throw new Error("Cannot register locale after initialization.");
        }

        if (this._findLocaleInfo(localeInfo.iso) != null) {
            throw new Error('Locale "' + localeInfo.iso + '" is not unique.');
        }

        if (this.config.blacklist.includes(localeInfo.iso)) {
            return;
        }
        this.m_locales.push(_.merge(Localization.defaultLocaleConfig(), localeInfo || {}));
    }

    /**
     * Merge the given locale info as override.
     *
     * Throws if the locale is not found.
     *
     * @param {Object} localeInfo The locale to merge in.
     */
    _mergeOverride(localeInfo) {
        if (localeInfo.iso == null) {
            throw new Error("Cannot merge locale with undefined iso.", localeInfo);
        }

        if (localeInfo.translations == null) {
            throw new Error("Cannot merge locale with undefined translations.", localeInfo);
        }

        let li = this._findLocaleInfo(localeInfo.iso);
        if (li == null) {
            throw new Error('Cannot merge locale "' + localeInfo.iso + '". Not found.');
        }

        li.translations = _.merge(li.translations, localeInfo.translations);
    }

    /**
     * Get the configuration
     *
     * @return {Object} The configuration as @see defaultConfig
     */
    get config() {
        return this.m_config;
    }

    /**
     * Get the initialized vue plugin.
     *
     * @return
     */
    get vuei18n() {
        return this.m_vuei18n;
    }

    // Get the full list of locales (blacklist applied)
    get locales() {
        return this.m_locales;
    }

    // Get the locale (two letter) iso code.
    get localeIso() {
        return this._findLocaleInfo(this.locale)?.iso || "undef";
    }

    // Get the locale name of itself. I.e. "deutsch" for "de", "english" for "en",
    // ...
    get localeName() {
        return this._findLocaleInfo(this.locale)?.name || "undeflocale";
    }

    // Get the iso code of the currently selected locale
    get locale() {
        return this.m_vuei18n.global.locale;
    }

    /**
     * The number of known locales.
     *
     * @returns {Number} The number of locales known.
     */
    get numLocales() {
        return this.locales.length;
    }

    /**
     * Returns true if there are more than one locales known. Abbreviation to numLocales>1.
     *
     * @returns {Boolean} True if more than one locale is known.
     */
    get multipleLocalesSupported() {
        return this.numLocales > 1;
    }

    /**
     * Set the specified locale. If the locale is not found or invalid, the
     * fallback is used.
     *
     * @param {String} locale The locale as iso two letter or four letter code.
     */
    set locale(locale) {
        this.m_vuei18n.global.locale = this._findLocaleInfo(locale)?.iso || this.m_locales[0].iso;

        // Store as preference for next time.
        localStorage.setItem("jsl.localization.locale", this.m_vuei18n.global.locale);

        this._setHTMLLang();

        this.config.onLocaleUpdate?.(this.m_vuei18n.global.locale);
    }

    // Get an array of user-preferred locales
    get preferredLocales() {
        return usePreferredLanguages();
    }

    /**
     * Checks if the given locale exists and is not black-listed.
     *
     * @param {String} locale - The locale to check
     * @returns {Boolean} True if the locale is existing and can be used.
     */
    localeExists(locale) {
        return Boolean(this._findLocaleInfo(locale));
    }

    // Get the most user-preferred locale. Or the fallback if the locale is not known
    get preferredLocale() {
        return [
            // Candidates are:
            // A stored locale:
            localStorage.getItem("jsl.localization.locale"),
            // The ones the users browser requests
            ...this.preferredLocales.value,
            // Or the fallback
            this.m_config.fallback,
        ].find((l) => this.localeExists(l));
    }

    // Updates the HTML lang attribute.
    _setHTMLLang() {
        document.documentElement.setAttribute("lang", this.m_vuei18n.global.locale);
    }

    /**
     * Try finding the locale info for a given locale. If not found, undefined is
     * returned.
     *
     * @param {String} locale The locale to search. This matches against locale info iso.
     *
     * @return {Object} the locale info as @see defaultConfig
     */
    _findLocaleInfo(locale) {
        return this.m_locales.find((li) => {
            return li.iso == locale;
        });
    }

    /**
     * Generate a vuei18n instance for the current localization info. Keep in mind
     * that this call freezes the localization. Registering more locales will
     * trigger an exception.
     *
     * @return {Object} The vuei18n instance
     */
    _makeVuei18n() {
        if (this.m_locales.length == 0) {
            throw new Error("Cannot init localization without any registered locale.");
        }

        const messages = {};
        this.m_locales.forEach((item) => {
            messages[item.iso] = item.translations;
        });

        this.m_vuei18n = createI18n({
            locale: this.preferredLocale,
            fallbackLocale: this.m_config.fallback,
            messages: messages,
        });
        this._setHTMLLang();
        this.config.onLocaleUpdate?.(this.m_vuei18n.global.locale);

        return this.m_vuei18n;
    }

    /**
     * Tries to translate a plural and returns the value silently if not translatable.
     *
     * @param {String|Object|Translatable} what - The translation key or an object {key, ...args}.
     * @param {} ...args - The arguments to pass to this.tc
     */
    ttc(what, ...args) {
        const msg = resolve(what);

        if (!this.exists(msg.key)) {
            return msg.key;
        }

        return this.tc(msg.key, msg.details, ...args);
    }

    /**
     * Tries to translate and returns the value silently if not translatable.
     *
     * @param {String|Object|Translatable} what - The translation key or an object {key, ...args}.
     * @param {} ...args - The arguments to pass to this.t
     */
    tt(what, ...args) {
        const msg = resolve(what);

        if (!this.exists(msg.key)) {
            return msg.key;
        }

        return this.t(msg.key, msg.details, ...args);
    }

    /**
     * Check if the given key exists in the given locale
     *
     * @param {String} what - The key
     * @param {String} locale - Optional locale to check against
     */
    exists(what, locale) {
        return this.te(what, locale);
    }

    /**
     * Wrap around vue-i18n tc (translate with count/plural). All arguments are passed.
     *
     * @param ...args All arguments. Forwarded.
     */
    tc(...args) {
        return this.m_vuei18n.global.tc(...args);
    }

    /**
     * Wrap around vue-i18n t (translate). All arguments are passed.
     *
     * @param ...args All arguments. Forwarded.
     */
    t(...args) {
        return this.m_vuei18n.global.t(...args);
    }

    /**
     * Wrap around vue-i18n te (translation exists. All arguments are passed.
     *
     * @param ...args All arguments. Forwarded.
     *
     * @return true if the key exists
     */
    te(...args) {
        return this.m_vuei18n.global.te(...args);
    }
}

/**
 * Declares a class instance translatable. If the class can provide some translation id, thats enough.
 */
export class Translatable {
    /**
     * Create the translatable by giving a key and some details
     *
     * @param {String} key  - error code as string or anything else that can be converted to string.
     * @param {any} details - some details. If any of the details is an Translatable, it will be converted NOW.
     */
    constructor(key, details = null) {
        this.m_key = key;

        // Convert Translatable now as nested calls to vuei18n.t triggers an exception.
        this.m_details = Iterate.mapInstancesOf(Translatable, details, (item) => {
            return item.toString();
        });
    }

    /**
     * The translation id.
     *
     * @return {String} id as string after being mapped by the sender's mapErrorCode
     */
    get key() {
        return this.m_key;
    }

    /**
     * The optional details. Can be anything or null/undefined.
     *
     * @return {any} message details.
     */
    get details() {
        return this.m_details;
    }

    /**
     * Convert the translatable to an actually translated string
     */
    toString() {
        return localization.tt(this);
    }
}

// The localization instance
export let localization = null;

/**
 * Factory to make a Translatable from a given key and details. The key might be a Translatable already and will be
 * extended with the given details.
 *
 * @param {String|Object|Translatable} key - The translation key as Translatable or String or string convertible.
 * @param {Object} details - The message details. The keys in this overwrite any pre-existing key in a given translatable.
 *
 * @return {Object} the resolved object as new Translatable.
 *
 * @throws Error if the message is not a string and not an object with a key property.
 */
export function tt(key, details) {
    return resolve(key, details);
}

/**
 * Resolves a message into key and arguments, creating a new Translatable.
 *
 * @param {String|Object|Translatable} what - The translation key or an object {key, ...args} or a string.
 * @param {Object} details - The message details. The keys in this overwrite any pre-existing key in a given
 *  translatable.
 *
 * @return {Object} the resolved object as {key, ...}.
 *
 * @throws Error if the message is not a string and not an object with a key property.
 */
function resolve(msg, details = {}) {
    if (msg instanceof Translatable) {
        return new Translatable(msg.key, _.merge(msg.details, details));
    }

    if (msg == null || typeof msg === "string" || msg instanceof String) {
        return new Translatable(msg || "", details);
    }

    const asString = msg?.toString();
    if (!asString) {
        throw new Error("Translation messages must be strings, translatable, {key,...} or convertible to string.");
    }

    return new Translatable(asString, details);
}

/**
 * Construct the Localization singleton and return the vue plugin instance. If
 * called multiple times, this throws.
 *
 * @param {Object} config The config as in @see Localization.defaultConfig
 *
 * @return {Object} The vue plugin
 */
export function make(config) {
    if (localization != null) {
        throw new Error("Localization is instantiated already.");
    }

    localization = new Localization(config);
    return localization;
}
