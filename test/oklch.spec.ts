import Color from 'colorjs.io';
import { describe, expect, it } from 'vitest';

import { inputToRGB, oklchToRgb, TinyColor } from '../src/public_api.js';

// OKLCH is compared against Color.js, from the editors of the CSS Color 4 spec

/** Every 15th value of each sRGB channel */
function srgbColors(): Array<[number, number, number]> {
  const colors: Array<[number, number, number]> = [];
  for (let r = 0; r < 256; r += 15) {
    for (let g = 0; g < 256; g += 15) {
      for (let b = 0; b < 256; b += 15) {
        colors.push([r, g, b]);
      }
    }
  }

  return colors;
}

/** OKLCH across lightness, chroma and hue. Most of the high chroma colors are outside of sRGB. */
function oklchColors(): Array<[number, number, number]> {
  const colors: Array<[number, number, number]> = [];
  for (let l = 0; l <= 20; l++) {
    for (let c = 0; c <= 10; c++) {
      for (let h = 0; h < 360; h += 15) {
        colors.push([l / 20, c * 0.04, h]);
      }
    }
  }

  return colors;
}

/** Color.js gamut mapped into sRGB with the CSS Color 4 algorithm. toGamut() changes the color, so clone it. */
function colorjsSrgb(color: Color): Color {
  return color.clone().toGamut({ space: 'srgb', method: 'css' }).to('srgb');
}

function colorjsHex(color: Color): string {
  return colorjsSrgb(color).toString({ format: 'hex', collapse: false });
}

function hueDifference(a: number, b: number): number {
  const difference = Math.abs(a - b) % 360;
  return Math.min(difference, 360 - difference);
}

describe('OKLCH', () => {
  it('should convert sRGB to OKLCH like Color.js', () => {
    const failures: string[] = [];
    for (const [r, g, b] of srgbColors()) {
      const ours = new TinyColor({ r, g, b }).toOklch();
      const [l, c, h] = new Color('srgb', [r / 255, g / 255, b / 255]).to('oklch').coords;
      // Color.js keeps floating point noise as the chroma of grays, tinycolor rounds it to 0
      const matches =
        Math.abs(ours.l - (l ?? 0)) < 1e-12 &&
        ((c ?? 0) <= 0.000004
          ? ours.c === 0 && ours.h === 0
          : Math.abs(ours.c - c!) < 1e-12 && hueDifference(ours.h, h!) < 1e-9);
      if (!matches) {
        failures.push(`rgb(${r}, ${g}, ${b}) ${JSON.stringify(ours)} ${JSON.stringify([l, c, h])}`);
      }
    }

    expect(failures).toEqual([]);
  });

  it('should gamut map OKLCH into sRGB like Color.js', () => {
    const failures: string[] = [];
    let outsideSrgb = 0;
    for (const [l, c, h] of oklchColors()) {
      const color = new Color('oklch', [l, c, h]);
      if (!color.inGamut('srgb')) {
        outsideSrgb++;
      }

      // Color.js can leave tiny out of range values, tinycolor clips them
      const expected = colorjsSrgb(color).coords.map(v => Math.min(1, Math.max(0, v!)) * 255);
      const ours = oklchToRgb(l, c, h);
      const channels = [ours.r, ours.g, ours.b];
      if (channels.some((channel, i) => Math.abs(channel - expected[i]) > 1e-9)) {
        failures.push(`oklch(${l} ${c} ${h}) ${channels} ${expected}`);
      }

      if (new TinyColor({ l, c, h }).toHexString() !== colorjsHex(color)) {
        failures.push(`oklch(${l} ${c} ${h}) ${new TinyColor({ l, c, h }).toHexString()}`);
      }
    }

    expect(outsideSrgb).toBeGreaterThan(3000);
    expect(failures).toEqual([]);
  });

  it.each([
    'oklch(70% 0.1 90)',
    'oklch(0.7 0.1 90)',
    'oklch(.7 .1 90)',
    'oklch(7e-1 1e-1 9e1)',
    'oklch(70% 25% 90)',
    'oklch(70% 0.1 90deg)',
    'oklch(70% 0.1 100grad)',
    'oklch(70% 0.1 0.25turn)',
    'oklch(70% 0.1 1.5707963267948966rad)',
    'oklch(70% 0.1 450)',
    'oklch(70% 0.1 -270)',
    'OKLCH(70% 0.1 90)',
    'oklch(  70%   0.1   90  )',
    'oklch(70%, 0.1, 90)',
    'oklch(70% none none)',
    'oklch(none 0.1 90)',
    'oklch(120% 0.1 90)',
    'oklch(-10% 0.1 90)',
    'oklch(50% -0.1 90)',
    'oklch(70% 0.1 90 / 0.5)',
    'oklch(70% 0.1 90 / 50%)',
    'oklch(70% 0.1 90/.25)',
    'oklch(70% 0.1 90 / none)',
    'oklch(62.796% 0.25768 29.234)',
    'oklch(70% 0.3 145)',
    'oklch(84.1% 0.238 128.85)',
  ])('should parse %s like Color.js', input => {
    const color = new TinyColor(input);
    const expected = new Color(input);
    expect(color.isValid).toBe(true);
    expect(color.format).toBe('oklch');
    expect(color.toHexShortString()).toBe(colorjsHex(expected));

    // Color.js keeps values as written. CSS clamps lightness and chroma, and `none` is 0.
    const [l, c, h] = expected.coords;
    const oklch = color.toOklch();
    expect(oklch.l).toBeCloseTo(Math.min(1, Math.max(0, l ?? 0)), 12);
    expect(oklch.c).toBeCloseTo(Math.max(0, c ?? 0), 12);
    expect(hueDifference(oklch.h, h ?? 0)).toBeCloseTo(0, 9);
    expect(oklch.a).toBe(expected.alpha ?? 0);
  });

  it('should write OKLCH strings that Color.js reads as the same color', () => {
    const failures: string[] = [];
    for (const [r, g, b] of srgbColors()) {
      const color = new TinyColor({ r, g, b });
      if (colorjsHex(new Color(color.toOklchString())) !== color.toHexString()) {
        failures.push(`${color.toHexString()} ${color.toOklchString()}`);
      }
    }

    expect(failures).toEqual([]);
    const transparent = new TinyColor('#3498db80');
    expect(colorjsHex(new Color(transparent.toOklchString()))).toBe('#3498db80');
  });

  it.each(['oklch()', 'oklch(70% 0.1)', 'oklch(70% 0.1 90 0.5 1)', 'oklch(70% 0.1 90%)'])(
    'should reject %s like Color.js',
    input => {
      expect(new TinyColor(input).isValid).toBe(false);
      expect(() => new Color(input)).toThrow();
    },
  );

  // Color.js keeps these as strings like "70px" instead of rejecting them
  it.each([
    'oklch(70px 0.1 90)',
    'oklch(70% 0.1px 90)',
    'oklch(70% 0.1 ninety)',
    'oklch(70% 0.1 90 / )',
    'oklch(calc(70%) 0.1 90)',
  ])('should reject %s', input => {
    const color = new TinyColor(input);
    expect(color.isValid).toBe(false);
    expect(color.toHexString()).toBe('#000000');
  });

  // Color.js only reads the CSS syntax
  it.each([
    'oklch 70% 0.1 90',
    '  oklch(70% 0.1 90)  ',
    'oklch(70% 0.1 90',
    'oklch(70% 0.1 90 0.5)',
  ])('should allow %s like the other color functions', input => {
    const color = new TinyColor(input);
    expect(color.isValid).toBe(true);
    expect(color.toHexString()).toBe(new TinyColor('oklch(70% 0.1 90)').toHexString());
  });

  it('should format OKLCH strings', () => {
    expect(new TinyColor('red').toOklchString()).toBe('oklch(62.796% 0.25768 29.234)');
    expect(new TinyColor('#3498db').toOklchString()).toBe('oklch(65.309% 0.1347 242.687)');
    expect(new TinyColor('#ff000080').toOklchString()).toBe('oklch(62.796% 0.25768 29.234 / 0.5)');
    expect(new TinyColor('red').toString('oklch')).toBe('oklch(62.796% 0.25768 29.234)');
  });

  it('should have no chroma or hue for grays', () => {
    expect(new TinyColor('#fff').toOklch()).toEqual({ l: 1, c: 0, h: 0, a: 1 });
    expect(new TinyColor('#000').toOklch()).toEqual({ l: 0, c: 0, h: 0, a: 1 });
    expect(new TinyColor('#808080').toOklch()).toMatchObject({ c: 0, h: 0 });
    expect(new TinyColor('#fff').toOklchString()).toBe('oklch(100% 0 0)');
    expect(new TinyColor('#808080').toOklchString()).toBe('oklch(59.987% 0 0)');
  });

  it('should accept OKLCH objects', () => {
    expect(new TinyColor({ l: 0.7, c: 0.1, h: 90 }).toHexString()).toBe('#b79c51');
    expect(new TinyColor({ l: '70%', c: '25%', h: '0.25turn', a: 0.5 }).toOklch()).toEqual({
      l: 0.7,
      c: 0.1,
      h: 90,
      a: 0.5,
    });
    expect(new TinyColor({ l: '70px', c: 0.1, h: 90 }).isValid).toBe(false);
    expect(new TinyColor({ l: 0.7, c: Infinity, h: 90 }).isValid).toBe(false);
  });

  it('should format as OKLCH when created from OKLCH', () => {
    const color = new TinyColor('oklch(0.7 0.1 90deg / 50%)');
    expect(color.format).toBe('oklch');
    expect(color.toString()).toBe('oklch(70% 0.1 90 / 0.5)');
    expect(color.toString('hex8')).toBe('#b79c5180');
  });

  it('should keep OKLCH colors that sRGB cannot show', () => {
    const color = new TinyColor('oklch(70% 0.3 145)');
    expect(color.toOklch()).toEqual({ l: 0.7, c: 0.3, h: 145, a: 1 });
    expect(color.toOklchString()).toBe('oklch(70% 0.3 145)');
    expect(color.toString()).toBe('oklch(70% 0.3 145)');
    expect(color.clone().toOklch()).toEqual({ l: 0.7, c: 0.3, h: 145, a: 1 });
    expect(new TinyColor(color.toOklch()).toOklchString()).toBe('oklch(70% 0.3 145)');

    // sRGB output and modifications use the gamut mapped color
    expect(color.toHexString()).toBe(colorjsHex(new Color('oklch(70% 0.3 145)')));
    expect(color.spin(0).toHexString()).toBe(color.toHexString());

    color.setAlpha(0.5);
    expect(color.toOklchString()).toBe('oklch(70% 0.3 145 / 0.5)');
  });

  it('should keep OKLCH input when the format is overridden', () => {
    const color = new TinyColor('oklch(70% 0.3 145)', { format: 'hex' });
    expect(color.toString()).toBe(color.toHexString());
    expect(color.toOklch()).toEqual({ l: 0.7, c: 0.3, h: 145, a: 1 });
    expect(new TinyColor({ l: 0.7, c: 0.3, h: 145 }, { format: 'rgb' }).toOklchString()).toBe(
      'oklch(70% 0.3 145)',
    );
    // Overriding the format of other input doesn't make it OKLCH
    expect(new TinyColor('#00c300', { format: 'oklch' }).toOklch().c).not.toBe(0.3);
  });

  it('should use r, g and b once they are changed', () => {
    const color = new TinyColor('oklch(70% 0.3 145)');
    color.r = 255;
    expect(color.toOklchString()).toBe(new TinyColor({ r: 255, g: color.g, b: 0 }).toOklchString());
    expect(color.toOklch().c).not.toBe(0.3);
  });

  it('should return the OKLCH input from inputToRGB', () => {
    expect(inputToRGB('oklch(70% 0.3 145)').oklch).toEqual({ l: 0.7, c: 0.3, h: 145 });
    expect(inputToRGB('red').oklch).toBeUndefined();
  });

  it('should round trip 8 bit colors through OKLCH', () => {
    const failures: string[] = [];
    for (const [r, g, b] of srgbColors()) {
      const color = new TinyColor({ r, g, b });
      const hex = color.toHexString();
      if (new TinyColor(color.toOklchString()).toHexString() !== hex) {
        failures.push(`${hex} ${color.toOklchString()}`);
      }

      if (new TinyColor(color.toOklch()).toHexString() !== hex) {
        failures.push(`${hex} ${JSON.stringify(color.toOklch())}`);
      }
    }

    expect(failures).toEqual([]);
  });
});
