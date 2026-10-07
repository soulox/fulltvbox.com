// Reads the retailer price snapshot written by scripts/fetch-prices.mjs. Kept free of
// astro:content so astro.config.mjs can use it too (the sitemap needs to know whether
// /deals has anything on it).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface LiveOffer {
  device: string; // review slug
  retailer: string;
  price: number;
  wasPrice?: number;
  url: string;
  badge?: string;
  endsAt?: string; // ISO datetime, from the retailer's deal timer
}

// A snapshot older than this is ignored, so a failed fetch never shows stale prices.
// The deploy workflow rebuilds daily, which keeps a fresh one well inside the window.
const MAX_AGE_MS = 36 * 60 * 60 * 1000;
// Retailers mark tiny "savings" against an inflated list price; below this it isn't a deal.
const MIN_DISCOUNT_PCT = 5;

export function readLiveOffers(now = new Date()): LiveOffer[] {
  try {
    const snap = JSON.parse(readFileSync(join(process.cwd(), '.cache', 'live-prices.json'), 'utf8'));
    if (now.getTime() - new Date(snap.fetchedAt).getTime() > MAX_AGE_MS) return [];
    return snap.offers ?? [];
  } catch {
    return [];
  }
}

export function discountPct(price: number, wasPrice?: number): number | undefined {
  return wasPrice && wasPrice > price ? Math.round((1 - price / wasPrice) * 100) : undefined;
}

/** Live offers that are currently discounted enough to list as a deal. */
export function readLiveDeals(now = new Date()): LiveOffer[] {
  return readLiveOffers(now).filter(
    (o) => (discountPct(o.price, o.wasPrice) ?? 0) >= MIN_DISCOUNT_PCT && (!o.endsAt || dealEndsAt(o.endsAt) > now),
  );
}

/**
 * When a deal stops. A bare date ("2026-10-07") means the deal runs through that whole
 * day in US Pacific time; `new Date("2026-10-07")` alone would end it at midnight UTC,
 * the evening before. Full timestamps are taken as-is.
 */
export function dealEndsAt(expires: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(expires) ? new Date(`${expires}T23:59:59-08:00`) : new Date(expires);
}
