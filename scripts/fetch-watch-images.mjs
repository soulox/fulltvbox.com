/**
 * Fetch title art for /what-to-watch verdicts from Netflix's official Top 10 site and
 * download it into src/assets/watch/<verdict id>.jpg, adding `image: { credit, source }`
 * to the verdict YAML (src/lib/top10.ts fails the build if the two disagree).
 *
 * Source: the art Netflix shows next to each title in its Top 10 tables at
 * https://www.netflix.com/tudum/top10, the same lists our rankings come from. For each
 * verdict without an image it opens the list pages for the weeks the title charted
 * (from .cache/netflix-top10.json, so run `npm run top10` first) and matches by title.
 * Images are credited to Netflix on /credits.
 *
 * Netflix rate-limits by IP, so pages are fetched one at a time with a pause between.
 *
 * Usage:
 *   node scripts/fetch-watch-images.mjs            # fetch + write   (npm run images:watch)
 *   node scripts/fetch-watch-images.mjs --dry-run  # show what it would do
 *   node scripts/fetch-watch-images.mjs --force    # also refetch existing
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { titleKey } from '../src/lib/top10-core.mjs';

const VERDICTS_DIR = join(process.cwd(), 'src', 'content', 'watch-verdicts');
const IMG_DIR = join(process.cwd(), 'src', 'assets', 'watch');
const CACHE = join(process.cwd(), '.cache', 'netflix-top10.json');
const DRY = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const UA = 'FullTVBoxBot/1.0 (+https://fulltvbox.com)';
const PAUSE_MS = 2000;
const TOP10 = 'https://www.netflix.com/tudum/top10';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const decode = (s) => s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

// Netflix's ?week= takes any day of its Monday–Sunday week; our weeks are the Sunday it ends.
const monday = (sunday) => new Date(Date.parse(`${sunday}T00:00:00Z`) - 6 * 864e5).toISOString().slice(0, 10);

/** List pages that may show a title for one charting week, most likely first. */
function pagesFor(region, kind, week) {
  const w = `?week=${monday(week)}`;
  if (region === 'us') return [`${TOP10}/united-states${kind === 'series' ? '/tv' : ''}${w}`];
  return kind === 'series'
    ? [`${TOP10}/tv${w}`, `${TOP10}/tv-non-english${w}`]
    : [`${TOP10}${w}`, `${TOP10}/films-non-english${w}`];
}

const pageCache = new Map(); // url -> Map(titleKey -> image url)
async function artOn(url) {
  if (pageCache.has(url)) return pageCache.get(url);
  if (pageCache.size) await sleep(PAUSE_MS);
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const html = await res.text();
  const art = new Map();
  // Each table row: <img class="desktop-only" src="…"…/><button>Title</button>
  for (const m of html.matchAll(/<img class="desktop-only" src="([^"]+)"[^>]*\/><button>([^<]+)<\/button>/g)) {
    art.set(titleKey(decode(m[2])), decode(m[1]));
  }
  pageCache.set(url, art);
  return art;
}

function collectTargets() {
  const out = [];
  for (const file of readdirSync(VERDICTS_DIR).filter((f) => f.endsWith('.yaml'))) {
    const id = file.replace(/\.yaml$/, '');
    const yaml = readFileSync(join(VERDICTS_DIR, file), 'utf8');
    if (/^image:/m.test(yaml) && !FORCE) continue;
    const title = decode(yaml.match(/^title:\s*"?(.*?)"?\s*$/m)?.[1] ?? '');
    const kind = yaml.match(/^kind:\s*(\w+)/m)?.[1];
    out.push({ id, file, yaml, title, kind });
  }
  return out;
}

async function main() {
  if (!existsSync(CACHE)) throw new Error('No .cache/netflix-top10.json; run `npm run top10` first.');
  const data = JSON.parse(readFileSync(CACHE, 'utf8'));
  const targets = collectTargets();
  console.log(`${targets.length} verdict(s) without an image${DRY ? ' (dry run)' : ''}`);
  mkdirSync(IMG_DIR, { recursive: true });

  const missed = [];
  for (const t of targets) {
    const key = titleKey(t.title);
    // Latest weeks first: newest art, and those pages are the likeliest to be shared.
    const charted = ['us', 'global']
      .flatMap((region) => data[region].filter((r) => r.kind === t.kind && titleKey(r.title) === key).map((r) => ({ region, week: r.week })))
      .sort((a, b) => b.week.localeCompare(a.week) || (a.region === 'us' ? -1 : 1));
    let found;
    for (const c of charted) {
      for (const url of pagesFor(c.region, t.kind, c.week)) {
        const src = (await artOn(url)).get(key);
        if (src) { found = { src, page: url }; break; }
      }
      if (found) break;
    }
    if (!found) { missed.push(t.id); console.log(`  miss  ${t.id}`); continue; }
    console.log(`  found ${t.id}`);
    if (DRY) continue;

    const res = await fetch(found.src, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30_000) });
    if (!res.ok || !res.headers.get('content-type')?.startsWith('image/')) throw new Error(`${t.id}: image HTTP ${res.status}`);
    writeFileSync(join(IMG_DIR, `${t.id}.jpg`), Buffer.from(await res.arrayBuffer()));
    const yaml = t.yaml.replace(/\n?image:[\s\S]*$/m, '').replace(/\s*$/, '\n');
    writeFileSync(join(VERDICTS_DIR, t.file), `${yaml}image:\n  credit: "Netflix"\n  source: "${found.page}"\n`);
  }
  if (missed.length) console.log(`No art found for: ${missed.join(', ')}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
