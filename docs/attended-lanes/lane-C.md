# Lane C — real Android Chrome, portrait + landscape (run-sheet)

Matrix row 6 of `docs/daily-duel-216-attended-acceptance.md` · continuation script C.
Pairs with lane E (TalkBack) in the same sitting on the same phone. Never run
on any build before this.

**Candidate:** production `main@9a5fdbb` (`dpl_HWeNAMnK2eLernz47PCG9RAmgCu6`),
`https://matchcutdaily.com`, bundle `index-DAtVcX_d.js`. The operator confirms
the asset name from any computer the same day:

```bash
curl -s https://matchcutdaily.com/ | grep -o 'index-[A-Za-z0-9_-]*\.js'
```

If that does not print `index-DAtVcX_d.js`, stop; the candidate moved.

## Fill in first

| field | value |
|---|---|
| Tester | |
| Date | |
| Phone model (Settings → About phone) | |
| Android version | |
| Chrome version (type `chrome://version` in the address bar) | |
| Screen class (360×800-class = the one that matters most) | |
| Candidate asset confirmed by the operator (`index-DAtVcX_d.js`) | ☐ |
| Fresh start (Incognito, or site data cleared) | ☐ |
| Portrait covered ☐ · Landscape covered ☐ | |
| Computer + USB cable available for surface 6 | yes ☐ / no ☐ |

## Setup

- No LAN server needed: open `https://matchcutdaily.com` in Chrome. Fresh
  state: an **Incognito** tab, or Chrome → Settings → Site settings → All
  sites → `matchcutdaily.com` → Clear & reset.
- Surface 6 needs a computer: phone Settings → Developer options → **USB
  debugging** on (tap Build number seven times to unlock Developer options);
  cable; on the computer's Chrome open `chrome://inspect#devices` → *inspect*
  the `matchcutdaily.com` tab → Console. No computer or cable → record surface
  6 as **NOT RUN on this lane** (automation and lane A cover it). Never tick it.
- Clock for surface 7: Settings → System → Date & time → automatic off →
  **2026-09-25** → reload. Restore afterwards.
- 200 % text for surface 8: Settings → Display → Font size (largest) **and**
  Chrome → Settings → Accessibility → Text scaling 200 %; tick *Force enable
  zoom* if the page resists pinch.
- There are **no text fields** in the game. If a software keyboard ever
  appears, that itself is a finding.

## Surfaces (whole list in portrait, then repeat 1, 3, 7, 8 in landscape)

| # | surface | do | expect | pass | defect |
|---|---|---|---|---|---|
| 1 | first-run onboarding, then menu | open the URL fresh | onboarding screens (Skip, or the last screen's button) → menu: "Tonight's program / Pick your feature.", Daily passport, four cards; nothing hides under the status bar or the gesture bar | ☐ | none |
| 2 | Help → support card + disclosure | tap **?** in the header | overview sheet; support card (public GitHub issue chooser, sign-in required, report is public); **Open public GitHub support** opens a new tab (do not file anything); **What this site saves and measures** expands | ☐ | none |
| 3 | one successful action per mode | Daily Puzzle: raise a hand card, play it · Chronology: raise a title, place it in a legal gap · Connections: select four, submit · Duel: **Draw a card** → "Drew three — keep one" → keep one | each action lands; tap targets hittable; nothing freezes | ☐ | none |
| 4 | one error recovery + one terminal result | one invalid play; then play any mode to its end screen | refused with a message, card returns, play continues; the result dialog is fully visible (scrolls if tall) | ☐ | none |
| 5 | replay + share copy | replay; then **copy result** | **copied ✓** (or **select below to copy** with a text box — select-all and copy); paste into any notes app: three lines, `Match Cut · <Mode>` / score / emoji, **no URL** | ☐ | none |
| 6 | sanitized-progress menu | via the computer's console, reload after each: `localStorage.setItem('matchcut:v1','{malformed json')` then `localStorage.setItem('matchcut:v1', JSON.stringify({v:1,solo:{lastSeed:'x',streak:5,best:-3},chronology:'broken',connections:{lastSeed:'x',streak:-9,best:99},duel:{matinee:{plays:3,wins:8},feature:{plays:-4,wins:'many'},directors:null},seenOnboarding:true,lastDifficulty:'unknown'}))` | menu renders both times, no crash, no console error; garbage → fresh + onboarding again; structured → repaired chips | ☐ | none / NOT RUN |
| 7 | Goal-4 surface — the one that matters most here | clock → **2026-09-25**, reload, open Connections, portrait then landscape | the long-title board on a 360-wide screen: every title readable, no clipping or overlap, every tile tappable (mid-word breaks on the six known long titles = "known") | ☐ | none |
| 8 | safe areas, keyboard, 200 % text | rotate to landscape on the menu and in Duel; text at 200 %, revisit the menu and one mode | header and tray clear the system bars in both orientations; no keyboard ever appears; at 200 % nothing overflows sideways and every control is still reachable | ☐ | none |

## Evidence

Screenshots (Power + Volume down) →
`audit/daily-duel-216-launch-readiness-2026-08-27/attended/` as
`lane-C-<surface#>-<slug>-<portrait|landscape>.png`. Minimum: 1 both
orientations, 3 one per mode, 5 the paste, 7 both orientations. Fill this sheet
in place — it is the receipt.

## Result

Lane C: **PASS / FAIL** (a defect that blocks play, share, or return to menu = FAIL) ·
defects: none / listed above · signed: ________ on ________
