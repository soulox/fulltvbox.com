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
