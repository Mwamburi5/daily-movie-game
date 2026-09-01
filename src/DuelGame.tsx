import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { movieById } from './data/movies.ts'
import { DUEL_POOL } from './data/duelPool.ts'
import type { Movie } from './data/types.ts'
import { linkTier, sharedPeople, type LinkTier, type SharedPerson } from './lib/solver.ts'
import {
  GENRE_FLOOR,
  MELD_POINTS_PER_CARD,
  TARGET_SCORE,
  TIER_POINTS,
  WILD_IDS,
  WILD_MOVIES,
  bestMeld,
  canLayOff,
  connectivity,
  cpuTossOrKeep,
  creditNames,
  deal,
  forcedWildDraw,
  isValidMeld,
  isWild,
  ladderPtsPerCard,
  meldCommon,
  meldRungName,
  mostConnectiveTop,
  topForLinking,
  wildMovie,
  type Deal,
  type Meld,
} from './lib/duel.ts'
import {
  type Difficulty,
  DIFFICULTY_META,
  KNOBS,
  banksMeld,
  bestPilePlay,
  hintCard,
  knownLegalPlays,
  knownShared,
  ladderBestMeld,
  legalCardsAnyPile,
  mayRecast,
  meldGainFromTake,
  pickDraw,
  pickPlay,
  whiffs,
} from './lib/difficulty.ts'
import { hasSeenDragPlay, markDragPlaySeen, recordDuelFinish, type DuelMeta } from './lib/progress.ts'
import { track } from './lib/analytics.ts'
import { useJourneyAnalytics } from './lib/journeyAnalytics.ts'

// Resolve a card id to its Movie — wild or canonical.
const mv = (id: string): Movie => wildMovie(id) ?? movieById.get(id)!

// Deal a duel, then splice all wilds into the DRAW deck only (never the opening
// piles/hands) so they're drawn naturally — mirrors the sim's playGame seeding.
// d.deck[0] becomes the second Double Feature pile, so wilds go after it.
function dealDuel(): Deal {
  const d = deal(DUEL_POOL)
  const [pile2, ...rest] = d.deck
  let deck = rest
  for (const w of WILD_MOVIES) {
    const pos = Math.floor(Math.random() * (deck.length + 1))
    deck = [...deck.slice(0, pos), w.id, ...deck.slice(pos)]
  }
  return { ...d, deck: [pile2, ...deck] }
}

// Score + name a meld under the ladder ("highest rung wins"). `deep` = does the
// banker reason over hidden cast? The CPU's tier may; the human reads only the
// printed credits → false. Wilds score 0 and define no rung — filtered out first.
function ladderMeld(cards: Movie[], deep: boolean): { perCard: number; pts: number; rungName: string } {
  const reals = cards.filter((c) => !isWild(c.id))
  const perCard = ladderPtsPerCard(reals, deep, GENRE_FLOOR)
  return { perCard, pts: reals.length * perCard, rungName: meldRungName(reals, deep, GENRE_FLOOR) }
}
import StubCard from './components/StubCard.tsx'
import RecapReel from './components/RecapReel.tsx'
import DrawChoice from './components/DrawChoice.tsx'
import FixedDigits from './components/FixedDigits.tsx'
import { useDialogA11y } from './components/useDialogA11y.ts'
import Hand from './components/Hand.tsx'
import HowToPlay from './components/HowToPlay.tsx'
import Icon from './components/Icon.tsx'
import IdleCue from './components/IdleCue.tsx'
import MeldShelf, { meldLabel } from './components/MeldShelf.tsx'
import PlayBanner, { LastPlayLine } from './components/PlayBanner.tsx'
import ResultActions from './components/ResultActions.tsx'
import ResultMeaning from './components/ResultMeaning.tsx'
import RecastOffer from './components/RecastOffer.tsx'
import ScoreRace from './components/ScoreRace.tsx'
import ShareCopy from './components/ShareCopy.tsx'
import TazCorner from './components/TazCorner.tsx'
import TokenChips from './components/TokenChips.tsx'
import { matchCutShare } from './lib/share.ts'

type DuelStatus = 'playerTurn' | 'cpuTurn' | 'recastOffer' | 'over'
type EndReason = 'playerOut' | 'cpuOut' | 'stalemate' | 'target'
type E2EDuelFixture = 'ordinary-draw' | 'no-play-draw' | 'one-wild-draw' | 'multi-wild-draw' | 'take-ready'

interface Tokens {
  finalCut: boolean
  recast: boolean
}

// A CPU play held in suspense while the player decides whether to Recast it.
// pileIdx names which Double Feature top it lands on.
interface RecastOffer {
  id: string
  drew: boolean
  finalCut: boolean
  pileIdx: number
}

// An in-progress run: plays this turn so far, the person(s) carrying it, and the
// Double Feature pile it's building on (a run stays on the pile it started).
interface RunState {
  people: string[]
  count: number
  pileIdx: number
}

interface DuelBanner {
  who: 'You' | 'CPU'
  text: string
  tier: LinkTier | null
  points: number | null
  deep: boolean
  seq: number
}

// One line in the end-of-game recap reel — the game's story in highlights: every
// meld banked, every super link, every Final Cut, whoever pulled it off. Recorded
// as they happen (the banners are transient) so the recap can replay the match.
interface RecapEvent {
  who: 'You' | 'CPU'
  kind: 'meld' | 'super' | 'finalcut'
  text: string
  points: number
}

const linkText = (shared: SharedPerson[], seriesMatch: boolean, encore: boolean) => {
  const names = shared.map((s) => s.name)
  const base =
    names.length === 1
      ? `Connected via ${names[0]} (${shared[0].role})`
      : names.length === 2
        ? `Connected via ${names[0]} & ${names[1]}`
        : `Connected via ${names[0]}, ${names[1]} +${names.length - 2} more`
  return (seriesMatch ? 'Same series! ' : '') + base + (encore ? ' — play again!' : '')
}

// Move a card id to a new slot in the hand (manual long-press reorder).
function moveId(arr: string[], id: string, to: number): string[] {
  const from = arr.indexOf(id)
  if (from === -1 || from === to) return arr
  const next = [...arr]
  next.splice(from, 1)
  next.splice(to, 0, id)
  return next
}

// Auto-sort (Matinee crutch): greedy nearest-neighbour ordering so cards sharing
// people sit together (genre breaks ties) — links and melds line up visibly.
// Pure + presentational; never touches scoring, so it's off the sim contract.
function autoSortHand(ids: string[]): string[] {
  if (ids.length < 3) return ids
  const remaining = ids.map((id) => mv(id)!)
  const out = [remaining.shift()!]
  while (remaining.length) {
    const last = out[out.length - 1]
    let bestI = 0
    let bestScore = -1
    remaining.forEach((m, i) => {
      const score = sharedPeople(last, m).length * 2 + (m.genre === last.genre ? 0.5 : 0)
      if (score > bestScore) {
        bestScore = score
        bestI = i
      }
    })
    out.push(remaining.splice(bestI, 1)[0])
  }
  return out.map((m) => m.id)
}

export default function DuelGame({
  onExit,
  difficulty = 'matinee',
}: {
  onExit: () => void
  difficulty?: Difficulty
}) {
  // Coerced to a plain boolean: the forged Stub components (IdleCue,
  // PlayBanner, ScoreRace…) take `reduce: boolean`, not framer's `| null`.
  const reduce = useReducedMotion() ?? false
  const journey = useJourneyAnalytics({ mode: 'duel', difficulty })
  // 7e compact threshold: the SE class (≤700px tall) gets the one-row header
  // and ticket-strip booth; taller phones get the full 7a treatment. One JS
  // flag (not CSS hiding) because TazCorner's pips carry layoutId={id} —
  // rendering both variants would duplicate ids and break Framer's FLIPs.
  const [shortViewport, setShortViewport] = useState(
    () => window.matchMedia('(max-height: 700px)').matches,
  )
  const [wideViewport, setWideViewport] = useState(
    () => window.matchMedia('(min-width: 1024px)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-height: 700px)')
    const onChange = (e: MediaQueryListEvent) => setShortViewport(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = (e: MediaQueryListEvent) => setWideViewport(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  const k = KNOBS[difficulty]
  const hintBudget = DIFFICULTY_META[difficulty].hints
  const hintEnabled = hintBudget > 0
  // Auto-sort is the lowest-tier crutch only; every tier still reorders by hand.
  const autoSortEnabled = difficulty === 'matinee'
  // The loud take-to-meld aid (glowing marquee + big button + the Meld→pick-2
  // discovery path) is a Matinee-only teaching crutch. Higher tiers keep the
  // original subtle take button — the take RULE is unchanged on every tier.
  const takeGlowEnabled = difficulty === 'matinee'
  const [init] = useState(() => dealDuel())
  // Double Feature: two side-by-side marquees. The second is seeded from the deck
  // top (mirrors the sim's playGame). A play may land on either; a run stays on
  // the pile it started building.
  const [piles, setPiles] = useState<string[][]>(() => [[init.starterId], [init.deck[0]]])
  const [playerHand, setPlayerHand] = useState<string[]>(init.playerHand)
  const [cpuHand, setCpuHand] = useState<string[]>(init.cpuHand)
  const [deck, setDeck] = useState<string[]>(() => init.deck.slice(1))
  const [status, setStatus] = useState<DuelStatus>('playerTurn')
  const [endReason, setEndReason] = useState<EndReason | null>(null)
  const [playerScore, setPlayerScore] = useState(0)
  const [cpuScore, setCpuScore] = useState(0)
  // Consecutive deck-empty passes; two in a row ends the game
  const [passStreak, setPassStreak] = useState(0)
  // Card just drawn, awaiting the keep / toss / play decision
  const [pendingDraw, setPendingDraw] = useState<string | null>(null)
  // Draw-3: the revealed cards awaiting the player's pick (null = not choosing).
  // Normally one is kept. If wilds appear, every wild is kept and only reals burn.
  const [drawChoice, setDrawChoice] = useState<string[] | null>(null)
  const [playerTokens, setPlayerTokens] = useState<Tokens>({ finalCut: true, recast: true })
  const [cpuTokens, setCpuTokens] = useState<Tokens>({ finalCut: true, recast: true })
  const [fcArmed, setFcArmed] = useState(false)
  const [recastOffer, setRecastOffer] = useState<RecastOffer | null>(null)
  const [melds, setMelds] = useState<Meld[]>([])
  // The match's highlight reel for the end recap — appended to as melds/supers/
  // Final Cuts land (see logRecap). Reset each new game.
  const [recap, setRecap] = useState<RecapEvent[]>([])
  const [meldSelect, setMeldSelect] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [runState, setRunState] = useState<RunState | null>(null)
  const [cpuRun, setCpuRun] = useState<RunState | null>(null)
  const [faceUp, setFaceUp] = useState<ReadonlySet<string>>(() => new Set())
  const [raisedId, setRaisedId] = useState<string | null>(null)
  const [hintId, setHintId] = useState<string | null>(null)
  // When a hint points at a lay-off, this rings the target meld row too
  const [hintMeldId, setHintMeldId] = useState<number | null>(null)
  const [hintsLeft, setHintsLeft] = useState(hintBudget)
  const [invalidNonce, setInvalidNonce] = useState(0)
  // One-shot drag-to-play nudge (feedback batch 1): live until this device's
  // first drag lands on a target, then persisted off via markDragPlaySeen.
  const [dragNudge, setDragNudge] = useState(() => !hasSeenDragPlay())
  const [banner, setBanner] = useState<DuelBanner | null>(null)
  // Taz's last say() line, persisted for the booth nameplate — the banner
  // auto-nulls at 2400ms but the quote stays readable until his next line.
  const [lastCpuQuote, setLastCpuQuote] = useState('')
  // The 7a "last play" strip — persists the most recent move + its point delta
  // after the transient banner fades (display-only; the say() chokepoint feeds it,
  // so no new capture at the six scoring sites). null until the first move.
  const [lastPlay, setLastPlay] = useState<{
    text: string
    delta: { label: string; value: number } | null
  } | null>(null)
  const [superKey, setSuperKey] = useState(0) // drives the super-link flash + pile pulse
  const [deepKey, setDeepKey] = useState(0) // drives the deep-cut glow on the pile
  const [fxPile, setFxPile] = useState(0) // which Double Feature pile the super/deep fx plays on
  const [showRules, setShowRules] = useState(false)
  const [turnTick, setTurnTick] = useState(0) // re-arms the CPU effect for encores/runs
  // Lifetime plays/wins at this difficulty, for the end screen — set by the
  // finish effect. Meta-state only; no rule reads it (persistence guardrail).
  const [duelMeta, setDuelMeta] = useState<DuelMeta | null>(null)
  // One drop-zone ref per Double Feature pile; a dropped card routes to the pile it landed on
  const pileZoneRefs = useRef<(HTMLDivElement | null)[]>([null, null])
  const meldRowRefs = useRef(new Map<number, HTMLDivElement>())
  const lowerTimer = useRef<number | undefined>(undefined)
  const seq = useRef(0)
  const meldSeq = useRef(0)
  // Guards a recast offer so a held CPU play resolves at most once. A rapid
  // double-tap of Allow/Recast would otherwise re-enter the resolver from a
  // stale closure and append the same card twice (a conservation break).
  const resolvingOffer = useRef(false)

  // The LINKING top of each Double Feature pile — skips wilds (transparent on a
  // pile; the real card beneath shows through). index 0 = starter pile, 1 = second.
  const tops = piles.map((p) => topForLinking(p.map(mv)))
  const gameOver = status === 'over'
  // Game-over dialog behavior (§7·7b a11y): the overlay is inline-conditional,
  // so the hook keys off gameOver instead of mount. Trap-only — no Esc close.
  const gameOverDialogRef = useDialogA11y(undefined, gameOver)
  const drawnConnects =
    pendingDraw !== null &&
    tops.some((t) => sharedPeople(t, mv(pendingDraw)!).length > 0)
  const raisedMovie = raisedId !== null ? mv(raisedId)! : null
  const playerHandMovies = playerHand.map((id) => mv(id)!)
  const handHasMeld = bestMeld(playerHandMovies) !== null
  const playerHasImmediateAction =
    handHasMeld ||
    playerHandMovies.some((card) =>
      isWild(card.id) ||
      tops.some((top) => sharedPeople(top, card).length > 0) ||
      melds.some((meld) => canLayOff(card, meld)),
    )
  // Rummy take-to-meld: a pile top the player may lift to complete a meld the
  // hand can't bank alone (purposeful take only — no free hoarding). Blocked when
  // a wild covers the top, or it'd empty the last pile with no deck to reseed.
  const canTakeNow =
    status === 'playerTurn' &&
    pendingDraw === null &&
    drawChoice === null &&
    !meldSelect &&
    runState === null &&
    !handHasMeld
  const takeTop = (pileIdx: number): Movie | null => {
    if (!canTakeNow) return null
    const pile = piles[pileIdx]
    if (pile.length === 0 || isWild(pile[pile.length - 1])) return null
    if (pile.length === 1 && deck.length === 0) return null
    const T = tops[pileIdx]
    const after = bestMeld([...playerHandMovies, T])
    return after && after.length >= 3 && after.some((c) => c.id === T.id) ? T : null
  }
  const selectedMovies = [...selected].map((id) => mv(id)!)
  const selectionValid = isValidMeld(selectedMovies)
  // A 2-card same-genre pick with no person/series link is the "genre doesn't
  // connect" trap (feedback batch 1): the generic pick-more pill reads as a
  // rejection, so players conclude genre never links. Name the real blocker —
  // the genre floor (locked rule 2.3) — instead. Display-only; rule untouched.
  const selectedPairCommon =
    selectedMovies.length === 2 && !selectedMovies.some((c) => isWild(c.id))
      ? meldCommon(selectedMovies)
      : null
  const genrePairStuck =
    selectedPairCommon !== null &&
    selectedPairCommon.people.length === 0 &&
    selectedPairCommon.series === null &&
    selectedMovies[0].genre === selectedMovies[1].genre
  // Meld-mode discovery path: after tapping Meld and selecting 2 linked cards, a
  // marquee whose top would complete them into a valid 3-meld lights up — the
  // "pick two, the card glows, pick it up" flow. SAME take-to-meld rule (the card
  // enters your hand and the meld banks NEXT turn); this just surfaces it through
  // the Meld button so it's findable instead of hidden behind a tiny cue.
  const meldSelectTake = (pileIdx: number): Movie | null => {
    if (!takeGlowEnabled) return null // Matinee-only discovery aid
    if (!meldSelect || status !== 'playerTurn' || runState !== null) return null
    if (selectedMovies.length !== 2) return null
    const pile = piles[pileIdx]
    if (pile.length === 0 || isWild(pile[pile.length - 1])) return null
    if (pile.length === 1 && deck.length === 0) return null
    const T = tops[pileIdx]
    return isValidMeld([...selectedMovies, T]) ? T : null
  }
  // A marquee top the player may lift this turn — either the auto take-to-meld
  // (hand already holds 2 that this top completes) or the meld-mode selection
  // path above. Non-null entries glow so the pickup is obvious.
  const takeTargets = piles.map((_, i) => takeTop(i) ?? meldSelectTake(i))
  // A valid selection's locked rung name + points (player reads printed credits).
  const selectionMeld = selectionValid ? ladderMeld(selectedMovies, false) : null
  // Meld rows the raised card could lay off onto (drop targets light up)
  const layOffTargets = new Set(
    raisedMovie && pendingDraw === null && runState === null && status === 'playerTurn'
      ? melds.filter((m) => canLayOff(raisedMovie, m)).map((m) => m.id)
      : [],
  )
  // Light up the lay-off targets, plus the row a meld-hint is pointing at
  const meldHighlights =
    hintMeldId !== null ? new Set<number>([...layOffTargets, hintMeldId]) : layOffTargets
  // Presentation mirror of playerPlayPile's existing guards. This never feeds
  // the rules; it only tells a raised card which marquee targets to emphasize.
  const heldId = raisedId ?? pendingDraw
  const pilePlayTargets = piles.map((_, targetIdx) => {
    if (heldId === null || status !== 'playerTurn' || meldSelect) return false
    if (pendingDraw !== null && heldId !== pendingDraw) return false
    if (isWild(heldId)) return runState === null
    if (runState !== null && targetIdx !== runState.pileIdx) return false
    const targetTop = tops[targetIdx]
    const heldMovie = mv(heldId)!
    const shared = sharedPeople(targetTop, heldMovie)
    const viaFinalCut = shared.length === 0 && fcArmed && playerTokens.finalCut && runState === null
    const chainOk = runState === null || shared.some((credit) => runState.people.includes(credit.name))
    return viaFinalCut || (shared.length > 0 && chainOk)
  })
  const hasPilePlayTarget = pilePlayTargets.some(Boolean)
  const hasRaisedTarget = hasPilePlayTarget || layOffTargets.size > 0

  const say = (
    who: 'You' | 'CPU',
    text: string,
    tier: LinkTier | null = null,
    points: number | null = null,
    deep = false,
  ) => {
    setBanner({ who, text, tier, points, deep, seq: ++seq.current })
    // say() is the single chokepoint for all ~20 banner call sites, so the
    // booth quote AND the persistent "last play" strip both ride along here
    // rather than at each call site.
    if (who === 'CPU') setLastCpuQuote(text)
    // Persist the last play for the 7a strip. Body keeps the lowercase say()
    // voice verbatim (per LastPlayLine's contract); the delta is signed so the
    // opponent's gain paints red from the player's POV (CPU's points → negative).
    const who1 = who === 'You' ? 'YOU' : 'CPU'
    setLastPlay({
      text: `LAST · ${who1} ${text}`,
      delta:
        points != null && points !== 0
          ? { label: `${who1} +${points}`, value: who === 'You' ? points : -points }
          : null,
    })
  }

  // Record a highlight for the end-of-game recap reel.
  const logRecap = (e: RecapEvent) => setRecap((r) => [...r, e])

  const endGame = (reason: EndReason) => {
    setEndReason(reason)
    setStatus('over')
  }

  const flipCard = (id: string) => {
    if (gameOver) return
    journey.action('flip', true)
    setFaceUp((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const removeFaceUp = (id: string) =>
    setFaceUp((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })

  // Difficulty-gated recast call (Matinee never; Feature only stops a game-out;
  // Director's Cut cancels a game-out or a catch-up super — the old fair-AI rule)
  const cpuWouldRecast = (wouldGoOut: boolean, isSuper: boolean) =>
    mayRecast(k, { wouldGoOut, isSuper, playerScore, cpuScore })

  const findMeldAt = (point: { x: number; y: number }): Meld | null => {
    for (const meld of melds) {
      const el = meldRowRefs.current.get(meld.id)
      if (!el) continue
      const r = el.getBoundingClientRect()
      const m = 14
      if (
        point.x >= r.left - m &&
        point.x <= r.right + m &&
        point.y >= r.top - m &&
        point.y <= r.bottom + m
      )
        return meld
    }
    return null
  }

  // Which Double Feature pile did a drop land on? The nearest marquee whose
  // padded zone contains the point, or null if it landed on neither.
  const pileAt = (point: { x: number; y: number }): number | null => {
    let hit: number | null = null
    let bestDist = Infinity
    pileZoneRefs.current.forEach((el, i) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      const m = 50
      const inside =
        point.x >= r.left - m &&
        point.x <= r.right + m &&
        point.y >= r.top - m &&
        point.y <= r.bottom + m
      if (!inside) return
      const dx = point.x - (r.left + r.right) / 2
      const dy = point.y - (r.top + r.bottom) / 2
      const d = dx * dx + dy * dy
      if (d < bestDist) {
        bestDist = d
        hit = i
      }
    })
    return hit
  }

  // A drag reached a target zone — the gesture is learned; retire the nudge
  // for good (even if the link itself misfires; C3 teaches the drag, not links).
  const dismissDragNudge = () => {
    if (!dragNudge) return
    setDragNudge(false)
    markDragPlaySeen()
  }

  const invalidShake = () => {
    setInvalidNonce((n) => n + 1)
    window.clearTimeout(lowerTimer.current)
    lowerTimer.current = window.setTimeout(
      () => setRaisedId((r) => (pendingDraw !== null ? r : null)),
      650,
    )
  }

  // ── Play cores (§7·7b a11y): geometry-free ─────────────────────────────────
  // playerPlay (further below) is the DRAG resolver — it hit-tests the drop
  // point, then lands here. The keyboard paths (pile-top / shelf-row Enter)
  // call these cores directly with explicit targets, so both input methods
  // share one rules path by construction.

  const playerLayOff = (id: string, meldHit: Meld) => {
    if (status !== 'playerTurn' || meldSelect) return
    // Lay-offs are barred mid-draw and mid-run (same conditions as the drop path)
    if (pendingDraw !== null || runState !== null) return
    const card = mv(id)!
    if (!canLayOff(card, meldHit)) {
      journey.action('play', false)
      journey.friction('invalid_play')
      // Keyboard-only feedback: the drag path never routes an ineligible row
      // here (it falls through to the pile hit-test instead).
      invalidShake()
      return
    }
    journey.action('play', true)
    dismissDragNudge()
    const newHand = playerHand.filter((h) => h !== id)
    setMelds((ms) =>
      ms.map((m) =>
        m.id === meldHit.id
          ? {
              ...m,
              cardIds: [...m.cardIds, id],
              people: m.people.filter((p) => creditNames(card).has(p)),
              series: card.series === m.series ? m.series : null,
            }
          : m,
      ),
    )
    const layoffPts = meldHit.rungPts ?? MELD_POINTS_PER_CARD // locked rung
    setPlayerHand(newHand)
    setPlayerScore((s) => s + layoffPts)
    setRaisedId(null)
    removeFaceUp(id)
    setPassStreak(0)
    setFcArmed(false)
    say('You', `added ${card.title} to the ${meldLabel(meldHit)} meld`, null, layoffPts)
    if (newHand.length === 0) endGame('playerOut')
    else setStatus('cpuTurn')
  }

  const playerPlayPile = (id: string, landed: number) => {
    if (status !== 'playerTurn' || meldSelect) return
    // After a draw, only the drawn card may be played (UNO rule)
    if (pendingDraw !== null && id !== pendingDraw) return
    const card = mv(id)!

    // A wild plays on any pile for +0 — the universal shed/unstick. It lands face
    // up but transparent (the real card beneath still links), no run, no lay-off.
    if (isWild(id) && runState === null) {
      journey.action('play', true)
      const landedWild = landed
      dismissDragNudge()
      const newHand = playerHand.filter((h) => h !== id)
      setPiles((ps) => ps.map((p, i) => (i === landedWild ? [...p, id] : p)))
      setFxPile(landedWild)
      setPlayerHand(newHand)
      setRaisedId(null)
      setPendingDraw(null)
      removeFaceUp(id)
      setPassStreak(0)
      setFcArmed(false)
      say('You', `played the wild — ${card.title} goes anywhere`)
      if (newHand.length === 0) endGame('playerOut')
      else setStatus('cpuTurn')
      return
    }

    // Route the play to the pile it targeted. Mid-run, the play stays on the
    // pile the run is building (a run can't hop marquees). The nudge retires on
    // reaching a target even if the link misfires (C3 teaches the gesture).
    dismissDragNudge()
    const pileIdx = runState !== null ? runState.pileIdx : landed
    const top = tops[pileIdx]

    const shared = sharedPeople(top, card)
    const viaFinalCut =
      shared.length === 0 && fcArmed && playerTokens.finalCut && runState === null
    // Mid-run, only cards chaining through the run's person are legal
    const chainOk = runState === null || shared.some((s) => runState.people.includes(s.name))
    const validPlay = viaFinalCut || (shared.length > 0 && chainOk)
    journey.action(viaFinalCut ? 'final_cut' : 'play', validPlay)
    if (!validPlay) {
      journey.friction('invalid_play')
      invalidShake()
      return
    }

    const tier = viaFinalCut ? null : linkTier(top, card, shared)
    const points = viaFinalCut ? 1 : TIER_POINTS[tier!]
    const newHand = playerHand.filter((h) => h !== id)
    const isSuper = tier === 'super'

    // CPU may Recast a super link or a Final Cut before it resolves
    if ((isSuper || viaFinalCut) && cpuTokens.recast && cpuWouldRecast(newHand.length === 0, isSuper)) {
      setCpuTokens((t) => ({ ...t, recast: false }))
      if (viaFinalCut) {
        setPlayerTokens((t) => ({ ...t, finalCut: false }))
        setFcArmed(false)
      }
      setRaisedId(null)
      setPendingDraw(null)
      setRunState(null)
      setPassStreak(0)
      say('CPU', `Recast! Your ${viaFinalCut ? 'Final Cut' : 'super link'} is canceled`)
      setStatus('cpuTurn')
      return
    }

    const seriesMatch = !viaFinalCut && !!(top.series && top.series === card.series)
    const encore = isSuper && newHand.length > 0
    const played = (runState?.count ?? 0) + 1
    const linkNames = shared.map((s) => s.name)
    const runPeople = runState
      ? runState.people.filter((p) => linkNames.includes(p))
      : linkNames
    const canChain =
      !viaFinalCut &&
      !encore &&
      played < 3 &&
      newHand.some((h) =>
        sharedPeople(card, mv(h)!).some((sp) => runPeople.includes(sp.name)),
      )

    setPiles((ps) => ps.map((p, i) => (i === pileIdx ? [...p, id] : p)))
    setFxPile(pileIdx)
    setPlayerHand(newHand)
    setPlayerScore((s) => s + points)
    setRaisedId(null)
    setPendingDraw(null)
    removeFaceUp(id)
    setPassStreak(0)
    if (viaFinalCut) {
      setPlayerTokens((t) => ({ ...t, finalCut: false }))
      setFcArmed(false)
      say('You', `Final Cut! ${card.title} hits the pile`, null, points)
      logRecap({ who: 'You', kind: 'finalcut', text: `${card.title} — no link needed`, points })
    } else {
      // Deep cut: the whole connection runs through credits hidden on the cards
      const deepCut = shared.every((s) => s.deep)
      if (fcArmed) setFcArmed(false) // connected on its own — token not spent
      if (isSuper) setSuperKey((k) => k + 1)
      if (deepCut) setDeepKey((k) => k + 1)
      say(
        'You',
        (played >= 2 ? `Run ×${played}! ` : '') + linkText(shared, seriesMatch, encore),
        tier,
        points,
        deepCut,
      )
      if (isSuper)
        logRecap({
          who: 'You',
          kind: 'super',
          text: `${card.title} via ${seriesMatch ? 'the series' : linkNames.slice(0, 2).join(' & ') || 'the cast'}`,
          points,
        })
    }
    if (newHand.length === 0) {
      endGame('playerOut')
    } else if (encore) {
      setRunState(null) // encore is unrestricted — it supersedes the run
    } else if (canChain) {
      setRunState({ people: runPeople, count: played, pileIdx }) // turn continues on this pile
    } else {
      setRunState(null)
      setStatus('cpuTurn')
    }
  }

  // The DRAG resolver: map the drop point to a target, then run the shared
  // cores above. Semantics preserved verbatim from the pre-§7·7b single
  // function: wilds only land on piles; a drop on an ineligible meld row falls
  // through to the pile hit-test ("maybe they meant the pile just above").
  const playerPlay = (id: string, point: { x: number; y: number }) => {
    if (status !== 'playerTurn' || meldSelect) return
    if (pendingDraw !== null && id !== pendingDraw) return
    const card = mv(id)!

    if (isWild(id) && runState === null) {
      const landedWild = pileAt(point)
      if (landedWild === null) return
      playerPlayPile(id, landedWild)
      return
    }

    const meldHit = findMeldAt(point)
    if (meldHit && pendingDraw === null && runState === null && canLayOff(card, meldHit)) {
      playerLayOff(id, meldHit)
      return
    }

    const landed = pileAt(point)
    if (landed === null) return
    playerPlayPile(id, landed)
  }

  // Pointer, touch, and keyboard all share this target activation. With a held
  // card it enters the same play core as drag; without one it preserves the
  // marquee's established flip-for-credits behavior.
  const activatePile = (pileIdx: number, topId: string) => {
    const held = raisedId ?? pendingDraw
    if (held !== null) playerPlayPile(held, pileIdx)
    else flipCard(topId)
  }

  // Draw-3-keep-1: drawing reveals the top 3; the player taps one to keep (the
  // other 2 are burned, invisible per D1), then it enters the keep/toss/play flow.
  const playerDraw = () => {
    if (
      status !== 'playerTurn' ||
      pendingDraw !== null ||
      drawChoice !== null ||
      deck.length === 0 ||
      meldSelect ||
      runState !== null
    )
      return
    journey.action('draw', true)
    if (!playerHasImmediateAction) journey.friction('no_play_draw')
    const take = deck.slice(0, 3)
    setDeck(deck.slice(take.length))
    setDrawChoice(take)
    say('You', take.length >= 2 ? 'drew 3 — keep one' : 'drew a card')
  }

  // Player keeps one of the revealed cards; the rest leave play. The kept card
  // comes up raised for the usual keep / toss / play decision.
  // Wilds are kept, never burned (RULESET §11). If draw-3 reveals more than one,
  // every wild enters the hand; the tapped wild alone continues through the
  // normal keep/toss/play flow while its siblings remain held. Non-wilds burn.
  const playerPickDraw = (id: string) => {
    if (drawChoice === null) return
    journey.action('keep', true)
    const forced = forcedWildDraw(drawChoice, id)
    const keep = forced?.keep ?? id
    const keptIds = forced ? [forced.keep, ...forced.extras] : [keep]
    setDrawChoice(null)
    setPlayerHand((h) => [...h, ...keptIds])
    setPendingDraw(keep)
    setRaisedId(keep)
    say(
      'You',
      forced && forced.extras.length > 0
        ? `kept all ${forced.extras.length + 1} wilds — never burned`
        : forced
          ? 'kept the wild — never burned'
          : tops.some((t) => sharedPeople(t, mv(keep)!).length > 0)
            ? 'kept it — it connects!'
            : 'kept the card',
    )
  }

  // Take a pile's top into hand to complete a meld (banked NEXT turn — no
  // immediate play, so the take replaces the turn's draw). Reseeds an emptied
  // pile from the deck top so both Double Feature anchors survive.
  const doTakePile = (pileIdx: number) => {
    const T = takeTargets[pileIdx]
    if (!T) return
    journey.action('take', true)
    const reseed = piles[pileIdx].length === 1 && deck.length > 0
    setPiles((ps) => ps.map((p, i) => (i === pileIdx ? (reseed ? [deck[0]] : p.slice(0, -1)) : p)))
    if (reseed) setDeck((d) => d.slice(1))
    setPlayerHand((h) => [...h, T.id])
    setRaisedId(null)
    setFcArmed(false)
    setMeldSelect(false) // exit meld-mode if we took via the selection path
    setSelected(new Set())
    setPassStreak(0)
    say('You', `took ${T.title} — bank the meld next turn`)
    setStatus('cpuTurn')
  }

  const playerKeep = () => {
    if (pendingDraw === null) return
    journey.action('keep', true)
    setPendingDraw(null)
    setRaisedId(null)
    setFcArmed(false)
    setPassStreak(0)
    say('You', 'kept the card')
    setStatus('cpuTurn')
  }

  // Escape = the keyboard's tap-elsewhere (§7·7b a11y): lowers the raised card,
  // or keeps a pending draw — exactly the backdrop's onPointerDown. The ref
  // keeps the handler fresh without re-subscribing every render; dialogs
  // (rules/recast/draw picker) capture Escape first and stop propagation.
  const escActionRef = useRef<() => void>(() => {})
  escActionRef.current = () => (pendingDraw !== null ? playerKeep() : setRaisedId(null))
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') escActionRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Toss: the drawn card becomes the new pile top — no points, no connection
  // needed. The unstick mechanism, and a tactical brick for the opponent.
  const playerToss = () => {
    if (pendingDraw === null) return
    journey.action('toss', true)
    const id = pendingDraw
    // Bury the brick on the most-connective marquee (denial — degrades the CPU's
    // best top). With two Double Feature piles the toss needs a target.
    const seen = new Set([...piles.flat(), ...playerHand])
    const unseen = DUEL_POOL.filter((m) => !seen.has(m.id))
    const tgt = mostConnectiveTop(tops, unseen)
    setPlayerHand((h) => h.filter((c) => c !== id))
    setPiles((ps) => ps.map((p, i) => (i === tgt ? [...p, id] : p)))
    removeFaceUp(id)
    setPendingDraw(null)
    setRaisedId(null)
    setFcArmed(false)
    setPassStreak(0)
    say('You', `tossed ${mv(id)!.title} onto the pile`)
    setStatus('cpuTurn')
  }

  const playerPass = () => {
    if (
      status !== 'playerTurn' ||
      pendingDraw !== null ||
      drawChoice !== null ||
      deck.length > 0 ||
      meldSelect
    )
      return
    journey.action('pass', true)
    setRaisedId(null)
    setFcArmed(false)
    setRunState(null)
    const streak = passStreak + 1
    if (streak >= 2) {
      say('You', 'pass — game over')
      endGame('stalemate')
    } else {
      setPassStreak(streak)
      say('You', 'pass')
      setStatus('cpuTurn')
    }
  }

  const endRun = () => {
    if (runState === null) return
    setRunState(null)
    setRaisedId(null)
    setStatus('cpuTurn')
  }

  // Hint (Matinee/Feature): pulse one playable card so a beginner can find a
  // move without knowing every credit. Prefers a visible-credit link. Feature
  // rations them; a "nothing connects" answer costs nothing.
  const showHint = () => {
    if (
      !hintEnabled ||
      hintsLeft <= 0 ||
      status !== 'playerTurn' ||
      pendingDraw !== null ||
      meldSelect ||
      runState !== null
    )
      return
    journey.action('hint', true)
    // Consider both Double Feature tops: pulse the first card playable on either.
    let id: string | null = null
    for (const t of tops) {
      id = hintCard(t, playerHandMovies)
      if (id) break
    }
    // No pile play? A lay-off onto a banked meld is still a legal scoring move —
    // pulse the card and ring its target row so the hint never lies (RULESET §4.6).
    let meldId: number | null = null
    if (!id) {
      outer: for (const m of playerHandMovies) {
        for (const meld of melds) {
          if (canLayOff(m, meld)) {
            id = m.id
            meldId = meld.id
            break outer
          }
        }
      }
    }
    if (id) {
      setHintId(id)
      setHintMeldId(meldId)
      setHintsLeft((n) => n - 1)
    } else {
      setHintMeldId(null)
      say('You', 'nothing connects — draw or pass')
    }
  }

  const enterMeldSelect = () => {
    if (status !== 'playerTurn' || pendingDraw !== null || runState !== null) return
    journey.action('meld', true)
    setMeldSelect(true)
    setSelected(new Set())
    setRaisedId(null)
    setFcArmed(false)
  }

  const cancelMeldSelect = () => {
    setMeldSelect(false)
    setSelected(new Set())
  }

  const toggleSelect = (id: string) => {
    journey.action('select', true)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const bankMeld = () => {
    if (!selectionValid) return
    journey.action('meld', true)
    const ids = [...selected]
    const cards = ids.map((i) => mv(i)!)
    const reals = cards.filter((c) => !isWild(c.id)) // wilds: filler, score 0
    const { people, series } = meldCommon(reals)
    const { perCard, pts, rungName } = ladderMeld(cards, false)
    const meld: Meld = { id: ++meldSeq.current, cardIds: ids, people, series, rungPts: perCard, rungName }
    const newHand = playerHand.filter((h) => !selected.has(h))
    setMelds((ms) => [...ms, meld])
    setPlayerHand(newHand)
    setPlayerScore((s) => s + pts)
    setFaceUp((prev) => {
      const next = new Set(prev)
      ids.forEach((i) => next.delete(i))
      return next
    })
    setMeldSelect(false)
    setSelected(new Set())
    setPassStreak(0)
    say('You', `banked ${ids.length} films via ${meldLabel(meld)}`, null, pts)
    logRecap({ who: 'You', kind: 'meld', text: `${ids.length}-film ${meldLabel(meld)} meld`, points: pts })
    if (newHand.length === 0) endGame('playerOut')
    else setStatus('cpuTurn')
  }

  // Resolve a CPU play (immediately, or after the player allows it through a
  // recast offer). Reads current state — nothing moves while an offer is up.
  const resolveCpuPlay = ({ id, drew, finalCut, pileIdx }: RecastOffer) => {
    const top = tops[pileIdx]
    const pick = mv(id)!
    const handAfter = drew ? cpuHand : cpuHand.filter((c) => c !== id)
    const shared = sharedPeople(top, pick)
    const tier = finalCut ? null : linkTier(top, pick, shared)
    const points = finalCut ? 1 : TIER_POINTS[tier!]
    const seriesMatch = !finalCut && !!(top.series && top.series === pick.series)
    const encore = tier === 'super' && handAfter.length > 0
    const played = (cpuRun?.count ?? 0) + 1
    const linkNames = shared.map((s) => s.name)
    const runPeople = cpuRun ? cpuRun.people.filter((p) => linkNames.includes(p)) : linkNames
    const canChain =
      !finalCut &&
      !encore &&
      played < 3 &&
      handAfter.some((h) =>
        sharedPeople(pick, mv(h)!).some((sp) => runPeople.includes(sp.name)),
      )
    setPiles((ps) => ps.map((p, i) => (i === pileIdx ? [...p, id] : p)))
    setFxPile(pileIdx)
    setCpuHand(handAfter)
    setCpuScore((s) => s + points)
    setPassStreak(0)
    setRecastOffer(null)
    if (finalCut) {
      setCpuTokens((t) => ({ ...t, finalCut: false }))
      say('CPU', `Final Cut! ${pick.title} hits the pile`, null, points)
      logRecap({ who: 'CPU', kind: 'finalcut', text: `${pick.title} — no link needed`, points })
    } else {
      const deepCut = shared.every((s) => s.deep)
      if (tier === 'super') setSuperKey((k) => k + 1)
      if (deepCut) setDeepKey((k) => k + 1)
      say(
        'CPU',
        (drew ? 'drew & ' : '') +
          (played >= 2 ? `Run ×${played}! ` : '') +
          linkText(shared, seriesMatch, encore),
        tier,
        points,
        deepCut,
      )
      if (tier === 'super')
        logRecap({
          who: 'CPU',
          kind: 'super',
          text: `${pick.title} via ${seriesMatch ? 'the series' : linkNames.slice(0, 2).join(' & ') || 'the cast'}`,
          points,
        })
    }
    if (handAfter.length === 0) {
      endGame('cpuOut')
    } else if (encore) {
      setCpuRun(null)
      setStatus('cpuTurn')
      setTurnTick((n) => n + 1) // same status — re-arm the effect
    } else if (canChain) {
      setCpuRun({ people: runPeople, count: played, pileIdx })
      setStatus('cpuTurn')
      setTurnTick((n) => n + 1)
    } else {
      setCpuRun(null)
      setStatus('playerTurn')
    }
  }

  // A super link or Final Cut pauses for the player's Recast call first
  const cpuAttempt = (offer: RecastOffer, isSuper: boolean) => {
    if ((isSuper || offer.finalCut) && playerTokens.recast) {
      resolvingOffer.current = false // arm a fresh offer — unlock the guard
      setRecastOffer(offer)
      setStatus('recastOffer')
    } else {
      resolveCpuPlay(offer)
    }
  }

  const allowCpuPlay = () => {
    if (resolvingOffer.current || !recastOffer) return
    journey.action('recast', true)
    resolvingOffer.current = true
    resolveCpuPlay(recastOffer)
  }

  const playerRecast = () => {
    if (resolvingOffer.current || recastOffer === null) return
    journey.action('recast', true)
    resolvingOffer.current = true
    setPlayerTokens((t) => ({ ...t, recast: false }))
    if (recastOffer.finalCut) setCpuTokens((t) => ({ ...t, finalCut: false }))
    // A drawn card that never resolved goes into the CPU's hand
    if (recastOffer.drew) setCpuHand((h) => [...h, recastOffer.id])
    setRecastOffer(null)
    setCpuRun(null)
    setPassStreak(0)
    say('You', "Recast! CPU's play is canceled")
    setStatus('playerTurn')
  }

  // CPU turn: chain an open run, else bank a meld, else play points-greedy
  // (or lay off if that pays better), else draw, else Final Cut, else pass.
  useEffect(() => {
    if (status !== 'cpuTurn') return
    const t = window.setTimeout(() => {
      const handMovies = cpuHand.map((id) => mv(id)!)
      const unseenWith = (extra: string[]) => {
        const seen = new Set([...piles.flat(), ...cpuHand, ...extra])
        return DUEL_POOL.filter((m) => !seen.has(m.id))
      }
      // Draw-3: reveal the top 3, keep the best (pickDraw), burn the rest. Wilds
      // are never burned: return one for this turn and hold any additional wilds.
      const draw3 = () => {
        const take = deck.slice(0, 3)
        setDeck(deck.slice(take.length))
        const forced = forcedWildDraw(take)
        if (forced) {
          if (forced.extras.length > 0) setCpuHand((h) => [...h, ...forced.extras])
          return forced.keep
        }
        const { keep } = pickDraw(take.map((id) => mv(id)!), tops, k, unseenWith(take))
        return keep.id
      }
      // Plays the CPU can "see" on EITHER Double Feature top (Matinee reads only visible credits)
      const legalAll = legalCardsAnyPile(tops, handMovies, k)

      // Mid-run: stay on the run's pile; only same-person chains there count
      if (cpuRun) {
        const runTop = tops[cpuRun.pileIdx]
        const chain = knownLegalPlays(runTop, handMovies, k).filter((c) =>
          knownShared(runTop, c, k).some((sp) => cpuRun.people.includes(sp.name)),
        )
        if (chain.length > 0) {
          const pick = pickPlay(runTop, chain, unseenWith([]), k)
          const isSuper = linkTier(runTop, pick, sharedPeople(runTop, pick)) === 'super'
          cpuAttempt({ id: pick.id, drew: false, finalCut: false, pileIdx: cpuRun.pileIdx }, isSuper)
        } else {
          setCpuRun(null)
          setStatus('playerTurn')
        }
        return
      }

      // Bank the highest-VALUE meld the CPU can see (size × ladder rung) — it
      // chases auteur rows. Matinee may miss it; Feature banks lazily.
      const meldable = ladderBestMeld(handMovies, k, GENRE_FLOOR, true)
      if (meldable && banksMeld(meldable.length, legalAll.length > 0, k)) {
        const reals = meldable.filter((c) => !isWild(c.id))
        const { people, series } = meldCommon(reals)
        const { perCard, pts, rungName } = ladderMeld(meldable, k.deepMelds)
        const meld: Meld = {
          id: ++meldSeq.current,
          cardIds: meldable.map((m) => m.id),
          people,
          series,
          rungPts: perCard,
          rungName,
        }
        const handAfter = cpuHand.filter((id) => !meld.cardIds.includes(id))
        setMelds((ms) => [...ms, meld])
        setCpuHand(handAfter)
        setCpuScore((s) => s + pts)
        setPassStreak(0)
        say('CPU', `banked ${meldable.length} films via ${meldLabel(meld)}`, null, pts)
        logRecap({ who: 'CPU', kind: 'meld', text: `${meldable.length}-film ${meldLabel(meld)} meld`, points: pts })
        if (handAfter.length === 0) endGame('cpuOut')
        else setStatus('playerTurn')
        return
      }

      // Cheapest brick that fits an open meld, if any
      let layoff: { card: (typeof handMovies)[number]; meld: Meld } | null = null
      if (melds.length > 0) {
        const unseen = unseenWith([])
        let bestConn = Infinity
        for (const c of handMovies) {
          for (const meld of melds) {
            if (canLayOff(c, meld)) {
              const conn = connectivity(c, unseen)
              if (conn < bestConn) {
                bestConn = conn
                layoff = { card: c, meld }
              }
            }
          }
        }
      }
      const doLayoff = ({ card, meld }: NonNullable<typeof layoff>) => {
        const handAfter = cpuHand.filter((id) => id !== card.id)
        setMelds((ms) =>
          ms.map((mm) =>
            mm.id === meld.id
              ? {
                  ...mm,
                  cardIds: [...mm.cardIds, card.id],
                  people: mm.people.filter((p) => creditNames(card).has(p)),
                  series: card.series === mm.series ? mm.series : null,
                }
              : mm,
          ),
        )
        const layoffPts = meld.rungPts ?? MELD_POINTS_PER_CARD // locked rung
        setCpuHand(handAfter)
        setCpuScore((s) => s + layoffPts)
        setPassStreak(0)
        say('CPU', `added ${card.title} to the ${meldLabel(meld)} meld`, null, layoffPts)
        if (handAfter.length === 0) endGame('cpuOut')
        else setStatus('playerTurn')
      }
      // Play a wild for +0 onto pile 0 — go out on a lone wild, or shed to unstick.
      const cpuPlayWild = () => {
        const wildId = cpuHand.find(isWild)!
        const handAfter = cpuHand.filter((id) => id !== wildId)
        setPiles((ps) => ps.map((p, i) => (i === 0 ? [...p, wildId] : p)))
        setCpuHand(handAfter)
        setPassStreak(0)
        say('CPU', 'played a wild')
        if (handAfter.length === 0) endGame('cpuOut')
        else setStatus('playerTurn')
      }
      // Rummy take-to-meld: a pile top that completes a meld the hand can't bank
      // alone. Blocked when a wild covers the top, or when it'd empty the last pile
      // with no deck to reseed. Picks the largest resulting meld.
      const cpuTakeTop = (): { card: Movie; meldN: number; pileIdx: number } | null => {
        let best: { card: Movie; meldN: number; pileIdx: number } | null = null
        piles.forEach((pile, i) => {
          if (pile.length === 0 || isWild(pile[pile.length - 1])) return
          if (pile.length === 1 && deck.length === 0) return
          const T = tops[i]
          const meldN = meldGainFromTake(handMovies, T, k)
          if (meldN > 0 && (!best || meldN > best.meldN)) best = { card: T, meldN, pileIdx: i }
        })
        return best
      }
      // Lift a pile top into the CPU's hand (no immediate play — turn ends).
      // Reseeds an emptied pile from the deck top so the standing row is preserved.
      const doCpuTake = ({ card, pileIdx }: { card: Movie; pileIdx: number }) => {
        const reseed = piles[pileIdx].length === 1 && deck.length > 0
        setPiles((ps) => ps.map((p, i) => (i === pileIdx ? (reseed ? [deck[0]] : p.slice(0, -1)) : p)))
        if (reseed) setDeck((d) => d.slice(1))
        setCpuHand((h) => [...h, card.id])
        setPassStreak(0)
        say('CPU', `took ${card.title} from the marquee`)
        setStatus('playerTurn')
      }

      // A casual rival sometimes overlooks a playable link and just draws
      if (legalAll.length > 0 && whiffs(k)) {
        if (deck.length > 0) {
          const drawn = draw3()
          setCpuHand((h) => [...h, drawn])
          setPassStreak(0)
          say('CPU', 'drew a card')
          setStatus('playerTurn')
        } else {
          const streak = passStreak + 1
          if (streak >= 2) {
            say('CPU', 'passes — game over')
            endGame('stalemate')
          } else {
            setPassStreak(streak)
            say('CPU', 'passes')
            setStatus('playerTurn')
          }
        }
        return
      }

      const fcWinsNow =
        cpuTokens.finalCut &&
        cpuHand.length === 1 &&
        cpuScore + 1 > playerScore - playerHand.length

      // Best (card, pile) across both tops, per the CPU's policy. Non-null iff a
      // legal play exists on some top — equivalent to the old legalAll>0 guard.
      const bpp = legalAll.length > 0 ? bestPilePlay(tops, handMovies, unseenWith([]), k) : null
      const bppTier = bpp ? linkTier(tops[bpp.pileIdx], bpp.card, sharedPeople(tops[bpp.pileIdx], bpp.card)) : null
      // Forgo a weak play to take a meld-completing top (banked next turn). Skip if
      // a super (+4 + encore) or a winning Final Cut is on the table — those outrank
      // a one-turn-delayed meld. Same meld-miss knob gates the commit.
      const tmeld = cpuTakeTop()
      if (tmeld && !fcWinsNow && bppTier !== 'super' && banksMeld(tmeld.meldN, legalAll.length > 0, k)) {
        doCpuTake(tmeld)
      } else if (bpp) {
        if (layoff && TIER_POINTS[bppTier!] < (layoff.meld.rungPts ?? MELD_POINTS_PER_CARD)) {
          doLayoff(layoff) // a lay-off worth more than this play's points wins
        } else {
          cpuAttempt(
            { id: bpp.card.id, drew: false, finalCut: false, pileIdx: bpp.pileIdx },
            bppTier === 'super',
          )
        }
      } else if (fcWinsNow) {
        // Final Cut: go out on the last card (any link) and lock a winning net.
        cpuAttempt({ id: cpuHand[0], drew: false, finalCut: true, pileIdx: 0 }, false)
      } else if (layoff) {
        doLayoff(layoff)
      } else if (cpuHand.length === 1 && isWild(cpuHand[0])) {
        cpuPlayWild() // go out on a lone wild rather than hold dead weight
      } else if (deck.length > 0) {
        const drawn = draw3()
        const drawnMovie = mv(drawn)!
        // Which top does the drawn card best connect to (the CPU's view)?
        let dpile = -1
        let dpts = -1
        tops.forEach((t, i) => {
          const sh = knownShared(t, drawnMovie, k)
          if (sh.length > 0) {
            const pts = TIER_POINTS[linkTier(t, drawnMovie, sh)]
            if (pts > dpts) {
              dpts = pts
              dpile = i
            }
          }
        })
        if (dpile >= 0) {
          const playTop = tops[dpile]
          const isSuper = linkTier(playTop, drawnMovie, sharedPeople(playTop, drawnMovie)) === 'super'
          cpuAttempt({ id: drawn, drew: true, finalCut: false, pileIdx: dpile }, isSuper)
        } else {
          // Connects nowhere: a drawn wild is always kept (universal filler);
          // otherwise bury the brick on the most-connective top (denial) or keep it.
          const tgt = mostConnectiveTop(tops, unseenWith([drawn]))
          const toss = !isWild(drawn) && cpuTossOrKeep(drawnMovie, tops[tgt], unseenWith([drawn])) === 'toss'
          if (toss) {
            setPiles((ps) => ps.map((p, i) => (i === tgt ? [...p, drawn] : p)))
            say('CPU', `drew & tossed ${drawnMovie.title} onto the pile`)
          } else {
            setCpuHand((h) => [...h, drawn])
            say('CPU', isWild(drawn) ? 'drew a wild' : 'drew a card')
          }
          setPassStreak(0)
          setStatus('playerTurn')
        }
      } else if (cpuTokens.finalCut) {
        // Deck empty, no plays: dump the worst brick rather than pass (pile 0)
        const unseen = unseenWith([])
        let dump = cpuHand[0]
        let dumpScore = Infinity
        for (const id of cpuHand) {
          const c = connectivity(mv(id)!, unseen)
          if (c < dumpScore) {
            dumpScore = c
            dump = id
          }
        }
        cpuAttempt({ id: dump, drew: false, finalCut: true, pileIdx: 0 }, false)
      } else if (cpuHand.some(isWild)) {
        cpuPlayWild() // truly stuck (deck empty, no play): shed a wild, not a pass
      } else {
        const streak = passStreak + 1
        if (streak >= 2) {
          say('CPU', 'passes — game over')
          endGame('stalemate')
        } else {
          setPassStreak(streak)
          say('CPU', 'passes')
          setStatus('playerTurn')
        }
      }
    }, reduce ? 400 : 950)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, turnTick])

  // Banner auto-dismiss
  useEffect(() => {
    if (!banner) return
    const t = window.setTimeout(() => setBanner(null), 2400)
    return () => window.clearTimeout(t)
  }, [banner])

  // Hint pulse fades on its own, or the moment it's no longer the player's turn
  useEffect(() => {
    if (hintId === null) return
    if (status !== 'playerTurn') {
      setHintId(null)
      setHintMeldId(null)
      return
    }
    const t = window.setTimeout(() => {
      setHintId(null)
      setHintMeldId(null)
    }, 2600)
    return () => window.clearTimeout(t)
  }, [hintId, status])

  // Race to TARGET_SCORE: the instant either side's played score reaches the
  // target, the show ends — the winner is still whoever has the higher NET.
  // Mirrors the sim's per-turn target check; the CPU effect's cleanup cancels
  // any in-flight turn when status flips to 'over', so a crossing isn't overrun.
  useEffect(() => {
    if (status !== 'over' && (playerScore >= TARGET_SCORE || cpuScore >= TARGET_SCORE)) {
      endGame('target')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerScore, cpuScore])

  const newGame = () => {
    journey.replay()
    window.clearTimeout(lowerTimer.current)
    const d = dealDuel()
    setPiles([[d.starterId], [d.deck[0]]])
    setPlayerHand(d.playerHand)
    setCpuHand(d.cpuHand)
    setDeck(d.deck.slice(1))
    setFxPile(0)
    setStatus('playerTurn')
    setEndReason(null)
    setPlayerScore(0)
    setCpuScore(0)
    setPassStreak(0)
    setPendingDraw(null)
    setDrawChoice(null)
    setPlayerTokens({ finalCut: true, recast: true })
    setCpuTokens({ finalCut: true, recast: true })
    setFcArmed(false)
    setRecastOffer(null)
    resolvingOffer.current = false
    setMelds([])
    setRecap([])
    setMeldSelect(false)
    setSelected(new Set())
    setRunState(null)
    setCpuRun(null)
    meldSeq.current = 0
    meldRowRefs.current.clear()
    setFaceUp(new Set())
    setRaisedId(null)
    setHintId(null)
    setHintMeldId(null)
    setHintsLeft(hintBudget)
    setBanner(null)
    setLastPlay(null)
  }

  // Net score: points played minus a point per card still in hand
  const playerNet = playerScore - playerHand.length
  const cpuNet = cpuScore - cpuHand.length
  const winner = playerNet > cpuNet ? 'player' : cpuNet > playerNet ? 'cpu' : 'draw'

  // Every finished duel counts toward the per-difficulty record (no daily to
  // gate on — replays ARE the return signal). newGame resets status, so the
  // next finish records its own game.
  useEffect(() => {
    if (!gameOver) return
    // winner is the derived net comparison above — 'draw' already exists there,
    // so the result field costs no new state
    track('mode_finish', {
      mode: 'duel',
      difficulty,
      result: winner === 'player' ? 'won' : winner === 'cpu' ? 'lost' : 'draw',
    })
    setDuelMeta(recordDuelFinish(difficulty, winner === 'player'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver])
  // Who crossed the finish line first (race-to-target end copy)
  const racerLabel =
    playerScore >= TARGET_SCORE && cpuScore >= TARGET_SCORE
      ? 'Both sides'
      : playerScore >= TARGET_SCORE
        ? 'You'
        : 'CPU'
  const offerMovie = recastOffer ? mv(recastOffer.id)! : null

  // Deterministic browser-only states for the release gate. Each fixture uses
  // real cards and the real rule helpers; it controls only which valid state is
  // presented so coverage cannot depend on Math.random(). The dead VITE_E2E
  // branch and these marker strings are erased from a normal production build.
  const applyE2EFixture = (fixture: E2EDuelFixture) => {
    if (import.meta.env.VITE_E2E !== '1') return
    const quietHand = [
      'the-return-of-the-king',
      'mission-impossible-2',
      'the-hurt-locker',
      'children-of-men',
      'nightcrawler',
      'avengers-infinity-war',
      'fight-club',
    ]
    const noPlayHand = [
      'the-departed',
      'inception',
      'the-dark-knight',
      'pulp-fiction',
      'inglourious-basterds',
      'forrest-gump',
      'jurassic-park',
    ]
    const nextPiles = fixture === 'take-ready'
      ? [['heat', 'goodfellas'], ['alien']]
      : [['heat'], ['alien']]
    const nextPlayerHand = fixture === 'take-ready'
      ? ['casino', 'the-irishman']
      : fixture === 'no-play-draw'
        ? noPlayHand
        : quietHand
    const forcedDraw = fixture === 'ordinary-draw' || fixture === 'no-play-draw'
      ? ['goodfellas', 'casino', 'taxi-driver']
      : fixture === 'one-wild-draw'
        ? [WILD_IDS[0], 'goodfellas', 'casino']
        : fixture === 'multi-wild-draw'
          ? [WILD_IDS[3], WILD_IDS[4], WILD_IDS[0]]
          : []
    const used = new Set([...nextPiles.flat(), ...nextPlayerHand, ...forcedDraw])
    const remaining = [...DUEL_POOL.map((movie) => movie.id), ...WILD_IDS].filter((id) => !used.has(id))
    const nextCpuHand = remaining.slice(0, 7)
    nextCpuHand.forEach((id) => used.add(id))

    setPiles(nextPiles)
    setPlayerHand(nextPlayerHand)
    setCpuHand(nextCpuHand)
    setDeck([...forcedDraw, ...remaining.filter((id) => !used.has(id))])
    setStatus('playerTurn')
    setEndReason(null)
    setPlayerScore(0)
    setCpuScore(0)
    setPassStreak(0)
    setPendingDraw(null)
    setDrawChoice(null)
    setMelds([])
    setMeldSelect(false)
    setSelected(new Set())
    setRunState(null)
    setCpuRun(null)
    setRaisedId(null)
    setHintId(null)
    setHintMeldId(null)
    setBanner(null)
    setLastPlay(null)
    setLastCpuQuote('')
  }

  // Hint pill label ("HINT · PACINO"): hintCard returns an id only, so name the
  // shared person here. Only label a genuine pile link — a lay-off-only hint
  // (hintMeldId set, no shared pile top) shows the pulse alone rather than lie
  // about a name that isn't on the pile.
  const hintLabel = (() => {
    if (hintId === null) return undefined
    const hm = mv(hintId)
    if (!hm) return undefined
    for (const t of tops) {
      const sp = sharedPeople(t, hm)
      if (sp.length > 0) return `HINT · ${sp[0].name.split(' ').pop()!.toUpperCase()}`
    }
    return undefined
  })()

  // End recap: your highlights and a one-line read on how the match went.
  const yourMelds = recap.filter((e) => e.who === 'You' && e.kind === 'meld').length
  const yourSupers = recap.filter((e) => e.who === 'You' && e.kind === 'super').length
  const recapHeadline =
    Math.abs(playerNet - cpuNet) <= 2
      ? 'A photo finish.'
      : winner === 'player'
        ? 'You ran the marquee.'
        : winner === 'cpu'
          ? 'The CPU had your number.'
          : 'Dead even.'
  const recapSummary = `You banked ${yourMelds} meld${yourMelds === 1 ? '' : 's'}${
    yourSupers > 0 ? ` · ${yourSupers} super link${yourSupers === 1 ? '' : 's'}` : ''
  }.`

  // Family share format (see lib/share.ts). Duel's emoji row is the highlight
  // reel in order — 🟩 your moment, 🟥 the CPU's — so the shape of the match
  // travels like Solo/Chronology's rows do. Net is the number that decides, so
  // net is the number we share.
  const shareResult = winner === 'player' ? 'won' : winner === 'cpu' ? 'lost' : 'draw'
  const shareEmoji = '🎬' + recap.map((e) => (e.who === 'You' ? '🟩' : '🟥')).join('')
  const shareDuel = matchCutShare(
    'Duel',
    `${shareResult} vs ${DIFFICULTY_META[difficulty].label} · net ${playerNet} to ${cpuNet}`,
    shareEmoji,
  )

  return (
    <div className="duel-stage-shell relative h-full overflow-hidden bg-stub-cream">
      {/* ── Desktop theater (lg+ only) ────────────────────────────────────────
          Kills the 420px letterbox: the phone column becomes a LIT SCREEN
          mounted in a navy movie house, the dead margin becomes an ambient
          stage (UI-PRD §4.2 "ambient backdrop that sets a scene", "play area
          centered and breathing"). Cards keep their size — the TABLE scales,
          not the cards. Every layer here is `hidden lg:block` and behind the
          column, so mobile renders NONE of it and the phone layout is byte-
          identical. EXTRAPOLATED (no desktop reference PNG); the shelf-as-
          side-rail ask is deferred — relocating the shelf/booth would move the
          load-bearing absolute layout on the single-writer file (§2.5). */}
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            'radial-gradient(120% 85% at 50% -4%, rgba(207,149,42,.18), transparent 52%),' +
            'radial-gradient(80% 65% at 50% 44%, #22405a, #16293a 80%),' +
            '#122032',
        }}
      >
        {/* cream-on-navy dot texture (the README navy-inset recipe) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(rgba(240,235,216,.055) 1px, transparent 1.2px)',
            backgroundSize: '6px 6px',
          }}
        />
        {/* vignette so the lit screen reads against the house */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(72% 62% at 50% 46%, transparent 54%, rgba(0,0,0,.4))' }}
        />
      </div>

      {/* Marquee-bulb frame hugging the screen (lg+ only), centred on the
          420px column so a rail of amber bulbs runs down each side — the
          cinema-marquee motif that gives the table a home. */}
      <div className="duel-marquee-frame pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 lg:block">
        {(['left-0', 'right-0'] as const).map((side) => (
          <div
            key={side}
            className={`absolute ${side} top-0 h-full w-[7px]`}
            style={{
              background:
                'repeating-linear-gradient(to bottom, rgba(207,149,42,.85) 0 5px, transparent 5px 22px)',
              filter: 'drop-shadow(0 0 4px rgba(207,149,42,.55))',
            }}
          />
        ))}
      </div>

      {/* Flex-zone board (Stub Wave A): the top stack flows, a flex-1 band
          absorbs height differences (banner/cue anchor inside it), and the
          shelf rides above the fan reservation — no fixed-pixel tops, so
          667px-class phones compress the band instead of colliding zones.
          pb reserves the hand fan's overlay height (Hand is h-[225px]).
          lg: the column gains its own cream surface + a warm ring and a big
          soft shadow so it reads as a lit screen on the theater — on mobile
          none of the lg: classes apply, so the board still inherits the outer
          cream exactly as before. */}
      <div className="app-shell duel-board relative mx-auto flex h-full w-full max-w-[420px] flex-col pb-[225px] lg:bg-stub-cream lg:shadow-[0_0_64px_rgba(0,0,0,.5)] lg:ring-1 lg:ring-stub-amber/20" data-mode-stage="duel">
        {/* 7a navy header: nav row + the race-to-20 block. Bottom corners
            only per the token sheet (rounded-b, never the top). ScoreRace owns
            scores/caption/bar/target-hint — and the data-score/data-turn
            attrs, in their NEW value-carrying shape (ui-contracts Appendix
            A4). */}
        <header
          className={`app-shell-header duel-header relative bg-stub-navy px-4 ${
            shortViewport ? 'pb-2 pt-1' : 'pb-3.5 pt-3'
          }`}
        >
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Back to menu"
              onClick={onExit}
              className="app-back-button daily-icon-button text-stub-cream/80 active:scale-90"
            >
              <Icon name="back" size={24} />
            </button>
            {shortViewport ? (
              /* 7e one-row header: the compact race replaces the wordmark —
                 scores at each end, no labels, no caption/target lines. */
              <ScoreRace
                playerScore={playerScore}
                cpuScore={cpuScore}
                status={status}
                runState={runState}
                gameOver={gameOver}
                TARGET_SCORE={TARGET_SCORE}
                compact
              />
            ) : (
              <span className="font-stub-display text-lg font-bold tracking-tight text-stub-cream">
                Duel
              </span>
            )}
            <button
              type="button"
              aria-label="How to play"
              data-rules-open
              onClick={() => {
                journey.helpOpen(gameOver ? 'result' : 'playing')
                setShowRules(true)
              }}
              className="app-help-button daily-icon-button ml-2 active:scale-90"
            >
              <Icon name="help" size={20} />
            </button>
          </div>
          {!shortViewport && (
            <ScoreRace
              playerScore={playerScore}
              cpuScore={cpuScore}
              status={status}
              runState={runState}
              gameOver={gameOver}
              TARGET_SCORE={TARGET_SCORE}
            />
          )}
          <span className="app-shell-header-tab" aria-hidden="true" />
        </header>

        {/* 7a "last play" strip — persistent readout of the most recent move,
            distinct from the transient banner mid-board. Sits directly under the
            score header per the reference; hidden until the first move. */}
        {lastPlay && (
          <div className={`duel-last-play ${shortViewport ? 'mt-1' : 'mt-1.5'}`}>
            <LastPlayLine text={lastPlay.text} delta={lastPlay.delta} />
          </div>
        )}

        {/* Taz's booth (7a paper diorama). The old card-back pip row is fully
            retired HERE — TazCorner re-renders the pips under the same
            layoutId={id} namespace, so the collapse FLIP carries over
            (keeping both blocks would duplicate layoutIds and silently break
            Framer's cross-zone card animations). Booth owns the CPU token
            pills (W0d ruling). */}
        <div className={`duel-cpu-booth relative z-[var(--z-resting)] mx-3 ${shortViewport ? 'mt-2' : 'mt-3'}`}>
          <TazCorner
            cpuHand={cpuHand}
            cpuTokens={cpuTokens}
            quote={lastCpuQuote}
            compact={shortViewport}
            warn={cpuHand.length === 1 && !gameOver}
          />
        </div>

        {/* Draw deck + the two Double Feature marquees */}
        <section
          className={`duel-play-stage relative mt-3 flex items-start justify-center gap-4 ${
            raisedId !== null || pendingDraw !== null ? 'z-auto' : 'z-[var(--z-resting)]'
          }`}
        >
          <button
            type="button"
            aria-label={deck.length > 0 ? 'Draw a card' : 'Pass turn'}
            onClick={deck.length > 0 ? playerDraw : playerPass}
            disabled={
              status !== 'playerTurn' ||
              pendingDraw !== null ||
              drawChoice !== null ||
              meldSelect ||
              runState !== null
            }
            className="relative mt-[33px] h-[120px] w-[80px] disabled:opacity-40"
            data-deck
          >
            {deck.length > 0 ? (
              <>
                {/* Stub ticket-back deck: navy card with a dashed cream inner
                    frame (mirrors StubCard's face-down back), the remaining count
                    in Domine, and a vertical DECK mark. A second offset card
                    behind reads as a stack. */}
                <div
                  className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-stub-card"
                  style={{ background: 'rgba(31,58,82,.28)' }}
                />
                <div className="absolute inset-0 box-border flex items-center justify-center rounded-stub-card border-2 border-solid border-stub-navy bg-stub-navy p-1.5">
                  <div
                    className="flex h-full w-full items-center justify-center gap-1 rounded-[8px] border border-dashed"
                    style={{ borderColor: 'rgba(240,235,216,.5)' }}
                  >
                    <span
                      className="font-stub-label font-bold uppercase text-stub-cream/70"
                      style={{ writingMode: 'vertical-rl', letterSpacing: '.18em', fontSize: 8 }}
                    >
                      DECK
                    </span>
                    {/* FixedDigits: the countdown ticks in Domine (no tnum) —
                        1ch digit boxes keep the DECK pair steady (§7·7b). */}
                    <span className="font-stub-display text-[22px] font-bold leading-none text-stub-cream">
                      <FixedDigits value={deck.length} />
                    </span>
                  </div>
                </div>
                <span className="absolute -bottom-6 inset-x-0 text-center font-stub-label text-[10px] font-bold uppercase tracking-wider text-stub-slate">
                  Draw
                </span>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-stub-card border-2 border-dashed border-stub-slate-light font-stub-label text-[11px] font-bold uppercase tracking-wider text-stub-slate">
                Pass
              </div>
            )}
          </button>

          {/* Two marquees — drop a card on either to play it there */}
          <div className="flex gap-3">
            {piles.map((p, idx) => {
              const tId = p[p.length - 1]
              const tMovie = mv(tId)!
              const unders = p.slice(0, -1).slice(-2)
              return (
                <div
                  key={idx}
                  ref={(el) => {
                    pileZoneRefs.current[idx] = el
                  }}
                  className={`relative ${
                    raisedId !== null || pendingDraw !== null ? 'z-[var(--z-traveling)]' : ''
                  } ${
                    heldId !== null
                      ? pilePlayTargets[idx]
                        ? 'duel-pile-target duel-pile-target--active'
                        : 'duel-pile-target duel-pile-target--blocked'
                      : ''
                  }`}
                  data-pile={idx}
                  data-play-target={`marquee-${idx + 1}`}
                  data-target-active={heldId !== null ? pilePlayTargets[idx] : undefined}
                >
                  {heldId !== null && pilePlayTargets[idx] && (
                    <span className="duel-pile-target-label" aria-hidden="true">
                      Tap or drag
                    </span>
                  )}
                  {unders.map((id, i) => (
                    <div
                      key={id}
                      className="absolute inset-0 box-border rounded-stub-card border border-solid border-stub-navy"
                      style={{
                        background: 'var(--color-stub-paper)',
                        transform: `rotate(${i % 2 === 0 ? -4 : 3}deg)`,
                        opacity: 0.55,
                        boxShadow: 'var(--shadow-stub-card-resting)',
                      }}
                    />
                  ))}
                  <motion.div
                    layoutId={tId}
                    data-card={`pile-top-${idx}`}
                    data-movie-id={tId}
                    onClick={() => activatePile(idx, tId)}
                    // One explicit keyboard path avoids Framer's accessible
                    // onTap synthesizing a second activation after this one.
                    role="button"
                    tabIndex={0}
                    aria-pressed={
                      raisedId === null && pendingDraw === null ? faceUp.has(tId) : undefined
                    }
                    aria-label={
                      raisedId !== null || pendingDraw !== null
                        ? `Play ${mv((raisedId ?? pendingDraw)!)!.title} on marquee ${idx + 1} — top card ${tMovie.title}`
                        : `Marquee ${idx + 1}: ${tMovie.title}, ${tMovie.year} — flip for credits`
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        if (!e.repeat) activatePile(idx, tId)
                      }
                    }}
                  >
                    <motion.div
                      key={reduce ? 'static' : `${idx}-${superKey}`}
                      animate={
                        superKey > 0 && fxPile === idx && !reduce
                          ? { scale: [1, 1.08, 1] }
                          : undefined
                      }
                      transition={{ duration: 0.5 }}
                    >
                      <StubCard
                        movie={tMovie}
                        size="pile"
                        reveal={{ credits: faceUp.has(tId) }}
                        deepCut={!!tMovie.deepCast?.length}
                        flipHint
                      />
                    </motion.div>
                  </motion.div>
                  {/* Deep-cut glow: the FUT-style shimmer for hidden-credit links */}
                  {deepKey > 0 && fxPile === idx && !reduce && (
                    <motion.div
                      key={`deep-${idx}-${deepKey}`}
                      data-deep-glow
                      className="pointer-events-none absolute -inset-1.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0.5, 1, 0] }}
                      transition={{ duration: 1.5, times: [0, 0.15, 0.45, 0.65, 1] }}
                      style={{
                        borderRadius: 18,
                        boxShadow:
                          '0 0 0 3px rgba(45,212,191,0.9), 0 0 30px 10px rgba(45,212,191,0.5)',
                      }}
                    />
                  )}
                  {/* Take-to-meld: this marquee top completes a meld. On Matinee it
                      glows gold with a big button (the teaching aid, incl. the Meld→
                      pick-2 discovery path); higher tiers keep the original subtle
                      button. Either way, tapping lifts it into hand and the meld banks
                      next turn. The take RULE is identical across tiers. */}
                  {takeTargets[idx] &&
                    (takeGlowEnabled ? (
                      <>
                        {!reduce && (
                          <motion.div
                            data-take-glow={idx}
                            className="pointer-events-none absolute -inset-1.5"
                            initial={{ opacity: 0.45 }}
                            animate={{ opacity: [0.45, 1, 0.45] }}
                            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                            style={{
                              borderRadius: 18,
                              boxShadow:
                                '0 0 0 3px rgba(216,178,74,0.95), 0 0 26px 8px rgba(216,178,74,0.55)',
                            }}
                          />
                        )}
                        <button
                          type="button"
                          data-take={idx}
                          onClick={(e) => {
                            e.stopPropagation()
                            doTakePile(idx)
                          }}
                          className="absolute -bottom-8 inset-x-0 z-[var(--z-traveling)] mx-auto w-max rounded-full bg-[#d8b24a] px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-[#23211c] shadow-lg ring-2 ring-white/70 active:scale-95"
                        >
                          ↑ Take for meld
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        data-take={idx}
                        onClick={(e) => {
                          e.stopPropagation()
                          doTakePile(idx)
                        }}
                        className="absolute -bottom-7 inset-x-0 z-[var(--z-traveling)] mx-auto w-max rounded-full bg-[#2c5240] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md ring-2 ring-[#2c5240]/30 active:scale-95"
                      >
                        ↑ Take for meld
                      </button>
                    ))}
                </div>
              )
            })}
          </div>
        </section>

        {/* Mid band: the flex-1 breathing zone between the piles and the shelf.
            Banner and idle cue anchor to it instead of fixed pixel tops, so
            they stay mid-board on any viewport height. */}
        <div className="duel-mid-band relative min-h-0 flex-1" data-mid-band>
        {/* Turn banner — the say() narration channel. Wrapper owns the band
            pin (PlayBanner renders in flow, W0d); the 2400ms auto-dismiss
            effect stays the parent's, per contract. On short viewports the
            band compresses to ~0, so the banner rides the band TOP instead of
            its center — centered it would sink into the bottom-pinned token
            chips, which paint over it (same z, later in DOM). */}
        <div
          className={`pointer-events-none absolute inset-0 z-[var(--z-hud)] flex flex-col ${
            shortViewport ? 'justify-start pt-9' : 'translate-y-3 justify-center'
          }`}
        >
          <PlayBanner banner={banner} reduce={reduce} />
        </div>
        {/* SR live mirror (§7·7b a11y): the say() narration is the game's one
            commentary channel — announce it. Always mounted (a live region
            that unmounts never speaks); banner text only, so a play isn't
            read twice via LastPlayLine too. */}
        <div className="sr-only" role="status" aria-live="polite">
          {banner ? `${banner.who === 'You' ? 'You' : 'CPU'}: ${banner.text}` : ''}
        </div>

        {/* One-move-per-turn cue: sits in the empty mid-board band, idle turns
            only. The wrapper owns the pin (IdleCue renders in flow, W0d); the
            seven-condition guard stays here per the IdleCue contract. Short
            viewports: tucks under the banner slot at the band top (pt-10 vs
            the banner's pt-1) so the rare both-visible frame can't overlap. */}
        <div
          className={`pointer-events-none absolute inset-0 z-[var(--z-resting)] flex flex-col ${
            shortViewport ? 'justify-start pt-1' : '-translate-y-3 justify-center'
          }`}
        >
          <IdleCue
            visible={
              status === 'playerTurn' &&
              !runState &&
              pendingDraw === null &&
              drawChoice === null &&
              !meldSelect &&
              raisedId === null &&
              !takeTargets.some(Boolean) &&
              !gameOver
            }
            reduce={reduce}
            text={lastPlay === null ? 'first turn — choose a hand card or draw' : undefined}
          />
        </div>

        </div>

        {/* Banked melds — open to lay-offs from both sides */}
        <div className="duel-meld-shelf">
          <MeldShelf
            melds={melds}
            highlightIds={meldHighlights}
            setRowRef={(id, el) => {
              if (el) meldRowRefs.current.set(id, el)
              else meldRowRefs.current.delete(id)
            }}
            // Keyboard lay-off (§7·7b a11y): Enter on a row lays the raised card
            // off there via the same core as the drag drop; ineligible rows
            // shake. Lay-offs stay barred mid-draw (core guard), matching drag.
            onRowActivate={(meldId) => {
              if (raisedId === null) return
              const meld = melds.find((m) => m.id === meldId)
              if (meld) playerLayOff(raisedId, meld)
            }}
          />
        </div>

        {/* Super-link celebration flash */}
        {superKey > 0 && !reduce && (
          <motion.div
            key={superKey}
            className="pointer-events-none absolute inset-0 z-[var(--z-overlay)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.7, times: [0, 0.25, 1] }}
            style={{
              background:
                'radial-gradient(circle at 50% 38%, rgba(255,184,77,0.95), rgba(255,184,77,0) 62%)',
            }}
          />
        )}

        {/* Tap-elsewhere backdrop: lowers a raised card, or keeps a pending draw */}
        {raisedId !== null && (
          <div
            className="absolute inset-0 z-20"
            onPointerDown={() => (pendingDraw !== null ? playerKeep() : setRaisedId(null))}
          />
        )}

        {/* Keep / toss choice for the drawn card */}
        {pendingDraw !== null && status === 'playerTurn' && (
          <div className="duel-contextual absolute inset-x-0 bottom-[96px] z-[var(--z-contextual)] flex flex-col items-center gap-2">
            {drawnConnects && (
              <span className="rounded-full bg-[#2c5240] px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                It connects — drag it onto the pile to play it
              </span>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                data-choice="keep"
                onClick={playerKeep}
                className="min-h-11 rounded-full bg-white/90 px-5 py-2 text-[13px] font-bold text-[#23211c] shadow-md active:scale-95"
              >
                Keep
              </button>
              <button
                type="button"
                data-choice="toss"
                onClick={playerToss}
                className="min-h-11 rounded-full bg-[#23211c] px-5 py-2 text-[13px] font-bold text-[#f4efe6] shadow-md active:scale-95"
              >
                Toss onto pile
              </button>
            </div>
          </div>
        )}

        {/* Run continuation: keep chaining or end the turn */}
        {runState !== null && status === 'playerTurn' && (
          <div className="duel-contextual absolute inset-x-0 bottom-[96px] z-[var(--z-contextual)] flex flex-col items-center gap-2">
            <span className="rounded-full bg-[#7a5a10] px-3 py-1 text-[11px] font-bold text-white shadow-sm">
              Run ×{runState.count + 1}? Play another via {runState.people[0]}
              {runState.people.length > 1 ? '…' : ''}
            </span>
            <button
              type="button"
              data-run="end"
              onClick={endRun}
              className="min-h-11 rounded-full bg-[#23211c] px-5 py-2 text-[13px] font-bold text-[#f4efe6] shadow-md active:scale-95"
            >
              End turn
            </button>
          </div>
        )}

        {/* Meld selection bar */}
        {meldSelect && (
          <div className="duel-contextual absolute inset-x-0 bottom-[96px] z-[var(--z-contextual)] flex flex-col items-center gap-2" data-meld-selection-readout>
            <span className="max-w-[calc(100%_-_24px)] rounded-full bg-[#23211c] px-3 py-1 text-center text-[11px] font-bold text-white shadow-sm" aria-live="polite">
              {selected.size < 3
                ? genrePairStuck
                  ? `Genre melds need ${GENRE_FLOOR} — add a third ${selectedMovies[0].genre} film`
                  : `${selected.size} selected · choose ${3 - selected.size} more with a shared person, series, or genre`
                : selectionMeld
                  ? `${selected.size} selected · ${selectionMeld.rungName} · +${selectionMeld.pts} ready`
                  : `${selected.size} selected · no shared link — adjust your picks`}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                data-meld="bank"
                disabled={!selectionValid}
                onClick={bankMeld}
                className="min-h-11 rounded-full bg-[#7a5a10] px-5 py-2 text-[13px] font-bold text-white shadow-md active:scale-95 disabled:opacity-40"
              >
                Bank meld +{selectionMeld?.pts ?? 0}
              </button>
              <button
                type="button"
                data-meld="cancel"
                onClick={cancelMeldSelect}
                className="min-h-11 rounded-full bg-white/90 px-5 py-2 text-[13px] font-bold text-[#23211c] shadow-md active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Player tokens + meld entry. Wrapper owns the pin; TokenChips is
            player-side only (cpu side stays dormant — W0d ruling, TazCorner
            owns the booth pills). Final Cut's say() stays here, parent-side,
            per the TokenChips contract boundary. */}
        <div
          className={`duel-controls-panel absolute z-[var(--z-hud)] ${
            raisedId !== null || pendingDraw !== null || drawChoice !== null || meldSelect || runState !== null
              ? 'duel-controls-panel--contextual'
              : ''
          }`}
        >
          <div className="duel-controls-group">
            <span className="duel-controls-label">Your tools</span>
            <div className="duel-controls-row">
              <TokenChips
                side="player"
                compact={shortViewport}
                finalCut={playerTokens.finalCut}
                recast={playerTokens.recast}
                fcArmed={fcArmed}
                finalCutDisabled={status !== 'playerTurn' || meldSelect || runState !== null}
                onToggleFinalCut={() => {
                  const arming = !fcArmed
                  journey.action('final_cut', true)
                  setFcArmed(arming)
                  if (arming) say('You', 'Final Cut armed — play any card')
                }}
              />
              {!meldSelect && (
                <button
                  type="button"
                  data-token="meld"
                  disabled={
                    status !== 'playerTurn' ||
                    pendingDraw !== null ||
                    runState !== null ||
                    playerHand.length < 3
                  }
                  onClick={enterMeldSelect}
                  className={`duel-tool-button rounded-stub-pill px-2.5 font-stub-label font-extrabold uppercase tracking-wider shadow-sm transition-transform active:scale-95 disabled:opacity-50 ${
                    handHasMeld
                      ? 'bg-stub-amber text-stub-navy ring-2 ring-stub-amber/40'
                      : 'bg-stub-navy text-stub-cream'
                  }`}
                >
                  Meld
                </button>
              )}
            </div>
          </div>

          <div className="duel-controls-group">
            <span className="duel-controls-label">Hand aids</span>
            <div className="duel-controls-row">
        {/* Auto-sort (Matinee only): group the hand so links & melds line up */}
        {autoSortEnabled && (
            <button
              type="button"
              data-sort
              disabled={
                status !== 'playerTurn' ||
                pendingDraw !== null ||
                drawChoice !== null ||
                meldSelect ||
                playerHand.length < 3
              }
              onClick={() => {
                journey.action('sort', true)
                setPlayerHand((h) => autoSortHand(h))
              }}
              className="duel-tool-button flex items-center gap-1 rounded-stub-pill bg-stub-navy px-2.5 font-stub-label font-extrabold uppercase tracking-wider text-stub-cream shadow-sm transition-transform active:scale-95 disabled:opacity-40"
            >
              <Icon name="sort" size={16} /> Sort
            </button>
        )}

        {/* Hint (Matinee/Feature only): pulse a playable card */}
        {hintEnabled && (
            <button
              type="button"
              data-hint
              disabled={
                hintsLeft <= 0 ||
                status !== 'playerTurn' ||
                pendingDraw !== null ||
                meldSelect ||
                runState !== null
              }
              onClick={showHint}
              className={`duel-tool-button flex items-center gap-1 rounded-stub-pill px-2.5 font-stub-label font-extrabold uppercase tracking-wider shadow-sm transition-transform active:scale-95 ${
                hintsLeft <= 0
                  ? 'bg-transparent text-stub-slate ring-1 ring-stub-disabled line-through'
                  : 'bg-stub-teal text-stub-cream disabled:opacity-40'
              }`}
            >
              <Icon name="hint" size={16} /> Hint{Number.isFinite(hintBudget) ? ` ·${hintsLeft}` : ''}
            </button>
        )}
            </div>
          </div>
        </div>

        {/* One-shot drag nudge (C3, feedback batch 1): a raised card on a
            fresh device is the "now what?" moment. Root-level absolute like
            Hand's own raised slot; floats just above the raised card's top
            (bottom = raisedBottom 190 + raised height ~245 + gap — bottom-
            anchored so 844 and 667 both work). Same floating-pill pattern as
            the fan's HINT pill. Retired forever by dismissDragNudge on the
            first drag that reaches a target. */}
        {dragNudge &&
          status === 'playerTurn' &&
          raisedId !== null &&
          pendingDraw === null &&
          !meldSelect &&
          !hasRaisedTarget &&
          !gameOver && (
            <div
              className="pointer-events-none absolute inset-x-0 z-[60] flex justify-center px-6"
              style={{ bottom: wideViewport ? 472 : 443 }}
            >
              <motion.span
                animate={reduce ? undefined : { opacity: [0.7, 1, 0.7] }}
                transition={reduce ? undefined : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="rounded-stub-pill border-2 border-stub-amber bg-stub-navy px-3 py-1 font-stub-label text-[10px] font-bold uppercase tracking-[.1em] text-stub-amber"
              >
                no link · flip or lower
              </motion.span>
            </div>
          )}

        <Hand
          cards={playerHandMovies}
          raisedId={raisedId}
          hintId={hintId}
          hintLabel={hintLabel}
          faceUp={faceUp}
          invalidNonce={invalidNonce}
          raisedBottom={wideViewport ? 220 : 190}
          wideFan={wideViewport}
          fanClassName="duel-hand-tray"
          selectMode={meldSelect}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
          onRaise={(id) => {
            if (status === 'playerTurn' && pendingDraw === null) {
              journey.action('select', true)
              setHintId(null)
              setHintMeldId(null)
              setRaisedId(id)
            }
          }}
          onFlip={flipCard}
          onDrop={playerPlay}
          onReorder={(id, toIndex) => {
            journey.action('sort', true)
            setPlayerHand((h) => moveId(h, id, toIndex))
          }}
        />

        {/* Draw-3-keep-1: pick one of the revealed cards; the rest leave play.
            DrawChoice owns the Stub scrim/panel/pills/captions + the CONNECTS
            hint; the parent injects each face-down card as a StubCard ticket back
            (W3: StubCard now has a wild branch, so a drawn wild renders correctly). */}
        {drawChoice !== null && (
          <DrawChoice
            options={drawChoice.map((id) => {
              const dm = mv(id)!
              const wild = isWild(id)
              return {
                id,
                connects: tops.some((t) => sharedPeople(t, dm).length > 0),
                // A wild shows its face: it's kept regardless (RULESET §11), and
                // the amber ★ WILD front IS the explanation for the forced pick.
                wild,
                cardSlot: <StubCard movie={dm} size="hand" faceUp={wild} />,
              }
            })}
            onPick={playerPickDraw}
            reduce={!!reduce}
          />
        )}

        {/* Recast offer: CPU's big play held in suspense. RecastOffer owns the
            full 7c overlay (scrim + glow + diorama modal + buttons); its root is
            an exit-capable motion.div so the parent AnimatePresence still drives
            the fade. The double-fire guard stays parent-side (allowCpuPlay /
            playerRecast). cardSlot = StubCard ticket back (W3: a Final-Cut dump
            can be a wild; StubCard's wild branch now handles it). Note:
            the comp's flat "CPU PLAYS" eyebrow drops today's draws-&-plays
            nuance — a checkpoint flag, not a bug (recastOffer.drew unused). */}
        <AnimatePresence>
          {recastOffer && offerMovie && (
            <RecastOffer
              finalCut={recastOffer.finalCut}
              movie={offerMovie}
              cardSlot={<StubCard movie={offerMovie} size="hand" faceUp={false} />}
              onRecast={playerRecast}
              onAllow={allowCpuPlay}
              reduce={!!reduce}
            />
          )}
        </AnimatePresence>

        {/* Test-only terminal and deterministic state seams. VITE_E2E is
            undefined for normal builds, so Vite/Rollup erase this branch. */}
        {import.meta.env.VITE_E2E === '1' && (
          <>
            <button
              type="button"
              data-testid="matchcut-e2e-complete"
              className="hidden"
              onClick={() => {
                setPlayerScore(TARGET_SCORE)
                setCpuScore(0)
                setEndReason('target')
                setStatus('over')
              }}
            />
            <button
              type="button"
              data-testid="matchcut-e2e-ordinary-draw"
              className="hidden"
              onClick={() => applyE2EFixture('ordinary-draw')}
            />
            <button
              type="button"
              data-testid="matchcut-e2e-no-play-draw"
              className="hidden"
              onClick={() => applyE2EFixture('no-play-draw')}
            />
            <button
              type="button"
              data-testid="matchcut-e2e-one-wild-draw"
              className="hidden"
              onClick={() => applyE2EFixture('one-wild-draw')}
            />
            <button
              type="button"
              data-testid="matchcut-e2e-wild-draw"
              className="hidden"
              onClick={() => applyE2EFixture('multi-wild-draw')}
            />
            <button
              type="button"
              data-testid="matchcut-e2e-take-ready"
              className="hidden"
              onClick={() => applyE2EFixture('take-ready')}
            />
            <output data-testid="matchcut-e2e-player-hand" className="hidden">
              {playerHand.length}
            </output>
            <output data-testid="matchcut-e2e-deck" className="hidden">
              {deck.length}
            </output>
          </>
        )}

        <AnimatePresence>
          {gameOver && (
            <motion.div
              ref={gameOverDialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Game over — results"
              tabIndex={-1}
              className="duel-result-overlay absolute inset-0 z-[100] flex flex-col items-center overflow-y-auto px-5 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduce ? 0.2 : 0.8, duration: reduce ? 0.15 : 0.35 }}
            >
              {/* Scroll column (the App.tsx menu fix): my-auto centers when the
                  content fits and top-aligns + scrolls when it doesn't — plain
                  justify-center clipped BOTH ends at 667 once the recap reel ran
                  long (flex centering overflows both ways; the top half can
                  never be scrolled to). */}
              <div className="duel-result-panel my-auto flex w-full flex-col items-center rounded-stub-header bg-stub-cream px-6 py-6 shadow-stub-modal">
                <h2 className="font-stub-display text-4xl font-bold text-stub-navy" data-result>
                  {winner === 'player' && 'You win!'}
                  {winner === 'cpu' && 'CPU wins.'}
                  {winner === 'draw' && 'Dead heat.'}
                </h2>
                <p className="mt-2 font-stub-ui text-[14px] font-medium text-stub-slate">
                  {endReason === 'playerOut' && 'You played your last card.'}
                  {endReason === 'cpuOut' && 'CPU emptied its hand.'}
                  {endReason === 'stalemate' && 'Deck empty — both passed.'}
                  {endReason === 'target' &&
                    `${racerLabel} hit ${TARGET_SCORE} — the show goes to the higher net.`}
                </p>
                <ResultMeaning
                  direction="Higher is better"
                  detail={`Net ${playerNet} vs ${cpuNet} · played − held`}
                />
                <div className="mt-2 w-full max-w-[260px] space-y-1.5">
                  {[
                    { label: 'You', score: playerScore, held: playerHand.length, net: playerNet, win: winner === 'player' },
                    { label: 'CPU', score: cpuScore, held: cpuHand.length, net: cpuNet, win: winner === 'cpu' },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className={`flex items-baseline justify-between rounded-stub-panel border px-4 py-2.5 ${
                        row.win
                          ? 'border-stub-navy bg-stub-navy text-stub-cream'
                          : 'border-stub-navy/15 bg-stub-paper text-stub-navy'
                      }`}
                    >
                      <span className="text-[13px] font-bold">{row.label}</span>
                      <span
                        className={`font-stub-ui text-[11px] font-medium tabular-nums ${
                          row.win ? 'text-stub-cream/60' : 'text-stub-slate'
                        }`}
                      >
                        {row.score} played − {row.held} held
                      </span>
                      <span className="font-stub-display text-xl font-bold tabular-nums">
                        {row.net}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Recap reel (7d): the match in highlights — melds, super links,
                    Final Cuts. Forged as a standalone Stub component; self-guards on
                    an empty reel (returns null). */}
                <div className="mt-4 w-full max-w-[280px]">
                  <RecapReel headline={recapHeadline} summary={recapSummary} items={recap} />
                </div>

                {/* Lifetime record at this difficulty (localStorage meta-state) */}
                {duelMeta && (
                  <p
                    className="mt-3 font-stub-label text-[11px] font-bold uppercase tracking-wider text-stub-slate tabular-nums"
                    data-duel-record
                  >
                    {DIFFICULTY_META[difficulty].label} record · {duelMeta.plays} played ·{' '}
                    {duelMeta.wins} won
                  </p>
                )}

                <ShareCopy text={shareDuel} analytics={{ mode: 'duel', difficulty }} />

                <ResultActions primaryLabel="Deal again" onPrimary={newGame} onMenu={onExit} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showRules && (
            <HowToPlay
              context="duel"
              onClose={() => {
                journey.helpClose()
                setShowRules(false)
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
