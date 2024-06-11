import { vuetify } from "jsl/Vuetify";
import { useJslStyle } from "jsl/Vuetify";

import _ from "lodash";
import { computed } from "vue";
import colorPalette from "vuetify/lib/util/colors";
import { classToHex, isCssColor, parseColor, RGBtoCSS } from "vuetify/lib/util/colorUtils";

/**
 * Adds some utility helpers to RGBA color tuples.
 *
 * @param rgba
 *
 * @return
 */
function addRGBAHelpers(rgba) {
    rgba["toCSS"] = () => {
        return RGBtoCSS(rgba);
    };
    rgba["alphaScale"] = (value) => {
        rgba.a = rgba.a * value;
        return rgba;
    };
    return rgba;
}

function isThemeColor(color, theme) {
    return theme[color];
}

/**
 * Resolve a given color string into rgba tuple. It supports css style colors, vuetify color names, manually added
 * vuetify color names, jsl color names.
 *
 * @param {String|Object} color - A color by name (the vuetify colors like 'red
 *     darken-1' or 'primary'), a Hex or css
 * color like "rgba(255,0,255,1)" or an object {r,g,b} or {r,g,b,a}.
 *
 * @param {String} themeColors - The theme to use. If undefined, the current
 *     theme is used.
 *
 * @return {Object} - an RGBA tuple representing the color. Its, toString
 *     converts to CSS rgab
 */
export function resolveColor(color, themeColors = null) {
    const th = themeColors || vuetify.themeColors;
    let resolveColor = color;

    // Resolve colors starting with "jsl."
    if (resolveColor.startsWith("jsl.")) {
        resolveColor = vuetify.themeConfig?.jsl[resolveColor.replace(/^(jsl\.)/, "")];
        if (!resolveColor) {
            console.error("Try to resolve unset jsl color:", color);
            resolveColor = "grey";
        }
    }

    // Explicitly resolve those colors that are unknown by vuetify but got added to its color scheme. classToHex does not
    // resolve them - we have to do it.
    if (th[resolveColor]) {
        resolveColor = th[resolveColor];
    }

    const c = parseColor(isCssColor(resolveColor) ? resolveColor : classToHex(resolveColor, colorPalette, th));
    const rgba = addRGBAHelpers(_.merge({ r: 0, g: 0, b: 0, a: 1 }, c));

    // console.log(color, rgba);
    return rgba;
}

/**
 * Generate a CSS background style. This takes a color and uses alpha to make it
 * transparent. Then, a backgrop-filter is applied: blur and brightness. Using
 * those, most nice background effects can be achieved.
 *
 * To darken a background, set alpha to 0, brightness to the designed values.
 * To blur a background, set alpha to <1, and a blur value.
 *
 * @param {String|Object} color - The color as supported by @see resolveColor
 * @param {Number} alpha - An alpha value to scale the color alpha with.
 *     Unclamped.
 * @param {Number} brightness - The brightness. Values below 1 darken a
 *     background, values above 1 brighten it.
 * @param {Number} blur - A blur filter size in PX.
 *
 * @return {String} A css style
 */
export function makeBackgroundStyle(color, alpha, brightness, blur) {
    let blurWithUnit = blur;
    if (!isNaN(blur) && !isNaN(parseFloat(blur))) {
        blurWithUnit += "px";
    }

    return (
        "background-color: " +
        resolveColor(color).alphaScale(alpha).toCSS() +
        " !important;" +
        "backdrop-filter: blur(" +
        blurWithUnit +
        ") brightness(" +
        brightness +
        "); " +
        "transition-property: backdrop-filter, background-color;" +
        "transition-duration: 0.5s;"
    );
}

/**
 * Generate a prop name from a prefix and name. If a prefix is defined, the
 * first letter of name is capitalized to generate proper camel-case.
 *
 * @param {String} prefix - Prefix or nullish
 * @param {String} name - name to append.
 *
 * @return {String} A prop "prefixName" or "name" if prefix is empty.
 */
function makePropName(prefix, name) {
    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    return prefix ? prefix + capitalize(name) : name;
}

/**
 * Generates a computed reactive value that represents a background style from a list of props. Make sure these
 * properties with the same prefix exists. The easiest way is to use makeBackgroundStyleProps.
 *
 * @param {String} prefix - The prefix used for the props.
 * @param {String} props - The properties. The list you got with your component instance.
 *
 * @return {Object} The vue computed prop
 *
 * @NOTE You cannot use this function directly in a template. Always define a local variable that takes the result. Use
 * the local var in the template via ':style="style"' Define via 'const style = computedBackgroundStyle(props);'
 */
export function computedBackgroundStyle(props, prefix) {
    return computed(() =>
        makeBackgroundStyle(
            props[makePropName(prefix, "color")] ?? "#FF0000",
            props[makePropName(prefix, "alpha")] ?? "1",
            props[makePropName(prefix, "brightness")] ?? "1",
            props[makePropName(prefix, "blur")] ?? "0",
        ),
    );
}

/**
 * Generate background definition props with a given prefix.
 *
 * @param {String} prefix - The prefix to prepend to each prop name - recommended as a lot of props are generated,
 * @param {Object} defaults - An object with {color, blur, brightness, alpha} values to use as default
 *
 * @return {Object} - an object containing the prop definitions
 */
export function makeBackgroundStyleProps(prefix, defaults = {}) {
    let props = {};
    props[makePropName(prefix, "color")] = { default: defaults.color ?? "#000000" };
    props[makePropName(prefix, "alpha")] = { type: [String, Number], default: defaults.alpha ?? "0" };
    props[makePropName(prefix, "brightness")] = { type: [String, Number], default: defaults.brightness ?? "1" };
    props[makePropName(prefix, "blur")] = { type: [String, Number], default: defaults.blur ?? "0" };

    return props;
}

/**
 * Create a value that matches either the property value if explicitly given, the default from the current
 * style or a default.
 *
 * @param {String} styleId - An id to search in the vuetify.themeConfig.jsl.style
 * @param {Object} prop - If this property is given and not null, it is used as is.
 * @param {any} def - If nothing else provides a value, use this. Forwarded as is.

 * @returns {any} The derived property or some preset
 */
export function styleDefaultProp(styleId, prop, def = undefined) {
    return computed(() => {
        if (prop != null) {
            return prop;
        }
        if (styleId == null || useJslStyle() == null) {
            return def;
        }

        const getIn = (value, key) => {
            let v = value;
            for (const k of key.split(".")) {
                v = v[k];
                if (v == null) {
                    return undefined;
                }
            }

            return v;
        };

        const result = getIn(useJslStyle(), styleId);
        // console.log(result);
        return result;
    });
}
