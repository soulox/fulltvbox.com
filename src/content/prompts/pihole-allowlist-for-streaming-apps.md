---
title: "Pi-hole Broke a Streaming App? An AI Allowlist Prompt"
description: "Paste the domains Pi-hole blocked; get allow / keep blocked / test verdicts and exact pihole allow commands. Tested example inside."
publishDate: "2026-10-05"
group: setup-homelab
prompt: |
  Pi-hole broke {app} on my {device}. Symptom: {symptom}.

  Here are the domains Pi-hole blocked from that device in the minute around when it broke (from the Query Log):
  {blocked_domains}

  For each domain:
  - Say what it most likely is (the app's own service, a CDN, ads, analytics/telemetry), and how confident you are.
  - Give a verdict: ALLOW (needed for the app to work), KEEP BLOCKED (safe to block), or TEST (allow it, retry, and block it again if it didn't help).
  Then give me the exact Pi-hole v6 commands for the ALLOW and TEST domains, in the order to try them. Allow as few domains as possible.
variables: [app, device, symptom, blocked_domains]
tools: [claude, chatgpt, ollama]
testedOn: { model: "Claude Opus 5.5", date: "2026-10-05" }
related: [raspberry-pi-pihole-ad-blocker, best-streaming-device-without-ads-2026]
---

## Example input

- **app:** a free ad-supported streaming app
- **device:** Fire TV Stick 4K Max
- **symptom:** the app opens, but every video spins forever
- **blocked_domains:**
  `device-metrics-us.amazon.com` · `imasdk.googleapis.com` · `pubads.g.doubleclick.net` · `dpm.demdex.net` · `app-measurement.com`

## Example output

> | Domain | What it is | Confidence | Verdict |
> |---|---|---|---|
> | `device-metrics-us.amazon.com` | Fire TV usage telemetry to Amazon | High | **KEEP BLOCKED.** It doesn't affect playback. |
> | `imasdk.googleapis.com` | Google's video-ad SDK (IMA). Free ad-supported apps often won't start a video without it | High | **ALLOW.** The most likely cause of endless spinning. |
> | `pubads.g.doubleclick.net` | Google ad server that supplies the ads | High | **TEST.** Some free apps refuse to play until the ad request succeeds. |
> | `dpm.demdex.net` | Adobe analytics identity service | Medium | **KEEP BLOCKED** for now. It occasionally breaks sign-ins, but this app doesn't need one. |
> | `app-measurement.com` | Google/Firebase app analytics | High | **KEEP BLOCKED.** Safe to block. |
>
> **Try in this order:**
> ```bash
> pihole allow imasdk.googleapis.com
> # retry the video; only if it still spins:
> pihole allow pubads.g.doubleclick.net
> ```
> If the second one wasn't needed, remove it with `pihole allow remove pubads.g.doubleclick.net`.
>
> **Expect a trade-off:** a free ad-supported app usually *needs* its ads to load. If you allow these domains, you'll see ads in that app; the alternative is to stop using that app.

## Tips

- Filter the Query Log to **just the broken device** and the **minute it broke** before you paste. A short list gets a far more accurate answer.
- Any AI can mislabel an obscure domain, which is why this prompt uses **TEST** and allows as few domains as possible.
- Running a local model with **Ollama** means your browsing data never leaves the house. That suits a privacy tool like Pi-hole.
- Setting up from scratch? Follow our [Pi-hole on Raspberry Pi tutorial](/tutorials/raspberry-pi-pihole-ad-blocker).
