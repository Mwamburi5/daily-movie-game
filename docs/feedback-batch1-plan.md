# Feedback batch 1 — fix-plan docket (2026-07-16)

> **PROPOSAL DOCKET, not a build plan.** `docs/master-plan.md` stays the only
> live plan. This docket maps every issue from feedback batch 1
> (`docs/feedback-log.md`, 27 entries logged 2026-07-16, commit f7ea3f0) to an
> independent proposed fix, sized and gated. Buri rules the ☐ items; ruled-in
> work folds into the master-plan queue (§7·7b fix slice · §7·8 UI intake ·
> the ~07-24 interviews docket) and this file becomes history, arbitration-
> docket style.
>
> §2.11 posture throughout: **nothing here is a `!` play-blocker** — build
> freely, every deploy batches to window close (~07-24).

Item tags: **[ship-slice]** objective/copy, buildable now, auto-gates ·
**[checkpoint]** UI-visible, stops for Buri with side-by-sides @390×844+375×667 ·
**[ruling ☐]** needs a Buri decision before any build · **[interviews]** gated
on the ~07-24 read · **[⚠ rule-change]** would invalidate tuning/pins — parked,
never folded into an unrelated edit (CLAUDE.md).

---

## A · Chronology

### A1 · Remake-title disambiguation — [ruling ☐] then [ship-slice]
- **Evidence (×2 independent):** Hans + RCS friend both drew The Little Mermaid
  and couldn't know which film it was. Pool sweep confirms exactly **two**
  colliding bare titles in the 438 pool: `superman` (1978) / `superman-2025`,
  `the-little-mermaid` (1989) / `the-little-mermaid-2023`. No others today; the
  sweep should be a standing assert so future merges can't reintroduce it.
- **Fix:** distinct Chronology-face titles via the ratified
  `CHRONO_TITLE_OVERRIDES` class (scripts/build-chronology-pool.ts:71) for
  MOVIES entries / direct title edit for stubs. **Constraint: the tag cannot be
  or leak the year — the year IS the hidden answer.**
- **Ruling needed ☐ — naming convention:**
  - Mermaid: recommend **"The Little Mermaid (Animated)" / "(Live-Action)"** —
    natural, self-explanatory.
  - Superman: no animated/live split exists. Options: lead actor
    ("(Christopher Reeve)" / "(David Corenswet)"), director ("(Donner)" /
    "(Gunn)"), or franchise-style retitle for 1978 ("Superman: The Movie") —
    note a bare "Superman" left on either side stays ambiguous, so **both**
    faces need tags. Recommend lead-actor tags (players know Reeve; the card
    stays a movie fact, not a trivia test).
- **Gates:** rebuild pool JSON (byte-diff review) · tsc · build ·
  verify:chronology 42/42 · duplicate-title assert added to the builder.
- **Effort:** XS. Task chip already spawned (task_ab85ed3e).

### A2 · Same-year placement is blind → surface the month — [checkpoint]
- **Evidence (×2 independent + a mechanic fact):** Uzair (his tight deal ran
  five 2014s; asked for month, or quarter/season) + note item 12. The engine
  orders by **full release date** (chronology.ts:55 — "same-year films still
  resolve to exactly one correct slot"), but card faces show only the year — so
  placing the 4th card of a same-year run is literally guesswork. This is a
  fairness gap in tight mode, not polish.
- **Fix (display-only, contract untouched):** placed cards reveal their
  **month** when ≥2 placed cards share a year (e.g. `NOV 1989`); tie-only
  reveal keeps faces clean in the common case. Solver/par/verify pins don't
  move — the par bot already knows full dates; humans just stop being blinder
  than the bot.
- **Explicitly NOT this item:** note item 12's "input month as an extra step"
  (new mechanic) — that's A4 territory.
- **Gates:** UI checkpoint (both widths) · verify:chronology stays 42/42
  untouched · RULEBOOK Mode-3 line in the same pass.
- **Effort:** S.

### A3 · Overflow/scroll affordance — ✅ RESOLVED (reel approved 2026-07-12)
- **Evidence:** Uzair screenshot — tight practice runs off-screen; "display all
  on one screen or show a prompt that you can scroll." Scroll exists post-
  267a8be but is undiscoverable. Note item 10 asks for a vertical timeline —
  same direction.
- **Resolution (docket correction 2026-07-16):** the swipeable-reel redesign
  on `codex/chronology-reel` (bdd4812) was already **BUILT + Buri approved ✅
  2026-07-12** — ledgered on the branch itself (gates green, design-qa passed,
  both widths evidenced). No evaluation session needed; the branch waits for
  the window-close batch deploy (~07-24) per §2.11. The fallback (edge-fade +
  one-shot "swipe ⟷" pill) is moot.
- **Effort:** none remaining — merge+deploy rides the batch.

### A4 · Chronology scoring suggestions — [interviews] [⚠ rule-change]
- **Evidence:** note items 9 (batch submit, then reveal misplacements) and 11
  (goal = lowest time). Each replaces the golf/strokes contract → re-derived
  pars, re-pinned verify:chronology, RULESET + RULEBOOK rewrites.
- **Plan:** park both for the ~07-24 interviews; if either is ruled in it gets
  its own spec + sim/eval cycle (§2.9 discipline). No mid-window build.

## B · Connections

### B1 · "One of each category" mental model — copy fix — [ship-slice]
- **Evidence (×2 independent):** RCS friend strategized the endgame on
  one-actor/one-director/one-series/one-genre and lost on it; note item 1 asks
  for that as a feature. Reality (connections.ts dealer lock): groups draw from
  director/actor/series/genre, **types may repeat, max ONE genre group**
  (MAX_GENRE_GROUPS = 1).
- **Fix:** one added sentence in the Connections how-to (HowToPlay.tsx) — "the
  four groups can repeat a type (two directors happens); at most one group is a
  genre" — plus RULEBOOK Mode-4 line. Making one-of-each REAL is a dealer
  constraint change (viable-space shrink, 365-grid re-bake, re-pin) —
  [interviews] only if confusion persists after the copy ships.
- **Effort:** XS.

### B2 · Non-buff difficulty wall + hint asks — [interviews], feeds §7·6
- **Evidence:** Eyad 0/4 groups, Uzair 2/4; three separate softening asks
  (note item 2 "3 hints" · Uzair per-guess category reveal · his own "easy
  mode for us plebs" framing).
- **Plan:** no hint mechanic mid-window — this is exactly the feedback the
  parked personas concept (§7·6) was gated on, and the interviews must first
  split "too hard for me" from "too hard, period" (the whole sample is
  self-described non-buffs). Fold these three asks into the §7·6 grill/spec as
  its opening evidence.

### B3 · Genre subjectivity — [interviews] content policy
- **Evidence:** Uzair — "Gone Girl doesn't feel like a thriller to me"; note
  item 13 "does genre make it easier?" is adjacent.
- **Plan:** collect instances until interviews, then a content-policy ruling
  (e.g. genre groups restricted to broad uncontested genres). Any metadata or
  dealer change re-bakes the 365-grid pin (verify:connections) — not a
  mid-window edit. The dealer already caps genre at one group per grid, which
  bounds the blast radius.

## C · Duel / Solo legibility (biggest cluster — 3 sources)

> One-writer rule: C2–C5 + D1 all touch `DuelGame.tsx`/`SoloGame.tsx` — they
> ship as **one serialized slice**, not parallel edits.

### C1 · Rules formatting: summary-first HowToPlay — [checkpoint]
- **Evidence:** Uzair wants "a popup [with] the overall summary … and a button
  to the detailed instructions"; note item 6 "rules should be formatted
  better."
- **Fix:** restructure `HowToPlay.tsx` into a short summary card (3–4 lines
  per mode) with an expandable "full rules" section — same content, layered.
  **Protocol note:** §7·5(iii) ruled intro copy STAYS high-level (closed) —
  that ruling covered the menu overlay; this is the in-mode how-to, so it
  doesn't reopen (iii). Flagging the adjacency anyway so the checkpoint can
  confirm.
- **Effort:** S–M.

### C2 · Flip cost is invisible — [ship-slice] copy + counter feedback
- **Evidence:** Uzair — "didn't realize flipping was a bad thing at first."
  Mechanic fact: in the Solo daily, par is literally derived as *a flip per
  card + two misplays* (daily.ts:28) — flips are counted moves, and nothing
  says so.
- **Fix:** (a) one how-to line ("peeking flips count as moves"); (b) the move
  counter visibly ticks (+1 pulse) on flip so the cost teaches itself.
- **Effort:** S (inside the C-slice).

### C3 · Drag affordance — one-shot prompt — [checkpoint]
- **Evidence:** Uzair — "add a prompt to drag it to play cuz that took me a
  sec."
- **Fix:** first-interaction nudge on a fresh device (pulse + "drag a card to
  play" hint, dismissed forever on first successful drag; localStorage
  meta-state). Matinee-first if we want it quieter (precedent: take-glow was
  gated to Matinee).
- **Effort:** S (inside the C-slice).

### C4 · Hand readability — [checkpoint]
- **Evidence:** note item 3 — "better be able to see the names of movies in
  your hand."
- **Fix:** typographic pass on hand-card titles within Stub tokens (size/wrap/
  truncation) at 390×844 AND 375×667 — the 667 gate is where titles get tight.
  Card faces stay typographic-this-build (ruled); no art-slot work.
- **Effort:** S (inside the C-slice).

### C5 · "Deep cut?" — explain the stamp — [ship-slice]
- **Evidence:** note item 7, verbatim question.
- **Fix:** one how-to/rules line: deep cuts = films linked by a non-headline
  credit; the circular DEEP CUT stamp marks them. (D1 difficulty-lever stays
  parked — this is copy only.)
- **Effort:** XS (inside the C-slice).

### C6 · "Best play option" — [interviews] (ambiguous)
- **Evidence:** note item 4 — unresolvable between praise ("daily is the best
  mode") and a request (best-move hint). A hint button already exists.
- **Plan:** interviews follow-up question; no build on a guess.

### C7 · "Did not understand the duel vs computer at all" — [interviews]
- **Evidence:** RCS friend, total comprehension failure; zero would-return
  votes for Duel across the batch.
- **Plan:** the C1–C5 legibility slice is the cheap bet already in flight;
  whether Duel needs deeper reframing (naming, spectate-first onboarding, or
  demotion from front-door candidacy) is THE interviews question — the
  front-door decision was always data-gated. Don't redesign mid-window.

## D · Cross-mode copy

### D1 · Genre-meld floor is invisible — [ship-slice]
- **Evidence:** note item 5 — tried Interstellar+Arrival as a 2-card sci-fi
  meld, "it wouldn't let me," concluded connecting is actor/director-only.
  Locked rule 2.3: genre melds need 3 cards.
- **Fix:** contextual `say()` line on a 2-card genre attempt ("genre melds
  need three") + a how-to line. Rule untouched.
- **Effort:** XS (inside the C-slice; DuelGame.tsx surgical).

### D2 · "Wide and tight lol" — practice pill labels — [checkpoint]
- **Evidence:** note item 8 — labels read as jargon.
- **Fix:** rename or subtitle the Chronology practice pills (e.g. "Wide ·
  any era" / "Tight · same era") — copy only, deal shaping untouched. RULEBOOK
  sync in the same pass.
- **Effort:** XS.

## E · Signals (no build — carried to the ~07-24 read)
- **Would-return: Chronology + Connections, named by BOTH answerers; Duel 0.**
  Cross-check against Vercel Analytics share/outcome events at interviews.
- Whole batch is self-described non-buffs — segment before any difficulty
  conclusion.
- No bugs, no blockers, zero breakage reports across 5 people.

---

## Sequencing

1. **Ruling pass (Buri, minutes):** A1 naming ☐ · greenlight the ship-slice
   set (A1, B1, C2, C5, D1) · confirm C1/C3/C4/D2/A2 enter the checkpoint
   queue.
2. **Ship-slice build (objective, auto-gates):** A1 + B1 + C5 + D1 + C2 —
   copy/content only; gates: tsc · build · verify 64/64 · solo 8/8 ·
   chronology 42/42 · connections 14/14 · RULEBOOK sync. Commit+push, NO
   deploy (batches to ~07-24).
3. **Checkpoint wave (serialized on DuelGame/SoloGame):** C-slice UI (C1, C3,
   C4) + A2 + D2 → side-by-sides both widths → STOP for Buri.
4. ~~**Reel decision (A3)**~~ — RESOLVED: reel was approved 2026-07-12
   (ledgered on the branch); it rides the window-close batch deploy.
5. **Interviews docket additions (~07-24):** A4 ⚠ · B2 (→§7·6 grill) · B3 ·
   C6 · C7 · B1-escalation-if-copy-fails.
