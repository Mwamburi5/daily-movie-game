# Mode readouts — hard data per mode (W5a)

One readout per mode, regenerated 2026-07-08 from the shipped sims/verifies.
This is the evidence base for the **W5b Buri calls** (tilt · pool cutover ·
Connections category-diversity) and the interview cross-check at SEND. Re-run the
commands below to refresh; the numbers move only when a rule/pool/knob changes.

All four modes emit Vercel Web Analytics `mode_start` / `mode_finish` events with
a per-mode discriminator (`{mode: duel|solo|chronology|connections, kind|difficulty}`)
— confirmed wired at every call site (`src/lib/analytics.ts`, script-tag route,
no-op if Analytics is unloaded). This is the say/do cross-check for interviews.

---

## Duel — `npm run eval` (tune + tilt)

**Difficulty tune** — casual player vs each tier, flow package (Double Feature +
draw-3 + race-to-20), **4000 games** (`node sim/eval.ts tune 4000`; targets 65 / 50 / 41):

| tier | player win rate | 95% CI | target | verdict |
|---|---|---|---|---|
| Matinee | **65.5%** | 64.0–66.9 | 65 | on-target |
| Feature | **49.7%** | 48.2–51.2 | 50 | on-target |
| Director's | **41.8%** | 40.3–43.3 | 41 | on-target |

All three tiers land inside their target band at 4000 games — no retune needed.

**First-player tilt** — full-flow mirror (casual vs casual, identical knobs),
**4000 games**, seed `flow-mirror`:

- **A 53.6% vs B 44.1% · gap 9.5pp · stalemates 2.3%** (A = first player).
- Documented band (RULESET §12, 4k–8k across seeds): A ~52–53.5 / B ~44–46, a
  **real ~7±2pp first-player edge**. Gate-pinned in `sim/verify.ts` (assert:
  A-favored, gap ≤ 12pp) — re-proven green in this session's `verify` 64/64.
- **→ W5b decision (tilt call):** ship the edge as a documented house edge, or
  re-sim a fairness rule. Recommendation stands: ship + revisit with real data.

---

## Solo — `npm run verify:solo` (par distribution, 365 days)

Constructive-walk daily over the frozen `DUEL_POOL` (89 films, hand 7 + 1 starter),
par = the solver's best line. 365 calendar days from 2026-07-08:

- **par: min 7 · median 9 · max 12** (formula bounds [6–12], all inside).
- histogram: `par 7×9 · 8×63 · 9×124 · 10×84 · 11×71 · 12×14` — a clean unimodal
  spread centered on 9, no flat-value degeneracy.
- Every daily is solver-winnable and re-validates move-by-move; deterministic per
  seed; append-only pin holds (2026-07-03 → Once Upon a Time in Hollywood, par 9).

Healthy distribution; no action. (Pool cutover to the big pool is a **W5b call** —
would reshuffle every future daily and re-pin.)

---

## Chronology — `npm run eval:chronology` (strokes, 4000 rounds/cell)

Golf scoring (strokes − streak credits; lower better; negative = under par),
real pool (162 films). naive = reads printed years only; calibrated = a skilled player.

| deal | naive clean | calibrated clean | skill gap (strokes/rd) |
|---|---|---|---|
| **standard (daily)** | 77.8% (perfect 6.2%) | 92.6% (perfect 44.6%) | **+2.29** [2.23–2.35] |
| easy | 88.2% | 98.6% | +1.64 |
| hard | 34.3% | 59.4% | +3.37 |

Standard-deal score: naive mean 0.46 (median 0), calibrated mean −1.83 (median −2)
— skill is rewarded, the daily is winnable-but-not-trivial, and the easy/hard
practice pills bracket it cleanly. No action. (Published-daily pin is a **W5c**
item — lands only at P2 pool LOCK; pinning earlier churns every Stage-B merge.)

---

## Connections — `npm run gen:connections` (yield) + `node scripts/connections-mix.ts` (grid mix)

**Yield** (`docs/connections-yield.md`, pool 237 credited films): **9,862,379**
viable key-quadruples of 15.78M candidates (~8.46×10¹⁸ film-level grids). The
gating layer is strict accidental-freedom — `dealGrid` walks key-sets until it
finds one with no cross-group coherent 4-set. Years of distinct dailies.

**Grid category-mix** over the baked 365-day window (anchor 2026-07-06). Shape =
the four group kinds per grid, sorted (d=director a=actor s=series g=genre):

| shape | count | share | | distinct cats | count | share |
|---|---|---|---|---|---|---|
| `aaad` | 128 | 35.1% | | 1 (all one kind) | 111 | 30.4% |
| `aaaa` | 106 | **29.0%** | | 2 | 219 | 60.0% |
| `aadd` | 39 | 10.7% | | 3 | 33 | 9.0% |
| `aaag` | 34 | 9.3% | | 4 | 2 | 0.5% |
| `aadg` | 15 | 4.1% | | | | |
| (12 more tails) | … | … | | | | |

Group-kind totals (of 1460 groups): **actor 74.1% · director 19.6% · genre 4.4%
· series 1.9%**. Genre cap holds — **0** grids with >1 genre group (dealer lock ✓).

**Read:** the mix is actor-dominated because the 237-film pool simply yields far
more 4-actor groups than 4-director/4-series ones (100 actors group-ready vs 25
directors vs 4 series). ~29% of days are all-actor (`aaaa`); ~90% of days are 1–2
distinct kinds. The theoretical draw over ALL viable key-sets is similar
(`aaad` 26.8% · `aaaa` 25.3%), so the baked window is representative, if slightly
actor-heavier than uniform.

- **→ W5b decision (category-diversity):** whether to add a dealer constraint
  (cap actor groups / require ≥N distinct kinds). This is a never-trivial dealer
  change (re-bake + re-pin + feel shift) — decide it against this histogram, and
  note P2 pool growth (more directors/series) will shift the mix on its own.

---

## Reproduce

```
npm run eval                 # Duel: full flow/engagement report + tune (slow)
node sim/eval.ts tune 4000   # Duel: just the tune cells (fast)
npm run verify:solo          # Solo: par distribution (section #2)
npm run eval:chronology      # Chronology: strokes by deal
npm run gen:connections      # Connections: yield + census (docs/connections-yield.md)
node scripts/connections-mix.ts   # Connections: baked-window category-mix histogram
```
