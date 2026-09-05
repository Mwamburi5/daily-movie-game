# Match Cut 216+16 — production deploy receipt (Approval 4)

Executed 2026-09-04 (P0–P1 deploy) and 2026-09-05 (P1 gates → P5), America/New_York,
from `docs/daily-duel-216-production-deploy-kickoff-prompt.md` (Buri's `/goal` block =
the authorization) and `docs/daily-duel-216-deploy-and-indexing-runbook.md` §2.
**Result: production serves `main@9a5fdbb` — provenance and bytes proven; every
gate green incl. the 2026-09-27 cutover deal on production bytes; rollback drill
round-trip 7 s / 19 s; crons enabled in this commit.** Quiet phase unchanged:
`noindex, nofollow` present, shares URL-free, no Vercel setting/domain/plan touched.

External mutations, all inside the approval: one Preview deployment
(`dpl_3XYcXVGb3gpnZCmygW1yo7HtqMMb`), one production deployment
(`dpl_HWeNAMnK2eLernz47PCG9RAmgCu6`), two production alias moves for the drill
(rollback to `dpl_8Sighyt…`, promote back), two `goal4_security_preview` analytics
events (the documented test event, fired by the production security gate at
21:26:44Z and post-drill at 21:34:06Z), one CI re-run of a flaked job, this PR.

Evidence (force-added with this commit, PNGs limited to six):
`audit/daily-duel-216-launch-readiness-2026-08-27/production-deploy-2026-09-05/`
(`p0-baseline.md`, `preview/p1-*`, `preview/matrix-preview*.{json,md}`,
`prod/p2-*` … `prod/p5-*`, `prod/matrix-prod*.{json,md}`, `prod/p4-3-4-static-surfaces.txt`,
`prod/p4-4-tmdb-attribution.txt`). Nothing secret is recorded: SSO nonces are
redacted, the jar and the CLI token never left the scratchpad / keychain.

## Deviations from the kickoff (read these first)

1. **D6 was unruled at P0.** No record existed anywhere; per precondition 2 the
   agent stopped read-only and asked. Buri ruled **keep `DAILY_EPOCH = '2026-07-04'`**
   (2026-09-04 ~09:15 EDT): no source edit, deploy SHA unchanged. Production
   smokes read `DAY 64` on 2026-09-05 and `DAY 86` on 2026-09-27 — consistent.
2. **Exact-SHA CI on `9a5fdbb` was red at P0** (run 33829755130, `npm audit`
   step: npm registry `503 Service Unavailable`; the flake logged in the polish
   receipt). The precondition was already met by the green run on the last
   code-bearing ancestor `b08d8db` (33826836354; `9a5fdbb` adds 73 doc lines).
   The failed job was re-run (`gh run rerun --failed`) and the whole run went
   **green** (~09:22 EDT), so the deploy SHA has its own exact-SHA receipt.
3. **The jar mint took a day.** Preview deployed 2026-09-04T13:07Z; the P1 gates
   need an SSO-bypass jar the agent must not mint (it reads the CLI token).
   Buri was away from the Mac; three "done" answers arrived with no file on
   disk (the four FAIL receipts those attempts wrote — `FATAL … ENOENT` on the
   jar path, 0/4 modes played — were deleted as never having reached the app).
   Buri ran the wrapper at 2026-09-05T21:21Z; everything from P1 gates to P5
   then ran between 21:21Z and 21:34Z. Timing rules held (17:21–17:34 EDT;
   22 days before 09-27).
4. **Rollback-target wording.** The kickoff says "update the rollback target to
   the NEW `dpl_…`". Read literally that would make the documented rollback
   command a no-op (rolling production back to itself). §2.5 and the release
   checklist now record **both ids with their roles**: production =
   `dpl_HWeNAMnK2eLernz47PCG9RAmgCu6`; rollback target (fall back to if the
   current build must be reverted) = the previous `dpl_8SighytERqgygRYvbf1eMyLis6SL`;
   `promote dpl_HWeN… --yes` returns. After the next deploy the target becomes
   `dpl_HWeN…`. This is the reading that keeps the one-command rollback true.
5. **Evidence directory is named by the deploy date** (`production-deploy-2026-09-05`),
   although P0 and the Preview deploy happened on 09-04.
6. **P4 items were run in parallel**, not strictly "in order" — all read-only
   against production; any red would still have triggered §2.5 first.

## P0 — baseline (2026-09-04 09:01–09:22 EDT)

| item | value |
|---|---|
| `origin/main` = local `main` = HEAD | `9a5fdbbc3976490aa941e4936b064c7416c1d0bc` (tree `b3d6acb9…`) |
| local tree | clean apart from the untracked promo family + the untracked kickoff prompt; promo fingerprints recorded (`p0-baseline.md`) and re-checked byte-identical at close-out |
| CI | `b08d8db` run 33826836354 ✅ (six jobs) · `9a5fdbb` run 33829755130 ❌→✅ after re-run (deviation 2) |
| toolchain | Node v24.14.0 / npm 11.9.0 via `PATH=/usr/local/bin:$PATH` · `gh` = Mwamburi5 · Playwright `@playwright/test` ^1.62.1, Chromium 1208/1234 present · `npx --yes vercel@59.11.1 whoami` = `mwamburi5` (run first; refreshes the expiring token) |
| project link | `.vercel/project.json` → `marquee` / `prj_pulSUCbmLIthysHhzWGGtVIajIgm` / `team_yyOr5zARz3GhouJJyMunDA4x` |
| production before | `HTTP/2 200` · assets `index-Ch7qjnS-.js` + `index-BGXpqkZ5.css` · deployment `dpl_8SighytERqgygRYvbf1eMyLis6SL` (`marquee-g16l914b4`, created 2026-08-18 23:53 EDT) aliased matchcutdaily.com · marquee-one-iota.vercel.app · marquee-mwamburi5s-projects.vercel.app |
| `vercel ls` head | 3d Preview `marquee-otlnd4c6f` (Approval 3) · 16d Production `marquee-g16l914b4` · 16d Previews k3gi9nq6y / n2jdc356h · ltdwdk3bh Error · 26d/27d older Productions |
| DNS/TLS | apex 200 with the nine headers · `www` 307 → apex · `http` 308 → https · cert `CN=*.matchcutdaily.com` **notAfter 2026-10-03 02:34:59 GMT** (auto-renew check ~09-20) |
| quiet phase | robots meta count 1 · `/social-preview.png` 404 on the old build (expected) |
| timing | Fri 09:01 EDT, 23 days before 09-27; recommended window |
| D6 | unruled → Buri: **keep** (deviation 1) |

## P1 — protected Preview of the deploy SHA — PASS

| item | value |
|---|---|
| source | fresh `git clone --branch main` in the session scratchpad; HEAD = SHA, `git status --porcelain` empty, only `.vercel/project.json` copied in |
| command | `whoami` → `npx --yes vercel@59.11.1 deploy --yes` (no `--prod`), 2026-09-04T13:07:43Z → 13:08:01Z |
| Preview | `https://marquee-gnny8yrc7-mwamburi5s-projects.vercel.app` = **`dpl_3XYcXVGb3gpnZCmygW1yo7HtqMMb`** · `target: null` · READY · `public: false` · `alias: []` · build cache restored from `FTnTRXPKr4V1Hyz8Fu68AfPymr75` · 108 files |
| **provenance** | `vercel api /v13/deployments/<id>` → `meta.githubCommitSha = 9a5fdbbc3976490aa941e4936b064c7416c1d0bc`, `githubCommitRef = main`, message "Merge pull request #13 from Mwamburi5/codex/prelaunch-receipt" (`p1-deployment-meta.json`) |
| protection | unauthenticated `GET /` → 302 `https://vercel.com/sso-api?…nonce=<redacted>` + `_vercel_sso_nonce`; `x-robots-tag: noindex` on the redirect |
| jar | minted by Buri 2026-09-05T21:21:25Z from the project's pre-existing automation-bypass secret (created 2026-08-08) via `scratchpad/mint.sh` → `mint-jar.mjs <host>`; `_vercel_jwt`, 1 h; transcript `p1-mint-output.txt` |
| **expected production hashes** (filtered rebuild) | second clone of the SHA minus `audit/ .agents/ .codex/ design_handoff_the_stub/ docs/ sim/ scripts/ *.md`, fresh `npm ci` (browserslist 4.28.8 = lockfile), `npm run build` → `index-DAtVcX_d.js` **`2269b97173854792b66f4290954591b5bbf28d82273cb5275a818a80e288e1d4`** · `index-CoBkmvh_.css` **`5ccbcb613ce91e4c5006a995a04544681fd955a15887f7023e6e84daf5651468`** · `index.html` **`b1a2aacd489fdda0967e2713a2e9a8b6cc38a991e7eb9500b37c36a9cf028752`** (entry 316.49 kB / 102.93 kB gzip) |
| served vs rebuild | authenticated Preview serves exactly those two assets; **all three sha256 equal** (`p1-served-vs-rebuild-hashes.txt`); no Toolbar tag with `x-vercel-skip-toolbar: 1`; robots meta present |

`verify:preview-security` (2026-09-05T21:21:53Z), verbatim:

```
Preview security verified: https://marquee-gnny8yrc7-mwamburi5s-projects.vercel.app
- 9/9 required headers match
- CSP violations: 0; console warnings/errors: 0
- analytics loader: 200; browser event: 200
- production test seams, secret names, and source map: absent
exit: 0
```

`smoke:prod` on the Preview, verbatim verdict lines:

```
PASS — https://marquee-gnny8yrc7-mwamburi5s-projects.vercel.app seed 2026-09-05 (89-film legacy pool): 4/4 modes, 0 FAIL, 0 NOT-VERIFIED, 0 faults
PASS — https://marquee-gnny8yrc7-mwamburi5s-projects.vercel.app seed 2026-09-27 (216-film expanded pool): 4/4 modes, 0 FAIL, 0 NOT-VERIFIED, 0 faults
```

## P2 — production deploy

| item | value |
|---|---|
| source | the same clean clone, re-verified HEAD = SHA and porcelain empty immediately before |
| command | `whoami` (mwamburi5) → `npx --yes vercel@59.11.1 deploy --prod --yes`, **2026-09-05T21:25:10Z → 21:25:29Z** (17:25 EDT) |
| deployment | **`dpl_HWeNAMnK2eLernz47PCG9RAmgCu6`** · `https://marquee-a9w1nt9c4-mwamburi5s-projects.vercel.app` · inspector https://vercel.com/mwamburi5s-projects/marquee/HWeNAMnK2eLernz47PCG9RAmgCu6 · `target: production` · READY · CLI printed `▲ Aliased https://matchcutdaily.com` |
| build | iad1, 108 files, cache restored from `8SighytERqgygRYvbf1eMyLis6SL`, `npm run build` = `tsc --noEmit && vite build`, vite 6.4.3 (`p2-vercel-deploy-prod-output.txt`) |

## P3 — prove the bytes — PASS on both reads

| read | result |
|---|---|
| (a) provenance | `vercel api /v13/deployments/dpl_HWeN…` → `meta.githubCommitSha = 9a5fdbbc3976490aa941e4936b064c7416c1d0bc`, `githubCommitRef = main`, `target = production`, `alias = [matchcutdaily.com, marquee-one-iota.vercel.app, marquee-mwamburi5s-projects.vercel.app]` (`p3-deployment-meta.json`) |
| (b) content | apex serves `index-DAtVcX_d.js` + `index-CoBkmvh_.css`; sha256 of served JS / CSS / `index.html` = `2269b971…` / `5ccbcb61…` / `b1a2aacd…` — **byte-identical to the P1 filtered rebuild** (`p3-served-vs-rebuild-hashes.txt`) |
| aliases | apex `HTTP/2 200` · `www` 307 → `https://matchcutdaily.com/` · `http` 308 → `https://matchcutdaily.com/` · old `index-Ch7qjnS-.js` now 404 (stale tabs take the `vite:preloadError` one-shot reload path shipped in #10) |

## P4 — post-deploy gates — all green

1. `npm run verify:preview-security -- --url=https://matchcutdaily.com` (no jar) at 2026-09-05T21:26:44Z — **fires one real `goal4_security_preview` event = the documented non-user-impacting test event**:

```
Preview security verified: https://matchcutdaily.com
- 9/9 required headers match
- CSP violations: 0; console warnings/errors: 0
- analytics loader: 200; browser event: 200
- production test seams, secret names, and source map: absent
exit: 0
```

2. `smoke:prod` against production (`matrix-prod*.md/json`, screenshots in `prod/`):

```
PASS — https://matchcutdaily.com seed 2026-09-05 (89-film legacy pool): 4/4 modes, 0 FAIL, 0 NOT-VERIFIED, 0 faults      (21:27:00Z → 21:28:24Z)
PASS — https://matchcutdaily.com seed 2026-09-27 (216-film expanded pool): 4/4 modes, 0 FAIL, 0 NOT-VERIFIED, 0 faults   (21:29:02Z → 21:30:15Z)
```

   The 09-27 run is the first time the cutover deal has been played on the real
   production bytes (closes the polish receipt's "in-tree build only" caveat):
   Daily pile top `mission-impossible-dead-reckoning-part-one` from the 216 pool
   (recomputed and DOM-matched), Chronology anchor La La Land (2016-12-09),
   Connections 16-tile grid = baked grid, Duel to a terminal; terminals read
   `DAY 86`. Every captured share text is the three-line family format with no URL.

3. Static surfaces (`p4-3-4-static-surfaces.txt`): hashed JS + CSS `cache-control: public, max-age=31536000, immutable` (200) · shell `public, max-age=0, must-revalidate` · `/.well-known/security.txt` 200 · `/social-preview.png` **200** `image/png` 98,515 B (was 404) · `/apple-touch-icon.png`, `/favicon-32.png`, `/favicon.svg` 200 · `og:image` → `https://matchcutdaily.com/social-preview.png`.

4. Quiet phase: robots meta count **1** (`noindex, nofollow`) · 0 inline `<script>` in the served shell · `apple-mobile-web-app-title` present · shares URL-free (above) · TMDB attribution visible in the production rules sheet (`p4-4-tmdb-attribution.txt`, `p4-tmdb-attribution-prod.png`).

5. Dashboard (Buri, attended): page views + Web Vitals arriving; journey events absent by design on Hobby (D1). **Pending Buri's look at the Post-deploy Review checkpoint** — not a gate failure.

## P5 — rollback drill — round-trip OK (`p5-rollback-drill.txt`)

| step | wall clock |
|---|---|
| pre-drill served asset | `index-DAtVcX_d.js` |
| `t0` 2026-09-05T21:32:24Z · `npx --yes vercel@59.11.1 rollback dpl_8SighytERqgygRYvbf1eMyLis6SL --yes` | CLI "Success! … rolled back … [2s]" returned after **7 s**; apex served `index-Ch7qjnS-.js` **7 s** after `t0`; 200 + CSP still present |
| `t1` 21:32:33Z · `npx --yes vercel@59.11.1 promote dpl_HWeNAMnK2eLernz47PCG9RAmgCu6 --yes` | CLI "Success! … promoted … [2s]" returned after **18 s**; apex served `index-DAtVcX_d.js` **19 s** after `t1` |
| post-drill | served JS sha256 `2269b971…` ✔ · aliases on `dpl_HWeN…` = matchcutdaily.com + 2 ✔ |
| P4 step 1 re-run | 21:34:06Z — verbatim green again (`p5-post-drill-verify-preview-security-prod.txt`); second test event |

## P6 — this commit

`.github/workflows/prod-smoke.yml` + `prod-canary.yml` crons uncommented ·
runbook §2.0 item 2 rewritten (no longer stale), §2.1 ids, §2.5 ids/roles +
drill record · `docs/production-release-checklist.md` rollback paragraph +
"Quiet production release" boxes ticked with pointers + rollback-drill box ·
this receipt · evidence force-added (≤ 6 PNGs). No source, dependency, or
Vercel change. After merge: `gh workflow run prod-smoke.yml` once by hand
(result appended below), then memory.

## Still NOT approved / NOT run

`noindex` removal · URL-in-share · robots/sitemap · front door (Approval 5,
~09-20 after soak) · `playmatchcut.com` attachment (D7, dashboard) · plan change
· any `DAILY_EPOCH` move (D6 closed: keep). Attended lanes A–E may now target
production (`docs/daily-duel-216-attended-lanes-scheduling-goal-prompt.md`).
Freeze: no deploys/DNS/settings 72 h before 2026-09-27.
