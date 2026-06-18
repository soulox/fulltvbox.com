/**
 * Fetch product images from the Best Buy Products API for any review that has no
 * local image yet, and download them into src/assets/reviews/<slug>.jpg.
 *
 * Best Buy's API images are provided for affiliates/developers to promote Best Buy
 * products, so — like the PA-API images — they need no CC attribution. Walmart-only
 * products (e.g. the onn. house brand) won't be found here; source those manually.
 *
 * Required env var (free key from https://developer.bestbuy.com):
 *   BESTBUY_API_KEY
 *
 * Usage:
 *   node scripts/fetch-bestbuy-images.mjs            # search + download
 *   node scripts/fetch-bestbuy-images.mjs --dry-run  # show matches only
 *   node scripts/fetch-bestbuy-images.mjs --force    # also refetch existing
 *
 * IMPORTANT: matches come from a name search, so review the printed product name
 * for each hit (use --dry-run first) to confirm it's the right device/model.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const REVIEWS_DIR = join(process.cwd(), 'src', 'content', 'reviews');
const IMG_DIR = join(process.cwd(), 'src', 'assets', 'reviews');
const IMG_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const DRY = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

const API_KEY = process.env.BESTBUY_API_KEY;
const UA = 'FullTVBoxBot/1.0 (+https://fulltvbox.com)';

// Optional per-slug search overrides (otherwise derived from the review title).
const SEARCH_OVERRIDES = {
  'roku-ultra-2024': 'Roku Ultra 2024',
  'google-tv-streamer-4k-2024': 'Google TV Streamer 4K',
  'tivo-stream-4k': 'TiVo Stream 4K',
};

const field = (fm, k) => {
  const m = fm.replace(/\r\n/g, '\n').match(new RegExp(`^${k}:\\s*"?(.*?)"?\\s*$`, 'm'));
  return m ? m[1] : null;
};
const hasLocalImage = (slug) => IMG_EXTS.some((ext) => existsSync(join(IMG_DIR, `${slug}${ext}`)));

// "Roku Ultra (2024) Review: ..." -> "roku ultra 2024" (search-friendly)
const titleToQuery = (title) =>
  title.replace(/ Review.*$/i, '').replace(/[():,.]/g, ' ').replace(/\s+/g, ' ').trim();

function collectTargets() {
  const out = [];
  for (const file of readdirSync(REVIEWS_DIR).filter((f) => f.endsWith('.md'))) {
    const slug = file.replace(/\.md$/, '');
    if (hasLocalImage(slug) && !FORCE) continue;
    const raw = readFileSync(join(REVIEWS_DIR, file), 'utf8');
    const fm = raw.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/)?.[1] || '';
    const query = SEARCH_OVERRIDES[slug] || titleToQuery(field(fm, 'title') || slug);
    out.push({ slug, query });
  }
  return out;
}

async function searchBestBuy(query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const filter = terms.map((t) => `search=${encodeURIComponent(t)}`).join('&');
  const show = 'sku,name,manufacturer,modelNumber,image,largeFrontImage';
  const url =
    `https://api.bestbuy.com/v1/products(${filter})` +
    `?apiKey=${API_KEY}&format=json&show=${show}&pageSize=5&sort=customerReviewCount.dsc`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 120)}`);
  const json = await res.json();
  return json.products || [];
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`image HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (!DRY) writeFileSync(dest, buf);
  return buf.length;
}

async function main() {
  const targets = collectTargets();
  if (!targets.length) {
    console.log('Nothing to do — every review already has a local image. (Use --force to refetch.)');
    return;
  }
  console.log(`${DRY ? '[dry-run] ' : ''}Reviews needing an image: ${targets.map((t) => t.slug).join(', ')}`);

  if (!API_KEY) {
    console.error('\n✗ Missing BESTBUY_API_KEY. Get a free key at https://developer.bestbuy.com and re-run.');
    process.exit(DRY ? 0 : 1);
  }
  if (!DRY) mkdirSync(IMG_DIR, { recursive: true });

  let ok = 0;
  for (const t of targets) {
    let products;
    try {
      products = await searchBestBuy(t.query);
    } catch (e) {
      console.error(`✗ ${t.slug}: search failed (${e.message})`);
      continue;
    }
    const match = products.find((p) => p.largeFrontImage || p.image);
    if (!match) {
      console.warn(`! ${t.slug}: no Best Buy match for "${t.query}" — source this one manually.`);
      continue;
    }
    const url = match.largeFrontImage || match.image;
    try {
      const bytes = await download(url, join(IMG_DIR, `${t.slug}.jpg`));
      console.log(`✓ ${t.slug} <- "${match.name}" [${match.manufacturer || '?'} ${match.modelNumber || ''}] (${bytes}b)${DRY ? ' [dry-run, not written]' : ''}`);
      console.log(`    verify: ${url}`);
      ok++;
    } catch (e) {
      console.error(`✗ ${t.slug}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 250)); // be polite to the API
  }
  console.log(`\nDone: ${ok}/${targets.length} image(s)${DRY ? ' (dry-run)' : ' saved to src/assets/reviews/'}.`);
  if (ok && !DRY) console.log('Next: confirm the images are the right products, then `npm run build` and commit.');
}

main().catch((e) => { console.error(e); process.exit(1); });
