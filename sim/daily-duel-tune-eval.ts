// Bounded author-time search over existing Duel difficulty knobs after the
// approved 216-real + 16-wild cutover. This changes no rules: it compares CPU
// profiles on identical seeded deals and reports paired movement from baseline.

import { HUMAN_CASUAL, KNOBS, type Difficulty, type Knobs } from '../src/lib/difficulty.ts'
import { playGame, type Rules } from './duel-sim.ts'
import { diffCI, pairedDiff, pctCI, wilson } from './stats.ts'

const GAMES = Number(process.argv[2] ?? 2000)
const seedArg = process.argv.find((arg) => arg.startsWith('--seed='))
const SEED = seedArg?.slice('--seed='.length) ?? '200824'
const ASSERT = process.argv.includes('--assert')
const FINAL = process.argv.includes('--final')
const onlyArg = process.argv.find((arg) => arg.startsWith('--only='))
const ONLY = onlyArg?.slice('--only='.length) as Difficulty | undefined
const FLOW: Rules = { doubleFeature: true, draw3: true, targetScore: 20 }

interface Variant {
  tier: Difficulty
  label: string
  knobs: Knobs
}

const sweepVariants: Variant[] = [
  { tier: 'matinee', label: 'baseline', knobs: KNOBS.matinee },
  { tier: 'matinee', label: 'whiff .48', knobs: { ...KNOBS.matinee, whiff: 0.48 } },
  { tier: 'matinee', label: 'whiff .52', knobs: { ...KNOBS.matinee, whiff: 0.52 } },
  { tier: 'matinee', label: 'whiff .56', knobs: { ...KNOBS.matinee, whiff: 0.56 } },
  { tier: 'matinee', label: 'meld miss .74', knobs: { ...KNOBS.matinee, meldMissChance: 0.74 } },
  { tier: 'matinee', label: 'meld miss .80', knobs: { ...KNOBS.matinee, meldMissChance: 0.80 } },
  { tier: 'matinee', label: 'meld miss .86', knobs: { ...KNOBS.matinee, meldMissChance: 0.86 } },
  { tier: 'matinee', label: 'meld miss .90', knobs: { ...KNOBS.matinee, meldMissChance: 0.90 } },
  { tier: 'feature', label: 'baseline', knobs: KNOBS.feature },
  { tier: 'feature', label: 'whiff .07', knobs: { ...KNOBS.feature, whiff: 0.07 } },
  { tier: 'feature', label: 'whiff .09', knobs: { ...KNOBS.feature, whiff: 0.09 } },
  { tier: 'feature', label: 'whiff .12', knobs: { ...KNOBS.feature, whiff: 0.12 } },
  { tier: 'feature', label: 'meld lazy', knobs: { ...KNOBS.feature, meldLazy: true } },
  { tier: 'directors', label: 'baseline', knobs: KNOBS.directors },
  { tier: 'directors', label: 'whiff .20', knobs: { ...KNOBS.directors, whiff: 0.20 } },
  { tier: 'directors', label: 'whiff .22', knobs: { ...KNOBS.directors, whiff: 0.22 } },
  { tier: 'directors', label: 'whiff .24', knobs: { ...KNOBS.directors, whiff: 0.24 } },
  { tier: 'directors', label: 'meld miss .03', knobs: { ...KNOBS.directors, meldMissChance: 0.03 } },
  { tier: 'directors', label: 'meld miss .05', knobs: { ...KNOBS.directors, meldMissChance: 0.05 } },
  { tier: 'directors', label: 'meld miss .08', knobs: { ...KNOBS.directors, meldMissChance: 0.08 } },
  { tier: 'directors', label: 'meld miss .15', knobs: { ...KNOBS.directors, meldMissChance: 0.15 } },
  { tier: 'directors', label: 'meld miss .20', knobs: { ...KNOBS.directors, meldMissChance: 0.20 } },
  { tier: 'directors', label: 'meld miss .25', knobs: { ...KNOBS.directors, meldMissChance: 0.25 } },
  { tier: 'directors', label: 'meld miss .30', knobs: { ...KNOBS.directors, meldMissChance: 0.30 } },
  { tier: 'directors', label: 'meld miss .40', knobs: { ...KNOBS.directors, meldMissChance: 0.40 } },
  { tier: 'directors', label: 'recast gameLoss', knobs: { ...KNOBS.directors, recast: 'gameLoss' } },
  { tier: 'directors', label: 'recast + greedy', knobs: { ...KNOBS.directors, recast: 'gameLoss', policy: 'greedy' } },
  { tier: 'directors', label: 'recast + whiff .10', knobs: { ...KNOBS.directors, recast: 'gameLoss', whiff: 0.10 } },
  { tier: 'directors', label: 'recast + whiff 0', knobs: { ...KNOBS.directors, recast: 'gameLoss', whiff: 0 } },
  { tier: 'directors', label: 'recast/greedy/.10', knobs: { ...KNOBS.directors, recast: 'gameLoss', policy: 'greedy', whiff: 0.10 } },
  { tier: 'directors', label: 'policy greedy', knobs: { ...KNOBS.directors, policy: 'greedy' } },
  { tier: 'directors', label: 'visible melds', knobs: { ...KNOBS.directors, deepMelds: false } },
  { tier: 'directors', label: 'meld lazy', knobs: { ...KNOBS.directors, meldLazy: true } },
]

const variants: Variant[] = FINAL
  ? [
      { tier: 'matinee', label: 'baseline', knobs: KNOBS.matinee },
      { tier: 'matinee', label: 'meld miss .80', knobs: { ...KNOBS.matinee, meldMissChance: 0.80 } },
      { tier: 'feature', label: 'baseline', knobs: KNOBS.feature },
      { tier: 'feature', label: 'meld lazy', knobs: { ...KNOBS.feature, meldLazy: true } },
      { tier: 'directors', label: 'baseline', knobs: KNOBS.directors },
      {
        tier: 'directors',
        label: 'meld miss .30',
        knobs: { ...KNOBS.directors, meldMissChance: 0.30 },
      },
    ]
  : sweepVariants

function run(knobs: Knobs): number[] {
  const outcomes: number[] = []
  for (let index = 0; index < GAMES; index++) {
    const result = playGame(HUMAN_CASUAL, knobs, {
      rules: FLOW,
      seed: SEED,
      index,
      assert: ASSERT,
    })
    outcomes.push(result === 'A' ? 1 : 0)
  }
  return outcomes
}

console.log(`\n  DAILY / DUEL CUTOVER KNOB SEARCH — ${GAMES} paired games, seed ${SEED}${ASSERT ? ' [asserts on]' : ''}`)
for (const tier of ['matinee', 'feature', 'directors'] as const) {
  if (ONLY && tier !== ONLY) continue
  const tierVariants = variants.filter((variant) => variant.tier === tier)
  const baseline = run(tierVariants[0].knobs)
  console.log(`\n  ${tier.toUpperCase()}`)
  for (let i = 0; i < tierVariants.length; i++) {
    const variant = tierVariants[i]
    const outcomes = i === 0 ? baseline : run(variant.knobs)
    const wins = outcomes.reduce((sum, outcome) => sum + outcome, 0)
    const movement = i === 0 ? 'baseline' : diffCI(pairedDiff(outcomes, baseline))
    console.log(`  ${variant.label.padEnd(16)} ${pctCI(wilson(wins, GAMES)).padEnd(24)} ${movement}`)
  }
}
console.log('')
