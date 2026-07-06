# Topic Clusters & Internal Linking — Design

**Date:** 2026-07-06
**Status:** Approved, ready for implementation planning

## Problem

Internal linking — a top on-site SEO lever — is underbuilt:

- **Guides** show the 3 *latest* guides as "related," regardless of topic
  (`src/pages/guides/[slug].astro:18`).
- Cross-linking between guides and reviews exists only as **prose links in bodies**, and
  only one-directionally in structure: 12 of 19 guides link out to reviews (up to 9 each,
  11 distinct devices), but a **review page has no structured block showing which guides
  feature that device**.
- The seven guide **categories** (shipped earlier) exist only as on-page sections on
  `/guides` — there are **no indexable category hub pages**.

## Goal

Build a hub-and-spoke topic-cluster structure that strengthens internal linking using
signals already present in the content — the `category` field and the review/guide links
already written into bodies — without adding new authoring burden.

## Non-goals (YAGNI)

- No new frontmatter fields.
- No rewriting of prose or anchor text; no automated anchor-text optimization.
- No changes to the deals or `/compare` graphs.
- No review→guide *prose* changes (we only add a derived structured block).

## Signals available (verified)

- Guides and reviews expose raw markdown via `entry.body`.
- Body cross-links: 12/19 guides link to `/reviews/<slug>` (11 distinct); 8 reviews link
  to a `/guides/<slug>`.
- Guides carry `category` (seven ids); `src/lib/guides.ts` already exports
  `GUIDE_CATEGORIES` and `groupGuidesByCategory`.
- `GuideLayout` and `ReviewLayout` each expose a `slot name="related"`.
- `RelatedLinks.astro` is a generic `{ href, title, description }[]` card renderer.
- `reviews/index.astro` inlines `ItemList` JSON-LD via a `Fragment slot="head"` — the
  pattern hub pages will follow.

## Components

### 1. `src/lib/links.ts` (new) — guide↔review link graph

Build-time module. Parses every guide's and review's `entry.body` once with regexes
`/reviews/([a-z0-9-]+)` and `/guides/([a-z0-9-]+)`, dedupes, and **validates each slug
against the real collection** (drops any that don't resolve — guards against dead links).
Exposes:

- `reviewsMentionedInGuide(guideSlug): string[]` — review slugs a guide links to.
- `guidesFeaturingReview(reviewSlug): string[]` — reverse index: guides whose body links
  to this review.

Takes the loaded collections as input (no I/O of its own) so it's pure and testable.

### 2. Topical related guides — `src/lib/guides.ts`

Add `relatedGuides(guide, allGuides, limit = 3)`: same-`category` guides first, sorted
newest-first by `latestDate(publish, updated)`, backfilled with the latest remaining
guides to reach `limit`. Replaces the naive latest-3 sort in `guides/[slug].astro`.

### 3. Bidirectional cross-link blocks

Rendered with the existing `RelatedLinks` component, inside each layout's `related` slot.
Cap each block at **4** cards.

- **Review page** (`reviews/[slug].astro`): add a **"Guides featuring this device"**
  block from `guidesFeaturingReview(review.slug)`, below the existing "Related Reviews".
  Omitted when empty.
- **Guide page** (`guides/[slug].astro`): add a **"Devices in this guide"** block from
  `reviewsMentionedInGuide(guide.slug)`, alongside the topical "More Guides" block.
  Omitted when the guide mentions no device.

### 4. Category hub pages — `src/pages/guides/category/[category].astro` (new)

- `getStaticPaths` over `GUIDE_CATEGORIES`, emitting a page only for **non-empty**
  categories. Param is the category id (already URL-safe kebab-case).
- Renders the category label as `<h1>`, the category's guides as the same card grid used
  on `/guides`, and a link back to `/guides`.
- SEO: inline `ItemList` + `BreadcrumbList` JSON-LD via `Fragment slot="head"`, mirroring
  `reviews/index.astro`. Title/description derived from the category label.

### 5. Wiring

- `/guides` index (`src/pages/guides/index.astro`): each section heading links to its hub
  (e.g. `Buying Guides →` → `/guides/category/buying-guides`).
- Guide page: a **"More in <Category>"** link to the guide's category hub.
- `astro.config.mjs`: add a sitemap-priority rule for `/guides/category/*` (below the
  `/guides` index, above individual guides — e.g. 0.5).

## Data flow

```
entry.body (all guides + reviews) ─► links.ts graph ─► cross-link blocks
category field ─► relatedGuides() ─► "More Guides"
              └─► GUIDE_CATEGORIES ─► /guides/category/[id] hub pages ─► index & guide links
```

All resolved at build time; no runtime/client JS added.

## Verification

`npm run build` must pass (validates every generated hub route + content schema). Then in
built HTML confirm:

- a sample review (e.g. `nvidia-shield-tv-pro-2025`) shows a "Guides featuring this
  device" block linking to the guides that mention it;
- a sample buying guide shows topical "More Guides" (same category) **and** a "Devices in
  this guide" block;
- each `/guides/category/<id>` page renders that category's guides and links back to
  `/guides`;
- the `/guides` index section headings link to the hubs.

Also confirm no dead links: every slug surfaced by `links.ts` resolves to a real page
(the validation step guarantees this — spot-check one).

## Risks

- **Regex over-matching body text:** mitigated by validating every extracted slug against
  the real collection and deduping; non-resolving matches are dropped.
- **Thin hub pages:** avoided by emitting hubs only for non-empty categories (every
  current category has ≥2 guides).
- **Echoed guide→review links feel redundant with prose:** acceptable — the end-of-page
  block reinforces the cluster and adds a crawlable, scannable exit path; it's capped and
  omitted when empty.
