import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: 'https://fulltvbox.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    tailwind(),
    sitemap({
      changefreq: 'weekly',
      lastmod: new Date(),
      serialize(item) {
        const path = new URL(item.url).pathname;
        if (path === '/') item.priority = 1.0;
        else if (/^\/reviews\/[^/]+$/.test(path)) item.priority = 0.9;
        else if (/^\/(reviews|best-picks|compare|cut-the-cord)$/.test(path)) item.priority = 0.8;
        else if (/^\/(guides|tutorials)\//.test(path)) item.priority = 0.7;
        else item.priority = 0.6;
        return item;
      },
    }),
    pagefind(),
  ],
});
