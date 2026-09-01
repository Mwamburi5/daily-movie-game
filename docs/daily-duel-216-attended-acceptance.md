# Match Cut 216+16 launch-readiness — attended acceptance record

Candidate: `codex/daily-mode-polish` at `ce398376d0c03be5356d64000557817c2f0150c3`
plus the launch-readiness dirty worktree (Goal 0–5 state of 2026-08-31).
Evidence rule: an attended lane closes only with the named hardware, a present
human, and this exact candidate. Automation, simulators, old receipts, or a
different SHA never close an attended lane. The prior attended receipts in
`docs/goal-5-public-launch-acceptance.md` belong to the earlier public-launch
candidate and are explicitly **not** carried forward here.

## Evidence-tier matrix (2026-08-31)

| # | Lane | Tier | Status | Receipt |
|---|---|---|---|---|
| 1 | Chromium keyboard/focus/Escape/touch/drag/reduced-motion suite | automated | **PASS 10/10** | manifest Goal 5; suite run on Node 24, includes the Goal 1 support/privacy and Goal 3 malformed-progress surfaces |
| 2 | WebKit smoke, four-mode real action → terminal → share | automated | **PASS 4/4, zero faults** | `output/playwright/launch-readiness/webkit-smoke-receipt.json` (WebKit 26.5 via installed `webkit-2336`) |
| 3 | 200 percent zoom / text enlargement | automated | **PASS 9/9 captures, zero horizontal overflow** | `output/playwright/launch-readiness/zoom200-*.png` + `zoom200-receipt.json` (720×450 @2× = 200 percent of 1440×900; includes help/support/privacy, sanitized-progress menu, long-title board) |
| 4 | Attended desktop Safari, all four modes | attended | **ATTENDED NOT RUN** | continuation script A |
| 5 | Real iPhone Safari | attended | **ATTENDED NOT RUN** | continuation script B |
| 6 | Real Android Chrome | attended | **ATTENDED NOT RUN** | continuation script C |
| 7 | VoiceOver end-to-end | attended | **ATTENDED NOT RUN** | continuation script D |
| 8 | TalkBack end-to-end | attended | **ATTENDED NOT RUN** | continuation script E |

No human tester or physical device was present in the 2026-08-31 resume
session; lanes 4–8 remain honestly open. They are the launch-readiness pass's
only remaining human blockers.

## Shared attended surface list (all scripts)

Every attended lane exercises, on this candidate (local preview `npm run
preview` of a fresh `npm run build`, or the protected Preview once one exists
for the pushed SHA):

1. first-run onboarding, then menu;
2. overview Help → the public GitHub support card (sign-in/public warning) and
   the expanded "What this site saves and measures" disclosure;
3. one direct successful action per mode — Daily Puzzle flip/play, Chronology
   raise+place, Connections select four+submit, Duel draw+keep;
4. one error recovery (an invalid play or misfire) and one terminal result;
5. replay and the share copy (or its manual fallback);
6. the Goal 3 sanitized-progress menu state (load once with a corrupted
   `matchcut:v1` blob; the menu must render repaired chips, no crash);
7. the Goal 4 surfaces: the 2026-09-25 long-title Connections board (set the
   device clock or wait for that daily) and, on desktop at a 1024×768-ish
   window, the Chronology hint sitting clear of the choice tickets;
8. focus/reading order, labels, safe areas, keyboard overlap, and 200 percent
   text behavior on that device.

Record for each: device model, OS/browser/AT version, date, tester, candidate
identity (SHA + dirty/CI state), portrait+landscape where applicable, pass/fail
per surface, observed defect or `none`, and evidence filenames dropped into
`audit/daily-duel-216-launch-readiness-2026-08-27/attended/`.

## Continuation scripts

- **A — desktop Safari:** on this Mac, `npm run build && npm run preview`, open
  the printed URL in Safari (record Safari/WebKit version from About Safari),
  run the shared surface list, resize the window to ~1024×768 for surface 7.
- **B — iPhone Safari:** serve `npm run preview -- --host` on the LAN, open the
  URL on the physical iPhone (record model + iOS + Safari version), run the
  shared list in portrait and landscape; check safe-area insets around the
  fixed header/tray and the software-keyboard overlap on any focused control.
- **C — Android Chrome:** same LAN flow on the physical Android device (record
  model + Android + Chrome version); include the 360×800-class viewport
  surfaces (the long-title board matters most here) portrait and landscape.
- **D — VoiceOver:** macOS Safari with VoiceOver on, run the shared list by
  ear: menu headings and named controls in order, Connections toggle
  announcement (`n SELECTED · CHOOSE …`), Duel's three distinct draw options,
  dialog focus trap/Escape/restoration, result dialog reading, and the support
  link's new-tab announcement. Record spoken-output observations a DOM audit
  cannot capture.
- **E — TalkBack:** Android Chrome with TalkBack on, same list by ear,
  including swipe-order sanity through the Connections grid and the Duel draw
  dialog, and the share button's state change announcement.
