/**
 * Created by schwarzkopfb on 15/11/17.
 */

/**
 * FNV-1a hash generation init value.
 * It's exposed, because this allows user to override it.
 *
 * @type {number}
 */
hash.BASE = 0x811c9dc5

/**
 * Generates 32 bit FNV-1a hash from the given string.
 * As explained here: http://isthe.com/chongo/tech/comp/fnv/
 *
 * @param s {string} String to generate hash from.
 * @returns {number} The result integer hash.
 */
function hash(s) {
    var h = hash.BASE

    for (var i = 0, l = s.length; i < l; i++) {
        h ^= s.charCodeAt(i)
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
    }

    return h >>> 0
}

module.exports = hash
