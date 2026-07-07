// src/ChronologyGame.tsx — Mode 3, Chronology (Phase 3 UI).
//
// A standalone sibling to SoloGame.tsx / DuelGame.tsx. It renders the year-ordered
// LINE with insertable gaps, a hand of titles (years hidden), and the signature
// flip-and-snap on a misfire. ALL rules come from src/lib/chronology.ts — this
// component holds no scoring logic of its own, so the sim and the UI can never
// drift (parity by construction).
//
// Reuse map (docs/chronology-reuse.md): the drag-to-place primitive and the
// invalid-shake are copied from RaisedCard in src/components/Hand.tsx; the drop
// hit-test generalizes attemptPlay in SoloGame.tsx from one pile zone to N gap
// refs; the flip card is ChronoCard.tsx (copied from CardView). Pure helpers are
// imported directly.

import { Fragment, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import {
  type ChronologyCard,
  type ChronoDifficulty,
  type Placement,
  type StreakState,
  STREAK_TARGET,
  dealRoundShaped,
  gapTightness,
  newStreak,
  scorePlacement,
  streakCredit,
} from './lib/chronology.ts'
import { CHRONOLOGY_POOL } from './data/chronologyPool.ts'
import { ChronoCardView } from './components/ChronoCard.tsx'
import { matchCutShare } from './lib/share.ts'
// localDateSeed debuted here; it now lives in lib/daily.ts so Solo's daily
// shares the exact local-midnight rollover rule (no drift between modes).
import { localDateSeed } from './lib/daily.ts'
import { recordDailyFinish, type DailyFinish } from './lib/progress.ts'
import { track } from './lib/analytics.ts'
import ShareCopy from './components/ShareCopy.tsx'

// How a round was started (chosen at the menu, App.tsx). The DAILY rides the
// standard uniform deal keyed to the player's local calendar date, so everyone
// sees the same board on the same day (Wordle-style, local-midnight rollover). A
// PRACTICE round is a fresh random deal at a chosen spread — the easy/hard dial
// lives only here, never on the daily (design/chronology.md §6).
export type ChronoStart =
  | { kind: 'daily' }
  | { kind: 'practice'; difficulty: Extract<ChronoDifficulty, 'easy' | 'hard'> }

type Status = 'playing' | 'cleared'

// A misfire reveal in flight: the raised card is flipped to its year, then snapped
// into its correct slot one beat later.
interface Placing {
  card: ChronologyCard
  placement: Placement
  tight: number
}

interface LogEntry {
  id: string
  result: 'clean' | 'misfire'
}

// ── share text (family format, now via the shared helper) ─────────────────────
// The three modes read as one family: a brand line, the golf score (low wins),
// and a 🎬-led emoji row (🟩 clean, 🟥 misfire). The clipboard plumbing that
// debuted here now lives in src/lib/share.ts + ShareCopy, used by all three modes.
function shareText(score: number, strokes: number, credits: number, emoji: string): string {
  const tally =
    `${strokes} ${strokes === 1 ? 'stroke' : 'strokes'}` + (credits > 0 ? `, ${credits} back` : '')
  return matchCutShare('Chronology', `score ${score} (${tally})`, emoji)
}

export default function ChronologyGame({ onExit, start }: { onExit: () => void; start: ChronoStart }) {
  const reduce = useReducedMotion()

  // The daily seed is fixed to today's local date (deterministic, shared). The
  // practice base is a one-off random token so each practice round is a fresh
  // deal — determinism is only the daily's contract, so practice may use Math.random.
  const dailySeed = useRef(localDateSeed()).current
  const practiceBase = useRef(Math.random().toString(36).slice(2)).current

  // One deal entry point for both kinds: the daily always deals 'standard'
  // (the uniform board everyone shares); practice deals its chosen spread. `n`
  // freshens a practice round on "new round" / "play again".
  const dealFor = (n: number) =>
    start.kind === 'daily'
      ? dealRoundShaped(dailySeed, CHRONOLOGY_POOL, 'standard')
      : dealRoundShaped(`practice-${start.difficulty}-${practiceBase}-${n}`, CHRONOLOGY_POOL, start.difficulty)

  const [roundN, setRoundN] = useState(0)
  const [line, setLine] = useState<ChronologyCard[]>(() => [dealFor(0).anchor])
  const [hand, setHand] = useState<ChronologyCard[]>(() => dealFor(0).hand)

  const [raisedId, setRaisedId] = useState<string | null>(null)
  const [strokes, setStrokes] = useState(0)
  const [credits, setCredits] = useState(0) // count of −1 streak credits earned
  const [streak, setStreak] = useState<StreakState>(newStreak)
  const [playLog, setPlayLog] = useState<LogEntry[]>([])
  const [status, setStatus] = useState<Status>('playing')

  const [placing, setPlacing] = useState<Placing | null>(null) // misfire flip in flight
  // Streak/best readout for the cleared screen — set by the finish effect
  // below. Meta-state only; no rule reads it (persistence guardrail).
  const [finishMeta, setFinishMeta] = useState<DailyFinish | null>(null)
  const [invalidNonce, setInvalidNonce] = useState(0) // shake the raised card
  const [badgeNonce, setBadgeNonce] = useState(0) // pop the Streak ×3 badge
  const [toast, setToast] = useState<{ key: number; text: string } | null>(null)

  const lineBandRef = useRef<HTMLDivElement>(null)
  const gapRefs = useRef<(HTMLDivElement | null)[]>([])
  const flipTimer = useRef<number | undefined>(undefined)

  const score = strokes - credits // golf: lower is better

  useEffect(() => () => window.clearTimeout(flipTimer.current), [])

  // Badge + toast auto-dismiss.
  useEffect(() => {
    if (!badgeNonce) return
    const t = window.setTimeout(() => setBadgeNonce(0), 1700)
    return () => window.clearTimeout(t)
  }, [badgeNonce])
  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast((cur) => (cur?.key === toast.key ? null : cur)), 2200)
    return () => window.clearTimeout(t)
  }, [toast])

  const say = (text: string) => setToast({ key: performance.now(), text })

  useEffect(() => {
    track('mode_start', { mode: 'chronology', kind: start.kind })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Clearing the board completes the daily. recordDailyFinish is once-per-seed,
  // so a same-day "Play again" reads back the existing entry (repeat: true);
  // practice rounds never record — they'd let streaks be farmed off-seed.
  useEffect(() => {
    if (status !== 'cleared') return
    track('mode_finish', { mode: 'chronology', kind: start.kind })
    if (start.kind !== 'daily') return
    setFinishMeta(recordDailyFinish('chronology', dailySeed, score))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // ── commit a placement (shared by clean and the delayed misfire path) ────────
  const applyPlacement = (card: ChronologyCard, placement: Placement, tight: number) => {
    const outcome = streakCredit(streak, placement.result, tight)
    setStreak(outcome.state)
    setStrokes((s) => s + placement.strokeDelta)
    if (outcome.creditDelta < 0) setCredits((c) => c + 1)
    if (outcome.badge) setBadgeNonce((n) => n + 1)

    // Insert at the canonical slot: an already-sorted line stays sorted by
    // construction, so the line is never out of order (ruleset §3).
    const nextLine = [
      ...line.slice(0, placement.correctSlot),
      card,
      ...line.slice(placement.correctSlot),
    ]
    const nextHand = hand.filter((h) => h.id !== card.id)
    setLine(nextLine)
    setHand(nextHand)
    setPlayLog((l) => [...l, { id: card.id, result: placement.result }])
    setRaisedId(null)
    setPlacing(null)

    // Banner copy (lowercase, low-key house voice).
    if (placement.result === 'misfire') {
      const sameYear = line.some((c) => c.year === card.year)
      say(outcome.mercyUsed
        ? `actually ${card.year} — tight-call mercy, streak holds`
        : sameYear
          ? `actually ${card.year} — same year, decided by exact date`
          : `actually ${card.year}`)
    } else {
      say(outcome.badge ? `streak ×${STREAK_TARGET} — stroke back` : tight <= 3 ? `nice — tight call` : `clean`)
    }

    if (nextHand.length === 0) setStatus('cleared')
  }

  // ── drop hit-test: nearest gap to the drop point, within the line's band ─────
  const onDrop = (id: string, point: { x: number; y: number }) => {
    if (status !== 'playing' || placing) return
    const band = lineBandRef.current?.getBoundingClientRect()
    if (!band) return
    const m = 90 // "on or near the line"
    const nearBand = point.y >= band.top - m && point.y <= band.bottom + m
    if (!nearBand) {
      setInvalidNonce((n) => n + 1) // out of the line — shake, spring back
      return
    }
    // Map the drop X to the nearest gap (line.length + 1 of them, ends included).
    let chosen = 0
    let bestDist = Infinity
    for (let i = 0; i < line.length + 1; i++) {
      const el = gapRefs.current[i]
      if (!el) continue
      const r = el.getBoundingClientRect()
      const dist = Math.abs(point.x - (r.left + r.width / 2))
      if (dist < bestDist) {
        bestDist = dist
        chosen = i
      }
    }

    const card = hand.find((h) => h.id === id)
    if (!card) return
    const placement = scorePlacement(card, line, chosen)
    const tight = gapTightness(line, placement.correctSlot)

    if (placement.result === 'clean') {
      applyPlacement(card, placement, tight) // settles in place
      return
    }
    // Misfire: flip the raised card to reveal its year, then snap it home.
    setPlacing({ card, placement, tight })
    window.clearTimeout(flipTimer.current)
    flipTimer.current = window.setTimeout(
      () => applyPlacement(card, placement, tight),
      reduce ? 500 : 700,
    )
  }

  const resetGame = () => {
    window.clearTimeout(flipTimer.current)
    // Practice gets a fresh random round; the daily replays today's fixed board
    // (a retry of the same puzzle, not a new one — the daily is the daily).
    const next = start.kind === 'practice' ? roundN + 1 : roundN
    const r = dealFor(next)
    setRoundN(next)
    setLine([r.anchor])
    setHand(r.hand)
    setRaisedId(null)
    setStrokes(0)
    setCredits(0)
    setStreak(newStreak())
    setPlayLog([])
    setPlacing(null)
    setToast(null)
    setStatus('playing')
  }

  const raised = hand.find((h) => h.id === raisedId) ?? null
  const flippingRaised = placing !== null && raised?.id === placing.card.id

  return (
    <div
      className="h-full overflow-hidden bg-stub-cream"
      style={{
        backgroundImage: 'radial-gradient(rgba(31,58,82,.06) 1px, transparent 1.2px)',
        backgroundSize: '7px 7px',
      }}
    >
      <div className="relative mx-auto h-full w-full max-w-[420px]">
        {/* 7a navy Stub header: nav row + a strokes/streak tally, bottom corners
            only per the token sheet. Cream ink on navy, with the header's cream
            dot texture. Title in Domine; the tally reads in the same value shape
            as Duel's HUD (mono eyebrows, tabular numerals). */}
        <header
          className="relative flex items-center justify-between overflow-hidden rounded-b-stub-header bg-stub-navy px-3 pb-2.5 pt-4"
        >
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
              <span className="font-stub-display text-lg font-bold tracking-tight text-stub-cream">Chronology</span>
              <span className="mt-1 font-stub-label text-[9px] uppercase tracking-wider text-stub-amber">
                {start.kind === 'daily' ? 'daily' : `practice · ${start.difficulty === 'easy' ? 'wide' : 'tight'}`}
              </span>
            </div>
          </div>
          <div className="relative flex items-center gap-2">
            <div className="text-right tabular-nums">
              <div className="font-stub-label text-[11px] uppercase tracking-wide text-stub-cream">
                Strokes <span className="font-stub-display text-[13px] font-bold">{strokes}</span>
                {credits > 0 && <span className="text-stub-amber"> · −{credits}</span>}
              </div>
              <div className="mt-1 flex items-center justify-end gap-1" aria-label="Streak">
                {Array.from({ length: STREAK_TARGET }).map((_, i) => (
                  <span
                    key={i}
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      i < streak.streak ? 'bg-stub-amber' : 'bg-stub-slate-light/40'
                    }`}
                  />
                ))}
                {streak.mercyArmed && <span className="ml-0.5 text-[10px] leading-none">🛡</span>}
              </div>
            </div>
            {/* Practice can reshuffle a fresh round; the daily is fixed, so it
                shows no reshuffle (a "new" daily would be the same board). */}
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

        {/* The LINE — placed cards with insertable gaps (ends included). Older
            left, newer right. Horizontally scrollable as it fills. */}
        <section
          ref={lineBandRef}
          data-line
          className="absolute inset-x-0 top-20 z-10 overflow-x-auto px-4 py-3"
        >
          <div className="mx-auto flex min-h-[124px] w-max items-center">
            {Array.from({ length: line.length + 1 }).map((_, i) => (
              <Fragment key={`slot-${i}`}>
                <Gap
                  setRef={(el) => {
                    gapRefs.current[i] = el
                  }}
                  active={raisedId !== null && !placing}
                />
                {i < line.length && (
                  <motion.div
                    layoutId={line[i].id}
                    data-line-card={line[i].id}
                    className="flex flex-col items-center"
                    transition={
                      reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 360, damping: 30 }
                    }
                  >
                    <span className="mb-1 font-stub-display text-[11px] font-bold tabular-nums text-stub-navy">
                      {line[i].year}
                    </span>
                    <ChronoCardView card={line[i]} faceUp={false} size="line" showYear />
                  </motion.div>
                )}
              </Fragment>
            ))}
          </div>
        </section>

        {/* Streak badge + toast */}
        <div className="pointer-events-none absolute inset-x-0 top-[252px] z-40 flex flex-col items-center gap-1.5 px-4">
          <AnimatePresence>
            {badgeNonce > 0 && (
              <motion.div
                key={`badge-${badgeNonce}`}
                data-streak-badge
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.3, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0 }}
                transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 460, damping: 13 }}
                className="rounded-stub-pill bg-stub-amber px-4 py-1.5 font-stub-label text-[11px] font-bold uppercase tracking-wider text-stub-navy shadow-stub-glow-amber"
              >
                Streak ×{STREAK_TARGET}
              </motion.div>
            )}
          </AnimatePresence>
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

        {/* Tap-elsewhere-to-lower backdrop (under the hand, over the line) */}
        {raisedId !== null && !placing && (
          <div className="absolute inset-0 z-20" onPointerDown={() => setRaisedId(null)} />
        )}

        {/* Raised card — the one lifted card, draggable into a gap */}
        <div
          className="pointer-events-none absolute inset-x-0 z-50 flex justify-center"
          style={{ bottom: 188 }}
        >
          {raised && (
            <RaisedCard
              key={raised.id}
              card={raised}
              faceUp={flippingRaised}
              draggable={!placing}
              invalidNonce={invalidNonce}
              reduce={!!reduce}
              onDrop={onDrop}
            />
          )}
        </div>

        {/* Hand fan — tap a title to lift it */}
        <ChronoHand
          cards={hand}
          raisedId={raisedId}
          reduce={!!reduce}
          onRaise={(id) => status === 'playing' && !placing && setRaisedId(id)}
        />

        <AnimatePresence>
          {status === 'cleared' && (
            <ChronoResults
              score={score}
              strokes={strokes}
              credits={credits}
              log={playLog}
              daily={start.kind === 'daily' ? finishMeta : null}
              onReset={resetGame}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── the line gap / drop target ────────────────────────────────────────────────
// A thin slot that widens and shows a dashed insert bar while a card is raised, so
// every legal drop target is visible (a line of n cards shows n+1 of these).
const Gap = ({
  active,
  setRef,
}: {
  active: boolean
  setRef: (el: HTMLDivElement | null) => void
}) => (
  <div
    ref={setRef}
    data-gap
    className="flex h-[112px] shrink-0 items-center justify-center transition-all"
    style={{ width: active ? 30 : 12 }}
  >
    <div
      className="h-full w-[3px] rounded-full transition-colors"
      style={{ background: active ? 'var(--color-stub-amber)' : 'transparent' }}
    />
  </div>
)

// ── raised, draggable card (drag-to-place primitive, copied from Hand.tsx) ──────
function RaisedCard({
  card,
  faceUp,
  draggable,
  invalidNonce,
  reduce,
  onDrop,
}: {
  card: ChronologyCard
  faceUp: boolean
  draggable: boolean
  invalidNonce: number
  reduce: boolean
  onDrop: (id: string, point: { x: number; y: number }) => void
}) {
  const controls = useAnimationControls()
  const firstRender = useRef(true)

  // Damped horizontal shake when a drop lands off the line (opacity pulse under
  // reduced motion) — same feedback as the Movie hand.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    controls.start(
      reduce
        ? { opacity: [1, 0.35, 1], transition: { duration: 0.3 } }
        : { x: [0, -16, 13, -9, 6, -3, 0], transition: { duration: 0.45 } },
    )
  }, [invalidNonce, controls, reduce])

  return (
    <motion.div
      layoutId={card.id}
      data-card={`raised-${card.id}`}
      className="pointer-events-auto relative"
      style={{ touchAction: 'none', zIndex: 60 }}
      drag={draggable}
      dragSnapToOrigin
      dragMomentum={false}
      dragElastic={0.7}
      whileDrag={{ scale: 1.04 }}
      transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 380, damping: 30 }}
      onDragEnd={(_, info) => onDrop(card.id, info.point)}
    >
      <motion.div animate={controls}>
        <ChronoCardView card={card} faceUp={faceUp} size="raised" />
      </motion.div>
    </motion.div>
  )
}

// ── hand fan (simplified from Hand.tsx: tap-to-raise only, years hidden) ────────
const FAN_CARD_W = 78
function ChronoHand({
  cards,
  raisedId,
  reduce,
  onRaise,
}: {
  cards: ChronologyCard[]
  raisedId: string | null
  reduce: boolean
  onRaise: (id: string) => void
}) {
  const spring = reduce
    ? ({ duration: 0.15 } as const)
    : ({ type: 'spring', stiffness: 380, damping: 30 } as const)
  const n = cards.length
  const spacing = Math.min(42, (360 - FAN_CARD_W) / Math.max(n - 1, 1))

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-30 h-[200px]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {cards.map((c, i) => {
        if (c.id === raisedId) return null // its slot stays empty while raised
        const off = i - (n - 1) / 2
        return (
          <motion.div
            key={c.id}
            layoutId={c.id}
            data-card={c.id}
            className="absolute left-1/2 top-6"
            style={{ marginLeft: -FAN_CARD_W / 2, zIndex: 10 + i, touchAction: 'none' }}
            animate={{ x: off * spacing, y: Math.abs(off) ** 1.7 * 5 }}
            transition={spring}
            onTap={() => onRaise(c.id)}
          >
            <motion.div animate={{ rotate: off * 5 }} transition={spring}>
              <ChronoCardView card={c} faceUp={false} size="hand" />
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── cleared screen + share (Phase 4) ──────────────────────────────────────────
// Shows only when the hand has emptied (the caller gates on status === 'cleared').
// Choreography is the staggered spring entrance copied from Results.tsx; the copy
// action is the shared ShareCopy affordance (born here in Phase 4, since lifted).
function ChronoResults({
  score,
  strokes,
  credits,
  log,
  daily,
  onReset,
}: {
  score: number
  strokes: number
  credits: number
  log: LogEntry[]
  daily: DailyFinish | null // streak readout — null on practice rounds
  onReset: () => void
}) {
  const reduce = useReducedMotion()

  // Family share format: one glyph per placement, in placement order (clean 🟩 /
  // misfire 🟥), led by 🎬 like the other two modes.
  const emoji = '🎬' + log.map((p) => (p.result === 'misfire' ? '🟥' : '🟩')).join('')
  const text = shareText(score, strokes, credits, emoji)

  return (
    <motion.div
      className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-stub-cream/95 px-8 text-center"
      style={{
        backgroundImage: 'radial-gradient(rgba(31,58,82,.06) 1px, transparent 1.2px)',
        backgroundSize: '7px 7px',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: reduce ? 0.15 : 0.5, duration: reduce ? 0.15 : 0.35 }}
    >
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 14 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        transition={
          reduce ? { delay: 0.2, duration: 0.15 } : { delay: 0.6, type: 'spring', stiffness: 260, damping: 22 }
        }
        className="flex w-full flex-col items-center"
      >
        <h2 className="font-stub-display text-4xl font-bold text-stub-navy">Cleared!</h2>
        <p className="mt-3 font-stub-display text-lg font-bold tabular-nums text-stub-navy">
          Final score {score}
        </p>
        <p className="mt-1 font-stub-ui text-sm text-stub-slate tabular-nums">
          {strokes} {strokes === 1 ? 'stroke' : 'strokes'}
          {credits > 0 && ` · ${credits} streak credit${credits === 1 ? '' : 's'}`}
        </p>

        {daily && (
          <p className="mt-1 font-stub-label text-[11px] font-semibold uppercase tracking-wider text-stub-slate tabular-nums" data-daily-meta>
            day {daily.day} · streak {daily.streak}
            {daily.best !== null && ` · best ${daily.best}`}
            {daily.repeat && ' · already played today'}
          </p>
        )}
        <div className="mt-5 rounded-stub-panel border-2 border-stub-navy bg-stub-paper px-5 py-3 text-xl tracking-wider shadow-stub-card-resting">
          {emoji}
        </div>

        <ShareCopy text={text} />

        <button
          type="button"
          onClick={onReset}
          className="mt-3 min-h-12 rounded-stub-pill border-2 border-stub-navy bg-stub-paper px-7 py-3 font-stub-ui text-[15px] font-bold text-stub-navy shadow-stub-card-resting active:scale-95"
        >
          Play again
        </button>
      </motion.div>
    </motion.div>
  )
}
