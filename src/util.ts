/**
 * Take input from [0, n] and return it as [0, 1]
 */
export function bound01(n: any, max: number) {
  if (isOnePointZero(n)) {
    n = '100%';
  }

  const processPercent = isPercentage(n);
  n = Math.min(max, Math.max(0, parseFloat(n)));

  // Automatically convert percentage into number
  if (processPercent) {
    n = parseInt(String(n * max), 10) / 100;
  }

  // Handle floating point rounding errors
  if (Math.abs(n - max) < 0.000001) {
    return 1;
  }

  // Convert into [0, 1] range if it isn't already
  return (n % max) / parseFloat(String(max));
}

/** Force a number between 0 and 1 */
export function clamp01(val) {
  return Math.min(1, Math.max(0, val));
}

/**
 * Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
 * <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
 */
export function isOnePointZero(n: string) {
  return typeof n === 'string' && n.indexOf('.') !== -1 && parseFloat(n) === 1;
}

/** Check to see if string passed in is a percentage */
export function isPercentage(n: string) {
  return typeof n === 'string' && n.indexOf('%') !== -1;
}

/**
 * Return a valid alpha value [0,1] with all invalid values being set to 1
 */
export function boundAlpha(a?: number | string) {
  a = parseFloat(a as string);

  if (isNaN(a) || a < 0 || a > 1) {
    a = 1;
  }

  return a;
}

/** Replace a decimal with it's percentage value */
export function convertToPercentage(n) {
  if (n <= 1) {
    n = n * 100 + '%';
  }

  return n;
}

/** Force a hex value to have 2 characters */
export function pad2(c) {
  return c.length === 1 ? '0' + c : '' + c;
}
