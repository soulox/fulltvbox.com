import { getCollection, type CollectionEntry } from 'astro:content';

export interface Service {
  slug: string;
  name: string;
  category: 'on-demand' | 'live-tv' | 'free' | 'sports' | 'extra';
  monthlyPrice: number;
  annualPrice: number | null;
  adTierPrice: number | null;
  hasAds: boolean;
  hasLiveTV: boolean;
  freeTrial: string | null;
  highlights: string[];
  url: string;
  featured: boolean;
}

const fromEntry = (e: CollectionEntry<'services'>): Service => ({
  slug: e.id,
  name: e.data.name,
  category: e.data.category,
  monthlyPrice: e.data.monthlyPrice,
  annualPrice: e.data.annualPrice ?? null,
  adTierPrice: e.data.adTierPrice ?? null,
  hasAds: e.data.hasAds,
  hasLiveTV: e.data.hasLiveTV,
  freeTrial: e.data.freeTrial ?? null,
  highlights: e.data.highlights,
  url: e.data.url,
  featured: e.data.featured,
});

/** All streaming services, free first then by ascending price. */
export async function getServices(): Promise<Service[]> {
  const services = await getCollection('services');
  return services
    .map(fromEntry)
    .sort((a, b) => a.monthlyPrice - b.monthlyPrice || a.name.localeCompare(b.name));
}
