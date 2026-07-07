# Content-Gap Backlog for the Weekly Agent — Design

**Date:** 2026-07-06
**Status:** Approved, ready for implementation planning

## Problem

The weekly content routine (`docs/automation/weekly-content-agent.md`) is purely
*reactive*: each run it researches what's "hot" in the last ~2 weeks, picks one
uncovered topic, and drafts a guide — or, if nothing genuinely fresh and on-topic
exists, opens **no PR** and skips the week. There is no systematic view of the topics
the site *should* cover but doesn't, so evergreen gaps only get filled by luck of the
news cycle, and "skip weeks" produce nothing.

## Goal

Give the weekly agent a maintained, prioritized backlog of guide topics to draw from so
gaps get filled steadily, turning skip weeks into gap-fill weeks — without losing the
value of timely, trending content when it exists.

## Non-goals (YAGNI)

- No code changes, no build/schema changes, no `npm run` script.
- No gap-report generator (brands-without-reviews, etc.).
- No keyword-research API integration.
- Backlog holds **guide** topics only. Reviews require hands-on testing and stay
  human-authored (per the existing brief), so review ideas do not belong here.

## Decisions

- **Form:** an ongoing, human-maintained-and-agent-groomed backlog file in the repo,
  consumed by the weekly agent. Hot-topics-first, backlog as fallback.
- **Replenishment:** the agent self-grooms (marks used items done, appends newly
  discovered candidates) in its PR; humans can add/reorder/prune anytime.
- **Format:** a flat, prioritized markdown list (not YAML). P1/P2/P3 tiers.

## Components

### 1. New file — `docs/automation/content-backlog.md`

Structure:

- **Header** (for humans *and* the agent): what the file is, the one-line item format,
  the priority tiers, and the rule that it holds guide topics only.
- **Backlog list:** one item per line, highest-priority first. Line format:

  ```
  - [P1] <topic / angle> — category: <guide-category-id> — intent: <search query / why> — <optional note>
  ```

  - `<guide-category-id>` is one of the seven guide categories
    (`buying-guides`, `comparisons`, `cord-cutting`, `troubleshooting`, `ai-llm`,
    `basics-setup`, `whats-new`) — so a backlog item already declares the `category`
    the resulting guide's frontmatter will need.
  - Priority tiers: **P1** = high intent / high opportunity, **P2** = solid evergreen,
    **P3** = nice-to-have. The agent picks the highest-priority *uncovered* item; ties
    break top-first (list order).

- **Seeding:** during implementation, seed the list with an initial prioritized set of
  uncovered, high-intent guide topics derived from a gap analysis of current content
  across the seven categories, so the backlog is useful on day one. (Seed items must
  pass the same dedup check — nothing already covered in `src/content/`.)

### 2. Edits — `docs/automation/weekly-content-agent.md`

Teach the agent the consult → select → groom loop:

- **New Step 1.5 — Consult the backlog:** after the "what's hot" research, read
  `content-backlog.md`.
- **Revised Step 2 selection priority:**
  1. If a genuinely **hot and uncovered** topic exists, write that (news is
     time-sensitive).
  2. Otherwise, pull the **highest-priority uncovered backlog item** (ties top-first).
  3. Only if **both** are empty/exhausted, skip the week (leave the existing note).
- **Grooming (same PR):**
  - If the chosen topic came from the backlog, **remove that line**.
  - **Append up to 3** promising topics found during research that are not already
    covered in `src/content/` and not already listed, each as a properly formatted
    P2/P3 line.
  - The backlog edit ships in the **same PR** as the guide, so a human reviews both the
    guide and the backlog delta.
- The existing dedup guardrail (don't rewrite covered topics) and all other guardrails
  remain unchanged.

## Data flow

```
content-backlog.md  ─┐
                     ├─► agent selection (hot-first, backlog fallback)
"what's hot" research┘
        │
        ▼
one guide PR that ALSO edits content-backlog.md
   (removes used item, appends ≤3 new candidates)
        │
        ▼
human reviews guide + backlog delta → merge → deploy
```

## Verification

Markdown only — no build to run (though `npm run build` still passes trivially since no
content/schema changed). Success criteria:

- The seeded `content-backlog.md` is non-empty, every item is well-formed, uses a valid
  guide-category id, and references a topic not already covered in `src/content/`.
- The updated brief unambiguously specifies the consult → select → groom loop, including
  the hot-first priority, the "skip only if both empty" rule, remove-used-item, and
  append-≤3 behaviors.

## Risks

- **Agent mis-grooming (dupes / bad formatting):** mitigated by the human PR review gate
  — the backlog delta is reviewed alongside the guide before merge.
- **Backlog drift from real search demand:** acceptable; humans reorder/prune during the
  same review they already do. Priorities are human-set.
- **Backlog runs dry:** the append-≤3 rule plus human curation keep it replenished; if it
  and the news cycle are both empty, skipping the week is the intended (honest) outcome.
