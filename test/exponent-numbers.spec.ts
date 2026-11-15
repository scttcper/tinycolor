import { describe, expect, it } from 'vitest';

import { TinyColor } from '../src/public_api.js';

describe('Numbers with an exponent', () => {
  it.each([
    // String(0.0000001) === '1e-7', so built strings can carry an exponent
    ['rgba(0, 0, 0, 1e-7)', { r: 0, g: 0, b: 0, a: 1e-7 }],
    ['rgba(255, 0, 0, 5e-1)', { r: 255, g: 0, b: 0, a: 0.5 }],
    ['rgb(255 0 0 / 5E-1)', { r: 255, g: 0, b: 0, a: 0.5 }],
    ['rgb(1e2, 0, 0)', { r: 100, g: 0, b: 0, a: 1 }],
    ['rgb(1.5e2 0 0)', { r: 150, g: 0, b: 0, a: 1 }],
    ['rgb(1e1%, 0%, 0%)', { r: 26, g: 0, b: 0, a: 1 }],
    ['hsl(1.2e2, 100%, 50%)', { r: 0, g: 255, b: 0, a: 1 }],
    ['hsl(120 100% 50% / 1e-1)', { r: 0, g: 255, b: 0, a: 0.1 }],
    ['hsv(0, 1e2%, 1e2%)', { r: 255, g: 0, b: 0, a: 1 }],
    ['cmyk(0, 1e2, 1e2, 0)', { r: 255, g: 0, b: 0, a: 1 }],
  ])('should parse %s', (input, expected) => {
    const color = new TinyColor(input);
    expect(color.isValid).toBe(true);
    expect(color.toRgb()).toEqual(expected);
  });

  it.each([
    [
      { r: '1e2', g: 0, b: 0 },
      { r: 100, g: 0, b: 0, a: 1 },
    ],
    [
      { h: 0, s: '1e2%', l: '5e1%' },
      { r: 255, g: 0, b: 0, a: 1 },
    ],
  ])('should parse object %j', (input, expected) => {
    const color = new TinyColor(input);
    expect(color.isValid).toBe(true);
    expect(color.toRgb()).toEqual(expected);
  });

  it.each(['rgb(1e, 0, 0)', 'rgb(1e+, 0, 0)', 'rgb(e2, 0, 0)'])('should keep %s invalid', input => {
    expect(new TinyColor(input).isValid).toBe(false);
  });
});
