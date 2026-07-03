// Engagement/flow evaluation harness over the duel simulator.
//
//   node sim/eval.ts report [games]      # metric table per matchup
//   node sim/eval.ts draw3  [games]      # shipped rules vs draw-3-keep-1
//   node sim/eval.ts marquee [games]     # draw-3 flow vs the face-up Marquee
//   node sim/eval.ts log <matchup> [n]   # n verbose game transcripts
//
// Matchups: casual-matinee | casual-feature | casual-directors |
//           expert-directors | omni-directors | expert-feature

import { movieById } from '../src/data/movies.ts'
import { HUMAN_CASUAL, KNOBS, type Knobs } from '../src/lib/difficulty.ts'
import { playGame, type Ev, type Rules, type Who } from './duel-sim.ts'
import { wilson } from './stats.ts'

// A film buff bound by the UI: knows every PRINTED credit cold, almost never
// whiffs, but deep credits are invisible to them in-game.
const HUMAN_EXPERT: Knobs = {
  deepLinks: false,
  deepMelds: false,
  policy: 'greedy',
  whiff: 0.05,
  meldMissChance: 0.1,
  meldLazy: false,
  recast: 'full',
}

// A trivia god who genuinely knows the deep casts from memory — the ceiling
// of what any human could do against the AI.
const HUMAN_OMNI: Knobs = {
  deepLinks: true,
  deepMelds: true,
  policy: 'greedy',
  whiff: 0.02,
  meldMissChance: 0.05,
  meldLazy: false,
  recast: 'full',
}

const MATCHUPS: Record<string, { a: Knobs; aName: string; b: Knobs; bName: string }> = {
  'casual-matinee': { a: HUMAN_CASUAL, aName: 'casual', b: KNOBS.matinee, bName: 'Matinee' },
  'casual-feature': { a: HUMAN_CASUAL, aName: 'casual', b: KNOBS.feature, bName: 'Feature' },
  'casual-directors': { a: HUMAN_CASUAL, aName: 'casual', b: KNOBS.directors, bName: "Director's" },
  'expert-feature': { a: HUMAN_EXPERT, aName: 'expert', b: KNOBS.feature, bName: 'Feature' },
  'expert-directors': { a: HUMAN_EXPERT, aName: 'expert', b: KNOBS.directors, bName: "Director's" },
  'omni-directors': { a: HUMAN_OMNI, aName: 'trivia-god', b: KNOBS.directors, bName: "Director's" },
}

interface GameStats {
  win: 'A' | 'B' | 'draw'
  turns: number
  endReason: string
  netGap: number
  aMaxHand: number
  aHandTurnsOver9: number
  aTurns: number
  aLegal0: number
  aLegal1: number
  aLegal2: number
  aDeadTurns: number
  aLongestDeadStreak: number
  aDraws: number
  aDrawConnected: number
  aPlays: number
  aMeldPts: number
  aPts: number
  bPts: number
  bMeldPts: number
  leadChanges: number
  aBiggestTurn: number
  bBiggestTurn: number
  supers: number
  runs2plus: number
  deepPlays: number
  recasts: number
}

function collect(a: Knobs, b: Knobs, games: number, rules: Rules = {}, seed?: number | string, assert?: boolean): GameStats[] {
  const out: GameStats[] = []
  for (let i = 0; i < games; i++) {
    const g: GameStats = {
      win: 'draw', turns: 0, endReason: '', netGap: 0,
      aMaxHand: 0, aHandTurnsOver9: 0, aTurns: 0,
      aLegal0: 0, aLegal1: 0, aLegal2: 0,
      aDeadTurns: 0, aLongestDeadStreak: 0,
      aDraws: 0, aDrawConnected: 0, aPlays: 0, aMeldPts: 0, aPts: 0,
      bPts: 0, bMeldPts: 0,
      leadChanges: 0, aBiggestTurn: 0, bBiggestTurn: 0,
      supers: 0, runs2plus: 0, deepPlays: 0, recasts: 0,
    }
    let turnOwner: Who | null = null
    let turnPts = 0
    let deadStreak = 0
    let scoreA = 0
    let scoreB = 0
    let lastSign = 0
    const closeTurn = () => {
      if (turnOwner === null) return
      if (turnOwner === 'A') {
        g.aBiggestTurn = Math.max(g.aBiggestTurn, turnPts)
        if (turnPts === 0) {
          g.aDeadTurns++
          deadStreak++
          g.aLongestDeadStreak = Math.max(g.aLongestDeadStreak, deadStreak)
        } else deadStreak = 0
      } else {
        g.bBiggestTurn = Math.max(g.bBiggestTurn, turnPts)
      }
    }
    const score = (who: Who, pts: number) => {
      turnPts += pts
      if (who === 'A') {
        scoreA += pts
        g.aPts += pts
      } else {
        scoreB += pts
        g.bPts += pts
      }
      const sign = Math.sign(scoreA - scoreB)
      if (sign !== 0 && lastSign !== 0 && sign !== lastSign) g.leadChanges++
      if (sign !== 0) lastSign = sign
    }
    const rec = (e: Ev) => {
      switch (e.t) {
        case 'turn':
          closeTurn()
          turnOwner = e.who
          turnPts = 0
          if (e.who === 'A') {
            g.aTurns++
            g.aMaxHand = Math.max(g.aMaxHand, e.hand)
            if (e.hand >= 10) g.aHandTurnsOver9++
            if (e.legal === 0) g.aLegal0++
            else if (e.legal === 1) g.aLegal1++
            else g.aLegal2++
          }
          break
        case 'play':
          score(e.who, e.pts)
          if (e.who === 'A') g.aPlays++
          if (e.tier === 'super') g.supers++
          if (e.runN >= 2) g.runs2plus++
          if (e.deep) g.deepPlays++
          break
        case 'meld':
          score(e.who, e.pts)
          if (e.who === 'A') g.aMeldPts += e.pts
          else g.bMeldPts += e.pts
          break
        case 'layoff':
          score(e.who, 2)
          break
        case 'fc':
          score(e.who, 1)
          break
        case 'draw':
          if (e.who === 'A') {
            g.aDraws++
            if (e.connected) g.aDrawConnected++
          }
          break
        case 'recast':
          g.recasts++
          break
        case 'end':
          closeTurn()
          g.turns = e.turns
          g.endReason = e.reason
          g.netGap = Math.abs(e.netA - e.netB)
          break
      }
    }
    g.win = playGame(a, b, { rules, rec, seed, index: i, assert })
    out.push(g)
  }
  return out
}

const avg = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / Math.max(xs.length, 1)
const pXX = (xs: number[], p: number) => {
  const sorted = [...xs].sort((x, y) => x - y)
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))]
}
const pc = (n: number, d: number) => ((100 * n) / Math.max(d, 1)).toFixed(1) + '%'
const f1 = (n: number) => n.toFixed(1)

function report(label: string, gs: GameStats[]): void {
  const n = gs.length
  const wins = gs.filter((g) => g.win === 'A').length
  const aTurns = gs.reduce((s, g) => s + g.aTurns, 0)
  const legal0 = gs.reduce((s, g) => s + g.aLegal0, 0)
  const legal1 = gs.reduce((s, g) => s + g.aLegal1, 0)
  const legal2 = gs.reduce((s, g) => s + g.aLegal2, 0)
  const dead = gs.reduce((s, g) => s + g.aDeadTurns, 0)
  const draws = gs.reduce((s, g) => s + g.aDraws, 0)
  const drawConn = gs.reduce((s, g) => s + g.aDrawConnected, 0)
  const over9 = gs.reduce((s, g) => s + g.aHandTurnsOver9, 0)
  const ci = wilson(wins, n)
  console.log(`\n  ── ${label}  (${n} games) ──`)
  console.log(`  win rate         ${pc(wins, n)} [${(100 * ci.lo).toFixed(1)}–${(100 * ci.hi).toFixed(1)}]   (stalemates ${pc(gs.filter(g => g.endReason === 'stalemate').length, n)})`)
  console.log(`  game length      ${f1(avg(gs.map(g => g.turns)))} turns avg · p90 ${pXX(gs.map(g => g.turns), 90)}`)
  console.log(`  hand size (A)    max/game avg ${f1(avg(gs.map(g => g.aMaxHand)))} · p90 ${pXX(gs.map(g => g.aMaxHand), 90)} · ≥10-card turns ${pc(over9, aTurns)}`)
  console.log(`  decision density 0 legal ${pc(legal0, aTurns)} · 1 legal ${pc(legal1, aTurns)} · 2+ legal ${pc(legal2, aTurns)}`)
  console.log(`  dead turns (A)   ${pc(dead, aTurns)} of turns · longest streak avg ${f1(avg(gs.map(g => g.aLongestDeadStreak)))}`)
  console.log(`  draw turns (A)   ${pc(draws, aTurns)} of turns · drawn card connects ${pc(drawConn, draws)}`)
  console.log(`  scoring          A ${f1(avg(gs.map(g => g.aPts)))} pts (${pc(gs.reduce((s,g) => s + g.aMeldPts, 0), Math.max(gs.reduce((s,g) => s + g.aPts, 0),1))} from melds) · B ${f1(avg(gs.map(g => g.bPts)))} pts (${pc(gs.reduce((s,g) => s + g.bMeldPts, 0), Math.max(gs.reduce((s,g) => s + g.bPts, 0),1))} melds)`)
  console.log(`  biggest turn     A ${f1(avg(gs.map(g => g.aBiggestTurn)))} · B ${f1(avg(gs.map(g => g.bBiggestTurn)))}`)
  console.log(`  drama            lead changes/game ${f1(avg(gs.map(g => g.leadChanges)))} · final net gap avg ${f1(avg(gs.map(g => g.netGap)))} · close (≤2) ${pc(gs.filter(g => g.netGap <= 2).length, n)}`)
  console.log(`  spectacle/game   supers ${f1(avg(gs.map(g => g.supers)))} · runs×2+ ${f1(avg(gs.map(g => g.runs2plus)))} · deep cuts ${f1(avg(gs.map(g => g.deepPlays)))} · recasts ${f1(avg(gs.map(g => g.recasts)))}`)
}

function transcript(key: string, games: number): void {
  const m = MATCHUPS[key]
  if (!m) throw new Error(`unknown matchup ${key}`)
  for (let i = 1; i <= games; i++) {
    console.log(`\n═══ GAME ${i} — ${m.aName} vs ${m.bName} ═══`)
    let turn = 0
    let curWho: Who | null = null
    const title = (id: string) => movieById.get(id)?.title ?? id
    const rec = (e: Ev) => {
      switch (e.t) {
        case 'turn': {
          turn++
          curWho = e.who
          const tag = e.who === 'A' ? 'YOU' : 'CPU'
          process.stdout.write(
            `T${String(turn).padStart(2, '0')} ${tag} hand${String(e.hand).padStart(2)} legal${e.legal}${e.meldAvail ? ' meld!' : ''} → `,
          )
          break
        }
        case 'play':
          console.log(
            `plays ${title(e.id)} [${e.tier}${e.deep ? ' DEEP' : ''}${e.runN >= 2 ? ` run×${e.runN}` : ''} +${e.pts}]${e.drew ? ' (from draw)' : ''}`,
          )
          if (e.runN >= 2 || e.tier === 'super') process.stdout.write('              ↳ continues → ')
          break
        case 'meld':
          console.log(`banks ${e.n}-film meld (+${e.pts})`)
          break
        case 'layoff':
          console.log(`lays off ${title(e.id)} (+2)`)
          break
        case 'draw':
          console.log(
            e.tossed
              ? `draws ${title(e.id)} → tosses it (brick)`
              : e.connected
                ? `draws ${title(e.id)} — connects!`
                : `draws ${title(e.id)} → keeps (hand grows)`,
          )
          break
        case 'pass':
          console.log('passes')
          break
        case 'recast':
          console.log(`\n              ⚡ ${e.who === 'A' ? 'YOU' : 'CPU'} RECASTS the ${e.against}`)
          break
        case 'fc':
          console.log(`FINAL CUT — slams ${title(e.id)} (+1)`)
          break
        case 'end':
          console.log(
            `END after ${e.turns} turns: ${e.reason} — YOU net ${e.netA} (${e.scoreA} pts − ${e.handA} held) · CPU net ${e.netB} (${e.scoreB} − ${e.handB})  →  ${e.netA > e.netB ? 'YOU WIN' : e.netB > e.netA ? 'CPU WINS' : 'DRAW'}`,
          )
          break
      }
    }
    playGame(m.a, m.b, { rec })
  }
}

// CLI args: [mode] [games|matchup] [n]  with an optional --seed=N flag anywhere.
// A seed makes the whole report reproducible AND pairs deals across every
// matchup/variant (game #i shares one shuffle), so comparisons isolate the rule.
const argv = process.argv.slice(2)
const seedArg = argv.find((a) => a.startsWith('--seed='))
const rawSeed = seedArg?.slice('--seed='.length)
const SEED = rawSeed === undefined ? undefined : /^\d+$/.test(rawSeed) ? Number(rawSeed) : rawSeed
const ASSERT = argv.includes('--assert')
const pos = argv.filter((a) => !a.startsWith('--'))
const mode = pos[0] ?? 'report'
const seedTag = `${SEED !== undefined ? `  (seed ${SEED})` : ''}${ASSERT ? ' [asserts on]' : ''}`
if (mode === 'report') {
  const games = Number(pos[1] ?? 1000)
  console.log(`\n  FLOW & ENGAGEMENT REPORT — ${games} games per matchup${seedTag}`)
  for (const [key, m] of Object.entries(MATCHUPS)) {
    report(`${m.aName} vs ${m.bName} [${key}]`, collect(m.a, m.b, games, {}, SEED, ASSERT))
  }
  console.log('')
} else if (mode === 'draw3') {
  const games = Number(pos[1] ?? 1000)
  console.log(`\n  DRAW-3-KEEP-1 VARIANT — ${games} games per matchup${seedTag}`)
  for (const key of ['expert-directors', 'casual-feature', 'casual-matinee']) {
    const m = MATCHUPS[key]
    report(`${m.aName} vs ${m.bName} — SHIPPED RULES`, collect(m.a, m.b, games, {}, SEED, ASSERT))
    report(`${m.aName} vs ${m.bName} — DRAW 3 KEEP 1`, collect(m.a, m.b, games, { draw3: true }, SEED, ASSERT))
  }
  console.log('')
} else if (mode === 'package') {
  // The flow package vs shipped, plus two ending ideas layered on top.
  const games = Number(pos[1] ?? 1000)
  const variants: { name: string; rules: Rules }[] = [
    { name: 'SHIPPED (one pile, keep/toss)', rules: {} },
    { name: 'FLOW: Double Feature + draw3', rules: { doubleFeature: true, draw3: true } },
    { name: 'FLOW + go-out bonus (+5)', rules: { doubleFeature: true, draw3: true, goOutBonus: 5 } },
    { name: 'FLOW + race to 20 pts', rules: { doubleFeature: true, draw3: true, targetScore: 20 } },
    { name: 'FLOW + race to 20 + go-out (+5)', rules: { doubleFeature: true, draw3: true, targetScore: 20, goOutBonus: 5 } },
  ]
  console.log(`\n  FLOW PACKAGE COMPARISON — ${games} games per variant${seedTag}`)
  for (const key of ['casual-matinee', 'casual-feature', 'casual-directors']) {
    const m = MATCHUPS[key]
    console.log(`\n━━━ ${m.aName} vs ${m.bName} ━━━`)
    for (const v of variants) report(`${v.name}`, collect(m.a, m.b, games, v.rules, SEED, ASSERT))
  }
  console.log('')
} else if (mode === 'tune') {
  // Fast difficulty-tuning view: casual vs each tier under the LIVE shipped flow
  // package (Double Feature + draw3 + race to 20). Only the one variant, so it's
  // ~5× faster than `package` per game budget. Targets: Matinee 65 / Feature 50 /
  // Director's 41 (player win rate).
  const games = Number(pos[1] ?? 3000)
  const rules: Rules = { doubleFeature: true, draw3: true, targetScore: 20 }
  console.log(`\n  DIFFICULTY TUNE — flow package, ${games} games${seedTag}  (targets 65 / 50 / 41)`)
  for (const key of ['casual-matinee', 'casual-feature', 'casual-directors']) {
    const m = MATCHUPS[key]
    const gs = collect(m.a, m.b, games, rules, SEED, ASSERT)
    const wins = gs.filter((g) => g.win === 'A').length
    const ci = wilson(wins, games)
    const stale = pc(gs.filter((g) => g.endReason === 'stalemate').length, games)
    console.log(
      `  casual vs ${m.bName.padEnd(10)}  player ${pc(wins, games).padStart(6)}  [${(100 * ci.lo).toFixed(1)}–${(100 * ci.hi).toFixed(1)}]   (stalemates ${stale})`,
    )
  }
  console.log('')
} else if (mode === 'marquee') {
  // Fun-pass step 1: does the face-up Marquee (take 1 of 3 visible, no burn)
  // preserve the anti-brick flow that draw-3-keep-1 bought? Compare both with
  // race-to-20 on, across the three casual matchups. Run with --assert to prove
  // conservation across every game.
  const games = Number(pos[1] ?? 1000)
  const draw3Flow: Rules = { doubleFeature: true, draw3: true, targetScore: 20 }
  const mq = (cull: number): Rules => ({ doubleFeature: true, marquee: true, marqueeCull: cull, targetScore: 20 })
  console.log(`\n  MARQUEE vs DRAW-3 — ${games} games per matchup${seedTag}`)
  for (const key of ['casual-matinee', 'casual-feature', 'casual-directors']) {
    const m = MATCHUPS[key]
    console.log(`\n━━━ ${m.aName} vs ${m.bName} ━━━`)
    report('DRAW-3   (current shipped flow)', collect(m.a, m.b, games, draw3Flow, SEED, ASSERT))
    report('MARQUEE cull-0 (pure, no burn)', collect(m.a, m.b, games, mq(0), SEED, ASSERT))
    report('MARQUEE cull-1 (evict 1 brick)', collect(m.a, m.b, games, mq(1), SEED, ASSERT))
    report('MARQUEE cull-2 (visible draw-3)', collect(m.a, m.b, games, mq(2), SEED, ASSERT))
  }
  console.log('')
} else if (mode === 'log') {
  transcript(pos[1] ?? 'expert-directors', Number(pos[2] ?? 3))
} else {
  console.error(`unknown mode ${mode}`)
}
