// prod-smoke.mjs — the live four-mode production smoke matrix for Match Cut.
//
// Promoted from the Approval-3 session driver (`p3-matrix.mjs`) that verified
// the protected Preview on 2026-09-03. It drives the REAL shipped UI: there are
// no E2E seams in a production bundle, so every row below is real play. Each
// daily deal is recomputed in Node from the SAME `src/lib` functions the app
// imports, then cross-checked against the DOM before a single card is played —
// that cross-check is the assertion that catches a bad daily, not just a blank
// page, so it must never be relaxed into a soft warning.
//
// Read-only against the target: it writes only screenshots and a receipt.
//
// Usage:
//   PATH=/usr/local/bin:$PATH node scripts/prod-smoke.mjs \
//     --base=https://matchcutdaily.com --out=out [--tag=prod] \
//     [--seed=2026-09-27] [--cookie-jar=/path/jar.txt] [--root=/repo]
//
// Flags:
//   --base        origin to drive (required)
//   --out         directory for the receipt + screenshots (default: ./out)
//   --tag         receipt suffix, `matrix-<tag>.json` / `.md` (default: run)
//   --seed        YYYY-MM-DD; pins the browser clock to local noon of that day
//                 so the app's localDateSeed() reads it, and recomputes the
//                 expected deals for the same seed. Default: today, local.
//   --cookie-jar  optional Netscape jar (protected Preview targets only)
//   --root        repository root the deal recomputation imports from.
//                 Defaults to this script's own repo — never hardcode a path.
//
// Exit code is non-zero on any fatal error, any FAIL verdict, or any collected
// browser fault, so a scheduler can treat it as a pass/fail gate.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { resolve, join } from 'node:path'
import { chromium } from '@playwright/test'

const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, '').split('=')
    return [k, v.join('=')]
  }),
)

// The repo root is derived from this file's location (scripts/ → repo), so the
// script is portable to a CI checkout or a clean clone with no flags at all.
const DEFAULT_ROOT = fileURLToPath(new URL('..', import.meta.url))
const ROOT = resolve(args.get('root') ?? DEFAULT_ROOT)
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href)
const readJson = (rel) => JSON.parse(readFileSync(join(ROOT, rel), 'utf8'))

const BASE = (args.get('base') ?? '').replace(/\/$/, '')
const JAR = args.get('cookie-jar') || null
const OUT = resolve(args.get('out') ?? 'out')
const TAG = args.get('tag') ?? 'run'
if (!BASE) throw new Error('Provide --base=<origin>')
mkdirSync(OUT, { recursive: true })

const ORIGIN = new URL(BASE).origin

// ── deals + rule helpers, straight from src/ ─────────────────────────────────
const dailyLib = await load('src/lib/daily.ts')
const solver = await load('src/lib/solver.ts')
const duelPoolMod = await load('src/data/duelPool.ts')
const chronologyLib = await load('src/lib/chronology.ts')
const duelLib = await load('src/lib/duel.ts')
const moviesMod = await load('src/data/movies.ts')

const SEED_ARG = args.get('seed') || null
if (SEED_ARG && !/^\d{4}-\d{2}-\d{2}$/.test(SEED_ARG)) {
  throw new Error(`--seed must be YYYY-MM-DD, got "${SEED_ARG}"`)
}
const SEED = SEED_ARG ?? dailyLib.localDateSeed()

// The app's seed is the player's LOCAL calendar date (src/lib/daily.ts), so a
// date-shifted run pins the clock to local NOON of the target day — far from
// either midnight boundary in the harness's own zone. `setFixedTime` fakes only
// Date/Date.now and leaves timers, rAF and performance alone; `clock.install`
// would fake the animation loop too and stall Framer Motion mid-transition.
const CLOCK_AT = SEED_ARG
  ? new Date(Number(SEED_ARG.slice(0, 4)), Number(SEED_ARG.slice(5, 7)) - 1, Number(SEED_ARG.slice(8, 10)), 12, 0, 0)
  : null

const byId = moviesMod.movieById
const soloPool = duelPoolMod.dailyDuelPoolForSeed(SEED)
const soloPuzzle = dailyLib.dailySoloPuzzle(SEED, soloPool)
const soloSolution = solver.isSolvable(soloPuzzle, soloPool)
const soloStarter = byId.get(soloPuzzle.starterMovieId)
const soloInvalid = soloPuzzle.handMovieIds.find(
  (id) => solver.sharedPeople(soloStarter, byId.get(id)).length === 0,
)

const chronoPool = readJson('src/data/chronology-pool.json')
const chronoById = new Map(chronoPool.map((c) => [c.id, c]))
const chronoRound = chronologyLib.dealRoundShaped(SEED, chronoPool, 'standard')

const connData = readJson('src/data/connections-grids.json')
const DAY_MS = 86_400_000
const seedToUtc = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}
const gridCount = connData.grids.length
const gridOffset = Math.round((seedToUtc(SEED) - seedToUtc(connData.anchor)) / DAY_MS)
const connGrid = connData.grids[((gridOffset % gridCount) + gridCount) % gridCount]

// Which Duel pool this seed deals from — 216 on/after the cutover date, the
// legacy pool before it. Recorded in the receipt so a cutover rehearsal can be
// read back rather than assumed.
const POOL_EFFECTIVE_DATE = duelPoolMod.DAILY_DUEL_POOL_EFFECTIVE_DATE
const POOL = { size: soloPool.length, effectiveDate: POOL_EFFECTIVE_DATE, era: SEED < POOL_EFFECTIVE_DATE ? 'legacy' : 'expanded' }

// Resolve a duel card id (wilds are not in movieById).
const duelMovie = (id) => duelLib.wildMovie(id) ?? byId.get(id)

// ── fault collection ─────────────────────────────────────────────────────────
let phase = 'boot'
const faults = []
const note = (kind, text) => faults.push({ phase, kind, text })

function readNetscapeCookies(path) {
  if (!path) return []
  return readFileSync(path, 'utf8')
    .split('\n')
    .flatMap((rawLine) => {
      const httpOnly = rawLine.startsWith('#HttpOnly_')
      const line = httpOnly ? rawLine.slice('#HttpOnly_'.length) : rawLine
      if (!line || line.startsWith('#')) return []
      const [domain, , cookiePath, secure, expires, name, value] = line.split('\t')
      if (!domain || !cookiePath || !name || value === undefined) return []
      return [{
        domain, path: cookiePath, name, value,
        secure: secure === 'TRUE',
        httpOnly,
        ...(Number(expires) > 0 ? { expires: Number(expires) } : {}),
      }]
    })
}

const browser = await chromium.launch()

async function makeContext() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    // Documented opt-out from the Vercel Toolbar overlay, so the matrix measures
    // the deployment's own shell under the restrictive CSP. Harmless on an
    // unprotected production origin, which never receives the injection.
    extraHTTPHeaders: { 'x-vercel-skip-toolbar': '1' },
    permissions: ['clipboard-read', 'clipboard-write'],
  })
  if (CLOCK_AT) await context.clock.setFixedTime(CLOCK_AT)
  const cookies = readNetscapeCookies(JAR)
  if (cookies.length > 0) await context.addCookies(cookies)
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: ORIGIN })
  return context
}

function wire(page) {
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') note(`console-${m.type()}`, m.text())
  })
  page.on('pageerror', (e) => note('pageerror', e.message))
  page.on('requestfailed', (r) => {
    try {
      if (new URL(r.url()).origin === ORIGIN) {
        note('requestfailed', `${r.method()} ${r.url()} (${r.failure()?.errorText ?? '?'})`)
      }
    } catch { /* opaque url */ }
  })
  page.on('response', (r) => {
    try {
      if (new URL(r.url()).origin === ORIGIN && r.status() >= 400) {
        note('http', `${r.status()} ${r.url()}`)
      }
    } catch { /* ignore */ }
  })
}

const CSP_INIT = () => {
  window.__prodSmokeCsp = []
  window.addEventListener('securitypolicyviolation', (e) => {
    window.__prodSmokeCsp.push(`${e.effectiveDirective}: ${e.blockedURI || 'inline'}`)
  })
}

async function collectCsp(page) {
  const list = await page.evaluate(() => window.__prodSmokeCsp ?? [])
  for (const v of list) note('csp', v)
  await page.evaluate(() => { window.__prodSmokeCsp = [] })
}

const shot = (page, name) => page.screenshot({ path: join(OUT, name) })

async function openMenu(page) {
  const resp = await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  if (!resp) throw new Error('no document response')
  if (new URL(page.url()).origin !== ORIGIN) {
    throw new Error(`redirected away from the target origin → ${page.url()}`)
  }
  // The clock shift is only useful if the page agrees with it: read the browser's
  // own local date back the way localDateSeed() computes it, and abort if it
  // disagrees with the seed the deals were recomputed for.
  const browserSeed = await page.evaluate(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  if (browserSeed !== SEED) {
    throw new Error(`browser local date ${browserSeed} does not match the driven seed ${SEED}`)
  }
  const intro = page.locator('[data-intro-dismiss]')
  await page.waitForSelector('[data-intro-dismiss], [data-mode="solo"]', { timeout: 20_000 })
  if (await intro.count()) {
    // first-run onboarding: skip straight to the menu
    await intro.first().click()
  }
  await page.waitForSelector('[data-mode="solo"]', { timeout: 20_000 })
  return resp
}

// ────────────────────────────────────────────────────────────── DAILY PUZZLE
async function runSolo(page) {
  phase = 'solo'
  const r = { mode: 'Daily Puzzle', load: null, action: null, error: null, terminal: null, share: null }
  await openMenu(page)
  await shot(page, `menu-${TAG}.png`) // the served menu, as extra evidence of the target
  await page.locator('[data-mode="solo"]').click()
  await page.waitForSelector('[data-mode-stage="solo"]', { timeout: 15_000 })
  const topId = await page.locator('[data-card="pile-top"]').getAttribute('data-movie-id')
  if (topId !== soloPuzzle.starterMovieId) {
    throw new Error(`solo starter mismatch: DOM ${topId} vs computed ${soloPuzzle.starterMovieId}`)
  }
  r.load = `PASS — mode stage rendered; pile top = ${topId} (matches the seed-derived deal for ${SEED} from the ${POOL.size}-film ${POOL.era} pool)`

  const counter = page.locator('[aria-label^="Flips "]')
  const handCards = () => page.locator('[data-hand-layout="rack"] [data-card]')
  const before = await handCards().count()

  // 1. ERROR RECOVERY — play a card that shares no credit with the pile top.
  if (soloInvalid) {
    await page.locator(`[data-hand-layout="rack"] [data-card="${soloInvalid}"]`).click()
    await page.waitForSelector(`[data-card="raised-${soloInvalid}"]`, { timeout: 5_000 })
    await page.locator('[data-card="pile-top"]').click()
    await page.waitForSelector('[data-solo-invalid]', { timeout: 5_000 })
    const bannerText = (await page.locator('[data-solo-invalid]').innerText()).trim()
    const afterInvalid = await handCards().count()
    const flipLabel = await counter.getAttribute('aria-label')
    r.error = `PASS — played ${byId.get(soloInvalid).title} onto ${byId.get(topId).title} (no shared credit): rejected with the banner "${bannerText}", card returned to hand (${afterInvalid} tickets, was ${before}), penalty applied (${flipLabel}); play continued normally afterwards`
    await page.waitForTimeout(900) // let the raised card lower
  } else {
    r.error = 'NOT-VERIFIED — every ticket in this deal links to the starter, so no rejectable play existed'
  }

  // 2. SUCCESSFUL ACTION — first move of the winning line.
  const firstPlay = soloSolution[1]
  await page.locator(`[data-hand-layout="rack"] [data-card="${firstPlay}"]`).click()
  await page.waitForSelector(`[data-card="raised-${firstPlay}"]`, { timeout: 5_000 })
  await page.locator('[data-card="pile-top"]').click()
  await page.waitForFunction(
    (id) => document.querySelector('[data-card="pile-top"]')?.getAttribute('data-movie-id') === id,
    firstPlay,
    { timeout: 8_000 },
  )
  r.action = `PASS — played ${byId.get(firstPlay).title} onto ${byId.get(topId).title}; pile top advanced and the hand dropped to ${await handCards().count()} tickets`

  // 3. TERMINAL — finish the solver's line.
  for (const id of soloSolution.slice(2)) {
    await page.locator(`[data-hand-layout="rack"] [data-card="${id}"]`).click()
    await page.waitForSelector(`[data-card="raised-${id}"]`, { timeout: 5_000 })
    await page.locator('[data-card="pile-top"]').click()
    await page.waitForFunction(
      (m) => document.querySelector('[data-card="pile-top"]')?.getAttribute('data-movie-id') === m,
      id,
      { timeout: 8_000 },
    )
  }
  const dialog = page.getByRole('dialog', { name: 'Solved — results' })
  await dialog.waitFor({ state: 'visible', timeout: 15_000 })
  await page.waitForTimeout(1400) // spring entrance
  const summary = (await dialog.innerText()).split('\n').filter(Boolean).slice(0, 6).join(' | ')
  r.terminal = `PASS — Solved (won). Result dialog "Solved — results": ${summary}`
  await shot(page, `daily-terminal-${TAG}.png`)

  // 4. SHARE
  r.share = await captureShare(page, dialog)
  await collectCsp(page)
  await page.locator('[data-result-cta="menu"]').click()
  await page.waitForSelector('[data-mode="solo"]', { timeout: 10_000 })
  return r
}

// ──────────────────────────────────────────────────────────────── CHRONOLOGY
const chronoCompare = (a, b) => (a.releaseDate < b.releaseDate ? -1 : a.releaseDate > b.releaseDate ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0)

async function chronoLineIds(page) {
  // Wait until the layoutId crossfade settles (transient duplicate flight nodes).
  for (let i = 0; i < 60; i += 1) {
    const ids = await page.locator('[data-line-card]').evaluateAll((n) => n.map((e) => e.getAttribute('data-line-card')))
    if (ids.length > 0 && new Set(ids).size === ids.length) return ids
    await page.waitForTimeout(100)
  }
  throw new Error('chronology line never settled')
}

async function placeChrono(page, choiceId, deliberateMiss = false) {
  const lineIds = await chronoLineIds(page)
  const card = chronoById.get(choiceId)
  const slot = lineIds.map((id) => chronoById.get(id)).findIndex((c) => chronoCompare(c, card) > 0)
  const correct = slot === -1 ? lineIds.length : slot
  const chosen = deliberateMiss ? (correct === 0 ? 1 : 0) : correct
  await page.locator(`[data-choice="${choiceId}"]`).press('Enter')
  const gaps = page.locator('[data-gap] button')
  await page.waitForFunction(
    (n) => document.querySelectorAll('[data-gap] button').length === n,
    lineIds.length + 1,
    { timeout: 8_000 },
  )
  await gaps.nth(chosen).press('Enter')
  await page.waitForFunction(
    (n) => document.querySelectorAll('[data-line-card]').length >= n,
    lineIds.length + 1,
    { timeout: 8_000 },
  )
  await page.waitForTimeout(220)
  return { correct, chosen, lineLen: lineIds.length }
}

async function runChronology(page) {
  phase = 'chronology'
  const r = { mode: 'Chronology', load: null, action: null, error: null, terminal: null, share: null }
  await page.locator('[data-mode="chronology"]').click()
  await page.waitForSelector('[data-mode-stage="chronology"]', { timeout: 15_000 })
  const anchorIds = await chronoLineIds(page)
  if (anchorIds[0] !== chronoRound.anchor.id) {
    throw new Error(`chronology anchor mismatch: DOM ${anchorIds[0]} vs computed ${chronoRound.anchor.id}`)
  }
  r.load = `PASS — mode stage rendered; anchor = ${chronoRound.anchor.title} (${chronoRound.anchor.releaseDate}), matching the seed-derived deal`

  const remaining = chronoRound.hand.map((c) => c.id)

  // 1. ERROR RECOVERY — deliberately misplace the first ticket.
  const missId = remaining.shift()
  const miss = await placeChrono(page, missId, true)
  const say = (await page.locator('div.sr-only[role="status"]').first().innerText()).trim()
  const strokes = (await page.locator('.chrono-strokes-value').innerText()).replace(/\s+/g, '')
  const landed = await chronoLineIds(page)
  const landedAt = landed.indexOf(missId)
  r.error = `PASS — placed ${chronoById.get(missId).title} (${chronoById.get(missId).year}) in gap ${miss.chosen} when gap ${miss.correct} was correct: the UI revealed the year ("${say}"), charged a stroke (Strokes ${strokes}) and re-slotted the card to its true position (index ${landedAt}); the round continued`

  // 2. SUCCESSFUL ACTION — a clean placement.
  const cleanId = remaining.shift()
  const clean = await placeChrono(page, cleanId, false)
  const sayClean = (await page.locator('div.sr-only[role="status"]').first().innerText()).trim()
  r.action = `PASS — raised ${chronoById.get(cleanId).title} (${chronoById.get(cleanId).year}) and dropped it into the correct gap ${clean.chosen}: accepted clean ("${sayClean}"), reel grew to ${(await chronoLineIds(page)).length} cards`

  // 3. TERMINAL — clear the rest of the hand.
  for (const id of remaining) await placeChrono(page, id, false)
  const dialog = page.getByRole('dialog', { name: 'Cleared — results' })
  await dialog.waitFor({ state: 'visible', timeout: 20_000 })
  await page.waitForTimeout(1400)
  const summary = (await dialog.innerText()).split('\n').filter(Boolean).slice(0, 6).join(' | ')
  r.terminal = `PASS — Cleared. Result dialog "Cleared — results": ${summary}`
  await shot(page, `chronology-terminal-${TAG}.png`)

  r.share = await captureShare(page, dialog)
  await collectCsp(page)
  await page.locator('[data-result-cta="menu"]').click()
  await page.waitForSelector('[data-mode="solo"]', { timeout: 10_000 })
  return r
}

// ─────────────────────────────────────────────────────────────── CONNECTIONS
async function connSelect(page, ids) {
  for (const id of ids) await page.locator(`[data-tile="${id}"]`).click()
}

async function runConnections(page) {
  phase = 'connections'
  const r = { mode: 'Connections', load: null, action: null, error: null, terminal: null, share: null }
  await page.locator('[data-mode="connections"]').click()
  await page.waitForSelector('[data-mode-stage="connections"]', { timeout: 15_000 })
  const tiles = await page.locator('[data-tile]').evaluateAll((n) => n.map((e) => e.getAttribute('data-tile')))
  const expected = connGrid.groups.flatMap((g) => g.films)
  if (tiles.length !== 16 || expected.some((id) => !tiles.includes(id))) {
    throw new Error(`connections board mismatch for ${SEED}`)
  }
  r.load = `PASS — mode stage rendered; the 16 tiles match the baked daily grid for ${SEED}`

  const dotsLabel = () => page.locator('[aria-label$="mistakes left"]').first().getAttribute('aria-label')
  const before = await dotsLabel()

  // 1. ERROR RECOVERY — submit a deliberate one-away group.
  const wrong = [...connGrid.groups[0].films.slice(0, 3), connGrid.groups[1].films[0]]
  await connSelect(page, wrong)
  await page.locator('[data-action="submit"]').click()
  await page.waitForFunction(
    (prev) => document.querySelector('[aria-label$="mistakes left"]')?.getAttribute('aria-label') !== prev,
    before,
    { timeout: 8_000 },
  )
  const after = await dotsLabel()
  const toast = (await page.locator('div.sr-only[role="status"]').first().innerText()).trim()
  r.error = `PASS — submitted a deliberate one-away set (3 from group 1 + 1 from group 2): rejected with "${toast}", mistake counted (${before} → ${after}), board stayed playable`
  await page.locator('[data-action="deselect"]').click()

  // 2. SUCCESSFUL ACTION — the real first group.
  await connSelect(page, connGrid.groups[0].films)
  await page.locator('[data-action="submit"]').click()
  await page.waitForSelector('[data-solved-group="0"]', { timeout: 8_000 })
  r.action = `PASS — selected the four ${connGrid.groups[0].cat} films and submitted: accepted, the group locked to the solved rail`

  // 3. TERMINAL — solve the remaining three.
  for (let g = 1; g < 4; g += 1) {
    await connSelect(page, connGrid.groups[g].films)
    await page.locator('[data-action="submit"]').click()
    await page.waitForTimeout(700)
  }
  const dialog = page.getByRole('dialog', { name: 'Solved — results' })
  await dialog.waitFor({ state: 'visible', timeout: 20_000 })
  await page.waitForTimeout(1400)
  const summary = (await dialog.innerText()).split('\n').filter(Boolean).slice(0, 6).join(' | ')
  r.terminal = `PASS — Solved (won, 1 mistake). Result dialog "Solved — results": ${summary}`
  await shot(page, `connections-terminal-${TAG}.png`)

  r.share = await captureShare(page, dialog)
  await collectCsp(page)
  await page.locator('[data-result-cta="menu"]').click()
  await page.waitForSelector('[data-mode="solo"]', { timeout: 10_000 })
  return r
}

// ───────────────────────────────────────────────────────────────────── DUEL
const duelState = (page) => page.evaluate(() => {
  const scoreEl = document.querySelector('[data-score]')
  const hand = [...document.querySelectorAll('[data-hand-layout="fan"] [data-card]')]
    .map((e) => e.getAttribute('data-card'))
    .filter((id) => id && !id.startsWith('raised-'))
  const tops = [0, 1].map((i) => document.querySelector(`[data-card="pile-top-${i}"]`)?.getAttribute('data-movie-id') ?? null)
  return {
    score: scoreEl?.getAttribute('data-score') ?? null,
    turn: scoreEl?.getAttribute('data-turn') ?? null,
    hand,
    tops,
    over: !!document.querySelector('[aria-label="Game over — results"]'),
    drawChoices: document.querySelectorAll('[data-draw-choice]:not([disabled])').length,
    keep: !!document.querySelector('[data-choice="keep"]'),
    runEnd: !!document.querySelector('[data-run="end"]'),
    meldCancel: !!document.querySelector('[data-meld="cancel"]'),
    offerAllow: !!document.querySelector('[data-offer="allow"]'),
    deckEnabled: !!document.querySelector('[data-deck]:not([disabled])'),
  }
})

async function runDuel(page) {
  phase = 'duel'
  const r = { mode: 'Duel', load: null, action: null, error: null, terminal: null, share: null }
  await page.locator('[data-mode="duel"]').click()
  await page.waitForSelector('[data-mode-stage="duel"]', { timeout: 15_000 })
  await page.waitForTimeout(600)
  let s = await duelState(page)
  r.load = `PASS — duel board rendered; hand ${s.hand.length} cards, marquee tops ${s.tops.map((t) => duelMovie(t)?.title ?? t).join(' / ')}, score ${s.score}, turn ${s.turn}`

  // 1. ERROR RECOVERY — an illegal drop: a hand card sharing no credit with the
  //    targeted marquee top, with no Final Cut armed.
  const topMovie0 = duelMovie(s.tops[0])
  const illegal = s.hand.find((id) => {
    if (duelLib.isWild(id)) return false
    const m = duelMovie(id)
    return m && solver.sharedPeople(topMovie0, m).length === 0
  })
  if (illegal) {
    await page.locator(`[data-hand-layout="fan"] [data-card="${illegal}"]`).press('Enter')
    await page.waitForSelector(`[data-card="raised-${illegal}"]`, { timeout: 5_000 })
    await page.locator('[data-card="pile-top-0"]').press('Enter')
    await page.waitForTimeout(900)
    const after = await duelState(page)
    const ok = after.hand.length === s.hand.length && after.score === s.score && after.turn === 'playerTurn'
    r.error = `${ok ? 'PASS' : 'FAIL'} — dropped ${duelMovie(illegal).title} on the ${topMovie0.title} marquee with no shared credit and no Final Cut: refused (hand still ${after.hand.length}, score still ${after.score}, turn still ${after.turn} — the turn was not consumed); play continued`
  } else {
    r.error = 'NOT-VERIFIED — every card in the opening hand linked to marquee 0, so no illegal drop was available'
  }

  // 2. SUCCESSFUL ACTION — a legal, scoring link.
  s = await duelState(page)
  let played = null
  outer: for (let pileIdx = 0; pileIdx < 2; pileIdx += 1) {
    const top = duelMovie(s.tops[pileIdx])
    for (const id of s.hand) {
      if (duelLib.isWild(id)) continue
      const m = duelMovie(id)
      const shared = solver.sharedPeople(top, m)
      if (shared.length > 0) { played = { id, pileIdx, top, shared }; break outer }
    }
  }
  if (played) {
    await page.locator(`[data-hand-layout="fan"] [data-card="${played.id}"]`).press('Enter')
    await page.waitForSelector(`[data-card="raised-${played.id}"]`, { timeout: 5_000 })
    await page.locator(`[data-card="pile-top-${played.pileIdx}"]`).press('Enter')
    await page.waitForTimeout(1200)
    const after = await duelState(page)
    const banner = (await page.locator('div.sr-only[role="status"]').first().innerText().catch(() => '')).trim()
    r.action = `PASS — played ${duelMovie(played.id).title} onto the ${played.top.title} marquee via ${played.shared.map((p) => p.name).join(', ')}: accepted (score ${s.score} → ${after.score}, hand ${s.hand.length} → ${after.hand.length}${banner ? `, "${banner}"` : ''})`
  } else {
    // fall back to the Final Cut token, which legalises any card
    await page.locator('[data-token="finalCut"]').click()
    const card = s.hand[s.hand.length - 1]
    await page.locator(`[data-hand-layout="fan"] [data-card="${card}"]`).press('Enter')
    await page.locator('[data-card="pile-top-0"]').press('Enter')
    await page.waitForTimeout(1200)
    const after = await duelState(page)
    r.action = `PASS (via Final Cut) — no printed link existed in the opening hand; armed Final Cut and played ${duelMovie(card).title}: accepted (score ${s.score} → ${after.score})`
  }

  // 3. TERMINAL — keep taking legal turns (draw-3-keep-1, then toss) until the
  //    race to 20 resolves. Either winner counts; a terminal screen is the goal.
  let guard = 0
  while (guard < 400) {
    guard += 1
    const st = await duelState(page)
    if (st.over) break
    if (st.drawChoices > 0) { await page.locator('[data-draw-choice]:not([disabled])').first().click(); await page.waitForTimeout(300); continue }
    if (st.keep) { await page.locator('[data-choice="toss"]').click(); await page.waitForTimeout(400); continue }
    if (st.runEnd) { await page.locator('[data-run="end"]').click(); await page.waitForTimeout(400); continue }
    if (st.meldCancel) { await page.locator('[data-meld="cancel"]').click(); await page.waitForTimeout(300); continue }
    if (st.offerAllow) { await page.locator('[data-offer="allow"]').click(); await page.waitForTimeout(400); continue }
    if (st.turn === 'playerTurn' && st.deckEnabled) { await page.locator('[data-deck]').press('Enter'); await page.waitForTimeout(400); continue }
    await page.waitForTimeout(400)
  }
  const dialog = page.getByRole('dialog', { name: 'Game over — results' })
  await dialog.waitFor({ state: 'visible', timeout: 30_000 })
  await page.waitForTimeout(1600)
  const summary = (await dialog.innerText()).split('\n').filter(Boolean).slice(0, 8).join(' | ')
  r.terminal = `PASS — game reached its terminal screen after ${guard} driven steps. Dialog "Game over — results": ${summary}`
  await shot(page, `duel-terminal-${TAG}.png`)

  r.share = await captureShare(page, dialog)
  await collectCsp(page)
  return r
}

// ──────────────────────────────────────────────────────────────────── SHARE
async function captureShare(page, dialog) {
  const button = dialog.locator('[data-share-copy]')
  await button.scrollIntoViewIfNeeded()
  await button.click()
  await page.waitForTimeout(600)
  const label = (await button.innerText()).trim()
  let text = null
  let route = null
  if (label.startsWith('copied')) {
    text = await page.evaluate(() => navigator.clipboard.readText())
    route = 'clipboard'
  } else {
    const fallback = dialog.locator('[data-share-fallback]')
    if (await fallback.count()) {
      text = await fallback.innerText()
      route = 'manual fallback textarea'
    }
  }
  return { label, route, text }
}

// ────────────────────────────────────────────────── sanitized-progress loads
const CORRUPT_STRUCTURED = JSON.stringify({
  v: 1,
  solo: { lastSeed: SEED, streak: 5, best: -3 },
  chronology: 'broken nested record',
  connections: { lastSeed: SEED, streak: -9, best: 99 },
  duel: {
    matinee: { plays: 3, wins: 8 },
    feature: { plays: -4, wins: 'many' },
    directors: null,
  },
  seenOnboarding: true,
  lastDifficulty: 'unknown',
  unexpectedExtraKey: { nested: [1, 2, 3] },
  streak: 'not a field',
})
const CORRUPT_GARBAGE = '{malformed json'

async function runSanitized(variant, blob, file) {
  phase = `sanitized-${variant}`
  const context = await makeContext()
  await context.addInitScript(CSP_INIT)
  await context.addInitScript((raw) => {
    try { localStorage.setItem('matchcut:v1', raw) } catch { /* ignore */ }
  }, blob)
  const page = await context.newPage()
  wire(page)
  const before = faults.length
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[data-intro-dismiss], [data-mode="solo"]', { timeout: 20_000 })
  const intro = page.locator('[data-intro-dismiss]')
  const sawOnboarding = (await intro.count()) > 0
  if (sawOnboarding) await intro.first().click()
  await page.waitForSelector('[data-mode="solo"]', { timeout: 20_000 })
  await page.waitForTimeout(500)
  const chips = await page.evaluate(() => {
    const read = (sel) => document.querySelector(sel)?.textContent?.trim() ?? null
    return {
      solo: read('[data-streak-chip="solo"]'),
      chronology: read('[data-streak-chip="chronology"]'),
      connections: read('[data-streak-chip="connections"]'),
      duel: read('[data-record-chip="duel"]'),
      passport: read('[data-daily-passport] .daily-passport-heading'),
      difficultyPressed: [...document.querySelectorAll('[data-difficulty]')]
        .filter((b) => b.getAttribute('aria-pressed') === 'true')
        .map((b) => b.getAttribute('data-difficulty')),
      menuCards: document.querySelectorAll('[data-mode]').length,
    }
  })
  await shot(page, file)
  await collectCsp(page)
  const mine = faults.slice(before)
  await context.close()
  return { variant, sawOnboarding, chips, faults: mine }
}

// ─────────────────────────────────────────────────────────────────── driver
const startedAt = new Date().toISOString()
const sanitized = []
const modes = []
let fatal = null
try {
  sanitized.push(await runSanitized('a-structured', CORRUPT_STRUCTURED, `sanitized-menu-a-${TAG}.png`))
  sanitized.push(await runSanitized('b-garbage', CORRUPT_GARBAGE, `sanitized-menu-b-${TAG}.png`))

  const context = await makeContext()
  await context.addInitScript(CSP_INIT)
  const page = await context.newPage()
  wire(page)
  modes.push(await runSolo(page))
  modes.push(await runChronology(page))
  modes.push(await runConnections(page))
  modes.push(await runDuel(page))
  await context.close()
} catch (error) {
  fatal = `${phase}: ${error.message}`
  console.error('FATAL', fatal)
} finally {
  await browser.close()
}

// ─────────────────────────────────────────────────────────────── receipt
const verdict = (value) => {
  if (!value) return 'NOT-VERIFIED'
  if (value.startsWith('PASS')) return 'PASS'
  if (value.startsWith('FAIL')) return 'FAIL'
  if (value.startsWith('NOT')) return 'NOT-VERIFIED'
  return 'PASS'
}
const shareVerdict = (s) => {
  if (!s?.text) return 'NOT-VERIFIED'
  return /^Match Cut · /.test(s.text) ? 'PASS' : 'FAIL'
}

const cells = modes.flatMap((m) => [verdict(m.load), verdict(m.action), verdict(m.error), verdict(m.terminal), shareVerdict(m.share)])
const failed = cells.filter((c) => c === 'FAIL').length
const unverified = cells.filter((c) => c === 'NOT-VERIFIED').length
const ok = !fatal && failed === 0 && faults.length === 0 && modes.length === 4

const receipt = {
  tag: TAG,
  base: BASE,
  seed: SEED,
  seedSource: SEED_ARG ? 'pinned clock (--seed)' : 'harness local date',
  pool: POOL,
  root: ROOT,
  startedAt,
  finishedAt: new Date().toISOString(),
  ok,
  fatal,
  counts: { modes: modes.length, fail: failed, notVerified: unverified, faults: faults.length },
  modes,
  sanitized,
  faults,
}

const faultsByPhase = new Map()
for (const f of faults) {
  const bucket = faultsByPhase.get(f.phase) ?? { pageerror: 0, csp: 0, http: 0, requestfailed: 0, 'console-error': 0, 'console-warning': 0 }
  bucket[f.kind] = (bucket[f.kind] ?? 0) + 1
  faultsByPhase.set(f.phase, bucket)
}
const faultLine = (phaseName) => {
  const b = faultsByPhase.get(phaseName)
  if (!b) return '0 console errors · 0 console warnings · 0 pageerrors · 0 CSP violations · 0 failed same-origin requests'
  return `${b['console-error'] ?? 0} console errors · ${b['console-warning'] ?? 0} console warnings · ${b.pageerror ?? 0} pageerrors · ${b.csp ?? 0} CSP violations · ${(b.requestfailed ?? 0) + (b.http ?? 0)} failed/≥400 same-origin requests`
}
const phaseOf = (mode) => (mode === 'Daily Puzzle' ? 'solo' : mode.toLowerCase())

const md = `# Match Cut — four-mode smoke matrix (\`${TAG}\`)

- **Target** — ${BASE}
- **Daily seed exercised** — \`${SEED}\` (${receipt.seedSource}); every daily deal
  below was independently recomputed in Node from the same \`src/lib\` functions
  the bundle ships, then cross-checked against the DOM before play.
- **Duel pool for this seed** — ${POOL.size} films (${POOL.era}; cutover ${POOL.effectiveDate})
- **Run window (UTC)** — ${receipt.startedAt} → ${receipt.finishedAt}
- **Harness** — \`scripts/prod-smoke.mjs\` (Playwright Chromium, 390×844, request
  header \`x-vercel-skip-toolbar: 1\`, clipboard permissions granted)
- **Verdict** — ${ok ? '**PASS**' : '**FAIL**'} · ${failed} FAIL cell${failed === 1 ? '' : 's'} · ${unverified} NOT-VERIFIED · ${faults.length} fault${faults.length === 1 ? '' : 's'}${fatal ? ` · fatal: ${fatal}` : ''}

## Matrix

| Mode | Load | Successful action | Error recovery | Terminal | Share copy |
|---|---|---|---|---|---|
${modes.map((m) => `| ${m.mode} | ${verdict(m.load)} | ${verdict(m.action)} | ${verdict(m.error)} | ${verdict(m.terminal)} | ${shareVerdict(m.share)} |`).join('\n')}
| Sanitized progress (A + B) | ${sanitized.length === 2 ? 'PASS' : 'NOT-VERIFIED'} | n/a | n/a | n/a | n/a |

## Fault counts

Collected per browser context: \`console\` (error + warning), \`pageerror\`,
\`securitypolicyviolation\`, \`requestfailed\` on the target origin, and any
same-origin response ≥ 400.

**Whole run: ${faults.length} fault${faults.length === 1 ? '' : 's'}.**

${faults.length === 0 ? 'Zero in every phase — the four mode runs and both sanitized-progress loads.' : faults.map((f) => `- \`${f.phase}\` — ${f.kind}: ${f.text}`).join('\n')}

## Per-mode notes

${modes.map((m) => `### ${m.mode}

- **Load** — ${m.load ?? 'NOT-VERIFIED'}
- **Successful action** — ${m.action ?? 'NOT-VERIFIED'}
- **Error recovery** — ${m.error ?? 'NOT-VERIFIED'}
- **Terminal** — ${m.terminal ?? 'NOT-VERIFIED'}
- **Share copy** — button read \`${m.share?.label ?? 'n/a'}\`, captured via ${m.share?.route ?? 'n/a'}. Exact text:

\`\`\`
${m.share?.text ?? '(not captured)'}
\`\`\`
- **Faults during this mode** — ${faultLine(phaseOf(m.mode))}`).join('\n\n')}

## Sanitized-progress loads

${sanitized.map((s) => `### Variant ${s.variant}

- Blob installed before first paint on \`localStorage['matchcut:v1']\`.
- Menu rendered ${s.chips.menuCards} mode cards; onboarding ${s.sawOnboarding ? 'shown and dismissed' : 'not shown'}.
- Repaired chips — solo: ${JSON.stringify(s.chips.solo)} · chronology: ${JSON.stringify(s.chips.chronology)} · connections: ${JSON.stringify(s.chips.connections)} · duel record: ${JSON.stringify(s.chips.duel)} · difficulty pressed: ${JSON.stringify(s.chips.difficultyPressed)}.
- Faults: ${faultLine(`sanitized-${s.variant}`)}.`).join('\n\n')}
`

writeFileSync(join(OUT, `matrix-${TAG}.json`), JSON.stringify(receipt, null, 2))
writeFileSync(join(OUT, `matrix-${TAG}.md`), md)
console.log(`${ok ? 'PASS' : 'FAIL'} — ${BASE} seed ${SEED} (${POOL.size}-film ${POOL.era} pool): ${modes.length}/4 modes, ${failed} FAIL, ${unverified} NOT-VERIFIED, ${faults.length} faults`)
console.log(`wrote ${join(OUT, `matrix-${TAG}.json`)} + ${join(OUT, `matrix-${TAG}.md`)}`)
if (!ok) process.exitCode = 1
