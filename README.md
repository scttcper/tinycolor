# tinycolor [![npm](https://img.shields.io/npm/v/%40ctrl%2Ftinycolor.svg?maxAge=3600)](https://www.npmjs.com/package/%40ctrl%2Ftinycolor) [![build status](https://img.shields.io/travis/TypeCtrl/tinycolor.svg)](https://travis-ci.org/TypeCtrl/tinycolor) [![coverage status](https://codecov.io/gh/typectrl/tinycolor/branch/master/graph/badge.svg)](https://codecov.io/gh/typectrl/tinycolor)
> TinyColor is a small library for color manipulation and conversion

A fork of [tinycolor2](https://github.com/bgrins/TinyColor) by [Brian Grinstead](https://github.com/bgrins)

### Changes from tinycolor2
- written in TypeScript / es2015 and requires node >= 8
- several functions moved out of the tinycolor class and are no longer `tinycolor.<function>`
  - readability, fromRatio, fromRandom moved out
  - toFilter has been moved out and renamed to `toMsFilter`
- `mix`, `equals` use the current TinyColor object as the first parameter
  - `new TinyColor('#000').equals('#000') // true`
