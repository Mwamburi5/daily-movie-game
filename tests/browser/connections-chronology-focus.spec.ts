import { test, expect, type Page } from '@playwright/test'
import grids from '../../src/data/connections-grids.json' with { type: 'json' }
import CHRONOLOGY_POOL from '../../src/data/chronology-pool.json' with { type: 'json' }
import { dealRoundShaped } from '../../src/lib/chronology.ts'

const seed = '2026-10-03'
async function menu(page: Page) {
  await page.clock.install({ time: new Date(2026, 9, 3, 12) })
  await page.goto('/')
  if (await page.locator('[data-intro-dismiss]').count()) await page.locator('[data-intro-dismiss]').click()
  await expect(page.locator('[data-mode="chronology"]')).toBeVisible()
}

test('arrival and optional finish agree on the Connections/Chronology focus', async ({ page }) => {
  await menu(page)
  expect(await page.locator('[data-mode]').evaluateAll(es => es.map(e => e.getAttribute('data-mode')))).toEqual(['chronology', 'connections', 'solo', 'duel'])
  await expect(page.locator('[data-menu-recommended]')).toContainText('Start here')
  await page.locator('[data-mode="chronology"]').click()
  // This case checks navigation, not skill or a fully played timeline.
  await page.getByTestId('matchcut-e2e-complete').evaluate((e: HTMLButtonElement) => e.click())
  await expect(page.locator('[data-result-program]')).toContainText('One puzzle is enough')
  await expect(page.locator('[data-next-daily]')).toHaveAttribute('data-next-daily', 'connections')
  await expect(page.locator('[data-result-cta="menu"]')).toHaveClass(/action--primary/)
})

test('Connections loss explains every answer and clears stale guess feedback', async ({ page }) => {
  await menu(page)
  await page.locator('[data-mode="connections"]').click()
  const day = (s: string) => Date.parse(`${s}T12:00:00Z`) / 86_400_000
  const offset = day(seed) - day(grids.anchor)
  const grid = grids.grids[(offset % grids.grids.length + grids.grids.length) % grids.grids.length]
  for (let i = 0; i < 4; i++) {
    if (await page.locator('[data-action="deselect"]').isEnabled()) await page.locator('[data-action="deselect"]').click()
    for (const group of grid.groups) await page.locator(`[data-tile="${group.films[i]}"]`).click()
    await page.locator('[data-action="submit"]').click()
  }
  await expect(page.getByRole('dialog', { name: 'Missed it — results' })).toBeVisible()
  const recap = page.locator('[data-connections-recap]')
  await recap.locator(':scope > summary').click()
  for (const explanation of await recap.locator('[data-group-explanation]').all()) await explanation.locator('summary').click()
  await expect(recap.locator('li')).toHaveCount(16)
  await page.getByRole('button', { name: 'See the revealed groups', exact: true }).click()
  await expect(page.locator('[data-solved-group]')).toHaveCount(4)
  await expect(page.getByText('not a group', { exact: true })).toHaveCount(0)
  await expect(page.locator('[data-group-explanation]')).toHaveCount(4)
})

test('an ordinarily played Chronology result contains the actual eleven dated films', async ({ page }) => {
  await menu(page)
  await page.locator('[data-mode="chronology"]').click()
  const deal = dealRoundShaped(seed, CHRONOLOGY_POOL, 'standard')
  const cards = new Map([deal.anchor, ...deal.hand].map(card => [card.id, card]))
  for (let turn = 0; turn < 10; turn++) {
    const id = await page.locator('[data-choice]').first().getAttribute('data-choice')
    const card = cards.get(id!)!
    const ids = await page.locator('[data-line-card]').evaluateAll(es => es.map(e => e.getAttribute('data-line-card')!))
    const slot = ids.findIndex(id => { const other = cards.get(id)!; return other.releaseDate > card.releaseDate || (other.releaseDate === card.releaseDate && other.id > card.id) })
    await page.locator(`[data-choice="${id}"]`).press('Enter')
    await expect(page.locator('[data-gap] button')).toHaveCount(ids.length + 1)
    await page.locator('[data-gap] button').nth(slot < 0 ? ids.length : slot).press('Enter')
    await expect(page.locator('[data-choice]')).toHaveCount(9 - turn)
  }
  await expect(page.getByRole('dialog', { name: 'Cleared — results' })).toBeVisible()
  await page.locator('[data-chronology-recap] > summary').click()
  await expect(page.locator('[data-chronology-recap] time')).toHaveCount(11)
  expect(await page.locator('[data-chronology-recap] time').evaluateAll(es => es.map(e => e.getAttribute('datetime')))).toEqual([deal.anchor, ...deal.hand].sort((a, b) => a.releaseDate.localeCompare(b.releaseDate) || a.id.localeCompare(b.id)).map(card => card.releaseDate))
})

test('another tab refreshes completed stamps without a reload', async ({ page, context }) => {
  await menu(page)
  const other = await context.newPage()
  await menu(other)
  await page.locator('[data-mode="chronology"]').click()
  await page.getByTestId('matchcut-e2e-complete').evaluate((e: HTMLButtonElement) => e.click())
  await expect(other.locator('[data-daily-passport]')).toHaveAttribute('aria-label', 'Daily passport: 1 of 3 daily modes completed today')
  await expect(other.locator('.menu-card').filter({ has: other.locator('[data-menu-recommended]') }).locator('[data-mode]')).toHaveAttribute('data-mode', 'connections')
})

test('unavailable storage is explained while games remain playable', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new Error('quota') }
    Storage.prototype.getItem = () => { throw new Error('unavailable') }
  })
  await menu(page)
  await expect(page.locator('[data-progress-notice]')).toContainText('Progress cannot be saved')
  await page.locator('[data-mode="connections"]').click()
  await expect(page.locator('[data-tile]')).toHaveCount(16)
  await page.getByTestId('matchcut-e2e-complete').evaluate((e: HTMLButtonElement) => e.click())
  await expect(page.locator('[data-result-actions] [data-progress-notice]')).toContainText('You can keep playing')
})
