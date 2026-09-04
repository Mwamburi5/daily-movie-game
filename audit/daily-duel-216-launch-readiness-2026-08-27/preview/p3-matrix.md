# P3 — four-mode Preview matrix (Match Cut 216+16, Approval 3)

- **Target** — https://marquee-otlnd4c6f-mwamburi5s-projects.vercel.app
- **Deployment** — `dpl_FTnTRXPKr4V1Hyz8Fu68AfPymr75` (protected Vercel Preview of `main@14a546e`)
- **Run window (UTC)** — 2026-09-03T01:24:55.061Z → 2026-09-03T01:25:51.782Z
- **Daily seed exercised** — `2026-09-02` (browser local date; every daily deal below was independently recomputed in Node from the same `src/lib` functions the bundle ships, then played through the real DOM)
- **Harness** — `p3-matrix.mjs` (Playwright 1.62.1 Chromium, 390×844, cookie jar loaded via `context.addCookies`, request header `x-vercel-skip-toolbar: 1`, `clipboard-read`/`clipboard-write` granted)
- **Machine receipt** — `p3-matrix-preview.json`
- **Run status** — completed with no fatal error

The shipped bundle carries no E2E seams (`matchcut-e2e-*`, `__matchcutProgress`,
`VITE_E2E` are all absent — P2 proves it), so every row below is real play
through the production UI.

## Matrix

| Mode | Load | Successful action | Error recovery | Terminal | Share copy | Screenshot |
|---|---|---|---|---|---|---|
| Daily Puzzle | PASS | PASS | PASS | PASS | PASS | PASS (`p3-daily-terminal.png`) |
| Chronology | PASS | PASS | PASS | PASS | PASS | PASS (`p3-chronology-terminal.png`) |
| Connections | PASS | PASS | PASS | PASS | PASS | PASS (`p3-connections-terminal.png`) |
| Duel | PASS | PASS | PASS | PASS | PASS | PASS (`p3-duel-terminal.png`) |
| Sanitized progress (A + B) | PASS | n/a | n/a | n/a | n/a | PASS (`p3-sanitized-menu-a.png`, `p3-sanitized-menu-b.png`) |

## Fault counts

Collected per browser context: `console` (error + warning), `pageerror`,
`securitypolicyviolation`, `requestfailed` on the deployment origin, and any
same-origin response ≥ 400.

**Whole run: 0 faults.**

Zero in every phase — the four mode runs and both sanitized-progress loads.

## Per-mode notes

### Daily Puzzle

- **Load** — PASS — mode stage rendered; pile top = mission-impossible (matches the seed-derived deal for 2026-09-02)
- **Successful action** — PASS — played A Few Good Men onto Mission: Impossible; pile top advanced and the hand dropped to 6 tickets
- **Error recovery** — PASS — played Fargo onto Mission: Impossible (no shared credit): rejected with the banner "No shared credit · +2", card returned to hand (6 tickets, was 7), penalty applied (Flips 2, score 2, par 11); play continued normally afterwards
- **Terminal** — PASS — Solved (won). Result dialog "Solved — results": Solved! | Solved in 1, par 11 (10 under par) | LOWER IS BETTER | Score 1 vs par 11 | 2 flips · 1 invalid play · combo −1 | DAY 61 · STREAK 1 · BEST 1
- **Share copy** — button read `copied ✓`, captured via clipboard. Exact text:

```
Match Cut · Daily Puzzle
score 1, par 11 (10 under par)
🎬🟩🟩🟩🟩🟩🟩🟩
```

  URL-free: yes; opens `Match Cut · Daily Puzzle`: yes
- **Faults during this mode** — 0 console errors · 0 console warnings · 0 pageerrors · 0 CSP violations · 0 failed same-origin requests
- **Screenshot** — `p3-daily-terminal.png`

### Chronology

- **Load** — PASS — mode stage rendered; anchor = Indiana Jones and the Last Crusade (1989-05-24), matching the seed-derived deal
- **Successful action** — PASS — raised Walk the Line (2005) and dropped it into the correct gap 1: accepted clean ("clean"), reel grew to 3 cards
- **Error recovery** — PASS — placed Whiplash (2014) in gap 0 when gap 1 was correct: the UI revealed the year ("actually 2014"), charged a stroke (Strokes 1) and re-slotted the card to its true position (index 1); the round continued
- **Terminal** — PASS — Cleared. Result dialog "Cleared — results": Cleared! | Final score -2 | LOWER IS BETTER | Score -2 = 1 strokes − 3 credits | 1 stroke · 3 streak credits | DAY 61 · STREAK 1 · BEST -2
- **Share copy** — button read `copied ✓`, captured via clipboard. Exact text:

```
Match Cut · Chronology
score -2 (1 stroke, 3 back)
🎬🟥🟩🟩🟩🟩🟩🟩🟩🟩🟩
```

  URL-free: yes; opens `Match Cut · Chronology`: yes
- **Faults during this mode** — 0 console errors · 0 console warnings · 0 pageerrors · 0 CSP violations · 0 failed same-origin requests
- **Screenshot** — `p3-chronology-terminal.png`

### Connections

- **Load** — PASS — mode stage rendered; the 16 tiles match the baked daily grid for 2026-09-02
- **Successful action** — PASS — selected the four director films and submitted: accepted, the group locked to the solved rail
- **Error recovery** — PASS — submitted a deliberate one-away set (3 from group 1 + 1 from group 2): rejected with "one away — swap one ticket", mistake counted (4 mistakes left → 3 mistakes left), board stayed playable
- **Terminal** — PASS — Solved (won, 1 mistake). Result dialog "Solved — results": MATCH CUT · CONNECTIONS | Solved! | 1 mistake on the way. | FEWER MISTAKES IS BETTER | 1 of 4 used | DAY 61 · STREAK 1 · BEST 1
- **Share copy** — button read `copied ✓`, captured via clipboard. Exact text:

```
Match Cut · Connections
solved · 1 mistake
🟦🟦🟦🟪
🟦🟦🟦🟦
🟪🟪🟪🟪
🟥🟥🟥🟥
🟩🟩🟩🟩
```

  URL-free: yes; opens `Match Cut · Connections`: yes
- **Faults during this mode** — 0 console errors · 0 console warnings · 0 pageerrors · 0 CSP violations · 0 failed same-origin requests
- **Screenshot** — `p3-connections-terminal.png`

### Duel

- **Load** — PASS — duel board rendered; hand 7 cards, marquee tops Mission: Impossible / Prisoners, score 0-0, turn playerTurn
- **Successful action** — PASS — played Sicario onto the Prisoners marquee via Denis Villeneuve: accepted (score 0-0 → 2-4, hand 7 → 6, "CPU: banked 4 films via Drama")
- **Error recovery** — PASS — dropped The Hobbit: An Unexpected Journey on the Mission: Impossible marquee with no shared credit and no Final Cut: refused (hand still 7, score still 0-0, turn still playerTurn — the turn was not consumed); play continued
- **Terminal** — PASS — game reached its terminal screen after 69 driven steps. Dialog "Game over — results": CPU wins. | CPU hit 20 — the show goes to the higher net. | HIGHER IS BETTER | Net -4 vs 16 · played − held | You | 2 played − 6 held | -4 | CPU
- **Share copy** — button read `copied ✓`, captured via clipboard. Exact text:

```
Match Cut · Duel
lost vs Matinee · net -4 to 16
🎬🟥🟥🟥🟥
```

  URL-free: yes; opens `Match Cut · Duel`: yes
- **Faults during this mode** — 0 console errors · 0 console warnings · 0 pageerrors · 0 CSP violations · 0 failed same-origin requests
- **Screenshot** — `p3-duel-terminal.png`

## Sanitized-progress loads

### Variant A — structurally wrong JSON (`p3-sanitized-menu-a.png`)

- Blob installed before first paint via an init script on `localStorage['matchcut:v1']`.
- Menu rendered: 4 mode cards; first-run onboarding not shown (the blob's seenOnboarding survived sanitization).
- Repaired chips — solo: "✓ streak 5" · chronology: null · connections: "✓ streak 1" · duel record: "3/3 won" · passport: "Daily passport2/3 stamped" · difficulty pressed: ["matinee"].
- Faults: 0 console errors · 0 console warnings · 0 pageerrors · 0 CSP violations · 0 failed same-origin requests.

### Variant B — non-JSON garbage string (`p3-sanitized-menu-b.png`)

- Blob installed before first paint via an init script on `localStorage['matchcut:v1']`.
- Menu rendered: 4 mode cards; first-run onboarding shown (the corrupt blob cannot carry seenOnboarding, so the device reads as fresh) and dismissed.
- Repaired chips — solo: null · chronology: null · connections: null · duel record: null · passport: "Daily passport0/3 stamped" · difficulty pressed: ["matinee"].
- Faults: 0 console errors · 0 console warnings · 0 pageerrors · 0 CSP violations · 0 failed same-origin requests.

## Anomalies and observations

- (see the session report)
