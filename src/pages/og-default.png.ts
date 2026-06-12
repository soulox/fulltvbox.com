import type { APIRoute } from 'astro';
import { renderOg } from '../og/card';

export const GET: APIRoute = async () => {
  const png = await renderOg({
    kind: 'AV Hardware Lab',
    title: 'Tested on the bench.\nRated without mercy.',
    meta: 'Independent TV box reviews, comparisons, and setup guides — no manufacturer bias.',
  });
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
