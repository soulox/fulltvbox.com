import type { ImageMetadata } from 'astro';

/**
 * Map of watch-verdict id -> imported title image (poster or still), resolved at build time.
 *
 * Images live in src/assets/watch/<verdict file name>.{jpg,jpeg,png,webp}, so
 * src/content/watch-verdicts/wednesday-season-2.yaml pairs with
 * src/assets/watch/wednesday-season-2.jpg. Same pattern as ./reviewImages.ts.
 */
const files = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/watch/*.{jpg,jpeg,png,webp}',
  { eager: true }
);

const byId: Record<string, ImageMetadata> = {};
for (const path in files) {
  const id = path.split('/').pop()!.replace(/\.(jpe?g|png|webp)$/i, '');
  byId[id] = files[path].default;
}

/** All image ids, so the build can flag an image with no verdict to belong to. */
export const watchImageIds = Object.keys(byId);

/** The optimized image for a verdict, or undefined if none was added. */
export function watchImage(id: string): ImageMetadata | undefined {
  return byId[id];
}
