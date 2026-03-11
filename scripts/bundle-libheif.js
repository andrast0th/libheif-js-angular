// Pre-bundles libheif-js asm.js build into a browser-compatible ESM file.
// Run via: node scripts/bundle-libheif.js
// Automatically run as 'prebuild' and 'prestart' via package.json.

import esbuild from 'esbuild';
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

await esbuild.build({
  entryPoints: [resolve(root, 'scripts/libheif-entry.js')],
  bundle: true,
  minify: false,
  format: 'esm',
  outfile: resolve(root, 'src/libheif-asmjs.bundle.js'),
  external: [],
  platform: 'browser',
  plugins: [
    nodeModulesPolyfillPlugin({
      modules: { fs: 'empty', path: 'empty' },
    }),
  ],
});

console.log('libheif asm.js bundle written to src/libheif-asmjs.bundle.js');
