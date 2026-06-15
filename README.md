# FullTVBox

Independent TV box & streaming device reviews, comparisons, and Raspberry Pi tutorials.
Built with [Astro](https://astro.build), Tailwind, and content collections; deployed to
Cloudflare Pages.

**Live preview:** https://fulltvbox.pages.dev

---

## Develop

```bash
npm install
npm run dev        # local dev server
npm run build      # static build into dist/
npm run preview    # serve the built dist/ locally
```

Requires Node ≥ 20.19.

## Project layout

```
src/
  content/
    reviews/      # product reviews   (rating 1–5, price, specs, affiliate, tags, featured)
    guides/       # buying / setup guides
    tutorials/    # Raspberry Pi & home-lab how-tos (difficulty, duration)
    deals/        # curated price drops — hardware OR streaming service (YAML)
    services/     # streaming services (price, ad tier, live-tv, free trial)
    config.ts     # collection schemas
  components/     # SearchModal (Pagefind), CostCalculator
  layouts/        # BaseLayout + Review/Guide/Tutorial layouts
  lib/            # freshness, deals, devices, services helpers
  pages/          # routes (incl. /deals, /compare, /cut-the-cord,
                  #   /cost-calculator, /streaming-services, /privacy, /devices.json, /og/**)
  og/             # build-time OG card renderer + vendored fonts
public/
  images/reviews/ # self-hosted product photos
```

Add content by dropping a Markdown file into the relevant `src/content/<collection>/`
folder with the frontmatter its schema requires (see `src/content/config.ts`).

### FAQ blocks

Reviews and guides accept an optional `faq` array in frontmatter. When present it renders an
accordion at the foot of the article and emits `FAQPage` JSON-LD for rich results:

```yaml
faq:
  - question: "Is it worth it in 2026?"
    answer: "Yes, if you want the most powerful box…"
```

### Freshness

Set `updatedDate: "YYYY-MM-DD"` on any review/guide/tutorial when you re-test or refresh it.
Content published or updated within 30 days shows a **NEW** / **UPDATED** badge and floats to
the top of "Latest" lists (logic in `src/lib/freshness.ts`).

### Deals

Each deal is one YAML file in `src/content/deals/`:

```yaml
device: nvidia-shield-tv-pro-2025   # must match a review slug
retailer: Amazon
price: 169
wasPrice: 199            # optional — drives the discount %
url: "https://…?tag=fulltvbox-20"  # affiliate link
badge: Lowest in 6 months           # optional
expires: "2026-06-22"               # optional — auto-hidden once past
featured: true                      # optional — surfaces on the homepage strip
```

A deal references **exactly one** of `device` (a review slug) or `service` (a service slug) —
the `.refine` in `config.ts` enforces it. Expired deals disappear automatically at the next
build. A hardware deal also replaces the "Check Price" CTA on its review and adds `Offer`
JSON-LD; service deals surface on `/deals`, the homepage strip, and the cord-cutting hub.

### Specs & comparison

Reviews carry an optional `specs` object (SoC, RAM, storage, OS, resolution, HDR/audio/ports,
price, year). It renders a spec sheet on the review page, powers `/compare` (side-by-side with
best-in-row highlighting), and is exposed as a JSON feed at `/devices.json`.

### Streaming cost & cord-cutting

Each streaming service is one YAML file in `src/content/services/` (`name`, `category`,
`monthlyPrice`, optional `annualPrice`/`adTierPrice`, `hasAds`, `hasLiveTV`, `freeTrial`,
`highlights`, `url`). The data powers three pages, all reusing the static client-side pattern:

- **`/cost-calculator`** — `CostCalculator.astro`: tick services → live monthly/annual total
  vs. the average cable bill, ad-tier toggles, deep-linkable via `?s=netflix,hulu.ads`.
- **`/streaming-services`** — category-filterable directory.
- **`/cut-the-cord`** — hub tying the calculator, top boxes, services, deals, and the guide.

Prices are curated — keep the "verified \<date\>" note current when you edit them.

## Design system — "Test Bench"

A broadcast / AV-test-equipment aesthetic: deep blue-black, phosphor-green signal accent,
SMPTE color bars, VU-meter scores, and mono instrument labels. Tokens live in
`tailwind.config.mjs` and the `<style is:global>` block in `src/layouts/BaseLayout.astro`
(CSS variables + reusable classes: `.bench-card`, `.frame`, `.meter`, `.btn-signal`,
`.chip`, `.label`, `.prose-bench`).

- **Fonts:** Archivo (display), IBM Plex Sans (body), IBM Plex Mono (labels). Self-hosted via
  `@fontsource` and imported in `BaseLayout.astro` — no Google Fonts CDN call (see Privacy below).
- **Accessibility:** WCAG 2.1 AA — verified 0 violations via axe-core.

## Search

Site-wide search is powered by [Pagefind](https://pagefind.app) via the `astro-pagefind`
integration. The index is built during `astro build` into `dist/pagefind/` (so the existing
`wrangler pages deploy dist` ships it). Only article pages are indexed — they carry
`data-pagefind-body`; chrome carries `data-pagefind-ignore`. The Test Bench-styled modal
(`src/components/SearchModal.astro`) opens from the header button, the `/` key, or `Cmd/Ctrl-K`.
Search works in `astro dev`/`preview` only after at least one build.

## Social / OG images

Branded 1200×630 cards are generated **at build time** (satori → resvg) per content page,
plus a site default. Source: `src/og/card.ts`; endpoints under `src/pages/og/**` and
`src/pages/og-default.png.ts`. Layouts set `og:image` automatically — nothing to maintain
per page.

## SEO & structured data

`BaseLayout.astro` handles canonical URLs, Open Graph (incl. `og:type=article` +
`article:*` timestamps for content pages, set via layout props), Twitter cards, and RSS.
JSON-LD is emitted per page type: `Review` + `Product` + `BreadcrumbList` on reviews,
`Article` / `TechArticle` on guides/tutorials, `FAQPage` where `faq` is present, `ItemList`
on `/reviews` and `/best-picks`, and `Organization` + `WebSite` on the homepage.
`robots.txt` and the `@astrojs/sitemap`-generated `sitemap-index.xml` round it out.

## Privacy / GDPR

The site sets **no cookies** and runs **no analytics, ads, or third-party trackers**, so
there is no consent banner. Fonts are self-hosted (no Google Fonts CDN), so visitor IPs are
not shared with third parties; the only outbound data flow is when a visitor clicks an
affiliate link. The [`/privacy`](src/pages/privacy.astro) page documents this and the GDPR
rights. If analytics or ads are ever added, update that page (and revisit the consent question)
before the tracking goes live.

## Image attribution

Self-hosted product photos from Wikimedia Commons are credited on
[`/credits`](src/pages/credits.astro) (CC BY-SA 4.0). Amazon PA-API images (see below) are
Associates-licensed and need no attribution.

---

## Deploy

Pushing to `master` triggers `.github/workflows/deploy.yml` → `npm run deploy`
(`astro build && wrangler pages deploy dist`) to the Cloudflare Pages project `fulltvbox`.
Requires repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## Launch checklist

Two steps remain to take the site fully live; both need your accounts.

### 1. Fill the last product images (Amazon Associates)

Four reviews show the on-brand **NO SIGNAL** placeholder because no freely-licensed photo
exists (Google TV Streamer, onn 4K Pro, Roku Ultra, TiVo Stream 4K). Fetch licensed images
from the Amazon Product Advertising API:

```bash
PAAPI_ACCESS_KEY=...  PAAPI_SECRET_KEY=...  PAAPI_PARTNER_TAG=fulltvbox-20 \
  npm run images:amazon
```

- `--dry-run` previews what it would fetch; `--force` refetches existing images.
- It downloads to `public/images/reviews/<slug>.jpg` and patches each review's frontmatter.
- Then `npm run build`, eyeball the results, and commit.

### 2. Attach the custom domain

`fulltvbox.com` currently returns 520 because it isn't bound to the Pages project.
In the Cloudflare dashboard: **Workers & Pages → `fulltvbox` → Custom domains → Add domain**
→ `fulltvbox.com` (and `www`). Remove any stale proxied A/AAAA record for the apex if the
flow flags one. (Until then, use `fulltvbox.pages.dev`.)
