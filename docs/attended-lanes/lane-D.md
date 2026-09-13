# Lane D — VoiceOver end-to-end, macOS Safari (run-sheet)

Matrix row 7 of `docs/daily-duel-216-attended-acceptance.md` · continuation script D.
Same sitting and same Mac as lane A; do A first, then turn VoiceOver on and
run this list **by ear**. Record what was *spoken*, not what the DOM says —
that is the whole point of this lane.

**Candidate:** production `main@9a5fdbb` (`dpl_HWeNAMnK2eLernz47PCG9RAmgCu6`),
`https://matchcutdaily.com`, bundle `index-DAtVcX_d.js` (confirmed on the
lane A sheet the same day).

## Fill in first

| field | value |
|---|---|
| Tester | |
| Date | |
| Mac model / macOS version | |
| Safari version | |
| VoiceOver on (Cmd + F5) · verbosity default | ☐ |
| Candidate asset confirmed on the lane A sheet | ☐ |
| Fresh start (private window) | ☐ |

## Setup

- VoiceOver: **Cmd + F5** (or System Settings → Accessibility → VoiceOver).
  Navigate with **VO = Ctrl + Option**: VO + → / ← moves, VO + Space
  activates, VO + U opens the rotor (Headings / Form Controls / Links).
- Open the console too (Develop → Show JavaScript Console): a defect can be
  silent and visual at the same time.
- The Connections live line and the share button both use polite live regions;
  wait a beat after the action before judging what was spoken.

## Surfaces, by ear

| # | surface | do | expect to HEAR | pass | defect |
|---|---|---|---|---|---|
| 1 | onboarding, then menu | open fresh; VO through the onboarding, Skip; then rotor → Headings | onboarding controls are named; the menu reads heading level 1 "Match Cut", heading level 2 "Pick your feature.", the "Tonight's program" text, the Daily passport, then the four mode buttons by their names (Daily Puzzle, Chronology, Connections, Duel) in that order — no unnamed "button" anywhere | ☐ | none |
| 2 | Help → support + disclosure | VO to the header button, activate | the button is announced "How to play"; the sheet announces as a dialog with its heading; the support link is announced **"Open public GitHub support (opens in a new tab)"**; the disclosure control announces its expanded / collapsed state | ☐ | none |
| 3 | one action per mode | Daily Puzzle: raise + play · Chronology: raise + place · Connections: select four + submit · Duel: Draw a card → dialog → keep one | every card / tile / gap is a named control (a title, never "button"); **Connections:** each tile announces as a toggle, and after each press the live line says **"n selected · choose k more"**; **Duel:** the draw dialog is announced by name ("Drew three — keep one") and its three options are read as "Option 1 of 3: keep this card — connection hint" / "… no connection hint" — three *distinct* names, never a movie title | ☐ | none |
| 4 | error recovery + terminal | one invalid play; then play a mode to the end | the refusal message is spoken (live region), focus stays where it was; the result dialog is announced as a dialog and reads its heading and summary before the buttons | ☐ | none |
| 5 | replay + share | replay; then activate **copy result** | the button's state change is spoken: "copied ✓" (or "select below to copy", in which case the text box is reachable and reads the three lines) | ☐ | none |
| 6 | sanitized-progress menu | as lane A surface 6 (console), then VO through the menu again | the repaired chips are read with sane values; nothing announces "undefined", "NaN" or an empty button | ☐ | none |
| 7 | Goal-4 surfaces | clock → 2026-09-25, Connections; window ≈ 1024×768, Chronology hint | every long title on the board is read in full; the hint is announced when revealed and is reachable in order after the tickets, not on top of them | ☐ | none |
| 8 | focus trap / Escape / restoration / order | open the Help sheet, the Duel draw dialog, and a result dialog; Tab around inside each; Escape | inside a dialog VO never lands on page content behind it; Escape closes it and VO lands back on the control that opened it; the overall reading order matches the visual order | ☐ | none |

## Evidence

Screenshots with the VoiceOver caption panel visible (VO + Cmd + F11 toggles
the caption panel; Cmd + Shift + 4 to capture) →
`audit/daily-duel-216-launch-readiness-2026-08-27/attended/` as
`lane-D-<surface#>-<slug>.png`. Minimum: 3 the Connections live line and the
Duel dialog, 5 the copied state, 8 one dialog. Write the spoken phrases you
heard into the table — that text is the evidence a DOM audit cannot produce.
Fill this sheet in place — it is the receipt.

## Result

Lane D: **PASS / FAIL** (an unnamed game control, a title leaked in the Duel
draw, a dialog that does not trap or restore focus, or a silent refusal = FAIL) ·
defects: none / listed above · signed: ________ on ________

History for context only: VoiceOver on Safari 26.5.2 passed once on
2026-08-19 on the older candidate and found the identical-draw-names defect
that was then fixed (`docs/goal-5-public-launch-acceptance.md`); not carried
forward.
