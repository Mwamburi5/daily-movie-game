# Chronology, Phase 6 Kickoff Prompt

> Paste the block below into a fresh session to resume Chronology at Phase 6 (the
> docs phase: promote the mode into RULEBOOK.md and make the three modes read as
> one family). It is self-contained: it states what is already done, the design
> calls to make first, what to write, and the guardrails to honor. Written
> 2026-06-30 at the clean Phase 5 stop (the mode is fully playable: date-seeded
> daily, Wide/Tight practice, real Cleared and share screen). Phase 6 is the last
> build-plan phase. Note: do not use em dashes in any document.

---

Read these files in full before doing anything else, in this order:
`RULEBOOK.md` (the living player guide you are editing, currently covering Modes 1
and 2), `design/chronology.md` (the locked design of record, especially the "How
to play (drop-in ready for RULEBOOK)" section, which is written to be promoted
nearly verbatim, plus the "Ruleset contract" sections and "Parked / open items"),
`docs/chronology-PRD.md` (sections 3 and 7 for the family framing and scoring),
and `docs/chronology-tasks.md` (Phase 6). They are the design of record. Treat
them as the source of truth. Do not redesign the mode; Phase 6 only writes it
down.

## Where things stand (done, do not redo)
- Phases 1 to 5 are DONE. The mode is playable end to end from the `App.tsx` menu.
- Phase 1 Stage A: a 162-film curated pool, even decade spread, emitted to
  `src/data/chronology-pool.json`. Stage B (grow to 300 to 500) and a human
  date-verification pass are still open, content only, and gate the PUBLIC daily.
- Phase 2: pure core in `src/lib/chronology.ts` (deal, `correctSlot`,
  `scorePlacement`, `gapTightness`, the shared `streakCredit` economy). Verify gate
  `npm run verify:chronology` is green at 42 checks.
- Phase 3: `src/ChronologyGame.tsx` renders the year-ordered line, the hand of
  titles (years hidden), and the signature flip-and-snap on a misfire.
- Phase 4: a real Cleared screen with the family share format on the clipboard.
- Phase 5: a deterministic daily seeded from the player's LOCAL calendar date, a
  random practice round, and a difficulty dial that lives ONLY in the deal (easy
  spreads the hand wide in time, hard clusters it tight). In the UI the daily is
  the Chronology card's main button; a `practice` row offers two pills, `Wide`
  (the easy, spread deal) and `Tight` (the hard, clustered deal). The dial changes
  only the spread of the 10 cards, never a rule or the scoring.

## The exact mechanics to describe (already locked, pull from design/chronology.md)
- A round opens with 1 anchor card face up on the line and a hand of 10, titles
  up and years hidden.
- On a turn you slot one hand card into a gap on the line (older to the left,
  newer to the right). Placement is hard: the chosen gap is the correct slot or it
  is not.
- Clean placement sticks, +0. A misfire flips the card to reveal its real year,
  snaps it to the correct slot, re-sorts the line so it stays in order, and costs
  +1 stroke. There is no stuck state, so a round always finishes.
- Golf scoring (low wins): clean +0, misfire +1, a streak of 3 clean placements
  credits a stroke back (a `Streak x3` badge pops), and tight-call mercy lets a hot
  streak survive one later misfire when the last clean placement landed between two
  neighbors only a few years apart.
- Resolution is the full release date behind the scenes, so same-year films still
  have exactly one correct slot; on a same-year misfire the game tells the player
  the years matched and the date decided it.
- Cleared shows a shareable emoji row (one glyph per placement, clean vs misfire),
  led by the clapper, in the family share format already shipped:
  `Marquee` and the mode name on line 1, `score N (S strokes[, C back])` on line 2,
  the emoji row on line 3.

## Design calls to make FIRST (flag them, do not silently decide)
The build is locked, but the docs phase has a few real choices. Surface each, pick
one, and say which you picked before writing.

1. The family framing. RULEBOOK currently opens with "The big idea (both modes)"
   and frames the WHOLE game as connecting movies through the people who made them.
   Chronology breaks that frame: it has NO links, no shared people, no connection
   engine. It is pure release-date ordering. So the shared family bond is NOT the
   link engine. It is: every card is a movie, all three modes are golf (low score
   wins), and all three end on a shareable emoji row. Decide how to restructure the
   intro so it stops saying "both modes" and "two ways to play" and instead frames
   three modes honestly. RECOMMENDED: a short top-level family note (movie cards +
   golf + shareable row), then keep the link framing scoped to Modes 1 and 2 where
   it belongs, and give Chronology its own one-line big idea (your sense of WHEN a
   film came out). Do not imply Chronology uses links.

2. The mode's status label. Modes 1 and 2 are tagged LIVE. Chronology is playable
   from the menu, but its PUBLIC daily is gated on locking the pool (Stage B grow
   to 300 to 500 plus a human date pass), because the daily deal is a function of
   the pool. RECOMMENDED: tag Mode 3 as NEW or "playable now, public daily pending
   pool lock," not the same flat LIVE as the other two, and add a one-line note
   that the public daily waits on the pool. Be accurate, do not oversell.

3. The mode name. The working title is Chronology; the parked candidate real name
   is Premiere (design doc Parked items). RECOMMENDED: use Chronology, because that
   is what the live UI says today, and add no claim that the name is final. If the
   name is ever changed before public launch, RULEBOOK updates with the UI.

4. Em dashes. RULEBOOK.md as it stands uses em dashes throughout its existing
   Modes 1 and 2 text. The standing project convention for these docs is no em
   dashes. RECOMMENDED: write the NEW Mode 3 text without em dashes (honor the
   convention), and leave the existing Mode 1 and 2 text untouched (surgical, you
   were not asked to rewrite it). Accept the minor within-file inconsistency, or
   ask the owner if a light sweep of the whole file is wanted. Do not silently
   rewrite the existing two modes.

## Your task: write Phase 6 (docs only) ONLY
Follow the two acceptance criteria in `docs/chronology-tasks.md` Phase 6:
1. Promote the spec "How to play" into RULEBOOK.md as Mode 3. Acceptance:
   RULEBOOK.md describes Chronology in the same plain voice and the same per-mode
   structure as Modes 1 and 2 (a 30-second how-to, a "What's on screen" sketch, a
   golf scoring list, and a "How it ends"), plus the daily-versus-practice and the
   Wide/Tight dial in plain words.
2. Add a short canonical note so the docs read as one family. Acceptance: a reader
   can find all three modes and how they relate from one place (the restructured
   intro from design call 1).

Then update the supporting sections so the file is internally consistent: the front
matter (Last updated date, the live/playable modes line), the "Words to know"
glossary (add line, gap or slot, anchor, placement, misfire, streak credit,
tight-call mercy), and optionally a "What's new" entry for Chronology. Match the
existing 12-year-old voice and the ASCII "What's on screen" style.

## Guardrails (from CLAUDE.md and the spec)
- This is a DOCS-ONLY phase. Do not touch any code or any sim file. No behavior
  changes, no retuning, no new constants. If writing the docs surfaces a real
  mismatch between the words and the game, STOP and flag it rather than editing
  code to match the doc.
- Match RULEBOOK's established voice: plain, lowercase-friendly, written for anyone
  12 and up, the same per-mode skeleton as Modes 1 and 2.
- Do not redesign the mode. The "How to play" copy in design/chronology.md is
  locked drop-in text; promote it, do not reinvent it.
- Keep the scoring words exactly faithful to `src/lib/chronology.ts`: clean +0,
  misfire +1, streak of 3 credits a stroke back, tight-call mercy survives one miss.
  If the doc and the code disagree, the code wins and you flag it.
- No em dashes in the new content (see design call 4).

## Forbidden (do not touch)
All code and all sim files this phase: `src/DuelGame.tsx`, `src/SoloGame.tsx`,
`src/ChronologyGame.tsx`, everything under `src/lib/`, everything under `sim/`,
`src/App.tsx`, `src/main.tsx`, and the Duel sim parity contract (`sim/RULESET.md`,
`sim/duel-sim.ts`). You MAY edit `RULEBOOK.md` (the deliverable) and the bookkeeping
files only: `docs/chronology-tasks.md` (check off Phase 6, update the status
header), an optional status note in `design/chronology.md`, and the project memory.

## Done when
- RULEBOOK.md has a "Mode 3 - Chronology (Solo)" section in the same voice and
  structure as Modes 1 and 2, with the daily-versus-practice split and the
  Wide/Tight dial explained in plain words.
- The intro and the shared sections cover all three modes honestly (no leftover
  "both modes" or "two ways to play"), and Chronology is never implied to use the
  link engine.
- The front matter (Last updated, the modes line) and the "Words to know" glossary
  are updated and internally consistent.
- `docs/chronology-tasks.md` Phase 6 is checked off and its status header updated;
  the project memory is updated.
- No code or sim file changed. Then stop and summarize. Phase 6 closes the build
  plan; after it, the only open track is the content gate for a public daily
  (Stage B pool to 300 to 500 plus the human date-verification pass, then lock the
  pool).
