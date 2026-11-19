import { describe, expect, it } from 'vitest';

import { TinyColor } from '../src/public_api.js';

/** One channel of a mix of two whole numbers by a whole percent, rounded half up, in integers */
function mixExact(from: number, to: number, percent: number): number {
  return Math.floor((from * (100 - percent) + to * percent + 50) / 100);
}

/**
 * Every [from, to, percent] where the mix lands exactly between two whole numbers, so the exact
 * result ends in .5: 14.5 for 0 and 25 at 58%. The other mixes are not close to a half.
 */
const halfwayMixes: number[][] = [];
for (let from = 0; from <= 255; from++) {
  for (let to = 0; to <= 255; to++) {
    for (let percent = 1; percent < 100; percent++) {
      if ((from * (100 - percent) + to * percent) % 100 === 50) {
        halfwayMixes.push([from, to, percent]);
      }
    }
  }
}

describe('Exact halves in mix(), shade(), onBackground() and the printed alpha', () => {
  // These came out as 14, 31, 14 and 22 (14.499999999999998 and so on) and were rounded down
  it.each([
    ['#000', '#191919', 58, '#0f0f0f'],
    ['#000', '#2d2d2d', 70, '#202020'],
    ['#000', '#323232', 29, '#0f0f0f'],
    ['#323232', '#000', 55, '#171717'],
  ])('%s mixed with %s by %d is %s', (from, to, percent, hex) => {
    expect(new TinyColor(from).mix(to, percent).toHexString()).toBe(hex);
  });

  it('should round a half of shade() and onBackground() up', () => {
    expect(new TinyColor('#323232').shade(55).toHexString()).toBe('#171717');
    expect(new TinyColor('rgba(0, 0, 0, 0.9)').onBackground('#050505').toHexString()).toBe(
      '#010101',
    );
    expect(new TinyColor('rgba(0, 0, 0, 0.34)').onBackground('#191919').toHexString()).toBe(
      '#111111',
    );
  });

  it('should give the exact channels for every mix that is exactly half', () => {
    const wrong: string[] = [];
    for (const [from, to, percent] of halfwayMixes) {
      // the green and blue channels mix other numbers, which have to be exact as well
      const { r, g, b } = new TinyColor({ r: from, g: to, b: 0 })
        .mix({ r: to, g: from, b: 255 }, percent)
        .toRgb();
      const exact = [
        mixExact(from, to, percent),
        mixExact(to, from, percent),
        mixExact(0, 255, percent),
      ];
      if (r !== exact[0] || g !== exact[1] || b !== exact[2]) {
        wrong.push(`${from} to ${to} by ${percent} gave ${[r, g, b]}, not ${exact}`);
      }
    }

    expect(wrong.slice(0, 10)).toEqual([]);
  });

  it('should give the exact channels for tint() and shade() of every gray', () => {
    const wrong: string[] = [];
    for (let gray = 0; gray <= 255; gray++) {
      for (let percent = 0; percent <= 100; percent++) {
        const tint = new TinyColor({ r: gray, g: gray, b: gray }).tint(percent).toRgb().r;
        const shade = new TinyColor({ r: gray, g: gray, b: gray }).shade(percent).toRgb().r;
        if (tint !== mixExact(gray, 255, percent)) {
          wrong.push(`tint(${percent}) of ${gray} gave ${tint}`);
        }
        if (shade !== mixExact(gray, 0, percent)) {
          wrong.push(`shade(${percent}) of ${gray} gave ${shade}`);
        }
      }
    }

    expect(wrong.slice(0, 10)).toEqual([]);
  });

  it('should give the exact channels for a color with an alpha on an opaque background', () => {
    const wrong: string[] = [];
    for (const [from, to, percent] of halfwayMixes) {
      // the color is `to` with the alpha `percent`, so it weighs `percent` against `from`
      const { r, g, b } = new TinyColor({ r: to, g: from, b: 255, a: percent / 100 })
        .onBackground({ r: from, g: to, b: 0 })
        .toRgb();
      const exact = [
        mixExact(from, to, percent),
        mixExact(to, from, percent),
        mixExact(0, 255, percent),
      ];
      if (r !== exact[0] || g !== exact[1] || b !== exact[2]) {
        wrong.push(`${to} at ${percent}% over ${from} gave ${[r, g, b]}, not ${exact}`);
      }
    }

    expect(wrong.slice(0, 10)).toEqual([]);
  });

  // 0.145 * 100 is 14.499999999999998, so these four printed 0.14, 0.28, 0.56 and 0.57
  it.each([
    [0.145, 0.15],
    [0.285, 0.29],
    [0.565, 0.57],
    [0.575, 0.58],
  ])('should print the alpha %d as %d', (alpha, printed) => {
    expect(new TinyColor(`rgba(0, 0, 0, ${alpha})`).toRgbString()).toBe(
      `rgba(0, 0, 0, ${printed})`,
    );
    expect(new TinyColor('#000').setAlpha(alpha).toRgbString()).toBe(`rgba(0, 0, 0, ${printed})`);
  });

  it('should give the exact alpha for every mix of two alphas that is exactly half', () => {
    const wrong: string[] = [];
    for (let from = 0; from <= 100; from++) {
      for (let to = 0; to <= 100; to++) {
        for (let percent = 1; percent < 100; percent++) {
          // the alpha is `sum` / 10000, printed to hundredths and written as a byte of 255
          const sum = from * (100 - percent) + to * percent;
          if (sum % 100 !== 50 && (255 * sum) % 10000 !== 5000) {
            continue;
          }

          const mixed = new TinyColor({ r: 10, g: 20, b: 30, a: from / 100 }).mix(
            { r: 10, g: 20, b: 30, a: to / 100 },
            percent,
          );
          const printed = Math.floor((sum + 50) / 100) / 100;
          const byte = Math.floor((255 * sum + 5000) / 10000)
            .toString(16)
            .padStart(2, '0');
          if (
            mixed.toRgbString() !== `rgba(10, 20, 30, ${printed})` ||
            mixed.toHex8String() !== `#0a141e${byte}`
          ) {
            wrong.push(
              `${from / 100} to ${to / 100} by ${percent} gave ${mixed.toRgbString()} ` +
                `and ${mixed.toHex8String()}, not ${printed} and ${byte}`,
            );
          }
        }
      }
    }

    expect(wrong.slice(0, 10)).toEqual([]);
  });
});
