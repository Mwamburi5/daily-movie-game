# Match Cut 216+16 — production deploy (Approval 4) — Kickoff prompt

Run this in a fresh session **only after Buri has said "deploy" for this gate**
(§12 sequence of `docs/daily-duel-216-launch-readiness-checkpoint.md`; §14
row "production deploy" is still NOT AUTHORIZED until then). Pasting the
`/goal` block below IS that authorization for the exact scope listed here —
nothing more. Approval 5 (indexing/launch switches) stays separate.

Governing context (read first, in order):
`docs/daily-duel-216-deploy-and-indexing-runbook.md` §2.0–§2.8 (the executable
procedure — this prompt sequences it, it does not replace it),
`docs/prelaunch-polish-kickoff-prompt.md` (receipt: what changed on `main`
since the Preview gate), `docs/daily-duel-216-preview-verification-receipt.md`
(how the Preview gate was run, incl. the jar and the hash comparison),
`docs/production-release-checklist.md` ("Quiet production release" +
"Rollback triggers"), `docs/prelaunch-review-2026-09-03.md` §1 (decisions),
`.github/workflows/prod-smoke.yml` + `prod-canary.yml` (the crons to enable).

## State on 2026-09-04

- `main` = **`9a5fdbb`** (2be26f4 verified tree → #10 safety net → #11
  ops/prod-smoke/evidence → #12 copy+a11y → #13 receipt). CI green on the
  combined tree (run 33826836354 for `b08d8db`; #13 is docs-only).
- **Runbook §2.0 item 2 is stale**: it was written when no SHA was on `main`,
  audit-clean and CI-green at once. `9a5fdbb` is all three. Fix that paragraph
  in the docs commit at the end (P6).
- Production still serves `c063f26` (`dpl_8SighytERqgygRYvbf1eMyLis6SL`,
  asset `index-Ch7qjnS-.js`). Team plan = Hobby (D1 accepted: journey events
  will not record; page views + Web Vitals will).
- `main` gained **player-facing code after the Approval-3 Preview gate**
  (error boundary, preload-reload handler, copy/a11y strings, tile font
  divisor). The only browser evidence on those bytes is CI smoke + the local
  dress rehearsal. That is why P1 below re-runs the Preview gate on the
  deploy SHA before `--prod`. It costs ~15 minutes and one jar mint.
- Tooling in place: `npm run smoke:prod` (clock-shift via `--seed`),
  `npm run verify:preview-security`, the two workflows with crons commented,
  `scratchpad/mint-jar.mjs` pattern documented in the Preview receipt.

## Approvals in force (Buri, on pasting the /goal block)

1. **Approved:** (a) one protected **Preview** deployment of `main@9a5fdbb`
   from a clean clone + `verify:preview-security` + `smoke:prod` on it;
   (b) **one production deployment** (`--prod`) of that same SHA from a clean
   clone; (c) the post-deploy gates in runbook §2.4 incl. the documented test
   analytics event; (d) **one rollback drill**: `vercel rollback` to
   `dpl_8SighytERqgygRYvbf1eMyLis6SL`, verify, then re-promote the new
   deployment (`npx --yes vercel@59.11.1 promote <new-dpl> --yes` or a second
   `rollback` to it) — two extra production alias changes, both inside this
   approval, performed during the quiet phase (noindex on); (e) a small
   docs/CI commit + PR + merge: uncomment the two crons, record the new
   rollback target, tick the checklist boxes, fix runbook §2.0.2, add the
   deploy receipt; (f) memory update.
2. **NOT approved:** any change to `index.html` `noindex`, `src/lib/share.ts`
   URL-in-share, robots/sitemap, front door (Approval 5); Vercel project
   settings, domains, `playmatchcut.com` attachment (D7 — Buri does it in the
   dashboard); plan/billing changes; any source edit beyond (e); dependency
   changes; `DAILY_EPOCH` (D6 — see preconditions).

## Preconditions — stop read-only if any fail

1. `origin/main` = `9a5fdbbc3976490aa941e4936b064c7416c1d0bc` and green
   CI on it (or on its last code-bearing ancestor `b08d8db`); local `main`
   clean apart from the promo family (`docs/promo-execution-prompts.md`,
   `promo/`), which stays untracked and byte-identical.
2. **D6 answered.** `src/lib/progress.ts` `DAILY_EPOCH = '2026-07-04'` makes
   the first public player see "day 84" on 09-27. Moving it is now-or-never
   and is its own one-line commit + `verify:progress` + CI **before** P1. If
   Buri has not ruled, STOP and ask; do not default.
3. Node 24 via `PATH=/usr/local/bin:$PATH`; `gh` authenticated; Playwright
   Chromium present; `npx --yes vercel@59.11.1 whoami` = `mwamburi5`
   (this also refreshes the expiring CLI token — run it first, always).
4. Timing (runbook §2.6): not within ~2 h of local midnight
   (America/New_York); ≥ 7 days before 2026-09-27 (i.e. on or before
   09-19; recommended 09-04/05); Buri reachable for the first hour (§2.7) and
   for one jar mint (P1) — the classifier blocks the agent from minting.
5. SSO-bypass jar for the new Preview: Buri runs the mint script (same
   pattern as the Preview receipt; the script must target the NEW preview
   host — parametrise `PREVIEW` or write a copy). Jar lasts ~1 h.

## Work sequence

### P0 — baseline (runbook §2.1)

Record: `origin/main` SHA, CI run URL, `vercel whoami`, production HTTP
status, current served asset name (`index-Ch7qjnS-.js`) and deployment id
(`dpl_8SighytERqgygRYvbf1eMyLis6SL`), `vercel ls` head, DNS/TLS sanity
(`curl -sI` apex/www/http), and the cert `notAfter` (2026-10-03 — note it).

### P1 — protected Preview of the deploy SHA (re-run of the Approval-3 gate)

From a fresh `git clone --branch main` in the scratchpad (HEAD must equal the
SHA, `git status --porcelain` empty, copy `.vercel/project.json` in):
`npx --yes vercel@59.11.1 deploy --yes` (no `--prod`). Read back
`meta.githubCommitSha` from the deployments API / `vercel inspect`; confirm
unauthenticated `GET /` → 302 to SSO. Ask Buri to mint the jar for the new
host. Then:

```
PATH=/usr/local/bin:$PATH npm run verify:preview-security -- --url=<preview> --cookie-jar=<jar>
PATH=/usr/local/bin:$PATH npm run smoke:prod -- --base=<preview> --cookie-jar=<jar> --out=<evidence>/preview --tag=preview
PATH=/usr/local/bin:$PATH npm run smoke:prod -- --base=<preview> --cookie-jar=<jar> --seed=2026-09-27 --out=<evidence>/preview --tag=preview-0927
```

Expect: gate verbatim green (9/9 headers, 0 CSP, 0 faults, insights 200,
event 200, markers absent, `.map` 404); both smokes PASS with 0 faults; the
09-27 run reports pool 216. Also compare the served `index-*.js/.css` sha256
with a `.vercelignore`-filtered rebuild of the clone (runbook §2.3 b) — record
the expected production hashes now. **Any red: STOP, read-only diagnosis,
report. No `--prod`.**

### P2 — production deploy (runbook §2.2)

Same clean clone (or a fresh one at the same SHA): `whoami`, then
`npx --yes vercel@59.11.1 deploy --prod --yes`. Record `dpl_…` + URL. This is
the only step that changes what players see.

### P3 — prove the bytes (runbook §2.3)

(a) provenance: `meta.githubCommitSha` read back = SHA; (b) content: served
asset names + sha256 == the P1 filtered-rebuild hashes; alias checks (apex
200 new assets, `www` 307, `http` 308). Any mismatch: STOP and go to P5
(rollback) — do not "fix forward".

### P4 — post-deploy gates (runbook §2.4, in order)

1. `npm run verify:preview-security -- --url=https://matchcutdaily.com`
   (no jar; fires the documented test event — record it as such).
2. `npm run smoke:prod -- --base=https://matchcutdaily.com --out=<evidence>/prod --tag=prod`
   (today's real deal) **and** `--seed=2026-09-27 --tag=prod-0927` (the
   cutover deal on the real production bytes — the first time it is ever
   played there; this closes the receipt's "in-tree build only" caveat).
3. Static surfaces: `/assets/<hashed>.js` `cache-control: public,
   max-age=31536000, immutable`; `/.well-known/security.txt` 200;
   `/social-preview.png` 200 (was 404 on the old build); favicon/icons 200.
4. Quiet phase still on: `grep -c 'name="robots"'` = 1; share text URL-free
   (smoke asserts it).
5. Buri, attended: dashboard shows page views + Web Vitals; journey events
   absent (Hobby) — expected, not a failure.
Screenshots per mode terminal go under
`audit/daily-duel-216-launch-readiness-2026-08-27/production-deploy-<date>/`.

### P5 — rollback drill (runbook §2.5; approved above)

With production quiet: record `t0`; `npx --yes vercel@59.11.1 rollback
dpl_8SighytERqgygRYvbf1eMyLis6SL --yes`; poll until the served asset name is
`index-Ch7qjnS-.js` (record seconds); then re-promote the new deployment and
poll until the new asset name is back (record seconds). Re-run P4 step 1
afterwards. If the re-promote fails, production is on the old build — report
immediately, do not retry blindly. **Skip P5 only if Buri strikes it in the
/goal block.**

### P6 — enable the watchers + close out (runbook §2.8)

Branch `codex/post-deploy-<date>` from `main`: uncomment the crons in
`.github/workflows/prod-smoke.yml` and `prod-canary.yml`; update the rollback
target to the NEW `dpl_…` in the runbook §2.5 and
`docs/production-release-checklist.md` (and note the old one as the
previous); tick the checklist's "Quiet production release" boxes with
evidence pointers; fix runbook §2.0 item 2; add
`docs/daily-duel-216-production-deploy-receipt.md` (P0–P5 tables, verbatim
gate outputs, hashes, timings, the test-event note); `git add -f` the
production evidence dir (json/md + ≤ 6 PNGs). Commit, push, PR, green CI,
merge. Then `gh workflow run prod-smoke.yml` once by hand and confirm it goes
green against the new production (it opens an issue on failure — that is the
alert path). Update memory (`marquee-next-session-queue`: prod = new SHA,
rollback target, crons live, next = lanes on prod + Approval 5 ~09-20).

### P7 — first hour (runbook §2.7)

Watch: the manual prod-smoke run, the canary once it fires, Vercel Web Vitals,
and the GitHub issues inbox. Abort criteria = release checklist "Rollback
triggers". Then STOP at the **Post-deploy Review** checkpoint: report per-item
pass/fail, the new rollback target, and that attended lanes A–E may now
target production (`docs/daily-duel-216-attended-lanes-scheduling-goal-prompt.md`).

## Guardrails

Clean clone only — never deploy the working tree; `whoami` before every
`vercel` mutation; exactly one `--prod` deploy plus the drill's two alias
moves; no Vercel settings/domain/plan changes; no indexing switch; no source
edits beyond P6's docs/CI; no dependency changes; never `--force`; never
print jar/token values; promo family untouched; every gate output recorded
verbatim; red anywhere after P2 = rollback first, diagnose second.

## Completion gate

Complete only when: the protected Preview of the deploy SHA passed the gate
and both smokes; production provably serves that SHA (provenance + hashes);
P4 all green incl. the 09-27 seed on production bytes; the rollback drill
went round-trip with timings recorded (unless struck); crons enabled and the
manual prod-smoke run green; receipt + checklist + memory updated; `noindex`
still present; shares still URL-free.

---

Paste-able `/goal` block:

````text
/goal Execute Match Cut Approval 4 — production deploy of main@9a5fdbb. Read
docs/daily-duel-216-production-deploy-kickoff-prompt.md FIRST and follow it
verbatim; this condition is only its completion gate. Approved: one protected
Preview of the deploy SHA + gate + smoke:prod (incl. --seed=2026-09-27); one
`vercel deploy --prod` from a clean clone; post-deploy gates vs production
incl. the 09-27 seed; one rollback drill round-trip; one docs/CI PR enabling
the prod-smoke + canary crons and recording the receipt. NOT approved:
noindex removal, URL-in-share, robots/sitemap, front door, Vercel
settings/domains/plan, DAILY_EPOCH (must be ruled BEFORE P1), any other
source edit. Preconditions (stop read-only if any fail): origin/main =
9a5fdbb with green CI; D6 ruled; Node 24 prefix; gh + vercel authenticated;
timing rules; Buri available for one jar mint and the first hour. Done when:
Preview of 9a5fdbb green; production provably serves 9a5fdbb; P4 green incl.
09-27 seed; drill timed; crons live + manual prod-smoke green; receipt,
checklist, memory updated; noindex still on; shares still URL-free. Any red
after --prod: roll back first, then report.
````
