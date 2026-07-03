# Chronology, Reuse Map

> What already exists in the codebase that Chronology can lean on, so the build
> does not reinvent solved problems. Grouped by how it transfers. The guiding rule
> (from the mode's decoupling principle): import the pure utilities directly; copy
> the mechanics of the `Movie`-typed UI components rather than import them, so
> Chronology never couples to Duel's data shape or raises blast radius on
> components Duel depends on.

## Import directly (pure, no coupling cost)

| Asset | Where | How Chronology uses it |
|---|---|---|
| Seeded RNG: `makeRng`, `mulberry32` | `sim/rng.ts` | `dealRound(seed, ...)` deterministic daily. This is Phase 5's seeding, already solved. The "default to `Math.random` in the app, pass a seed in the sim" pattern is the proven approach. See the rng-location note below. |
| Confidence intervals: `wilson`, `pairedDiff` | `sim/stats.ts` | The verify gate's difficulty-ramp measurement: clean rate by placement index with a real interval, naive vs calibrated player. Transfers as-is. |
| Verify harness skeleton: `check` / `section` / PASS-FAIL + non-zero exit | `sim/verify.ts` | Already mirrored in `sim/chronology-verify.ts`. The `npm run verify` 60/60 discipline is the model for Chronology's gate. |
| `id -> record` Map pattern | `src/data/movies.ts` (`movieById = new Map(...)`) | A `chronologyById` lookup over the pool, one line. |
| Theme tokens and layout shell | `src/index.css`, every component | Palette (`#f4efe6` cream, `#23211c` ink, `#7d7563` muted, `#9a917c`, ring `#c5bca6`, accent `#b3541e`), the `mx-auto w-full max-w-[420px]` mobile board, `h-full dvh`, no-overscroll body. Already used in the `ChronologyGame` shell. |

## Copy the mechanics (adapt, do not import)

| Asset | Where | What transfers, and the adaptation |
|---|---|---|
| 3D flip with reduced-motion fallback | `CardView` in `src/components/Card.tsx` | THE signature flip-to-reveal. Reuse the `rotateY` + `preserve-3d` + `backfaceVisibility` machinery, the spring (`stiffness 280, damping 24`), `perspective 1000`, and the reduced-motion crossfade. Adapt the faces: Chronology's front shows the TITLE with the year hidden; the flip reveals the YEAR. The pool has no `posterColor`, so derive a card color from `decade` (a nice decade-banded look). |
| Drag-to-place primitive | `RaisedCard` in `src/components/Hand.tsx` | `drag` + `dragSnapToOrigin` + `dragMomentum={false}` + `whileDrag` + `onDragEnd -> onDrop(id, info.point)`, plus the damped invalid-shake and tap-to-raise. This is lift-a-card-and-drop-it, exactly Chronology's interaction. |
| Drop hit-test | `attemptPlay` in `src/SoloGame.tsx` | `getBoundingClientRect` on a zone ref, then point-in-zone. Solo tests ONE pile zone; Chronology generalizes to N gap refs and maps the drop point to the nearest gap. Same technique, more zones. |
| Fan hand layout | `Hand.tsx` | The fan spacing, lift-on-raise, and optional long-press reorder all carry over for the hand of placements. |
| Golf score and share emoji row | `src/SoloGame.tsx` | `score = strokes - credits` mirrors `flips - comboBonus`. The `playLog: {id, flipped}[]` to `'🎬' + map(...).join('')` build transfers directly; swap glyphs to clean `🟩` / misfire `🟥` per the spec. |
| End screen choreography | `src/components/Results.tsx` | The staggered spring entrance, emoji chip, and Play again button transfer. Props differ (Chronology has strokes, streak credits, final score; no par or solution), so reuse the layout and motion with a new prop shape. |
| Transient badge / toast | connection banner and combo badge in `src/SoloGame.tsx` | The `AnimatePresence` pop (spring, `LABEL ×N`) maps straight onto the `Streak ×3` badge and the "years matched" / tight-call toasts. |
| Rules overlay | `src/components/HowToPlay.tsx` | The full-screen opaque scrollable overlay with sticky header and the `Section` / `B` / pill helpers, for the in-game `?` and the Phase 6 promotion into RULEBOOK. |
| Menu button and difficulty pills | `src/App.tsx` | The mode-card button styling and the segmented difficulty control transfer for the easy/hard deal dial. |

## Conventions to follow (decisions already made for us)

- `onExit: () => void` prop for a mode component (the `ChronologyGame` shell already follows it).
- Every animated component reads `useReducedMotion()` and ships a fallback; do the same.
- Lowercase, low-key copy voice for banners and messages.
- `data-*` hooks (`data-card`, `data-mode`, `data-rules`) for testability.
- A DEV-time assertion in `src/main.tsx` (Solo asserts the puzzle is solvable); the Chronology analog asserts the daily pool deals a valid round and passes validation.

## Genuinely new (no reuse)

- The line and insertion model, and `correctSlot` resolved by full date. Duel is a
  pile, Solo is a pile; neither has an ordered line.
- The N-gap drop-target layout along a horizontal line (adapts the hit-test, but
  the line itself is new).
- The date resolver and the pool record shape.
- Streak and tight-call mercy scoring.

## One architectural note: where the seeded RNG lives

The app currently shuffles with `Math.random`; only the sim uses `makeRng` from
`sim/rng.ts`. Chronology's daily needs a SEEDED rng at runtime in the app, so
either `src/lib/chronology.ts` imports `../sim/rng.ts` (pulls sim into the app
build graph), or the seedable rng is lifted to `src/lib/rng.ts` and `sim/rng.ts`
re-exports it.

RESOLVED in Phase 2 (lift to `src/lib/rng.ts`). The full RNG (`makeRng`,
`mulberry32`, `Rng`) now lives in `src/lib/rng.ts`; `sim/rng.ts` re-exports it
unchanged (no behavior change, Duel verify still 60/60). `src/lib/chronology.ts`
imports `makeRng` from `./rng.ts`, so the app build graph never reaches into
`sim/` (tsconfig only includes `src/`). Note: the `Rng` re-export uses
`export type` so Node's runtime type-stripping of `sim/` does not emit a value
import for a type.
