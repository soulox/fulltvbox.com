# Weekly Verdicts Agent — Operating Brief

The procedure the **weekly verdicts routine** runs, once a week after Netflix publishes its
Top 10 (Tuesdays). Treat this file as the source of truth; change the guardrails here, not in
the routine prompt.

**One run = verdicts for the titles on the current /what-to-watch lists, delivered as a pull
request. Never push to `master`.**

## Mission

1. `npm ci && npm run top10` to get this week's data.
2. List the titles that need a verdict.
3. Draft each verdict from published reviews.
4. `npm run build`.
5. Open (or update) a PR.

## Step 1 — Which titles need a verdict

```bash
npm run top10
node --input-type=module <<'EOF'
import fs from 'node:fs';
import { parse } from 'yaml';
import { weeklyTop, periodTop, latestWeek, netflixPeriods, verdictKey } from './src/lib/top10-core.mjs';
const c = JSON.parse(fs.readFileSync('.cache/netflix-top10.json', 'utf8'));
const dir = 'src/content/watch-verdicts';
const have = new Set(fs.readdirSync(dir).filter((f) => f.endsWith('.yaml'))
  .map((f) => parse(fs.readFileSync(`${dir}/${f}`, 'utf8')) ?? {})
  .filter((v) => v.title && v.kind)
  .map((v) => verdictKey(v.kind, v.title)));
const pm = netflixPeriods(latestWeek(c.global))[0];
const lists = ['movie', 'series'].flatMap((kind) => [
  ...weeklyTop(c.us, { kind, week: latestWeek(c.us) }),
  ...weeklyTop(c.global, { kind, week: latestWeek(c.global) }),
  ...periodTop(c.global, { kind, from: pm.from, to: pm.to }),
]);
const need = [...new Map(lists.map((t) => [verdictKey(t.kind, t.title), t]).filter(([k]) => !have.has(k))).values()];
console.log(need.map((t) => `${t.kind}\t${t.title}`).join('\n') || '(none)');
EOF
```
These are the titles on this week's US and global lists and the past-month lists that have
no verdict file yet.

If an earlier weekly verdicts PR is still open, work on its branch (rebase it on
`origin/master`) rather than opening a second one.

## Step 2 — Draft each verdict

For each title, find **at least 2 published reviews** (critics or established outlets: e.g.
Variety, The Guardian, IGN, Vulture, RogerEbert.com, Decider) with `WebSearch` / `WebFetch`.
Then write `src/content/watch-verdicts/<titleKey>.yaml`:

```yaml
title: "Wednesday: Season 2"   # exactly as the list shows it, season included
kind: series                   # movie | series
verdict: watch                 # watch | skip | depends
take: "One line, ≤160 chars: who it's for and why, in the site's candid voice."
sources: ["https://…", "https://…"]
checked: "YYYY-MM-DD"          # today
```

- **watch** — reviews are broadly positive.
- **skip** — broadly negative.
- **depends** — mixed, or good only for a specific taste (say which in the take).

## Guardrails (non-negotiable)

- Never invent a review, a quote or a score. Every verdict must follow from the cited sources.
- **Open every source with `WebFetch` in this run** and confirm it reviews this exact title
  and, for a series, this exact season (a season-1 review doesn't support a season-2 verdict;
  a same-named film from another year doesn't count). Search-result snippets are not sources.
- Fewer than 2 reviews found → no verdict file; list the title in the PR body as skipped.
- One file per title and kind. A new season is a new title with its own file; don't reuse season 1's.
- Don't edit anything outside `src/content/watch-verdicts/`.
- No spoilers beyond the premise.

## Step 3 — Validate and deliver

`npm run build` must pass (the schema checks `take` length, URLs, and duplicate titles).
Branch `verdicts/weekly-YYYY-MM-DD`, commit, push, and `gh pr create`. In the PR body: a
table of title, verdict, take and source links, with **one quoted sentence from each source**
that supports the verdict, so the reviewer can check it quickly. Also list the titles skipped for
lack of reviews.
Never push to `master` or merge. End commit messages with a `Co-Authored-By:` trailer naming
the model that ran.
