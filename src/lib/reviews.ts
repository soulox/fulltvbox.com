/**
 * Related-reviews scoring for the review detail page's "Related Reviews" grid.
 */
import type { CollectionEntry } from 'astro:content';

/**
 * Topically-related reviews: scored by shared tag count (descending), tied
 * broken by newest publishDate.
 */
export function relatedReviews(
  review: CollectionEntry<'reviews'>,
  all: CollectionEntry<'reviews'>[],
  limit = 3
): CollectionEntry<'reviews'>[] {
  return all
    .filter((r) => r.slug !== review.slug)
    .map((r) => ({
      r,
      score: r.data.tags.filter((t: string) => review.data.tags.includes(t)).length,
    }))
    .sort(
      (a, b) =>
        b.score - a.score || new Date(b.r.data.publishDate).getTime() - new Date(a.r.data.publishDate).getTime()
    )
    .slice(0, limit)
    .map(({ r }) => r);
}
