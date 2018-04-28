import { rgbaToArgbHex, rgbaToHex, rgbToHex, rgbToHsl, rgbToHsv } from './conversion';
import names from './css-color-names';
import { inputToRGB } from './format-input';
import { HSL, HSLA, HSV, HSVA, RGB, RGBA, WCAG2Parms } from './interfaces';
import { bound01, boundAlpha, clamp01, convertToPercentage } from './util';

export interface TinyColorOptions {
  format: string;
  gradientType: string;
}

export type ColorInput = string | RGB | RGBA | HSL | HSLA | HSV | HSVA | TinyColor;

export type ColorFormats =
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

export class TinyColor {
  r!: number;
  g!: number;
  b!: number;
  a!: number;
  format!: ColorFormats;
  private roundA!: number;
  private gradientType?: string;
  private ok!: boolean;

  constructor(private originalInput: ColorInput = '', opts: Partial<TinyColorOptions> = {}) {
    // If input is already a tinycolor, return itself
    if (originalInput instanceof TinyColor) {
      return originalInput;
    }
    this.originalInput = originalInput;
    const rgb = inputToRGB(originalInput);
    if (!originalInput) {
      return;
    }
    this.r = rgb.r;
    this.g = rgb.g;
    this.b = rgb.b;
    this.a = rgb.a;
    this.roundA = Math.round(100 * this.a) / 100;
    this.format = opts.format || rgb.format;
    this.gradientType = opts.gradientType;

    // Don't let the range of [0,255] come back in [0,1].
    // Potentially lose a little bit of precision here, but will fix issues where
    // .5 gets interpreted as half of the total, instead of half of 1
    // If it was supposed to be 128, this was already taken care of by `inputToRgb`
    if (this.r < 1) {
      this.r = Math.round(this.r);
    }
    if (this.g < 1) {
      this.g = Math.round(this.g);
    }
    if (this.b < 1) {
      this.b = Math.round(this.b);
    }

    this.ok = rgb.ok;
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
    return this.ok;
  }
  /**
   * Returns the input passed into the constructer used to create the tinycolor instance.
   */
  getOriginalInput(): ColorInput {
    return this.originalInput;
  }
  /**
   * Returns the format used to create the tinycolor instance.
   */
  getFormat(): string {
    return this.format;
  }
  /**
   * Returns the alpha value of the color
   */
  getAlpha(): number {
    return this.a;
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
    this.a = boundAlpha(alpha);
    this.roundA = Math.round(100 * this.a) / 100;
    return this;
  }
  /**
   * Returns the object as a HSVA object.
   */
  toHsv() {
    const hsv = rgbToHsv(this.r, this.g, this.b);
    return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this.a };
  }
  /**
   * Returns the hsva values interpolated into a string with the following format:
   * "hsva(xxx, xxx, xxx, xx)".
   */
  toHsvString(): string {
    const hsv = rgbToHsv(this.r, this.g, this.b);
    const h = Math.round(hsv.h * 360);
    const s = Math.round(hsv.s * 100);
    const v = Math.round(hsv.v * 100);
    return this.a === 1
      ? 'hsv(' + h + ', ' + s + '%, ' + v + '%)'
      : 'hsva(' + h + ', ' + s + '%, ' + v + '%, ' + this.roundA + ')';
  }
  /**
   * Returns the object as a HSLA object.
   */
  toHsl() {
    const hsl = rgbToHsl(this.r, this.g, this.b);
    return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this.a };
  }
  /**
   * Returns the hsla values interpolated into a string with the following format:
   * "hsla(xxx, xxx, xxx, xx)".
   */
  toHslString(): string {
    const hsl = rgbToHsl(this.r, this.g, this.b);
    const h = Math.round(hsl.h * 360);
    const s = Math.round(hsl.s * 100);
    const l = Math.round(hsl.l * 100);
    return this.a === 1
      ? 'hsl(' + h + ', ' + s + '%, ' + l + '%)'
      : 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + this.roundA + ')';
  }
  /**
   * Returns the hex value of the color.
   */
  toHex(allow3Char = false): string {
    return rgbToHex(this.r, this.g, this.b, allow3Char);
  }
  /**
   * Returns the hex value of the color -with a # appened.
   */
  toHexString(allow3Char = false): string {
    return '#' + this.toHex(allow3Char);
  }
  /**
   * Returns the hex 8 value of the color.
   */
  toHex8(allow4Char = false): string {
    return rgbaToHex(this.r, this.g, this.b, this.a, allow4Char);
  }
  /**
   * Returns the hex 8 value of the color -with a # appened.
   */
  toHex8String(allow4Char = false): string {
    return '#' + this.toHex8(allow4Char);
  }
  /**
   * Returns the object as a RGBA object.
   */
  toRgb() {
    return { r: Math.round(this.r), g: Math.round(this.g), b: Math.round(this.b), a: this.a };
  }
  /**
   * Returns the RGBA values interpolated into a string with the following format:
   * "RGBA(xxx, xxx, xxx, xx)".
   */
  toRgbString() {
    return this.a === 1
      ? 'rgb(' + Math.round(this.r) + ', ' + Math.round(this.g) + ', ' + Math.round(this.b) + ')'
      : 'rgba(' +
          Math.round(this.r) +
          ', ' +
          Math.round(this.g) +
          ', ' +
          Math.round(this.b) +
          ', ' +
          this.roundA +
          ')';
  }
  /**
   * Returns the object as a RGBA object.
   */
  toPercentageRgb() {
    return {
      r: Math.round(bound01(this.r, 255) * 100) + '%',
      g: Math.round(bound01(this.g, 255) * 100) + '%',
      b: Math.round(bound01(this.b, 255) * 100) + '%',
      a: this.a,
    };
  }
  /**
   * Returns the RGBA relative values interpolated into a string with the following format:
   * "RGBA(xxx, xxx, xxx, xx)".
   */
  toPercentageRgbString() {
    return this.a === 1
      ? 'rgb(' +
          Math.round(bound01(this.r, 255) * 100) +
          '%, ' +
          Math.round(bound01(this.g, 255) * 100) +
          '%, ' +
          Math.round(bound01(this.b, 255) * 100) +
          '%)'
      : 'rgba(' +
          Math.round(bound01(this.r, 255) * 100) +
          '%, ' +
          Math.round(bound01(this.g, 255) * 100) +
          '%, ' +
          Math.round(bound01(this.b, 255) * 100) +
          '%, ' +
          this.roundA +
          ')';
  }
  /**
   * The 'real' name of the color -if there is one.
   */
  toName(): string | false {
    if (this.a === 0) {
      return 'transparent';
    }

    if (this.a < 1) {
      return false;
    }
    const hex = '#' + rgbToHex(this.r, this.g, this.b, false);
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
    const hex8String = '#' + rgbaToArgbHex(this.r, this.g, this.b, this.a);
    let secondHex8String = hex8String;
    const gradientType: string = this.gradientType ? 'GradientType = 1, ' : '';

    if (secondColor) {
      const s = new TinyColor(secondColor);
      secondHex8String = '#' + rgbaToArgbHex(s.r, s.g, s.b, s.a);
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
  toString(format?: ColorFormats) {
    const formatSet = !!format;
    format = format || this.format;

    let formattedString: string | false = false;
    const hasAlpha = this.a < 1 && this.a >= 0;
    const needsAlphaFormat =
      !formatSet && hasAlpha && (format.startsWith('hex') || format === 'name');

    if (needsAlphaFormat) {
      // Special case for "transparent", all other non-alpha formats
      // will return rgba when there is transparency.
      if (format === 'name' && this.a === 0) {
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
  /**
   * Lighten the color a given amount. Providing 100 will always return white.
   *
   * @param amount - The amount to lighten by. The valid range is 0 to 100.
   */
  lighten(amount = 10) {
    const hsl = this.toHsl();
    hsl.l += amount / 100;
    hsl.l = clamp01(hsl.l);
    return new TinyColor(hsl);
  }
  brighten(amount = 10) {
    const rgb = this.toRgb();
    rgb.r = Math.max(0, Math.min(255, rgb.r - Math.round(255 * -(amount / 100))));
    rgb.g = Math.max(0, Math.min(255, rgb.g - Math.round(255 * -(amount / 100))));
    rgb.b = Math.max(0, Math.min(255, rgb.b - Math.round(255 * -(amount / 100))));
    return new TinyColor(rgb);
  }
  darken(amount = 10) {
    const hsl = this.toHsl();
    hsl.l -= amount / 100;
    hsl.l = clamp01(hsl.l);
    return new TinyColor(hsl);
  }
  desaturate(amount = 10) {
    const hsl = this.toHsl();
    hsl.s -= amount / 100;
    hsl.s = clamp01(hsl.s);
    return new TinyColor(hsl);
  }
  saturate(amount = 10) {
    const hsl = this.toHsl();
    hsl.s += amount / 100;
    hsl.s = clamp01(hsl.s);
    return new TinyColor(hsl);
  }
  greyscale() {
    return this.desaturate(100);
  }
  /**
   * Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
   * Values outside of this range will be wrapped into this range.
   */
  spin(amount: number) {
    const hsl = this.toHsl();
    const hue = (hsl.h + amount) % 360;
    hsl.h = hue < 0 ? 360 + hue : hue;
    return new TinyColor(hsl);
  }
  analogous(results = 6, slices = 30) {
    const hsl = this.toHsl();
    const part = 360 / slices;
    const ret: TinyColor[] = [this];

    for (hsl.h = (hsl.h - ((part * results) >> 1) + 720) % 360; --results; ) {
      hsl.h = (hsl.h + part) % 360;
      ret.push(new TinyColor(hsl));
    }
    return ret;
  }
  /**
   * taken from https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js
   */
  complement() {
    const hsl = this.toHsl();
    hsl.h = (hsl.h + 180) % 360;
    return new TinyColor(hsl);
  }
  monochromatic(results = 6) {
    const hsv = this.toHsv();
    const h = hsv.h;
    const s = hsv.s;
    let v = hsv.v;
    const res: TinyColor[] = [];
    const modification = 1 / results;

    while (results--) {
      res.push(new TinyColor({ h, s, v }));
      v = (v + modification) % 1;
    }

    return res;
  }
  splitcomplement() {
    const hsl = this.toHsl();
    const h = hsl.h;
    return [
      this,
      new TinyColor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l }),
      new TinyColor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l }),
    ];
  }
  triad() {
    const hsl = this.toHsl();
    const h = hsl.h;
    return [
      this,
      new TinyColor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
      new TinyColor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l }),
    ];
  }
  tetrad() {
    const hsl = this.toHsl();
    const h = hsl.h;
    return [
      this,
      new TinyColor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
      new TinyColor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
      new TinyColor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l }),
    ];
  }
  /**
   * If input is an object, force 1 into "1.0" to handle ratios properly
   * String input requires "1.0" as input, so 1 will be treated as 1
   */
  fromRatio(color: any, opts?: any) {
    if (typeof color === 'object') {
      const newColor: { [key: string]: string | number } = {};
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
  readability(color1: ColorInput, color2: ColorInput) {
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
   * Example
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
   * Example
   * ```ts
   * new TinyColor().mostReadable('#123', ['#124", "#125'], { includeFallbackColors: false }).toHexString(); // "#112255"
   * new TinyColor().mostReadable('#123', ['#124", "#125'],{ includeFallbackColors: true }).toHexString();  // "#ffffff"
   * new TinyColor().mostReadable('#a8015a', ["#faf3f3"], { includeFallbackColors:true, level: 'AAA', size: 'large' }).toHexString(); // "#faf3f3"
   * new TinyColor().mostReadable('#a8015a', ["#faf3f3"], { includeFallbackColors:true, level: 'AAA', size: 'small' }).toHexString(); // "#ffffff"
   * ```
   */
  mostReadable(baseColor: ColorInput, colorList: string[], args: any = {}): TinyColor | null {
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
