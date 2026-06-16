/**
 * Normalize a built pathname into its clean, canonical form.
 *
 * With `build.format: 'file'`, `Astro.url.pathname` carries a `.html` suffix
 * (e.g. `/reviews/slug.html`). The site is served at — and the sitemap emits —
 * the clean, extensionless URL, so canonical/og:url/JSON-LD must match that or
 * we get a self-referential mismatch.
 */
export function cleanPathname(pathname: string): string {
  const p = pathname.replace(/\.html$/, '').replace(/\/index$/, '');
  return p === '' ? '/' : p;
}
