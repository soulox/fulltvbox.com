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
    reviews/      # product reviews   (rating 1–5, affiliate, tags, featured)
    guides/       # buying / setup guides
    tutorials/    # Raspberry Pi & home-lab how-tos (difficulty, duration)
    config.ts     # collection schemas
  layouts/        # BaseLayout + Review/Guide/Tutorial layouts
  pages/          # routes (incl. /og/** OG image endpoints)
  og/             # build-time OG card renderer + vendored fonts
public/
  images/reviews/ # self-hosted product photos
```

Add content by dropping a Markdown file into the relevant `src/content/<collection>/`
folder with the frontmatter its schema requires (see `src/content/config.ts`).

## Design system — "Test Bench"

A broadcast / AV-test-equipment aesthetic: deep blue-black, phosphor-green signal accent,
SMPTE color bars, VU-meter scores, and mono instrument labels. Tokens live in
`tailwind.config.mjs` and the `<style is:global>` block in `src/layouts/BaseLayout.astro`
(CSS variables + reusable classes: `.bench-card`, `.frame`, `.meter`, `.btn-signal`,
`.chip`, `.label`, `.prose-bench`).

- **Fonts:** Archivo (display), IBM Plex Sans (body), IBM Plex Mono (labels).
- **Accessibility:** WCAG 2.1 AA — verified 0 violations via axe-core.

## Social / OG images

Branded 1200×630 cards are generated **at build time** (satori → resvg) per content page,
plus a site default. Source: `src/og/card.ts`; endpoints under `src/pages/og/**` and
`src/pages/og-default.png.ts`. Layouts set `og:image` automatically — nothing to maintain
per page.

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
