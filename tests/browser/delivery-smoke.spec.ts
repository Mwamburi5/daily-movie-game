import { expect, test as base, type Locator, type Page } from '@playwright/test'
import { movieById } from '../../src/data/movies.ts'
import { TIER_POINTS } from '../../src/lib/duel.ts'
import { linkTier, sharedPeople } from '../../src/lib/solver.ts'

const productionOrigin = 'http://127.0.0.1:4273'
const developmentOrigin = 'http://127.0.0.1:5273'

const test = base.extend<{ browserFaults: string[] }>({
  browserFaults: async ({ page }, use) => {
    const faults: string[] = []
    await page.addInitScript(() => {
      const state = window as unknown as { __matchcutCspViolations?: string[] }
      state.__matchcutCspViolations = []
      window.addEventListener('securitypolicyviolation', (event) => {
        state.__matchcutCspViolations?.push(
          `${event.effectiveDirective}: ${event.blockedURI || 'inline'}`,
        )
      })
    })
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
    const cspViolations = await page.evaluate(() => (
      window as unknown as { __matchcutCspViolations?: string[] }
    ).__matchcutCspViolations ?? [])
    expect(cspViolations, 'no Content Security Policy violations').toEqual([])
    expect(faults, 'no uncaught browser errors or failed first-party requests').toEqual([])
  },
})

test('social discovery metadata is complete while indexing stays closed', async ({ page, request, browserFaults }) => {
  void browserFaults
  await page.goto('/')

  await expect(page).toHaveTitle('Match Cut — Four movie games, one daily ritual')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Connect movies/)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://matchcutdaily.com/')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website')
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://matchcutdaily.com/')
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://matchcutdaily.com/social-preview.png')
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200')
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630')
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')

  const preview = await request.get('/social-preview.png')
  expect(preview.status()).toBe(200)
  expect(preview.headers()['content-type']).toBe('image/png')
  const previewPng = await preview.body()
  expect(previewPng.length).toBeGreaterThan(25_000)
  expect(previewPng.readUInt32BE(16)).toBe(1200)
  expect(previewPng.readUInt32BE(20)).toBe(630)
})

test('production preview enforces headers and keeps analytics in the bundle', async ({ page, browserFaults }) => {
  void browserFaults
  const response = await page.goto('/')
  expect(response).not.toBeNull()
  const headers = response!.headers()
  expect(headers['content-security-policy']).toContain("script-src 'self'")
  expect(headers['content-security-policy']).toContain("script-src-attr 'none'")
  expect(headers['content-security-policy']).not.toContain("script-src 'self' 'unsafe-inline'")
  expect(headers['content-security-policy']).not.toContain("'unsafe-eval'")
  expect(headers['x-content-type-options']).toBe('nosniff')
  expect(headers['x-frame-options']).toBe('DENY')
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
  expect(headers['permissions-policy']).toContain('camera=()')
  await expect(page.locator('script:not([src])')).toHaveCount(0)

  const queued = await page.evaluate(() => {
    const analytics = window as unknown as {
      va?: (event: 'event', props: { name: string; data: { mode: string } }) => void
      vaq?: unknown[]
    }
    analytics.va?.('event', { name: 'mode_start', data: { mode: 'security-check' } })
    return analytics.vaq?.length ?? 0
  })
  expect(queued).toBe(1)
})

async function openMenu(page: Page) {
  await page.goto('/')
  const intro = page.locator('[data-intro-dismiss]')
  if (await intro.count()) {
    await expect(intro).toBeVisible()
    await intro.click()
    await expect(intro).toBeHidden()
  }
  await expect(page.locator('[data-mode="solo"]')).toBeVisible()
}

async function tabTo(page: Page, target: Locator, limit = 80) {
  for (let step = 0; step < limit; step += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return
    await page.keyboard.press('Tab')
  }
  throw new Error(`keyboard focus did not reach ${await target.evaluate((element) => element.outerHTML.slice(0, 160))}`)
}

async function expectTwoToneFocus(target: Locator) {
  await expect(target).toBeFocused()
  const focus = await target.evaluate((element) => {
    const parse = (value: string) => {
      const hex = value.trim().match(/^#([0-9a-f]{6})$/i)
      if (hex) {
        const raw = hex[1]
        return [0, 2, 4].map((offset) => Number.parseInt(raw.slice(offset, offset + 2), 16)).concat(1)
      }
      const channels = value.match(/[\d.]+/g)?.map(Number) ?? []
      return [channels[0] ?? 0, channels[1] ?? 0, channels[2] ?? 0, channels[3] ?? 1]
    }
    const composite = (foreground: number[], background: number[]) => {
      const alpha = foreground[3]
      return foreground.slice(0, 3).map((channel, index) => channel * alpha + background[index] * (1 - alpha))
    }
    const luminance = (color: number[]) => {
      const channels = color.slice(0, 3).map((channel) => {
        const value = channel / 255
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
    }
    const contrast = (foreground: number[], background: number[]) => {
      const first = luminance(foreground)
      const second = luminance(background)
      return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
    }
    let surface: Element | null = element
    let background = [255, 255, 255, 1]
    while (surface) {
      const candidate = parse(getComputedStyle(surface).backgroundColor)
      if (candidate[3] >= 0.95) {
        background = candidate
        break
      }
      surface = surface.parentElement
    }
    const style = getComputedStyle(element)
    const outline = composite(parse(style.outlineColor), background)
    const halo = composite(parse(style.getPropertyValue('--color-stub-navy')), background)
    return {
      outlineColor: style.outlineColor,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      boxShadow: style.boxShadow,
      outlineContrast: contrast(outline, background),
      haloContrast: contrast(halo, background),
    }
  })
  expect(focus.outlineStyle).toBe('solid')
  expect(Number.parseFloat(focus.outlineWidth)).toBeGreaterThanOrEqual(2)
  if (focus.outlineContrast < 3) {
    expect(focus.boxShadow).toContain('rgb(31, 58, 82)')
    expect(focus.boxShadow).toContain('6px')
    expect(focus.haloContrast).toBeGreaterThanOrEqual(3)
  } else {
    expect(focus.outlineContrast).toBeGreaterThanOrEqual(3)
  }
}

async function expectNamedInteractiveControls(page: Page) {
  const unnamed = await page.locator('button, a[href], input, select, textarea, [role="button"], [role="dialog"]').evaluateAll((elements) => (
    elements.flatMap((element) => {
      const style = getComputedStyle(element)
      if (style.display === 'none' || style.visibility === 'hidden' || element.getClientRects().length === 0) return []
      if (element.getAttribute('aria-hidden') === 'true') return []
      const labelledBy = element.getAttribute('aria-labelledby')
        ?.split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
        .join(' ')
        .trim()
      const name = element.getAttribute('aria-label')
        ?? labelledBy
        ?? element.getAttribute('title')
        ?? element.textContent?.trim()
        ?? ''
      if (name) return []
      return [`${element.tagName.toLowerCase()}${element.getAttribute('role') ? `[role="${element.getAttribute('role')}"]` : ''}`]
    })
  ))
  expect(unnamed, 'all visible interactive controls and dialogs have an accessible name').toEqual([])
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

type SuccessfulPlayInput = 'click' | 'Enter' | 'Space' | 'drag'

async function dragRaisedCardTo(page: Page, target: ReturnType<Page['locator']>) {
  const raised = await page.locator('[data-card^="raised-"]').boundingBox()
  const targetBox = await target.boundingBox()
  expect(raised).not.toBeNull()
  expect(targetBox).not.toBeNull()
  await page.mouse.move(raised!.x + raised!.width / 2, raised!.y + raised!.height / 2)
  await page.mouse.down()
  await page.mouse.move(
    targetBox!.x + targetBox!.width / 2,
    targetBox!.y + targetBox!.height / 2,
    { steps: 12 },
  )
  await page.mouse.up()
}

async function successfulSoloPlay(page: Page, input: SuccessfulPlayInput) {
  await openMenu(page)
  await page.locator('[data-solo-practice]').click()
  const card = page.locator('[data-hand-layout="rack"] [data-card="casino"]')
  const pile = page.locator('[data-card="pile-top"]')

  if (input === 'Enter' || input === 'Space') await card.press(input)
  else await card.click()
  await expect(page.locator('[data-card="raised-casino"]')).toBeVisible()

  if (input === 'drag') await dragRaisedCardTo(page, pile)
  else if (input === 'Enter' || input === 'Space') await pile.press(input)
  else await pile.click()

  await expect(pile).toHaveAttribute('data-movie-id', 'casino')
  await expect(page.locator('[data-card^="raised-"]')).toHaveCount(0)
  await expect(page.locator('[data-hand-layout="rack"] [data-card]')).toHaveCount(6)
  await expect(page.locator('[aria-label^="Flips "]')).toHaveAttribute(
    'aria-label',
    /^Flips 0, score 0, par 9$/,
  )
}

async function successfulDuelPlay(page: Page, input: SuccessfulPlayInput) {
  await openMenu(page)
  await page.locator('[data-mode="duel"]').click()
  await page.locator('[data-token="finalCut"]').click()

  const card = page.locator('[data-hand-layout="fan"] [data-card]').last()
  const cardId = await card.getAttribute('data-card')
  expect(cardId).not.toBeNull()
  const pile = page.locator('[data-card="pile-top-0"]')
  const pileId = await pile.getAttribute('data-movie-id')
  expect(pileId).not.toBeNull()
  const shared = sharedPeople(movieById.get(pileId!)!, movieById.get(cardId!)!)
  const expectedPoints = shared.length === 0
    ? 1
    : TIER_POINTS[linkTier(movieById.get(pileId!)!, movieById.get(cardId!)!, shared)]

  if (input === 'Enter' || input === 'Space') await card.press(input)
  else await card.click()
  await expect(page.locator(`[data-card="raised-${cardId}"]`)).toBeVisible()

  if (input === 'drag') await dragRaisedCardTo(page, pile)
  else if (input === 'Enter' || input === 'Space') await pile.press(input)
  else await pile.click()

  await expect.poll(async () => {
    const score = await page.locator('[data-score]').first().getAttribute('data-score')
    return Number(score?.split('-')[0])
  }).toBe(expectedPoints)
  await expect(page.locator('[data-card^="raised-"]')).toHaveCount(0)
  await expect(page.locator('[data-hand-layout="fan"] [data-card]')).toHaveCount(6)
  const finalCut = page.locator('[data-token="finalCut"]')
  // A scored link can open the Run decision and contextually disable every
  // tool while preserving the token. Assert spent/retained state, not whether
  // the current turn substate happens to make the button clickable.
  if (shared.length === 0) await expect(finalCut).toHaveClass(/line-through/)
  else await expect(finalCut).not.toHaveClass(/line-through/)
}

for (const input of ['click', 'Enter', 'Space', 'drag'] as const) {
  test(`Daily Puzzle and Duel complete exactly one successful ${input} play`, async ({ page, browserFaults }) => {
    void browserFaults
    await successfulSoloPlay(page, input)
    await successfulDuelPlay(page, input)
  })
}

test('target-only click, Enter, and Space each toggle credits exactly once', async ({ page, browserFaults }) => {
  void browserFaults
  await openMenu(page)
  await page.locator('[data-solo-practice]').click()
  const soloPile = page.locator('[data-card="pile-top"]')
  await soloPile.click()
  await expect(soloPile).toHaveAttribute('aria-pressed', 'true')
  await soloPile.press('Enter')
  await expect(soloPile).toHaveAttribute('aria-pressed', 'false')
  await soloPile.press('Space')
  await expect(soloPile).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[aria-label^="Flips "]')).toHaveAttribute('aria-label', /^Flips 1, score 1,/)

  await openMenu(page)
  await page.locator('[data-mode="duel"]').click()
  const duelPile = page.locator('[data-card="pile-top-0"]')
  await duelPile.click()
  await expect(duelPile).toHaveAttribute('aria-pressed', 'true')
  await duelPile.press('Enter')
  await expect(duelPile).toHaveAttribute('aria-pressed', 'false')
  await duelPile.press('Space')
  await expect(duelPile).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-score]').first()).toHaveAttribute('data-score', '0-0')
})

test.describe('touch input parity', () => {
  test.use({ hasTouch: true })

  test('Daily Puzzle and Duel complete exactly one successful touch play', async ({ page, browserFaults }) => {
    void browserFaults
    await openMenu(page)
    await page.locator('[data-solo-practice]').tap()
    await page.locator('[data-hand-layout="rack"] [data-card="casino"]').tap()
    await page.locator('[data-card="pile-top"]').tap()
    await expect(page.locator('[data-card="pile-top"]')).toHaveAttribute('data-movie-id', 'casino')
    await expect(page.locator('[data-hand-layout="rack"] [data-card]')).toHaveCount(6)
    await expect(page.locator('[aria-label^="Flips "]')).toHaveAttribute('aria-label', /^Flips 0, score 0, par 9$/)

    await openMenu(page)
    await page.locator('[data-mode="duel"]').tap()
    await page.locator('[data-token="finalCut"]').tap()
    const card = page.locator('[data-hand-layout="fan"] [data-card]').last()
    const cardId = await card.getAttribute('data-card')
    const pile = page.locator('[data-card="pile-top-0"]')
    const pileId = await pile.getAttribute('data-movie-id')
    expect(cardId).not.toBeNull()
    expect(pileId).not.toBeNull()
    const shared = sharedPeople(movieById.get(pileId!)!, movieById.get(cardId!)!)
    const expectedPoints = shared.length === 0
      ? 1
      : TIER_POINTS[linkTier(movieById.get(pileId!)!, movieById.get(cardId!)!, shared)]
    await card.tap()
    await pile.tap()
    await expect.poll(async () => {
      const score = await page.locator('[data-score]').first().getAttribute('data-score')
      return Number(score?.split('-')[0])
    }).toBe(expectedPoints)
    await expect(page.locator('[data-card^="raised-"]')).toHaveCount(0)
    await expect(page.locator('[data-hand-layout="fan"] [data-card]')).toHaveCount(6)
  })
})

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
  const drawDialog = page.getByRole('dialog', { name: 'Drew three — keep one' })
  await expect(drawDialog).toBeVisible()
  const drawOptions = drawDialog.locator('[data-draw-choice]')
  await expect(drawOptions).toHaveCount(3)
  const drawOptionNames = await drawOptions.evaluateAll((options) => options.map((option) => option.getAttribute('aria-label')))
  expect(new Set(drawOptionNames).size).toBe(3)
  for (let index = 0; index < drawOptionNames.length; index += 1) {
    expect(drawOptionNames[index]).toMatch(new RegExp(`^Option ${index + 1} of 3:`))
  }

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

test('first-run onboarding runs once, then replays only from the overview help', async ({ page, browserFaults }) => {
  void browserFaults
  await page.goto('/')

  const onboarding = page.getByRole('dialog', { name: 'Welcome to Match Cut' })
  const dismiss = onboarding.locator('[data-intro-dismiss]')
  const advance = onboarding.getByRole('button', { name: 'Next' })
  await expect(onboarding).toBeVisible()
  await expect(onboarding).toBeFocused()
  await expect(onboarding.locator('[data-onboarding-dot]')).toHaveCount(4)
  // Exactly one dismiss control per screen keeps the shared openMenu helper
  // (and Playwright strict mode) honest.
  await expect(dismiss).toHaveCount(1)
  await expect(dismiss).toHaveText('Skip')
  await expect(onboarding.getByRole('heading', { level: 2 })).toHaveText(
    'Movies connect through the people who make them.',
  )

  // Landscape squeeze: the column must shrink and scroll internally rather than
  // push the CTA somewhere nothing can scroll to.
  await page.setViewportSize({ width: 667, height: 375 })
  await expect(advance).toBeInViewport()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.setViewportSize({ width: 390, height: 844 })

  await advance.click()
  await expect(onboarding.getByRole('heading', { level: 2 })).toHaveText('Three fresh puzzles every day.')
  await advance.click()
  await expect(onboarding.getByRole('heading', { level: 2 })).toHaveText(/Race to 20/)
  await advance.click()
  await expect(onboarding.getByRole('heading', { level: 2 })).toHaveText(/Triple Feature/)
  await expect(advance).toHaveCount(0)
  await expect(dismiss).toHaveCount(1)
  await expect(dismiss).toHaveText(/Let.s play!/)

  await dismiss.click()
  await expect(onboarding).toBeHidden()
  await expect(page.locator('[data-mode="solo"]')).toBeVisible()
  await expect(page.locator('[data-rules-open]')).toBeFocused()

  await page.reload()
  await expect(page.locator('[data-mode="solo"]')).toBeVisible()
  await expect(page.locator('[data-onboarding]')).toHaveCount(0)

  await page.locator('[data-rules-open]').click()
  const rules = page.getByRole('dialog', { name: 'How to play all modes' })
  await expect(rules).toBeVisible()
  await rules.getByRole('button', { name: 'Watch the intro again' }).click()
  await expect(rules).toBeHidden()
  await expect(onboarding).toBeVisible()
  await expect(onboarding).toBeFocused()
  await dismiss.click()
  await expect(onboarding).toBeHidden()
  await expect(page.locator('[data-mode="solo"]')).toBeVisible()
  await expect(page.locator('[data-rules-open]')).toBeFocused()
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
  const replay = dialog.locator('[data-replay-intro]')
  const attribution = dialog.locator('[data-tmdb-attribution]')
  await expect(replay).toHaveCount(1)
  await expect(attribution).toHaveCount(1)
  expect(await replay.evaluate((node) => {
    const section = document.querySelector('[data-tmdb-attribution]')
    return section !== null && Boolean(node.compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING)
  })).toBe(true)
  await expect(dialog).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.locator('[data-rules-primary]')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(dialog.locator('[data-rules-close]')).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(page.locator('[data-rules-open]')).toBeFocused()
})

test('keyboard-only entry exposes a two-tone focus indicator and named controls in every mode', async ({ page, browserFaults }) => {
  void browserFaults
  await openMenu(page)
  await expectNamedInteractiveControls(page)

  for (const mode of ['solo', 'chronology', 'connections', 'duel'] as const) {
    const menuEntry = page.locator(`[data-mode="${mode}"]`)
    await tabTo(page, menuEntry)
    await expectTwoToneFocus(menuEntry)
    await page.keyboard.press('Enter')

    await expect(page.locator(`[data-mode-stage="${mode}"]`)).toBeVisible()
    await expectNamedInteractiveControls(page)

    const back = page.getByRole('button', { name: 'Back to menu' })
    await tabTo(page, back)
    await expectTwoToneFocus(back)

    await page.keyboard.press('Tab')
    const help = page.getByRole('button', { name: 'How to play' })
    await expectTwoToneFocus(help)
    await page.keyboard.press('Enter')

    const dialog = page.getByRole('dialog', { name: new RegExp(`How to play`, 'i') })
    await expect(dialog).toBeVisible()
    await expect(dialog).toBeFocused()
    await expectNamedInteractiveControls(page)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expectTwoToneFocus(help)

    await page.keyboard.press('Shift+Tab')
    await expectTwoToneFocus(back)
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-mode="solo"]')).toBeVisible()
  }
})

test('reduced-motion preference keeps the Duel cue static while gameplay remains available', async ({ page, browserFaults }) => {
  void browserFaults
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openMenu(page)
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)

  await page.locator('[data-mode="duel"]').click()
  const cue = page.getByText(/turn — .*card or draw/, { exact: true })
  await expect(cue).toBeVisible()
  const opacitySamples = await cue.evaluate(async (element) => {
    const first = getComputedStyle(element).opacity
    await new Promise((resolve) => setTimeout(resolve, 250))
    return [first, getComputedStyle(element).opacity]
  })
  expect(opacitySamples).toEqual(['1', '1'])

  const draw = page.getByRole('button', { name: 'Draw a card' })
  const transition = await draw.evaluate((element) => {
    const style = getComputedStyle(element)
    return { property: style.transitionProperty, duration: style.transitionDuration }
  })
  expect(transition.property).not.toContain('transform')
  await draw.press('Enter')
  await expect(page.getByRole('dialog', { name: 'Drew three — keep one' })).toBeVisible()
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

    await expect.poll(async () => cards.evaluateAll((items) => items.every((item) => {
      const rect = item.getBoundingClientRect()
      return rect.left >= 0 && rect.right <= window.innerWidth && rect.top >= 0 && rect.bottom <= window.innerHeight
    }))).toBe(true)
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
    await expect(page.getByText('First move · choose a hand ticket')).toBeVisible()

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
