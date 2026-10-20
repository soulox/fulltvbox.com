import type { ImageMetadata } from 'astro';

/**
 * Tutorial images, all from Wikimedia Commons via scripts/fetch-commons-image.mjs.
 *
 *   src/assets/tutorials/<slug>.{jpg,png}         header image, resolved by slug
 *   src/assets/tutorials/inline/<name>.{jpg,png}  screenshots referenced from the Markdown
 *
 * Every image has a sidecar .json credit; one without it fails the build, since the
 * licenses (CC BY, CC BY-SA, GPL…) require attribution, which /credits provides.
 */
export interface CommonsCredit {
  subject: string;
  author: string;
  license: string;
  licenseUrl: string | null;
  page: string;
}

const images = import.meta.glob<{ default: ImageMetadata }>('../assets/tutorials/**/*.{jpg,jpeg,png,webp}', { eager: true });
const credits = import.meta.glob<{ default: CommonsCredit }>('../assets/tutorials/**/*.json', { eager: true });

const stem = (path: string) => path.replace(/\.[a-z]+$/i, '');
const creditByStem = Object.fromEntries(Object.entries(credits).map(([p, m]) => [stem(p), m.default]));

const heroBySlug: Record<string, { src: ImageMetadata; alt: string }> = {};
const allCredits: CommonsCredit[] = [];
for (const path in images) {
  const credit = creditByStem[stem(path)];
  if (!credit) throw new Error(`${path.replace('../', 'src/')}: image has no .json credit file (use scripts/fetch-commons-image.mjs)`);
  allCredits.push(credit);
  if (!path.includes('/inline/')) heroBySlug[stem(path).split('/').pop()!] = { src: images[path].default, alt: credit.subject };
}

/** The header image for a tutorial (alt text from its credit), or undefined if it has none. */
export function tutorialImage(slug: string): { src: ImageMetadata; alt: string } | undefined {
  return heroBySlug[slug];
}

/** Credits for every tutorial image, for /credits. */
export function tutorialImageCredits(): CommonsCredit[] {
  return [...allCredits].sort((a, b) => a.subject.localeCompare(b.subject));
}
