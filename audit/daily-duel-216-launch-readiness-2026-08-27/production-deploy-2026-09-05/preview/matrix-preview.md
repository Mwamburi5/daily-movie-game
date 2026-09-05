# Match Cut — four-mode smoke matrix (`preview`)

- **Target** — https://marquee-gnny8yrc7-mwamburi5s-projects.vercel.app
- **Daily seed exercised** — `2026-09-05` (harness local date); every daily deal
  below was independently recomputed in Node from the same `src/lib` functions
  the bundle ships, then cross-checked against the DOM before play.
- **Duel pool for this seed** — 89 films (legacy; cutover 2026-09-27)
- **Run window (UTC)** — 2026-09-05T21:22:01.028Z → 2026-09-05T21:23:09.301Z
- **Harness** — `scripts/prod-smoke.mjs` (Playwright Chromium, 390×844, request
  header `x-vercel-skip-toolbar: 1`, clipboard permissions granted)
- **Verdict** — **PASS** · 0 FAIL cells · 0 NOT-VERIFIED · 0 faults

## Matrix

| Mode | Load | Successful action | Error recovery | Terminal | Share copy |
|---|---|---|---|---|---|
| Daily Puzzle | PASS | PASS | PASS | PASS | PASS |
| Chronology | PASS | PASS | PASS | PASS | PASS |
| Connections | PASS | PASS | PASS | PASS | PASS |
| Duel | PASS | PASS | PASS | PASS | PASS |
| Sanitized progress (A + B) | PASS | n/a | n/a | n/a | n/a |

## Fault counts

Collected per browser context: `console` (error + warning), `pageerror`,
`securitypolicyviolation`, `requestfailed` on the target origin, and any
same-origin response ≥ 400.

**Whole run: 0 faults.**

Zero in every phase — the four mode runs and both sanitized-progress loads.

## Per-mode notes

### Daily Puzzle

- **Load** — PASS — mode stage rendered; pile top = toy-story-2 (matches the seed-derived deal for 2026-09-05 from the 89-film legacy pool)
- **Successful action** — PASS — played Catch Me If You Can onto Toy Story 2; pile top advanced and the hand dropped to 6 tickets
- **Error recovery** — PASS — played Schindler's List onto Toy Story 2 (no shared credit): rejected with the banner "No shared credit · +2", card returned to hand (6 tickets, was 7), penalty applied (Flips 2, score 2, par 9); play continued normally afterwards
- **Terminal** — PASS — Solved (won). Result dialog "Solved — results": Solved! | Score 0 · par 9 (9 under par) | LOWER IS BETTER | Score 0 vs par 9 | 2 flips · 1 invalid play · combo −2 | DAY 64 · STREAK 1 · BEST 0
- **Share copy** — button read `copied ✓`, captured via clipboard. Exact text:

```
Match Cut · Daily Puzzle
score 0, par 9 (9 under par)
🎬🟩🟩🟩🟩🟩🟩🟩
```
- **Faults during this mode** — 0 console errors · 0 console warnings · 0 pageerrors · 0 CSP violations · 0 failed same-origin requests

### Chronology

- **Load** — PASS — mode stage rendered; anchor = Braveheart (1995-05-24), matching the seed-derived deal
- **Successful action** — PASS — raised Inception (2010) and dropped it into the correct gap 2: accepted clean ("clean"), reel grew to 3 cards
- **Error recovery** — PASS — placed Zodiac (2007) in gap 0 when gap 1 was correct: the UI revealed the year ("actually 2007"), charged a stroke (Strokes 1) and re-slotted the card to its true position (index 1); the round continued
- **Terminal** — PASS — Cleared. Result dialog "Cleared — results": Cleared! | Final score -2 | LOWER IS BETTER | Score -2 = 1 stroke − 3 credits | 1 stroke · 3 streak credits | DAY 64 · STREAK 1 · BEST -2
- **Share copy** — button read `copied ✓`, captured via clipboard. Exact text:

```
Match Cut · Chronology
score -2 (1 stroke, 3 back)
🎬🟥🟩🟩🟩🟩🟩🟩🟩🟩🟩
```
- **Faults during this mode** — 0 console errors · 0 console warnings · 0 pageerrors · 0 CSP violations · 0 failed same-origin requests

### Connections

- **Load** — PASS — mode stage rendered; the 16 tiles match the baked daily grid for 2026-09-05
- **Successful action** — PASS — selected the four director films and submitted: accepted, the group locked to the solved rail
- **Error recovery** — PASS — submitted a deliberate one-away set (3 from group 1 + 1 from group 2): rejected with "one away — swap one ticket", mistake counted (4 mistakes left → 3 mistakes left), board stayed playable
- **Terminal** — PASS — Solved (won, 1 mistake). Result dialog "Solved — results": MATCH CUT · CONNECTIONS | Solved! | 1 mistake on the way. | FEWER MISTAKES IS BETTER | 1 of 4 used | DAY 64 · STREAK 1 · BEST 1
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
- **Faults during this mode** — 0 console errors · 0 console warnings · 0 pageerrors · 0 CSP violations · 0 failed same-origin requests

### Duel

- **Load** — PASS — duel board rendered; hand 7 cards, marquee tops Oppenheimer / Boogie Nights, score 0-0, turn playerTurn
- **Successful action** — PASS — played Dune: Part Two onto the Oppenheimer marquee via Florence Pugh: accepted (score 0-0 → 1-3, hand 7 → 6, "CPU: banked 3 films via Drama")
- **Error recovery** — PASS — dropped The Matrix Revolutions on the Oppenheimer marquee with no shared credit and no Final Cut: refused (hand still 7, score still 0-0, turn still playerTurn — the turn was not consumed); play continued
- **Terminal** — PASS — game reached its terminal screen after 91 driven steps. Dialog "Game over — results": CPU wins. | CPU hit 20 — the show goes to the higher net. | HIGHER IS BETTER | Net -5 vs 21 · played − held | You | 1 played − 6 held | -5 | CPU
- **Share copy** — button read `copied ✓`, captured via clipboard. Exact text:

```
Match Cut · Duel
lost vs Matinee · net -5 to 21
🎬🟥🟥🟥🟥
```
- **Faults during this mode** — 0 console errors · 0 console warnings · 0 pageerrors · 0 CSP violations · 0 failed same-origin requests

## Sanitized-progress loads

### Variant a-structured

- Blob installed before first paint on `localStorage['matchcut:v1']`.
- Menu rendered 4 mode cards; onboarding not shown.
- Repaired chips — solo: "✓ streak 5" · chronology: null · connections: "✓ streak 1" · duel record: "3/3 won" · difficulty pressed: ["matinee"].
- Faults: 0 console errors · 0 console warnings · 0 pageerrors · 0 CSP violations · 0 failed same-origin requests.

### Variant b-garbage

- Blob installed before first paint on `localStorage['matchcut:v1']`.
- Menu rendered 4 mode cards; onboarding shown and dismissed.
- Repaired chips — solo: null · chronology: null · connections: null · duel record: null · difficulty pressed: ["matinee"].
- Faults: 0 console errors · 0 console warnings · 0 pageerrors · 0 CSP violations · 0 failed same-origin requests.
