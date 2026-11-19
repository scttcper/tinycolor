/**
 * Take input from [0, n] and return it as [0, 1]
 * @hidden
 */
export function bound01(n: any, max: number): number {
  if (isOnePointZero(n)) {
    n = '100%';
  }

  const isPercent = isPercentage(n);
  n = max === 360 ? parseFloat(n) : Math.min(max, Math.max(0, parseFloat(n)));

  // Automatically convert percentage into number
  if (isPercent) {
    n = Math.trunc(n * max) / 100;
  }

  // Handle floating point rounding errors
  if (Math.abs(n - max) < 0.000001) {
    return 1;
  }

  // Convert into [0, 1] range if it isn't already
  if (max === 360) {
    // If n is a hue given in degrees,
    // wrap around out-of-range values into [0, 360] range
    // then convert into [0, 1].
    if (!Number.isFinite(n)) {
      return 0;
    }
    n = (n < 0 ? (n % max) + max : n % max) / max;
  } else {
    // If n not a hue given in degrees
    // Convert into [0, 1] range if it isn't already.
    n = (n % max) / max;
  }

  return n;
}

/**
 * Force a number between 0 and 1
 * @hidden
 */
export function clamp01(val: number): number {
  return Math.min(1, Math.max(0, val));
}

/**
 * Need to handle unitless 1.0 as 100%, since once it is a number, there is no difference between it and 1
 * <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
 * @hidden
 */
export function isOnePointZero(n: string | number): boolean {
  return typeof n === 'string' && n.includes('.') && !/[%e]/i.test(n) && parseFloat(n) === 1;
}

/**
 * Check to see if string passed in is a percentage
 * @hidden
 */
export function isPercentage(n: string | number): boolean {
  return typeof n === 'string' && n.indexOf('%') !== -1;
}

/**
 * Return a valid alpha value [0,1] with all invalid values being set to 1
 * @hidden
 */
export function boundAlpha(a?: number | string): number {
  // percentage alpha, e.g. `50%`
  a =
    typeof a === 'string' && a.trim().endsWith('%') ? parseFloat(a) / 100 : parseFloat(a as string);

  if (isNaN(a) || a < 0 || a > 1) {
    a = 1;
  }

  return a;
}

/**
 * Replace a decimal with it's percentage value
 * @hidden
 */
export function convertToPercentage(n: number | string): number | string {
  if (Number(n) <= 1) {
    return `${Number(n) * 100}%`;
  }

  return n;
}

/**
 * Scale HSL and HSV ratios to 0-100 without truncating through a percentage string.
 * @hidden
 */
export function convertToPercentageNumber(n: number | string): number | string {
  const value = Number(n);
  return value <= 1 ? value * 100 : n;
}

/**
 * Remove the floating point noise from a channel in [0, 255]. A channel that is exactly half,
 * like 127.5, often comes out of a conversion as 127.49999999999999 and is rounded down
 * @hidden
 */
export function removeNoise(n: number): number {
  return Math.round(n * 1e9) / 1e9;
}

/** Round computed values without letting floating point noise round exact halves down. @hidden */
export function roundWithTolerance(n: number): number {
  return Number.isInteger(n) ? n : Math.round(n + 1e-12);
}

/**
 * Force a hex value to have 2 characters
 * @hidden
 */
export function pad2(c: string): string {
  return c.length === 1 ? '0' + c : String(c);
}
