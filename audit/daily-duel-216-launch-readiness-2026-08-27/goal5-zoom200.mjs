// goal5-zoom200.mjs — Goal 5 tier 3: automated 200 percent zoom/text-enlargement
// captures against the current candidate's E2E preview (127.0.0.1:4273).
// Convention from the prior acceptance pass: a 720x450 CSS viewport at
// deviceScaleFactor 2 is the layout-faithful equivalent of true 200 percent
// browser zoom on a 1440x900 window (vw units re-resolve correctly, unlike a
// CSS-zoom proxy). Every capture also asserts zero horizontal page overflow.
// This pass adds the Goal 1 support/privacy disclosure, a Goal 3
// sanitized-progress menu, and the Goal 4 worst long-title board as surfaces.
//
//   node audit/daily-duel-216-launch-readiness-2026-08-27/goal5-zoom200.mjs
import { createRequire } from 'node:module'
import { writeFileSync, mkdirSync } from 'node:fs'
const require = createRequire('/Users/mwamburi/Projects/Daily Movie Game/package.json')
const { chromium } = require('playwright-core')

const ORIGIN = 'http://127.0.0.1:4273'
const OUT = 'output/playwright/launch-readiness'
mkdirSync(OUT, { recursive: true })

const failures = []
const captures = []

const browser = await chromium.launch()

async function fresh(initScript) {
  const context = await browser.newContext({
    viewport: { width: 720, height: 450 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  if (initScript) await page.addInitScript(initScript)
  return { context, page }
}

async function openMenu(page) {
  await page.goto(ORIGIN + '/', { waitUntil: 'networkidle' })
  const intro = page.locator('[data-intro-dismiss]')
  if (await intro.count()) await intro.click()
  await page.locator('[data-mode="solo"]').waitFor()
}

async function capture(page, name) {
  await page.waitForTimeout(350)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  if (overflow) failures.push(`${name}: horizontal overflow at 200 percent`)
  const path = `${OUT}/zoom200-${name}-1440x900.png`
  await page.screenshot({ path, fullPage: false })
  captures.push(path)
  console.log(`${name}: captured${overflow ? ' (OVERFLOW!)' : ''}`)
}

// menu + each mode's initial state + one terminal result
{
  const { context, page } = await fresh()
  await openMenu(page)
  await capture(page, 'menu')
  for (const mode of ['solo', 'chronology', 'connections', 'duel']) {
    await openMenu(page)
    await page.locator(`[data-mode="${mode}"]`).click()
    await page.locator(`[data-mode-stage="${mode}"]`).waitFor()
    await capture(page, `${mode}-initial`)
  }
  // one terminal result via the seam (Connections)
  await openMenu(page)
  await page.locator('[data-mode="connections"]').click()
  await page.locator('[data-mode-stage="connections"]').waitFor()
  const seam = page.getByTestId('matchcut-e2e-complete')
  await seam.waitFor({ state: 'attached' })
  await seam.evaluate((button) => button.click())
  await page.getByRole('dialog', { name: /Solved — results/ }).waitFor()
  await capture(page, 'connections-result')
  await context.close()
}

// Goal 1 surface: overview help with the support card and expanded privacy disclosure
{
  const { context, page } = await fresh()
  await openMenu(page)
  await page.locator('[data-rules-open]').click()
  const dialog = page.getByRole('dialog', { name: 'How to play all modes' })
  await dialog.waitFor()
  const privacy = dialog.locator('[data-privacy-disclosure]')
  await privacy.locator('summary').click()
  await dialog.locator('[data-player-support]').scrollIntoViewIfNeeded()
  await capture(page, 'help-support-privacy')
  await context.close()
}

// Goal 3 surface: sanitized-progress menu from a corrupt matchcut:v1 blob
{
  const corrupt = `try { localStorage.setItem('matchcut:v1', JSON.stringify({
    version: 1,
    solo: { streak: 3, lastSeed: '2026-08-31', best: 12 },
    chronology: { streak: 'NaN', lastSeed: 42, best: {} },
    connections: { streak: -8, lastSeed: '2026-08-31', best: 99 },
    duel: { matinee: { plays: 3, wins: 8 } },
    lastDifficulty: 'impossible',
    seenOnboarding: true,
  })) } catch {}`
  const { context, page } = await fresh(corrupt)
  await page.goto(ORIGIN + '/', { waitUntil: 'networkidle' })
  const intro = page.locator('[data-intro-dismiss]')
  if (await intro.count()) await intro.click()
  await page.locator('[data-mode="solo"]').waitFor()
  await capture(page, 'sanitized-progress-menu')
  await context.close()
}

// Goal 4 surface: the densest long-title Connections board
{
  const { context, page } = await fresh(`(() => {
    const RealDate = Date
    const fixed = new RealDate('2026-09-25T12:00:00')
    window.Date = class extends RealDate {
      constructor(...args) { if (args.length) { super(...args) } else { super(fixed.getTime()) } }
      static now() { return fixed.getTime() }
    }
  })()`)
  await openMenu(page)
  await page.locator('[data-mode="connections"]').click()
  await page.locator('[data-tile="blackkklansman"]').waitFor()
  await page.evaluate(async () => { await document.fonts.load('700 10px Domine'); await document.fonts.ready })
  await capture(page, 'connections-long-title-board')
  await context.close()
}

await browser.close()
writeFileSync(`${OUT}/zoom200-receipt.json`, JSON.stringify({
  candidate: 'codex/daily-mode-polish ce398376d0c03be5356d64000557817c2f0150c3 + launch-readiness dirty worktree',
  date: '2026-08-31',
  method: '720x450 CSS viewport at deviceScaleFactor 2 (200 percent of 1440x900)',
  captures,
  failures,
}, null, 2))
console.log(failures.length ? `FAILURES: ${JSON.stringify(failures)}` : 'all captures clean of horizontal overflow')
