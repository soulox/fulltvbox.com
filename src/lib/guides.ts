/**
 * Guide categorization — groups guides into ordered, labeled sections for the
 * /guides index. The category id is a required frontmatter field (see the
 * `guides` schema in src/content/config.ts); this module owns the display
 * labels and section order.
 */
import type { CollectionEntry } from 'astro:content';
import { latestDate } from './freshness';

export type GuideCategoryId = CollectionEntry<'guides'>['data']['category'];

/** Ordered list of categories — defines both display labels and section order. */
export const GUIDE_CATEGORIES: { id: GuideCategoryId; label: string }[] = [
  { id: 'buying-guides', label: 'Buying Guides' },
  { id: 'comparisons', label: 'Comparisons' },
  { id: 'cord-cutting', label: 'Cord-Cutting' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
  { id: 'ai-llm', label: 'AI & Local LLMs' },
  { id: 'basics-setup', label: 'Basics & Setup' },
  { id: 'whats-new', label: "What's New" },
];

export type GuideSection = {
  id: GuideCategoryId;
  label: string;
  guides: CollectionEntry<'guides'>[];
};

/**
 * Group guides by category, in GUIDE_CATEGORIES order, each section sorted
 * newest-first by latest of publish/updated. Empty categories are omitted so
 * the page self-heals if a bucket ever empties.
 */
export function groupGuidesByCategory(guides: CollectionEntry<'guides'>[]): GuideSection[] {
  return GUIDE_CATEGORIES.map(({ id, label }) => ({
    id,
    label,
    guides: guides
      .filter((g) => g.data.category === id)
      .sort(
        (a, b) =>
          new Date(latestDate(b.data.publishDate, b.data.updatedDate)).getTime() -
          new Date(latestDate(a.data.publishDate, a.data.updatedDate)).getTime()
      ),
  })).filter((section) => section.guides.length > 0);
}
