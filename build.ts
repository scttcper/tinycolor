import { join } from 'path';

import { copySync } from 'fs-extra';
import { rollup, InputOptions, OutputOptions } from 'rollup';
import * as sourceMaps from 'rollup-plugin-sourcemaps';

const umdInputOptions: InputOptions = {
  input: `dist/umd/public_api.js`,
  external: ['tslib'],
  plugins: [sourceMaps()],
};
const umdOutputOptions: OutputOptions = {
  file: './dist/package-dist/bundles/tinycolor-3.umd.js',
  name: 'tinycolor3',
  format: 'umd',
  globals: {
    tslib: 'tslib',
  },
  sourcemap: true,
};
const moduleInputOptions: InputOptions = {
  ...umdInputOptions,
  input: `dist/esm5/public_api.js`,
};
const moduleOutputOptions: OutputOptions = {
  ...umdOutputOptions,
  file: './dist/package-dist/bundles/tinycolor-3.es2015.js',
  format: 'es',
};

async function build() {
  // create bundles
  const umd = await rollup(umdInputOptions);
  await umd.write(umdOutputOptions);
  const mod = await rollup(moduleInputOptions);
  await mod.write(moduleOutputOptions);

  // copy git folder to dist folder for semantic-release
  copySync('.git', join(process.cwd(), 'dist/package-dist/.git'));
  // copy files to distribution folder
  copySync('package.json', join(process.cwd(), 'dist/package-dist/package.json'));
  copySync('README.md', join(process.cwd(), 'dist/package-dist/README.md'));
  copySync('LICENSE', join(process.cwd(), 'dist/package-dist/LICENSE'));
}

build()
  .then(() => console.log('build success'))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
