// randomColor by David Merfield under the CC0 license
// https://github.com/davidmerfield/randomColor/

import { bounds, ColorBound } from './color-bounds';
import { hsvToRgb } from './conversion';
import { TinyColor } from './index';
import { HSV, HSVA } from './interfaces';

export interface RandomOptions {
  seed?: number;
  count?: number;
  hue?:
    | number
    | string
    | 'red'
    | 'orange'
    | 'yellow'
    | 'green'
    | 'blue'
    | 'purple'
    | 'pink'
    | 'monochrome';
  luminosity?: 'random' | 'bright' | 'dark' | 'light';
  alpha?: number;
}

export function fromRandom(options: RandomOptions = {}): TinyColor[] {
  // Check if we need to generate multiple colors
  if (options.count !== null && options.count !== undefined) {
    const totalColors = options.count;
    const colors: TinyColor[] = [];

    options.count = null;

    while (totalColors > colors.length) {
      // Since we're generating multiple colors,
      // incremement the seed. Otherwise we'd just
      // generate the same color each time...
      if (options.seed) {
        options.seed += 1;
      }

      colors.push(fromRandom(options)[0]);
    }

    options.count = totalColors;

    return colors;
  }

  // First we pick a hue (H)
  const h = pickHue(options.hue, options.seed);

  // Then use H to determine saturation (S)
  const s = pickSaturation(h, options);

  // Then use S and H to determine brightness (B).
  const v = pickBrightness(h, s, options);
  const res: Partial<HSVA> = { h, s, v };
  if (options.alpha !== undefined) {
    res.a = options.alpha;
  }

  // Then we return the HSB color in the desired format
  return [new TinyColor(res as HSVA)];
}

function pickHue(hue: number | string | undefined, seed: number) {
  const hueRange = getHueRange(hue);
  let res = randomWithin(hueRange, seed);

  // Instead of storing red as two seperate ranges,
  // we group them, using negative numbers
  if (res < 0) {
    res = 360 + res;
  }

  return res;
}

function pickSaturation(hue: number, options: RandomOptions) {
  if (options.hue === 'monochrome') {
    return 0;
  }

  if (options.luminosity === 'random') {
    return randomWithin([0, 100], options.seed);
  }

  const saturationRange = getColorInfo(hue).saturationRange;

  let sMin = saturationRange[0];
  let sMax = saturationRange[1];

  switch (options.luminosity) {
    case 'bright':
      sMin = 55;
      break;

    case 'dark':
      sMin = sMax - 10;
      break;

    case 'light':
      sMax = 55;
      break;
  }

  return randomWithin([sMin, sMax], options.seed);
}

function pickBrightness(H, S, options) {
  let bMin = getMinimumBrightness(H, S);
  let bMax = 100;

  switch (options.luminosity) {
    case 'dark':
      bMax = bMin + 20;
      break;

    case 'light':
      bMin = (bMax + bMin) / 2;
      break;

    case 'random':
      bMin = 0;
      bMax = 100;
      break;
  }

  return randomWithin([bMin, bMax], options.seed);
}

function getMinimumBrightness(H, S) {
  const lowerBounds = getColorInfo(H).lowerBounds;

  for (let i = 0; i < lowerBounds.length - 1; i++) {
    const s1 = lowerBounds[i][0];
    const v1 = lowerBounds[i][1];

    const s2 = lowerBounds[i + 1][0];
    const v2 = lowerBounds[i + 1][1];

    if (S >= s1 && S <= s2) {
      const m = (v2 - v1) / (s2 - s1);
      const b = v1 - m * s1;

      return m * S + b;
    }
  }

  return 0;
}

function getHueRange(colorInput?: number | string): [number, number] {
  const num = parseInt(colorInput as string, 10);
  if (!Number.isNaN(num) && num < 360 && num > 0) {
    return [num, num];
  }

  if (typeof colorInput === 'string') {
    const namedColor = bounds.find(n => n.name === colorInput);
    if (namedColor) {
      const color = defineColor(namedColor);
      if (color.hueRange) {
        return color.hueRange;
      }
    }
    const parsed = new TinyColor(colorInput);
    if (parsed.isValid) {
      const hue = parsed.toHsv().h;
      return [hue, hue];
    }
  }

  return [0, 360];
}

function getColorInfo(hue: number) {
  // Maps red colors to make picking hue easier
  if (hue >= 334 && hue <= 360) {
    hue -= 360;
  }
  for (const bound of bounds) {
    const color = defineColor(bound);
    if (color.hueRange && hue >= color.hueRange[0] && hue <= color.hueRange[1]) {
      return color;
    }
  }
  throw Error('Color not found');
}

function randomWithin(range: [number, number], seed: number) {
  if (seed === null || seed === undefined) {
    return Math.floor(range[0] + Math.random() * (range[1] + 1 - range[0]));
  } else {
    // Seeded random algorithm from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
    const max = range[1] || 1;
    const min = range[0] || 0;
    seed = (seed * 9301 + 49297) % 233280;
    const rnd = seed / 233280.0;
    return Math.floor(min + rnd * (max - min));
  }
}

function defineColor(bound: ColorBound) {
  const sMin = bound.lowerBounds[0][0];
  const sMax = bound.lowerBounds[bound.lowerBounds.length - 1][0];
  const bMin = bound.lowerBounds[bound.lowerBounds.length - 1][1];
  const bMax = bound.lowerBounds[0][1];

  return {
    name: bound.name,
    hueRange: bound.hueRange,
    lowerBounds: bound.lowerBounds,
    saturationRange: [sMin, sMax],
    brightnessRange: [bMin, bMax],
  };
}
