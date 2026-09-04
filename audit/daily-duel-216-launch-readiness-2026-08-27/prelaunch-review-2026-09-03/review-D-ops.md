# Review D — launch-operations readiness audit

Read-only audit, 2026-09-03. Repo `/Users/mwamburi/Projects/Daily Movie Game`.
No repo writes, no git writes, no builds, no deploys, no `vercel` CLI, no Vercel
API. Production traffic: plain HEAD/GET + DNS/TLS lookups only.

Baseline confirmed at audit time: production serves the **old `c063f26` build**
(prod `index.html` title is bare `Match Cut`, no og/twitter/canonical/description
tags, still preloads the three fonts, assets `index-Ch7qjnS-.js` /
`index-BGXpqkZ5.css`). The candidate `origin/main@14a546e` ships all of that.

---

## 0. Three things that block or distort Approval 4 as currently written

Read these first; §2 has the detail.

1. **The SHA in the runbook can no longer pass its own gate.**
   `main@14a546e` carries the pre-`npm audit fix` lockfile (browserslist 4.28.2,
   GHSA-c83g-rgw3-j3cx + GHSA-73wf-gq98-2v4g, published 2026-09-01T16:42Z). The
   release checklist and CI both require `npm audit` clean. The fix exists only
   on `codex/preview-gate-skip-toolbar@6b758b0`, **unmerged**. So today there is
   no SHA that is simultaneously (a) on `main`, (b) audit-clean, and (c) the
   Preview-verified one. Buri must pick a resolution before deploying.
2. **The runbook's deploy command would deploy the wrong bytes.**
   `vercel deploy --prod` "from the linked project" means the working tree.
   `.vercelignore` does **not** exclude `promo/` (615 K, untracked), `output/`
   (103 M), `design/`, `tools/`, `dist-e2e/`. Those become deployment inputs, and
   Tailwind 4 source detection scans them — the exact mechanism the Preview
   receipt documented for `docs/*.md` producing 21 extra CSS utilities and a
   different CSS hash. The Preview was deployed from a **clean scratchpad clone**;
   the runbook never says prod must be too.
3. **The 216-card cutover deal has never been exercised anywhere.**
   `DAILY_DUEL_POOL_EFFECTIVE_DATE = '2026-09-27'` (`src/data/duelPool.ts:166`).
   The P3 matrix played the `2026-09-02` deal, which the receipt itself flags as
   "dealt from the legacy pool… this matrix certifies the merged app, not the
   cutover deal itself." Launch morning is the first time the 216 pool deals in
   production. See §5 for the clock-shifted dress rehearsal that closes this.

---

## 1. Consolidated launch-day checklist state

Legend — **V** verified with evidence · **C** checkable now (I checked it;
result in the Evidence column) · **B** Buri-only (dashboard / account /
registrar / human) · **G** gap, nobody has this yet.

### 1a. Repository / build contract

| # | Item | Source | State | Evidence |
|---|---|---|---|---|
| 1 | Candidate identity recorded | release-checklist §Candidate | V | `origin/main` = `14a546e79ae1af3206e470f8f555d74257ff3a58`; `git diff --stat origin/main HEAD` = 2 files (`package-lock.json`, `scripts/verify-preview-security.mjs`) |
| 2 | Local matrix 64/64 · 8/8 · 42/42 · 14/14 · smoke · build · bundle · security · diff | release-checklist §Local gates | V | recorded 2026-08-31 (Node 24 full matrix) + re-run of `check:security` (285 repo / 25 prod files) and `git diff --check` in the Preview receipt P2 |
| 3 | `npm audit` zero vulnerabilities | security-checklist §Automated | **G** | true on `6b758b0`, **false on `14a546e`** — CI run 33573643361 red at "Audit dependency advisories"; run 33699865177 green only on `6b758b0` |
| 4 | Exact-SHA CI green | release-checklist §Source-control | V (for `6b758b0`) / **G** (for `14a546e` today) | runs 33501320800 / 33503913820 / 33503909712 green on the merged SHAs at 11:43Z 2026-09-01, i.e. **before** the advisories published at 16:42Z |
| 5 | Workflow actions pinned to 40-char SHAs | `check:security` | V | `.github/workflows/ci.yml` — `actions/checkout@3d3c42e5…`, `actions/setup-node@82076278…`, `dependency-review-action@a1d282b3…` |
| 6 | `vercel.json` matches `security-headers.ts` byte-for-byte | `check:security` lines 19-28 | V | compared by hand: all 9 keys and the full CSP string identical |
| 7 | No inline script in `index.html` | `check:security` | V | only `<script type="module" src="/src/main.tsx">` |
| 8 | Dependabot npm + actions weekly | `.github/dependabot.yml` | V | committed; *recognition* by GitHub is B |
| 9 | No posters / images of people shipped | project rule | V | `public/` = 3 icons (ticket-stub mark), `tmdb-logo.svg`, `social-preview.{png,svg}`; the SVG is 100% type + vector (`grep -c "<image\|xlink:href"` → 0) and the PNG is its raster. `dist/assets/` images are 3 `.webp` illustrations, no photography. Nothing depicting a real person or a film poster |

### 1b. Edge / production surface (all checked live today)

| # | Item | State | Evidence (command → result) |
|---|---|---|---|
| 10 | Apex HTTPS 200 | V/C | `curl -I https://matchcutdaily.com` → `HTTP/2 200`, `x-vercel-cache: HIT`, `server: Vercel` |
| 11 | 9/9 security headers live on prod | V/C | header dump matches `security-headers.ts` exactly — CSP string, COOP `same-origin`, CORP `same-origin`, Permissions-Policy (14 features), `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, `X-DNS-Prefetch-Control: off`, `X-Frame-Options: DENY`, `X-XSS-Protection: 0` |
| 12 | Headers also on hashed assets | V/C | `curl -I …/assets/index-Ch7qjnS-.js` → 200 + full CSP + HSTS + nosniff |
| 13 | HTTP → HTTPS | V/C | `curl -I http://matchcutdaily.com` → `308 → https://matchcutdaily.com/` |
| 14 | `www` → apex | V/C | `curl -I https://www.matchcutdaily.com` → `307 → https://matchcutdaily.com/` |
| 15 | HSTS present | V/C | `strict-transport-security: max-age=63072000` — **no `includeSubDomains`, no `preload`** (so not preload-list eligible; see QW-7) |
| 16 | TLS valid | V/C | `openssl s_client` → `CN=*.matchcutdaily.com`, SAN `*.matchcutdaily.com, matchcutdaily.com`, Let's Encrypt, `notAfter Oct 3 02:34:59 2026 GMT` — **6 days after launch**; Vercel auto-renews, but see §6 QW-11 |
| 17 | Vercel nameservers | V/C | `dig NS matchcutdaily.com @1.1.1.1` → `ns1/ns2.vercel-dns.com` |
| 18 | Two independent resolvers agree | V/C | `@1.1.1.1` → `64.29.17.65, 216.198.79.1`; `@8.8.8.8` → `216.198.79.1, 216.198.79.65`; both NS = vercel-dns (anycast pool rotation, same delegation) |
| 19 | CAA present | V/C | `dig CAA` → `0 issue "letsencrypt.org"`, `"pki.goog"`, `"sectigo.com"` (Vercel's default triple) — the security checklist's "review before adding CAA" item is already satisfied by the provider default |
| 20 | DNSSEC | **B** | `dig DS matchcutdaily.com` → empty; `dig DNSKEY` → empty. Unsigned. Registrar+Vercel attended change only |
| 21 | No stray MX/TXT | V/C | `dig MX`, `dig TXT` → empty on both domains |
| 22 | `noindex, nofollow` still present on prod | V/C | prod `index.html` line 14 |
| 23 | Insights endpoint live | V/C | `curl -o/dev/null -w %{http_code} https://matchcutdaily.com/_vercel/insights/script.js` → `200` |
| 24 | `/robots.txt` | **G** | → `404`. No robots.txt, no `X-Robots-Tag`. `git ls-tree -r origin/main` has none either. The meta tag is the only robots control |
| 25 | `/sitemap.xml` | **G** | → `404`, none in repo |
| 26 | Web app manifest | **G** | → `/site.webmanifest` 404, `/manifest.json` 404, and `index.html` has **no `<link rel="manifest">`** — yet the CSP spends a `manifest-src 'self'` directive on it. Cosmetic inconsistency + a missed Add-to-Home-Screen surface |
| 27 | `/social-preview.png` | **G today, fixed by candidate** | prod → `404` (prod HTML doesn't reference it either). `git ls-tree origin/main public/` **does** contain `social-preview.png` + `.svg`, and `origin/main:index.html` references `https://matchcutdaily.com/social-preview.png` at og:image and twitter:image. Approval 4 closes the promo track's 404 note |
| 28 | `/.well-known/security.txt` | **G** | → `404`. RFC 9116 file absent |
| 29 | Icons | V/C | `/favicon.svg` 200, `/favicon-32.png` 200, `/apple-touch-icon.png` 200, `/tmdb-logo.svg` 200 |
| 30 | Unknown deep link | V/C | `/daily` → `404` (no SPA rewrite). Correct today — `App.tsx` has no router, only a dev-only `?mode=` boot param |
| 31 | Hashed-asset caching | **G** | `cache-control: public, max-age=0, must-revalidate` **on content-hashed `/assets/*`**. Every warm repeat revalidates. Directly undermines release-checklist "warm-repeat budgets pass". See QW-2 |
| 32 | `playmatchcut.com` state | **G** | `https://playmatchcut.com` → **`HTTP/2 404`, `x-vercel-error: DEPLOYMENT_NOT_FOUND`**. `http://` → 308 to https (then 404). `www.playmatchcut.com` → 404. DNS is on Vercel NS with A records `64.29.17.65 / 64.29.17.1`, CAA present, but the domain is **attached to no project**. A bought launch domain currently serves a Vercel error page under HSTS. The security checklist says it should be "in its explicitly approved parked/redirected state" — a raw platform 404 is not that |

### 1c. Product / attended gates

| # | Item | State | Evidence |
|---|---|---|---|
| 33 | Chromium keyboard/focus/Escape/touch/drag/reduced-motion | V | attended-acceptance lane 1, PASS 10/10 |
| 34 | WebKit four-mode smoke | V | lane 2, PASS 4/4, `output/playwright/launch-readiness/webkit-smoke-receipt.json` |
| 35 | 200% zoom / text enlargement | V | lane 3, PASS 9/9, `zoom200-receipt.json` |
| 36 | Attended desktop Safari (lane A) | **B** | `ATTENDED NOT RUN` |
| 37 | Real iPhone Safari (lane B) | **B** | `ATTENDED NOT RUN` |
| 38 | Real Android Chrome (lane C) | **B** | `ATTENDED NOT RUN` |
| 39 | VoiceOver end-to-end (lane D) | **B** | `ATTENDED NOT RUN` |
| 40 | TalkBack end-to-end (lane E) | **B** | `ATTENDED NOT RUN` |
| 41 | Protected-Preview verification | V | `verify:preview-security` 9/9 headers, 0 CSP violations, 0 console faults, insights 200, event 200, no seams/sourcemap — Preview `marquee-otlnd4c6f…`, `dpl_FTnTRXPKr4V1Hyz8Fu68AfPymr75`, `meta.githubCommitSha = 14a546e…` read back from the API |
| 42 | Four-mode Preview matrix | V | P3, 2026-09-03T01:25Z, all four modes load/action/error/terminal/share PASS, 2 sanitized-progress rows PASS, **0 faults** |
| 43 | Iframe-embed block test | **G** | still unchecked in the security checklist, though `X-Frame-Options: DENY` + `frame-ancestors 'none'` are live on prod (checked, #11) — a 2-minute check nobody has run |
| 44 | 216 cutover deal exercised | **G** | never — see §0.3 |

### 1d. Operational launch gate (release-checklist §Operational)

| # | Item | State | Note |
|---|---|---|---|
| 45 | Error monitoring + alert route exercised | **G** | **No error monitoring of any kind exists.** `grep -rniE "uptime|sentry|cron|schedule:"` over `.github`, `scripts`, `src`, `vercel.json` → only the two Dependabot schedules. No Sentry, no cron workflow, no `vercel.json` crons |
| 46 | Web Vitals arrive in dashboard | **B** | dashboard-only |
| 47 | `mode_start` / `mode_finish` / `share` received (not queued) | **B + blocked** | **Team plan = `hobby`** (Preview receipt side-findings). Hobby has *no custom events at all* — page views only. All nine journey events are inert in production until the plan question is settled. The 3-property cap question (checkpoint §6) is downstream of that |
| 48 | Spend alert + hard ceiling | **B** | dashboard-only, never configured |
| 49 | One-command rollback documented + drill | **G/B** | *Documented inconsistently* (§2.5) and **never drilled** |
| 50 | Privacy/retention language + credits published | V (in-app) | `HowToPlay.tsx:346-396` — support card + `What this site saves and measures` `<details>` + TMDB logo/attribution. Asserted by `tests/browser/delivery-smoke.spec.ts:970-984`. Not published anywhere outside the app (no `/privacy` page) |
| 51 | TMDB commercial-use terms | **B** | pre-monetization only; not a 09-27 blocker |
| 52 | Cold-4G / warm-repeat budgets on final graph | partial | `check:bundle` green, but menu shell is at **99.85 / 100 KiB gzip** — effectively zero headroom (security-checklist local receipt 2026-08-31). Warm-repeat is undermined by #31 |
| 53 | Vercel account MFA / member hygiene / token cleanup | **B** | all unchecked |
| 54 | GitHub MFA, `main` ruleset, secret scanning + push protection, Actions token read-only, allowed-actions policy | **B** | all unchecked. Note: `permissions: contents: read` **is** set at the workflow level in `ci.yml` — the repo-default setting is still B |
| 55 | Registrar MFA, auto-renew, transfer lock, expiry alerts, DNS backup | **B** | all unchecked |
| 56 | Rollback target recorded | **stale** | release-checklist names `dpl_7Mk27AwKQ8vcN3CUPj666kfCPNx9` (recorded 2026-08-19 as the *predecessor* of current prod). After Approval 4 the correct target is **`dpl_8SighytERqgygRYvbf1eMyLis6SL`** (the live `c063f26` build) |

**Score:** 24 verified/checked · 4 checkable-but-nobody-checked (43, plus the
three 404s that are decisions not defects) · 18 Buri-only · **10 real gaps**
(3, 4, 24, 25, 26, 28, 31, 32, 44, 45).

---

## 2. Deploy-procedure gaps — reading the runbook as if executing tomorrow

The runbook (`docs/daily-duel-216-deploy-and-indexing-runbook.md` §2) is 6 steps
and ~25 lines. Executing it literally would produce a deploy that fails its own
release checklist. Ranked gaps:

### 2.1 — The candidate SHA is unresolved (blocker)

The runbook precondition is "clean `main`/`14a546e`". That tree fails
`npm audit`, which is both a release-checklist local gate and CI job
`build-and-budgets`. The fix commit `6b758b0` is on
`codex/preview-gate-skip-toolbar`, two commits over main, CI-green, **unmerged**.

Buri has three coherent options; the runbook offers none:

| Option | What ships | Cost | Risk |
|---|---|---|---|
| **A. Merge the branch to `main`, deploy the new merge SHA** | `6b758b0` content = `14a546e` app code + audit-clean lockfile + the Preview-gate harness edit | one PR/merge + one CI run | The deployed SHA is *not* the Preview-verified SHA. Mitigated: the receipt records that a rebuild with the bumped lockfile is **byte-identical** (`index-Bzdp8_FV.js` / `index-D10AJD7P.css` unchanged) — but that was measured on the *local-drift* build, so re-confirm against the `.vercelignore`-clean rebuild hashes (`2d76e269…` / `c4e9af1a…`) before claiming byte-parity |
| **B. Deploy `14a546e`, waive `npm audit`** | exactly the Preview-verified tree | zero | ships a lockfile with two high advisories in a **build-time-only** dep chain (`@vitejs/plugin-react → @babel/core → browserslist`; never in the bundle). Defensible, but it breaks the "green gates before deploy" discipline and leaves `main` permanently CI-red |
| **C. Cherry-pick only `6b758b0` onto `main`** | audit-clean, no harness edit | one commit + CI | leaves the Preview gate unable to pass on `main` (the toolbar assertion), so a future Preview re-verification needs the edit anyway |

I would recommend **A**, with a byte-parity re-confirmation, because it is the
only option that leaves `main` green and deployable afterwards.

### 2.2 — No clean-clone instruction (would ship different bytes)

The runbook says `vercel deploy --prod` "from the linked project". `.vercelignore`
excludes `audit/ Feedback Screenshots*/ .agents/ .codex/ design_handoff_the_stub/
docs/ sim/ scripts/ *.md` — and **nothing else**. Not excluded and present in the
working tree: `promo/` (615 K untracked), `output/` (103 M), `design/` (2.2 M),
`tools/` (1.9 M), `dist-e2e/` (1.2 M), `.playwright-cli/`. When `.vercelignore`
exists, Vercel uses it *instead of* `.gitignore`, so all of that uploads, and
Tailwind 4's automatic source detection scans it — the receipt already proved
this mechanism changes the CSS hash (21 extra utilities from `docs/*.md`).

**Missing exact procedure (write this into the runbook):**

```bash
export PATH=/usr/local/bin:$PATH                    # Node 24
SHA=<the approved SHA>
WORK=$(mktemp -d)/matchcut-$SHA
git clone --branch main https://github.com/Mwamburi5/daily-movie-game "$WORK"
cd "$WORK" && git rev-parse HEAD                    # MUST equal $SHA
git status --porcelain                              # MUST be empty
cp "/Users/mwamburi/Projects/Daily Movie Game/.vercel/project.json" .vercel/project.json
npx --yes vercel@59.11.1 whoami                     # refreshes the stored token — do this FIRST
npx --yes vercel@59.11.1 deploy --prod --yes
```

Two details the runbook omits that this session learned the hard way:
the CLI is not on PATH (`npx --yes vercel@59.11.1` is the pattern), and **the
stored access token expires** — P3's first retry failed only because of a stale
token; any `vercel` command refreshes it. Run `whoami` before the deploy, not
after it fails.

### 2.3 — "Confirm the served SHA" is asserted, not specified

Step 2 says "record the `dpl_…` id"; step 3 says "hashed-asset/SHA linkage to
`14a546e`". No method. The Preview established two that work:

1. **Provenance:** the CLI stamps git metadata from the clone, so
   `npx vercel inspect <deployment-url>` (or the deployments API) reports
   `meta.githubCommitSha`. Read it back — never self-assert.
2. **Content:** rebuild the clean clone *with the `.vercelignore` paths removed*
   and compare `sha256` of the served `/assets/index-*.js` and `index-*.css`
   against the local build. Expected on this candidate:
   `2d76e26935ea3d09…` (JS) / `c4e9af1acaa7e51c…` (CSS). A plain in-tree build
   gives `index-Bzdp8_FV.js` / `index-D10AJD7P.css` and will **not** match —
   that's the Tailwind drift, not a deploy fault. The runbook must say so or
   the next operator will call a green deploy red.

### 2.4 — The existing gates are never pointed at production

Neither the runbook nor the release checklist names a tool for
"production headers + CSP byte-match the tested Preview" or "live four-mode
matrix". Both tools already exist and work against an unprotected origin:

```bash
# post-deploy header/CSP/analytics/hygiene gate — same 9/9 assertions as Preview,
# no cookie jar needed (prod is not SSO-protected, and gets no Toolbar injection)
PATH=/usr/local/bin:$PATH npm run verify:preview-security -- --url=https://matchcutdaily.com

# live four-mode matrix, real UI play, deals recomputed from src/lib and
# cross-checked against the DOM before play
PATH=/usr/local/bin:$PATH node <scratchpad>/p3-matrix.mjs \
  --base=https://matchcutdaily.com --out=<evidence-dir> --tag=prod
```

Caveat to state in the runbook: `verify:preview-security` **fires a real
analytics event** named `goal4_security_preview` into production. That is
actually the release checklist's "deliberate non-user-impacting test event"
item (#45) — so name it as such rather than tripping over it.
`p3-matrix.mjs` is scratchpad-only and hardcodes
`ROOT = '/Users/mwamburi/Projects/Daily Movie Game'`; if it is to survive as the
production gate it needs to move into `scripts/` with a `--root` flag (see QW-4).

### 2.5 — Rollback is documented three different ways and never drilled

| Source | Says |
|---|---|
| release-checklist §Existing production baseline | target `dpl_7Mk27AwKQ8vcN3CUPj666kfCPNx9`, command `vercel rollback <deployment-id-or-url>` |
| runbook §2 step 5 | "instant redeploy of the previous production deployment (`c063f26`-era `dpl_`) **from the Vercel dashboard**" |
| checkpoint §13 | "redeploy-previous on Vercel, unchanged from the release checklist" |

Three problems: (a) the recorded id is the deployment *before* the current one —
after Approval 4 the correct target is `dpl_8SighytERqgygRYvbf1eMyLis6SL`;
(b) CLI vs dashboard is unresolved, and the CLI is not installed; (c) **no drill
has ever run**, so the elapsed time is unknown. Specify:

```bash
npx --yes vercel@59.11.1 rollback dpl_8SighytERqgygRYvbf1eMyLis6SL --yes
# then, within 60s:
curl -sI https://matchcutdaily.com | head -1
curl -s  https://matchcutdaily.com | grep -o 'assets/index-[^"]*\.js'   # must be index-Ch7qjnS-.js
```

Drill it **on the Preview-era deployment before Approval 4**, or immediately
after the prod deploy while nobody is watching, and record the wall-clock.

### 2.6 — No timing, no watch plan, no abort criteria

Missing entirely: (a) deploy **at least a week before 09-27**, not on launch
morning, so the soak has time — the runbook says "soak begins at this point" but
sets no length; (b) never deploy within ~2 h of local midnight, because
`localDateSeed()` uses the browser's *local* date and the daily rolls at each
player's midnight; (c) who watches what in the first hour. Concretely, first-hour
watch list: `curl -sI` the apex every 10 min (expect 200 + 9 headers),
one manual play of each mode, the browser console on a real phone, and the
Vercel deployment log for function/edge errors. Abort criteria are already
written — release-checklist §Rollback triggers — but the runbook never points
at them.

### 2.7 — Smaller omissions

- No instruction to update `docs/production-release-checklist.md` with the new
  rollback target after the deploy (item #56 goes stale the moment you deploy).
- Runbook §1's plan verdict is stale in one direction: it says "Buri names the
  plan", but the Preview receipt already read `billing.plan = hobby` from the
  API. The verdict is therefore **decided**: on Hobby, *zero* custom events
  record, not just the third property. Step 4's "confirm the three-property
  events surface" will find nothing. Fold this into the runbook.
- No mention that `.vercel/project.json` must be copied into the clean clone
  (the Preview receipt did it; the runbook doesn't say to).

---

## 3. Approval 5 — indexing / launch switches, as minimal diffs

Three independent switches. Runbook §3 covers them; corrections and verification
steps below.

### 3a. Remove `noindex` — 2-line diff, plus a test the runbook missed

```diff
--- a/index.html
+++ b/index.html
@@
-    <!-- Quiet phase (WS1): keep the alias out of search indexes until launch. -->
-    <meta name="robots" content="noindex, nofollow" />
```

**Runbook gap:** it says "no `robots.txt`, no `X-Robots-Tag` anywhere — this meta
is the only robots control" (confirmed correct, #24) but does **not** mention
that the meta is test-asserted:

```
tests/browser/delivery-smoke.spec.ts:76
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
```

Deleting the meta without editing line 76 turns `npm run test:smoke` red — and
`goal-5-public-launch-acceptance.md` explicitly requires "update its automated
assertion in the same patch." So the diff is **two files**. Recommended
replacement assertion (keeps the surface guarded rather than unguarded):

```diff
-  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
+  // Public launch: no robots meta at all — indexing is allowed by default.
+  await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
```

Verify after deploy: `curl -s https://matchcutdaily.com | grep -c 'name="robots"'`
→ `0`; `curl -sI https://matchcutdaily.com | grep -i x-robots-tag` → empty;
then Search Console URL Inspection (B). One-way in practice.

### 3b. URL in share — 1-line diff; runbook **overstates** the blast radius

```diff
--- a/src/lib/share.ts
+++ b/src/lib/share.ts
@@
-  return `Match Cut · ${mode}\n${scoreLine}\n${emoji}`
+  return `Match Cut · ${mode}\n${scoreLine}\n${emoji}\nmatchcutdaily.com`
```

The runbook warns this will break "the share-format assertions in
`tests/browser/delivery-smoke.spec.ts`". **It won't.** The only share assertion
is `verifyShareAndReturn` at line 532-540, which does
`expect.poll(…clipboard.readText()).toContain(sharePrefix)` where `sharePrefix`
is `'Match Cut · Daily Puzzle'` etc. `toContain` on a prefix is unaffected by an
appended line. Run smoke anyway, but don't budget for a test rewrite.

The runbook's *real* catch stands: `matchCutShare` is shared by all four modes
including the `practice · ` score-line prefix, so practice runs get the URL too.
That's almost certainly wanted (the URL is the invite, practice or not) — but it
is a decision, not an accident. Also update RULEBOOK.md if it prints the
three-line share shape.

Verify: `npm run test:smoke`, then one real production share per mode
(p3-matrix.mjs asserts URL-free today — its assertion needs inverting at the
same time, or the prod matrix goes red).

### 3c. Front door — correctly deferred, no seam

`src/App.tsx:23` `type Mode = 'menu' | 'solo' | 'duel' | 'chronology' | 'connections'`,
`:49` `useState<Mode>` defaulting to `'menu'` with a dev-only `?mode=` boot param
(`:51`). Confirmed: there is no production seam to flip. Runbook is right to hold
this for the 2-week interviews. Nothing to spec now.

### 3d. Social tags — already correct on the candidate, nothing to flip

`origin/main:index.html` ships canonical, description, og:type/site_name/title/
description/url/image(+width/height/alt), twitter:card=summary_large_image/
title/description/image/alt, all pointing at `https://matchcutdaily.com/`, and
`public/social-preview.png` (1200×630) is tracked. `delivery-smoke.spec.ts:75-79`
asserts canonical, og:url and og:image. **These ship with Approval 4, not
Approval 5** — the unfurl is ready the day prod moves off `c063f26`. Only
caveat: some crawlers cache a `noindex` response, so unfurls may lag 3a.

### 3e. Not in the runbook but part of "search metadata reviewed together"

The release checklist's public-launch item says "Search metadata, canonical URL,
**robots behavior**, social cards, and public analytics/privacy language are
reviewed together." That implies a `robots.txt` and a `sitemap.xml` decision
(#24, #25) which the runbook never inventories. See QW-1.

---

## 4. Support & privacy on day one

| Question | Answer | Evidence |
|---|---|---|
| Is support reachable from the app? | **Yes.** Help & privacy panel → "Open public GitHub support" → `https://github.com/Mwamburi5/daily-movie-game/issues/new/choose`, `target=_blank`, `aria-label` announces the new tab | `src/components/HowToPlay.tsx:214, 346-362`; asserted at `delivery-smoke.spec.ts:970-972` |
| Are the templates safe? | **Yes.** Three templates (`bad-movie-data`, `accessibility-trouble`, `broken-game`), each opening with a "This report is public — do not include personal information" HTML comment, collecting only mode/what-happened/expected/steps/optional device category/optional screenshot. No labels, no assignees, no PII fields | `.github/ISSUE_TEMPLATE/*.md` (read in full) |
| Is there an email path? | **No, by design.** Checkpoint §4: "Interim public route, not a private help desk; no support email exists or is claimed." The in-app copy says so plainly | checkpoint §4 |
| Is the privacy disclosure accurate? | **Yes, and it is unusually precise.** It names localStorage meta-state (per-mode streaks, played-today, personal bests, Duel record) and states it doesn't affect deals or rules — matches the project's persistence guardrail. It names Vercel Web Analytics, the provider-context fields, cookieless + 24 h dedup session, and explicitly disclaims movie/person choices, typed text, name, email, persistent cross-day ID, identity export/drain, D1/D7 | checkpoint §5; five clauses asserted at `delivery-smoke.spec.ts:980-984` |
| …with one wrinkle | On **Hobby**, the journey custom events don't record at all. The disclosure says analytics "records anonymous page views **and a small set of journey events**". On launch day that over-states what is collected — harmless direction (claims more collection than happens), but it becomes *under*-stated the moment Buri upgrades the plan mid-flight without re-reading it | Preview receipt side-findings; §5 disclosure text |
| Is TMDB attribution visible? | **Yes.** Logo + the required sentence, in the shared Help panel, on every mode | `HowToPlay.tsx:392-396`, `data-tmdb-attribution`; `/tmdb-logo.svg` 200 on prod |
| Any copyright surface? | **None found.** No posters, no photographs of people, anywhere in `public/` or `dist/`. `public/` = ticket-stub favicon set, TMDB logo, and the type-only `social-preview.svg`/`.png`. `dist/assets/` = 3 abstract `.webp` illustrations (`chronology-filmstrip`, `solo-spotlight`, `solo-ticket-rack`). Card faces are typographic per the 2026-07-06 ruling | `file public/*`, `grep -c "<image\|xlink:href" public/social-preview.svg` → 0, `find dist -type f -name '*.png' -o …` |
| Gaps | (a) No public privacy page — the disclosure lives only inside a `<details>` behind Help, so there is no URL to link from an app-store listing, a social bio, or a takedown reply. (b) No `security.txt` → a security reporter has no route except a public issue, which is the wrong channel for a vulnerability. (c) The support path requires a GitHub account, which will filter out most real players; acceptable as stated, but it means **inbound bug reports are not a monitoring channel** |

---

## 5. Monitoring & rollback — what tells Buri the daily broke on 09-27

**Today: nothing.** No error monitoring, no uptime check, no cron, no alerting.
`grep -rniE "uptime|sentry|cron|schedule:|monitoring"` over `.github/`,
`scripts/`, `src/`, `vercel.json` returns only the two Dependabot schedules.
On Hobby, custom analytics events don't record either, so even a
"`mode_start` count went to zero" signal doesn't exist. If the 216-pool cutover
deals an unsolvable board at 00:00 on 09-27, the first person to know is the
first player who bothers to open a GitHub issue.

### 5.1 The cheapest credible monitor — and it is genuinely cheap

Feasibility is already proven: `p3-matrix.mjs` (scratchpad, 28 KB) drives the
**real production UI with no E2E seams**, recomputing each day's deal in Node
from the same `src/lib` functions the bundle ships and cross-checking against
the DOM before playing. It ran green against the Preview on 2026-09-03 with 0
faults across four modes. Production needs *less* than the Preview did: no
cookie jar, no toolbar header. Two tiers:

**Tier 1 — canary (5 minutes to write, ~2 s/run, no Playwright).**
A `curl`-only workflow, every 30 min:

```yaml
name: prod-canary
on:
  schedule: [{ cron: '*/30 * * * *' }]
  workflow_dispatch:
permissions: { contents: read, issues: write }
jobs:
  canary:
    runs-on: ubuntu-latest
    steps:
      - run: |
          set -euo pipefail
          H=$(curl -sS -D - -o /tmp/body -w '%{http_code}' https://matchcutdaily.com)
          test "$H" = 200
          grep -q 'content-security-policy' <<<"$(tr A-Z a-z </tmp/body)" || true
          A=$(grep -o 'assets/index-[^"]*\.js' /tmp/body | head -1)
          test -n "$A"
          curl -sfS -o /dev/null "https://matchcutdaily.com/$A"
```

Catches: origin down, alias detached, deploy that lost its entry script, TLS
failure, 404 regression. Does **not** catch a broken deal.

**Tier 2 — daily deal smoke (the one that matters on 09-27).**
A second workflow at ~00:20 America/New_York (`cron: '20 4 * * *'` UTC) that
checks out the repo at the deployed SHA, `npm ci`, `npx playwright install
--with-deps chromium`, and runs a promoted `scripts/prod-smoke.mjs` (= today's
`p3-matrix.mjs` with `ROOT` replaced by a `--root` flag) against
`https://matchcutdaily.com`. On failure, `gh issue create` — an email arrives
because GitHub notifies on your own repo's issues; no third-party service, no
account, no spend. ~3-4 min of Actions time/day, inside the free tier.

Two things to get right:
- **Solvability, not just rendering.** The driver already recomputes the deal
  and aborts on DOM mismatch — that is exactly the assertion that catches a bad
  216-pool day. Keep it.
- **Timezone.** The runner is UTC; `localDateSeed()` uses local date. Set
  `TZ: America/New_York` on the job so the runner and Buri agree on "today".

**Alternative if Actions feels heavy:** an external HTTP monitor (any free
uptime service) on the apex plus `/assets/…` gives Tier 1 with zero repo change,
but it can never play the daily. Tier 2 has no external substitute.

### 5.2 The pre-launch dress rehearsal (highest-value single action)

Do not let 09-27 be the first time the 216 pool deals. Before launch, run the
production matrix with the **browser clock shifted to 2026-09-27**. Playwright
1.62 has `context.clock.install({ time })`; `p3-matrix.mjs` currently has no
clock handling (checked — no `clock`/`setSystemTime` in the file), so this is a
~10-line addition next to the existing `newContext` at line 96, plus passing
`--seed=2026-09-27` so the Node-side deal computation matches. Repeat for a few
days after 09-27 (28, 29, 30) to confirm the cutover pool deals cleanly on
consecutive days, not just the boundary one. This is the single cheapest way to
de-risk launch morning.

### 5.3 Rollback drill script

```bash
#!/usr/bin/env bash
# prod-rollback-drill.sh — run BEFORE launch, record the wall-clock.
set -euo pipefail
export PATH=/usr/local/bin:$PATH
PREV=dpl_8SighytERqgygRYvbf1eMyLis6SL          # the c063f26 build; update after each deploy
V="npx --yes vercel@59.11.1"
$V whoami                                       # refresh the stored token first
before=$(curl -s https://matchcutdaily.com | grep -o 'assets/index-[^"]*\.js' | head -1)
echo "before: $before  t0=$(date -u +%H:%M:%S)"
$V rollback "$PREV" --yes
for i in $(seq 1 60); do
  now=$(curl -s https://matchcutdaily.com | grep -o 'assets/index-[^"]*\.js' | head -1)
  [ "$now" != "$before" ] && { echo "rolled back to $now after ${i}s"; break; }
  sleep 1
done
curl -sI https://matchcutdaily.com | head -1    # expect HTTP/2 200
```

Then roll forward the same way and record both durations in the release
checklist. Until this runs, "one-command rollback" is a claim, not a capability.

---

## 6. Quick wins, ranked by value ÷ cost

| # | Win | Value | Cost | Risk | Notes |
|---|---|---|---|---|---|
| **QW-1** | **Add `public/robots.txt` + `public/sitemap.xml`** | High | 10 min | Low | Today both 404. At launch you want `User-agent: *` / `Allow: /` / `Sitemap: https://matchcutdaily.com/sitemap.xml`, and a 1-URL sitemap. Ship them **with Approval 5**, not before (a permissive robots.txt while the meta still says noindex is contradictory but harmless; shipping it *after* is a second deploy). Note `.vercelignore` has `*.md` but not `*.txt`/`*.xml` — `public/` copies through untouched |
| **QW-2** | **`Cache-Control: max-age=31536000, immutable` on `/assets/(.*)`** | High | 10 min | Low | Hashed assets currently revalidate on every warm load (#31). Directly serves the open "warm-repeat budgets" gate and buys back real headroom on a menu shell sitting at 99.85/100 KiB. Safe with `check:security`: it only inspects the `/(.*)` rule (`scripts/check-security.mjs:19-28`), so an added `/assets/(.*)` block passes. Verify with `curl -I` on a hashed asset post-deploy |
| **QW-3** | **Fix the runbook's clean-clone + gate commands** (§2.2, §2.3, §2.4) | High | 20 min | None | Pure doc. Without it the next operator deploys the wrong bytes and can't tell |
| **QW-4** | **Promote `p3-matrix.mjs` to `scripts/prod-smoke.mjs` with `--root`** | High | 30 min | Low | Unlocks §5 Tier 2 *and* the release checklist's "live four-mode matrix" *and* the 09-27 dress rehearsal. It is currently a scratchpad file that will vanish. **This is the highest-leverage engineering item in the whole audit** |
| **QW-5** | **Rollback drill + correct the target id** (§5.3, #56) | High | 20 min | Low | Converts an unproven claim into a measured number. Also unblocks operational gate #49 |
| **QW-6** | **Resolve `playmatchcut.com`** (#32) | Med-High | 5 min (B) | Low | A purchased launch domain serving `DEPLOYMENT_NOT_FOUND` under HSTS. Attach it to `marquee` as a redirect to `matchcutdaily.com` in the Vercel dashboard. Security checklist explicitly says "do not attach or redirect during this goal" — so this needs its own approval, but it should not still be a 404 on 09-27 when it appears in promo material |
| **QW-7** | **HSTS `includeSubDomains` + `preload`** | Med | 5 min + wait | **Med** | Currently `max-age=63072000` only. Preload eligibility needs both flags plus a submission, and `includeSubDomains` is effectively irreversible for two years across *every* subdomain. Only worth it if Buri is certain no non-TLS subdomain will ever be needed. Defensible to skip |
| **QW-8** | **`public/.well-known/security.txt`** (#28) | Med | 5 min | Low | RFC 9116, 4 lines (`Contact:`, `Expires:`, `Preferred-Languages:`, `Canonical:`). Contact can be the GitHub issues URL if there's no email. Gives a vulnerability reporter a non-public-issue route |
| **QW-9** | **Web app manifest** (#26) | Med | 20 min | Low | The CSP already reserves `manifest-src 'self'`; the icons already exist and 200. A 12-line `site.webmanifest` + one `<link rel="manifest">` gives Add-to-Home-Screen, which is the natural install path for a daily-ritual game on phones. Set `display: standalone`, `theme_color: #f4efe6` (matches the existing meta) |
| **QW-10** | **`curl` canary workflow** (§5.1 Tier 1) | Med | 15 min | Low | Cheap insurance even if Tier 2 slips |
| **QW-11** | **Note the TLS renewal window** | Low | 2 min | None | Cert expires 2026-10-03, six days post-launch; Vercel auto-renews ~30 days out (i.e. around now). Not a risk — but put a calendar check on ~09-20 so a silent renewal failure doesn't surface on day 4 of launch |
| **QW-12** | **Run the iframe-embed check** (#43) | Low | 2 min | None | `X-Frame-Options: DENY` + `frame-ancestors 'none'` are live; a local page with an `<iframe src="https://matchcutdaily.com">` closes the last unchecked automated line in the security checklist |
| **QW-13** | **Fix the unpluralised Chronology line** | Low | 5 min | Low | `src/ChronologyGame.tsx:1054` renders "1 strokes" (P3 anomaly, described not fixed). Cosmetic, but it's on a terminal screen players screenshot and share |

Suggested order: QW-3 → QW-1 + QW-2 + QW-8 + QW-9 (one doc pass, one code pass,
one deploy) → QW-4 → QW-5 → §5.2 dress rehearsal → QW-10 → QW-6 (Buri) →
QW-11/12/13. QW-7 only on a deliberate decision.

---

## Least confident

The Hobby-plan consequence is the piece I'd most want double-checked before Buri
acts on it: I'm relying on the Preview receipt's API read of `billing.plan` plus
the runbook's transcription of Vercel's limits table, and I could not verify
either against the live dashboard or Vercel's docs from here. If the "legacy
iteration" Hobby plan grandfathers custom events, then item #47 and the analytics
half of §4 are wrong. I'm also inferring — not proving — that Vercel's
`.vercelignore` fully supersedes `.gitignore` for CLI uploads; the *direction* of
the risk in §2.2 is proven by the receipt's own Tailwind-drift finding, but the
exact set of directories that would upload is inference.

## What Buri might be missing

**The launch-day risk isn't the deploy — it's the 24 days between the deploy and
09-27, during which nothing watches.** Every gate in these documents is a
point-in-time attestation: the Preview was green on 09-03, the matrix played the
09-02 deal, CI was green at 11:43Z on 09-01 and red by 16:42Z the same day when
two advisories published. That last one is the tell — the project's quality bar
is genuinely high, but it is entirely *event-driven*, and launch morning is an
event nobody has scheduled themselves to attend. The 216 pool deals for the first
time at midnight on a date no human or machine has ever played, on a plan where
the analytics that would show a collapse don't record, with a rollback that has
never been rehearsed and whose recorded target id is one deployment stale. None
of those four is hard to fix — §5.2 alone (clock-shift the existing driver to
2026-09-27) is maybe an hour — but each is currently sitting in the gap between
"documented" and "true", and the checklists don't distinguish those two states.
