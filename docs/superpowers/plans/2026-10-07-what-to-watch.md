# What to Watch — Netflix Top 10 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public `/what-to-watch` section with Netflix top 10 movies and series for this week (US, plus global), the past month, this year and last year, each with an optional editorial verdict.

**Architecture:** A build-time script downloads Netflix's official Top 10 TSVs into `.cache/netflix-top10.json`. Pure ranking logic lives in `src/lib/top10-core.mjs`; it is tested with `node --test` and shared by the script and the Astro lib. `src/lib/top10.ts` reads the cache, joins verdicts from a new `watch-verdicts` content collection, and feeds static pages. A weekly cloud routine drafts verdicts through PRs.

**Tech Stack:** Astro 5 (static), Tailwind with the "Test Bench" classes, Zod content collections, Node ≥20.19 (`node:test`, global `fetch`), satori OG cards (`src/og/card.ts`).

**Spec:** `docs/superpowers/specs/2026-10-07-what-to-watch-design.md`

## Global Constraints

- No third-party requests from the visitor's browser: all data is fetched at build time (privacy constraint in CLAUDE.md).
- Data source: `https://www.netflix.com/tudum/top10/data/all-weeks-global.tsv` and `all-weeks-countries.tsv`; keep rows with `week >= "2025-01-01"`.
- Weekly lists = US ranks (country file). Past-month, this-year and year lists = **global** `weekly_views` summed over weeks in the period.
- Title key = `season_title` when it isn't `N/A`, otherwise `show_title`, normalized to a slug.
- Fetch failure: `process.exit(1)` when `process.env.CI` is set; otherwise warn and exit 0.
- Missing cache → pages render an empty state and set `noindex`.
- Verdict `take` ≤ 160 chars; `sources` ≥ 2 URLs; `verdict` ∈ `watch | skip | depends`.
- Reuse the Test Bench classes (`.bench-card`, `.frame`, `.chip`, `.label`, `text-signal`, `text-amber`, `text-dim`, `text-muted`, `text-ink`); no new global styles.
- Commit trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

- **Non-Latin or punctuation-heavy titles** ("The Widower: 'Til Death Do Us Part", Korean or Spanish titles): the key must be stable and non-empty, so verdicts join. Pinned in Task 1 (`titleKey` tests).
- **Two seasons of the same show** must rank as separate entries, and a verdict for season 1 must not attach to season 2. Pinned in Task 1 (`displayTitle` and `periodTop` tests).
- **Ties in views** must give a stable order (alphabetical), so rebuilds don't reshuffle the list. Pinned in Task 1.
- **Sparse periods** (fewer than 10 titles, or none) render a short or empty list without crashing. Pinned in Task 1 (`periodTop` on small data) and Task 4 (empty-state component).
- **Duplicate verdict files** for one title key must fail the build loudly, not pick one silently. Pinned in Task 1 (`indexByKey`).

---

## File structure

| File | Responsibility |
|---|---|
| `src/lib/top10-core.mjs` (new) | Pure helpers: TSV parsing, title keys, weekly and period rankings, period definitions, week labels, verdict index. No I/O. |
| `tests/top10-core.test.mjs` (new) | `node:test` coverage for the core. |
| `scripts/fetch-netflix-top10.mjs` (new) | Download both TSVs, filter, write `.cache/netflix-top10.json`. |
| `src/content/config.ts` (modify) | Add the `watch-verdicts` collection. |
| `src/lib/top10.ts` (new) | Astro-side: read the cache, join verdicts, `ItemList` JSON-LD helper. |
| `src/components/Top10List.astro` (new) | One ranked list (movies or series). |
| `src/components/NetflixListNav.astro` (new) | Links between this week / past month / this year / past years. |
| `src/components/NetflixSourceNote.astro` (new) | Source attribution and methodology note. |
| `src/pages/what-to-watch/index.astro` (new) | Hub. |
| `src/pages/what-to-watch/netflix/index.astro` (new) | This week, US and global. |
| `src/pages/what-to-watch/netflix/[period].astro` (new) | Past month, this year, past years. |
| `src/pages/og/what-to-watch/[page].png.ts` (new) | OG cards. |
| `src/layouts/BaseLayout.astro`, `astro.config.mjs`, `src/pages/streaming-services.astro`, `src/pages/ai/prompts/group/[group].astro`, `src/pages/credits.astro` (modify) | Nav, sitemap priority, cross-links, data credit. |
| `package.json` (modify) | `test`, `top10`, `deploy` scripts. |
| `docs/automation/weekly-verdicts-agent.md` (new), `CLAUDE.md`, `README.md` (modify) | Routine brief and docs. |

---

### Task 1: Ranking core with tests

**Files:**
- Create: `src/lib/top10-core.mjs`
- Create: `tests/top10-core.test.mjs`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces (all exported from `src/lib/top10-core.mjs`):
  - `parseTsv(text: string): Record<string,string>[]`
  - `displayTitle(show: string, season: string): string`
  - `titleKey(title: string): string`
  - `globalRows(records, since: string): Top10Row[]`
  - `countryRows(records, iso2: string, since: string): Top10Row[]`
  - `latestWeek(rows: Top10Row[]): string | null`
  - `weeklyTop(rows, { kind, week, limit? }): RankedTitle[]`
  - `periodTop(rows, { kind, from, to, limit? }): RankedTitle[]`
  - `addDays(isoDate: string, n: number): string`
  - `netflixPeriods(latest: string): Period[]`
  - `weekLabel(weekEnd: string): string`
  - `indexByKey<T extends { title: string }>(entries: T[]): Map<string, T>`
  - `FIRST_YEAR = 2025`
  - Types: `Top10Row = { week, kind: 'movie'|'series', rank, title, views?: number, weeks }`, `RankedTitle = { key, title, kind, rank, views?: number, weeksInTop10 }`, `Period = { slug, label, from, to }`

- [ ] **Step 1: Write the failing tests** — `tests/top10-core.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseTsv, displayTitle, titleKey, globalRows, countryRows, latestWeek,
  weeklyTop, periodTop, addDays, netflixPeriods, weekLabel, indexByKey,
} from '../src/lib/top10-core.mjs';

const GLOBAL_TSV = [
  'week\tcategory\tweekly_rank\tshow_title\tseason_title\tweekly_hours_viewed\truntime\tweekly_views\tcumulative_weeks_in_top_10',
  '2026-10-04\tFilms (English)\t1\tUNABOMBER\tN/A\t41500000\t1.6667\t24900000\t2',
  '2026-10-04\tFilms (Non-English)\t1\tLa Sustancia\tN/A\t20000000\t2\t10000000\t1',
  '2026-10-04\tTV (English)\t1\tWednesday\tWednesday: Season 2\t90000000\t8\t11250000\t3',
  '2026-09-27\tFilms (English)\t1\tUNABOMBER\tN/A\t50000000\t1.6667\t30000000\t1',
  '2026-09-27\tTV (English)\t2\tWednesday\tWednesday: Season 1\t40000000\t8\t5000000\t40',
  '2024-12-29\tFilms (English)\t1\tOld Film\tN/A\t1\t1\t999999999\t1',
  '',
].join('\r\n');

test('parseTsv handles CRLF and a trailing blank line', () => {
  const rows = parseTsv(GLOBAL_TSV);
  assert.equal(rows.length, 6);
  assert.equal(rows[0].show_title, 'UNABOMBER');
  assert.equal(rows[0].cumulative_weeks_in_top_10, '2');
});

test('displayTitle prefers the season title', () => {
  assert.equal(displayTitle('Wednesday', 'Wednesday: Season 2'), 'Wednesday: Season 2');
  assert.equal(displayTitle('UNABOMBER', 'N/A'), 'UNABOMBER');
  assert.equal(displayTitle('UNABOMBER', ''), 'UNABOMBER');
});

test('titleKey is stable for punctuation and non-Latin titles', () => {
  assert.equal(titleKey("The Widower: 'Til Death Do Us Part"), 'the-widower-til-death-do-us-part');
  assert.equal(titleKey('Pokémon Horizons'), 'pokemon-horizons');
  assert.equal(titleKey('오징어 게임'), '오징어-게임');
  assert.notEqual(titleKey('Wednesday: Season 1'), titleKey('Wednesday: Season 2'));
});

test('globalRows filters by date and maps kinds', () => {
  const rows = globalRows(parseTsv(GLOBAL_TSV), '2025-01-01');
  assert.equal(rows.length, 5);
  assert.deepEqual(rows[0], { week: '2026-10-04', kind: 'movie', rank: 1, title: 'UNABOMBER', views: 24900000, weeks: 2 });
  assert.equal(rows[2].kind, 'series');
});

test('countryRows keeps one country and has no views', () => {
  const tsv = [
    'country_name\tcountry_iso2\tweek\tcategory\tweekly_rank\tshow_title\tseason_title\tcumulative_weeks_in_top_10',
    'United States\tUS\t2026-10-04\tFilms\t2\tB Film\tN/A\t1',
    'United States\tUS\t2026-10-04\tFilms\t1\tA Film\tN/A\t3',
    'Argentina\tAR\t2026-10-04\tFilms\t1\tC Film\tN/A\t1',
  ].join('\n');
  const rows = countryRows(parseTsv(tsv), 'US', '2025-01-01');
  assert.equal(rows.length, 2);
  assert.equal(rows[0].views, undefined);
});

test('latestWeek returns the newest week, or null when empty', () => {
  assert.equal(latestWeek(globalRows(parseTsv(GLOBAL_TSV), '2025-01-01')), '2026-10-04');
  assert.equal(latestWeek([]), null);
});

test('weeklyTop ranks by views when present, merging categories', () => {
  const rows = globalRows(parseTsv(GLOBAL_TSV), '2025-01-01');
  const top = weeklyTop(rows, { kind: 'movie', week: '2026-10-04' });
  assert.deepEqual(top.map((t) => [t.rank, t.title]), [[1, 'UNABOMBER'], [2, 'La Sustancia']]);
  assert.equal(top[0].weeksInTop10, 2);
});

test('weeklyTop falls back to rank order without views', () => {
  const rows = [
    { week: 'w', kind: 'movie', rank: 2, title: 'B', weeks: 1 },
    { week: 'w', kind: 'movie', rank: 1, title: 'A', weeks: 1 },
  ];
  assert.deepEqual(weeklyTop(rows, { kind: 'movie', week: 'w' }).map((t) => t.title), ['A', 'B']);
});

test('periodTop sums views per title, inclusive bounds, seasons separate', () => {
  const rows = globalRows(parseTsv(GLOBAL_TSV), '2025-01-01');
  const movies = periodTop(rows, { kind: 'movie', from: '2026-09-27', to: '2026-10-04' });
  assert.deepEqual(movies[0], { key: 'unabomber', title: 'UNABOMBER', kind: 'movie', rank: 1, views: 54900000, weeksInTop10: 2 });
  const series = periodTop(rows, { kind: 'series', from: '2026-09-27', to: '2026-10-04' });
  assert.deepEqual(series.map((t) => t.title), ['Wednesday: Season 2', 'Wednesday: Season 1']);
});

test('periodTop breaks ties alphabetically and handles sparse periods', () => {
  const rows = [
    { week: 'w1', kind: 'movie', rank: 1, title: 'Zed', views: 10, weeks: 1 },
    { week: 'w1', kind: 'movie', rank: 2, title: 'Alpha', views: 10, weeks: 1 },
  ];
  assert.deepEqual(periodTop(rows, { kind: 'movie', from: 'w1', to: 'w1' }).map((t) => t.title), ['Alpha', 'Zed']);
  assert.deepEqual(periodTop(rows, { kind: 'series', from: 'w1', to: 'w1' }), []);
});

test('addDays and weekLabel', () => {
  assert.equal(addDays('2026-10-04', -21), '2026-09-13');
  assert.equal(addDays('2026-01-01', -1), '2025-12-31');
  assert.equal(weekLabel('2026-10-04'), 'Sep 28 – Oct 4, 2026');
});

test('netflixPeriods: past month, year to date, then each full past year', () => {
  const p = netflixPeriods('2026-10-04');
  assert.deepEqual(p.map((x) => x.slug), ['past-month', 'this-year', '2025']);
  assert.deepEqual(p[0], { slug: 'past-month', label: 'Past month', from: '2026-09-13', to: '2026-10-04' });
  assert.deepEqual(p[2], { slug: '2025', label: '2025', from: '2025-01-01', to: '2025-12-31' });
});

test('indexByKey throws on duplicate titles', () => {
  const map = indexByKey([{ title: 'UNABOMBER' }, { title: 'Wednesday: Season 2' }]);
  assert.equal(map.get('unabomber').title, 'UNABOMBER');
  assert.throws(() => indexByKey([{ title: 'UNABOMBER' }, { title: 'Unabomber' }]), /Duplicate verdict/);
});
```

- [ ] **Step 2: Add the test script and run the tests to see them fail**

In `package.json` `"scripts"`, add after `"preview"`:
```json
    "test": "node --test tests/",
```
Run: `npm test`
Expected: FAIL, `Cannot find module '…/src/lib/top10-core.mjs'`.

- [ ] **Step 3: Implement `src/lib/top10-core.mjs`**

```js
// @ts-check
/**
 * Pure helpers for Netflix's official Top 10 data: parsing, title keys and rankings.
 * No I/O, so `node --test` covers them, and both scripts/fetch-netflix-top10.mjs and
 * src/lib/top10.ts share them.
 */

/** @typedef {'movie' | 'series'} Kind */
/** @typedef {{ week: string, kind: Kind, rank: number, title: string, views?: number, weeks: number }} Top10Row */
/** @typedef {{ key: string, title: string, kind: Kind, rank: number, views?: number, weeksInTop10: number }} RankedTitle */
/** @typedef {{ slug: string, label: string, from: string, to: string }} Period */

/** First year we keep data for (the fetch drops older rows). */
export const FIRST_YEAR = 2025;

/** @param {string} text @returns {Record<string, string>[]} */
export function parseTsv(text) {
  const lines = text.split('\n').map((l) => l.replace(/\r$/, '')).filter(Boolean);
  const [head = '', ...rest] = lines;
  const cols = head.split('\t');
  return rest.map((line) => {
    const cells = line.split('\t');
    return Object.fromEntries(cols.map((c, i) => [c, cells[i] ?? '']));
  });
}

/** Seasons rank separately on Netflix, so "Wednesday: Season 2" is its own title. */
export function displayTitle(show, season) {
  return season && season !== 'N/A' ? season : show;
}

/** Slug used to join verdicts. Keeps letters of any script so non-Latin titles get a key. */
export function titleKey(title) {
  return title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .normalize('NFC') // recompose scripts NFKD splits apart (Hangul syllables -> jamo)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

const num = (s) => {
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

/** @returns {Kind} */
const kindOf = (category) => (category.startsWith('Films') ? 'movie' : 'series');

/** @returns {Top10Row[]} */
export function globalRows(records, since) {
  return records
    .filter((r) => r.week >= since)
    .map((r) => ({
      week: r.week,
      kind: kindOf(r.category),
      rank: Number(r.weekly_rank),
      title: displayTitle(r.show_title, r.season_title),
      views: num(r.weekly_views),
      weeks: Number(r.cumulative_weeks_in_top_10),
    }));
}

/** Per-country ranks. The country file has no view counts. @returns {Top10Row[]} */
export function countryRows(records, iso2, since) {
  return records
    .filter((r) => r.country_iso2 === iso2 && r.week >= since)
    .map((r) => ({
      week: r.week,
      kind: kindOf(r.category),
      rank: Number(r.weekly_rank),
      title: displayTitle(r.show_title, r.season_title),
      views: undefined,
      weeks: Number(r.cumulative_weeks_in_top_10),
    }));
}

/** @param {Top10Row[]} rows */
export function latestWeek(rows) {
  return rows.reduce((max, r) => (max === null || r.week > max ? r.week : max), /** @type {string|null} */ (null));
}

const byViewsThenTitle = (a, b) => b.views - a.views || a.title.localeCompare(b.title);

/**
 * One week's list. Global rows have views (English and non-English categories merge and
 * re-rank); country rows keep Netflix's own rank order.
 * @returns {RankedTitle[]}
 */
export function weeklyTop(rows, { kind, week, limit = 10 }) {
  const list = rows.filter((r) => r.kind === kind && r.week === week);
  const hasViews = list.length > 0 && list.every((r) => r.views !== undefined);
  list.sort(hasViews ? byViewsThenTitle : (a, b) => a.rank - b.rank);
  return list.slice(0, limit).map((r, i) => ({
    key: titleKey(r.title),
    title: r.title,
    kind,
    rank: i + 1,
    views: r.views,
    weeksInTop10: r.weeks,
  }));
}

/**
 * Views summed per title over the weeks in [from, to] (inclusive, week-ending dates).
 * A title only has data in weeks it was in a Top 10, so this totals "views while charting".
 * @returns {RankedTitle[]}
 */
export function periodTop(rows, { kind, from, to, limit = 10 }) {
  /** @type {Map<string, { key: string, title: string, views: number, weeks: number }>} */
  const totals = new Map();
  for (const r of rows) {
    if (r.kind !== kind || r.week < from || r.week > to || r.views === undefined) continue;
    const key = titleKey(r.title);
    const t = totals.get(key) ?? { key, title: r.title, views: 0, weeks: 0 };
    t.views += r.views;
    t.weeks += 1;
    totals.set(key, t);
  }
  return [...totals.values()]
    .sort(byViewsThenTitle)
    .slice(0, limit)
    .map((t, i) => ({ key: t.key, title: t.title, kind, rank: i + 1, views: t.views, weeksInTop10: t.weeks }));
}

export function addDays(isoDate, n) {
  return new Date(new Date(`${isoDate}T00:00:00Z`).getTime() + n * 86_400_000).toISOString().slice(0, 10);
}

/** "Sep 28 – Oct 4, 2026" for a week ending on `weekEnd` (Netflix weeks run Monday–Sunday). */
export function weekLabel(weekEnd) {
  const fmt = (d, year) =>
    new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', ...(year ? { year: 'numeric' } : {}), timeZone: 'UTC',
    });
  return `${fmt(addDays(weekEnd, -6), false)} – ${fmt(weekEnd, true)}`;
}

/**
 * The aggregated list pages: rolling past month (last 4 weekly lists), year to date, and
 * every complete past year we hold data for.
 * @returns {Period[]}
 */
export function netflixPeriods(latest) {
  const year = Number(latest.slice(0, 4));
  const periods = [
    { slug: 'past-month', label: 'Past month', from: addDays(latest, -21), to: latest },
    { slug: 'this-year', label: `${year} so far`, from: `${year}-01-01`, to: latest },
  ];
  for (let y = year - 1; y >= FIRST_YEAR; y--) {
    periods.push({ slug: String(y), label: String(y), from: `${y}-01-01`, to: `${y}-12-31` });
  }
  return periods;
}

/**
 * Map of titleKey -> entry. Two verdict files for one title would make the page pick one
 * silently, so that fails the build instead.
 * @template {{ title: string }} T
 * @param {T[]} entries
 * @returns {Map<string, T>}
 */
export function indexByKey(entries) {
  const map = new Map();
  for (const e of entries) {
    const key = titleKey(e.title);
    if (map.has(key)) throw new Error(`Duplicate verdict for "${e.title}" (key "${key}")`);
    map.set(key, e);
  }
  return map;
}
```

- [ ] **Step 4: Run the tests and see them pass**

Run: `npm test`
Expected: PASS, `# pass 13`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/top10-core.mjs tests/top10-core.test.mjs package.json
git commit -m "feat(top10): ranking core for Netflix Top 10 data" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Build-time fetch script

**Files:**
- Create: `scripts/fetch-netflix-top10.mjs`
- Modify: `package.json` (`top10` and `deploy` scripts)

**Interfaces:**
- Consumes: `parseTsv`, `globalRows`, `countryRows`, `latestWeek`, `FIRST_YEAR` from Task 1.
- Produces: `.cache/netflix-top10.json` = `{ fetchedAt: string, global: Top10Row[], us: Top10Row[] }`. Env override `NETFLIX_TOP10_BASE` (base URL, for testing failures).

- [ ] **Step 1: Write `scripts/fetch-netflix-top10.mjs`**

```js
/**
 * Download Netflix's official Top 10 data and write .cache/netflix-top10.json for the
 * /what-to-watch pages (src/lib/top10.ts). Runs before every deploy build.
 *
 * Source: https://www.netflix.com/tudum/top10 — weekly lists, published Tuesdays.
 *   all-weeks-global.tsv     global ranks with view counts, four categories
 *   all-weeks-countries.tsv  per-country ranks, no view counts (~470k rows; only US kept)
 *
 * On failure: exits 1 in CI, so the deploy fails and Cloudflare keeps serving the last good
 * build instead of empty lists. Locally it only warns; the pages then show an empty state.
 *
 * Usage: node scripts/fetch-netflix-top10.mjs   (npm run top10)
 *   NETFLIX_TOP10_BASE=<url>  override the data base URL
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseTsv, globalRows, countryRows, latestWeek, FIRST_YEAR } from '../src/lib/top10-core.mjs';

const BASE = process.env.NETFLIX_TOP10_BASE || 'https://www.netflix.com/tudum/top10/data';
const SINCE = `${FIRST_YEAR}-01-01`;
const OUT_DIR = join(process.cwd(), '.cache');
const UA = 'FullTVBoxBot/1.0 (+https://fulltvbox.com)';

async function getText(name) {
  const res = await fetch(`${BASE}/${name}`, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return res.text();
}

async function main() {
  const global = globalRows(parseTsv(await getText('all-weeks-global.tsv')), SINCE);

  // Keep the header and US lines before parsing; the full file is ~470k rows.
  const lines = (await getText('all-weeks-countries.tsv')).split('\n');
  const us = countryRows(parseTsv([lines[0], ...lines.filter((l) => l.includes('\tUS\t'))].join('\n')), 'US', SINCE);

  if (!global.length || !us.length) throw new Error(`no rows after filtering (global ${global.length}, US ${us.length}) — did the format change?`);

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, 'netflix-top10.json'), JSON.stringify({ fetchedAt: new Date().toISOString(), global, us }));
  console.log(`✓ Netflix Top 10: ${global.length} global rows (latest ${latestWeek(global)}), ${us.length} US rows (latest ${latestWeek(us)})`);
}

main().catch((e) => {
  console.error(`✗ Netflix Top 10 fetch failed: ${e.message}`);
  process.exit(process.env.CI ? 1 : 0);
});
```

- [ ] **Step 2: Wire the scripts**

In `package.json`:
- add `"top10": "node scripts/fetch-netflix-top10.mjs",` after `"prices"`;
- change `"deploy"` to `"node scripts/fetch-prices.mjs && node scripts/fetch-netflix-top10.mjs && astro build && wrangler pages deploy dist --project-name fulltvbox"`.

- [ ] **Step 3: Run it**

Run: `npm run top10`
Expected: `✓ Netflix Top 10: <n> global rows (latest 2026-10-04 or later), <n> US rows (latest …)`. Both counts are above 0, and `.cache/netflix-top10.json` exists.

- [ ] **Step 4: Check the failure paths**

Run: `NETFLIX_TOP10_BASE=https://www.netflix.com/nope npm run top10; echo "exit=$?"`
Expected: `✗ Netflix Top 10 fetch failed: all-weeks-global.tsv: HTTP 404` (or similar) and `exit=0`.
Run: `CI=1 NETFLIX_TOP10_BASE=https://www.netflix.com/nope node scripts/fetch-netflix-top10.mjs; echo "exit=$?"`
Expected: the same message and `exit=1`. Then run `npm run top10` again to restore a good cache.

- [ ] **Step 5: Commit**

```bash
git add scripts/fetch-netflix-top10.mjs package.json
git commit -m "feat(top10): fetch Netflix Top 10 data before each build" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Verdicts collection and Astro data layer

**Files:**
- Modify: `src/content/config.ts` (new collection + export)
- Create: `src/lib/top10.ts`

**Interfaces:**
- Consumes: Task 1 core functions; the Task 2 cache file.
- Produces (from `src/lib/top10.ts`):
  - `type Kind = 'movie' | 'series'`
  - `type Verdict = CollectionEntry<'watch-verdicts'>['data']`
  - `interface WatchTitle { key: string; title: string; kind: Kind; service: 'netflix'; rank: number; views?: number; weeksInTop10: number; verdict?: Verdict }`
  - `netflixLatestWeek(region?: 'us' | 'global'): string | null`
  - `getWeeklyTop(region: 'us' | 'global', kind: Kind): Promise<WatchTitle[]>`
  - `getPeriodTop(kind: Kind, from: string, to: string): Promise<WatchTitle[]>`
  - `getNetflixPeriods(): Period[]`
  - `itemListJsonLd(name: string, items: WatchTitle[]): object`
  - re-exports `weekLabel`, `type Period`

- [ ] **Step 1: Add the collection to `src/content/config.ts`**

Before `export const collections = {`, add:
```ts
// Editorial verdicts for titles on the /what-to-watch lists, drafted weekly by a cloud
// routine (docs/automation/weekly-verdicts-agent.md). Joined to Netflix titles by
// titleKey(title) in src/lib/top10.ts; a duplicate key fails the build.
const watchVerdicts = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(), // exactly as Netflix lists it, season included ("Wednesday: Season 2")
    kind: z.enum(['movie', 'series']),
    verdict: z.enum(['watch', 'skip', 'depends']),
    take: z.string().max(160),
    sources: z.array(z.string().url()).min(2), // the published reviews it's based on
    checked: z.string(),
  }),
});
```
In the `collections` object, add after `'ai-tools': aiTools,`:
```ts
  'watch-verdicts': watchVerdicts,
```
Create the folder with a placeholder so it exists in git: `src/content/watch-verdicts/.gitkeep` (empty file).

- [ ] **Step 2: Write `src/lib/top10.ts`**

```ts
// Netflix Top 10 lists for /what-to-watch, built from the snapshot written by
// scripts/fetch-netflix-top10.mjs. Ranking logic lives in ./top10-core.mjs (unit-tested).
// The WatchTitle shape is source-agnostic so other services can plug in later.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import { weeklyTop, periodTop, latestWeek, netflixPeriods, indexByKey, weekLabel } from './top10-core.mjs';

export { weekLabel };
export type Kind = 'movie' | 'series';
export type Verdict = CollectionEntry<'watch-verdicts'>['data'];
export type Period = { slug: string; label: string; from: string; to: string };

export interface WatchTitle {
  key: string;
  title: string;
  kind: Kind;
  service: 'netflix';
  rank: number;
  views?: number;
  weeksInTop10: number;
  verdict?: Verdict;
}

type Row = { week: string; kind: Kind; rank: number; title: string; views?: number; weeks: number };
let cache: { global: Row[]; us: Row[] } | null | undefined;

function readCache() {
  if (cache !== undefined) return cache;
  try {
    cache = JSON.parse(readFileSync(join(process.cwd(), '.cache', 'netflix-top10.json'), 'utf8'));
  } catch {
    cache = null;
  }
  return cache;
}

/** Latest week-ending date in the data, or null when there is no snapshot. */
export function netflixLatestWeek(region: 'us' | 'global' = 'us'): string | null {
  const c = readCache();
  return c ? latestWeek(c[region]) : null;
}

async function withVerdicts(list: Omit<WatchTitle, 'service' | 'verdict'>[]): Promise<WatchTitle[]> {
  const verdicts = indexByKey((await getCollection('watch-verdicts')).map((e) => e.data));
  return list.map((t) => ({ ...t, service: 'netflix', verdict: verdicts.get(t.key) }));
}

export async function getWeeklyTop(region: 'us' | 'global', kind: Kind): Promise<WatchTitle[]> {
  const c = readCache();
  const week = netflixLatestWeek(region);
  if (!c || !week) return [];
  return withVerdicts(weeklyTop(c[region], { kind, week }));
}

export async function getPeriodTop(kind: Kind, from: string, to: string): Promise<WatchTitle[]> {
  const c = readCache();
  if (!c) return [];
  return withVerdicts(periodTop(c.global, { kind, from, to }));
}

export function getNetflixPeriods(): Period[] {
  const week = netflixLatestWeek('global');
  return week ? netflixPeriods(week) : [];
}

export function itemListJsonLd(name: string, items: WatchTitle[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: items.map((t) => ({ '@type': 'ListItem', position: t.rank, name: t.title })),
  };
}
```

- [ ] **Step 3: Build to check the schema and types**

Run: `npm run build`
Expected: `Complete!`. A warning that the `watch-verdicts` collection is empty is acceptable.

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts src/content/watch-verdicts/.gitkeep src/lib/top10.ts
git commit -m "feat(top10): watch-verdicts collection and Netflix data layer" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Components and pages

**Files:**
- Create: `src/components/Top10List.astro`, `src/components/NetflixListNav.astro`, `src/components/NetflixSourceNote.astro`
- Create: `src/pages/what-to-watch/index.astro`, `src/pages/what-to-watch/netflix/index.astro`, `src/pages/what-to-watch/netflix/[period].astro`
- Create: `src/pages/og/what-to-watch/[page].png.ts`

**Interfaces:**
- Consumes: everything `src/lib/top10.ts` exports (Task 3); `renderOg` from `src/og/card.ts` (`{ kind?: string; title: string; meta?: string }`); `BaseLayout` props `title`, `description`, `ogImage`, `noindex` and its `head` slot.
- Produces: routes `/what-to-watch`, `/what-to-watch/netflix`, `/what-to-watch/netflix/{past-month|this-year|<year>}`, `/og/what-to-watch/{hub|netflix|<period slug>}.png`.

- [ ] **Step 1: `src/components/Top10List.astro`**

```astro
---
import type { WatchTitle } from '../lib/top10';

interface Props {
  heading: string;
  items: WatchTitle[];
  showViews?: boolean;
  weeksSuffix?: string; // "in the Top 10" (weekly) or "in the Top 10 this period"
}
const { heading, items, showViews = false, weeksSuffix = 'in the Top 10' } = Astro.props;

const fmtViews = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${Math.round(n / 1e3)}K`);
const verdictClass = { watch: 'text-signal border-signal/40', skip: 'text-dim', depends: 'text-amber border-amber/40' };
const verdictLabel = { watch: 'Watch', skip: 'Skip', depends: 'Depends' };
---
<section>
  <h2 class="font-display font-800 text-2xl mb-4">{heading}</h2>
  {items.length === 0 ? (
    <p class="text-muted">No titles for this period yet.</p>
  ) : (
    <ol class="space-y-2">
      {items.map((t) => (
        <li class="bench-card frame px-4 py-3 flex items-start gap-4">
          <span class="font-display font-900 text-2xl text-signal leading-none w-8 shrink-0 text-right">{t.rank}</span>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-display font-700 text-ink">{t.title}</span>
              {t.verdict && <span class={`chip ${verdictClass[t.verdict.verdict]}`}>{verdictLabel[t.verdict.verdict]}</span>}
            </div>
            {t.verdict && <p class="text-muted text-sm mt-1">{t.verdict.take}</p>}
            <div class="label text-dim mt-1">
              {showViews && t.views !== undefined && `${fmtViews(t.views)} views · `}
              {t.weeksInTop10} {t.weeksInTop10 === 1 ? 'week' : 'weeks'} {weeksSuffix}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )}
</section>
```

- [ ] **Step 2: `src/components/NetflixListNav.astro`**

```astro
---
import { getNetflixPeriods } from '../lib/top10';

interface Props { current: string } // 'week' or a period slug
const { current } = Astro.props;
const links = [
  { slug: 'week', label: 'This week', href: '/what-to-watch/netflix' },
  ...getNetflixPeriods().map((p) => ({ slug: p.slug, label: p.label, href: `/what-to-watch/netflix/${p.slug}` })),
];
---
<nav aria-label="Netflix Top 10 lists" class="flex flex-wrap gap-2 mb-10">
  {links.map((l) => (
    <a href={l.href} class={`chip ${l.slug === current ? 'text-signal border-signal/40' : 'hover:text-signal'}`} aria-current={l.slug === current ? 'page' : undefined}>
      {l.label}
    </a>
  ))}
</nav>
```

- [ ] **Step 3: `src/components/NetflixSourceNote.astro`**

```astro
---
interface Props { aggregated?: boolean } // true on month/year pages
const { aggregated = false } = Astro.props;
---
<div class="panel frame px-5 py-4 mt-12 text-sm text-muted leading-relaxed">
  <span class="label text-signal">// Source</span>
  <p class="mt-1">
    Rankings come from Netflix's official
    <a href="https://www.netflix.com/tudum/top10" target="_blank" rel="noopener" class="text-signal border-b border-signal/30 hover:border-signal">Top 10</a>,
    published weekly. {aggregated
      ? 'These lists add up each title\'s global views across the weeks it spent in the weekly Top 10. Netflix doesn\'t publish views for weeks outside it, so a title that charted briefly can rank lower than its true total.'
      : 'US lists use Netflix\'s US ranks; global lists rank by views.'}
  </p>
  <p class="mt-2">Verdicts are our take, based on published reviews. Rebuilt daily.</p>
</div>
```

- [ ] **Step 4: Hub — `src/pages/what-to-watch/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Top10List from '../../components/Top10List.astro';
import NetflixSourceNote from '../../components/NetflixSourceNote.astro';
import { getWeeklyTop, getNetflixPeriods, netflixLatestWeek, itemListJsonLd, weekLabel } from '../../lib/top10';

const week = netflixLatestWeek('us');
const [movies, series] = await Promise.all([getWeeklyTop('us', 'movie'), getWeeklyTop('us', 'series')]);
const periods = getNetflixPeriods();
const jsonLd = [
  itemListJsonLd('Top 10 movies on Netflix in the US this week', movies),
  itemListJsonLd('Top 10 series on Netflix in the US this week', series),
];
---
<BaseLayout
  title="What to Watch: This Week's Top 10 Movies & Shows"
  description="What everyone is actually watching this week: the top 10 movies and series on Netflix in the US, with a quick verdict on what's worth your time."
  ogImage="/og/what-to-watch/hub.png"
  noindex={!week}
>
  {week && (
    <Fragment slot="head">
      <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
    </Fragment>
  )}
  <div class="max-w-5xl mx-auto px-4 py-14">
    <span class="label text-signal">// Watch list</span>
    <h1 class="font-display font-900 text-4xl sm:text-5xl tracking-tight mt-1 mb-2">What to Watch</h1>
    <p class="text-muted mb-8 max-w-2xl">
      The movies and shows people are actually watching, from official viewing data, with our
      quick call on what's worth your evening. Netflix today; more services soon.
    </p>

    {!week ? (
      <div class="panel frame px-6 py-16 text-center">
        <div class="label text-signal mb-2">NO SIGNAL</div>
        <p class="text-muted">The lists are being refreshed. Check back shortly.</p>
      </div>
    ) : (
      <>
        <div class="flex flex-wrap items-baseline justify-between gap-3 mb-6">
          <h2 class="font-display font-800 text-xl">Netflix US · week of {weekLabel(week)}</h2>
          <a href="/what-to-watch/netflix" class="label text-muted hover:text-signal">Global lists →</a>
        </div>
        <div class="grid lg:grid-cols-2 gap-8">
          <Top10List heading="Top 10 movies" items={movies} />
          <Top10List heading="Top 10 series" items={series} />
        </div>
        <div class="mt-12">
          <span class="label text-signal">// More lists</span>
          <div class="flex flex-wrap gap-2 mt-3">
            {periods.map((p) => (
              <a href={`/what-to-watch/netflix/${p.slug}`} class="chip hover:text-signal">Netflix · {p.label}</a>
            ))}
          </div>
        </div>
        <NetflixSourceNote />
      </>
    )}
  </div>
</BaseLayout>
```

- [ ] **Step 5: This week — `src/pages/what-to-watch/netflix/index.astro`**

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Top10List from '../../../components/Top10List.astro';
import NetflixListNav from '../../../components/NetflixListNav.astro';
import NetflixSourceNote from '../../../components/NetflixSourceNote.astro';
import { getWeeklyTop, netflixLatestWeek, itemListJsonLd, weekLabel } from '../../../lib/top10';

const usWeek = netflixLatestWeek('us');
const globalWeek = netflixLatestWeek('global');
const [usMovies, usSeries, globalMovies, globalSeries] = await Promise.all([
  getWeeklyTop('us', 'movie'), getWeeklyTop('us', 'series'),
  getWeeklyTop('global', 'movie'), getWeeklyTop('global', 'series'),
]);
const jsonLd = [
  itemListJsonLd('Top 10 Netflix movies in the US this week', usMovies),
  itemListJsonLd('Top 10 Netflix series in the US this week', usSeries),
];
---
<BaseLayout
  title="Netflix Top 10 This Week: Movies & Series"
  description="This week's top 10 movies and series on Netflix in the US and worldwide, from Netflix's official data, with our verdict on each."
  ogImage="/og/what-to-watch/netflix.png"
  noindex={!usWeek}
>
  {usWeek && (
    <Fragment slot="head">
      <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
    </Fragment>
  )}
  <div class="max-w-5xl mx-auto px-4 py-14">
    <nav class="label text-dim mb-4"><a href="/what-to-watch" class="hover:text-signal">What to Watch</a> / <span class="text-muted">Netflix</span></nav>
    <h1 class="font-display font-900 text-4xl sm:text-5xl tracking-tight mb-2">Netflix Top 10 This Week</h1>
    <p class="text-muted mb-6">{usWeek ? `Week of ${weekLabel(usWeek)}.` : 'The lists are being refreshed.'}</p>
    <NetflixListNav current="week" />
    {usWeek && (
      <>
        <h2 class="label text-signal mb-4">// United States</h2>
        <div class="grid lg:grid-cols-2 gap-8 mb-14">
          <Top10List heading="Movies" items={usMovies} />
          <Top10List heading="Series" items={usSeries} />
        </div>
        <h2 class="label text-signal mb-4">// Worldwide{globalWeek ? ` · week of ${weekLabel(globalWeek)}` : ''}</h2>
        <div class="grid lg:grid-cols-2 gap-8">
          <Top10List heading="Movies" items={globalMovies} showViews />
          <Top10List heading="Series" items={globalSeries} showViews />
        </div>
        <NetflixSourceNote />
      </>
    )}
  </div>
</BaseLayout>
```

- [ ] **Step 6: Period pages — `src/pages/what-to-watch/netflix/[period].astro`**

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Top10List from '../../../components/Top10List.astro';
import NetflixListNav from '../../../components/NetflixListNav.astro';
import NetflixSourceNote from '../../../components/NetflixSourceNote.astro';
import { getNetflixPeriods, getPeriodTop, itemListJsonLd, type Period } from '../../../lib/top10';

export function getStaticPaths() {
  return getNetflixPeriods().map((period) => ({ params: { period: period.slug }, props: { period } }));
}

const { period } = Astro.props as { period: Period };
const [movies, series] = await Promise.all([
  getPeriodTop('movie', period.from, period.to),
  getPeriodTop('series', period.from, period.to),
]);
const heading = period.slug === 'past-month' ? 'the past month' : period.label;
const title = `Most-Watched on Netflix: ${period.label === 'Past month' ? 'Past Month' : period.label}`;
const jsonLd = [
  itemListJsonLd(`Most-watched Netflix movies, ${heading}`, movies),
  itemListJsonLd(`Most-watched Netflix series, ${heading}`, series),
];
---
<BaseLayout
  title={title}
  description={`The 10 most-watched movies and series on Netflix worldwide for ${heading}, from Netflix's official Top 10 data, with our verdict on each.`}
  ogImage={`/og/what-to-watch/${period.slug}.png`}
  noindex={movies.length === 0 && series.length === 0}
>
  <Fragment slot="head">
    <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
  </Fragment>
  <div class="max-w-5xl mx-auto px-4 py-14">
    <nav class="label text-dim mb-4"><a href="/what-to-watch" class="hover:text-signal">What to Watch</a> / <a href="/what-to-watch/netflix" class="hover:text-signal">Netflix</a> / <span class="text-muted">{period.label}</span></nav>
    <h1 class="font-display font-900 text-4xl sm:text-5xl tracking-tight mb-2">{title}</h1>
    <p class="text-muted mb-6">Worldwide, {period.from} to {period.to}, ranked by views.</p>
    <NetflixListNav current={period.slug} />
    <div class="grid lg:grid-cols-2 gap-8">
      <Top10List heading="Movies" items={movies} showViews weeksSuffix="in the Top 10 this period" />
      <Top10List heading="Series" items={series} showViews weeksSuffix="in the Top 10 this period" />
    </div>
    <NetflixSourceNote aggregated />
  </div>
</BaseLayout>
```

- [ ] **Step 7: OG cards — `src/pages/og/what-to-watch/[page].png.ts`**

```ts
import type { APIRoute, GetStaticPaths } from 'astro';
import { renderOg } from '../../../og/card';
import { getNetflixPeriods } from '../../../lib/top10';

export const getStaticPaths: GetStaticPaths = () => [
  { params: { page: 'hub' }, props: { title: 'What to watch\nthis week.', meta: 'Top 10 movies & series from official viewing data, with our verdict.' } },
  { params: { page: 'netflix' }, props: { title: 'Netflix Top 10\nthis week.', meta: 'US and worldwide, movies and series.' } },
  ...getNetflixPeriods().map((p) => ({
    params: { page: p.slug },
    props: { title: `Most-watched on Netflix:\n${p.label}.`, meta: 'Movies and series, ranked by worldwide views.' },
  })),
];

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg({ kind: 'WATCH', title: props.title as string, meta: props.meta as string });
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
```

- [ ] **Step 8: Build and inspect**

Run: `npm run top10 && npm run build`
Expected: `Complete!`. Then:
```bash
ls dist/what-to-watch.html dist/what-to-watch/netflix.html dist/what-to-watch/netflix/past-month.html dist/what-to-watch/netflix/this-year.html dist/what-to-watch/netflix/2025.html dist/og/what-to-watch/hub.png
sed 's/<[^>]*>/ /g' dist/what-to-watch/netflix.html | tr -s ' \n' ' ' | grep -oE 'United States.{0,600}'
```
Expected: every file exists, and the US movies list matches https://www.netflix.com/tudum/top10/united-states for the same week, in the same order.

- [ ] **Step 9: Check the empty state**

Run: `mv .cache/netflix-top10.json .cache/n.bak && npm run build && grep -c noindex dist/what-to-watch.html; grep -o 'NO SIGNAL' dist/what-to-watch.html; mv .cache/n.bak .cache/netflix-top10.json`
Expected: the build completes, the hub has `noindex` and "NO SIGNAL", and no period pages are generated.

- [ ] **Step 10: Commit**

```bash
git add src/components/Top10List.astro src/components/NetflixListNav.astro src/components/NetflixSourceNote.astro src/pages/what-to-watch src/pages/og/what-to-watch
git commit -m "feat(top10): /what-to-watch hub and Netflix Top 10 pages" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Navigation, cross-links, sitemap, credit, and verdict rendering

**Files:**
- Modify: `src/layouts/BaseLayout.astro` (nav array, ~line 50)
- Modify: `astro.config.mjs` (sitemap `serialize`)
- Modify: `src/pages/streaming-services.astro` (intro paragraph)
- Modify: `src/pages/ai/prompts/group/[group].astro` (after the blurb)
- Modify: `src/pages/credits.astro` (data-sources section)

**Interfaces:**
- Consumes: routes from Task 4.

- [ ] **Step 1: Nav** — in `src/layouts/BaseLayout.astro`, append to the `nav` array after the Tutorials entry:
```ts
  { href: '/what-to-watch', label: 'What to Watch', ch: '08' },
```

- [ ] **Step 2: Sitemap priority** — in `astro.config.mjs` `serialize`, add before the final `else item.priority = 0.6;`:
```js
        else if (/^\/what-to-watch(\/|$)/.test(path)) item.priority = 0.7;
```

- [ ] **Step 3: Cross-links**
In `src/pages/streaming-services.astro`, after the line containing `cost calculator</a>.`, add:
```astro
      Not sure what to put on? See <a href="/what-to-watch" class="text-signal border-b border-signal/30 hover:border-signal">what everyone's watching this week</a>.
```
In `src/pages/ai/prompts/group/[group].astro`, after the `<p class="text-muted mb-10 max-w-2xl">{section.blurb}</p>` line, add:
```astro
    {section.id === 'what-to-watch' && (
      <p class="label text-muted -mt-6 mb-10">Or start from the charts: <a href="/what-to-watch" class="text-signal hover:underline">this week's Netflix Top 10 →</a></p>
    )}
```

- [ ] **Step 4: Credit** — in `src/pages/credits.astro`, before the `<p class="label text-dim mt-8">` "Spotted an attribution error?" paragraph, add:
```astro
    <h2 class="font-display font-800 text-2xl mt-12 mb-3">Data sources</h2>
    <p class="text-muted leading-relaxed">
      The <a href="/what-to-watch" class="text-signal border-b border-signal/30 hover:border-signal">What to Watch</a> rankings use Netflix's official
      <a href="https://www.netflix.com/tudum/top10" target="_blank" rel="noopener" class="text-signal border-b border-signal/30 hover:border-signal">Top 10</a> data.
    </p>
```

- [ ] **Step 5: Check the verdict rendering with a temporary file**
Pick the first title from the US movies list in `dist/what-to-watch/netflix.html` (Task 4, Step 8). Create `src/content/watch-verdicts/zz-test.yaml` (not `_test.yaml`: Astro skips content files that start with `_`):
```yaml
title: "<that exact title>"
kind: movie
verdict: watch
take: "Temporary verdict to check rendering."
sources: ["https://example.com/a", "https://example.com/b"]
checked: "2026-10-07"
```
Run: `npm run build && grep -c "Temporary verdict to check rendering" dist/what-to-watch.html dist/what-to-watch/netflix.html`
Expected: a count of at least 1 on both pages. Then copy the file to `zz-test2.yaml`, run `npm run build`, and expect it to fail with `Duplicate verdict for`. Delete both test files.

- [ ] **Step 6: Build, check the nav at phone width, commit**
Run: `npm run build`, then `npm run preview` and open `/what-to-watch` at 375px wide. The nav must not overflow horizontally; the existing nav already scrolls or collapses on mobile, so check that the new item follows the same behavior.
```bash
git add src/layouts/BaseLayout.astro astro.config.mjs src/pages/streaming-services.astro "src/pages/ai/prompts/group/[group].astro" src/pages/credits.astro
git commit -m "feat(top10): nav, cross-links, sitemap priority and data credit" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Verdicts routine brief and docs

**Files:**
- Create: `docs/automation/weekly-verdicts-agent.md`
- Modify: `CLAUDE.md`, `README.md`

- [ ] **Step 1: Write `docs/automation/weekly-verdicts-agent.md`**

````markdown
# Weekly Verdicts Agent — Operating Brief

The procedure the **weekly verdicts routine** runs, once a week after Netflix publishes its
Top 10 (Tuesdays). Treat this file as the source of truth; change the guardrails here, not in
the routine prompt.

**One run = verdicts for the titles on the current /what-to-watch lists, delivered as a pull
request. Never push to `master`.**

## Mission

1. `npm ci && npm run top10` to get this week's data.
2. List the titles that need a verdict.
3. Draft each verdict from published reviews.
4. `npm run build`.
5. Open (or update) a PR.

## Step 1 — Which titles need a verdict

```bash
npm run top10
node --input-type=module <<'EOF'
import fs from 'node:fs';
import { weeklyTop, periodTop, latestWeek, netflixPeriods, titleKey } from './src/lib/top10-core.mjs';
const c = JSON.parse(fs.readFileSync('.cache/netflix-top10.json', 'utf8'));
const dir = 'src/content/watch-verdicts';
const have = new Set(fs.readdirSync(dir).filter((f) => f.endsWith('.yaml'))
  .map((f) => titleKey(fs.readFileSync(`${dir}/${f}`, 'utf8').match(/^title:\s*"?(.*?)"?\s*$/m)[1])));
const pm = netflixPeriods(latestWeek(c.global))[0];
const lists = ['movie', 'series'].flatMap((kind) => [
  ...weeklyTop(c.us, { kind, week: latestWeek(c.us) }),
  ...weeklyTop(c.global, { kind, week: latestWeek(c.global) }),
  ...periodTop(c.global, { kind, from: pm.from, to: pm.to }),
]);
const need = [...new Map(lists.filter((t) => !have.has(t.key)).map((t) => [t.key, t])).values()];
console.log(need.map((t) => `${t.kind}\t${t.title}`).join('\n') || '(none)');
EOF
```
These are the titles on this week's US and global lists and the past-month lists that have
no verdict file yet.

If an earlier weekly verdicts PR is still open, work on its branch (rebase it on
`origin/master`) rather than opening a second one.

## Step 2 — Draft each verdict

For each title, find **at least 2 published reviews** (critics or established outlets: e.g.
Variety, The Guardian, IGN, Vulture, RogerEbert.com, Decider) with `WebSearch` / `WebFetch`.
Then write `src/content/watch-verdicts/<titleKey>.yaml`:

```yaml
title: "Wednesday: Season 2"   # exactly as the list shows it, season included
kind: series                   # movie | series
verdict: watch                 # watch | skip | depends
take: "One line, ≤160 chars: who it's for and why, in the site's candid voice."
sources: ["https://…", "https://…"]
checked: "YYYY-MM-DD"          # today
```

- **watch** — reviews are broadly positive.
- **skip** — broadly negative.
- **depends** — mixed, or good only for a specific taste (say which in the take).

## Guardrails (non-negotiable)

- Never invent a review, a quote or a score. Every verdict must follow from the cited sources.
- Fewer than 2 reviews found → no verdict file; list the title in the PR body as skipped.
- One file per title key. A new season is a new title with its own file; don't reuse season 1's.
- Don't edit anything outside `src/content/watch-verdicts/`.
- No spoilers beyond the premise.

## Step 3 — Validate and deliver

`npm run build` must pass (the schema checks `take` length, URLs, and duplicate titles).
Branch `verdicts/weekly-YYYY-MM-DD`, commit, push, and `gh pr create`. In the PR body: a
table of title, verdict, take and source links, plus the titles skipped for lack of reviews.
Never push to `master` or merge. End commit messages with a `Co-Authored-By:` trailer naming
the model that ran.
````

- [ ] **Step 2: Update `CLAUDE.md`**
- In **Commands**, replace the line `- **No test runner, linter, or formatter is configured.**` with: `- **Tests:** \`npm test\` runs \`node --test tests/\` (pure logic only, e.g. \`src/lib/top10-core.mjs\`). No linter or formatter.`, keeping the rest of that bullet (the build is the main check).
- In **Content-collection architecture**, add the bullet: `- \`watch-verdicts/\` (YAML) — editorial verdicts for /what-to-watch titles, joined by \`titleKey(title)\` in \`src/lib/top10.ts\`; a duplicate key fails the build.`
- Add a section:
```markdown
## What to Watch (Netflix Top 10)

`scripts/fetch-netflix-top10.mjs` (`npm run top10`) downloads Netflix's official Top 10 TSVs before each deploy build into `.cache/netflix-top10.json` (it exits 1 in CI on failure, so a bad fetch fails the deploy instead of shipping empty lists). Ranking logic is in `src/lib/top10-core.mjs` (unit-tested); `src/lib/top10.ts` joins verdicts and feeds `/what-to-watch`. Weekly lists are US ranks; past-month and year lists total global views across the weeks a title charted. A weekly routine drafts verdicts by PR (brief: `docs/automation/weekly-verdicts-agent.md`). Other services and genres need TMDB (phase 2, pending a commercial agreement).
```

- [ ] **Step 3: Update `README.md`** — after the `### Deals` section, add:
```markdown
### What to Watch

`/what-to-watch` lists the top 10 Netflix movies and series for this week (US and global), the
past month, this year and each past year, from Netflix's official Top 10 data. Run
`npm run top10` once before `npm run dev` to download the data (the deploy does it automatically).
Each title can carry a short verdict from `src/content/watch-verdicts/`, drafted weekly by the
routine in [`docs/automation/weekly-verdicts-agent.md`](docs/automation/weekly-verdicts-agent.md).
```

- [ ] **Step 4: Check the brief's Step 1 snippet runs**
Run the `node --input-type=module` block from the brief.
Expected: a list of `movie|series<TAB>title` lines with no errors.

- [ ] **Step 5: Commit**
```bash
git add docs/automation/weekly-verdicts-agent.md CLAUDE.md README.md
git commit -m "docs(top10): verdicts routine brief and What to Watch docs" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Final verification and PR

- [ ] **Step 1:** `npm test` → all pass.
- [ ] **Step 2:** `npm run top10 && npm run build` → `Complete!`.
- [ ] **Step 3:** Re-add one past-month total by hand: take the #1 global past-month movie, sum its `views` for weeks in `[from, to]` from `.cache/netflix-top10.json`, and compare with the page:
```bash
node -e 'const c=require("./.cache/netflix-top10.json");const t=process.argv[1];console.log(c.global.filter(r=>r.title===t&&r.week>=process.argv[2]&&r.week<=process.argv[3]).reduce((s,r)=>s+r.views,0))' "<title>" "<from>" "<to>"
```
Expected: the total matches the page's views figure (formatted as `X.XM`).
- [ ] **Step 4:** `grep -c "what-to-watch" dist/sitemap-0.xml` → at least 5.
- [ ] **Step 5:** Push and open the PR:
```bash
git push -u origin feat/what-to-watch
gh pr create --base master --title "feat: /what-to-watch — Netflix Top 10 with verdicts (phase 1)" --body "<summary, test results, follow-ups: create the verdicts routine after merge; apply for a TMDB commercial agreement for phase 2>"
```
(`gh` may need to be called as `"/c/Program Files/GitHub CLI/gh.exe"`.)

After merge (not part of this plan's code): create the weekly verdicts cloud routine through `/schedule` (Wednesdays 05:17 UTC), mirroring the deals routine's config, with a prompt that points at `docs/automation/weekly-verdicts-agent.md`.
