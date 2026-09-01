# Goal 5 — Public-launch acceptance

Date opened: 2026-08-19

Status: local automation and screenshot checkpoint green; attended and
publication gates open

## Candidate identity and held boundaries

- Branch: `codex/daily-mode-polish`.
- Base SHA: `c063f267c819f8109e5ec0257e675fc925026dde`.
- Goal 5 working-tree scope: social discovery metadata, a deterministic
  1200×630 preview image, a contrast-safe keyboard focus halo, distinct
  non-spoiling screen-reader names for Duel's three hidden draw choices, their
  browser contracts, and this evidence record.
- The unrelated untracked `docs/full-product-code-review-kickoff-prompt.md` and
  `docs/pool-expansion-goal-prompt.md` remain excluded.
- Rules, scoring, deals, difficulty, movie data, baked Connections grids,
  persistence, analytics semantics, and share text are unchanged.
- `noindex, nofollow` remains intentional until the separate indexing approval.
- This working tree is not a reproducible release candidate until its reviewed
  Goal 5 scope is committed. Commit, push, Vercel Preview, production, and
  indexing are separate checkpoints.

## QA inventory

The acceptance claim is that all four modes start, accept input, reach a
terminal state, copy a result, and return to the menu without clipping,
horizontal overflow, console/page errors, failed first-party requests, or CSP
violations. The visual claim is that the approved ticket-stub system remains
coherent at every required breakpoint and at 200% zoom.

| Surface or behavior | Functional check | Visual state | Evidence |
|---|---|---|---|
| Menu | all four entries; mode chunks remain lazy | initial, help, daily passport | viewport matrix |
| Daily Puzzle | click, Enter, Space, touch, drag; complete/share/menu | initial, raised, result | browser suite + screenshots |
| Chronology | ten keyboard-stable title choices; place/complete/share/menu | initial, raised, result | browser suite + screenshots |
| Connections | select; complete/share/menu; practice remains interactive | initial, selected, result | browser suite + screenshots |
| Duel | target-only input parity; draw/complete/share/menu | initial, raised, result | browser suite + screenshots |
| Shared access | keyboard-only, visible focus, dialog trap/escape | menu, help, in-mode, result | browser + attended record |
| Motion | reduced-motion mode retains meaning | one action and result | browser + attended record |
| Low vision | 200% zoom; no hidden essential control or horizontal page scroll | initial and result | screenshots + attended record |
| Screen readers | labels, reading order, live feedback, modal naming | one complete path per mode | VoiceOver/TalkBack attended record |
| Discovery | canonical, description, Open Graph, X/Twitter, 1200×630 image | source and rendered image | browser suite + preview image |
| Operations | headers/CSP, analytics receipt, alerts, spend ceiling, rollback, domain | protected Preview then production | operational receipts |

Exploratory risks carried into attendance: orientation/safe-area changes on
real phones; keyboard focus after modal close and terminal-state transitions;
long-title/text-enlargement pressure; and share-sheet behavior outside the
synthetic clipboard path.

## Required viewport matrix

Each mode requires an initial and terminal/result capture at all five product
breakpoints. The compact and 200% rows also require explicit reachability and
horizontal-overflow checks.

| Viewport | Menu | Daily Puzzle | Chronology | Connections | Duel |
|---|---:|---:|---:|---:|---:|
| 375×667 compact phone | passed | passed | passed | passed | passed |
| 390×844 modern phone | passed | passed | passed | passed | passed |
| 768×1024 tablet | passed | passed | passed | passed | passed |
| 1280×720 short desktop | passed | passed | passed | passed | passed |
| 1440×900 full desktop | passed | passed | passed | passed | passed |
| 200% zoom at 1440×900 window | passed | passed | passed | passed | passed |
| 390×844 simulated safe areas | passed | passed | passed | passed | passed |

The exact local candidate produced 63 viewport screenshots: menu initial plus
initial/result for all four modes at all seven matrix rows. Diagnostics record
zero horizontal overflow, console errors/warnings, page errors, failed requests,
or CSP violations. Review `output/playwright/goal-5/initial-contact-sheet.png`,
`result-contact-sheet.png`, and `diagnostics.json`.

## Automated local receipt — 2026-08-19

| Gate | Result |
|---|---|
| `npm run build` | passed; 440 modules |
| `npm run check:bundle` | passed; menu 95.87 KiB gzip JS; cold modes 117.97–145.11 KiB |
| `npm run check:security` | passed; 198 repository files and 25 production files |
| `npm audit` | passed; 0 vulnerabilities |
| `npm audit --omit=dev` | passed; 0 vulnerabilities |
| `npm run verify` | 64 passed, 0 failed |
| `npm run verify:solo` | 8 passed, 0 failed |
| `npm run verify:chronology` | 42 passed, 0 failed |
| `npm run verify:connections` | 14 passed, 0 failed |
| `npm run test:smoke` | 24 passed, 0 failed |
| `git diff --check` | passed |

The 24 browser journeys run under the exact repository CSP and cover metadata,
headers, analytics queueing, lazy chunks, click/keyboard/touch/drag parity,
mode-scoped help, all four terminal/share/menu paths, responsive contracts,
named visible controls/dialogs, keyboard-only mode entry/return, contrast-safe
focus indication, focus restoration, and a static reduced-motion cue whose
gameplay action remains available.

## Attended browser, device, and accessibility record

Do not mark a row passed from emulation or DOM inspection alone. Record the
physical device, OS, browser/assistive-technology version, tester, result,
observed defect or `none`, and evidence filename.

| Gate | Device/browser | Tester | Result | Evidence / notes |
|---|---|---|---|---|
| Current macOS Safari, all four modes | Safari 26.5.2 / WebKit 26.5 | Codex | passed | Branded Safari opened the exact candidate and exercised a real action in all four modes. Daily Puzzle raised a hand card; Chronology placed a card; Connections selected a ticket; Duel drew and kept an option. Current WebKit completed terminal/share/menu in all four modes with zero faults. Safari exposed an attended accessibility defect in the hidden Duel choices; the three non-spoiling names are now distinct and the corrected labels were rechecked in Safari. `safari-attended-menu.png`, `safari-attended-daily-puzzle-action.jpeg`, `safari-attended-chronology-action.png`, `safari-attended-connections-selected.png`, `safari-attended-duel-draw.png`, `webkit-current-receipt.json` |
| Current macOS Chrome, all four modes | Chrome 151.0.7922.169 | Codex | passed | All four terminal/share/menu paths; clipboard prefixes verified; zero faults. `chrome-current-receipt.json` |
| Real iPhone Safari, small + modern size/orientation | — | — | pending | — |
| Real Android Chrome, small + modern size/orientation | — | — | pending | — |
| Keyboard-only + visible focus | Chromium matrix | Codex | automated passed; attended pending | Keyboard-only entry/return in all four modes, Enter/Space paths, Chronology gaps, named controls/dialogs, dialog trap/Escape, focus restoration, and ≥3:1 focus-indicator contrast pass in 24/24 suite |
| Reduced motion | Chromium matrix | Codex | automated passed; attended pending | Full suite and viewport matrix ran with reduced motion; Duel cue remains static and its gameplay action remains available. Human perception check remains open |
| VoiceOver | macOS VoiceOver / Safari 26.5.2 | Buri + Codex | passed | Buri enabled actual VoiceOver. Safari exposed the menu headings and named controls in order; Connections changed a named toggle from off to on and exposed `1 SELECTED · CHOOSE 3 MORE`; Duel exposed the named draw-three dialog, three distinct ordinal/hint-only choices, and the resulting `YOU kept it` feedback plus `Keep`/`Toss onto pile`; the rules modal exposed its name, heading hierarchy, lists, and close controls. No unnamed or duplicate game controls were observed. Spoken audio/caption output is not captured by desktop automation. `voiceover-attended-receipt.md` |
| TalkBack | — | — | pending | — |
| 200% zoom / text enlargement | Safari 26.5.2 at 200%; 720×450 CSS viewport at 2× capture | Codex | passed | Actual Safari at 200% recomposed the menu to a readable single column and kept the mode controls reachable; Connections opened from the enlarged menu. The automated matrix covers all four initial/result states with zero horizontal overflow. `safari-attended-200-percent-menu.jpeg`, `safari-attended-200-percent-connections.jpeg` |

Safari investigation note: Computer Use screenshots omitted the transformed
card layers after a Daily Puzzle interaction, while the controls remained in
the accessibility tree. Current WebKit rendered the initial and raised states
correctly with opacity 1 and valid bounds, so this is recorded as a desktop
capture discrepancy rather than a product defect. WebKit did expose three real
unused-font-preload console warnings; removing those ineffective preloads left
the self-hosted font stack unchanged and produced a fault-free repeat pass.
The same attendance exposed three identical spoken names in Duel's face-down
draw-three dialog. The corrected labels add option ordinals and only the hint
already shown visually; they do not expose hidden movie titles or alter rules.

### Attended execution protocol

Record tester, device model, OS/browser/assistive-technology version, portrait
and landscape result, observed defect or `none`, and screenshot filename for
every physical-device row. Do not replace this evidence with emulation.

1. On current Safari and Chrome, use only `Tab`, `Shift+Tab`, `Enter`, `Space`,
   and `Escape`: enter each mode, open/close help, make one move, reach the
   result, activate Share, and return to Menu. Confirm the amber/navy or light
   focus indicator never disappears against its surface and focus returns to
   the opener after a dialog closes.
2. Enable macOS Reduce Motion and repeat one action plus the result transition
   in every mode. Confirm movement becomes a short fade/static state without
   removing feedback or making the interface appear frozen.
3. At 200% browser zoom in a 1440×900 window, repeat initial and result states
   in all four modes. Vertical scrolling is allowed; horizontal page scrolling,
   clipped essential controls, and unreachable actions are failures.
4. With VoiceOver in Safari, traverse headings, controls, pressed states,
   dialogs, status/live feedback, result actions, and all four complete paths.
   Confirm reading order follows the visible interface and no control is
   unnamed or announced twice in a misleading way.
5. On a real iPhone in Safari, test the smallest available phone and a modern
   notched phone in portrait and landscape. Complete/share/return in all four
   modes; inspect safe areas, rotation, keyboard focus with an attached keyboard
   if available, text enlargement, and the native share/clipboard result.
6. On a real Android phone in current Chrome, repeat the four-mode portrait and
   landscape pass, then enable TalkBack and increased text size. Confirm swipe
   navigation order, names/states/live feedback, modal containment, result
   actions, and native share/clipboard behavior.

Any failure gets a mode, exact step, expected/observed result, severity,
screenshot, and retest status before the attended gate can close.

## Screenshot approval checkpoint

- [x] Fresh initial/result viewport contact sheets generated from the exact
      working-tree candidate.
- [x] Social preview image generated and Codex-reviewed at 1200×630.
- [x] Buri approved the initial/result viewport contact sheets and social
      preview in this task on 2026-08-19.
- [x] No Goal 5 Vercel Preview or production action occurred before this
      checkpoint.

## Protected Preview and operational receipt

### Read-only production baseline — 2026-08-19

This receipt describes the deployment that was already live while Goal 5 was
being prepared. It is the pre-Goal 5 `c063f26` baseline, not the uncommitted
Goal 5 candidate and not evidence that any Goal 5 publication checkpoint has
been approved.

| Control | Observed baseline |
|---|---|
| Production deployment | Vercel `dpl_8SighytERqgygRYvbf1eMyLis6SL`; `marquee-g16l914b4-mwamburi5s-projects.vercel.app`; Ready; created 2026-08-18 23:53:21 EDT; aliased to `matchcutdaily.com` |
| Candidate distinction | Live HTML has the pre-Goal 5 title/font preloads and no Goal 5 social metadata or preview image; `noindex, nofollow` remains present |
| Edge/security smoke | `https://matchcutdaily.com` passed 9/9 required headers, zero CSP violations, zero console warnings/errors, analytics loader 200, one non-sensitive browser test event 200, and absence of test seams, secret names, and source maps |
| Preview protection | Existing Preview `dpl_ECTuDQiuZcWnCa8fCxSJ3jVTK6bk` redirects an unauthenticated request to Vercel SSO; reviewer-path attendance remains open |
| Environment | Vercel CLI listed no project environment variables |
| Domain and redirects | Apex HTTPS 200; HTTP apex redirects 308 to HTTPS; HTTP `www` redirects 308 to HTTPS and HTTPS `www` redirects 307 to the apex |
| DNS | Registrar and nameservers are Vercel; public resolvers returned apex A records; the `www` HTTPS redirect works; no DS delegation was observed, so DNSSEC is an explicit open decision |
| TLS | Certificate covers the apex and wildcard; Let’s Encrypt YR1; valid 2026-07-05 through 2026-10-03 |
| Rollback target | Previous Ready deployment `dpl_7Mk27AwKQ8vcN3CUPj666kfCPNx9` (`marquee-m1zaklhw5-mwamburi5s-projects.vercel.app`); documented command is `vercel rollback <deployment-id-or-url>`; no rollback was executed |
| CI baseline | GitHub run `32212903103` was visibly green for `c063f26`; unauthenticated API access returned 404 and the stored CLI token is invalid, so this is not substituted for the future Goal 5 exact-SHA CI receipt |

The analytics HTTP receipt proves transport only, not arrival in the Vercel
dashboard. Analytics/dashboard arrival, Web Vitals, alert routing, spend
controls, account MFA/access review, registrar controls, DNSSEC disposition,
and an attended rollback drill remain open.

- [ ] Reviewed Goal 5 scope committed on the intended branch.
- [ ] Push separately approved and the exact SHA receives a green CI run.
- [ ] Protected Vercel Preview separately approved and deployed from that SHA.
- [ ] Preview protection tested; reviewer path works.
- [ ] Required headers/CSP, iframe block, assets, sourcemap absence, console,
      analytics delivery, all four terminal/share/menu flows, metadata, and
      `noindex, nofollow` verified on the protected Preview.
- [ ] Vercel/GitHub/registrar account controls in
      `docs/security-launch-checklist.md` attended and recorded.
- [ ] Error alert, Web Vitals, custom analytics receipt, spend alert/ceiling,
      and one-command rollback drill attended and recorded.
- [ ] Credits/privacy/retention language and TMDB commercial-use decision
      confirmed for the intended launch posture.

## Production and indexing checkpoints

- [ ] Production deployment of the exact green SHA separately approved.
- [ ] Production HTTP/assets, headers/CSP, console/network, all four modes,
      analytics, sharing, metadata, TLS, domain/DNS, and rollback target pass.
- [ ] Screenshot checkpoint remains visually equivalent in production.
- [ ] Public indexing separately approved.
- [ ] Only at that checkpoint, change the robots policy intentionally and
      update its automated assertion in the same patch.
- [ ] Verify the public robots response, canonical/social preview, search
      metadata, analytics/privacy posture, and final production receipt.

Final result: pending attended and publication gates
