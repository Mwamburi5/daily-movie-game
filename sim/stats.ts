// sim/stats.ts — confidence intervals for win-rate measurement.
//
// Two tools:
//  • wilson()     — CI for a single win rate. Accurate near 0/1 and for modest
//                   n, where the textbook Wald interval breaks down.
//  • pairedDiff() — CI for the GAP between two configs measured on the SAME
//                   deals (paired/CRN). Pairing cancels the shared luck, so the
//                   interval is much tighter than comparing independent samples.
//  • unpairedDiff() — the independent-samples version, kept only to SHOW how
//                   much pairing buys us.

const Z = 1.96 // 95% two-sided

export interface Interval {
  p: number
  lo: number
  hi: number
}

// Wilson score interval for a binomial proportion.
export function wilson(wins: number, n: number, z = Z): Interval {
  if (n === 0) return { p: 0, lo: 0, hi: 0 }
  const p = wins / n
  const z2 = z * z
  const denom = 1 + z2 / n
  const center = (p + z2 / (2 * n)) / denom
  const half = (z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n)) / denom
  return { p, lo: Math.max(0, center - half), hi: Math.min(1, center + half) }
}

export interface DiffInterval {
  diff: number
  lo: number
  hi: number
  real: boolean // CI excludes 0 → the difference is statistically real
}

// Paired-difference 95% CI. x and y are per-game outcomes (e.g. 1=win, 0=not)
// for two configs on the SAME seeded deals, so x[i] and y[i] are the same deal.
export function pairedDiff(x: number[], y: number[], z = Z): DiffInterval {
  const n = Math.min(x.length, y.length)
  if (n < 2) return { diff: 0, lo: 0, hi: 0, real: false }
  let sum = 0
  for (let i = 0; i < n; i++) sum += x[i] - y[i]
  const mean = sum / n
  let v = 0
  for (let i = 0; i < n; i++) {
    const d = x[i] - y[i] - mean
    v += d * d
  }
  const sd = Math.sqrt(v / (n - 1))
  const half = (z * sd) / Math.sqrt(n)
  return { diff: mean, lo: mean - half, hi: mean + half, real: mean - half > 0 || mean + half < 0 }
}

// Independent-samples difference CI (two separate proportions). Strictly for
// contrast against pairedDiff — never use this when the deals were paired.
export function unpairedDiff(xWins: number, xN: number, yWins: number, yN: number, z = Z): DiffInterval {
  const px = xWins / xN
  const py = yWins / yN
  const diff = px - py
  const se = Math.sqrt((px * (1 - px)) / xN + (py * (1 - py)) / yN)
  const half = z * se
  return { diff, lo: diff - half, hi: diff + half, real: diff - half > 0 || diff + half < 0 }
}

// Pretty-printers (percentage points).
export const pctCI = (ci: Interval) =>
  `${(100 * ci.p).toFixed(1)}% [${(100 * ci.lo).toFixed(1)}–${(100 * ci.hi).toFixed(1)}]`
export const diffCI = (d: DiffInterval) =>
  `${d.diff >= 0 ? '+' : ''}${(100 * d.diff).toFixed(1)}pp [${(100 * d.lo).toFixed(1)}–${(100 * d.hi).toFixed(1)}] ${d.real ? 'REAL' : 'noise'}`
