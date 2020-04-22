import { rollup, OutputOptions, RollupOptions } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import sourceMaps from 'rollup-plugin-sourcemaps';

// umd min
const umdMinInputOptions: RollupOptions = {
  input: 'dist/module/umd_api.js',
  plugins: [sourceMaps(), terser()],
};
const umdMinOutputOptions: OutputOptions = {
  file: './dist/bundles/tinycolor.umd.min.js',
  format: 'umd',
  sourcemap: true,
  name: 'tinycolor',
  exports: 'default',
};

async function build() {
  // create browser bundle
  const umdMin = await rollup(umdMinInputOptions);
  await umdMin.write(umdMinOutputOptions);
}

build()
  .then(() => console.log('build success'))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
