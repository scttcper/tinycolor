import { expect, it } from 'vitest';

import { TinyColor } from '../src/public_api.js';

it('parses CSS hue angles and exponents', () => {
  expect(new TinyColor('hsl(5e-1turn 100% 50%)').toHexString()).toBe('#00ffff');
  expect(new TinyColor('rgb(0 0 0 / 1e-7)').getAlpha()).toBe(1e-7);
  expect(new TinyColor('rgb(0 0 0 / 1e+)').isValid).toBe(false);
  expect(new TinyColor('rgb(255 0 0 / none)').toHex8String()).toBe('#ff0000ff');
});

it('clones the exact color and keeps its input independent', () => {
  expect(new TinyColor('#0008').clone().toHex8String()).toBe('#00000088');
  const input = { l: 0, c: 0, h: 17 };
  const clone = new TinyColor(input).clone();
  input.h = 200;
  expect(clone.toOklch().h).toBe(17);
});

it.each([
  ['analogous', 0, 1],
  ['monochromatic', 2.5, 3],
] as const)('%s handles a count of %s', (method, count, length) => {
  const color = new TinyColor('red');
  const push = Array.prototype.push;
  let palette: TinyColor[];
  let unbounded: TinyColor[];
  try {
    // Stop a regressed loop before it can exhaust the test worker's memory.
    Array.prototype.push = function (...items: unknown[]) {
      if (this.length >= 3 && items[0] instanceof TinyColor) {
        throw new Error('Palette grew past the expected length');
      }
      return push.apply(this, items);
    };
    palette = color[method](count);
    unbounded = color[method](Infinity);
  } finally {
    Array.prototype.push = push;
  }
  expect(palette).toHaveLength(length);
  expect(unbounded).toHaveLength(method === 'analogous' ? 1 : 0);
});

it('keeps HSL ratio precision when applying a modification', () => {
  expect(new TinyColor('#123457').greyscale().toHexString()).toBe('#353535');
});
