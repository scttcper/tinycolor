import { describe, expect, it } from 'vitest';

import { TinyColor } from '../src/public_api.js';

describe('Decimal percentages', () => {
  it.each([
    ['rgb(1.0%, 0%, 0%)', { r: 3, g: 0, b: 0, a: 1 }],
    ['rgba(0%, 1.00%, 0%, 0.5)', { r: 0, g: 3, b: 0, a: 0.5 }],
    ['rgb(0%, 0%, +1.0%)', { r: 0, g: 0, b: 3, a: 1 }],
    ['hsl(0, 1.0%, 50%)', { r: 129, g: 126, b: 126, a: 1 }],
    ['hsl(0, 100%, 1.00%)', { r: 5, g: 0, b: 0, a: 1 }],
    ['hsv(0, 1.0%, 100%)', { r: 255, g: 252, b: 252, a: 1 }],
    ['hsv(0, 100%, 1.00%)', { r: 3, g: 0, b: 0, a: 1 }],
  ])('should preserve one percent in %s', (input, expected) => {
    const color = new TinyColor(input);
    expect(color.isValid).toBe(true);
    expect(color.toRgb()).toEqual(expected);
  });

  it.each([
    [
      { r: '1.0%', g: 0, b: 0 },
      { r: 3, g: 0, b: 0, a: 1 },
    ],
    [
      { h: 0, s: '1.0%', l: '50%' },
      { r: 129, g: 126, b: 126, a: 1 },
    ],
    [
      { h: 0, s: '100%', v: '1.0%' },
      { r: 3, g: 0, b: 0, a: 1 },
    ],
  ])('should preserve decimal percentages in object input %j', (input, expected) => {
    expect(new TinyColor(input).toRgb()).toEqual(expected);
  });

  it.each(['rgb(1.0, 0, 0)', 'hsl(0, 1.0, 0.5)', 'hsv(0, 1.0, 1.0)'])(
    'should retain fractional input without a percent sign in %s',
    input => {
      expect(new TinyColor(input).toHexString()).toBe('#ff0000');
    },
  );
});
