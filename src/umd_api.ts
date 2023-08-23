import { names } from './css-color-names.js';
import { inputToRGB, isValidCSSUnit, stringInputToObject } from './format-input.js';
import { fromRatio, legacyRandom } from './from-ratio.js';
import { TinyColor } from './index.js';
import { random } from './random.js';
import { mostReadable, readability } from './readability.js';
import { toMsFilter } from './to-ms-filter.js';

export interface TinyColorUMD {
  TinyColor: typeof TinyColor;
  readability: typeof readability;
  random: typeof random;
  names: typeof names;
  fromRatio: typeof fromRatio;
  legacyRandom: typeof legacyRandom;
  toMsFilter: typeof toMsFilter;
  inputToRGB: typeof inputToRGB;
  stringInputToObject: typeof stringInputToObject;
  isValidCSSUnit: typeof isValidCSSUnit;
  mostReadable: typeof mostReadable;
}
const tinycolorumd: TinyColorUMD = {
  TinyColor,
  readability,
  mostReadable,
  random,
  names,
  fromRatio,
  legacyRandom,
  toMsFilter,
  inputToRGB,
  stringInputToObject,
  isValidCSSUnit,
};

export default tinycolorumd;
