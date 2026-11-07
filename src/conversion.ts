import { HSL, HSV, Numberify, OKLCH, RGB } from './interfaces.js';
import { bound01, pad2 } from './util.js';

// `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
// <https://gist.github.com/mjackson/5311256>

/**
 * Handle bounds / percentage checking to conform to CSS color spec
 * <http://www.w3.org/TR/css3-color/>
 * *Assumes:* r, g, b in [0, 255] or [0, 1]
 * *Returns:* { r, g, b } in [0, 255]
 */
export function rgbToRgb(
  r: number | string,
  g: number | string,
  b: number | string,
): Numberify<RGB> {
  return {
    r: bound01(r, 255) * 255,
    g: bound01(g, 255) * 255,
    b: bound01(b, 255) * 255,
  };
}

/**
 * Converts an RGB color value to HSL.
 * *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
 * *Returns:* { h, s, l } in [0,1]
 */
export function rgbToHsl(r: number, g: number, b: number): Numberify<HSL> {
  r = bound01(r, 255);
  g = bound01(g, 255);
  b = bound01(b, 255);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s: number;
  const l = (max + min) / 2;

  if (max === min) {
    s = 0;
    h = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }

    h /= 6;
  }

  return { h, s, l };
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) {
    t += 1;
  }

  if (t > 1) {
    t -= 1;
  }

  if (t < 1 / 6) {
    return p + (q - p) * (6 * t);
  }

  if (t < 1 / 2) {
    return q;
  }

  if (t < 2 / 3) {
    return p + (q - p) * (2 / 3 - t) * 6;
  }

  return p;
}

/**
 * Converts an HSL color value to RGB.
 *
 * *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
 * *Returns:* { r, g, b } in the set [0, 255]
 */
export function hslToRgb(
  h: number | string,
  s: number | string,
  l: number | string,
): Numberify<RGB> {
  let r: number;
  let g: number;
  let b: number;

  h = bound01(h, 360);
  s = bound01(s, 100);
  l = bound01(l, 100);

  if (s === 0) {
    // achromatic
    g = l;
    b = l;
    r = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r: r * 255, g: g * 255, b: b * 255 };
}

/**
 * Converts an RGB color value to HSV
 *
 * *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
 * *Returns:* { h, s, v } in [0,1]
 */
export function rgbToHsv(r: number, g: number, b: number): Numberify<HSV> {
  r = bound01(r, 255);
  g = bound01(g, 255);
  b = bound01(b, 255);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }

    h /= 6;
  }

  return { h, s, v };
}

/**
 * Converts an HSV color value to RGB.
 *
 * *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
 * *Returns:* { r, g, b } in the set [0, 255]
 */
export function hsvToRgb(
  h: number | string,
  s: number | string,
  v: number | string,
): Numberify<RGB> {
  h = bound01(h, 360) * 6;
  s = bound01(s, 100);
  v = bound01(v, 100);

  const i = Math.floor(h);
  const f = h - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  const mod = i % 6;
  const r = [v, q, p, p, t, v][mod];
  const g = [t, v, v, q, p, p][mod];
  const b = [p, p, t, v, v, q][mod];

  return { r: r * 255, g: g * 255, b: b * 255 };
}

/** Char code of a hex digit 0-15, "0"-"9" then "a"-"f" */
function hexCharCode(digit: number): number {
  return digit < 10 ? 48 + digit : 87 + digit;
}

/** Round a channel and convert it to two character hex, values outside 0-255 use toString */
function channelToHex(c: number): string {
  const rounded = Math.round(c);
  if (rounded >= 0 && rounded <= 255) {
    return String.fromCharCode(hexCharCode(rounded >> 4), hexCharCode(rounded & 15));
  }

  return pad2(rounded.toString(16));
}

/** Same as `pad2(convertDecimalToHex(d))`, using channelToHex for the 0-255 fast path */
function decimalToHexPair(d: string | number): string {
  return channelToHex(parseFloat(d as string) * 255);
}

/**
 * Converts an RGB color to hex
 *
 * *Assumes:* r, g, and b are contained in the set [0, 255]
 * *Returns:* a 3 or 6 character hex
 */
export function rgbToHex(r: number, g: number, b: number, allow3Char: boolean): string {
  const rHex = channelToHex(r);
  const gHex = channelToHex(g);
  const bHex = channelToHex(b);

  // Return a 3 character hex if possible
  if (
    allow3Char &&
    rHex.startsWith(rHex.charAt(1)) &&
    gHex.startsWith(gHex.charAt(1)) &&
    bHex.startsWith(bHex.charAt(1))
  ) {
    return rHex.charAt(0) + gHex.charAt(0) + bHex.charAt(0);
  }

  return rHex + gHex + bHex;
}

/**
 * Converts an RGBA color plus alpha transparency to hex
 *
 * *Assumes:* r, g, b are contained in the set [0, 255] and a in [0, 1]
 * *Returns:* a 4 or 8 character rgba hex
 */

export function rgbaToHex(r: number, g: number, b: number, a: number, allow4Char: boolean): string {
  const rHex = channelToHex(r);
  const gHex = channelToHex(g);
  const bHex = channelToHex(b);
  const aHex = decimalToHexPair(a);

  // Return a 4 character hex if possible
  if (
    allow4Char &&
    rHex.startsWith(rHex.charAt(1)) &&
    gHex.startsWith(gHex.charAt(1)) &&
    bHex.startsWith(bHex.charAt(1)) &&
    aHex.startsWith(aHex.charAt(1))
  ) {
    return rHex.charAt(0) + gHex.charAt(0) + bHex.charAt(0) + aHex.charAt(0);
  }

  return rHex + gHex + bHex + aHex;
}

/**
 * Converts an RGBA color to an ARGB Hex8 string
 * Rarely used, but required for "toFilter()"
 *
 * *Assumes:* r, g, b are contained in the set [0, 255] and a in [0, 1]
 * *Returns:* a 8 character argb hex
 */
export function rgbaToArgbHex(r: number, g: number, b: number, a: number): string {
  const aHex = decimalToHexPair(a);
  const rHex = channelToHex(r);
  const gHex = channelToHex(g);
  const bHex = channelToHex(b);

  return aHex + rHex + gHex + bHex;
}

/**
 * Converts CMYK to RBG
 * Assumes c, m, y, k are in the set [0, 100]
 */
export function cmykToRgb(c: number, m: number, y: number, k: number) {
  const cConv = c / 100;
  const mConv = m / 100;
  const yConv = y / 100;
  const kConv = k / 100;

  const r = 255 * (1 - cConv) * (1 - kConv);
  const g = 255 * (1 - mConv) * (1 - kConv);
  const b = 255 * (1 - yConv) * (1 - kConv);

  return { r, g, b };
}

export function rgbToCmyk(r: number, g: number, b: number) {
  let c = 1 - r / 255;
  let m = 1 - g / 255;
  let y = 1 - b / 255;
  let k = Math.min(c, m, y);

  if (k === 1) {
    c = 0;
    m = 0;
    y = 0;
  } else {
    c = ((c - k) / (1 - k)) * 100;
    m = ((m - k) / (1 - k)) * 100;
    y = ((y - k) / (1 - k)) * 100;
  }

  k *= 100;

  return {
    c: Math.round(c),
    m: Math.round(m),
    y: Math.round(y),
    k: Math.round(k),
  };
}

/**
 * Converts an RGB color to OKLCH
 *
 * *Assumes:* r, g, and b are contained in the set [0, 255]
 * *Returns:* { l, c, h } with l in [0, 1], c from 0 and h in [0, 360)
 */
export function rgbToOklch(r: number, g: number, b: number): Numberify<OKLCH> {
  const [l, labA, labB] = linearSrgbToOklab(
    srgbToLinear(r / 255),
    srgbToLinear(g / 255),
    srgbToLinear(b / 255),
  );
  const c = Math.sqrt(labA * labA + labB * labB);

  // Grays only have floating point noise for chroma, so their hue would be random
  if (c <= 0.000004) {
    return { l: Math.min(1, l), c: 0, h: 0 };
  }

  const h = (Math.atan2(labB, labA) * 180) / Math.PI;
  return { l: Math.min(1, l), c, h: h < 0 ? h + 360 : h };
}

/**
 * Converts an OKLCH color to RGB. OKLCH can describe colors that sRGB can't show, those are
 * gamut mapped like CSS Color 4: chroma is lowered, keeping lightness and hue, until clipping
 * the rest is no longer noticeable. <https://www.w3.org/TR/css-color-4/#gamut-mapping>
 *
 * *Assumes:* l is contained in [0, 1], c is 0 or more and h is in degrees
 * *Returns:* { r, g, b } in the set [0, 255]
 */
export function oklchToRgb(l: number, c: number, h: number): Numberify<RGB> {
  // Lightness at either end is white or black whatever the chroma
  if (l >= 1) {
    return { r: 255, g: 255, b: 255 };
  }

  if (l <= 0) {
    return { r: 0, g: 0, b: 0 };
  }

  const hue = (h * Math.PI) / 180;
  const cos = Math.cos(hue);
  const sin = Math.sin(hue);
  const chroma = Math.max(0, c);
  let rgb = oklabToLinearSrgb(l, chroma * cos, chroma * sin);
  if (!isInSrgbGamut(rgb)) {
    rgb = gamutMapToSrgb(l, chroma, cos, sin);
  }

  return {
    r: linearToSrgb(rgb[0]) * 255,
    g: linearToSrgb(rgb[1]) * 255,
    b: linearToSrgb(rgb[2]) * 255,
  };
}

/**
 * Binary search for the chroma where clipping into sRGB is less than a just noticeable difference,
 * the CSS Color 4 gamut mapping algorithm. Returns clipped linear sRGB.
 */
function gamutMapToSrgb(l: number, c: number, cos: number, sin: number): [number, number, number] {
  const jnd = 0.02;
  const epsilon = 0.0001;

  let clipped = clipToSrgb(oklabToLinearSrgb(l, c * cos, c * sin));
  if (deltaEOK(l, c * cos, c * sin, clipped) < jnd) {
    return clipped;
  }

  let min = 0;
  let max = c;
  let minInGamut = true;
  while (max - min > epsilon) {
    const chroma = (min + max) / 2;
    const current = oklabToLinearSrgb(l, chroma * cos, chroma * sin);
    if (minInGamut && isInSrgbGamut(current)) {
      min = chroma;
      continue;
    }

    clipped = clipToSrgb(current);
    const delta = deltaEOK(l, chroma * cos, chroma * sin, clipped);
    if (delta < jnd) {
      if (jnd - delta < epsilon) {
        break;
      }

      minInGamut = false;
      min = chroma;
    } else {
      max = chroma;
    }
  }

  return clipped;
}

/** Distance in OKLab between a color and linear sRGB */
function deltaEOK(l: number, a: number, b: number, rgb: [number, number, number]): number {
  const [l2, a2, b2] = linearSrgbToOklab(rgb[0], rgb[1], rgb[2]);
  const dl = l - l2;
  const da = a - a2;
  const db = b - b2;
  return Math.sqrt(dl * dl + da * da + db * db);
}

function isInSrgbGamut(rgb: [number, number, number]): boolean {
  return rgb[0] >= 0 && rgb[0] <= 1 && rgb[1] >= 0 && rgb[1] <= 1 && rgb[2] >= 0 && rgb[2] <= 1;
}

function clipToSrgb(rgb: [number, number, number]): [number, number, number] {
  return [
    Math.min(1, Math.max(0, rgb[0])),
    Math.min(1, Math.max(0, rgb[1])),
    Math.min(1, Math.max(0, rgb[2])),
  ];
}

/** sRGB channel from 0-1 to linear light */
function srgbToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

/** Linear light channel from 0-1 to sRGB */
function linearToSrgb(channel: number): number {
  return channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;
}

/**
 * Linear sRGB to OKLab, with the CSS Color 4 matrices.
 * sRGB to XYZ D65 to LMS is combined into the first matrix.
 */
function linearSrgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const long = Math.cbrt(
    0.41222146947076305 * r + 0.5363325372617348 * g + 0.05144599326750221 * b,
  );
  const medium = Math.cbrt(
    0.21190349581782522 * r + 0.6806995506452344 * g + 0.10739695353694056 * b,
  );
  const short = Math.cbrt(
    0.08830245919005643 * r + 0.2817188391361215 * g + 0.6299787016738222 * b,
  );

  return [
    0.210454268309314 * long + 0.7936177747023054 * medium - 0.0040720430116193 * short,
    1.9779985324311684 * long - 2.42859224204858 * medium + 0.450593709617411 * short,
    0.0259040424655478 * long + 0.7827717124575296 * medium - 0.8086757549230774 * short,
  ];
}

/** OKLab to linear sRGB, channels outside of 0-1 are outside the sRGB gamut */
function oklabToLinearSrgb(l: number, a: number, b: number): [number, number, number] {
  // Cubed by multiplying, `** 3` goes through the much slower general pow
  const cbrtLong = l + 0.3963377773761749 * a + 0.2158037573099136 * b;
  const cbrtMedium = l - 0.1055613458156586 * a - 0.0638541728258133 * b;
  const cbrtShort = l - 0.0894841775298119 * a - 1.2914855480194092 * b;
  const long = cbrtLong * cbrtLong * cbrtLong;
  const medium = cbrtMedium * cbrtMedium * cbrtMedium;
  const short = cbrtShort * cbrtShort * cbrtShort;

  return [
    4.076741636075958 * long - 3.3077115392580616 * medium + 0.2309699031821043 * short,
    -1.2684379732850317 * long + 2.6097573492876887 * medium - 0.34131937600265727 * short,
    -0.004196076138675564 * long - 0.7034186179359363 * medium + 1.7076146940746117 * short,
  ];
}

/** Converts a decimal to a hex value */
export function convertDecimalToHex(d: string | number): string {
  return Math.round(parseFloat(d as string) * 255).toString(16);
}

/** Converts a hex value to a decimal */
export function convertHexToDecimal(h: string): number {
  return parseIntFromHex(h) / 255;
}

/** Parse a base-16 hex value into a base-10 integer */
export function parseIntFromHex(val: string): number {
  return parseInt(val, 16);
}

export function numberInputToObject(color: number): RGB {
  return {
    r: color >> 16,
    g: (color & 0xff00) >> 8,
    b: color & 0xff,
  };
}
