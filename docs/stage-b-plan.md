# Chronology Stage B plan — 162 → 300–500 dated films (Amendment 1 · A5)

**Status: PLAN. Executes after pool unification (A4)** — Stage B growth is
"add canonical films WITH policy dates", which lands as `DATED_STUBS` in the
unified pool (docs/pool-unification.md). The pool must be **LOCKED before the
public daily** (the daily deal is a function of the pool), so all Stage B
batches merge before launch, and each merge is a conscious reshuffle of
future dailies (pre-public: free, but batched deliberately, not dribbled).

## Shape of the work

| step | who | what |
|---|---|---|
| 1. Title picks | **Buri** (recognizability is a human judgment) | era-stratified shortlist per decade; Claude may draft a candidate slate to strike/keep, but the keep decision is Buri's |
| 2. Date draft | TMDB, via the policy filter | policy date (US theatrical, types 2+3, earliest) + evidence per title → a REVIEW FILE in docs/, never straight into src/ or scripts/ |
| 3. Audit | `/tmdb-check dates` on the merged candidates | same grouped report (likely-wrong / uncertain / cosmetic); re-release masquerades and pre-1990 noise stay human calls |
| 4. Arbitration | **Buri** | rulings applied; ours-correct lines appended to docs/tmdb-rulings.md |
| 5. Merge | append `DATED_STUBS` entries | build → validator → verify:chronology; re-pin consciously per batch |

## Stratification targets

`build-chronology-pool.ts` enforces `PER_DECADE_MIN` (Stage A floor: 20).
Stage B tightens toward **50–80 per decade** across the 1970s–2020s. Raise
the floor in steps so the validator enforces progress instead of trusting it:
20 → 35 (at ~300 films) → 50 (at ~450). Era window stays 1970+ (pre-1970
parked). Batch by decade (~30–50 titles per batch) — decade batches make the
spread visible and keep each reshuffle-arbitration session coherent.

## The draft tool call

Buri's rule: build it only if hand-drafting is actually the bottleneck. The
evidence says it will be: 150–350 new dates at ~2 min of careful lookup each
is 5–12 hours of human time, and the lookup (policy-filter TMDB's
release_dates) is exactly what `scripts/tmdb-date-audit.ts` already computes —
a `tmdb-date-draft.ts` is that script minus the comparison, ~50 lines reusing
`movieReleaseDates()`. **Recommendation: build it at Stage B kickoff**; input
= a plain title list (Buri's picks), output = a review file with policy date +
full US-theatrical evidence per title, flowing into steps 3–5 above. Humans
still choose *which* films; TMDB only types the dates — and every drafted
date still passes Buri's arbitration before merge (curation-first holds).

## Guardrails carried forward

- The public daily LOCK: last Stage B batch merges before launch; after lock,
  date edits require the conscious pin-bump protocol.
- 6-month TMDB cache clause: re-run `tmdb:dates` on the locked pool ~twice a
  year (docs/tmdb-plan.md Obligations).
- Attribution: already shipped with the first A2 date fixes (rules/About
  modal) — Stage B adds no new obligation.
- Stubs graduate to credited `Movie` entries only via the wave protocol
  (cross-check → arbitration → append-only merge → gates).
