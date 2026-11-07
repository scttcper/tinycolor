/**
 * convert all properties in an interface to a number
 */
export type Numberify<T> = {
  [P in keyof T]: number;
};

/**
 * A representation of additive color mixing.
 * Projection of primary color lights on a white screen shows secondary
 * colors where two overlap; the combination of all three of red, green,
 * and blue in equal intensities makes white.
 */
export interface RGB {
  r: number | string;
  g: number | string;
  b: number | string;
}

export interface RGBA extends RGB {
  a: number;
}

/**
 * The HSL model describes colors in terms of hue, saturation,
 * and lightness (also called luminance).
 * @link https://en.wikibooks.org/wiki/Color_Models:_RGB,_HSV,_HSL#HSL
 */
export interface HSL {
  h: number | string;
  s: number | string;
  l: number | string;
}

export interface HSLA extends HSL {
  a: number;
}

/**
 * The HSV, or HSB, model describes colors in terms of
 * hue, saturation, and value (brightness).
 * @link https://en.wikibooks.org/wiki/Color_Models:_RGB,_HSV,_HSL#HSV
 */
export interface HSV {
  h: number | string;
  s: number | string;
  v: number | string;
}

export interface HSVA extends HSV {
  a: number;
}

/**
 * OKLCH is a perceptual color space, equal changes in lightness or chroma look equal across hues.
 * `l` is lightness from 0-1, `c` is chroma from 0 (about 0.4 for the most vivid colors)
 * and `h` is the hue angle in degrees. It can describe colors outside of sRGB.
 * @link https://www.w3.org/TR/css-color-4/#specifying-oklab-oklch
 */
export interface OKLCH {
  l: number | string;
  c: number | string;
  h: number | string;
}

export interface OKLCHA extends OKLCH {
  a: number;
}

/**
 * The CMYK color model is a subtractive color model used in the printing process.
 * It described four ink palettes: Cyan, Magenta, Yellow, and Black.
 * @link https://en.wikipedia.org/wiki/CMYK_color_model
 */
export interface CMYK {
  c: number | string;
  m: number | string;
  y: number | string;
  k: number | string;
}
