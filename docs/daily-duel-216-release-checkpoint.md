# Daily Puzzle / Duel 216-film Release checkpoint

**Status:** complete and locally verified on 2026-08-26. Stopped for owner
review. No commit, push, deployment, or indexing is authorized or complete.

**First 216-card Daily:** `2026-09-27`

**Approved selection receipt:** 216 Keep · 0 Maybe · 6 Strike

**Ordered real-pool SHA-256:**
`d9b988232fabddadd2616d4fcc6c1ad604bce1207106b9ac6539784b50a38fdb`

## Released candidate

- Daily seeds through `2026-09-26` resolve against the pinned legacy 89-card
  pool. Seeds from `2026-09-27` forward resolve against the approved 216 in a
  pure date function. Duel uses the 216-card pool.
- The 16 approved outside challengers are full runtime Movie records. The
  approved `top-gun` and `avengers` continuity tags are applied.
- The Duel deck contains 216 real cards plus these 16 blank-credit wilds:
  12 Angry Men; Casablanca; Citizen Kane; The Wizard of Oz; 2001: A Space
  Odyssey; Psycho; Seven Samurai; Singin' in the Rain; Dr. Strangelove;
  Vertigo; Tokyo Story; Bicycle Thieves; In the Mood for Love; Spirited Away;
  Metropolis; and Pather Panchali.
- A multi-wild draw keeps every revealed wild and burns only non-wild cards.
  React's human and CPU paths and the simulator share the same pure helper. A
  hand can therefore grow by two or three cards from one draw.
- No new dependency, persistence rule, scoring value, hand size, draw count,
  target score, meld rule, or Recast rule was introduced.

## Seed and invariant evidence

The live pool resolver reports 89 cards on `2026-09-26`, then 216 on both
`2026-09-27` and `2026-09-28`. Its ordered-ID digest exactly matches the
approved receipt digest above. The first cutover board is solver-valid and has:

- starter: Mission: Impossible — Dead Reckoning Part One;
- hand: Mission: Impossible — Ghost Protocol, Batman, The Revenant, A Few Good
  Men, Birdman, Jerry Maguire, and Spotlight;
- computed par: 9.

The Solo verifier regenerated 365 cutover-era dates: 365 unique, solver-valid
boards exposed all 216 real films. Par spans 6–12. The Duel verifier conserved
all 216 real cards and all 16 wilds across every tested ruleset; its explicit
multi-wild fixture kept every wild and burned only the real card.

## Difficulty retune

Only three existing CPU controls changed:

| Tier | Existing control | Before | Candidate |
| --- | --- | ---: | ---: |
| Matinee | meld miss chance | .68 | .80 |
| Feature | lazy meld banking | no | yes |
| Director's Cut | meld miss chance | 0 | .30 |

The standard live-flow evaluator ran 8,000 seeded games per tier with paired
baseline/candidate deals (`seed=200824`, assertions enabled):

| Tier | Pre-retune | Candidate | Paired change |
| --- | ---: | ---: | ---: |
| Matinee | 60.3% [59.2–61.4] | **65.9% [64.9–67.0]** | +5.6pp [4.7, 6.6], real |
| Feature | 48.1% [47.1–49.2] | **50.3% [49.2–51.4]** | +2.1pp [1.3, 3.0], real |
| Director's Cut | 39.5% [38.5–40.6] | **41.4% [40.3–42.5]** | +1.9pp [0.7, 3.1], real |

All three live-flow runs had zero stalemates and restored the established
65/50/41 target shape. The required 4,000-game `report` command also completed
with assertions, but that branch intentionally uses the old one-pile/no-race
comparison scaffold; its high-stalemate rates are not shipped-flow tuning
evidence.

## Cross-mode data

- The credited Movie catalog grows from 304 to 320. The total dated Chronology
  catalog remains 482 because the 16 new full records graduate matching dated
  stubs.
- Rebuilding Chronology produced the same file SHA-256 as before:
  `578aae49cd6f136eaa0d288fb4d213273fe5bcd579427e1e41135a51173c951e`.
- Connections was deliberately rebaked for 320 credited films and 365 dates
  anchored at `2026-07-06`. Its semantic grid digest is
  `0f333d3236fea7c2033f3b49577acfa9c9b9e9c199d3802b5e0d48e2e8c6cab6`.
  The exhaustive verifier independently re-dealt every date, found no ambiguous
  card, and proved baked-runtime parity.
- The local name audit swept 2,797 credit occurrences and 1,421 distinct
  spellings with zero suspicious clusters.
- The pre-cutover TMDB review found 10 clean records and six approved
  recognizability-first cast differences; all 16 release dates matched the
  existing Chronology stubs.

## Full local release matrix

| Gate | Result |
| --- | --- |
| `npm run build` | pass; TypeScript + production build |
| `npm run check:bundle` | pass; menu shell 97.81 KiB gzip JS |
| `npm run check:security` | pass; 224 repository / 26 production files |
| `npm run verify` | **64/64** |
| `npm run verify:solo` | **8/8** |
| `npm run verify:chronology` | **42/42** |
| `npm run verify:connections` | **14/14** |
| `npm run test:smoke` | **27/27**; includes exact cutover board and real multi-wild UI draw |
| `npm run audit:names` | pass; zero clusters |
| `npm run eval -- tune 8000 --seed=200824 --assert` | pass; 65.9 / 50.3 / 41.4 |
| `npm run eval -- report 4000 --seed=200824 --assert` | pass; comparison scaffold only |
| `git diff --check` | pass |

## Release boundary

This is a reviewable local release candidate, not a publication. Commit, push,
remote CI, deployment, production verification, and indexing remain separate
approval gates. Real-device and attended assistive-technology acceptance also
remain human gates and are not replaced by the automated matrix above.
