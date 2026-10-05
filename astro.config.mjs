import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
import { readdirSync, readFileSync } from 'node:fs';

// /deals is noindexed while it has no live deals (see src/pages/deals.astro), so keep
// it out of the sitemap too. Content collections aren't available in config, so read
// the deal files' `expires` directly — a deal with no expiry counts as live.
function hasLiveDeals() {
  const dir = new URL('./src/content/deals/', import.meta.url);
  const now = Date.now();
  return readdirSync(dir)
    .filter((f) => /\.ya?ml$/.test(f))
    .some((f) => {
      const m = readFileSync(new URL(f, dir), 'utf8').match(/^expires:\s*["']?([\d-]+)/m);
      return !m || new Date(m[1]).getTime() >= now;
    });
}
const liveDeals = hasLiveDeals();

export default defineConfig({
  site: 'https://fulltvbox.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    tailwind(),
    sitemap({
      filter: (page) => liveDeals || new URL(page).pathname !== '/deals',
      changefreq: 'weekly',
      lastmod: new Date(),
      serialize(item) {
        const path = new URL(item.url).pathname;
        if (path === '/') item.priority = 1.0;
        else if (/^\/reviews\/[^/]+$/.test(path)) item.priority = 0.9;
        else if (/^\/(reviews|best-picks|compare|cut-the-cord|ai)$/.test(path)) item.priority = 0.8;
        else if (/^\/ai\/(tools|prompts\/(?!group\/)[^/]+)$/.test(path)) item.priority = 0.7;
        else if (/^\/guides\/category\/[^/]+$/.test(path)) item.priority = 0.6;
        else if (/^\/(guides|tutorials)\//.test(path)) item.priority = 0.7;
        else item.priority = 0.6;
        return item;
      },
    }),
    pagefind(),
  ],
});
