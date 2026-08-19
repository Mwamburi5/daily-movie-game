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

Local candidate recorded 2026-08-09: branch `codex/daily-mode-polish`, baseline
and upstream `a710fff`, uncommitted production-polish scope. The unrelated
`docs/pool-expansion-goal-prompt.md` is preserved and excluded. There was no
mechanic change, so neither rules document required a synchronized edit.

## Local release gates

- [x] `npm ci`
- [x] `npm run build`
- [x] `npm run check:bundle`
- [x] `npm run check:security`
- [x] `npm run verify:preview-security` against the protected Preview
- [ ] Confirm `vercel.json` and the attended account checks in
      `docs/security-launch-checklist.md` are complete for the candidate.
- [x] `npm run verify` — 64/64
- [x] `npm run verify:solo` — 8/8
- [x] `npm run verify:chronology` — 42/42
- [x] `npm run verify:connections` — 14/14
- [x] `npm run test:smoke` — 21/21
- [x] `git diff --check`
- [x] Inspect the production manifest and confirm menu/mode lazy-loading budgets.

The final production build transformed 438 modules. Menu shell is 95.31 KiB
gzip; every first-mode cold JS load is 117.39–144.37 KiB; every modelled cold
played session is 269.44–322.36 KiB. Normal chunks contain no E2E marker. The
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
- [ ] Real iPhone and Android play-through.
- [ ] VoiceOver and TalkBack spot-check.
- [ ] 200% zoom/text-enlargement and contrast check.

The local browser and screenshot evidence is complete. It is not a substitute
for the three unchecked attended-device/assistive-technology gates. A separately
gated, pre-existing Duel keyboard/tap collision also remains unresolved because
it can affect score and was not authorized as part of visual polish.

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
