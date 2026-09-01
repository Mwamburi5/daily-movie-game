# Match Cut systematic pool expansion — fresh-session goal prompt

Copy everything inside the block into a fresh Codex `/goal` task.

```text
/goal Build and, after my checkpoints, execute a systematic new movie-card
expansion for Match Cut. Recover my curation taste from the last two content
waves and Stage B strike/keep decisions; do not substitute a generic canon list
or let TMDB choose the movies for me.

Repository:
`/Users/mwamburi/Projects/Daily Movie Game`

## Objective

Determine which movies would add the most useful, recognizable, varied cards to
Match Cut; present a large but controlled slate for my keep/strike choices; then
turn only my selected titles into audited pool entries and merge them through the
existing content pipeline.

This is a two-checkpoint goal:

1. Research and selection: analyze the live pools, reconstruct my demonstrated
   taste, score candidates, and stop with both a review-friendly slate and a
   visual keep/strike picker. Do not write candidates into `src/data/` before I
   select them.
2. Content build: after I choose titles, draft the selected cards, run the TMDB
   and name-consistency workflows, stop for any new arbitration rulings, then
   merge the approved batch and run every applicable gate.

Continue until the selected content wave is locally complete or a real human
ruling is required. Never commit, push, or deploy without my explicit approval.

## Meaning of “card” in this goal

Start by treating a card as a fully credited `Movie` entry in
`src/data/movies.ts`: title/year, director, screenplay writers, recognizable
top cast, useful real deep-cast links, genre, optional series, poster color, and
the policy release date when the film should also join Chronology.

Keep these separate unless I explicitly expand scope:

- Generated card artwork is not part of this content wave.
- Adding cards does not automatically move Solo or Duel off the frozen
  `DUEL_POOL_IDS` 89-film pool.
- A Solo/Duel pool cutover is a separate seed/tuning decision requiring its own
  simulation, re-tune, and explicit approval.
- A chronology-only `DATED_STUB` is not a fully credited card. Prefer graduating
  a useful existing stub into a full Movie when that creates strong links.

If my phrase “cards” meant generated artwork instead of Movie entries, surface
that interpretation before Phase 2 and do not silently mix the two projects.

## Repository truth to verify first

Read `AGENTS.md`, then inspect rather than assume:

- Current branch, HEAD, origin relationship, and worktree status. At prompt
  authoring time the local branch was `codex/daily-mode-polish` at `d201020`
  (`Add P1 delivery foundations`), not yet pushed.
- `docs/master-plan.md`, especially Sections 0, 2, 6, 7.4/7.4b, and 9.
- `src/data/movies.ts`, `src/data/duelPool.ts`, and
  `src/data/chronology-pool.json`.
- `src/data/types.ts`, `src/lib/connections.ts`, `src/lib/duel.ts`, and
  `src/lib/solver.ts` so candidate value reflects real matching rules.
- `sim/connections-gen.ts`, `scripts/connections-mix.ts`, and the current
  `docs/connections-yield.md`.
- `docs/wave1-draft.md`, `docs/wave1-diffs.md`, `docs/wave2-draft.md`, and
  `docs/wave2-diffs.md`.
- `docs/stage-b-plan.md`, `docs/stage-b-slates.md`,
  `docs/stage-b-arbitration-docket.md`, and `docs/pool-unification.md`.
- `docs/tmdb-plan.md`, `docs/tmdb-rulings.md`, and the complete
  `.agents/skills/tmdb-check/SKILL.md` before any TMDB action.
- `RULEBOOK.md` and `sim/RULESET.md`; content must conform to the rules, not
  quietly change them.

Verify the current counts. The authoring baseline is:

- 237 fully credited films in `MOVIES`.
- 438 dated films in the derived Chronology pool.
- 89 frozen films in `DUEL_POOL_IDS`, still used by Duel and Solo.
- Chronology decade spread 34/60/91/97/104/52 for the 1970s–2020s, leaving the
  1970s below the previously desired 50-film floor.

The live master plan currently says to pause expansion at 438 while launch
polish is the constraint. My new request reopens content exploration, but it
does not automatically authorize a pool cutover, rule change, art production,
commit, push, or deployment. Record that distinction accurately.

## Reconstruct my curation taste before recommending titles

Do not merely read the prose summaries. Use the actual evidence:

- Compare kept and struck rows in `docs/stage-b-slates.md`.
- Read the Wave 1 and Wave 2 cluster rationales and the choices I arbitrated.
- Read every standing policy and individual ruling in
  `docs/tmdb-rulings.md`.
- Preserve the prior target of roughly 85–90% broadly recognizable titles and
  no more than 10–15% genuine deep cuts unless I choose a different mix.
- Notice the patterns I previously favored: recognizable anchors that complete
  one-short people/series clusters, films that unlock two or more useful links,
  self-contained four-film clusters, franchise cappers, genre breadth, and
  exact-name consistency.
- Notice the limits I previously enforced: curation over completeness, no fake
  credits, no generic algorithmic filler, no over-reliance on one star, no
  trick-question dates, and no streaming-era chronology exception invented
  without a ruling.

Create a short “observed taste model” with concrete evidence and confidence
levels. Separate demonstrated preferences from your inference. If a major taste
assumption would materially shape the slate, ask me to correct the model before
finalizing candidates.

## Phase 1 — systematic gap analysis

Produce current, reproducible evidence before searching for films:

1. Census credited and dated pools by decade, genre, director, actor, series,
   and useful exact-string link frequency.
2. Re-run the Connections yield/shopping-list tooling if safe and practical.
   Record the exact command and current output; do not trust the historical
   237-film report if the repo has moved.
3. Identify:
   - people or series sitting exactly one film short of a four-card Connections
     group;
   - candidates capable of completing two or more one-short clusters;
   - promising new four-film clusters that improve breadth;
   - over-dense stars/directors whose additional films would reduce variety;
   - genre and era gaps, especially the 1970s chronology shortfall;
   - existing `DATED_STUBS` that are strong graduation candidates;
   - representation gaps across international cinema, women directors,
     animation, comedy, horror, romance, and other under-covered lanes;
   - duplicate/remake-title and accidental-group ambiguity risks.
4. Quantify the current pool before proposing a target batch size. Recommend a
   small/medium/large option—approximately 36, 60–75, and 100 cards—and explain
   marginal value, QA cost, bundle impact, and how many candidates are stub
   graduations versus entirely new films.

Connections yield is not the only objective. A high-yield film can still be a
bad choice if it is obscure, redundant, confusing, or unlike my demonstrated
taste. Conversely, a canonical breadth pick may be worth adding even if its
immediate graph yield is modest; label that tradeoff honestly.

## Candidate discovery and scoring

Search broadly enough to avoid a same-stars/same-franchises bubble. Use current
web research when helpful for recent films or disputed facts, citing primary or
authoritative sources in the research artifact. TMDB is author-time evidence,
never a runtime dependency and never the curator.

Build an over-complete slate of at least twice the recommended batch size. Score
each candidate on a transparent rubric such as:

- 0–5 demonstrated fit with my prior choices.
- 0–5 broad recognizability.
- 0–5 Connections value: groups completed, new cluster support, and estimated
  strict-yield contribution.
- 0–4 useful real links for the broader Match Cut card graph.
- 0–3 Chronology/era value.
- 0–3 genre, cultural, regional, or creator breadth.
- 0–2 efficiency bonus for graduating an existing dated stub.
- 0–3 metadata confidence.
- Penalties for star/director overconcentration, accidental Connections groups,
  ambiguous/remake titles, weak billing evidence, or deep-cut overload.

Do not let the weighted total hide judgment. Include a one-sentence reason,
which existing cards it connects to, what it unlocks, and any caveat for every
candidate.

Organize the slate into decision-friendly lanes rather than one giant ranking:

- obvious high-value keeps;
- double/triple-play cluster completers;
- new four-card cluster packages that should be accepted or rejected together;
- existing Chronology stubs worth graduating;
- 1970s and other era repair;
- international and representation breadth;
- recent/popular additions that keep the pool current;
- deep cuts with a specific mechanical reason;
- recognizable favorites with low immediate yield;
- tempting but recommended-against titles, with reasons.

Flag any candidate already present under another id/title before showing it.

## Required visual keep/strike picker

Recreate the small visual tap-to-strike app used for the Stage B selection pass.
The earlier source may not be present in the branch, so first look for an
accessible prior artifact; if it cannot be recovered, reproduce the proven
interaction rather than blocking. This is an authoring/review tool, not a new
screen inside the production game. Prefer the built-in interactive visualization
workflow when available, otherwise make a zero-production-dependency local app.

The picker must make it quick to move through a large slate on phone or desktop:

- One visual movie card at a time, or a compact swipeable/card-grid flow that is
  equally fast, with large **Keep**, **Strike**, and **Maybe** actions.
- Show exact title, identification year, and proposed locked US-theatrical date.
- Support tap/click, keyboard shortcuts, undo, previous/next, filters, and sort.
- Persist decisions locally so a refresh cannot erase a long review session.
- Offer a clear reset confirmation and export the Keep/Strike/Maybe result as
  Markdown plus machine-readable JSON or plain title lists.
- Never contact TMDB from the browser and never expose an API token. Candidate
  research is baked into the local artifact before it opens.

Keep a sticky live decision dashboard visible while I work:

- total candidates;
- reviewed and remaining;
- Keep / Strike / Maybe counts;
- projected credited-pool total if the current Keep set merges;
- Keep counts by decade and genre;
- existing-stub graduations versus entirely new films;
- deep-cut count/share against the agreed ceiling.

### Link information on every candidate

The headline **Links to current pool** number must be computed from code against
the verified current `MOVIES` pool—not guessed from the candidate rationale.
Keep this baseline number stable while I make selections so it always answers,
“How connected is this card to the pool that exists today?”

Define and display the metrics precisely:

1. **Linked current cards** — count unique existing Movie cards sharing at least
   one real credited person through the canonical `sharedPeople` logic
   (director, screenplay writer, top cast, or deep cast). Do not inflate this
   headline with same-genre matches.
2. **Visible vs deep-only links** — split links available from printed card
   credits from those relying on `deepCast`, because they play differently for
   comprehension and difficulty.
3. **Tier preview** — standard / strong / super counts using the canonical
   `linkTier` logic, with same-series value shown explicitly.
4. **Connections impact** — name any director, actor, or series group this film
   completes or advances, plus the group’s before→after size. Genre impact is a
   separate line rather than part of the headline card-link count.
5. **Exact neighbors** — an expandable list of linked current movie titles,
   grouped by the shared person or series, so I can understand why the number is
   high instead of trusting a score.

Also show a secondary, clearly labeled **Links inside my Keep set** value that
updates live as decisions change. This helps reveal whether a proposed package
forms a useful new cluster, while keeping it visually distinct from the stable
current-pool baseline.

Useful filters/sorts include decade, genre, recommendation lane, stub graduation,
deep-cut status, current-pool link count, Connections completions, and my current
decision. Include a “low-link recognizable favorites” view so canonical breadth
picks are not buried by the graph score.

Before handing it over, verify the picker with a few known candidates by
independently checking their link titles against `sharedPeople`; test persistence,
undo, export, mobile layout, and the live counters. Give me a clickable local URL
and stop while I make selections. Do not interpret partial picker state as final
approval until I explicitly say the pass is complete.

## First required artifact and checkpoint

Create `docs/pool-expansion-wave3-slate.md` containing:

- verified baseline counts and commands;
- observed taste model;
- gap analysis;
- batch-size recommendation;
- scoring rubric;
- candidate slate with exact proposed title/year and cluster rationale;
- duplicates, ambiguity, concentration, and metadata-risk appendix;
- a pointer to the visual keep/strike picker and its generated-data version;
- your recommended final batch, but no claim that it is selected.

Open the picker for me and stop while I keep/strike/maybe titles. Do not create
final Movie objects, call partial choices “approved,” run a mass TMDB audit, or
edit `src/data/` before I finish the pass and explicitly submit the selection.

## Phase 2 — draft and audit only my selections

After I select the batch:

1. Save the picker export as the selection receipt and confirm its Keep count
   with me. Create a review-only `scripts/wave3-candidate.ts` exporting valid
   `Movie[]` entries for exactly those Keep titles. Do not merge yet.
2. Reuse canonical ids and release dates for any graduated stub. Avoid duplicate
   films across `MOVIES` and `DATED_STUBS`.
3. Follow established card conventions:
   - primary director(s) only;
   - screenplay writers only, not novel/story/characters/adaptation credits;
   - top cast is recognizability-first but must be genuinely defensible;
   - deep cast includes only real performances and only when the link is useful;
   - names must match canonical pool spelling byte-for-byte;
   - voice performances count;
   - genre is the single existing Match Cut family that best serves the card;
   - series ids are consistent and never copied accidentally;
   - remake/collision titles are explicitly disambiguated;
   - release dates follow the locked first-US-theatrical types 2+3 policy.
4. Activate the `tmdb-check` workflow against the candidate module:
   - run `npm run tmdb:probe` first;
   - audit the draft with the skill-prescribed command;
   - run the live+draft name-consistency sweep;
   - compare all flags with `docs/tmdb-rulings.md` and suppress settled classes;
   - present only genuinely new disagreements to me, grouped into likely-our-
     error versus likely-deliberate-convention, with a recommendation;
   - never bulk-accept TMDB or auto-write source data.
5. For new or changed chronology dates, run the date workflow using
   `/movie/{id}/release_dates`, US, types 2+3, earliest. Do not use TMDB's
   headline `release_date`. Surface festival, premiere, re-release, and
   streaming-only traps for arbitration.
6. Stop for my rulings on every genuinely new judgment call. Apply only my
   rulings and append ours-correct decisions to `docs/tmdb-rulings.md`.

If TMDB credentials are absent, stop at the documented token request. Do not
replace the audit with memory or a keyless approximation.

## Merge and verification after arbitration

Once the slate and TMDB/name/date rulings are approved:

- Append full Movie entries surgically to `src/data/movies.ts`.
- Graduate dated stubs by moving the canonical id/date into the full entry and
  removing the corresponding stub; never leave duplicates.
- Run `npm run build:chronology-pool` whenever release-date membership changes;
  never hand-edit the derived JSON.
- Re-run the Connections generator/bake workflow required by the current repo
  and verify the ambiguity contract before replacing baked grids.
- Keep `DUEL_POOL_IDS` unchanged unless I separately approve a pool cutover.
- Keep Solo's frozen deal source unchanged unless I separately approve it.
- Update `docs/connections-yield.md`, the new wave report, and the live ledger in
  `docs/master-plan.md` in the same change.
- Do not edit `RULEBOOK.md` or `sim/RULESET.md` unless a mechanic actually
  changes; this content wave should not change one.

Run and report the applicable full gate set, including at minimum:

- `npm run build`
- `npm run check:bundle`
- `npm run verify` — expected 64/64
- `npm run verify:solo` — expected 8/8
- `npm run verify:chronology` — expected 42/42, with any required conscious
  date/daily re-pin explained
- `npm run verify:connections` — expected 14/14 after rebaking
- `npm run audit:names`
- the candidate/live TMDB audit results
- `git diff --check`

If any selected film enters the frozen 89 or if a Solo/Duel cutover is later
approved, also run `npm run eval`, compare tuning against the recorded bands,
and stop on drift rather than normalizing it away.

## Final handoff

Provide:

- the exact selected films, grouped by why they were added;
- the final picker receipt and Keep/Strike/Maybe counts;
- before/after pool counts and decade/genre/link distributions;
- Connections yield and ambiguity before/after;
- stub graduations versus new films;
- all TMDB/name/date flags and my rulings;
- files changed and exact gate results;
- effects on bundle budgets;
- explicit confirmation that the frozen 89, rules, and persistence did or did
  not change;
- remaining risks, especially star concentration, deep-cut share, title
  collisions, chronology reshuffling, and future pool-lock implications.

Stop for my review before commit, push, or deployment.
```
