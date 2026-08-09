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
import { track, type EventData } from './lib/analytics.ts'
import { MOTION } from './lib/motion.ts'
import ShareCopy from './components/ShareCopy.tsx'
import { useDialogA11y } from './components/useDialogA11y.ts'
import DailyModeHeader from './components/DailyModeHeader.tsx'
import HowToPlay from './components/HowToPlay.tsx'
import Icon from './components/Icon.tsx'

// How a round was started (chosen at the menu, App.tsx). The DAILY rides today's
// baked grid keyed to the player's local calendar date, so everyone sees the same
// board on the same day. PRACTICE draws a fresh verified grid from the baked set.
export type ConnectionsStart = { kind: 'daily' } | { kind: 'practice' }

type Status = 'playing' | 'won' | 'lost'
type ToastTone = 'coach' | 'near' | 'miss'

const MAX_MISTAKES = 4

// ── group dressing (by group index 0..3, the dealer's cat order) ──────────────
// Solved bands + the share grid color by group index. Four distinct on-brand
// hues; amber and teal are excluded (amber = selection, teal = hint, both
// interactive affordances), and the newer daily-mode contract reserves red for
// negative feedback. The genre group, when present, is always index 3 (the dealer
// places it last), so its band lands on slate.
//
// The SHARE emoji are chosen for four-clean-squares legibility, NOT to echo the
// band hues — players never see bands and grid side by side (bands are in-game,
// the grid is post-game copy). Index 3 is 🟩 (Buri's W4 ruling, 2026-07-08): the
// old ⬛ read as a blank/missing tile next to three saturated squares. Don't
// "fix" 🟩 back to match the slate band — the mismatch is intentional.
const GROUP_HUES = [
  'var(--color-stub-navy)', //      #1F3A52
  'var(--color-stub-genre-pip)', // #58486C plum
  'var(--color-stub-navy-mid)', //  #41586E
  'var(--color-stub-slate)', //     #5B6B7A
]
const GROUP_EMOJI = ['🟦', '🟪', '🟥', '🟩']

const CAT_LABEL: Record<GroupCat, string> = {
  director: 'Director',
  actor: 'Actor',
  series: 'Series',
  genre: 'Genre',
}
const CAT_ORDER: GroupCat[] = ['actor', 'director', 'series', 'genre']

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
  const [showRules, setShowRules] = useState(false)
  const [shuffleNonce, setShuffleNonce] = useState(0)
  const [shakeNonce, setShakeNonce] = useState(0)
  const [toast, setToast] = useState<{ key: number; text: string; tone: ToastTone } | null>(null)
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

  const say = (text: string, tone: ToastTone = 'coach') =>
    setToast({ key: performance.now(), text, tone })

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
  // Option A (Buri, 2026-08-07): name the day's exact category mix up front.
  // This removes the false "one of each" assumption without constraining or
  // re-baking the dealer. Counts fall as groups solve, but the roster never maps
  // a category to any tile or share color.
  const categoryMix = useMemo(
    () =>
      CAT_ORDER.map((cat) => ({
        cat,
        count: grid.groups.filter((g, gi) => g.cat === cat && !solvedSet.has(gi)).length,
      })).filter(({ count }) => count > 0),
    [grid, solvedSet],
  )
  const categoryMixLabel =
    categoryMix.length > 0
      ? categoryMix
          .map(({ cat, count }) => `${count} ${CAT_LABEL[cat]} connection${count === 1 ? '' : 's'}`)
          .join(', ')
      : status === 'lost'
        ? 'All four connections revealed'
        : 'All four connections found'

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
      say('already tried that', 'near')
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
    say(topCount === 3 ? 'one away — swap one ticket' : 'not a group', topCount === 3 ? 'near' : 'miss')
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
      <div className="daily-mode-shell relative mx-auto flex h-full w-full flex-col" data-mode-stage="connections">
        {/* 7a navy Stub header — same shape as Chronology's: back, title, mode
            eyebrow; right side carries the mistakes tally as dots. */}
        <DailyModeHeader
          title="Connections"
          eyebrow={start.kind === 'daily' ? 'daily' : 'practice'}
          onBack={onExit}
          right={
            <div className="flex items-center gap-2">
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
                className="daily-icon-button daily-icon-md flex h-11 w-9 items-center justify-center text-stub-cream/80 active:scale-90 active:text-stub-cream"
              >
                <Icon name="restart" size={20} />
              </button>
            )}
            <button
              type="button"
              aria-label="How to play"
              data-rules-open
              onClick={() => setShowRules(true)}
              className="daily-icon-button daily-icon-md flex h-11 w-9 items-center justify-center rounded-stub-pill text-[12px] font-extrabold text-stub-cream/80 ring-1 ring-inset ring-stub-slate-light/50 active:scale-90"
            >
              <Icon name="help" size={20} />
            </button>
            </div>
          }
        />

        {/* The sorting board is one centered object: coach line, ticket field,
            selection readout, then controls. It scales as a unit instead of
            leaving an accidental cream void below the first four rows. */}
        <div className="connections-board flex min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <div className="connections-workspace my-auto flex w-full flex-col items-center gap-2.5">
            <div className="connections-coach w-full px-1">
              <div className="flex items-center justify-between gap-3">
                <p className="font-stub-label text-[9px] font-bold uppercase tracking-[0.16em] text-stub-amber">
                  {solved.length === 0
                    ? "Today's bill"
                    : solved.length < 4
                      ? 'Still to find'
                      : status === 'lost'
                        ? 'Bill revealed'
                        : 'Bill cleared'}
                </p>
                <p className="font-stub-label text-[8px] font-bold uppercase tracking-[0.14em] text-stub-slate">
                  Groups found
                </p>
              </div>
              <div className="mt-1 flex min-h-[25px] items-center justify-between gap-3">
                <div className="flex min-w-0 flex-wrap gap-1" aria-label={categoryMixLabel} role="list">
                  {categoryMix.length > 0 ? (
                    categoryMix.map(({ cat, count }) => (
                      <span
                        key={cat}
                        role="listitem"
                        className="rounded-stub-pill border border-stub-navy/25 bg-stub-paper px-2 py-1 font-stub-label text-[8px] font-bold uppercase tracking-[0.1em] text-stub-navy shadow-[0_2px_4px_rgba(31,58,82,.12)]"
                      >
                        {CAT_LABEL[cat]} ×{count}
                      </span>
                    ))
                  ) : (
                    <span className="font-stub-label text-[9px] font-bold uppercase tracking-[0.12em] text-stub-navy">
                      {status === 'lost' ? 'All four connections revealed' : 'All four connections found'}
                    </span>
                  )}
                </div>
                <p className="flex-none font-stub-display text-[19px] font-bold leading-none text-stub-navy" aria-label={`${solved.length} of 4 groups found`}>
                  {solved.length}<span className="text-[11px] text-stub-slate"> / 4</span>
                </p>
              </div>
            </div>

            <section className="connections-stage relative w-full overflow-hidden rounded-[18px] border-2 border-stub-navy bg-stub-paper p-2 shadow-stub-card-resting" aria-label="Connections sorting board">
              <div className="connections-stage-texture pointer-events-none absolute inset-0" />
              <div className="connections-progress relative mb-2 grid grid-cols-4 gap-1" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1 rounded-stub-pill transition-colors ${i < solved.length ? 'bg-stub-amber' : 'bg-stub-navy/16'}`}
                  />
                ))}
              </div>

              {/* Solved groups become full-width marquee tickets. The category
                  stays secondary to the actual answer; all four titles remain
                  visible for the loss reveal and the board-peek flow. */}
              <div className="connections-solved-stack relative flex flex-col gap-1.5">
                <AnimatePresence initial={false}>
                  {solved.map((gi, solvedIndex) => {
                    const g = grid.groups[gi]
                    return (
                      <motion.div
                        key={`band-${gi}`}
                        layout
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={
                          reduce
                            ? { duration: 0.15 }
                            : { type: 'spring', stiffness: 320, damping: 26, delay: solvedIndex * 0.035 }
                        }
                        data-solved-group={gi}
                        className="connections-solved-ticket relative overflow-hidden rounded-[11px] px-3 py-2 text-left text-stub-cream"
                        style={{ background: GROUP_HUES[gi % GROUP_HUES.length] }}
                      >
                        <span className="pointer-events-none absolute inset-y-2 left-2 w-px border-l border-dotted border-stub-cream/45" />
                        <div className="pl-2.5">
                          <span className="font-stub-label text-[8px] font-bold uppercase tracking-[0.16em] text-stub-cream/70">
                            Group {solvedIndex + 1} · {CAT_LABEL[g.cat]}
                          </span>
                          <span className="mt-0.5 block font-stub-display text-[14px] font-bold leading-none text-stub-cream">
                            {prettyKey(g.cat, g.key)}
                          </span>
                          <span className="mt-1 block font-stub-ui text-[9px] font-semibold leading-tight text-stub-cream/82">
                            {g.films.map(titleOf).join(' · ')}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              {/* Square title tickets are the mode's one sanctioned card-shape
                  exception. Every tile has identical chrome; only player
                  selection changes its color, so the frame cannot leak a group. */}
              {remaining.length > 0 && (
                <motion.div
                  layout
                  className={`connections-grid relative grid grid-cols-4 gap-[6px] ${solved.length > 0 ? 'mt-1.5' : ''}`}
                  animate={shakeControls}
                >
                  {remaining.map((id, tileIndex) => {
                    const on = selected.includes(id)
                    const selectedIndex = selected.indexOf(id)
                    const title = titleOf(id)
                    return (
                      <motion.button
                        layout
                        key={id}
                        type="button"
                        data-tile={id}
                        aria-label={title}
                        aria-pressed={on}
                        onClick={() => toggle(id)}
                        className="connections-tile relative flex aspect-square min-h-0 items-center justify-center overflow-hidden border-solid text-center transition-colors"
                        style={{
                          borderRadius: 10,
                          borderWidth: on ? 2.5 : 2,
                          borderColor: on ? 'var(--color-stub-amber)' : 'var(--color-stub-navy)',
                          background: on ? 'var(--color-stub-navy)' : 'var(--color-stub-paper)',
                          color: on ? 'var(--color-stub-cream)' : 'var(--color-stub-navy)',
                          boxShadow: on ? 'var(--shadow-stub-glow-amber)' : '0 3px 7px rgba(31,58,82,.20)',
                          paddingInline: 5,
                        }}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileTap={reduce ? undefined : { scale: 0.96 }}
                        transition={
                          reduce
                            ? { duration: 0.15 }
                            : { type: 'spring', stiffness: 340, damping: 27, delay: tileIndex * 0.025 }
                        }
                      >
                        <span
                          className="pointer-events-none absolute"
                          style={{
                            top: 4,
                            left: 8,
                            right: 8,
                            height: 2,
                            backgroundImage: `repeating-linear-gradient(90deg, ${
                              on ? 'rgba(240,235,216,.5)' : 'rgba(31,58,82,.48)'
                            } 0 2px, transparent 2px 6px)`,
                          }}
                        />
                        {(['l', 'r'] as const).map((side) => (
                          <span
                            key={side}
                            className="pointer-events-none absolute rounded-full"
                            style={{
                              top: '50%',
                              [side === 'l' ? 'left' : 'right']: 0,
                              transform: `translate(${side === 'l' ? '-60%' : '60%'}, -50%)`,
                              width: 10,
                              height: 10,
                              background: 'var(--color-stub-cream)',
                              border: '2px solid var(--color-stub-navy)',
                            }}
                          />
                        ))}
                        {on && (
                          <span className="pointer-events-none absolute right-1.5 top-1.5 font-stub-label text-[7px] font-bold tracking-wider text-stub-amber">
                            PICK {selectedIndex + 1}
                          </span>
                        )}
                        <span
                          className="font-stub-display uppercase"
                          lang="en"
                          style={{
                            fontSize: `clamp(${tileFontSize(title)}px, 1.2vw, ${tileFontSize(title) + 4}px)`,
                            fontWeight: 700,
                            lineHeight: 1.06,
                            letterSpacing: '0.005em',
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 5,
                            overflow: 'hidden',
                            overflowWrap: 'break-word',
                          }}
                        >
                          {title}
                        </span>
                      </motion.button>
                    )
                  })}
                </motion.div>
              )}
            </section>

            <div className="connections-selection-state flex h-8 items-center justify-center text-center">
              <AnimatePresence mode="wait">
                {toast && status === 'playing' ? (
                  <motion.div
                    key={toast.key}
                    initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={reduce ? { duration: MOTION.duration.reduced } : MOTION.spring.settle}
                    className={`rounded-stub-pill border-2 px-4 py-1.5 font-stub-ui text-[12px] font-semibold shadow-stub-card-resting ${
                      toast.tone === 'miss'
                        ? 'border-stub-red bg-stub-red text-stub-cream'
                        : toast.tone === 'near'
                          ? 'border-stub-amber bg-stub-navy text-stub-cream'
                          : 'border-stub-navy bg-stub-navy text-stub-cream'
                    }`}
                  >
                    {toast.text}
                  </motion.div>
                ) : (
                  <motion.p
                    key="selection-copy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-stub-label text-[9px] font-bold uppercase tracking-[0.12em] text-stub-slate"
                  >
                    {status !== 'playing'
                      ? status === 'won'
                        ? 'All four groups found'
                        : 'All four groups revealed'
                      : selected.length === 4
                        ? 'Group ready · submit your four'
                        : selected.length > 0
                          ? `${selected.length} selected · choose ${4 - selected.length} more`
                          : 'Tap four tickets that share a connection'}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {status === 'playing' && (
              <div className="connections-actions flex w-full flex-none items-center gap-2 pb-[max(8px,env(safe-area-inset-bottom))]">
            <button
              type="button"
              data-action="shuffle"
              disabled={status !== 'playing'}
              onClick={() => setShuffleNonce((n) => n + 1)}
              className="min-h-11 rounded-stub-pill border-2 border-stub-navy bg-stub-paper px-4 font-stub-label text-[10px] font-bold uppercase tracking-wider text-stub-navy shadow-stub-card-resting active:scale-95 disabled:opacity-35"
            >
              Shuffle
            </button>
            <button
              type="button"
              data-action="deselect"
              disabled={status !== 'playing' || selected.length === 0}
              onClick={() => setSelected([])}
              className="min-h-11 rounded-stub-pill border-2 border-stub-navy bg-stub-paper px-4 font-stub-label text-[10px] font-bold uppercase tracking-wider text-stub-navy shadow-stub-card-resting active:scale-95 disabled:opacity-35"
            >
              Deselect
            </button>
            <button
              type="button"
              data-action="submit"
              disabled={status !== 'playing' || selected.length !== 4}
              onClick={submit}
              className={`min-h-11 flex-1 rounded-stub-pill px-4 font-stub-label text-[11px] font-bold uppercase tracking-wider shadow-stub-card-resting transition-colors active:scale-95 ${
                selected.length === 4
                  ? 'bg-stub-amber text-stub-navy shadow-stub-glow-amber'
                  : 'bg-stub-navy text-stub-cream disabled:opacity-35'
              }`}
            >
              Submit
            </button>
              </div>
            )}
          </div>
        </div>

        {/* SR live mirror (§7·7b a11y): the say() feedback line, always mounted. */}
        <div className="sr-only" role="status" aria-live="polite">
          {toast?.text ?? ''}
        </div>

        {/* Test-only terminal seam; it cannot exist in a normal production
            build and does not participate in dealer or grouping logic. */}
        {import.meta.env.VITE_E2E === '1' && (
          <button
            type="button"
            data-testid="matchcut-e2e-complete"
            className="hidden"
            onClick={() => {
              setSolved([0, 1, 2, 3])
              setGuesses(grid.groups.map((group) => [...group.films]))
              setStatus('won')
            }}
          />
        )}

        <AnimatePresence>
          {status !== 'playing' && !peekBoard && (
            <ConnectionsResults
              won={status === 'won'}
              mistakes={mistakes}
              guesses={guesses}
              groupOf={groupOf}
              daily={start.kind === 'daily' ? finishMeta : null}
              practice={start.kind === 'practice'}
              analytics={{ mode: 'connections', kind: start.kind }}
              onReset={resetGame}
              onMenu={onExit}
              onPeek={status === 'lost' ? () => setPeekBoard(true) : undefined}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showRules && <HowToPlay context="connections" onClose={() => setShowRules(false)} />}
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
  practice,
  analytics,
  onReset,
  onMenu,
  onPeek,
}: {
  won: boolean
  mistakes: number
  guesses: string[][]
  groupOf: Map<string, number>
  daily: DailyFinish | null
  practice: boolean // practice grid: marks the share line, relabels replay
  analytics: EventData // mode identity for the share event (parent owns kind)
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
  // Practice grids carry a marker (§7·7c) so a practice result can't pass for
  // the daily in a group chat; the brand line stays byte-identical for dailies.
  const text = matchCutShare('Connections', `${practice ? 'practice · ' : ''}${scoreLine}`, emojiGrid)

  // Trap-only dialog (§7·7b a11y): terminal screen, routes via its buttons.
  const dialogRef = useDialogA11y()

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={won ? 'Solved — results' : 'Missed it — results'}
      tabIndex={-1}
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
        className="my-auto flex w-full max-w-[390px] flex-col items-center py-6"
      >
        <div className="connections-result-ticket relative w-full overflow-hidden rounded-[22px] border-2 border-stub-navy bg-stub-paper px-5 pb-5 pt-6 shadow-stub-modal">
          <div className="connections-result-texture pointer-events-none absolute inset-0" />
          <div className="relative flex flex-col items-center">
            <p className="font-stub-label text-[9px] font-bold uppercase tracking-[0.2em] text-stub-amber">
              Match Cut · Connections
            </p>
            <h2 className="mt-2 font-stub-display text-[38px] font-bold leading-none text-stub-navy">
              {won ? 'Solved!' : 'Missed it'}
            </h2>
            <p className="mt-2 font-stub-ui text-sm text-stub-slate">
              {won
                ? mistakes === 0
                  ? 'Perfect — four clean groups.'
                  : `${mistakes} mistake${mistakes === 1 ? '' : 's'} on the way.`
                : 'The remaining groups are waiting on the board.'}
            </p>

            {daily && (
              <p className="mt-2 font-stub-label text-[10px] font-semibold uppercase tracking-wider text-stub-slate tabular-nums" data-daily-meta>
                day {daily.day} · streak {daily.streak}
                {daily.best !== null && ` · best ${daily.best}`}
                {daily.repeat && ' · already played today'}
              </p>
            )}

            {guesses.length > 0 && (
              <div className="mt-5 w-full border-y border-dotted border-stub-navy/35 py-3">
                <p className="mb-2 font-stub-label text-[8px] font-bold uppercase tracking-[0.18em] text-stub-slate">
                  Your guesses
                </p>
                <div className="font-stub-ui text-[19px] leading-[1.45] tracking-[0.2em]" aria-label={`${guesses.length} submitted guesses`}>
                  {emojiGrid.split('\n').map((row, i) => (
                    <div key={i}>{row}</div>
                  ))}
                </div>
              </div>
            )}

            <ShareCopy text={text} analytics={analytics} />

            {onPeek && (
              <button
                type="button"
                data-action="see-board"
                onClick={onPeek}
                className="mt-3 min-h-12 rounded-stub-pill border-2 border-stub-amber bg-stub-paper px-7 py-3 font-stub-ui text-[14px] font-bold text-stub-navy shadow-stub-card-resting active:scale-95"
              >
                See the revealed groups
              </button>
            )}

            <div className="mt-3 flex w-full items-center justify-center gap-2">
              <button
                type="button"
                onClick={onReset}
                className="min-h-11 flex-1 rounded-stub-pill border-2 border-stub-navy bg-stub-paper px-4 py-2 font-stub-ui text-[13px] font-bold text-stub-navy shadow-stub-card-resting active:scale-95"
              >
                {/* Honest replay labels (§7·7c): the daily re-deals the SAME grid by
                    design; only practice deals a fresh one. */}
                {practice ? 'New grid' : "Replay today's grid"}
              </button>
              <button
                type="button"
                onClick={onMenu}
                className="min-h-11 rounded-stub-pill border-2 border-stub-navy bg-stub-paper px-5 py-2 font-stub-ui text-[13px] font-bold text-stub-navy active:scale-95"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
