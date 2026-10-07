# Weekly Deals Agent — Operating Brief

This is the exact procedure the **weekly deals routine** executes. A Claude Code cloud routine
runs it end-to-end once a week. Treat this file as the source of truth for the automation:
improve the guardrails here rather than in the routine prompt.

**One run = one refresh of the streaming-service deals, delivered as a pull request. Never
push to `master`.**

---

## Why this exists

Hardware deals take care of themselves: `scripts/fetch-prices.mjs` prices every review with an
`asin:` or `bestBuySku:` before each daily build (see README → Deals). Streaming services have
no price API, so their promos are researched by hand. That's this routine's job.

Service deals carry a `checked:` date and **hide themselves 21 days after it** unless
re-confirmed (`src/lib/deals.ts`). If this routine stops running, unconfirmed promos drop off
within three weeks rather than showing stale offers. Re-confirming is as important as adding.

---

## Mission

Each run, in order:

1. **Collect** the current deal files and any open deals PR.
2. **Re-verify** every existing service deal on the service's own site: renew, update, or
   remove it.
3. **Find** new promos for the services in `src/content/services/`, and verify each one.
4. **Check list prices** against `src/content/services/*.yaml` and fix any drift.
5. **Validate** that it builds.
6. **Open (or update) a pull request** for human review.

## Step 1 — Collect

```bash
git fetch origin
ls src/content/deals/
cat src/content/deals/*.yaml
gh pr list --state open --limit 50 --json number,title,headRefName | grep -i 'deals/weekly'
```

If an earlier weekly deals PR is **still open**, don't stack a second one: check out its
branch, rebase it on `origin/master`, do this run's work there, push, and update that PR's
body. Two open deals PRs editing the same files will conflict.

Only work on **service** deals (`service:` key). Leave hardware deals (`device:` key) alone:
live prices cover them, and a hand-written Amazon/Best Buy deal for a device that has an
`asin:`/`bestBuySku:` is overridden by the live price anyway.

## Step 2 — Re-verify existing service deals

For each service deal file, open its offer on the **service's own website** (the deal's `url`,
or the service's `url` in `src/content/services/<slug>.yaml`):

- **Still offered, same terms** → set `checked:` to today's date.
- **Still offered, terms changed** → update `price` / `wasPrice` / `term` / `expires` /
  `promoCode` to match the official page, and set `checked:` to today.
- **Gone, or you can't confirm it** → delete the file. A deal you couldn't load (403, region
  redirect, page down) counts as unconfirmed: delete it and say so in the PR body. It can come
  back next week if it's confirmed then.

## Step 3 — Find new promos

**Discover** with `WebSearch` across deal roundups (e.g. Cord Cutter Weekly's "big list of
streaming deals", CableTV.com, Tom's Guide, Slickdeals) for the last ~2 weeks. Only consider
services that have a file in `src/content/services/` (a deal's `service:` must be one of those
slugs, or the join silently drops it).

**Verify** every candidate on the service's own site before adding it. Aggregators are
regularly wrong: in October 2026 two of them listed Apple TV's trial as 30 days (Apple's site
said 7) and YouTube TV's regular price as $72.99 (YouTube said $82.99). If the official page
can't confirm it, it's a **lead**, not a deal: list it in the PR body and don't add a file.

**Worth listing:** introductory prices, multi-month discounts, discounted annual plans,
bundle promos, and free months tied to a device we review (e.g. Apple TV with an Apple TV 4K).

**Skip:** free trials of 14 days or less (that's a trial, not a deal); offers gated on a
student, AARP, military, or carrier membership; offers that need a separate paid membership
(Walmart+, a phone plan); and anything that isn't available to US subscribers.

### Deal file format

One YAML file per promo in `src/content/deals/`, named `<service-slug>-<short-offer>.yaml`:

```yaml
service: youtube-tv            # a slug from src/content/services/
retailer: New subscribers      # who it's for, or which plan/bundle ("Hulu + Live TV", "Annual plan")
price: 59.99                   # promo price per `period`; 0 for free months
wasPrice: 82.99                # the official regular price for the same plan and period
period: month                  # month | year — what price/wasPrice are per
term: First 2 months           # how long the promo price lasts, plus any key condition
promoCode: SAVE30              # only if the official page or the service's own announcement shows it
url: "https://tv.youtube.com/welcome/"   # the official offer page; never an invented affiliate link
badge: Save $46                # optional, short
expires: "2026-11-16"          # only a published end date; a time → full ISO with offset
checked: "2026-10-07"          # today — the date you confirmed it on the official site
featured: false                # true for at most the 2 strongest promos
```

## Step 4 — Check list prices

While on each official page, compare the regular prices with the service's file in
`src/content/services/` (`monthlyPrice`, `adTierPrice`, `annualPrice`). These feed the cost
calculator, so a stale one gives readers wrong totals. If the official price differs, update
the YAML in this PR and list each change in the PR body. Don't touch other fields.

## Step 5 — Guardrails (non-negotiable)

- **Never fabricate.** Every price, term, code and end date comes from an official page you
  loaded in this run. No guessed regular prices, no "probably still running".
- **Official URLs only.** Don't invent affiliate or tracking links.
- **Don't touch hardware deals, reviews, or `scripts/`.**
- **Privacy constraint.** Never add analytics, ads, trackers, or third-party embeds/scripts.

## Step 6 — Validate

```bash
npm ci        # if dependencies aren't installed
npm run build # must pass astro:content schema validation
```

Don't open a PR on a failing build. Confirm the changes rendered: the built `dist/deals.html`
should list each live service deal.

## Step 7 — Deliver as a pull request

```bash
git checkout -b deals/weekly-YYYY-MM-DD
git add src/content/deals/ src/content/services/
git commit
git push -u origin deals/weekly-YYYY-MM-DD
gh pr create ...
```

Open the PR even when nothing new turned up: re-confirming `checked:` dates keeps current
deals on the site.

**PR body must include:**

- A table of every service deal after this run: service, offer, status (**new**, **renewed**,
  **updated**, **removed**), and the official URL you verified it on.
- **Leads**: promos you found but couldn't confirm officially, with their source links.
- **List-price changes** made to `src/content/services/`, with the official URL.

Don't merge and don't push to `master`. A human reviews and merges; merging deploys.

End commit messages with a `Co-Authored-By:` trailer naming the model that ran.

---

## Notes for maintainers

- **Merge the PR within about two weeks.** Deals the routine renewed only stay live once its
  PR is merged. A deal whose renewal sits unmerged drops off 21 days after its last merged
  `checked:` date.
- To change cadence or retire the automation, update the cloud routine via `/schedule`. This
  brief has no effect on its own; the routine is what runs it.
