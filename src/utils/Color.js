/**
 * Convert a given 6-letter hex color to a rgba(r,g,b,a) css string.
 *
 * @param {String} hex The hex color as #AABBCC
 * @param {Number} alpha The alpha to use
 *
 * @return {String} The CSS compatible rgba(...) as string.
 *
 * NOTE: This only works for #+6-letter hex colors. Not validated.
 */
export function hexToCssRGBA(hex, alpha = 1.0) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    r = isNaN(r) ? 0 : r;
    g = isNaN(g) ? 0 : g;
    b = isNaN(b) ? 0 : b;

    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
}
