import { readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
import { SECURITY_HEADERS } from '../security-headers.ts'

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [name, ...value] = argument.replace(/^--/, '').split('=')
    return [name, value.join('=')]
  }),
)

const previewUrl = args.get('url') ?? process.env.PREVIEW_URL
const cookieJarPath = args.get('cookie-jar') ?? process.env.VERCEL_BYPASS_COOKIE_JAR

if (!previewUrl) {
  throw new Error('Provide --url=https://… or PREVIEW_URL.')
}

const previewOrigin = new URL(previewUrl).origin

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

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
        domain,
        path: cookiePath,
        name,
        value,
        secure: secure === 'TRUE',
        httpOnly,
        ...(Number(expires) > 0 ? { expires: Number(expires) } : {}),
      }]
    })
}

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  // Vercel injects its Toolbar script into HTML served to authenticated Preview
  // sessions; this documented header opts the verifier out so the gate measures
  // the deployment's own shell under the restrictive CSP, not the platform overlay.
  extraHTTPHeaders: { 'x-vercel-skip-toolbar': '1' },
  // Vercel intentionally suppresses analytics in synthetic browsers. Remove
  // the automation marker only for this attended analytics integration check.
  userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browser.version()} Safari/537.36`,
})
const cookies = readNetscapeCookies(cookieJarPath)
if (cookies.length > 0) await context.addCookies(cookies)

const page = await context.newPage()
const faults = []
const responseStatuses = new Map()

await page.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { configurable: true, get: () => false })
  window.__matchcutCspViolations = []
  window.addEventListener('securitypolicyviolation', (event) => {
    window.__matchcutCspViolations.push(
      `${event.effectiveDirective}: ${event.blockedURI || 'inline'}`,
    )
  })
})

page.on('console', (message) => {
  if (message.type() === 'error' || message.type() === 'warning') {
    faults.push(`console ${message.type()}: ${message.text()}`)
  }
})
page.on('pageerror', (error) => faults.push(`pageerror: ${error.message}`))
page.on('requestfailed', (request) => {
  if (new URL(request.url()).origin === previewOrigin) {
    faults.push(`request failed: ${request.method()} ${request.url()} (${request.failure()?.errorText ?? 'unknown'})`)
  }
})
page.on('response', (response) => {
  const url = new URL(response.url())
  if (url.origin !== previewOrigin) return
  responseStatuses.set(url.pathname, response.status())
  if (response.status() >= 400) faults.push(`response ${response.status()}: ${response.url()}`)
})

try {
  const documentResponse = await page.goto(previewUrl, { waitUntil: 'networkidle' })
  assert(documentResponse, 'Preview navigation did not return a document response.')
  assert(new URL(page.url()).origin === previewOrigin, 'Preview redirected away from the protected deployment.')

  const headers = await documentResponse.allHeaders()
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    assert(headers[key.toLowerCase()] === value, `Preview header mismatch: ${key}`)
  }

  assert(await page.locator('script:not([src])').count() === 0, 'Executable inline script found in the Preview shell.')
  assert(await page.locator('script[src*="vercel.live"]').count() === 0, 'Vercel Toolbar script is present under the restrictive CSP.')
  assert(responseStatuses.get('/_vercel/insights/script.js') === 200, 'Bundled analytics loader did not fetch the Vercel Insights script.')

  await page.waitForFunction(() => typeof window.va === 'function')
  const analyticsEvent = page.waitForResponse(
    (response) => response.url().includes('/_vercel/insights/event')
      && response.request().method() === 'POST',
    { timeout: 10_000 },
  )
  await page.evaluate(() => {
    window.va('event', {
      name: 'goal4_security_preview',
      data: { mode: 'security', kind: 'preview-browser' },
    })
  })
  const analyticsResponse = await analyticsEvent
  assert(analyticsResponse.status() === 200, `Analytics event returned HTTP ${analyticsResponse.status()}.`)

  const cspViolations = await page.evaluate(() => window.__matchcutCspViolations)
  assert(cspViolations.length === 0, `CSP violations: ${cspViolations.join('; ')}`)
  assert(faults.length === 0, `Browser faults: ${faults.join('; ')}`)

  const moduleScript = await page.locator('script[type="module"][src]').getAttribute('src')
  assert(moduleScript, 'Hashed application module was not found.')
  const moduleResponse = await context.request.get(new URL(moduleScript, previewOrigin).href)
  assert(moduleResponse.status() === 200, `Hashed application module returned HTTP ${moduleResponse.status()}.`)
  const moduleText = await moduleResponse.text()
  for (const marker of [
    'matchcut-e2e-complete',
    'matchcut-e2e-stuck',
    '__matchcutProgress',
    'VITE_E2E',
    'TMDB_API_READ_TOKEN',
    'TMDB_API_KEY',
  ]) {
    assert(!moduleText.includes(marker), `Production module contains forbidden marker: ${marker}`)
  }
  assert(!/sourceMappingURL\s*=/.test(moduleText), 'Production module contains a source-map reference.')
  const sourceMapResponse = await context.request.get(new URL(`${moduleScript}.map`, previewOrigin).href)
  assert(sourceMapResponse.status() === 404, `Production source map is public (HTTP ${sourceMapResponse.status()}).`)

  console.log(`Preview security verified: ${previewOrigin}`)
  console.log(`- ${Object.keys(SECURITY_HEADERS).length}/${Object.keys(SECURITY_HEADERS).length} required headers match`)
  console.log('- CSP violations: 0; console warnings/errors: 0')
  console.log('- analytics loader: 200; browser event: 200')
  console.log('- production test seams, secret names, and source map: absent')
} finally {
  await browser.close()
}
