# Production release and launch checklist

This checklist separates an ordinary quiet release from the later public-launch
switch. A green local build is not permission to publish. Every external mutation
below requires Buri's explicit approval.

## Candidate identity

- [x] Record branch, commit SHA, content version, and intended release scope.
- [x] Identify and exclude unrelated worktree files from the proposed release.
- [x] Confirm rules, scoring, deals, difficulty, content, persistence, and share
  behavior are unchanged unless the release was explicitly scoped to change them.
- [x] Confirm `RULEBOOK.md` and `sim/RULESET.md` are current for any approved
  mechanic change.

Goal 5 candidate recorded 2026-08-19: branch `codex/daily-mode-polish`, base and
upstream `c063f267c819f8109e5ec0257e675fc925026dde`, with a local Goal 5 delta
for social metadata/preview imagery, its browser contract, Safari console
cleanup, distinct non-spoiling screen-reader names for Duel's hidden draw
choices, and the acceptance record. The unrelated
`docs/full-product-code-review-kickoff-prompt.md` and
`docs/pool-expansion-goal-prompt.md` are preserved and excluded. There is no
mechanic change, so neither rules document requires a synchronized edit. The
base SHA's GitHub run `32212903103` is green; the Goal 5 delta still needs its
own reviewed commit, push approval, and exact-SHA CI receipt.

## Local release gates

- [x] `npm ci`
- [x] `npm run build`
- [x] `npm run check:bundle`
- [x] `npm run check:security`
- [x] Run `npm run verify:preview-security` against the protected Preview.
      GREEN 2026-09-02 against `https://marquee-otlnd4c6f-mwamburi5s-projects.vercel.app`
      (`dpl_FTnTRXPKr4V1Hyz8Fu68AfPymr75`, `meta.githubCommitSha = 14a546e…`):
      9/9 required headers, 0 CSP violations, 0 console faults, insights loader
      200 + browser event 200, no test seams / secret names / source map. Run 1
      was red on exactly one assertion (the platform's Vercel Toolbar injection
      into authenticated Preview HTML); Buri approved the `x-vercel-skip-toolbar`
      harness opt-out and run 2 passed. Full record:
      `docs/daily-duel-216-preview-verification-receipt.md` §P2.
- [ ] Confirm `vercel.json` and the attended account checks in
      `docs/security-launch-checklist.md` are complete for the candidate.
- [x] `npm run verify` — 64/64
- [x] `npm run verify:solo` — 8/8
- [x] `npm run verify:chronology` — 42/42
- [x] `npm run verify:connections` — 14/14
- [x] `npm run test:smoke` — 24/24
- [x] `git diff --check`
- [x] Inspect the production manifest and confirm menu/mode lazy-loading budgets.

The Goal 5 production build transformed 440 modules. Menu shell is 95.87 KiB
gzip; every first-mode cold JS load is 117.97–145.11 KiB; every modelled cold
played session is 271.19–324.59 KiB. Normal chunks contain no E2E marker. The
menu-to-mode browser journey confirms that no mode chunk is requested before
selection and that selecting Solo does not fetch the other modes. `npm audit`
and `npm audit --omit=dev` both report zero vulnerabilities after the lockfile-
only PostCSS/Nanoid transitive update.

## Human product gates

- [x] Buri approves the visual checkpoint screenshots for Phases 1–3.
- [x] Play every changed mode through a terminal state at 375×667, 390×844,
  tablet, short desktop, and full desktop.
- [x] Keyboard/focus browser pass for dialogs, Chronology choices/gaps, and results.
- [x] Reduced-motion browser pass.
- [x] Buri approved the fresh Goal 5 initial/result and social-preview
      checkpoint in this task on 2026-08-19.
- [x] Current Safari 26.5.2 branded pass: all four modes entered and exercised;
      current WebKit completed terminal/share/menu paths with zero faults.
- [x] Actual Safari 200% zoom: menu recomposed to one readable column and the
      enlarged Connections entry remained reachable; automated all-mode matrix
      retained zero horizontal overflow.
- [ ] Real iPhone and Android play-through.
- [x] VoiceOver spot-check in actual Safari: headings, named controls, pressed
      state/live feedback, Duel choice dialog, and rules hierarchy passed.
- [ ] TalkBack spot-check with the real Android device.
- [ ] 200% zoom/text-enlargement and contrast check.

The local browser and screenshot evidence is complete. The earlier Duel
keyboard/tap score collision was resolved before the Goal 5 baseline and is
covered by click, Enter, Space, touch, and drag parity tests. The browser gate
also verifies keyboard-only mode entry/return, named visible controls/dialogs,
dialog focus restoration, a contrast-safe focus indicator, and static reduced-
motion feedback with its action still available. Safari attendance exposed and
rechecked a real accessibility correction: Duel's three face-down draw choices
now have distinct ordinal/hint-only spoken names without revealing their hidden
titles. Actual VoiceOver then exposed the ordered headings, named controls,
pressed state/live feedback, Duel choice dialog, and rules hierarchy without
duplicate or unnamed game controls. Spoken audio is not captured by desktop
automation. TalkBack, real-device, and attended motion/focus gates remain open.

## Existing production baseline — not Goal 5 approval

Read-only checks on 2026-08-19 found Vercel production deployment
`dpl_8SighytERqgygRYvbf1eMyLis6SL` Ready and aliased to
`matchcutdaily.com`. Its HTML/assets match the pre-Goal 5 `c063f26` baseline:
the Goal 5 social metadata and preview image are absent, and `noindex,
nofollow` remains present. The public domain passed the 9/9 edge-header/CSP
verifier, had zero console faults, loaded analytics successfully, accepted one
non-sensitive test event, and exposed no production test seams, secret names,
or source maps. This is a production-baseline receipt only; it does not satisfy
the protected Goal 5 Preview or final production gates.

The existing Preview redirects unauthenticated requests to Vercel SSO. Vercel
listed no project environment variables. Apex HTTPS, HTTP-to-HTTPS, `www`-to-
apex redirects, Vercel nameservers, public DNS answers, and TLS coverage were
confirmed. No DS delegation was observed, so DNSSEC remains an attended
decision. The previous Ready deployment
`dpl_7Mk27AwKQ8vcN3CUPj666kfCPNx9` was recorded here on 2026-08-19, but that is
two deployments back and the wrong thing to roll back to. **Updated
2026-09-05 (Approval 4 executed):** production is now
**`dpl_HWeNAMnK2eLernz47PCG9RAmgCu6`** (`9a5fdbb`, aliased to matchcutdaily.com
since 2026-09-05T21:25:29Z, serving `index-DAtVcX_d.js`). The rollback target
is its predecessor **`dpl_8SighytERqgygRYvbf1eMyLis6SL`** (the `c063f26`
build): `npx --yes vercel@59.11.1 rollback dpl_8SighytERqgygRYvbf1eMyLis6SL --yes`
(run `vercel whoami` first; the stored token expires), and
`npx --yes vercel@59.11.1 promote dpl_HWeNAMnK2eLernz47PCG9RAmgCu6 --yes`
returns to the current build. **These ids must be updated as the last step of
every production deploy** — see
`docs/daily-duel-216-deploy-and-indexing-runbook.md` §2.5, which carries the
same ids and the verification commands. **The rollback drill was executed
2026-09-05T21:32Z: 7 s back to `index-Ch7qjnS-.js`, 19 s forward to
`index-DAtVcX_d.js`, security gate green afterwards** (receipt §P5). Dashboard
analytics/Web Vitals, alerts, spend controls, and account MFA/access remain
open.

## Source-control and CI gates

- [ ] Receive explicit approval to commit.
- [ ] Commit only the reviewed scope on the intended branch.
- [ ] Receive explicit approval to push.
- [ ] Push and wait for GitHub Actions to finish; do not infer success from local gates.
- [ ] Require green build/budgets, Duel, daily, Connections, and browser jobs.
- [ ] Open/merge a PR only if explicitly requested. Never merge `main` by default.
- [ ] Record the green run URL and exact SHA in the delivery report.

## Quiet production release

Executed 2026-09-05 (Approval 4) for `main@9a5fdbb`; full record in
`docs/daily-duel-216-production-deploy-receipt.md`.

- [x] Receive explicit approval to deploy the exact green SHA. — Buri's
  `/goal` block of 2026-09-04 (kickoff prompt) for `9a5fdbb`; D6 ruled "keep"
  in-session before P1.
- [x] Confirm the Vercel project and custom domain target before deployment. —
  `.vercel/project.json` → `marquee` / `team_yyOr5zARz3GhouJJyMunDA4x`;
  `vercel inspect https://matchcutdaily.com` resolved to the live production
  deployment before and after (receipt §P0, §P3).
- [x] Deploy production explicitly; a Git push alone is not deployment proof. —
  `npx --yes vercel@59.11.1 deploy --prod --yes` from a clean clone at
  2026-09-05T21:25:10Z → `dpl_HWeNAMnK2eLernz47PCG9RAmgCu6` (receipt §P2).
- [x] Verify `https://matchcutdaily.com` returns HTTP 200 and references the new
  hashed assets. — 200; `index-DAtVcX_d.js` + `index-CoBkmvh_.css`, sha256
  byte-identical to the `.vercelignore`-filtered rebuild, and the deployment's
  `meta.githubCommitSha` reads back `9a5fdbb` (receipt §P3).
- [x] Verify the required production headers and CSP match the tested Preview
  receipt; do not infer edge configuration from the local build. —
  `verify:preview-security --url=https://matchcutdaily.com` verbatim green
  (9/9 headers, 0 CSP, 0 faults) at 21:26:44Z and again post-drill at
  21:34:06Z (receipt §P4.1, §P5).
- [x] Run one real production interaction in every changed mode and check the
  browser console/network for failures. — `smoke:prod` on production: seed
  2026-09-05 PASS 4/4 · 0 faults, and `--seed=2026-09-27` (216 pool) PASS 4/4
  · 0 faults (receipt §P4.2).
- [x] Confirm `noindex, nofollow` remains present. — `grep -c 'name="robots"'`
  = 1 on the served shell (receipt §P4.4).
- [x] Confirm share output remains URL-free. — every share text captured by
  both production smokes is the three-line family format with no URL
  (receipt §P4.2).
- [x] Confirm TMDB attribution remains visible. — rules sheet on production
  shows the TMDB attribution (screenshot `p4-tmdb-attribution-prod.png`,
  receipt §P4.4).
- [x] Record deploy URL, alias, SHA, time, verification, and rollback target. —
  receipt §P2/§P3/§P5 and the "Existing production baseline" paragraph above.

## Operational launch gate

- [ ] Error monitoring receives a deliberate non-user-impacting test event and
  the alert route is exercised.
- [ ] Web Vitals arrive in the production dashboard.
- [ ] `mode_start`, `mode_finish`, and `share` are verified as received—not merely queued.
- [ ] Monthly spend alert and hard ceiling are configured and tested.
- [x] One-command rollback is documented and a rollback drill succeeds. —
  drilled 2026-09-05T21:32Z: 7 s back / 19 s forward, gate green after
  (receipt §P5).
- [ ] Privacy/retention language and credits are published.
- [ ] TMDB commercial-use terms are resolved before monetization.
- [ ] Cold-4G and warm-repeat budgets pass on the final asset graph.

## Public-launch switches — separate approval required

- [ ] Buri approves removing `noindex, nofollow`.
- [ ] Buri approves adding the public URL to share output.
- [ ] Buri approves the public front door/default mode.
- [ ] Search metadata, canonical URL, robots behavior, social cards, and public
  analytics/privacy language are reviewed together.
- [ ] Re-run every local, CI, production, accessibility, and operational gate
  after the switch; record the final launch receipt.

## Rollback trigger examples

- A rule/parity or daily-deal mismatch.
- Any mode cannot start, finish, share, or return to menu.
- A production console exception or first-party asset failure.
- Missing legal target, clipped essential control, or inaccessible modal escape.
- Bundle/session budget regression outside an explicitly approved exception.
- Monitoring, analytics, privacy, or cost controls fail the launch contract.

Launch-readiness candidate recorded 2026-08-31: branch
`codex/daily-mode-polish`, HEAD `ce398376d0c03be5356d64000557817c2f0150c3`
(1 ahead of origin, unpushed), plus the classified dirty candidate —
categories, combined-diff review requirement, excluded promo files, and the
`audit/` force-add decision are specified in
`docs/daily-duel-216-launch-readiness-checkpoint.md` §12. Full Node 24 local
matrix green 2026-08-31 (64/64 · 8/8 · 42/42 · 14/14 · analytics · progress ·
smoke 38/38 ×2 · tune 65.9/50.3/41.4 asserts-on · build/bundle/security/diff).
Attended device/AT lanes for this candidate: `ATTENDED NOT RUN` — see
`docs/daily-duel-216-attended-acceptance.md`. Commit, push, CI, Preview,
deploy, and indexing remain unexecuted and separately gated.
