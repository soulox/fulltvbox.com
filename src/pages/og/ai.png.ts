import type { APIRoute } from 'astro';
import { renderOg } from '../../og/card';
import { getPrompts } from '../../lib/prompts';

export const GET: APIRoute = async () => {
  const count = (await getPrompts()).length;
  const png = await renderOg({
    kind: 'AI',
    title: 'AI prompts & tools\nfor your TV, tested.',
    meta: `${count} copy-ready prompts for buffering fixes, what to watch, and cheaper streaming.`,
  });
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
