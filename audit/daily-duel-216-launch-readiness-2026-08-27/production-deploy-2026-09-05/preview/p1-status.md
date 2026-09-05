# P1 — protected Preview of the deploy SHA (status as of 2026-09-05 17:05 EDT)

| item | value |
|---|---|
| deploy source | fresh `git clone --branch main` in the session scratchpad; HEAD `9a5fdbbc3976490aa941e4936b064c7416c1d0bc` (tree `b3d6acb9…`), `git status --porcelain` empty, only `.vercel/project.json` copied in |
| command | `npx --yes vercel@59.11.1 whoami` (→ mwamburi5) then `npx --yes vercel@59.11.1 deploy --yes` (no `--prod`), 2026-09-04T13:07:43Z → 13:08:01Z |
| Preview URL | `https://marquee-gnny8yrc7-mwamburi5s-projects.vercel.app` |
| deployment id | `dpl_3XYcXVGb3gpnZCmygW1yo7HtqMMb` · inspector https://vercel.com/mwamburi5s-projects/marquee/3XYcXVGb3gpnZCmygW1yo7HtqMMb |
| target / state | `target: null` (Preview) · `readyState: READY` · `public: false` · `alias: []` · `source: cli` · build cache restored from `FTnTRXPKr4V1Hyz8Fu68AfPymr75` (the Approval-3 Preview) · 108 deployment files |
| **provenance (P1a)** | deployments API `meta.githubCommitSha = 9a5fdbbc3976490aa941e4936b064c7416c1d0bc`, `githubCommitRef = main`, `githubCommitMessage = "Merge pull request #13 from Mwamburi5/codex/prelaunch-receipt"`, repo `Mwamburi5/daily-movie-game` — read back via `vercel api /v13/deployments/<id>` (`p1-deployment-meta.json`), not self-asserted ✔ |
| protection | unauthenticated `GET /` → **302** to `https://vercel.com/sso-api?url=…&nonce=<redacted>` with `_vercel_sso_nonce` cookie (`p1-unauthenticated-root-headers.txt`) ✔ |
| **expected production hashes** (filtered rebuild) | second clone of the same SHA with the `.vercelignore` paths removed (`audit/ .agents/ .codex/ design_handoff_the_stub/ docs/ sim/ scripts/ *.md`), fresh `npm ci` (browserslist 4.28.8 = lockfile), `npm run build` → `dist/assets/index-DAtVcX_d.js` sha256 `2269b97173854792b66f4290954591b5bbf28d82273cb5275a818a80e288e1d4` · `dist/assets/index-CoBkmvh_.css` sha256 `5ccbcb613ce91e4c5006a995a04544681fd955a15887f7023e6e84daf5651468` · `dist/index.html` sha256 `b1a2aacd489fdda0967e2713a2e9a8b6cc38a991e7eb9500b37c36a9cf028752`. (Menu entry 316.49 kB / 102.93 kB gzip — under the 104 KiB budget.) |
| served-bytes compare (P1b) | PENDING — needs the SSO-bypass jar |
| `verify:preview-security` | PENDING — needs the jar |
| `smoke:prod` today + `--seed=2026-09-27` | PENDING — needs the jar |
| jar | Buri was asked to mint it three times (2026-09-04 ~09:12, ~09:20, 2026-09-05 ~16:55 EDT); each time the answer was "done" but no `preview-bypass.cookies.txt` / `preview-index.html` appeared in the scratchpad and the Terminal panel showed only an idle prompt. Nothing was run by the agent (the classifier blocks minting). Four FAIL receipts from the missing-jar attempts were deleted (they never reached the app). |

## Resolved 2026-09-05 17:21–17:24 EDT

Buri ran `scratchpad/mint.sh` in the Terminal tab at 21:21:25Z (transcript
`p1-mint-output.txt`). Then: served-bytes compare **PASS** (JS/CSS/HTML sha256
all equal to the filtered rebuild, `p1-served-vs-rebuild-hashes.txt`) ·
`verify:preview-security` **GREEN** (`p1-verify-preview-security.txt`) ·
`smoke:prod` seed 2026-09-05 **PASS 4/4, 0 faults** (`matrix-preview.*`) ·
`smoke:prod --seed=2026-09-27` **PASS 4/4, 0 faults, 216 pool**
(`matrix-preview-0927.*`). P1 complete → P2 ran at 21:25Z.
