import { rollup, OutputOptions, RollupOptions } from 'rollup';
import { default as terser } from '@rollup/plugin-terser';

// umd min
const umdMinInputOptions: RollupOptions = {
  input: 'dist/module/umd_api.js',
  plugins: [terser({sourceMap: true})],
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
