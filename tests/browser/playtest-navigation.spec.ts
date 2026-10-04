import { expect, test, type Page } from '@playwright/test'
import connectionsData from '../../src/data/connections-grids.json' with { type: 'json' }

const seed = '2026-09-13'
const modes = ['chronology', 'connections', 'solo'] as const
const labels = { solo: 'Daily Puzzle', chronology: 'Chronology', connections: 'Connections' }
type Mode = typeof modes[number]

async function openMenu(page: Page, mask = 0) {
  await page.clock.install({ time: new Date(2026, 8, 13, 12) })
  await page.addInitScript(({ seed, mask, modes }) => {
    if (sessionStorage.getItem('navigation-fixture')) return
    sessionStorage.setItem('navigation-fixture', '1')
    const progress: Record<string, unknown> = { v: 1, seenOnboarding: true }
    modes.forEach((mode, index) => {
      progress[mode] = { lastSeed: mask & (1 << index) ? seed : null, streak: 1, best: null }
    })
    localStorage.setItem('matchcut:v1', JSON.stringify(progress))
  }, { seed, mask, modes })
  await page.goto('/')
  await expect(page.locator('[data-daily-passport]')).toBeVisible()
}

async function finish(page: Page, mode: Mode, stuck = false) {
  // Lazy navigation can briefly retain the old mode's hidden test seam. Wait
  // for the intended board, and for any replay exit animation to finish,
  // before completing that board rather than clicking the outgoing seam.
  const stage = page.locator(`[data-mode-stage="${mode}"]`)
  await expect(stage).toBeVisible()
  await expect(stage.locator('[data-result-actions]')).toBeHidden()
  const seam = stage.getByTestId(stuck ? 'matchcut-e2e-stuck' : 'matchcut-e2e-complete')
  await expect(seam).toBeAttached()
  await seam.evaluate((button: HTMLButtonElement) => button.click())
  await expect(page.locator('[data-result-actions]')).toBeVisible()
}

async function progress(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('matchcut:v1')!))
}

test('all eight passport states recommend only the first unfinished daily', async ({ page }) => {
  await openMenu(page)
  for (let mask = 0; mask < 8; mask += 1) {
    await page.evaluate(({ seed, mask, modes }) => {
      const saved = JSON.parse(localStorage.getItem('matchcut:v1')!)
      modes.forEach((mode, index) => {
        saved[mode] = { lastSeed: mask & (1 << index) ? seed : null, streak: 1, best: null }
      })
      localStorage.setItem('matchcut:v1', JSON.stringify(saved))
    }, { seed, mask, modes })
    await page.reload()
    const unfinished = modes.filter((_, index) => !(mask & (1 << index)))
    const passport = page.locator('[data-daily-passport]')
    if (unfinished.length) {
      await expect(passport).toHaveAttribute('aria-label', `Daily passport: ${3 - unfinished.length} of 3 daily modes completed today`)
      const recommended = page.locator('.menu-card').filter({ has: page.locator('[data-menu-recommended]') })
      await expect(recommended.locator('[data-mode]')).toHaveAttribute('data-mode', unfinished[0])
    } else {
      await expect(passport).toHaveAttribute('aria-label', 'Triple Feature complete: all 3 daily modes completed today')
      await expect(page.locator('[data-menu-recommended]')).toHaveCount(0)
      await expect(page.locator('.menu-recommendation')).toContainText('Try practice or Duel')
    }
  }
})

for (const entry of modes) {
  test(`daily flow entered from ${entry} skips completions and preserves replay records`, async ({ page }) => {
    await openMenu(page)
    await page.locator(`[data-mode="${entry}"]`).click()
    const completed = new Set<Mode>()
    let current: Mode = entry
    for (let step = 0; step < 3; step += 1) {
      await finish(page, current)
      completed.add(current)
      const next = modes.find((mode) => !completed.has(mode))
      if (next) {
        const button = page.getByRole('button', { name: `Next: ${labels[next]}`, exact: true })
        await expect(button).toBeVisible()
        await button.press('Enter')
        current = next
      }
    }
    await expect(page.locator('[data-result-program]')).toContainText('Triple Feature complete!')
    await expect(page.locator('[data-next-daily]')).toHaveCount(0)
    const firstRecords = await progress(page)
    await page.getByRole('button', { name: /Replay today/ }).click()
    await finish(page, current)
    expect(await progress(page)).toEqual(firstRecords)
    await expect(page.locator('[data-daily-meta]')).toContainText('already played today')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    await expect(page.locator('[data-daily-passport]')).toHaveAttribute('aria-label', /Triple Feature complete/)
    const events = await page.evaluate(() => (
      (window as unknown as { vaq?: Array<[string, { name: string; data: { mode?: string; kind?: string } }]> }).vaq ?? []
    ).map(([, event]) => event))
    expect(events.filter((event) => event.name === 'mode_start')).toHaveLength(4)
    expect(events.filter((event) => event.name === 'mode_finish')).toHaveLength(4)
    expect(events.filter((event) => event.name === 'replay')).toHaveLength(1)
  })
}

test('stuck Puzzle and lost Connections stamp completion and are skipped', async ({ page }) => {
  await openMenu(page, 1) // Chronology is already finished in the revised order.
  await page.locator('[data-mode="solo"]').click()
  await finish(page, 'solo', true)
  await expect(page.locator('[data-daily-meta]')).toContainText('showing up counts')
  await page.getByRole('button', { name: 'Next: Connections', exact: true }).click()
  const day = (value: string) => Date.parse(`${value}T00:00:00Z`) / 86_400_000
  const offset = day(seed) - day(connectionsData.anchor)
  const grid = connectionsData.grids[((offset % connectionsData.grids.length) + connectionsData.grids.length) % connectionsData.grids.length]
  for (let guess = 0; guess < 4; guess += 1) {
    if (guess) await page.getByRole('button', { name: 'Deselect', exact: true }).click()
    const ids = [grid.groups[0].films[guess], grid.groups[0].films[(guess + 1) % 4], ...grid.groups[1].films.slice(0, 2)]
    for (const id of ids) await page.locator(`[data-tile="${id}"]`).click()
    await page.getByRole('button', { name: 'Submit', exact: true }).click()
  }
  await expect(page.getByRole('dialog', { name: 'Missed it — results' })).toBeVisible()
  await expect(page.locator('[data-result-program]')).toContainText('Triple Feature complete!')
  const saved = await progress(page)
  expect(saved.solo).toMatchObject({ lastSeed: seed, best: null })
  expect(saved.connections).toMatchObject({ lastSeed: seed, best: null })
})

test('all practice variants keep practice replay and leave every daily unstamped', async ({ page }) => {
  await openMenu(page)
  const variants: [string, Mode][] = [['[data-solo-practice]', 'solo'], ['[data-chrono-practice="easy"]', 'chronology'], ['[data-chrono-practice="hard"]', 'chronology'], ['[data-connections-practice]', 'connections']]
  for (const [selector, mode] of variants) {
    await page.locator(selector).click()
    await finish(page, mode)
    await expect(page.locator('[data-next-daily]')).toHaveCount(0)
    await expect(page.locator('[data-result-actions]').getByRole('button', { name: /^(Replay this hand|New round|New grid)$/ })).toBeVisible()
    await page.locator('[data-share-copy]').click()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('practice ·')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    await expect(page.locator('[data-daily-passport]')).toHaveAttribute('aria-label', 'Daily passport: 0 of 3 daily modes completed today')
  }
})

test('local midnight refresh preserves the active hand and dated result until an explicit next click', async ({ page }) => {
  await openMenu(page)
  await page.clock.setSystemTime(new Date(2026, 8, 13, 23, 59))
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await page.locator('[data-mode="solo"]').click()
  await page.locator('[data-card="pile-top"]').click()
  await expect(page.locator('[aria-label^="Flips "]')).toHaveAttribute('aria-label', /^Flips 1, score 1,/)
  const hand = await page.locator('[data-hand-layout="rack"] [data-card]').evaluateAll((cards) => cards.map((card) => card.getAttribute('data-card')))
  await page.clock.fastForward(61_000)
  expect(await page.locator('[data-hand-layout="rack"] [data-card]').evaluateAll((cards) => cards.map((card) => card.getAttribute('data-card')))).toEqual(hand)
  await expect(page.locator('[aria-label^="Flips "]')).toHaveAttribute('aria-label', /^Flips 1, score 1,/)
  await finish(page, 'solo')
  await expect(page.locator('[data-result-program]')).toContainText(`This result is for ${seed}`)
  await expect(page.getByRole('button', { name: 'Replay this hand', exact: true })).toBeVisible()
  expect((await progress(page)).solo.lastSeed).toBe(seed)
  await page.getByRole('button', { name: 'Next: Chronology', exact: true }).click()
  await expect(page.locator('[data-mode-stage="chronology"]')).toBeVisible()
  await finish(page, 'chronology')
  expect((await progress(page)).chronology.lastSeed).toBe('2026-09-14')
})

test('a completed passport refreshes at local midnight without a reload', async ({ page }) => {
  await openMenu(page, 7)
  await page.clock.setSystemTime(new Date(2026, 8, 13, 23, 59))
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(page.locator('[data-daily-passport]')).toHaveAttribute('aria-label', /Triple Feature complete/)
  await page.clock.fastForward(61_000)
  await expect(page.locator('[data-daily-passport]')).toHaveAttribute('aria-label', 'Daily passport: 0 of 3 daily modes completed today')
  await expect(page.locator('[data-menu-recommended]')).toHaveText('Start here · daily')
})
