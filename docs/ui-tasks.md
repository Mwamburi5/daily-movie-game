# UI redesign — wave/task checklist (orchestration Step 0 snapshot)

> Written 2026-07-05 per docs/orchestration-plan.md Step 0. Format follows
> docs/chronology-tasks.md: checkbox per task, one acceptance line each.
> The orchestrator updates checkboxes in the same commit as each wave.

## Step 0 reconciliation (read this before trusting the plan's assumptions)

- **The user checkpoint "Wave 1 DONE / Wave 2 at task A3" referred to the
  CONTENT waves under PLAN.md Amendment 1, not UI waves.** A3 (wave-2
  cross-check → arbitration → merge) FINISHED to its gate 2026-07-05:
  MOVIES=237, full sweep green, tune byte-identical, yield 9.86M/≈3.05M
  strict (docs/wave2-diffs.md). There is no half-edited DuelGame.tsx.
- **No UI redesign work has started.** No UI wave has run; every §5 task
  below is open. `DuelGame.tsx` is currently 1,989 lines / 31 useState.
- **Corrected gate numbers** (plan §6.3 cites a stale 60/60): the full suite
  is `npm run verify` **64/64** · `verify:solo` **8/8** · `verify:chronology`
  **42/42** · `npm run build` clean; content edits to the frozen 89 addi-
  tionally require `npm run eval -- tune 8000 --seed=1` ≈ 66.7/49.2/43.5.
- **RESOLVED: the UI-PRD is `design/UI-PRD.md`** (was in design/, not docs/;
  present since the initial commit). "Recast offer" is real repo vocabulary —
  DuelGame.tsx's own `RecastOffer` type (the CPU super-link/Final-Cut
  suspense modal, `:1824–1866`). **Orchestrator ruling:** FORGE
  `RecastOffer.tsx` targets that modal; the take-to-meld glow (`:1438–1484`)
  is NOT in its scope (recently user-tuned, Matinee-gated, stays inline).
- **⛔ Remaining Wave-0 blocker: the §10 visual direction (A–D) was never
  chosen.** User is reviewing examples; TOKENS and all restyle briefs hold
  until the choice is recorded here.
- Relationship note: `design_handoff_the_stub/` predates the UI-PRD; the
  PRD is the briefing source, the handoff stays reference material.
- CARDS lane (`src/components/Card.tsx`) untouched per plan §2.

## Wave 0 — foundation (in progress)

- [ ] **Direction + TOKENS** (Sonnet) — ⛔ blocked on UI-PRD + direction
      choice. Acceptance: token system (palette, radii, shadows, named
      z-layers, timing) in `src/index.css`; direction recorded here.
- [x] **Contract extraction** — `docs/ui-contracts.md` landed 2026-07-05:
      5 zones clean (ScoreRace, DrawChoice, PlayBanner, IdleCue, RecapReel),
      3 with flagged risks (TazCorner layoutId coupling · MeldShelf's 4
      meld-writers + `meldRowRefs` DOM plumbing · TokenChips is two blocks),
      RecastOffer ambiguity ruled by the orchestrator (see above).
- [x] **Preview harness** — landed 2026-07-05: DEV-gated `?preview=<name>`
      in `main.tsx` (+51/−6) + `previews/Sample.preview.tsx`; tsc clean,
      prod bundle byte-identical (439.94 kB), sample renders, unknown name
      lists available previews.

## Wave A — hero skeleton + first forge batch

- [ ] HERO: flex-zone layout + z-layer adoption in the duel board; 667px
      stress test passes (Fable).
- [ ] FORGE `ScoreRace.tsx` (Opus) — race-to-20 track per contract + preview.
- [ ] FORGE `TazCorner.tsx` (Opus) — opponent nameplate/fan/count/tokens.
- [ ] FORGE `PlayBanner.tsx` + `TokenChips.tsx` + `IdleCue.tsx` (Sonnet).
- [ ] CONTENT: Stage B kickoff (docs/stage-b-plan.md) — ⚠ sequence note:
      A4 pool unification (design signed off, docs/pool-unification.md)
      lands FIRST; it owns scripts/ + src/data and Stage B builds on it.

## Wave B — wire batch 1 + second forge batch

- [ ] HERO/WIRE: mount ScoreRace + TazCorner + PlayBanner/chips (Fable).
- [ ] FORGE `MeldShelf.tsx` (Opus) · `RecastOffer.tsx` (Opus) ·
      `DrawChoice.tsx` (Opus).
- [ ] MENU (S1) restyle on tokens (Sonnet).
- [ ] SHELL: `Hand.tsx` fan/raise restyle (Opus; wired next wave).

## Wave C — wire batch 2 + desktop

- [ ] HERO/WIRE: mount MeldShelf + overlays + restyled Hand; retire inline
      MeldZone usage (Fable).
- [ ] HERO: desktop 1440×900 real-table re-architecture (Fable).
- [ ] FORGE `RecapReel.tsx` (Opus).
- [ ] SOLO redesign pass (Opus) · CHRONO redesign pass (Opus).

## Wave D — finish

- [ ] HERO/WIRE: recap with RecapReel; motion/feel pass; double-tap
      "Allow it" re-entry guard (Fable).
- [ ] SHELL: HowToPlay + ShareCopy restyle (Sonnet) — note: HowToPlay now
      carries the TMDB attribution section (keep it).
- [ ] DOCS: RULEBOOK/README sweep (Sonnet) · stress-test screenshots.
- [ ] Orchestrator → user: D1 draw-3 discard visibility decision · deploy OK.

## CONTENT lane (rides along; pre-existing Amendment 1 track)

- [x] Wave 1 merge (89→163) — 2026-07-05, gates green.
- [x] Wave 2 merge (163→237) — 2026-07-05, gates green, tune byte-identical.
- [x] Chronology date audit batch 1 — 5 fixes, 9 ledgered, attribution UI in.
- [ ] A4 pool unification implementation — design signed off; byte-identical
      rebuilt chronology-pool.json is the go/no-go.
- [ ] Stage B growth 162 → 300–500 dated films (after A4, per
      docs/stage-b-plan.md; decade batches, floor raised 20→35→50).
