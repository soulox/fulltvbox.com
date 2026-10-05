---
title: "Build a Watchlist From Shows You Love: AI Prompt"
description: "Turn your favourite shows into a ranked watchlist that explains each pick, so you stop starting shows you abandon. Tested example inside."
publishDate: "2026-10-05"
group: what-to-watch
prompt: |
  Build me a watchlist of 8 shows based on what I already love.

  Shows I loved, and what I loved about each:
  {favorites}

  Shows I quit, and why:
  {quit}

  First, in 2–3 sentences, describe the pattern in my taste. Then list 8 shows ranked by how confident you are I'll finish them. For each: title, network or original service, number of seasons, and which of my favourites it's closest to and why. Include at least 2 that are under 3 seasons so I can finish them quickly. Don't include anything I listed.
variables: [favorites, quit]
tools: [claude, chatgpt, gemini]
testedOn: { model: "Claude Opus 5.5", date: "2026-10-05" }
related: [streaming-bundles-worth-it-2026, is-cutting-the-cord-worth-it-2026]
---

## Example input

- **favorites:** *Mr. Robot* (paranoia, an unreliable narrator) · *Halt and Catch Fire* (tech history, characters who grow) · *Station Eleven* (quiet, hopeful, beautifully made)
- **quit:** *Westworld* after season 2 (too convoluted) · *The Walking Dead* (repetitive)

## Example output

> **Your pattern:** you like character-driven stories with a strong point of view, often about technology or society under strain, as long as the plot stays readable. You drop shows that keep up mystery for its own sake or repeat the same structure.
>
> 1. **Severance**, Apple TV+, 2 seasons. Closest to *Mr. Robot*: a mind-bending premise, but it answers enough questions each season to avoid your Westworld problem.
> 2. **Silo**, Apple TV+, 2+ seasons. Closest to *Station Eleven*: a society after collapse, slow-burn and well made, with a clear central mystery.
> 3. **Mrs. Davis**, Peacock, 1 season (finishable). An unhinged satire about an all-powerful AI. Strange, but its story ends.
> 4. **Devs**, FX/Hulu, 1 limited season (finishable). Closest to *Halt and Catch Fire* crossed with *Mr. Robot*: a quiet, beautiful thriller about a tech company.
> 5. **Silicon Valley**, HBO/Max, 6 seasons. Closest to *Halt and Catch Fire*, played for laughs: a startup's whole arc from garage to IPO chaos. Easy to finish because each season resolves.
> 6. **Black Mirror**, Netflix, anthology. Pick episodes, not seasons; start with "San Junipero" for the hopeful side.
> 7. **Mythic Quest**, Apple TV+, 4 seasons. A lighter pick about tech workplaces, with the character growth you liked in *Halt*.
> 8. **The Leftovers**, HBO/Max, 3 seasons. Lower confidence: it gets mysterious, but unlike Westworld it's about grief, not puzzles. It may be the best ending on this list.

## Tips

- Saying **why you quit** a show stops the AI recommending more of what you dislike.
- Ask "which of these are on {your services}?" as a follow-up, and double-check in your app. Catalogues change monthly.
- Want something tonight rather than a list? Use [Pick tonight's show](/ai/prompts/pick-tonights-show).
