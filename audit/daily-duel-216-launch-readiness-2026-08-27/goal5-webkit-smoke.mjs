// goal5-webkit-smoke.mjs — Goal 5 tier 2: automated WebKit smoke against the
// current candidate's E2E preview (127.0.0.1:4273 must already be serving).
// Mirrors the four canonical mode journeys from tests/browser/delivery-smoke.spec.ts
// (real action → seam-complete → share copy) and the prior pass's receipt shape.
//
//   node audit/daily-duel-216-launch-readiness-2026-08-27/goal5-webkit-smoke.mjs
import { createRequire } from 'node:module'
import { writeFileSync, mkdirSync } from 'node:fs'
const require = createRequire('/Users/mwamburi/Projects/Daily Movie Game/package.json')
const { webkit } = require('playwright-core')

const ORIGIN = 'http://127.0.0.1:4273'
const OUT = 'output/playwright/launch-readiness'
mkdirSync(OUT, { recursive: true })

const faults = []
const results = []

const browser = await webkit.launch()
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
const page = await context.newPage()
page.on('console', (message) => { if (message.type() === 'error') faults.push(`console: ${message.text()}`) })
page.on('pageerror', (error) => faults.push(`pageerror: ${error.message}`))
page.on('requestfailed', (request) => {
  if (request.url().startsWith(ORIGIN)) faults.push(`request failed: ${request.url()}`)
})
page.on('response', (response) => {
  if (response.url().startsWith(ORIGIN) && response.status() >= 400) faults.push(`response ${response.status()}: ${response.url()}`)
})

async function openMenu() {
  await page.goto(ORIGIN + '/', { waitUntil: 'networkidle' })
  const intro = page.locator('[data-intro-dismiss]')
  if (await intro.count()) await intro.click()
  await page.locator('[data-mode="solo"]').waitFor()
}

async function seamComplete() {
  const seam = page.getByTestId('matchcut-e2e-complete')
  await seam.waitFor({ state: 'attached' })
  await seam.evaluate((button) => button.click())
}

async function shareAndReturn(resultName) {
  await page.getByRole('dialog', { name: resultName }).waitFor()
  const share = page.locator('[data-share-copy]')
  await share.click()
  await page.waitForTimeout(400)
  const copied = (await share.textContent())?.trim()
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await page.locator('[data-mode="solo"]').waitFor()
  return copied
}

// Daily Puzzle: flip the pile top (a real, journaled action), finish, share
await openMenu()
await page.locator('[data-mode="solo"]').click()
await page.locator('[data-mode-stage="solo"]').waitFor()
await page.locator('[data-card="pile-top"]').click()
await page.locator('[aria-label^="Flips 1,"]').waitFor()
await seamComplete()
results.push({ mode: 'solo', terminal: true, copied: await shareAndReturn(/Solved — results/) })

// Chronology: raise the first choice and place it into the first gap
await page.locator('[data-mode="chronology"]').click()
await page.locator('[data-mode-stage="chronology"]').waitFor()
await page.getByRole('button', { name: /— raise$/ }).first().press('Enter')
await page.locator('[data-gap] button').first().press('Enter')
await page.waitForFunction(() => document.querySelectorAll('[data-line-card]').length === 2)
await seamComplete()
results.push({ mode: 'chronology', terminal: true, copied: await shareAndReturn(/Cleared — results/) })

// Connections: select a ticket
await page.locator('[data-mode="connections"]').click()
await page.locator('[data-mode-stage="connections"]').waitFor()
const tile = page.locator('[data-tile]').first()
await tile.click()
await page.waitForFunction(() => document.querySelector('[data-tile][aria-pressed="true"]') !== null)
await seamComplete()
results.push({ mode: 'connections', terminal: true, copied: await shareAndReturn(/Solved — results/) })

// Duel: deterministic ordinary draw, keep option 1 (three distinct named options)
await page.locator('[data-mode="duel"]').click()
await page.locator('[data-mode-stage="duel"]').waitFor()
const fixture = page.getByTestId('matchcut-e2e-ordinary-draw')
await fixture.waitFor({ state: 'attached' })
await fixture.evaluate((button) => button.click())
await page.getByRole('button', { name: 'Draw a card' }).click()
const drawDialog = page.getByRole('dialog', { name: 'Drew three — keep one' })
await drawDialog.waitFor()
const names = await drawDialog.locator('[data-draw-choice]').evaluateAll((options) =>
  options.map((option) => option.getAttribute('aria-label')),
)
if (new Set(names).size !== 3) faults.push(`duel draw options not distinct: ${JSON.stringify(names)}`)
await drawDialog.locator('[data-draw-choice]').first().click()
await page.waitForFunction(() => document.querySelector('[data-testid="matchcut-e2e-player-hand"]')?.textContent === '8')
await seamComplete()
results.push({ mode: 'duel', terminal: true, copied: await shareAndReturn(/Game over — results/) })

const receipt = {
  candidate: 'codex/daily-mode-polish ce398376d0c03be5356d64000557817c2f0150c3 + launch-readiness dirty worktree',
  date: '2026-08-31',
  browserVersion: browser.version(),
  userAgent: await page.evaluate(() => navigator.userAgent),
  results,
  faults,
}
await browser.close()
writeFileSync(`${OUT}/webkit-smoke-receipt.json`, JSON.stringify(receipt, null, 2))
console.log(JSON.stringify(receipt, null, 2))
