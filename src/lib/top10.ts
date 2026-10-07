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

// Loaded once per build: every list on every page joins against the same verdicts.
let verdictIndex: Promise<Map<string, Verdict>> | undefined;

async function withVerdicts(list: Omit<WatchTitle, 'service' | 'verdict'>[]): Promise<WatchTitle[]> {
  verdictIndex ??= getCollection('watch-verdicts').then((entries) => indexByKey(entries.map((e) => e.data)));
  const verdicts = await verdictIndex;
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
