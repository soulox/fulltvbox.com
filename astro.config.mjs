import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
import { rehypeTableScroll } from './src/lib/rehype-table-scroll.mjs';
import { readdirSync, readFileSync } from 'node:fs';
import { readLiveDeals, dealEndsAt } from './src/lib/live-prices.ts';

// /deals is noindexed while it has no live deals (see src/pages/deals.astro), so keep
// it out of the sitemap too. Content collections aren't available in config, so read
// the deal files' `expires`/`checked` directly and check
// the retailer price snapshot from scripts/fetch-prices.mjs.
function hasLiveDeals() {
  if (readLiveDeals().length) return true;
  const dir = new URL('./src/content/deals/', import.meta.url);
  const now = new Date();
  return readdirSync(dir)
    .filter((f) => /\.ya?ml$/.test(f))
    .some((f) => {
      const raw = readFileSync(new URL(f, dir), 'utf8');
      const expires = raw.match(/^expires:\s*["']?([\dT:.Z+-]+)/m)?.[1];
      const checked = raw.match(/^checked:\s*["']?([\d-]+)/m)?.[1];
      if (expires && dealEndsAt(expires) <= now) return false;
      // Mirrors RECHECK_MS in src/lib/deals.ts: an unconfirmed deal hides after 21 days.
      return !checked || dealEndsAt(checked).getTime() + 21 * 86_400_000 > now.getTime();
    });
}
const liveDeals = hasLiveDeals();

export default defineConfig({
  site: 'https://fulltvbox.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  markdown: {
    rehypePlugins: [rehypeTableScroll],
  },
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
        else if (/^\/what-to-watch(\/|$)/.test(path)) item.priority = 0.7;
        else item.priority = 0.6;
        return item;
      },
    }),
    pagefind(),
  ],
});
