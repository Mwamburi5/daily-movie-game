# MATCH CUT — MASTER PLAN (v1 · 2026-07-06)

> **This is the only live plan.** It supersedes `PLAN.md`, `docs/orchestration-plan.md`,
> and `docs/ui-tasks.md` (bannered; kept for history, never updated again). Domain
> contracts stay canonical in their own files: `sim/RULESET.md` (rules),
> `RULEBOOK.md` (player guide), `docs/ui-contracts.md` (props contracts),
> `docs/tmdb-rulings.md` (content arbitration ledger, append-only),
> `design_handoff_the_stub/README.md` (visual tokens). `design/UI-PRD.md` remains a
> briefing source **only** for §4 (desktop 1440×900) and §5 (gaps); its §10 A–D are
> superseded by the Stub ruling. `docs/pool-unification.md` and `docs/stage-b-plan.md`
> are absorbed as P1/P2 below and retire when executed.
>
> **To resume work in any session: paste the Master Prompt (§8).** The Ledger (§6)
> is the single resume sheet. The user-input queue (§7) is everything only Buri
> can provide.

## 0. Finish line (ruled by Buri, 2026-07-06)

All four modes — **Solo, Duel, Chronology, Connections** — playable on the Stub UI ·
one unified TMDB-audited movie pool feeding all modes · per-mode sims/verifies
producing hard tuning data · RULEBOOK current · quiet-launch deploy ready
(**deploy is always Buri's button**). Front door picked by interviews ~2 weeks
after SEND.

**Explicitly deferred (unchanged from the 2026-07-04 grill):** scene card art at
scale (track PARKED; see §5 risks) · any fairness/rule change · front-door
commitment · backend/leaderboards · URL-in-share (launch switch) · Duel pool
growth/retune · a Duel daily seed (never planned; raise separately if wanted).

## 1. Ground truth (recon snapshot, 2026-07-06 — six read-only auditors)

**Gates (cold, all green):** `verify` 64/64 in **2m37s** · `verify:solo` 8/8 in 1s ·
`verify:chronology` 42/42 in 0.2s · `build` (includes `tsc --noEmit`) clean in 2s.
Tree clean, main == origin/main @ 7ef95aa, PR #1 merged.

**The "drift":** zero Stub pixels are reachable in the app — all five forged
components (`ScoreRace`, `TazCorner`, `PlayBanner`, `TokenChips`, `IdleCue`)
render only behind the dev-only `?preview=` harness; the 25 `stub-*` tokens are
referenced by nothing reachable; Wave A's visible edits were ~38 lines of layout/
z-index plumbing. Where fidelity was spot-checked, forged components match the
handoff spec closely. **Verdict: invisible inventory, not wrong pixels. The fix
is wiring + visible-first staging, not rework** (Buri's ruling: keep + wire
visibly next).

**The handoff (`design_handoff_the_stub/`):** the six screens 7a–7f exist twice —
as sections of `reference/the-stub-screens.html` (inspectable CSS source) and,
since 2026-07-06 17:29, as **exported reference PNGs in
`design_handoff_screenshots/`** (7a-duel-board · 7b-layoff-picker ·
7c-recast-overlay · 7d-endgame-recap · 7e-se-stress-test · 7f-design-tokens).
The PNGs were viewed and cataloged 2026-07-06; 7f's token card matches the
README table value-for-value, and each PNG matches the HTML section it renders —
the reference set is internally consistent. (`Marquee Game UI Redesign.zip`,
a byte-duplicate of the six PNGs, was deleted 2026-07-06 on Buri's ruling.)
Scope is **Duel-only** by the README (line 4); the menu is flagged
inside the HTML as an undone next step. Branding throughout is pre-rename
"Marquee" — transcribe the language, never the brand strings. Token table gaps:
no spacing scale, no type-size scale, no icon set (sizes live in per-screen
prose; 44px touch rule in the 7e section). **Buri's cohesion ruling
(2026-07-06): the same cards, backgrounds, and UI elements carry every mode** —
the six Duel comps are the element library for the whole game, and the
remaining surfaces are composed from them (§2.4).

**Mode matrix:**

| | entry | pool | daily | sim/data | Stub UI |
|---|---|---|---|---|---|
| Solo | `SoloGame.tsx` | `DUEL_POOL` 89 (frozen; cutover = Buri, W5) | constructive walk, solver par | `verify:solo` 8/8 + append-only pin | ✗ (W3) |
| Duel | `DuelGame.tsx` **1,999 ln / 35 useState** | `DUEL_POOL` 89 (frozen, fnv pin) | none (by design) | `verify` 64/64 · eval tune 66.7/49.2/43.5 · tilt in band (A 53.6/B 44.1) | components forged, unwired (W1–W2) |
| Chronology | `ChronologyGame.tsx` | `chronology-pool.json` 162 | `dealRoundShaped(seed)` | `verify:chronology` 42/42 (**no published-daily pin yet** — W5) | ✗ (W3) |
| Connections | **no app code** | — | — | `sim/connections-gen.ts` exists (ambiguity gate, deterministic dealGrid, yield 9.86M/≈3.05M strict @237) | ✗ (W4) |

**Shared substrate:** `MOVIES` = 237 credited films; A4 unification designed +
signed off, **not implemented** (P1); Stage B growth plan written (P2); TMDB
tooling live, 24 rulings + 3 standing policies; attribution shipped in
HowToPlay. **The Connections dealer lock existed only in session memory until
this doc** — now recorded in §4·W4.

**Stale facts corrected by this doc:** DuelGame is 1,999/35 (not 1,300/31 nor
1,989/31) · gates are 64/64 (not 60/60) · RULEBOOK Mode 3 exists (old open item
dead) · the Wave-D "double-tap Allow It guard" already exists
(`resolvingOffer`, DuelGame.tsx:243) · `tsc` is not a separate gate (build runs it).

## 2. Operating rules (the constitution)

1. **Authority order for visuals:** reference PNGs
   (`design_handoff_the_stub/design_handoff_screenshots/`) are the truth for
   **composition, hierarchy, and spacing**; the README token table / 7f / the
   HTML source are the truth for **exact values** (never eyedrop a PNG where a
   token exists) → `docs/ui-contracts.md` → UI-PRD §4/§5 → the wave brief.
   Handoff wins conflicts on mobile Duel. Rules/copy: `sim/RULESET.md` + frozen
   game copy (branding fixes exempt — everything player-facing says **Match
   Cut**).
2. **Autonomy = gate-split (Buri's ruling):** objective waves (sim, pool,
   tooling — hard pass/fail gates) run and **commit+push without waiting**. Every
   UI wave ends with side-by-side proof (§2.4) and **STOPS for Buri's eyes**
   before more UI work. Deploys always wait.
3. **Gate policy:** quick suite (`build` + `verify:solo` + `verify:chronology`,
   ≈5s) freely, after any change. Full `verify` (2m37s) at every wave close and
   after any change touching `sim/`, `src/lib/`, or deal paths. `eval` tune only
   on content merges into the frozen 89 (expected byte-identical). New gates
   join, never replace: `verify:connections` from W4 on.
4. **UI acceptance:** every UI wave produces screenshot pairs — app vs the
   reference PNG in `design_handoff_screenshots/` — at **390×844 and 375×667**,
   plus a played-through game at both sizes, saved to the session scratchpad and
   summarized at the checkpoint. **Extrapolation doctrine (Buri, 2026-07-06 —
   "start now, extrapolate the rest"):** surfaces without a reference PNG
   (menu, Solo, Chronology, Connections, rules, draw-choice) are composed from
   the six comps' elements under the cohesion ruling — same StubCard, same
   canvas/paper/navy layering, same pills/panels/ticket rows — guided by README
   prose and UI-PRD structure, and tagged **EXTRAPOLATED** at the checkpoint
   (Buri looks hardest there; nothing waits on more comps). If Buri exports
   more screens later (menu and the Chronology board are the two highest-value),
   they upgrade those surfaces to reference-backed at the next checkpoint.
   Cards are judged on frame anatomy, not art (§2.6).
5. **One writer on `DuelGame.tsx`, ever.** All edits to it serialize; wire passes
   are surgical (delete inline zone → mount component → thread props), one commit
   each, quick suite between. No reducer refactor — the 35-useState soup is
   load-bearing. Contract line pins have drifted +5..+11 below :1300 since the
   flex-zone pass — re-verify pins at wire time, don't trust them blind.
6. **Freezes:** deps locked (React 18 / Vite / Tailwind 4 / Framer only) ·
   `DUEL_POOL_IDS` stays the tuned 89 this build · Duel/Solo rules and
   `sim/RULESET.md` untouched (new *additive* Connections sim files are allowed
   and get their own contract section in RULESET when the mode lands) ·
   localStorage = meta-state only (`matchcut:v1`) · **card faces are
   typographic this build (Buri re-ruled 2026-07-06):** the comps show
   scene-art cards, but the build renders the exact Stub frame (genre-colored
   spine + diamond pip, dotted perforation, ADMIT ONE rail, credit ledger with
   +1/+2, DEEP CUT badge, notched corners) with a designed typographic title
   block in the art slot. Checkpoints judge everything EXCEPT the art slot;
   the comps' art is the future look (pilot stays parked, §5).
7. **Subagent protocol (kept from orchestration-plan v2 — it worked):**
   self-contained briefs (files allowed, acceptance, contracts pasted in, house
   rules); forge-then-wire for hero chrome; subagents never run `git` and never
   run `npm run build` concurrently (orchestrator owns commits; `tsc --noEmit`
   is parallel-safe); files touched ⊆ files allowed, diff-reviewed by the
   orchestrator. Model tiers: **Fable** = orchestration + all `DuelGame.tsx`
   edits + desktop re-architecture + motion pass; **Opus** = bounded
   judgment-dense components/screens; **Sonnet** = fully-specified mechanical
   work. The orchestrator implements nothing by hand except `DuelGame.tsx` wire
   passes.
8. **Content protocol:** any pool merge runs `/tmdb-check` arbitration flow —
   TMDB is a witness, not a judge; Buri's rulings are final and land in the
   ledger. Every reshuffle of a date-seeded daily is called out before merge.
9. **Escalate to Buri, always:** deploys · rule/scoring changes (never trivial —
   they invalidate tuning + sim parity) · pool pin cutovers · arbitration
   rulings · the W5 tilt call · UI checkpoint approvals · anything smelling of
   scope change. Batch asks at wave boundaries; log them in §7 so they never
   silently block.
10. **Session hygiene:** orchestrator = Fable for now (this prompt is
    operator-agnostic for later handover). Long session → wind down: finish the
    wave in flight to its gate, commit+push, tick the Ledger, update memory,
    tell Buri to restart fresh. A dead session loses at most one wave.

## 3. Waves (fresh numbering W0–W6; old "Wave 0/A–D" and content "waves 1/2" vocabularies are retired)

Parallel lanes inside a wave are genuinely disjoint file sets. UI core is the
serial spine (single-writer DuelGame); pool/sim lanes ride beside every UI wave.

**W0 — Consolidation & re-anchor** *(mixed; a–c done by the planning session)*
- a. ✅ This doc written; rulings recorded (2026-07-06: four plan rulings + card
  faces + extrapolation + kickoff mode).
- b. ✅ Banners on PLAN.md / orchestration-plan.md / ui-tasks.md; CLAUDE.md stale
  facts fixed (line count, gate count, live-plan pointer). Committed+pushed
  with this doc per Buri's "commit docs only" ruling.
- c. ✅ Acceptance references adopted: Buri exported
  `design_handoff_screenshots/7a–7f.png` (2026-07-06 17:29); orchestrator
  viewed all six and verified 7f ↔ README token parity and PNG ↔ HTML section
  consistency. Committed as the frozen references. (The duplicate zip was
  deleted 2026-07-06 — Buri's ruling.)
- d. Component pre-fixes, zero DuelGame contention: strip `PlayBanner`
  `top-[398px]` (:28) and `IdleCue` `top-[372px]` (:18) self-pins (they regress
  the 667px fix if wired verbatim); map their raw hex tier colors onto stub
  tokens or document the exception. **Ruling (orchestrator): CPU-side token
  pills render inside `TazCorner` (7a booth owns them); `TokenChips` is
  player-side only — its `side='cpu'` path stays dormant.** Note ScoreRace's
  `data-score`/`data-turn` semantics change (no repo consumers; update eyeball
  scripts' muscle memory). **Ruling (orchestrator): the comps' purple
  genre-pip spine is off-palette — mint one derived `stub-genre-pip` token
  (documented in the ui-contracts appendix), don't ad-hoc the hex.**
- e. Hygiene: remove stale worktree `.claude/worktrees/eloquent-taussig-63abbf`
  (pre-Wave-0 pin, audit noise) · delete nothing else.
- Gate: quick suite. Objective wave → d/e auto-commit+push on green (next
  session).

**W1 — "The Reveal": Duel board goes Stub** *(UI, checkpointed)* — absorbs the
interrupted old-Wave-A close-out (375×667 stress + played game).
- Wire order (audited to minimize DuelGame churn): IdleCue (:1550–1562, zero new
  state) → PlayBanner (:1500–1547; dismiss effect stays at :1122; defer
  LastPlayLine) → TokenChips player (:1679–1709; Final Cut `say()` stays parent)
  → ScoreRace (:1273–1307) → **TazCorner last** (:1311–1346; add persistent
  `lastCpuQuote` state near :225 — banner auto-nulls at 2400ms; delete the old
  pip block or duplicate `layoutId`s break Framer).
- Activate the surrounding 7a visual language in the wired regions: navy header,
  body/cream per tokens, fonts go live.
- ∥ **P1 — A4 pool unification** *(objective, auto)*: execute
  `docs/pool-unification.md` steps 1–6. Go/no-go: **rebuilt
  `chronology-pool.json` byte-identical (empty diff)** + `DUEL_POOL_IDS`
  untouched + full sweep green. Retire `chronology-seed.ts`; update `/tmdb-check`
  fix path.
- ∥ **M4a — Connections dealer + verify** *(objective, auto)*: encode the dealer
  lock (§4·W4) into the dealer; add `sim/connections-verify.ts` →
  `npm run verify:connections` (365 seeds solvable + unambiguous + distinct ·
  deterministic ×2 · append-only pin — solo-verify shape). New files only; Duel
  sim untouched.
- Gate: full suite + §2.4 side-by-sides vs `design_handoff_screenshots/`
  7a + 7e. **STOP for Buri.**

**W2 — Duel completion** *(UI, checkpointed)*
- Forge in parallel (new files): `MeldShelf` (7a/7e chips + 7b list) ·
  `RecastOffer` (7c) · `DrawChoice` (**EXTRAPOLATED** — no reference screen) ·
  `StubCard` (the big one: one frame, all sizes, `reveal={{year, credits, art}}`
  — Duel/Solo show credits+year · Chronology hides year pre-placement ·
  Connections title-only until solve · typographic title block per §2.6, art
  slot dormant · frame anatomy read from the comps: genre-colored spine +
  diamond pip, dotted perforation rail, vertical ADMIT ONE, credit ledger rows
  with +1/+2 chips, DEEP CUT badge, 14px punched notches, `stub-genre-pip`
  derived token for the purple spine variant) ·
  `BottomSheet` extraction if the 7b work wants it (extract primitives on second
  use, never speculatively).
- Wire (serial, Fable): MeldShelf (retire inline MeldZone; `meldRowRefs`
  hit-test plumbing is load-bearing) → RecastOffer/DrawChoice overlays →
  `Hand.tsx` restyle lands (**touches Solo too** — checkpoint shows both) → 7e
  one-row compact header variant.
- ∥ **P2 — Stage B growth kickoff** *(human-paced, spans waves)*: build
  `tmdb-date-draft.ts`; draft decade slates → **Buri strikes/keeps** → policy
  dates → `/tmdb-check dates` → arbitration → merge as `DATED_STUBS`; decade
  floor raises 20→35→50 toward 300–500. Each merge: objective gates auto;
  arbitration waits for Buri. Pool **LOCKS** before public daily (last batch
  pre-launch; then pin-bump protocol only).
- Gate: full suite + side-by-sides (7a/7b/7c/7e). **STOP for Buri.**

**W3 — Whole game wears the Stub** *(UI, checkpointed)*
- Cards: wire `StubCard` across Duel/Solo boards and Chronology's card face
  (ChronoCardView adopts the frame; year stays hidden pre-placement — the
  scene-art-must-not-leak-year rule is structural here). **Also folds the W2
  card-face deferrals**: marquee A/B pile cards → StubCard (needs wild-top
  handling), Solo pile (`SoloGame.tsx:261`), plus the DuelGame board leftovers
  (LastPlayLine mount, FC/RC player compact chips, deck "MARQUEE/DECK" polish), a
  **Stub-native wild face** (StubCard has no wild branch — Hand falls back to the
  legacy gold WildFace; extrapolate or get a comp), and the hand **hint pill
  label** ("HINT · PACINO" — needs the shared person plumbed from `hintCard` to
  the Hand render; bare teal pulse today).
  **D1 hook:** if the deep-cut initiative is ready, the Duel flip-side deep-cut
  face is built here (else StubCard's deep-cut face waits for D1 — see §3·D1).
- Menu restyle (**EXTRAPOLATED** — the handoff itself flags the menu as undone;
  upgrade if Buri exports a menu screen) · Solo re-dress · Chronology re-dress
  (standalone file, parallel-safe) · `RecapReel` forge+wire (7d generalizes to
  every end screen) · rules modal restyle (**TMDB attribution block must
  survive**, HowToPlay.tsx:290–299) · desktop 1440×900 re-architecture (UI-PRD
  §4 inside Stub language; kill the 420px letterbox).
- Gate: full suite + side-by-sides (7d + extrapolation set, both widths,
  desktop shot). **STOP for Buri.**

**W4 — Connections, mode 4** *(mixed)* — needs M4a + P1 + W2's StubCard.
- **Dealer lock (recorded here, previously memory-only):** grids are built
  person/series-first (director/actor/series keys before genre), **≤1 genre
  group per grid**, strict accidental-free (the DEAL_TRIES walk must produce a
  grid where no film fits two groups — the ambiguity gate as implemented in
  `sim/connections-gen.ts`).
- Engine *(objective, auto)*: `src/lib/connections.ts` + date-seeded daily via
  shared `localDateSeed`, dealing only pre-verified grids; `verify:connections`
  joins the standing gate suite.
- UI *(checkpointed)*: 16 StubCards, guess flow, one-away feedback, reveal-on-
  solve, share **`Match Cut · Connections`** (grid emoji, URL-less), menu card,
  `progress.ts` schema extension (connections DailyMeta + streaks).
- RULEBOOK.md + HowToPlay section **in the same pass** (guardrail) — this is the
  RULESET-additive moment (§2.6): Connections rules get their contract section.
- Gate: full suite incl. verify:connections + side-by-sides (all EXTRAPOLATED
  unless Buri exports Connections screens). **STOP for Buri.**

**W5 — Hard data & polish** *(mixed)*
- Data pass, one readout per mode committed to `docs/mode-readouts.md`: Duel
  eval tune vs targets + tilt band · Solo par distribution over a seed year ·
  Chronology `eval:chronology` strokes · Connections yield + grid-hardness
  histogram. Confirm Vercel Analytics events fire per mode (the say/do
  cross-check for interviews).
- Chronology **published-daily pin** lands at pool LOCK (solo-verify shape;
  pinning before lock would churn every Stage B merge).
- Backlog survivors: first-run onboarding funnel · CPU-final-card warning ·
  end-of-game stats.
- **Buri calls:** tilt (recommendation unchanged: ship the ~7pp edge as a
  documented, gate-pinned house edge; revisit with real data) · Solo/Duel pool
  cutover to the big pool (one conscious pin cutover, reshuffles future dailies)
  — or explicitly defer both past SEND.
- **D1 re-tune (if built):** if the deep-cut difficulty lever (§3·D1) landed via
  W3 + the deepCast content pass, this is where its re-sim + re-tune runs (it
  changes difficulty, so tuning is invalidated until re-measured). Defer past
  SEND if D1 isn't ready — it's not a launch blocker.
- Brand sweep (no stray "Marquee" in player-facing copy — share lines, menu,
  rules) · full gate sweep · phone-in-hand pass on all four modes.
- Gate: everything. **STOP for Buri.**

**W6 — SEND** *(Buri's button)*
- Deploy quiet alias (noindex holds, no gate, shares URL-less) · send to the
  5–10 circle with a one-line pitch per mode · interviews ~2 weeks out pick the
  front door. URL-in-share stays the launch switch.

**D1 — Duel deep-cut reveal as a difficulty lever** *(PARKED — concept
Buri-approved 2026-07-06 during the W2 grill; do NOT fold into a wire)*.
Vision: in **Duel**, the card FRONT shows the top 1–3 credits + director and the
FLIP side reveals the **deep-cut names** (today they're hidden — flip shows only
a "+N deeper credits" count). Reveal amount is **difficulty-gated**: easy
(Matinee) flips deep cuts open as an aid; hard (Director's Cut) keeps them
hidden — pure knowledge. **Solo is exempt** (front stays hidden; its score IS
`flippedEver.size`, so credits-on-face would gut it — Buri accepted the Duel↔Solo
divergence). **Why it's not trivial (3 gated dependencies, must all land):**
(1) **Mechanic/difficulty** — deep cuts are a *scored discovery* (`duel.ts:114`
folds `deepCast` into linkable names; `DuelGame.tsx:553/820` celebrate an
all-deep-cut link). Revealing names removes the discovery skill, so this is a
difficulty change → **re-sim + re-tune** per `sim/RULESET.md` (the sim must model
the aid). (2) **Content** — only **152/283** films carry `deepCast`; ~131 have
none → a **TMDB deepCast pass** through `/tmdb-check` arbitration (rides P2).
(3) **Card design** — StubCard has no deep-cut face → a new flip-side (W3 card
work). **Sequencing:** deepCast content pass (P2-adjacent) → deep-cut flip face
(W3) → ship behind the difficulty knob + re-tune (W5). Needs its own grill/spec
before build. Surfaces in the Ledger (§6) every session, and is cross-noted in
W3 (card face) and W5 (tune) below.

## 4. Dependency spine

W0 → **W1** (∥ P1, M4a) → **W2** (∥ P2 starts) → **W3** → **W4** (needs M4a+P1+StubCard) → **W5** (needs P2 LOCK for the pin; tilt+cutover calls) → **W6**.
P2 arbitration is human-paced and rides beside W2–W5. Calendar time is dominated
by Buri's checkpoint availability, not compute — the plan's job is to maximize
what's ready-to-review per sitting.

## 5. Risks (carried + new from recon)

- Traveling-card layer on mobile Safari during W1–W3 (transform/opacity only) —
  the likeliest schedule-eater.
- `Hand.tsx` restyle hits Solo simultaneously (shared import) — W2 checkpoint
  must show both modes.
- Connections ambiguity gets harder as Stage B grows the pool — the gate re-runs
  per merge, never once.
- Card-art track (PARKED) carries two recon warnings for when it wakes: the
  style-ref PNGs bake year + credit point values into the art (any scoring/date
  change invalidates renders; Chronology year-spoiler confirmed visually), and
  the taxi ref shows a purple "genre pip" variant that's off-palette.
- Token-table gaps (no spacing/type-size scale) — W1 freezes a derived scale
  appendix into `docs/ui-contracts.md` so parallel agents don't each invent
  sizes.
- The reference PNGs were exported from a design tool loading Google-Fonts CDN;
  the app self-hosts subset fonts — slight font-metric differences in
  side-by-sides are acceptable; note them in the summaries rather than chasing
  pixel parity on glyphs.
- The comps render cards with scene art; the build is typographic (§2.6). The
  first W1 checkpoint will *feel* emptier than 7a because of the art slots —
  judged deliberately, not accidentally.

## 6. Ledger (the resume sheet — tick in the same commit as the work)

- [x] W0a master plan written (2026-07-06, planning session; v2 same day after
      the reference-PNG drop + 3 rulings)
- [x] W0b banners + CLAUDE.md fixes (committed with this doc)
- [x] W0c reference PNGs adopted + committed (`design_handoff_screenshots/`,
      verified vs README/HTML)
- [x] W0d component pre-fixes (pins · TazCorner/TokenChips ruling ·
      stub-genre-pip token) (2026-07-06: pins stripped, `#58486C` minted,
      ui-contracts Appendix A records all five rulings)
- [x] W0e stale worktree removed (2026-07-06)
- [x] W1 wire ×5 + 7a language live · side-by-sides · played game @ both sizes
      (2026-07-06: five wires + navy header/cream canvas/fonts live; 7e compact
      header+booth pulled forward from W2 — the 667 gate was unmeetable without
      it; short-viewport band de-collision; two full games played at both sizes;
      checkpoint evidence in session) — **Buri approved: ✅ 2026-07-06**
- [x] P1 A4 unification (byte-identical JSON) — auto (2026-07-06: byte-identical
      ✓ · 116 dates + 46 stubs · CHRONO_TITLE_OVERRIDES for 4 title-convention
      splits · seed retired INCLUDING the sim migration the design's consumer
      map missed (chronology-verify/eval now read the derived JSON) · seeded
      tune diff pre/post = byte-identical · full verify 64/64)
- [x] M4a dealer lock encoded + verify:connections green — auto (2026-07-06:
      ≤1-genre enforced constructionally in enumerateViable, person/series-first
      via CATS key order, 365-grid digest pin + PIN_DAY spot-check, 11/11 ×2,
      pin stable across the P1 merge)
- [ ] W2 MeldShelf/RecastOffer/DrawChoice/StubCard forged · wired · Hand restyle
      (2026-07-06: all four FORGED + preview-verified vs comps at 390px —
      StubCard took a comp-anatomy fix pass (cream rail/notches/circular
      stamp/monogram art slot); LayoffPicker rides in MeldShelf.tsx; overlays
      take cardSlot injection so StubCard swaps in at wire. Wire pass = next,
      serial on DuelGame; checkpoint flags queued in the session summary).
      **WIRE ✅ 2026-07-06** (4 commits 30087ff→dfb4635, pushed): (1) MeldShelf
      atomic swap (identical props; orphaned MeldZone.tsx deleted); (2)
      RecastOffer/DrawChoice overlay chrome goes Stub — cardSlot stays CardView
      (verified StubCard has no wild branch + both slots can hold a wild → W3);
      (3) Hand fan → StubCard, Duel + Solo (shared Hand.tsx; flip → reveal.credits
      so the peek mechanic is preserved with zero rule change; wilds → legacy
      WildFace); (4-partial) MELD/SORT/HINT buttons → Stub tokens. Full verify
      **64/64**; side-by-sides @390×844 + @375×667 both modes browser-verified
      (hand StubCards, raise+flip ledger, compact 667). DEFERRED (next session /
      W3): LastPlayLine mount (new last-play state), FC/RC player compact chips,
      deck polish, marquee A/B pile cards → StubCard (board face = W3). Checkpoint
      flags: 3D flip → inline reveal; comps depict credits-on-face vs preserved
      flip-to-peek; Stub-native wild TBD; hint "· PACINO" label deferred. —
      **Buri approved: ✅ 2026-07-06** (W2 grill: flip-to-peek permanent +
      Duel/Solo reveal divergence accepted + credits-on-face idea → parked as D1;
      inline-reveal flip kept; pushed a1354be. All card-face deferrals → W3.)
- [ ] P2 Stage B: draft tool · batch merges (log per batch) · POOL LOCK
- [x] W3 StubCard everywhere · menu/Solo/Chrono re-dress · RecapReel · desktop
      — **increment 1 SHIPPED 2026-07-07** (4 commits c3f601e→aa39422 + ShareCopy,
      pushed): StubCard gained a wild branch (amber ticket: amber spine/pip, ★ WILD
      lockup, no year/ledger) → every CardView special-case collapsed to StubCard
      (Duel piles/draw/recast, Hand wild fallback retired); board underlays +
      Solo pile-stack → paper ticket slabs; deck "M 76" → Stub navy ticket-back
      (DECK + count). Five parallel agent lanes (disjoint files, shared Stub
      cheatsheet): Chronology (ticket frame w/ decade accent, **no-year-leak
      intact**), Solo (navy header/pile StubCard/Stub banners), Menu (navy hero
      panel, amber-active pills — EXTRAPOLATED), Rules (token swap, **TMDB
      attribution survives**), RecapReel (7d-matched) + Results restyle; Duel end
      screen restyled + RecapReel wired; ShareCopy → Stub. Card.tsx/CardView now
      ORPHANED (flagged, not deleted). Gate: full verify **64/64**, build green,
      console clean; side-by-sides @390×844 + @375×667 (menu/duel/solo/chrono/
      rules) + raise+flip-to-credits played on the 667 board. **DEFERRED → W3
      increment 2:** desktop 1440×900 re-arch (Fable, riskiest) · LastPlayLine
      mount (new state) · FC/RC player compact chips (shortViewport) · hint
      "· PERSON" label plumb. Checkpoint flags in session summary.
      — **increment 2 SHIPPED 2026-07-07 ⛔ AWAITING BURI CHECKPOINT** (2 commits
      dffda29 + 75fb2d0, pushed): (1) **LastPlayLine** wired (7a item 4) — the
      forged strip mounts under the score header, fed from the `say()` chokepoint
      (rides alongside `lastCpuQuote`, no new capture at the 6 scoring sites);
      new `lastPlay` state, reset in `newGame`; delta signed so Taz's gain paints
      stub-red from the player's POV (verified "LAST · TAZ +1" in red). (2)
      **TokenChips** player `compact` variant (px-2/py-1/7.5px) via
      `compact={shortViewport}` — matches the CPU booth footprint at 667, full
      size at 844 (inspected compact:true). (3) **Hint "· PERSON" label** —
      `sharedPeople(pileTop, hintedCard)` computed at the Hand call site (hintCard
      returns id only), threaded Hand→StubCard's existing hintLabel pill;
      lay-off-only hints show the pulse alone (never name a non-pile person);
      verified "HINT · NOLAN". (4) **Desktop 1440×900 theater** — the 420px column
      becomes a lit screen in a navy movie house (vignette + amber spotlight + dot
      texture + marquee-bulb side rails + warm ring/shadow); all `hidden lg:block`
      behind the column + `lg:bg-stub-cream` on the column, so **390×844 + 375×667
      byte-identical, no regression** (both re-verified). Cards keep size — the
      TABLE scales (§4.2). EXTRAPOLATED (no desktop comp). Gate: full verify
      **64/64** (2:30), build green, console clean; desktop shot + both mobile
      sizes + played game (draw-3, CPU scoring play, hint) captured. **DEFERRED /
      FLAGGED for Buri:** (a) §4.2 shelf-as-side-rail relocation held (blast radius
      on the single-writer absolute layout — meldRowRefs/booth layoutId); (b) 4
      inc-1 flags still open (wild amber / RecapReel +pts chip / menu header / rules
      scrim tokens); (c) LastPlayLine copy — mixed casing "LAST · YOU drew 3" vs
      "LAST · TAZ Connected via…" (run past Buri); (d) Card.tsx/CardView dead in
      shipping code but still imported by 2 preview harnesses — delete needs
      preview repoint, held.
      — **Buri approved: ✅ 2026-07-07** (checkpoint, commit ed798b3): desktop
      framed-theater shipped as-is (§4.2 side-rail deferred, his call) · LastPlay
      mixed-casing copy kept · **flipped flag b** (RecapReel +pts chip → navy,
      7d-match) + **flag c** (menu gains the navy header; bottom "How to play"
      folds into the header ?) · flags a (Stub wild) + d (rules scrim tokens)
      kept as shipped · **Card.tsx/CardView DELETED** + 2 preview harnesses
      repointed to StubCard. Full verify 64/64 post-follow-ups. **W3 CLOSED.**
- [x] W4 Connections engine+verify (auto) · UI+RULEBOOK — **engine ✅ auto
      2026-07-07** (3 commits ff512a2→27a2904, pushed): dealer LIFTED
      sim→`src/lib/connections.ts` (rng.ts precedent: app build graph is
      src/-only; sim imports it back — parity, never a fork); dead `sits()`
      dropped (formation pools guarantee sitting). **Runtime feasibility
      caught by measurement:** `dealGrid` enumerates ~9.5M viable key-sets /
      ~12 GB heap → **OOMs a 2 GB browser-ish heap outright**, so "dealing
      only pre-verified grids" = a BAKE: `scripts/build-connections-grids.ts`
      pre-runs the dealer over the pinned 365-day window into
      `src/data/connections-grids.json` (172 KB, day-0 == PIN_DAY grid), and
      `dailyConnectionsGrid` (data-layer wrapper) indexes it by calendar
      offset — pinned year IS the dealer's seed-output. `verify:connections`
      **14/14** (+3 baked-parity #6: baked file == dealer for all 365 days,
      read via fs so Node needs no import-attribute). Pin digest byte-identical
      across the lift. **UI+guardrail ⛔ AWAITING BURI CHECKPOINT** (commit
      34931f1, pushed): `ConnectionsGame.tsx` (standalone; 4×4 grid, select-4/
      Submit, one-away, reveal-on-solve bands, 4-mistake loss reveal, share
      `Match Cut · Connections` NYT-style emoji guess-grid URL-less) · App
      menu card + streak chip · progress.ts connections DailyMeta
      (backfilled, no streak-wipe) · RULESET §13 (additive contract) +
      RULEBOOK Mode 4 + HowToPlay section (TMDB attribution intact). Gate:
      full verify **64/64** · build · verify:connections 14/14 · solo 8/8 ·
      chronology 42/42; browser-verified @390×844 + @375×667 (menu, board
      both sizes, full solve → 4 reveal bands, one-away, Solved!+day/streak/
      best+share grid, practice deals a different grid), console clean.
      **EXTRAPOLATED (no Connections comp) + FLAGS for Buri:** (a) board
      tiles are title-only Stub tickets, NOT literal 3/4 StubCards — a
      word-grid needs square tiles AND StubCard's genre-tag art slot would
      LEAK the genre group; (b) solved-band + share-emoji palette
      (navy/plum/red/slate ↔ 🟦🟪🟥⬛) is an extrapolated 4-color set (amber/
      teal reserved); (c) share grid has no 🎬 lead row (NYT-style grid vs
      the other modes' 🎬 row) — house call, confirm; (d) bundle +19 KB gzip
      from the baked JSON (unavoidable — the dealer can't run in-browser);
      (e) grid category mix skews actor-heavy (aaaa×106/365) — a data
      observation for W5's grid-hardness readout, not a wave blocker.
      **Buri approved: ✅ 2026-07-08** (W4 grill, five flags each resolved to a
      concrete ruling — one produced code, four ratified the shipped
      extrapolation): (a) board tiles = **keep the clean title tile** (cohesion
      carried by Stub tokens; StubCard frame can't tile square at ~85px and its
      art slot would leak genre — no frame ornament added); (b) palette = **swap
      the share's ⬛ → 🟩** (only code change: `GROUP_EMOJI` index 3; bands stay
      navy/plum/red/slate, index-mapped; the four share squares are now clean
      saturated colors, chosen for legibility not band-echo — a comment pins the
      intentional mismatch); (c) share = **no 🎬 lead** (Connections is the one
      mode whose share stays NYT-clean; the other three keep their 🎬 row); (d)
      bundle +19 KB = **defer but track** → W5 backlog (interning film ids is
      cheapest at pool LOCK, not now); (e) actor-heavy mix = **measure in W5**
      (never-trivial dealer change; decide the diversity constraint with the
      grid-hardness histogram, not blind). Gate after the fix: full verify
      **64/64** · verify:connections 14/14 · solo 8/8 · chrono 42/42 · build
      clean. Browser-verified @390×844 + @375×667: menu, board both sizes, and a
      full played solve on today's mixed daily (Scorsese/Voight/Carell/Plummer)
      → won share `🟦🟦🟦🟦/🟥🟥🟥🟥/🟩🟩🟩🟩/🟪🟪🟪🟪` (no ⬛, no 🎬). Noted
      cosmetic for W5 polish: long titles break mid-word on the small tiles
      ("GOODFELL/AS") — nothing clips. **W4 CLOSED.**
- [ ] W5 readouts · chrono daily pin · polish · tilt call: ___ · cutover call: ___
      — **W5a DATA READOUTS ✅ auto 2026-07-08** (`docs/mode-readouts.md` +
      reusable `scripts/connections-mix.ts`): Duel tune @4000 **65.5 / 49.7 /
      41.8** vs targets 65/50/41 — all on-target; full-flow tilt **A 53.6 / B
      44.1, gap 9.5pp** (gate band ≤12pp, re-proven by verify 64/64). Solo par
      min7/median9/max12 (unimodal, bounds [6–12]). Chronology standard skill
      gap **+2.29 str/rd** (naive 77.8% / calibrated 92.6% clean). Connections
      yield 9.86M viable key-quads; baked-window mix actor-dominated (74.1% of
      groups actor; aaaa 29.0%; 30.4% single-kind grids; genre cap holds 0
      violations) — the Flag-5 evidence. All four modes fire per-mode
      analytics events. **W5b grill next** (tilt · pool cutover · category-
      diversity). —
      **W4 carry-forwards (2026-07-08):** (i) Connections bundle −9 KB via
      interning film ids in the baked grids (do at pool LOCK) — measure in the
      data pass; (ii) Connections grid category-diversity constraint decision —
      histogram the actor-heavy mix (~29% all-actor) in the grid-hardness
      readout, then rule constrain-vs-leave with data; (iii) minor: hyphenate/
      soft-wrap long Connections tile titles.
- [ ] W6 SEND (deploy = Buri)
- [ ] **D1 Duel deep-cut reveal as a difficulty lever** (PARKED, concept
      approved 2026-07-06; §3·D1) — deepCast TMDB content pass (P2-adjacent) →
      deep-cut flip face (W3) → difficulty knob + re-tune (W5); needs its own
      grill/spec before build. **Not a launch blocker.**

## 7. User-input queue (standing asks — never silently block)

1. ✅ RESOLVED 2026-07-06: the six reference PNGs landed
   (`design_handoff_screenshots/`). Still welcome, never blocking (per the
   extrapolation ruling): a **menu** comp and a **Chronology board** comp —
   the two extrapolations with the least Duel analog. The duplicate
   `Marquee Game UI Redesign.zip` — Buri ruled delete; removed 2026-07-06
   (hash-verified byte-identical to the committed PNGs first).
2. Stage B title picks — SLATES READY (2026-07-06): `docs/stage-b-slates.md`,
   352 candidates across 1970s–2020s, 111 ⚡ cheap wins (already-credited
   films needing only a date). Strike/keep at your pace; the date-draft tool
   (`npm run tmdb:draft`) is built + smoke-tested for whatever you keep.
3. UI checkpoint approvals (W1/W2/W3/W4 all ✅; W5 next).
3b. ✅ RESOLVED 2026-07-06: Buri ratified the self-checked
   `CHRONO_TITLE_OVERRIDES` map (4 films: LotR ×3, M:I Fallout) over a
   `chronoTitle` field on `Movie`. The map stands.
4. W5 calls: tilt · pool cutover date.
5. W6: the deploy button.

## 8. Master Prompt (paste this to boot any future build session)

```
You are the orchestrator for Match Cut (~/Projects/Daily Movie Game).
Read docs/master-plan.md FIRST — it is the only live plan. Its §6 Ledger is
the resume sheet; §2 is the constitution; superseded docs carry banners
(don't read them for state). Verify ground truth before building: quick
gates (npm run build · verify:solo · verify:chronology, ~5s) + git status.

Loop: take the first unticked Ledger item whose dependencies (§4) are met →
run it as its wave specs (§3): parallel subagent fan-out for forge/side
lanes, forge-then-wire for Duel chrome, ONE writer on DuelGame.tsx, briefs
self-contained, subagents never run git or concurrent builds → wave gates
(§2.3) → tick the Ledger in the same commit → commit+push.

Autonomy (§2.2): objective waves (sim/pool/tooling, hard pass/fail gates)
proceed without asking. UI waves end with side-by-side screenshots vs
design_handoff_the_stub/design_handoff_screenshots/ at 390×844 AND 375×667
plus a played game, then STOP for Buri. Always Buri's: deploys, rule/scoring
changes, pool pin cutovers, arbitration rulings, checkpoint approvals
(§2.9). Batch asks at wave boundaries; log them in §7.

Visual truth: the reference PNGs rule composition; the README token table /
7f rule exact values (never eyedrop where a token exists) > ui-contracts.md
> UI-PRD §4/§5 only. The six comps are Duel-only — compose every other
surface from the same elements (Buri's cohesion ruling: same cards,
backgrounds, panels, pills everywhere) and tag it EXTRAPOLATED at the
checkpoint. Cards: exact Stub frame, typographic title block in the art
slot (§2.6) — never scene art this build. Player-facing brand is Match Cut
(handoff says Marquee — transcribe language, not brand). No new deps.
localStorage = meta only. Content merges go through /tmdb-check arbitration.

Wind-down on long sessions: finish the in-flight wave to its gate,
commit+push, tick Ledger, update memory, tell Buri to restart fresh.
```

## 9. Amendment log

- v1 (2026-07-06): created from the six-auditor recon + Buri's four rulings
  (finish line · one live plan · keep-and-wire-visibly · gate-split autonomy).
- v2 (2026-07-06, same day): Buri exported the six reference PNGs
  (`design_handoff_screenshots/`) — they replace the planned self-rendered
  `renders/` as the acceptance references (old W0c dropped). Three new rulings
  folded in: **typographic card faces** this build (comps' art = future look;
  checkpoints exclude the art slot) · **extrapolation doctrine** (start now;
  compose non-Duel surfaces from the six comps under the cohesion rule; menu +
  Chronology comps welcome, never blocking) · **kickoff = commit docs only**
  (plan/banners/references pushed; W0d–e run next session via §8).
