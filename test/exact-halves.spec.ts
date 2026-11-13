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

describe('Exact halves in hsl() and hsv()', () => {
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
  ])('%s is %s', (input, hex) => {
    expect(new TinyColor(input).toHexString()).toBe(hex);
  });

  it('should round the objects the same way', () => {
    expect(new TinyColor({ h: 60, s: 1, l: 0.25 }).toHexString()).toBe('#808000');
    expect(new TinyColor({ h: 0, s: 0.5, l: 0.2 }).toRgb()).toEqual({ r: 77, g: 26, b: 26, a: 1 });
    expect(new TinyColor({ h: 0, s: 0.8, v: 0.5 }).toRgb()).toEqual({ r: 128, g: 26, b: 26, a: 1 });
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
});
