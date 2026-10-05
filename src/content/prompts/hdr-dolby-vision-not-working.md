---
title: "HDR or Dolby Vision Not Showing? An AI Diagnosis Prompt"
description: "Check every link (app plan, device, soundbar, cable, TV input) to find why HDR won't turn on. Copy-ready prompt with a tested example."
publishDate: "2026-10-05"
group: troubleshooting
prompt: |
  I'm not getting {format} on my TV and I want to find the weak link.

  My chain, from source to screen:
  - App and plan: {app_and_plan}
  - Streaming device and its video settings: {device_settings}
  - Receiver or soundbar in between (if any): {in_between}
  - HDMI cable: {cable}
  - TV model and which HDMI input: {tv_input}
  - What the TV or app shows instead: {what_i_see}

  Go through the chain link by link. For each link, say whether it can block {format}, and how I can check it from the couch. Then list the 3 most likely culprits for my exact setup in order. Don't assume. If a detail is missing, say what to look up.
variables: [format, app_and_plan, device_settings, in_between, cable, tv_input, what_i_see]
tools: [chatgpt, claude, gemini]
testedOn: { model: "Claude Opus 5.5", date: "2026-10-05" }
related: [4k-hdr-explained, best-streaming-device-4k-hdr-dolby-vision-2026]
---

## Example input

- **format:** Dolby Vision
- **app_and_plan:** Netflix Standard plan
- **device_settings:** Apple TV 4K, format set to 4K SDR, Match Range on
- **in_between:** soundbar with HDMI passthrough
- **cable:** the one that came with the soundbar
- **tv_input:** LG OLED, HDMI 2
- **what_i_see:** Netflix shows "HD", no Dolby Vision badge

## Example output

> **Link by link:**
> - **App and plan: blocking.** Netflix only streams Dolby Vision and 4K on its *Premium* plan. Standard is 1080p, which matches the "HD" you're seeing. *Check:* Account › Plan details.
> - **Device settings: fine as set.** 4K SDR with Match Range lets the Apple TV switch to Dolby Vision for content that has it. That's the recommended setup.
> - **Soundbar passthrough: can block it.** Many soundbars pass HDR10 but not Dolby Vision, or only on one input. *Check:* the soundbar's spec sheet for "Dolby Vision passthrough".
> - **Cable: possible.** Older bundled cables may not carry 4K HDR reliably. *Check:* swap in a cable labelled Premium High Speed or Ultra High Speed.
> - **TV input: possible.** LG TVs need "HDMI Ultra HD Deep Colour" turned on for that input. *Check:* Settings › General › Devices › HDMI Settings.
>
> **Most likely culprits, in order:**
> 1. Your Netflix plan (this alone explains "HD").
> 2. Soundbar passthrough.
> 3. Deep Colour turned off on HDMI 2.
>
> Test 2 and 3 for free by plugging the Apple TV straight into the TV and opening Dolby Vision content in Apple TV+ or Disney+.

## Tips

- Give the AI **what the screen shows instead** ("HD", "HDR10", no badge). That's the best clue.
- Testing with a direct device-to-TV connection rules out the soundbar and cable in one go.
- New to the formats? Read [4K HDR explained](/guides/4k-hdr-explained).
