/**
 * Review helpers: related-reviews scoring for the review detail page's "Related Reviews"
 * grid, and the scored / in-progress split.
 *
 * Reviews are scored after the hands-on test window; until then a review can publish
 * "in progress" (`testingSince`, no `rating`). Anything that ranks, compares or shows
 * scores uses getScoredReviews(), so an unscored device never enters a ranking.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { TEST_WEEKS } from '../data/methodology';

export type Review = CollectionEntry<'reviews'>;
export type ScoredReview = Review & { data: Review['data'] & { rating: number } };

export const isScored = (r: Review): r is ScoredReview => r.data.rating !== undefined;

export async function getScoredReviews(): Promise<ScoredReview[]> {
  return (await getCollection('reviews')).filter(isScored);
}

/** Earliest date the score can land: the start of testing plus the minimum test window. */
export function scoreDueDate(testingSince: string): string {
  const d = new Date(`${testingSince}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + TEST_WEEKS * 7);
  return d.toISOString().slice(0, 10);
}

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
