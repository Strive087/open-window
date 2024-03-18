import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: './lib/index.ts',
      name: 'Lib',
      fileName: 'lib'
    }
  },
  plugins: [dts({ entryRoot: './lib', rollupTypes: true })]
});
