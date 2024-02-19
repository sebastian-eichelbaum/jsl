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
     * Tries to translate and returns the value silently if not translatable.
     *
     * @param {String|Object|Translatable|TranslatedString} what - The translation key or an object {key, ...args}.
     * @param {} ...args - The arguments to pass to this.t
     */
    tt(what, ...args) {
        return this._tt(Translatable.makeFrom(what).unfolded);
    }

    /**
     * Like @see tt but expects an unfolded Translatable.
     */
    _tt(what, ...args) {
        if (!(what instanceof Translatable)) {
            throw new Error("_tt expects an Translatable");
        }

        if (!this.exists(what.key)) {
            return what.key;
        }

        if (what.count !== 1) {
            return this.tc(what.key, what.count, what.details, ...args);
        }
        return this.t(what.key, what.details, ...args);
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
 * Represents a translatable string. Its a string with added translations.
 */
export class TranslatedString {
    /**
     * Create the string using a given value.
     *
     * @param {String|Object} value - The string value or an object {ts, translations}
     * @param {Object} translations - The initially given translations. Merged as default for given translations in
     * value
     */
    constructor(value, translations = {}) {
        // Strings are consumed as strings
        if (value == null || typeof value === "string" || value instanceof String) {
            this.m_value = value || "";
            this.m_translations = translations || {};
        }
        // Copy construct a TranslatedString
        else if (value instanceof TranslatedString) {
            this.m_value = value.value;
            this.m_translations = _.merge(translations, value.translations | {});
        }
        // Objects that contain {ts} as string are translatable strings
        else if (typeof value === "object" && value.ts != null) {
            this.m_value = value.ts;
            this.m_translations = _.merge(translations, value.translations || {});
        } else if (value.toString?.() != null) {
            this.m_value = value || "";
            this.m_translations = translations || {};
        }

        // Ensure the translations are an object
        if (typeof this.m_translations !== "object") {
            console.warn("Given translations are invalid. Object expected. Got:", translations);
            this.m_translations = {};
        }
    }

    /**
     * Get the value of the string. This is the default, used if there is no translation.
     *
     * @returns {String} The untranslated string
     */
    get value() {
        return this.m_value;
    }

    /**
     * Set the untranslated string.
     *
     * @param {String} v - The new string
     */
    set value(v) {
        if (typeof v !== "string" && !(v instanceof String) && v?.toString?.() == null) {
            throw new Error("Values given to TranslatedString must be string or convertible to string.");
        }

        this.m_value = v;
    }

    /**
     * Get the translatios of this string.
     *
     * @returns {Object} An object containing a key per locale.
     */
    get translations() {
        return this.m_translations;
    }

    /**
     * Translate the string to the given locale.
     *
     * @param {String} locale - The locale to define
     * @param {String} localized - The translation
     */
    setTranslation(locale, localized) {
        this.m_translations[locale] = localized;
    }

    /**
     * Localize the string. This applies to given/current locale and returns the string in that locale.
     *
     * @param {Object} [locale] - The locale. If nullish, the current locale is used.
     * @returns {String} The translated string
     */
    localized(locale = null) {
        const loc = locale || localization.locale;
        // TODO: this does not support regional or dialect fallback (i.e. de-DE will not fall back to de)
        return this.translations?.[loc] || this.value;
    }

    /**
     * Checks if this is empty. Its empty if no base value string is defined.
     *
     * @returns {Boolean} True if no string in "value"/"ts" is defined
     */
    isEmpty() {
        return !this.value;
    }

    /**
     * Get the storable JSON version
     *
     * @return {String} this TranslatedString as JSON
     */
    get json() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * Get the storable JSON version
     *
     * @return {Object} this TranslatedString as JSON Object
     */
    toJSON() {
        return { ts: this.value, translations: this.translations };
    }
}

/**
 * Declares a class instance translatable. If the class can provide some translation id, thats enough.
 */
export class Translatable {
    /**
     * Create the translatable by giving a key and some details
     *
     * @param {String|TranslatedString} key - error code as string or anything else that can be converted to string.
     * @param {Number} count - the pluralization count
     * @param {any} details - some details. If any of the details is an Translatable, it will be converted NOW.
     */
    constructor(key, count, details = null) {
        this.m_key = key;
        this.m_count = count == null ? 1 : count;

        // Convert any provided detail to a translatable
        this.m_details = Iterate.map(details, (item) => {
            return Translatable.makeFrom(item);
        });
    }

    /**
     * Resolves a message into key and arguments, creating a new Translatable.
     *
     * @param {String|Object|Translatable|TranslatedString} what - The translation key or an object {key, ...args} or a string.
     * @param {Object} details - The message details. The keys in this overwrite any pre-existing key in a given
     *  translatable.
     * @param {Number} count - The number used for pluralization. If this is null/undefined, the singular case is used
     * for what == non-translatable. For what==Translatable, its count is used. Set the value explicitly if you need to
     * change the pluralization of a translatable,
     *
     * @return {Object} the resolved object as {key, ...}.
     *
     * @throws Error if the message is not a string and not an object with a key property.
     */
    static makeFrom(what, count = undefined, details = undefined) {
        if (what instanceof Translatable) {
            return new Translatable(what.key, count == null ? what.count : count, _.merge(what.details, details));
        }

        if (what == null || typeof what === "string" || what instanceof String || what instanceof TranslatedString) {
            return new Translatable(what || "", count, details);
        }

        const asString = what?.toString();
        if (!asString) {
            throw new Error("Translation messages must be strings, translatable, {key,...} or convertible to string.");
        }

        return new Translatable(asString, count, details);
    }

    /**
     * Generate a pluralized version of this translatable.
     *
     * @param {Number} [count] - The count. If 1, this makes the Translatable singular again.
     * @returns {Translatable} The plural version of the translatable.
     */
    plural(count = 2) {
        return Translatable.makeFrom(this, count);
    }

    /**
     * The translation id.
     *
     * @return {String|TranslatedString} id as string after being mapped by the sender's mapErrorCode
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
     * The pluralization count.
     *
     * @return {Number} Pluralization count
     */
    get count() {
        return this.m_count;
    }

    /**
     * Returns this translatable with fully unwrapped details. All previous Translatables in the details are now
     * strings, recursively.
     *
     * @return {Translatable} This with unwrapped details.
     */
    get unfolded() {
        const unfoldKey = (key) => {
            if (key instanceof TranslatedString) {
                return key.localized();
            }
            return key;
        };

        // Recurse all details. This is required as vuei18n expects strings or elemental types as details - it throws
        // when passing in Translatable although it is toString()-able
        return Translatable.makeFrom(
            unfoldKey(this.key),
            this.count,
            Iterate.mapInstancesOf(Translatable, this.details, (item) => {
                return item.toString();
            }),
        );
    }

    /**
     * Convert the translatable to an actually translated string
     */
    toString() {
        // NOTE: this manages plurals too
        return localization._tt(this.unfolded);
    }
}

// The localization instance
export let localization = null;

/**
 * Factory to make a Translatable from a given key and details. The key might be a Translatable already and will be
 * extended with the given details.
 *
 * @param {String|Object|Translatable|TranslatedString} key - The translation key as Translatable or String or string convertible.
 * @param {Object} details - The message details. The keys in this overwrite any pre-existing key in a given translatable.
 *
 * @return {Object} the resolved object as new Translatable.
 *
 * @throws Error if the message is not a string and not an object with a key property.
 */
export function tt(key, details) {
    return Translatable.makeFrom(key, undefined, details);
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
