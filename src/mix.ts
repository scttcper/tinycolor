import { ColorInput, TinyColor } from './index';

export function mix(color1: ColorInput, color2: ColorInput, amount?: number) {
  amount = amount === 0 ? 0 : amount || 50;

  const rgb1 = new TinyColor(color1).toRgb();
  const rgb2 = new TinyColor(color2).toRgb();

  const p = amount / 100;

  const rgba = {
    r: (rgb2.r - rgb1.r) * p + rgb1.r,
    g: (rgb2.g - rgb1.g) * p + rgb1.g,
    b: (rgb2.b - rgb1.b) * p + rgb1.b,
    a: (rgb2.a - rgb1.a) * p + rgb1.a,
  };

  return new TinyColor(rgba);
}
