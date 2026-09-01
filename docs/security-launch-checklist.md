# Goal 4 security hardening and attended launch checklist

This is the operating checklist for the security-hardening release. Repository
checks can prove the build and configuration contract; they cannot prove that
the correct Vercel, GitHub, registrar, and DNS-account settings are enabled.
Those account checks stay owner-attended and must not be inferred from a green
local run.

## Automated repository contract

- [x] `npm ci`
- [x] `npm run build`
- [x] `npm run check:bundle`
- [x] `npm run check:security`
- [x] `npm audit` reports zero vulnerabilities.
- [x] `npm run verify` — 64/64.
- [x] `npm run verify:solo` — 8/8.
- [x] `npm run verify:chronology` — 42/42.
- [x] `npm run verify:connections` — 14/14.
- [x] `npm run test:smoke` passes with zero CSP violations, console errors,
      page errors, failed first-party requests, or required-header failures.
- [x] `npm run verify:preview-security` passes against the protected Vercel
      Preview with its temporary bypass cookie kept outside the repository.
- [x] `git diff --check`.

Local receipt, 2026-08-18: Node 24.19.0; Vite production build 440 modules;
bundle budgets green; security scan green across 195 repository files and 23
production files; `npm audit` 0 vulnerabilities; browser 21/21; gameplay
64/64 + 8/8 + 42/42 + 14/14. The browser fixture records CSP violation events
and first-party console/network faults for every journey.

`npm run check:security` is intentionally dependency-free. It fails when:

- a workflow action is not pinned to a full 40-character commit SHA;
- a tracked environment file or a high-confidence secret signature is found;
- a public sourcemap or `sourceMappingURL` is present;
- a normal production bundle contains E2E/dev seam markers;
- the bundled analytics loader is missing;
- `vercel.json` drifts from the exact header policy exercised by Vite preview;
- executable inline script returns to `index.html`; or
- the CSP loses its no-inline/no-eval script posture, framing protection,
  plugin block, or base-URI protection.

## Preview deployment receipt

Preview URL: `https://marquee-k3gi9nq6y-mwamburi5s-projects.vercel.app`

Deployment ID: `dpl_ECTuDQiuZcWnCa8fCxSJ3jVTK6bk`

Source state: local uncommitted Goals 2–4 candidate based on
`5316b04e3dda1464b141e3c59028a0c3cf247b5d`. This Preview is valid security
evidence, but it is not a reproducible release SHA and must not be promoted.

Recorded 2026-08-18 by the Codex live Preview verifier.

- [x] Deploy the locally green candidate to a Vercel Preview; do not promote it.
- [x] Confirm the Preview deployment is associated with project `marquee`
      (`prj_pulSUCbmLIthysHhzWGGtVIajIgm`).
- [x] Fetch the app shell and one hashed JS, CSS, font, image, and SVG resource.
      Confirm HTTP 200 and `X-Content-Type-Options: nosniff` on each.
- [x] Confirm the app-shell response includes the exact enforced CSP from
      `vercel.json`, `X-Frame-Options: DENY`,
      `Referrer-Policy: strict-origin-when-cross-origin`,
      restrictive `Permissions-Policy`, COOP, and CORP.
- [ ] Confirm an attempted iframe embed is blocked.
- [x] Confirm `/_vercel/insights/script.js` loads from the Preview origin and
      returns 200; confirm a browser-generated non-sensitive custom event also
      returns 200 from `/_vercel/insights/event`.
- [ ] Play all four modes through the existing terminal/share/return journeys.
- [x] Confirm zero CSP violations, console warnings/errors, page errors, or
      failed first-party requests in the live Preview security/analytics
      journey. The full 21-journey suite passed separately under the same exact
      CSP in Vite preview.
- [ ] Trigger one non-sensitive test custom event, then confirm it is received
      in the Vercel Analytics dashboard for the Preview environment.
- [x] Confirm normal production assets contain no `.map` files, preview
      modules, dev assertions, E2E buttons, source tokens, or credentials.
- [x] Save the header/console/network verifier result and deployment ID in this
      record. The owner-attended Analytics dashboard receipt remains open.

Live automated receipt: 9/9 exact required headers; CSP violations 0; console
warnings/errors 0; Insights loader 200; browser-generated event 200; public
source map absent; production test seams and secret environment names absent.
Preview Deployment Protection remained enabled, and the Vercel Toolbar was
disabled for this scoped Preview so its external script did not weaken the CSP.

## Vercel account — owner attended

- [ ] Account owner and every team member have phishing-resistant MFA/passkeys;
      recovery codes are stored offline and the recovery email is current.
- [ ] Remove stale members/tokens and confirm least-privilege project roles.
- [ ] Web Analytics is enabled for the project before deployment; after any
      enablement change, redeploy before testing `/_vercel/insights/*`.
- [ ] Preview Deployment Protection is enabled and tested without blocking the
      approved reviewer path or the analytics verification route.
- [ ] Production deployment remains approval-gated; Git push alone is not
      treated as production evidence.
- [ ] Review project environment variables by name and scope. No TMDB secret or
      other private credential may be exposed as a `VITE_*` browser variable.
- [ ] Confirm `matchcutdaily.com` is attached to the intended project and
      `playmatchcut.com` remains in its explicitly approved parked/redirected
      state. Do not attach or redirect the parked domain during this goal.
- [ ] TLS is valid on apex and approved aliases. Do not enable or change HSTS
      until every intended subdomain and rollback consequence is reviewed.
- [ ] Spend alerts/limits, deployment notifications, and an owner-visible alert
      route are enabled and exercised.
- [ ] Record the current production deployment as the rollback target and prove
      the team can promote it without rebuilding.

## GitHub account and repository — owner attended

- [ ] Owner and collaborators have phishing-resistant MFA/passkeys; remove
      stale collaborators, deploy keys, OAuth grants, PATs, and SSH keys.
- [ ] Default Actions token permissions are read-only; write access is granted
      only per job when a future workflow genuinely needs it.
- [ ] Repository rules protect `main`, require pull requests, block force pushes
      and deletion, require conversation resolution, and require these checks:
      build/budgets/security/audit, Duel, daily, Connections, browser smoke, and
      dependency review.
- [ ] GitHub secret scanning and push protection are enabled and tested with
      GitHub's documented harmless test pattern—never with a real credential.
- [ ] Dependabot alerts and security updates are enabled. Confirm the committed
      npm and GitHub Actions weekly update configuration is recognized.
- [ ] Allowed Actions policy admits the pinned GitHub-owned actions in CI and
      blocks unreviewed actions. SHA updates must retain the human-readable
      release comment and pass dependency review.
- [ ] Review branch, environment, repository, organization, and Actions secrets;
      remove unused entries and restrict environments/branches where supported.
- [ ] Record the protected branch/ruleset URL and a green Actions run for the
      exact candidate SHA.

## Domain registrar and DNS — owner attended

- [ ] Registrar account uses a unique password plus phishing-resistant MFA;
      recovery email/phone and offline recovery codes are current.
- [ ] Domain auto-renew is on, payment method is current, expiry alerts reach at
      least two owner-controlled channels, and registrar/transfer lock is on.
- [ ] Registrant contact information is accurate and privacy settings are
      intentionally selected.
- [ ] Export or screenshot the authoritative DNS records before any change.
- [ ] Confirm authoritative nameservers are the intended Vercel nameservers and
      no stale A/AAAA/CNAME/MX/TXT/CAA records delegate unwanted services.
- [ ] Review DNSSEC support and the Vercel/registrar procedure. Enable it only
      as a separately attended change with rollback instructions; a mismatched
      DS record can make the domain unreachable.
- [ ] Review certificate issuance needs before adding restrictive CAA records;
      do not guess at issuers.
- [ ] Confirm the apex and approved aliases resolve from at least two independent
      public resolvers and serve the same intended deployment/certificate.
- [ ] Store registrar account ID, support path, renewal date, DNS backup, and
      emergency ownership contacts in the owner's credential vault—not here.

## Completion and release decision

Goal 4's implementation completion gate is satisfied when the repository checks
are green, the live Preview verifier proves the real edge headers, analytics
delivery, clean console/network, and production-asset hygiene, and the complete
browser/gameplay suite passes under the exact enforced CSP. That evidence is
recorded above. The unchecked four-mode remote play, Analytics dashboard receipt,
and account-hardening items are owner-attended release evidence; they may be
marked only by the person who attended each dashboard. Promotion to production,
public indexing, URL-in-share, domain redirects, and `main` merge remain separate
approvals.

Local receipt, 2026-08-31 (launch-readiness pass): Node v24.14.0, npm 11.9.0;
security scan green — 241 repository files / 25 production files after a bare
build, 26 when `check:bundle` has written `dist/bundle-report.json` first (the
report is scanned by the same assertions and never deploys; the historical
225→228→229→241 chain is decomposed path-by-path in the launch-readiness
manifest, Goal 6). Assertion contract unchanged. Bundle budgets green with the
menu shell at 99.85/100 KiB gzip — effectively no headroom remains.
