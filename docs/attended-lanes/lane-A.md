# Lane A — desktop Safari, all four modes (run-sheet)

Matrix row 4 of `docs/daily-duel-216-attended-acceptance.md` · continuation script A.
Pairs with lane D (VoiceOver) in the same sitting on the same Mac.

**Candidate:** production `main@9a5fdbb` (`dpl_HWeNAMnK2eLernz47PCG9RAmgCu6`),
`https://matchcutdaily.com`, bundle `index-DAtVcX_d.js`. Confirm on the day:

```bash
curl -s https://matchcutdaily.com/ | grep -o 'index-[A-Za-z0-9_-]*\.js'
```

If that does not print `index-DAtVcX_d.js`, stop; the candidate moved.

## Fill in first

| field | value |
|---|---|
| Tester | |
| Date | |
| Mac model / macOS version | |
| Safari version (Safari → About Safari; note WebKit if shown) | |
| Candidate asset confirmed (`index-DAtVcX_d.js`) | ☐ |
| Fresh start (private window, or site data removed) | ☐ |
| Window size for surface 7 (~1024×768) | ☐ |

## Setup

- Safari → File → **New Private Window** (fresh state, so onboarding shows).
  Alternative: Safari → Settings → Privacy → Manage Website Data → remove
  `matchcutdaily.com`.
- Console for surface 6: Safari → Settings → Advanced → tick *Show features
  for web developers*; then Develop → **Show JavaScript Console**.
- Clock for surface 7: System Settings → General → Date & Time → turn off
  *Set time and date automatically* → set **2026-09-25** → reload the page.
  Turn it back on when done.
- Keep the console open the whole sitting; any red line is a defect to record.

## Surfaces

| # | surface | do | expect | pass | defect |
|---|---|---|---|---|---|
| 1 | first-run onboarding, then menu | open the URL fresh | onboarding screens appear (Skip, or the last screen's button) → the menu: "Tonight's program / Pick your feature.", the Daily passport, four cards: Daily Puzzle · Chronology · Connections · Duel | ☐ | none |
| 2 | Help → support card + disclosure | tap the **?** in the navy header ("How to play") | the overview sheet; the support card says reports go through the public GitHub issue chooser, GitHub sign-in is required and the report will be public; the **Open public GitHub support** link opens a new tab (do not file anything); the **What this site saves and measures** section expands | ☐ | none |
| 3 | one successful action per mode | Daily Puzzle: raise a hand card, play it onto the pile · Chronology: raise a title, place it in a legal gap · Connections: select four tiles, submit · Duel: **Draw a card** → the "Drew three — keep one" dialog → keep one | each action lands, the board updates, nothing freezes | ☐ | none |
| 4 | one error recovery + one terminal result | make one invalid play (Daily Puzzle: a card sharing no credit with the pile top; or Duel: drop a card with no shared credit; or a wrong Connections four) — then play any one mode to its end screen | the invalid play is refused with a message, the card returns, play continues; the end screen (result dialog) appears with a summary | ☐ | none |
| 5 | replay + share copy | on the end screen: replay / play again; then **copy result** | label flips to **copied ✓** (or **select below to copy** with a text box = the manual fallback; select-all and copy from it); paste into Notes: exactly three lines — `Match Cut · <Mode>` / the score line / the emoji row — and **no URL** (Approval 5 has not run) | ☐ | none |
| 6 | sanitized-progress menu | in the console, one at a time, then reload after each: `localStorage.setItem('matchcut:v1','{malformed json')` and `localStorage.setItem('matchcut:v1', JSON.stringify({v:1,solo:{lastSeed:'x',streak:5,best:-3},chronology:'broken',connections:{lastSeed:'x',streak:-9,best:99},duel:{matinee:{plays:3,wins:8},feature:{plays:-4,wins:'many'},directors:null},seenOnboarding:true,lastDifficulty:'unknown'}))` | the menu renders both times, no crash, no console error; garbage blob → everything fresh and onboarding shows again (expected); structured blob → chips repaired to sane values (no negative streak, no 8-of-3 record) | ☐ | none |
| 7 | Goal-4 surfaces | clock → **2026-09-25**, reload, open Connections; then window ≈ 1024×768, open Chronology and reveal the hint | the long-title board: every title readable, no clipping or overlap, tiles tappable (mid-word breaks on the six known long titles are a KNOWN cosmetic — write "known", not a defect); the Chronology hint sits clear of the choice tickets | ☐ | none |
| 8 | focus order, labels, 200 % text | Tab through the menu and one mode; Escape on any dialog; View → Zoom In to 200 % (five presses) | focus moves in reading order and is visible; Escape closes the dialog and focus returns to the opener; at 200 % no horizontal scrollbar and every control still reachable | ☐ | none |

## Evidence

Drop into `audit/daily-duel-216-launch-readiness-2026-08-27/attended/` as
`lane-A-<surface#>-<slug>.png` (e.g. `lane-A-7-long-title-board.png`,
`lane-A-5-share-paste.png`). Minimum: 1 menu, 3 one per mode, 5 the paste,
7 both boards. Fill this sheet in place — it is the receipt.

## Result

Lane A: **PASS / FAIL** (a defect that blocks play, share, or return to menu = FAIL) ·
defects: none / listed above · console errors: none / listed · signed: ________ on ________

History for context only: desktop Safari 26.5.2 passed once on 2026-08-19 on the
older candidate (`docs/goal-5-public-launch-acceptance.md`); not carried forward.
