# 03 — How to run

**Last verified:** 2026-09-13 on `codex/handoff-refresh-2026-09-13` (from main 8100e29) (every command below was run on this
machine today unless marked UNVERIFIED)

## Prerequisites

- **Node 24.x** (`package.json` `engines`). On Buri's Mac the login shell finds
  Node 22 first; Node 24.14.0 lives in `/usr/local/bin`. Every doc and prompt in
  this repo therefore prefixes commands with `PATH=/usr/local/bin:$PATH`. Use a
  version manager or the same prefix.
- npm 10.
- For the browser suite: Playwright's Chromium (`npx playwright install --with-deps chromium`).
- For deploys: the Vercel CLI via `npx --yes vercel@59.11.1` (it is **not**
  installed globally on purpose) and Buri's Vercel login.
- For content audits: TMDB keys in `.env.local` (see Environment variables).

## Setup

```bash
npm ci
```

## Run locally

```bash
PATH=/usr/local/bin:$PATH npm run dev
```

Vite serves on `http://localhost:5173`. The desktop-app browser preview configs
are in `.claude/launch.json` (`marquee` @5173, `marquee-alt` @5183).

Dev-only helpers (tree-shaken out of production):

- `?mode=duel|solo|chronology|connections` boots straight into a mode's daily.
- `?preview=<Name>` renders `src/components/previews/<Name>.preview.tsx` alone.
- `window.__matchcutProgress` exposes the localStorage meta-state for seed simulation.

Production build and local preview under the real security headers:

```bash
PATH=/usr/local/bin:$PATH npm run build && npm run preview
```

## Tests and gates

The "quick suite" (≈5 s) runs after any change; the full suite at every wave
close and after anything touching `sim/`, `src/lib/`, or a deal path
(`docs/master-plan.md` §2.3).

```bash
PATH=/usr/local/bin:$PATH npm run build
PATH=/usr/local/bin:$PATH npm run verify:solo          # 8/8
PATH=/usr/local/bin:$PATH npm run verify:chronology    # 42/42
PATH=/usr/local/bin:$PATH npm run verify:connections   # 14/14  (large heap; ~10–60 s)
PATH=/usr/local/bin:$PATH npm run verify               # 64/64  (~2.5 min)
PATH=/usr/local/bin:$PATH npm run verify:analytics     # PASS
PATH=/usr/local/bin:$PATH npm run verify:progress      # PASS
PATH=/usr/local/bin:$PATH npm run check:bundle         # PASS, menu shell ≤ 104 KiB gzip
PATH=/usr/local/bin:$PATH npm run check:security       # PASS
PATH=/usr/local/bin:$PATH npm run test:smoke           # 39/39 Playwright (starts its own servers on :4273 and :5273)
git diff --check
```

The numbers that must hold (CLAUDE.md, AGENTS.md, and every checkpoint since
2026-07-09): **verify 64/64 · verify:solo 8/8 · verify:chronology 42/42 ·
verify:connections 14/14.** Results from this handoff run:

| Gate | Result 2026-09-07 · re-run 2026-09-13 (Node 24.14.0) |
|---|---|
| build | clean · ✓ 09-13 clean (`index-fq7RRZS5.js` 102.92 kB gzip) |
| verify:solo | 8 passed, 0 failed · ✓ 09-13 8/8 |
| verify:chronology | 42 passed, 0 failed · ✓ 09-13 42/42 |
| verify:analytics | PASS |
| verify:progress | PASS |
| check:bundle | PASS |
| check:security | PASS (370 repository files, 27 production files) |
| verify (Duel) | 64 passed, 0 failed · ✓ 09-13 64/64 |
| verify:connections | 14 passed, 0 failed · not re-run 09-13 (takes >10 min; green in CI on 5edaec3) |
| test:smoke | UNVERIFIED locally this run; green in CI run 33826836354 on the polish merge and on every merge since |

Difficulty tune (only after content or mechanic changes; long):

```bash
PATH=/usr/local/bin:$PATH npm run eval tune 8000 --seed=200824 --assert
```

Expected ≈ 65.9 / 50.3 / 41.4 casual win rates for Matinee / Feature /
Director's Cut vs targets 65 / 50 / 41. Note: bare `npm run eval` prints an
unseeded 1000-game flow report with different numbers; that is not the tune gate.

Other sims: `npm run sim` (Duel gameplay simulator), `npm run eval:chronology`,
`npm run gen:connections` (yield report).

## Build and deploy

**Pushing to GitHub never deploys.** The Vercel project has no git integration;
every production deploy is an explicit CLI command from a **clean clone**, and
deploys are always Buri's decision. The executable runbook is
`docs/daily-duel-216-deploy-and-indexing-runbook.md` §2 (executed 2026-09-05);
the checklist is `docs/production-release-checklist.md`.

Shape of a production deploy (read the runbook for the full gate list):

1. CI green on the exact SHA; clean clone of that SHA in a scratch directory.
2. `npx --yes vercel@59.11.1 whoami` (the stored token expires; refresh first).
3. Preview first: `npx --yes vercel@59.11.1 deploy --yes` → protected Preview URL;
   Buri mints an SSO-bypass cookie jar by hand (agents must not read the Vercel
   token); run `npm run verify:preview-security -- --url=<preview> --cookie-jar=<jar>`
   and `npm run smoke:prod -- --base=<preview> --cookie-jar=<jar> [--seed=YYYY-MM-DD]`.
4. `npx --yes vercel@59.11.1 deploy --prod --yes` → new deployment id, aliased to
   matchcutdaily.com automatically.
5. Prove the served bytes: `vercel api /v13/deployments/<id>` → `meta.githubCommitSha`;
   sha256 of served `index-*.js/css` must equal a `.vercelignore`-filtered rebuild.
6. Post-deploy gates on production: `verify:preview-security --url=https://matchcutdaily.com`
   (fires one documented `goal4_security_preview` analytics event),
   `smoke:prod --base=https://matchcutdaily.com` and again with `--seed=2026-09-27`.
7. Update the rollback ids in the runbook §2.5 and the release checklist.

Rollback (one command; drilled 2026-09-05 at 7 s back / 19 s forward):

```bash
npx --yes vercel@59.11.1 rollback dpl_8SighytERqgygRYvbf1eMyLis6SL --yes
```

and to return to the current build:

```bash
npx --yes vercel@59.11.1 promote dpl_HWeNAMnK2eLernz47PCG9RAmgCu6 --yes
```

Current production (since 2026-09-05T21:25Z): `dpl_HWeNAMnK2eLernz47PCG9RAmgCu6`
= `main@9a5fdbb`, asset `index-DAtVcX_d.js`. Rollback target = the previous
deployment `dpl_8SighytERqgygRYvbf1eMyLis6SL` (`c063f26`).

Timing rules: never deploy within ~2 h of local midnight (daily rollover); no
deploys, DNS, or Vercel settings changes from 2026-09-24 through the 09-27
premiere (runbook §2.6).

Monitoring: `prod-smoke.yml` (nightly 04:20 UTC, plays all four modes) and
`prod-canary.yml` (curl every 30 min) open a GitHub issue on failure. GitHub
throttles schedules: observed ~4–5 h between canary runs (status review 09-06 §3).

## Environment variables

| Name | Purpose | Where to get it |
|---|---|---|
| `TMDB_API_KEY` | author-time content audits (`tmdb:*` scripts) | TMDB account (free tier); lives in gitignored `.env.local` |
| `TMDB_API_READ_TOKEN` | same, bearer variant | same |
| `VERCEL_BYPASS_COOKIE_JAR` | path to a Netscape cookie jar for protected Previews (alternative to `--cookie-jar`) | minted by Buri from the project's automation-bypass secret; ~1 h expiry |
| `VITE_E2E` | build-time flag for the Playwright build (`build:e2e`); adds test seams that must never reach a normal build | set by npm script only |
| `GITHUB_TOKEN` | workflows open issues on failure | provided by Actions |

Never commit `.env.local`; `check:security` fails on a tracked env file.

## Common problems

- **Wrong Node.** Symptoms: verifiers behave differently, CI counts differ.
  Always `PATH=/usr/local/bin:$PATH`.
- **`npm audit` flakes red in CI** on npm registry 503s (three times in early
  September). `gh run rerun --failed`. A retry wrapper is an open follow-up.
- **Vercel token expired** → API 403 / "no bypass secret". Run `vercel whoami`
  from the clean clone before any Vercel mutation.
- **Preview security gate red on "Vercel Toolbar present."** Vercel injects a
  feedback script into authenticated Previews; the gate now sends
  `x-vercel-skip-toolbar: 1` (commit 0dd6c8d).
- **Local build hashes differ from the served bundle** even on the same SHA:
  Tailwind 4 scans `docs/*.md` locally and picks up class-like strings. Compare
  against a `.vercelignore`-filtered rebuild, not the in-place build.
- **`verify` takes minutes or stalls.** Stray `node sim/verify.ts` processes pile
  up; `pkill -f sim/verify.ts` (do not broad-kill node).
- **The desktop-app browser preview reloads on every file edit**, killing
  in-flight games you were screenshotting. Freeze edits while capturing evidence.
- **Framer drag/tap and synthetic events.** Live-site automation needs real CDP
  clicks; drag accepts neither synthetic PointerEvents nor CDP drags. The
  production smoke drives the real UI; gestures are phone-verify territory.
- **`git mv -k` silently no-ops on ignored paths; zsh no-match globs abort `rm`.**
  Use `find`.
- **A tab left open across a deploy 404s its next chunk.** Handled by the
  `vite:preloadError` one-shot reload in `main.tsx` (PR #10).
- **Onboarding dialog intercepts clicks** in a fresh browser context; skip it
  first in any driver.
