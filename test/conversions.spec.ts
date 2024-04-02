import { describe, expect, it } from 'vitest';

import { TinyColor } from '../src/public_api.js';

import conversions from './conversions.js';

describe('TinyColor Conversions', () => {
  it('should have color equality', () => {
    expect(conversions.length).toBe(16);
    for (const c of conversions) {
      const tiny = new TinyColor(c.hex);
      expect(tiny.isValid).toBe(true);
      expect(new TinyColor(c.rgb).equals(c.hex)).toBe(true);
      expect(new TinyColor(c.rgb).equals(c.hex8)).toBe(true);
      expect(new TinyColor(c.rgb).equals(c.hsl)).toBe(true);
      expect(new TinyColor(c.rgb).equals(c.hsv)).toBe(true);
      expect(new TinyColor(c.rgb).equals(c.rgb)).toBe(true);
      expect(new TinyColor(c.hex).equals(c.hex)).toBe(true);
      expect(new TinyColor(c.hex).equals(c.hex8)).toBe(true);
      expect(new TinyColor(c.hex).equals(c.hsl)).toBe(true);
      expect(new TinyColor(c.hex).equals(c.hsv)).toBe(true);
      expect(new TinyColor(c.hsl).equals(c.hsv)).toBe(true);
      expect(new TinyColor(c.cmyk).equals(c.hex)).toBe(true);
    }
  });
  it('HSL Object', () => {
    for (const c of conversions) {
      const tiny = new TinyColor(c.hex);
      expect(tiny.toHexString()).toBe(new TinyColor(tiny.toHsl()).toHexString());
    }
  });
  it('HSL String', () => {
    for (const c of conversions) {
      const tiny = new TinyColor(c.hex);
      const input = tiny.toRgb();
      const output = new TinyColor(tiny.toHslString()).toRgb();
      const maxDiff = 2;

      // toHslString red value difference <= ' + maxDiff
      expect(Math.abs(input.r - output.r) <= maxDiff).toBe(true);
      // toHslString green value difference <= ' + maxDiff
      expect(Math.abs(input.g - output.g) <= maxDiff).toBe(true);
      // toHslString blue value difference <= ' + maxDiff
      expect(Math.abs(input.b - output.b) <= maxDiff).toBe(true);
    }
  });
  it('HSV String', () => {
    for (const c of conversions) {
      const tiny = new TinyColor(c.hex);
      const input = tiny.toRgb();
      const output = new TinyColor(tiny.toHsvString()).toRgb();
      const maxDiff = 2;

      // toHsvString red value difference <= ' + maxDiff
      expect(Math.abs(input.r - output.r) <= maxDiff).toBe(true);
      // toHsvString green value difference <= ' + maxDiff
      expect(Math.abs(input.g - output.g) <= maxDiff).toBe(true);
      // toHsvString blue value difference <= ' + maxDiff
      expect(Math.abs(input.b - output.b) <= maxDiff).toBe(true);
    }
  });

  it('HSV Object', () => {
    for (const c of conversions) {
      const tiny = new TinyColor(c.hsv);
      expect(tiny.toHexString()).toBe(new TinyColor(tiny.toHsv()).toHexString());
    }
  });

  it('RGB Object', () => {
    for (const c of conversions) {
      const tiny = new TinyColor(c.hex);
      expect(tiny.toHexString()).toBe(new TinyColor(tiny.toRgb()).toHexString());
    }
  });

  it('RGB String', () => {
    for (const c of conversions) {
      const tiny = new TinyColor(c.hex);
      expect(tiny.toHexString()).toBe(new TinyColor(tiny.toRgbString()).toHexString());
    }
  });

  it('PRGB Object', () => {
    for (const c of conversions) {
      const tiny = new TinyColor(c.hex);
      const input = tiny.toRgb();
      const output = new TinyColor(tiny.toPercentageRgb()).toRgb();
      const maxDiff = 2;

      expect(Math.abs(input.r - output.r)).toBeLessThanOrEqual(maxDiff);
      expect(Math.abs(input.g - output.g)).toBeLessThanOrEqual(maxDiff);
      expect(Math.abs(input.b - output.b)).toBeLessThanOrEqual(maxDiff);
    }
  });

  it('PRGB String', () => {
    for (const c of conversions) {
      const tiny = new TinyColor(c.hex);
      const input = tiny.toRgb();
      const output = new TinyColor(tiny.toPercentageRgbString()).toRgb();
      const maxDiff = 2;

      expect(Math.abs(input.r - output.r)).toBeLessThanOrEqual(maxDiff);
      expect(Math.abs(input.g - output.g)).toBeLessThanOrEqual(maxDiff);
      expect(Math.abs(input.b - output.b)).toBeLessThanOrEqual(maxDiff);
    }
  });
  it('Object', () => {
    for (const c of conversions) {
      const tiny = new TinyColor(c.hex);
      expect(tiny.toHexString()).toBe(new TinyColor(tiny).toHexString());
    }
  });
});
