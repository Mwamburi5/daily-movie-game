# P0 — baseline (Approval 4, recorded 2026-09-04 09:01–09:10 EDT)

| item | value |
|---|---|
| `origin/main` | `9a5fdbbc3976490aa941e4936b064c7416c1d0bc` (fetched 09:01 EDT; local `main` = HEAD = same) |
| local tree | clean apart from the untracked promo family (`docs/promo-execution-prompts.md`, `promo/` 15 files) + the untracked kickoff prompt `docs/daily-duel-216-production-deploy-kickoff-prompt.md` |
| promo fingerprints | `docs/promo-execution-prompts.md` sha256 `551e55f3b972e1670203c87f81d35605dc444e7a14b8cab2189f65a80839a762` · `promo/` (15 files, sorted sha256 list) → `5f674dd78547ec5501e3edf3ee9d2452216c550ced0cb9a1fc9ca458bbc1ec65` · kickoff prompt `b5d4f87cbe0c61184a53bbb87c2714efb120744ee2a207bce63918a676b3da62` |
| `9a5fdbb` vs `b08d8db` | docs-only: `docs/prelaunch-polish-kickoff-prompt.md` +73 (the #13 receipt) |
| CI on `9a5fdbb` | run 33829755130 — **failure at build-and-budgets → "Audit dependency advisories"**: `npm warn audit 503 Service Unavailable - POST https://registry.npmjs.org/-/npm/v1/security/advisories/bulk` (registry outage, the flake logged in the polish receipt follow-up #3). duel-rules / connections-rules / daily-rules ✅; browser-smoke skipped (needs the build job). **Re-run of the failed job at 09:08 EDT** (`gh run rerun 33829755130 --failed`) → **success** at ~09:22 EDT: build-and-budgets (incl. audit) ✅ · browser-smoke ✅ · rules jobs ✅ → exact-SHA CI GREEN on `9a5fdbb`. |
| CI on `b08d8db` (last code-bearing ancestor) | run 33826836354 — **success**, all six jobs (build-and-budgets incl. audit ✅ · daily-rules ✅ · duel-rules ✅ · connections-rules ✅ · browser-smoke ✅ · dependency-review skipped, push norm) |
| Node / npm | `/usr/local/bin/node` v24.14.0 · npm 11.9.0 (PATH prefix) |
| `gh` | logged in as Mwamburi5 (scopes gist, read:org, repo, workflow) |
| Playwright | `@playwright/test` ^1.62.1 · Chromium 1208 + 1234 + headless-shell present |
| `vercel whoami` | `mwamburi5` (Vercel CLI 59.11.1 via npx; token refreshed 09:03 EDT) |
| project link | `.vercel/project.json` → `marquee` (`prj_pulSUCbmLIthysHhzWGGtVIajIgm`, team `team_yyOr5zARz3GhouJJyMunDA4x`) |
| production HTTP | `HTTP/2 200` on `https://matchcutdaily.com`; 9 security headers present (CSP, COOP, CORP, HSTS max-age=63072000, nosniff, DENY, referrer-policy, permissions-policy, dns-prefetch-control off) |
| served assets (pre-deploy) | `assets/index-Ch7qjnS-.js` + `assets/index-BGXpqkZ5.css` |
| production deployment id | `dpl_8SighytERqgygRYvbf1eMyLis6SL` = `marquee-g16l914b4-mwamburi5s-projects.vercel.app`, target production, Ready, created 2026-08-18 23:53 EDT; aliases matchcutdaily.com · marquee-one-iota.vercel.app · marquee-mwamburi5s-projects.vercel.app |
| `vercel ls` head | 3d Preview `marquee-otlnd4c6f` (Approval-3, Ready) · 16d Production `marquee-g16l914b4` (Ready) · 16d Previews k3gi9nq6y / n2jdc356h (Ready) · ltdwdk3bh (Error) · 26d/27d older Productions |
| robots meta | `grep -c 'name="robots"'` = 1 (noindex on) |
| `www` | `HTTP/2 307` → apex |
| `http` | `HTTP/1.0 308` → `https://matchcutdaily.com/` |
| TLS cert | `CN=*.matchcutdaily.com` · notBefore 2026-07-05 · **notAfter 2026-10-03 02:34:59 GMT** (auto-renew check ~09-20 per review D) |
| `/social-preview.png` on old build | 404 (expected; ships with the new build) |
| time / timing rules | 2026-09-04 09:01 EDT (America/New_York) — 15 h from local midnight; 23 days before 09-27 (≥ 7 required); recommended window 09-04/05 ✔ |
| D6 `DAILY_EPOCH` | `src/lib/progress.ts:24` = `'2026-07-04'` — no ruling was on record at P0; **Buri ruled KEEP `2026-07-04` in-session at ~09:15 EDT** ("day 86" on 09-27 stands; no source edit; deploy SHA unchanged) → precondition 2 met. Buri confirmed availability for the jar mint + first hour. |
