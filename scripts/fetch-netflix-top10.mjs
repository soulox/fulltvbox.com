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
