// Read-only against production: open the rules/help sheet from the menu and assert the
// TMDB attribution section is visible (scrolling the sheet if it sits below the fold).
import { chromium } from '@playwright/test'
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage()
const faults = []; p.on('pageerror', e => faults.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error') faults.push('console ' + m.text()) })
await p.goto('https://matchcutdaily.com/', { waitUntil: 'networkidle' })
const names = await p.getByRole('button').evaluateAll(els => els.map(e => (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)))
console.log('menu buttons:', JSON.stringify(names))
// A fresh context shows the first-run onboarding dialog, which intercepts pointer events.
const skip = p.locator('[data-onboarding] [data-intro-dismiss]').first()
if (await skip.count()) { await skip.click(); await p.locator('[data-onboarding]').waitFor({ state: 'detached', timeout: 8000 }); console.log('onboarding dismissed via Skip') }
const trigger = p.getByRole('button', { name: 'How to play' }).first()
await trigger.click({ timeout: 8000 })
const sec = p.locator('[data-tmdb-attribution]').first()
await sec.waitFor({ state: 'attached', timeout: 10000 })
await sec.scrollIntoViewIfNeeded()
const visible = await sec.isVisible()
const txt = (await sec.textContent())?.trim().replace(/\s+/g, ' ')
const logo = await sec.locator('img[alt="TMDB"]').count()
const link = await sec.locator('a[href*="themoviedb.org"]').first().getAttribute('href').catch(() => null)
console.log('TMDB attribution visible:', visible, '| logo imgs:', logo, '| link:', link, '| faults:', faults.length)
console.log('text:', JSON.stringify(txt?.slice(0, 200)))
await p.screenshot({ path: process.argv[2] })
await b.close()
if (!visible) process.exit(2)
