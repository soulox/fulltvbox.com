// Testing methodology — single source of truth for the /how-we-test page and the
// per-review trust strip, so figures like "scored on N criteria" never drift.

/** Minimum hands-on test window, in weeks, before a device is scored. */
export const TEST_WEEKS = 2;

/** The fixed criteria every device is evaluated against, so reviews are comparable. */
export const TEST_CRITERIA: { name: string; detail: string }[] = [
  { name: 'Setup & first boot', detail: 'How quickly and painlessly it gets running, account requirements, and bloat.' },
  { name: 'Speed & responsiveness', detail: 'Boot time, app launch times, and how it holds up when multitasking.' },
  { name: 'Picture & sound', detail: '4K HDR playback, Dolby Vision/HDR10+ support, and audio passthrough (Dolby Atmos, DTS).' },
  { name: 'Streaming reliability', detail: 'Buffering and stability over both Wi-Fi and wired Ethernet where available.' },
  { name: 'Interface & ads', detail: 'How clean or cluttered the home screen is and how aggressively it pushes promoted content.' },
  { name: 'Remote & voice', detail: 'Ergonomics, TV controls, and voice/assistant accuracy.' },
  { name: 'App & ecosystem support', detail: 'Availability of major apps, sideloading, and platform lock-in.' },
  { name: 'Long-term software support', detail: 'Update history and how well older models age.' },
  { name: 'Value', detail: 'What you get for the price versus the alternatives.' },
];

/** Number of criteria — derived so copy stays in sync with the list above. */
export const CRITERIA_COUNT = TEST_CRITERIA.length;

/** What each score band means. Scores are relative to a device's price and category. */
export const SCORING_BANDS: { range: string; meaning: string }[] = [
  { range: '4.5–5.0', meaning: 'Class-leading; buy with confidence.' },
  { range: '4.0–4.4', meaning: 'Very good, with minor trade-offs.' },
  { range: '3.5–3.9', meaning: 'Solid but compromised; right only for specific buyers.' },
  { range: 'Below 3.5', meaning: 'Notable flaws; proceed with caution.' },
];
