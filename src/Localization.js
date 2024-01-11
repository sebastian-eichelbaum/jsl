import { usePreferredLanguages } from "@vueuse/core";
import { createI18n } from "vue-i18n";

import _ from "lodash";

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
    }

    // Get an array of user-preferred locales
    get preferredLocales() {
        return usePreferredLanguages();
    }

    // Get the most user-preferred locale.
    get preferredLocale() {
        const storedLocale = localStorage.getItem("jsl.localization.locale");
        if (storedLocale != null) {
            return storedLocale;
        }
        const pref = this.preferredLocales;
        return pref[0] || "en";
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

        return this.m_vuei18n;
    }

    /**
     * Tries to translate a plural and returns the value silently if not translatable.
     *
     * @param {String} what - The translation key
     * @param {} ...args - The arguments to pass to this.tc
     */
    ttc(what, ...args) {
        if (!this.exists(what)) {
            return what;
        }

        return this.tc(what, ...args);
    }
    /**
     * Tries to translate and returns the value silently if not translatable.
     *
     * @param {String} what - The translation key
     * @param {} ...args - The arguments to pass to this.t
     */
    tt(what, ...args) {
        if (!this.exists(what)) {
            return what;
        }

        return this.t(what, ...args);
    }

    /**
     * Check if the given key exists in the given locale
     *
     * @param {String} what - The khe
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

// The localization instance
export let localization = null;

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
    return localization.vuei18n;
}
