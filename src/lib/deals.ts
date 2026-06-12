import { getCollection, type CollectionEntry } from 'astro:content';
import { getServices } from './services';

export interface LiveDeal {
  id: string;
  kind: 'device' | 'service';
  device?: string;
  service?: string;
  retailer: string;
  price: number;
  wasPrice?: number;
  url: string;
  badge?: string;
  expires?: string;
  featured: boolean;
  discountPct?: number;
  name: string; // unified display name
  href: string; // unified internal link (review page or services directory)
  review?: CollectionEntry<'reviews'>;
}

/** Deals (hardware or streaming service) joined to their target, expired dropped, featured first. */
export async function getLiveDeals(now = new Date()): Promise<LiveDeal[]> {
  const [deals, reviews, services] = await Promise.all([
    getCollection('deals'),
    getCollection('reviews'),
    getServices(),
  ]);
  const reviewBySlug = new Map(reviews.map((r) => [r.slug, r]));
  const svcBySlug = new Map(services.map((s) => [s.slug, s]));

  return deals
    .map((d) => {
      const data = d.data;
      const discountPct =
        data.wasPrice && data.wasPrice > data.price ? Math.round((1 - data.price / data.wasPrice) * 100) : undefined;
      const expired = data.expires ? new Date(data.expires).getTime() < now.getTime() : false;

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
      return { id: d.id, kind, ...data, discountPct, name, href, review, expired };
    })
    .filter((d) => !d.expired)
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        (a.expires && b.expires ? new Date(a.expires).getTime() - new Date(b.expires).getTime() : 0) ||
        (b.discountPct ?? 0) - (a.discountPct ?? 0),
    )
    .map(({ expired, ...d }) => d);
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
