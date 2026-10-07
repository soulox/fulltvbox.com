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

/**
 * Seasons rank separately on Netflix, so "Wednesday: Season 2" is its own title.
 * @param {string} show @param {string} season
 */
export function displayTitle(show, season) {
  return season && season !== 'N/A' ? season : show;
}

/**
 * Slug used to join verdicts. Keeps letters of any script so non-Latin titles get a key.
 * @param {string} title
 */
export function titleKey(title) {
  return title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .normalize('NFC') // recompose scripts NFKD splits apart (Hangul syllables -> jamo)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

/** @param {string} s */
const num = (s) => {
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

/** @param {string} category @returns {Kind} */
const kindOf = (category) => (category.startsWith('Films') ? 'movie' : 'series');

/** @param {Record<string, string>[]} records @param {string} since @returns {Top10Row[]} */
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

/**
 * Per-country ranks. The country file has no view counts.
 * @param {Record<string, string>[]} records @param {string} iso2 @param {string} since
 * @returns {Top10Row[]}
 */
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

/** @param {{ views?: number, title: string }} a @param {{ views?: number, title: string }} b */
const byViewsThenTitle = (a, b) => (b.views ?? 0) - (a.views ?? 0) || a.title.localeCompare(b.title);

/**
 * One week's list. Global rows have views (English and non-English categories merge and
 * re-rank); country rows keep Netflix's own rank order.
 * @param {Top10Row[]} rows
 * @param {{ kind: Kind, week: string, limit?: number }} opts
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
 * @param {Top10Row[]} rows
 * @param {{ kind: Kind, from: string, to: string, limit?: number }} opts
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

/** @param {string} isoDate @param {number} n */
export function addDays(isoDate, n) {
  return new Date(new Date(`${isoDate}T00:00:00Z`).getTime() + n * 86_400_000).toISOString().slice(0, 10);
}

/**
 * "Sep 28 – Oct 4, 2026" for a week ending on `weekEnd` (Netflix weeks run Monday–Sunday).
 * @param {string} weekEnd
 */
export function weekLabel(weekEnd) {
  /** @param {string} d @param {boolean} year */
  const fmt = (d, year) =>
    new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', ...(year ? { year: 'numeric' } : {}), timeZone: 'UTC',
    });
  return `${fmt(addDays(weekEnd, -6), false)} – ${fmt(weekEnd, true)}`;
}

/**
 * The aggregated list pages: rolling past month (last 4 weekly lists), year to date, and
 * every complete past year we hold data for.
 * @param {string} latest
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
