import _ from "lodash";

/**
 * Helpers to convert and work with dates and times. Only provides some trivial conversions and tools.
 *
 * For more advanced stuff, refer to moment.js or similar libs.
 */
export class DateTime {
    /**
     * Generate a yymmdd string from a given date.
     *
     * @static
     * @param {Date} [date] - The date or now() if not specified
     * @param {String} [sep] - Separator between yy, mm, and dd
     * @returns {String} The date as string
     */
    static yymmdd(sep = "", date = new Date()) {
        if (date == null) {
            date = new Date();
        }

        const year = date.toLocaleString("default", { year: "2-digit" });
        const month = date.toLocaleString("default", { month: "2-digit" });
        const day = date.toLocaleString("default", { day: "2-digit" });

        return year + sep + month + sep + day;
    }

    /**
     * Generate a hhmmss string from a given date.
     *
     * @static
     * @param {Date} [date] - The date or now() if not specified
     * @param {String} [sep] - Separator between hh, mm, and ss
     * @returns {String} The date as string
     */
    static hhmmss(sep = "", date = new Date()) {
        if (date == null) {
            date = new Date();
        }

        const h = date.toLocaleString("default", { hour: "2-digit", hour12: false });
        const m = date.toLocaleString("default", { minute: "2-digit" });
        const s = date.toLocaleString("default", { second: "2-digit" });

        return h + sep + m + sep + s;
    }

    /**
     * Generate a dd.mm.yy - hh:mm:ss string from a given date.
     *
     * @static
     * @param {Date} [date] - The Date
     * @returns {String} The date as string
     */
    static ddmmyyhhmmss(date = new Date()) {
        if (date == null) {
            date = new Date();
        }

        const year = date.toLocaleString("default", { year: "2-digit" });
        const month = date.toLocaleString("default", { month: "2-digit" });
        const day = date.toLocaleString("default", { day: "2-digit" });

        const h = date.toLocaleString("default", { hour: "2-digit", hour12: false });
        const m = date.toLocaleString("default", { minute: "2-digit" });
        const s = date.toLocaleString("default", { second: "2-digit" });

        return year + "." + month + "." + day + " - " + h + ":" + m + ":" + s;
    }
}
