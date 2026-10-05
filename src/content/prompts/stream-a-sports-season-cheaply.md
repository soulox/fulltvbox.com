---
title: "Stream Your Team's Season Cheaply: An AI Planning Prompt"
description: "Map your team's games to the services that carry them, including blackouts and antenna options, and build the cheapest season plan."
publishDate: "2026-10-05"
group: save-money
prompt: |
  I want to watch every {team} game this {season} season as cheaply as possible.

  - Where I live: {location}
  - Services I already pay for: {current_services}
  - I can / can't use an antenna: {antenna}

  If you can search the web, find where this season's games are broadcast or streamed (national TV, local or regional channels, league packages, streaming exclusives) and cite your sources. If you can't search, say so up front, don't guess the rights deals, and give me a checklist of exactly what to look up instead.

  Then build the cheapest plan: which services to have active in which months, with the monthly cost, and note any blackout rules that affect where I live.
variables: [team, season, location, current_services, antenna]
tools: [perplexity, gemini, chatgpt]
testedOn: { model: "Claude Opus 5.5", date: "2026-10-05" }
related: [best-streaming-device-for-live-sports-2026, espn-select-vs-unlimited-2026, real-cost-of-cutting-the-cord-2026]
---

## Example input

- **team:** Atlanta Hawks
- **season:** 2026–27 NBA
- **location:** Atlanta, GA (in-market)
- **current_services:** Netflix, Peacock
- **antenna:** can use an antenna

## Example output

This run was in a chat with web search turned **off**, so the model gave the checklist route. With search on (Perplexity, Gemini, or ChatGPT with search), you get the rights mapped out with links instead.

> I can't search the web in this chat, so I won't guess this season's TV deals. NBA rights changed a lot recently and a wrong guess could cost you money. Here's exactly what to check, in order:
>
> 1. **Local games (most of the schedule).** Find which regional channel or local station has the Hawks' in-market rights this season, and whether it has its own streaming app or subscription. As an in-market fan, this is the single biggest piece.
> 2. **National games.** Check the NBA's national schedule for Hawks games on national broadcast or streaming partners. Note which ones you already have: you pay for **Peacock**, so check whether it carries any NBA games this season.
> 3. **Free over the air.** If any games air on a broadcast network, your antenna covers them for free. Check the FCC DTV reception map for your address.
> 4. **League Pass blackouts.** NBA League Pass blacks out in-market teams, so it's usually **not** the answer for Atlanta-based Hawks fans. Confirm with the blackout checker on NBA.com.
>
> **When you have those answers, paste them back and I'll build the month-by-month plan.** The usual shape is: the local-rights service for the whole season, national services only in months with Hawks games, and the antenna for any broadcast games.

## Tips

- **Turn on web search** for this one. Sports rights change every season, and this prompt depends on current deals.
- The "don't guess, give me a checklist" line stops a model without search from confidently quoting last season's rights.
- Pick hardware that has all the apps: see [Best streaming device for live sports](/guides/best-streaming-device-for-live-sports-2026).
