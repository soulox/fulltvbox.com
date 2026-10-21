import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderOg } from '../../../og/card';

export const getStaticPaths: GetStaticPaths = async () => {
  const reviews = await getCollection('reviews');
  return reviews.map(r => ({
    params: { slug: r.slug },
    props: {
      title: r.data.title.replace(/ Review.*$/i, '').trim(),
      rating: r.data.rating,
      // In-progress reviews have no score yet, so the card says so instead of showing one.
      meta: r.data.testingSince ? 'Review in progress: hands-on testing now, score to follow.' : undefined,
    },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg({ kind: 'REVIEW', title: props.title as string, rating: props.rating as number | undefined, meta: props.meta as string | undefined });
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
