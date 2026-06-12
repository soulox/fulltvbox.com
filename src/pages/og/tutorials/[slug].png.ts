import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderOg } from '../../../og/card';

export const getStaticPaths: GetStaticPaths = async () => {
  const tutorials = await getCollection('tutorials');
  return tutorials.map(t => ({
    params: { slug: t.slug },
    props: {
      title: t.data.title,
      meta: `${t.data.difficulty.toUpperCase()} · ${t.data.duration}`,
    },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg({ kind: 'TUTORIAL', title: props.title as string, meta: props.meta as string });
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
