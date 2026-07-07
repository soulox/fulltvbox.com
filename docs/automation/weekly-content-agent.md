# Weekly Content Agent — Operating Brief

This is the exact procedure the **weekly content routine** executes. A Claude Code cloud
routine (scheduled for Monday mornings) runs this end-to-end. Humans should treat this file as
the source of truth for the automation — improve the guardrails here rather than in the routine
prompt.

**One run = one topical guide, delivered as a pull request. Never push to `master`.**

---

## Mission

Each run, in order:

1. **Research** what's currently hot in the streaming-device / TV-tech space.
2. **Consult the [content backlog](content-backlog.md)** of queued guide topics.
3. **Pick one** topic — a hot, uncovered one if it exists, otherwise the highest-priority
   uncovered backlog item — that fits this site and is **not already covered**.
4. **Draft one guide** following the format and guardrails below.
5. **Groom the backlog** (remove the item you used; append promising new candidates).
6. **Validate** it builds.
7. **Open a pull request** for human review. Do not merge, do not push to `master`.

If **neither** a genuinely fresh hot topic **nor** a backlog item is available and
uncovered this week, **open no PR**. Instead leave a short note (a draft PR description or a
comment in the run log) explaining why. A skipped week is better than a thin or duplicate
article — this site's value is honest, useful content. With the backlog in place, a true
skip should be rare.

---

## Step 1 — Find what's hot

Use `WebSearch` / `WebFetch` to survey the **last ~2 weeks** of news and trends across the
site's beats:

- Streaming devices / TV boxes / sticks (Roku, Fire TV, Apple TV, Google TV, NVIDIA Shield,
  Chromecast, Onn, Xiaomi, TiVo).
- Streaming *services* and cord-cutting (price changes, new tiers, ad changes, launches,
  shutdowns, sports-rights moves).
- TV / streaming technology (new OSes, AI upscaling, HDR, Wi-Fi, Matter/smart-home, codecs).
- Raspberry Pi media / self-hosting (Plex, Kodi, home server).

Prefer topics with **real search intent** (a question people are actively asking, a price
change that affects buying decisions, a newly released or newly controversial product).

## Step 1.5 — Consult the content backlog

Read [`content-backlog.md`](content-backlog.md) — the prioritized queue of guide topics the
site should cover but doesn't yet. This is the fallback source when the news cycle is quiet,
and it also tells you which item to write when you fall through to it in Step 2.

## Step 2 — Pick a topic (and dedup)

First, list what already exists and **do not duplicate it**:

```bash
ls src/content/guides/     # existing guides
ls src/content/reviews/    # existing device reviews
ls src/content/tutorials/  # existing Pi tutorials
```

Then pick **one** topic, in this priority order:

1. **A hot, uncovered topic** from Step 1 — news is time-sensitive, so a genuinely fresh
   and relevant one wins.
2. **Otherwise, the highest-priority uncovered item** from the backlog (ties break
   top-first / list order).
3. **Otherwise, skip the week** (see Mission).

Skip anything already covered at the same angle. A fresh *angle* on an evergreen subject is
fine (e.g. a 2026 price-change update); a near-duplicate of an existing guide is not.

Content type: **write a guide** (`src/content/guides/`). Do **not** author reviews or
tutorials — device reviews require hands-on testing and must stay human-authored.

## Step 2.5 — Groom the backlog

Edit `content-backlog.md` in the **same PR** as the guide:

- If the topic you wrote came from the backlog, **remove that line**.
- **Append up to 3** promising topics you found during research that are (a) not already
  covered in `src/content/` and (b) not already listed — each as a properly formatted
  `P2`/`P3` line (see the format rules at the top of `content-backlog.md`).

Do not append review or tutorial ideas — the backlog is guide topics only.

## Step 3 — Draft the guide

Model the structure and tone on existing guides, especially:

- `src/content/guides/best-streaming-device-without-ads-2026.md`
- `src/content/guides/newest-streaming-devices-tech-2026.md`

**Frontmatter** (must satisfy the `guides` schema in `src/content/config.ts`):

```yaml
---
title: "..."            # compelling, includes the year where it helps SEO
description: "..."       # 1–2 sentences, the meta description
publishDate: "YYYY-MM-DD"   # the run date
category: "..."          # REQUIRED — the single best-fit category (see list below)
faq:                    # exactly 4 Q&As — auto-emits FAQPage JSON-LD
  - question: "..."
    answer: "..."
  # ...4 total
---
```

`category` is **required** — the build fails if it's missing or not one of these
ids. Pick the single best fit for the guide's primary angle:

| id | use for |
|----|---------|
| `buying-guides` | "best X" / device-picking guides |
| `comparisons` | head-to-head "X vs Y" guides |
| `cord-cutting` | streaming-service cost / cutting-the-cord guides |
| `troubleshooting` | fixes for a specific problem (buffering, won't connect, slow) |
| `ai-llm` | AI features on TV boxes and local-LLM hardware guides |
| `basics-setup` | setup walkthroughs and explainer/"what is X" guides |
| `whats-new` | news / "what changed" / newly announced hardware or OS |

Do **not** add `author` or `image` — existing guides omit both.

**File path:** `src/content/guides/<kebab-slug>.md` (slug derived from the title).

**Body** (~1000–1200 words, "Test Bench" tone — direct, candid, expert):

- Open with a **"The short version"** bulleted summary of the takeaways.
- Split major sections with a `---` then `---` on the next line (the site's section divider).
- Where it fits, include an honest **"what's NOT worth it / skip it"** section — candor is the
  brand.
- End with a short **FAQ** recap.

## Step 4 — Guardrails (non-negotiable)

These are the reason the human review gate stays cheap. Violating them produces content that
looks fine but is wrong.

- **Links must resolve.** Cross-link only to pages that exist. Before writing any
  `/reviews/<slug>` or `/guides/<slug>` link, confirm the matching file exists in
  `src/content/`. **No dead links.**
- **Never fabricate commercial data.** Do not invent affiliate URLs, Amazon ASINs, prices, or
  hardware specs. Only reuse an affiliate link/price that already appears in an existing
  review's frontmatter (the `affiliate:` field / `?tag=fulltvbox-20` links). If a device has
  **no** existing affiliate link, link to its **review page** instead of inventing a store URL.
  **Never paste a raw Amazon `/dp/<ASIN>` link into prose** — stale ASINs 404. For buy intent,
  link to the device's **review page** (its CTA renders a click-safe Amazon link), or use an
  `https://www.amazon.com/s?k=<device+name>&tag=fulltvbox-20` search link.
- **Don't invent benchmarks or unreleased-product facts.** Frame genuinely upcoming/rumored
  tech *as* upcoming/rumored. State uncertainty rather than fabricating specifics.
- **Privacy constraint.** Never add analytics, ads, trackers, or third-party embeds/scripts.
  The site is cookieless by design (see `src/pages/privacy.astro`).

## Step 5 — Validate

```bash
npm ci        # if dependencies aren't installed
npm run build # must pass astro:content schema validation AND the Pagefind index step
```

The build is the de-facto test. If it fails, fix the content until it passes. Do not open a PR
on a failing build.

## Step 6 — Deliver as a pull request

```bash
git checkout -b content/weekly-YYYY-MM-DD-<slug>
git add src/content/guides/<slug>.md docs/automation/content-backlog.md
git commit    # see message convention below
git push -u origin content/weekly-YYYY-MM-DD-<slug>
gh pr create ...
```

Stage the backlog edit from Step 2.5 alongside the guide so the human reviews both together.

**PR body must include:**

- The topic and the target URL (`/guides/<slug>`), and whether it came from the backlog or
  from the news cycle.
- **Why it's hot this week** (or why it was the top backlog pick), with the source links
  found in Step 1.
- Approximate word count and the list of internal pages it links to.
- The **backlog delta**: the item removed (if any) and any candidates appended.

Do **not** merge and do **not** push to `master`. A human reviews, edits if needed, and merges;
merging triggers `.github/workflows/deploy.yml`, which deploys to Cloudflare Pages.

**Commit / co-author trailer:** end commit messages with
`Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

## Notes for maintainers

- New guides auto-appear in `src/pages/guides/index.astro`, the sitemap, the RSS feed
  (`src/pages/rss.xml.ts`), and Pagefind search at build time — no per-page wiring needed.
- The [content backlog](content-backlog.md) is the steering wheel for what gets written.
  To bias output, edit that file directly — reorder items, bump priorities, or add topics.
  The agent grooms it but humans set direction; keep it stocked with high-intent ideas.
- To change cadence or retire the automation, update the cloud routine via `/schedule`
  (list/edit/delete). This brief has no effect on its own; the routine is what runs it.
