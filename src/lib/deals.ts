import { getCollection, type CollectionEntry } from 'astro:content';
import { getServices } from './services';
import { readLiveDeals, discountPct, dealEndsAt } from './live-prices';

export interface LiveDeal {
  id: string;
  kind: 'device' | 'service';
  device?: string;
  service?: string;
  retailer: string;
  price: number;
  wasPrice?: number;
  period?: 'month' | 'year';
  term?: string;
  promoCode?: string;
  url: string;
  badge?: string;
  expires?: string; // ISO datetime the deal ends
  featured: boolean;
  discountPct?: number;
  name: string; // unified display name
  href: string; // unified internal link (review page or services directory)
  review?: CollectionEntry<'reviews'>;
}

// How long a `checked` deal stays up without being re-confirmed.
const RECHECK_MS = 21 * 24 * 60 * 60 * 1000;

/** "$1/mo", "$30/yr", "Free", "$34.99" — the price as every deal card shows it. */
export function formatDealPrice(price: number, period?: 'month' | 'year'): string {
  if (price === 0) return 'Free';
  return `$${price}${period === 'month' ? '/mo' : period === 'year' ? '/yr' : ''}`;
}

/**
 * Deals (hardware or streaming service) joined to their target, expired dropped, featured
 * first. Hand-written files in src/content/deals/ are merged with discounted retailer
 * prices from the build-time snapshot (src/lib/live-prices.ts); where both cover the same
 * device at the same retailer, the live price wins because it's current.
 */
export async function getLiveDeals(now = new Date()): Promise<LiveDeal[]> {
  const [deals, reviews, services] = await Promise.all([
    getCollection('deals'),
    getCollection('reviews'),
    getServices(),
  ]);
  const reviewBySlug = new Map(reviews.map((r) => [r.slug, r]));
  const svcBySlug = new Map(services.map((s) => [s.slug, s]));

  const live = readLiveDeals(now).filter((o) => {
    const review = reviewBySlug.get(o.device);
    return review && !review.data.discontinued;
  });
  const liveKeys = new Set(live.map((o) => `${o.device}|${o.retailer.toLowerCase()}`));

  const entries = [
    ...deals
      .map((d) => ({ id: d.id, ...d.data }))
      .filter((d) => !(d.device && liveKeys.has(`${d.device}|${d.retailer.toLowerCase()}`))),
    ...live.map(({ endsAt, ...o }) => ({
      id: `live-${o.device}-${o.retailer.toLowerCase().replace(/\W+/g, '-')}`,
      ...o,
      service: undefined,
      checked: undefined,
      expires: endsAt,
      featured: false,
    })),
  ];

  return entries
    .map((data) => {
      const endsAt = data.expires ? dealEndsAt(data.expires) : undefined;

      let kind: 'device' | 'service';
      let name: string;
      let href: string;
      let review: CollectionEntry<'reviews'> | undefined;
      if (data.device) {
        kind = 'device';
        review = reviewBySlug.get(data.device);
        name = review?.data.title.replace(/ Review.*$/i, '').trim() ?? data.device;
        href = `/reviews/${data.device}`;
      } else {
        kind = 'service';
        name = svcBySlug.get(data.service!)?.name ?? data.service!;
        href = '/streaming-services';
      }
      return {
        ...data,
        kind,
        expires: endsAt?.toISOString(),
        // "-100%" on a free trial reads as a glitch; the card already says "Free".
        discountPct: data.price > 0 ? discountPct(data.price, data.wasPrice) : undefined,
        name,
        href,
        review,
        endsAt,
      };
    })
    .filter((d) => (!d.endsAt || d.endsAt > now) && (!d.checked || dealEndsAt(d.checked).getTime() + RECHECK_MS > now.getTime()))
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        (a.endsAt && b.endsAt ? a.endsAt.getTime() - b.endsAt.getTime() : 0) ||
        (b.discountPct ?? 0) - (a.discountPct ?? 0),
    )
    .map(({ endsAt, ...d }) => d);
}

/** Map of review slug -> best (cheapest) live hardware deal, for review pages. */
export async function getDealsByDevice(now = new Date()): Promise<Map<string, LiveDeal>> {
  const live = await getLiveDeals(now);
  const map = new Map<string, LiveDeal>();
  for (const d of live) {
    if (d.kind !== 'device' || !d.device) continue;
    const cur = map.get(d.device);
    if (!cur || d.price < cur.price) map.set(d.device, d);
  }
  return map;
}
