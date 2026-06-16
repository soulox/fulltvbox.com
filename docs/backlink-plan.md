# Backlink / Off-Page Plan (Tier 6)

Backlinks and brand mentions are the dominant off-page driver of both Google rank and
how often AI engines cite the site. This is ongoing, manual outreach work — it can't be
done in code. Use this as the playbook.

## Prerequisite (do this first)

**Domain is now live** (`fulltvbox.com` resolves and serves, 2026-06). The remaining gate is
**indexing**: verify the property in Google Search Console + Bing Webmaster Tools, submit
`https://fulltvbox.com/sitemap-index.xml`, and request indexing of the key pages. Begin
outreach only once pages are getting indexed — links pointing at un-indexed pages waste their
freshness.

## Linkable assets we already have

Lead with these — people link to *resources*, not to "please link to my review":

- **`/cost-calculator`** — an interactive tool. Tools are the strongest natural link magnet.
- **`/compare`** + **`/devices.json`** — a side-by-side spec comparison backed by a
  machine-readable feed. Pitch `/devices.json` as a citable data source.
- **`/cut-the-cord`** — a cord-cutting hub that bundles calculator + services + hardware.
- **`/best-picks`** and the deep, FAQ-rich reviews — reference-grade buying content.

## Highest-leverage plays (in priority order)

1. **Annual "Cost of Cutting the Cord" data study.** Turn the calculator/services data into a
   short, dated report with a headline stat (e.g. average monthly streaming spend vs. cable).
   Data studies earn journalist links better than anything else. Publish it as a guide and
   pitch it to cord-cutting and personal-finance writers.
2. **Journalist requests (HARO / Connectively / Featured.com).** Answer queries from writers
   doing "best streaming device 2026" roundups; offer a quotable expert take + link. Low effort,
   high-authority links.
3. **Resource-page & roundup inclusion.** Search `intitle:"best streaming device"`,
   `"cord cutting" + "resources"`, etc.; email authors with a specific reason their piece is
   improved by linking a relevant review/tool.
4. **Tool directories.** Submit `/cost-calculator` to free-tool and "useful tools" directories
   and subreddits that collect tools.

## Communities (participate genuinely; don't spam)

Be a useful contributor first; links/mentions follow. Relevant homes:

- Reddit: r/cordcutters, r/AndroidTV, r/Roku, r/fireTV, r/htpc, r/PleX — and for the Pi
  tutorials: r/selfhosted, r/raspberry_pi, r/HomeServer.
- Forums: AVS Forum (streaming/HTPC sections), XDA Developers (Fire TV / Android TV),
  Cord Cutters News community.
- Answer questions on Quora / StackExchange where a specific review or the calculator is the
  best answer.

## Foundational profiles (one-time)

Create branded profiles that allow a website link and feed the homepage Organization `sameAs`
(then add those URLs to `src/data/authors.ts` and the homepage Organization schema):

- X/Twitter, YouTube (short device clips), Pinterest (spec/comparison images), LinkedIn page.
- Submit to Bing Places / niche tech directories.

## Outreach template (roundup / resource pages)

> Subject: quick addition for your "<their article title>"
>
> Hi <name> — your roundup on <topic> is genuinely useful. We just published an independent,
> bench-tested review of the <device> (and a free streaming cost calculator at
> fulltvbox.com/cost-calculator) that your readers comparing options might find handy. No
> obligation — just flagging in case it's a fit. Thanks for the great piece.

Keep it specific, short, and complimentary; one targeted ask beats a mass blast.

## Measure

- Track referring domains in Google Search Console (Links report) and a backlink tool
  (Ahrefs/Semrush free tiers, or Bing Webmaster).
- Watch for **unlinked brand mentions** and email to request a link.
- Re-pitch the data study annually with refreshed numbers.

## Where this connects to the code

- Add real social/profile URLs to `src/data/authors.ts` (`sameAs`) and the homepage
  `Organization` schema once the profiles exist — strengthens entity identity.
- Keep `/devices.json` and the calculator accurate; they're the assets links point to.
