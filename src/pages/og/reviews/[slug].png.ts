import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderOg } from '../../../og/card';

export const getStaticPaths: GetStaticPaths = async () => {
  const reviews = await getCollection('reviews');
  return reviews.map(r => ({
    params: { slug: r.slug },
    props: { title: r.data.title.replace(/ Review.*$/i, '').trim(), rating: r.data.rating },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg({ kind: 'REVIEW', title: props.title as string, rating: props.rating as number });
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
