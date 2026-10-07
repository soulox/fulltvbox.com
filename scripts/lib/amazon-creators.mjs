/**
 * Minimal client for the Amazon Creators API, the replacement for PA-API v5 (retired
 * 2026-05-15). Shared by fetch-prices.mjs and fetch-amazon-images.mjs.
 *
 * Env vars (OAuth credentials from your Associates account, NA / version 3.1):
 *   AMAZON_CREATORS_CLIENT_ID
 *   AMAZON_CREATORS_CLIENT_SECRET
 *   AMAZON_PARTNER_TAG   default: fulltvbox-20
 */
export const amazon = {
  clientId: process.env.AMAZON_CREATORS_CLIENT_ID,
  clientSecret: process.env.AMAZON_CREATORS_CLIENT_SECRET,
  partnerTag: process.env.AMAZON_PARTNER_TAG || 'fulltvbox-20',
  marketplace: 'www.amazon.com',
};

export const hasAmazonCredentials = () => Boolean(amazon.clientId && amazon.clientSecret);

/** Bearer token, valid for an hour. */
export async function amazonToken() {
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: amazon.clientId,
      client_secret: amazon.clientSecret,
      scope: 'creatorsapi::default',
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) throw new Error(`token: HTTP ${res.status} ${json.error_description || json.error || ''}`);
  return json.access_token;
}

/**
 * GetItems for any number of ASINs (the API takes 10 per request). Returns the items plus
 * any per-item errors, e.g. an ASIN that no longer exists.
 */
export async function amazonGetItems(token, asins, resources) {
  const items = [];
  const errors = [];
  for (let i = 0; i < asins.length; i += 10) {
    const res = await fetch('https://creatorsapi.amazon/catalog/v1/getItems', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-marketplace': amazon.marketplace,
      },
      body: JSON.stringify({
        itemIds: asins.slice(i, i + 10),
        itemIdType: 'ASIN',
        marketplace: amazon.marketplace,
        partnerTag: amazon.partnerTag,
        resources,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = json?.errors?.map((e) => `${e.code}: ${e.message}`).join('; ') || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    items.push(...(json?.itemResults?.items || []));
    errors.push(...(json?.errors || []));
  }
  return { items, errors };
}
