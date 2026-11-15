import { describe, expect, it } from 'vitest';

import { TinyColor } from '../src/public_api.js';

describe('Hue angle units', () => {
  it.each([
    ['hsl(120deg 50% 50%)', '#40bf40'],
    ['hsl(120deg, 50%, 50%)', '#40bf40'],
    ['hsla(120deg, 50%, 50%, 0.5)', '#40bf4080'],
    ['hsl(120DEG 50% 50%)', '#40bf40'],
    ['hsl(0.5turn 50% 50%)', '#40bfbf'],
    ['hsl(200grad 50% 50%)', '#40bfbf'],
    ['hsl(3.141592653589793rad 50% 50%)', '#40bfbf'],
    ['hsl(-120deg 50% 50%)', '#4040bf'],
    ['hsl(1.5turn 50% 50%)', '#40bfbf'],
    ['hsl(120.5deg 50% 50% / 25%)', '#40bf4140'],
    ['hsv(120deg 100% 100%)', '#00ff00'],
    ['hsv(0.25turn, 100%, 100%)', '#80ff00'],
    ['hsva(0.25turn, 100%, 100%, 0.5)', '#80ff0080'],
  ])('should convert the hue angle in %s', (input, expected) => {
    const color = new TinyColor(input);
    expect(color.isValid).toBe(true);
    expect(color.toHex8String()).toBe(expected.length === 7 ? `${expected}ff` : expected);
  });

  it.each([
    [{ h: '120deg', s: '50%', l: '50%' }, '#40bf40'],
    [{ h: '0.5turn', s: '50%', l: '50%' }, '#40bfbf'],
    [{ h: '200grad', s: '50%', l: '50%' }, '#40bfbf'],
    [{ h: '0.25turn', s: '100%', v: '100%' }, '#80ff00'],
  ])('should convert hue angles in object input %j', (input, expected) => {
    expect(new TinyColor(input).toHexString()).toBe(expected);
  });

  it.each(['hsl(120px 50% 50%)', 'hsl(50%deg 50% 50%)', 'hsl(120deg% 50% 50%)'])(
    'should not accept %s',
    input => {
      expect(new TinyColor(input).isValid).toBe(false);
    },
  );

  it('should keep the format of angle hues', () => {
    expect(new TinyColor('hsl(120deg 50% 50%)').format).toBe('hsl');
    expect(new TinyColor('hsl(0.5turn 50% 50%)').toHslString()).toBe('hsl(180, 50%, 50%)');
  });
});
