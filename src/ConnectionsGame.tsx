// src/ConnectionsGame.tsx — Mode 4, Connections (W4 UI).
//
// A standalone sibling to SoloGame / ChronologyGame / DuelGame. Sixteen movie
// titles in a 4×4 grid hide four groups of four, joined by a shared director,
// actor, series, or genre. Pick four, submit; solve all four groups before four
// mistakes. NYT-Connections shape, Match-Cut content and dressing.
//
// PARITY BY CONSTRUCTION: this component holds NO dealer and NO ambiguity logic.
// The grid comes pre-verified from the baked set (dailyConnectionsGrid /
// practiceConnectionsGrid in data/connectionsGrids.ts), which the dealer
// (src/lib/connections.ts) produced author-time and sim/connections-verify.ts
// pins. The UI only reveals and scores what the engine already guaranteed.
//
// EXTRAPOLATED (master-plan §2.4): Connections has no reference comp. Every
// surface is composed from the six Duel comps' Stub elements — navy header, cream
// dotted canvas, paper panels, amber selection, pills. The board tiles are
// title-only Stub tickets (a compact, square-ish frame built from the same
// tokens as StubCard) rather than literal 3/4 StubCards: a word-grid needs
// square tiles, and StubCard's art slot always renders the genre tag — which
// would LEAK the genre group. Flag for Buri at the checkpoint.

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import type { Grid, GroupCat } from './lib/connections.ts'
import { dailyConnectionsGrid, practiceConnectionsGrid } from './data/connectionsGrids.ts'
import { movieById } from './data/movies.ts'
import { matchCutShare } from './lib/share.ts'
import { localDateSeed } from './lib/daily.ts'
import { makeRng } from './lib/rng.ts'
import { recordDailyFinish, type DailyFinish } from './lib/progress.ts'
import { track } from './lib/analytics.ts'
import ShareCopy from './components/ShareCopy.tsx'

// How a round was started (chosen at the menu, App.tsx). The DAILY rides today's
// baked grid keyed to the player's local calendar date, so everyone sees the same
// board on the same day. PRACTICE draws a fresh verified grid from the baked set.
export type ConnectionsStart = { kind: 'daily' } | { kind: 'practice' }

type Status = 'playing' | 'won' | 'lost'

const MAX_MISTAKES = 4

// ── group dressing (by group index 0..3, the dealer's cat order) ──────────────
// Solved bands + the share grid color by group index. Four distinct on-brand
// hues; amber and teal are excluded (amber = selection, teal = hint, both
// interactive affordances). The genre group, when present, is always index 3 (the
// dealer places it last), so its band lands on slate.
//
// The SHARE emoji are chosen for four-clean-squares legibility, NOT to echo the
// band hues — players never see bands and grid side by side (bands are in-game,
// the grid is post-game copy). Index 3 is 🟩 (Buri's W4 ruling, 2026-07-08): the
// old ⬛ read as a blank/missing tile next to three saturated squares. Don't
// "fix" 🟩 back to match the slate band — the mismatch is intentional.
const GROUP_HUES = [
  'var(--color-stub-navy)', //      #1F3A52
  'var(--color-stub-genre-pip)', // #58486C plum
  'var(--color-stub-red)', //       #A02C2C
  'var(--color-stub-slate)', //     #5B6B7A
]
const GROUP_EMOJI = ['🟦', '🟪', '🟥', '🟩']

const CAT_LABEL: Record<GroupCat, string> = {
  director: 'Director',
  actor: 'Actor',
  series: 'Series',
  genre: 'Genre',
}

// Series keys are slugs ('mission-impossible'); director/actor/genre keys already
// read as display strings. Prettify the slug, with an override for the one
// acronym that title-casing would mangle.
const SERIES_LABEL: Record<string, string> = { lotr: 'The Lord of the Rings' }
function prettyKey(cat: GroupCat, key: string): string {
  if (cat !== 'series') return key
  return SERIES_LABEL[key] ?? key.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const titleOf = (id: string): string => movieById.get(id)?.title ?? id

// Fit a tile title so proper-noun single words never force-break into an orphan
// char ("GOODFELLA/S", "ANCHORMA/N:") — the W5c polish (2026-07-08), recalibrated
// for the W5d landscape ticket stubs. CSS hyphenation can't help: the dictionary
// can't split proper nouns, so break-word just chops them mid-word. Instead we
// shrink the font until the LONGEST word fits the tile width AND the whole title
// fits the 5-line clamp of the 62px stub. Width worst case: the 83px tile at the
// 375px viewport minus borders and the 5px padding → ~69px of line width (the
// 9px side notches protrude only 3.6px inward — they never reach the content
// box, so they cost no width); against measured wide Domine caps (~0.73px per
// char per px) that's the 91 divisor (69/0.73 with margin). The 460 line divisor
// is ~5·69/0.73: total chars the five clamped lines can hold — five lines only
// ever trigger on long titles whose fitted px is small, so the stack always
// clears the 58px inner height (worst possible: 5 × 8px × 1.06 = 42). Splitting
// on hyphens too: CSS wraps at a hyphen, so EXTRA-TERRESTRIAL's fit rides its
// longest SEGMENT, not the whole compound. A pure char-count avoids a canvas
// measureText that would race the web-font load and mis-size the first paint.
// break-word stays as the final backstop.
function tileFontSize(title: string): number {
  const longest = title
    .split(/[\s-]+/)
    .reduce((a, w) => (w.length > a.length ? w : a), '')
  const totalLen = title.replace(/\s+/g, ' ').trim().length || 1
  const raw = Math.min(91 / longest.length, 460 / totalLen)
  return Math.max(7, Math.min(10.5, Math.floor(raw)))
}

// Seeded Fisher–Yates (same shape as daily/chronology) so a given board's tile
// layout is stable per seed — the daily looks identical for everyone, and a
// practice round is stable until reshuffled.
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export default function ConnectionsGame({ onExit, start }: { onExit: () => void; start: ConnectionsStart }) {
  const reduce = useReducedMotion()

  const dailySeed = useRef(localDateSeed()).current
  const practiceBase = useRef(Math.random().toString(36).slice(2)).current
  const [roundN, setRoundN] = useState(0)

  const dealFor = (n: number): Grid =>
    start.kind === 'daily' ? dailyConnectionsGrid(dailySeed) : practiceConnectionsGrid(`${practiceBase}-${n}`)

  const [grid, setGrid] = useState<Grid>(() => dealFor(0))

  // Per-film group index, and the display order of the 16 ids (shuffled so the
  // group order never leaks). Recomputed whenever the grid changes.
  const groupOf = useMemo(() => {
    const m = new Map<string, number>()
    grid.groups.forEach((g, gi) => g.films.forEach((id) => m.set(id, gi)))
    return m
  }, [grid])

  const [selected, setSelected] = useState<string[]>([])
  const [solved, setSolved] = useState<number[]>([]) // group indices, in solve order
  const [mistakes, setMistakes] = useState(0)
  const [guesses, setGuesses] = useState<string[][]>([]) // each = the 4 submitted ids
  const [status, setStatus] = useState<Status>('playing')
  const [shuffleNonce, setShuffleNonce] = useState(0)
  const [shakeNonce, setShakeNonce] = useState(0)
  const [toast, setToast] = useState<{ key: number; text: string } | null>(null)
  const [finishMeta, setFinishMeta] = useState<DailyFinish | null>(null)
  // "See the board" (W5d, review major): on a loss the results overlay used to
  // land ~0.35s in and permanently cover the just-revealed groups the loss copy
  // promises. Peeking hides the overlay; a floating pill brings it back.
  const [peekBoard, setPeekBoard] = useState(false)

  // Display order of the 16 ids (groups shuffled apart so the deal never leaks).
  // Seed folds in shuffleNonce so the Shuffle button genuinely reorders; the
  // daily's initial layout (nonce 0) is stable so everyone opens the same board.
  const layout = useMemo(() => {
    const base = start.kind === 'daily' ? dailySeed : `${practiceBase}-${roundN}`
    return shuffle(grid.groups.flatMap((g) => g.films), makeRng(`${base}-layout-${shuffleNonce}`))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, shuffleNonce])

  const say = (text: string) => setToast({ key: performance.now(), text })

  // Damped horizontal shake on a wrong guess (opacity pulse under reduced motion),
  // driven by controls so each mistake reliably replays (same pattern as the
  // Chronology raised card). Skips the initial render.
  const shakeControls = useAnimationControls()
  useEffect(() => {
    if (!shakeNonce) return
    shakeControls.start(
      reduce
        ? { opacity: [1, 0.5, 1], transition: { duration: 0.3 } }
        : { x: [0, -7, 6, -4, 2, 0], transition: { duration: 0.4 } },
    )
  }, [shakeNonce, shakeControls, reduce])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast((cur) => (cur?.key === toast.key ? null : cur)), 2000)
    return () => window.clearTimeout(t)
  }, [toast])

  useEffect(() => {
    track('mode_start', { mode: 'connections', kind: start.kind })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Finishing (won OR lost) completes the daily — a loss still counts as played,
  // exactly like a stuck Solo. Score = mistakes on a win (fewer is better, golf
  // semantics for `best`), null on a loss (no comparable score).
  useEffect(() => {
    if (status === 'playing') return
    track('mode_finish', { mode: 'connections', kind: start.kind, result: status })
    if (start.kind !== 'daily') return
    setFinishMeta(recordDailyFinish('connections', dailySeed, status === 'won' ? mistakes : null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const solvedSet = useMemo(() => new Set(solved), [solved])
  const remaining = layout.filter((id) => !solvedSet.has(groupOf.get(id)!))

  const toggle = (id: string) => {
    if (status !== 'playing') return
    setSelected((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < 4 ? [...cur, id] : cur,
    )
  }

  const submit = () => {
    if (status !== 'playing' || selected.length !== 4) return
    const key = [...selected].sort().join(',')
    if (guesses.some((g) => [...g].sort().join(',') === key)) {
      say('already tried that')
      return
    }
    // Count how many of the four share each group; the max tells correct (4),
    // one-away (3), or cold.
    const counts = new Map<number, number>()
    for (const id of selected) {
      const gi = groupOf.get(id)!
      counts.set(gi, (counts.get(gi) ?? 0) + 1)
    }
    const [topGroup, topCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
    const guess = [...selected]
    setGuesses((g) => [...g, guess])

    if (topCount === 4) {
      const nextSolved = [...solved, topGroup]
      setSolved(nextSolved)
      setSelected([])
      if (nextSolved.length === 4) {
        setStatus('won')
      } else {
        say(`got it — ${CAT_LABEL[grid.groups[topGroup].cat]}`)
      }
      return
    }

    // Wrong: shake, count the mistake, keep the selection so a near-miss can be
    // nudged (NYT behavior). One-away when three share a group.
    const nextMistakes = mistakes + 1
    setMistakes(nextMistakes)
    setShakeNonce((n) => n + 1)
    if (nextMistakes >= MAX_MISTAKES) {
      // Out of guesses: reveal every group still hidden (append the unsolved
      // indices, in grid order) and end. No guess rows added for the reveal.
      const rest = grid.groups.map((_, gi) => gi).filter((gi) => !solvedSet.has(gi))
      setSolved((s) => [...s, ...rest])
      setSelected([])
      setStatus('lost')
      return
    }
    say(topCount === 3 ? 'one away…' : 'not a group')
  }

  const resetGame = () => {
    // a replay is a new game for analytics — the mount effect only covers the
    // first deal, so re-fire here to keep mode_start ↔ mode_finish paired 1:1
    track('mode_start', { mode: 'connections', kind: start.kind })
    const next = start.kind === 'practice' ? roundN + 1 : roundN
    setRoundN(next)
    setGrid(dealFor(next))
    setSelected([])
    setSolved([])
    setMistakes(0)
    setGuesses([])
    setStatus('playing')
    setToast(null)
    setFinishMeta(null)
    setPeekBoard(false)
  }

  const mistakesLeft = MAX_MISTAKES - mistakes

  return (
    <div
      className="h-full overflow-hidden bg-stub-cream"
      style={{
        backgroundImage: 'radial-gradient(rgba(31,58,82,.06) 1px, transparent 1.2px)',
        backgroundSize: '7px 7px',
      }}
    >
      <div className="relative mx-auto flex h-full w-full max-w-[420px] flex-col">
        {/* 7a navy Stub header — same shape as Chronology's: back, title, mode
            eyebrow; right side carries the mistakes tally as dots. */}
        <header className="relative flex flex-none items-center justify-between overflow-hidden rounded-b-stub-header bg-stub-navy px-3 pb-2.5 pt-4">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(rgba(240,235,216,.10) 1px, transparent 1.2px)',
              backgroundSize: '6px 6px',
            }}
          />
          <div className="relative flex items-center">
            <button
              type="button"
              aria-label="Back to menu"
              onClick={onExit}
              className="flex h-11 w-9 items-center justify-center text-2xl text-stub-amber active:scale-90"
            >
              ‹
            </button>
            <div className="flex flex-col leading-none">
              <span className="font-stub-display text-lg font-bold tracking-tight text-stub-cream">Connections</span>
              <span className="mt-1 font-stub-label text-[9px] uppercase tracking-wider text-stub-amber">
                {start.kind === 'daily' ? 'daily' : 'practice'}
              </span>
            </div>
          </div>
          <div className="relative flex items-center gap-2">
            <div className="text-right">
              <div className="font-stub-label text-[10px] uppercase tracking-wide text-stub-cream/85">Mistakes left</div>
              <div className="mt-1 flex items-center justify-end gap-1" aria-label={`${mistakesLeft} mistakes left`}>
                {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
                  <span
                    key={i}
                    className={`inline-block h-2 w-2 rounded-full ${i < mistakesLeft ? 'bg-stub-amber' : 'bg-stub-slate-light/35'}`}
                  />
                ))}
              </div>
            </div>
            {start.kind === 'practice' && (
              <button
                type="button"
                aria-label="New round"
                onClick={resetGame}
                className="flex h-11 w-9 items-center justify-center text-xl text-stub-cream/80 active:scale-90 active:text-stub-cream"
              >
                ↺
              </button>
            )}
          </div>
        </header>

        {/* Board: solved bands stack on top, remaining tiles reflow below. */}
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-3">
          <p className="text-center font-stub-ui text-[12px] text-stub-slate">
            Find four groups of four — same director, actor, series, or genre.
          </p>

          {/* Solved-group bands (reveal-on-solve): the connection, then its four
              titles. Colored by group index (stable across the share). */}
          <AnimatePresence initial={false}>
            {solved.map((gi) => {
              const g = grid.groups[gi]
              return (
                <motion.div
                  key={`band-${gi}`}
                  layout
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 320, damping: 26 }}
                  data-solved-group={gi}
                  className="flex flex-col items-center rounded-stub-panel px-3 py-2 text-center"
                  style={{ background: GROUP_HUES[gi % GROUP_HUES.length] }}
                >
                  <span className="font-stub-label text-[10px] font-bold uppercase tracking-[0.14em] text-stub-cream/80">
                    {CAT_LABEL[g.cat]} · {prettyKey(g.cat, g.key)}
                  </span>
                  <span className="mt-0.5 font-stub-display text-[12.5px] font-bold leading-tight text-stub-cream">
                    {g.films.map(titleOf).join(' · ')}
                  </span>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* The remaining tiles — landscape ticket stubs (W5d, comp §3): 62px
              punched tickets with a perf-dot row + mid-height side notches. The
              chrome is IDENTICAL on every tile — nothing may vary by group. */}
          {remaining.length > 0 && (
            <motion.div className="grid grid-cols-4 gap-[6px]" animate={shakeControls}>
              {remaining.map((id) => {
                const on = selected.includes(id)
                const title = titleOf(id)
                return (
                  <button
                    key={id}
                    type="button"
                    data-tile={id}
                    aria-pressed={on}
                    onClick={() => toggle(id)}
                    className="relative flex h-[62px] items-center justify-center overflow-hidden border-solid text-center transition-colors active:scale-[0.97]"
                    style={{
                      borderRadius: 9,
                      borderWidth: on ? 2.5 : 2,
                      borderColor: on ? 'var(--color-stub-amber)' : 'var(--color-stub-navy)',
                      background: on ? 'var(--color-stub-navy)' : 'var(--color-stub-paper)',
                      color: on ? 'var(--color-stub-cream)' : 'var(--color-stub-navy)',
                      boxShadow: on ? 'var(--shadow-stub-glow-amber)' : 'var(--shadow-stub-card-resting)',
                      paddingInline: 5,
                    }}
                  >
                    {/* perf-dot row — flips to cream on the navy selected fill
                        (selection is player state, so this can't leak a group) */}
                    <span
                      className="pointer-events-none absolute"
                      style={{
                        top: 3,
                        left: 8,
                        right: 8,
                        height: 2,
                        backgroundImage: `repeating-linear-gradient(90deg, ${
                          on ? 'rgba(240,235,216,.5)' : 'rgba(31,58,82,.55)'
                        } 0 2px, transparent 2px 6px)`,
                      }}
                    />
                    {/* side notches, half-punched by the tile's overflow-hidden */}
                    {(['l', 'r'] as const).map((side) => (
                      <span
                        key={side}
                        className="pointer-events-none absolute rounded-full"
                        style={{
                          top: '50%',
                          [side === 'l' ? 'left' : 'right']: 0,
                          transform: `translate(${side === 'l' ? '-60%' : '60%'}, -50%)`,
                          width: 9,
                          height: 9,
                          background: 'var(--color-stub-cream)',
                          border: '2px solid var(--color-stub-navy)',
                        }}
                      />
                    ))}
                    <span
                      className="font-stub-display uppercase"
                      lang="en"
                      style={{
                        fontSize: tileFontSize(title), // shrink long titles to fit (no mid-word break)
                        fontWeight: 700,
                        lineHeight: 1.06,
                        letterSpacing: '0.005em',
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 5, // ≥5 lines only at small px — see tileFontSize
                        overflow: 'hidden',
                        overflowWrap: 'break-word', // final backstop if a word overflows even at 7px
                      }}
                    >
                      {title}
                    </span>
                  </button>
                )
              })}
            </motion.div>
          )}

          {/* Controls: shuffle · deselect · submit. Submit is the primary.
              Inside the board column (W5d layout tighten): the buttons sit
              directly under the grid instead of pinned past ~250px of dead
              cream at the screen foot. */}
          <div className="flex flex-none items-center gap-2 pb-[max(12px,env(safe-area-inset-bottom))] pt-1">
            <button
              type="button"
              data-action="shuffle"
              disabled={status !== 'playing'}
              onClick={() => setShuffleNonce((n) => n + 1)}
              className="min-h-11 rounded-stub-pill border-2 border-stub-navy bg-stub-paper px-4 font-stub-label text-[11px] font-bold uppercase tracking-wider text-stub-navy shadow-stub-card-resting active:scale-95 disabled:opacity-40"
            >
              Shuffle
            </button>
            <button
              type="button"
              data-action="deselect"
              disabled={status !== 'playing' || selected.length === 0}
              onClick={() => setSelected([])}
              className="min-h-11 rounded-stub-pill border-2 border-stub-navy bg-stub-paper px-4 font-stub-label text-[11px] font-bold uppercase tracking-wider text-stub-navy shadow-stub-card-resting active:scale-95 disabled:opacity-40"
            >
              Deselect
            </button>
            <button
              type="button"
              data-action="submit"
              disabled={status !== 'playing' || selected.length !== 4}
              onClick={submit}
              className="min-h-11 flex-1 rounded-stub-pill bg-stub-navy px-4 font-stub-label text-[12px] font-bold uppercase tracking-wider text-stub-cream shadow-stub-card-resting active:scale-95 disabled:opacity-40"
            >
              Submit
            </button>
          </div>
        </div>

        {/* feedback toast */}
        <div className="pointer-events-none absolute inset-x-0 bottom-20 z-40 flex justify-center px-4">
          <AnimatePresence>
            {toast && (
              <motion.div
                key={toast.key}
                initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 320, damping: 24 }}
                className="rounded-stub-pill bg-stub-navy px-4 py-2 text-center font-stub-ui text-[13px] font-semibold text-stub-cream shadow-stub-card-resting"
              >
                {toast.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {status !== 'playing' && !peekBoard && (
            <ConnectionsResults
              won={status === 'won'}
              mistakes={mistakes}
              guesses={guesses}
              groupOf={groupOf}
              daily={start.kind === 'daily' ? finishMeta : null}
              onReset={resetGame}
              onMenu={onExit}
              onPeek={status === 'lost' ? () => setPeekBoard(true) : undefined}
            />
          )}
        </AnimatePresence>

        {/* Board peek: the results step aside so the revealed groups can be
            read; one floating pill returns to them. */}
        {status !== 'playing' && peekBoard && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-[100] flex justify-center">
            <button
              type="button"
              data-action="back-to-results"
              onClick={() => setPeekBoard(false)}
              className="pointer-events-auto min-h-11 rounded-stub-pill bg-stub-navy px-5 font-stub-label text-[11px] font-bold uppercase tracking-wider text-stub-cream shadow-stub-card-raised active:scale-95"
            >
              ↩ Back to results
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── end screen + share ────────────────────────────────────────────────────────
// Mirrors ChronoResults: staggered spring entrance, the family share format via
// matchCutShare + the shared ShareCopy affordance. The emoji is the NYT-style
// guess grid — one row of four squares per submitted guess, each square colored
// by that tile's TRUE group (so the row shows how mixed the guess was).
function ConnectionsResults({
  won,
  mistakes,
  guesses,
  groupOf,
  daily,
  onReset,
  onMenu,
  onPeek,
}: {
  won: boolean
  mistakes: number
  guesses: string[][]
  groupOf: Map<string, number>
  daily: DailyFinish | null
  onReset: () => void
  onMenu: () => void // back to the mode menu (W5d: every end screen routes home)
  onPeek?: () => void // loss only: step aside so the revealed board can be read
}) {
  const reduce = useReducedMotion()

  const emojiGrid = guesses
    .map((g) => g.map((id) => GROUP_EMOJI[groupOf.get(id)! % GROUP_EMOJI.length]).join(''))
    .join('\n')
  const scoreLine = won
    ? mistakes === 0
      ? 'solved · clean'
      : `solved · ${mistakes} mistake${mistakes === 1 ? '' : 's'}`
    : 'missed it'
  const text = matchCutShare('Connections', scoreLine, emojiGrid)

  return (
    <motion.div
      className="absolute inset-0 z-[100] flex flex-col items-center overflow-y-auto bg-stub-cream/95 px-8 text-center"
      style={{
        backgroundImage: 'radial-gradient(rgba(31,58,82,.06) 1px, transparent 1.2px)',
        backgroundSize: '7px 7px',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: reduce ? 0.1 : 0.35, duration: reduce ? 0.15 : 0.3 }}
    >
      {/* my-auto column (the App.tsx menu fix): centers when it fits, scrolls
          instead of clipping when it doesn't (short viewports). */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 14 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        transition={reduce ? { delay: 0.15, duration: 0.15 } : { delay: 0.45, type: 'spring', stiffness: 260, damping: 22 }}
        className="my-auto flex w-full flex-col items-center py-6"
      >
        <h2 className="font-stub-display text-4xl font-bold text-stub-navy">{won ? 'Solved!' : 'Missed it'}</h2>
        <p className="mt-2 font-stub-ui text-sm text-stub-slate">
          {won
            ? mistakes === 0
              ? 'Perfect — no mistakes.'
              : `${mistakes} mistake${mistakes === 1 ? '' : 's'}.`
            : 'Out of guesses — the groups are revealed on the board.'}
        </p>

        {daily && (
          <p className="mt-2 font-stub-label text-[11px] font-semibold uppercase tracking-wider text-stub-slate tabular-nums" data-daily-meta>
            day {daily.day} · streak {daily.streak}
            {daily.best !== null && ` · best ${daily.best}`}
            {daily.repeat && ' · already played today'}
          </p>
        )}

        {guesses.length > 0 && (
          <div className="mt-5 rounded-stub-panel border-2 border-stub-navy bg-stub-paper px-5 py-3 font-stub-ui text-lg leading-relaxed tracking-[0.18em] shadow-stub-card-resting">
            {emojiGrid.split('\n').map((row, i) => (
              <div key={i}>{row}</div>
            ))}
          </div>
        )}

        <ShareCopy text={text} />

        {onPeek && (
          <button
            type="button"
            data-action="see-board"
            onClick={onPeek}
            className="mt-3 min-h-12 rounded-stub-pill border-2 border-stub-navy bg-stub-paper px-7 py-3 font-stub-ui text-[15px] font-bold text-stub-navy shadow-stub-card-resting active:scale-95"
          >
            See the board
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          className="mt-3 min-h-12 rounded-stub-pill border-2 border-stub-navy bg-stub-paper px-7 py-3 font-stub-ui text-[15px] font-bold text-stub-navy shadow-stub-card-resting active:scale-95"
        >
          Play again
        </button>
        <button
          type="button"
          onClick={onMenu}
          className="mt-3 min-h-12 rounded-stub-pill border-2 border-stub-navy bg-stub-paper px-7 py-3 font-stub-ui text-[15px] font-bold text-stub-navy active:scale-95"
        >
          Menu
        </button>
      </motion.div>
    </motion.div>
  )
}
