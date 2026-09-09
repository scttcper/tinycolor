import { describe, test } from 'vitest';

import { mostReadable, readability, TinyColor } from '../src/public_api.js';

describe('parsing', () => {
  test('hex string', async ({ bench }) => {
    await bench('hex string', () => new TinyColor('#3498db')).run();
  });
  test('hex string without hash', async ({ bench }) => {
    await bench('hex string without hash', () => new TinyColor('3498db')).run();
  });
  test('RGB string', async ({ bench }) => {
    await bench('RGB string', () => new TinyColor('rgb(52, 152, 219)')).run();
  });
  test('HSL string', async ({ bench }) => {
    await bench('HSL string', () => new TinyColor('hsl(204, 70%, 53%)')).run();
  });
  test('named color', async ({ bench }) => {
    await bench('named color', () => new TinyColor('rebeccapurple')).run();
  });
  test('RGB object', async ({ bench }) => {
    await bench('RGB object', () => new TinyColor({ r: 52, g: 152, b: 219 })).run();
  });
});

describe('formatting a parsed color', () => {
  const color = new TinyColor('#3498db');

  test('hex string', async ({ bench }) => {
    await bench('hex string', () => color.toHexString()).run();
  });
  test('hex8 string', async ({ bench }) => {
    const transparentColor = new TinyColor('#3498db80');
    await bench('hex8 string', () => transparentColor.toHex8String()).run();
  });
  test('RGB string', async ({ bench }) => {
    await bench('RGB string', () => color.toRgbString()).run();
  });
  test('HSL string', async ({ bench }) => {
    await bench('HSL string', () => color.toHslString()).run();
  });
  test('HSV object', async ({ bench }) => {
    await bench('HSV object', () => color.toHsv()).run();
  });
});

describe('end-to-end workflows', () => {
  test('parse and format', async ({ bench }) => {
    await bench('parse and format', () => new TinyColor('hsl(204, 70%, 53%)').toHexString()).run();
  });
  test('lighten and saturate', async ({ bench }) => {
    await bench('lighten and saturate', () =>
      new TinyColor('#3498db').lighten(10).saturate(15).toHexString(),
    ).run();
  });
  test('mix two colors', async ({ bench }) => {
    await bench('mix two colors', () =>
      new TinyColor('#3498db').mix('#e74c3c', 50).toHexString(),
    ).run();
  });
  test('generate an analogous palette', async ({ bench }) => {
    await bench('generate an analogous palette', () =>
      new TinyColor('#3498db').analogous().map(color => color.toHexString()),
    ).run();
  });
  test('calculate contrast', async ({ bench }) => {
    await bench('calculate contrast', () => readability('#3498db', '#ffffff')).run();
  });
  test('select readable text', async ({ bench }) => {
    await bench('select readable text', () =>
      mostReadable('#3498db', ['#ffffff', '#000000', '#333333']),
    ).run();
  });
});
