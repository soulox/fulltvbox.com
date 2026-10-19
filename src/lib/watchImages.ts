import type { ImageMetadata } from 'astro';
import { titleKey } from './top10-core.mjs';

/**
 * Title art for /what-to-watch, keyed by kind + title so every listed title can have one,
 * with or without a verdict.
 *
 * Each image is src/assets/watch/<kind>--<titleKey>.jpg with a sidecar .json holding
 * { title, kind, credit, source }. scripts/fetch-watch-images.mjs writes both; the deploy
 * also runs it so titles new to the lists get art before the build. Same astro:assets
 * pattern as ./reviewImages.ts.
 */
export interface WatchImageCredit {
  title: string;
  kind: 'movie' | 'series';
  credit: string; // e.g. "Netflix"
  source: string; // page the image was taken from
}

const images = import.meta.glob<{ default: ImageMetadata }>('../assets/watch/*.{jpg,jpeg,png,webp}', { eager: true });
const credits = import.meta.glob<{ default: WatchImageCredit }>('../assets/watch/*.json', { eager: true });

const base = (path: string) => path.split('/').pop()!.replace(/\.[a-z]+$/i, '');
const byName: Record<string, { image: ImageMetadata; credit: WatchImageCredit }> = {};
const creditByName = Object.fromEntries(Object.entries(credits).map(([p, m]) => [base(p), m.default]));
for (const path in images) {
  const name = base(path);
  // An image with no credit file would ship uncredited, so that fails the build.
  if (!creditByName[name]) throw new Error(`src/assets/watch/${name}: image has no ${name}.json credit file`);
  byName[name] = { image: images[path].default, credit: creditByName[name] };
}

export const watchImageName = (kind: string, title: string) => `${kind}--${titleKey(title)}`;

/** The optimized art for a title, or undefined if none was fetched. */
export function watchImage(kind: string, title: string): ImageMetadata | undefined {
  return byName[watchImageName(kind, title)]?.image;
}

/** Credits for every image, for /credits. */
export function watchImageCredits(): WatchImageCredit[] {
  return Object.values(byName).map((e) => e.credit);
}
