# Match Cut 216+16 — protected-Preview verification (Approval 3) — Goal prompt

Run this in a fresh session. Buri approved Approval 3 of the launch-readiness
checkpoint's §12 sequence on 2026-09-01, after the merge to `main` landed
(`14a546e79ae1af3206e470f8f555d74257ff3a58`, PR #2). This gate verifies the
merged candidate on protected Vercel Preview infrastructure. Production
deploy (Approval 4) and every indexing/launch switch (Approval 5) remain
separate, NOT approved here.

Governing context (read first): `docs/daily-duel-216-launch-readiness-checkpoint.md`
(§12 sequence, §14 states), `docs/daily-duel-216-ship-receipt.md` (merged
state), `docs/production-release-checklist.md` (Preview line items),
`scripts/verify-preview-security.mjs` (the gate's actual contract).

## Approvals in force (Buri, 2026-09-01)

1. **Approved:** create (or locate) a protected **Preview** deployment of
   `main` at `14a546e`, run `npm run verify:preview-security` against it, run
   the four-mode Preview matrix on it, and record receipts. A Vercel
   *preview* deploy is the one approved external mutation.
2. **Still NOT approved:** production deploy (`--prod` in any form), alias
   changes, production analytics dashboard queries, Vercel/GitHub settings
   changes, and any indexing/launch switch. Live prod stays `c063f26`.

## Preconditions — stop read-only if any fail

1. `origin/main` = `14a546e79ae1af3206e470f8f555d74257ff3a58`; local checkout
   of that SHA (or a clean `main` at it); CI green on it (already recorded in
   the ship receipt — verify, don't re-run).
2. Node 24.x via `/usr/local/bin` first on `PATH` (default shell is v22 —
   always prefix). Playwright Chromium present (`npm run test:smoke` deps).
3. `vercel whoami` succeeds on the project's account; the project links to
   matchcutdaily.com's Vercel project.
4. SSO-bypass access to the protected Preview: either a Netscape cookie jar
   (`VERCEL_BYPASS_COOKIE_JAR`, as the Goal 5 run used) or Buri present to
   authenticate. If neither, STOP and ask — do not weaken Preview protection
   to get through it.

## Work sequence

### P0 — baseline

Record `origin/main` SHA, Node/npm, `vercel whoami`, and the existing Preview
state. Confirm the working tree used for any local build is clean at
`14a546e` (no dirty-tree candidate anymore — the merge is the candidate).

### P1 — protected Preview deployment

Deploy a **preview** (never `--prod`) of `main` at `14a546e`, or reuse an
auto-created Preview if one exists for exactly that SHA. Verify the deployed
commit SHA matches `14a546e` (deployment metadata, or the hashed asset
fingerprints vs a local `npm run build` of the same SHA). Confirm
unauthenticated requests still redirect to Vercel SSO (protection intact).

### P2 — verify:preview-security

`PATH=/usr/local/bin:$PATH npm run verify:preview-security -- --url=<preview-url> --cookie-jar=<jar>`
Expect ALL of: header set exact-match, zero inline executable scripts, no
Vercel toolbar, insights loader 200 + live browser event POST 200, zero CSP
violations / console faults / failed same-origin requests, module free of the
six forbidden markers, no sourceMappingURL and `.map` returning 404. Any
failure: read-only diagnosis, STOP and report — no header or CSP edits
without their own approval (a change here re-opens the security checklist).

### P3 — four-mode Preview matrix

On the protected Preview, in a real browser context (bypass jar loaded), for
each of Daily Puzzle, Chronology, Connections, Duel: load → one direct
successful action → one error recovery → terminal result → share copy (or its
manual fallback). Also load once with a corrupted `matchcut:v1` blob and
confirm the sanitized-progress menu renders repaired chips without crashing.
Capture a screenshot per mode terminal plus the sanitized-menu state.

### P4 — receipts and stop

Write `docs/daily-duel-216-preview-verification-receipt.md` (LOCAL-ONLY, not
committed): Preview URL + deployment id, verified SHA linkage, the
verify:preview-security output block, the four-mode matrix table, screenshot
filenames (drop them under
`audit/daily-duel-216-launch-readiness-2026-08-27/preview/` — gitignored,
local evidence). Update project memory. STOP at the **Preview Review**
checkpoint: report pass/fail per item and note that attended lanes A–E may
now run against this Preview (their scheduling is its own track). Approval 4
(production deploy, with the §6 provider property-cap check first) remains
Buri's next separate decision.

## Guardrails

No production deploy or alias change; no `vercel` project/settings mutation;
no indexing change; no production analytics query; no dependency install; no
source edit of any kind (a red gate stops the pass — it does not get patched
inline); never `git add`/`commit`/`push` (nothing in this pass produces a
commit); preserve the local uncommitted `docs/daily-duel-216-ship-receipt.md`
and the promo-family untracked files byte-identical.

## Completion gate

Complete only when: the protected Preview provably serves `14a546e`;
`verify:preview-security` passed verbatim; the four-mode matrix passed with
receipts; the local receipt doc exists; and no unapproved external mutation
occurred. Red anywhere = stop and report read-only.

---

Paste-able `/goal` block:

````text
/goal Execute the Match Cut 216+16 protected-Preview verification (Approval
3). Read docs/daily-duel-216-preview-verification-goal-prompt.md FIRST and
follow it verbatim; this condition is only its completion gate. Approved:
one Vercel PREVIEW deployment of main@14a546e + verify:preview-security +
the four-mode Preview matrix + local receipts. NOT approved: production
deploy, alias/settings changes, indexing switches, production analytics
queries, any source edit. Preconditions (stop read-only if any fail):
origin/main = 14a546e79ae1af3206e470f8f555d74257ff3a58 with green CI; Node
24 via /usr/local/bin PATH prefix; vercel CLI authenticated; SSO-bypass
cookie jar available or Buri present. Done when: Preview provably serves
14a546e with protection intact; verify:preview-security fully green; all
four modes pass the matrix (action, error recovery, terminal, share,
sanitized-progress load) with screenshots under the launch-readiness audit
dir; docs/daily-duel-216-preview-verification-receipt.md written LOCAL-ONLY;
memory updated; stop at the Preview Review checkpoint reporting per-item
results and that attended lanes A–E may now target this Preview. Any red
gate: read-only diagnosis, stop and report — never patch inline.
````
