// Helpers to create avatars from user names

/**
 * Create initials for a given name.
 *
 * @param {String} name - The name to work with
 * @returns {String} Initials (first letter, first word)(first letter, last word)
 */
export function initials(name) {
    if (!name) {
        return "";
    }

    const words = name.split(" ");
    const a = words[0]?.charAt(0).toUpperCase();
    const b = words[words.length - 1]?.charAt(0).toUpperCase();

    if (!a && !b) {
        return "";
    } else if (!a) {
        return b;
    } else if (!b) {
        return a;
    }

    return a + b;
}

/**
 * Generate a CSS hsl string based on a name. The saturation and lightness control how intense the color should be. Use
 * those to tune it to your coloring style.
 *
 * @param {String} name - The name
 * @param {Number} [saturation] - The saturation in [0,100]
 * @param {[TODO:type]} [lightness] - The lightness in [0,100]
 * @returns {String} A css hsl color string
 */
export function color(name, saturation = 85, lightness = 65) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = hash % 360;
    return "hsl(" + h + ", " + saturation + "%, " + lightness + "%)";
}
