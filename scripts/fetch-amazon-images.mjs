/**
 * Fetch product images from the Amazon Product Advertising API (PA-API v5)
 * for any review that has an Amazon affiliate ASIN but no local image yet,
 * download them into public/images/reviews/, and patch the review frontmatter.
 *
 * Images returned by PA-API are licensed for use by Amazon Associates, so —
 * unlike the Wikimedia Commons photos — they need no CC attribution and are
 * NOT added to /credits.
 *
 * Required env vars (PA-API credentials from your Associates account):
 *   PAAPI_ACCESS_KEY   AWS-style access key
 *   PAAPI_SECRET_KEY   AWS-style secret key
 *   PAAPI_PARTNER_TAG  Associates tag (default: fulltvbox-20)
 * Optional:
 *   PAAPI_HOST         default webservices.amazon.com (US)
 *   PAAPI_REGION       default us-east-1 (US)
 *   PAAPI_MARKETPLACE  default www.amazon.com
 *
 * Usage:
 *   node scripts/fetch-amazon-images.mjs            # fetch + write
 *   node scripts/fetch-amazon-images.mjs --dry-run  # show what it would do
 *   node scripts/fetch-amazon-images.mjs --force    # also refetch existing
 */
import crypto from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const REVIEWS_DIR = join(process.cwd(), 'src', 'content', 'reviews');
const IMG_DIR = join(process.cwd(), 'public', 'images', 'reviews');
const DRY = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

const cfg = {
  accessKey: process.env.PAAPI_ACCESS_KEY,
  secretKey: process.env.PAAPI_SECRET_KEY,
  partnerTag: process.env.PAAPI_PARTNER_TAG || 'fulltvbox-20',
  host: process.env.PAAPI_HOST || 'webservices.amazon.com',
  region: process.env.PAAPI_REGION || 'us-east-1',
  marketplace: process.env.PAAPI_MARKETPLACE || 'www.amazon.com',
};
const UA = 'FullTVBoxBot/1.0 (+https://fulltvbox.com)';

// ── AWS SigV4 for PA-API v5 ──────────────────────────────────────────────
const hmac = (key, data) => crypto.createHmac('sha256', key).update(data).digest();
const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');

function signedHeadersFor(payload, target) {
  const path = '/paapi5/getitems';
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const service = 'ProductAdvertisingAPI';
  const headers = {
    'content-encoding': 'amz-1.0',
    'content-type': 'application/json; charset=utf-8',
    host: cfg.host,
    'x-amz-date': amzDate,
    'x-amz-target': target,
  };
  const keys = Object.keys(headers).sort();
  const signedHeaders = keys.join(';');
  const canonicalHeaders = keys.map((k) => `${k}:${headers[k]}\n`).join('');
  const canonicalRequest = ['POST', path, '', canonicalHeaders, signedHeaders, sha256(payload)].join('\n');
  const scope = `${dateStamp}/${cfg.region}/${service}/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonicalRequest)].join('\n');
  let k = hmac(`AWS4${cfg.secretKey}`, dateStamp);
  k = hmac(k, cfg.region);
  k = hmac(k, service);
  k = hmac(k, 'aws4_request');
  const signature = crypto.createHmac('sha256', k).update(stringToSign).digest('hex');
  return {
    ...headers,
    Authorization: `AWS4-HMAC-SHA256 Credential=${cfg.accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
}

async function getItems(asins) {
  const target = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems';
  const payload = JSON.stringify({
    ItemIds: asins,
    ItemIdType: 'ASIN',
    Resources: ['Images.Primary.Large', 'Images.Primary.HighRes', 'ItemInfo.Title'],
    PartnerTag: cfg.partnerTag,
    PartnerType: 'Associates',
    Marketplace: cfg.marketplace,
  });
  const res = await fetch(`https://${cfg.host}/paapi5/getitems`, {
    method: 'POST',
    headers: signedHeadersFor(payload, target),
    body: payload,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.Errors?.map((e) => `${e.Code}: ${e.Message}`).join('; ') || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

// ── helpers ──────────────────────────────────────────────────────────────
const readEol = (s) => (s.includes('\r\n') ? '\r\n' : '\n');
const field = (fm, k) => {
  const m = fm.replace(/\r\n/g, '\n').match(new RegExp(`^${k}:\\s*"?(.*?)"?\\s*$`, 'm'));
  return m ? m[1] : null;
};
const asinFrom = (url) => {
  const m = (url || '').match(/\/dp\/([A-Z0-9]{10})/i);
  return m ? m[1].toUpperCase() : null;
};

function collectTargets() {
  const out = [];
  for (const file of readdirSync(REVIEWS_DIR).filter((f) => f.endsWith('.md'))) {
    const slug = file.replace(/\.md$/, '');
    const raw = readFileSync(join(REVIEWS_DIR, file), 'utf8');
    const fm = raw.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/)?.[1] || '';
    const hasImage = !!field(fm, 'image');
    const asin = asinFrom(field(fm, 'affiliate'));
    if (!asin) continue;
    if (hasImage && !FORCE) continue;
    out.push({ slug, file, asin });
  }
  return out;
}

function patchFrontmatter(file, slug, imgPath) {
  const full = join(REVIEWS_DIR, file);
  const raw = readFileSync(full, 'utf8');
  const eol = readEol(raw);
  if (/^image:/m.test(raw)) {
    const next = raw.replace(/^image:.*$/m, `image: "${imgPath}"`);
    if (!DRY) writeFileSync(full, next);
    return;
  }
  // insert after the rating: line (present in every review)
  const next = raw.replace(/^(rating:.*)$/m, `$1${eol}image: "${imgPath}"`);
  if (!DRY) writeFileSync(full, next);
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
    console.log('Nothing to do — every review with an Amazon ASIN already has a local image. (Use --force to refetch.)');
    return;
  }
  console.log(`${DRY ? '[dry-run] ' : ''}Reviews needing an image: ${targets.map((t) => `${t.slug}(${t.asin})`).join(', ')}`);

  if (!cfg.accessKey || !cfg.secretKey) {
    console.error('\n✗ Missing PA-API credentials. Set PAAPI_ACCESS_KEY and PAAPI_SECRET_KEY (and optionally PAAPI_PARTNER_TAG).');
    console.error('  Re-run once they are set. The list above shows exactly what will be fetched.');
    process.exit(DRY ? 0 : 1);
  }

  const byAsin = new Map(targets.map((t) => [t.asin, t]));
  let ok = 0;
  for (let i = 0; i < targets.length; i += 10) {
    const batch = targets.slice(i, i + 10).map((t) => t.asin);
    let result;
    try {
      result = await getItems(batch);
    } catch (e) {
      console.error(`✗ GetItems failed for [${batch.join(', ')}]: ${e.message}`);
      continue;
    }
    for (const item of result?.ItemsResult?.Items || []) {
      const t = byAsin.get(item.ASIN);
      const url = item?.Images?.Primary?.HighRes?.URL || item?.Images?.Primary?.Large?.URL;
      if (!t || !url) continue;
      const dest = join(IMG_DIR, `${t.slug}.jpg`);
      try {
        const bytes = await download(url, dest);
        patchFrontmatter(t.file, t.slug, `/images/reviews/${t.slug}.jpg`);
        console.log(`✓ ${t.slug} <- ${url} (${bytes}b)${DRY ? ' [dry-run, not written]' : ''}`);
        ok++;
      } catch (e) {
        console.error(`✗ ${t.slug}: ${e.message}`);
      }
    }
    for (const e of result?.Errors || []) console.error(`! API: ${e.Code} ${e.Message}`);
  }
  console.log(`\nDone: ${ok}/${targets.length} image(s)${DRY ? ' (dry-run)' : ' fetched + frontmatter patched'}.`);
  if (ok && !DRY) console.log('Next: review the images, then `npm run build` and commit.');
}

main().catch((e) => { console.error(e); process.exit(1); });
