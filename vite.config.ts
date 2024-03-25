import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: './lib/index.ts',
      name: 'OpenWindow',
      fileName: 'lib',
      formats: ['es', 'iife', 'umd'],
    }
  },
  plugins: [dts({ entryRoot: './lib', rollupTypes: true })]
});
