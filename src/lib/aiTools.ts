import { getCollection, type CollectionEntry } from 'astro:content';

export interface AiTool {
  slug: string;
  name: string;
  maker: string;
  url: string;
  pricing: string;
  goodFor: string[];
  onTv: string | null;
  local: boolean;
  privacyNote: string;
  verified: string;
}

const fromEntry = (e: CollectionEntry<'ai-tools'>): AiTool => ({
  slug: e.id,
  name: e.data.name,
  maker: e.data.maker,
  url: e.data.url,
  pricing: e.data.pricing,
  goodFor: e.data.goodFor,
  onTv: e.data.onTv ?? null,
  local: e.data.local,
  privacyNote: e.data.privacyNote,
  verified: e.data.verified,
});

/** All AI tool cards in editorial order (`order`, then name). */
export async function getAiTools(): Promise<AiTool[]> {
  const entries = await getCollection('ai-tools');
  return entries
    .sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name))
    .map(fromEntry);
}
