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
