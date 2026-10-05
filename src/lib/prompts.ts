/**
 * AI prompt library — groups, ordering, and the slug joins from prompts to AI
 * tools and to related guides/tutorials/reviews. Unknown slugs throw at build
 * time so a typo can't silently drop a link.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { latestDate } from './freshness';
import { getAiTools, type AiTool } from './aiTools';

export type PromptEntry = CollectionEntry<'prompts'>;
export type PromptGroupId = PromptEntry['data']['group'];

/** Ordered list of groups — defines display labels, blurbs, and section order. */
export const PROMPT_GROUPS: { id: PromptGroupId; label: string; blurb: string }[] = [
  {
    id: 'troubleshooting',
    label: 'Troubleshooting',
    blurb: 'Diagnose buffering, Wi-Fi drops, and picture problems on your streaming device.',
  },
  {
    id: 'what-to-watch',
    label: 'What to Watch',
    blurb: 'Find shows across the services you already pay for and plan movie nights.',
  },
  {
    id: 'save-money',
    label: 'Save Money',
    blurb: 'Audit subscriptions, rotate services, and find the cheapest way to watch what you want.',
  },
  {
    id: 'setup-homelab',
    label: 'Setup & Home Lab',
    blurb: 'Choose hardware, plan a media server, and configure Pi-hole without breaking streaming apps.',
  },
];

export interface LinkItem {
  href: string;
  title: string;
  description: string;
}

export interface Prompt {
  entry: PromptEntry;
  slug: string;
  href: string;
  tools: AiTool[];
  related: LinkItem[];
}

export function promptGroupLabel(id: PromptGroupId): string {
  return PROMPT_GROUPS.find((g) => g.id === id)?.label ?? id;
}

const byLatestDesc = (a: Prompt, b: Prompt) =>
  new Date(latestDate(b.entry.data.publishDate, b.entry.data.updatedDate)).getTime() -
  new Date(latestDate(a.entry.data.publishDate, a.entry.data.updatedDate)).getTime();

let cache: Promise<Prompt[]> | undefined;

/** All prompts, newest first, with tools and related links resolved. */
export function getPrompts(): Promise<Prompt[]> {
  cache ??= load();
  return cache;
}

async function load(): Promise<Prompt[]> {
  const [entries, tools, guides, tutorials, reviews] = await Promise.all([
    getCollection('prompts'),
    getAiTools(),
    getCollection('guides'),
    getCollection('tutorials'),
    getCollection('reviews'),
  ]);

  const toolBySlug = new Map(tools.map((t) => [t.slug, t]));
  // A related slug may point at any long-form collection; guides win on a clash.
  const pages = new Map<string, LinkItem>();
  for (const [base, list] of [
    ['/reviews', reviews],
    ['/tutorials', tutorials],
    ['/guides', guides],
  ] as const) {
    for (const e of list) {
      pages.set(e.slug, { href: `${base}/${e.slug}`, title: e.data.title, description: e.data.description });
    }
  }

  return entries
    .map((entry) => {
      const where = `prompts/${entry.id}`;
      return {
        entry,
        slug: entry.slug,
        href: `/ai/prompts/${entry.slug}`,
        tools: entry.data.tools.map((s) => {
          const t = toolBySlug.get(s);
          if (!t) throw new Error(`${where}: unknown tool "${s}" (no src/content/ai-tools/${s}.yaml)`);
          return t;
        }),
        related: entry.data.related.map((s) => {
          const p = pages.get(s);
          if (!p) throw new Error(`${where}: unknown related slug "${s}" (not a guide, tutorial, or review)`);
          return p;
        }),
      };
    })
    .sort(byLatestDesc);
}

export interface PromptSection {
  id: PromptGroupId;
  label: string;
  blurb: string;
  prompts: Prompt[];
}

/** Prompts grouped in PROMPT_GROUPS order; empty groups are omitted. */
export function groupPrompts(prompts: Prompt[]): PromptSection[] {
  return PROMPT_GROUPS.map((g) => ({
    ...g,
    prompts: prompts.filter((p) => p.entry.data.group === g.id),
  })).filter((s) => s.prompts.length > 0);
}

/** Same-group prompts first, backfilled with the newest others. */
export function relatedPrompts(prompt: Prompt, all: Prompt[], limit = 3): Prompt[] {
  const others = all.filter((p) => p.slug !== prompt.slug);
  const same = others.filter((p) => p.entry.data.group === prompt.entry.data.group);
  const rest = others.filter((p) => p.entry.data.group !== prompt.entry.data.group);
  return [...same, ...rest].slice(0, limit);
}

/** Prompts that list `slug` (a guide, tutorial, or review) as related. */
export async function promptsForPage(slug: string): Promise<Prompt[]> {
  return (await getPrompts()).filter((p) => p.entry.data.related.includes(slug));
}

/** Card shape for RelatedLinks. */
export const toLink = (p: Prompt): LinkItem => ({
  href: p.href,
  title: p.entry.data.title,
  description: p.entry.data.description,
});
