
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',

  plugins: [
    viteSingleFile({
      removeViteModuleLoader: true,
    }),
  ],

  build: {
    assetsInlineLimit: 0,

    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';

          // Keep SVG assets and favicon as separate files.
          if (
            name.startsWith('assets/') ||
            name.endsWith('.svg') ||
            name.endsWith('.ico')
          ) {
            return '[name][extname]';
          }

          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
