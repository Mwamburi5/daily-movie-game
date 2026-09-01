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
- [ ] Run `npm run verify:preview-security` against the protected Goal 5 Preview.
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
`dpl_7Mk27AwKQ8vcN3CUPj666kfCPNx9` is the recorded rollback target; the
documented command is `vercel rollback <deployment-id-or-url>`, and no rollback
was executed. Dashboard analytics/Web Vitals, alerts, spend controls, account
MFA/access, and the rollback drill remain open.

## Source-control and CI gates

- [ ] Receive explicit approval to commit.
- [ ] Commit only the reviewed scope on the intended branch.
- [ ] Receive explicit approval to push.
- [ ] Push and wait for GitHub Actions to finish; do not infer success from local gates.
- [ ] Require green build/budgets, Duel, daily, Connections, and browser jobs.
- [ ] Open/merge a PR only if explicitly requested. Never merge `main` by default.
- [ ] Record the green run URL and exact SHA in the delivery report.

## Quiet production release

- [ ] Receive explicit approval to deploy the exact green SHA.
- [ ] Confirm the Vercel project and custom domain target before deployment.
- [ ] Deploy production explicitly; a Git push alone is not deployment proof.
- [ ] Verify `https://matchcutdaily.com` returns HTTP 200 and references the new
  hashed assets.
- [ ] Verify the required production headers and CSP match the tested Preview
  receipt; do not infer edge configuration from the local build.
- [ ] Run one real production interaction in every changed mode and check the
  browser console/network for failures.
- [ ] Confirm `noindex, nofollow` remains present.
- [ ] Confirm share output remains URL-free.
- [ ] Confirm TMDB attribution remains visible.
- [ ] Record deploy URL, alias, SHA, time, verification, and rollback target.

## Operational launch gate

- [ ] Error monitoring receives a deliberate non-user-impacting test event and
  the alert route is exercised.
- [ ] Web Vitals arrive in the production dashboard.
- [ ] `mode_start`, `mode_finish`, and `share` are verified as received—not merely queued.
- [ ] Monthly spend alert and hard ceiling are configured and tested.
- [ ] One-command rollback is documented and a rollback drill succeeds.
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
