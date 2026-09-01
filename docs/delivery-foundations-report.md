# Delivery foundations report

Measured 2026-08-08 for the P1 delivery-foundations milestone. The before build
is commit `d47e7f1` (`Polish Connections sorting marquee`); the after build is
the current uncommitted review worktree. No rules, scores, deals, movie data,
difficulty, analytics, or persistence behavior changed.

## Measurement method

Both builds use the repository's locked dependency graph and Vite 6.4.3. The
baseline was rebuilt from a clean `git archive d47e7f1`; the after build uses
`npm run build`. Vite's `.vite/manifest.json` is enabled for every production
build and is the authoritative chunk graph.

- **Raw JS** is the exact byte length of each emitted `.js` file.
- **Gzip JS/CSS/HTML** is Node `zlib.gzipSync()` over the emitted bytes. Tables
  show binary KiB (`bytes / 1024`); the exact byte counts are included.
- **Menu shell** is the entry JavaScript plus its static-import closure. Dynamic
  mode entries are deliberately excluded.
- **Incremental mode** is the selected lazy entry plus its static-import closure,
  minus files already in the menu shell. A `Set` deduplicates shared chunks.
- **Cold first mode** is the deduplicated union of menu-shell and incremental-mode
  JavaScript. This is the number enforced against the 250 KiB budget.
- **Cold played session** is a conservative transfer model: gzip bytes for
  HTML/JS/CSS/SVG, including the menu favicon, plus raw bytes for already-
  compressed fonts and images declared by the union's manifest graph. It can
  over-count a CSS background that does not match the current mode; it never
  hides bytes to manufacture a pass.
- `npm run check:bundle` performs the calculation from `dist`, writes the full
  file-level evidence to `dist/bundle-report.json`, and exits non-zero on a
  budget breach.

## Before and after

| Surface | Before raw JS | Before gzip JS | After raw JS | After gzip JS | Budget |
|---|---:|---:|---:|---:|---:|
| Menu shell | 707.01 KiB (723,978 B) | 176.85 KiB (181,094 B) | 293.47 KiB (300,516 B) | 95.41 KiB (97,700 B) | ≤100 KiB gzip |
| Solo incremental | same monolith | same monolith | 101.62 KiB (104,057 B) | 31.38 KiB (32,128 B) | — |
| Solo cold first mode | 707.01 KiB (723,978 B) | 176.85 KiB (181,094 B) | 395.09 KiB (404,573 B) | 126.79 KiB (129,828 B) | ≤250 KiB gzip |
| Chronology incremental | same monolith | same monolith | 79.25 KiB (81,155 B) | 20.56 KiB (21,057 B) | — |
| Chronology cold first mode | 707.01 KiB (723,978 B) | 176.85 KiB (181,094 B) | 372.73 KiB (381,671 B) | 115.97 KiB (118,757 B) | ≤250 KiB gzip |
| Connections incremental | same monolith | same monolith | 260.24 KiB (266,490 B) | 41.06 KiB (42,045 B) | — |
| Connections cold first mode | 707.01 KiB (723,978 B) | 176.85 KiB (181,094 B) | 553.72 KiB (567,006 B) | 136.47 KiB (139,745 B) | ≤250 KiB gzip |
| Duel incremental | same monolith | same monolith | 139.71 KiB (143,063 B) | 42.13 KiB (43,139 B) | — |
| Duel cold first mode | 707.01 KiB (723,978 B) | 176.85 KiB (181,094 B) | 433.18 KiB (443,579 B) | 137.54 KiB (140,839 B) | ≤250 KiB gzip |

The menu shell drops by 83,394 gzip bytes (46.1%). Every first-mode load is at
least 112.46 KiB below its 250 KiB compressed-JavaScript ceiling.

| Cold played-session model | Before | After | 2 MiB target |
|---|---:|---:|---:|
| Solo | 364.67 KiB | 314.94 KiB (322,494 B) | pass |
| Chronology | 310.04 KiB | 266.25 KiB (272,637 B) | pass |
| Connections | 284.76 KiB | 261.47 KiB (267,743 B) | pass |
| Duel | 284.76 KiB | 262.54 KiB (268,837 B) | pass |

CSS changed from 54.70 KiB raw / 10.39 KiB gzip (56,017 / 10,639 B) to
55.95 KiB raw / 10.73 KiB gzip (57,292 / 10,984 B). Existing image assets are
unchanged: Solo rack 17,152 B, Solo spotlight 64,668 B, and Chronology filmstrip
25,882 B. Fonts are unchanged at 98,100 B total. Vite continues to emit hashed,
immutable filenames and the manifest records their relationships.

## Generated chunk structure

Hashes below are from the verified after build and change when source changes.

| Chunk | Raw | Gzip | Consumers |
|---|---:|---:|---|
| `index-CIA6eY1r.js` | 300,516 B | 97,700 B | menu shell, React, Framer, rules dialog, shared meta-state |
| `movies-C4rzFOQl.js` | 69,972 B | 19,247 B | Solo, Connections, Duel |
| `Hand-DE2xDbGB.js` | 18,054 B | 6,491 B | Solo, Duel |
| `ShareCopy-Ds1zWbfy.js` | 2,164 B | 1,150 B | all modes |
| `DailyModeHeader-GDuEQ7vx.js` | 1,339 B | 653 B | Solo, Chronology, Connections |
| `FixedDigits-CKJ_RQjq.js` | 353 B | 268 B | Chronology, Duel |
| `SoloGame-zjqYVsZb.js` | 12,528 B | 4,587 B | Solo only |
| `ChronologyGame-UKeidyEU.js` | 77,299 B | 18,986 B | Chronology only, including its pool |
| `ConnectionsGame-74uMj35b.js` | 193,015 B | 20,995 B | Connections only, including baked grids |
| `DuelGame-Cfnxw-1L.js` | 52,520 B | 15,983 B | Duel only |

Before splitting, `App.tsx` statically imported every game, while `main.tsx`
statically imported `DUEL_POOL`, `PUZZLE`, `CHRONOLOGY_POOL`, solver/daily helpers,
and chronology assertions. Consequently Solo, Duel, Chronology, Connections,
`movies`, the Duel pool, the Solo puzzle, the chronology pool, and baked
Connections grids all lived in the menu's single entry file.

After splitting, `App.tsx` uses `React.lazy`/`Suspense` without adding a router.
The four type imports erase at compile time. Development assertions moved behind
a development-only dynamic import, and the production manifest contains no
`devAssertions` chunk. The loading ticket replaces the menu only after selection;
it cannot overlay or mutate an already-running deal.

## Browser and network evidence

The built app was served with `npm run preview -- --host 127.0.0.1` and inspected
in Chromium.

- A cold menu requested exactly HTML, the three existing fonts, entry JS, entry
  CSS, and `favicon.svg`, all HTTP 200. It requested no `*Game` chunk, movie/data
  chunk, or mode image.
- Selecting Daily Puzzle then requested `SoloGame`, `movies`, `Hand`,
  `ShareCopy`, `DailyModeHeader`, Solo spotlight, and Solo rack. It did not
  request Chronology, Connections, or Duel.
- Console after menu and multiple mode loads: 0 errors, 0 warnings.
- Visual/interaction checks passed at 390×844 (menu and Connections), 375×667
  (Solo after a real flip), and 1280×720 (Connections). Controls and playable
  content remained reachable with no visible clipping.
- Chromium reported `prefers-reduced-motion: reduce` as true; Connections
  remained interactive and used the 150 ms crossfade contract.
- The development build at `?mode=chronology` landed directly in the daily
  Chronology board with no warnings, preserving the capture/verification hook.

The durable Playwright suite repeats the critical evidence with a production
E2E build and a development server. Its seven journeys cover lazy loading, all
four daily modes from first meaningful action through result/share/menu return,
Connections practice, direct `?mode=chronology`, clipboard output, console/page
errors, failed first-party requests, and HTTP error responses. It runs at
390×844 with reduced motion. The completion buttons exist only when
`VITE_E2E=1`; `npm run check:bundle` scans every normal production JavaScript
chunk for their unique marker and fails if one leaks. The normal build passed
that assertion.

The local production preview is `http://127.0.0.1:4173/`. Production was not
deployed or modified.

## CI, tokens, and remaining risks

At the original foundation snapshot, `.github/workflows/ci.yml` used Node 22 and
the locked dependency graph on pull requests and pushes to `main`/`codex/**`.
Its first job ran the production build,
bundle enforcement, and all four existing verification suites. A dependent
browser job installs the Playwright-locked Chromium build and runs the seven
smoke journeys. `@playwright/test` is development-only; production dependencies
remain React 18, Framer Motion, and React DOM.

Shared CSS tokens now cover the proven 4/8/12/16/20/24/32 px spacing scale,
typography roles, 16/20/24 px icon sizes, 2 px SVG stroke, 44 px interaction
halo, timing, easing, and the 150 ms reduced-motion crossfade. Runtime Framer
durations and spring presets live in `src/lib/motion.ts` and are used by the menu,
Solo, Chronology, and Connections without changing their approved composition.
The full SVG icon-replacement pass remains P2 work.

Remaining operational risks are explicit:

- The menu passes by 4,700 gzip bytes (4.59 KiB), so its 100 KiB budget is useful
  and relatively tight rather than ceremonial.
- The original snapshot did not pin a Node version in repository metadata. The
  production-polish repair below supersedes that risk with a Node 24.x engine
  declaration; remote CI/deploy proof remains approval-gated.
- The browser CI job must download Chromium and Linux system packages. The lock
  file pins Playwright, while availability of that external download remains a
  CI-service dependency.
- Final Phase 4 `npm audit` and `npm audit --omit=dev` both report zero
  vulnerabilities. A lockfile-only repair moved the existing Vite build chain
  from PostCSS 8.5.15 to 8.5.26 and Nanoid 3.3.12 to 3.3.18; direct and
  production dependencies are unchanged.

## Verification results

- `npm run build` — pass; 437 modules transformed, distinct mode chunks emitted.
- `npm run check:bundle` — pass; all menu, first-mode, and session budgets green.
- `npm run verify` — 64 passed, 0 failed.
- `npm run verify:solo` — 8 passed, 0 failed.
- `npm run verify:chronology` — 42 passed, 0 failed.
- `npm run verify:connections` — 14 passed, 0 failed.
- `npm run test:smoke` — 7 passed, 0 failed (17.7 s).
- Production-preview browser/network checks — pass for all evidence above.
- `git diff --check` — pass.

## Production-polish repair addendum — 2026-08-08

The first Wave 3 GitHub run on `a710fff` did not report a failed assertion. It
was cancelled at the workflow ceiling after the serial job had already passed
checkout, setup, install, build, bundle enforcement, Duel 64/64, Solo 8/8, and
Chronology 42/42. The exhaustive Connections verifier was still progressing at
cancellation; locally it completes 14/14 in 187 seconds. The run also warned
that checkout/setup-node v4's Node 20 action runtime was deprecated and forced
to Node 24 by the hosted runner.

The local repair preserves every assertion and changes orchestration only:

- `package.json` and the lockfile pin Node `24.x`, aligning the local runtime,
  GitHub setup, and the repository contract Vercel will read.
- GitHub Actions now use `actions/checkout@v6` and `actions/setup-node@v6`.
- Build/budgets, Duel rules, Solo+Chronology rules, and exhaustive Connections
  rules run as four parallel jobs. Browser smoke waits for all four.
- Job ceilings are intentional: 10 minutes for build/daily, 20 for Duel/browser,
  and 30 for the exhaustive Connections audit.

The Phase 1 candidate remains inside every delivery budget:

| Surface | Current gzip JS | Current cold session |
|---|---:|---:|
| Menu | 94.49 KiB | — |
| Daily Puzzle | 131.29 KiB cold | 319.92 KiB |
| Chronology | 116.55 KiB cold | 267.31 KiB |
| Connections | 143.51 KiB cold | 268.99 KiB |
| Duel | 142.04 KiB cold | 267.52 KiB |

The browser suite now has ten journeys. New coverage proves the compact-phone
help CTA, overview brevity, four mode-isolated rule dialogs, expanded details,
ten stable Chronology choices across all five required viewports, 44px targets,
and keyboard focus movement/restoration. The final clean run passes in 33.4 seconds.

The final Phase 4 candidate has 14 browser journeys and passes build (438
modules), bundle enforcement, Duel 64/64, Solo 8/8, Chronology 42/42,
Connections 14/14, browser 14/14, and `git diff --check`. This repair has not
been committed, pushed, or run remotely. A green GitHub run therefore remains a
publication gate rather than a claimed result.
