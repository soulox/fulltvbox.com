import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { latestDate } from '../lib/freshness';
import { getComparisonPairs } from '../lib/devices';

// Build-time generated llms.txt (https://llmstxt.org) — a curated, machine-readable
// index that steers AI search/answer engines to the canonical content on the site.
export const GET: APIRoute = async ({ site }) => {
  const base = (site?.href ?? 'https://fulltvbox.com/').replace(/\/$/, '');

  const byNewest = (a: { data: { publishDate: string; updatedDate?: string } }, b: typeof a) =>
    new Date(latestDate(b.data.publishDate, b.data.updatedDate)).getTime() -
    new Date(latestDate(a.data.publishDate, a.data.updatedDate)).getTime();

  const [reviews, guides, tutorials, pairs] = await Promise.all([
    getCollection('reviews'),
    getCollection('guides'),
    getCollection('tutorials'),
    getComparisonPairs(),
  ]);

  const item = (path: string, title: string, desc: string) =>
    `- [${title}](${base}${path}): ${desc.replace(/\s+/g, ' ').trim()}`;

  const section = (heading: string, lines: string[]) => `## ${heading}\n${lines.join('\n')}`;

  const body = [
    '# FullTVBox',
    '',
    '> Independent TV box & streaming-device reviews, head-to-head comparisons, cord-cutting tools, and Raspberry Pi home-lab tutorials. Every device is bench-tested; ratings are editorial and unsponsored.',
    '',
    'Key pages:',
    item('/reviews', 'All reviews', 'Every streaming box and stick we have tested, ranked and rated.'),
    item('/best-picks', 'Best TV boxes', 'Our current top picks for every budget and use case.'),
    item('/compare', 'Compare devices', 'Side-by-side spec comparison of streaming boxes and sticks.'),
    item('/cut-the-cord', 'Cut the cord', 'Cord-cutting hub: cost calculator, services, and recommended hardware.'),
    item('/devices.json', 'Device data (JSON)', 'Machine-readable specs for every reviewed device.'),
    '',
    section('Reviews', reviews.sort(byNewest).map((r) => item(`/reviews/${r.slug}`, r.data.title, r.data.description))),
    '',
    section('Guides', guides.sort(byNewest).map((g) => item(`/guides/${g.slug}`, g.data.title, g.data.description))),
    '',
    section('Tutorials', tutorials.sort(byNewest).map((t) => item(`/tutorials/${t.slug}`, t.data.title, t.data.description))),
    '',
    section(
      'Comparisons',
      pairs.map((p) =>
        item(
          `/compare/${p.a.slug}-vs-${p.b.slug}`,
          `${p.a.name} vs ${p.b.name}`,
          `Head-to-head: ${p.a.name} (${p.a.rating.toFixed(1)}/5) vs ${p.b.name} (${p.b.rating.toFixed(1)}/5) — specs, price, and which to buy.`
        )
      )
    ),
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
