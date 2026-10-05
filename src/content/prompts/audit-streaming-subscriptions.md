---
title: "Audit Your Streaming Subscriptions: AI Rotation Prompt"
description: "Paste your subscriptions and what you watch; get keep/rotate/cancel verdicts and a 6-month plan that cuts the bill. Tested example inside."
publishDate: "2026-10-05"
group: save-money
prompt: |
  Audit my streaming subscriptions and build a 6-month rotation plan that cuts my bill without losing what I watch.

  My subscriptions (service, plan, monthly price):
  {subscriptions}

  What I actually watch, and when new seasons are due:
  {watching}

  Rules: {rules}

  1. Give each service a verdict: KEEP, ROTATE, or CANCEL, with one line of reasoning.
  2. Build a month-by-month table for the next 6 months showing which services are active.
  3. Show my current monthly cost, the new average monthly cost, and the yearly saving.
  Use only the prices I gave you. Don't look up or assume other prices.
variables: [subscriptions, watching, rules]
tools: [chatgpt, claude, copilot]
testedOn: { model: "Claude Opus 5.5", date: "2026-10-05" }
related: [every-streaming-price-hike-2026-tracked, real-cost-of-cutting-the-cord-2026, streaming-bundles-worth-it-2026]
---

## Example input

- **subscriptions:** Netflix Standard $17.99 · Max Standard $18.49 · Disney+ Premium $18.99 · Apple TV+ $12.99 · Peacock Premium $10.99 · Paramount+ Essential $7.99
- **watching:** Netflix: always something on, used weekly · Max: one show returns in January · Disney+: kids watch a few times a week · Apple TV+: Slow Horses usually returns in the autumn · Peacock: only for one football team on Sundays, Sept–Jan · Paramount+: haven't opened it in 3 months
- **rules:** the kids' service has to stay; I'm fine binge-watching a show a month after it airs

## Example output

> **Verdicts**
> - **Netflix: KEEP.** Used weekly; it's your default service.
> - **Disney+: KEEP.** Your rule says the kids' service stays.
> - **Max: ROTATE.** Turn it on in January for the returning show, binge it, and cancel.
> - **Apple TV+: ROTATE.** Sign up for one month once the new season has fully aired.
> - **Peacock: ROTATE.** Keep it September–January for football, then pause it.
> - **Paramount+: CANCEL.** Three months unused.
>
> | Month | Netflix | Disney+ | Peacock | Max | Apple TV+ | Total |
> |---|---|---|---|---|---|---|
> | Oct | ✓ | ✓ | ✓ | | | $47.97 |
> | Nov | ✓ | ✓ | ✓ | | ✓ | $60.96 |
> | Dec | ✓ | ✓ | ✓ | | | $47.97 |
> | Jan | ✓ | ✓ | ✓ | ✓ | | $66.46 |
> | Feb | ✓ | ✓ | | | | $36.98 |
> | Mar | ✓ | ✓ | | | | $36.98 |
>
> **Current:** $87.44/month. **New average:** $49.55/month. **Saving:** about **$37.89/month, or $454.68/year**.
>
> Your fixed floor is now Netflix + Disney+ at $36.98. The next saving would come from a cheaper tier or a bundle for those two. I haven't priced those because you asked me to use only your numbers.

## Tips

- Paste prices straight from your bank statement. **Telling the AI not to look prices up** stops it from mixing in out-of-date numbers.
- Re-run this every January and September, when most price rises and new seasons land. Our [price hike tracker](/guides/every-streaming-price-hike-2026-tracked) lists what changed this year.
- Copilot with Microsoft 365 can turn the table into a spreadsheet you can update yourself.
