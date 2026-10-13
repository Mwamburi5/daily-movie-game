# 07 — UI and design

**Last verified:** 2026-09-13 on `codex/handoff-refresh-2026-09-13` (from main 8100e29)

## Design system: "The Stub"

Ruled as the visual direction on 2026-07-05 (Buri chose it over the UI-PRD's
four §10 directions after seeing mockups). The source of truth is
**`design_handoff_the_stub/README.md`** (token table, rendered as screen 7f) and
the six reference PNGs in `design_handoff_the_stub/design_handoff_screenshots/`.
The tokens are implemented in `src/index.css` as Tailwind 4 `@theme` variables
(`--color-stub-*`, `--space-stub-*`, `--radius-stub-*`, `--font-stub-*`,
`--shadow-stub-*`, `--z-*`, `--dur-*`).

| Token | Value | Rule |
|---|---|---|
| canvas cream | `#F0EBD8` | page background (the marketing/paper cream `#F4EFE6` is the OG-card layer) |
| paper | `#FCF9F8` | cards and panels |
| ink navy | `#1F3A52` (mid `#41586E`) | primary ink, headers, 2px borders everywhere; no bevels or gradients |
| **action amber** | `#CF952A` | the **only** action/highlight color: primary buttons, TAKE, eligible rows, glows. Never a background wash |
| slate | `#5B6B7A` / `#8FA6BC` / `#B9C8D6` | labels / muted / opponent score |
| hint teal | `#2C89A1` | hint affordance only |
| alert red | `#A02C2C` | negative deltas, warnings |
| disabled | `#9AA5AD` | always with strikethrough on spent tokens |
| genre-pip plum | `#58486C` | derived token minted 2026-07-06 for the card genre spine |
| Display type | **Domine 700** | titles, scores. Domine has **no tabular numerals**: ticking numbers use `FixedDigits` (per-digit 1ch boxes), README amended 2026-07-17 |
| UI type | **Inter 400–800** | body, pills (800) |
| Label type | **JetBrains Mono 600–700** | ALL CAPS, letter-spacing .06–.18em |
| Radii | header 24 (bottom only) · panels 14 · cards 12 · thumbs 6 · pills 999 | |
| Motion | springs stiffness 320 / damping 24; all interactions ≤400 ms; deal stagger 60 ms; reduced-motion → 150 ms crossfades | `src/lib/motion.ts` |
| Z-layers | 0 canvas · 10 resting cards · 20 shelf/booth · 30 traveling/raised · 40 HUD · 50 contextual bars · 60 overlays | |

Signature motifs: ticket-stub notches (12–14 px canvas-colored circles punched
into edges), paper-diorama stacks behind booths and modals, an amber/cream
awning strip, halftone dot texture, "ADMIT ONE" and dotted perforation on cards.
Fonts are self-hosted in `public/fonts/` (latin-subset woff2, `font-display: swap`,
deliberately not preloaded because Safari reports false "unused" warnings).

Two rules that constrain every future UI change:

- **Card faces are typographic.** The one card frame (`StubCard`) renders title,
  year, genre spine, credit ledger, DEEP CUT stamp; the art slot is a monogram
  lockup. Scene art is a parked track (`design/` specs); baked art must never
  ship because it leaks year and point values.
- **Cohesion + extrapolation.** The six Duel comps are the element library; the
  menu, Solo, Chronology, Connections, rules, and draw-choice surfaces were
  composed from the same elements and tagged EXTRAPOLATED at their checkpoints.
  No Chronology-board or menu comp exists; Buri approved the extrapolations.

Brand: player-facing name **Match Cut**; wordmark upright Domine in-app, bold
italic serif on the social card (an image asset until re-set); voice lines
"Four movie games, one daily ritual" / "Make the connection." / "Connect movies
by the people who made them." In-game `say()` messages are lowercase and
informal. Marketing layer (OG card, mode spines): navy `#17364E`, gold `#DDA321`,
spines gold / teal `#6EA6A0` / rose `#B66B79` / purple `#755B99` for Daily /
Chronology / Connections / Duel. The **amber pick** for promo (`#CF952A` game vs
`#DDA321` marketing) is deferred to promo Phase 1.

## Screens / surfaces

| Screen | File | Spec | Status |
|---|---|---|---|
| Menu (program) | `src/App.tsx` | extrapolated; polish Phase 2 (2×2 desktop, phone stack) | shipped; order Daily → Chronology → Connections → Duel since 2026-08-07 |
| First-run onboarding (4 static screens) | `src/components/Onboarding.tsx` | polish "first-run welcome" 2026-08-24 | shipped |
| How to Play (per-mode sheet + About/privacy + TMDB attribution) | `src/components/HowToPlay.tsx` | polish Phase 1 | shipped; Chronology sheet still says "exact date" (open copy fix) |
| Daily Puzzle board | `src/SoloGame.tsx`, `Hand.tsx`, `StubCard.tsx` | extrapolated; polish Phase 2 (4+3 rack, desktop zones) | shipped |
| Duel board (7a), lay-off picker (7b), recast overlay (7c), recap (7d), small-phone (7e) | `src/DuelGame.tsx` + `ScoreRace`, `TazCorner`, `PlayBanner`, `TokenChips`, `IdleCue`, `MeldShelf`, `DrawChoice`, `RecastOffer`, `RecapReel` | the six reference PNGs | shipped W1–W3; desktop "theater" at ≥1024px; 7b lay-off picker flow is forged but **unwired** (no such flow in the game) |
| Chronology board + "reel" | `src/ChronologyGame.tsx`, `ChronoCard.tsx` | `design/chronology.md`; reel redesign plan 2026-07-12; polish Phase 1 title-first tray | shipped (reel polish 2026-08-07) |
| Connections grid | `src/ConnectionsGame.tsx` | extrapolated (title-only tickets, four band colors) | shipped; six long titles still break mid-word |
| Results / share | `Results.tsx`, `ResultMeaning.tsx`, `ResultActions.tsx`, `ShareCopy.tsx` | 7d generalized; polish Phase 4 | shipped; CTA order copy → replay → menu |
| Icons | `Icon.tsx` | zero-dep local SVG family (§7·8 icon pass) | shipped in polish Phase 4 |
| Social/OG card | `public/social-preview.png` (+ `.svg`) | Goal 5, 1200×630 | live on production since Approval 4 |
| Favicon / touch icon | `public/favicon.svg`, `-32.png`, `apple-touch-icon.png` | §7·7c ticket-stub mark | shipped 2026-07-17 |

Contract sizes: every UI checkpoint captures **390×844** and **375×667** (iPhone
SE floor). Polish added 768×1024, 1280×720, 1440×900 and 200% zoom. Touch
targets ≥44 px. The dedicated 375×667 layout pass proposed for launch (D11)
was skipped on 2026-09-13; the size stays a checkpoint requirement for any
future UI wave.

## Design sources

| Source | Path | Notes |
|---|---|---|
| Stub handoff (tokens + screen specs) | `design_handoff_the_stub/README.md` | live source of truth |
| Stub screens as HTML | `design_handoff_the_stub/reference/the-stub-screens.html` | inspectable CSS; Marquee-branded; menu flagged undone in its footer |
| Reference PNGs 7a–7f | `design_handoff_the_stub/design_handoff_screenshots/` | the acceptance set (exported by Buri 2026-07-06) |
| Card art references | `design_handoff_the_stub/reference/uploads/` (3), `design/reference/` (4) | style references only |
| Card-art production specs (parked) | `design/card-design-system.md`, `card-template-contract.md`, `card-spec-A-*.md`, `card-spec-C-*.md`, `card-art-prompt.md`, `pilot-batch-01-*.md`, `scripts/gen-pilot-cards.py` | Pilot = 18–24 posterless cards, master-plan §9 P5, post-launch |
| Chronology design spec | `design/chronology.md` | locked design of record for Mode 3 |
| UI PRD | `design/UI-PRD.md` | §4 desktop layout + §5 gaps still briefing sources; §10 A–D superseded |
| 2026-08-07 concept set (three Chronology compositions) | referenced in master-plan §9; `docs/card-redesign-proposal.html` may be related | UNVERIFIED which file holds the images |
| Promo brand sheet + shot list | `promo/brand-sheet.md`, `promo/shot-list.md` | tracked since PR #16; awaiting Buri's red pen |
| Canva mockups | `promo/canva-mockups/` (9 PNG) + `canva-mockups-manifest.md` | Canva folder "Match Cut Promo" `FAHT85UIB58`; design IDs in the manifest and memory `marquee-promo-track` |
| Figma | none | no Figma files exist for this project |

## Design QA and audits

| Date | What | Verdict | Where |
|---|---|---|---|
| 2026-07-06 → 07-10 | W1–W5 checkpoints (side-by-sides vs 7a–7f at both sizes) | all approved by Buri | master-plan §6 Ledger; commits fe61a3f, 23f43e0, da52c49, 6d88362, 09a02d0, d41db69 |
| 2026-07-12 | Live UX/visual/a11y review of matchcutdaily.com | findings folded into feedback batch 1 | `audit/live-review-2026-07-12/AUDIT.md` |
| 2026-07-17 | Feedback batch-1 checkpoint | "everything looks good" (Buri hands-on) | commit 481768a |
| 2026-08-07 | Status and readiness review; Chronology reel + Connections design QA | feature-complete for quiet launch | `audit/status-review-2026-08-07/AUDIT.md`; `audit/design-qa-*` |
| 2026-08-08 → 08-09 | Production polish audit → Phases 1–4 QA | Phases 1–3 approved; Phase 4 "final result: passed" | `docs/production-polish-audit-2026-08-08.md`, `-design-qa.md`, `design-qa.md`; `audit/production-polish-*` |
| 2026-08-18 | Goal 2 shared UI, Goal 3 mode-specific onboarding | approved | `docs/goal-2-shared-ui-qa.md`, `goal-3-mode-specific-qa.md` |
| 2026-08-19 | Goal 5 public-launch acceptance (viewport matrix, social card, Safari, VoiceOver spot-check) | approved for that candidate | `docs/goal-5-public-launch-acceptance.md` |
| 2026-08-26/27 | 216+16 full review (50 shots) + now-fix pass | fixes accepted | `docs/daily-duel-216-full-review-report.md`; `audit/daily-duel-216-*` |
| 2026-09-03 | Pre-launch review B (player-facing polish sweep, 90 shots) | 12 copy/a11y one-liners → PR #12; four 375×667 items deferred (D11; ruled 2026-09-13: skipped for launch) | `audit/…/prelaunch-review-2026-09-03/review-B-polish.md` |

## Screenshots and verification

- Evidence lives under **`audit/<pass>-<date>/`** with a `manifest.md` per pass;
  gitignored except the force-added launch-readiness and production-deploy sets.
- Naming: `NN-<surface>-<WxH>-<state>.png` (e.g. `05-chronology-390x844-after-start.png`);
  Approval passes use `p<phase>-<what>.png`.
- Playwright output (`output/playwright/`) is local and regenerable.
- Session scratchpads hold ad-hoc side-by-sides; anything that matters is
  copied into `audit/`.
- The production smoke driver writes a screenshot per mode terminal plus a
  matrix `.md/.json` (`scripts/prod-smoke.mjs --out`).

## Design decisions that constrain UI work

See [04-decisions.md](04-decisions.md) for the full log. The ones that bite:
Stub is the direction (2026-07-05) · one live plan and gate-split checkpoints
(07-06) · cohesion + extrapolation (07-06) · typographic faces (07-06) ·
Connections tiles are not StubCards (07-07) · flip-to-peek stays (07-07) ·
"name is the hero" titles (07-09) · UI-overhaul intake filter "does this glyph
carry the ticket-stub voice or fight it?" (07-10) · hand-fan rail token deviation
ratified (07-17) · Domine numerals via FixedDigits (07-17) · menu order (08-07) ·
menu gzip budget 104 KiB (09-03) · small-phone pass D11 deferred unless it ships
with Approval 5 (09-03).
