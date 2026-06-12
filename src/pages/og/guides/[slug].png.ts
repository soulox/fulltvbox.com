import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderOg } from '../../../og/card';

export const getStaticPaths: GetStaticPaths = async () => {
  const guides = await getCollection('guides');
  return guides.map(g => ({
    params: { slug: g.slug },
    props: { title: g.data.title, meta: g.data.description },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg({ kind: 'GUIDE', title: props.title as string, meta: props.meta as string });
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
