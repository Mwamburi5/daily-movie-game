import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { SECURITY_HEADERS } from '../security-headers.ts'

const failures = []
const fail = (message) => failures.push(message)

function filesBelow(root) {
  const files = []
  for (const entry of readdirSync(root)) {
    const path = join(root, entry)
    if (statSync(path).isDirectory()) files.push(...filesBelow(path))
    else files.push(path)
  }
  return files
}

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'))
const catchAll = vercel.headers?.find((entry) => entry.source === '/(.*)')
if (!catchAll) {
  fail('vercel.json has no /(.*) security-header rule')
} else {
  const configured = Object.fromEntries(catchAll.headers.map(({ key, value }) => [key, value]))
  for (const [key, expected] of Object.entries(SECURITY_HEADERS)) {
    if (configured[key] !== expected) fail(`vercel.json ${key} does not match the tested preview policy`)
  }
}

const csp = SECURITY_HEADERS['Content-Security-Policy']
const scriptSource = csp.split('; ').find((directive) => directive.startsWith('script-src ')) ?? ''
if (scriptSource.includes("'unsafe-inline'") || scriptSource.includes("'unsafe-eval'")) {
  fail('script-src must not allow unsafe-inline or unsafe-eval')
}
if (!csp.includes("frame-ancestors 'none'")) fail('CSP must block framing')
if (!csp.includes("object-src 'none'")) fail('CSP must block plugins')
if (!csp.includes("base-uri 'none'")) fail('CSP must block base-tag rewriting')

const indexHtml = readFileSync('index.html', 'utf8')
const inlineScripts = [...indexHtml.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
  .filter((match) => match[1].trim())
if (inlineScripts.length) fail('index.html contains executable inline script')

const workflowFiles = filesBelow('.github/workflows').filter((path) => /\.ya?ml$/.test(path))
for (const path of workflowFiles) {
  const workflow = readFileSync(path, 'utf8')
  for (const match of workflow.matchAll(/^\s*uses:\s*([^@\s]+)@([^\s#]+)/gm)) {
    const [, action, reference] = match
    if (action.startsWith('./')) continue
    if (!/^[0-9a-f]{40}$/.test(reference)) fail(`${path} uses mutable action reference ${action}@${reference}`)
  }
}

const repositoryFiles = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  { encoding: 'utf8' },
).split('\0').filter(Boolean)
const forbiddenTrackedEnv = repositoryFiles.filter((path) => basename(path).startsWith('.env') && !/\.example$/i.test(path))
for (const path of forbiddenTrackedEnv) fail(`tracked environment file is forbidden: ${path}`)

const secretPatterns = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY(?: BLOCK)?-----/],
  ['AWS access key', /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['npm token', /\bnpm_[A-Za-z0-9]{36}\b/],
  ['OpenAI key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/],
  ['Slack token', /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/],
]

for (const path of repositoryFiles) {
  let content
  try {
    content = readFileSync(path)
  } catch {
    continue
  }
  if (content.includes(0)) continue
  const text = content.toString('utf8')
  for (const [label, pattern] of secretPatterns) {
    if (pattern.test(text)) fail(`${path} matches ${label} signature`)
  }
}

let distFiles = []
try {
  distFiles = filesBelow('dist')
} catch {
  fail('dist is missing; run npm run build before npm run check:security')
}

for (const path of distFiles) {
  if (extname(path) === '.map') fail(`public sourcemap found: ${path}`)
  const extension = extname(path)
  if (!['.html', '.js', '.css', '.json'].includes(extension)) continue
  const text = readFileSync(path, 'utf8')
  if (/sourceMappingURL\s*=/.test(text)) fail(`sourcemap reference found: ${path}`)
  for (const marker of ['matchcut-e2e-complete', 'matchcut-e2e-stuck', '__matchcutProgress', 'VITE_E2E']) {
    if (text.includes(marker)) fail(`test-only marker ${marker} leaked into ${path}`)
  }
  for (const secretName of ['TMDB_API_READ_TOKEN', 'TMDB_API_KEY']) {
    if (text.includes(secretName)) fail(`secret environment name ${secretName} leaked into ${path}`)
  }
}

const analyticsBundled = distFiles
  .filter((path) => extname(path) === '.js')
  .some((path) => readFileSync(path, 'utf8').includes('/_vercel/insights/script.js'))
if (!analyticsBundled) fail('Vercel Analytics loader is missing from the application bundle')

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`)
  process.exit(1)
}

console.log(`security checks: PASS (${repositoryFiles.length} repository files, ${distFiles.length} production files)`)
