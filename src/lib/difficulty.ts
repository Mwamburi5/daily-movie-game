import type { Movie } from '../data/types.ts'
import { sharedPeople, linkTier, type SharedPerson } from './solver.ts'
import { TIER_POINTS, connectivity, isWild, ladderPtsPerCard, DEFAULT_GENRE_FLOOR } from './duel.ts'

export type Difficulty = 'matinee' | 'feature' | 'directors'

export const DIFFICULTIES: Difficulty[] = ['matinee', 'feature', 'directors']

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; blurb: string; hints: number } // hints per game; 0 = no button
> = {
  matinee: { label: 'Matinee', blurb: 'Easygoing rival, hints on', hints: Infinity },
  feature: { label: 'Feature', blurb: 'A fair fight — 3 hints', hints: 3 },
  directors: { label: "Director's Cut", blurb: 'No hints — it sees everything', hints: 0 },
}

// Every agent — each CPU tier and the simulated casual player — is one Knobs
// profile. The React game reads the CPU's; the sim pits two profiles together.
export interface Knobs {
  // Knowledge: may the agent reason over deepCast (credits hidden on the card)?
  deepLinks: boolean // …for pile links
  deepMelds: boolean // …for banking melds
  // Card choice among legal plays the agent can "see"
  policy: 'random' | 'greedy' | 'greedyDenial'
  // Chance per turn the agent overlooks an available play and draws/passes
  whiff: number
  // Melds
  meldMissChance: number // chance to miss an available (known) meld
  meldLazy: boolean // bank only when big (4+) or no pile play — less robotic
  // Recast aggression
  recast: 'never' | 'gameLoss' | 'full'
}

export const KNOBS: Record<Difficulty, Knobs> = {
  matinee: {
    deepLinks: false,
    deepMelds: false,
    policy: 'random',
    whiff: 0.44,
    meldMissChance: 0.68,
    meldLazy: false,
    recast: 'never',
  },
  feature: {
    deepLinks: true,
    deepMelds: false,
    policy: 'greedy',
    whiff: 0.05,
    meldMissChance: 0,
    meldLazy: false, // re-tuned 2026-06-30: funpass winners lifted casual to ~52.5 on
    //                  Feature; eager melding (was lazy) claws it back toward 50. whiff
    //                  proved a no-op lever down here, so this is the real knob.
    recast: 'gameLoss',
  },
  directors: {
    deepLinks: true,
    deepMelds: true,
    policy: 'greedyDenial',
    whiff: 0.18,
    meldMissChance: 0,
    meldLazy: false,
    recast: 'full',
  },
}

// A casual movie fan: reads only the credits printed on the card, plays them
// decently but imperfectly, often misses melds. The sim's stand-in for "you".
export const HUMAN_CASUAL: Knobs = {
  deepLinks: false,
  deepMelds: false,
  policy: 'greedy',
  whiff: 0.22,
  meldMissChance: 0.45,
  meldLazy: false,
  // Casuals hold Recast too long — they stop a game-out, not a smart +4
  recast: 'gameLoss',
}

type Rng = () => number

// People shared on credits the agent can actually see (deep links filtered out)
export function visibleShared(a: Movie, b: Movie): SharedPerson[] {
  return sharedPeople(a, b).filter((s) => !s.deep)
}

// What this agent sees connecting two cards, given its knowledge
export function knownShared(top: Movie, card: Movie, k: Knobs): SharedPerson[] {
  return k.deepLinks ? sharedPeople(top, card) : visibleShared(top, card)
}

export function knownLegalPlays(top: Movie, hand: Movie[], k: Knobs): Movie[] {
  return hand.filter((m) => knownShared(top, m, k).length > 0)
}

// Double Feature generalization of knownLegalPlays: hand cards playable on AT
// LEAST ONE of the tops (the flow yardstick). With one top it's exactly
// knownLegalPlays(top, …); with two it's the union. (sim/RULESET.md §10.1)
export function legalCardsAnyPile(tops: Movie[], hand: Movie[], k: Knobs): Movie[] {
  return hand.filter((c) => tops.some((t) => knownShared(t, c, k).length > 0))
}

// Pick a card from the legal set per the agent's policy
export function pickPlay(
  top: Movie,
  legal: Movie[],
  unseen: Movie[],
  k: Knobs,
  rng: Rng = Math.random,
): Movie {
  if (k.policy === 'random') return legal[Math.floor(rng() * legal.length)]
  let bestPts = -1
  let bestDenial = Infinity
  let best = legal[0]
  const ties: Movie[] = []
  for (const c of legal) {
    const pts = TIER_POINTS[linkTier(top, c, knownShared(top, c, k))]
    if (k.policy === 'greedyDenial') {
      const denial = connectivity(c, unseen)
      if (pts > bestPts || (pts === bestPts && denial < bestDenial)) {
        bestPts = pts
        bestDenial = denial
        best = c
      }
    } else {
      if (pts > bestPts) {
        bestPts = pts
        ties.length = 0
        ties.push(c)
      } else if (pts === bestPts) ties.push(c)
    }
  }
  return k.policy === 'greedy' ? ties[Math.floor(rng() * ties.length)] : best
}

// Double Feature generalization of pickPlay: the best (card, pileIdx) across all
// tops, per the agent's policy. Reuses the single-top pickPlay per pile, then
// compares the piles' picks; with one top it returns exactly pickPlay's choice
// on pile 0 (shipped behavior preserved). (sim/RULESET.md §10.1)
export function bestPilePlay(
  tops: Movie[],
  hand: Movie[],
  unseen: Movie[],
  k: Knobs,
  rng: Rng = Math.random,
): { card: Movie; pileIdx: number } | null {
  const perPile = tops
    .map((top, i) => ({ i, top, legal: knownLegalPlays(top, hand, k) }))
    .filter((x) => x.legal.length > 0)
  if (perPile.length === 0) return null
  if (k.policy === 'random') {
    const cands: { card: Movie; pileIdx: number }[] = []
    for (const { i, legal } of perPile) for (const c of legal) cands.push({ card: c, pileIdx: i })
    return cands[Math.floor(rng() * cands.length)]
  }
  let best: { card: Movie; pileIdx: number } | null = null
  let bestPts = -1
  let bestDenial = Infinity
  for (const { i, top, legal } of perPile) {
    const pick = pickPlay(top, legal, unseen, k, rng)
    const pts = TIER_POINTS[linkTier(top, pick, knownShared(top, pick, k))]
    const denial = connectivity(pick, unseen)
    if (pts > bestPts || (pts === bestPts && denial < bestDenial)) {
      best = { card: pick, pileIdx: i }
      bestPts = pts
      bestDenial = denial
    }
  }
  return best
}

// Draw-3-keep-1 SELECTION (pure policy): from the 3 revealed cards keep the one
// that links best to ANY top (highest tier on offer), else the most-connective
// brick to hold for later; the other 2 are burned. The caller owns the deck and
// the burned zone. `unseen` must already EXCLUDE the 3 revealed cards, so a
// brick's connectivity isn't inflated by its own drawn siblings. (RULESET.md §9)
export function pickDraw(
  take: Movie[],
  tops: Movie[],
  k: Knobs,
  unseen: Movie[],
): { keep: Movie; burn: Movie[] } {
  let keep = take[0]
  let bestScore = -Infinity
  for (const m of take) {
    const bestTier = Math.max(
      -1,
      ...tops.map((t) =>
        knownShared(t, m, k).length > 0 ? TIER_POINTS[linkTier(t, m, sharedPeople(t, m))] : -1,
      ),
    )
    const score = bestTier >= 0 ? 100 + bestTier : connectivity(m, unseen)
    if (score > bestScore) {
      bestScore = score
      keep = m
    }
  }
  return { keep, burn: take.filter((c) => c !== keep) }
}

export function whiffs(k: Knobs, rng: Rng = Math.random): boolean {
  return rng() < k.whiff
}

function namesOf(m: Movie, includeDeep: boolean): string[] {
  const base = [...m.topCast, ...m.director, ...m.writers]
  return includeDeep && m.deepCast ? [...base, ...m.deepCast] : base
}

// Largest same-person/series group of 3+ the agent can see, gated by knowledge
export function knownBestMeld(hand: Movie[], k: Knobs): Movie[] | null {
  const groups = new Map<string, Movie[]>()
  const add = (key: string, m: Movie) => {
    const g = groups.get(key) ?? []
    g.push(m)
    groups.set(key, g)
  }
  for (const m of hand) {
    for (const name of new Set(namesOf(m, k.deepMelds))) add(`p:${name}`, m)
    if (m.series) add(`s:${m.series}`, m)
  }
  let best: Movie[] | null = null
  for (const g of groups.values()) {
    if (g.length >= 3 && (!best || g.length > best.length)) best = g
  }
  return best
}

// Like knownBestMeld, but selects the highest-VALUE group under the meld ladder
// (size × rung) so a ladder agent CHASES auteur melds rather than the merely
// largest set. When `genreFloor` is set, same-genre groups of that size also form
// melds (lowest rung) — a shed-rescue for bricky hands with no person/series
// link. When `useWilds`, a lone wild fills a person/series PAIR into a 3-meld
// (≥2 real, ≤1 wild); genre melds don't take wilds (a wild's genre is unique).
export function ladderBestMeld(
  hand: Movie[],
  k: Knobs,
  genreFloor?: number,
  useWilds = false,
): Movie[] | null {
  const real = hand.filter((m) => !isWild(m.id))
  const wild = useWilds ? hand.find((m) => isWild(m.id)) : undefined // ≤1 wild/meld
  const groups = new Map<string, Movie[]>()
  const add = (key: string, m: Movie) => {
    const g = groups.get(key) ?? []
    g.push(m)
    groups.set(key, g)
  }
  for (const m of real) {
    for (const name of new Set(namesOf(m, k.deepMelds))) add(`p:${name}`, m)
    if (m.series) add(`s:${m.series}`, m)
    if (genreFloor) add(`g:${m.genre}`, m)
  }
  let best: Movie[] | null = null
  let bestVal = 0
  const consider = (cards: Movie[]) => {
    const reals = cards.filter((c) => !isWild(c.id))
    const val = reals.length * ladderPtsPerCard(reals, k.deepMelds, genreFloor) // wild pays 0
    if (val > bestVal || (val === bestVal && best !== null && cards.length > best.length)) {
      bestVal = val
      best = cards
    }
  }
  for (const [key, g] of groups) {
    const isGenre = key.startsWith('g:')
    const min = isGenre ? (genreFloor ?? DEFAULT_GENRE_FLOOR) : 3
    if (g.length >= min) consider(g)
    else if (wild && !isGenre && g.length === 2) consider([...g, wild])
  }
  return best
}

// Take-to-meld brain (rummy): would lifting pile-top `top` into hand let the agent
// form a meld it can't bank from hand alone? Returns the resulting meld SIZE (≥3,
// with `top` in it) or 0. Uses size-based knownBestMeld (not the ladder) — the
// take is about turning stranded cards into ANY meld, value comes at bank time.
// Callers iterate their own pile tops and own the pile/deck mutation.
export function meldGainFromTake(hand: Movie[], top: Movie, k: Knobs): number {
  if (knownBestMeld(hand, k)) return 0 // already meldable from hand — no need to take
  const after = knownBestMeld([...hand, top], k)
  return after && after.length >= 3 && after.some((c) => c.id === top.id) ? after.length : 0
}

// Does the agent commit a known meld this turn?
export function banksMeld(
  meldSize: number,
  hasPilePlay: boolean,
  k: Knobs,
  rng: Rng = Math.random,
): boolean {
  if (k.meldMissChance > 0 && rng() < k.meldMissChance) return false
  if (k.meldLazy) return meldSize >= 4 || !hasPilePlay
  return true
}

export function mayRecast(
  k: Knobs,
  ctx: { wouldGoOut: boolean; isSuper: boolean; playerScore: number; cpuScore: number },
): boolean {
  if (k.recast === 'never') return false
  if (k.recast === 'gameLoss') return ctx.wouldGoOut
  return ctx.wouldGoOut || (ctx.isSuper && ctx.playerScore + 4 >= ctx.cpuScore)
}

// The hint: one playable card to pulse. Prefers a card linked through visible
// credits (so a beginner sees why), highest tier first; falls back to any legal
// play (including a deep cut) so the hint never lies about playability.
export function hintCard(top: Movie, hand: Movie[]): string | null {
  let best: { id: string; pts: number } | null = null
  for (const m of hand) {
    const vis = visibleShared(top, m)
    if (vis.length === 0) continue
    const pts = TIER_POINTS[linkTier(top, m, vis)]
    if (!best || pts > best.pts) best = { id: m.id, pts }
  }
  if (best) return best.id
  const anyLegal = hand.find((m) => sharedPeople(top, m).length > 0)
  return anyLegal ? anyLegal.id : null
}
