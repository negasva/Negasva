/**
 * Static Printful variant catalog generated from the store's sync_variants.
 *
 * Maps productKey → optionSignature → Printful variant_id.
 * The option signature is built by joining the selected option group values
 * in the order they are declared in lib/pricing/products.ts (same logic as
 * optionSignature() in lib/printful.ts).
 *
 * Used as a fallback when the PRINTFUL_VARIANT_MAP env var is not set.
 * To override any entry, set PRINTFUL_VARIANT_MAP in your environment.
 *
 * Products sourced from Printful sync:
 *   444441039  Unisex Tshirt      (Gildan 64000)
 *   444464136  Unisex Hoodie      (Cotton Heritage M2580)
 *   444463529  White glossy mug   (Mug 11/15/20 oz)
 *   444443585  Canvas             (Stretched canvas)
 *   444463719  Framed poster      (Wood frame)
 */

// variant_id map: productKey → { "sig1/sig2/...": variantId } | variantId
export const PRINTFUL_VARIANT_CATALOG: Record<string, number | Record<string, number>> = {

  // ── Mug (signature: size) ──────────────────────────────────────────────────
  mug: {
    '11 oz': 1320,
    '15 oz': 4830,
    '20 oz': 16586,
  },

  // ── T-shirt (signature: size/color) ───────────────────────────────────────
  // Printful product 444441039 — Gildan 64000 Unisex Softstyle T-Shirt
  tshirt: {
    'S/White':        11576,
    'M/White':        11577,
    'L/White':        11578,
    'XL/White':       11579,
    '2XL/White':      11580,
    '3XL/White':      12650,
    '4XL/White':      12651,
    '5XL/White':      12652,

    'S/Black':        11546,
    'M/Black':        11547,
    'L/Black':        11548,
    'XL/Black':       11549,
    '2XL/Black':      11550,
    '3XL/Black':      12644,
    '4XL/Black':      12645,
    '5XL/Black':      12646,

    'S/Navy':         11561,
    'M/Navy':         11562,
    'L/Navy':         11563,
    'XL/Navy':        11564,
    '2XL/Navy':       11565,
    '3XL/Navy':       12653,
    '4XL/Navy':       12668,
    '5XL/Navy':       12669,

    'S/Maroon':       12634,
    'M/Maroon':       12635,
    'L/Maroon':       12636,
    'XL/Maroon':      12637,
    '2XL/Maroon':     12638,
    '3XL/Maroon':     16247,
    '4XL/Maroon':     16248,
    '5XL/Maroon':     16249,

    'S/Red':          11566,
    'M/Red':          11567,
    'L/Red':          11568,
    'XL/Red':         11569,
    '2XL/Red':        11570,
    '3XL/Red':        16250,
    '4XL/Red':        16251,
    '5XL/Red':        16252,

    'S/Royal':        15879,
    'M/Royal':        15880,
    'L/Royal':        15881,
    'XL/Royal':       15882,
    '2XL/Royal':      15883,
    '3XL/Royal':      15884,

    'S/Charcoal':     15831,
    'M/Charcoal':     15832,
    'L/Charcoal':     15833,
    'XL/Charcoal':    15834,
    '2XL/Charcoal':   15835,
    '3XL/Charcoal':   15836,

    'S/Sand':         12639,
    'M/Sand':         12640,
    'L/Sand':         12641,
    'XL/Sand':        12642,
    '2XL/Sand':       12643,
    '3XL/Sand':       16255,

    'S/Natural':      11556,
    'M/Natural':      11557,
    'L/Natural':      11558,
    'XL/Natural':     11559,
    '2XL/Natural':    11560,
    '3XL/Natural':    16246,

    'S/Light Pink':   11551,
    'M/Light Pink':   11552,
    'L/Light Pink':   11553,
    'XL/Light Pink':  11554,
    '2XL/Light Pink': 11555,
    '3XL/Light Pink': 14989,
    '4XL/Light Pink': 14990,
    '5XL/Light Pink': 14991,

    'S/Brown Savana':    15807,
    'M/Brown Savana':    15808,
    'L/Brown Savana':    15809,
    'XL/Brown Savana':   15810,
    '2XL/Brown Savana':  15811,
    '3XL/Brown Savana':  15812,
  },

  // ── Hoodie (signature: size/color) ────────────────────────────────────────
  // Printful product 444464136 — Cotton Heritage M2580 Premium Unisex Hoodie
  hoodie: {
    'S/Black':        10779,
    'M/Black':        10780,
    'L/Black':        10781,
    'XL/Black':       10782,
    '2XL/Black':      10783,
    '3XL/Black':      13416,

    'S/White':        10774,
    'M/White':        10775,
    'L/White':        10776,
    'XL/White':       10777,
    '2XL/White':      10778,
    '3XL/White':      13421,

    'S/Navy Blazer':  11491,
    'M/Navy Blazer':  11492,
    'L/Navy Blazer':  11493,
    'XL/Navy Blazer': 11494,
    '2XL/Navy Blazer':11495,
    '3XL/Navy Blazer':13417,

    'S/Maroon':       11486,
    'M/Maroon':       11487,
    'L/Maroon':       11488,
    'XL/Maroon':      11489,
    '2XL/Maroon':     11490,
    '3XL/Maroon':     13418,

    'S/Forest Green': 16162,
    'M/Forest Green': 16163,
    'L/Forest Green': 16164,
    'XL/Forest Green':16165,
    '2XL/Forest Green':16166,
    '3XL/Forest Green':16167,

    'S/Team Royal':   13905,
    'M/Team Royal':   13906,
    'L/Team Royal':   13907,
    'XL/Team Royal':  13908,
    '2XL/Team Royal': 13909,
    '3XL/Team Royal': 13910,

    'S/Team Red':     20278,
    'M/Team Red':     20279,
    'L/Team Red':     20280,
    'XL/Team Red':    20281,
    '2XL/Team Red':   20282,
    '3XL/Team Red':   20283,

    'S/Bone':         20284,
    'M/Bone':         20285,
    'L/Bone':         20286,
    'XL/Bone':        20287,
    '2XL/Bone':       20288,
    '3XL/Bone':       20289,

    'S/Khaki':        13899,
    'M/Khaki':        13900,
    'L/Khaki':        13901,
    'XL/Khaki':       13902,
    '2XL/Khaki':      13903,
    '3XL/Khaki':      13904,
  },

  // ── Canvas (signature: size) ───────────────────────────────────────────────
  // Printful product 444443585 — Stretched canvas
  canvas: {
    '8x10':  19293,
    '8x12':  19294,
    '11x14': 19298,
    '12x12': 823,
    '12x16': 5,
    '16x16': 824,
    '16x20': 6,
    '18x24': 7,
    '24x36': 825,
  },

  // ── Framed poster (signature: frame/size) ─────────────────────────────────
  // Printful product 444463719 — Wood framed poster
  poster: {
    'Black/8x10':   4651,
    'Black/12x16':  1350,
    'Black/16x20':  4399,
    'Black/18x24':  3,
    'Black/24x36':  4,

    'White/8x10':   10754,
    'White/12x16':  10751,
    'White/16x20':  10753,
    'White/18x24':  10749,
    'White/24x36':  10750,

    'Red Oak/8x10':   15021,
    'Red Oak/12x16':  15025,
    'Red Oak/16x20':  15029,
    'Red Oak/18x24':  15031,
    'Red Oak/24x36':  15032,
  },
};
