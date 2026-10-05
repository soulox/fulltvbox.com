---
title: "Fire TV Sideloading Is Getting Blocked in 2026: What's Actually Happening"
description: "Amazon is actively blocking sideloaded apps on Fire TV Sticks and moving future devices to a locked-down OS. Here's what changed, which devices are affected, and what it means if you use Kodi, Plex, or IPTV apps."
publishDate: "2026-07-06"
faq:
  - question: "Is Amazon blocking sideloading on all Fire TV devices?"
    answer: "No — it's split by operating system. Fire OS devices (Android-based, like the Fire TV Stick 4K Max and Fire TV Cube) still allow sideloading, but Fire OS updates now actively disable specific apps flagged for piracy or malware, even ones you already installed. Vega OS devices, starting with the Fire TV Stick 4K Select, never allowed sideloading in the first place — and Amazon has said all future Fire TV Sticks will run Vega OS."
  - question: "Can I still use Kodi or Plex on Fire TV?"
    answer: "Yes, on Fire OS devices. Kodi and the official Plex app aren't piracy tools, so Amazon's crackdown isn't targeting them directly — it's aimed at apps that stream unlicensed content or carry malware. The risk is indirect: as Amazon narrows what a Fire OS update will let sideloaded apps do, and shifts new hardware to Vega OS (which blocks sideloading entirely), the long-term outlook for running Kodi on any Fire TV is shrinking."
  - question: "What is a 'Downloader code' and do I still need it?"
    answer: "Downloader is Amazon's own Appstore app for entering a short numeric code instead of typing a long web address to sideload an APK. It still works on Fire OS devices for legitimate apps. It does nothing on Vega OS devices, since sideloading is disabled at the system level there."
  - question: "Should I buy a new Fire TV Stick now, given the sideloading changes?"
    answer: "If you want to keep the option to sideload, buy a Fire OS model — the Fire TV Stick 4K Max or Fire TV Cube — rather than the cheaper Vega OS-based Fire TV Stick 4K Select. Amazon's own developer documentation signals that future Fire TV Sticks are moving to Vega OS, so the current Android-based lineup may be the last generation with that option at all."
---
---

## The short version

- **What changed:** Amazon has moved from *warning about* sideloaded piracy apps to actively **blocking their installation** on Fire OS (Android-based) Fire TV devices, citing a malware strain it calls "Preflayer."
- **Two different problems, one trend:** Fire OS devices are having specific flagged apps blocked; Vega OS devices — the platform on the [Fire TV Stick 4K Select](/reviews/fire-tv-stick-4k-select-vega-os) and, per Amazon, all future Fire TV Sticks — block sideloading entirely, for every app.
- **Legit apps are mostly fine, for now.** Kodi and the official Plex app aren't the target. The concern is the direction of travel, not an immediate ban on media-center software.
- **If sideloading matters to you,** buy a Fire OS device — the [Fire TV Stick 4K Max](/reviews/fire-tv-stick-4k-max-2024) or [Fire TV Cube](/reviews/fire-tv-cube-3rd-gen) — or look outside the Fire TV ecosystem altogether.

If you've had a sideloaded app suddenly stop working on your Fire Stick, or you've seen headlines about Amazon "killing" sideloading, here's what's actually going on and what it means for cord-cutters who use legitimate tools like Kodi or Plex.

---
---

## What Amazon actually changed

Amazon's crackdown rolled out in stages. In late 2025, Fire OS updates started flagging sideloaded apps identified as streaming unlicensed content — the app would still install, but launching it triggered a warning that it had been "disabled for using or providing access to unlicensed content." That was a soft block: apps that got around the initial detection (often by cloning themselves under a new name) could still slip through.

In February 2026, Amazon closed that loophole and moved to blocking **installation** of flagged apps outright on Fire OS devices, not just disabling them after the fact. Around the same time, Fire OS 8 updates began preventing already-installed sideloaded apps from running at all if they request the `SYSTEM_ALERT_WINDOW` Android permission — the one that lets an app draw an overlay on top of everything else, which is also a permission malware abuses to record your screen or steal credentials.

Then in June 2026, APKTime — a decade-old third-party app store many people used to sideload streaming apps — shut down entirely, citing how hard it had become to keep up with apps constantly changing or getting pulled. That's a separate event from Amazon's own restrictions, but it removed one of the more popular sideloading pipelines at the same time Amazon was tightening its own.

None of this affects the official Amazon Appstore. It's specifically about apps installed from outside it.

---
---

## Which devices are actually affected

This is the part that gets muddled in headlines, so it's worth being precise:

- **Fire OS devices** (Android-based) — the [Fire TV Stick 4K Max](/reviews/fire-tv-stick-4k-max-2024), the [Fire TV Cube](/reviews/fire-tv-cube-3rd-gen), and older Fire TV hardware — **still support sideloading**. What's new is that Amazon will now actively block or disable *specific apps* it flags as piracy tools or malware carriers, even ones you already installed. General-purpose sideloading itself isn't gone on these devices.
- **Vega OS devices** — starting with the [Fire TV Stick 4K Select](/reviews/fire-tv-stick-4k-select-vega-os) — **never supported sideloading**, full stop. Vega OS only installs apps from the Amazon Appstore, by design, not as a new restriction. Reports on the UK rollout put the Vega OS Appstore catalog at roughly 3,000 apps, versus roughly 40,000 on the Fire OS Appstore — a real gap if you rely on niche or regional apps.
- **The direction matters more than today's snapshot.** Amazon's own developer documentation reportedly states that all future Fire TV Sticks will run Vega OS. If that holds, the Fire TV Stick 4K Max may end up being one of the last Android-based, sideload-capable Fire TV Sticks Amazon sells.

If you're deciding what to buy today, see our full breakdown of the [Fire TV Stick 4K Select's Vega OS trade-offs](/reviews/fire-tv-stick-4k-select-vega-os) and how Fire TV compares to [Android TV and Roku](/guides/android-tv-vs-fire-tv-vs-roku) for openness generally.

---
---

## Why Amazon says it's doing this

Amazon points to a specific malware strain, which it has referred to as "Preflayer," found in sideloaded piracy apps. According to Amazon, it can record what's on your screen, steal login credentials, and commit ad fraud by faking ad impressions in the background.

That's a real security problem — a huge share of "free movies and live TV" APKs floating around have always doubled as malware or ad-fraud vehicles. Amazon also has an obvious commercial and legal interest in cutting down piracy on its hardware. Both things can be true — the security risk is real, and closing it also happens to lock the platform down further.

---
---

## What's not worth chasing

- **Hunting for a workaround to keep piracy apps running.** Beyond the legal risk of unlicensed streaming, the apps Amazon is targeting are disproportionately the ones bundling the malware it's warning about. If an app's whole pitch is "free access to every channel," treat the blocking as a signal, not an inconvenience to route around.
- **Buying old, unopened Fire TV Stick stock hoping to dodge Vega OS forever.** Fire OS devices already on shelves still work as they do today, but Amazon controls the software updates — it can tighten what sideloaded apps are allowed to do on Fire OS at any time, the same way it just did in February.
- **Assuming Kodi or Plex are next.** They aren't piracy tools, and nothing in Amazon's public statements targets them. Don't let general "sideloading is being killed" headlines convince you your legitimate media-center setup is on a countdown — just budget for the platform getting more locked down over time, not less.

---
---

## What to actually do

If you sideload legitimate apps — Kodi, Plex clients, a niche streaming app not yet in the Appstore — the Downloader app (Amazon's own Appstore tool for entering a short code instead of a long URL) still works exactly as before on any Fire OS device. Nothing has changed for you day-to-day unless the specific app you use gets flagged.

If sideloading is a hard requirement, buy accordingly: the [Fire TV Stick 4K Max](/reviews/fire-tv-stick-4k-max-2024) keeps Android and sideloading for $20 more than the Select, and the [Fire TV Cube](/reviews/fire-tv-cube-3rd-gen) does too. If you want a platform that isn't tied to Amazon's roadmap at all, the [NVIDIA Shield TV Pro](/reviews/nvidia-shield-tv-pro-2025) is Android TV-based and has a long track record of staying sideload-friendly, and a [Raspberry Pi running Kodi](/tutorials/kodi-raspberry-pi) sidesteps the whole question — it's your own hardware and your own OS.

The honest read: this isn't the end of sideloading on Fire TV today, but it is Amazon narrowing the path — flagged apps get shut down on current hardware, and new hardware is heading toward a platform that never allowed it. If openness matters to your setup, plan around that trend now rather than after your device stops cooperating.

---
---

## FAQ

- **Is all sideloading blocked?** No — only on Vega OS devices by design. Fire OS devices still allow it; Amazon is blocking specific flagged apps, not the feature itself.
- **Will Kodi or Plex stop working?** Not based on anything Amazon has said — they aren't piracy apps. The bigger risk is Amazon's hardware roadmap moving toward Vega OS over time.
- **Do I still need a Downloader code?** Yes, on Fire OS devices, for anything you sideload. It doesn't work on Vega OS at all.
- **What should I buy if I need sideloading?** A Fire OS device like the Fire TV Stick 4K Max or Fire TV Cube, or a non-Amazon platform like the NVIDIA Shield TV Pro.
