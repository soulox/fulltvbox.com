import type { ImageMetadata } from 'astro';

/**
 * Map of review slug -> imported product image, resolved at build time.
 *
 * Images live in src/assets/reviews/<slug>.{jpg,jpeg,png,webp}. Keeping them in
 * src/ (not public/) lets astro:assets optimize them — responsive widths,
 * modern formats, explicit dimensions. The PA-API fetcher drops new files here
 * by slug, so they're picked up automatically with no frontmatter to maintain.
 */
const files = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/reviews/*.{jpg,jpeg,png,webp}',
  { eager: true }
);

const bySlug: Record<string, ImageMetadata> = {};
for (const path in files) {
  const slug = path.split('/').pop()!.replace(/\.(jpe?g|png|webp)$/i, '');
  bySlug[slug] = files[path].default;
}

/** The optimized product image for a review, or undefined if none exists yet. */
export function reviewImage(slug: string): ImageMetadata | undefined {
  return bySlug[slug];
}
