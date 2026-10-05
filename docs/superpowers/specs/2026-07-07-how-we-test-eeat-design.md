# "How We Test" Methodology Page & Review Surfacing (E-E-A-T) — Design

**Date:** 2026-07-07
**Status:** Approved, ready for implementation planning

## Problem

The site's whole brand is "tested on the bench, rated without mercy," but the testing
methodology is under-surfaced as a trust/E-E-A-T signal:

- The methodology (9 criteria, 1–5 scoring bands, independence) exists only as sections
  buried inside `/about` ("About & How We Test"), not as a dedicated, deep-linkable page.
- Reviews link to it only via an easy-to-miss dim `how we test` text link in the byline
  (`ReviewLayout.astro:156`); the **score panel itself doesn't explain how the number was
  reached** or show evidence of first-hand testing.

Google's product-review guidance rewards demonstrable first-hand testing and consistent,
transparent criteria. A review site whose methodology is invisible at the point of the
score leaves trust and ranking on the table.

## Goal

Make the methodology a first-class, canonical trust anchor and surface it prominently
where the score is shown — using content that already exists, honestly.

## Non-goals / honesty guardrails (YAGNI + integrity)

- **No invented human reviewer.** We strengthen the real "FullTVBox Test Bench" editorial
  entity; we do not fabricate a named person or credentials to juice author expertise.
- **No fake per-criterion sub-scores.** The single 1–5 rating stays as-is.
- **No `HowTo` structured data.** Google deprecated HowTo rich results, and this is not a
  user how-to. Adding it would buy nothing and misrepresent the page type.
- No changes to guides/tutorials (they aren't scored).
- Every trust-strip claim must already be true and substantiated on-site.

## Components

### 1. `src/data/methodology.ts` (new) — single source of truth

Exports the methodology data so the page and the review strip never drift:

- `TEST_CRITERIA: { name: string; detail: string }[]` — the 9 criteria (from the current
  `/about` list).
- `SCORING_BANDS: { range: string; meaning: string }[]` — the 1–5 bands.
- `TEST_WEEKS = 2` and a derived `CRITERIA_COUNT` (= `TEST_CRITERIA.length`) so copy like
  "scored on 9 criteria" is derived, not hardcoded.

### 2. `src/pages/how-we-test.astro` (new) — canonical methodology page

- **What we test** — `TEST_CRITERIA`, lightly expanded.
- **How we score** — `SCORING_BANDS` as a clean table, plus the "relative to price /
  category" note and the "updated-date" revisit policy.
- **Test cycle & independence** — `TEST_WEEKS`+ weeks of real-world use; a one-line
  independence statement that links to `/about` for the full funding detail (kept there,
  not duplicated).
- Structured data: `BreadcrumbList` + a plain `WebPage`/`AboutPage` node. No `HowTo`.
- Title targets the "how we test streaming devices" intent; uses the existing
  Test-Bench page styling (`prose-bench`, smpte divider, `// Channel` kicker).

### 3. Slim down `src/pages/about.astro`

- **Move** the detailed "How We Test" (criteria) and "Our Rating Scale" sections out to
  `/how-we-test` (avoid duplicate content).
- Keep: Independence & Funding, Who We Are, Contact.
- Add a short "How we test" teaser paragraph linking to `/how-we-test`.
- Retitle to "About FullTVBox" (was "About & How We Test"); update its meta description.

### 4. `src/layouts/ReviewLayout.astro` — surface at the score

- Add a slim **trust strip** to the verdict/score panel (e.g. below the score row, above
  the smpte bar): "Independent · bought or borrowed · {TEST_WEEKS}+ weeks hands-on ·
  scored on {CRITERIA_COUNT} criteria" with a **"How we score →"** link to
  `/how-we-test`. Uses `methodology.ts` constants.
- Repoint the byline `how we test` meta link (line 156) to `/how-we-test`. The author-name
  link stays → `/about` (author entity's authority page).

### 5. `src/layouts/BaseLayout.astro` — footer nav

Add a "How We Test" link beside "About" (line ~189).

## Data flow

```
src/data/methodology.ts ─┬─► /how-we-test page (criteria + scoring table)
                         └─► ReviewLayout trust strip (counts + copy)
/about ──teaser link──► /how-we-test ──independence link──► /about (funding detail)
```

Static, build-time only; no client JS.

## Verification

`npm run build`, then confirm in built HTML:

- `/how-we-test` renders the 9 criteria and the scoring-band table; JSON-LD has
  `BreadcrumbList` and **no** `HowTo`.
- `/about` no longer contains the criteria/rating-scale sections (no duplication) and
  links to `/how-we-test`.
- A sample review page shows the trust strip with a working `/how-we-test` link, and the
  "scored on N criteria" count matches `TEST_CRITERIA.length`.
- The footer shows a resolving "How We Test" link.

## Risks

- **Duplicate content between `/about` and `/how-we-test`:** mitigated by *moving* (not
  copying) the sections; each fact lives on exactly one page, cross-linked.
- **Trust strip reading as marketing fluff:** mitigated by only stating claims already
  substantiated on `/about`, and linking straight to the evidence.
- **Losing `/about`'s existing "how we test" search equity:** mitigated by keeping a
  teaser + internal link on `/about` and giving `/how-we-test` a focused, stronger target
  for that query; internal links pass the intent through.
