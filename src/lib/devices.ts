import { getCollection } from 'astro:content';
import { getImage } from 'astro:assets';
import { reviewImage } from './reviewImages';
import { resolveAffiliate } from './affiliate';
import { latestDate } from './freshness';

export interface Device {
  slug: string;
  name: string;
  rating: number;
  price: number | null;
  image: string | null;
  affiliate: string | null;
  /** Later of the review's publish/updated date — the honest "last updated" for derived pages. */
  updated: string;
  discontinued: boolean;
  tags: string[];
  specs: Record<string, string | number | string[] | undefined>;
}

/** Flat, client-friendly device list for the compare tool + /devices.json feed. */
export async function getDevices(): Promise<Device[]> {
  const reviews = await getCollection('reviews');
  const devices = await Promise.all(
    reviews.map(async (r) => {
      const name = r.data.title.replace(/ Review.*$/i, '').trim();
      const photo = reviewImage(r.slug);
      // Thumbnails render at ~140–250 CSS px, so a 480px WebP covers 2x displays
      // without shipping the full-size source JPEG.
      const image = photo ? (await getImage({ src: photo, width: 480, format: 'webp' })).src : null;
      const discontinued = !!r.data.discontinued;
      return {
        slug: r.slug,
        name,
        rating: r.data.rating,
        price: r.data.price ?? r.data.specs?.price ?? null,
        image,
        affiliate: discontinued ? null : resolveAffiliate(r.data.affiliate, name) ?? null,
        updated: latestDate(r.data.publishDate, r.data.updatedDate),
        discontinued,
        tags: r.data.tags ?? [],
        specs: r.data.specs ?? {},
      };
    }),
  );
  return devices.sort((a, b) => a.name.localeCompare(b.name));
}

export interface ComparisonPair {
  slug: string; // `${a.slug}-vs-${b.slug}` — higher-rated device first, deterministic
  a: Device;
  b: Device;
  sharedTags: string[];
}

// Tags every device shares — too generic to signal that two devices are cross-shopped.
const GENERIC_TAGS = new Set(['4k', 'streaming']);

/**
 * Curated "X vs Y" matchups for static comparison pages.
 *
 * We only pair devices that are genuinely cross-shopped — they share at least
 * one meaningful (non-generic) tag AND sit within ~2.2x on price — and cap each
 * device to its strongest few matchups. This keeps every generated page
 * substantive (real overlapping audience + comparable price) rather than
 * spinning up thin permutations of every device against every other.
 */
export async function getComparisonPairs(): Promise<ComparisonPair[]> {
  // Discontinued devices keep their review but aren't pitched in new matchups.
  const devices = (await getDevices()).filter((d) => !d.discontinued);
  const seen = new Set<string>();
  const pairs: ComparisonPair[] = [];

  for (const a of devices) {
    const candidates = devices
      .filter((b) => b.slug !== a.slug)
      .map((b) => {
        const sharedTags = a.tags.filter((t) => b.tags.includes(t) && !GENERIC_TAGS.has(t));
        const ratio =
          a.price && b.price ? Math.max(a.price, b.price) / Math.min(a.price, b.price) : Infinity;
        return { b, sharedTags, ratio };
      })
      .filter((c) => c.sharedTags.length >= 1 && c.ratio <= 2.2)
      .sort((x, y) => y.sharedTags.length - x.sharedTags.length || x.ratio - y.ratio)
      .slice(0, 4);

    for (const c of candidates) {
      const key = [a.slug, c.b.slug].sort().join('__');
      if (seen.has(key)) continue;
      seen.add(key);
      // Higher-rated device leads the matchup for a stable, single canonical URL.
      const [first, second] =
        a.rating >= c.b.rating || (a.rating === c.b.rating && a.slug < c.b.slug)
          ? [a, c.b]
          : [c.b, a];
      pairs.push({ slug: `${first.slug}-vs-${second.slug}`, a: first, b: second, sharedTags: c.sharedTags });
    }
  }

  return pairs.sort((x, y) => y.a.rating + y.b.rating - (x.a.rating + x.b.rating));
}
