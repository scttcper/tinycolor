import { cmykToRgb, hslToRgb, hsvToRgb, oklchToRgb, rgbToRgb } from './conversion.js';
import { names } from './css-color-names.js';
import { CMYK, HSL, HSLA, HSV, HSVA, Numberify, OKLCH, OKLCHA, RGB, RGBA } from './interfaces.js';
import { boundAlpha, clamp01, convertToPercentageNumber } from './util.js';

/**
 * Given a string or object, convert that input to RGB
 *
 * Possible string inputs:
 * ```
 * "red"
 * "#f00" or "f00"
 * "#ff0000" or "ff0000"
 * "#ff000000" or "ff000000"
 * "rgb 255 0 0" or "rgb (255, 0, 0)"
 * "rgb 1.0 0 0" or "rgb (1, 0, 0)"
 * "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
 * "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
 * "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
 * "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
 * "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
 * "cmyk(0, 20, 0, 0)" or "cmyk 0 20 0 0"
 * "oklch(62.8% 0.258 29.23)" or "oklch(0.628 0.258 29.23 / 50%)"
 * ```
 *
 * OKLCH input outside of sRGB is gamut mapped for `r`, `g` and `b`, and also returned as `oklch`
 */
export function inputToRGB(
  color: string | RGB | RGBA | HSL | HSLA | HSV | HSVA | OKLCH | OKLCHA | CMYK | any,
): {
  ok: boolean;
  format: any;
  r: number;
  g: number;
  b: number;
  a: number;
  oklch?: Numberify<OKLCH>;
} {
  let rgb = { r: 0, g: 0, b: 0 };
  let a = 1;
  let ok = false;
  let format: string | false = false;
  let oklch: Numberify<OKLCH> | undefined;

  if (typeof color === 'string') {
    color = stringInputToObject(color);
  }

  if (typeof color === 'object') {
    if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b)) {
      rgb = rgbToRgb(color.r, color.g, color.b);
      ok = true;
      // Numbers never end in %, and formatting fractional ones as strings is slow
      const { r } = color;
      format = typeof r !== 'number' && String(r).endsWith('%') ? 'prgb' : 'rgb';
    } else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v)) {
      const s = convertToPercentageNumber(color.s);
      const v = convertToPercentageNumber(color.v);
      rgb = hsvToRgb(color.h, s as number, v as number);
      ok = true;
      format = 'hsv';
    } else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l)) {
      const s = convertToPercentageNumber(color.s);
      const l = convertToPercentageNumber(color.l);
      rgb = hslToRgb(color.h, s as number, l as number);
      ok = true;
      format = 'hsl';
    } else if (isValidCSSUnit(color.l) && isValidCSSUnit(color.c) && isValidCSSUnit(color.h)) {
      const l = oklchLightness(color.l);
      const c = oklchChroma(color.c);
      const h = oklchHue(color.h);
      if (Number.isFinite(l + c + h)) {
        oklch = { l, c, h };
        rgb = oklchToRgb(l, c, h);
        ok = true;
        format = 'oklch';
      }
    } else if (
      isValidCSSUnit(color.c) &&
      isValidCSSUnit(color.m) &&
      isValidCSSUnit(color.y) &&
      isValidCSSUnit(color.k)
    ) {
      rgb = cmykToRgb(color.c, color.m, color.y, color.k);
      ok = true;
      format = 'cmyk';
    }

    if (Object.prototype.hasOwnProperty.call(color, 'a')) {
      a = color.a;
    }
  }

  a = boundAlpha(a);

  return {
    ok,
    format: color.format || format,
    r: Math.min(255, Math.max(rgb.r, 0)),
    g: Math.min(255, Math.max(rgb.g, 0)),
    b: Math.min(255, Math.max(rgb.b, 0)),
    a,
    oklch,
  };
}

/** OKLCH lightness from 0-1 or 0%-100%, clamped like CSS */
function oklchLightness(value: number | string): number {
  return clamp01(typeof value === 'number' ? value : cssNumber(value, 1, false));
}

/** OKLCH chroma as a number, or a percentage where 100% is 0.4. Negative chroma is 0 like CSS. */
function oklchChroma(value: number | string): number {
  return Math.max(0, typeof value === 'number' ? value : cssNumber(value, 0.4, false));
}

/** OKLCH hue as degrees from 0-360, from a number or a CSS angle */
function oklchHue(value: number | string): number {
  const degrees = typeof value === 'number' ? value : cssNumber(value, NaN, true);
  // Only add 360 to negative hues, adding it to every hue would add floating point error.
  // Math.abs turns -0 into 0.
  const wrapped = degrees % 360;
  return wrapped < 0 ? wrapped + 360 : Math.abs(wrapped);
}

/** Parse a CSS number like `.5` or `1e-3`, a percentage of `percent`, or an angle in degrees */
function cssNumber(value: string, percent: number, angle: boolean): number {
  const match = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)([a-z%]*)$/.exec(
    value.trim().toLowerCase(),
  );
  return match ? withUnit(Number(match[1]), match[2], percent, angle) : NaN;
}

/** Apply a CSS unit, `%` is a share of `percent` and angles are converted to degrees */
function withUnit(n: number, unit: string, percent: number, angle: boolean): number {
  switch (unit) {
    case '':
      return n;
    case '%':
      return angle ? NaN : (n / 100) * percent;
    case 'deg':
      return angle ? n : NaN;
    case 'grad':
      return angle ? n * 0.9 : NaN;
    case 'rad':
      return angle ? (n * 180) / Math.PI : NaN;
    case 'turn':
      return angle ? n * 360 : NaN;
    default:
      return NaN;
  }
}

// <http://www.w3.org/TR/css3-values/#integers>
const CSS_INTEGER = '[-\\+]?\\d+%?';

// <http://www.w3.org/TR/css3-values/#number-value>
const CSS_NUMBER = '[-\\+]?\\d*\\.\\d+%?';

// Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
const CSS_UNIT = '(?:' + CSS_NUMBER + ')|(?:' + CSS_INTEGER + ')';

// Actual matching.
// Parentheses and commas are optional, but not required.
// Whitespace can take the place of commas or opening paren
// eslint-disable-next-line prettier/prettier
const PERMISSIVE_MATCH3 = '[\\s|\\(]+(' + CSS_UNIT + ')[,|\\s]+(' + CSS_UNIT + ')[,|\\s]+(' + CSS_UNIT + ')(?:[,|\\s|/]+(' + CSS_UNIT + '))?\\s*\\)?';
const PERMISSIVE_MATCH4 =
  // eslint-disable-next-line prettier/prettier
  '[\\s|\\(]+(' + CSS_UNIT + ')[,|\\s]+(' + CSS_UNIT + ')[,|\\s]+(' + CSS_UNIT + ')[,|\\s]+(' + CSS_UNIT + ')\\s*\\)?';

const matchers = {
  CSS_UNIT: new RegExp(CSS_UNIT),
  rgb: new RegExp('rgba?' + PERMISSIVE_MATCH3),
  hsl: new RegExp('hsla?' + PERMISSIVE_MATCH3),
  hsv: new RegExp('hsva?' + PERMISSIVE_MATCH3),
  cmyk: new RegExp('cmyk' + PERMISSIVE_MATCH4),
};

/**
 * Permissive string parsing.  Take in a number of formats, and output an object
 * based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}` or `{ l, c, h }` or `{c, m, y, k}` or `{c, m, y, k, a}`
 */
export function stringInputToObject(color: string): any {
  color = color.trim().toLowerCase();
  if (color.length === 0) {
    return false;
  }

  // Before the color names, so the long string isn't hashed for a lookup that can't match
  if (color.startsWith('oklch')) {
    return oklchStringToObject(color);
  }

  let named = false;
  if (names[color]) {
    color = names[color];
    named = true;
  } else if (color === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0, format: 'name' };
  }

  // Try to match string input using regular expressions.
  // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
  // Just return an object and let the conversion functions handle that.
  // This way the result will be the same whether the tinycolor is initialized with string or object.
  // Hex colors cannot contain a functional color, so try them before the permissive matchers.
  if (typeof color === 'string' && color.length <= 9) {
    const hex = hexToObject(color, named);
    if (hex) {
      return hex;
    }
  }

  let match = matchers.rgb.exec(color);
  if (match) {
    // optional alpha, e.g. `rgb(... / 50%)` or `rgb(..., 0.5)`
    return match[4] === undefined
      ? { r: match[1], g: match[2], b: match[3] }
      : { r: match[1], g: match[2], b: match[3], a: match[4] };
  }

  match = matchers.hsl.exec(color);
  if (match) {
    // optional alpha, e.g. `hsl(... / 50%)` or `hsl(..., 0.5)`
    return match[4] === undefined
      ? { h: match[1], s: match[2], l: match[3] }
      : { h: match[1], s: match[2], l: match[3], a: match[4] };
  }

  match = matchers.hsv.exec(color);
  if (match) {
    // optional alpha, e.g. `hsv(... / 50%)` or `hsv(..., 0.5)`
    return match[4] === undefined
      ? { h: match[1], s: match[2], v: match[3] }
      : { h: match[1], s: match[2], v: match[3], a: match[4] };
  }

  match = matchers.cmyk.exec(color);
  if (match) {
    return {
      c: match[1],
      m: match[2],
      y: match[3],
      k: match[4],
    };
  }

  return false;
}

/**
 * Parse `oklch(L C H / A)` with units applied, `inputToRGB` clamps them like the object input.
 * Like the other color functions, commas, a missing slash and missing parentheses are allowed.
 * `none` is a missing component, which CSS treats as 0.
 */
function oklchStringToObject(color: string): Record<string, number> | false {
  // Each component captures its number and unit, `none` captures neither
  const match =
    /^oklch(?:\s*\(\s*|\s+)(?:none|([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(%?))[\s,]+(?:none|([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(%?))[\s,]+(?:none|([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(deg|grad|rad|turn)?)(?:\s*[\s,/]\s*(none|([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(%?)))?\s*\)?$/.exec(
      color,
    );
  if (!match) {
    return false;
  }

  const l = match[1] === undefined ? 0 : withUnit(Number(match[1]), match[2], 1, false);
  const c = match[3] === undefined ? 0 : withUnit(Number(match[3]), match[4], 0.4, false);
  const h = match[5] === undefined ? 0 : withUnit(Number(match[5]), match[6] ?? '', NaN, true);
  if (match[7] === undefined) {
    return { l, c, h };
  }

  const a = match[8] === undefined ? 0 : withUnit(Number(match[8]), match[9], 1, false);
  return { l, c, h, a };
}

/**
 * Parse `#rgb`, `#rgba`, `#rrggbb` and `#rrggbbaa`, with or without the `#`.
 * Reads char codes directly instead of matching a regex per length and calling parseInt.
 */
function hexToObject(color: string, named: boolean): Record<string, number | string> | undefined {
  const start = color.startsWith('#') ? 1 : 0;
  const length = color.length - start;

  if (length === 6 || length === 8) {
    const r = hexDigit(color, start) * 16 + hexDigit(color, start + 1);
    const g = hexDigit(color, start + 2) * 16 + hexDigit(color, start + 3);
    const b = hexDigit(color, start + 4) * 16 + hexDigit(color, start + 5);
    if (length === 6) {
      return Number.isNaN(r + g + b) ? undefined : { r, g, b, format: named ? 'name' : 'hex' };
    }

    const a = hexDigit(color, start + 6) * 16 + hexDigit(color, start + 7);
    return Number.isNaN(r + g + b + a)
      ? undefined
      : { r, g, b, a: a / 255, format: named ? 'name' : 'hex8' };
  }

  if (length === 3 || length === 4) {
    // A single digit repeats, so "f" is "ff": 15 * 16 + 15 = 15 * 17
    const r = hexDigit(color, start) * 17;
    const g = hexDigit(color, start + 1) * 17;
    const b = hexDigit(color, start + 2) * 17;
    if (length === 3) {
      return Number.isNaN(r + g + b) ? undefined : { r, g, b, format: named ? 'name' : 'hex' };
    }

    const a = hexDigit(color, start + 3) * 17;
    return Number.isNaN(r + g + b + a)
      ? undefined
      : { r, g, b, a: a / 255, format: named ? 'name' : 'hex8' };
  }

  return undefined;
}

/** Value of the hex digit at index, or NaN when it isn't one */
function hexDigit(color: string, index: number): number {
  const code = color.charCodeAt(index);
  if (code >= 48 && code <= 57) {
    return code - 48; // 0-9
  }

  if (code >= 97 && code <= 102) {
    return code - 87; // a-f
  }

  if (code >= 65 && code <= 70) {
    return code - 55; // A-F
  }

  return NaN;
}

/**
 * Check to see if it looks like a CSS unit
 * (see `matchers` above for definition).
 */
export function isValidCSSUnit(color: string | number): boolean {
  if (typeof color === 'number') {
    return !Number.isNaN(color);
  }

  // Object input checks channels that aren't there, skip matching them as "undefined"
  if (color === undefined) {
    return false;
  }

  return matchers.CSS_UNIT.test(color);
}
