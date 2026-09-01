import { gzipSync } from 'node:zlib'
import { readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'

const DIST = 'dist'
const MANIFEST_PATH = join(DIST, '.vite', 'manifest.json')
const KIB = 1024
const BUDGETS = {
  menuGzip: 100 * KIB,
  firstModeGzip: 250 * KIB,
  coldSessionTransfer: 2 * 1024 * KIB,
}
const MODE_SOURCES = {
  solo: 'src/SoloGame.tsx',
  chronology: 'src/ChronologyGame.tsx',
  connections: 'src/ConnectionsGame.tsx',
  duel: 'src/DuelGame.tsx',
}

let manifest
try {
  manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
} catch (error) {
  console.error(`bundle budget: cannot read ${MANIFEST_PATH}; run npm run build first`)
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}

const entryKey = Object.keys(manifest).find((key) => manifest[key].isEntry)
if (!entryKey) throw new Error('bundle budget: Vite manifest has no entry')

function staticClosure(rootKey) {
  const seen = new Set()
  const visit = (key) => {
    if (seen.has(key)) return
    const chunk = manifest[key]
    if (!chunk) throw new Error(`bundle budget: manifest is missing imported chunk ${key}`)
    seen.add(key)
    for (const imported of chunk.imports ?? []) visit(imported)
  }
  visit(rootKey)
  return seen
}

function filesFor(keys) {
  const files = new Set()
  for (const key of keys) {
    const chunk = manifest[key]
    if (chunk.file.endsWith('.js')) files.add(chunk.file)
    for (const css of chunk.css ?? []) files.add(css)
    for (const asset of chunk.assets ?? []) files.add(asset)
  }
  return files
}

function fileSize(file) {
  const path = join(DIST, file)
  const raw = statSync(path).size
  const extension = extname(file)
  const gzip = extension === '.js' || extension === '.css' || extension === '.html' || extension === '.svg'
    ? gzipSync(readFileSync(path)).length
    : raw
  return { file, raw, gzip }
}

function summarize(keys) {
  const jsFiles = [...keys]
    .map((key) => manifest[key].file)
    .filter((file) => file.endsWith('.js'))
    .map(fileSize)
  return {
    files: jsFiles,
    raw: jsFiles.reduce((sum, file) => sum + file.raw, 0),
    gzip: jsFiles.reduce((sum, file) => sum + file.gzip, 0),
  }
}

function findSourceKey(source) {
  const key = Object.keys(manifest).find((candidate) => candidate === source || manifest[candidate].src === source)
  if (!key) throw new Error(`bundle budget: missing lazy entry ${source}`)
  return key
}

const menuKeys = staticClosure(entryKey)
const menu = summarize(menuKeys)
const modes = {}

for (const [mode, source] of Object.entries(MODE_SOURCES)) {
  const modeKeys = staticClosure(findSourceKey(source))
  const incrementalKeys = new Set([...modeKeys].filter((key) => !menuKeys.has(key)))
  const incremental = summarize(incrementalKeys)
  const coldKeys = new Set([...menuKeys, ...modeKeys])
  const cold = summarize(coldKeys)
  const transferFiles = new Set([
    'index.html',
    'favicon.svg',
    'fonts/domine-700-latin.woff2',
    'fonts/inter-400-800-latin.woff2',
    'fonts/jetbrains-mono-600-700-latin.woff2',
    ...filesFor(coldKeys),
  ])
  const coldSession = [...transferFiles].map(fileSize)
  modes[mode] = {
    source,
    incremental,
    cold,
    coldSession: {
      files: coldSession,
      transfer: coldSession.reduce((sum, file) => sum + file.gzip, 0),
    },
  }
}

const failures = []
const seamMarker = 'matchcut-e2e-complete'
const productionJavaScript = new Set(
  Object.values(manifest)
    .map((chunk) => chunk.file)
    .filter((file) => file.endsWith('.js')),
)
if ([...productionJavaScript].some((file) => readFileSync(join(DIST, file), 'utf8').includes(seamMarker))) {
  failures.push('test-only completion seam leaked into the normal production build')
}
if (menu.gzip > BUDGETS.menuGzip) {
  failures.push(`menu shell ${menu.gzip} B gzip exceeds ${BUDGETS.menuGzip} B`)
}
for (const [mode, result] of Object.entries(modes)) {
  if (result.cold.gzip > BUDGETS.firstModeGzip) {
    failures.push(`${mode} cold JS ${result.cold.gzip} B gzip exceeds ${BUDGETS.firstModeGzip} B`)
  }
  if (result.coldSession.transfer > BUDGETS.coldSessionTransfer) {
    failures.push(`${mode} cold session ${result.coldSession.transfer} B exceeds ${BUDGETS.coldSessionTransfer} B`)
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  definitions: {
    menu: 'entry JavaScript plus its static-import closure; dynamic mode entries excluded',
    incrementalMode: 'lazy mode JavaScript plus static imports not already present in the menu shell',
    coldMode: 'deduplicated menu plus lazy-mode JavaScript closure',
    coldSession: 'conservative manifest-declared graph: gzip HTML/JS/CSS/SVG plus raw already-compressed fonts and images',
  },
  budgets: BUDGETS,
  menu,
  modes,
  pass: failures.length === 0,
  failures,
}

writeFileSync(join(DIST, 'bundle-report.json'), `${JSON.stringify(report, null, 2)}\n`)

const kib = (bytes) => `${(bytes / KIB).toFixed(2)} KiB`
console.log(`menu shell        ${kib(menu.gzip)} gzip JS`)
for (const [mode, result] of Object.entries(modes)) {
  console.log(
    `${mode.padEnd(17)} ${kib(result.incremental.gzip)} incremental · ${kib(result.cold.gzip)} cold JS · ${kib(result.coldSession.transfer)} cold session`,
  )
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`)
  process.exit(1)
}
console.log('bundle budgets: PASS')
