import { describe, expect, it } from 'vitest';

import { inputToRGB, oklchToRgb, rgbToOklch, TinyColor } from '../src/public_api.js';

// Reference values from Color.js 0.5.2, by the editors of CSS Color 4
const references = [
  ['#ff0000', 0.6279553639214311, 0.2576833038053606, 29.233880279627897],
  ['#00ff00', 0.8664396175234368, 0.2948272245426958, 142.4953450414439],
  ['#0000ff', 0.45201371817442365, 0.3132143886344849, 264.0520226163699],
  ['#ffff00', 0.9679827267927991, 0.2110058737497979, 109.76923612816614],
  ['#3498db', 0.6530915215303427, 0.1347021448282337, 242.68666737573582],
  ['#663399', 0.4402717960022945, 0.16029599938108785, 303.37298848855636],
] as const;

describe('OKLCH', () => {
  it.each(references)('should convert %s to OKLCH', (hex, l, c, h) => {
    const oklch = new TinyColor(hex).toOklch();
    expect(oklch.l).toBeCloseTo(l, 12);
    expect(oklch.c).toBeCloseTo(c, 12);
    expect(oklch.h).toBeCloseTo(h, 9);
    expect(oklch.a).toBe(1);
  });

  it.each(references)('should convert OKLCH back to %s', (hex, l, c, h) => {
    const color = new TinyColor({ l, c, h });
    expect(color.isValid).toBe(true);
    expect(color.format).toBe('oklch');
    expect(color.toHexString()).toBe(hex);
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
    const gray = new TinyColor('#808080').toOklch();
    expect(gray.l).toBeCloseTo(0.5998708056221469, 12);
    expect(gray.c).toBe(0);
    expect(gray.h).toBe(0);
    expect(new TinyColor('#fff').toOklchString()).toBe('oklch(100% 0 0)');
    expect(new TinyColor('#808080').toOklchString()).toBe('oklch(59.987% 0 0)');
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
    '  oklch(  70%   0.1   90  )  ',
    'oklch(70%, 0.1, 90)',
    'oklch 70% 0.1 90',
  ])('should parse %s', input => {
    const color = new TinyColor(input);
    expect(color.isValid).toBe(true);
    expect(color.format).toBe('oklch');
    expect(color.toHexString()).toBe('#b79c51');
    const { l, c, h } = color.toOklch();
    expect(l).toBeCloseTo(0.7, 12);
    expect(c).toBeCloseTo(0.1, 12);
    expect(h).toBeCloseTo(90, 12);
  });

  it.each([
    ['oklch(70% 0.1 90 / 0.5)', 0.5],
    ['oklch(70% 0.1 90 / 50%)', 0.5],
    ['oklch(70% 0.1 90/.25)', 0.25],
    ['oklch(70% 0.1 90, 0.25)', 0.25],
    ['oklch(70% 0.1 90 / none)', 0],
    ['oklch(70% 0.1 90)', 1],
  ])('should parse the alpha in %s', (input, alpha) => {
    expect(new TinyColor(input).getAlpha()).toBe(alpha);
  });

  it('should treat none as 0', () => {
    expect(new TinyColor('oklch(70% none none)').toOklch()).toEqual({ l: 0.7, c: 0, h: 0, a: 1 });
    expect(new TinyColor('oklch(none 0.1 90)').toHexString()).toBe('#000000');
  });

  it('should clamp lightness and chroma like CSS', () => {
    expect(new TinyColor('oklch(120% 0.1 90)').toHexString()).toBe('#ffffff');
    expect(new TinyColor('oklch(-10% 0.1 90)').toHexString()).toBe('#000000');
    expect(new TinyColor('oklch(50% -0.1 90)').toOklch()).toEqual({ l: 0.5, c: 0, h: 90, a: 1 });
  });

  it.each([
    'oklch()',
    'oklch(70% 0.1)',
    'oklch(70% 0.1 90 0.5 1)',
    'oklch(70px 0.1 90)',
    'oklch(70% 0.1px 90)',
    'oklch(70% 0.1 90%)',
    'oklch(70% 0.1 ninety)',
    'oklch(70% 0.1 90 / )',
    'oklch(calc(70%) 0.1 90)',
  ])('should reject %s', input => {
    const color = new TinyColor(input);
    expect(color.isValid).toBe(false);
    expect(color.toHexString()).toBe('#000000');
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

  // Expected sRGB from Color.js 0.5.2 toGamut({ method: 'css' }). Clipping each channel instead
  // would shift the hue, oklch(40% 0.3 260) would clip to #0000e4.
  it.each([
    ['oklch(70% 0.3 145)', '#00c300'],
    ['oklch(60% 0.35 300)', '#a032ff'],
    ['oklch(90% 0.25 100)', '#ffdf00'],
    ['oklch(40% 0.3 260)', '#0027c9'],
    ['oklch(80% 0.2 200)', '#00dae5'],
    ['oklch(84.1% 0.238 128.85)', '#9ae600'],
  ])('should gamut map %s into sRGB as %s', (input, hex) => {
    const color = new TinyColor(input);
    expect(color.isValid).toBe(true);
    expect(color.toHexString()).toBe(hex);
  });

  it('should keep OKLCH colors that sRGB cannot show', () => {
    const color = new TinyColor('oklch(70% 0.3 145)');
    expect(color.toOklch()).toEqual({ l: 0.7, c: 0.3, h: 145, a: 1 });
    expect(color.toOklchString()).toBe('oklch(70% 0.3 145)');
    expect(color.toString()).toBe('oklch(70% 0.3 145)');
    expect(color.clone().toOklch()).toEqual({ l: 0.7, c: 0.3, h: 145, a: 1 });
    expect(new TinyColor(color.toOklch()).toOklchString()).toBe('oklch(70% 0.3 145)');

    // sRGB output and modifications use the gamut mapped color
    expect(color.toRgbString()).toBe('rgb(0, 195, 0)');
    expect(color.spin(0).toHexString()).toBe('#00c300');

    color.setAlpha(0.5);
    expect(color.toOklchString()).toBe('oklch(70% 0.3 145 / 0.5)');
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

  it('should export the conversion functions', () => {
    const { l, c, h } = rgbToOklch(255, 0, 0);
    expect(l).toBeCloseTo(0.6279553639214311, 12);
    expect(c).toBeCloseTo(0.2576833038053606, 12);
    expect(h).toBeCloseTo(29.233880279627897, 9);
    const rgb = oklchToRgb(l, c, h);
    expect(rgb.r).toBeCloseTo(255, 9);
    expect(rgb.g).toBeCloseTo(0, 9);
    expect(rgb.b).toBeCloseTo(0, 9);
    expect(oklchToRgb(1.2, 0.1, 90)).toEqual({ r: 255, g: 255, b: 255 });
    expect(oklchToRgb(0, 0.1, 90)).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('should round trip 8 bit colors through OKLCH', () => {
    const failures: string[] = [];
    for (let r = 0; r < 256; r += 15) {
      for (let g = 0; g < 256; g += 15) {
        for (let b = 0; b < 256; b += 15) {
          const color = new TinyColor({ r, g, b });
          const hex = color.toHexString();
          if (new TinyColor(color.toOklchString()).toHexString() !== hex) {
            failures.push(`${hex} ${color.toOklchString()}`);
          }

          if (new TinyColor(color.toOklch()).toHexString() !== hex) {
            failures.push(`${hex} ${JSON.stringify(color.toOklch())}`);
          }
        }
      }
    }

    expect(failures).toEqual([]);
  });
});
