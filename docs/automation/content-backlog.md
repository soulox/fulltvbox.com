# Content Backlog — Guide Topics

A prioritized queue of **guide** topics the site should cover but doesn't yet. The
[weekly content agent](weekly-content-agent.md) reads this file and, when nothing fresh
and hot is trending, drafts the highest-priority uncovered item here instead of skipping
the week. The agent also grooms this file each run (see the brief). Humans can add,
reorder, or prune at any time.

## Rules

- **Guides only.** Device *reviews* require hands-on testing and stay human-authored, so
  review ideas do not belong here.
- **One item per line**, in this format:

  ```
  - [P1] <topic / angle> — category: <guide-category-id> — intent: <search query / why> — <optional note>
  ```

- **Category** must be one of the seven guide categories used in frontmatter:
  `buying-guides`, `comparisons`, `cord-cutting`, `troubleshooting`, `ai-llm`,
  `basics-setup`, `whats-new`.
- **Priority tiers:** `P1` = high intent / high opportunity · `P2` = solid evergreen ·
  `P3` = nice-to-have. The agent picks the highest-priority item; ties break top-first.
- **Keep it uncovered.** Before adding or drafting an item, confirm it isn't already in
  `src/content/guides/` (or `reviews/` / `tutorials/`) at the same angle.

## Backlog

- [P1] Fire TV remote not working / won't pair — category: troubleshooting — intent: "fire tv stick remote not working" — very high volume; link the Fire TV reviews
- [P1] How much internet speed do you need to stream 4K — category: basics-setup — intent: "internet speed for 4k streaming" — evergreen, high volume
- [P1] Best streaming device for live sports 2026 — category: buying-guides — intent: "best streaming device for sports" — high intent, seasonal; link Shield/Fire/Apple reviews
- [P1] Apple TV 4K vs NVIDIA Shield: which premium box to buy — category: comparisons — intent: "apple tv vs nvidia shield" — both devices are reviewed on-site
- [P1] No sound on your streaming device: HDMI & Atmos audio fixes — category: troubleshooting — intent: "streaming device no sound fix" — evergreen troubleshooting

- [P2] Roku vs Google TV: which platform is right for you — category: comparisons — intent: "roku vs google tv" — link Roku + Chromecast/Google TV reviews
- [P2] Fire TV Stick 4K vs 4K Max: is the upgrade worth it — category: comparisons — intent: "fire tv 4k vs 4k max" — both reviewed
- [P2] Best streaming device for Kodi 2026 — category: buying-guides — intent: "best device for kodi" — link Shield/Onn/Xiaomi reviews
- [P2] Streaming device vs smart TV: do you still need a box — category: basics-setup — intent: "streaming stick vs smart tv" — evergreen explainer
- [P2] How to watch live sports without cable in 2026 — category: cord-cutting — intent: "watch sports without cable" — ties into services data
- [P2] Streaming device keeps restarting or shows a black screen: fixes — category: troubleshooting — intent: "streaming device black screen fix" — evergreen
- [P2] Best streaming device with Ethernet for rock-solid 4K — category: buying-guides — intent: "streaming device with ethernet" — link Cube/Ultra/Google TV Streamer/Onn reviews

- [P3] How to set up a VPN on a Fire TV or Google TV device — category: basics-setup — intent: "vpn on fire tv" — how-to; no product fabrication
- [P3] What is ATSC 3.0 (NextGen TV) and do you need it — category: basics-setup — intent: "what is atsc 3.0" — explainer
- [P3] Best mini PC for local AI in 2026 — category: ai-llm — intent: "best mini pc for local llm" — distinct from the Raspberry Pi LLM tutorial
- [P3] Cheapest way to stream everything in 2026 — category: cord-cutting — intent: "cheapest way to stream" — ties into cost-calculator / services

- [P2] Every 2026 streaming price hike, tracked — category: cord-cutting — intent: "streaming price increases 2026" — ties into cost-calculator and real-cost-of-cutting-the-cord-2026; verify each price/date at write-time, sources conflicted on effective dates as of 2026-07-08
- [P3] Cloud gaming on your TV box: Xbox Game Pass and GeForce Now without a console — category: whats-new — intent: "xbox game pass on google tv" — Xbox Game Pass is rolling out to Google TV devices in 2026; not covered by any existing guide

- [P2] Best phone-carrier streaming perks in 2026: Verizon vs T-Mobile vs AT&T — category: cord-cutting — intent: "verizon streaming perks" / "t-mobile netflix included" — real savings but plan-dependent; explain the fine print so readers don't overpay on the phone plan to get a "free" app
- [P3] ESPN Select vs ESPN Unlimited: which tier do you actually need — category: comparisons — intent: "espn select vs unlimited" — surfaced while researching the Disney+/Hulu/ESPN bundle guide; no existing guide covers the ESPN tiers
- [P2] Fox's $22B acquisition of Roku: what it means for your Roku device — category: whats-new — intent: "fox buying roku what happens to my device" — announced June 15, 2026, deal expected to close H1 2027; Roku says devices/platform stay standalone for now, but readers are actively asking whether to still buy Roku hardware; verify deal status hasn't changed at write-time
- [P2] Plex vs Jellyfin on unRAID/Synology NAS vs Raspberry Pi: picking your self-hosting hardware — category: buying-guides — intent: "best hardware for jellyfin plex server" — natural follow-up to the Plex-vs-Jellyfin software guide; covers device/NAS choice rather than the Plex-vs-Jellyfin software decision itself
- [P3] Jellyfin setup tutorial for Raspberry Pi — category: n/a (tutorial, not guide — flagging for human authors) — intent: "install jellyfin raspberry pi" — site has a Plex Pi tutorial and Kodi Pi tutorial but no Jellyfin one; the new Plex-vs-Jellyfin guide links out to general Jellyfin info since no on-site tutorial exists yet
