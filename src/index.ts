import names from './css-color-names';

export class TinyColor {
  private _originalInput!: ColorInput;
  private _r!: number;
  private _g!: number;
  private _b!: number;
  private _a!: number;
  private _roundA: any;
  private _format!:
    | 'rgb'
    | 'prgb'
    | 'hex'
    | 'hex3'
    | 'hex4'
    | 'hex6'
    | 'hex8'
    | 'name'
    | 'hsl'
    | 'hsv';
  private _gradientType: any;
  private _ok: any;

  constructor(color?: ColorInput, opts: any = {}) {
    // If input is already a tinycolor, return itself
    if (color instanceof TinyColor) {
      return color;
    }
    if (!color) {
      color = '';
    }
    const rgb = inputToRGB(color);
    this._originalInput = color;
    if (!color) {
      return;
    }
    this._r = rgb.r;
    this._g = rgb.g;
    this._b = rgb.b;
    this._a = rgb.a;
    this._roundA = Math.round(100 * this._a) / 100;
    this._format = opts.format || rgb.format;
    this._gradientType = opts.gradientType;

    // Don't let the range of [0,255] come back in [0,1].
    // Potentially lose a little bit of precision here, but will fix issues where
    // .5 gets interpreted as half of the total, instead of half of 1
    // If it was supposed to be 128, this was already taken care of by `inputToRgb`
    if (this._r < 1) {
      this._r = Math.round(this._r);
    }
    if (this._g < 1) {
      this._g = Math.round(this._g);
    }
    if (this._b < 1) {
      this._b = Math.round(this._b);
    }

    this._ok = rgb.ok;
  }
  isDark() {
    return this.getBrightness() < 128;
  }
  isLight() {
    return !this.isDark();
  }
  /**
   * Return an indication whether the color was successfully parsed.
   */
  isValid() {
    return this._ok;
  }
  /**
   * Returns the input passed into the constructer used to create the tinycolor instance.
   */
  getOriginalInput(): ColorInput {
    return this._originalInput;
  }
  /**
   * Returns the format used to create the tinycolor instance.
   */
  getFormat(): string {
    return this._format;
  }
  /**
   * Returns the alpha value of the color
   */
  getAlpha(): number {
    return this._a;
  }
  /**
   * Returns the perceived brightness of the color, from 0-255.
   */
  getBrightness(): number {
    // http://www.w3.org/TR/AERT#color-contrast
    const rgb = this.toRgb();
    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  }
  /**
   * Returns the perceived luminance of a color, from 0-1.
   */
  getLuminance(): number {
    // http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
    const rgb = this.toRgb();
    let R;
    let G;
    let B;
    const RsRGB = rgb.r / 255;
    const GsRGB = rgb.g / 255;
    const BsRGB = rgb.b / 255;

    if (RsRGB <= 0.03928) {
      R = RsRGB / 12.92;
    } else {
      R = Math.pow((RsRGB + 0.055) / 1.055, 2.4);
    }
    if (GsRGB <= 0.03928) {
      G = GsRGB / 12.92;
    } else {
      G = Math.pow((GsRGB + 0.055) / 1.055, 2.4);
    }
    if (BsRGB <= 0.03928) {
      B = BsRGB / 12.92;
    } else {
      B = Math.pow((BsRGB + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  }
  /**
   * Sets the alpha value on the current color.
   *
   * @param alpha - The new alpha value. The accepted range is 0-1.
   */
  setAlpha(alpha?: string | number): TinyColor {
    this._a = boundAlpha(alpha);
    this._roundA = Math.round(100 * this._a) / 100;
    return this;
  }
  /**
   * Returns the object as a HSVA object.
   */
  toHsv() {
    const hsv = rgbToHsv(this._r, this._g, this._b);
    return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this._a };
  }
  /**
   * Returns the hsva values interpolated into a string with the following format:
   * "hsva(xxx, xxx, xxx, xx)".
   */
  toHsvString(): string {
    const hsv = rgbToHsv(this._r, this._g, this._b);
    const h = Math.round(hsv.h * 360);
    const s = Math.round(hsv.s * 100);
    const v = Math.round(hsv.v * 100);
    return this._a === 1
      ? 'hsv(' + h + ', ' + s + '%, ' + v + '%)'
      : 'hsva(' + h + ', ' + s + '%, ' + v + '%, ' + this._roundA + ')';
  }
  /**
   * Returns the object as a HSLA object.
   */
  toHsl() {
    const hsl = rgbToHsl(this._r, this._g, this._b);
    return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this._a };
  }
  /**
   * Returns the hsla values interpolated into a string with the following format:
   * "hsla(xxx, xxx, xxx, xx)".
   */
  toHslString(): string {
    const hsl = rgbToHsl(this._r, this._g, this._b);
    const h = Math.round(hsl.h * 360);
    const s = Math.round(hsl.s * 100);
    const l = Math.round(hsl.l * 100);
    return this._a === 1
      ? 'hsl(' + h + ', ' + s + '%, ' + l + '%)'
      : 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + this._roundA + ')';
  }
  /**
   * Returns the hex value of the color.
   */
  toHex(allow3Char?): string {
    return rgbToHex(this._r, this._g, this._b, allow3Char);
  }
  /**
   * Returns the hex value of the color -with a # appened.
   */
  toHexString(allow3Char?): string {
    return '#' + this.toHex(allow3Char);
  }
  /**
   * Returns the hex 8 value of the color.
   */
  toHex8(allow4Char?): string {
    return rgbaToHex(this._r, this._g, this._b, this._a, allow4Char);
  }
  /**
   * Returns the hex 8  value of the color -with a # appened.
   */
  toHex8String(allow4Char?): string {
    return '#' + this.toHex8(allow4Char);
  }
  /**
   * Returns the object as a RGBA object.
   */
  toRgb() {
    return { r: Math.round(this._r), g: Math.round(this._g), b: Math.round(this._b), a: this._a };
  }
  /**
   * Returns the RGBA values interpolated into a string with the following format:
   * "RGBA(xxx, xxx, xxx, xx)".
   */
  toRgbString() {
    return this._a === 1
      ? 'rgb(' + Math.round(this._r) + ', ' + Math.round(this._g) + ', ' + Math.round(this._b) + ')'
      : 'rgba(' +
          Math.round(this._r) +
          ', ' +
          Math.round(this._g) +
          ', ' +
          Math.round(this._b) +
          ', ' +
          this._roundA +
          ')';
  }
  /**
   * Returns the object as a RGBA object.
   */
  toPercentageRgb() {
    return {
      r: Math.round(bound01(this._r, 255) * 100) + '%',
      g: Math.round(bound01(this._g, 255) * 100) + '%',
      b: Math.round(bound01(this._b, 255) * 100) + '%',
      a: this._a,
    };
  }
  /**
   * Returns the RGBA relative values interpolated into a string with the following format:
   * "RGBA(xxx, xxx, xxx, xx)".
   */
  toPercentageRgbString() {
    return this._a === 1
      ? 'rgb(' +
          Math.round(bound01(this._r, 255) * 100) +
          '%, ' +
          Math.round(bound01(this._g, 255) * 100) +
          '%, ' +
          Math.round(bound01(this._b, 255) * 100) +
          '%)'
      : 'rgba(' +
          Math.round(bound01(this._r, 255) * 100) +
          '%, ' +
          Math.round(bound01(this._g, 255) * 100) +
          '%, ' +
          Math.round(bound01(this._b, 255) * 100) +
          '%, ' +
          this._roundA +
          ')';
  }
  /**
   * The 'real' name of the color -if there is one.
   */
  toName(): string | false {
    if (this._a === 0) {
      return 'transparent';
    }

    if (this._a < 1) {
      return false;
    }
    const hex = '#' + rgbToHex(this._r, this._g, this._b, false);
    for (const key of Object.keys(names)) {
      if (names[key] === hex) {
        return key;
      }
    }
    return false;
  }
  /**
   * Returns the color represented as a Microsoft filter for use in old versions of IE.
   */
  toFilter(secondColor?: ColorInput) {
    const hex8String = '#' + rgbaToArgbHex(this._r, this._g, this._b, this._a);
    let secondHex8String = hex8String;
    const gradientType = this._gradientType ? 'GradientType = 1, ' : '';

    if (secondColor) {
      const s = new TinyColor(secondColor);
      secondHex8String = '#' + rgbaToArgbHex(s._r, s._g, s._b, s._a);
    }

    return (
      'progid:DXImageTransform.Microsoft.gradient(' +
      gradientType +
      'startColorstr=' +
      hex8String +
      ',endColorstr=' +
      secondHex8String +
      ')'
    );
  }
  /**
   * String representation of the color.
   *
   * @param format - The format to be used when displaying the string representation.
   */
  toString(
    format?: 'rgb' | 'prgb' | 'hex' | 'hex3' | 'hex4' | 'hex6' | 'hex8' | 'name' | 'hsl' | 'hsv',
  ) {
    const formatSet = !!format;
    format = format || this._format;

    let formattedString: string | false = false;
    const hasAlpha = this._a < 1 && this._a >= 0;
    const needsAlphaFormat =
      !formatSet && hasAlpha && (format.startsWith('hex') || format === 'name');

    if (needsAlphaFormat) {
      // Special case for "transparent", all other non-alpha formats
      // will return rgba when there is transparency.
      if (format === 'name' && this._a === 0) {
        return this.toName();
      }
      return this.toRgbString();
    }
    if (format === 'rgb') {
      formattedString = this.toRgbString();
    }
    if (format === 'prgb') {
      formattedString = this.toPercentageRgbString();
    }
    if (format === 'hex' || format === 'hex6') {
      formattedString = this.toHexString();
    }
    if (format === 'hex3') {
      formattedString = this.toHexString(true);
    }
    if (format === 'hex4') {
      formattedString = this.toHex8String(true);
    }
    if (format === 'hex8') {
      formattedString = this.toHex8String();
    }
    if (format === 'name') {
      formattedString = this.toName();
    }
    if (format === 'hsl') {
      formattedString = this.toHslString();
    }
    if (format === 'hsv') {
      formattedString = this.toHsvString();
    }

    return formattedString || this.toHexString();
  }
  clone() {
    return new TinyColor(this.toString() as string);
  }
  lighten(amount: number) {
    return lighten(this, amount);
  }
  brighten(amount: number) {
    return brighten(this, amount);
  }
  darken(amount: number) {
    return darken(this, amount);
  }
  desaturate(amount: number) {
    return desaturate(this, amount);
  }
  saturate(amount: number) {
    return saturate(this, amount);
  }
  greyscale() {
    return greyscale(this);
  }
  spin(amount) {
    return spin(this, amount);
  }
  analogous() {
    return analogous(this);
  }
  complement() {
    return complement(this);
  }
  monochromatic() {
    return monochromatic(this);
  }
  splitcomplement() {
    return splitcomplement(this);
  }
  triad() {
    return triad(this);
  }
  tetrad() {
    return tetrad(this);
  }

  // If input is an object, force 1 into "1.0" to handle ratios properly
  // String input requires "1.0" as input, so 1 will be treated as 1
  fromRatio(color, opts?: any) {
    if (typeof color === 'object') {
      const newColor = {};
      for (const key of Object.keys(color)) {
        if (key === 'a') {
          newColor[key] = color[key];
        } else {
          newColor[key] = convertToPercentage(color[key]);
        }
      }
      color = newColor;
    }

    return new TinyColor(color, opts);
  }
  // `equals`
  // Can be called with any tinycolor input
  equals(color1?: ColorInput, color2?: ColorInput): boolean {
    if (!color1 || !color2) {
      return false;
    }
    return new TinyColor(color1).toRgbString() === new TinyColor(color2).toRgbString();
  }

  random() {
    return this.fromRatio({
      r: Math.random(),
      g: Math.random(),
      b: Math.random(),
    });
  }

  // Utility Functions
  // ---------------------
  mix(color1: ColorInput, color2: ColorInput, amount?: number) {
    amount = amount === 0 ? 0 : amount || 50;

    const rgb1 = new TinyColor(color1).toRgb();
    const rgb2 = new TinyColor(color2).toRgb();

    const p = amount / 100;

    const rgba = {
      r: (rgb2.r - rgb1.r) * p + rgb1.r,
      g: (rgb2.g - rgb1.g) * p + rgb1.g,
      b: (rgb2.b - rgb1.b) * p + rgb1.b,
      a: (rgb2.a - rgb1.a) * p + rgb1.a,
    };

    return new TinyColor(rgba);
  }

  // Readability Functions
  // ---------------------
  // <http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef (WCAG Version 2)

  // `contrast`
  // Analyze the 2 colors and returns the color contrast defined by (WCAG Version 2)
  readability(color1, color2) {
    const c1 = new TinyColor(color1);
    const c2 = new TinyColor(color2);
    return (
      (Math.max(c1.getLuminance(), c2.getLuminance()) + 0.05) /
      (Math.min(c1.getLuminance(), c2.getLuminance()) + 0.05)
    );
  }

  /**
   * Ensure that foreground and background color combinations meet WCAG2 guidelines.
   * The third argument is an optional Object.
   *      the 'level' property states 'AA' or 'AAA' - if missing or invalid, it defaults to 'AA';
   *      the 'size' property states 'large' or 'small' - if missing or invalid, it defaults to 'small'.
   * If the entire object is absent, isReadable defaults to {level:"AA",size:"small"}.
   *
   * ### Example
   * ```ts
   * new TinyColor().isReadable('#000', '#111') => false
   * new TinyColor().isReadable('#000', '#111', { level: 'AA', size: 'large' }) => false
   * ```
   */
  isReadable(
    color1: ColorInput,
    color2: ColorInput,
    wcag2: WCAG2Parms = { level: 'AA', size: 'small' },
  ) {
    const readability = new TinyColor().readability(color1, color2);
    switch ((wcag2.level || 'AA') + (wcag2.size || 'small')) {
      case 'AAsmall':
      case 'AAAlarge':
        return readability >= 4.5;
      case 'AAlarge':
        return readability >= 3;
      case 'AAAsmall':
        return readability >= 7;
    }
    return false;
  }
  /**
   * Given a base color and a list of possible foreground or background
   * colors for that base, returns the most readable color.
   * Optionally returns Black or White if the most readable color is unreadable.
   *
   * @param baseColor - the base color.
   * @param colorList - array of colors to pick the most readable one from.
   * @param args - and object with extra arguments
   *
   * ### Example
   * ```ts
   * new TinyColor().mostReadable('#123', ['#124", "#125'], { includeFallbackColors: false }).toHexString(); // "#112255"
   * new TinyColor().mostReadable('#123', ['#124", "#125'],{ includeFallbackColors: true }).toHexString();  // "#ffffff"
   * new TinyColor().mostReadable('#a8015a', ["#faf3f3"], { includeFallbackColors:true, level: 'AAA', size: 'large' }).toHexString(); // "#faf3f3"
   * new TinyColor().mostReadable('#a8015a', ["#faf3f3"], { includeFallbackColors:true, level: 'AAA', size: 'small' }).toHexString(); // "#ffffff"
   * ```
   */
  mostReadable(baseColor: ColorInput, colorList: string[], args: any = {}) {
    let bestColor: TinyColor | null = null;
    let bestScore = 0;
    let readability;
    const includeFallbackColors = args.includeFallbackColors;
    const level = args.level;
    const size = args.size;

    for (let i = 0; i < colorList.length; i++) {
      readability = this.readability(baseColor, colorList[i]);
      if (readability > bestScore) {
        bestScore = readability;
        bestColor = new TinyColor(colorList[i]);
      }
    }

    if (
      this.isReadable(baseColor, bestColor as TinyColor, { level, size }) ||
      !includeFallbackColors
    ) {
      return bestColor;
    } else {
      args.includeFallbackColors = false;
      return this.mostReadable(baseColor, ['#fff', '#000'], args);
    }
  }
}
/**
 * Given a string or object, convert that input to RGB
 * Possible string inputs:
 *
 *     "red"
 *     "#f00" or "f00"
 *     "#ff0000" or "ff0000"
 *     "#ff000000" or "ff000000"
 *     "rgb 255 0 0" or "rgb (255, 0, 0)"
 *     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
 *     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
 *     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
 *     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
 *     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
 *     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
 */
function inputToRGB(color: string | RGB | RGBA | HSL | HSLA | HSV | HSVA | any) {
  let rgb = { r: 0, g: 0, b: 0 };
  let a = 1;
  let s = null;
  let v = null;
  let l = null;
  let ok = false;
  let format: string | false = false;

  if (typeof color === 'string') {
    color = stringInputToObject(color);
  }

  if (typeof color === 'object') {
    if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b)) {
      rgb = rgbToRgb(color.r, color.g, color.b);
      ok = true;
      format = String(color.r).substr(-1) === '%' ? 'prgb' : 'rgb';
    } else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v)) {
      s = convertToPercentage(color.s);
      v = convertToPercentage(color.v);
      rgb = hsvToRgb(color.h, s, v);
      ok = true;
      format = 'hsv';
    } else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l)) {
      s = convertToPercentage(color.s);
      l = convertToPercentage(color.l);
      rgb = hslToRgb(color.h, s, l);
      ok = true;
      format = 'hsl';
    }

    if (color.hasOwnProperty('a')) {
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
  };
}

// Conversion Functions
// --------------------

// `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
// <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

// `rgbToRgb`
// Handle bounds / percentage checking to conform to CSS color spec
// <http://www.w3.org/TR/css3-color/>
// *Assumes:* r, g, b in [0, 255] or [0, 1]
// *Returns:* { r, g, b } in [0, 255]
function rgbToRgb(r, g, b) {
  return {
    r: bound01(r, 255) * 255,
    g: bound01(g, 255) * 255,
    b: bound01(b, 255) * 255,
  };
}

// `rgbToHsl`
// Converts an RGB color value to HSL.
// *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
// *Returns:* { h, s, l } in [0,1]
function rgbToHsl(r, g, b) {
  r = bound01(r, 255);
  g = bound01(g, 255);
  b = bound01(b, 255);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h;
  let s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
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
    }

    h /= 6;
  }

  return { h, s, l };
}
/**
 * Converts an HSL color value to RGB.
 *
 * *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
 * *Returns:* { r, g, b } in the set [0, 255]
 */
function hslToRgb(h, s, l) {
  let r;
  let g;
  let b;

  h = bound01(h, 360);
  s = bound01(s, 100);
  l = bound01(l, 100);

  function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  if (s === 0) {
    r = g = b = l; // achromatic
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
function rgbToHsv(r, g, b) {
  r = bound01(r, 255);
  g = bound01(g, 255);
  b = bound01(b, 255);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h;
  let s;
  const v = max;

  const d = max - min;
  s = max === 0 ? 0 : d / max;

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
    }
    h /= 6;
  }
  return { h: h, s: s, v: v };
}
/**
 * Converts an HSV color value to RGB.
 *
 * *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
 * *Returns:* { r, g, b } in the set [0, 255]
 */
function hsvToRgb(h, s, v) {
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
/**
 * Converts an RGB color to hex
 *
 * Assumes r, g, and b are contained in the set [0, 255]
 * Returns a 3 or 6 character hex
 */
function rgbToHex(r: number, g: number, b: number, allow3Char: boolean) {
  const hex = [
    pad2(Math.round(r).toString(16)),
    pad2(Math.round(g).toString(16)),
    pad2(Math.round(b).toString(16)),
  ];

  // Return a 3 character hex if possible
  if (
    allow3Char &&
    hex[0].charAt(0) === hex[0].charAt(1) &&
    hex[1].charAt(0) === hex[1].charAt(1) &&
    hex[2].charAt(0) === hex[2].charAt(1)
  ) {
    return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
  }

  return hex.join('');
}

/**
 * Converts an RGBA color plus alpha transparency to hex
 *
 * Assumes r, g, b are contained in the set [0, 255] and
 * a in [0, 1]. Returns a 4 or 8 character rgba hex
 */
function rgbaToHex(r: number, g: number, b: number, a: number, allow4Char: boolean) {
  const hex = [
    pad2(Math.round(r).toString(16)),
    pad2(Math.round(g).toString(16)),
    pad2(Math.round(b).toString(16)),
    pad2(convertDecimalToHex(a)),
  ];

  // Return a 4 character hex if possible
  if (
    allow4Char &&
    hex[0].charAt(0) === hex[0].charAt(1) &&
    hex[1].charAt(0) === hex[1].charAt(1) &&
    hex[2].charAt(0) === hex[2].charAt(1) &&
    hex[3].charAt(0) === hex[3].charAt(1)
  ) {
    return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0) + hex[3].charAt(0);
  }

  return hex.join('');
}

// `rgbaToArgbHex`
// Converts an RGBA color to an ARGB Hex8 string
// Rarely used, but required for "toFilter()"
function rgbaToArgbHex(r, g, b, a) {
  const hex = [
    pad2(convertDecimalToHex(a)),
    pad2(Math.round(r).toString(16)),
    pad2(Math.round(g).toString(16)),
    pad2(Math.round(b).toString(16)),
  ];

  return hex.join('');
}

// Modification Functions
// ----------------------
// Thanks to less.js for some of the basics here
// <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>
function desaturate(color: ColorInput, amount = 10) {
  const hsl = new TinyColor(color).toHsl();
  hsl.s -= amount / 100;
  hsl.s = clamp01(hsl.s);
  return new TinyColor(hsl);
}

function saturate(color: ColorInput, amount = 10) {
  const hsl = new TinyColor(color).toHsl();
  hsl.s += amount / 100;
  hsl.s = clamp01(hsl.s);
  return new TinyColor(hsl);
}

function greyscale(color: ColorInput) {
  return new TinyColor(color).desaturate(100);
}

/**
 * Lighten the color a given amount. Providing 100 will always return white.
 *
 * @param amount - The amount to lighten by. The valid range is 0 to 100.
 *  Default value: 10.
 */
function lighten(color: ColorInput, amount = 10) {
  const hsl = new TinyColor(color).toHsl();
  hsl.l += amount / 100;
  hsl.l = clamp01(hsl.l);
  return new TinyColor(hsl);
}

function brighten(color: ColorInput, amount = 10) {
  const rgb = new TinyColor(color).toRgb();
  rgb.r = Math.max(0, Math.min(255, rgb.r - Math.round(255 * -(amount / 100))));
  rgb.g = Math.max(0, Math.min(255, rgb.g - Math.round(255 * -(amount / 100))));
  rgb.b = Math.max(0, Math.min(255, rgb.b - Math.round(255 * -(amount / 100))));
  return new TinyColor(rgb);
}

function darken(color: ColorInput, amount = 10) {
  const hsl = new TinyColor(color).toHsl();
  hsl.l -= amount / 100;
  hsl.l = clamp01(hsl.l);
  return new TinyColor(hsl);
}

/**
 * Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
 * Values outside of this range will be wrapped into this range.
 */
function spin(color: ColorInput, amount: number) {
  const hsl = new TinyColor(color).toHsl();
  const hue = (hsl.h + amount) % 360;
  hsl.h = hue < 0 ? 360 + hue : hue;
  return new TinyColor(hsl);
}

// Combination Functions
// ---------------------
// Thanks to jQuery xColor for some of the ideas behind these
// <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>
function complement(color: ColorInput) {
  const hsl = new TinyColor(color).toHsl();
  hsl.h = (hsl.h + 180) % 360;
  return new TinyColor(hsl);
}

function triad(color: ColorInput) {
  const hsl = new TinyColor(color).toHsl();
  const h = hsl.h;
  return [
    new TinyColor(color),
    new TinyColor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
    new TinyColor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l }),
  ];
}

function tetrad(color: ColorInput) {
  const hsl = new TinyColor(color).toHsl();
  const h = hsl.h;
  return [
    new TinyColor(color),
    new TinyColor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
    new TinyColor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
    new TinyColor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l }),
  ];
}

function splitcomplement(color: ColorInput) {
  const hsl = new TinyColor(color).toHsl();
  const h = hsl.h;
  return [
    new TinyColor(color),
    new TinyColor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l }),
    new TinyColor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l }),
  ];
}

function analogous(color: ColorInput, results = 6, slices = 30) {
  const hsl = new TinyColor(color).toHsl();
  const part = 360 / slices;
  const ret = [new TinyColor(color)];

  for (hsl.h = (hsl.h - ((part * results) >> 1) + 720) % 360; --results; ) {
    hsl.h = (hsl.h + part) % 360;
    ret.push(new TinyColor(hsl));
  }
  return ret;
}

function monochromatic(color: ColorInput, results = 6) {
  const hsv = new TinyColor(color).toHsv();
  const h = hsv.h;
  const s = hsv.s;
  let v = hsv.v;
  const ret: TinyColor[] = [];
  const modification = 1 / results;

  while (results--) {
    ret.push(new TinyColor({ h: h, s: s, v: v }));
    v = (v + modification) % 1;
  }

  return ret;
}

/**
 * Return a valid alpha value [0,1] with all invalid values being set to 1
 */
function boundAlpha(a?: number | string) {
  a = parseFloat(a as string);

  if (isNaN(a) || a < 0 || a > 1) {
    a = 1;
  }

  return a;
}

/**
 * Take input from [0, n] and return it as [0, 1]
 */
function bound01(n: any, max: number) {
  if (isOnePointZero(n)) {
    n = '100%';
  }

  const processPercent = isPercentage(n);
  n = Math.min(max, Math.max(0, parseFloat(n)));

  // Automatically convert percentage into number
  if (processPercent) {
    n = parseInt(String(n * max), 10) / 100;
  }

  // Handle floating point rounding errors
  if (Math.abs(n - max) < 0.000001) {
    return 1;
  }

  // Convert into [0, 1] range if it isn't already
  return (n % max) / parseFloat(String(max));
}

/** Force a number between 0 and 1 */
function clamp01(val) {
  return Math.min(1, Math.max(0, val));
}

/** Parse a base-16 hex value into a base-10 integer */
function parseIntFromHex(val) {
  return parseInt(val, 16);
}

/**
 * Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
 * <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
 */
function isOnePointZero(n: string) {
  return typeof n === 'string' && n.indexOf('.') !== -1 && parseFloat(n) === 1;
}

/** Check to see if string passed in is a percentage */
function isPercentage(n: string) {
  return typeof n === 'string' && n.indexOf('%') !== -1;
}

/** Force a hex value to have 2 characters */
function pad2(c) {
  return c.length === 1 ? '0' + c : '' + c;
}

/** Replace a decimal with it's percentage value */
function convertToPercentage(n) {
  if (n <= 1) {
    n = n * 100 + '%';
  }

  return n;
}

/** Converts a decimal to a hex value */
function convertDecimalToHex(d) {
  return Math.round(parseFloat(d) * 255).toString(16);
}
/** Converts a hex value to a decimal */
function convertHexToDecimal(h) {
  return parseIntFromHex(h) / 255;
}

const matchers = (function() {
  // <http://www.w3.org/TR/css3-values/#integers>
  const CSS_INTEGER = '[-\\+]?\\d+%?';

  // <http://www.w3.org/TR/css3-values/#number-value>
  const CSS_NUMBER = '[-\\+]?\\d*\\.\\d+%?';

  // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
  const CSS_UNIT = '(?:' + CSS_NUMBER + ')|(?:' + CSS_INTEGER + ')';

  // Actual matching.
  // Parentheses and commas are optional, but not required.
  // Whitespace can take the place of commas or opening paren
  const PERMISSIVE_MATCH3 =
    '[\\s|\\(]+(' + CSS_UNIT + ')[,|\\s]+(' + CSS_UNIT + ')[,|\\s]+(' + CSS_UNIT + ')\\s*\\)?';
  const PERMISSIVE_MATCH4 =
    '[\\s|\\(]+(' +
    CSS_UNIT +
    ')[,|\\s]+(' +
    CSS_UNIT +
    ')[,|\\s]+(' +
    CSS_UNIT +
    ')[,|\\s]+(' +
    CSS_UNIT +
    ')\\s*\\)?';

  return {
    CSS_UNIT: new RegExp(CSS_UNIT),
    rgb: new RegExp('rgb' + PERMISSIVE_MATCH3),
    rgba: new RegExp('rgba' + PERMISSIVE_MATCH4),
    hsl: new RegExp('hsl' + PERMISSIVE_MATCH3),
    hsla: new RegExp('hsla' + PERMISSIVE_MATCH4),
    hsv: new RegExp('hsv' + PERMISSIVE_MATCH3),
    hsva: new RegExp('hsva' + PERMISSIVE_MATCH4),
    hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
    hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
    hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
    hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
  };
})();

// `isValidCSSUnit`
// Take in a single string / number and check to see if it looks like a CSS unit
// (see `matchers` above for definition).
function isValidCSSUnit(color) {
  return !!matchers.CSS_UNIT.exec(color);
}

/**
 * Permissive string parsing.  Take in a number of formats, and output an object
 * based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
 */
function stringInputToObject(color: string): any {
  color = color.trim().toLowerCase();
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
  let match = matchers.rgb.exec(color);
  if (match) {
    return { r: match[1], g: match[2], b: match[3] };
  }
  match = matchers.rgba.exec(color);
  if (match) {
    return { r: match[1], g: match[2], b: match[3], a: match[4] };
  }
  match = matchers.hsl.exec(color);
  if (match) {
    return { h: match[1], s: match[2], l: match[3] };
  }
  match = matchers.hsla.exec(color);
  if (match) {
    return { h: match[1], s: match[2], l: match[3], a: match[4] };
  }
  match = matchers.hsv.exec(color);
  if (match) {
    return { h: match[1], s: match[2], v: match[3] };
  }
  match = matchers.hsva.exec(color);
  if (match) {
    return { h: match[1], s: match[2], v: match[3], a: match[4] };
  }
  match = matchers.hex8.exec(color);
  if (match) {
    return {
      r: parseIntFromHex(match[1]),
      g: parseIntFromHex(match[2]),
      b: parseIntFromHex(match[3]),
      a: convertHexToDecimal(match[4]),
      format: named ? 'name' : 'hex8',
    };
  }
  match = matchers.hex6.exec(color);
  if (match) {
    return {
      r: parseIntFromHex(match[1]),
      g: parseIntFromHex(match[2]),
      b: parseIntFromHex(match[3]),
      format: named ? 'name' : 'hex',
    };
  }
  match = matchers.hex4.exec(color);
  if (match) {
    return {
      r: parseIntFromHex(match[1] + '' + match[1]),
      g: parseIntFromHex(match[2] + '' + match[2]),
      b: parseIntFromHex(match[3] + '' + match[3]),
      a: convertHexToDecimal(match[4] + '' + match[4]),
      format: named ? 'name' : 'hex8',
    };
  }
  match = matchers.hex3.exec(color);
  if (match) {
    return {
      r: parseIntFromHex(match[1] + '' + match[1]),
      g: parseIntFromHex(match[2] + '' + match[2]),
      b: parseIntFromHex(match[3] + '' + match[3]),
      format: named ? 'name' : 'hex',
    };
  }

  return false;
}

export interface RGB {
  r: number | string;
  g: number | string;
  b: number | string;
}

export interface RGBA extends RGB {
  a: number;
}

export interface HSL {
  h: number | string;
  s: number | string;
  l: number | string;
}

export interface HSLA extends HSL {
  a: number;
}

export interface HSV {
  h: number | string;
  s: number | string;
  v: number | string;
}

export interface HSVA extends HSV {
  a: number;
}

export type ColorInput = string | RGB | RGBA | HSL | HSLA | HSV | HSVA | TinyColor;

export interface WCAG2Parms {
  level?: 'AA' | 'AAA';
  size?: 'large' | 'small';
}
