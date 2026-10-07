# What to Watch — Netflix Top 10 (phase 1)

## Context

Streaming viewers often don't know what to watch, what's good, or what everyone else is
watching. The goal is a public `/what-to-watch` section on fulltvbox.com: top 10
series and movies for this week, this month, this year and last year, eventually for each
streaming service and genre.

Decisions so far (yours):
- **Public, indexable section** on the site.
- **Netflix first, TMDB next.** Netflix is the only service that publishes official viewing
  data, as free downloadable TSV files. Lists for the other services and for genres need TMDB,
  whose API requires a written commercial agreement for this site, because it earns affiliate
  revenue. Phase 1 ships Netflix; you apply to TMDB in parallel; phase 2 gets its own spec.
- **No scraping** of JustWatch, FlixPatrol or IMDb: it breaks their terms, breaks whenever their
  pages change, and is a legal risk for a commercial site.
- **"Good or bad" = short editorial verdicts**, drafted weekly by a cloud routine and reviewed
  by you in a PR (like the deals routine).
- **US first, global alongside.** Weekly lists are US ranks. Month and year lists use global
  view counts, because the US file has no view counts.

## Data source (verified 2026-10-07)

- `https://www.netflix.com/tudum/top10/data/all-weeks-global.tsv` — columns `week, category,
  weekly_rank, show_title, season_title, weekly_hours_viewed, runtime, weekly_views,
  cumulative_weeks_in_top_10`. Categories: Films (English), Films (Non-English),
  TV (English), TV (Non-English). Latest week: 2026-10-04. Published weekly (Tuesdays).
- `all-weeks-countries.tsv` — per-country weekly ranks, Films/TV, **no view counts**. Large
  file (~470k rows), so it gets streamed and filtered to the US.
- **Known limit:** a title only has data in the weeks it was in a Top 10. Month and year
  rankings therefore add up "views during weeks in the Top 10", and each page says so.

## Design

### 1. Fetch at build time — `scripts/fetch-netflix-top10.mjs` (new)
- Download both TSVs. Keep rows from 2025-01-01 on, and only US rows from the country file.
  Write `.cache/netflix-top10.json` (`.cache/` is already gitignored).
- Add an `npm run top10` script, and chain it into `deploy`:
  `node scripts/fetch-prices.mjs && node scripts/fetch-netflix-top10.mjs && astro build && …`
- **On failure:** exit 1 when `CI` is set. The deploy then fails and Cloudflare keeps serving
  the last good version, rather than publishing empty lists. Locally it only warns, and the
  pages show an empty state with `noindex` (the same pattern `/deals` uses).
- The existing daily 09:00 UTC rebuild (`deploy.yml`) keeps the lists fresh, so no new workflow
  is needed.

### 2. Data layer — `src/lib/top10.ts` (new)
- Reads the cache. Exposes:
  - `getWeeklyTop({ region: 'us' | 'global', kind: 'movie' | 'series' })` — latest week.
  - `getPeriodTop({ kind, from, to })` — global, adds up `weekly_views` per title within the
    date range, merges the English and non-English categories, sorts, top 10.
- **Title key:** `season_title` when it isn't `N/A` (seasons rank separately, e.g.
  "Wednesday: Season 2"), otherwise `show_title`. Normalized to a slug.
- **Return shape is source-agnostic** (`WatchTitle { key, title, kind, service, rank, views?,
  weeksInTop10, verdict? }`), so TMDB can plug in later without changing the pages.
- Joins verdicts by key. A title with no verdict simply renders without one.

### 3. Verdicts collection — `src/content/watch-verdicts/*.yaml` (new)
Zod schema in `src/content/config.ts`:
```yaml
title: "Wednesday: Season 2"   # must match the Netflix title/season text exactly
kind: series                   # movie | series
verdict: watch                 # watch | skip | depends
take: "Sharper than season 1; the mystery finally earns the gothic styling."  # ≤160 chars
sources: ["https://…", "https://…"]   # ≥2 published reviews it's based on
checked: "2026-10-07"
```

### 4. Pages (Test Bench design system, `.bench-card`, `.meter`, `.chip`)
| URL | Content |
|---|---|
| `/what-to-watch` | Hub: this week's US top 10 movies and series, links to every list. Service-agnostic, so phase 2 slots in. |
| `/what-to-watch/netflix` | This week: US lists, with the global lists alongside. |
| `/what-to-watch/netflix/past-month` | Last 4 weekly lists, global views. A rolling window, so early in the month it isn't thin. |
| `/what-to-watch/netflix/this-year` | Year to date, global views. |
| `/what-to-watch/netflix/2025` | Last year, a permanent dated page that stays indexable. |

Each page has movies and series sections, each up to 10. A row shows rank, title, views (where
available), weeks in the Top 10, and the verdict chip and take. Each page also has:
- the "week of …" date and a source line linking to Netflix Top 10;
- a short methodology note (the known limit above);
- an `ItemList` JSON-LD for each list, built inline the way `src/pages/best-picks.astro` does;
- an OG card through `renderOg` (pattern: `src/pages/og/ai.png.ts`) → `src/pages/og/what-to-watch/[page].png.ts`.

Navigation: add "What to Watch" to the nav array in `src/layouts/BaseLayout.astro`. Link to the
hub from `/streaming-services` and from the `/ai/prompts` "what to watch" group. Set its sitemap
priority (0.7) in `astro.config.mjs`. Not doing: genre and per-service pages (they need TMDB,
phase 2), and posters (Netflix data has none; TMDB posters would be downloaded at build time,
in phase 2).

### 5. Weekly verdicts routine
- **Brief:** `docs/automation/weekly-verdicts-agent.md`, modeled on `weekly-deals-agent.md`.
- **Each run:**
  - runs `npm run top10` and lists the titles on the current pages that have no verdict;
  - drafts a verdict for each one, based on at least 2 published reviews it cites;
  - re-checks verdicts for titles that have a new season;
  - opens a PR, and never pushes to master.
- **Guardrails:** never invent a review or a score; at most one verdict per title key; if fewer
  than 2 reviews exist, leave the title without a verdict.
- **Cloud routine:** Wednesdays 05:17 UTC (Netflix publishes on Tuesdays), created with
  `/schedule` only after the brief is on master.

### 6. Docs
CLAUDE.md (new collection, lib, fetch script, routine), README section, and a credits/source
note.

## Phase 2 (separate spec, after TMDB approves a commercial agreement)
Genre and per-service lists (Prime Video, Apple TV, Disney+, Max…), ratings, and posters
downloaded at build time. Only build pages for combinations with enough titles, to avoid thin
pages.

## Delivery
After approval: commit this design as `docs/superpowers/specs/2026-10-07-what-to-watch-design.md`,
write the implementation plan (writing-plans), implement on branch `feat/what-to-watch`, and
open a PR.

## Verification
1. `npm run top10` → check the row counts, and that the latest week matches netflix.com/tudum/top10.
2. `npm run build` passes (schema validation for watch-verdicts).
3. Check `dist/what-to-watch/netflix.html`: the US lists match Netflix's US Top 10 page for
   the same week.
4. Re-add up one title's past-month total by hand from the TSV and compare it with the page.
5. Delete `.cache/netflix-top10.json` and rebuild: the pages show the empty state with `noindex`.
   With `CI=1` and a broken URL, the fetch exits 1.
6. Add one test verdict file → its chip and take render on every list that title appears on.
