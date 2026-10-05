---
title: "Plan a Family Movie Night: AI Prompt for Every Age"
description: "Balance ages, sensitivities, runtime, and your services to shortlist family films everyone will watch. Copy-ready prompt with a tested example."
publishDate: "2026-10-05"
group: what-to-watch
prompt: |
  Plan a family movie night. Suggest 5 films that work for everyone watching.

  - Ages watching: {ages}
  - Sensitivities to avoid: {sensitivities}
  - Max length: {max_length}
  - Services we have: {services}
  - Films we've already seen and liked: {seen}

  For each film give: title and year, rating, runtime, which of our services it's most likely on (say if it's a service's own original, and say "check" if you're not sure), and one line on what keeps the youngest *and* the oldest watching. Put the safest pick for the youngest viewer first.
variables: [ages, sensitivities, max_length, services, seen]
tools: [chatgpt, claude, gemini, alexa-plus]
testedOn: { model: "Claude Opus 5.5", date: "2026-10-05" }
related: [best-streaming-device-without-ads-2026, streaming-bundles-worth-it-2026]
---

## Example input

- **ages:** 6, 10, and two adults
- **sensitivities:** no scary villains for the 6-year-old, nothing sad about pets
- **max_length:** 1 hour 45 minutes
- **services:** Disney+, Netflix
- **seen:** Encanto, The Mitchells vs. the Machines

## Example output

> 1. **Luca (2021)**, PG, about 1h 35m. Disney+ (Pixar). Gentle stakes and no real villain to scare a 6-year-old. The 10-year-old gets the friendship and the scooter-race plot; adults get the Italian Riviera.
> 2. **Leo (2023)**, PG, about 1h 42m. Netflix original. A class lizard who gives kids advice. Silly enough for 6, and the 10-year-old will recognise every school-life joke.
> 3. **Nimona (2023)**, PG, about 1h 41m. Netflix original. Fast and funny with a shape-shifting hero. It has some action peril, so it's better for the 10-year-old; preview the trailer with the 6-year-old.
> 4. **Elemental (2023)**, PG, about 1h 41m. Disney+ (Pixar). Bright and warm, with no scary villain. The family-pressure storyline gives adults something too.
> 5. **Zootopia (2016)**, PG, about 1h 48m. Disney+. Just over your limit, but a big hit across all ages. One brief "savage animal" scene may be tense for a 6-year-old.
>
> Since you liked *The Mitchells vs. the Machines*, **Leo** and **Nimona** are the closest in tone. Check Zootopia's runtime against bedtime.

## Tips

- Mention specific **sensitivities** (spiders, sad pet endings, loud battles). They matter more than age ratings for young kids.
- Listing films you've **already seen and liked** is the fastest way to get the tone right.
- Ask a follow-up like "make it a double feature with a 15-minute snack break" to plan the whole evening.
