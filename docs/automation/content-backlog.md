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
- [P2] Plex vs Jellyfin: which self-hosted media server to run on a Raspberry Pi — category: comparisons — intent: "plex vs jellyfin raspberry pi" — Plex's remote-access paywall (Plex Pass) is pushing self-hosters to Jellyfin; site has Plex/Kodi Pi tutorials but no Plex-vs-Jellyfin comparison
- [P3] Cloud gaming on your TV box: Xbox Game Pass and GeForce Now without a console — category: whats-new — intent: "xbox game pass on google tv" — Xbox Game Pass is rolling out to Google TV devices in 2026; not covered by any existing guide
- [P2] Is the Disney+/Hulu/ESPN bundle still worth it after the September 2026 price hikes — category: cord-cutting — intent: "disney plus hulu espn bundle worth it" — ESPN (Sep 17) and Disney+/Hulu (Sep 23) both just raised prices; re-run the bundle-vs-separate math from streaming-bundles-worth-it-2026.md now that all three are pricier
- [P3] Streaming price-hike alerts: how to actually cancel and rebundle without losing your watchlist/profile data — category: basics-setup — intent: "cancel streaming service keep watchlist" — surfaced while researching 2026 streamflation coverage; practical follow-through piece for readers reacting to a hike

- [P2] Best phone-carrier streaming perks in 2026: Verizon vs T-Mobile vs AT&T — category: cord-cutting — intent: "verizon streaming perks" / "t-mobile netflix included" — real savings but plan-dependent; explain the fine print so readers don't overpay on the phone plan to get a "free" app
- [P3] ESPN Select vs ESPN Unlimited: which tier do you actually need — category: comparisons — intent: "espn select vs unlimited" — surfaced while researching the Disney+/Hulu/ESPN bundle guide; no existing guide covers the ESPN tiers

- [P2] New Fire TV Stick and Roku devices reportedly coming for holiday 2026 — category: whats-new — intent: "new fire tv stick 2026" / "new roku device 2026" — both Roku and Amazon filed new remote controls with the FCC in August 2026, hinting at holiday-season hardware; wait for an official announcement before writing, no speculating on specs or price
- [P3] Amazon's Fire OS 16 (Android 16) update: what's changing on Fire TV — category: whats-new — intent: "fire os 16 update fire tv" — Amazon has begun notifying app developers of a new Fire OS 16 platform ahead of a new TV generation; write once the update reaches real devices with confirmed details
- [P3] Fox's bid for Roku: what it could mean for your streaming box — category: whats-new — intent: "fox roku acquisition" — Fox reportedly pursuing Roku (and Vizio), which together with Fire TV controls roughly half of US streaming devices; hold until deal terms are confirmed, avoid speculating on ad/content changes
- [P2] Is Apple TV+ still worth it after the 2026 price hike — category: cord-cutting — intent: "is apple tv+ worth it 2026" / "apple tv+ price increase" — Apple raised Apple TV+ from $12.99 to $14.99/mo (and Apple One accordingly) on Aug 28, 2026; the streaming-device-price-hikes-2026 guide covers the hike briefly but a dedicated value breakdown is a distinct angle
- [P2] Roku Ultra vs Fire TV Cube 2026: which flagship streaming box is still worth the higher price — category: comparisons — intent: "roku ultra vs fire tv cube 2026" — both jumped 40%+ in the 2026 memory-chip-driven price hikes; distinct from the general android-tv-vs-fire-tv-vs-roku platform guide, both devices already reviewed on-site
- [P3] Onn 4K Pro sold out and scalped: how to actually buy one at retail price — category: buying-guides — intent: "onn 4k pro sold out" / "onn 4k pro scalpers" — Walmart's ~$60 Onn 4K Pro has been selling out with resellers flipping it near double retail; distinct from the price-hikes guide's brief mention
- [P2] Are annual streaming plans worth it in 2026 — category: cord-cutting — intent: "streaming annual plan vs monthly" — surfaced while tracking the 2026 price hikes; annual plans often escape increases (Apple TV+ held $99.99 through its 2025 hike) but lock in 12 months — needs honest break-even math
- [P3] Streaming stick won't fit behind your TV: HDMI extenders and clearance fixes — category: troubleshooting — intent: "streaming stick won't fit hdmi" — Roku is currently giving Streaming Stick owners a free HDMI extender via my.roku.com/hdmi; verify the program is still live at write-time
- [P3] Apple TV 4K next-gen: what's rumored and whether to wait — category: whats-new — intent: "new apple tv 2026" — a hardware refresh is widely expected later in 2026; must be framed as rumored, no fabricated specs or dates
- [P2] HDR10+ Advanced arrives on Prime Video — category: whats-new — intent: "HDR10+ Advanced" / "what is HDR10+ Advanced" — launched August 2026 on Prime Video for select Samsung 2026 TVs with per-region dynamic tone mapping; the existing HDR explainer (4k-hdr-explained.md) only covers HDR10/HDR10+/Dolby Vision, not the new Advanced spec
- [P3] Next-gen Apple TV 4K ("Apple TV Pro") rumors — category: whats-new — intent: "apple tv pro" / "new apple tv 4k 2026" — rumored faster chip, next-gen Siri, possible Apple Intelligence support, Wi-Fi 7; no official Apple announcement as of Aug 2026, so frame strictly as rumored/unconfirmed
- [P3] AI-generated TV channels are showing up on streaming platforms — category: whats-new — intent: "AI generated TV channel" — Roku added an all-AI-content channel (Fairground AI) to The Roku Channel in August 2026; a novel-but-real trend worth explaining, not yet covered anywhere on-site
- [P1] NFL Sunday Ticket 2026: price, how to get it, and cheaper alternatives — category: cord-cutting — intent: "nfl sunday ticket price 2026" — seasonal, ties into the live-sports device guide; verify the current Sunday Ticket / Primetime Channels price at write-time (was ~$378 for returning subscribers in 2025)
- [P2] Fox Sports app is shutting down on Roku, Fire TV, Google TV & Apple TV: what to do instead — category: whats-new — intent: "fox sports app shutting down" — Fox is consolidating its standalone app into FOX One; not covered by any existing guide
- [P3] Best streaming device for MLB.TV and NBA League Pass — category: buying-guides — intent: "best device for mlb tv nba league pass" — distinct sports angle from the NFL-focused live-sports device guide
- [P2] Fox's $22B acquisition of Roku: what it means for your Roku device — category: whats-new — intent: "fox buying roku what happens to my device" — announced June 15, 2026, deal expected to close H1 2027; Roku says devices/platform stay standalone for now, but readers are actively asking whether to still buy Roku hardware; verify deal status hasn't changed at write-time
- [P2] Plex vs Jellyfin on unRAID/Synology NAS vs Raspberry Pi: picking your self-hosting hardware — category: buying-guides — intent: "best hardware for jellyfin plex server" — natural follow-up to the Plex-vs-Jellyfin software guide; covers device/NAS choice rather than the Plex-vs-Jellyfin software decision itself
- [P3] Jellyfin setup tutorial for Raspberry Pi — category: n/a (tutorial, not guide — flagging for human authors) — intent: "install jellyfin raspberry pi" — site has a Plex Pi tutorial and Kodi Pi tutorial but no Jellyfin one; the new Plex-vs-Jellyfin guide links out to general Jellyfin info since no on-site tutorial exists yet
- [P2] Fox Sports app shutting down — what to use instead on Roku/Fire TV/Google TV — category: troubleshooting — intent: "fox sports app shutting down what to watch instead" — Fox is discontinuing the standalone Fox Sports app across streaming devices in favor of the unified FOX One service; surfaced while researching the Fox-Roku acquisition guide, ties into it but is a distinct troubleshooting angle
- [P2] Fox Sports app shutting down on streaming devices — what FOX One means for cord-cutters — category: whats-new — intent: "fox sports app discontinued" / "fox one streaming" — Fox Corp is retiring its standalone Fox Sports app on Roku, Fire TV, Google TV, and Apple TV in favor of the centralized FOX One service; verify the exact shutdown date at write-time, no existing guide covers it
- [P3] TCL's own Google TV push on its smart TVs: do you still need a separate streaming box — category: whats-new — intent: "tcl google tv vs roku tv" — surfaced while researching platform news; no existing guide compares a built-in smart-TV OS against an add-on streaming stick from this angle
- [P3] Amazon's new Fire TV Stick 4K (Vega OS, USB power) replaces the Select and Plus — what buyers should know — category: whats-new — intent: "fire tv stick 4k vega os 2026" — Amazon discontinued the Fire TV Stick 4K Select and Plus around Sept 30, 2026 for a new Vega OS stick; site reviews the original Vega OS Select but not this specific hardware refresh — verify model naming/specs at write-time
