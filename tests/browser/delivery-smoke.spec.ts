import { expect, test as base, type Locator, type Page } from '@playwright/test'
import chronologyPool from '../../src/data/chronology-pool.json' with { type: 'json' }
import connectionsData from '../../src/data/connections-grids.json' with { type: 'json' }
import { movieById } from '../../src/data/movies.ts'
import type { Movie } from '../../src/data/types.ts'
import { localDateSeed } from '../../src/lib/daily.ts'
import { TIER_POINTS, isValidMeld, legalPlays } from '../../src/lib/duel.ts'
import { linkTier, sharedPeople } from '../../src/lib/solver.ts'

const productionOrigin = 'http://127.0.0.1:4273'
const developmentOrigin = 'http://127.0.0.1:5273'
const chronologyById = new Map(chronologyPool.map((card) => [card.id, card]))

function connectionsGridForSeed(seed: string) {
  const utc = (value: string) => {
    const [year, month, day] = value.split('-').map(Number)
    return Date.UTC(year, month - 1, day)
  }
  const offset = Math.round((utc(seed) - utc(connectionsData.anchor)) / 86_400_000)
  const index = ((offset % connectionsData.grids.length) + connectionsData.grids.length) % connectionsData.grids.length
  return connectionsData.grids[index]
}

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

test('privacy-safe journey analytics dedupes boundaries and never loads a localhost collector', async ({ page, browserFaults }) => {
  void browserFaults
  const readEvents = () => page.evaluate(() => {
    const analytics = window as unknown as {
      vaq?: Array<['event', { name: string; data: Record<string, string | number | boolean> }]>
    }
    return (analytics.vaq ?? []).map(([, event]) => event)
  })

  const collectorRequests: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/_vercel/insights/')) collectorRequests.push(request.url())
  })

  await openMenu(page)
  await page.evaluate(() => {
    ;(window as unknown as { vaq?: unknown[] }).vaq = []
  })
  await page.locator('[data-mode="solo"]').click()
  await expect(page.locator('[data-mode-stage="solo"]')).toBeVisible()

  await expect.poll(async () => (await readEvents()).filter((event) => event.name === 'mode_start')).toEqual([
    { name: 'mode_start', data: { mode: 'solo', kind: 'daily', session_mode_ordinal: '1' } },
  ])

  const pile = page.locator('[data-card="pile-top"]')
  await pile.click()
  await pile.click()
  await expect.poll(async () => (await readEvents()).filter((event) => event.name === 'first_action')).toEqual([
    { name: 'first_action', data: { mode: 'solo', kind: 'daily', action: 'flip' } },
  ])

  const help = page.locator('[data-rules-open]')
  await help.click()
  await expect(page.getByRole('dialog', { name: 'How to play Daily Puzzle' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(help).toBeFocused()
  await pile.click()
  await pile.click()
  const afterHelp = await readEvents()
  expect(afterHelp.filter((event) => event.name === 'help_open')).toEqual([
    { name: 'help_open', data: { mode: 'solo', state: 'playing' } },
  ])
  expect(afterHelp.filter((event) => event.name === 'help_return')).toEqual([
    { name: 'help_return', data: { mode: 'solo', resolved: true } },
  ])

  await finishThroughTestSeam(page)
  await expect(page.getByRole('dialog', { name: 'Solved — results' })).toBeVisible()
  const finishEvents = (await readEvents()).filter((event) => event.name === 'mode_finish')
  expect(finishEvents).toHaveLength(1)
  expect(finishEvents[0]).toMatchObject({
    name: 'mode_finish',
    data: { mode: 'solo', kind: 'daily', result: 'won' },
  })
  const share = page.locator('[data-share-copy]')
  await share.click()
  await expect(share).toHaveText('copied ✓')

  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('blocked for fallback test')) },
    })
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: () => false,
    })
  })
  await share.click()
  await expect(share).toHaveText('select below to copy')

  const shareEvents = await readEvents()
  expect(shareEvents.filter((event) => event.name === 'share_attempt')).toEqual([
    { name: 'share_attempt', data: { mode: 'solo', result: 'copied' } },
    { name: 'share_attempt', data: { mode: 'solo', result: 'manual_fallback' } },
  ])
  expect(shareEvents.filter((event) => event.name === 'share')).toHaveLength(1)

  await page.getByRole('button', { name: "Replay today's hand" }).click()
  await expect(page.locator('[data-mode-stage="solo"]')).toBeVisible()
  const replayEvents = await readEvents()
  expect(replayEvents.filter((event) => event.name === 'replay')).toEqual([
    { name: 'replay', data: { mode: 'solo', kind: 'daily' } },
  ])
  expect(replayEvents.filter((event) => event.name === 'mode_start')).toEqual([
    { name: 'mode_start', data: { mode: 'solo', kind: 'daily', session_mode_ordinal: '1' } },
    { name: 'mode_start', data: { mode: 'solo', kind: 'daily', session_mode_ordinal: '1' } },
  ])

  await page.getByRole('button', { name: 'Back to menu' }).click()
  await page.locator('[data-mode="chronology"]').click()
  await expect.poll(async () => (await readEvents()).filter((event) => event.name === 'mode_start').at(-1)).toEqual(
    { name: 'mode_start', data: { mode: 'chronology', kind: 'daily', session_mode_ordinal: '2' } },
  )

  const queueBeforeBlock = (await readEvents()).length
  await page.evaluate(() => {
    ;(window as unknown as { va?: () => void }).va = () => { throw new Error('collector blocked') }
  })
  await page.getByRole('button', { name: /— raise$/ }).first().press('Enter')
  await page.locator('[data-gap] button').first().press('Enter')
  await expect(page.locator('[data-line-card]')).toHaveCount(2)
  expect((await readEvents()).length).toBe(queueBeforeBlock)

  expect(collectorRequests).toEqual([])
  expect(await page.locator('script[src="/_vercel/insights/script.js"]').count()).toBe(0)
})

test('analytics friction events follow real resulting transitions and bounded buckets', async ({ page, browserFaults }) => {
  void browserFaults
  const events = () => page.evaluate(() => {
    const analytics = window as unknown as {
      vaq?: Array<['event', { name: string; data: Record<string, string | number | boolean> }]>
    }
    return (analytics.vaq ?? []).map(([, event]) => event)
  })
  const clear = () => page.evaluate(() => {
    ;(window as unknown as { vaq?: unknown[] }).vaq = []
  })

  await openMenu(page)
  await page.locator('[data-mode="solo"]').click()
  await clear()
  const soloTopId = await page.locator('[data-card="pile-top"]').getAttribute('data-movie-id')
  const soloHandIds = await page.locator('[data-hand-layout] [data-card]').evaluateAll((cards) =>
    cards.map((card) => card.getAttribute('data-card')!).filter((id) => !id.startsWith('raised-')),
  )
  const invalidSoloId = soloHandIds.find((id) =>
    sharedPeople(movieById.get(soloTopId!)!, movieById.get(id)!).length === 0,
  )
  expect(invalidSoloId).toBeTruthy()
  await page.locator(`[data-card="${invalidSoloId}"]`).press('Enter')
  await page.locator('[data-card="pile-top"]').press('Enter')
  await expect.poll(async () => (await events()).filter((event) => event.name === 'friction')).toEqual([
    { name: 'friction', data: { mode: 'solo', kind: 'invalid_play', count_bucket: '1' } },
  ])

  await page.getByRole('button', { name: 'Back to menu' }).click()
  await page.locator('[data-mode="chronology"]').click()
  await clear()
  const choice = page.locator('[data-choice]').first()
  const choiceId = await choice.getAttribute('data-choice')
  const card = chronologyById.get(choiceId!)!
  const lineId = await page.locator('[data-line-card]').first().getAttribute('data-line-card')
  const lineCard = chronologyById.get(lineId!)!
  const correctGap = lineCard.releaseDate > card.releaseDate ||
    (lineCard.releaseDate === card.releaseDate && lineCard.id > card.id) ? 0 : 1
  await choice.press('Enter')
  await page.locator('[data-gap] button').nth(correctGap === 0 ? 1 : 0).press('Enter')
  await expect(page.locator('[data-line-card]')).toHaveCount(2)
  await expect.poll(async () => (await events()).filter((event) => event.name === 'friction')).toEqual([
    { name: 'friction', data: { mode: 'chronology', kind: 'misfire', count_bucket: '1' } },
  ])

  await page.getByRole('button', { name: 'Back to menu' }).click()
  await page.locator('[data-mode="connections"]').click()
  await clear()
  const grid = connectionsGridForSeed(localDateSeed())
  const oneAway = [...grid.groups[0].films.slice(0, 3), grid.groups[1].films[0]]
  for (const id of oneAway) await page.locator(`[data-tile="${id}"]`).click()
  const submit = page.locator('[data-action="submit"]')
  await submit.click()
  await submit.click()
  await page.locator('[data-action="deselect"]').click()
  for (const group of grid.groups) await page.locator(`[data-tile="${group.films[0]}"]`).click()
  await submit.click()
  await expect.poll(async () => (await events()).filter((event) => event.name === 'friction')).toEqual([
    { name: 'friction', data: { mode: 'connections', kind: 'one_away', count_bucket: '1' } },
    { name: 'friction', data: { mode: 'connections', kind: 'repeat_guess', count_bucket: '2' } },
    { name: 'friction', data: { mode: 'connections', kind: 'miss', count_bucket: '3' } },
  ])

  await page.getByRole('button', { name: 'Back to menu' }).click()
  await page.locator('[data-mode="duel"]').click()
  await applyDuelFixture(page, 'no-play-draw')
  await clear()
  await page.getByRole('button', { name: 'Draw a card' }).click()
  await expect.poll(async () => (await events()).filter((event) => event.name === 'friction')).toEqual([
    { name: 'friction', data: { mode: 'duel', kind: 'no_play_draw', count_bucket: '1' } },
  ])
})

test('malformed progress repairs only corrupt nested displays and never blocks the menu', async ({ page, browserFaults }) => {
  void browserFaults
  const today = localDateSeed()
  await page.addInitScript((seed) => {
    if (sessionStorage.getItem('progress-fixture-installed')) return
    sessionStorage.setItem('progress-fixture-installed', '1')
    localStorage.setItem('matchcut:v1', JSON.stringify({
      v: 1,
      solo: { lastSeed: seed, streak: 5, best: -3 },
      chronology: 'broken nested record',
      connections: { lastSeed: seed, streak: -9, best: 99 },
      duel: {
        matinee: { plays: 3, wins: 8 },
        feature: { plays: -4, wins: 'many' },
        directors: null,
      },
      seenOnboarding: true,
      lastDifficulty: 'unknown',
    }))
  }, today)
  await page.goto('/')
  await expect(page.locator('[data-mode="solo"]')).toBeVisible()
  await expect(page.locator('[data-streak-chip="solo"]')).toHaveText('✓ streak 5')
  await expect(page.locator('[data-streak-chip="chronology"]')).toHaveCount(0)
  await expect(page.locator('[data-streak-chip="connections"]')).toHaveText('✓ streak 1')
  await expect(page.locator('[data-record-chip="duel"]')).toHaveText('3/3 won')
  await expect(page.locator('[data-difficulty="matinee"]')).toHaveAttribute('aria-pressed', 'true')
  if (process.env.CAPTURE_LAUNCH_EVIDENCE === '1') {
    await page.screenshot({ path: 'output/playwright/launch-readiness/progress-sanitized-menu-390x844.png' })
  }

  await page.evaluate(() => localStorage.setItem('matchcut:v1', '{malformed json'))
  await page.reload()
  const onboarding = page.getByRole('dialog', { name: 'Welcome to Match Cut' })
  await expect(onboarding).toBeVisible()
  await onboarding.locator('[data-intro-dismiss]').click()
  await expect(page.locator('[data-mode="solo"]')).toBeVisible()
  await expect(page.locator('[data-streak-chip]')).toHaveCount(0)
})

test('Duel ordinary plays stay person-gated while series upgrades legal links and supports Melds', () => {
  const movie = (id: string, topCast: string[]): Movie => ({
    id,
    title: id,
    year: 2000,
    director: [],
    writers: [],
    topCast,
    posterColor: '#000000',
    genre: id,
    series: 'synthetic-series',
  })
  const first = movie('series-one', [])
  const second = movie('series-two', [])
  const third = movie('series-three', [])

  expect(legalPlays(first, [second])).toEqual([])
  expect(isValidMeld([first, second, third])).toBe(true)

  const linkedFirst = movie('linked-one', ['Shared Actor'])
  const linkedSecond = movie('linked-two', ['Shared Actor'])
  const shared = sharedPeople(linkedFirst, linkedSecond)
  expect(legalPlays(linkedFirst, [linkedSecond])).toEqual([linkedSecond])
  expect(linkTier(linkedFirst, linkedSecond, shared)).toBe('super')
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

async function applyDuelFixture(page: Page, name: 'ordinary-draw' | 'no-play-draw' | 'one-wild-draw' | 'wild-draw' | 'take-ready') {
  const seam = page.getByTestId(`matchcut-e2e-${name}`)
  await expect(seam).toBeAttached()
  await seam.evaluate((button: HTMLButtonElement) => button.click())
}

async function placeChronologyChoiceClean(page: Page) {
  // Pin the ticket by id, not by `.first()`: that locator re-resolves at press
  // time, and the tray reorders while the previous ticket's exit settles, so a
  // position-based press can raise a different card than the one the gap index
  // below was computed for (measured misfire flake under load, 2026-08-31).
  let choiceId: string | null = null
  await expect
    .poll(async () => {
      const ids = await page.locator('[data-choice]').evaluateAll((items) =>
        items.map((item) => item.getAttribute('data-choice')!),
      )
      choiceId = ids[0] ?? null
      return ids.length > 0 && new Set(ids).size === ids.length
    })
    .toBe(true)
  const choice = page.locator(`[data-choice="${choiceId}"]`)
  const card = chronologyById.get(choiceId!)!
  // Read the line only once the previous placement's layoutId crossfade has
  // fully unmounted: its transient flight node duplicates a line id, which
  // would shift the computed gap index into a misfire (measured flaking under
  // load 2026-08-31 — the fixed 180ms tail wait alone can lose that race).
  let lineIds: string[] = []
  await expect
    .poll(async () => {
      lineIds = await page.locator('[data-line-card]').evaluateAll((items) =>
        items.map((item) => item.getAttribute('data-line-card')!),
      )
      return new Set(lineIds).size === lineIds.length
    })
    .toBe(true)
  const slot = lineIds
    .map((id) => chronologyById.get(id)!)
    .findIndex((lineCard) =>
      lineCard.releaseDate > card.releaseDate ||
      (lineCard.releaseDate === card.releaseDate && lineCard.id > card.id),
    )
  const gapIndex = slot === -1 ? lineIds.length : slot
  await choice.press('Enter')
  // nth() re-resolves at press time: wait until only THIS raise's gap buttons
  // exist (a prior placement's exiting gaps linger under load and shift nth)
  const gapButtons = page.locator('[data-gap] button')
  await expect(gapButtons).toHaveCount(lineIds.length + 1)
  await gapButtons.nth(gapIndex).press('Enter')
  await expect(page.locator('[data-line-card]')).toHaveCount(lineIds.length + 1)
  // Let the reduced-motion layoutId crossfade unmount before reading the next
  // DOM order; transient duplicate flight nodes are visual only, not line state.
  await page.waitForTimeout(180)
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

// Deliberately no `browserFaults`: this case *causes* a first-party request
// failure, which is exactly the fault that fixture exists to catch. What is
// under test is the recovery — a tab whose mode chunk 404s after a deploy must
// never land on the blank root React 18 leaves behind when a lazy import
// rejects with no boundary above it.
test('a dead mode chunk recovers instead of blanking the page', async ({ page }) => {
  let refusals = 0
  await page.route('**/assets/SoloGame-*.js', async (route) => {
    // Only the first ask dies, so the reload has a live chunk to land on and
    // the case stays deterministic instead of racing an offline spin guard.
    if (refusals === 0) {
      refusals += 1
      await route.abort()
      return
    }
    await route.continue()
  })

  await openMenu(page)
  await page.locator('[data-mode="solo"]').click()

  // Two sanctioned shapes: main.tsx's vite:preloadError one-shot reloaded us
  // back onto a working menu, or ErrorBoundary caught the rejected import and
  // painted its card. A root with nothing in it is the failure.
  await expect
    .poll(
      async () => {
        try {
          return await page.evaluate(() => {
            const root = document.getElementById('root')
            if (!root || root.childElementCount === 0) return 'blank'
            if (root.querySelector('[data-error-boundary]')) return 'boundary'
            if (root.querySelector('[data-mode="solo"]')) return 'menu'
            if (root.querySelector('[data-mode-stage="solo"]')) return 'mode'
            return 'other'
          })
        } catch {
          // The reload tears the execution context down mid-evaluate.
          return 'navigating'
        }
      },
      { timeout: 15_000 },
    )
    .toMatch(/^(boundary|menu|mode)$/)
  expect(refusals).toBe(1)

  // And the app is genuinely usable afterwards, not just non-blank.
  await openMenu(page)
  await page.locator('[data-mode="solo"]').click()
  await expect(page.locator('[data-mode-stage="solo"]')).toBeVisible()
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

test('Daily Puzzle cutover seed deals from the approved 216-film pool', async ({ page, browserFaults }) => {
  void browserFaults
  await page.goto('/?dailySeed=2026-09-27')
  const intro = page.locator('[data-intro-dismiss]')
  if (await intro.count()) await intro.click()
  await page.locator('[data-mode="solo"]').click()
  await expect(page.locator('[data-mode-stage="solo"]')).toBeVisible()
  await expect(page.locator('[data-card="pile-top"]')).toHaveAttribute(
    'data-movie-id',
    'mission-impossible-dead-reckoning-part-one',
  )
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

  await applyDuelFixture(page, 'ordinary-draw')
  await expect(page.getByTestId('matchcut-e2e-player-hand')).toHaveText('7')
  await expect(page.getByTestId('matchcut-e2e-deck')).toHaveText('216')
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
  await drawOptions.first().click()
  await expect(drawDialog).toBeHidden()
  await expect(page.getByTestId('matchcut-e2e-player-hand')).toHaveText('8')
  await expect(page.getByTestId('matchcut-e2e-deck')).toHaveText('213')

  await finishThroughTestSeam(page)
  await verifyShareAndReturn(page, /Game over — results/, 'Match Cut · Duel')
})

test('Duel keeps one deterministic wild and burns only the two revealed real cards', async ({ page, browserFaults }) => {
  void browserFaults
  await openMenu(page)
  await page.locator('[data-mode="duel"]').click()
  await expect(page.locator('[data-mode-stage="duel"]')).toBeVisible()

  await applyDuelFixture(page, 'one-wild-draw')
  await page.getByRole('button', { name: 'Draw a card' }).click()
  const drawDialog = page.getByRole('dialog', { name: 'Drew 3 — keep all 1 wild' })
  await expect(drawDialog).toBeVisible()
  await expect(drawDialog).toContainText('A wild is never burned — tap it to keep it')
  const drawOptions = drawDialog.locator('[data-draw-choice]')
  const enabledWild = drawDialog.locator('[data-draw-choice]:enabled')
  await expect(drawOptions).toHaveCount(3)
  await expect(enabledWild).toHaveCount(1)
  await enabledWild.click()
  await expect(drawDialog).toBeHidden()
  await expect(page.getByTestId('matchcut-e2e-player-hand')).toHaveText('8')
  await expect(page.getByTestId('matchcut-e2e-deck')).toHaveText('213')
})

test('Duel keeps every wild in a deterministic multi-wild draw', async ({ page, browserFaults }) => {
  void browserFaults
  await openMenu(page)
  await page.locator('[data-mode="duel"]').click()
  await expect(page.locator('[data-mode-stage="duel"]')).toBeVisible()

  await applyDuelFixture(page, 'wild-draw')
  await page.getByRole('button', { name: 'Draw a card' }).click()
  const drawDialog = page.getByRole('dialog', { name: 'Drew 3 — keep all 3 wilds' })
  await expect(drawDialog).toBeVisible()
  const drawOptions = drawDialog.locator('[data-draw-choice]')
  await expect(drawOptions).toHaveCount(3)
  for (let index = 0; index < 3; index += 1) await expect(drawOptions.nth(index)).toBeEnabled()
  await drawOptions.first().click()
  await expect(drawDialog).toBeHidden()
  await expect(page.getByTestId('matchcut-e2e-player-hand')).toHaveText('10')
  await expect(page.getByTestId('matchcut-e2e-deck')).toHaveText('213')
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
  await expect(onboarding.getByRole('heading', { level: 2 })).toHaveText(
    'Reaching 20 ends the show; highest net score wins.',
  )
  await expect(onboarding.getByRole('img')).toHaveAttribute('aria-label', /CPU 11/)
  await expect(onboarding).not.toContainText('Taz')
  await advance.click()
  await expect(onboarding.getByRole('heading', { level: 2 })).toHaveText(/Triple Feature/)
  await expect(advance).toHaveCount(0)
  await expect(dismiss).toHaveCount(1)
  await expect(dismiss).toHaveText(/Let.s play!/)

  await dismiss.click()
  await expect(onboarding).toBeHidden()
  await expect(page.locator('[data-mode="solo"]')).toBeVisible()
  await expect(page.locator('[data-mode="duel"]')).toContainText(
    'Reaching 20 ends the show; highest net score wins.',
  )
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

test('public support and honest privacy disclosure stay reachable at release widths', async ({ page, browserFaults }) => {
  void browserFaults
  const viewports = [
    { width: 320, height: 568 },
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 1024, height: 768 },
  ]

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await openMenu(page)
    const helpButton = page.locator('[data-rules-open]')
    await helpButton.click()

    const dialog = page.getByRole('dialog', { name: 'How to play all modes' })
    const support = dialog.locator('[data-player-support]')
    const supportLink = support.locator('[data-support-link]')
    const privacy = support.locator('[data-privacy-disclosure]')
    await expect(support).toBeVisible()
    await expect(support).toContainText('GitHub sign-in is required')
    await expect(support).toContainText('the report will be public')
    await expect(supportLink).toHaveAttribute('href', 'https://github.com/Mwamburi5/daily-movie-game/issues/new/choose')
    await expect(supportLink).toHaveAttribute('target', '_blank')
    await expect(supportLink).toHaveAttribute('rel', /noopener/)
    await expect(supportLink).toHaveAccessibleName('Open public GitHub support (opens in a new tab)')

    await privacy.locator('summary').focus()
    await page.keyboard.press('Enter')
    await expect(privacy).toHaveAttribute('open', '')
    await expect(privacy).toContainText('per-mode streaks')
    await expect(privacy).toContainText('anonymous page views')
    await expect(privacy).toContainText('does not add your movie or person choices')
    await expect(privacy).toContainText('discards the visitor session used for deduplication after 24 hours')
    await expect(privacy).toContainText('no user identity export, drain, or D1/D7 player tracking')
    await expect(supportLink).toBeInViewport()
    if (process.env.CAPTURE_LAUNCH_EVIDENCE === '1') {
      await support.scrollIntoViewIfNeeded()
      await page.screenshot({
        path: `output/playwright/launch-readiness/support-privacy-${viewport.width}x${viewport.height}.png`,
      })
    }

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(helpButton).toBeFocused()
  }
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

test('reduced-motion no-helper Duel state keeps the generic cue static and Enter Draw playable', async ({ page, browserFaults }) => {
  void browserFaults
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openMenu(page)
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)

  await page.locator('[data-mode="duel"]').click()
  await applyDuelFixture(page, 'ordinary-draw')
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

test('reduced-motion Take helper intentionally replaces the generic Duel cue and remains playable', async ({ page, browserFaults }) => {
  void browserFaults
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openMenu(page)
  await page.locator('[data-mode="duel"]').click()
  await applyDuelFixture(page, 'take-ready')

  await expect(page.getByText(/turn — .*card or draw/, { exact: true })).toHaveCount(0)
  const take = page.locator('[data-take="0"]')
  await expect(take).toBeVisible()
  await expect(take).toBeEnabled()
  await take.click()
  await expect(page.getByTestId('matchcut-e2e-player-hand')).toHaveText('3')
  await expect(page.locator('[data-card="pile-top-0"]')).toHaveAttribute('data-movie-id', 'heat')
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
    await expect(dialog.locator('[data-player-support]')).toHaveCount(1)
    await expect(dialog).toContainText(entry.unique)
    await expect(dialog).not.toContainText(entry.absent)
    if (entry.mode === 'solo') {
      await expect(dialog).toContainText('share an actor, director, or writer')
      await expect(dialog).not.toContainText('same series')
    }
    if (entry.mode === 'duel') {
      await expect(dialog).toContainText('Reaching 20 ends the show; highest net score wins.')
      await expect(dialog).toContainText('a series-only pair is not an ordinary legal play')
    }
    await expect(dialog.locator('[data-rules-primary]')).toBeVisible()
    await dialog.locator('[data-rules-expand]').click()
    await expect(dialog.locator('[data-rules-expanded]')).toBeVisible()
    await expect(dialog.locator('[data-rules-expand]')).toHaveAttribute('aria-expanded', 'true')

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await page.getByRole('button', { name: 'Back to menu' }).click()
  }
})

test('Chronology header keeps its title, score meaning, and controls separate at release viewports', async ({ page, browserFaults }) => {
  void browserFaults
  const viewports = [
    { width: 320, height: 568 },
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
  ]

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await openMenu(page)
    await page.locator('[data-mode="chronology"]').click()
    await expect(page.locator('[data-mode-stage="chronology"]')).toBeVisible()

    if (viewport.width === 320) {
      for (let placed = 0; placed < 7; placed += 1) await placeChronologyChoiceClean(page)
      await expect(page.locator('.app-counter-label')).toContainText('−2')
    }

    const title = page.locator('.daily-mode-title')
    const counter = page.locator('.app-counter-label')
    const back = page.getByRole('button', { name: 'Back to menu' })
    const help = page.getByRole('button', { name: 'How to play' })
    const [titleBox, counterBox, backBox, helpBox] = await Promise.all([
      title.boundingBox(),
      counter.boundingBox(),
      back.boundingBox(),
      help.boundingBox(),
    ])
    expect(titleBox).not.toBeNull()
    expect(counterBox).not.toBeNull()
    expect(backBox).not.toBeNull()
    expect(helpBox).not.toBeNull()
    expect(titleBox!.x + titleBox!.width).toBeLessThanOrEqual(counterBox!.x - 2)
    expect(backBox!.height).toBeGreaterThanOrEqual(44)
    const helpHitTarget = await help.evaluate((element) => {
      const button = element.getBoundingClientRect()
      const target = getComputedStyle(element, '::after')
      return {
        width: Math.max(button.width, Number.parseFloat(target.width)),
        height: Math.max(button.height, Number.parseFloat(target.height)),
      }
    })
    expect(helpHitTarget.width).toBeGreaterThanOrEqual(44)
    expect(helpHitTarget.height).toBeGreaterThanOrEqual(44)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

    await help.click()
    await expect(page.getByRole('dialog', { name: 'How to play Chronology' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'How to play Chronology' })).toBeHidden()
    await back.click()
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

// Pins the browser's local calendar so a test can deal a specific daily board.
// Both dailies derive their seed from localDateSeed()'s zero-argument new Date();
// explicit Date arguments pass through untouched.
async function pinLocalDate(page: Page, seed: string) {
  await page.addInitScript({
    content: `(() => {
      const RealDate = Date
      const fixed = new RealDate('${seed}T12:00:00')
      window.Date = class extends RealDate {
        constructor(...args) { if (args.length) { super(...args) } else { super(fixed.getTime()) } }
        static now() { return fixed.getTime() }
      }
    })()`,
  })
}

// The two worst boards from the Goal 4 title-fit inventory over all 365 baked
// grids (audit/daily-duel-216-launch-readiness-2026-08-27/title-fit-inventory.ts):
// 2026-09-25 packs four ≤8px-fit tiles including the corpus's longest unbreakable
// word, and 2027-05-27 carries its longest title outright (54 chars, six lines).
const longTitleBoards = [
  { seed: '2026-09-25', label: 'densest board', extremeTile: 'blackkklansman' },
  { seed: '2027-05-27', label: 'longest-title board', extremeTile: 'pirates-of-the-caribbean-the-curse-of-the-black-pearl' },
]

for (const board of longTitleBoards) {
  test(`Connections long-title ${board.label} stays fully readable at release viewports`, async ({ page, browserFaults }) => {
    void browserFaults
    await pinLocalDate(page, board.seed)
    const viewports = [
      { width: 320, height: 568 },
      { width: 360, height: 800 },
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await openMenu(page)
      await page.locator('[data-mode="connections"]').click()
      const extreme = page.locator(`[data-tile="${board.extremeTile}"]`)
      await expect(extreme).toBeVisible()
      // rect reads need the real Domine metrics: fonts.ready alone can resolve
      // before the lazily-fetched face starts loading, and the later swap
      // re-runs the tiles' layout animation mid-measurement. Force the load,
      // then let the swap-triggered springs finish.
      await page.evaluate(async () => {
        await document.fonts.load('700 10px Domine')
        await document.fonts.ready
      })
      await page.waitForTimeout(450)

      const tiles = await page.locator('[data-tile]').evaluateAll((buttons) =>
        buttons.map((button) => {
          const span = button.querySelector('.connections-tile-title')!
          const style = getComputedStyle(span)
          const rect = span.getBoundingClientRect()
          return {
            id: button.getAttribute('data-tile'),
            height: button.getBoundingClientRect().height,
            fontPx: parseFloat(style.fontSize),
            lines: Math.round(rect.height / parseFloat(style.lineHeight)),
            truncated: span.scrollHeight > span.clientHeight + 1,
          }
        }),
      )
      expect(tiles).toHaveLength(16)
      // the 6-line clamp is a safety net, never a scissor: no hidden title text
      expect(tiles.filter((tile) => tile.truncated)).toEqual([])
      expect(tiles.every((tile) => tile.lines <= 6)).toBe(true)
      // uniform square tiles: no row stretches to absorb a dense title (a real
      // stretch differs by a full line; sub-pixel grid rounding stays under 1px)
      const heights = tiles.map((tile) => tile.height)
      expect(Math.max(...heights) - Math.min(...heights)).toBeLessThan(1)
      expect(tiles.every((tile) => tile.fontPx >= 6.5 && tile.fontPx <= 14.5)).toBe(true)

      // the selection ordinal renders on its navy chip inside the tile bounds
      await extreme.click()
      await expect(extreme).toHaveAttribute('aria-pressed', 'true')
      const badgeInside = await extreme.evaluate((button) => {
        const badge = [...button.querySelectorAll('span')].find((span) => span.textContent?.startsWith('PICK'))
        if (!badge) return false
        const badgeRect = badge.getBoundingClientRect()
        const tileRect = button.getBoundingClientRect()
        return badgeRect.left >= tileRect.left && badgeRect.right <= tileRect.right &&
          badgeRect.top >= tileRect.top && badgeRect.bottom <= tileRect.bottom
      })
      expect(badgeInside).toBe(true)
      if (process.env.CAPTURE_LAUNCH_EVIDENCE === '1') {
        await page.screenshot({
          path: `output/playwright/launch-readiness/long-title-${board.seed}-${viewport.width}x${viewport.height}.png`,
        })
      }
      await extreme.click()
      await expect(extreme).toHaveAttribute('aria-pressed', 'false')
    }

    // solved-band readability: solve the extreme title's own group and keep all
    // four full titles inside the band without sideways clipping
    await page.setViewportSize({ width: 390, height: 844 })
    await openMenu(page)
    await page.locator('[data-mode="connections"]').click()
    const group = connectionsGridForSeed(board.seed).groups.find((candidate) =>
      candidate.films.includes(board.extremeTile),
    )!
    for (const film of group.films) await page.locator(`[data-tile="${film}"]`).click()
    await page.locator('[data-action="submit"]').click()
    const band = page.locator('[data-solved-group]').first()
    await expect(band).toBeVisible()
    for (const film of group.films) {
      await expect(band).toContainText(movieById.get(film)!.title)
    }
    expect(await band.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true)
  })
}

test('Chronology placement hint clears the choice tickets at desktop heights', async ({ page, browserFaults }) => {
  void browserFaults
  // 1024x768 sat in the 721-802px-tall envelope where the top-anchored hint and
  // the bottom-anchored tray used to intersect (Now-pass screenshot 07)
  const viewports = [
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1280, height: 800 },
  ]

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await openMenu(page)
    await page.locator('[data-mode="chronology"]').click()
    await expect(page.locator('[data-mode-stage="chronology"]')).toBeVisible()
    await page.waitForTimeout(300)

    const checkClearance = async () => {
      const clearance = await page.evaluate(() => {
        const hint = document.querySelector('.chrono-reel-instruction')!
        const hintRect = hint.getBoundingClientRect()
        const overlaps = [...document.querySelectorAll('.chrono-hand [data-choice]')].filter((ticket) => {
          const rect = ticket.getBoundingClientRect()
          return hintRect.bottom > rect.top && hintRect.top < rect.bottom &&
            hintRect.right > rect.left && hintRect.left < rect.right
        })
        return { visible: getComputedStyle(hint).display !== 'none', overlapIds: overlaps.map((t) => t.getAttribute('data-choice')) }
      })
      expect(clearance.visible).toBe(true)
      expect(clearance.overlapIds).toEqual([])
    }

    await checkClearance()
    // the hint's operative state: a raised card waiting for a gap
    await page.locator('[data-choice]').first().press('Enter')
    await expect(page.locator('[data-gap] button').first()).toBeVisible()
    await checkClearance()
    if (process.env.CAPTURE_LAUNCH_EVIDENCE === '1' && viewport.width === 1024) {
      await page.screenshot({
        path: `output/playwright/launch-readiness/chronology-hint-${viewport.width}x${viewport.height}.png`,
      })
    }
  }
})
