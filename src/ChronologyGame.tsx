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
import { AnimatePresence, MotionConfig, motion, useAnimationControls, useReducedMotion } from 'framer-motion'
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
import { track, type EventData } from './lib/analytics.ts'
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

type GapTarget =
  | { kind: 'gap'; index: number }
  | { kind: 'edge-blocked'; direction: 'older' | 'newer' }
  | { kind: 'outside' }

// ── share text (family format, now via the shared helper) ─────────────────────
// The three modes read as one family: a brand line, the golf score (low wins),
// and a 🎬-led emoji row (🟩 clean, 🟥 misfire). The clipboard plumbing that
// debuted here now lives in src/lib/share.ts + ShareCopy, used by all three modes.
function shareText(score: number, strokes: number, credits: number, emoji: string): string {
  const tally =
    `${strokes} ${strokes === 1 ? 'stroke' : 'strokes'}` + (credits > 0 ? `, ${credits} back` : '')
  return matchCutShare('Chronology', `score ${score} (${tally})`, emoji)
}

// ── LINE band interaction geometry ─────────────────────────────────────────────
// Shared by the drop hit-test, the drag auto-scroll, and the ambiguous-edge
// guard — all three must agree on what "near the line" and "at the edge" mean,
// or a drop the auto-scroll treats as "pushing past the end" could still score.
const BAND_MARGIN = 90 // vertical "on or near the line" tolerance (px)
const EDGE_ZONE = 48 // px from a band edge that reads as reaching past the visible line
const EDGE_SCROLL_STEP = 12 // max px/frame the band glides during an edge hold

function reelVisualStyle(offset: number) {
  const distance = Math.abs(offset)
  if (distance <= 1) return { transform: 'translateY(0) scale(1) rotate(0deg)', opacity: 1 }
  const direction = offset < 0 ? -1 : 1
  if (distance === 2) {
    return { transform: `translateY(6px) scale(.88) rotate(${direction * 5}deg)`, opacity: 0.76 }
  }
  return { transform: `translateY(10px) scale(.78) rotate(${direction * 8}deg)`, opacity: 0.54 }
}

export default function ChronologyGame({ onExit, start }: { onExit: () => void; start: ChronoStart }) {
  const systemReduce = useReducedMotion()
  // DEV-only capture hook for the standing reduced-motion visual gate. The
  // production build keeps following the player's OS preference exclusively.
  const forceReduce = import.meta.env.DEV && new URLSearchParams(window.location.search).get('reduce') === '1'
  const reduce = systemReduce || forceReduce

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
  const [compact, setCompact] = useState(() => window.matchMedia('(max-height: 720px)').matches)
  const [centeredIndex, setCenteredIndex] = useState(0)
  const [progressSegment, setProgressSegment] = useState(0)
  const [activeTarget, setActiveTarget] = useState<GapTarget>({ kind: 'outside' })
  const [dragging, setDragging] = useState(false)

  const lineBandRef = useRef<HTMLDivElement>(null)
  const gapRefs = useRef<(HTMLDivElement | null)[]>([])
  const flipTimer = useRef<number | undefined>(undefined)
  const dragPoint = useRef<{ x: number; y: number } | null>(null) // latest drag pointer, page coords
  const autoScrollRaf = useRef<number | undefined>(undefined)

  const score = strokes - credits // golf: lower is better

  useEffect(() => {
    const query = window.matchMedia('(max-height: 720px)')
    const sync = () => setCompact(query.matches)
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  const updateReelPosition = () => {
    const band = lineBandRef.current
    if (!band) return
    const cards = Array.from(band.querySelectorAll<HTMLElement>('[data-line-card]'))
    const center = band.getBoundingClientRect().left + band.clientWidth / 2
    let nearest = 0
    let distance = Infinity
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect()
      const next = Math.abs(rect.left + rect.width / 2 - center)
      if (next < distance) {
        distance = next
        nearest = index
      }
    })
    setCenteredIndex(nearest)
    const max = band.scrollWidth - band.clientWidth
    setProgressSegment(max <= 0 ? 0 : Math.round((band.scrollLeft / max) * 6))
  }

  const resolveGapTarget = (point: { x: number; y: number }): GapTarget => {
    const band = lineBandRef.current?.getBoundingClientRect()
    if (!band) return { kind: 'outside' }
    if (point.y < band.top - BAND_MARGIN || point.y > band.bottom + BAND_MARGIN) {
      return { kind: 'outside' }
    }

    const firstGap = gapRefs.current[0]?.getBoundingClientRect()
    const lastGap = gapRefs.current[line.length]?.getBoundingClientRect()
    const offLeft = !!firstGap && firstGap.right < band.left
    const offRight = !!lastGap && lastGap.left > band.right
    if (offLeft && point.x < band.left + EDGE_ZONE) return { kind: 'edge-blocked', direction: 'older' }
    if (offRight && point.x > band.right - EDGE_ZONE) return { kind: 'edge-blocked', direction: 'newer' }
    if (point.x < band.left - EDGE_ZONE || point.x > band.right + EDGE_ZONE) return { kind: 'outside' }

    let chosen = -1
    let bestDist = Infinity
    for (let i = 0; i < line.length + 1; i++) {
      const rect = gapRefs.current[i]?.getBoundingClientRect()
      if (!rect || rect.right < band.left || rect.left > band.right) continue
      const dist = Math.abs(point.x - (rect.left + rect.width / 2))
      if (dist < bestDist) {
        bestDist = dist
        chosen = i
      }
    }
    return chosen >= 0 ? { kind: 'gap', index: chosen } : { kind: 'outside' }
  }

  useEffect(
    () => () => {
      window.clearTimeout(flipTimer.current)
      if (autoScrollRaf.current !== undefined) cancelAnimationFrame(autoScrollRaf.current)
    },
    [],
  )

  // ── drag auto-scroll: hold a card near a band edge and the line glides under
  // it. rAF-driven, not per-pointer-event: pointer events stop the moment the
  // finger holds still, which is exactly when the player commits to the edge.
  const onDragActive = (active: boolean) => {
    setDragging(active)
    if (!active) {
      if (autoScrollRaf.current !== undefined) cancelAnimationFrame(autoScrollRaf.current)
      autoScrollRaf.current = undefined
      dragPoint.current = null
      return
    }
    if (autoScrollRaf.current !== undefined) return
    const tick = () => {
      const bandEl = lineBandRef.current
      const p = dragPoint.current
      if (bandEl && p) {
        const r = bandEl.getBoundingClientRect()
        // Only glide while the card is actually up at the line — dragging
        // around the hand shouldn't shift the board.
        if (p.y >= r.top - BAND_MARGIN && p.y <= r.bottom + BAND_MARGIN) {
          if (p.x < r.left + EDGE_ZONE) {
            bandEl.scrollLeft -= EDGE_SCROLL_STEP * Math.min(1, (r.left + EDGE_ZONE - p.x) / EDGE_ZONE)
          } else if (p.x > r.right - EDGE_ZONE) {
            bandEl.scrollLeft += EDGE_SCROLL_STEP * Math.min(1, (p.x - (r.right - EDGE_ZONE)) / EDGE_ZONE)
          }
          updateReelPosition()
          setActiveTarget(resolveGapTarget(p))
        }
      }
      autoScrollRaf.current = requestAnimationFrame(tick)
    }
    autoScrollRaf.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      updateReelPosition()
      if (!raisedId || placing) {
        setActiveTarget({ kind: 'outside' })
        return
      }
      const band = lineBandRef.current?.getBoundingClientRect()
      if (band) setActiveTarget(resolveGapTarget({ x: band.left + band.width / 2, y: band.top + band.height / 2 }))
    })
    return () => cancelAnimationFrame(frame)
    // line/viewport changes are the moments when the centered card and default
    // target must be recomputed from flat layout geometry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line, raisedId, placing, compact])

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
    // strokes = raw effort, score = strokes − streak credits (the golf number
    // the end screen shows and the daily records) — both settled at 'cleared'
    track('mode_finish', { mode: 'chronology', kind: start.kind, strokes, score })
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

    // Keep the player oriented: glide the band so the settled card is on
    // screen — a misfire's correct slot can be scrolled out of view, and the
    // card must never vanish to a spot the player never saw. offsetLeft (not
    // getBoundingClientRect) because the layoutId flight is mid-transform when
    // this runs; layout position is the truth about where the card lands.
    requestAnimationFrame(() => {
      const bandEl = lineBandRef.current
      const el = bandEl?.querySelector<HTMLElement>(`[data-line-card="${CSS.escape(card.id)}"]`)
      if (!bandEl || !el) return
      bandEl.scrollTo({
        left: el.offsetLeft + el.offsetWidth / 2 - bandEl.clientWidth / 2,
        behavior: reduce ? 'auto' : 'smooth',
      })
    })

    if (nextHand.length === 0) setStatus('cleared')
  }

  // Highlight, tap, and release all converge here after using the same resolver.
  // A blocked edge or outside release never reaches scorePlacement, so it can
  // never manufacture a stroke for a slot the player did not choose.
  const placeAtTarget = (id: string, target: GapTarget) => {
    if (status !== 'playing' || placing) return
    if (target.kind !== 'gap') {
      setInvalidNonce((n) => n + 1)
      if (target.kind === 'edge-blocked') say('more line that way — hold your card at the edge to scroll')
      return
    }

    const card = hand.find((h) => h.id === id)
    if (!card) return
    const placement = scorePlacement(card, line, target.index)
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

  const onDrop = (id: string, point: { x: number; y: number }) => {
    const target = resolveGapTarget(point)
    setActiveTarget(target)
    placeAtTarget(id, target)
  }

  const onTapGap = (index: number) => {
    if (!raisedId || placing) return
    const rect = gapRefs.current[index]?.getBoundingClientRect()
    if (!rect) return
    const target = resolveGapTarget({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    setActiveTarget(target)
    placeAtTarget(raisedId, target)
  }

  const resetGame = () => {
    // a replay is a new game for analytics — the mount effect only covers the
    // first deal, so re-fire here to keep mode_start ↔ mode_finish paired 1:1
    track('mode_start', { mode: 'chronology', kind: start.kind })
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
    setActiveTarget({ kind: 'outside' })
    setDragging(false)
    setStatus('playing')
  }

  const raised = hand.find((h) => h.id === raisedId) ?? null
  const flippingRaised = placing !== null && raised?.id === placing.card.id
  const centeredCard = line[Math.min(centeredIndex, line.length - 1)] ?? line[0]
  const reelSize = compact ? 'reelCompact' : 'reel'

  return (
    <MotionConfig reducedMotion={forceReduce ? 'always' : 'user'}>
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
              <span className="chrono-header-title font-stub-display font-bold tracking-tight text-stub-cream">Chronology</span>
              <span className="mt-1 font-stub-label text-[9px] uppercase tracking-wider text-stub-amber">
                {start.kind === 'daily' ? 'daily' : `practice · ${start.difficulty === 'easy' ? 'wide' : 'tight'}`}
              </span>
            </div>
          </div>
          <div className="relative flex items-center gap-2">
            <div className="text-right tabular-nums">
              <div className="font-stub-label text-[11px] uppercase tracking-wide text-stub-cream">
                Strokes <span className="chrono-strokes-value font-stub-display font-bold">{strokes}</span>
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

        <div className="chrono-reel-nav absolute inset-x-0 z-30 px-5 text-center">
          <p className="font-stub-label text-[10px] font-bold uppercase tracking-[0.12em] text-stub-navy">
            SWIPE THE REEL · OLDER ← → NEWER
          </p>
          <div className="mt-2 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-stub-slate-light/55" />
            <span className="flex items-center gap-1.5">
              {Array.from({ length: 7 }).map((_, index) => (
                <span
                  key={index}
                  className={`h-2 rounded-full transition-[width,background-color] ${
                    index === progressSegment ? 'w-5 bg-stub-amber' : 'w-2 bg-stub-slate/70'
                  }`}
                />
              ))}
            </span>
            <span className="h-px flex-1 bg-stub-slate-light/55" />
          </div>
          {centeredCard && (
            <span className="sr-only" aria-live="polite">
              {centeredCard.title}, movie {centeredIndex + 1} of {line.length}
            </span>
          )}
        </div>

        {/* Native momentum scrolling stays on the flat rail. layoutId owns only
            the raised-to-line flight; reel perspective lives one wrapper lower. */}
        <section
          ref={lineBandRef}
          data-line
          aria-label="Chronology reel"
          onScroll={() => {
            updateReelPosition()
            if (dragPoint.current) setActiveTarget(resolveGapTarget(dragPoint.current))
          }}
          className="chrono-reel-band absolute inset-x-0 z-30 overflow-x-auto px-4"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: dragging ? 'none' : 'x proximity',
          }}
        >
          <div className="mx-auto flex w-max items-center">
            {Array.from({ length: line.length + 1 }).map((_, i) => (
              <Fragment key={`slot-${i}`}>
                <Gap
                  setRef={(el) => {
                    gapRefs.current[i] = el
                  }}
                  visible={raisedId !== null && !placing}
                  selected={activeTarget.kind === 'gap' && activeTarget.index === i}
                  label={
                    i === 0
                      ? `Place before ${line[0].title}`
                      : i === line.length
                        ? `Place after ${line[line.length - 1].title}`
                        : `Place between ${line[i - 1].title} and ${line[i].title}`
                  }
                  onPlace={() => onTapGap(i)}
                />
                {i < line.length && (
                  <div
                    data-line-card={line[i].id}
                    className="shrink-0"
                    style={{ scrollSnapAlign: 'center' }}
                  >
                    <motion.div
                      layoutId={line[i].id}
                      transition={
                        reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 360, damping: 30 }
                      }
                    >
                      <div
                        className="origin-center transition-[transform,opacity] duration-200"
                        style={reelVisualStyle(i - centeredIndex)}
                      >
                        <ChronoCardView card={line[i]} faceUp={false} size={reelSize} showYear />
                      </div>
                    </motion.div>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </section>

        {/* Streak badge + toast */}
        <div className="chrono-reel-feedback pointer-events-none absolute inset-x-0 z-40 flex flex-col items-center gap-1.5 px-4">
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

        {/* Tap-elsewhere-to-lower backdrop (under the hand AND under the line,
            so the band keeps its swipe-to-scroll while a card is raised) */}
        {raisedId !== null && !placing && (
          <div className="absolute inset-0 z-20" onPointerDown={() => setRaisedId(null)} />
        )}

        {/* Raised card — the one lifted card, draggable into a gap */}
        <div
          className="chrono-raised pointer-events-none absolute inset-x-0 z-50 flex justify-center"
        >
          {raised && (
            <RaisedCard
              key={raised.id}
              card={raised}
              faceUp={flippingRaised}
              draggable={!placing}
              invalidNonce={invalidNonce}
              reduce={!!reduce}
              compact={compact}
              onDrop={onDrop}
              onDragMove={(p) => {
                dragPoint.current = p
                setActiveTarget(resolveGapTarget(p))
              }}
              onDragActive={onDragActive}
            />
          )}
        </div>

        <p className="chrono-reel-instruction pointer-events-none absolute inset-x-0 z-40 text-center font-stub-label text-[9px] font-bold uppercase tracking-[0.1em] text-stub-navy">
          DRAG TO THE AMBER LINE · RELEASE TO PLACE
        </p>

        {/* Hand fan — tap a title to lift it */}
        <ChronoHand
          cards={hand}
          raisedId={raisedId}
          reduce={!!reduce}
          compact={compact}
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
              analytics={{ mode: 'chronology', kind: start.kind }}
              onReset={resetGame}
              onMenu={onExit}
            />
          )}
        </AnimatePresence>
      </div>
      </div>
    </MotionConfig>
  )
}

// ── the line gap / drop target ────────────────────────────────────────────────
// A thin slot that widens and shows a dashed insert bar while a card is raised, so
// every legal drop target is visible (a line of n cards shows n+1 of these).
const Gap = ({
  visible,
  selected,
  label,
  onPlace,
  setRef,
}: {
  visible: boolean
  selected: boolean
  label: string
  onPlace: () => void
  setRef: (el: HTMLDivElement | null) => void
}) => {
  const gesture = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  return (
    <div
      ref={setRef}
      data-gap
      data-gap-selected={selected || undefined}
      className="relative flex h-[142px] w-[14px] shrink-0 items-center justify-center"
    >
      <div
        className={`relative h-[88%] rounded-full transition-[width,background-color,opacity] ${
          selected ? 'w-[3px] bg-stub-amber opacity-100' : 'w-px bg-stub-slate-light opacity-70'
        } ${visible ? '' : '!opacity-0'}`}
      >
        {selected && (
          <>
            <span className="absolute -top-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[7px] border-x-transparent border-t-stub-amber" />
            <span className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[5px] border-b-[7px] border-x-transparent border-b-stub-amber" />
          </>
        )}
      </div>
      {visible && (
        <button
          type="button"
          aria-label={label}
          className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2"
          onPointerDown={(event) => {
            gesture.current = { x: event.clientX, y: event.clientY, moved: false }
          }}
          onPointerMove={(event) => {
            if (!gesture.current) return
            if (Math.hypot(event.clientX - gesture.current.x, event.clientY - gesture.current.y) > 8) {
              gesture.current.moved = true
            }
          }}
          onPointerCancel={() => {
            gesture.current = null
          }}
          onPointerUp={() => {
            const tap = gesture.current && !gesture.current.moved
            gesture.current = null
            if (tap) onPlace()
          }}
        />
      )}
    </div>
  )
}

// ── raised, draggable card (drag-to-place primitive, copied from Hand.tsx) ──────
function RaisedCard({
  card,
  faceUp,
  draggable,
  invalidNonce,
  reduce,
  compact,
  onDrop,
  onDragMove,
  onDragActive,
}: {
  card: ChronologyCard
  faceUp: boolean
  draggable: boolean
  invalidNonce: number
  reduce: boolean
  compact: boolean
  onDrop: (id: string, point: { x: number; y: number }) => void
  onDragMove: (point: { x: number; y: number }) => void
  onDragActive: (active: boolean) => void
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
      onDragStart={(_, info) => {
        onDragActive(true)
        onDragMove(info.point)
      }}
      onDrag={(_, info) => onDragMove(info.point)}
      onDragEnd={(_, info) => {
        onDragActive(false)
        onDrop(card.id, info.point)
      }}
    >
      <motion.div animate={controls}>
        <div className="rounded-stub-panel shadow-stub-glow-teal">
          <ChronoCardView card={card} faceUp={faceUp} size={compact ? 'raisedCompact' : 'raised'} />
        </div>
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
  compact,
  onRaise,
}: {
  cards: ChronologyCard[]
  raisedId: string | null
  reduce: boolean
  compact: boolean
  onRaise: (id: string) => void
}) {
  const spring = reduce
    ? ({ duration: 0.15 } as const)
    : ({ type: 'spring', stiffness: 380, damping: 30 } as const)
  const n = cards.length
  const cardWidth = compact ? 68 : FAN_CARD_W
  const spacing = Math.min(compact ? 36 : 42, (360 - cardWidth) / Math.max(n - 1, 1))

  return (
    <div
      className="chrono-hand absolute inset-x-0 bottom-0 z-30"
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
            className="absolute left-1/2"
            style={{ marginLeft: -cardWidth / 2, top: compact ? 2 : 10, zIndex: 10 + i, touchAction: 'none' }}
            animate={{
              x: off * spacing,
              y: Math.min(compact ? 8 : 26, Math.abs(off) ** 1.45 * (compact ? 2.2 : 3.5)),
            }}
            transition={spring}
            onTap={() => onRaise(c.id)}
          >
            <motion.div animate={{ rotate: off * 5 }} transition={spring}>
              <ChronoCardView card={c} faceUp={false} size={compact ? 'handCompact' : 'hand'} />
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
  analytics,
  onReset,
  onMenu,
}: {
  score: number
  strokes: number
  credits: number
  log: LogEntry[]
  daily: DailyFinish | null // streak readout — null on practice rounds
  analytics: EventData // mode identity for the share event (parent owns kind)
  onReset: () => void
  onMenu: () => void // back to the mode menu (W5d: every end screen routes home)
}) {
  const reduce = useReducedMotion()

  // Family share format: one glyph per placement, in placement order (clean 🟩 /
  // misfire 🟥), led by 🎬 like the other two modes.
  const emoji = '🎬' + log.map((p) => (p.result === 'misfire' ? '🟥' : '🟩')).join('')
  const text = shareText(score, strokes, credits, emoji)

  return (
    <motion.div
      className="absolute inset-0 z-[100] flex flex-col items-center overflow-y-auto bg-stub-cream/95 px-8 text-center"
      style={{
        backgroundImage: 'radial-gradient(rgba(31,58,82,.06) 1px, transparent 1.2px)',
        backgroundSize: '7px 7px',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: reduce ? 0.15 : 0.5, duration: reduce ? 0.15 : 0.35 }}
    >
      {/* my-auto column (the App.tsx menu fix): centers when it fits, scrolls
          instead of clipping when it doesn't (short viewports). */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 14 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        transition={
          reduce ? { delay: 0.2, duration: 0.15 } : { delay: 0.6, type: 'spring', stiffness: 260, damping: 22 }
        }
        className="my-auto flex w-full flex-col items-center py-6"
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

        <ShareCopy text={text} analytics={analytics} />

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
