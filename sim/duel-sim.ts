// Headless duel simulator — tunes difficulty win rates against the REAL game
// logic. Node 24 type-strips the imports, so this exercises the same scoring,
// linking, meld and CPU-policy functions the React game ships. Only the turn
// LOOP is reproduced here (it lives inside DuelGame's effect in the app).
//
//   node sim/duel-sim.ts                       # default 4000 games per matchup
//   node sim/duel-sim.ts 20000                 # more games = tighter confidence
//   node sim/duel-sim.ts 6000 matinee          # one matchup only
//
// "Player" = HUMAN_CASUAL (reads only printed credits, plays decently but
// imperfectly). We report how often that player BEATS each CPU tier.
//
// sim/eval.ts imports playGame with an event recorder for flow/engagement
// analysis and rule variants (e.g. draw-3-keep-1).

import type { Movie } from '../src/data/types.ts'
import { MOVIES, movieById } from '../src/data/movies.ts'
import { sharedPeople, linkTier, type LinkTier } from '../src/lib/solver.ts'
import {
  MELD_POINTS_PER_CARD,
  TIER_POINTS,
  type MeldRung,
  canLayOff,
  connectivity,
  creditNames,
  cpuTossOrKeep,
  deal,
  GENRE_FLOOR,
  isWild,
  ladderPtsPerCard,
  meldCommon,
  meldRung,
  mostConnectiveTop,
  wildMovie,
  WILD_IDS,
} from '../src/lib/duel.ts'
import {
  type Knobs,
  HUMAN_CASUAL,
  KNOBS,
  banksMeld,
  bestPilePlay,
  knownBestMeld,
  knownLegalPlays,
  knownShared,
  ladderBestMeld,
  legalCardsAnyPile,
  mayRecast,
  meldGainFromTake,
  pickDraw,
  pickPlay,
  whiffs,
} from '../src/lib/difficulty.ts'
import { type Rng, makeRng } from './rng.ts'
import { wilson, pairedDiff, diffCI } from './stats.ts'

export type Who = 'A' | 'B'

// Rule variants still under evaluation (all default OFF). The four funpass
// winners that USED to live here as flags — take-to-meld, meld ladder, genre
// floor (=3), and wilds — are now LOCKED and UNCONDITIONAL: they're the base
// game, not options. They ride in every game; the gate proves them in §7. The
// remaining toggles below stay as A/B scaffolding for differential invariants
// (e.g. "draw-3 burns vs shipped doesn't"). See sim/RULESET.md / funpass memory.
export interface Rules {
  draw3?: boolean // draw 3, keep 1, burn the other 2
  marquee?: boolean // face-up market of 3: take 1 visible card, refill from deck
  marqueeCull?: number // marquee: evict the N brickiest leftovers per draft (0 = no burn)
  doubleFeature?: boolean // two side-by-side pile tops; play onto either one
  targetScore?: number // ending: first to N played points ends the game
  goOutBonus?: number // ending: bonus points for emptying your hand
}

// Event stream for flow analysis. 'turn' fires once per turn with the
// situation the mover faced; action events follow.
export type Ev =
  | { t: 'deal'; starter: string; handA: string[]; handB: string[]; deck: string[]; piles: string[][] }
  | { t: 'turn'; who: Who; hand: number; oppHand: number; legal: number; meldAvail: boolean; layoffAvail: boolean; deck: number }
  | { t: 'play'; who: Who; id: string; pts: number; tier: LinkTier; deep: boolean; runN: number; drew: boolean }
  | { t: 'meld'; who: Who; n: number; pts: number; rung?: MeldRung }
  | { t: 'layoff'; who: Who; id: string }
  | { t: 'draw'; who: Who; id: string; connected: boolean; kept: boolean; tossed: boolean }
  | { t: 'take'; who: Who; id: string; pileIdx: number; reseeded: boolean }
  | { t: 'wild'; who: Who; id: string; via: 'play' | 'meld' }
  | { t: 'pass'; who: Who }
  | { t: 'recast'; who: Who; against: 'super' | 'finalCut' }
  | { t: 'fc'; who: Who; id: string }
  | { t: 'end'; reason: string; netA: number; netB: number; scoreA: number; scoreB: number; handA: number; handB: number; turns: number; burned: number }

export type Recorder = (e: Ev) => void

export interface SimMeld {
  cardIds: string[]
  people: string[]
  series: string | null
  rungPts?: number // per-card points locked at bank time under `meldLadder`
}
export interface State {
  piles: string[][] // 1 pile normally; 2 side-by-side tops under Double Feature
  hands: Record<Who, string[]>
  deck: string[]
  burned: string[] // cards permanently out of play (draw-3-keep-1 burns 2/draw)
  market?: string[] // face-up draft row under `marquee` (absent/[] when off)
  scores: Record<Who, number>
  tokens: Record<Who, { finalCut: boolean; recast: boolean }>
  knobs: Record<Who, Knobs>
  melds: SimMeld[]
  passStreak: number
  over: boolean
  endReason: 'AOut' | 'BOut' | 'stalemate' | 'target' | null
  rules: Rules
  rec?: Recorder
}

// Wild cards (`wilds`) — identity, the blank Movies and per-card scoring all live
// in the shared engine (src/lib/duel.ts) so React recognises & scores them the
// same. The sim resolves ids → Movies via `mv` (wild or canonical) and keeps the
// id-array `topOf` below: the same skip-trailing-wilds algorithm as the engine's
// topForLinking, kept on ids here to stay off the per-turn Movie-mapping hot path.
const mv = (id: string): Movie => wildMovie(id) ?? movieById.get(id)!
const other = (w: Who): Who => (w === 'A' ? 'B' : 'A')
const topOf = (pile: string[]): Movie => {
  for (let i = pile.length - 1; i >= 0; i--) if (!isWild(pile[i])) return mv(pile[i])
  return mv(pile[pile.length - 1]) // all-wild pile can't happen (starter is real)
}

// ── Conservation (#2): every card lives in exactly one zone, always ─────────

// All card ids across every zone. Sum must be the full 89-card deck, no more.
function cardCensus(s: State): string[] {
  return [
    ...s.piles.flat(),
    ...s.hands.A,
    ...s.hands.B,
    ...s.deck,
    ...s.melds.flatMap((m) => m.cardIds),
    ...s.burned,
    ...(s.market ?? []),
  ]
}

// Pure check on a census: returns an error string, or null if conserved.
// Exported so the test suite can exercise the detector on crafted inputs.
export function validateCensus(ids: string[]): string | null {
  if (ids.length !== MOVIES.length) return `card count ${ids.length} ≠ ${MOVIES.length}`
  const set = new Set(ids)
  if (set.size !== ids.length) return `${ids.length - set.size} duplicate card(s)`
  for (const id of ids) if (!movieById.has(id)) return `unknown card id "${id}"`
  return null
}

function assertConservation(s: State, label: string): void {
  const census = cardCensus(s)
  // Wilds aren't in the canonical pool — validate the real cards on their own,
  // then confirm the 3 wilds (always in play now) are each present exactly once.
  const reals = census.filter((id) => !isWild(id))
  const err = validateCensus(reals)
  if (err) throw new Error(`conservation violated at ${label}: ${err}`)
  const wilds = census.filter(isWild)
  if (wilds.length !== WILD_IDS.length || new Set(wilds).size !== WILD_IDS.length)
    throw new Error(`wild conservation violated at ${label}: have [${wilds.join(',')}]`)
}

function unseenFor(s: State, who: Who, extra: string[] = []): Movie[] {
  const seen = new Set([...s.piles.flat(), ...s.hands[who], ...extra])
  return MOVIES.filter((m) => !seen.has(m.id))
}

// The current top of each pile (one entry, or two under Double Feature).
function tops(s: State): Movie[] {
  return s.piles.map(topOf)
}

// The multi-pile decision helpers (legalCardsAnyPile, bestPilePlay) and the
// brick-denial yardstick (mostConnectiveTop) now live in the shared engine
// (src/lib/difficulty.ts and src/lib/duel.ts) so React calls the EXACT same
// code — parity by construction. They take plain `tops: Movie[]`, so call them
// with `tops(s)`. The draw-3 selection lives there too as `pickDraw`; the sim's
// `drawCards` (below) still owns the deck/`burned` mutation and delegates choice.

// End the game because `who` emptied their hand — paying the go-out bonus if
// the active ending rule grants one.
function goOut(s: State, who: Who): void {
  s.scores[who] += s.rules.goOutBonus ?? 0
  s.over = true
  s.endReason = who === 'A' ? 'AOut' : 'BOut'
}

// Resolve a committed play: score it, shed the card, return what it opened.
// Mirrors resolveCpuPlay/playerPlay: tier/points use the FULL link (what both
// players actually see happen), regardless of what the mover "knew".
function applyPlay(
  s: State,
  who: Who,
  id: string,
  opts: { drew: boolean; finalCut: boolean; runN?: number; pileIdx: number },
): { wentOut: boolean; encore: boolean; runPeople: string[] } {
  const pile = s.piles[opts.pileIdx]
  const top = topOf(pile)
  const card = mv(id)
  const shared = sharedPeople(top, card)
  const tier = opts.finalCut ? null : linkTier(top, card, shared)
  const points = opts.finalCut ? 1 : TIER_POINTS[tier!]
  const handAfter = opts.drew ? s.hands[who] : s.hands[who].filter((c) => c !== id)
  pile.push(id)
  s.hands[who] = handAfter
  s.scores[who] += points
  s.passStreak = 0
  if (opts.finalCut) {
    s.tokens[who].finalCut = false
    s.rec?.({ t: 'fc', who, id })
  } else {
    s.rec?.({
      t: 'play',
      who,
      id,
      pts: points,
      tier: tier!,
      deep: shared.length > 0 && shared.every((sp) => sp.deep),
      runN: opts.runN ?? 1,
      drew: opts.drew,
    })
  }
  if (handAfter.length === 0) {
    goOut(s, who)
    return { wentOut: true, encore: false, runPeople: [] }
  }
  const encore = tier === 'super'
  return { wentOut: false, encore, runPeople: shared.map((sp) => sp.name) }
}

// Meld ladder (`meldLadder`) — "highest rung wins": a meld scores per-card by the
// strongest through-line ALL its cards share (Auteur > Actor > Series > Genre).
// Classification (meldRung/ladderPtsPerCard) and the value-chasing selector
// (ladderBestMeld) live in the shared engine; the sim just routes them by rule.

// The meld the agent will pursue: highest-value under the ladder, else largest.
function bestMeld(_s: State, hand: Movie[], k: Knobs): Movie[] | null {
  // Always value-chasing under the meld ladder, with genre melds (floor 3) and
  // wild filler — the locked base game.
  return ladderBestMeld(hand, k, GENRE_FLOOR, true)
}

function bankMeld(s: State, who: Who, cards: Movie[]): void {
  const reals = cards.filter((c) => !isWild(c.id)) // wilds: filler, identity & 0 pts
  const { people, series } = meldCommon(reals) // wild credits are empty — exclude them
  const ids = cards.map((c) => c.id)
  const k = s.knobs[who]
  const perCard = ladderPtsPerCard(reals, k.deepMelds, GENRE_FLOOR) // ladder always on
  const rung = meldRung(reals, k.deepMelds, GENRE_FLOOR)
  const pts = reals.length * perCard // wild cards pay nothing
  s.melds.push({ cardIds: ids, people, series, rungPts: perCard })
  s.hands[who] = s.hands[who].filter((id) => !ids.includes(id))
  s.scores[who] += pts
  s.passStreak = 0
  s.rec?.({ t: 'meld', who, n: cards.length, pts, rung })
  for (const c of cards) if (isWild(c.id)) s.rec?.({ t: 'wild', who, id: c.id, via: 'meld' })
  if (s.hands[who].length === 0) goOut(s, who)
}

function doLayoff(s: State, who: Who, card: Movie, meld: SimMeld): void {
  meld.cardIds.push(card.id)
  meld.people = meld.people.filter((p) => creditNames(card).has(p))
  meld.series = card.series === meld.series ? meld.series : null
  s.hands[who] = s.hands[who].filter((id) => id !== card.id)
  s.scores[who] += meld.rungPts ?? MELD_POINTS_PER_CARD // locked rung under the ladder
  s.passStreak = 0
  s.rec?.({ t: 'layoff', who, id: card.id })
  if (s.hands[who].length === 0) goOut(s, who)
}

function cheapestLayoff(s: State, who: Who): { card: Movie; meld: SimMeld } | null {
  if (s.melds.length === 0) return null
  const unseen = unseenFor(s, who)
  let best: { card: Movie; meld: SimMeld } | null = null
  let bestConn = Infinity
  for (const id of s.hands[who]) {
    const c = mv(id)
    for (const meld of s.melds) {
      if (canLayOff(c, meld)) {
        const conn = connectivity(c, unseen)
        if (conn < bestConn) {
          bestConn = conn
          best = { card: c, meld }
        }
      }
    }
  }
  return best
}

function doPass(s: State, who: Who): void {
  s.passStreak += 1
  s.rec?.({ t: 'pass', who })
  if (s.passStreak >= 2) {
    s.over = true
    s.endReason = 'stalemate'
  }
}

// Play a wild on anything for +0 (universal link / pure unstick). Transparent on
// the pile (topOf skips it). Returns false if the hand holds no wild.
function playWild(s: State, who: Who): boolean {
  const wildId = s.hands[who].find(isWild)
  if (wildId === undefined) return false
  s.hands[who] = s.hands[who].filter((id) => id !== wildId)
  s.piles[0].push(wildId)
  s.passStreak = 0
  s.rec?.({ t: 'wild', who, id: wildId, via: 'play' })
  if (s.hands[who].length === 0) goOut(s, who)
  return true
}

// The opponent's chance to cancel a super / Final Cut before it lands.
function recastIntercepts(
  s: State,
  mover: Who,
  isSuper: boolean,
  finalCut: boolean,
  wouldGoOut: boolean,
): boolean {
  const def = other(mover)
  if (!s.tokens[def].recast) return false
  if (!isSuper && !finalCut) return false
  const want = mayRecast(s.knobs[def], {
    wouldGoOut,
    isSuper,
    playerScore: s.scores[mover],
    cpuScore: s.scores[def],
  })
  if (!want) return false
  s.tokens[def].recast = false
  if (finalCut) s.tokens[mover].finalCut = false // a canceled Final Cut is spent
  s.passStreak = 0
  s.rec?.({ t: 'recast', who: def, against: finalCut ? 'finalCut' : 'super' })
  return true
}

const MARQUEE_SIZE = 3 // face-up draft row size under the `marquee` rule

// Can the mover draw this turn? Under the Marquee they pull from the face-up
// market (refilled from the deck); otherwise straight off the deck.
function canDraw(s: State): boolean {
  return s.rules.marquee ? (s.market?.length ?? 0) > 0 : s.deck.length > 0
}

// Draw under the active rules. Returns the chosen card id (already removed
// from the deck along with any burned extras).
export function drawCards(s: State, who: Who, ts: Movie[], k: Knobs): string {
  if (s.rules.marquee) {
    // Face-up market: take the most useful VISIBLE card (one that links to a
    // top, else the most-connective brick), then refill from the deck. Seeing
    // the options turns a blind draw into a plan. Reuses pickDraw's selection so
    // the choice matches the agent's knowledge/policy.
    const market = (s.market ?? []).map(mv)
    const { keep } = pickDraw(market, ts, k, unseenFor(s, who, s.market ?? []))
    let rest = (s.market ?? []).filter((id) => id !== keep.id)
    // Self-cleaning: evict the N brickiest leftovers (least future connectivity)
    // so the row can't silt up with un-playable cards — this is the cull that a
    // pure no-burn market loses. cull 0 = pure; cull 2 ≈ draw-3 with a visible row.
    const cull = s.rules.marqueeCull ?? 0
    if (cull > 0 && rest.length > 0) {
      const unseen = unseenFor(s, who, [keep.id, ...rest])
      rest = rest.sort((a, b) => connectivity(mv(a), unseen) - connectivity(mv(b), unseen))
      s.burned.push(...rest.slice(0, cull))
      rest = rest.slice(cull)
    }
    while (rest.length < MARQUEE_SIZE && s.deck.length > 0) {
      rest.push(s.deck[0])
      s.deck = s.deck.slice(1)
    }
    s.market = rest
    return keep.id
  }
  if (!s.rules.draw3) {
    const [drawn, ...rest] = s.deck
    s.deck = rest
    return drawn
  }
  // Draw 3, keep 1, burn 2. pickDraw (shared engine) owns the CHOICE; we own the
  // deck slice + burned-zone mutation. `unseen` excludes the 3 revealed cards, so
  // a brick's connectivity isn't inflated by its own drawn siblings.
  const take = s.deck.slice(0, 3)
  s.deck = s.deck.slice(take.length)
  // A wild has 0 connectivity, so pickDraw would always burn it as the "worst"
  // card — but a player obviously KEEPS a universal wild. Override: keep a drawn
  // wild, burn the other two (else wilds never reach a hand to be tested).
  const wildInTake = take.find(isWild)
  if (wildInTake !== undefined) {
    s.burned.push(...take.filter((id) => id !== wildInTake))
    return wildInTake
  }
  const { keep, burn } = pickDraw(take.map(mv), ts, k, unseenFor(s, who, take))
  // The cards we didn't keep leave play — track them so conservation holds.
  s.burned.push(...burn.map((c) => c.id))
  return keep.id
}

// Rummy take-from-pile (base game): instead of drawing/playing, the mover lifts
// a pile TOP into hand to COMPLETE A MELD it can't bank from hand alone — banked
// next turn (rule: no immediate play after taking). This is the dominant real
// use: a top that merely *links* to your hand is already a legal pile play, so
// the take only adds value by turning two stranded cards into a 3-card meld
// (incl. SERIES melds, which aren't even a playable link). Never a brick — held
// cards subtract from net score. The meld-seeking knob downstream still gates the
// COMMIT, so a sloppy Matinee player takes less often (parity of intent). LOCKED
// as purposeful take-to-meld (2026-06-28): a no-limit hoarding probe was rejected.
// Returns the (card, pile) whose meld is largest, or null.
function takeToMeld(s: State, who: Who, k: Knobs): { card: Movie; meldN: number; pileIdx: number } | null {
  const hand = s.hands[who].map(mv)
  let best: { card: Movie; meldN: number; pileIdx: number } | null = null
  s.piles.forEach((pile, i) => {
    if (pile.length === 0) return
    // A wild covering the marquee blocks the take: the linking top is the real
    // card BENEATH it (wilds are transparent), but it's not the physical top, so
    // it can't be lifted without disturbing the wild. Skip — take only the bare top.
    if (isWild(pile[pile.length - 1])) return
    // Lifting the last card empties the pile; only OK if the deck can reseed it
    // (keeps Double Feature's two anchors and keeps tops() well-defined).
    if (pile.length === 1 && s.deck.length === 0) return
    const T = topOf(pile)
    // The shared brain owns the "does taking T form a meld?" decision (incl. the
    // already-meldable short-circuit); the sim owns which piles are takeable.
    const meldN = meldGainFromTake(hand, T, k)
    if (meldN > 0 && (!best || meldN > best.meldN)) best = { card: T, meldN, pileIdx: i }
  })
  return best
}

// Lift a pile top into hand (no immediate play — the turn ends). Reseeds an
// emptied pile from the deck top so the standing-row count is preserved.
// takeToMeld guarantees the physical top is the (real) linking card — never a
// wild — so popping the last element removes exactly `card`.
function doTake(s: State, who: Who, card: Movie, pileIdx: number): void {
  const pile = s.piles[pileIdx]
  pile.pop()
  s.hands[who].push(card.id)
  let reseeded = false
  if (pile.length === 0 && s.deck.length > 0) {
    pile.push(s.deck[0])
    s.deck = s.deck.slice(1)
    reseeded = true
  }
  s.passStreak = 0
  s.rec?.({ t: 'take', who, id: card.id, pileIdx, reseeded })
}

// One full turn for `who`. Mirrors the decision order in DuelGame's CPU effect.
// Under Double Feature there are two tops; every pile decision picks the best
// (card, pile) pair, but a run stays on the pile it started building.
function takeTurn(s: State, who: Who, rng: Rng): void {
  const k = s.knobs[who]
  let run: { people: string[]; count: number; pileIdx: number } | null = null

  // Up to a few actions per turn (runs/encores); cap guards against loops.
  for (let step = 0; step < 8 && !s.over; step++) {
    const hand = s.hands[who].map(mv)
    const unseen = unseenFor(s, who)
    const legalCards = legalCardsAnyPile(tops(s), hand, k)

    if (step === 0) {
      s.rec?.({
        t: 'turn',
        who,
        hand: hand.length,
        oppHand: s.hands[other(who)].length,
        legal: legalCards.length,
        meldAvail: knownBestMeld(hand, k) !== null,
        layoffAvail: cheapestLayoff(s, who) !== null,
        deck: s.deck.length,
      })
    }

    if (run) {
      const top = topOf(s.piles[run.pileIdx])
      const chain = knownLegalPlays(top, hand, k).filter((c) =>
        knownShared(top, c, k).some((sp) => run!.people.includes(sp.name)),
      )
      if (chain.length === 0) return
      const pick = pickPlay(top, chain, unseen, k, rng)
      const isSuper = linkTier(top, pick, sharedPeople(top, pick)) === 'super'
      const wouldGoOut = s.hands[who].length === 1
      if (recastIntercepts(s, who, isSuper, false, wouldGoOut)) return
      const r = applyPlay(s, who, pick.id, {
        drew: false,
        finalCut: false,
        runN: run.count + 1,
        pileIdx: run.pileIdx,
      })
      if (r.wentOut) return
      if (r.encore) {
        run = null
        continue
      }
      const played = run.count + 1
      const narrowed = run.people.filter((p) => r.runPeople.includes(p))
      const chains =
        played < 3 &&
        s.hands[who].some((h) =>
          sharedPeople(pick, mv(h)).some((sp) => narrowed.includes(sp.name)),
        )
      if (chains) {
        run = { people: narrowed, count: played, pileIdx: run.pileIdx }
        continue
      }
      return
    }

    // Bank the best meld (highest-value under the ladder), gated by miss/lazy knobs
    const meldable = bestMeld(s, hand, k)
    if (meldable && banksMeld(meldable.length, legalCards.length > 0, k, rng)) {
      bankMeld(s, who, meldable)
      return
    }

    const layoff = cheapestLayoff(s, who)

    // Casual whiff: overlook a playable link, just draw (or pass)
    if (legalCards.length > 0 && whiffs(k, rng)) {
      if (canDraw(s)) {
        const drawn = drawCards(s, who, tops(s), k)
        s.hands[who].push(drawn)
        s.passStreak = 0
        s.rec?.({ t: 'draw', who, id: drawn, connected: false, kept: true, tossed: false })
      } else doPass(s, who)
      return
    }

    const fcWinsNow =
      s.tokens[who].finalCut &&
      s.hands[who].length === 1 &&
      s.scores[who] + 1 > s.scores[other(who)] - s.hands[other(who)].length

    const bpp = bestPilePlay(tops(s), hand, unseen, k, rng)
    // Rummy take-to-meld: forgo a weak play to lift a meld-completing top into
    // hand (banked next turn). Skip if a super (+4 + encore) or a winning Final
    // Cut is on the table — those outrank a one-turn-delayed meld.
    const tmeld = takeToMeld(s, who, k)
    if (tmeld && !fcWinsNow && banksMeld(tmeld.meldN, legalCards.length > 0, k, rng)) {
      const bppTop = bpp ? topOf(s.piles[bpp.pileIdx]) : null
      const bppTier = bppTop ? linkTier(bppTop, bpp!.card, sharedPeople(bppTop, bpp!.card)) : null
      if (bppTier !== 'super') {
        doTake(s, who, tmeld.card, tmeld.pileIdx)
        return
      }
    }
    if (bpp) {
      const top = topOf(s.piles[bpp.pileIdx])
      const tier = linkTier(top, bpp.card, sharedPeople(top, bpp.card))
      if (layoff && TIER_POINTS[tier] < (layoff.meld.rungPts ?? MELD_POINTS_PER_CARD)) {
        doLayoff(s, who, layoff.card, layoff.meld)
        return
      }
      const isSuper = tier === 'super'
      const wouldGoOut = s.hands[who].length === 1
      if (recastIntercepts(s, who, isSuper, false, wouldGoOut)) return
      const r = applyPlay(s, who, bpp.card.id, { drew: false, finalCut: false, pileIdx: bpp.pileIdx })
      if (r.wentOut) return
      if (r.encore) {
        run = null
        continue
      }
      const chains = s.hands[who].some((h) =>
        sharedPeople(bpp.card, mv(h)).some((sp) => r.runPeople.includes(sp.name)),
      )
      if (chains) {
        run = { people: r.runPeople, count: 1, pileIdx: bpp.pileIdx }
        continue
      }
      return
    }

    if (fcWinsNow) {
      if (recastIntercepts(s, who, false, true, true)) return
      applyPlay(s, who, s.hands[who][0], { drew: false, finalCut: true, pileIdx: 0 })
      return
    }

    if (layoff) {
      doLayoff(s, who, layoff.card, layoff.meld)
      return
    }

    // Wild: go out on a lone wild (play-anything) rather than hold dead weight.
    if (s.hands[who].length === 1 && isWild(s.hands[who][0])) {
      playWild(s, who)
      return
    }

    if (canDraw(s)) {
      const drawn = drawCards(s, who, tops(s), k)
      const drawnMovie = mv(drawn)
      // A drawn wild is a universal filler — always keep it (never toss/play).
      if (isWild(drawn)) {
        s.hands[who].push(drawn)
        s.passStreak = 0
        s.rec?.({ t: 'draw', who, id: drawn, connected: false, kept: true, tossed: false })
        return
      }
      // Which top does the drawn card best connect to (per the agent's view)?
      let dpile = -1
      let dpts = -1
      s.piles.forEach((p, i) => {
        const sh = knownShared(topOf(p), drawnMovie, k)
        if (sh.length > 0) {
          const pts = TIER_POINTS[linkTier(topOf(p), drawnMovie, sh)]
          if (pts > dpts) {
            dpts = pts
            dpile = i
          }
        }
      })
      if (dpile >= 0) {
        const top = topOf(s.piles[dpile])
        const isSuper = linkTier(top, drawnMovie, sharedPeople(top, drawnMovie)) === 'super'
        s.hands[who].push(drawn)
        s.rec?.({ t: 'draw', who, id: drawn, connected: true, kept: false, tossed: false })
        if (recastIntercepts(s, who, isSuper, false, false)) return
        const r = applyPlay(s, who, drawn, { drew: false, finalCut: false, pileIdx: dpile })
        if (r.wentOut) return
        if (r.encore) {
          run = null
          continue
        }
        const chains = s.hands[who].some((h) =>
          sharedPeople(drawnMovie, mv(h)).some((sp) => r.runPeople.includes(sp.name)),
        )
        if (chains) {
          run = { people: r.runPeople, count: 1, pileIdx: dpile }
          continue
        }
        return
      }
      // Connects nowhere: bury it on the most useful top (denial) or keep it
      const tgt = mostConnectiveTop(tops(s), unseen)
      if (cpuTossOrKeep(drawnMovie, topOf(s.piles[tgt]), unseenFor(s, who, [drawn])) === 'toss') {
        s.piles[tgt].push(drawn)
        s.rec?.({ t: 'draw', who, id: drawn, connected: false, kept: false, tossed: true })
      } else {
        s.hands[who].push(drawn)
        s.rec?.({ t: 'draw', who, id: drawn, connected: false, kept: true, tossed: false })
      }
      s.passStreak = 0
      return
    }

    if (s.tokens[who].finalCut) {
      // Deck empty, no play: dump the worst brick rather than pass
      let dump = s.hands[who][0]
      let dumpScore = Infinity
      for (const id of s.hands[who]) {
        const c = connectivity(mv(id), unseen)
        if (c < dumpScore) {
          dumpScore = c
          dump = id
        }
      }
      if (recastIntercepts(s, who, false, true, s.hands[who].length === 1)) return
      applyPlay(s, who, dump, { drew: false, finalCut: true, pileIdx: 0 })
      return
    }

    // Truly stuck (can't play/draw): shed a wild for +0 rather than pass.
    if (playWild(s, who)) return

    doPass(s, who)
    return
  }
}

export function playGame(
  playerKnobs: Knobs,
  cpuKnobs: Knobs,
  opts: { rules?: Rules; rec?: Recorder; seed?: number | string; index?: number; assert?: boolean } = {},
): 'A' | 'B' | 'draw' {
  const rules = opts.rules ?? {}
  // Paired deals (Common Random Numbers): when a seed is given, the DEAL stream
  // is keyed ONLY by the game index — never by the rules — so every variant of
  // game #i sees the identical shuffle. The decision stream is separate so agent
  // choices can't perturb which cards get dealt. No seed → live Math.random.
  const seeded = opts.seed !== undefined
  const idx = opts.index ?? 0
  const dealRng: Rng = seeded ? makeRng(opts.seed!, 'deal', idx) : Math.random
  const playRng: Rng = seeded ? makeRng(opts.seed!, 'play', idx) : Math.random
  const d = deal(MOVIES, 7, dealRng)
  let deck = d.deck
  const piles: string[][] = [[d.starterId]]
  if (rules.doubleFeature) {
    piles.push([deck[0]]) // a second marquee, seeded from the deck
    deck = deck.slice(1)
  }
  // The Marquee: a face-up draft row seeded from the deck top. A "draw" takes one
  // VISIBLE card (no burn) and refills the slot — see drawCards / canDraw.
  const market: string[] = []
  if (rules.marquee) {
    market.push(...deck.slice(0, MARQUEE_SIZE))
    deck = deck.slice(MARQUEE_SIZE)
  }
  // Wilds (3, always in play) enter only via the deck (never the opening piles/
  // hands), so they're drawn naturally. Spliced AFTER the pile/market seeds so the
  // real-card shuffle is untouched — paired (CRN) comparisons across the remaining
  // rule toggles stay valid.
  for (const wid of WILD_IDS) {
    const pos = Math.floor(dealRng() * (deck.length + 1))
    deck = [...deck.slice(0, pos), wid, ...deck.slice(pos)]
  }
  const s: State = {
    piles,
    hands: { A: d.playerHand, B: d.cpuHand },
    deck,
    burned: [],
    market,
    scores: { A: 0, B: 0 },
    tokens: { A: { finalCut: true, recast: true }, B: { finalCut: true, recast: true } },
    knobs: { A: playerKnobs, B: cpuKnobs },
    melds: [],
    passStreak: 0,
    over: false,
    endReason: null,
    rules,
    rec: opts.rec,
  }
  // Snapshot the opening before any card moves — lets a recorder verify that
  // paired deals truly land identical shuffles across variants.
  s.rec?.({
    t: 'deal',
    starter: d.starterId,
    handA: [...d.playerHand],
    handB: [...d.cpuHand],
    deck: [...deck],
    piles: piles.map((p) => [...p]),
  })
  if (opts.assert) assertConservation(s, 'deal')
  let turn: Who = 'A'
  let turns = 0
  let guard = 0
  while (!s.over && guard++ < 600) {
    takeTurn(s, turn, playRng)
    if (opts.assert) assertConservation(s, `turn ${turns} (${turn})`)
    if (!s.over && rules.targetScore && (s.scores.A >= rules.targetScore || s.scores.B >= rules.targetScore)) {
      s.over = true
      s.endReason = 'target'
    }
    turns++
    turn = other(turn)
  }
  const netA = s.scores.A - s.hands.A.length
  const netB = s.scores.B - s.hands.B.length
  s.rec?.({
    t: 'end',
    reason: s.endReason ?? 'guard',
    netA,
    netB,
    scoreA: s.scores.A,
    scoreB: s.scores.B,
    handA: s.hands.A.length,
    handB: s.hands.B.length,
    turns,
    burned: s.burned.length,
  })
  return netA > netB ? 'A' : netB > netA ? 'B' : 'draw'
}

// Returns per-game player results (1 = player win, 0 = not) so the caller can
// compute paired tier gaps. Prints the player win rate with its 95% Wilson CI.
function run(
  label: string,
  playerKnobs: Knobs,
  cpuKnobs: Knobs,
  games: number,
  seed?: number | string,
  assert?: boolean,
  rules: Rules = {},
): number[] {
  const res: number[] = []
  let a = 0
  let b = 0
  let draws = 0
  for (let i = 0; i < games; i++) {
    const r = playGame(playerKnobs, cpuKnobs, { rules, seed, index: i, assert })
    res.push(r === 'A' ? 1 : 0)
    if (r === 'A') a++
    else if (r === 'B') b++
    else draws++
  }
  const pct = (n: number) => ((100 * n) / games).toFixed(1).padStart(5)
  const ci = wilson(a, games)
  console.log(
    `${label.padEnd(26)}  player ${pct(a)}% [${(100 * ci.lo).toFixed(1)}–${(100 * ci.hi).toFixed(1)}]   cpu ${pct(b)}%   draw ${pct(draws)}%`,
  )
  return res
}

// CLI (only when run directly, so eval.ts can import without side effects)
const isMain = process.argv[1]?.endsWith('duel-sim.ts')
if (isMain) {
  // node sim/duel-sim.ts [games] [only] [--seed=N]
  //   only ∈ sanity|matinee|feature|directors ; --seed makes the run reproducible
  const argv = process.argv.slice(2)
  const seedArg = argv.find((a) => a.startsWith('--seed='))
  const raw = seedArg?.slice('--seed='.length)
  const seed = raw === undefined ? undefined : /^\d+$/.test(raw) ? Number(raw) : raw
  const assert = argv.includes('--assert')
  const pos = argv.filter((a) => !a.startsWith('--'))
  const GAMES = Number(pos[0] ?? 4000)
  const ONLY = pos[1]
  const want = (k: string) => !ONLY || ONLY === k
  console.log(`\n  ${GAMES} games per matchup — player = casual movie fan${seed !== undefined ? `  (seed ${seed})` : ''}${assert ? ' [asserts on]' : ''}\n`)
  // The shipped game IS the flow package (Double Feature + draw-3 + race-to-20),
  // so the CLI measures it by default — its numbers match `eval tune`. (Pass no
  // rules → old shipped single-pile behavior, kept available via the API.)
  const FLOW: Rules = { doubleFeature: true, draw3: true, targetScore: 20 }
  if (want('sanity')) {
    console.log('  SANITY (mirror match, expect ~50/50):')
    run('  casual vs casual', HUMAN_CASUAL, HUMAN_CASUAL, GAMES, seed, assert, FLOW)
  }
  console.log('\n  DIFFICULTY (flow package — player win-rate target → 65 / 50 / 41):')
  const res: Record<string, number[]> = {}
  if (want('matinee')) res.matinee = run('  vs Matinee   (target 65)', HUMAN_CASUAL, KNOBS.matinee, GAMES, seed, assert, FLOW)
  if (want('feature')) res.feature = run('  vs Feature   (target 50)', HUMAN_CASUAL, KNOBS.feature, GAMES, seed, assert, FLOW)
  if (want('directors')) res.directors = run("  vs Director's (target 41)", HUMAN_CASUAL, KNOBS.directors, GAMES, seed, assert, FLOW)
  // Paired tier gaps only mean something when the deals were paired (seeded).
  if (seed !== undefined) {
    const gaps: [string, string][] = [['matinee', 'feature'], ['feature', 'directors']]
    const showable = gaps.filter(([x, y]) => res[x] && res[y])
    if (showable.length > 0) {
      console.log('\n  PAIRED TIER GAPS (same deals — Δ player win rate, 95% CI):')
      for (const [x, y] of showable) console.log(`    ${x} − ${y}:  ${diffCI(pairedDiff(res[x], res[y]))}`)
    }
  }
  console.log('')
}
