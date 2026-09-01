// Authoring-only 216-film wild-count comparison.
//
// This preserves the pre-cutover comparison: it runs the canonical Duel loop
// with the approved pool, the original three wild shells plus proposed additions,
// and the pre-retune CPU knobs. Runtime now ships the approved 216 + 16.
//
//   node sim/daily-duel-cutover-eval.ts 4000 --seed=200824 --assert
//   node sim/daily-duel-cutover-eval.ts 8000 --seed=200824 --assert

import { readFileSync, writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { MOVIES } from '../src/data/movies.ts'
import type { Movie } from '../src/data/types.ts'
import { HUMAN_CASUAL, KNOBS, type Knobs } from '../src/lib/difficulty.ts'
import { WILD_MOVIES } from '../src/lib/duel.ts'
import {
  applyProposedSeriesPolicy,
  MOVIES as OUTSIDE_MOVIES,
  PROPOSED_EXISTING_SERIES_OVERRIDES,
} from '../scripts/daily-duel-candidate.ts'
import { playGame, type Ev, type Rules, type Who } from './duel-sim.ts'
import { pairedDiff, wilson, type DiffInterval, type Interval } from './stats.ts'

const MODEL_JSON = resolve('docs/daily-duel-pool-model-data.json')
const TARGETS = { matinee: 0.65, feature: 0.5, directors: 0.41 } as const
const RULES: Rules = { doubleFeature: true, draw3: true, targetScore: 20 }

const argv = process.argv.slice(2)
const seedArg = argv.find((arg) => arg.startsWith('--seed='))
const countsArg = argv.find((arg) => arg.startsWith('--counts='))
const rawSeed = seedArg?.slice('--seed='.length) ?? '200824'
const SEED: number | string = /^\d+$/.test(rawSeed) ? Number(rawSeed) : rawSeed
const ASSERT = argv.includes('--assert')
const positional = argv.filter((arg) => !arg.startsWith('--'))
const GAMES = Number(positional[0] ?? 4000)
if (!Number.isInteger(GAMES) || GAMES <= 0) throw new Error(`invalid game count: ${positional[0]}`)
const WILD_COUNTS = (countsArg?.slice('--counts='.length).split(',').map(Number) ?? [7, 8, 9])
if (
  WILD_COUNTS.length === 0 ||
  WILD_COUNTS.some((count) => !Number.isInteger(count) || count < 1) ||
  new Set(WILD_COUNTS).size !== WILD_COUNTS.length
) {
  throw new Error(`invalid unique wild counts: ${countsArg ?? '(default)'}`)
}
const isDefaultComparison = WILD_COUNTS.join(',') === '7,8,9'
const OUTPUT_JSON = resolve(
  isDefaultComparison
    ? 'docs/daily-duel-wild-simulation-data.json'
    : 'docs/daily-duel-16-wild-simulation-data.json',
)
const OUTPUT_MARKDOWN = resolve(
  isDefaultComparison
    ? 'docs/daily-duel-wild-simulation-report.md'
    : 'docs/daily-duel-16-wild-simulation-report.md',
)

interface ModelData {
  baselineMatches: boolean
  models: { '200': { ids: string[]; digest: string } }
  approvedSelection: { ids: string[]; digest: string; realFilmTarget: number }
}

const model = JSON.parse(readFileSync(MODEL_JSON, 'utf8')) as ModelData
if (!model.baselineMatches) throw new Error('fallback model is drifting; cutover simulation refused')
if (model.approvedSelection.realFilmTarget !== 216 || model.approvedSelection.ids.length !== 216) {
  throw new Error('model JSON does not contain the approved 216-film slate')
}

const movieById = new Map([...MOVIES, ...OUTSIDE_MOVIES].map((movie) => [movie.id, movie]))
const pool = model.approvedSelection.ids.map((id) => {
  const movie = movieById.get(id)
  if (!movie) throw new Error(`approved 216 ID has no Movie object: ${id}`)
  return applyProposedSeriesPolicy(movie)
})
if (new Set(pool.map((movie) => movie.id)).size !== 216) throw new Error('approved pool IDs are not unique')

const ADDED_WILD_IDENTITIES = [
  { id: 'wild-wizard-of-oz', title: 'The Wizard of Oz' },
  { id: 'wild-2001', title: '2001: A Space Odyssey' },
  { id: 'wild-psycho', title: 'Psycho' },
  { id: 'wild-seven-samurai', title: 'Seven Samurai' },
  { id: 'wild-singin-in-the-rain', title: "Singin' in the Rain" },
  { id: 'wild-dr-strangelove', title: 'Dr. Strangelove' },
  { id: 'wild-vertigo', title: 'Vertigo' },
  { id: 'wild-tokyo-story', title: 'Tokyo Story' },
  { id: 'wild-bicycle-thieves', title: 'Bicycle Thieves' },
  { id: 'wild-in-the-mood-for-love', title: 'In the Mood for Love' },
  { id: 'wild-spirited-away', title: 'Spirited Away' },
  { id: 'wild-metropolis', title: 'Metropolis' },
  { id: 'wild-pather-panchali', title: 'Pather Panchali' },
] as const

const baselineWilds = WILD_MOVIES.slice(0, 3)
const addedWilds: Movie[] = ADDED_WILD_IDENTITIES.map((identity, index) => ({
  id: identity.id,
  title: identity.title,
  year: 0,
  director: [],
  writers: [],
  topCast: [],
  deepCast: [],
  posterColor: '',
  genre: `__wild${baselineWilds.length + index}__`,
}))
const allWilds = [...baselineWilds, ...addedWilds]
if (Math.max(...WILD_COUNTS) > allWilds.length) {
  throw new Error(`requested ${Math.max(...WILD_COUNTS)} wilds but only ${allWilds.length} identities exist`)
}

interface GameFlow {
  turns: number
  endReason: string
  netGap: number
  cardsHeld: number
  turnEvents: number
  deadTurns: number
  longestDeadStreak: number
  draws: number
  connectedDraws: number
  supers: number
  runs: number
  meldPoints: number
  recasts: number
  wildDrawn: number
  wildForceKept: number
  wildPlayed: number
  wildMelded: number
  wildBlockingTake: number
  wildHeldAtEnd: number
  wildCoveringPiles: number
  wildUsedToGoOut: number
  multiWildDraws: number
  wildCardsInMultiDraws: number
  wildBurned: number
  conservationPass: boolean
}

interface Aggregate {
  games: number
  turns: number
  endReasons: Record<string, number>
  netGap: number
  cardsHeld: number
  turnEvents: number
  deadTurns: number
  longestDeadStreak: number
  draws: number
  connectedDraws: number
  supers: number
  runs: number
  meldPoints: number
  recasts: number
  wildDrawn: number
  wildForceKept: number
  wildPlayed: number
  wildMelded: number
  wildBlockingTake: number
  wildHeldAtEnd: number
  wildCoveringPiles: number
  wildUsedToGoOut: number
  multiWildDraws: number
  wildCardsInMultiDraws: number
  wildBurned: number
  conservationFailures: number
}

interface RunResult {
  casualWins: number[]
  casualWinCI: Interval
  aggregate: Aggregate
}

const emptyAggregate = (): Aggregate => ({
  games: 0,
  turns: 0,
  endReasons: {},
  netGap: 0,
  cardsHeld: 0,
  turnEvents: 0,
  deadTurns: 0,
  longestDeadStreak: 0,
  draws: 0,
  connectedDraws: 0,
  supers: 0,
  runs: 0,
  meldPoints: 0,
  recasts: 0,
  wildDrawn: 0,
  wildForceKept: 0,
  wildPlayed: 0,
  wildMelded: 0,
  wildBlockingTake: 0,
  wildHeldAtEnd: 0,
  wildCoveringPiles: 0,
  wildUsedToGoOut: 0,
  multiWildDraws: 0,
  wildCardsInMultiDraws: 0,
  wildBurned: 0,
  conservationFailures: 0,
})

function addGame(total: Aggregate, game: GameFlow): void {
  total.games++
  total.turns += game.turns
  total.endReasons[game.endReason] = (total.endReasons[game.endReason] ?? 0) + 1
  for (const key of [
    'netGap',
    'cardsHeld',
    'turnEvents',
    'deadTurns',
    'longestDeadStreak',
    'draws',
    'connectedDraws',
    'supers',
    'runs',
    'meldPoints',
    'recasts',
    'wildDrawn',
    'wildForceKept',
    'wildPlayed',
    'wildMelded',
    'wildBlockingTake',
    'wildHeldAtEnd',
    'wildCoveringPiles',
    'wildUsedToGoOut',
    'multiWildDraws',
    'wildCardsInMultiDraws',
    'wildBurned',
  ] as const) {
    total[key] += game[key]
  }
  if (!game.conservationPass) total.conservationFailures++
}

function collect(a: Knobs, b: Knobs, casualSide: Who, wildMovies: Movie[]): RunResult {
  const outcomes: number[] = []
  const aggregate = emptyAggregate()
  const wildIds = new Set(wildMovies.map((movie) => movie.id))
  for (let index = 0; index < GAMES; index++) {
    const game: GameFlow = {
      turns: 0,
      endReason: '',
      netGap: 0,
      cardsHeld: 0,
      turnEvents: 0,
      deadTurns: 0,
      longestDeadStreak: 0,
      draws: 0,
      connectedDraws: 0,
      supers: 0,
      runs: 0,
      meldPoints: 0,
      recasts: 0,
      wildDrawn: 0,
      wildForceKept: 0,
      wildPlayed: 0,
      wildMelded: 0,
      wildBlockingTake: 0,
      wildHeldAtEnd: 0,
      wildCoveringPiles: 0,
      wildUsedToGoOut: 0,
      multiWildDraws: 0,
      wildCardsInMultiDraws: 0,
      wildBurned: 0,
      conservationPass: false,
    }
    let turnOpen = false
    let turnPoints = 0
    let deadStreak = 0
    const closeTurn = () => {
      if (!turnOpen) return
      if (turnPoints === 0) {
        game.deadTurns++
        deadStreak++
        game.longestDeadStreak = Math.max(game.longestDeadStreak, deadStreak)
      } else {
        deadStreak = 0
      }
      turnOpen = false
    }
    const rec = (event: Ev) => {
      switch (event.t) {
        case 'turn':
          closeTurn()
          turnOpen = true
          turnPoints = 0
          game.turnEvents++
          break
        case 'play':
          turnPoints += event.pts
          if (event.tier === 'super') game.supers++
          if (event.runN >= 2) game.runs++
          break
        case 'meld':
          turnPoints += event.pts
          game.meldPoints += event.pts
          break
        case 'layoff':
          turnPoints += 2
          break
        case 'fc':
          turnPoints += 1
          break
        case 'recast':
          game.recasts++
          break
        case 'draw':
          game.draws++
          if (event.connected) game.connectedDraws++
          if (wildIds.has(event.id)) {
            game.wildDrawn++
            if (event.kept && !event.tossed) game.wildForceKept++
          }
          break
        case 'wild':
          if (event.via === 'play') game.wildPlayed++
          else game.wildMelded++
          if (event.wentOut) game.wildUsedToGoOut++
          break
        case 'wild-block-take':
          game.wildBlockingTake++
          break
        case 'wild-multi-draw':
          game.multiWildDraws++
          game.wildCardsInMultiDraws += event.count
          break
        case 'end':
          closeTurn()
          game.turns = event.turns
          game.endReason = event.reason
          game.netGap = Math.abs(event.netA - event.netB)
          game.cardsHeld = event.handA + event.handB
          game.wildHeldAtEnd = event.wildHeldA + event.wildHeldB
          game.wildCoveringPiles = event.wildCoveringPiles
          game.wildBurned = event.wildBurned
          game.conservationPass =
            event.wildCensus === wildMovies.length &&
            event.uniqueWildCensus === wildMovies.length &&
            event.wildBurned === 0
          break
        default:
          break
      }
    }
    const result = playGame(a, b, { rules: RULES, rec, seed: SEED, index, assert: ASSERT, pool, wildMovies })
    outcomes.push(result === casualSide ? 1 : 0)
    addGame(aggregate, game)
  }
  return {
    casualWins: outcomes,
    casualWinCI: wilson(outcomes.reduce((sum, value) => sum + value, 0), outcomes.length),
    aggregate,
  }
}

const matchups = {
  matinee: { ...KNOBS.matinee, meldMissChance: 0.68 },
  feature: { ...KNOBS.feature, meldLazy: false },
  directors: { ...KNOBS.directors, meldMissChance: 0 },
} as const

const round = (value: number, digits = 3) => Number(value.toFixed(digits))
const rate = (num: number, den: number) => round(num / Math.max(den, 1))
const perGame = (num: number, games: number) => round(num / Math.max(games, 1))
const intervalJson = (value: Interval) => ({ p: round(value.p), lo: round(value.lo), hi: round(value.hi) })
const diffJson = (value: DiffInterval) => ({
  diff: round(value.diff),
  lo: round(value.lo),
  hi: round(value.hi),
  real: value.real,
})

function aggregateJson(total: Aggregate) {
  return {
    games: total.games,
    averageTurns: perGame(total.turns, total.games),
    endReasons: total.endReasons,
    stalemateRate: rate(total.endReasons.stalemate ?? 0, total.games),
    averageNetGap: perGame(total.netGap, total.games),
    averageCardsHeld: perGame(total.cardsHeld, total.games),
    deadTurnRate: rate(total.deadTurns, total.turnEvents),
    averageLongestDeadStreak: perGame(total.longestDeadStreak, total.games),
    drawConnectivityRate: rate(total.connectedDraws, total.draws),
    supersPerGame: perGame(total.supers, total.games),
    runsPerGame: perGame(total.runs, total.games),
    meldPointsPerGame: perGame(total.meldPoints, total.games),
    recastsPerGame: perGame(total.recasts, total.games),
    wildsDrawnPerGame: perGame(total.wildDrawn, total.games),
    wildForceKeepRate: rate(total.wildForceKept, total.wildDrawn),
    wildsPlayedPerGame: perGame(total.wildPlayed, total.games),
    wildsMeldedPerGame: perGame(total.wildMelded, total.games),
    wildBlocksTakePerGame: perGame(total.wildBlockingTake, total.games),
    wildsHeldAtEndPerGame: perGame(total.wildHeldAtEnd, total.games),
    wildCoveringPilesPerGame: perGame(total.wildCoveringPiles, total.games),
    wildGoOutsPerGame: perGame(total.wildUsedToGoOut, total.games),
    multiWildDrawsPerGame: perGame(total.multiWildDraws, total.games),
    wildCardsInMultiDrawsPerGame: perGame(total.wildCardsInMultiDraws, total.games),
    wildBurned: total.wildBurned,
    conservationFailures: total.conservationFailures,
  }
}

console.log(`Daily / Duel cutover sim: ${GAMES} games per matchup and mirror · seed ${SEED} · asserts ${ASSERT ? 'on' : 'off'}`)
const variants: Record<string, any> = {}
const rawByVariant: Record<string, Record<string, { forward: RunResult; mirror: RunResult }>> = {}
for (const wildCount of WILD_COUNTS) {
  const wildMovies = allWilds.slice(0, wildCount)
  const raw: Record<string, { forward: RunResult; mirror: RunResult }> = {}
  for (const [key, cpu] of Object.entries(matchups)) {
    raw[key] = {
      forward: collect(HUMAN_CASUAL, cpu, 'A', wildMovies),
      mirror: collect(cpu, HUMAN_CASUAL, 'B', wildMovies),
    }
  }
  rawByVariant[String(wildCount)] = raw
  const forwardAggregates = Object.values(raw).map((entry) => entry.forward.aggregate)
  const combined = emptyAggregate()
  for (const aggregate of forwardAggregates) {
    for (const key of Object.keys(aggregate.endReasons)) {
      combined.endReasons[key] = (combined.endReasons[key] ?? 0) + aggregate.endReasons[key]
    }
    for (const key of Object.keys(combined) as (keyof Aggregate)[]) {
      if (key === 'endReasons') continue
      ;(combined[key] as number) += aggregate[key] as number
    }
  }
  const results: Record<string, any> = {}
  for (const key of Object.keys(matchups)) {
    const entry = raw[key]
    results[key] = {
      target: TARGETS[key as keyof typeof TARGETS],
      forwardCasualWin: intervalJson(entry.forward.casualWinCI),
      mirrorCasualWin: intervalJson(entry.mirror.casualWinCI),
      firstPlayerMirrorDelta: diffJson(pairedDiff(entry.forward.casualWins, entry.mirror.casualWins)),
      flow: aggregateJson(entry.forward.aggregate),
    }
  }
  variants[String(wildCount)] = {
    wildCount,
    wildIds: wildMovies.map((movie) => movie.id),
    wildTitles: wildMovies.map((movie) => movie.title),
    realDrawCardsAfterSetup: 200,
    totalDrawCardsAfterSetup: 200 + wildCount,
    encounterShare: round(wildCount / (200 + wildCount), 5),
    targetDeviation: round(
      Object.entries(results).reduce(
        (sum, [key, result]) => sum + Math.abs(result.forwardCasualWin.p - TARGETS[key as keyof typeof TARGETS]),
        0,
      ),
      5,
    ),
    matchups: results,
    pairedTierGaps: {
      matineeMinusFeature: diffJson(pairedDiff(raw.matinee.forward.casualWins, raw.feature.forward.casualWins)),
      featureMinusDirectors: diffJson(pairedDiff(raw.feature.forward.casualWins, raw.directors.forward.casualWins)),
    },
    aggregateForwardFlow: aggregateJson(combined),
  }
  console.log(
    `  ${wildCount} wilds: M/F/D ${Object.values(results)
      .map((result: any) => `${(result.forwardCasualWin.p * 100).toFixed(1)}%`)
      .join(' / ')} · encounter ${(variants[String(wildCount)].encounterShare * 100).toFixed(2)}%`,
  )
}

const crossVariant: Record<string, Record<string, ReturnType<typeof diffJson>>> = {}
let maxAdjacentWinDifference = 0
for (let index = 1; index < WILD_COUNTS.length; index++) {
  const pair = [WILD_COUNTS[index - 1], WILD_COUNTS[index]] as const
  const key = `${pair[0]}-minus-${pair[1]}`
  crossVariant[key] = {}
  for (const matchup of Object.keys(matchups)) {
    const left = rawByVariant[String(pair[0])][matchup].forward.casualWins
    const right = rawByVariant[String(pair[1])][matchup].forward.casualWins
    const diff = pairedDiff(left, right)
    crossVariant[key][matchup] = diffJson(diff)
    maxAdjacentWinDifference = Math.max(maxAdjacentWinDifference, Math.abs(diff.diff))
  }
}

const rawTargetRecommendation = WILD_COUNTS
  .map((count) => variants[String(count)])
  .sort(
    (a, b) =>
      a.targetDeviation - b.targetDeviation ||
      Math.abs(a.encounterShare - 3 / 76) - Math.abs(b.encounterShare - 3 / 76) ||
      Math.abs(a.wildCount - 8) - Math.abs(b.wildCount - 8),
  )[0].wildCount as number
const eightVsNine = crossVariant['8-minus-9']
const eightVsNineIsNoise = eightVsNine
  ? Object.values(eightVsNine).every((value) => !value.real)
  : false
const nineTargetAdvantage =
  variants['8'] && variants['9'] ? variants['8'].targetDeviation - variants['9'].targetDeviation : 0
// A sub-1pp aggregate target advantage with no real paired matchup difference
// does not justify extra forced-wild hand pressure. Prefer 8's encounter parity.
const recommendedWildCount =
  rawTargetRecommendation === 9 && eightVsNineIsNoise && nineTargetAdvantage <= 0.01
    ? 8
    : rawTargetRecommendation

const data = {
  schemaVersion: 'matchcut-daily-duel-wild-simulation-v2',
  generatedAt: new Date().toISOString(),
  gamesPerMatchupAndMirror: GAMES,
  seed: SEED,
  assertionsEnabled: ASSERT,
  simulatedWildCounts: WILD_COUNTS,
  ownerDirectedWildCount: WILD_COUNTS.includes(16) ? 16 : null,
  pool: {
    realFilms: pool.length,
    digest: model.approvedSelection.digest,
    metadataStatus: 'buri-approved-policy-covered-tmdb-cast-rulings-and-series',
    proposedExistingSeriesOverrides: PROPOSED_EXISTING_SERIES_OVERRIDES,
  },
  baselineEncounterShare: round(3 / 76, 5),
  proposedIdentitySlate: allWilds.map((movie) => ({ id: movie.id, title: movie.title })),
  variants,
  crossVariant,
  maxAdjacentWinDifference: round(maxAdjacentWinDifference, 5),
  requires8000Followup: GAMES < 8000 && maxAdjacentWinDifference <= 0.02,
  evidenceRecommendation: recommendedWildCount,
  recommendationPolicy: isDefaultComparison
    ? 'lowest summed target deviation; statistically tied 8 vs 9 favors 8 for baseline encounter and lower forced-wild pressure'
    : 'lowest summed target deviation among the directly compared endpoints; owner direction is recorded separately',
}

const pct = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`
const ci = (value: { p: number; lo: number; hi: number }) =>
  `${pct(value.p)} [${pct(value.lo)}–${pct(value.hi)}]`
const diff = (value: { diff: number; lo: number; hi: number; real: boolean }) =>
  `${value.diff >= 0 ? '+' : ''}${(value.diff * 100).toFixed(1)}pp [${(value.lo * 100).toFixed(1)}–${(value.hi * 100).toFixed(1)}] ${value.real ? 'REAL' : 'noise'}`

const rows = WILD_COUNTS.map((count) => {
  const variant = variants[String(count)]
  const flow = variant.aggregateForwardFlow
  return `| ${count} | ${pct(variant.encounterShare, 2)} | ${ci(variant.matchups.matinee.forwardCasualWin)} | ${ci(variant.matchups.feature.forwardCasualWin)} | ${ci(variant.matchups.directors.forwardCasualWin)} | ${flow.averageTurns.toFixed(1)} | ${pct(flow.stalemateRate)} | ${pct(flow.deadTurnRate)} | ${pct(flow.drawConnectivityRate)} | ${flow.wildsDrawnPerGame.toFixed(2)} | ${flow.wildsPlayedPerGame.toFixed(2)} | ${flow.wildsMeldedPerGame.toFixed(2)} | ${flow.multiWildDrawsPerGame.toFixed(3)} | ${flow.wildBurned} | ${flow.conservationFailures} |`
})

const mirrorRows = WILD_COUNTS.flatMap((count) => {
  const variant = variants[String(count)]
  return Object.keys(matchups).map(
    (key) =>
      `| ${count} | ${key} | ${ci(variant.matchups[key].forwardCasualWin)} | ${ci(variant.matchups[key].mirrorCasualWin)} | ${diff(variant.matchups[key].firstPlayerMirrorDelta)} |`,
  )
})

const tierRows = WILD_COUNTS.map((count) => {
  const gaps = variants[String(count)].pairedTierGaps
  return `| ${count} | ${diff(gaps.matineeMinusFeature)} | ${diff(gaps.featureMinusDirectors)} |`
})

const wildRows = WILD_COUNTS.map((count) => {
  const flow = variants[String(count)].aggregateForwardFlow
  return `| ${count} | ${flow.wildForceKeepRate === 1 ? '100.0%' : pct(flow.wildForceKeepRate)} | ${flow.wildBlocksTakePerGame.toFixed(3)} | ${flow.wildsHeldAtEndPerGame.toFixed(3)} | ${flow.wildCoveringPilesPerGame.toFixed(3)} | ${flow.wildGoOutsPerGame.toFixed(3)} | ${flow.wildCardsInMultiDrawsPerGame.toFixed(3)} |`
})

const eightVsSixteen = crossVariant['8-minus-16']
const evidenceNarrative = WILD_COUNTS.includes(16)
  ? `Buri directed **16 total wilds** after the initial 8-wild checkpoint. The
evidence recommendation among the tested counts is **${recommendedWildCount}**.
Sixteen's encounter share is ${pct(variants['16'].encounterShare, 2)}, compared
with ${pct(variants['8'].encounterShare, 2)} at eight and ${pct(data.baselineEncounterShare, 2)}
for the live 89-real-plus-3-wild deck.${eightVsSixteen ? ` The paired 8-minus-16
player-win differences are Matinee ${diff(eightVsSixteen.matinee)}, Feature
${diff(eightVsSixteen.feature)}, and Director's ${diff(eightVsSixteen.directors)}.` : ''}
The 16-wild result is evidence for the owner-directed mechanic; it does not
silently alter the locked flow rules or authorize runtime cutover.`
  : `The evidence recommendation is **${recommendedWildCount} total wilds**. Nine's
raw summed target deviation is only ${(nineTargetAdvantage * 100).toFixed(1)}pp
better than eight, while every paired 8↔9 matchup difference is statistical
noise. Eight therefore wins on encounter parity and lower forced-wild pressure.`

const markdown = `# Daily / Duel 216-film wild-card simulation

**Generated:** ${data.generatedAt}

**Command:** \`node sim/daily-duel-cutover-eval.ts ${GAMES} --seed=${SEED}${ASSERT ? ' --assert' : ''}${countsArg ? ` ${countsArg}` : ''}\`

**Pool:** 216 real films · digest \`${model.approvedSelection.digest}\`

**Metadata status:** Buri approved the six policy-covered TMDB cast-list rulings
and the series assignments on 2026-08-25. The sim applies the authoring-only
series overrides \`top-gun → top-gun\` and \`the-avengers → avengers\` so
continuity scoring is not omitted before runtime cutover.

Each count uses the same 216 real cards, the same game-index deal/play seeds,
the locked flow rules, unique blank-credit wild shells, and full conservation
assertions. With 216 reals, setup leaves 200 real draw cards before wild insertion.

## Difficulty and flow

| Wilds | Draw-deck encounter | Matinee target 65 | Feature target 50 | Director's target 41 | Avg turns | Stalemate | Dead turns | Draw connects | Wilds drawn/game | Played/game | Melded/game | Multi-wild draws/game | Wilds burned | Conservation failures |
| ---: | ---: | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows.join('\n')}

## First-player fairness mirror

Forward has the casual player in seat A; mirror swaps the same two agents and
measures the casual player in seat B on the same seeded real-card shuffle.

| Wilds | Matchup | Casual starts | Casual second | Paired delta |
| ---: | --- | --- | --- | --- |
${mirrorRows.join('\n')}

## Paired tier gaps

| Wilds | Matinee − Feature | Feature − Director's |
| ---: | --- | --- |
${tierRows.join('\n')}

## Wild-specific flow

| Wilds | Force-kept | Blocks Take/game | Held at end/game | Covering pile/game | Used to go out/game | Wild cards in multi-draws/game |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${wildRows.join('\n')}

Every real card and every unique wild ID was checked after every turn when
\`--assert\` was enabled. A multi-wild draw keeps every revealed wild; none may
enter the burned zone under the locked rule.

## Proposed identity slate

${allWilds.map((movie, index) => `${index + 1}. ${movie.title} \`${movie.id}\`${index < 3 ? ' — preserved current wild' : ' — proposed addition'}`).join('\n')}

Titles do not affect these results: wild shells have blank credits and private
genres. Each variant uses the first N identities shown for its tested count.

## Evidence recommendation

${evidenceNarrative}

Maximum compared-count player-win difference: **${(maxAdjacentWinDifference * 100).toFixed(2)}pp**.
${data.requires8000Followup ? 'Because that is at most 2pp, run the required 8,000-game follow-up before making the recommendation final.' : 'The required 8,000-game follow-up condition is satisfied or not triggered.'}

Machine-readable per-matchup, mirror, tier-gap, cross-variant, end-reason, and
wild-flow evidence is in \`${relative(process.cwd(), OUTPUT_JSON)}\`.
`

writeFileSync(OUTPUT_JSON, `${JSON.stringify(data, null, 2)}\n`)
writeFileSync(OUTPUT_MARKDOWN, markdown)
console.log(`evidence recommendation: ${recommendedWildCount} wilds`)
console.log(`max adjacent win-rate difference: ${(maxAdjacentWinDifference * 100).toFixed(2)}pp`)
console.log(`8000 follow-up: ${data.requires8000Followup ? 'REQUIRED' : 'not required / satisfied'}`)
console.log(`wrote ${OUTPUT_JSON}`)
console.log(`wrote ${OUTPUT_MARKDOWN}`)
