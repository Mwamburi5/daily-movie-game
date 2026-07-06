# TMDB integration plan

**Written 2026-07-05.** How Match Cut uses The Movie Database, in what order,
and what it must never do.

## The one architectural rule

**TMDB is author-time only.** The shipped game stays exactly what it is — a
static site that deals from baked files in `src/data/` and makes zero network
calls. TMDB is a librarian we phone *while writing content*; players never
talk to it, the key never enters the bundle (no `VITE_` prefix, gitignored
`.env.local`), and a TMDB outage can't touch production.

**TMDB is a witness, not a judge.** It's community-edited. Every script emits
a diff report for human arbitration (the `wave1-diffs.md` pattern); nothing
auto-writes into `src/data/`. This is the same curation-first stance as
`build-chronology-pool.ts`.

## Tooling (built 2026-07-05)

| piece | what it does |
|---|---|
| `.env.local` | holds the key; gitignored before it was created |
| `scripts/tmdb.ts` | shared client: key loading, rate limit (~10 req/s), search + credits fetch |
| `npm run tmdb:probe` | 10-second "is my key working?" check (looks up Goodfellas) |
| `npm run tmdb:audit` | fact-checks a `Movie[]` module against TMDB → `docs/tmdb-audit.md` |
| `/tmdb-check` skill | the routine: probe → audit → filter past rulings (`docs/tmdb-rulings.md`) → arbitrate new flags with Buri → apply fixes → right-sized gate sweep |
| `docs/tmdb-rulings.md` | append-only ledger of "ours-correct" arbitrations; keeps repeat runs quiet |

`tmdb:audit` checks year, director set, top-5 billing (order-sensitive),
deepCast membership; writers are informational only (TMDB writing credits are
messy and the meld ladder merged writer into the director rung). Every flag
prints TMDB's exact name strings because pool matching is exact string
equality — the audit doubles as a spelling normalizer.

## Phases

**Phase 1 — key in, probe green (Buri, ~2 min).** Paste the API Read Access
Token into `.env.local`, run `npm run tmdb:probe`.

**Phase 2 — audit the live pool.** `npm run tmdb:audit`, arbitrate flags.
⚠️ **Fixing the tuned 89 is not a free edit.** A year or spelling correction
changes the link graph, which is mechanically the same blast radius as a rule
change: full gate sweep after any fix (verify · verify:solo · verify:chronology
· eval tune) and a conscious call on anything that shifts tuning.

**Phase 3 — wave 1 human pass, accelerated.** The 74-film draft in
`docs/wave1-draft.md` is gated on a date/credits verification pass. Copy the
draft entries into a scratch module (e.g. `scripts/wave1-candidate.ts`
exporting `MOVIES`), run
`node scripts/tmdb-audit.ts --input scripts/wave1-candidate.ts --out docs/wave1-audit.md`,
arbitrate the flags, merge clean entries into `movies.ts` (append-only — the
frozen `DUEL_POOL_IDS` keeps Duel/Solo deals byte-identical). Gates green.

**Phase 4 — waves 2+ (163 → 300).** Same loop, driven by the
`connections-yield.md` shopping list. If hand-drafting entries becomes the
bottleneck, the next tool is `tmdb-draft.ts`: human picks titles, TMDB fills
the fields, output goes through the same audit + arbitration before merge.
Humans still choose *which* films; TMDB only types the credits.

**Phase 5 — Chronology dates, concrete (2026-07-05, PLAN.md Amendment 1).**
Three sub-steps, in order:

- **5a — date audit of the existing 162** (`npm run tmdb:dates`,
  scripts/tmdb-date-audit.ts): policy-encoded check — never TMDB's headline
  `release_date` (it mixes premieres in); instead `/movie/{id}/release_dates`
  → US → types 2+3 (Theatrical limited + Theatrical) → earliest. Report
  grouped likely-wrong / uncertain / cosmetic with full US-theatrical
  evidence; re-release masquerades (candidate ≥2y after TMDB's primary date)
  and pre-1990 mismatches are demoted to human calls. Fixes land in
  chronology-seed.ts → rebuild; the first applied batch needs Buri's explicit
  confirm (it reshuffles the Chronology daily) and ships WITH the attribution
  notice (rules/About modal — first TMDB-derived data in the app).
- **5b — pool unification** (docs/pool-unification.md, after wave 2): `Movie`
  gains optional `releaseDate`; dates-only films become `DATED_STUBS`;
  chronology-pool.json becomes a derived artifact; chronology-seed.ts
  retires. Acceptance test: byte-identical emitted JSON.
- **5c — Stage B growth 162 → 300–500** (docs/stage-b-plan.md): Buri picks
  era-stratified titles, TMDB drafts policy dates into a review file,
  `/tmdb-check dates` audits, Buri arbitrates, stubs merge per batch.

## Obligations (free tier)

- **Attribution before the first TMDB-derived data ships:** add the TMDB logo
  + required notice ("This product uses TMDB and the TMDB APIs but is not
  endorsed, certified, or otherwise approved by TMDB") to the app's
  about/rules surface, in the same pass as the first merge. Not yet added.
- **6-month cache clause:** re-run `tmdb:audit` on the shipped pool roughly
  twice a year; it keeps us honest and catches upstream corrections.
- **Commercial switch:** any revenue (ads, tips, paid) flips us to the
  commercial tier (~$149/mo or sales@themoviedb.org). Same bucket as the
  URL-in-share launch switch — decide before monetizing, not after.
