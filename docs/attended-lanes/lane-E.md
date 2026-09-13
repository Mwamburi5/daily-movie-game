# Lane E — TalkBack end-to-end, Android Chrome (run-sheet)

Matrix row 8 of `docs/daily-duel-216-attended-acceptance.md` · continuation script E.
Same sitting and same phone as lane C; do C first, then turn TalkBack on and
run this list **by ear**. Never run on any build before this. Record what was
*spoken*.

**Candidate:** production `main@9a5fdbb` (`dpl_HWeNAMnK2eLernz47PCG9RAmgCu6`),
`https://matchcutdaily.com`, bundle `index-DAtVcX_d.js` (confirmed on the
lane C sheet the same day).

## Fill in first

| field | value |
|---|---|
| Tester | |
| Date | |
| Phone model / Android version | |
| Chrome version | |
| TalkBack version (Settings → Accessibility → TalkBack → Settings → about) | |
| Candidate asset confirmed on the lane C sheet | ☐ |
| Fresh start (Incognito) | ☐ |

## Setup

- TalkBack: Settings → Accessibility → **TalkBack** → on (or hold both volume
  keys three seconds if the shortcut is enabled). Explore by swiping right /
  left one item at a time; double-tap to activate; swipe down-then-left (or the
  Back gesture) to go back.
- Set the reading control to *Headings* (swipe up / down) when checking the
  menu order.
- Keep a computer console attached if lane C had one; otherwise rely on ear
  and eye.

## Surfaces, by ear

| # | surface | do | expect to HEAR | pass | defect |
|---|---|---|---|---|---|
| 1 | onboarding, then menu | open fresh; swipe through onboarding, Skip; then swipe through the whole menu | onboarding controls are named; the menu reads "Match Cut" heading, "Pick your feature." heading, the program text, the Daily passport, then the four mode buttons by name in visual order — no bare "button" | ☐ | none |
| 2 | Help → support + disclosure | reach the header button, double-tap | "How to play, button"; the sheet announces as a dialog with its heading; the support link reads **"Open public GitHub support (opens in a new tab)"**; the disclosure announces expanded / collapsed | ☐ | none |
| 3 | one action per mode, swipe-order sanity | Daily Puzzle: raise + play · Chronology: raise + place · **Connections:** swipe through the whole grid before selecting, then select four + submit · **Duel:** Draw a card → dialog → keep one | every card / tile / gap is named; the Connections grid swipes row by row in visual order, each tile is a toggle, and after each press the live line says **"n selected · choose k more"**; the Duel draw dialog is named ("Drew three — keep one") and its three options read as "Option 1 of 3: keep this card — connection hint" / "… no connection hint" — three distinct names, never a title | ☐ | none |
| 4 | error recovery + terminal | one invalid play; then play a mode to the end | the refusal is spoken; focus does not jump; the result dialog announces as a dialog and reads its heading and summary first | ☐ | none |
| 5 | replay + share | replay; then double-tap **copy result** | the state change is spoken: "copied ✓" (or "select below to copy" — then the text box is reachable and reads three lines, no URL) | ☐ | none |
| 6 | sanitized-progress menu | as lane C surface 6 if a console is attached, then swipe the menu again | repaired chips read with sane values; nothing says "undefined", "NaN" or an empty button | ☐ | none / NOT RUN |
| 7 | Goal-4 surface | clock → 2026-09-25, Connections | every long title on the board is read in full and every tile is reachable by swipe in order | ☐ | none |
| 8 | focus trap / back / restoration | open the Help sheet, the Duel draw dialog, a result dialog; swipe around; Back gesture | inside a dialog swiping never reaches page content behind it; Back closes it and focus returns to the opener; overall swipe order matches the visual order | ☐ | none |

## Evidence

Screenshots (Power + Volume down; TalkBack's focus outline is visible) →
`audit/daily-duel-216-launch-readiness-2026-08-27/attended/` as
`lane-E-<surface#>-<slug>.png`. Minimum: 3 the Connections live line and the
Duel dialog, 5 the copied state, 8 one dialog. Write the spoken phrases into
the table. Fill this sheet in place — it is the receipt.

## Result

Lane E: **PASS / FAIL** (an unnamed game control, a title leaked in the Duel
draw, a dialog that does not trap or restore focus, or a silent refusal = FAIL) ·
defects: none / listed above · signed: ________ on ________
