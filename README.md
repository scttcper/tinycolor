# TypeScript Quickstart Library

A fork of [typescript-library-starter](https://github.com/alexjoverm/typescript-library-starter) with up to date packages and a few subsitutions.

* codecov instead of coveralls
* commitlint instead of validate-commit-msg
* always semicolons instead of no semicolons
* compiled to es5 using plain TypeScript instead of rollup (rollup is still used for bundles)
* tslib is used as a polyfill instead of core.js
* shorter library imports

## Use

```sh
git clone https://github.com/TypeCtrl/typescript-quickstart-lib.git --depth=1 YOURFOLDERNAME
cd YOURFOLDERNAME

# Run npm install and write your library name when asked. That's it!
npm install
```

## Features

* Zero Setup
* Jest test running
* publishes for every platform http://2ality.com/2017/04/setting-up-multi-platform-packages.html
* typescript type publishing `d.ts`
* **[Prettier](https://github.com/prettier/prettier)** and **[TSLint](https://palantir.github.io/tslint/)** for code formatting and consistency
* Docs generation using **[TypeDoc](http://typedoc.org/)**
* [Semantic release](https://github.com/semantic-release/semantic-release) auto publishing
* **[Travis](https://travis-ci.org)** integration and **[codecov](https://codecov.io)** coverage reporting
* **Automatic releases and changelog**, using [Semantic release](https://github.com/semantic-release/semantic-release), [Commitizen](https://github.com/commitizen/cz-cli), [Conventional changelog](https://github.com/conventional-changelog/conventional-changelog) and [Husky](https://github.com/typicode/husky) (for the git hooks)

## Additional Setup

#### Travis

Add travis Environment Variables

* **NPM** add `NPM_TOKEN` for publishing (see more)[https://github.com/semantic-release/npm#environment-variables]
* **docs** add `GH_TOKEN` to publish docs to github pages

#### Codecov

Add project to codecov https://codecov.io/gh

### NPM scripts

* `npm test`: Run test suite
* `npm run test:watch`: Run test suite in [interactive watch mode](http://facebook.github.io/jest/docs/cli.html#watch)
* `npm run test:prod`: Run test and generate coverage
* `npm run build`: Generate bundles and typings
* `npm run build:docs`: builds docs
* `npm run lint`: Lints code
* `npm run commit`: Commit using conventional commit style ([husky](https://github.com/typicode/husky) will walk you through commit message format)

### Importing library

You can import the public_api using

```ts
import { something } from 'mylib';
```

Import from a single file in the `src` directory.

```ts
import { yourClass } from 'mylib/srcFile';
```
