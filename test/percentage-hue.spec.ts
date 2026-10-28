import { describe, expect, it } from 'vitest';

import { TinyColor } from '../src/public_api.js';

describe('Percentage hue', () => {
  it.each([
    ['hsl(0%, 100%, 50%)', '#ff0000'],
    ['hsl(1.0%, 100%, 50%)', '#ff0f00'],
    ['hsl(25%, 100%, 50%)', '#80ff00'],
    ['hsl(50%, 100%, 50%)', '#00ffff'],
    ['hsla(75%, 100%, 50%, 0.5)', '#7f00ff80'],
    ['hsl(100%, 100%, 50%)', '#ff0000'],
    ['hsv(0%, 100%, 100%)', '#ff0000'],
    ['hsv(1.0%, 100%, 100%)', '#ff0f00'],
    ['hsv(25%, 100%, 100%)', '#80ff00'],
    ['hsv(50%, 100%, 100%)', '#00ffff'],
    ['hsva(75%, 100%, 100%, 0.5)', '#8000ff80'],
    ['hsv(100%, 100%, 100%)', '#ff0000'],
  ])('should convert the hue percentage in %s', (input, expected) => {
    const color = new TinyColor(input);
    expect(color.isValid).toBe(true);
    expect(color.toHex8String()).toBe(expected.length === 7 ? `${expected}ff` : expected);
  });

  it.each([
    [{ h: '1.0%', s: '100%', l: '50%' }, '#ff0f00'],
    [{ h: '1.0%', s: '100%', v: '100%' }, '#ff0f00'],
    [{ h: '50%', s: '100%', l: '50%' }, '#00ffff'],
    [{ h: '50%', s: '100%', v: '100%' }, '#00ffff'],
    [{ h: '12.5%', s: '100%', l: '50%' }, '#ffbf00'],
    [{ h: '12.5%', s: '100%', v: '100%' }, '#ffbf00'],
  ])('should convert hue percentages in object input %j', (input, expected) => {
    expect(new TinyColor(input).toHexString()).toBe(expected);
  });

  it.each([
    ['hsl(-25%, 100%, 50%)', '#7f00ff'],
    ['hsv(125%, 100%, 100%)', '#80ff00'],
    ['hsl(-90, 100%, 50%)', '#7f00ff'],
    ['hsv(450, 100%, 100%)', '#80ff00'],
  ])('should wrap the hue in %s', (input, expected) => {
    expect(new TinyColor(input).toHexString()).toBe(expected);
  });
});
