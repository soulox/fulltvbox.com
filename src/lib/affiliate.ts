// Affiliate-link safety. Many stored Amazon product-ASIN links point at stale or
// placeholder ASINs that 404. Rather than send buyers to a dead page, we fall back to a
// name-based Amazon search that always resolves and still carries our associates tag
// (Amazon attributes the session, so search links still earn commission).

const AMAZON_TAG = 'fulltvbox-20';

/** Amazon search URL for a device name, carrying our associates tag. Always resolves. */
export function amazonSearchUrl(query: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}`;
}

/**
 * Return a click-safe affiliate URL. Amazon product-ASIN links (`/dp/` or `/gp/`) are
 * replaced with a name-based Amazon search; non-Amazon links, or links that are already
 * searches, pass through unchanged. Returns undefined when there's no affiliate.
 */
export function resolveAffiliate(
  affiliate: string | null | undefined,
  deviceName: string,
): string | undefined {
  if (!affiliate) return undefined;
  try {
    const u = new URL(affiliate);
    if (/(^|\.)amazon\./i.test(u.hostname) && /\/(dp|gp)\//i.test(u.pathname)) {
      return amazonSearchUrl(deviceName);
    }
  } catch {
    /* not a parseable URL — leave as-is */
  }
  return affiliate;
}
