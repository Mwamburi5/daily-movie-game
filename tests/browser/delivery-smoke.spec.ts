import { expect, test as base, type Page } from '@playwright/test'

const productionOrigin = 'http://127.0.0.1:4273'
const developmentOrigin = 'http://127.0.0.1:5273'

const test = base.extend<{ browserFaults: string[] }>({
  browserFaults: async ({ page }, use) => {
    const faults: string[] = []
    const isFirstParty = (url: string) => {
      try {
        const origin = new URL(url).origin
        return origin === productionOrigin || origin === developmentOrigin
      } catch {
        return false
      }
    }

    page.on('console', (message) => {
      if (message.type() === 'error') faults.push(`console: ${message.text()}`)
    })
    page.on('pageerror', (error) => faults.push(`pageerror: ${error.message}`))
    page.on('requestfailed', (request) => {
      if (isFirstParty(request.url())) {
        faults.push(`request failed: ${request.method()} ${request.url()} (${request.failure()?.errorText ?? 'unknown'})`)
      }
    })
    page.on('response', (response) => {
      if (isFirstParty(response.url()) && response.status() >= 400) {
        faults.push(`response ${response.status()}: ${response.url()}`)
      }
    })

    await use(faults)
    expect(faults, 'no uncaught browser errors or failed first-party requests').toEqual([])
  },
})

async function openMenu(page: Page) {
  await page.goto('/')
  const intro = page.locator('[data-intro-dismiss]')
  if (await intro.isVisible()) await intro.click()
  await expect(page.locator('[data-mode="solo"]')).toBeVisible()
}

async function finishThroughTestSeam(page: Page) {
  const seam = page.getByTestId('matchcut-e2e-complete')
  await expect(seam).toBeAttached()
  await seam.evaluate((button: HTMLButtonElement) => button.click())
}

async function verifyShareAndReturn(page: Page, resultName: RegExp, sharePrefix: string) {
  await expect(page.getByRole('dialog', { name: resultName })).toBeVisible()
  const share = page.locator('[data-share-copy]')
  await share.click()
  await expect(share).toHaveText('copied ✓')
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain(sharePrefix)
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await expect(page.locator('[data-mode="solo"]')).toBeVisible()
}

test('menu keeps every mode chunk lazy until Solo is selected', async ({ page, browserFaults }) => {
  void browserFaults
  const scripts: string[] = []
  page.on('request', (request) => {
    const url = request.url()
    if (url.endsWith('.js')) scripts.push(url)
  })

  await openMenu(page)
  await page.waitForLoadState('networkidle')
  expect(scripts.filter((url) => /(?:Solo|Chronology|Connections|Duel)Game-/.test(url))).toEqual([])
  expect(scripts.some((url) => /movies-/.test(url))).toBe(false)

  await page.locator('[data-mode="solo"]').click()
  await expect(page.locator('[data-mode-stage="solo"]')).toBeVisible()
  await expect.poll(() => scripts.some((url) => /SoloGame-/.test(url))).toBe(true)
  expect(scripts.some((url) => /movies-/.test(url))).toBe(true)
  expect(scripts.some((url) => /ChronologyGame-/.test(url))).toBe(false)
  expect(scripts.some((url) => /ConnectionsGame-/.test(url))).toBe(false)
  expect(scripts.some((url) => /DuelGame-/.test(url))).toBe(false)
})

test('Daily Puzzle starts, accepts a real action, completes, shares, and returns', async ({ page, browserFaults }) => {
  void browserFaults
  await openMenu(page)
  await page.locator('[data-mode="solo"]').click()
  await expect(page.locator('[data-mode-stage="solo"]')).toBeVisible()

  await page.locator('[data-card="pile-top"]').click()
  await expect(page.locator('[aria-label^="Flips "]')).toHaveAttribute('aria-label', /^Flips 1,/)

  await finishThroughTestSeam(page)
  await verifyShareAndReturn(page, /Solved — results/, 'Match Cut · Daily Puzzle')
})

test('Chronology daily places a card, completes, shares, and returns', async ({ page, browserFaults }) => {
  void browserFaults
  await openMenu(page)
  await page.locator('[data-mode="chronology"]').click()
  await expect(page.locator('[data-mode-stage="chronology"]')).toBeVisible()

  await page.getByRole('button', { name: /— raise$/ }).first().press('Enter')
  await page.locator('[data-gap] button').first().press('Enter')
  await expect(page.locator('[data-line-card]')).toHaveCount(2)

  await finishThroughTestSeam(page)
  await verifyShareAndReturn(page, /Cleared — results/, 'Match Cut · Chronology')
})

test('Connections daily selects a ticket, completes, shares, and returns', async ({ page, browserFaults }) => {
  void browserFaults
  await openMenu(page)
  await page.locator('[data-mode="connections"]').click()
  await expect(page.locator('[data-mode-stage="connections"]')).toBeVisible()

  const firstTile = page.locator('[data-tile]').first()
  await firstTile.click()
  await expect(firstTile).toHaveAttribute('aria-pressed', 'true')

  await finishThroughTestSeam(page)
  await verifyShareAndReturn(page, /Solved — results/, 'Match Cut · Connections')
})

test('Duel draws, completes, shares, and returns', async ({ page, browserFaults }) => {
  void browserFaults
  await openMenu(page)
  await page.locator('[data-mode="duel"]').click()
  await expect(page.locator('[data-mode-stage="duel"]')).toBeVisible()

  await page.getByRole('button', { name: 'Draw a card' }).click()
  await expect(page.getByRole('dialog', { name: 'Drew three — keep one' })).toBeVisible()

  await finishThroughTestSeam(page)
  await verifyShareAndReturn(page, /Game over — results/, 'Match Cut · Duel')
})

test('practice entry starts a fresh Connections grid and remains interactive', async ({ page, browserFaults }) => {
  void browserFaults
  await openMenu(page)
  await page.locator('[data-connections-practice]').click()
  await expect(page.locator('[data-mode-stage="connections"]')).toBeVisible()
  await expect(page.getByText('practice', { exact: true })).toBeVisible()

  const firstTile = page.locator('[data-tile]').first()
  await firstTile.click()
  await expect(firstTile).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Back to menu' }).click()
  await expect(page.locator('[data-mode="solo"]')).toBeVisible()
})

test('direct development mode entry still reaches Chronology', async ({ page, browserFaults }) => {
  void browserFaults
  await page.goto(`${developmentOrigin}/?mode=chronology`)
  await expect(page.locator('[data-mode-stage="chronology"]')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Back to menu' })).toBeVisible()
})
