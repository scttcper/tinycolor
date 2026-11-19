import { describe, expect, it } from 'vitest';

import { TinyColor } from '../src/public_api.js';

/**
 * hsl() to sRGB as CSS Color 4 describes it, in integer arithmetic so nothing is lost to floating
 * point. `h` is in whole degrees, `s` and `l` are whole numbers over `scale` (0.12345 is 12345 over
 * 100000). Each channel is rounded half up, which is what browsers do.
 */
function hslToRgbExact(h: number, s: number, l: number, scale: number): number[] {
  return [0, 8, 4].map(n => {
    // k and m of the CSS formula, both multiplied by 30
    const k = (30 * n + h) % 360;
    const m = Math.max(-30, Math.min(k - 90, 270 - k, 30));
    // the channel in 1 / (30 * scale ** 2)
    const channel = 30 * l * scale - s * Math.min(l, scale - l) * m;
    return Math.floor((255 * channel + 15 * scale ** 2) / (30 * scale ** 2));
  });
}

/** The same for hsv(), with the channels in 1 / (60 * scale ** 2) */
function hsvToRgbExact(h: number, s: number, v: number, scale: number): number[] {
  const rest = h % 60;
  const max = 60 * v * scale;
  const min = 60 * v * (scale - s);
  const falling = v * (60 * scale - rest * s);
  const rising = v * (60 * scale - (60 - rest) * s);
  const sector = Math.floor(h / 60) % 6;
  return [
    [max, falling, min, min, rising, max][sector],
    [rising, max, max, falling, min, min][sector],
    [min, min, rising, max, max, falling][sector],
  ].map(channel => Math.floor((255 * channel + 30 * scale ** 2) / (60 * scale ** 2)));
}

describe('The saturation, lightness and value of an object', () => {
  // Every method that changes the lightness or the saturation reads toHsl() back as an object,
  // and 0.1039215686 used to be cut to 0.1039 on the way in
  it('should keep the five decimals of an hsl object', () => {
    const wrong: string[] = [];
    let seed = 1;
    const next = (n: number) => {
      seed = (seed * 48271) % 2147483647;
      return seed % n;
    };
    for (let i = 0; i < 20000; i++) {
      const h = next(360);
      const s = next(100001);
      const l = next(100001);
      const { r, g, b } = new TinyColor({ h, s: s / 100000, l: l / 100000 }).toRgb();
      const exact = hslToRgbExact(h, s, l, 100000);
      if (r !== exact[0] || g !== exact[1] || b !== exact[2]) {
        wrong.push(`h ${h}, s ${s / 100000}, l ${l / 100000} gave ${[r, g, b]}, not ${exact}`);
      }
    }

    expect(wrong.slice(0, 10)).toEqual([]);
  });

  it('should keep the five decimals of an hsv object', () => {
    const wrong: string[] = [];
    let seed = 7;
    const next = (n: number) => {
      seed = (seed * 48271) % 2147483647;
      return seed % n;
    };
    for (let i = 0; i < 20000; i++) {
      const h = next(360);
      const s = next(100001);
      const v = next(100001);
      const { r, g, b } = new TinyColor({ h, s: s / 100000, v: v / 100000 }).toRgb();
      const exact = hsvToRgbExact(h, s, v, 100000);
      if (r !== exact[0] || g !== exact[1] || b !== exact[2]) {
        wrong.push(`h ${h}, s ${s / 100000}, v ${v / 100000} gave ${[r, g, b]}, not ${exact}`);
      }
    }

    expect(wrong.slice(0, 10)).toEqual([]);
  });

  it('should give the exact gray for lighten() and darken() by every whole percent', () => {
    const wrong: string[] = [];
    for (let gray = 0; gray <= 255; gray++) {
      for (let percent = 0; percent <= 100; percent++) {
        // 255 * (gray / 255 + percent / 100) in hundredths, rounded half up
        const up = Math.min(255, Math.floor((100 * gray + 255 * percent + 50) / 100));
        const down = Math.max(0, Math.floor((100 * gray - 255 * percent + 50) / 100));
        const color = new TinyColor({ r: gray, g: gray, b: gray });
        const lighter = color.lighten(percent).toRgb().r;
        const darker = color.darken(percent).toRgb().r;
        if (lighter !== up) {
          wrong.push(`lighten(${percent}) of ${gray} gave ${lighter}, not ${up}`);
        }

        if (darker !== down) {
          wrong.push(`darken(${percent}) of ${gray} gave ${darker}, not ${down}`);
        }
      }
    }

    expect(wrong.slice(0, 10)).toEqual([]);
  });

  // The exact results come from the same hsl arithmetic in exact fractions: the lightness and the
  // saturation of a color are ratios of its bytes, so they do not stop after two decimals
  it.each([
    ['lighten', 10, { r: 115, g: 223, b: 152 }, { r: 157, g: 232, b: 183 }],
    ['lighten', 5, { r: 128, g: 0, b: 139 }, { r: 151, g: 0, b: 165 }],
    ['darken', 10, { r: 5, g: 161, b: 108 }, { r: 3, g: 112, b: 75 }],
    ['darken', 50, { r: 174, g: 127, b: 221 }, { r: 47, g: 20, b: 73 }],
    ['saturate', 20, { r: 62, g: 6, b: 13 }, { r: 68, g: 0, b: 9 }],
    ['saturate', 5, { r: 204, g: 228, b: 182 }, { r: 204, g: 231, b: 180 }],
    ['desaturate', 10, { r: 180, g: 30, b: 96 }, { r: 170, g: 41, b: 97 }],
    ['desaturate', 50, { r: 180, g: 30, b: 96 }, { r: 128, g: 83, b: 102 }],
  ] as const)('should %s(%d) %j to %j', (method, amount, input, expected) => {
    expect(new TinyColor(input)[method](amount).toRgb()).toEqual({ ...expected, a: 1 });
  });
});
