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

test('overview help stays brief and keeps its primary action visible on a compact phone', async ({ page, browserFaults }) => {
  void browserFaults
  await page.setViewportSize({ width: 375, height: 667 })
  await openMenu(page)
  await page.locator('[data-rules-open]').click()

  const dialog = page.getByRole('dialog', { name: 'How to play all modes' })
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('[data-help-overview] article')).toHaveCount(4)
  await expect(dialog.locator('[data-rules-expand]')).toHaveCount(0)
  await expect(dialog.locator('[data-rules-primary]')).toBeVisible()
  await expect(dialog.locator('[data-rules-footer]')).toBeInViewport()
  await expect(dialog).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.locator('[data-rules-primary]')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(dialog.locator('[data-rules-close]')).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(page.locator('[data-rules-open]')).toBeFocused()
})

test('each mode opens only its own rules', async ({ page, browserFaults }) => {
  void browserFaults
  const cases = [
    { mode: 'solo', label: 'Daily Puzzle', unique: 'Golf score and par', absent: 'Today’s Bill' },
    { mode: 'chronology', label: 'Chronology', unique: 'tight-call mercy', absent: 'Final Cut' },
    { mode: 'connections', label: 'Connections', unique: 'Today’s Bill', absent: 'tight-call mercy' },
    { mode: 'duel', label: 'Duel vs Computer', unique: 'Final Cut', absent: 'Today’s Bill' },
  ] as const

  for (const entry of cases) {
    await openMenu(page)
    await page.locator(`[data-mode="${entry.mode}"]`).click()
    await page.locator('[data-rules-open]').click()

    const dialog = page.getByRole('dialog', { name: `How to play ${entry.label}` })
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText(entry.unique)
    await expect(dialog).not.toContainText(entry.absent)
    await expect(dialog.locator('[data-rules-primary]')).toBeVisible()
    await dialog.locator('[data-rules-expand]').click()
    await expect(dialog.locator('[data-rules-expanded]')).toBeVisible()
    await expect(dialog.locator('[data-rules-expand]')).toHaveAttribute('aria-expanded', 'true')

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await page.getByRole('button', { name: 'Back to menu' }).click()
  }
})

test('Chronology title tray keeps ten stable choices and keyboard focus across target viewports', async ({ page, browserFaults }) => {
  void browserFaults
  const viewports = [
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1280, height: 720 },
    { width: 1440, height: 900 },
  ]

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await openMenu(page)
    await page.locator('[data-mode="chronology"]').click()

    const tray = page.locator('[data-choice-tray]')
    const choices = tray.locator('[data-choice]')
    await expect(choices).toHaveCount(10)
    await expect(tray).toBeInViewport()

    const layout = await choices.evaluateAll((buttons) => buttons.map((button) => {
      const rect = button.getBoundingClientRect()
      return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, height: rect.height }
    }))
    expect(layout.every((rect) => rect.height >= 44)).toBe(true)
    expect(layout.every((rect) => rect.left >= 0 && rect.right <= viewport.width && rect.bottom <= viewport.height)).toBe(true)

    const first = choices.first()
    const firstId = await first.getAttribute('data-choice')
    const trayBox = await tray.boundingBox()
    await first.press('Enter')
    await expect(choices).toHaveCount(10)
    await expect(first).toHaveAttribute('data-choice-selected', 'true')
    await expect(page.locator('[data-gap] button').first()).toBeFocused()
    expect(await tray.boundingBox()).toEqual(trayBox)

    await page.keyboard.press('Escape')
    await expect(first).not.toHaveAttribute('data-choice-selected', 'true')
    await expect(page.locator(`[data-choice="${firstId}"]`)).toBeFocused()
    await page.getByRole('button', { name: 'Back to menu' }).click()
  }
})

test('menu recomposes into a reachable phone stack and a true desktop program grid', async ({ page, browserFaults }) => {
  void browserFaults
  const viewports = [
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1280, height: 720 },
    { width: 1440, height: 900 },
  ]

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await openMenu(page)

    const cards = page.locator('.menu-card')
    await expect(cards).toHaveCount(4)
    await expect(page.locator('[data-menu-recommended]')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

    const practiceTargets = page.locator(
      '[data-solo-practice], [data-chrono-practice], [data-connections-practice], [data-difficulty]',
    )
    const targetHeights = await practiceTargets.evaluateAll((targets) =>
      targets.map((target) => target.getBoundingClientRect().height),
    )
    expect(targetHeights.every((height) => height >= 44)).toBe(true)

    if (viewport.width < 768) {
      const lefts = await cards.evaluateAll((items) => items.map((item) => Math.round(item.getBoundingClientRect().left)))
      expect(new Set(lefts).size).toBe(1)
      await cards.last().scrollIntoViewIfNeeded()
      await expect(cards.last()).toBeInViewport()
    } else {
      const layout = await cards.evaluateAll((items) =>
        items.map((item) => {
          const rect = item.getBoundingClientRect()
          return { left: Math.round(rect.left), top: Math.round(rect.top), bottom: rect.bottom }
        }),
      )
      expect(new Set(layout.map((rect) => rect.left)).size).toBe(2)
      expect(new Set(layout.map((rect) => rect.top)).size).toBe(2)
      expect(layout.every((rect) => rect.bottom <= viewport.height)).toBe(true)
    }
  }
})

test('Daily Puzzle keeps its rack contract while desktop separates pile and hand', async ({ page, browserFaults }) => {
  void browserFaults
  const viewports = [
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1280, height: 720 },
    { width: 1440, height: 900 },
  ]

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await openMenu(page)
    await page.locator('[data-mode="solo"]').click()
    await expect(page.locator('[data-mode-stage="solo"]')).toBeVisible()

    const rack = page.locator('[data-hand-layout="rack"]')
    const cards = rack.locator('[data-card]')
    await expect(cards).toHaveCount(7)
    await expect.poll(async () => new Set(await cards.evaluateAll((items) =>
      items.map((item) => Math.round(item.getBoundingClientRect().left)),
    )).size).toBeGreaterThanOrEqual(4)

    const cardRects = await cards.evaluateAll((items) => items.map((item) => {
      const rect = item.getBoundingClientRect()
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }
    }))
    expect(cardRects.every((rect) => rect.left >= 0 && rect.right <= viewport.width)).toBe(true)
    expect(cardRects.every((rect) => rect.top >= 0 && rect.bottom <= viewport.height)).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

    const scoreLabelSizes = await page.locator('.solo-score-label').evaluateAll((labels) =>
      labels.map((label) => Number.parseFloat(getComputedStyle(label).fontSize)),
    )
    expect(scoreLabelSizes.every((size) => size >= 12)).toBe(true)
    await expect(page.getByText('First flip +1 · re-flips free · raise a card to play')).toBeVisible()

    if (viewport.width >= 1024) {
      await expect(page.getByText('Now playing', { exact: true })).toBeVisible()
      await expect(page.getByText('Your hand · 7 tickets', { exact: true })).toBeVisible()
      const pile = await page.locator('[data-card="pile-top"]').boundingBox()
      const hand = await rack.boundingBox()
      expect(pile).not.toBeNull()
      expect(hand).not.toBeNull()
      expect(pile!.x + pile!.width / 2).toBeLessThan(hand!.x + hand!.width / 2 - 180)
    }

    await page.getByRole('button', { name: 'Back to menu' }).click()
  }
})

test('Daily Puzzle explains an invalid practice play and keeps both terminal paths reachable', async ({ page, browserFaults }) => {
  void browserFaults
  await page.setViewportSize({ width: 375, height: 667 })
  await openMenu(page)
  await page.locator('[data-solo-practice]').click()
  await expect(page.locator('[data-mode-stage="solo"]')).toBeVisible()

  await page.locator('[data-hand-layout="rack"] [data-card="interstellar"]').press('Enter')
  await page.locator('[data-card^="raised-"]').click()
  await expect(page.locator('[aria-label^="Flips "]')).toHaveAttribute('aria-label', /^Flips 1, score 1,/)
  const raised = await page.locator('[data-card^="raised-"]').boundingBox()
  const pile = await page.locator('[data-card="pile-top"]').boundingBox()
  expect(raised).not.toBeNull()
  expect(pile).not.toBeNull()
  await page.mouse.move(raised!.x + raised!.width / 2, raised!.y + raised!.height / 2)
  await page.mouse.down()
  await page.mouse.move(pile!.x + pile!.width / 2, pile!.y + pile!.height / 2, { steps: 12 })
  await page.mouse.up()
  await expect(page.locator('[data-solo-invalid]')).toHaveText('No shared credit · +2')
  await expect(page.locator('[aria-label^="Flips "]')).toHaveAttribute('aria-label', /^Flips 3, score 3,/)

  await page.getByTestId('matchcut-e2e-stuck').evaluate((button: HTMLButtonElement) => button.click())
  const result = page.getByRole('dialog', { name: 'Stuck — results' })
  await expect(result).toBeVisible()
  await expect(result.getByRole('button', { name: 'Reveal one solution' })).toBeVisible()
  await result.getByRole('button', { name: 'Reveal one solution' }).click()
  await expect(result.getByText('Goodfellas (1990) — starter')).toBeVisible()
  await result.getByRole('button', { name: 'Menu', exact: true }).click()
  await expect(page.locator('[data-mode="solo"]')).toBeVisible()
})

test('Duel exposes a compact tools dock, a real desktop table, and a stable result region', async ({ page, browserFaults }) => {
  void browserFaults
  const viewports = [
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1280, height: 720 },
    { width: 1440, height: 900 },
  ]

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await openMenu(page)
    await page.locator('[data-mode="duel"]').click()
    await expect(page.locator('[data-mode-stage="duel"]')).toBeVisible()

    await expect(page.getByText('Your tools', { exact: true })).toBeVisible()
    await expect(page.getByText('Hand aids', { exact: true })).toBeVisible()
    const toolHeights = await page.locator('.duel-controls-panel button').evaluateAll((buttons) =>
      buttons.map((button) => button.getBoundingClientRect().height),
    )
    expect(toolHeights.every((height) => height >= 44)).toBe(true)

    const handCards = page.locator('[data-hand-layout="fan"] [data-card]')
    await expect(handCards).toHaveCount(7)
    const cardRects = await handCards.evaluateAll((cards) => cards.map((card) => {
      const rect = card.getBoundingClientRect()
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }
    }))
    expect(cardRects.every((rect) => rect.left >= 0 && rect.right <= viewport.width)).toBe(true)
    expect(cardRects.every((rect) => rect.top >= 0 && rect.bottom <= viewport.height)).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

    if (viewport.width >= 1024) {
      const booth = await page.locator('.duel-cpu-booth').boundingBox()
      const stage = await page.locator('.duel-play-stage').boundingBox()
      const tools = await page.locator('.duel-controls-panel').boundingBox()
      expect(booth).not.toBeNull()
      expect(stage).not.toBeNull()
      expect(tools).not.toBeNull()
      expect(booth!.x + booth!.width).toBeLessThan(stage!.x)
      expect(stage!.x + stage!.width).toBeLessThan(tools!.x)
      expect(new Set(cardRects.map((rect) => Math.round(rect.left))).size).toBe(7)
    }

    await finishThroughTestSeam(page)
    const result = page.getByRole('dialog', { name: 'Game over — results' })
    await expect(result).toBeVisible()
    const dealAgain = result.getByRole('button', { name: 'Deal again' })
    await dealAgain.scrollIntoViewIfNeeded()
    await expect(dealAgain).toBeInViewport()
    const menu = result.getByRole('button', { name: 'Menu', exact: true })
    await menu.scrollIntoViewIfNeeded()
    await expect(menu).toBeInViewport()
    await menu.click()
  }

  await page.setViewportSize({ width: 375, height: 667 })
  await openMenu(page)
  await page.locator('[data-mode="duel"]').click()
  await page.locator('[data-rules-open]').click()
  const help = page.getByRole('dialog', { name: 'How to play Duel vs Computer' })
  await expect(help).toContainText('Matinee')
  await expect(help).toContainText('Feature')
  await expect(help).toContainText(/Director.s Cut/)
})
