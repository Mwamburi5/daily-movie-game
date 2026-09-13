# Lane B — real iPhone Safari, portrait + landscape (run-sheet)

Matrix row 5 of `docs/daily-duel-216-attended-acceptance.md` · continuation script B.
Own sitting (needs a physical iPhone). Never run on any build before this.

**Candidate:** production `main@9a5fdbb` (`dpl_HWeNAMnK2eLernz47PCG9RAmgCu6`),
`https://matchcutdaily.com`, bundle `index-DAtVcX_d.js`. The phone gets the
same bytes as any machine, so the sitting's operator confirms the asset name
from a Mac the same day:

```bash
curl -s https://matchcutdaily.com/ | grep -o 'index-[A-Za-z0-9_-]*\.js'
```

If that does not print `index-DAtVcX_d.js`, stop; the candidate moved.

## Fill in first

| field | value |
|---|---|
| Tester | |
| Date | |
| iPhone model (Settings → General → About → Model Name) | |
| iOS version (= Safari version) | |
| Candidate asset confirmed by the operator (`index-DAtVcX_d.js`) | ☐ |
| Fresh start (Private tab, or site data deleted) | ☐ |
| Portrait covered ☐ · Landscape covered ☐ | |
| Mac + cable available for surface 6 | yes ☐ / no ☐ |

## Setup

- No LAN server needed: open `https://matchcutdaily.com` in Safari. Fresh
  state: a **Private** tab, or Settings → Safari → Advanced → Website Data →
  delete `matchcutdaily.com`.
- Surface 6 needs the Mac: iPhone Settings → Safari → Advanced → **Web
  Inspector** on; cable to the Mac; Mac Safari → Develop → *(your iPhone)* →
  `matchcutdaily.com` → Console. No Mac or cable → record surface 6 as
  **NOT RUN on this lane** (automation and lane A cover it). Never tick it.
- Clock for surface 7: Settings → General → Date & Time → *Set Automatically*
  off → **2026-09-25** → reload. (If Screen Time blocks the change, record 7 as
  NOT RUN rather than guessing.) Restore afterwards.
- 200 % text for surface 8: Safari's **aA** menu → zoom to 200 %; and/or
  Settings → Accessibility → Display & Text Size → Larger Text, slider high.
- There are **no text fields** in the game. If a software keyboard ever
  appears, that itself is a finding.

## Surfaces (do the whole list in portrait, then repeat 1, 3, 7, 8 in landscape)

| # | surface | do | expect | pass | defect |
|---|---|---|---|---|---|
| 1 | first-run onboarding, then menu | open the URL fresh | onboarding screens (Skip, or the last screen's button) → menu: "Tonight's program / Pick your feature.", Daily passport, four cards; the navy header clears the notch / Dynamic Island, nothing hides under the home indicator | ☐ | none |
| 2 | Help → support card + disclosure | tap **?** in the header | overview sheet; support card (public GitHub issue chooser, sign-in required, report is public); **Open public GitHub support** opens a new tab (do not file anything); **What this site saves and measures** expands | ☐ | none |
| 3 | one successful action per mode | Daily Puzzle: raise a hand card, play it · Chronology: raise a title, place it in a legal gap · Connections: select four, submit · Duel: **Draw a card** → "Drew three — keep one" → keep one | each action lands; tap targets are hittable with a thumb; nothing freezes | ☐ | none |
| 4 | one error recovery + one terminal result | one invalid play (a card with no shared credit, or a wrong Connections four); then play any mode to its end screen | refused with a message, card returns, play continues; the result dialog appears and is fully visible (scrolls if tall) | ☐ | none |
| 5 | replay + share copy | replay; then **copy result** | **copied ✓** (or **select below to copy** with a text box — select-all and copy); paste into Notes: three lines, `Match Cut · <Mode>` / score / emoji, **no URL** | ☐ | none |
| 6 | sanitized-progress menu | via the Mac console, reload after each: `localStorage.setItem('matchcut:v1','{malformed json')` then `localStorage.setItem('matchcut:v1', JSON.stringify({v:1,solo:{lastSeed:'x',streak:5,best:-3},chronology:'broken',connections:{lastSeed:'x',streak:-9,best:99},duel:{matinee:{plays:3,wins:8},feature:{plays:-4,wins:'many'},directors:null},seenOnboarding:true,lastDifficulty:'unknown'}))` | menu renders both times, no crash, no console error; garbage → fresh + onboarding again; structured → repaired chips | ☐ | none / NOT RUN |
| 7 | Goal-4 surface | clock → **2026-09-25**, reload, open Connections | the long-title board: every title readable, no clipping or overlap, every tile tappable, both orientations (mid-word breaks on the six known long titles = "known") | ☐ | none |
| 8 | safe areas, keyboard, 200 % text | rotate to landscape on the menu and in Duel; zoom text to 200 % and revisit the menu and one mode | header and tray respect the safe areas in both orientations; no keyboard ever appears; at 200 % nothing overflows sideways and every control is still reachable | ☐ | none |

## Evidence

Screenshots (Side button + Volume up) → AirDrop to the Mac →
`audit/daily-duel-216-launch-readiness-2026-08-27/attended/` as
`lane-B-<surface#>-<slug>-<portrait|landscape>.png`. Minimum: 1 both
orientations, 3 one per mode, 5 the paste, 7 both orientations. Fill this sheet
in place — it is the receipt.

## Result

Lane B: **PASS / FAIL** (a defect that blocks play, share, or return to menu = FAIL) ·
defects: none / listed above · signed: ________ on ________
