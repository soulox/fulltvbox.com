/**
 * Fetch title art for every title the /what-to-watch pages show, from Netflix's official
 * Top 10 site, into src/assets/watch/<kind>--<titleKey>.jpg plus a sidecar .json credit
 * ({ title, kind, credit, source }) that src/lib/watchImages.ts requires and /credits lists.
 *
 * Source: the art Netflix shows next to each title in its Top 10 tables at
 * https://www.netflix.com/tudum/top10, the same lists our rankings come from. For each
 * title without art it opens the list pages for the weeks the title charted (from
 * .cache/netflix-top10.json, so run `npm run top10` first) and matches by title.
 *
 * The deploy runs this with --ci before the build so titles new to the lists get art; in
 * that mode any failure only warns (a missing image just means no thumbnail). Netflix
 * rate-limits by IP, so pages are fetched one at a time with a pause between.
 *
 * Usage:
 *   node scripts/fetch-watch-images.mjs            # fetch + write   (npm run images:watch)
 *   node scripts/fetch-watch-images.mjs --dry-run  # show what it would do
 *   node scripts/fetch-watch-images.mjs --force    # also refetch existing
 *   node scripts/fetch-watch-images.mjs --ci       # never fail; give up after a time budget
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { titleKey, displayedTitles } from '../src/lib/top10-core.mjs';

const IMG_DIR = join(process.cwd(), 'src', 'assets', 'watch');
const CACHE = join(process.cwd(), '.cache', 'netflix-top10.json');
const DRY = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const CI = process.argv.includes('--ci');
const UA = 'FullTVBoxBot/1.0 (+https://fulltvbox.com)';
const PAUSE_MS = 2000;
const BUDGET_MS = CI ? 5 * 60_000 : Infinity; // keep a blocked or slow Netflix from stalling the deploy
const TOP10 = 'https://www.netflix.com/tudum/top10';

const started = Date.now();
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

/**
 * Art for a title on one page. Netflix's table sometimes words a title differently from its
 * data files (WWE "Raw: September 28, 2026" vs "Raw: 2026 - September 28, 2026"), so when
 * there's no exact match, accept the only row on the page from the same show.
 */
function match(art, title) {
  const exact = art.get(titleKey(title));
  if (exact || !title.includes(':')) return exact;
  const show = `${titleKey(title.split(':')[0])}-`;
  const same = [...art.keys()].filter((k) => k.startsWith(show));
  return same.length === 1 ? art.get(same[0]) : undefined;
}

async function main() {
  if (!existsSync(CACHE)) throw new Error('No .cache/netflix-top10.json; run `npm run top10` first.');
  const data = JSON.parse(readFileSync(CACHE, 'utf8'));
  const targets = displayedTitles(data).filter((t) => FORCE || !existsSync(join(IMG_DIR, `${t.kind}--${t.key}.jpg`)));
  console.log(`${targets.length} listed title(s) without art${DRY ? ' (dry run)' : ''}`);
  mkdirSync(IMG_DIR, { recursive: true });

  const missed = [];
  for (const t of targets) {
    if (Date.now() - started > BUDGET_MS) { console.warn('Time budget used up; the rest wait for the next run.'); break; }
    // Latest weeks first: newest art, and those pages are the likeliest to be shared.
    const charted = ['us', 'global']
      .flatMap((region) => data[region].filter((r) => r.kind === t.kind && titleKey(r.title) === t.key).map((r) => ({ region, week: r.week })))
      .sort((a, b) => b.week.localeCompare(a.week) || (a.region === 'us' ? -1 : 1));
    let found;
    for (const c of charted) {
      for (const url of pagesFor(c.region, t.kind, c.week)) {
        const src = match(await artOn(url), t.title);
        if (src) { found = { src, page: url }; break; }
      }
      if (found) break;
    }
    if (!found) { missed.push(t.title); console.log(`  miss  ${t.kind}: ${t.title}`); continue; }
    console.log(`  found ${t.kind}: ${t.title}`);
    if (DRY) continue;

    const res = await fetch(found.src, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30_000) });
    if (!res.ok || !res.headers.get('content-type')?.startsWith('image/')) throw new Error(`${t.title}: image HTTP ${res.status}`);
    const name = `${t.kind}--${t.key}`;
    writeFileSync(join(IMG_DIR, `${name}.jpg`), Buffer.from(await res.arrayBuffer()));
    const credit = { title: t.title, kind: t.kind, credit: 'Netflix', source: found.page };
    writeFileSync(join(IMG_DIR, `${name}.json`), JSON.stringify(credit, null, 2) + '\n');
  }
  if (missed.length) console.log(`No art found for: ${missed.join(', ')}`);
}

main().catch((err) => {
  console.error(err.message);
  // In the deploy a missing thumbnail isn't worth failing the build over.
  process.exit(CI ? 0 : 1);
});
