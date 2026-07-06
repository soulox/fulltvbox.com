# Categorized Guides Section — Design

**Date:** 2026-07-06
**Status:** Approved, ready for implementation planning

## Problem

`/guides` (`src/pages/guides/index.astro`) renders all 20 guides in a single flat
grid sorted by publish date. As the library grows (one guide is added every week by
the automation routine), the flat list is getting hard to scan and buries evergreen
buying/troubleshooting content under whatever shipped most recently. Guides should be
grouped into categories.

## Goals

- Group guides into a fixed set of categories on the `/guides` index.
- Make category assignment explicit and build-validated (no silent miscategorization).
- Keep the change small: no new routes, no new interactive JS, no changes to how an
  individual guide renders.

## Non-goals (YAGNI)

- No client-side filter chips.
- No per-category landing pages / routes.
- No category chip/badge on individual guide cards.
- No changes to RSS, sitemap, OG images, or the guide detail page.

## Decisions

- **Presentation:** grouped sections on the single `/guides` page (labeled headings,
  one grid per category). No new routes.
- **Assignment:** explicit `category` field in each guide's frontmatter. **Required,
  no default** — the `astro build` content-schema check is the guardrail; a guide that
  omits `category` (including an automated one) fails the build instead of silently
  landing in a catch-all.
- **Taxonomy:** seven categories, each with ≥2 guides today.

## Category taxonomy and section order

Enum id → display label, in the order sections appear on the page:

1. `buying-guides` → **Buying Guides**
2. `comparisons` → **Comparisons**
3. `cord-cutting` → **Cord-Cutting**
4. `troubleshooting` → **Troubleshooting**
5. `ai-llm` → **AI & Local LLMs**
6. `basics-setup` → **Basics & Setup**
7. `whats-new` → **What's New**

### Backfill mapping (existing 20 guides)

| Category | Guides |
|---|---|
| `buying-guides` | best-tv-box-2025, best-tv-box-for-plex, best-cheap-streaming-device-under-50-2026, best-streaming-device-4k-hdr-dolby-vision-2026, best-streaming-device-without-ads-2026 |
| `comparisons` | android-tv-vs-fire-tv-vs-roku, streaming-stick-vs-box |
| `cord-cutting` | is-cutting-the-cord-worth-it-2026, real-cost-of-cutting-the-cord-2026 |
| `troubleshooting` | why-streaming-keeps-buffering-fix, fire-tv-stick-slow-fixes, roku-wont-connect-to-wifi-fix |
| `ai-llm` | ai-on-tv-box-2026, ai-video-upscaling-tv-box, best-hardware-run-llm-locally-2026, best-gpu-for-local-llm-2026 |
| `basics-setup` | tv-box-setup-guide, 4k-hdr-explained |
| `whats-new` | newest-streaming-devices-tech-2026, roku-new-home-screen-2026-what-changed |

Note: the two LLM-hardware buying guides are grouped under `ai-llm` (by topic), not
`buying-guides` (by format) — a deliberate call.

## Components

### 1. Schema — `src/content/config.ts`

Add to the `guides` collection schema:

```ts
category: z.enum([
  'buying-guides', 'comparisons', 'cord-cutting',
  'troubleshooting', 'ai-llm', 'basics-setup', 'whats-new',
]),
```

Required (no `.optional()`, no `.default()`).

### 2. Derivation helper — `src/lib/guides.ts` (new)

Repo convention (CLAUDE.md): content-derivation logic lives in `src/lib/`, not inline
in pages. This module owns:

- `GUIDE_CATEGORIES`: ordered array of `{ id, label }` — the single source of truth for
  both display labels and section order (the list above).
- `groupGuidesByCategory(guides)`: returns categories in `GUIDE_CATEGORIES` order, each
  with `{ id, label, guides }` where `guides` are sorted by `latestDate(publishDate,
  updatedDate)` (from `src/lib/freshness.ts`) descending. **Empty categories are
  omitted** so the page self-heals if a bucket ever empties.

### 3. Index page — `src/pages/guides/index.astro`

Replace the single flat grid with a loop over `groupGuidesByCategory(...)`. Each section:

- a `.label` kicker + `<h2>` heading using the category `label`,
- the existing `bench-card` guide-card grid, markup otherwise unchanged
  (image, title, description, date, "→ read").

The global `DOC·NN` counter is dropped — it doesn't survive grouping cleanly and carries
no real meaning.

### 4. Backfill

Add `category: <id>` to the frontmatter of all 20 existing guide files per the mapping
table above.

### 5. Automation brief — `docs/automation/weekly-content-agent.md`

In Step 3's frontmatter template, add a `category:` line with the enum list and a
one-line instruction to pick the single best-fit category, so weekly-generated guides
satisfy the now-required field and build successfully.

## Data flow

Build time only (static site, no backend):

```
guides/*.md (frontmatter incl. category)
  → getCollection('guides')            [index.astro]
  → groupGuidesByCategory()            [src/lib/guides.ts, uses freshness.latestDate]
  → ordered sections rendered as headings + bench-card grids
```

## Validation

`npm run build` is the de-facto test:

- Schema validation fails if any guide is missing/has an invalid `category` — confirms
  the backfill is complete and the required field works.
- A successful build with all 7 sections rendering confirms grouping and ordering.

Manual check via `npm run preview`: `/guides` shows seven headed sections in the
specified order, each guide under the correct heading, newest-first within a section.

## Risks

- **Automation forgetting `category`:** mitigated by making the field required — the
  weekly PR's build fails and the human reviewer sees it, rather than mis-filed content
  shipping silently. The brief update reduces the chance it happens at all.
- **A future guide fitting no category:** acceptable; add a new enum value + label when
  it arises rather than pre-building a catch-all now.
