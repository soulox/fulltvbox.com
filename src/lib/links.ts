/**
 * Guide↔review internal-link graph, derived from the cross-links already written into
 * guide bodies. Built once at build time; pure (takes the loaded collections, does no
 * I/O). Every extracted slug is validated against the real collection so we never surface
 * a dead link.
 */
import type { CollectionEntry } from 'astro:content';

const REVIEW_LINK = /\/reviews\/([a-z0-9-]+)/g;

function extractReviewSlugs(body: string): string[] {
  return [...new Set([...body.matchAll(REVIEW_LINK)].map((m) => m[1]))];
}

export interface LinkGraph {
  /** Review slugs a guide links to (validated, in first-seen order). */
  reviewsMentionedInGuide(guideSlug: string): string[];
  /** Guides whose body links to this review — the reverse index. */
  guidesFeaturingReview(reviewSlug: string): string[];
}

export function buildLinkGraph(
  guides: CollectionEntry<'guides'>[],
  reviews: CollectionEntry<'reviews'>[]
): LinkGraph {
  const reviewSlugs = new Set(reviews.map((r) => r.slug));

  const guideToReviews = new Map<string, string[]>();
  const reviewToGuides = new Map<string, string[]>();

  for (const guide of guides) {
    const refs = extractReviewSlugs(guide.body).filter((s) => reviewSlugs.has(s));
    guideToReviews.set(guide.slug, refs);
    for (const reviewSlug of refs) {
      const list = reviewToGuides.get(reviewSlug) ?? [];
      list.push(guide.slug);
      reviewToGuides.set(reviewSlug, list);
    }
  }

  return {
    reviewsMentionedInGuide: (slug) => guideToReviews.get(slug) ?? [],
    guidesFeaturingReview: (slug) => reviewToGuides.get(slug) ?? [],
  };
}
