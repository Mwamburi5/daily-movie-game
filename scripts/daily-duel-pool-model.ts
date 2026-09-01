// scripts/daily-duel-pool-model.ts — read-only author-time construction model
// for the shared Daily Puzzle / Duel real-film pool.
//
// This script deliberately imports the runtime data and canonical graph/deal
// functions. It writes review evidence under docs/; it never edits runtime pool
// sources. Run from the repository root:
//
//   node scripts/daily-duel-pool-model.ts

// Node's built-in TypeScript erasure is sufficient; no author-time dependency.

import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { MOVIES } from '../src/data/movies.ts'
import { DUEL_POOL } from '../src/data/duelPool.ts'
import type { Movie, Puzzle } from '../src/data/types.ts'
import { dailySoloPuzzle } from '../src/lib/daily.ts'
import { linkTier, sharedPeople, type LinkTier, type SharedPerson } from '../src/lib/solver.ts'
import {
  applyProposedSeriesPolicy,
  MOVIES as SELECTED_OUTSIDE_MOVIES,
  PROPOSED_EXISTING_SERIES_OVERRIDES,
} from './daily-duel-candidate.ts'
import { DAILY_DUEL_POOL_CHALLENGERS } from './daily-duel-pool-challengers.ts'
import { MOVIES as WAVE3_SELECTED_MOVIES } from './wave3-candidate.ts'

const OUTPUT_JSON = resolve('docs/daily-duel-pool-model-data.json')
const OUTPUT_MARKDOWN = resolve('docs/daily-duel-pool-model-report.md')
const OUTPUT_PICKER_DATA = resolve('tools/daily-duel-pool-picker/data.js')
const WINDOW_START = '2026-07-06'
const WINDOW_DAYS = 365
const TARGETS = [89, 150, 175, 200] as const

// Rank strength, not Duel points. Super is one ordinal step above strong here.
// Using Duel's 1/2/4 point economy changes the deterministic fallback order.
const TIER_RANK: Record<LinkTier, number> = { standard: 1, strong: 2, super: 3 }

const EXPECTED = {
  89: { edges: 513, density: 13.1, minDegree: 2, medianDegree: 11, components: 1, top10SlotShare: 19.38 },
  150: { edges: 1318, density: 11.79, minDegree: 5, medianDegree: 17, components: 1, top10SlotShare: 13.08 },
  175: { edges: 1557, density: 10.23, minDegree: 5, medianDegree: 17, components: 1, top10SlotShare: 10.72 },
  200: { edges: 1755, density: 8.82, minDegree: 5, medianDegree: 16, components: 1, top10SlotShare: 10.21 },
} as const

interface Relation {
  shared: SharedPerson[]
  visible: boolean
  tier: LinkTier | null
}

interface RankScore {
  personEdges: number
  visibleEdges: number
  tierValue: number
  original89Anchors: number
}

interface Admission {
  rank: number
  layer: '89→150' | '150→175' | '175→200'
  id: string
  title: string
  year: number
  score: RankScore
}

const pairKey = (a: Movie, b: Movie): string => (a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`)
const relationCache = new Map<string, Relation>()

function relation(a: Movie, b: Movie): Relation {
  const key = pairKey(a, b)
  const cached = relationCache.get(key)
  if (cached) return cached
  const shared = sharedPeople(a, b)
  const value: Relation = {
    shared,
    visible: shared.some((person) => !person.deep),
    tier: shared.length > 0 ? linkTier(a, b, shared) : null,
  }
  relationCache.set(key, value)
  return value
}

function round(value: number, digits = 2): number {
  return Number(value.toFixed(digits))
}

function median(values: number[]): number {
  const sorted = values.slice().sort((a, b) => a - b)
  // Match the repository health audit's discrete/lower-median convention. A
  // graph degree is a whole-card count; for 200 films the middle pair is 16/17
  // and the recorded baseline is therefore 16, not the interpolated 16.5.
  return sorted[Math.floor((sorted.length - 1) / 2)]
}

function percentile(values: number[], fraction: number): number {
  const sorted = values.slice().sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))]
}

function creditsOf(movie: Movie): string[] {
  return [...new Set([...movie.topCast, ...(movie.deepCast ?? []), ...movie.director, ...movie.writers])]
}

function scoreAgainst(candidate: Movie, selected: Movie[], original89: Movie[]): RankScore {
  let personEdges = 0
  let visibleEdges = 0
  let tierValue = 0
  for (const movie of selected) {
    const edge = relation(candidate, movie)
    if (edge.shared.length === 0) continue
    personEdges++
    if (edge.visible) visibleEdges++
    tierValue += TIER_RANK[edge.tier!]
  }
  return {
    personEdges,
    visibleEdges,
    tierValue,
    original89Anchors: original89.filter((movie) => relation(candidate, movie).shared.length > 0).length,
  }
}

function compareRanked(
  a: { movie: Movie; score: RankScore },
  b: { movie: Movie; score: RankScore },
): number {
  return (
    b.score.personEdges - a.score.personEdges ||
    b.score.visibleEdges - a.score.visibleEdges ||
    b.score.tierValue - a.score.tierValue ||
    b.score.original89Anchors - a.score.original89Anchors ||
    a.movie.title.localeCompare(b.movie.title) ||
    a.movie.id.localeCompare(b.movie.id)
  )
}

function buildSequence(): { selected: Movie[]; admissions: Admission[]; ineligible: Movie[] } {
  const originalIds = new Set(DUEL_POOL.map((movie) => movie.id))
  const candidates = MOVIES.filter((movie) => !originalIds.has(movie.id))
  const eligible = candidates.filter((movie) => scoreAgainst(movie, [], DUEL_POOL).original89Anchors >= 3)
  const eligibleIds = new Set(eligible.map((movie) => movie.id))
  const ineligible = candidates.filter((movie) => !eligibleIds.has(movie.id))
  const selected = DUEL_POOL.slice()
  const selectedIds = new Set(selected.map((movie) => movie.id))
  const admissions: Admission[] = []

  while (selected.length < 200) {
    const ranked = eligible
      .filter((movie) => !selectedIds.has(movie.id))
      .map((movie) => ({ movie, score: scoreAgainst(movie, selected, DUEL_POOL) }))
      .sort(compareRanked)
    const winner = ranked[0]
    if (!winner) throw new Error(`pool model exhausted eligible candidates at ${selected.length} films`)
    const layer: Admission['layer'] = selected.length < 150 ? '89→150' : selected.length < 175 ? '150→175' : '175→200'
    admissions.push({
      rank: admissions.length + 1,
      layer,
      id: winner.movie.id,
      title: winner.movie.title,
      year: winner.movie.year,
      score: winner.score,
    })
    selected.push(winner.movie)
    selectedIds.add(winner.movie.id)
  }
  return { selected, admissions, ineligible }
}

function graphMetrics(pool: Movie[]) {
  const degree = new Map(pool.map((movie) => [movie.id, 0]))
  const neighbors = new Map(pool.map((movie) => [movie.id, [] as string[]]))
  const tiers: Record<LinkTier, number> = { standard: 0, strong: 0, super: 0 }
  const edgePeople = new Map<string, number>()
  let edges = 0
  let visibleEdges = 0

  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      const edge = relation(pool[i], pool[j])
      if (edge.shared.length === 0) continue
      edges++
      if (edge.visible) visibleEdges++
      tiers[edge.tier!]++
      degree.set(pool[i].id, degree.get(pool[i].id)! + 1)
      degree.set(pool[j].id, degree.get(pool[j].id)! + 1)
      neighbors.get(pool[i].id)!.push(pool[j].id)
      neighbors.get(pool[j].id)!.push(pool[i].id)
      for (const person of edge.shared) edgePeople.set(person.name, (edgePeople.get(person.name) ?? 0) + 1)
    }
  }

  const seen = new Set<string>()
  const components: string[][] = []
  for (const movie of pool) {
    if (seen.has(movie.id)) continue
    const component: string[] = []
    const stack = [movie.id]
    seen.add(movie.id)
    while (stack.length > 0) {
      const id = stack.pop()!
      component.push(id)
      for (const next of neighbors.get(id)!) {
        if (seen.has(next)) continue
        seen.add(next)
        stack.push(next)
      }
    }
    components.push(component.sort())
  }
  components.sort((a, b) => b.length - a.length || a[0].localeCompare(b[0]))

  const degrees = [...degree.values()]
  const peopleCards = new Map<string, string[]>()
  for (const movie of pool) {
    for (const person of creditsOf(movie)) {
      const cards = peopleCards.get(person) ?? []
      cards.push(movie.id)
      peopleCards.set(person, cards)
    }
  }
  const topPeople = [...peopleCards]
    .map(([person, cards]) => ({
      person,
      cards: cards.length,
      share: round((cards.length / pool.length) * 100),
      edgeCarrierCount: edgePeople.get(person) ?? 0,
      movieIds: cards.slice().sort(),
    }))
    .sort((a, b) => b.cards - a.cards || b.edgeCarrierCount - a.edgeCarrierCount || a.person.localeCompare(b.person))

  const byDecade: Record<string, number> = {}
  const byGenre: Record<string, number> = {}
  const bySeries: Record<string, number> = { '(none)': 0 }
  for (const movie of pool) {
    const decade = `${Math.floor(movie.year / 10) * 10}s`
    byDecade[decade] = (byDecade[decade] ?? 0) + 1
    byGenre[movie.genre] = (byGenre[movie.genre] ?? 0) + 1
    const series = movie.series ?? '(none)'
    bySeries[series] = (bySeries[series] ?? 0) + 1
  }

  const possibleEdges = (pool.length * (pool.length - 1)) / 2
  return {
    films: pool.length,
    edges,
    density: round((edges / possibleEdges) * 100),
    visibleEdges,
    deepOnlyEdges: edges - visibleEdges,
    visibleEdgeShare: round((visibleEdges / edges) * 100),
    tiers,
    degree: {
      min: Math.min(...degrees),
      median: median(degrees),
      mean: round(degrees.reduce((sum, value) => sum + value, 0) / degrees.length),
      p90: percentile(degrees, 0.9),
      max: Math.max(...degrees),
    },
    components: components.length,
    componentSizes: components.map((component) => component.length),
    isolates: pool.filter((movie) => degree.get(movie.id) === 0).map((movie) => movie.id),
    lowDegreeFilms: pool
      .filter((movie) => degree.get(movie.id)! <= 7)
      .map((movie) => ({ id: movie.id, title: movie.title, degree: degree.get(movie.id)! }))
      .sort((a, b) => a.degree - b.degree || a.title.localeCompare(b.title)),
    topPeople: topPeople.slice(0, 20),
    maxPersonCardCount: topPeople[0]?.cards ?? 0,
    filmsWithDeepCast: pool.filter((movie) => (movie.deepCast?.length ?? 0) > 0).length,
    deepCastFilmShare: round((pool.filter((movie) => (movie.deepCast?.length ?? 0) > 0).length / pool.length) * 100),
    byDecade: Object.fromEntries(Object.entries(byDecade).sort()),
    byGenre: Object.fromEntries(Object.entries(byGenre).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
    bySeries: Object.fromEntries(Object.entries(bySeries).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
    degreeById: Object.fromEntries([...degree].sort()),
  }
}

function addDays(seed: string, days: number): string {
  const [year, month, day] = seed.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return date.toISOString().slice(0, 10)
}

function dailyMetrics(pool: Movie[]) {
  const seeds = Array.from({ length: WINDOW_DAYS }, (_, index) => addDays(WINDOW_START, index))
  const puzzles: Puzzle[] = seeds.map((seed) => dailySoloPuzzle(seed, pool))
  const exposure = new Map(pool.map((movie) => [movie.id, 0]))
  const pars: Record<string, number> = {}
  for (const puzzle of puzzles) {
    for (const id of [puzzle.starterMovieId, ...puzzle.handMovieIds]) exposure.set(id, exposure.get(id)! + 1)
    pars[String(puzzle.par)] = (pars[String(puzzle.par)] ?? 0) + 1
  }
  const appearances = [...exposure]
    .map(([id, count]) => ({ id, title: pool.find((movie) => movie.id === id)!.title, count }))
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
  const slots = puzzles.reduce((sum, puzzle) => sum + 1 + puzzle.handMovieIds.length, 0)
  const boards = puzzles.map((puzzle, index) => ({
    seed: seeds[index],
    starterMovieId: puzzle.starterMovieId,
    handMovieIds: puzzle.handMovieIds,
    par: puzzle.par,
  }))
  const uniqueBoards = new Set(
    boards.map((board) => `${board.starterMovieId}|${board.handMovieIds.join('|')}`),
  ).size
  return {
    start: WINDOW_START,
    end: seeds[seeds.length - 1],
    days: WINDOW_DAYS,
    generated: puzzles.length,
    uniqueBoards,
    uniqueBoardShare: round((uniqueBoards / puzzles.length) * 100),
    slots,
    filmsAppearing: appearances.filter((entry) => entry.count > 0).length,
    zeroExposure: appearances.filter((entry) => entry.count === 0),
    minExposure: Math.min(...appearances.map((entry) => entry.count)),
    medianExposure: median(appearances.map((entry) => entry.count)),
    maxExposure: Math.max(...appearances.map((entry) => entry.count)),
    top10SlotShare: round((appearances.slice(0, 10).reduce((sum, entry) => sum + entry.count, 0) / slots) * 100),
    parDistribution: Object.fromEntries(Object.entries(pars).sort((a, b) => Number(a[0]) - Number(b[0]))),
    appearances,
    boards,
  }
}

function candidateDetail(movie: Movie, original89: Movie[], spine150: Movie[], final200: Movie[]) {
  const describe = (pool: Movie[]) => {
    const edges = pool
      .filter((neighbor) => neighbor.id !== movie.id)
      .map((neighbor) => ({ neighbor, relation: relation(movie, neighbor) }))
      .filter((entry) => entry.relation.shared.length > 0)
      .map((entry) => ({
        id: entry.neighbor.id,
        title: entry.neighbor.title,
        visible: entry.relation.visible,
        tier: entry.relation.tier!,
        sharedPeople: entry.relation.shared.map((person) => ({ name: person.name, role: person.role, deep: person.deep })),
      }))
      .sort((a, b) => a.title.localeCompare(b.title))
    const tiers: Record<LinkTier, number> = { standard: 0, strong: 0, super: 0 }
    for (const edge of edges) tiers[edge.tier]++
    const sharedCounts = new Map<string, number>()
    for (const edge of edges) for (const person of edge.sharedPeople) sharedCounts.set(person.name, (sharedCounts.get(person.name) ?? 0) + 1)
    return {
      degree: edges.length,
      visible: edges.filter((edge) => edge.visible).length,
      deepOnly: edges.filter((edge) => !edge.visible).length,
      tiers,
      topSharedPeople: [...sharedCounts]
        .map(([name, links]) => ({ name, links }))
        .sort((a, b) => b.links - a.links || a.name.localeCompare(b.name))
        .slice(0, 8),
      neighbors: edges,
    }
  }
  return {
    id: movie.id,
    title: movie.title,
    year: movie.year,
    genre: movie.genre,
    series: movie.series ?? null,
    hasReleaseDate: Boolean(movie.releaseDate),
    hasDeepCast: Boolean(movie.deepCast?.length),
    credits: {
      director: movie.director,
      writers: movie.writers,
      topCast: movie.topCast,
      deepCast: movie.deepCast ?? [],
    },
    links: {
      original89: describe(original89),
      spine150: describe(spine150),
      final200: describe(final200),
    },
  }
}

function digest(ids: string[]): string {
  return createHash('sha256').update(ids.join('\n')).digest('hex')
}

function peopleOverLimit(pool: Movie[], limit: number) {
  const counts = new Map<string, number>()
  for (const movie of pool) for (const person of creditsOf(movie)) counts.set(person, (counts.get(person) ?? 0) + 1)
  return [...counts]
    .filter(([, cards]) => cards > limit)
    .map(([person, cards]) => ({ person, cards }))
    .sort((a, b) => b.cards - a.cards || a.person.localeCompare(b.person))
}

function challengerDetail(
  challenger: (typeof DAILY_DUEL_POOL_CHALLENGERS)[number],
  original89: Movie[],
  spine150: Movie[],
  final200: Movie[],
  tail: Movie[],
  finalGraph: ReturnType<typeof graphMetrics>,
) {
  const detail = candidateDetail(challenger.movie, original89, spine150, final200)
  const staticGates = {
    spinePersonNeighbors: detail.links.spine150.degree >= 3,
    spineVisibleNeighbors: detail.links.spine150.visible >= 2,
    fallback200PersonNeighbors: detail.links.final200.degree >= 7,
  }
  const swaps = tail.map((removed) => {
    const swapped = final200.filter((movie) => movie.id !== removed.id).concat(challenger.movie)
    const graph = graphMetrics(swapped)
    const candidateDegree = swapped
      .filter((movie) => movie.id !== challenger.movie.id)
      .filter((movie) => relation(challenger.movie, movie).shared.length > 0).length
    const peopleAbove15 = peopleOverLimit(swapped, 15)
    const floors = {
      oneComponent: graph.components === 1,
      zeroIsolates: graph.isolates.length === 0,
      minDegreeAtLeast5: graph.degree.min >= 5,
      medianDegreeAtLeast16: graph.degree.median >= 16,
      densityAtLeast8_5: graph.density >= 8.5,
      visibleEdgeShareAtLeast70: graph.visibleEdgeShare >= 70,
      noPersonAbove15: peopleAbove15.length === 0,
      candidateDegreeAtLeast7: candidateDegree >= 7,
    }
    const floorsPass = Object.values(floors).every(Boolean)
    return {
      removeId: removed.id,
      removeTitle: removed.title,
      removeDegree: finalGraph.degreeById[removed.id],
      candidateDegree,
      edgeDelta: graph.edges - finalGraph.edges,
      density: graph.density,
      visibleEdgeShare: graph.visibleEdgeShare,
      minDegree: graph.degree.min,
      medianDegree: graph.degree.median,
      peopleAbove15,
      floors,
      floorsPass,
      graphNonDegrading: graph.edges >= finalGraph.edges && candidateDegree >= finalGraph.degreeById[removed.id],
    }
  })
  swaps.sort(
    (a, b) =>
      Number(b.graphNonDegrading) - Number(a.graphNonDegrading) ||
      Number(b.floorsPass) - Number(a.floorsPass) ||
      b.edgeDelta - a.edgeDelta ||
      a.removeDegree - b.removeDegree ||
      a.removeTitle.localeCompare(b.removeTitle),
  )
  const allStaticGatesPass = Object.values(staticGates).every(Boolean)
  return {
    ...challenger,
    movie: detail,
    staticGates,
    allStaticGatesPass,
    provisionalOnly: true,
    concentrationIfAddedWithoutSwap: peopleOverLimit([...final200, challenger.movie], 15),
    floorPreservingSwapCount: swaps.filter((swap) => swap.floorsPass).length,
    graphNonDegradingSwapCount: swaps.filter((swap) => swap.floorsPass && swap.graphNonDegrading).length,
    viableSwapTargets: swaps.filter((swap) => swap.floorsPass).slice(0, 15),
    allTailSwapTests: swaps,
  }
}

function expectedComparison(size: keyof typeof EXPECTED, graph: ReturnType<typeof graphMetrics>, daily: ReturnType<typeof dailyMetrics>) {
  const expected = EXPECTED[size]
  const actual = {
    edges: graph.edges,
    density: graph.density,
    minDegree: graph.degree.min,
    medianDegree: graph.degree.median,
    components: graph.components,
    top10SlotShare: daily.top10SlotShare,
  }
  const differences = Object.entries(expected)
    .filter(([key, value]) => actual[key as keyof typeof actual] !== value)
    .map(([key, value]) => ({ key, expected: value, actual: actual[key as keyof typeof actual] }))
  return { matches: differences.length === 0, expected, actual, differences }
}

function markdownTable(rows: (string | number)[][]): string {
  const [head, ...body] = rows
  return [
    `| ${head.join(' | ')} |`,
    `| ${head.map(() => '---').join(' | ')} |`,
    ...body.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n')
}

function toMarkdown(data: ReturnType<typeof buildData>): string {
  const metricRows: (string | number)[][] = [
    ['Real pool', 'Person edges', 'Density', 'Visible share', 'Min / median degree', 'Components', 'Daily unique', 'Films exposed', 'Top-10 slot share', 'Baseline'],
  ]
  for (const size of TARGETS) {
    const model = data.models[String(size)]
    metricRows.push([
      size,
      model.graph.edges,
      `${model.graph.density.toFixed(2)}%`,
      `${model.graph.visibleEdgeShare.toFixed(2)}%`,
      `${model.graph.degree.min} / ${model.graph.degree.median}`,
      model.graph.components,
      `${model.daily.uniqueBoards}/${model.daily.days}`,
      `${model.daily.filmsAppearing}/${size}`,
      `${model.daily.top10SlotShare.toFixed(2)}%`,
      model.expectedComparison.matches ? 'MATCH' : 'DRIFT',
    ])
  }

  const layerBlock = (title: string, admissions: Admission[]) => [
    `### ${title}`,
    '',
    ...admissions.map((entry, index) => `${index + 1}. ${entry.title} (${entry.year}) \`${entry.id}\``),
    '',
  ].join('\n')

  const candidateRows: (string | number)[][] = [
    ['Rank', 'Layer', 'Film', '89 anchors', 'Admission edges', 'Visible', 'Tier value', 'Final degree'],
    ...data.admissions.map((entry) => [
      entry.rank,
      entry.layer,
      `${entry.title} (${entry.year})`,
      entry.score.original89Anchors,
      entry.score.personEdges,
      entry.score.visibleEdges,
      entry.score.tierValue,
      data.models['200'].graph.degreeById[entry.id],
    ]),
  ]

  const ineligibleRows: (string | number)[][] = [
    ['Film', 'Year', 'Original-89 anchors'],
    ...data.ineligibleCurrentCredited.map((entry) => [entry.title, entry.year, entry.original89Anchors]),
  ]

  return `# Daily Puzzle / Duel 200-film construction model

**Generated:** ${data.generatedAt}

**Source:** current \`MOVIES\`, \`DUEL_POOL\`, \`sharedPeople\`, \`linkTier\`, and \`dailySoloPuzzle\`

**Runtime data changed:** no

**Overall baseline:** ${data.baselineMatches ? 'MATCH' : 'DRIFT — stop before curation'}

## Reproduction

\`\`\`sh
node scripts/daily-duel-pool-model.ts
\`\`\`

The model preserves all 89 current IDs. A current credited addition is eligible only
with at least three direct person-linked neighbors in the original 89. At each step
it ranks marginal person edges, visible edges, ordinal canonical tier value
(standard 1 / strong 2 / super 3), original-89 anchors, then title and ID.

## Baseline comparison

${markdownTable(metricRows)}

Machine-readable evidence, every board, exact candidate neighbors, concentrations,
and distribution data are in \`docs/daily-duel-pool-model-data.json\`.

## Approved 216-film slate — metadata and series approved

Buri approved the submitted 216-Keep receipt on 2026-08-25, superseding the
former exact-200 count target. The 216 combines the fallback 200 with the 16
outside cards in \`scripts/daily-duel-candidate.ts\`. Outside-card credits are
approved under the standing recognizability-first policy. This authoring view
also applies Buri's approved \`top-gun\` tag to existing \`top-gun\` and
\`avengers\` tag to existing \`the-avengers\`.

| Metric | Selected 216 | Floor | Result |
| --- | ---: | ---: | --- |
| Person edges | ${data.approvedSelection.graph.edges} | — | evidence |
| Density | ${data.approvedSelection.graph.density.toFixed(2)}% | ≥ 8.50% | ${data.approvedSelection.floors.densityAtLeast8_5 ? 'PASS' : 'FAIL'} |
| Visible edge share | ${data.approvedSelection.graph.visibleEdgeShare.toFixed(2)}% | ≥ 70.00% | ${data.approvedSelection.floors.visibleEdgeShareAtLeast70 ? 'PASS' : 'FAIL'} |
| Components / isolates | ${data.approvedSelection.graph.components} / ${data.approvedSelection.graph.isolates.length} | 1 / 0 | ${data.approvedSelection.floors.oneComponent && data.approvedSelection.floors.zeroIsolates ? 'PASS' : 'FAIL'} |
| Minimum / median degree | ${data.approvedSelection.graph.degree.min} / ${data.approvedSelection.graph.degree.median} | ≥ 5 / ≥ 16 | ${data.approvedSelection.floors.minDegreeAtLeast5 && data.approvedSelection.floors.medianDegreeAtLeast16 ? 'PASS' : 'FAIL'} |
| Maximum exact-person cards | ${data.approvedSelection.graph.maxPersonCardCount} | ≤ 15 | ${data.approvedSelection.floors.noPersonAbove15 ? 'PASS' : 'FAIL'} |
| Daily unique boards | ${data.approvedSelection.daily.uniqueBoards}/${data.approvedSelection.daily.days} | 365/365 | ${data.approvedSelection.floors.allDailyBoardsUnique ? 'PASS' : 'FAIL'} |
| Films exposed | ${data.approvedSelection.daily.filmsAppearing}/216 | 216/216 | ${data.approvedSelection.floors.allFilmsExposed ? 'PASS' : 'FAIL'} |
| Distinct par values | ${Object.keys(data.approvedSelection.daily.parDistribution).length} | ≥ 3 | ${data.approvedSelection.floors.atLeastThreeParValues ? 'PASS' : 'FAIL'} |

Approved 216 digest: \`${data.approvedSelection.digest}\`

## Exact nested fallback

${layerBlock('Original 89 → proposed 150: add 61', data.admissions.filter((entry) => entry.layer === '89→150'))}
${layerBlock('Proposed 150 → fallback 175: add 25', data.admissions.filter((entry) => entry.layer === '150→175'))}
${layerBlock('Fallback 175 → fallback 200: add 25', data.admissions.filter((entry) => entry.layer === '175→200'))}
## Admission evidence

${markdownTable(candidateRows)}

## Current credited records excluded by the three-anchor gate

These records remain available for breadth review, but the deterministic fallback
does not admit them because they have fewer than three direct original-89 links.

${markdownTable(ineligibleRows)}
`
}

function buildPickerData(data: ReturnType<typeof buildData>) {
  const originalIds = new Set(DUEL_POOL.map((movie) => movie.id))
  const wave3Ids = new Set(WAVE3_SELECTED_MOVIES.map((movie) => movie.id))
  const admissionById = new Map(data.admissions.map((entry) => [entry.id, entry]))
  const currentCards = data.models['200'].ids.map((id, order) => {
    const movie = MOVIES.find((entry) => entry.id === id)!
    const admission = admissionById.get(id)
    const layer = originalIds.has(id)
      ? 'current-89'
      : admission?.layer === '89→150'
        ? 'proposed-150'
        : admission?.layer === '150→175'
          ? 'fallback-175'
          : 'fallback-200'
    const detail = candidateDetail(movie, DUEL_POOL, data.models['150'].ids.map((entry) => MOVIES.find((m) => m.id === entry)!), data.models['200'].ids.map((entry) => MOVIES.find((m) => m.id === entry)!))
    return {
      order,
      id: movie.id,
      title: movie.title,
      year: movie.year,
      genre: movie.genre,
      series: movie.series ?? null,
      layer,
      sourceKind: 'current-credited',
      metadataStatus: 'current-credited',
      locked: originalIds.has(id),
      defaultDecision: 'keep',
      admissionRank: admission?.rank ?? null,
      priorStatus: originalIds.has(id)
        ? 'Frozen Daily/Duel member before Stage B and Wave 3.'
        : wave3Ids.has(id)
          ? 'Wave 3 KEEP; merged as a credited Movie on 2026-08-08; never selected for Daily/Duel.'
          : 'Credited before Wave 3; never selected for Daily/Duel.',
      recognizability: null,
      breadthReasons: [],
      concentrationCaveat: null,
      packageId: null,
      seriesReview: movie.series ? `Existing credited series tag: ${movie.series}.` : null,
      identityNote: 'Current credited Movie identity.',
      credits: detail.credits,
      staticLinks: detail.links,
      challengerGates: null,
      allStaticGatesPass: null,
      provisionalOnly: false,
      concentrationIfAddedWithoutSwap: [],
      viableSwapTargets: [],
    }
  })
  const outsideCards = data.challengerDetails.map((challenger, index) => ({
    order: currentCards.length + index,
    id: challenger.movie.id,
    title: challenger.movie.title,
    year: challenger.movie.year,
    genre: challenger.movie.genre,
    series: challenger.movie.series,
    layer: 'outside-challenger',
    sourceKind: challenger.sourceKind,
    metadataStatus: challenger.metadataStatus,
    locked: false,
    defaultDecision: 'maybe',
    admissionRank: null,
    priorStatus: challenger.priorStatus,
    recognizability: challenger.recognizability,
    breadthReasons: challenger.breadthReasons,
    concentrationCaveat: challenger.concentrationCaveat ?? null,
    packageId: challenger.packageId ?? null,
    seriesReview: challenger.seriesReview ?? null,
    identityNote: challenger.identityNote,
    credits: challenger.movie.credits,
    staticLinks: challenger.movie.links,
    challengerGates: challenger.staticGates,
    allStaticGatesPass: challenger.allStaticGatesPass,
    provisionalOnly: challenger.provisionalOnly,
    concentrationIfAddedWithoutSwap: challenger.concentrationIfAddedWithoutSwap,
    viableSwapTargets: challenger.viableSwapTargets,
  }))
  return {
    schemaVersion: 'matchcut-daily-duel-pool-picker-v1',
    generatedAt: data.generatedAt,
    modelDigest: data.models['200'].digest,
    constraints: {
      exactCount: 200,
      requiredCurrentIds: DUEL_POOL.map((movie) => movie.id),
      components: 1,
      minDegree: 5,
      medianDegree: 16,
      density: 8.5,
      visibleEdgeShare: 70,
      maxPersonCards: 15,
    },
    cards: [...currentCards, ...outsideCards],
  }
}

function buildData() {
  const { selected, admissions, ineligible } = buildSequence()
  const pools = Object.fromEntries(TARGETS.map((size) => [String(size), selected.slice(0, size)])) as Record<string, Movie[]>
  const models: Record<string, ReturnType<typeof graphMetrics> extends infer G ? { ids: string[]; titles: string[]; digest: string; graph: G; daily: ReturnType<typeof dailyMetrics>; expectedComparison: ReturnType<typeof expectedComparison> } : never> = {}
  for (const size of TARGETS) {
    const pool = pools[String(size)]
    const graph = graphMetrics(pool)
    const daily = dailyMetrics(pool)
    models[String(size)] = {
      ids: pool.map((movie) => movie.id),
      titles: pool.map((movie) => movie.title),
      digest: digest(pool.map((movie) => movie.id)),
      graph,
      daily,
      expectedComparison: expectedComparison(size, graph, daily),
    }
  }
  const finalIds = new Set(pools['200'].map((movie) => movie.id))
  const candidateDetails = MOVIES
    .filter((movie) => !new Set(DUEL_POOL.map((entry) => entry.id)).has(movie.id))
    .map((movie) => candidateDetail(movie, DUEL_POOL, pools['150'], pools['200']))
    .sort((a, b) => a.title.localeCompare(b.title))
  const ineligibleCurrentCredited = ineligible
    .map((movie) => ({
      id: movie.id,
      title: movie.title,
      year: movie.year,
      original89Anchors: candidateDetails.find((candidate) => candidate.id === movie.id)!.links.original89.degree,
      selectedInFallback: finalIds.has(movie.id),
    }))
    .sort((a, b) => b.original89Anchors - a.original89Anchors || a.title.localeCompare(b.title))
  const tail = admissions
    .filter((entry) => entry.layer !== '89→150')
    .map((entry) => MOVIES.find((movie) => movie.id === entry.id)!)
  const challengerDetails = DAILY_DUEL_POOL_CHALLENGERS.map((challenger) =>
    challengerDetail(
      challenger,
      DUEL_POOL,
      pools['150'],
      pools['200'],
      tail,
      models['200'].graph,
    ),
  )
  const baselineMatches = TARGETS.every((size) => models[String(size)].expectedComparison.matches)
  const fallbackIds = new Set(pools['200'].map((movie) => movie.id))
  const outsideCollisions = SELECTED_OUTSIDE_MOVIES.filter((movie) => fallbackIds.has(movie.id))
  if (outsideCollisions.length > 0) {
    throw new Error(
      `outside selection already exists in fallback 200: ${outsideCollisions.map((movie) => movie.id).join(', ')}`,
    )
  }
  const approvedPool = [
    ...pools['200'].map(applyProposedSeriesPolicy),
    ...SELECTED_OUTSIDE_MOVIES,
  ]
  // The approved view intentionally replaces two Movie objects under existing
  // IDs to test proposed series metadata. Its tier results must not reuse the
  // fallback objects' ID-keyed relation cache.
  relationCache.clear()
  const approvedGraph = graphMetrics(approvedPool)
  const approvedDaily = dailyMetrics(approvedPool)
  const approvedFloors = {
    oneComponent: approvedGraph.components === 1,
    zeroIsolates: approvedGraph.isolates.length === 0,
    minDegreeAtLeast5: approvedGraph.degree.min >= 5,
    medianDegreeAtLeast16: approvedGraph.degree.median >= 16,
    densityAtLeast8_5: approvedGraph.density >= 8.5,
    visibleEdgeShareAtLeast70: approvedGraph.visibleEdgeShare >= 70,
    noPersonAbove15: approvedGraph.maxPersonCardCount <= 15,
    allDailyBoardsUnique: approvedDaily.uniqueBoards === WINDOW_DAYS,
    allFilmsExposed: approvedDaily.filmsAppearing === approvedPool.length,
    atLeastThreeParValues: Object.keys(approvedDaily.parDistribution).length >= 3,
  }
  // buildPickerData runs after this function and describes the original picker
  // inputs, not the provisional series overrides.
  relationCache.clear()
  return {
    schemaVersion: 'matchcut-daily-duel-pool-model-v1',
    generatedAt: new Date().toISOString(),
    sourceCounts: { creditedMovies: MOVIES.length, originalPool: DUEL_POOL.length },
    policy: {
      originalIdsPreserved: true,
      minimumOriginal89AnchorsForCreditedAdmission: 3,
      rankOrder: ['marginal person edges', 'visible edges', 'ordinal canonical tier value', 'original-89 anchors', 'title', 'id'],
      tierRank: TIER_RANK,
      personAdjacencyOnly: true,
      sameGenreExcluded: true,
      seriesDoesNotCreateAdjacency: true,
    },
    window: { start: WINDOW_START, days: WINDOW_DAYS },
    baselineMatches,
    models,
    approvedSelection: {
      status: 'buri-approved-count-identities-metadata-and-series',
      realFilmTarget: 216,
      ids: approvedPool.map((movie) => movie.id),
      digest: digest(approvedPool.map((movie) => movie.id)),
      outsideIds: SELECTED_OUTSIDE_MOVIES.map((movie) => movie.id),
      proposedExistingSeriesOverrides: PROPOSED_EXISTING_SERIES_OVERRIDES,
      graph: approvedGraph,
      daily: approvedDaily,
      floors: approvedFloors,
      allFloorsPass: Object.values(approvedFloors).every(Boolean),
    },
    admissions,
    candidateDetails,
    challengerDetails,
    ineligibleCurrentCredited,
  }
}

const data = buildData()
writeFileSync(OUTPUT_JSON, `${JSON.stringify(data, null, 2)}\n`)
writeFileSync(OUTPUT_MARKDOWN, toMarkdown(data))
writeFileSync(OUTPUT_PICKER_DATA, `window.MATCHCUT_PICKER_DATA = ${JSON.stringify(buildPickerData(data))};\n`)

console.log(`daily-duel pool model: ${data.baselineMatches ? 'MATCH' : 'DRIFT'}`)
for (const size of TARGETS) {
  const model = data.models[String(size)]
  console.log(
    `${size}: ${model.graph.edges} edges · ${model.graph.density.toFixed(2)}% density · ` +
      `degree ${model.graph.degree.min}/${model.graph.degree.median} min/median · ` +
      `${model.graph.components} component(s) · top-10 ${model.daily.top10SlotShare.toFixed(2)}%`,
  )
  if (!model.expectedComparison.matches) console.log(JSON.stringify(model.expectedComparison.differences, null, 2))
}
console.log(
  `216 selected (approved metadata/series): ${data.approvedSelection.graph.edges} edges · ` +
    `${data.approvedSelection.graph.density.toFixed(2)}% density · ` +
    `degree ${data.approvedSelection.graph.degree.min}/${data.approvedSelection.graph.degree.median} min/median · ` +
    `${data.approvedSelection.graph.components} component(s) · ` +
    `floors ${data.approvedSelection.allFloorsPass ? 'PASS' : 'FAIL'}`,
)
console.log(`wrote ${OUTPUT_JSON}`)
console.log(`wrote ${OUTPUT_MARKDOWN}`)
console.log(`wrote ${OUTPUT_PICKER_DATA}`)
process.exitCode = data.baselineMatches ? 0 : 1
