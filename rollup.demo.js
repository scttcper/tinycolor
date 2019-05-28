import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
  input: './demo/src/main.ts',
  output: {
    file: './demo/public/bundle.js',
    format: 'iife', // immediately-invoked function expression — suitable for <script> tags
    sourcemap: true,
  },
  plugins: [
    typescript({
      tsconfig: './demo/tsconfig.json',
    }),
    production && terser(), // minify, but only in production
    !production && serve('demo/public'),
    !production && livereload(),
  ],
};
