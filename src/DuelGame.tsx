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
  WILD_MOVIES,
  bestMeld,
  canLayOff,
  connectivity,
  cpuTossOrKeep,
  creditNames,
  deal,
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
import { recordDuelFinish, type DuelMeta } from './lib/progress.ts'
import { track } from './lib/analytics.ts'

// Resolve a card id to its Movie — wild or canonical (the deck holds 3 wilds).
const mv = (id: string): Movie => wildMovie(id) ?? movieById.get(id)!

// Deal a duel, then splice the 3 wilds into the DRAW deck only (never the opening
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
import { CardView } from './components/Card.tsx'
import Hand from './components/Hand.tsx'
import HowToPlay from './components/HowToPlay.tsx'
import IdleCue from './components/IdleCue.tsx'
import MeldZone, { meldLabel } from './components/MeldZone.tsx'
import ShareCopy from './components/ShareCopy.tsx'
import { matchCutShare } from './lib/share.ts'

type DuelStatus = 'playerTurn' | 'cpuTurn' | 'recastOffer' | 'over'
type EndReason = 'playerOut' | 'cpuOut' | 'stalemate' | 'target'

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
  // Draw-3-keep-1: the 3 revealed cards awaiting the player's pick (null = not choosing).
  // The 2 not kept are burned (out of play, invisible per decision D1).
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
  const [banner, setBanner] = useState<DuelBanner | null>(null)
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
  // stale closure and append the same card twice (89→90, a conservation break).
  const resolvingOffer = useRef(false)

  // The LINKING top of each Double Feature pile — skips wilds (transparent on a
  // pile; the real card beneath shows through). index 0 = starter pile, 1 = second.
  const tops = piles.map((p) => topForLinking(p.map(mv)))
  const gameOver = status === 'over'
  const drawnConnects =
    pendingDraw !== null &&
    tops.some((t) => sharedPeople(t, mv(pendingDraw)!).length > 0)
  const raisedMovie = raisedId !== null ? mv(raisedId)! : null
  const playerHandMovies = playerHand.map((id) => mv(id)!)
  const handHasMeld = bestMeld(playerHandMovies) !== null
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

  const say = (
    who: 'You' | 'CPU',
    text: string,
    tier: LinkTier | null = null,
    points: number | null = null,
    deep = false,
  ) => setBanner({ who, text, tier, points, deep, seq: ++seq.current })

  // Record a highlight for the end-of-game recap reel.
  const logRecap = (e: RecapEvent) => setRecap((r) => [...r, e])

  const endGame = (reason: EndReason) => {
    setEndReason(reason)
    setStatus('over')
  }

  const flipCard = (id: string) => {
    if (gameOver) return
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

  const invalidShake = () => {
    setInvalidNonce((n) => n + 1)
    window.clearTimeout(lowerTimer.current)
    lowerTimer.current = window.setTimeout(
      () => setRaisedId((r) => (pendingDraw !== null ? r : null)),
      650,
    )
  }

  const playerPlay = (id: string, point: { x: number; y: number }) => {
    if (status !== 'playerTurn' || meldSelect) return
    // After a draw, only the drawn card may be played (UNO rule)
    if (pendingDraw !== null && id !== pendingDraw) return
    const card = mv(id)!

    // A wild plays on any pile for +0 — the universal shed/unstick. It lands face
    // up but transparent (the real card beneath still links), no run, no lay-off.
    if (isWild(id) && runState === null) {
      const landedWild = pileAt(point)
      if (landedWild === null) return
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

    // Lay-off: dropped onto a meld row (not mid-draw, not mid-run)
    const meldHit = findMeldAt(point)
    if (meldHit && pendingDraw === null && runState === null) {
      if (canLayOff(card, meldHit)) {
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
        return
      }
      // No match — maybe they meant the pile just above; fall through
    }

    // Route the drop to the Double Feature pile it landed on. Mid-run, the play
    // stays on the pile the run is building (a run can't hop marquees).
    const landed = pileAt(point)
    if (landed === null) return
    const pileIdx = runState !== null ? runState.pileIdx : landed
    const top = tops[pileIdx]

    const shared = sharedPeople(top, card)
    const viaFinalCut =
      shared.length === 0 && fcArmed && playerTokens.finalCut && runState === null
    // Mid-run, only cards chaining through the run's person are legal
    const chainOk = runState === null || shared.some((s) => runState.people.includes(s.name))
    if ((shared.length === 0 && !viaFinalCut) || (shared.length > 0 && !chainOk)) {
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
    const take = deck.slice(0, 3)
    setDeck(deck.slice(take.length))
    setDrawChoice(take)
    say('You', take.length >= 2 ? 'drew 3 — keep one' : 'drew a card')
  }

  // Player keeps one of the revealed cards; the rest leave play. The kept card
  // comes up raised for the usual keep / toss / play decision.
  const playerPickDraw = (id: string) => {
    if (drawChoice === null) return
    setDrawChoice(null)
    setPlayerHand((h) => [...h, id])
    setPendingDraw(id)
    setRaisedId(id)
    say(
      'You',
      tops.some((t) => sharedPeople(t, mv(id)!).length > 0)
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
    setPendingDraw(null)
    setRaisedId(null)
    setFcArmed(false)
    setPassStreak(0)
    say('You', 'kept the card')
    setStatus('cpuTurn')
  }

  // Toss: the drawn card becomes the new pile top — no points, no connection
  // needed. The unstick mechanism, and a tactical brick for the opponent.
  const playerToss = () => {
    if (pendingDraw === null) return
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
    setMeldSelect(true)
    setSelected(new Set())
    setRaisedId(null)
    setFcArmed(false)
  }

  const cancelMeldSelect = () => {
    setMeldSelect(false)
    setSelected(new Set())
  }

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const bankMeld = () => {
    if (!selectionValid) return
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
    resolvingOffer.current = true
    resolveCpuPlay(recastOffer)
  }

  const playerRecast = () => {
    if (resolvingOffer.current || recastOffer === null) return
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
      // Draw-3-keep-1: reveal the top 3, keep the best (pickDraw), burn the rest.
      // Returns the kept card id; the others just leave the deck (invisible per D1).
      const draw3 = () => {
        const take = deck.slice(0, 3)
        setDeck(deck.slice(take.length))
        // A wild has 0 connectivity, so pickDraw would burn it as the "worst" card
        // — but a universal wild is obviously kept. Keep it, burn the other two.
        const wildInTake = take.find(isWild)
        if (wildInTake !== undefined) return wildInTake
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
  }

  // Net score: points played minus a point per card still in hand
  const playerNet = playerScore - playerHand.length
  const cpuNet = cpuScore - cpuHand.length
  const winner = playerNet > cpuNet ? 'player' : cpuNet > playerNet ? 'cpu' : 'draw'

  useEffect(() => {
    track('mode_start', { mode: 'duel', difficulty })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Every finished duel counts toward the per-difficulty record (no daily to
  // gate on — replays ARE the return signal). newGame resets status, so the
  // next finish records its own game.
  useEffect(() => {
    if (!gameOver) return
    track('mode_finish', { mode: 'duel', difficulty })
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
  const recapVerb = (kind: RecapEvent['kind']) =>
    kind === 'meld' ? 'banked a' : kind === 'super' ? 'super link:' : 'Final Cut:'

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
    <div className="h-full overflow-hidden">
      {/* Flex-zone board (Stub Wave A): the top stack flows, a flex-1 band
          absorbs height differences (banner/cue anchor inside it), and the
          shelf rides above the fan reservation — no fixed-pixel tops, so
          667px-class phones compress the band instead of colliding zones.
          pb reserves the hand fan's overlay height (Hand is h-[225px]). */}
      <div className="relative mx-auto flex h-full w-full max-w-[420px] flex-col pb-[225px]">
        <header className="flex items-start justify-between px-3 pt-3">
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Back to menu"
              onClick={onExit}
              className="flex h-11 w-9 items-center justify-center text-2xl text-[#7d7563] active:scale-90"
            >
              ‹
            </button>
            <span className="font-serif text-lg font-black italic tracking-tight">Duel</span>
            <button
              type="button"
              aria-label="How to play"
              data-rules-open
              onClick={() => setShowRules(true)}
              className="ml-2 flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-extrabold text-[#7d7563] ring-1 ring-inset ring-[#c5bca6] active:scale-90"
            >
              ?
            </button>
          </div>
          <div className="flex flex-col items-end gap-1 pr-2 pt-1">
            <div className="flex items-center gap-1.5">
              <span
                data-score="player"
                className={`rounded-full bg-[#2c5240] px-2 py-0.5 text-[11px] font-extrabold tabular-nums text-white transition-opacity ${
                  status === 'playerTurn' ? 'ring-2 ring-[#2c5240]/30' : 'opacity-60'
                }`}
              >
                You {playerScore}
              </span>
              <span
                data-score="cpu"
                className={`rounded-full bg-[#b3541e] px-2 py-0.5 text-[11px] font-extrabold tabular-nums text-white transition-opacity ${
                  status === 'cpuTurn' || status === 'recastOffer'
                    ? 'ring-2 ring-[#b3541e]/30'
                    : 'opacity-60'
                }`}
              >
                CPU {cpuScore}
              </span>
            </div>
            <div className="text-[11px] font-semibold text-[#7d7563]" data-turn>
              {status === 'playerTurn' && (runState ? `Run ×${runState.count + 1}?` : 'Your turn')}
              {status === 'cpuTurn' && 'CPU is thinking…'}
              {status === 'recastOffer' && 'CPU is playing…'}
              {gameOver && 'Game over'}
            </div>
            {!gameOver && (
              <div
                data-target-hint
                className="text-[9px] font-bold uppercase tracking-wider text-[#b4ab97]"
              >
                show ends at {TARGET_SCORE}
              </div>
            )}
          </div>
        </header>

        {/* CPU hand: face-down, with its remaining tokens */}
        <div className="relative z-[var(--z-resting)] mt-1 flex flex-col items-center">
          <div className="flex items-center pl-4">
            {cpuHand.map((id) => (
              <motion.div
                key={id}
                layoutId={id}
                initial={false}
                className="-ml-4 flex h-[64px] w-[42px] items-center justify-center rounded-md bg-[#23211c] shadow-sm ring-1 ring-inset ring-white/15 first:ml-0"
              >
                <span className="font-serif text-sm font-black italic text-[#f4efe6]/40">M</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-[#9a917c]" data-cpu-count>
              CPU · {cpuHand.length} {cpuHand.length === 1 ? 'card' : 'cards'}
            </span>
            <span
              data-cpu-token="finalCut"
              className={`rounded px-1 py-px text-[8px] font-extrabold uppercase tracking-wider ${
                cpuTokens.finalCut ? 'bg-[#23211c] text-[#f4efe6]' : 'text-[#c5bca6] line-through'
              }`}
            >
              Final Cut
            </span>
            <span
              data-cpu-token="recast"
              className={`rounded px-1 py-px text-[8px] font-extrabold uppercase tracking-wider ${
                cpuTokens.recast ? 'bg-[#23211c] text-[#f4efe6]' : 'text-[#c5bca6] line-through'
              }`}
            >
              Recast
            </span>
          </div>
        </div>

        {/* Draw deck + the two Double Feature marquees */}
        <section className="relative z-[var(--z-resting)] mt-3 flex items-start justify-center gap-4">
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
                <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-lg bg-[#23211c]/25" />
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-[#23211c] ring-1 ring-inset ring-white/20">
                  <span className="font-serif text-xl font-black italic text-[#f4efe6]/70">M</span>
                  <span className="mt-1 text-[11px] font-bold tabular-nums text-[#f4efe6]/60">
                    {deck.length}
                  </span>
                </div>
                <span className="absolute -bottom-6 inset-x-0 text-center text-[10px] font-bold uppercase tracking-wider text-[#9a917c]">
                  Draw
                </span>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-[#c5bca6] text-[11px] font-bold uppercase tracking-wider text-[#9a917c]">
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
                  className="relative"
                  data-pile={idx}
                >
                  {unders.map((id, i) => (
                    <div
                      key={id}
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: mv(id)!.posterColor,
                        transform: `rotate(${i % 2 === 0 ? -4 : 3}deg)`,
                        opacity: 0.45,
                      }}
                    />
                  ))}
                  <motion.div
                    layoutId={tId}
                    data-card={`pile-top-${idx}`}
                    onTap={() => flipCard(tId)}
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
                      <CardView movie={tMovie} faceUp={faceUp.has(tId)} size="pile" />
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
                          ↑ Take to finish meld
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
        <div className="relative min-h-0 flex-1" data-mid-band>
        {/* Turn banner */}
        <div className="pointer-events-none absolute inset-0 z-[var(--z-hud)] flex translate-y-3 items-center justify-center px-4">
          <AnimatePresence>
            {banner && (
              <motion.div
                key={banner.seq}
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={
                  reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 320, damping: 24 }
                }
                className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-2.5 shadow-md ${
                  banner.tier === 'super'
                    ? 'bg-[#a3411a]'
                    : banner.tier === 'strong'
                      ? 'bg-[#7a5a10]'
                      : 'bg-[#23211c]'
                }`}
              >
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white ${
                    banner.who === 'You' ? 'bg-[#2c5240]' : 'bg-[#b3541e]'
                  }`}
                >
                  {banner.who}
                </span>
                <span className="text-[13px] font-semibold text-[#f4efe6]">{banner.text}</span>
                {banner.deep && (
                  <span
                    data-banner-deep
                    className="rounded-full bg-[#0f766e] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white"
                  >
                    Deep cut
                  </span>
                )}
                {banner.points !== null && (
                  <span
                    data-banner-points
                    className="rounded-full bg-white/25 px-1.5 py-0.5 text-[11px] font-extrabold tabular-nums text-white"
                  >
                    +{banner.points}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* One-move-per-turn cue: sits in the empty mid-board band, idle turns
            only. The wrapper owns the pin (IdleCue renders in flow, W0d); the
            seven-condition guard stays here per the IdleCue contract. */}
        <div className="pointer-events-none absolute inset-0 z-[var(--z-resting)] flex -translate-y-3 flex-col justify-center">
          <IdleCue
            visible={
              status === 'playerTurn' &&
              !runState &&
              pendingDraw === null &&
              drawChoice === null &&
              !meldSelect &&
              raisedId === null &&
              !gameOver
            }
            reduce={reduce}
          />
        </div>
        </div>

        {/* Banked melds — open to lay-offs from both sides */}
        <MeldZone
          melds={melds}
          highlightIds={meldHighlights}
          setRowRef={(id, el) => {
            if (el) meldRowRefs.current.set(id, el)
            else meldRowRefs.current.delete(id)
          }}
        />

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
          <div className="absolute inset-x-0 bottom-[96px] z-[var(--z-contextual)] flex flex-col items-center gap-2">
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
          <div className="absolute inset-x-0 bottom-[96px] z-[var(--z-contextual)] flex flex-col items-center gap-2">
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
          <div className="absolute inset-x-0 bottom-[96px] z-[var(--z-contextual)] flex flex-col items-center gap-2">
            <span className="rounded-full bg-[#23211c] px-3 py-1 text-[11px] font-bold text-white shadow-sm">
              {selected.size < 3
                ? `Pick ${3 - selected.size} more — a person, series, or ${GENRE_FLOOR}+ of a genre`
                : selectionMeld
                  ? `${selectionMeld.rungName} ×${selected.size}`
                  : 'No shared link — adjust your picks'}
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

        {/* Player tokens + meld entry */}
        <div className="absolute left-3 bottom-[240px] z-[var(--z-hud)] flex flex-col items-start gap-1.5">
          <button
            type="button"
            data-token="finalCut"
            disabled={
              !playerTokens.finalCut || status !== 'playerTurn' || meldSelect || runState !== null
            }
            onClick={() => {
              const arming = !fcArmed
              setFcArmed(arming)
              if (arming) say('You', 'Final Cut armed — play any card')
            }}
            className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider shadow-sm transition-transform active:scale-95 ${
              !playerTokens.finalCut
                ? 'bg-transparent text-[#9a917c] ring-1 ring-[#c5bca6] line-through'
                : fcArmed
                  ? 'scale-105 bg-[#a3411a] text-white ring-2 ring-[#a3411a]/40'
                  : 'bg-[#23211c] text-[#f4efe6] disabled:opacity-50'
            }`}
          >
            Final Cut
          </button>
          <span
            data-token="recast"
            className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider shadow-sm ${
              playerTokens.recast
                ? 'bg-[#23211c] text-[#f4efe6]'
                : 'bg-transparent text-[#9a917c] ring-1 ring-[#c5bca6] line-through'
            }`}
          >
            Recast
          </span>
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
              className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider shadow-sm transition-transform active:scale-95 disabled:opacity-50 ${
                handHasMeld
                  ? 'bg-[#7a5a10] text-white ring-2 ring-[#7a5a10]/40'
                  : 'bg-[#23211c] text-[#f4efe6]'
              }`}
            >
              Meld
            </button>
          )}
        </div>

        {/* Auto-sort (Matinee only): group the hand so links & melds line up */}
        {autoSortEnabled && (
          <div className="absolute right-3 bottom-[284px] z-[var(--z-hud)] flex flex-col items-end">
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
              onClick={() => setPlayerHand((h) => autoSortHand(h))}
              className="flex items-center gap-1 rounded-full bg-[#7d7563] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-[#f4efe6] shadow-sm transition-transform active:scale-95 disabled:opacity-40"
            >
              ⇲ Sort
            </button>
          </div>
        )}

        {/* Hint (Matinee/Feature only): pulse a playable card */}
        {hintEnabled && (
          <div className="absolute right-3 bottom-[240px] z-[var(--z-hud)] flex flex-col items-end">
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
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider shadow-sm transition-transform active:scale-95 ${
                hintsLeft <= 0
                  ? 'bg-transparent text-[#9a917c] ring-1 ring-[#c5bca6] line-through'
                  : 'bg-[#2c5240] text-[#f4efe6] disabled:opacity-40'
              }`}
            >
              ◎ Hint{Number.isFinite(hintBudget) ? ` ·${hintsLeft}` : ''}
            </button>
          </div>
        )}

        <Hand
          cards={playerHandMovies}
          raisedId={raisedId}
          hintId={hintId}
          faceUp={faceUp}
          invalidNonce={invalidNonce}
          raisedBottom={190}
          selectMode={meldSelect}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
          onRaise={(id) => {
            if (status === 'playerTurn' && pendingDraw === null) {
              setHintId(null)
              setHintMeldId(null)
              setRaisedId(id)
            }
          }}
          onFlip={flipCard}
          onDrop={playerPlay}
          onReorder={(id, toIndex) => setPlayerHand((h) => moveId(h, id, toIndex))}
        />

        {/* Draw-3-keep-1: pick one of the revealed cards; the rest leave play */}
        {drawChoice !== null && (
          <div className="absolute inset-0 z-[85] flex flex-col items-center justify-center bg-[#23211c]/45 px-4">
            <span className="mb-3 rounded-full bg-[#23211c] px-3 py-1.5 text-[12px] font-bold text-[#f4efe6] shadow-md">
              Keep one — {drawChoice.length > 2 ? 'the other two leave' : 'the rest leave'} play
            </span>
            <div className="flex items-end gap-2">
              {drawChoice.map((id) => {
                const dm = mv(id)!
                const connects = tops.some((t) => sharedPeople(t, dm).length > 0)
                return (
                  <button
                    key={id}
                    type="button"
                    data-draw-choice={id}
                    onClick={() => playerPickDraw(id)}
                    className="relative rounded-xl transition-transform active:scale-95"
                  >
                    {connects && (
                      <span className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#2c5240] px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-white shadow">
                        Connects
                      </span>
                    )}
                    <CardView movie={dm} faceUp={false} size="hand" />
                  </button>
                )
              })}
            </div>
            <span className="mt-3 text-[11px] font-medium text-[#f4efe6]/80">
              Tap to keep · then play it, keep it, or toss it
            </span>
          </div>
        )}

        {/* Recast offer: CPU's big play held in suspense */}
        <AnimatePresence>
          {recastOffer && offerMovie && (
            <motion.div
              className="absolute inset-0 z-[90] flex flex-col items-center justify-center bg-[#23211c]/35 px-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0.1 : 0.2 }}
            >
              <div className="flex w-full max-w-[300px] flex-col items-center rounded-2xl bg-[#f4efe6] p-5 text-center shadow-xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9a917c]">
                  {recastOffer.drew ? 'CPU draws & plays' : 'CPU plays'}
                </span>
                <h3 className="mt-1 font-serif text-2xl font-black italic">{offerMovie.title}</h3>
                <p className="mt-1 text-[13px] font-semibold text-[#a3411a]">
                  {recastOffer.finalCut
                    ? 'Final Cut — no connection needed'
                    : 'Super link — +4 and an encore'}
                </p>
                <div className="mt-3">
                  <CardView movie={offerMovie} faceUp={false} size="hand" />
                </div>
                <button
                  type="button"
                  data-offer="recast"
                  onClick={playerRecast}
                  className="mt-4 min-h-12 w-full rounded-full bg-[#a3411a] px-6 py-3 text-[14px] font-bold text-white shadow-md active:scale-95"
                >
                  Recast — cancel it
                </button>
                <button
                  type="button"
                  data-offer="allow"
                  onClick={allowCpuPlay}
                  className="mt-2 min-h-12 w-full rounded-full bg-white/80 px-6 py-3 text-[14px] font-bold text-[#23211c] shadow-sm active:scale-95"
                >
                  Allow it
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {gameOver && (
            <motion.div
              className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#f4efe6]/95 px-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduce ? 0.2 : 0.8, duration: reduce ? 0.15 : 0.35 }}
            >
              <h2 className="font-serif text-4xl font-black italic" data-result>
                {winner === 'player' && 'You win!'}
                {winner === 'cpu' && 'CPU wins.'}
                {winner === 'draw' && 'Dead heat.'}
              </h2>
              <p className="mt-2 text-[14px] font-medium text-[#5b5546]">
                {endReason === 'playerOut' && 'You played your last card.'}
                {endReason === 'cpuOut' && 'CPU emptied its hand.'}
                {endReason === 'stalemate' && 'Deck empty — both passed.'}
                {endReason === 'target' &&
                  `${racerLabel} hit ${TARGET_SCORE} — the show goes to the higher net.`}
              </p>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-[#9a917c]">
                Highest net wins · played − cards held
              </p>
              <div className="mt-2 w-full max-w-[260px] space-y-1.5">
                {[
                  { label: 'You', score: playerScore, held: playerHand.length, net: playerNet, win: winner === 'player' },
                  { label: 'CPU', score: cpuScore, held: cpuHand.length, net: cpuNet, win: winner === 'cpu' },
                ].map((row) => (
                  <div
                    key={row.label}
                    className={`flex items-baseline justify-between rounded-xl px-4 py-2.5 ${
                      row.win ? 'bg-[#23211c] text-[#f4efe6]' : 'bg-white/70 text-[#23211c]'
                    }`}
                  >
                    <span className="text-[13px] font-bold">{row.label}</span>
                    <span
                      className={`text-[11px] font-medium tabular-nums ${
                        row.win ? 'text-[#f4efe6]/60' : 'text-[#8a8270]'
                      }`}
                    >
                      {row.score} played − {row.held} held
                    </span>
                    <span className="font-serif text-xl font-black italic tabular-nums">
                      {row.net}
                    </span>
                  </div>
                ))}
              </div>

              {/* Recap reel: the match in highlights — melds, super links, Final Cuts */}
              {recap.length > 0 && (
                <div className="mt-4 w-full max-w-[260px]">
                  <p className="text-[12px] font-bold text-[#3a352a]">
                    {recapHeadline}{' '}
                    <span className="font-medium text-[#8a8270]">
                      You banked {yourMelds} meld{yourMelds === 1 ? '' : 's'}
                      {yourSupers > 0 && ` · ${yourSupers} super link${yourSupers === 1 ? '' : 's'}`}.
                    </span>
                  </p>
                  <div className="mt-2 max-h-[164px] space-y-1 overflow-y-auto pr-1 text-left">
                    {recap.map((e, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-lg bg-white/60 px-2.5 py-1.5"
                      >
                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white ${
                            e.who === 'You' ? 'bg-[#2c5240]' : 'bg-[#b3541e]'
                          }`}
                        >
                          {e.who}
                        </span>
                        <span className="flex-1 text-[11px] font-semibold leading-tight text-[#3a352a]">
                          {recapVerb(e.kind)} {e.text}
                        </span>
                        <span className="shrink-0 font-serif text-[13px] font-black italic tabular-nums text-[#23211c]">
                          +{e.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifetime record at this difficulty (localStorage meta-state) */}
              {duelMeta && (
                <p
                  className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[#9a917c] tabular-nums"
                  data-duel-record
                >
                  {DIFFICULTY_META[difficulty].label} record · {duelMeta.plays} played ·{' '}
                  {duelMeta.wins} won
                </p>
              )}

              <ShareCopy text={shareDuel} />

              <button
                type="button"
                onClick={newGame}
                className="mt-3 min-h-12 rounded-full bg-white/70 px-7 py-3 text-[15px] font-bold text-[#23211c] shadow-sm active:scale-95"
              >
                Deal again
              </button>
              <button
                type="button"
                onClick={onExit}
                className="mt-3 min-h-12 rounded-full bg-white/70 px-7 py-3 text-[15px] font-bold text-[#23211c] shadow-sm active:scale-95"
              >
                Menu
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showRules && <HowToPlay onClose={() => setShowRules(false)} />}
        </AnimatePresence>
      </div>
    </div>
  )
}
