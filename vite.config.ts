
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  base: './',

  plugins: [
    viteSingleFile(),

    viteStaticCopy({
      targets: [
        {
          src: 'assets/**/*',
          dest: 'assets',
        },
        {
          src: '*.ico',
          dest: '.',
        },
      ],
    }),
  ],

  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';

          if (
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
