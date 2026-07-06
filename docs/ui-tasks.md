> ⛔ **SUPERSEDED 2026-07-06 by [`master-plan.md`](master-plan.md) — the only live plan.**
> Kept for history; do not update. Checkbox state as of 7ef95aa was absorbed into
> master-plan.md §1/§6 (old "Wave 0/A–D" numbering retired; wire notes carried
> into W1/W2 specs).

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
- **✅ DIRECTION RULED (Buri, 2026-07-05): "The Stub" —
  `design_handoff_the_stub/` is the visual source of truth.** The UI-PRD's
  §10 A–D add-ons are SUPERSEDED (none chosen; the Stub is the direction).
  Briefing split: visual language, tokens, and screen fidelity come from the
  handoff (README "Design Tokens" + screens 7a–7f, high-fidelity, "recreate
  pixel-perfectly"); the UI-PRD stays the briefing source for what the
  handoff doesn't cover — §4 desktop 1440×900 layout requirements, §5 gaps,
  S5/S6 solo–chronology structure. Where they conflict on mobile duel
  visuals, the handoff wins.
- **Stub ↔ FORGE mapping** (briefs cite these): ScoreRace = 7a header race
  bar (tug-of-war track) · TazCorner = 7a opponent booth / 7e ticket strip ·
  MeldShelf = 7a meld shelf chips · RecastOffer = 7c (confirms the
  orchestrator ruling: the suspense modal) · RecapReel = 7d ticket-stub
  recap · PlayBanner = 7a last-play line + turn pill · TokenChips = FINAL
  CUT/RECAST pills (disabled = #9AA5AD + strikethrough, never hidden) ·
  DrawChoice + IdleCue = not in the six screens; extrapolate from the token
  language, flag drift to the orchestrator. Lay-off picker (7b) styles the
  existing bottom-sheet flow. Desktop re-architecture (Wave C) is
  UI-PRD-driven within Stub language — the handoff is mobile-first.
- Card art: the three `reference/uploads/*.png` are style references only in
  this build — PLAN.md WS3 rules NO scene art this build (typographic faces;
  scene-only art constraint per the Stub assessment).
- CARDS lane (`src/components/Card.tsx`) untouched per plan §2.

## Wave 0 — foundation (in progress)

- [x] **Direction + TOKENS** — landed 2026-07-05: direction = The Stub
      (ruled above); 25 @theme tokens (14 stub-* colors incl. scrim, 5
      radii, 5 shadows/glows, 3 font stacks) + 11 custom props (7 z-layers,
      4 motion durations) + texture recipes as comments, all INERT (no
      stub-* class referenced yet; JIT emits zero bytes; menu
      pixel-identical before/after; activation probe verified utilities
      compile, then reverted). README vs 7f checksum: zero disagreements.
- [x] **Contract extraction** — `docs/ui-contracts.md` landed 2026-07-05:
      5 zones clean (ScoreRace, DrawChoice, PlayBanner, IdleCue, RecapReel),
      3 with flagged risks (TazCorner layoutId coupling · MeldShelf's 4
      meld-writers + `meldRowRefs` DOM plumbing · TokenChips is two blocks),
      RecastOffer ambiguity ruled by the orchestrator (see above).
- [x] **Preview harness** — landed 2026-07-05: DEV-gated `?preview=<name>`
      in `main.tsx` (+51/−6) + `previews/Sample.preview.tsx`; tsc clean,
      prod bundle byte-identical (439.94 kB), sample renders, unknown name
      lists available previews.

## Wave A — hero skeleton + first forge batch (IN PROGRESS @ 2026-07-05 wind-down)

- [~] HERO: flex-zone pass LANDED (DuelGame.tsx: container → flex column
      w/ pb-[225px] fan reservation; CPU hand + piles in flow; NEW
      data-mid-band flex-1 zone anchors banner/idle-cue; magic tops
      64/160/372/398 GONE; MeldZone.tsx shelf in flow — top-[440px] gone,
      the 667px collision cause; z-vars adopted: resting/traveling/hud/
      contextual(55→50)/overlay; z-20 backdrop + z-[85]/[90]/[100] modals
      deliberately left above-scale until the overlay wave). Verified:
      build clean · verify 64/64 · solo 8/8 · chronology 42/42 · 390×844
      browser screenshot correct (all zones placed, take-glow live).
      ⛔ REMAINING: 375×667 stress-test screenshot + a played-through game
      at both sizes (wind-down interrupted exactly here). Do this FIRST
      next session before calling the task done.
- [x] FORGE `ScoreRace.tsx` (254 ln) + preview — tsc clean; agent verified
      compile/JIT-level only (no rendered screenshot) — eyeball
      ?preview=ScoreRace at wire time. RULING: turn caption stays INSIDE
      ScoreRace (contract over brief prose).
- [x] FORGE `TazCorner.tsx` (189 ln) + preview — browser-verified by agent;
      pip layoutId={id} namespace preserved. WIRE NOTE: needs a `quote`
      prop fed from the say() message state (old zone had no quote).
- [x] FORGE `PlayBanner.tsx` (119 ln, + LastPlayLine/TurnPill exports),
      `TokenChips.tsx` (92 ln, side prop, Meld button excluded),
      `IdleCue.tsx` (30 ln, visible-boolean boundary) + previews — tsc
      clean, HTTP/transform-verified; eyeball previews at wire time.
      WIRE NOTE: player Final Cut say() side-effect stays in parent
      (onToggleFinalCut is pure).
- [ ] Wave A close-out: 667px verify (above) → full-suite re-run →
      screenshot set to scratchpad → wave commit finalized. FORGE
      components are UNWIRED (inert) until Wave B.
- [ ] CONTENT: A4 pool unification implementation (design signed off,
      docs/pool-unification.md, byte-identical JSON = go/no-go) — did NOT
      run this wave; ride it along Wave B, BEFORE Stage B.

### Carried type-lift suggestion (orchestrator queue, not urgent)
Tokens / DuelStatus / RunState are declared inside DuelGame.tsx; ScoreRace
and TazCorner redeclare them structurally per contract. At a natural wire
pass, lift to src/lib/ so components share one source — do NOT do it as a
standalone DuelGame edit.

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
