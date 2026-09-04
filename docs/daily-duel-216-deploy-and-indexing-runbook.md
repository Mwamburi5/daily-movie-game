# Match Cut 216+16 — deploy (Approval 4) + indexing switches (Approval 5) runbook

Written 2026-09-01, post-merge (`main` = `14a546e`), per Buri's sequenced
ruling: everything non-mutating prepared NOW; the production deploy executes
only after the Preview session (Approval 3) reports green; each indexing
switch gets its own later go/no-go.

Revised 2026-09-03 (pre-launch review batch Q-ops, from `review-D-ops.md` §2)
and **committed** from that revision on: §1's plan verdict is now decided
rather than open, and §2 was rewritten because executing the original six
steps literally would have deployed the wrong bytes and had no way to prove
which bytes were served. Production still serves `c063f26`; nothing in this
document has been executed.

## 1. Provider property-cap verdict (checkpoint §6 — docs half, DECIDED)

**Decision D1 (2026-09-03): the plan is Hobby, and we accept it for launch.**
The Approval-3 Preview session read `billing.plan = hobby` back from the
Vercel API, so the verdict below is no longer plan-dependent: on Hobby there
are **no custom events at all**, page views only. All nine journey events in
`src/lib/journeyAnalytics.ts` are inert in production on 09-27; the three-
property question is downstream of a plan upgrade and does not arise. Two
consequences to carry:

- §2's post-deploy step must NOT expect journey events in the dashboard —
  page views are the whole signal. Do not read their absence as a deploy fault.
- The in-app privacy disclosure says analytics records page views "and a small
  set of journey events". On Hobby that over-states collection (harmless
  direction). It becomes an **under**-statement the moment the plan is
  upgraded, so re-read `src/components/HowToPlay.tsx` in the same pass as any
  upgrade.

The original plan-comparison table is kept below as the reference for a future
upgrade decision.

Vercel's limits table (docs.vercel.com, page last updated 2026-08-25):

| | Hobby | Pro | Pro + Web Analytics Plus | Enterprise |
|---|---|---|---|---|
| Custom events | **not included** | included | included | included |
| Properties per custom event | **—** | **2** | **8** | 8 |
| Included events | 50k/mo (page views only) | usage-billed | usage-billed | custom |
| Reporting window | 1 month | 12 months | 24 months | 24 months |

Match Cut's approved dictionary sends **three** properties on `mode_start`
(identity + `session_mode_ordinal`), `first_action` (identity + `action`),
and `friction` (identity + kind/bucket) — `src/lib/journeyAnalytics.ts`.

**Verdict is plan-dependent, and the plan is the one unknown:**

- **Hobby:** custom events don't exist on the plan — ALL nine journey events
  would go unrecorded in production (page views only). The whole Goal 2
  telemetry investment is inert until an upgrade.
- **Pro (base):** custom events record but the cap is 2 properties — the
  third property on those three events is over cap. The custom-events doc
  does NOT define over-cap behavior (dropped property vs dropped event);
  the §6 live-dashboard confirmation at deploy time settles it.
- **Pro + Web Analytics Plus (+$10/mo team):** 8-property cap — the
  dictionary fits with headroom.

Project link: `.vercel/project.json` → project `marquee`
(`prj_pulSUCbmLIthysHhzWGGtVIajIgm`, `team_yyOr5zARz3GhouJJyMunDA4x`).
Per §6, no silent dictionary redesign: an upgrade, the Plus add-on, or an
approved 2-property fold of the dictionary are each a Buri decision BEFORE
treating third properties as production-reportable. Doc limits that apply
everywhere: flat properties only; string/number/boolean/null; 255-char cap on
names, keys, values — the dictionary already complies.

## 2. Production deploy runbook (Approval 4 — HOLD until Buri says deploy)

Rewritten 2026-09-03 from `review-D-ops.md` §2. The previous version was six
lines of intent; this one is executable. Read §2.0 → §2.7 in order and do not
skip §2.2 — a deploy from the working tree ships different bytes than the tree
you tested.

### 2.0 Preconditions (all must hold)

1. Preview receipt green: `docs/daily-duel-216-preview-verification-receipt.md`
   reports `verify:preview-security` verbatim-pass + a four-mode matrix pass on
   a Preview provably serving the candidate SHA.
2. **A candidate SHA that is on `main`, audit-clean, and CI-green.** As of
   2026-09-03 no single SHA is all three: `14a546e` is the Preview-verified
   tree but carries the pre-`npm audit fix` lockfile (browserslist
   GHSA-c83g-rgw3-j3cx / GHSA-73wf-gq98-2v4g, published 2026-09-01T16:42Z), and
   the fix `6b758b0` sits unmerged on `codex/preview-gate-skip-toolbar`.
   Resolve this **before** step 2.2 — the recommended resolution is to merge
   that branch and deploy the merge SHA, re-confirming byte-parity in §2.3
   against the `.vercelignore`-filtered rebuild rather than the local one.
3. §1's Hobby verdict acknowledged (no journey events will appear).
4. Buri's explicit "deploy" for this gate. **This runbook is not that.**
5. Timing rules in §2.6 satisfied.

### 2.1 Record the starting state

```bash
export PATH=/usr/local/bin:$PATH                    # Node 24
curl -sI https://matchcutdaily.com | head -1
curl -s  https://matchcutdaily.com | grep -o 'assets/index-[^"]*\.js' | head -1
```

Write down the current asset name (today: `index-Ch7qjnS-.js`) and the current
production deployment id (today `dpl_8SighytERqgygRYvbf1eMyLis6SL`, the
`c063f26` build). The asset name is how you will tell, in one command, whether
a later rollback actually took effect.

### 2.2 Deploy from a CLEAN CLONE, never the working tree

`.vercelignore` excludes only `audit/`, `Feedback Screenshots*/`, `.agents/`,
`.codex/`, `design_handoff_the_stub/`, `docs/`, `sim/`, `scripts/` and `*.md`.
It does **not** exclude `promo/`, `output/`, `design/`, `tools/`, `dist-e2e/`
or `.playwright-cli/`, and when a `.vercelignore` exists Vercel uses it
*instead of* `.gitignore`. All of that would upload, and Tailwind 4's automatic
source detection scans deployment inputs — the mechanism the Preview receipt
already measured, where local `docs/*.md` added 21 stray utilities and changed
the CSS hash. So:

```bash
export PATH=/usr/local/bin:$PATH                    # Node 24
SHA=<the approved SHA>
WORK=$(mktemp -d)/matchcut-$SHA
git clone --branch main https://github.com/Mwamburi5/daily-movie-game "$WORK"
cd "$WORK"
git rev-parse HEAD                                  # MUST equal $SHA
git status --porcelain                              # MUST be empty
mkdir -p .vercel
cp "/Users/mwamburi/Projects/Daily Movie Game/.vercel/project.json" .vercel/project.json
npx --yes vercel@59.11.1 whoami                     # FIRST — see below
npx --yes vercel@59.11.1 deploy --prod --yes
```

Two details this project learned the hard way:

- The Vercel CLI is **not on PATH**; `npx --yes vercel@59.11.1` is the pattern.
- **The stored access token expires.** The Approval-3 session lost a run to a
  stale token. Any `vercel` command refreshes it, so run `whoami` *before* the
  deploy rather than debugging a failure after it.
- `--prod` is mandatory. Without it you get another Preview; the Approval-3
  Preview was deployed with the same command minus `--prod`.

Record the `dpl_…` id and the production URL the CLI prints.

### 2.3 Prove which bytes are served — two independent reads

Never self-assert the served SHA. Do both:

**(a) Provenance.** The CLI stamps git metadata from the clone, so read it back
from the deployment rather than from your own notes:

```bash
npx --yes vercel@59.11.1 inspect <deployment-url>
# or the deployments API — confirm meta.githubCommitSha === $SHA
```

**(b) Content.** Rebuild the clean clone with the `.vercelignore` paths removed
and `sha256` the served assets against that build:

```bash
curl -s https://matchcutdaily.com | grep -o 'assets/index-[^"]*\.\(js\|css\)'
curl -s https://matchcutdaily.com/assets/<name> | shasum -a 256
```

> **In-tree hashes differ by design.** A plain `npm run build` in the working
> checkout produces *different* asset hashes from the deployment, because
> Tailwind 4 scans files that `.vercelignore` keeps out of the deploy. On the
> `14a546e` candidate the in-tree build gave `index-Bzdp8_FV.js` /
> `index-D10AJD7P.css` while the deployment inputs gave sha256
> `2d76e26935ea3d09…` / `c4e9af1acaa7e51c…`. **Compare against the
> `.vercelignore`-filtered rebuild, not the working-tree build** — otherwise the
> next operator will call a green deploy red.

Also confirm the alias: `matchcutdaily.com` serves the new deployment, `www`
still 307s to the apex, and `http` still 308s to `https`.

### 2.4 Post-deploy gates (run all four, in this order)

```bash
export PATH=/usr/local/bin:$PATH

# 1. Nine security headers + CSP + analytics + hygiene, against production.
#    No cookie jar: production is not SSO-protected and gets no Toolbar
#    injection. NOTE: this fires one real analytics event named
#    `goal4_security_preview` into production. That IS the release checklist's
#    "deliberate non-user-impacting test event" — record it as such rather
#    than treating it as contamination.
npm run verify:preview-security -- --url=https://matchcutdaily.com

# 2. Live four-mode matrix: real play through the shipped UI, with every daily
#    deal recomputed from src/lib and cross-checked against the DOM first.
npm run smoke:prod -- --base=https://matchcutdaily.com --out=<evidence-dir> --tag=prod

# 3. The new caching + static surfaces.
curl -sI https://matchcutdaily.com/assets/<hashed>.js | grep -i 'cache-control'
#    expect: public, max-age=31536000, immutable
curl -sI https://matchcutdaily.com/.well-known/security.txt | head -1   # 200
curl -sI https://matchcutdaily.com/social-preview.png       | head -1   # 200

# 4. The quiet-phase switch is STILL OFF (Approval 5 has not run).
curl -s https://matchcutdaily.com | grep -c 'name="robots"'             # 1
```

Then the dashboard half (Buri, attended): page views arrive; **journey events
will not** (§1, Hobby). Confirm Web Vitals populate.

### 2.5 Rollback — one command, and keep its target current

```bash
export PATH=/usr/local/bin:$PATH
npx --yes vercel@59.11.1 whoami                     # refresh the token first
npx --yes vercel@59.11.1 rollback dpl_8SighytERqgygRYvbf1eMyLis6SL --yes
# then, within 60s:
curl -sI https://matchcutdaily.com | head -1                       # HTTP/2 200
curl -s  https://matchcutdaily.com | grep -o 'assets/index-[^"]*\.js' | head -1
#   must be the PRE-deploy asset name recorded in §2.1 (today index-Ch7qjnS-.js)
```

- **The target above is the CURRENT production deployment**
  (`dpl_8SighytERqgygRYvbf1eMyLis6SL` = the live `c063f26` build), correct as of
  2026-09-03. The release checklist's older `dpl_7Mk27AwKQ8vcN3CUPj666kfCPNx9`
  is that deployment's *predecessor* and is wrong to roll back to.
- **Update this id after every deploy** — the moment Approval 4 lands, the
  correct target becomes the deployment you just replaced. Update it here *and*
  in `docs/production-release-checklist.md` as the last step of the deploy.
- CLI, not dashboard: the dashboard path is fine as a fallback but is not
  the documented one-command rollback.
- **Drill it before you need it.** Either roll back and forward on the
  Approval-3-era deployment before Approval 4, or immediately after the prod
  deploy while nobody is watching, and record both wall-clock durations in the
  release checklist. Until that number exists, "one-command rollback" is a
  claim, not a capability.

### 2.6 Timing rules

- **Deploy at least a week before 2026-09-27**, not on launch morning. The soak
  is the point; a deploy the night before buys nothing and risks everything.
- **Never deploy within ~2 hours of local midnight.** `localDateSeed()` uses the
  browser's *local* date, so the daily rolls at each player's own midnight;
  deploying across that boundary mixes a cutover with a rollover.
- **Freeze for the last 72 hours before 09-27.** No deploys, no DNS changes, no
  Vercel settings changes inside the freeze.
- The 216-film pool first deals on 2026-09-27
  (`DAILY_DUEL_POOL_EFFECTIVE_DATE`). Before deploying, run the clock-shifted
  dress rehearsal so 09-27 is not the first time that pool has ever dealt:

  ```bash
  npm run smoke:prod -- --base=<target> --seed=2026-09-27 --out=<dir> --tag=d0927
  # repeat for 2026-09-28, -29, -30
  ```

### 2.7 First hour after the deploy — who watches what

| every | check | expected |
|---|---|---|
| 10 min, first hour | `curl -sI https://matchcutdaily.com` | 200 + the nine security headers |
| once | one manual play of each of the four modes on a real phone, console open | no console errors, terminal + share reached |
| once | `npm run smoke:prod -- --base=https://matchcutdaily.com …` | PASS, 0 faults |
| once | Vercel deployment log | no function/edge errors |
| once | `curl -sI` a hashed asset | 200, immutable `Cache-Control` |

**Abort criteria are already written** — see the *Rollback triggers* section of
`docs/production-release-checklist.md`. If any of them fires, run §2.5 first and
diagnose afterwards; a rollback costs seconds and a bad daily costs the launch.

### 2.8 Close the deploy out

- Update the rollback target in §2.5 **and** in
  `docs/production-release-checklist.md`.
- Record deploy URL, alias, SHA, timestamp, verification outputs, and both
  rollback-drill durations in the release checklist.
- Soak begins here; attended lanes A–E may now run against production.

## 3. Indexing/launch switches (Approval 5 — inventory + held diffs)

Three independent switches, each its own go/no-go, none approved:

**3a. `noindex` removal** — single line, [index.html:14]. Held diff:

```diff
-    <!-- Quiet phase (WS1): keep the alias out of search indexes until launch. -->
-    <meta name="robots" content="noindex, nofollow" />
```

No `robots.txt`, no `X-Robots-Tag` header anywhere — this meta is the only
robots control; removing it makes the site indexable by default. One-way in
practice (crawlers cache). og/canonical/social meta already point at
`https://matchcutdaily.com/` and the og:image asset now ships, so unfurls
are ready the day this flips.

**3b. URL-in-share** — composer at [src/lib/share.ts:7]:

```diff
-  return `Match Cut · ${mode}\n${scoreLine}\n${emoji}`
+  return `Match Cut · ${mode}\n${scoreLine}\n${emoji}\nmatchcutdaily.com`
```

Blast radius (update in the same pass): the share-format assertions in
`tests/browser/delivery-smoke.spec.ts`; the family-format language in
`docs/master-plan.md` and RULEBOOK if it names the line shape; Connections'
composer usage in `src/ConnectionsGame.tsx` flows through the same helper
(verify practice-prefix interplay: "practice · " lines get the URL too —
decide whether that's wanted). Not a rule change (share text only), but it
IS a test-asserted surface: run smoke after.

**3c. Front door** — deliberately NO seam yet. Landing is the menu
(`src/App.tsx`, `Mode = 'menu' | …`; only a dev-only `?mode=` boot param
exists). Decision waits for the 2-week post-launch interviews (leaning
Chronology). When ruled, it's a small App.tsx change + menu emphasis pass —
spec it then; nothing to hold now.

Sequencing note: 3a/3b are the "go public" pair and only make sense after
soak; 3c is explicitly post-interviews. Each flip = code change → gates
(build + smoke) → its own deploy.
