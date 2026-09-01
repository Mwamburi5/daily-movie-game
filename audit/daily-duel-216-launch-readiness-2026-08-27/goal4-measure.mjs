// goal4-measure.mjs — one-off Goal 4 measurement pass (evidence gathering only,
// no repo mutation). Drives the already-running E2E preview on 127.0.0.1:4273.
import { createRequire } from 'node:module'
import { writeFileSync } from 'node:fs'
const require = createRequire('/Users/mwamburi/Projects/Daily Movie Game/package.json')
const { chromium } = require('playwright-core')

const ORIGIN = 'http://127.0.0.1:4273'
const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
]
// extra Chronology envelope probes beyond the required matrix
const CHRONO_PROBES = [
  { width: 1280, height: 800 },
  { width: 1024, height: 700 },
  { width: 1024, height: 690 },
  { width: 1440, height: 900 },
]
const BOARDS = [
  { seed: '2026-09-25', label: 'grid81-densest', mustHave: 'blackkklansman' },
  { seed: '2027-05-27', label: 'grid325-longest', mustHave: 'pirates-of-the-caribbean-the-curse-of-the-black-pearl' },
]

const results = { connections: [], chronology: [] }

async function openMenu(page) {
  await page.goto(ORIGIN + '/', { waitUntil: 'networkidle' })
  const intro = page.locator('[data-intro-dismiss]')
  if (await intro.count()) await intro.click()
  await page.locator('[data-mode="solo"]').waitFor()
}

function dateShim(seed) {
  return `(() => {
    const RealDate = Date;
    const fixed = new RealDate('${seed}T12:00:00');
    const Shim = class extends RealDate {
      constructor(...args) { if (args.length) { super(...args) } else { super(fixed.getTime()) } }
      static now() { return fixed.getTime() }
    };
    window.Date = Shim;
  })()`
}

async function measureConnections(browser, board) {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: vp, reducedMotion: 'reduce' })
    const page = await ctx.newPage()
    await page.addInitScript(dateShim(board.seed))
    await openMenu(page)
    await page.locator('[data-mode="connections"]').click()
    await page.locator('[data-mode-stage="connections"]').waitFor()
    await page.locator(`[data-tile="${board.mustHave}"]`).waitFor()
    await page.waitForTimeout(400) // let entry animation + fonts settle

    const measure = () =>
      page.evaluate(() => {
        const tiles = [...document.querySelectorAll('[data-tile]')]
        return tiles.map((tile) => {
          const span = tile.querySelector('.connections-tile-title')
          const ts = getComputedStyle(span)
          const spanRect = span.getBoundingClientRect()
          const tileRect = tile.getBoundingClientRect()
          const lineH = parseFloat(ts.lineHeight)
          return {
            id: tile.getAttribute('data-tile'),
            title: span.textContent,
            tileW: +tileRect.width.toFixed(1),
            tileH: +tileRect.height.toFixed(1),
            fontPx: parseFloat(ts.fontSize),
            lineH: +lineH.toFixed(2),
            lines: Math.round(spanRect.height / lineH),
            truncated: span.scrollHeight > span.clientHeight + 1,
            spanH: +spanRect.height.toFixed(1),
            headroom: +(tileRect.height - spanRect.height).toFixed(1),
          }
        })
      })

    const tiles = await measure()

    // badge collision on the known worst tile
    await page.locator(`[data-tile="${board.mustHave}"]`).click()
    await page.waitForTimeout(150)
    const badge = await page.evaluate((id) => {
      const tile = document.querySelector(`[data-tile="${id}"]`)
      const spans = [...tile.querySelectorAll('span')]
      const badgeEl = spans.find((s) => s.textContent.startsWith('PICK'))
      const titleEl = tile.querySelector('.connections-tile-title')
      if (!badgeEl) return { found: false }
      const b = badgeEl.getBoundingClientRect()
      const t = titleEl.getBoundingClientRect()
      const overlapX = Math.max(0, Math.min(b.right, t.right) - Math.max(b.left, t.left))
      const overlapY = Math.max(0, Math.min(b.bottom, t.bottom) - Math.max(b.top, t.top))
      return { found: true, overlapArea: +(overlapX * overlapY).toFixed(1), badge: { w: +b.width.toFixed(1), h: +b.height.toFixed(1) } }
    }, board.mustHave)
    await page.locator(`[data-tile="${board.mustHave}"]`).click() // deselect

    // 200% zoom proxy: root CSS zoom, re-measure truncation
    await page.evaluate(() => { document.documentElement.style.zoom = '2' })
    await page.waitForTimeout(250)
    const zoomTiles = await measure()
    const zoomTruncated = zoomTiles.filter((t) => t.truncated).map((t) => t.id)
    const zoomBoardOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    )
    await page.evaluate(() => { document.documentElement.style.zoom = '' })

    results.connections.push({
      board: board.label,
      seed: board.seed,
      viewport: `${vp.width}x${vp.height}`,
      tiles,
      badge,
      zoomTruncated,
      zoomBoardOverflow,
    })
    await ctx.close()
    console.log(`connections ${board.label} ${vp.width}x${vp.height} done`)
  }
}

async function measureChronology(browser, vp, opts = {}) {
  const ctx = await browser.newContext({
    viewport: vp,
    reducedMotion: opts.noPreference ? 'no-preference' : 'reduce',
  })
  const page = await ctx.newPage()
  await openMenu(page)
  await page.locator('[data-mode="chronology"]').click()
  await page.locator('[data-mode-stage="chronology"]').waitFor()
  await page.waitForTimeout(400)

  const snap = async (state) => {
    const m = await page.evaluate(() => {
      const instr = document.querySelector('.chrono-reel-instruction')
      const tray = document.querySelector('.chrono-hand')
      const tickets = [...document.querySelectorAll('.chrono-hand [data-choice]')]
      if (!instr || !tray) return null
      const i = instr.getBoundingClientRect()
      const overlaps = tickets.map((t) => {
        const r = t.getBoundingClientRect()
        const ox = Math.max(0, Math.min(i.right, r.right) - Math.max(i.left, r.left))
        const oy = Math.max(0, Math.min(i.bottom, r.bottom) - Math.max(i.top, r.top))
        return { id: t.getAttribute('data-choice'), area: +(ox * oy).toFixed(1), oy: +oy.toFixed(1) }
      }).filter((o) => o.area > 0)
      // glyph-level: does the instruction TEXT box intersect any ticket's TITLE text box?
      const titleHits = tickets.map((t) => {
        const titleEl = t.querySelector('.font-stub-display') || t
        const r = titleEl.getBoundingClientRect()
        const ox = Math.max(0, Math.min(i.right, r.right) - Math.max(i.left, r.left))
        const oy = Math.max(0, Math.min(i.bottom, r.bottom) - Math.max(i.top, r.top))
        return +(ox * oy).toFixed(1)
      }).filter((a) => a > 0)
      const trayRect = tray.getBoundingClientRect()
      return {
        instrTop: +i.top.toFixed(1),
        instrBottom: +i.bottom.toFixed(1),
        instrVisible: getComputedStyle(instr).visibility !== 'hidden' && getComputedStyle(instr).display !== 'none' && +getComputedStyle(instr).opacity > 0,
        trayTop: +trayRect.top.toFixed(1),
        ticketOverlaps: overlaps,
        titleGlyphOverlaps: titleHits,
      }
    })
    return { state, ...m }
  }

  const states = [await snap('fresh')]

  if (opts.placements) {
    for (let n = 0; n < opts.placements; n++) {
      // raise the first choice, place it in the first gap (evidence only —
      // correctness of the placement doesn't matter for geometry). A misfire
      // placement settles through a delayed commit, so wait for the line to
      // actually grow before the next raise.
      const before = await page.locator('[data-line-card]').count()
      await page.locator('[data-choice]').first().press('Enter')
      const gap = page.locator('[data-gap] button').first()
      await gap.waitFor({ timeout: 5000 })
      await gap.press('Enter')
      await page.waitForFunction(
        (b) => document.querySelectorAll('[data-line-card]').length > b,
        before,
        { timeout: 10000 },
      )
      await page.waitForTimeout(700)
    }
    states.push(await snap(`after-${opts.placements}-placements`))
    // and with a card raised (instruction's operative state)
    await page.locator('[data-choice]').first().press('Enter')
    await page.waitForTimeout(200)
    states.push(await snap('card-raised'))
  }

  results.chronology.push({
    viewport: `${vp.width}x${vp.height}`,
    reducedMotion: opts.noPreference ? 'no-preference' : 'reduce',
    states,
  })
  await ctx.close()
  console.log(`chronology ${vp.width}x${vp.height}${opts.noPreference ? ' (motion)' : ''} done`)
}

const browser = await chromium.launch()
try {
  for (const board of BOARDS) await measureConnections(browser, board)
  for (const vp of VIEWPORTS) await measureChronology(browser, vp, vp.width === 1024 ? { placements: 4 } : {})
  for (const vp of CHRONO_PROBES) await measureChronology(browser, vp)
  await measureChronology(browser, { width: 1024, height: 768 }, { noPreference: true, placements: 2 })
} finally {
  await browser.close()
  writeFileSync(
    '/private/tmp/claude-501/-Users-mwamburi-Projects-Daily-Movie-Game/56bff76e-7cf1-4883-b705-23fbb9d605ba/scratchpad/goal4-measurements.json',
    JSON.stringify(results, null, 1),
  )
  console.log('written goal4-measurements.json')
}
