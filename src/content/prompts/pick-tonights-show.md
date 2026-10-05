---
title: "Pick Tonight's Show From Your Services: AI Prompt"
description: "Stop scrolling: get 4 picks from only the services you pay for, matched to your mood and time. Copy-ready prompt with a tested example."
publishDate: "2026-10-05"
group: what-to-watch
prompt: |
  Help me pick something to watch tonight. Only suggest titles that are originals or exclusives of services I already pay for, so I don't hit a paywall: {services}.

  - Who's watching: {who}
  - Mood: {mood}
  - Time I have: {time}
  - Recent things we loved: {loved}
  - Hard no: {avoid}

  Give me exactly 4 picks. For each: title, which of my services it's on, roughly how long an episode or the film runs, and one sentence on why it matches *us* specifically. If you're not sure a title is still exclusive to that service, say so instead of guessing.
variables: [services, who, mood, time, loved, avoid]
tools: [gemini, alexa-plus, chatgpt, claude]
testedOn: { model: "Claude Opus 5.5", date: "2026-10-05" }
related: [streaming-bundles-worth-it-2026, best-streaming-device-without-ads-2026]
---

## Example input

- **services:** Netflix, Apple TV+, Hulu
- **who:** me and my partner
- **mood:** tense and clever, not gory
- **time:** about an hour
- **loved:** Succession, The Night Agent
- **avoid:** horror, anything with a laugh track

## Example output

> 1. **Severance**, Apple TV+ original. Episodes run about 45–55 minutes. You liked Succession's office power games; this is office politics turned into a paranoid mystery, and every episode ends on a hook.
> 2. **Slow Horses**, Apple TV+ original. About 45 minutes. A British spy thriller, as twisty as The Night Agent but funnier and sharper, with no gore.
> 3. **Beef**, Netflix original. About 30–35 minutes, so you could watch two. A road-rage feud that escalates into dark, tense comedy. Good if you want "clever" more than "action."
> 4. **The Bear**, FX series streaming on Hulu in the US. About 30 minutes. Not a thriller, but the most stressful half-hour on TV. It suits Succession fans who liked watching people under pressure.
>
> Where it streams changes by country and over time, so check The Bear in particular if you're outside the US.

## Tips

- On a **Google TV Streamer** or a **Fire TV with Alexa+**, you can say a short version of this prompt to the TV's assistant and it can open the title for you.
- "Hard no" saves the most time. The AI is much better at avoiding things than guessing your taste from one line.
- Paying for services you rarely use? Run the [subscription audit prompt](/ai/prompts/audit-streaming-subscriptions).
