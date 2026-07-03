import type { Movie } from '../data/types.ts'
import { linkTier, sharedPeople, type LinkTier } from './solver.ts'

export const TIER_POINTS: Record<LinkTier, number> = { standard: 1, strong: 2, super: 4 }

// Race-to-target ending: the show also ends the moment a side reaches this many
// played points (highest NET still wins). Shared so React, the sim and eval all
// race to the same line. See sim/RULESET.md §9.
export const TARGET_SCORE = 20

export interface Deal {
  starterId: string
  playerHand: string[]
  cpuHand: string[]
  deck: string[]
}

// rng defaults to Math.random so the shipped app is unchanged; the sim passes
// a seeded stream for reproducible, paired deals.
function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function deal(movies: Movie[], handSize = 7, rng: () => number = Math.random): Deal {
  const ids = shuffle(movies.map((m) => m.id), rng)
  return {
    starterId: ids[0],
    playerHand: ids.slice(1, 1 + handSize),
    cpuHand: ids.slice(1 + handSize, 1 + handSize * 2),
    deck: ids.slice(1 + handSize * 2),
  }
}

export function legalPlays(top: Movie, hand: Movie[]): Movie[] {
  return hand.filter((m) => sharedPeople(top, m).length > 0)
}

// How many unseen movies could land on this card — the denial yardstick.
// Fair AI: "unseen" is everything outside the pile and the CPU's own hand,
// exactly what a card-counting human opponent could reason about.
export function connectivity(card: Movie, unseen: Movie[]): number {
  return unseen.filter((u) => sharedPeople(card, u).length > 0).length
}

// Of a set of pile tops, the index of the one the opponent could most easily
// build on — the best place to bury a brick (denial), and the top to judge a
// toss against. With one top it returns 0. (Multi-pile, but knobs-free, so it
// lives with the pure engine rather than difficulty.ts.)
export function mostConnectiveTop(tops: Movie[], unseen: Movie[]): number {
  let idx = 0
  let best = -1
  tops.forEach((t, i) => {
    const conn = connectivity(t, unseen)
    if (conn > best) {
      best = conn
      idx = i
    }
  })
  return idx
}

// CPU strategy: points-greedy — take the highest-scoring tier on offer
// (super also buys an encore), break ties by leaving the fewest unseen
// movies playable on the new top.
export function cpuChoose(top: Movie, legal: Movie[], unseen: Movie[]): Movie {
  let best = legal[0]
  let bestPts = -1
  let bestDenial = Infinity
  for (const candidate of legal) {
    const pts = TIER_POINTS[linkTier(top, candidate, sharedPeople(top, candidate))]
    const denial = connectivity(candidate, unseen)
    if (pts > bestPts || (pts === bestPts && denial < bestDenial)) {
      bestPts = pts
      bestDenial = denial
      best = candidate
    }
  }
  return best
}

// Stuck with an unplayable draw: toss it onto the pile if it makes a better
// brick than the current top (fewer unseen movies connect to it), otherwise
// keep it — a well-connected card will likely play later, and tossing it
// would gift the opponent options.
export function cpuTossOrKeep(drawn: Movie, top: Movie, unseen: Movie[]): 'toss' | 'keep' {
  return connectivity(drawn, unseen) < connectivity(top, unseen) ? 'toss' : 'keep'
}

// ── Melds ────────────────────────────────────────────────────────────────

export const MELD_POINTS_PER_CARD = 2

// A banked "marquee row": 3+ films sharing one person (or one series).
// `people` holds everyone credited on every card — it narrows as lay-offs
// arrive; `series` survives only while the whole row is one franchise.
// `rungPts`/`rungName` lock the meld-ladder rung at bank time ("highest rung
// wins, no surprise flip"): the per-card points and the display name don't
// change as lay-offs arrive. Absent on melds banked before the ladder existed.
export interface Meld {
  id: number
  cardIds: string[]
  people: string[]
  series: string | null
  rungPts?: number
  rungName?: string
}

export function creditNames(m: Movie): Set<string> {
  return new Set([...m.topCast, ...(m.deepCast ?? []), ...m.director, ...m.writers])
}

export function meldCommon(cards: Movie[]): { people: string[]; series: string | null } {
  let people = [...creditNames(cards[0])]
  for (const c of cards.slice(1)) {
    const names = creditNames(c)
    people = people.filter((p) => names.has(p))
  }
  const series =
    cards[0].series && cards.every((c) => c.series === cards[0].series)
      ? cards[0].series
      : null
  return { people, series }
}

// A legal meld is 3+ cards that share a through-line: a person, a series, or
// (genre floor) `genreFloor`+ of the same genre. At most ONE wild may fill in
// (≥2 real cards, wild scores 0); a wild can't join a genre set (its genre is
// private) and can't bridge two otherwise-unrelated cards.
export function isValidMeld(cards: Movie[], genreFloor: number = GENRE_FLOOR): boolean {
  if (cards.length < 3) return false
  const reals = cards.filter((c) => !isWild(c.id))
  const wilds = cards.length - reals.length
  if (wilds > 1 || reals.length < 2) return false
  const { people, series } = meldCommon(reals)
  if (people.length > 0 || series !== null) return true
  // Genre meld: no wild filler (unique genre breaks the set), all reals one genre.
  return wilds === 0 && reals.length >= genreFloor && reals.every((c) => c.genre === reals[0].genre)
}

export function canLayOff(card: Movie, meld: Pick<Meld, 'people' | 'series'>): boolean {
  if (meld.series && card.series === meld.series) return true
  const names = creditNames(card)
  return meld.people.some((p) => names.has(p))
}

// Largest legal meld in a hand, or null. Pure (visible-credit) twin of the CPU's
// knobs-aware ladderBestMeld — drives the player's "you have a meld" highlight and
// the take-to-meld helper. Groups by person/series/genre and lets one wild fill a
// person/series PAIR (≥2 real, ≤1 wild); genre sets don't take wilds.
export function bestMeld(hand: Movie[], genreFloor: number = GENRE_FLOOR): Movie[] | null {
  const real = hand.filter((m) => !isWild(m.id))
  const wild = hand.find((m) => isWild(m.id))
  const groups = new Map<string, Movie[]>()
  const add = (key: string, m: Movie) => {
    const g = groups.get(key) ?? []
    g.push(m)
    groups.set(key, g)
  }
  for (const m of real) {
    for (const name of creditNames(m)) add(`p:${name}`, m)
    if (m.series) add(`s:${m.series}`, m)
    add(`g:${m.genre}`, m)
  }
  let best: Movie[] | null = null
  const consider = (g: Movie[]) => {
    if (!best || g.length > best.length) best = g
  }
  for (const [key, g] of groups) {
    const isGenre = key.startsWith('g:')
    const min = isGenre ? genreFloor : 3
    if (g.length >= min) consider(g)
    else if (wild && !isGenre && g.length === 2) consider([...g, wild])
  }
  return best
}

// ── Wild cards ──────────────────────────────────────────────────────────────
// Three famous films act as pure mechanical wilds: play on anything for +0 (shed
// to unstick) or fill a meld (≤1/meld, ≥2 real, wild scores 0). Modeled as blank
// Movies — empty credits so they share nothing (shared-engine calls return []
// instead of crashing), each a UNIQUE private genre so 3 wilds can't form a genre
// meld. They never enter the canonical pool; the sim/React splice them into the
// deck at game start. Shared so React and the sim recognise & score them the same.
export const WILD_TITLES = ['12 Angry Men', 'Casablanca', 'Citizen Kane']
export const WILD_IDS = ['wild-12angry', 'wild-casablanca', 'wild-kane']
const WILD_SET = new Set(WILD_IDS)
export const isWild = (id: string): boolean => WILD_SET.has(id)
export const WILD_MOVIES: Movie[] = WILD_IDS.map((id, i) => ({
  id,
  title: WILD_TITLES[i],
  year: 0,
  director: [],
  writers: [],
  topCast: [],
  deepCast: [],
  posterColor: '',
  genre: `__wild${i}__`,
}))
const wildById = new Map(WILD_MOVIES.map((m) => [m.id, m]))
export const wildMovie = (id: string): Movie | undefined => wildById.get(id)

// The top card FOR LINKING — skips trailing wilds, which are transparent on a
// pile (the real card beneath shows through). An all-wild pile can't happen (the
// starter is always real). Operates on resolved Movies; callers map ids first.
// (The sim keeps an id-array twin of this loop on its hot path — same algorithm.)
export function topForLinking(pile: Movie[]): Movie {
  for (let i = pile.length - 1; i >= 0; i--) if (!isWild(pile[i].id)) return pile[i]
  return pile[pile.length - 1]
}

// ── Meld ladder ─────────────────────────────────────────────────────────────
// "Highest rung wins": a meld scores per-card by the strongest through-line ALL
// its cards share. Auteur (a shared director/writer) outranks Actor outranks
// Series outranks Genre. Replaces the flat MELD_POINTS_PER_CARD scoring.
export type MeldRung = 'auteur' | 'actor' | 'series' | 'genre'
export const LADDER_PTS: Record<MeldRung, number> = { auteur: 3, actor: 2, series: 1, genre: 1 }
// The locked genre meld-floor: N+ same-genre cards form a (lowest-rung) meld.
// Sim'd 3-vs-5 and LOCKED at 3 (2026-06-28). See sim/RULESET.md / funpass memory.
export const GENRE_FLOOR = 3
// Internal fallback only — used if a caller enables genre melds without a floor.
export const DEFAULT_GENRE_FLOOR = 5

// The first name appearing (via `pick`) on EVERY card — the shared director, the
// shared actor, etc. — or null if none. The label's source as well as the rung's.
function firstSharedName(cards: Movie[], pick: (m: Movie) => string[]): string | null {
  let common = new Set(pick(cards[0]))
  for (let i = 1; i < cards.length && common.size > 0; i++) {
    const here = new Set(pick(cards[i]))
    common = new Set([...common].filter((n) => here.has(n)))
  }
  return common.size > 0 ? [...common][0] : null
}

const auteurNames = (m: Movie): string[] => [...m.director, ...m.writers]
const actorNames = (m: Movie, deep: boolean): string[] => [...m.topCast, ...(deep ? (m.deepCast ?? []) : [])]

// Classify a banked meld's rung. `deep` mirrors the agent's deepMelds knowledge
// for the actor rung, so a sloppy agent's actor meld isn't credited via hidden
// cast. `genreFloor` (when genre melds are enabled) is the min same-genre count.
export function meldRung(cards: Movie[], deep: boolean, genreFloor?: number): MeldRung {
  const reals = cards.filter((c) => !isWild(c.id)) // wilds score 0 and define no rung
  if (firstSharedName(reals, auteurNames)) return 'auteur'
  if (firstSharedName(reals, (m) => actorNames(m, deep))) return 'actor'
  if (reals[0].series && reals.every((c) => c.series === reals[0].series)) return 'series'
  if (genreFloor && reals.length >= genreFloor && reals.every((c) => c.genre === reals[0].genre))
    return 'genre'
  return 'actor' // unreachable for a valid person/series meld; safe default
}

// The locked DISPLAY name for a meld, named by its highest rung ("highest rung
// wins"): the shared auteur, else shared actor, else the series, else the genre.
// Same ladder as meldRung — so a Murphy+Nolan row reads "Christopher Nolan", not
// the actor it was alphabetically built from. Stored at bank time; never flips.
export function meldRungName(cards: Movie[], deep: boolean, genreFloor?: number): string {
  const reals = cards.filter((c) => !isWild(c.id))
  const auteur = firstSharedName(reals, auteurNames)
  if (auteur) return auteur
  const actor = firstSharedName(reals, (m) => actorNames(m, deep))
  if (actor) return actor
  if (reals[0].series && reals.every((c) => c.series === reals[0].series))
    return reals[0].series.split('-').join(' ')
  if (genreFloor && reals.length >= genreFloor && reals.every((c) => c.genre === reals[0].genre))
    return reals[0].genre
  return reals[0].topCast[0] ?? reals[0].title
}

export const ladderPtsPerCard = (cards: Movie[], deep: boolean, genreFloor?: number): number =>
  LADDER_PTS[meldRung(cards, deep, genreFloor)]
