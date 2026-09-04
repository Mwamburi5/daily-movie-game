# Match Cut 216+16 — protected-Preview verification receipt (Approval 3)

LOCAL-ONLY record (NOT committed). Governing spec:
`docs/daily-duel-216-preview-verification-goal-prompt.md`. Run 2026-09-01
(evening, America/New_York). Status: **P0 + P1 PASS · P2 run 1 RED on exactly
one assertion (Vercel Toolbar injection) → Buri approved a one-line harness
edit → P2 run 2 GREEN on the repo gate · harness commit `0dd6c8d` pushed on
`codex/preview-gate-skip-toolbar`, exact-SHA CI RED at the `npm audit` step on
a browserslist advisory published 2026-09-01T16:42Z → Buri approved
`npm audit fix` as its own commit `6b758b0` → **CI GREEN** on `6b758b0` ·
**P3 four-mode matrix PASS** on the Preview (2026-09-03T01:25Z, 0 faults).**
External mutations: the approved Vercel *preview* deployment and the two
approved commits pushed to `codex/preview-gate-skip-toolbar` (no PR, no merge).
**Approval 3 completion gate: MET.** Stopped at the **Preview Review**
checkpoint; Approval 4 (production deploy) is Buri's next separate decision.

## P0 — baseline

| item | value |
|---|---|
| `origin/main` | `14a546e79ae1af3206e470f8f555d74257ff3a58` (fetched 2026-09-01 evening) |
| local checkout | branch `codex/daily-mode-polish` at `23c592a`; tracked tree clean; **tree `b954571…` is byte-identical to `14a546e`'s tree** (the merge commit adds no content over `23c592a`) |
| CI on the merged SHAs | recorded in `docs/daily-duel-216-ship-receipt.md` (runs 33501320800 / 33503913820 / 33503909712) — not re-run |
| Node / npm | `/usr/local/bin/node` v24.14.0 · npm 11.9.0 (PATH prefix; default shell is v22) |
| Playwright | `@playwright/test` 1.62.1; Chromium 1208/1234 + headless-shell present in `~/Library/Caches/ms-playwright` |
| Vercel CLI | **not installed on this machine**; ran `npx --yes vercel@59.11.1` (the repo's historical deploy pattern). `vercel whoami` → `mwamburi5` |
| Vercel project link | `.vercel/project.json` → `marquee` (`prj_pulSUCbmLIthysHhzWGGtVIajIgm`, team `team_yyOr5zARz3GhouJJyMunDA4x`); project's latest production URL = `https://matchcutdaily.com` |
| project settings (read-only API GET) | framework vite · node 24.x · **git link: none** (no auto-deploy on push) · `ssoProtection.deploymentType = all_except_custom_domains` · password protection none · trusted IPs none · protection-bypass entries: 1 (pre-existing) · `live = false` · production target `dpl_8SighytERqgygRYvbf1eMyLis6SL` aliased matchcutdaily.com / marquee-one-iota.vercel.app |
| existing Preview state | `vercel ls`: newest deployments are 14 d old (prod `marquee-g16l914b4`, Goal 5 Preview `marquee-k3gi9nq6y` = `dpl_ECTuDQiuZcWnCa8fCxSJ3jVTK6bk`, `marquee-n2jdc356h`, one Error preview `marquee-ltdwdk3bh`). **No auto-created Preview for `14a546e` existed** |
| SSO-bypass jar | `VERCEL_BYPASS_COOKIE_JAR` unset; no jar file anywhere on disk; Goal 5's cookie was "kept outside the repository" and was not preserved. See P2 for how one was minted |
| local build | `npm run build` on the identical tree: tsc clean, vite built in 1.07 s; no git-status drift afterward |

In-place local build fingerprints (working tree, see the P1 asset row for why
these differ from the served hashes):

```
dist/index.html          sha256 8b47e78585420cadb3bc640c571e56fc96881e9d9a182929cc7e0cd872d2e89a
assets/index-Bzdp8_FV.js sha256 967ca2e9a405d8657a544900cbb6f78fd005bf850c3612c0820bced951667d6e
assets/index-D10AJD7P.css sha256 57901e59d3f08bedd9990b3345b86575a0790c65936b0a324ebc21317aec4839
```

## P1 — protected Preview deployment — PASS

Deploy source: a fresh `git clone --branch main` of the GitHub remote into the
session scratchpad (HEAD `14a546e…`, tree `b954571…`, 0 dirty paths) with only
`.vercel/project.json` copied in. Command: `npx --yes vercel@59.11.1 deploy --yes`
(no `--prod`, no alias, no settings flags). Nothing from the working tree
(untracked docs/promo files) was uploaded.

| item | value |
|---|---|
| Preview URL | `https://marquee-otlnd4c6f-mwamburi5s-projects.vercel.app` |
| deployment id | `dpl_FTnTRXPKr4V1Hyz8Fu68AfPymr75` |
| inspector | https://vercel.com/mwamburi5s-projects/marquee/FTnTRXPKr4V1Hyz8Fu68AfPymr75 |
| target / state | `target: null` (Preview) · `readyState: READY` · `public: false` · `alias: []` · `source: cli` |
| created / ready | 2026-09-01T23:16:18Z → 23:16:33Z (build in iad1, Node 24.x, "vercel build" via CLI 59.3.0) |
| **SHA linkage** | deployment `meta.githubCommitSha = 14a546e79ae1af3206e470f8f555d74257ff3a58`, `githubCommitRef = main`, `githubCommitMessage = "Merge pull request #2 from Mwamburi5/codex/daily-mode-polish"`, repo `Mwamburi5/daily-movie-game` (read back from the deployments API, not self-asserted) |
| protection intact | unauthenticated `GET /` → **302** to `https://vercel.com/sso-api?url=…&nonce=…` with `_vercel_sso_nonce` cookie; unauthenticated `GET /assets/<hashed>.js` → **302** to the same SSO endpoint (no asset leaks past protection) |
| **asset fingerprint vs local build** | **PASS (byte-identical).** Served shell references `index-mVMzX4p-.js` + `index-C6yCZ_ke.css`, which differ from the in-place build (`index-Bzdp8_FV.js` / `index-D10AJD7P.css`). Root cause: Tailwind 4 automatic source detection scans the whole working tree locally, including `docs/*.md` that `.vercelignore` excludes from deploys, and emits 21 extra utilities (e.g. `.top-\[Npx\]` from `docs/ui-contracts.md`). Rebuilding the clean `14a546e` clone with the `.vercelignore` paths removed and the same `node_modules` reproduces the served hashes exactly, and the served JS/CSS are **byte-identical** to that rebuild (sha256 `2d76e26935ea3d09…` / `c4e9af1acaa7e51c…`). The deployed bundle is the `14a546e` tree built from its deployment inputs. Served `index.html` minus the injected Toolbar tag (see P2) equals `dist/index.html` modulo those two hashes; `noindex, nofollow` present |

Evidence (gitignored): `audit/daily-duel-216-launch-readiness-2026-08-27/preview/`
`p1-vercel-deploy-output.txt`, `p1-deployment-meta.json`,
`p1-unauthenticated-root-headers.txt` (nonces redacted).

## P2 — `verify:preview-security` — RED (one assertion)

SSO-bypass jar: the auto-mode permission classifier denied the agent every
action that reads the Vercel CLI token or mints a cookie, so Buri ran the
scratchpad `mint-jar.mjs` by hand (~23:25Z). It derived a `_vercel_jwt` from
the project's **pre-existing** Protection Bypass for Automation secret via
`x-vercel-set-bypass-cookie` (no setting created or changed) and wrote a 0600
Netscape jar in the session scratchpad, outside the repo, ~1 h expiry.

Verbatim command and output (run 1, repo script untouched):

```
PATH=/usr/local/bin:$PATH npm run verify:preview-security -- --url=https://marquee-otlnd4c6f-mwamburi5s-projects.vercel.app --cookie-jar=<scratchpad>/preview-bypass.cookies.txt

Error: Vercel Toolbar script is present under the restrictive CSP.
    at assert (file:///…/scripts/verify-preview-security.mjs:22:25)
    at file:///…/scripts/verify-preview-security.mjs:103:3
```

Diagnosis (read-only, no source edit):

- The authenticated HTML carries an edge-injected
  `<script async data-explicit-opt-in="true" data-deployment-id="dpl_FTnT…" src="https://vercel.live/_next-live/feedback/feedback.js">`
  after the app shell. It is not in the built `index.html`.
- Injection is conditional on the authenticated Preview session: the same
  request with header `x-vercel-skip-toolbar: 1` returns the shell **without**
  the tag. Project `live = false`, team `enablePreviewFeedback = null`
  (defaults): nothing in the project enables it; it is platform behaviour for
  authenticated Preview responses. Production (custom domain, unprotected)
  never receives it; the 08-19 production baseline passed this assertion.
- Goal 5's 2026-08-18 Preview passed this assertion. What differs today is
  not determinable from read-only evidence (platform default drift since
  August, or the Goal 5 jar carrying a toolbar-hide cookie).
- **Diagnostic run** (scratchpad copy of the gate; single change: the browser
  context sends `x-vercel-skip-toolbar: 1`; repo script untouched):

```
[DIAGNOSTIC, x-vercel-skip-toolbar:1] Preview security verified: https://marquee-otlnd4c6f-mwamburi5s-projects.vercel.app
- 9/9 required headers match
- CSP violations: 0; console warnings/errors: 0
- analytics loader: 200; browser event: 200
- production test seams, secret names, and source map: absent
```

  The Toolbar injection is therefore the **only** red.
- Static sub-checks via curl + grep agree (`p2-static-subchecks.txt`): 9/9
  headers exact-match `security-headers.ts`, 0 inline scripts, insights loader
  200, all six forbidden markers absent, no `sourceMappingURL`, `.map` → 404.

Resolution: **Buri approved option 1 (harness change) in-session, ~00:00Z
2026-09-02.** Options 2 (Vercel setting) and 3 (accept diagnostic) not taken.

### P2 run 2 — repo gate with the approved harness edit — GREEN

Edit: `scripts/verify-preview-security.mjs`, +4 lines (3 comment lines + 
`extraHTTPHeaders: { 'x-vercel-skip-toolbar': '1' }` in the browser context).
No header, CSP, bundle, or dependency change. Re-opened security checklist
items re-run locally: `npm run check:security` PASS (285 repository files, 25
production files) · `git diff --check` clean.

```
PATH=/usr/local/bin:$PATH npm run verify:preview-security -- --url=https://marquee-otlnd4c6f-mwamburi5s-projects.vercel.app --cookie-jar=<scratchpad>/preview-bypass.cookies.txt

Preview security verified: https://marquee-otlnd4c6f-mwamburi5s-projects.vercel.app
- 9/9 required headers match
- CSP violations: 0; console warnings/errors: 0
- analytics loader: 200; browser event: 200
- production test seams, secret names, and source map: absent
```

Evidence: `p2-verify-preview-security-run2-GREEN.txt`.

### Harness commit + exact-SHA CI

| item | value |
|---|---|
| branch | `codex/preview-gate-skip-toolbar` (created from `origin/main` = `14a546e`; CI triggers on push only for `main` and `codex/**`) |
| commit | `0dd6c8d1f700ac8dea5082d405438d65c25bf654` — "Opt the Preview security gate out of the Vercel Toolbar overlay" (1 file, +4) |
| pushed | 2026-09-02 ~00:02Z; no PR opened (checklist: PRs only when explicitly requested) |
| CI | https://github.com/Mwamburi5/daily-movie-game/actions/runs/33573643361 — **failure**. Jobs: daily-rules ✅ · duel-rules ✅ · connections-rules ✅ · **build-and-budgets ❌ at step "Audit dependency advisories" (`npm audit`)** · browser-smoke skipped (needs build job) · dependency-review skipped (push norm) |
| cause | `browserslist@4.28.2` (transitive: `@vitejs/plugin-react` → `@babel/core` → `@babel/helper-compilation-targets`; build-time only, never in the shipped bundle) now carries two high advisories GHSA-c83g-rgw3-j3cx + GHSA-73wf-gq98-2v4g, **published 2026-09-01T16:41–16:42Z** — five hours after this morning's green main run (33503913820, 11:43Z, same lockfile). Patched version 4.28.7. `npm audit` reproduces locally on the untouched lockfile. Not caused by the harness edit (diff `14a546e..0dd6c8d` = the script only). |
| implication | Any push to `main` or `codex/**` fails CI until the lockfile bumps browserslist ≥ 4.28.7. |
| **resolution (Buri-approved 2026-09-02 ~00:30Z)** | `npm audit fix` applied as its own commit **`6b758b0f5ae52d7b3308aafd329dd4ef7b870269`** — "Bump browserslist data packages past GHSA-c83g-rgw3-j3cx". Lockfile only (+23/−23): browserslist 4.28.2→4.28.8, baseline-browser-mapping, caniuse-lite, electron-to-chromium, node-releases, update-browserslist-db; `package.json` unchanged; `npm audit` → 0 vulnerabilities. **Rebuild with the bumped lockfile is byte-identical** (`index-Bzdp8_FV.js` / `index-D10AJD7P.css` unchanged) → the verified Preview bundle is unaffected; `check:bundle` PASS. |
| **CI on `6b758b0`** | https://github.com/Mwamburi5/daily-movie-game/actions/runs/33699865177 — **success**: build-and-budgets ✅ · daily-rules ✅ · duel-rules ✅ · connections-rules ✅ · browser-smoke ✅ · dependency-review skipped (push norm). Branch tip = `6b758b0` (two commits over `main`), pushed, no PR opened. |

## P3 — four-mode Preview matrix — PASS

Run 2026-09-03T01:24:55Z → 01:25:51Z against the protected Preview with a
fresh jar (Buri re-minted at ~01:24Z; the first retry failed only because the
CLI's stored access token had expired during the day-long gap — any `vercel`
command refreshes it; the secret itself, created 2026-08-08, was intact).
Driver: `p3-matrix.mjs` (scratchpad; written by an Opus sub-agent, dry-run
proven on a local `vite preview` of the identical tree first). Real Chromium
390×844, jar cookie loaded, `x-vercel-skip-toolbar: 1`, clipboard permissions
granted. The production bundle has no E2E seams, so every row is real UI play:
the day's deals (seed `2026-09-02`) were recomputed in Node from the same
`src/lib` functions the bundle ships and cross-checked against the DOM before
play (a mismatch aborts the run).

| mode | load | action | error recovery | terminal | share | screenshot |
|---|---|---|---|---|---|---|
| Daily Puzzle | PASS | PASS | PASS | PASS (solved, score 1 vs par 11) | PASS (clipboard, URL-free) | `p3-daily-terminal.png` |
| Chronology | PASS | PASS | PASS | PASS (cleared, −2) | PASS (clipboard, URL-free) | `p3-chronology-terminal.png` |
| Connections | PASS | PASS | PASS | PASS (solved, 1 mistake) | PASS (clipboard, URL-free) | `p3-connections-terminal.png` |
| Duel (Matinee) | PASS | PASS | PASS | PASS (CPU won, hit 20; net −4 vs 16) | PASS (clipboard, URL-free) | `p3-duel-terminal.png` |
| sanitized `matchcut:v1` A (structurally wrong JSON) | PASS — 4 cards, repaired chips, 0 pageerrors | | | | | `p3-sanitized-menu-a.png` |
| sanitized `matchcut:v1` B (non-JSON garbage) | PASS — 4 cards, fresh state + onboarding, 0 pageerrors | | | | | `p3-sanitized-menu-b.png` |

Faults across the entire run: **0** console errors, 0 warnings, 0 pageerrors,
0 CSP violations, 0 failed/≥400 same-origin requests.

Per-mode notes (full text in `p3-matrix.md` / `p3-matrix-preview.json`):

- **Daily Puzzle** — pile top `mission-impossible` = computed deal. Error:
  Fargo onto Mission: Impossible → "No shared credit · +2", card returned,
  penalty applied, play continued. Action: A Few Good Men accepted. Share:
  `Match Cut · Daily Puzzle / score 1, par 11 (10 under par) / 🎬🟩🟩🟩🟩🟩🟩🟩`.
- **Chronology** — anchor Indiana Jones and the Last Crusade (1989). Error:
  Whiplash placed in the wrong gap → year revealed, stroke charged, card
  re-slotted. Action: Walk the Line accepted clean. Share:
  `Match Cut · Chronology / score -2 (1 stroke, 3 back) / 🎬🟥🟩🟩🟩🟩🟩🟩🟩🟩🟩`.
- **Connections** — 16 tiles = baked grid. Error: deliberate one-away set →
  "one away — swap one ticket", mistake counted. Action: director group
  accepted. Share: `Match Cut · Connections / solved · 1 mistake / …`.
- **Duel** — Error: drop with no shared credit and no Final Cut refused (hand,
  score, turn unchanged). Action: Sicario onto Prisoners via Denis Villeneuve
  accepted. Terminal after 69 driven steps. Share:
  `Match Cut · Duel / lost vs Matinee · net -4 to 16 / 🎬🟥🟥🟥🟥`.
- **Sanitized A** — valid solo record survived a corrupt sibling (`✓ streak 5`
  kept), bare-string chronology reset, negative connections streak repaired
  to `✓ streak 1`, duel wins clamped to plays (`3/3 won`), unknown difficulty
  fell back to matinee, passport `2/3 stamped`. **Sanitized B** — unparseable
  blob read as fresh device: onboarding shown, no chips, passport `0/3`.

Anomaly (cosmetic, described not fixed): `src/ChronologyGame.tsx:1054` renders
"Score -2 = 1 strokes − 3 credits" (unpluralised) above a correctly pluralised
line. Scope note: today's Daily Puzzle dealt from the legacy pool; the 216-card
cutover keys off the date (2026-09-27), so this matrix certifies the merged
app, not the cutover deal itself.

Follow-up (tooling, not a gate item): `mint-jar.mjs` should run `vercel whoami`
first to refresh the CLI access token; otherwise a stale token reads as "no
bypass secret".

## Side findings (read-only API, relevant to the later gates)

- **Team plan = `hobby`** (`billing.plan`, legacy iteration). This answers the
  checkpoint §6 property-cap question: Hobby allows no custom-event
  properties, so the 3-property journey events will not record as designed in
  production until the plan question is settled (Approval 4 pre-deploy item).
- Project has **no Git link** (`link: null`): pushes and merges never
  auto-deploy; every deployment is an explicit CLI action. This is why the
  merge to `main` changed nothing in production.
- Tooling note: the classifier allows the agent to run `curl -b <jar>` and the
  npm gate with `--cookie-jar`, but not to read the CLI token or mint the jar.

## P4 — receipts

This file (LOCAL-ONLY) + evidence under
`audit/daily-duel-216-launch-readiness-2026-08-27/preview/`: `p1-*`,
`p2-verify-preview-security-run1.txt`, `p2-authenticated-root-headers.txt`,
`p2-served-index.html`, `p2-static-subchecks.txt`,
`p2-DIAGNOSTIC-skip-toolbar-scratch-copy.{txt,mjs}`. Memory updated
(`marquee-next-session-queue`). Working tree: tracked files untouched; the
ship receipt and promo-family untracked files untouched. Note:
`docs/daily-duel-216-deploy-and-indexing-runbook.md` is also untracked in the
tree (pre-existing local doc from the 09-01 afternoon session, not produced
here).

## Still NOT approved / NOT run

Production deploy (`--prod`), alias changes, project/settings mutations,
indexing switches, production analytics queries. Live prod remains `c063f26`
(`dpl_8SighytERqgygRYvbf1eMyLis6SL`). Approval 4 stays Buri's separate
decision after this gate is fully green. Attended lanes A–E may target this
Preview now; lane participants need the same SSO-bypass access.
