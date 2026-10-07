/**
 * Fetch product images from the Amazon Creators API for any review that has an
 * `asin:` (or an Amazon /dp/<ASIN> affiliate link) but no local image yet, and
 * download them into src/assets/reviews/<slug>.jpg.
 *
 * Images live in src/ (not public/) so astro:assets optimizes them. There is no
 * frontmatter to patch — the layout, compare tool and /devices.json all resolve
 * a review's image by slug, so dropping the file here is all that's needed.
 *
 * Images returned by the API are licensed for use by Amazon Associates, so —
 * unlike the Wikimedia Commons photos — they need no CC attribution and are
 * NOT added to /credits. The largest size the API offers is ~500px.
 *
 * Credentials: see scripts/lib/amazon-creators.mjs (AMAZON_CREATORS_CLIENT_ID,
 * AMAZON_CREATORS_CLIENT_SECRET, optional AMAZON_PARTNER_TAG).
 *
 * Usage:
 *   node scripts/fetch-amazon-images.mjs            # fetch + write
 *   node scripts/fetch-amazon-images.mjs --dry-run  # show what it would do
 *   node scripts/fetch-amazon-images.mjs --force    # also refetch existing
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { amazonToken, amazonGetItems, hasAmazonCredentials } from './lib/amazon-creators.mjs';

const REVIEWS_DIR = join(process.cwd(), 'src', 'content', 'reviews');
const IMG_DIR = join(process.cwd(), 'src', 'assets', 'reviews');
const IMG_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const DRY = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const UA = 'FullTVBoxBot/1.0 (+https://fulltvbox.com)';

// ── helpers ──────────────────────────────────────────────────────────────
const field = (fm, k) => {
  const m = fm.match(new RegExp(`^${k}:\\s*"?(.*?)"?\\s*$`, 'm'));
  return m ? m[1] : null;
};
const asinFrom = (url) => {
  const m = (url || '').match(/\/dp\/([A-Z0-9]{10})/i);
  return m ? m[1].toUpperCase() : null;
};

const hasLocalImage = (slug) => IMG_EXTS.some((ext) => existsSync(join(IMG_DIR, `${slug}${ext}`)));

function collectTargets() {
  const out = [];
  for (const file of readdirSync(REVIEWS_DIR).filter((f) => f.endsWith('.md'))) {
    const slug = file.replace(/\.md$/, '');
    const raw = readFileSync(join(REVIEWS_DIR, file), 'utf8');
    const fm = raw.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/)?.[1] || '';
    const asin = field(fm, 'asin') || asinFrom(field(fm, 'affiliate'));
    if (!asin) continue;
    if (hasLocalImage(slug) && !FORCE) continue;
    out.push({ slug, asin });
  }
  return out;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`image HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (!DRY) writeFileSync(dest, buf);
  return buf.length;
}

// ── main ─────────────────────────────────────────────────────────────────
async function main() {
  const targets = collectTargets();
  if (!targets.length) {
    console.log('Nothing to do — every review with an ASIN already has a local image. (Use --force to refetch.)');
    return;
  }
  console.log(`${DRY ? '[dry-run] ' : ''}Reviews needing an image: ${targets.map((t) => `${t.slug}(${t.asin})`).join(', ')}`);

  if (!hasAmazonCredentials()) {
    console.error('\n✗ Missing Creators API credentials. Set AMAZON_CREATORS_CLIENT_ID and AMAZON_CREATORS_CLIENT_SECRET.');
    console.error('  Re-run once they are set. The list above shows exactly what will be fetched.');
    process.exit(DRY ? 0 : 1);
  }
  if (!DRY) mkdirSync(IMG_DIR, { recursive: true });

  const token = await amazonToken();
  const { items, errors } = await amazonGetItems(token, targets.map((t) => t.asin), [
    'images.primary.large',
    'itemInfo.title',
  ]);
  for (const e of errors) console.error(`! API: ${e.code} ${e.message}`);

  const byAsin = new Map(targets.map((t) => [t.asin, t]));
  let ok = 0;
  for (const item of items) {
    const t = byAsin.get(item.asin);
    const url = item?.images?.primary?.large?.url;
    if (!t || !url) continue;
    try {
      const bytes = await download(url, join(IMG_DIR, `${t.slug}.jpg`));
      // Print the product title so a wrong ASIN is caught before the image ships.
      console.log(`✓ ${t.slug} <- "${item?.itemInfo?.title?.displayValue || '?'}" (${bytes}b)${DRY ? ' [dry-run, not written]' : ''}`);
      ok++;
    } catch (e) {
      console.error(`✗ ${t.slug}: ${e.message}`);
    }
  }
  console.log(`\nDone: ${ok}/${targets.length} image(s)${DRY ? ' (dry-run)' : ' saved to src/assets/reviews/'}.`);
  if (ok && !DRY) console.log('Next: confirm each title matches its review, then `npm run build` and commit.');
}

main().catch((e) => { console.error(e); process.exit(1); });
