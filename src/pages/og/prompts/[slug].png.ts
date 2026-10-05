import type { APIRoute, GetStaticPaths } from 'astro';
import { getPrompts } from '../../../lib/prompts';
import { renderOg } from '../../../og/card';

export const getStaticPaths: GetStaticPaths = async () => {
  const prompts = await getPrompts();
  return prompts.map(p => ({
    params: { slug: p.slug },
    props: { title: p.entry.data.title, meta: p.entry.data.description },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg({ kind: 'PROMPT', title: props.title as string, meta: props.meta as string });
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
