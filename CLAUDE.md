# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

FullTVBox is a static content site (Astro 5 + Tailwind, Cloudflare Pages) for TV-box/streaming-device reviews, buying guides, Raspberry Pi tutorials, streaming-service data, and deals. There is **no backend** — everything is computed at build time from Markdown/YAML content collections; the few interactive pages (search, cost calculator, compare) run client-side JS over data baked into the static HTML.

## Commands

```bash
npm run dev        # local dev server (astro dev)
npm run build      # static build into dist/ (also builds the Pagefind search index)
npm run preview    # serve the built dist/ locally
npm run deploy     # astro build && wrangler pages deploy dist
```

- Node ≥ 20.19 required.
- **No test runner, linter, or formatter is configured.** `astro build` is the de-facto check — it runs `astro:content` schema validation against every content file and fails the build on a schema violation. Run `npm run build` to validate content/type changes.
- Search (Pagefind) only works in `dev`/`preview` **after at least one `npm run build`**, because the index is generated during build into `dist/pagefind/`.
- Path alias: `@/*` → `src/*` (tsconfig extends `astro/tsconfigs/strict`).

## Content-collection architecture

Content is the database. Schemas live in `src/content/config.ts` (Zod) — read it before touching any content or schema. Collections:

- `reviews/`, `guides/`, `tutorials/` — Markdown (`type: 'content'`). Reviews carry `rating` (1–5), optional `specs`, `faq`, `price`, `affiliate`, `featured`.
- `services/`, `deals/` — YAML data files (`type: 'data'`).

**Cross-collection joins are by slug, validated only at runtime in `src/lib/`, not by Zod:**

- A `deals/` file references **exactly one** of `device` (a review slug) or `service` (a service slug) — enforced by a `.refine` in `config.ts`. A bad slug won't fail the schema; it silently fails to join.
- `src/lib/deals.ts` joins deals → reviews/services, drops expired deals (`expires` past build time), and exposes `getLiveDeals()` / `getDealsByDevice()` (cheapest live hardware deal per review). A live hardware deal replaces the review's "Check Price" CTA and emits `Offer` JSON-LD.
- `src/lib/devices.ts` flattens reviews into a client-friendly `Device[]` (powers `/compare`, `/devices.json`). `getComparisonPairs()` only generates "X vs Y" pages for devices that share a non-generic tag **and** sit within 2.2× on price — deliberately avoiding thin permutation pages.
- `src/lib/services.ts` powers `/cost-calculator`, `/streaming-services`, `/cut-the-cord`.

When changing how content is queried/derived, the logic almost always belongs in `src/lib/` (shared by multiple pages), not inline in a `.astro` page.

## Freshness convention

`src/lib/freshness.ts` drives NEW/UPDATED badges and "latest" sorting off a 30-day window. Set `updatedDate: "YYYY-MM-DD"` when re-testing content; `updated` takes precedence over `new`, and `latestDate()` (later of publish/updated) is the sort key for "Latest" lists. Today's date is referenced via `new Date()` at build time, so badges are relative to build time.

## Build-time generation (no per-page maintenance)

- **OG images:** 1200×630 cards rendered at build via satori→resvg. Source `src/og/card.ts`; endpoints `src/pages/og/**`. Layouts wire `og:image` automatically.
- **JSON-LD / SEO:** centralized in `BaseLayout.astro` + per-layout props (`Review`+`Product`+`BreadcrumbList` on reviews, `Article`/`TechArticle` on guides/tutorials, `FAQPage` where `faq` exists, `ItemList` on listings). Don't hand-author structured data in pages.
- **Sitemap priority** is computed by path in `astro.config.mjs`.

## Design system — "Test Bench"

Broadcast/AV-test-equipment aesthetic. Tokens live in `tailwind.config.mjs` and the `<style is:global>` block of `src/layouts/BaseLayout.astro` (CSS vars + classes: `.bench-card`, `.frame`, `.meter`, `.btn-signal`, `.chip`, `.label`, `.prose-bench`). Reuse these rather than introducing ad-hoc styles. Fonts are self-hosted via `@fontsource` (Archivo/IBM Plex Sans/IBM Plex Mono) — **no Google Fonts CDN**.

## Privacy constraint (don't break this)

The site sets no cookies and runs no analytics/ads/third-party trackers — hence no consent banner, and fonts are self-hosted so visitor IPs aren't shared. The only outbound flow is affiliate-link clicks. If you ever add analytics, ads, or a third-party embed, update `src/pages/privacy.astro` and reconsider the consent question before it ships.

## Deploy

Push to `master` → `.github/workflows/deploy.yml` runs `npm run deploy` to Cloudflare Pages project `fulltvbox` (needs repo secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`).

## Image fetch scripts

`npm run images:amazon` (Amazon PA-API) and `npm run images:bestbuy` download product photos to `public/images/reviews/<slug>.jpg` and patch review frontmatter. Both need API credentials via env vars (see README "Launch checklist"); support `--dry-run` and `--force`. Wikimedia-sourced photos must be credited on `/credits`; Amazon PA-API images need no attribution.

## Content automation

A weekly Claude Code cloud routine (Monday mornings) drafts one topical **guide** about whatever is currently "hot" in streaming/TV-tech and opens a **PR** for human review — it never pushes to `master`. Its full operating procedure and guardrails live in `docs/automation/weekly-content-agent.md`; edit that brief to change the agent's behavior. The routine itself (cron + prompt) is managed via `/schedule`, not in the repo.
