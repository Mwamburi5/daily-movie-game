# Match Cut production polish audit

**Audit date:** 2026-08-08
**Surface:** production at `https://matchcutdaily.com`
**Release inspected:** `a710fff` (`Add Wave 3 movie pool expansion`)
**Audit type:** combined product, visual, responsive, accessibility-risk, and launch-readiness review
**Implementation changes:** none; this document and its current-run screenshots are audit evidence only.

## Executive verdict

Match Cut is a functioning, stable quiet-beta game with a strong visual identity,
good mobile foundations, healthy production bundle sizes, and complete local game
verification. It is **not yet a finished public-launch product**.

The central visual problem is now precise: the phone composition was widened only
to a 760px daily-mode shell, while the menu and Duel remain 420px compositions.
At 1440×900 the product therefore looks like a phone simulator floating in empty
space. The decorative desktop theater around Duel makes that limitation more
visible instead of solving it. Daily Puzzle and Chronology also leave large empty
vertical fields while keeping the cards and interaction targets close to phone
scale.

The central production problem is equally concrete: the current GitHub Actions
run timed out at 15 minutes during `verify:connections`, so browser smoke never
ran. Local gates passed and production is playable, but the release pipeline is
currently red/cancelled and cannot be treated as a reliable launch gate.

## What is already in good shape

- Production returns HTTP 200 on the custom domain and loaded without console
  warnings or errors throughout this audit.
- All four modes are playable and the Wave 3 content release is live: 304 fully
  credited movies, 482 dated movies, and the unchanged 89-film Solo/Duel pool.
- Mobile visual direction is coherent: navy marquee, cream paper, amber action,
  Domine display type, ticket notches, perforation, and movie-house textures.
- Connections is the strongest completed surface. Its 375×667 board and result
  panel fit cleanly, preserve 44px actions, and explain the category mix.
- Daily Puzzle's 4+3 rack is materially clearer than a squeezed seven-card fan.
- Chronology's reel establishes an understandable older-to-newer stage and keeps
  its legal gaps as real buttons.
- Dialog semantics, focus trapping, labelled icon-only controls, focus rings,
  reduced-motion branches, and no zoom lock are already present in code.
- Route-level splitting and budgets are real: the menu shell is 95.41 KiB gzip,
  first-mode JS is 116–144 KiB gzip after Wave 3, and cold played sessions remain
  far below the 2 MiB target.
- The repo has build, bundle, four rule-verification suites, and seven browser
  smoke journeys. The missing piece is making the CI runtime complete reliably.

## Immediate production blockers

### P0. Repair the release pipeline

1. Split the 15-minute `delivery-and-rules` job or raise its timeout with a
   measured ceiling. The current run reached `verify:connections` and was
   cancelled during its determinism/pin work; the browser job was skipped.
2. Decide whether `verify:connections` should regenerate expensive dealer
   context in ordinary CI or validate the checked-in bake with a faster path,
   keeping the exhaustive 20 GB author-time audit as a content-wave gate.
3. Update the GitHub actions that now emit a deprecated Node-runtime warning.
4. Align the runtime contract: CI explicitly uses Node 22 while the linked Vercel
   project currently builds with Node 24. Pick one supported version and pin it
   in repository/project metadata.
5. Require a green branch/PR check before the next production deploy. The current
   deploy is healthy, but it was published from a branch whose CI later timed out.

### P0. Reconcile the live plan with reality

1. `docs/master-plan.md` still says Wave 3 is locally complete and not published;
   it is now committed, pushed, and deployed.
2. The P1 ledger says complete, but §9 P1 still includes uncompleted operational
   work: error monitoring, Web Vitals receipt, spend ceiling, rollback, and the
   eventual versioned card-art manifest.
3. The old post-SEND fix slice mixes fixed and unresolved items. Re-baseline it
   against current code instead of executing the July list blindly.
4. Record this audit as the new production-polish backlog and make its priority
   order the resume point.

## High-priority visual and product work

### P1. Build real desktop compositions

This is the most visible product-polish gap.

- **Menu:** replace the 420px shell and 300px card stack with a true desktop
  launch surface. A two-column or 2×2 mode grid can preserve the same ticket
  cards while adding a primary daily recommendation, recent status, and clearer
  daily-versus-practice hierarchy.
- **Daily Puzzle:** keep the pile and rack, but use the 760–1100px stage. Enlarge
  the active pile card, move the instruction closer to the action, and reduce the
  empty vertical distance between pile and hand.
- **Chronology:** widen the reel, scale the raised card, and replace the tiny
  ten-card fan with a desktop tray/rail that exposes more readable titles. Make
  the end gaps visually unmistakable without changing their hit testing.
- **Connections:** this is closest to done. Consider a modest board increase or a
  split composition with bill/progress on one side; do not inflate it until it
  becomes slower to scan.
- **Duel:** stop treating the 420px board as a lit phone screen. Use the desktop
  width for separate score/CPU, marquee/deck, action explanation, meld shelf, and
  player-hand zones. Keep all game state and rules untouched and make surgical
  changes in `DuelGame.tsx`.

### P1. Establish readable type floors

Current code still uses 6px Solo stat labels, 7–10px card and utility copy, 8px
practice subtitles, and 9px instructional labels. The display face is strong,
but the information required to play should not depend on microtype.

Recommended production floor:

- 14–16px for explanatory/body copy;
- 12px for essential utility labels and card metadata;
- 10px only for genuinely secondary decoration, never the only instruction;
- larger title treatment for the active/raised card than for hand inventory;
- tabular numerals for every changing score/count so the layout does not tick.

This is a readability recommendation, not a claim of a specific WCAG font-size
failure. Contrast and zoom behavior still need instrumented testing.

### P1. Fix modal and result ergonomics

- The compact How to Play panel is scrollable, so its CTA is reachable, but at
  375×667 the amber `Got it — deal me in` button begins below the first viewport.
  Use a sticky compact footer or a shorter summary so the primary exit is visible
  without discovery scrolling.
- At desktop, How to Play remains a 420px full-height strip with a large empty
  lower field. Use a centered, bounded modal or a two-column rules layout.
- Connections' result panel passes at 375×667 and desktop; preserve it as the
  reference for the other result surfaces.
- Re-capture Solo, Chronology, and Duel terminal states at 375×667, 390×844, and
  desktop. Long Duel recap content is the highest clipping risk.

### P1. Clarify the interaction hierarchy

- **Menu:** four equal-weight mode tickets provide no obvious recommended daily
  start. Make one daily CTA primary while keeping all modes accessible.
- **Daily Puzzle:** the middle of the stage is visually empty and the instruction
  is disconnected from both the pile and rack. Make the empty space explain the
  next move or shrink it.
- **Chronology:** the hand fan communicates “cards” but not “ten readable choices.”
  The selected card becomes clear, but the two legal gap targets are visually
  thin compared with the raised ticket.
- **Duel:** the player must parse score race, CPU booth, tokens, two marquee
  cards, deck, one-move banner, Final Cut/Recast/Meld, Sort/Hint, and seven hand
  cards at once. Group actions by the decision they support and progressively
  reveal advanced actions.
- **Connections:** retain the current bill, board, inline feedback, and result
  sequence. It is the best model for one clear object plus one clear action row.

### P1. Finish the shared icon and motion pass

- Replace functional glyphs such as `‹`, `?`, `↺`, `⇄`, `⇲`, and `◎` with the
  planned local SVG icon family while keeping daily share emoji unchanged.
- Preserve the current 44px interaction halo and semantic labels.
- Apply the shared press, deal, settle, and reveal motion tokens consistently.
- Remove motion that delays targeting. A rapid selection should never land on a
  card that moved after the user committed the input.
- Recheck all transitions with reduced motion and keyboard focus visible.

## Accessibility and responsive verification still required

### Confirmed strengths

- Native buttons are used for primary game interactions.
- Connections tiles expose movie labels and pressed state.
- Chronology gaps have descriptive accessible names.
- Dialog roles, modal state, initial focus, focus trapping, and Escape behavior
  are implemented through a shared hook.
- Focus-visible styling and 44px targets exist.
- The viewport permits pinch zoom.

### Risks to test, not assume

1. `html` and `body` are globally `overflow: hidden`, while screens use fixed
   `100dvh` and nested scroll containers. Verify keyboard and 200% zoom users can
   reach every control without scroll trapping.
2. Run VoiceOver and TalkBack on real devices. DOM labels are promising but do
   not prove reading order, live-region timing, or rotor usability.
3. Run keyboard-only full games, especially Duel's raised-card, flip, draw,
   modal, meld, and end-screen paths.
4. Measure text/background contrast for amber microcopy, slate-on-paper labels,
   disabled controls, and the washed background behind result dialogs.
5. Verify all modes at 200% browser zoom and text enlargement. The screenshots
   show many visual labels below a comfortable reading size.
6. Validate orientation changes and safe-area behavior on a real iPhone and
   Android device, not only emulated CSS viewports.
7. Verify that status changes remain announced once and do not fight motion or
   focus movement.

## Production operations still outstanding

### Required before a public launch

- Green CI that completes build, budgets, 64/64, 8/8, 42/42, 14/14, and browser
  smoke within an intentional runtime budget.
- Production error monitoring and a tested alert path.
- Web Vitals collection and a real production receipt check.
- Manual verification that `mode_start`, `mode_finish`, and `share` arrive in
  the production analytics dashboard; client queueing alone is insufficient.
- A documented one-command rollback and a practiced rollback drill.
- A monthly spend alert and hard ceiling.
- Cold-4G and warm-repeat performance measurements after the icon/motion pass.
- Credits and privacy surfaces, including analytics retention language.
- A decision on TMDB commercial terms before monetization.
- A launch-switch checklist for removing `noindex`, adding the URL to shares,
  and choosing the public front door.
- A release convention: merge through a green PR/main branch, tag the release,
  deploy the intended SHA, and verify the custom domain and one real game flow.

### Optional after retention evidence

- Anonymous daily leaderboard with server-derived seeds, validated score
  receipts, rate limits, moderation, and delete tooling.
- Presentation-only Duel personas over the existing difficulty profiles.
- The 18–24-card art pilot, then a versioned/provenance-tracked art pipeline.
- Full 482-card art production only after the pilot survives crop, recognition,
  performance, and rights review.
- Further movie expansion only after the launch gate. The 1970s, War, and Western
  content gaps are real but not the current readiness constraint.
- The P2 pool-lock decisions: Chronology pin, Solo/Duel pool cutover, Duel
  re-tune, and Connections diversity floor.

## Where the project is in the master plan

| Plan phase | Honest current status | What remains |
|---|---|---|
| P0 direction | Done | Premiere Reel selected; current screenshots prove the mobile direction |
| P1 delivery foundations | Mostly built, currently failing as a CI gate | CI runtime repair, Node alignment, monitoring, rollback, spend ceiling, future art manifest |
| P2 shared system | Partial | Tokens/header/card grammar exist; icon replacement, full motion consistency, readable type floors, responsive card variants remain |
| P3 mode waves | Partial | Mobile Chronology, Daily Puzzle, and Connections have strong passes; menu, Duel, desktop, modal, and cross-mode end-state work remain |
| P4 personas | Not started | Presentation spec and user comprehension test; no difficulty-knob changes initially |
| P5 art pilot | Not production-ready | Select 18–24 films, generate/commission controlled variants, create manifest/provenance/crop QA, approve before scale |
| P6 measurement | Hooks only | Production receipts, complete taxonomy, funnel dashboard, privacy/retention note |
| P7 leaderboard | Not started | Optional backend and abuse/privacy operations |
| P8 launch gate | Not started | Real devices, accessibility, performance, monitoring, rollback, privacy, rights, URL/share/noindex switch, final approval |

## Recommended execution sequence

### Wave 1 — release health and plan truth

Fix CI timeout/action warnings, align Node, update the live ledger for the Wave 3
deployment, and write the release/rollback checklist. No visual changes.

### Wave 2 — desktop shell and menu

Create desktop layouts for the menu and shared daily shell first. Approve one
real 1440×900 composition before applying it to every mode. Keep the existing
phone compositions intact.

### Wave 3 — Daily Puzzle and Chronology production polish

Enlarge the active object, shrink meaningless voids, improve hand/tray title
readability, strengthen Chronology gap affordances, and capture terminal states.

### Wave 4 — Duel comprehension and shared UI finish

Recompose Duel for desktop and small phones without changing mechanics. Finish
icons, motion, type floors, How to Play, and every result state.

### Wave 5 — attended accessibility and launch operations

Run real-device iPhone/Android, keyboard, VoiceOver/TalkBack, 200% zoom,
contrast, reduced-motion, cold-4G, analytics receipt, error-alert, rollback, and
spend-limit gates. Only then decide whether leaderboard, personas, or art pilot
belongs before the public launch.

## Current-run evidence and step health

### Step 1 — menu on phone: healthy, minor hierarchy work

The four modes are readable and reachable. The mode list is dense but coherent;
the missing piece is a primary recommendation and stronger daily/practice
hierarchy.

![Menu at 390 by 844](../audit/production-polish-2026-08-08/01-menu-mobile-390x844.png)

### Step 2 — menu on desktop: needs major work

The app remains a 420px shell with 300px cards, leaving most of a 1440px screen
unused.

![Menu at 1440 by 900](../audit/production-polish-2026-08-08/02-menu-desktop-1440x900.png)

### Step 3 — Daily Puzzle: phone healthy, desktop needs major work

The mobile rack is clear and cinematic. Desktop keeps phone-scale cards and
creates an oversized empty interval between the active pile and hand.

![Daily Puzzle at 390 by 844](../audit/production-polish-2026-08-08/03-daily-puzzle-mobile-390x844.png)

![Daily Puzzle at 1440 by 900](../audit/production-polish-2026-08-08/04-daily-puzzle-desktop-1440x900.png)

### Step 4 — Chronology: direction is good, choice readability needs work

The reel and raised card are clear. The ten-card fan turns titles into slivers,
and desktop does not use its extra width to improve the choice tray or reel.

![Chronology initial at 390 by 844](../audit/production-polish-2026-08-08/05-chronology-mobile-390x844.png)

![Chronology raised card at 390 by 844](../audit/production-polish-2026-08-08/06-chronology-raised-mobile-390x844.png)

![Chronology raised card at 1440 by 900](../audit/production-polish-2026-08-08/07-chronology-desktop-1440x900.png)

### Step 5 — Connections board: healthy, strongest reference surface

The 375×667 layout fits all persistent controls. The 390×844 layout introduces
more top breathing room than it needs, while desktop is conservative but still
usable.

![Connections at 390 by 844](../audit/production-polish-2026-08-08/08-connections-mobile-390x844.png)

![Connections at 375 by 667](../audit/production-polish-2026-08-08/09-connections-compact-375x667.png)

![Connections at 1440 by 900](../audit/production-polish-2026-08-08/10-connections-desktop-1440x900.png)

### Step 6 — Connections result: healthy

The result ticket fits the compact viewport, gives the outcome first, and keeps
share, reveal, replay, and menu actions reachable. It should be the shared result
benchmark.

![Connections result at 375 by 667](../audit/production-polish-2026-08-08/11-connections-result-375x667.png)

![Connections result at 1440 by 900](../audit/production-polish-2026-08-08/12-connections-result-desktop-1440x900.png)

### Step 7 — Duel board: high product risk

The small-phone board is visually busy, uses very small card text, separates
related controls, and partially hides the fan by design. Desktop preserves the
same 420px board inside decorative side rails, so the complexity remains while
the available width is unused.

![Duel at 375 by 667](../audit/production-polish-2026-08-08/13-duel-compact-375x667.png)

![Duel at 1440 by 900](../audit/production-polish-2026-08-08/14-duel-desktop-1440x900.png)

### Step 8 — How to Play: reachable, needs responsive polish

Desktop is a narrow full-height rules strip with unused space. At 375×667 the
primary CTA begins below the first viewport, but the content scrolls and the CTA
is reachable; this is a discovery/polish issue rather than an unreachable-control
failure.

![How to Play at 1440 by 900](../audit/production-polish-2026-08-08/15-duel-help-desktop-1440x900.png)

![How to Play first viewport at 375 by 667](../audit/production-polish-2026-08-08/16-duel-help-compact-375x667.png)

![How to Play scrolled at 375 by 667](../audit/production-polish-2026-08-08/17-duel-help-compact-scrolled-375x667.png)

## Evidence limits

- This run captured menu, initial and active Daily/Chronology states,
  Connections failure/reveal/results, Duel initial state, and How to Play.
- Solo, Chronology, and Duel terminal screens were not manually played to
  completion in this audit. They remain named verification work rather than
  assumed passes.
- Screenshots and DOM semantics cannot prove full WCAG conformance, real-device
  performance, screen-reader behavior, contrast ratios, or analytics receipt.
- No code was changed, so no build or simulation suite was rerun for this audit.
  The current release's local gate results come from the committed Wave 3 report;
  the current GitHub CI status was checked live and is cancelled due to timeout.
