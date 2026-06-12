import { getCollection } from 'astro:content';

export interface Device {
  slug: string;
  name: string;
  rating: number;
  price: number | null;
  image: string | null;
  affiliate: string | null;
  specs: Record<string, string | number | string[] | undefined>;
}

/** Flat, client-friendly device list for the compare tool + /devices.json feed. */
export async function getDevices(): Promise<Device[]> {
  const reviews = await getCollection('reviews');
  return reviews
    .map((r) => ({
      slug: r.slug,
      name: r.data.title.replace(/ Review.*$/i, '').trim(),
      rating: r.data.rating,
      price: r.data.price ?? r.data.specs?.price ?? null,
      image: r.data.image ?? null,
      affiliate: r.data.affiliate ?? null,
      specs: r.data.specs ?? {},
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
