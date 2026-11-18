import { describe, expect, it } from 'vitest';

import { TinyColor } from '../src/public_api.js';

/**
 * hsl() to sRGB as CSS Color 4 describes it, in integer arithmetic so nothing is lost to floating
 * point. `h` is in whole degrees, `s` and `l` are whole percents. Each channel is rounded half up,
 * which is what browsers do.
 */
function hslToRgbExact(h: number, s: number, l: number): number[] {
  return [0, 8, 4].map(n => {
    // k and m of the CSS formula, both multiplied by 30
    const k = (30 * n + h) % 360;
    const m = Math.max(-30, Math.min(k - 90, 270 - k, 30));
    // the channel in 1 / 300000
    const channel = 3000 * l - s * Math.min(l, 100 - l) * m;
    return Math.floor((255 * channel + 150000) / 300000);
  });
}

/** The same for hsv(), with the channels in 1 / 600000 */
function hsvToRgbExact(h: number, s: number, v: number): number[] {
  const rest = h % 60;
  const max = v * 6000;
  const min = v * (100 - s) * 60;
  const falling = v * (6000 - rest * s);
  const rising = v * (6000 - (60 - rest) * s);
  const sector = Math.floor(h / 60) % 6;
  return [
    [max, falling, min, min, rising, max][sector],
    [rising, max, max, falling, min, min][sector],
    [min, min, rising, max, max, falling][sector],
  ].map(channel => Math.floor((255 * channel + 300000) / 600000));
}

/** The same for cmyk(), with the channels in 1 / 10000 */
function cmykToRgbExact(c: number, m: number, y: number, k: number): number[] {
  return [c, m, y].map(n => Math.floor((255 * (100 - n) * (100 - k) + 5000) / 10000));
}

describe('Exact halves in hsl(), hsv() and cmyk()', () => {
  // A channel that is exactly 127.5 or 25.5 rounds up. It used to come out as 127.49999999999999
  // and 25.499999999999996, and was rounded down
  it.each([
    ['hsl(60, 100%, 25%)', 'olive'],
    ['hsl(180, 100%, 25%)', 'teal'],
    ['hsl(300, 100%, 25%)', 'purple'],
  ])('%s is %s', (input, name) => {
    expect(new TinyColor(input).toHexString()).toBe(new TinyColor(name).toHexString());
  });

  it.each([
    ['hsl(0, 50%, 20%)', '#4d1a1a'],
    ['hsl(0, 60%, 25%)', '#661a1a'],
    ['hsl(0, 75%, 40%)', '#b31a1a'],
    ['hsl(0, 75%, 60%)', '#e64d4d'],
    ['hsl(0, 100%, 95%)', '#ffe6e6'],
    ['hsl(270, 60%, 70%)', '#b385e0'],
    ['hsl(270, 100%, 50%)', '#8000ff'],
    ['hsv(0, 80%, 50%)', '#801a1a'],
    ['hsv(0, 90%, 100%)', '#ff1a1a'],
    ['hsv(60, 80%, 50%)', '#80801a'],
    ['hsv(120, 50%, 50%)', '#408040'],
    ['cmyk(0, 0, 0, 90)', '#1a1a1a'],
    ['cmyk(90, 0, 0, 0)', '#1affff'],
    ['cmyk(0, 0, 0, 70)', '#4d4d4d'],
  ])('%s is %s', (input, hex) => {
    expect(new TinyColor(input).toHexString()).toBe(hex);
  });

  it('should round the objects the same way', () => {
    expect(new TinyColor({ h: 60, s: 1, l: 0.25 }).toHexString()).toBe('#808000');
    expect(new TinyColor({ h: 0, s: 0.5, l: 0.2 }).toRgb()).toEqual({ r: 77, g: 26, b: 26, a: 1 });
    expect(new TinyColor({ h: 0, s: 0.8, v: 0.5 }).toRgb()).toEqual({ r: 128, g: 26, b: 26, a: 1 });
    expect(new TinyColor({ c: 0, m: 0, y: 0, k: 90 }).toRgb()).toEqual({
      r: 26,
      g: 26,
      b: 26,
      a: 1,
    });
  });

  it('should give the exact rgb for the hsl() of every whole percent', () => {
    const wrong: string[] = [];
    for (let h = 0; h < 360; h += 30) {
      for (let s = 0; s <= 100; s++) {
        for (let l = 0; l <= 100; l++) {
          const { r, g, b } = new TinyColor(`hsl(${h}, ${s}%, ${l}%)`).toRgb();
          const exact = hslToRgbExact(h, s, l);
          if (r !== exact[0] || g !== exact[1] || b !== exact[2]) {
            wrong.push(`hsl(${h}, ${s}%, ${l}%) gave ${[r, g, b]}, not ${exact}`);
          }
        }
      }
    }

    expect(wrong.slice(0, 10)).toEqual([]);
  });

  it('should give the exact rgb for the hsv() of every whole percent', () => {
    const wrong: string[] = [];
    for (let h = 0; h < 360; h += 30) {
      for (let s = 0; s <= 100; s++) {
        for (let v = 0; v <= 100; v++) {
          const { r, g, b } = new TinyColor(`hsv(${h}, ${s}%, ${v}%)`).toRgb();
          const exact = hsvToRgbExact(h, s, v);
          if (r !== exact[0] || g !== exact[1] || b !== exact[2]) {
            wrong.push(`hsv(${h}, ${s}%, ${v}%) gave ${[r, g, b]}, not ${exact}`);
          }
        }
      }
    }

    expect(wrong.slice(0, 10)).toEqual([]);
  });

  it('should give the exact rgb for the cmyk() of every whole percent', () => {
    const wrong: string[] = [];
    for (let c = 0; c <= 100; c++) {
      for (let k = 0; k <= 100; k++) {
        // m and y move against c so every channel sees the whole range
        const m = 100 - c;
        const y = (c * 37) % 101;
        const { r, g, b } = new TinyColor(`cmyk(${c}, ${m}, ${y}, ${k})`).toRgb();
        const exact = cmykToRgbExact(c, m, y, k);
        if (r !== exact[0] || g !== exact[1] || b !== exact[2]) {
          wrong.push(`cmyk(${c}, ${m}, ${y}, ${k}) gave ${[r, g, b]}, not ${exact}`);
        }
      }
    }

    expect(wrong.slice(0, 10)).toEqual([]);
  });
});

/** `numerator / denominator` rounded half up, in integer arithmetic */
function roundHalfUp(numerator: number, denominator: number): number {
  return Math.floor((2 * numerator + denominator) / (2 * denominator));
}

/**
 * The hue of rgb() in whole degrees as CSS Color 4 describes it, in integer arithmetic. A hue from
 * 359.5 up rounds to 360, which the strings keep.
 */
function hueExact(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  if (!delta) {
    return 0;
  }

  // Where the hue sits on the color wheel in sixths of delta, from 0 to 6 * delta
  const sixths =
    max === r
      ? (g - b + 6 * delta) % (6 * delta)
      : max === g
        ? 2 * delta + b - r
        : 4 * delta + r - g;
  return roundHalfUp(60 * sixths, delta);
}

/** The whole numbers in a color string, such as [123, 100, 24] in hsl(123, 100%, 24%) */
function numbers(text: string): number[] {
  return (text.match(/\d+/g) ?? []).map(Number);
}

describe('Exact halves in the output of hsl(), hsv() and cmyk()', () => {
  // The hue of rgb(0 120 5) is 122.5, which came out as 122.49999999999999. The HSL saturation of
  // rgb(7 7 105) is 87.5%, which came out as 87.49999999999999, the HSV one of rgb(17 17 40) is 57.5%
  // and the cyan of #050808 is 37.5%, which came out as 37.499999999999865.
  it('should round a hue, saturation and cyan that are exactly half up', () => {
    expect(new TinyColor({ r: 0, g: 120, b: 5 }).toHslString()).toBe('hsl(123, 100%, 24%)');
    expect(new TinyColor({ r: 0, g: 120, b: 5 }).toHsvString()).toBe('hsv(123, 100%, 47%)');
    expect(new TinyColor({ r: 7, g: 7, b: 105 }).toHslString()).toBe('hsl(240, 88%, 22%)');
    expect(new TinyColor({ r: 17, g: 17, b: 40 }).toHsvString()).toBe('hsv(240, 58%, 16%)');
    expect(new TinyColor('#050808').toCmyk()).toEqual({ c: 38, m: 0, y: 0, k: 97 });
    expect(new TinyColor('#050808').toCmykString()).toBe('cmyk(38, 0, 0, 97)');
    expect(new TinyColor('rgba(0, 120, 5, 0.5)').toHslString()).toBe('hsla(123, 100%, 24%, 0.5)');
  });

  it('should give the exact hue for every distance and position on the color wheel', () => {
    const wrong: string[] = [];
    // The hue does not depend on the smallest channel, which stays 0 here
    for (let delta = 1; delta <= 255; delta++) {
      for (let t = 0; t <= delta; t++) {
        for (const [r, g, b] of [
          [delta, t, 0],
          [delta, 0, t],
          [t, delta, 0],
          [0, delta, t],
          [0, t, delta],
          [t, 0, delta],
        ]) {
          const color = new TinyColor({ r, g, b });
          const exact = hueExact(r, g, b);
          const hsl = numbers(color.toHslString())[0];
          const hsv = numbers(color.toHsvString())[0];
          if (hsl !== exact || hsv !== exact) {
            wrong.push(`rgb(${r} ${g} ${b}) gave ${hsl} and ${hsv}, not ${exact}`);
          }
        }
      }
    }

    expect(wrong.slice(0, 10)).toEqual([]);
  });

  it('should give the exact saturation and lightness for every largest and smallest channel', () => {
    const wrong: string[] = [];
    for (let max = 0; max <= 255; max++) {
      for (let min = 0; min <= max; min++) {
        const color = new TinyColor({ r: max, g: min, b: min });
        const sum = max + min;
        // hsl s and l, hsv s and v
        const exact = [
          sum && sum < 510 ? roundHalfUp(100 * (max - min), sum <= 255 ? sum : 510 - sum) : 0,
          roundHalfUp(100 * sum, 510),
          max ? roundHalfUp(100 * (max - min), max) : 0,
          roundHalfUp(100 * max, 255),
        ];
        const [, hslS, hslL] = numbers(color.toHslString());
        const [, hsvS, hsvV] = numbers(color.toHsvString());
        const actual = [hslS, hslL, hsvS, hsvV];
        if (actual.some((value, i) => value !== exact[i])) {
          wrong.push(`rgb(${max} ${min} ${min}) gave ${actual}, not ${exact}`);
        }
      }
    }

    expect(wrong.slice(0, 10)).toEqual([]);
  });

  it('should give the exact cmyk percents for every largest channel and every channel', () => {
    const wrong: string[] = [];
    expect(new TinyColor({ r: 0, g: 0, b: 0 }).toCmyk()).toEqual({ c: 0, m: 0, y: 0, k: 100 });
    for (let max = 1; max <= 255; max++) {
      for (let channel = 0; channel <= max; channel++) {
        const exact = roundHalfUp(100 * (max - channel), max);
        const k = roundHalfUp(100 * (255 - max), 255);
        // The channel comes first, then second, then third
        for (const [r, g, b] of [
          [channel, max, max],
          [max, channel, max],
          [max, max, channel],
        ]) {
          const { c, m, y, k: gotK } = new TinyColor({ r, g, b }).toCmyk();
          const got = [c, m, y, gotK];
          const want = [r === max ? 0 : exact, g === max ? 0 : exact, b === max ? 0 : exact, k];
          if (got.some((value, i) => value !== want[i])) {
            wrong.push(`rgb(${r} ${g} ${b}) gave ${got}, not ${want}`);
          }
        }
      }
    }

    expect(wrong.slice(0, 10)).toEqual([]);
  });
});
