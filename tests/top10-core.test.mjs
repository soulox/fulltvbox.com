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
