---
title: "Match a Live TV Service to Your Channels: AI Prompt"
description: "Paste each live TV service's lineup and your must-have channels; get the cheapest service or combo that covers them. Tested example inside."
publishDate: "2026-10-05"
group: save-money
prompt: |
  Find the cheapest way to get the channels I actually watch.

  My must-have channels: {must_have}
  Nice-to-have channels: {nice_to_have}
  My ZIP code (for local channels): {zip}

  Here are the current lineups and prices I copied from each service's own website:
  {lineups}

  Using ONLY the lineups and prices above:
  1. Make a table: must-have channels down the side, services across the top, ✓ or ✗ in each cell.
  2. Name the cheapest single service that covers every must-have, if one exists.
  3. If none does, find the cheapest combination, including free options like an antenna for local channels.
  4. List which nice-to-haves each option adds.
  If a channel's availability depends on my ZIP code, flag it rather than assume.
variables: [must_have, nice_to_have, zip, lineups]
tools: [claude, chatgpt, perplexity]
testedOn: { model: "Claude Opus 5.5", date: "2026-10-05" }
related: [is-cutting-the-cord-worth-it-2026, real-cost-of-cutting-the-cord-2026, espn-select-vs-unlimited-2026]
---

## Example input

The service names and lineups below are made up for this example. Real lineups change often, so always paste the current ones from each service's site.

- **must_have:** ESPN, CNN, HGTV, local NBC
- **nice_to_have:** Food Network, FX
- **zip:** 30301
- **lineups:**
  - *Service A, $82.99/mo:* ABC, CBS, NBC, FOX (local), ESPN, CNN, FX, Food Network, HGTV
  - *Service B, $40/mo:* CNN, HGTV, Food Network, FX (no sports, no locals)
  - *Service C, $45/mo:* ESPN, FX (sports-focused)
  - *ESPN direct, $29.99/mo:* ESPN

## Example output

> | Must-have | A ($82.99) | B ($40) | C ($45) | ESPN direct ($29.99) |
> |---|---|---|---|---|
> | ESPN | ✓ | ✗ | ✓ | ✓ |
> | CNN | ✓ | ✓ | ✗ | ✗ |
> | HGTV | ✓ | ✓ | ✗ | ✗ |
> | Local NBC | ✓* | ✗ | ✗ | ✗ |
>
> *Service A lists NBC as "local", so check it's carried in ZIP 30301.
>
> **Cheapest single service:** Service A at **$82.99**. It's the only one with all four, and it adds both nice-to-haves.
>
> **Cheapest combination:** Service B ($40) + ESPN direct ($29.99) + an antenna for NBC (one-off cost, no monthly fee) = **$69.99/month**, which is **$13/month less** than Service A. You keep Food Network and FX through Service B.
>
> **Catch:** the combination depends on getting NBC with an antenna. If you're far from the transmitter, Service A is the safe choice. Check your address on the FCC's DTV reception map before deciding.

## Tips

- The key line in this prompt is **"using ONLY the lineups and prices above"**. AI models often have out-of-date channel lineups, so give it the current ones.
- Perplexity can collect the lineups for you with sources, but check them against each service's own channel-lookup page.
- Sports fans: see [ESPN Select vs Unlimited](/guides/espn-select-vs-unlimited-2026) before choosing ESPN direct.
