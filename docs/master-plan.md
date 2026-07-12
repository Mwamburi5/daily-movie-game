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

> **🏁 REACHED 2026-07-10.** W0–W6 all closed (Ledger §6): four modes on the
> Stub UI, unified audited pool, per-mode gates green, RULEBOOK current, and
> SEND deployed — **live at https://matchcutdaily.com** (public URL per Buri's
> amendment; noindex + URL-less shares still hold). The project is now in the
> **post-SEND phase**: circle feedback → interviews (~2026-07-24) pick the
> front door; every circle report lands in `docs/feedback-log.md` (append-only;
> the interview session reads it); build tracks = P2 Stage B strikes → LOCK
> docket (§7·4b) + post-SEND fix backlog (§7·7b) + personas (§7·6) +
> UI-overhaul intake (§7·8). Deploys ride the window FREEZE policy (§2.11).

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
11. **SEND-window deploy policy (Buri, 2026-07-10):** default **deploy-FREEZE**
    for the feedback window (SEND → interviews ~2026-07-24) — the circle plays
    one stable build so feedback maps to one version. Exceptions: (a) anything
    blocking a circle member from playing; (b) the SEND-window analytics slice
    (shipped 2026-07-10, must be live before the circle is texted). Backlog
    fixes build+commit+push freely during the window but batch into **ONE
    deploy at window close**. Deploys stay Buri's button, always — and pushes
    never auto-deploy (`npx vercel deploy --prod` is the only path to prod).
    **Exception (a) invoked 2026-07-10 (Buri, in-session):** the Chronology
    line-overflow fix (267a8be — the band's edge gaps were unreachable at 4–5
    cards and the hit-test scored unintended misfires, corrupting daily
    scores) deployed same-day as `dpl_7tUmeLkVxnTVBmZQ7RJUHz8Uq8gK`;
    matchcutdaily.com verified serving `index-Dx1DBI7v.js` with the fix,
    noindex intact. Circle feedback on Chronology maps to pre/post this
    deploy; pre-fix chronology finishes are polluted difficulty signal.

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
- **EXECUTED 2026-07-10** with Buri's in-session amendment: deployed to the
  **public domain matchcutdaily.com** (shareability, not discoverability —
  noindex and URL-less shares still hold; URL-in-share remains the launch
  switch). Full record in the Ledger W6 entry.

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
- [ ] P2 Stage B: draft tool · batch merges (log per batch) · POOL LOCK →
      **at LOCK, run the P2-LOCK docket (§7·4b) as a grill-me session** (chrono
      pin · Solo cutover · Duel cutover+re-tune · Connections diversity floor ·
      bundle intern — all folded into the LOCK re-bake). Status 2026-07-08:
      **UNLOCKED** — 0/352 slates struck, no merges since kickoff `3f3f251`.
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
- [x] W5 readouts · chrono daily pin (→P2-LOCK) · polish · tilt call: **SHIP ✅ 2026-07-08** · cutover call: **DEFER now → cut at P2 LOCK ✅ 2026-07-08** — **W5 CLOSED 2026-07-08** (W5c checkpoint approved)
      — **W5a DATA READOUTS ✅ auto 2026-07-08** (`docs/mode-readouts.md` +
      reusable `scripts/connections-mix.ts`): Duel tune @4000 **65.5 / 49.7 /
      41.8** vs targets 65/50/41 — all on-target; full-flow tilt **A 53.6 / B
      44.1, gap 9.5pp** (gate band ≤12pp, re-proven by verify 64/64). Solo par
      min7/median9/max12 (unimodal, bounds [6–12]). Chronology standard skill
      gap **+2.29 str/rd** (naive 77.8% / calibrated 92.6% clean). Connections
      yield 9.86M viable key-quads; baked-window mix actor-dominated (74.1% of
      groups actor; aaaa 29.0%; 30.4% single-kind grids; genre cap holds 0
      violations) — the Flag-5 evidence. All four modes fire per-mode
      analytics events. **W5b grill CLOSED ✅ 2026-07-08** — all three calls
      resolved (§7·4): **tilt → SHIP** the ~9.5pp house edge (human always
      seated first; tune already contains it) · **pool cutover → DEFER now, cut
      at P2 LOCK** (Solo = cheap re-pin at LOCK; Duel = own re-tune, §0) ·
      **Connections diversity → LEAVE AS-IS, re-eval at LOCK** (not proven flat;
      P2 growth + the LOCK re-bake make a floor near-free if the phone-in-hand
      pass flags repetition). Everything deferred → **P2-LOCK docket §7·4b**
      (grill-me session at LOCK, after testing/feedback — Buri's ask). **W5c
      polish next.** —
      **W4 carry-forwards (2026-07-08):** (i) Connections bundle −9 KB via
      interning film ids in the baked grids (do at pool LOCK) — measure in the
      data pass; (ii) Connections grid category-diversity constraint decision —
      histogram the actor-heavy mix (~29% all-actor) in the grid-hardness
      readout, then rule constrain-vs-leave with data; (iii) minor: hyphenate/
      soft-wrap long Connections tile titles.
      — **W5c POLISH SLICE (UI, checkpointed) SHIPPED 2026-07-08 — Buri approved
      ✅ 2026-07-08:** three under-specified backlog features scoped grill-first
      (one at a time, Buri ruled each), then built: **(a) onboarding →
      Buri ruled "minimal framing now"** (not the funnel; deferred the funnel to
      post-SEND friction from the phone pass + interviews) → built a one-shot
      first-run welcome overlay (navy hero card, amber PLAY, rules hint) gated by
      a new `seenIntro` **meta-only** flag in progress.ts (additive/optional,
      backfill-safe, no rule reads it); verified shows-once + persists across
      reload @390 + @375. **(b) CPU-final-card warning → Buri ruled "quiet booth
      warning"** → TazCorner gains a `warn` prop (`cpuHand.length===1 &&
      !gameOver`, zero new state): booth pip + nameplate go stub-red + a "LAST
      CARD" pill; compact strip recolors the count red. KEY: Taz's hand size is
      already public via the pips, so this is emphasis on visible state — NOT new
      info → no rule/difficulty change, verify stays 64/64 by construction.
      Harness-verified both variants (`?preview=TazCorner`). **(c) end-of-game
      stats → Buri ruled "Duel end-screen record line" — but it ALREADY SHIPS**
      (DuelGame.tsx:1996–2002, "Matinee record · N played · M won", reads
      duelMeta); mis-scoped on a partial end-screen read, corrected before any
      code → NO duplicate built (held the win-rate% idea: "0% won" at N=1 reads
      harsh — Buri's call). **(iii) Connections tile titles** — the reported
      "GOODFELL/AS" break FIXED, but not by CSS hyphenation (dictionary can't
      split proper nouns): shipped an **adaptive per-tile font-size**
      (`tileFontSize`, char-count calibrated to the 375px worst-case 71px tile →
      ≤8ch=11px, 10ch=9px, floor 7; break-word backstop) — measured
      `allLongWordsFit:true` on all 16 tiles @375 AND @390. **Phone-in-hand pass:
      all four modes played @390×844 + @375×667, console clean, no regressions**
      (Duel LastPlayLine/DrawChoice/CPU-scored turn healthy; Solo/Chrono
      no-year-leak intact). **Connections category-diversity feel-read (Call 3) =
      the trigger fired:** consecutive dailies DO read repetitive (day 0 = AAAA;
      longest all-actor run 4 days; 19 runs ≥2; every grid ≥2 actor groups) →
      **D4 diversity floor now WARRANTED at P2 LOCK** (docs/mode-readouts.md
      addendum; cheapest effective floor = cap actor groups ≤2, costs yield —
      settle at LOCK with the grown pool). Gate GREEN: full verify **64/64**
      (2:29) · build · solo 8/8 · chrono 42/42 · connections 14/14. Out-of-scope
      flag for Buri: raised **StubCard** titles break mid-word too ("MONEYBAL/L")
      — same class, different (high-blast-radius) component; flagged, NOT fixed.
      **W5c carry (iii) DONE. Buri approved all three ✅ 2026-07-08** (checkpoint,
      this session: intro overlay + CPU last-card warn + Connections tile-fit shown
      @390×844 + @375×667; harness warn variants; 0-overflow measured on all 16
      tiles @375; console clean; fade-in perceptible but accepted as-is). **W5
      CLOSED** (the Chronology published-daily pin is the one W5 line intentionally
      relocated to the P2-LOCK docket §7·4b·D1, not a SEND blocker). The StubCard
      mid-word-break flag ("MONEYBAL/L") carries into §7·6 (i) "NAME IS THE HERO".
- [x] **W5c FOLLOW-UPS (UI, checkpointed) — SHIPPED 2026-07-09 · Buri approved
      ✅ 2026-07-09** (checkpoint: "approve both as-is" + "keep the taunts" — the
      thin art strip, 6px longest-title floor, and first-person CPU quips all stay;
      difficulty-as-personas remains PARKED as the next §7·6 concept) (§7·6 i+ii;
      grill-scoped 2026-07-08, built 2026-07-09):
      **(i) NAME IS THE HERO** — StubCard title-block redesign (Duel + Solo, all
      sizes): adaptive `titleFit` (measure longest word + total len → shrink with a
      floor, wrap whole words, `hyphens:manual`) makes the full name ALWAYS whole —
      no "…", no mid-word break; the giant `width×0.46` monogram is DEMOTED to a
      small accent in a fixed-height art strip; year → small tabular eyebrow off the
      title's width; a bottom `flex-1` spacer pins title/art to the top so the ratio
      holds regardless of reveal state. **Exhaustively gated:** `?preview=
      StubTitleAudit` (new, 89 films × 3 sizes = 267 cards) → **0 mid-word breaks,
      0 content clips** measured in-browser with real Domine (a canvas pass caught
      that `break-word` hides overflow, so the real test is longest-word-fits, not
      scrollWidth). Key calibration: Domine caps advance is ~0.80/char/px (not the
      Connections fit's 0.73) → `CAPS_ADVANCE=0.82` + a −4px box buffer; floors
      lowered so 12-char words ("UNTOUCHABLES") fit whole (hand 6px, longest title
      "ONCE UPON A TIME IN HOLLYWOOD" floors at 6px @hand — whole > big, Buri's
      ruling). **Ride-along:** ChronoCard's own title had the identical bug — same
      fit ported (year-hero UNTOUCHED); `?preview=ChronoTitleAudit` (162×3=486) →
      **0 breaks** (caught + fixed "THE SOCIAL NETWOR/K" live). **(ii) TAZ → CPU**
      — neutral label everywhere player-facing: TazCorner nameplate `TAZ · CPU` →
      `CPU` + avatar `T`→`C` (booth + compact), ScoreRace header `TAZ`→`CPU` +
      "Taz's turn"→"CPU's turn", RecastOffer "TAZ PLAYS"/aria→CPU, DuelGame
      LastPlayLine `who1` `TAZ`→`CPU`; quip infra (`lastCpuQuote`/say) KEPT intact
      (parked persona reclaims it); internal `TazCorner` component name + codename
      comments left. Verified in real Duel: score+booth say CPU, `anyTazText:false`.
      Gate: build · full verify **64/64** · solo 8/8 · chrono 42/42 · connections
      14/14; browser-verified Duel @390×844+@375×667, Solo @390, Chronology @390.
      **PARKED (§7·6): difficulty-as-personas — NOT built.** Two throwaway audit
      harnesses kept as P2 pool-merge regression guards (flag: remove if unwanted).
- [x] **W5d CARD/UI REDESIGN BUILD (UI, checkpointed) — SHIPPED 2026-07-10 ·
      Buri approved ✅ 2026-07-10 (as shipped; Connections selected tile
      confirmed navy fill + amber border)** (Buri approved all four proposals 2026-07-09;
      comp = `docs/card-redesign-proposal.html`, committed with this wave).
      **Ruled fixes first (Buri, 2026-07-10, in-session):** (1) **BLOCKER
      Chronology year-in-DOM leak FIXED** — BackFace (which prints `card.year`)
      was always mounted (3D + reduced-motion paths); now mounts only on
      `faceUp || showYear`. Verified structurally: ChronoTitleAudit page = 486
      pre-placement cards, **0 four-digit years in the DOM** (was 486). (2)
      **Decade rail ruled a BUG → neutralized**: unplaced fronts ride the slate
      accent; decade color only once `showYear` (placed line keeps the colored-
      timeline read; 0 decade-colored elements measured on 486 unplaced cards).
      (3) **Duel draw-3 wild ruled AUTO-KEEP (match sim)**: `playerPickDraw`
      force-keeps a revealed wild (RULESET §11 parity with sim + CPU `draw3`);
      DrawChoice renders the wild FACE-UP with a "WILD — ALWAYS KEPT" navy/amber
      pill, other cards disabled+dimmed, header/footer copy states the rule;
      preview harness gained the wild section (`?preview=DrawChoice`).
      **The four approved builds:** (a) **StubCard POSTER PANEL** — flex-1 framed
      panel (navy border, cream+halftone, genre wash .13, −7° band .15, corner
      diamonds tall pile/raised) replaces the 14px strip AND the invisible bottom
      spacer; TALL mode (credits hidden: big mono over FULL genre word) / SHORT
      mode (credits shown: mono+genre row) keyed on `showCredits`; wild = amber
      ★ WILD one-sheet; comp-style DEEP CUT stamp (rotate 8°, inset cream ring)
      overlapping panel bottom-right, scaled per size (fixes the illegible
      11.5px disc major); **"+N DEEPER CREDITS"** red mono footer restored
      (pile/raised, N=deepCast.length — the rule HowToPlay documents); ledger
      **nameFit** (Inter advance 0.60, ticket-style abbreviation chain
      "Francis Ford Coppola"→"F. Ford Coppola"→"F. Coppola"→"Coppola"→hyphen
      segment, two-pass floor 6.5→5) — the +2 director never truncates; opt-in
      `flipHint` ("⇄ FLIP FOR CREDITS") passed only where a tap really flips
      (Duel/Solo pile tops + raised). Title band + titleFit UNTOUCHED. (b)
      **Connections landscape ticket stubs** — 62px tiles, radius 9, perf-dot
      row + side notches IDENTICAL on every tile (no group leak; perf dots flip
      cream on the navy selected fill — player state, not group state);
      `tileFontSize` recalibrated (91/longest ∧ 460/total, hyphen-aware,
      clamp 5 lines) — audited **0 overflows across all 236 grid titles**;
      controls moved INSIDE the board column (the ~250px dead band is gone).
      (c) **Menu card frames** — 2px navy border + punched side notches on the
      paper cards (`MenuNotches`), notches-only on the navy hero, practice pills
      → paper w/ 2px navy outline (uppercase mono), difficulty pills
      `whitespace-nowrap`; PLUS a real fix the capture surfaced: the menu
      overflowed 749px in a 667px viewport with NO scroll (Connections card
      unreachable on SE-class) → scroll container with `my-auto` centering
      (centers when short, scrolls when tall). (d) **End-screen UX + docs sync
      (Buri scoped in):** Connections loss gains **"See the board"** (results
      step aside; floating "↩ Back to results" pill returns) — the promised
      reveal is finally visible; **Menu button on all three** solo-mode end
      screens (Results/ChronoResults/ConnectionsResults, Duel's pattern);
      HowToPlay drift fixed (back lists cast+director — no "writers"; "drama
      deep blues" not the fictional bronzes; series not "trilogy" ×2; wild
      auto-keep sentence added); RULEBOOK updated (Modes line gains Connections;
      Last updated 2026-07-10; wild auto-keep; free-peek, Matinee ⇲ Sort, CPU
      last-card warn, recap reel documented; series wording); README → four
      modes + verify:connections + master-plan pointer; ui-contracts §DrawChoice
      wild contract. Also: dev-only `?mode=` boot param (DEV-gated like
      ?preview, tree-shaken) for capture tooling. **Gates GREEN:** full verify
      **64/64** · solo 8/8 · chrono 42/42 · connections 14/14 · tsc+build clean ·
      `?preview=StubTitleAudit` 267 cards **0 breaks/0 clips/0 name-truncs/0
      genre overflows** (audit caught + fixed: Domine chip line-height overflow
      at pile, nameFit advance 0.58→0.60, panel min-height) · ChronoTitleAudit
      486 **0 breaks + 0 year leaks** · captures @390×844 + @375×667 (menu,
      Duel, Solo, Connections; Chronology @390). **2026-07-10 REVIEW COMPLETION:**
      the 5 unrun areas (tokens-typography · layout-spacing · a11y · ledger-audit
      · process-retro) ran as a fresh 19-agent workflow (worktree-isolated,
      adversarially verified) — results in §7·7 + the fix docket. **FLAGS
      RESOLVED 2026-07-10:** (a) Connections selected tile — Buri confirmed
      keep-shipped (navy fill + amber border); (b) new majors ruled → §7·7(b)
      rulings + the W5e slice below.
- [x] **W5e PRE-SEND FIX SLICE (UI, checkpointed) — RULED + SHIPPED 2026-07-10 ·
      Buri approved ✅ 2026-07-10** (Buri's §7·7 picks): (1) **pinch-zoom
      unblock** — `maximum-scale=1.0, user-scalable=no` dropped from
      index.html (WCAG 1.4.4; the low-vision cover for the 6–9px type floors;
      iOS ignored the lock anyway, Android Chrome enforced it). (2)
      **end-screen overlay clip @667 FIXED in all four** — menu-fix scroll
      pattern (root `overflow-y-auto`, inner column `my-auto`) on Duel
      game-over (wrapper column added — children sat directly in the root),
      Solo Results (card gets `my-auto`, root py; the revealed-solution list
      was the tall case), ChronoResults + ConnectionsResults (inner column
      `my-auto py-6`). (3) **analytics replay desync FIXED** — every
      in-component replay (`resetGame` ×3 / `newGame`) re-fires `mode_start`,
      pairing starts 1:1 with finishes (pre-fix one mount emitted 1 start /
      N finishes); docs/mode-readouts.md synced. **Gates GREEN:** tsc+build
      clean · verify **64/64** · solo 8/8 · chrono 42/42 · connections 14/14
      (sim untouched — regression confirm). **Browser-verified @375×667:**
      viewport meta clean in DOM · Connections daily played to a real loss —
      end screen centered + complete at 667 (`my-auto` = 43px margins),
      scrolls with top reachable at a forced 480 (was unreachable under
      justify-center) · "See the board" + back-pill flow intact · "Play again"
      appended exactly ONE new mode_start in window.vaq · all 4 modes boot
      zero console errors. **Checkpoint flag:** Duel game-over overlay
      verified structurally (same fix class, tsc/build), not driven to a live
      game-over this session — the played-game evidence is the Connections
      daily. **NOT pulled (post-SEND backlog, §7·7b):** HUD/MeldShelf overlap
      @667 · Domine ticking numerals · full keyboard operability.
- [x] **W6 SEND — DEPLOY EXECUTED 2026-07-10 (Buri pressed the button in-session,
      with one amendment: PUBLIC URL).** Buri ruled the circle send happens on
      the real domain — easier to hand to 5–10 people than the vercel.app
      alias. Executed: fresh production deploy (`marquee-m4tonx239`, the W5e
      build, 15s build, READY) + **matchcutdaily.com attached to the project**
      (domain was Vercel-registered 2026-07-04, nameservers already Vercel —
      instant). Verified live: `https://matchcutdaily.com` HTTP 200, serves the
      W5e build (zoom lock absent, viewport-fit present), `noindex, nofollow`
      HOLDS (quiet phase — public URL ≠ indexed; Buri's stated reason was
      shareability), old `marquee-one-iota.vercel.app` alias also updated.
      **Guardrails intentionally kept:** noindex stays until real launch ·
      share text stays URL-less (URL-in-share remains THE launch switch) ·
      playmatchcut.com parked unattached (point/redirect later). **Still
      human:** Buri texts the circle the link + one-line pitch per mode;
      interviews ~2 weeks out (→ ~2026-07-24) pick the front door.
- [x] **POST-SEND · analytics slice (objective, auto) — SHIPPED 2026-07-10**
      (commit efae3d4, pushed; §2.11 exception b — **deploy before Buri texts
      the circle**): track() gains 'share' (fired by ShareCopy only on a
      LANDED clipboard copy; payload threaded from all four callers — {mode,
      kind} dailies, {mode, difficulty} Duel; the component never guesses its
      mode) + mode_finish outcome ride-alongs from existing in-scope state
      (Duel result won|lost|draw off the derived winner · Solo
      result/flips/score/par · Chronology strokes+score · Connections already
      had result). Gates: full verify 64/64 · solo 8/8 · chrono 42/42 ·
      connections 14/14 · build. Browser-verified: Chronology cleared, Solo
      driven to stuck, Connections driven to a loss — share fired on all
      three with correct payloads, every replay appended exactly ONE
      mode_start (W5e pairing holds); Duel boot live, finish/share
      structural (W5e precedent); console clean. **Buri: deploy receipt +
      dashboard custom-events check = §7·9.**
- [x] **POST-SEND · Chronology line-overflow fix — SHIPPED + DEPLOYED
      2026-07-10** (commit 267a8be; feedback-log entry #1, Buri's own report;
      §2.11 exception a, ruled in-session): at 4–5 line cards the band
      overflowed and edge gaps became unreachable — no scroll while a card
      was raised (backdrop z-order), no auto-scroll mid-drag, and the
      nearest-visible-gap hit-test silently scored misfires the player never
      chose. Fix (UI-only, sim/scoring untouched): drag auto-scroll at band
      edges (rAF hold-to-glide, 48px zone) · line band z-30 above the
      tap-to-lower backdrop · ambiguous-edge drop guard (shake + coach toast;
      a stroke can never come from an off-screen slot) · settle-into-view
      after every placement (offsetLeft, not rect — layoutId flight is
      mid-transform). RULEBOOK Mode 3 gains the scroll line. Gates: verify
      64/64 · solo 8/8 · chrono 42/42 · connections 14/14 · tsc · build;
      driven live in-browser @390×844 (edge-hold scrolled 140px to clamp,
      guard toast fired, misfire auto-corrected into view). Deploy
      `dpl_7tUmeLkVxnTVBmZQ7RJUHz8Uq8gK` verified live on matchcutdaily.com.
- [x] **POST-SEND · Stage B pool merge + DEPLOY — EXECUTED 2026-07-12** (one
      session, full pipeline; §2.11 exception ruled in-session: **catalog live
      BEFORE Buri widens the circle** — new recipients onboard onto the big
      pool instead of a build about to change under them). Strikes: Buri via
      tap-to-strike artifact, 277/352 kept (74+300 struck, 0 ⚡ vetoes).
      Drafts: `tmdb:draft` ×2 (⚡ 111 · new-stub 167), 47 CHECK / 0 NOT-FOUND.
      Arbitration (docs/stage-b-arbitration-docket.md): 45 auto-resolved via
      two parallel Opus triage passes + 5 Buri rulings ledgered
      (tmdb-rulings.md): Spirited Away 2002-09-20 + **standing policy: intl
      films = first US theatrical, card year follows** · 300 struck
      (wrong-film match) · Hurt Locker + Taken → 2009 (faces 2008→2009) ·
      Soul dropped from Chronology (streaming class parked). Merge 2fccdcf:
      110 ⚡ releaseDates + 166 DATED_STUBS (array 46→212) → **chronology pool
      162→438**, spread 34/60/91/97/104/52 (70s mini-slate owed). Gates green
      (tsc · build · 64/64 · 8/8 · 42/42 · 14/14); daily driven live with the
      new pool (Hurt Locker anchor @2009). Deploy
      `dpl_2YrXPFMDWjZujapDznvoNH65jBYZ` — matchcutdaily.com serves
      index-CjEFO-7t.js with the 438 pool (superman-2025 present), noindex
      HOLDS. **Carry-forward: chronology feedback/analytics now split across
      THREE builds (pre-overflow-fix / post-fix-162-pool / 438-pool) — tag at
      the ~07-24 read. Today's chrono daily reshuffled at deploy.**
- [ ] **POST-SEND · fix slice (§7·7b + §7·7c minors)** — Domine ticking
      numerals · Duel HUD/MeldShelf overlap @667 · full keyboard operability ·
      minors sweep (favicon, Solo blurb, MeldShelf legacy spine, difficulty
      reset, race-to-20 timing, stale handoff RULEBOOK dupe, practice-vs-daily
      share ambiguity, Chrono replay re-deal). Build+commit freely; **deploys
      batch to window close (§2.11)**.
- [ ] **POST-SEND · icon pass + Framer polish (§7·8·1/·3)** — overhaul-era:
      zero-dep local SVG icon set (share-emoji exempt per §7·8·2) + Framer
      micro-animations. Ticket-stub-voice filter applies (§7·8).
- [ ] **POST-SEND · launch-switch landing pass (§7·8·4)** — menu becomes the
      de-facto landing page when URL-in-share flips; **gated on the
      front-door pick (post-interviews)**.
- [ ] **POST-SEND · personas (§7·6, feedback-gated)** — difficulty-as-personas
      grill/spec first; re-skin if knobs unchanged, re-sim/re-tune if not.
- [ ] **POST-SEND · P2-LOCK docket grill (§7·4b, at LOCK)** — chrono pin ·
      Solo cutover · Duel cutover+re-tune · Connections diversity floor ·
      bundle intern; convene as a grill-me session with real feedback in hand.
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
3. UI checkpoint approvals — **ALL CLOSED**: W1/W2/W3/W4/W5a–e ✅ (W5e approved
   2026-07-10; the pre-SEND UI program is complete).
3b. ✅ RESOLVED 2026-07-06: Buri ratified the self-checked
   `CHRONO_TITLE_OVERRIDES` map (4 films: LotR ×3, M:I Fallout) over a
   `chronoTitle` field on `Movie`. The map stands.
4. W5 calls: tilt ✅ **SHIP ruled 2026-07-08** (Buri agreed the ~9.5pp edge ships
   as a documented, gate-pinned house edge; human is always seated first
   (`DuelGame.tsx:218` inits `status='playerTurn'`, no seating coin-flip) so the
   edge always favors the human; the difficulty tune already contains it; revisit
   only with real post-SEND data or if PvP/randomized-seating ever lands) · pool
   cutover ✅ **DEFER now → cut at P2 LOCK ruled 2026-07-08** (Buri: neither Solo
   nor Duel moves off the frozen tuned 89 for SEND; revisit at pool LOCK. Split
   preserved: **Solo** cutover at LOCK = a cheap `verify:solo` re-pin; **Duel**
   cutover stays bundled with its mandatory re-tune — a bigger Duel pool
   invalidates the 65.5/49.7/41.8 tune (§0 "Duel pool growth/retune"), so it can
   never be a blind pin-swap; it rides its own re-tune pass at/after LOCK, not a
   W5 item) · Connections category-diversity ✅ **LEAVE AS-IS for SEND → re-eval
   at P2 LOCK ruled 2026-07-08** (Buri: the actor-heavy mix — 29% `aaaa`, 74%
   of groups actor — isn't *proven* flat, only histogrammed; P2 growth
   diversifies it for free; the LOCK re-bake makes a "≥2 distinct kinds" floor
   near-free *if* the W5c phone-in-hand pass shows consecutive dailies read
   repetitive on reveal). **All three W5b calls resolved.**
4b. **P2-LOCK re-evaluation docket + grill (Buri, 2026-07-08).** Everything
   deferred to the moment P2 Stage B LOCKs the pool is collected here so nothing
   silently falls off; when LOCK lands, convene a **grill-me session** (after some
   real testing + circle feedback) to rule these with data, not blind:
   - **(D1) Chronology published-daily pin** — lands at LOCK (solo-verify shape;
     pinning earlier churns every Stage-B merge). §3·W5.
   - **(D2) Solo pool cutover** — the cheap one: reshuffle onto the big pool +
     re-pin `verify:solo`. A live call at LOCK. §7·4.
   - **(D3) Duel pool cutover + re-tune** — the heavy one: a bigger Duel pool
     invalidates the difficulty tune, so it rides its own re-sim/re-tune pass,
     never a blind pin-swap (§0 "Duel pool growth/retune"). At/after LOCK. §7·4.
   - **(D4) Connections category-diversity** — decide the "≥2 distinct kinds"
     floor against the LOCK-era histogram + the W5c phone-in-hand feel read;
     fold into the re-bake that LOCK forces anyway. §7·4, Ledger W4 carry (ii).
   - **(D5) Connections bundle −9 KB** — intern film ids in the baked grids;
     cheapest at the LOCK re-bake, not before. Ledger W4 carry (i).
   - **Enabling action:** LOCK forces a **Connections grid re-bake** (pool
     changed) — D4 + D5 ride it for near-zero marginal cost; that's *why* they
     wait for LOCK rather than spending a standalone re-bake now.
5. W6: the deploy button — **✅ PRESSED 2026-07-10** (public-URL amendment;
   Ledger W6). Remaining human steps: Buri texts the circle the link + pitches;
   interviews ~2 weeks out (~2026-07-24) pick the front door.
6. **W5c follow-ups (Buri RULED 2026-07-08 via grill) — ACTIVE this session
   (2026-07-08), in his order** (W5c checkpoint approved ✅; grill-first on (i)):
   - (i) **Card title redesign → "NAME IS THE HERO" (ruled). ◀ SHIPPED + Buri
     approved ✅ 2026-07-09 (as-is).** Grill rulings (all Buri's
     recommended picks):
     **SCOPE = StubCard only** (Duel/Solo hand·pile·raised lock to one zone ratio;
     ride-along fix ChronoCard's *own* title mid-word break but KEEP its year-hero
     layout; Connections tiles already ship the adaptive fit — untouched). **MONOGRAM
     = demote to a small corner accent** (full auto-fit title becomes the dominant
     type; ticket-stub character preserved, name wins). **FIT = adaptive font-size**
     (the just-approved Connections `tileFontSize` model: measure longest word,
     shrink with a min floor, wrap whole words — no "…", no mid-word break at any
     size). Year → small tabular eyebrow/corner, out of the title's width (orchestrator
     detail, shown at confirm). Note: StubCard is already wired into every caller, so
     this edit updates all six contexts at once — single-writer, checkpointed, full
     side-by-sides + a played game, then STOP.
     The movie name is
     "the most important part" — make the full title ALWAYS readable (auto-fit,
     no "…", no mid-word break), **shrink/demote the big first-letter monogram**
     so the name has room, and **lock the title / monogram / art zones to ONE
     ratio across every card**. = a **StubCard title-block redesign** (high blast
     radius — StubCard renders Duel/Solo/Chronology/Connections cards; reopens the
     §2.6 typographic-face design). SUBSUMES the raised-StubCard mid-word-break
     flag. Direction is locked; still scope the exact layout grill-first.
     Checkpointed UI.
   - (ii) **Opponent → RENAME "TAZ" → "CPU" now (ruled). ◀ SHIPPED + Buri approved
     ✅ 2026-07-09 (keep the taunts).** Neutral label
     everywhere (score header, TazCorner nameplate/avatar, LastPlayLine "CPU
     +1"). **Keep the quip infrastructure** (`lastCpuQuote` / say quotes) — the
     parked persona concept reclaims it. Copy sweep; confirm at build whether the
     neutral CPU keeps the first-person quips as flavor or mutes them. **Built:
     labels swept (nameplate `TAZ · CPU`→`CPU`, avatar `T`→`C`, score `TAZ`→`CPU`,
     "Taz's turn"→"CPU's turn", "TAZ PLAYS"→"CPU PLAYS", LastPlayLine `who1`→`CPU`);
     quips KEPT (first-person flavor retained — the CPU still taunts; Buri to
     confirm keep-vs-mute at checkpoint). Internal `TazCorner` name + codename
     comments left intentionally.**
   - **⏸ PARKED CONCEPT → NOW POST-SEND (Buri, 2026-07-09): difficulty-as-PERSONAS.**
     Replace the Matinee/Feature/Director's difficulty *labels* with named rival
     characters you choose to play against — e.g. **snobby movie critic = hardest ·
     hipster movie buff = mid · a different character = easy**. "Personas to play
     against instead of the difficulties." **Moved to AFTER W6 SEND (Buri, 2026-07-09):
     gate it on real circle feedback — don't build it pre-SEND.** The CPU rename
     already kept the door open (quip infra stays). If personas MAP onto the existing
     3 difficulty knob-sets it's a re-skin (no re-tune); adding/altering knobs =
     a difficulty change → re-sim + re-tune (§2.9). Needs its own grill/spec
     before build. NOT a launch blocker (and now explicitly a post-launch idea).
   - (iii) **Intro copy → STAY HIGH-LEVEL (ruled, CLOSED).** No change — the menu
     cards already blurb each mode; naming them in the overlay would duplicate and
     edge toward the declined funnel.
7. **W5d checkpoint + post-review docket (2026-07-10).** The 2026-07-09 deep
   review's 5 unrun areas COMPLETED 2026-07-10 (19-agent workflow, worktree-
   isolated, adversarial verify; results `subagents/workflows/wf_0bf27745-f84/
   journal.jsonl` in session 1cba6766). Everything it re-confirmed from the
   known docket is FIXED in W5d (year-leak blocker · decade rail · wild burn ·
   Connections loss reveal · genre truncation · menu 667 overflow — the last
   found independently at blocker severity by the layout agent AND caught live
   during W5d captures). **ALL RULED 2026-07-10:**
   - **(a) W5d checkpoint approval — ✅ APPROVED as shipped 2026-07-10.**
     Judgment call confirmed: Connections SELECTED tile keeps the navy fill +
     amber border (the proposal sheet's minimal `.sel` css showed paper-bg
     selection; Buri ruled keep-shipped).
   - **(b) NEW CONFIRMED MAJORS — RULED 2026-07-10: pre-SEND = 2's pinch-zoom
     line + 4 (→ W5e slice, §6); post-SEND backlog = 1 (Domine numerals) +
     3 (HUD/shelf overlap) + the full keyboard path from 2:**
     1. **Domine has no tabular figures** — every `tabular-nums` on
        font-stub-display is a silent no-op; scores/deck count/end totals/
        strokes reflow as they tick (ScoreRace.tsx:224 et al; the shipped woff2
        and upstream Domine both lack `tnum`, unfixable by subsetting). Options:
        Inter numerals for ticking values · fixed-width digit spans · pin
        containers; README line 28 over-promises either way.
     2. **A11y cluster** (verified ×2 agents): no keyboard path for the
        Duel/Solo/Chrono play loop (drag-only); overlays lack focus
        trap/Escape/role=dialog and the background stays tabbable; StubCard has
        no aria-label at hand/pile/raised; no aria-live anywhere
        (say()/LastPlayLine/toasts); `user-scalable=no` in index.html:7 blocks
        pinch-zoom (WCAG 1.4.4 — one-line fix, recommend now given 6-9px type).
     3. **Duel HUD/MeldShelf overlap** — bottom-pinned chips overlap the shelf
        band whenever ≥1 meld is banked at 667 (DuelGame.tsx:1790).
     4. **End-screen overlays can clip at 667** — same class as the fixed menu
        bug: `absolute inset-0 justify-center` + no scroll; Duel game-over
        worst case (recap reel + record line) is the risk (DuelGame.tsx:1940).
     Recommendation was: fix 2's pinch-zoom line + 4 (mechanical, small)
     pre-SEND; 1 + 3 pre-SEND if cheap after inspection; full keyboard
     operability = post-SEND backlog. Buri took the two recommended picks
     and sent 1 + 3 post-SEND outright.
   - **(c) Deferred by Buri's W5d scope ruling — analytics PULLED FORWARD
     2026-07-10:** analytics replay desync (mode_start/finish, all 4 modes)
     now rides the W5e pre-SEND slice (it pollutes the exact 2-week data
     window SEND exists to gather). Still deferred: the minors sweep (favicon,
     Solo blurb
     two-win-conditions, MeldShelf legacy posterColor spine, difficulty reset
     on load, race-to-20 mid-turn timing, stale design_handoff RULEBOOK dupe,
     practice-vs-daily share ambiguity, Chrono "Play again" re-deals identical
     daily).
   - **(d) Process-retro highlights** (full narrative in the journal): WELL —
     sim-first parity, pin discipline, byte-identical gates, single-writer
     rule; CHURN — the invisible-inventory reset, StubCard comp-anatomy
     bounce; RISKS — 2,000-line DuelGame single-writer bottleneck, tuning
     fragility on pool growth, checkpoint latency on a solo owner;
     recommendation: archive bannered docs post-launch.
8. **UI-overhaul intake — Buri's 2026 design-guide review (RULED 2026-07-10:
   all five lines approved + the guiding filter).** Source: Buri's "2026
   Strategic App Design" guide, reviewed against the live codebase (emoji
   sweep) and the 7f token gaps (§1). These are **OVERHAUL-ERA** items — they
   ride the next UI overhaul wave, not the §7·7b post-SEND fix slice, except
   (4) which rides the launch switch:
   - **(1) Icon pass:** replace emoji-icons with a **local zero-dep SVG icon
     set** — copy the ~10 needed SVGs from Phosphor or Lucide (MIT/ISC) into a
     local `Icon` component; **no new package** (deps stay locked). Fills the
     7f "no icon set" token gap. Known instances: `HowToPlay.tsx:179-182`
     meld-ladder 🎬⭐🎞️🎟️ · `Results.tsx` 🧱-in-UI. Also convert FUNCTIONAL
     text glyphs on interactive elements (⇄ ↔ ✓ — some codepoints carry
     emoji-presentation variants and can render as color emoji on iOS); keep
     decorative ★/→ in-font. Comp Phosphor vs Lucide on a real StubCard before
     committing (Phosphor fill/duotone = the hunch, unverified).
   - **(2) Share-emoji exemption (standing note):** the 🎬🟩🟥🧱 clipboard rows
     (`share.ts`, `DuelGame.tsx:1315`, `SoloGame.tsx:89`,
     `ChronologyGame.tsx:592`) are the daily-game share convention —
     **permanently exempt** from icon cleanup; they live in text messages, not
     UI chrome.
   - **(3) Interaction-polish pass:** Framer Motion micro-animations on
     meld/score/card transitions. Explicitly **no GSAP** (redundant with the
     locked Framer dep).
   - **(4) Launch-switch rider:** when URL-in-share flips at real launch, the
     front-door screen gets a landing-page-quality presentation pass — a shared
     link makes the menu the de-facto landing page; presentation = trust.
   - **(5) Recorded skips (don't relitigate at overhaul):** glassmorphism
     (fights the Stub's solid print aesthetic; the guide itself flags the a11y
     criticism) · PostHog (Vercel Analytics suffices; revisit only if the
     interviews demand funnels) · haptics (`navigator.vibrate` is a no-op on
     iOS Safari; the circle is iPhone-heavy) · GSAP (see 3). Guide points
     already covered elsewhere: personas → §7·6 · custom illustrations → the
     parked card-art track · real-device testing → the standing checkpoint
     protocol.
   - **Guiding filter (Buri-endorsed, applies to every item above):** per
     glyph/element ask **"does this carry the ticket-stub voice or fight
     it?"** — not "is it an emoji?". Match Cut is a game; over-cleaning into a
     productivity-app look is as much a failure as emoji clutter.
9. **Post-SEND asks (logged 2026-07-10 at the analytics-slice close):**
   - **(a) Deploy → then text, in that order:** ✅ **DEPLOY EXECUTED
     2026-07-10** (Buri asked in-session; `npx vercel deploy --prod` →
     `dpl_Hj31Au4fmFoaoBxe8uGSD4FPUdmv`, matchcutdaily.com verified serving
     the new bundle `index-CCwc83pU.js` with the 'share' event in the JS;
     noindex meta intact). Remaining human half: **text the circle** — the
     full 2-week window now has share + outcome data from message one.
   - **(b) Dashboard receipt check:** after a few real plays, confirm the
     custom events (mode_start / mode_finish / share) actually appear in the
     Vercel Analytics dashboard. Client-side vaq proof ≠ server receipt —
     custom events can be plan-gated. If absent, flag loudly: the ~07-24
     data cross-check needs a rethink.
   - **(c) Rotate the mode order across the 5–10 pitch texts** — pitch order
     biases which mode gets tried first; rotation keeps the front-door data
     clean.
   - **(d) Stage B strikes are the launch long-pole** (0/352 struck; the 111
     ⚡ cheap wins are the natural quiet-window batch — §7·2).

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

POST-SEND (since 2026-07-10, live at matchcutdaily.com): build tracks are
§0's list — P2 Stage B strikes → LOCK docket (§7·4b), fix backlog (§7·7b),
personas (§7·6), UI-overhaul intake (§7·8). Pushes NEVER auto-deploy
(npx vercel deploy --prod, Buri's button). The window deploy-FREEZE policy
(§2.11) applies until interviews close (~2026-07-24): fixes build+commit+
push freely, deploys batch to window close. Circle feedback lands in
docs/feedback-log.md as it arrives.
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
- v3 (2026-07-10, post-SEND session): SEND-window deploy-FREEZE policy →
  §2.11 (Buri's 2026-07-10 ruling) · §6 gains the post-SEND track entries
  (analytics slice ticked; fix slice / icon+Framer / landing pass / personas /
  P2-LOCK grill queued) · §8 gains the post-SEND paragraph · §7·9 logs the
  four close-out asks (deploy→text order · dashboard receipt · pitch rotation ·
  Stage B long-pole) · `docs/feedback-log.md` created (append-only circle
  ledger, pointed from §0) · CLAUDE.md gate line gains verify:connections
  14/14 + DuelGame stats refreshed (~2,060 ln / 39 useState).
