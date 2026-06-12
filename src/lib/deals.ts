import { getCollection, type CollectionEntry } from 'astro:content';

export interface LiveDeal {
  id: string;
  device: string;
  retailer: string;
  price: number;
  wasPrice?: number;
  url: string;
  badge?: string;
  expires?: string;
  featured: boolean;
  discountPct?: number;
  review?: CollectionEntry<'reviews'>;
}

/** Deals joined to their review, expired entries dropped, featured first. */
export async function getLiveDeals(now = new Date()): Promise<LiveDeal[]> {
  const [deals, reviews] = await Promise.all([getCollection('deals'), getCollection('reviews')]);
  const bySlug = new Map(reviews.map((r) => [r.slug, r]));

  return deals
    .map((d) => {
      const data = d.data;
      const discountPct =
        data.wasPrice && data.wasPrice > data.price ? Math.round((1 - data.price / data.wasPrice) * 100) : undefined;
      const expired = data.expires ? new Date(data.expires).getTime() < now.getTime() : false;
      return { id: d.id, ...data, discountPct, review: bySlug.get(data.device), expired };
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

/** Map of review slug -> best (featured/cheapest) live deal, for showing on review pages. */
export async function getDealsByDevice(now = new Date()): Promise<Map<string, LiveDeal>> {
  const live = await getLiveDeals(now);
  const map = new Map<string, LiveDeal>();
  for (const d of live) {
    const cur = map.get(d.device);
    if (!cur || d.price < cur.price) map.set(d.device, d);
  }
  return map;
}
