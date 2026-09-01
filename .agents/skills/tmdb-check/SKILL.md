---
name: tmdb-check
description: Verify Match Cut's movie data against TMDB — runs the audit, filters out previously-arbitrated rulings, walks Buri through only the NEW flags, applies his rulings, and runs the right gates. Use when the user says "activate TMDB check", "TMDB check", "verify the movies", "double-check the pool", or before merging a content wave. Optional argument: path to a draft Movie[] module (e.g. scripts/wave1-candidate.ts) to audit a wave instead of the live pool; `dates` for the chronology date audit; `names` for the local cross-pool name-consistency check (same person under two spellings).
---

# TMDB check — audit + arbitration in one pass

Goal: end with a clean verdict — what's confirmed right, what was newly
flagged, how each flag was ruled, and gates green if anything changed.
TMDB is a witness, not a judge (community-edited); Buri makes every ruling.

## Steps

1. **Probe.** Run `npm run tmdb:probe`. If it fails on credentials, stop:
   tell Buri to paste his API Read Access Token into `.env.local`
   (themoviedb.org → Settings → API) and re-invoke. Do not continue keyless.
   (Exception: the `names` target is local-only — skip the probe, it runs
   fine without credentials.)

2. **Pick the target.**
   - No argument → live pool: `npm run tmdb:audit`
     (audits `src/data/movies.ts` → `docs/tmdb-audit.md`).
   - Argument = path to a TS module exporting a `Movie[]` (a draft wave) →
     `node scripts/tmdb-audit.ts --input <path> --out docs/<basename>-audit.md`.
   - Argument `dates` (or "chronology") → `npm run tmdb:dates`
     (audits `src/data/chronology-pool.json` → `docs/tmdb-date-audit.md`).
     This is the DATE audit under the locked US-theatrical policy
     (`/movie/{id}/release_dates`, US, types 2+3, earliest — never TMDB's
     headline `release_date`); report pre-grouped likely-wrong / uncertain /
     cosmetic with full US-theatrical evidence per flag.
   - Argument `names` → `npm run audit:names` (local-only, no TMDB — sweeps
     `src/data/movies.ts` → `docs/name-audit.md`). This is the cross-pool
     NAME-CONSISTENCY check: the same person stored under two spellings
     silently breaks every link between the halves (the 'David Peoples' vs
     'David Webb Peoples' split that killed the Unforgiven↔Blade Runner
     writer link). Fold-identical clusters (case/diacritics/spacing) are
     near-certain typos; structural clusters (middle names, initials) can be
     two real people — arbitrate, never bulk-fix. When auditing a draft
     wave, sweep it TOGETHER with the live pool:
     `node scripts/name-audit.ts --input src/data/movies.ts --input <draft> --out docs/<basename>-names.md`.

3. **Read the report AND `docs/tmdb-rulings.md`** (the ledger of past
   arbitrations). Any flag already covered by a ruling is settled — do not
   re-present it; count it as "previously ruled". Only new disagreements go
   to Buri.

4. **Triage the new flags** into two buckets, each with a recommendation:
   - **likely our error** — misspelled names (the report prints TMDB's exact
     strings; pool matching is exact string equality, so spelling flags are
     load-bearing — one typo silently breaks every link that person carries),
     plainly wrong years, deepCast names absent from the full cast;
   - **likely TMDB convention, ours deliberate** — release-year policy
     (TMDB's primary date is often the festival premiere, not wide release),
     title conventions ("Star Wars" vs "A New Hope"), archive/uncredited
     casting.
   Present them batched by kind, then collect rulings (AskUserQuestion works
   well for a handful; a table + free-form reply for many). Never bulk-apply
   TMDB's version.

5. **Apply the rulings.**
   - "we're wrong" → fix `src/data/movies.ts`, surgical, entry by entry.
     For DATE rulings (post-A4 unification, docs/pool-unification.md): the date
     lives on the canonical entry — a credited film's `releaseDate` field, or a
     `DATED_STUBS` entry for a chronology-only film — then
     `npm run build:chronology-pool` regenerates the derived JSON (never edit the
     JSON by hand). The chronology sim gates read that derived JSON directly,
     so the rebuild is the whole story: no second copy to mirror.
   - "we're right" → append one line to `docs/tmdb-rulings.md`:
     `- <movie-id> · <field>: ours <X> vs TMDB <Y> — RULED ours-correct <YYYY-MM-DD>, <reason>`
     (this is what keeps the next run quiet; date rulings use field
     `releaseDate`). Name clusters ruled "two distinct real people" use
     field `nameSplit`:
     `- <name-A> vs <name-B> · nameSplit: RULED distinct-people <YYYY-MM-DD>, <reason>`.

6. **Gates — sized to the blast radius.**
   - Any edited film in `DUEL_POOL_IDS` (`src/data/duelPool.ts`): data edits
     to the tuned 89 change the link graph — rule-change blast radius. Run
     the full sweep: `npm run verify` · `npm run verify:solo` ·
     `npm run verify:chronology` · `npm run eval` (tune must stay on-target).
     Surface any tuning drift to Buri instead of shrugging it off.
   - Edits only outside the 89: `npm run build` + `npm run verify` suffice.
   - Date fixes (canonical `releaseDate`/`DATED_STUBS` in movies.ts):
     `npm run build:chronology-pool` +
     `npm run verify:chronology`. ⚠ Any applied date fix reshuffles the
     date-seeded Chronology daily — pre-public that's free, but get Buri's
     explicit confirm BEFORE applying the batch, and re-pin
     verify:chronology in the same pass. The TMDB attribution notice
     (rules/About modal) must ship in the same deploy as the first applied
     date fixes (first TMDB-derived data in the app).
   - No edits: no gates.

7. **Summarize:** films audited / clean / previously ruled / newly ruled
   ours-correct / fixed; gate results verbatim; then two standing reminders —
   re-audit roughly every 6 months (TMDB cache clause), and the TMDB
   attribution notice is owed in the app before the first TMDB-derived data
   ships (check docs/tmdb-plan.md "Obligations").

## Notes

- `scripts/tmdb-audit.ts` never writes `src/data/` — only step 5 does, under
  explicit rulings. Keep it that way.
- `docs/tmdb-audit.md` is generated output: regenerate, never hand-edit.
  `docs/tmdb-rulings.md` is the opposite: hand-curated, append-only.
