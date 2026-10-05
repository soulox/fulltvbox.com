# Plan: `/ai` section — AI prompts & tools for TV/streaming

## Context

The user wants a section for "the best AI tools and prompts". Decisions made during brainstorming:

- **Scope:** AI *for TV & streaming*. It serves the site's existing readers (troubleshooting, what to watch, cutting costs, setup/home lab) and builds on topics the site already covers. It is not a general AI-tools directory.
- **Prompts:** a copyable prompt library with **one page per prompt** (Markdown collection), grouped by task.
- **Tools:** short **curated tool cards** (YAML data, no star rating). Prompts link to the tools they suit.
- **Placement:** `/ai` hub that also surfaces the existing "AI & Local LLMs" guides; **takes the Deals slot in the top nav** (Deals has no live deals and is noindexed). Deals stays in the footer.
- **Launch content:** Claude drafts ~12 prompts and ~8 tool cards. Each prompt's example output comes from **actually running it**, labeled with the model and date. Tool facts (pricing, privacy) are checked against the vendor's site during implementation. The user reviews everything in the PR.

Constraints from CLAUDE.md: shared query logic goes in `src/lib/`; reuse the Test Bench design tokens and classes; no third-party scripts or embeds (privacy promise); JSON-LD is centralized in layouts; `npm run build` is the validation step.

## Content model — `src/content/config.ts`

```ts
const prompts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),                 // "Diagnose Fire TV buffering"
    description: z.string(),
    publishDate: z.string(),
    updatedDate: z.string().optional(),
    group: z.enum(['troubleshooting', 'what-to-watch', 'save-money', 'setup-homelab']),
    prompt: z.string(),                // template; {placeholders} highlighted
    variables: z.array(z.string()).default([]),
    tools: z.array(z.string()).min(1), // ai-tools slugs
    testedOn: z.object({ model: z.string(), date: z.string() }),
    related: z.array(z.string()).default([]), // guide/tutorial/review slugs
    author: z.string().optional(),
  }),
});

const aiTools = defineCollection({     // folder: src/content/ai-tools/, key 'ai-tools'
  type: 'data',
  schema: z.object({
    name: z.string(), maker: z.string(), url: z.string(),
    pricing: z.string(),               // "Free; Plus $20/mo"
    goodFor: z.array(z.string()),      // TV-context uses
    onTv: z.string().optional(),       // e.g. "Built into Google TV Streamer"
    local: z.boolean().default(false), // runs on your own hardware
    privacyNote: z.string(),
    verified: z.string(),              // date facts were last checked
  }),
});
```
Body of a prompt `.md` = `## Example output` (the real run) + `## Tips` + optional notes.

## Shared logic — `src/lib/`

- **`src/lib/prompts.ts`** (new). It follows the same pattern as `src/lib/guides.ts`: `PROMPT_GROUPS` (id, label, blurb, order), `promptGroupLabel()`, `groupPrompts()`, `relatedPrompts()` (same group first, then newest), and `promptsForPage(slug)` (prompts whose `related` includes a given guide/review/tutorial slug).
  - **Join validation:** this module also checks that every `tools` and `related` slug exists, and **throws at build time** if one doesn't. The deals joins fail silently on a bad slug; these will fail the build instead.
- **`src/lib/aiTools.ts`** (new). `getAiTools()` turns entries into a flat `AiTool[]`, the same way `src/lib/services.ts` does.
- Sorting and badges reuse `latestDate` / `freshness` from `src/lib/freshness.ts`.

## Pages & components

| Path | File | Notes |
|---|---|---|
| `/ai` | `src/pages/ai/index.astro` | Hub page: intro, prompt groups (with counts), latest prompts, tool cards, and the "AI & Local LLMs" guides (from `groupGuidesByCategory`). JSON-LD: ItemList + Breadcrumb |
| `/ai/prompts` | `src/pages/ai/prompts/index.astro` | All prompts, sectioned by group |
| `/ai/prompts/group/<group>` | `src/pages/ai/prompts/group/[group].astro` | Modeled on `src/pages/guides/category/[category].astro`; only non-empty groups get a page |
| `/ai/prompts/<slug>` | `src/pages/ai/prompts/[slug].astro` | Uses the generalized `GuideLayout`; shows `PromptBlock`, "Works with" tool chips, a "Tested on {model} · {date}" line, the body, and `RelatedLinks` |
| `/ai/tools` | `src/pages/ai/tools.astro` | One page of `ToolCard`s with `#slug` anchors; ItemList JSON-LD |
| OG | `src/pages/og/prompts/[slug].png.ts` | Copy of `og/guides/[slug].png.ts` with `kind: 'PROMPT'` |

- **`src/components/PromptBlock.astro`** (new). Shows the prompt in a `.frame` mono block, with `{placeholders}` highlighted in the signal color. A **Copy** button uses `navigator.clipboard` from a small inline script (no dependencies) and gives "Copied" feedback through the button's own label.
- **`src/components/ToolCard.astro`** (new). A `.bench-card` showing name, maker, pricing, good-for chips, a LOCAL chip, the on-TV note, the privacy note, and an outbound link (`rel="noopener"`).
- **`src/layouts/GuideLayout.astro`** gets a targeted generalization: optional props `kind` (label, default `GUIDE`), `crumbs` (breadcrumb trail, default Home › Guides) and `pagefindType` (default `guide`). Guides render the same as before; prompt pages pass `PROMPT` and Home › AI › Prompts. This avoids copying the Article/Breadcrumb JSON-LD into another file.

## Site wiring

- **Nav:** in `src/layouts/BaseLayout.astro`, `nav` changes `{ href: '/deals', label: 'Deals', ch: '04' }` to `{ href: '/ai', label: 'AI', ch: '04' }`. The footer gains an "AI Prompts & Tools" link; the Deals link stays.
- **Cross-links:**
  - `src/pages/guides/[slug].astro`, `reviews/[slug].astro` and `tutorials/[slug].astro` add a `RelatedLinks` block, "Prompts for this", built from `promptsForPage(slug)` (hidden when empty).
  - The `ai-llm` guide category page links to `/ai`.
- **Sitemap priority** (`astro.config.mjs` `serialize`): `/ai` 0.8; `/ai/prompts/<slug>` and `/ai/tools` 0.7; `/ai/prompts`, `/ai/prompts/group/*` 0.6.
- **`src/pages/llms.txt.ts`:** add `/ai` as a key page and a new "AI prompts" section.
- **Search:** Pagefind picks up the new pages automatically; prompt pages get `data-pagefind-filter="type:prompt"`.
- **Privacy:** nothing to change. There are no new third parties, and the copy button runs locally.

## Launch content

**Prompts (12)**, with Claude Opus 5.5 as the `testedOn` model. Each prompt is run for real, and its output is pasted in under a fictional but realistic example input:
- *Troubleshooting:* diagnose buffering · streaming stick Wi-Fi drops · HDR/Dolby Vision not showing
- *What to watch:* find a title across my services · family movie-night planner · build a watchlist from shows I loved
- *Save money:* audit and rotate my subscriptions · match live-TV services to my channels · cheapest way to stream a sports season
- *Setup & home lab:* Plex vs Jellyfin for my setup · Pi-hole allowlist for streaming apps · interview me and pick a streaming device

Each prompt's `related` points at existing guides and tutorials (e.g. `why-streaming-keeps-buffering-fix`, `raspberry-pi-pihole-ad-blocker`, `plex-vs-jellyfin-raspberry-pi-2026`, `is-cutting-the-cord-worth-it-2026`).

**Tools (8):** ChatGPT, Claude, Gemini (incl. Gemini on Google TV), Perplexity, Microsoft Copilot, Alexa+ (Fire TV), Ollama, Open WebUI. Pricing and privacy facts are checked on the vendor sites at implementation time, and `verified` holds the check date.

Out of scope (possible follow-ups): a fill-in-the-variables form, weekly-agent support for prompts, AI deals.

## Delivery

1. Copy this design to `docs/superpowers/specs/2026-10-05-ai-prompts-section-design.md` (the same folder as the existing specs).
2. Branch `feat/ai-section` off `master`.
3. Build in this order: schema → lib → components/layout generalization → pages → wiring → content.
4. Commit, then open a PR for review. **Do not merge** (the user merges).

## Verification

- `npm run build` passes (schema and the new slug-join checks). Temporarily add a bad `tools` slug to confirm the build fails with a clear message, then revert it.
- Check the build output: `dist/ai.html`, `dist/ai/prompts/*.html`, `dist/ai/tools.html` and `dist/og/prompts/*.png` exist; `dist/sitemap-0.xml` lists the `/ai` URLs; `dist/llms.txt` has the AI section.
- Check that guide pages still render the same as before: `GUIDE` label, Home › Guides breadcrumb, `type:guide` filter.
- `npm run preview` + Playwright:
  - The copy button puts the prompt text on the clipboard.
  - The nav shows AI and highlights it on `/ai/*`.
  - Mobile width has no horizontal scroll.
  - Pagefind search finds a prompt by title.
- JSON-LD on a prompt page parses and has Article + BreadcrumbList with an image.
- After the user merges and the site deploys: run `/seo page https://fulltvbox.com/ai`, and add `/ai` to the drift baselines.
