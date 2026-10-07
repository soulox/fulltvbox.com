/**
 * Fetch current retailer prices for every review that names a product ID, and write
 * a snapshot to .cache/live-prices.json. The build reads that snapshot (see
 * src/lib/live-prices.ts) and turns any discounted price into a live deal, so /deals,
 * review CTAs and the homepage stay stocked without hand-written deal files.
 *
 * Sources (each one is skipped when its credentials are missing):
 *   - Amazon Creators API (the PA-API replacement), for reviews with `asin:`
 *       AMAZON_CREATORS_CLIENT_ID      OAuth credential ID (NA / version 3.1)
 *       AMAZON_CREATORS_CLIENT_SECRET  OAuth credential secret
 *       AMAZON_PARTNER_TAG             Associates tag (default: fulltvbox-20)
 *   - Best Buy Products API, for reviews with `bestBuySku:`
 *       BESTBUY_API_KEY
 *
 * This never fails the build: a source that errors is logged and left out, and with
 * no snapshot the site falls back to the hand-written files in src/content/deals/.
 *
 * Usage:
 *   node scripts/fetch-prices.mjs                       # fetch + write snapshot
 *   node scripts/fetch-prices.mjs --dry-run             # fetch + print, don't write
 *   node scripts/fetch-prices.mjs --find-bestbuy "Roku Ultra 2024"
 *                                                       # print Best Buy SKU candidates
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const REVIEWS_DIR = join(process.cwd(), 'src', 'content', 'reviews');
const OUT_DIR = join(process.cwd(), '.cache');
const OUT_FILE = join(OUT_DIR, 'live-prices.json');
const DRY = process.argv.includes('--dry-run');
const UA = 'FullTVBoxBot/1.0 (+https://fulltvbox.com)';

const amazon = {
  clientId: process.env.AMAZON_CREATORS_CLIENT_ID,
  clientSecret: process.env.AMAZON_CREATORS_CLIENT_SECRET,
  partnerTag: process.env.AMAZON_PARTNER_TAG || 'fulltvbox-20',
  marketplace: 'www.amazon.com',
};
const BESTBUY_KEY = process.env.BESTBUY_API_KEY;

// ── helpers ──────────────────────────────────────────────────────────────
const field = (fm, k) => {
  const m = fm.match(new RegExp(`^${k}:\\s*"?(.*?)"?\\s*$`, 'm'));
  return m ? m[1] : null;
};

function collectTargets() {
  const out = [];
  for (const file of readdirSync(REVIEWS_DIR).filter((f) => f.endsWith('.md'))) {
    const raw = readFileSync(join(REVIEWS_DIR, file), 'utf8');
    const fm = raw.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/)?.[1] || '';
    if (field(fm, 'discontinued') === 'true') continue;
    out.push({
      device: file.replace(/\.md$/, ''),
      asin: field(fm, 'asin'),
      bestBuySku: field(fm, 'bestBuySku'),
    });
  }
  return out;
}

const round2 = (n) => Math.round(n * 100) / 100;

// ── Amazon Creators API ──────────────────────────────────────────────────
async function amazonToken() {
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: amazon.clientId,
      client_secret: amazon.clientSecret,
      scope: 'creatorsapi::default',
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) throw new Error(`token: HTTP ${res.status} ${json.error_description || json.error || ''}`);
  return json.access_token;
}

async function amazonGetItems(token, asins) {
  const res = await fetch('https://creatorsapi.amazon/catalog/v1/getItems', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-marketplace': amazon.marketplace,
    },
    body: JSON.stringify({
      itemIds: asins,
      itemIdType: 'ASIN',
      marketplace: amazon.marketplace,
      partnerTag: amazon.partnerTag,
      resources: [
        'itemInfo.title',
        'offersV2.listings.price',
        'offersV2.listings.availability',
        'offersV2.listings.dealDetails',
        'offersV2.listings.isBuyBoxWinner',
      ],
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.errors?.map((e) => `${e.code}: ${e.message}`).join('; ') || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

async function fetchAmazon(targets) {
  const withAsin = targets.filter((t) => t.asin);
  if (!withAsin.length) return [];
  if (!amazon.clientId || !amazon.clientSecret) {
    console.warn('! Amazon: AMAZON_CREATORS_CLIENT_ID / _SECRET not set — skipping.');
    return [];
  }
  const token = await amazonToken();
  const byAsin = new Map(withAsin.map((t) => [t.asin, t]));
  const offers = [];
  for (let i = 0; i < withAsin.length; i += 10) {
    const json = await amazonGetItems(token, withAsin.slice(i, i + 10).map((t) => t.asin));
    for (const e of json?.errors || []) console.warn(`! Amazon: ${e.code} ${e.message}`);
    for (const item of json?.itemResults?.items || []) {
      const t = byAsin.get(item.asin);
      const listings = item?.offersV2?.listings || [];
      const l = listings.find((x) => x.isBuyBoxWinner) || listings[0];
      const price = l?.price?.money?.amount;
      if (!t || !price) continue;
      if (l.availability?.type && l.availability.type !== 'IN_STOCK') continue;
      const deal = l.dealDetails;
      offers.push({
        device: t.device,
        retailer: 'Amazon',
        price: round2(price),
        wasPrice: l.price?.savingBasis?.money?.amount ? round2(l.price.savingBasis.money.amount) : undefined,
        url: item.detailPageURL,
        badge: deal?.badge,
        endsAt: deal?.endTime ? new Date(deal.endTime).toISOString() : undefined,
        title: item?.itemInfo?.title?.displayValue,
      });
    }
  }
  return offers;
}

// ── Best Buy Products API ────────────────────────────────────────────────
async function bestBuyQuery(filter, show) {
  const url = `https://api.bestbuy.com/v1/products(${filter})?apiKey=${BESTBUY_KEY}&format=json&show=${show}&pageSize=20`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 120)}`);
  return (await res.json()).products || [];
}

async function fetchBestBuy(targets) {
  const withSku = targets.filter((t) => t.bestBuySku);
  if (!withSku.length) return [];
  if (!BESTBUY_KEY) {
    console.warn('! Best Buy: BESTBUY_API_KEY not set — skipping.');
    return [];
  }
  const bySku = new Map(withSku.map((t) => [String(t.bestBuySku), t]));
  const products = await bestBuyQuery(
    `sku in(${[...bySku.keys()].join(',')})`,
    'sku,name,salePrice,regularPrice,onlineAvailability,url,priceUpdateDate',
  );
  return products
    .filter((p) => bySku.has(String(p.sku)) && p.onlineAvailability && p.salePrice)
    .map((p) => ({
      device: bySku.get(String(p.sku)).device,
      retailer: 'Best Buy',
      price: round2(p.salePrice),
      wasPrice: p.regularPrice ? round2(p.regularPrice) : undefined,
      url: p.url,
      title: p.name,
    }));
}

async function findBestBuy(query) {
  if (!BESTBUY_KEY) throw new Error('BESTBUY_API_KEY not set.');
  const filter = query.toLowerCase().split(/\s+/).filter(Boolean).map((t) => `search=${encodeURIComponent(t)}`).join('&');
  const products = await bestBuyQuery(filter, 'sku,name,modelNumber,salePrice,regularPrice');
  for (const p of products) console.log(`${p.sku}\t$${p.salePrice} (reg $${p.regularPrice})\t${p.name} [${p.modelNumber || '?'}]`);
  if (!products.length) console.log('No matches.');
}

// ── main ─────────────────────────────────────────────────────────────────
async function main() {
  const findIdx = process.argv.indexOf('--find-bestbuy');
  if (findIdx !== -1) return findBestBuy(process.argv[findIdx + 1] || '');

  const targets = collectTargets();
  const offers = [];
  for (const [name, fn] of [['Amazon', fetchAmazon], ['Best Buy', fetchBestBuy]]) {
    try {
      const got = await fn(targets);
      offers.push(...got);
      if (got.length) console.log(`✓ ${name}: ${got.length} price(s)`);
    } catch (e) {
      console.warn(`! ${name}: fetch failed (${e.message}) — leaving it out.`);
    }
  }

  const missing = targets.filter((t) => !t.asin && !t.bestBuySku).map((t) => t.device);
  if (missing.length) console.log(`  No retailer ID (not priced): ${missing.join(', ')}`);

  for (const o of offers) {
    const off = o.wasPrice && o.wasPrice > o.price ? ` was $${o.wasPrice}` : '';
    console.log(`  ${o.device} @ ${o.retailer}: $${o.price}${off}  — "${o.title || '?'}"`);
  }

  if (DRY) return console.log(`\n[dry-run] ${offers.length} price(s), snapshot not written.`);
  if (!offers.length) return console.log('No live prices fetched; the build will use src/content/deals/ only.');
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify({ fetchedAt: new Date().toISOString(), offers }, null, 2));
  console.log(`Wrote ${offers.length} price(s) to .cache/live-prices.json`);
}

main().catch((e) => {
  // Never block a deploy on price fetching.
  console.warn(`! Price fetch aborted: ${e.message}`);
});
