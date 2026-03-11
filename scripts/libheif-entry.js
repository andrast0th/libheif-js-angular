// Entry point for bundling the asm.js version of libheif for the browser.
// The asm.js file uses require('fs') and require('path') for Node.js, but those
// code paths are guarded by environment detection at runtime. We stub them at
// build time via esbuild-plugins-node-modules-polyfill so the browser bundle works.
import libheif from 'libheif-js';
export default libheif;
