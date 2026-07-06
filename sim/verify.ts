// sim/verify.ts — the hardening test suite for the duel simulator.
//
//   node sim/verify.ts
//
// Every audit check from the "harden & verify the sim" plan lives here and
// prints PASS/FAIL; the process exits non-zero if anything fails, so this is
// safe to wire into a pre-port gate. Sections map 1:1 to the checklist.

import {
  playGame,
  validateCensus,
  drawCards,
  type Ev,
  type Rules,
  type State,
} from './duel-sim.ts'
import {
  HUMAN_CASUAL,
  KNOBS,
  banksMeld,
  bestPilePlay,
  knownLegalPlays,
  knownShared,
  legalCardsAnyPile,
  pickPlay,
  whiffs,
} from '../src/lib/difficulty.ts'
import { movieById } from '../src/data/movies.ts'
import { DUEL_POOL, DUEL_POOL_IDS } from '../src/data/duelPool.ts'
import { deal, isWild, LADDER_PTS, meldRung, TIER_POINTS, MELD_POINTS_PER_CARD } from '../src/lib/duel.ts'
import { linkTier, type SharedPerson } from '../src/lib/solver.ts'
import type { Movie } from '../src/data/types.ts'
import { makeRng } from './rng.ts'
import { wilson, pairedDiff, unpairedDiff } from './stats.ts'

let passed = 0
let failed = 0
function check(name: string, cond: boolean, detail = ''): void {
  if (cond) {
    passed++
    console.log(`  \x1b[32m✓\x1b[0m ${name}`)
  } else {
    failed++
    console.log(`  \x1b[31m✗ ${name}\x1b[0m${detail ? `  — ${detail}` : ''}`)
  }
}
function section(title: string): void {
  console.log(`\n  ── ${title} ──`)
}
const eqArr = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i])

// ── helpers: observe a game through the recorder ───────────────────────────

// Full event stream of one game, serialized for exact comparison.
function streamOf(
  player = HUMAN_CASUAL,
  cpu = KNOBS.feature,
  opts: { rules?: Rules; seed?: number | string; index?: number } = {},
): string {
  const evs: string[] = []
  playGame(player, cpu, { ...opts, rec: (e) => evs.push(JSON.stringify(e)) })
  return evs.join('\n')
}

// Just the opening-deal snapshot of one game.
type DealEv = Extract<Ev, { t: 'deal' }>
function dealOf(
  player = HUMAN_CASUAL,
  cpu = KNOBS.feature,
  opts: { rules?: Rules; seed?: number | string; index?: number } = {},
): DealEv {
  let deal: DealEv | null = null
  playGame(player, cpu, { ...opts, rec: (e) => { if (e.t === 'deal') deal = e } })
  if (!deal) throw new Error('no deal event emitted')
  return deal
}

// ═══════════════════════════════════════════════════════════════════════════
//  #1  SEED RNG + PAIRED DEALS
// ═══════════════════════════════════════════════════════════════════════════
function checkSeedingAndPairing(): void {
  section('#1  Seeded RNG + paired deals')

  // RNG primitive: same seed → same sequence; different seed → different.
  const r1 = makeRng(42)
  const r2 = makeRng(42)
  const r3 = makeRng(43)
  const seq = (r: () => number) => Array.from({ length: 8 }, r)
  const s1 = seq(r1)
  const s2 = seq(r2)
  const s3 = seq(r3)
  check('makeRng(42) is deterministic', s1.every((x, i) => x === s2[i]))
  check('makeRng(43) differs from makeRng(42)', s1.some((x, i) => x !== s3[i]))
  check('RNG output stays in [0,1)', s1.every((x) => x >= 0 && x < 1))

  // End-to-end determinism: same seed+index+rules → byte-identical game.
  const g1 = streamOf(HUMAN_CASUAL, KNOBS.feature, { seed: 7, index: 3 })
  const g2 = streamOf(HUMAN_CASUAL, KNOBS.feature, { seed: 7, index: 3 })
  check('same seed+index → identical game', g1 === g2)
  const gOther = streamOf(HUMAN_CASUAL, KNOBS.feature, { seed: 99, index: 3 })
  check('different seed → different game', g1 !== gOther)

  // Paired deals: same seed+index, DIFFERENT rules → identical shuffle.
  // Starter and both opening hands come straight off the shuffle, so they must
  // match exactly even when the rule set changes.
  const shipped = dealOf(HUMAN_CASUAL, KNOBS.feature, { seed: 5, index: 11, rules: {} })
  const flow = dealOf(HUMAN_CASUAL, KNOBS.feature, {
    seed: 5,
    index: 11,
    rules: { doubleFeature: true, draw3: true, targetScore: 20 },
  })
  check('paired: same starter across variants', shipped.starter === flow.starter, `${shipped.starter} vs ${flow.starter}`)
  check('paired: same player hand across variants', eqArr(shipped.handA, flow.handA))
  check('paired: same cpu hand across variants', eqArr(shipped.handB, flow.handB))

  // The ONLY deal difference Double Feature may introduce: it lifts the first
  // deck card into a second pile. The underlying shuffle must be untouched.
  check('shipped deal has one pile', shipped.piles.length === 1)
  check('double-feature deal has two piles', flow.piles.length === 2)
  check(
    'double-feature pile-2 is shipped deck top',
    flow.piles[1]?.[0] === shipped.deck[0],
    `${flow.piles[1]?.[0]} vs ${shipped.deck[0]}`,
  )
  // Compare REAL cards only: the 3 wilds splice into each deck at rng-dependent
  // positions (deck lengths differ by the lifted card), so they don't line up —
  // but the canonical shuffle underneath must still be shipped-minus-one.
  const reals = (ids: string[]) => ids.filter((id) => !isWild(id))
  check('double-feature deck = shipped deck minus that card', eqArr(reals(flow.deck), reals(shipped.deck).slice(1)))

  // The deal stream is keyed by index, so different indices give different deals.
  const dealA = dealOf(HUMAN_CASUAL, KNOBS.feature, { seed: 5, index: 0 })
  const dealB = dealOf(HUMAN_CASUAL, KNOBS.feature, { seed: 5, index: 1 })
  check('different index → different deal', !eqArr(dealA.handA, dealB.handA) || dealA.starter !== dealB.starter)

  // Aggregate reproducibility — exactly what `--seed` gives at the CLI: tally
  // winners over a batch twice; identical tallies prove the whole run repeats.
  const tally = (seed: number) => {
    const t = { A: 0, B: 0, draw: 0 }
    for (let i = 0; i < 300; i++) t[playGame(HUMAN_CASUAL, KNOBS.feature, { seed, index: i })]++
    return t
  }
  const t1 = tally(42)
  const t2 = tally(42)
  check(
    'aggregate run reproduces exactly (seed 42 ×300)',
    t1.A === t2.A && t1.B === t2.B && t1.draw === t2.draw,
    `${JSON.stringify(t1)} vs ${JSON.stringify(t2)}`,
  )

  // Back-compat: no seed still runs on live Math.random and returns a winner.
  const noSeed = playGame(HUMAN_CASUAL, KNOBS.feature)
  check('no-seed game still runs (Math.random path)', noSeed === 'A' || noSeed === 'B' || noSeed === 'draw')

  // Deal integrity: the 89 canonical cards plus the 3 wilds (now base game) are
  // all present and unique in the opening deal — 92 physical cards, no dupes.
  const all = [shipped.starter, ...shipped.handA, ...shipped.handB, ...shipped.deck]
  const realCards = all.filter((id) => !isWild(id))
  const wildCards = all.filter(isWild)
  check('opening deal has 89 canonical cards + 3 wilds', realCards.length === 89 && wildCards.length === 3, `got ${realCards.length}+${wildCards.length}`)
  check('opening deal has no duplicates', new Set(all).size === 92, `${new Set(all).size} unique of ${all.length}`)
}

// ═══════════════════════════════════════════════════════════════════════════
//  #2  CONSERVATION — all 89 cards accounted for, every turn
// ═══════════════════════════════════════════════════════════════════════════
function checkConservation(): void {
  section('#2  Conservation (all 89 cards accounted for)')

  // Pool pin (WS2 split, 2026-07-05): Duel and the Solo daily deal from the
  // frozen 89-film DUEL_POOL while MOVIES grows in content waves. An edit to
  // the list — or a merge that breaks id resolution — trips this before it can
  // shift the tuning or reshuffle published Solo dailies. Bump the hash only
  // as a conscious cutover (retune + solo re-pin in the same pass).
  let poolHash = 0x811c9dc5
  for (const ch of [...DUEL_POOL_IDS].sort().join('|')) {
    poolHash = Math.imul(poolHash ^ ch.charCodeAt(0), 0x01000193) >>> 0
  }
  check(
    'DUEL_POOL pinned to the tuned 89',
    DUEL_POOL_IDS.length === 89 && DUEL_POOL.length === 89 && poolHash === 0x2fa00c8d,
    `ids ${DUEL_POOL_IDS.length}, resolved ${DUEL_POOL.length}, fnv 0x${poolHash.toString(16)}`,
  )

  // First prove the DETECTOR works — it must reject drops, dups, and aliens,
  // or "no violations" in real games would be meaningless.
  const good = DUEL_POOL.map((m) => m.id)
  check('detector passes a clean 89-card census', validateCensus(good) === null)
  check('detector catches a dropped card', validateCensus(good.slice(1)) !== null)
  check('detector catches a duplicate', validateCensus([good[0], ...good]) !== null)
  check('detector catches an unknown id', validateCensus(['__ghost__', ...good.slice(1)]) !== null)

  // Then run real games with asserts LIVE under every rule combo. assert:true
  // throws the instant a turn loses, clones, or invents a card — including the
  // draw-3 burn path and the Double-Feature second pile.
  const variants: { name: string; rules: Rules }[] = [
    { name: 'shipped (1 pile)', rules: {} },
    { name: 'double feature (2 piles)', rules: { doubleFeature: true } },
    { name: 'draw-3-keep-1 (burns 2/draw)', rules: { draw3: true } },
    { name: 'double feature + draw3', rules: { doubleFeature: true, draw3: true } },
    { name: 'flow + race to 20', rules: { doubleFeature: true, draw3: true, targetScore: 20 } },
    { name: 'flow + go-out bonus', rules: { doubleFeature: true, draw3: true, goOutBonus: 5 } },
  ]
  for (const v of variants) {
    let threw = ''
    try {
      // Director's tier exercises the most card movement (melds, layoffs, runs).
      for (let i = 0; i < 400; i++) {
        playGame(HUMAN_CASUAL, KNOBS.directors, { seed: 1234, index: i, rules: v.rules, assert: true })
      }
    } catch (e) {
      threw = (e as Error).message
    }
    check(`conserved across 400 games — ${v.name}`, threw === '', threw)
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  #3  SIM ↔ REACT PARITY  (see sim/RULESET.md for the full contract)
// ═══════════════════════════════════════════════════════════════════════════
function checkParity(): void {
  section('#3  Sim ↔ React parity')

  // The scoring economy both files import — drift here desyncs sim from app.
  check(
    'TIER_POINTS = standard 1 / strong 2 / super 4',
    TIER_POINTS.standard === 1 && TIER_POINTS.strong === 2 && TIER_POINTS.super === 4,
  )
  check('MELD_POINTS_PER_CARD = 2', MELD_POINTS_PER_CARD === 2)

  // Meld-ladder economy (now base game): per-card points by the strongest shared
  // through-line, Auteur 3 > Actor 2 > Series 1 > Genre 1. The same LADDER_PTS /
  // meldRung React will score with — pin both the table and the classifier.
  check(
    'LADDER_PTS = auteur 3 / actor 2 / series 1 / genre 1',
    LADDER_PTS.auteur === 3 && LADDER_PTS.actor === 2 && LADDER_PTS.series === 1 && LADDER_PTS.genre === 1,
  )
  const mk = (over: Partial<Movie>): Movie =>
    ({ id: 'x', title: '', year: 0, director: [], writers: [], topCast: [], deepCast: [], posterColor: '', genre: 'Drama', ...over }) as Movie
  const auteurMeld = [mk({ director: ['Nolan'] }), mk({ director: ['Nolan'] }), mk({ director: ['Nolan'] })]
  const actorMeld = [mk({ topCast: ['Hanks'] }), mk({ topCast: ['Hanks'] }), mk({ topCast: ['Hanks'] })]
  const seriesMeld = [mk({ series: 'Bond' }), mk({ series: 'Bond' }), mk({ series: 'Bond' })]
  const genreMeld = [mk({ genre: 'Noir' }), mk({ genre: 'Noir' }), mk({ genre: 'Noir' })] // floor 3
  check(
    'meldRung: auteur > actor > series > genre, highest-rung wins',
    meldRung(auteurMeld, false, 3) === 'auteur' &&
      meldRung(actorMeld, false, 3) === 'actor' &&
      meldRung(seriesMeld, false, 3) === 'series' &&
      meldRung(genreMeld, false, 3) === 'genre',
  )

  // Link tiers resolve per spec §3 (the same linkTier both sides call).
  const A = (name: string): SharedPerson => ({ name, role: 'Actor', deep: false })
  const D = (name: string): SharedPerson => ({ name, role: 'Director', deep: false })
  const film = (series?: string) =>
    ({ series, topCast: [], deepCast: [], director: [], writers: [] }) as unknown as Movie
  check('super = same series', linkTier(film('bond'), film('bond'), []) === 'super')
  check('super = 3+ shared people', linkTier(film(), film(), [A('a'), A('b'), A('c')]) === 'super')
  check('strong = a shared crew member', linkTier(film(), film(), [D('d')]) === 'strong')
  check('strong = 2 shared actors', linkTier(film(), film(), [A('a'), A('b')]) === 'strong')
  check('standard = 1 shared actor', linkTier(film(), film(), [A('a')]) === 'standard')

  // KEYSTONE — single-pile reduction. With one pile the sim's multi-pile helpers
  // must behave EXACTLY like React's single-`top` calls, over many real deals.
  const k = KNOBS.directors // greedyDenial: deterministic, so picks must match exactly
  let redOk = true
  let exercised = 0
  let detail = ''
  for (let i = 0; i < 300 && redOk; i++) {
    const d = deal(DUEL_POOL, 7, makeRng(i, 'parity'))
    const top = movieById.get(d.starterId)!
    const hand = d.playerHand.map((id) => movieById.get(id)!)
    const seen = new Set([d.starterId, ...d.playerHand])
    const unseen = DUEL_POOL.filter((m) => !seen.has(m.id))
    // The multi-pile helpers now take plain `tops`; with one pile that's [top],
    // and they must reduce EXACTLY to React's single-top calls.
    const simLegal = legalCardsAnyPile([top], hand, k).map((m) => m.id).sort().join()
    const reactLegal = knownLegalPlays(top, hand, k).map((m) => m.id).sort().join()
    if (simLegal !== reactLegal) { redOk = false; detail = `legal set mismatch on deal ${i}`; break }
    const legal = knownLegalPlays(top, hand, k)
    if (legal.length > 0) {
      exercised++
      const simPick = bestPilePlay([top], hand, unseen, k, makeRng(i))
      const reactPick = pickPlay(top, legal, unseen, k, makeRng(i))
      if (!simPick || simPick.pileIdx !== 0 || simPick.card.id !== reactPick.id) {
        redOk = false
        detail = `pick mismatch on deal ${i}`
      }
    }
  }
  check(`single-pile reduction ≡ React single-top (${exercised} deals exercised)`, redOk, detail)

  // Every play scores exactly TIER_POINTS[tier] and no run exceeds ×3 — the
  // same scoring + run cap React's resolveCpuPlay enforces.
  let scoreOk = true
  let runCapOk = true
  let plays = 0
  for (let i = 0; i < 200; i++) {
    playGame(HUMAN_CASUAL, KNOBS.directors, {
      seed: 77,
      index: i,
      rec: (e) => {
        if (e.t === 'play') {
          plays++
          if (e.pts !== TIER_POINTS[e.tier]) scoreOk = false
          if (e.runN > 3) runCapOk = false
        }
      },
    })
  }
  check(`play points = TIER_POINTS[tier] (${plays} plays checked)`, scoreOk)
  check('run length never exceeds ×3', runCapOk)

  // The win condition both sides use: higher NET = points played − cards held.
  let winnerOk = true
  for (let i = 0; i < 300 && winnerOk; i++) {
    let end: Extract<Ev, { t: 'end' }> | null = null
    const w = playGame(HUMAN_CASUAL, KNOBS.feature, {
      seed: 5,
      index: i,
      rec: (e) => { if (e.t === 'end') end = e as Extract<Ev, { t: 'end' }> },
    })
    if (!end) { winnerOk = false; break }
    const e = end as Extract<Ev, { t: 'end' }>
    const expect = e.netA > e.netB ? 'A' : e.netB > e.netA ? 'B' : 'draw'
    if (expect !== w) winnerOk = false
  }
  check('winner = higher net score (played − held)', winnerOk)
}

// ═══════════════════════════════════════════════════════════════════════════
//  #4  NEW-CODE CORRECTNESS — two-pile / draw-3 / race / go-out
// ═══════════════════════════════════════════════════════════════════════════

// Minimal State factory for unit-testing the new helpers in isolation.
function baseState(over: Partial<State>): State {
  return {
    piles: [[DUEL_POOL[0].id]],
    hands: { A: [], B: [] },
    deck: [],
    burned: [],
    scores: { A: 0, B: 0 },
    tokens: { A: { finalCut: true, recast: true }, B: { finalCut: true, recast: true } },
    knobs: { A: KNOBS.directors, B: KNOBS.directors },
    melds: [],
    passStreak: 0,
    over: false,
    endReason: null,
    rules: {},
    ...over,
  } as State
}

function checkNewCode(): void {
  section('#4  New-code correctness (two-pile / draw-3 / race / go-out)')

  // ── draw-3-keep-1 burns EXACTLY 2 (unit test of drawCards) ──
  const top0 = DUEL_POOL[0]
  const four = [DUEL_POOL[1].id, DUEL_POOL[2].id, DUEL_POOL[3].id, DUEL_POOL[4].id]
  const sShip = baseState({ deck: [...four], rules: {} })
  const keepShip = drawCards(sShip, 'A', [top0], KNOBS.feature)
  check(
    'shipped draw: take 1, burn 0',
    keepShip === four[0] && sShip.deck.length === 3 && sShip.burned.length === 0,
  )
  const sD3 = baseState({ deck: [...four], rules: { draw3: true } })
  const keep3 = drawCards(sD3, 'A', [top0], KNOBS.feature)
  const offered = four.slice(0, 3)
  check(
    'draw-3 keeps 1 of the 3 offered, burns exactly the other 2',
    offered.includes(keep3) &&
      sD3.deck.length === 1 &&
      sD3.deck[0] === four[3] &&
      sD3.burned.length === 2 &&
      new Set([keep3, ...sD3.burned]).size === 3 &&
      [keep3, ...sD3.burned].every((id) => offered.includes(id)),
  )

  // ── burn accounting at the game level ──
  let shipBurn = 0
  let drawBurn = 0
  for (let i = 0; i < 200; i++) {
    playGame(HUMAN_CASUAL, KNOBS.feature, { seed: 1, index: i, rules: {}, rec: (e) => { if (e.t === 'end') shipBurn += e.burned } })
    playGame(HUMAN_CASUAL, KNOBS.feature, { seed: 1, index: i, rules: { draw3: true }, rec: (e) => { if (e.t === 'end') drawBurn += e.burned } })
  }
  check('shipped rules burn nothing', shipBurn === 0)
  check(`draw-3 actually burns cards (${drawBurn} over 200 games)`, drawBurn > 0)

  // ── Double Feature: pile routing is always legal, and BOTH piles get used ──
  const k = KNOBS.directors
  let routeOk = true
  let routeDetail = ''
  let routedDeals = 0
  let usedPile1 = 0
  for (let i = 0; i < 400 && routeOk; i++) {
    const d = deal(DUEL_POOL, 7, makeRng(i, 'df'))
    const piles = [[d.starterId], [d.deck[0]]]
    const tops = piles.map((p) => movieById.get(p[p.length - 1])!)
    const hand = d.playerHand.map((id) => movieById.get(id)!)
    const seen = new Set([...piles.flat(), ...d.playerHand])
    const unseen = DUEL_POOL.filter((m) => !seen.has(m.id))
    const anyLegal = legalCardsAnyPile(tops, hand, k).length > 0
    const bpp = bestPilePlay(tops, hand, unseen, k, makeRng(i))
    // The agent plays iff a legal play exists on EITHER top.
    if ((bpp !== null) !== anyLegal) { routeOk = false; routeDetail = `play⟺legal broke on deal ${i}`; break }
    if (bpp) {
      routedDeals++
      const chosenPile = piles[bpp.pileIdx]
      const chosenTop = movieById.get(chosenPile[chosenPile.length - 1])!
      // The routed card must genuinely be playable on the pile it was routed to.
      if (bpp.pileIdx > 1 || knownShared(chosenTop, bpp.card, k).length === 0) {
        routeOk = false
        routeDetail = `routed an illegal play on deal ${i}`
        break
      }
      if (bpp.pileIdx === 1) usedPile1++
    }
  }
  check(`double-feature routing always legal, play⟺legal (${routedDeals} deals)`, routeOk, routeDetail)
  check(`second feature pile is actually played onto (${usedPile1}× of ${routedDeals})`, usedPile1 > 0)

  // ── Race to target: fires, ends at a score ≥ target, and never fires without it ──
  let targetFired = 0
  let targetValid = true
  for (let i = 0; i < 500; i++) {
    let e: Extract<Ev, { t: 'end' }> | null = null
    playGame(HUMAN_CASUAL, KNOBS.feature, {
      seed: 3, index: i, rules: { doubleFeature: true, draw3: true, targetScore: 20 },
      rec: (ev) => { if (ev.t === 'end') e = ev as Extract<Ev, { t: 'end' }> },
    })
    if (e && (e as Extract<Ev, { t: 'end' }>).reason === 'target') {
      targetFired++
      const ee = e as Extract<Ev, { t: 'end' }>
      if (Math.max(ee.scoreA, ee.scoreB) < 20) targetValid = false
    }
  }
  let noTargetClean = true
  for (let i = 0; i < 200; i++) {
    playGame(HUMAN_CASUAL, KNOBS.feature, { seed: 3, index: i, rules: {}, rec: (ev) => { if (ev.t === 'end' && ev.reason === 'target') noTargetClean = false } })
  }
  check(`race-to-20 fires & winner's score ≥ 20 (${targetFired}× of 500)`, targetFired > 0 && targetValid)
  check('no "target" ending when the rule is off', noTargetClean)

  // ── Go-out bonus: adds +5 to the FINISHER and nothing else. Paired on the
  // same deal (bonus only applies at the terminal go-out, so flow is identical). ──
  let goOk = true
  let goDetail = ''
  let goOuts = 0
  const rulesNo: Rules = { doubleFeature: true, draw3: true }
  const rulesGo: Rules = { doubleFeature: true, draw3: true, goOutBonus: 5 }
  for (let i = 0; i < 500 && goOk; i++) {
    let e0: Extract<Ev, { t: 'end' }> | null = null
    let e5: Extract<Ev, { t: 'end' }> | null = null
    playGame(HUMAN_CASUAL, KNOBS.feature, { seed: 9, index: i, rules: rulesNo, rec: (e) => { if (e.t === 'end') e0 = e as Extract<Ev, { t: 'end' }> } })
    playGame(HUMAN_CASUAL, KNOBS.feature, { seed: 9, index: i, rules: rulesGo, rec: (e) => { if (e.t === 'end') e5 = e as Extract<Ev, { t: 'end' }> } })
    if (!e0 || !e5) { goOk = false; break }
    const a = e0 as Extract<Ev, { t: 'end' }>
    const b = e5 as Extract<Ev, { t: 'end' }>
    if (a.reason !== b.reason || a.turns !== b.turns) { goOk = false; goDetail = `flow diverged on deal ${i}`; break }
    if (a.reason === 'AOut') { goOuts++; if (b.scoreA !== a.scoreA + 5 || b.scoreB !== a.scoreB) { goOk = false; goDetail = `A go-out bonus wrong on deal ${i}` } }
    else if (a.reason === 'BOut') { goOuts++; if (b.scoreB !== a.scoreB + 5 || b.scoreA !== a.scoreA) { goOk = false; goDetail = `B go-out bonus wrong on deal ${i}` } }
    else if (b.scoreA !== a.scoreA || b.scoreB !== a.scoreB) { goOk = false; goDetail = `non-go-out score changed on deal ${i}` }
  }
  check(`go-out bonus = +5 to the finisher only (${goOuts} go-outs)`, goOk, goDetail)
}

// ═══════════════════════════════════════════════════════════════════════════
//  #5  CONFIDENCE INTERVALS
// ═══════════════════════════════════════════════════════════════════════════
function checkStats(): void {
  section('#5  Confidence intervals')

  // Wilson behaves at the middle and both extremes (where Wald would fail).
  const mid = wilson(50, 100)
  check('wilson(50/100): p=0.5, CI brackets it', mid.p === 0.5 && mid.lo > 0.4 && mid.lo < 0.5 && mid.hi > 0.5 && mid.hi < 0.62)
  const zero = wilson(0, 100)
  check('wilson(0/100): lo clamps to 0, hi > 0', zero.p === 0 && zero.lo === 0 && zero.hi > 0 && zero.hi < 0.05)
  const all = wilson(100, 100)
  check('wilson(100/100): hi ≈ 1 (≤1), lo < 1', all.p === 1 && all.hi <= 1 && all.hi > 0.999 && all.lo > 0.95 && all.lo < 1)

  // Paired-diff edge cases.
  const same = pairedDiff([1, 0, 1, 0, 1], [1, 0, 1, 0, 1])
  check('paired diff of identical series = 0, not "real"', same.diff === 0 && !same.real)
  const flip = pairedDiff([1, 1, 1, 1], [0, 0, 0, 0])
  check('paired diff of win-vs-loss = +1, "real"', flip.diff === 1 && flip.real)

  // THE PAYOFF — variance reduction. Two highly-correlated (nested) series with
  // a small true gap: pairing yields a much tighter CI than treating them as
  // independent samples — tight enough to flip "noise" into "real".
  const n = 200
  const x = Array.from({ length: n }, (_, i) => (i < 110 ? 1 : 0)) // 110 wins
  const y = Array.from({ length: n }, (_, i) => (i < 100 ? 1 : 0)) // 100 wins, nested in x
  const pd = pairedDiff(x, y)
  const ud = unpairedDiff(110, n, 100, n)
  const pdHalf = (pd.hi - pd.lo) / 2
  const udHalf = (ud.hi - ud.lo) / 2
  check(`paired CI tighter than independent (±${(100 * pdHalf).toFixed(1)}pp vs ±${(100 * udHalf).toFixed(1)}pp)`, pdHalf < udHalf)
  check('pairing turns a "noise" gap into a "real" one', pd.real && !ud.real)
}

// ═══════════════════════════════════════════════════════════════════════════
//  #6  METRIC & CASUAL-MODEL SANITY
// ═══════════════════════════════════════════════════════════════════════════
function checkMetrics(): void {
  section('#6  Metric & casual-model sanity')

  // The casual profile is the stand-in for "the player" — pin its definition so
  // win rates always mean "vs a casual fan," not some silently-drifted agent.
  check(
    'HUMAN_CASUAL is the documented casual profile',
    HUMAN_CASUAL.whiff === 0.22 &&
      HUMAN_CASUAL.meldMissChance === 0.45 &&
      HUMAN_CASUAL.policy === 'greedy' &&
      HUMAN_CASUAL.deepLinks === false &&
      HUMAN_CASUAL.deepMelds === false &&
      HUMAN_CASUAL.recast === 'gameLoss',
  )

  // The casual really does overlook plays/melds at the configured frequency.
  const N = 20000
  const rngW = makeRng('whiff')
  let whiffed = 0
  for (let i = 0; i < N; i++) if (whiffs(HUMAN_CASUAL, rngW)) whiffed++
  check(`whiff rate realizes 0.22 (measured ${(whiffed / N).toFixed(3)})`, Math.abs(whiffed / N - 0.22) < 0.02)

  const rngM = makeRng('meld')
  let banked = 0
  for (let i = 0; i < N; i++) if (banksMeld(3, true, HUMAN_CASUAL, rngM)) banked++
  check(`meld-bank rate realizes 0.55 (measured ${(banked / N).toFixed(3)})`, Math.abs(banked / N - 0.55) < 0.02)

  // Mirror match: identical knobs → ~50/50 (only a mild first-move tilt).
  let aWins = 0
  let bWins = 0
  const G = 4000
  for (let i = 0; i < G; i++) {
    const r = playGame(HUMAN_CASUAL, HUMAN_CASUAL, { seed: 4242, index: i })
    if (r === 'A') aWins++
    else if (r === 'B') bWins++
  }
  const pa = aWins / G
  const pb = bWins / G
  check(
    `mirror match ≈ 50/50 (A ${(100 * pa).toFixed(1)}% vs B ${(100 * pb).toFixed(1)}%, first-move tilt)`,
    Math.abs(pa - pb) < 0.05 && pa > 0.44 && pb > 0.44,
  )

  // FULL-FLOW mirror — the SHIPPED game (double feature + draw-3 + race-to-20),
  // not the single-pile reduction above. Measured 2026-07-03 at 4k–8k games
  // across seeds: A 52.1–53.4% vs B 44.3–45.7%, every CI excluding 50/50 — the
  // first-player tilt is REAL (~7±2pp), though the old 500-game read (54.6/41.8)
  // overstated it. Whether to accept it as a house edge or re-sim a fairness rule
  // is an OPEN design call; per methodology (RULESET §12) no rule change rides in
  // here. This check only PINS the measured band so a future rules/knobs change
  // can't silently widen the tilt — or flip it — without tripping the gate.
  let fA = 0
  let fB = 0
  const FG = 4000
  const FLOW: Rules = { doubleFeature: true, draw3: true, targetScore: 20 }
  for (let i = 0; i < FG; i++) {
    const r = playGame(HUMAN_CASUAL, HUMAN_CASUAL, { seed: 'flow-mirror', index: i, rules: FLOW })
    if (r === 'A') fA++
    else if (r === 'B') fB++
  }
  const fpA = fA / FG
  const fpB = fB / FG
  check(
    `full-flow mirror: tilt within documented band (A ${(100 * fpA).toFixed(1)}% vs B ${(100 * fpB).toFixed(1)}%, gap ≤ 12pp, A-favored)`,
    fpA - fpB >= 0 && fpA - fpB <= 0.12 && fA + fB >= FG * 0.85,
  )

  // Ending taxonomy is internally consistent across every rule variant: a
  // go-out really emptied that hand; a stalemate emptied neither; a target end
  // really crossed the target.
  let taxOk = true
  let taxDetail = ''
  let ends = 0
  const variants: Rules[] = [
    {},
    { doubleFeature: true, draw3: true },
    { doubleFeature: true, draw3: true, targetScore: 20 },
  ]
  for (const rules of variants) {
    for (let i = 0; i < 300 && taxOk; i++) {
      let e: Extract<Ev, { t: 'end' }> | null = null
      playGame(HUMAN_CASUAL, KNOBS.directors, { seed: 8, index: i, rules, rec: (ev) => { if (ev.t === 'end') e = ev as Extract<Ev, { t: 'end' }> } })
      if (!e) { taxOk = false; break }
      const ee = e as Extract<Ev, { t: 'end' }>
      ends++
      const ok =
        ee.reason === 'AOut' ? ee.handA === 0 :
        ee.reason === 'BOut' ? ee.handB === 0 :
        ee.reason === 'stalemate' ? ee.handA > 0 && ee.handB > 0 :
        ee.reason === 'target' ? rules.targetScore !== undefined && Math.max(ee.scoreA, ee.scoreB) >= rules.targetScore :
        ee.reason === 'guard' // 600-turn backstop is acceptable
      if (!ok) { taxOk = false; taxDetail = `inconsistent ${ee.reason}: handA=${ee.handA} handB=${ee.handB}` }
    }
  }
  check(`ending taxonomy self-consistent (${ends} games, 3 rule sets)`, taxOk, taxDetail)

  // The legal-density metric is well-formed: you can never have more legal plays
  // than cards in hand, nor a negative count.
  let legalOk = true
  let turns = 0
  for (let i = 0; i < 100; i++) {
    playGame(HUMAN_CASUAL, KNOBS.feature, {
      seed: 11, index: i, rules: { doubleFeature: true },
      rec: (ev) => { if (ev.t === 'turn') { turns++; if (ev.legal < 0 || ev.legal > ev.hand) legalOk = false } },
    })
  }
  check(`legal-play density well-formed, 0 ≤ legal ≤ hand (${turns} turns)`, legalOk)
}

// ── run ────────────────────────────────────────────────────────────────────
console.log('\n  MARQUEE SIM — HARDENING SUITE')
checkSeedingAndPairing()
checkConservation()
checkParity()
checkNewCode()
checkStats()
checkMetrics()
console.log(`\n  ${passed} passed, ${failed} failed\n`)
process.exit(failed > 0 ? 1 : 0)
