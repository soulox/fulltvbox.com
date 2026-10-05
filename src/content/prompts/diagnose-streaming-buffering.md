---
title: "Diagnose Streaming Buffering: An AI Troubleshooting Prompt"
description: "A copy-ready prompt that turns your device, network, and speed-test details into ranked buffering causes and fixes. Tested example inside."
publishDate: "2026-10-05"
group: troubleshooting
prompt: |
  Act as a home-network and streaming-device technician. My {device} keeps buffering on {apps}.

  Details:
  - Internet plan: {plan}
  - Speed test on the device itself (or the phone next to it): {speed_test}
  - Connection: {connection}
  - When it happens: {when}
  - What I've already tried: {tried}

  Rank the 3–5 most likely causes for my specific details, most likely first. For each: say why it fits my details, give one test I can do in under 5 minutes to confirm or rule it out, then the fix. Don't suggest anything I've already tried. Finish with the single thing I should do first.
variables: [device, apps, plan, speed_test, connection, when, tried]
tools: [chatgpt, claude, gemini, copilot]
testedOn: { model: "Claude Opus 5.5", date: "2026-10-05" }
related: [why-streaming-keeps-buffering-fix, fire-tv-stick-slow-fixes]
---

## Example input

- **device:** Fire TV Stick 4K Max (2024)
- **apps:** Netflix and YouTube, worst in 4K
- **plan:** 300 Mbps cable
- **speed_test:** 22 Mbps down on the stick, 280 Mbps on my phone in the same room
- **connection:** Wi-Fi, router is in the next room behind the TV wall
- **when:** evenings, about 20 minutes into a show
- **tried:** restarting the stick and the router

## Example output

> **1. Weak Wi-Fi link to the stick (most likely).** Your phone gets 280 Mbps in the same room but the stick gets 22. Your plan and router are fine; the problem is the stick's radio behind the TV and a wall. 4K Netflix wants a steady 15+ Mbps, so 22 Mbps with dips will buffer.
> *Test:* Settings › Network › select your network and check signal strength. Then hold the stick in front of the TV on an HDMI extender and run the speed test again.
> *Fix:* Use the HDMI extender that came in the box, or add an Ethernet adapter. If neither is possible, a mesh point or access point in the TV room will help.
>
> **2. Congested 2.4 GHz band in the evening.** Buffering that starts when the neighbours get home points to interference.
> *Test:* Check whether the stick is on 2.4 GHz or 5 GHz. Many routers use one name for both bands.
> *Fix:* Give the 5 GHz band its own name and join the stick to it.
>
> **3. The stick overheating after ~20 minutes.** It fits your "20 minutes in" timing.
> *Test:* Feel the stick after a show. If it's too hot to hold comfortably, heat is a factor.
> *Fix:* The extender moves it away from the TV's hot back panel, which also fixes #1.
>
> **Do this first:** fit the HDMI extender and run the speed test again. If you see 100+ Mbps, you're done.

## Tips

- Run the speed test **on the streaming device**, not just your phone. Most of the diagnosis comes from the gap between the two numbers.
- Include *when* it happens. "Evenings" and "after 20 minutes" point the AI to different causes.
- For the full manual walkthrough, see our [buffering fix guide](/guides/why-streaming-keeps-buffering-fix).
