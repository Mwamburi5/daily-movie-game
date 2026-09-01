# Match Cut full product, design, retention, and software review — kickoff prompt

Copy everything inside the block into a fresh Codex session.

```text
Review Match Cut top to bottom as both a senior product designer/game designer
and a senior software engineer. You have access to the entire repository and the
live product. This is a comprehensive, evidence-backed audit—not an
implementation session.

Repository:
`/Users/mwamburi/Projects/Daily Movie Game`

Live production:
`https://matchcutdaily.com`

## Mission

Determine where Match Cut stands today as a product and codebase, what is
working, what is weak or confusing, and what would most improve:

1. first-session comprehension and delight;
2. UI quality, responsiveness, accessibility, and brand coherence;
3. the core game loops and long-term replay value;
4. healthy retention—getting people to return daily or weekly without dark
   patterns;
5. social play and sharing, especially a polished iMessage invite/challenge;
6. measurement and learning—what should be tracked to tell whether people play
   once, return, share, invite, and bring friends back;
7. software quality, architecture, maintainability, security, performance,
   testing, delivery, and operational readiness;
8. the smallest credible path from the current quiet release to a product that
   people actively return to and recommend.

Be candid. Do not protect prior decisions from scrutiny just because they are
already implemented. At the same time, distinguish a subjective preference from
an observed usability problem, a product hypothesis, a code defect, and a
rule/balance change.

## Review-only boundary

Do not edit code or documentation during this review. Do not install
dependencies. Do not commit, push, merge, deploy, change Vercel settings, remove
`noindex`, add the URL to existing shares, change analytics, or mutate any
external service.

You may run read-only commands, builds, existing verification suites, local
servers, browser automation, screenshots, accessibility-risk checks, bundle
inspection, Git/GitHub/Vercel status reads, and production HTTP/browser checks.

If you identify a bug or compelling improvement, document it with evidence,
affected files, risk, and an implementation recommendation. Do not fix it in
this session. If a recommendation changes a rule, score, deal, pool, difficulty,
fairness, daily seed, progression economy, persistence contract, share format,
or analytics schema, label it clearly as a product/rule decision requiring
Buri's approval.

## Current verified state — confirm before relying on it

At prompt authoring time, 2026-08-09:

- Branch: `codex/daily-mode-polish`.
- Deployed commit: `5316b04e3dda1464b141e3c59028a0c3cf247b5d`
  (`Complete production polish release candidate`).
- Local branch and `origin/codex/daily-mode-polish` match that SHA.
- Existing draft PR: `https://github.com/Mwamburi5/daily-movie-game/pull/2`.
- Both push and pull-request CI runs passed the complete five-job graph:
  - build and bundle budgets;
  - Duel rules, 64/64;
  - Solo and Chronology rules, 8/8 and 42/42;
  - exhaustive Connections rules, 14/14;
  - browser smoke, 14/14.
- Production deployment receipt:
  `https://vercel.com/mwamburi5s-projects/marquee/7Mk27AwKQ8vcN3CUPj666kfCPNx9`.
- Production is HTTP 200 and currently serves entry asset
  `assets/index-Dr3-o8EN.js`.
- The live menu and a real Daily Puzzle card raise were opened successfully.
- The inspected production session had zero browser warnings/errors and all 15
  observed HTML/font/asset/analytics/Solo requests returned HTTP 200.
- `noindex, nofollow` remains intentionally present.
- Existing result shares remain URL-free and clipboard-based.
- The production project is still named `marquee`; the public product is Match
  Cut at `matchcutdaily.com`.
- One unrelated untracked file exists:
  `docs/pool-expansion-goal-prompt.md`. Preserve it and exclude it from any
  conclusions about this review's scope.

Verify the branch, SHA, worktree, live asset hash, HTTP state, robots metadata,
console state, and CI/PR state before starting. Explain material drift.

## Product snapshot

Match Cut is a movie-connection game with four modes:

1. **Daily Puzzle / Solo** — connect every card in a seven-card hand to the
   pile through shared actors, directors, or writers. Golf scoring; low wins.
2. **Chronology** — place ten hidden-year movie titles into an older-to-newer
   reel. Golf scoring, clean streak credits, and tight-call mercy.
3. **Connections** — sort sixteen film titles into four hidden groups of four,
   using actors, directors, series, or genre. Four mistakes.
4. **Duel vs Computer** — alternate linked plays across two marquees, use Meld,
   Final Cut, and Recast tools, and finish with the highest net score.

The current content substrate is approximately:

- 304 fully credited movies;
- 482 dated Chronology movies;
- a frozen, tuned 89-film Duel/Solo pool;
- 365 baked and verified Connections daily grids.

The design identity is a movie-house/ticket system: navy, cream, amber, paper
texture, Domine display type, ticket notches/perforation, typographic cards, and
physical-card interaction. The recent production-polish release added:

- a deliberate responsive menu and desktop layouts;
- mode-specific How to Play dialogs;
- a title-first Chronology choice tray instead of overlapping title slivers;
- clearer Daily Puzzle costs and desktop staging;
- preservation of the accepted Connections board;
- a responsive Duel table, grouped tools, and improved terminal states;
- a local SVG icon family and stronger shared result ergonomics;
- route-level lazy loading, bundle budgets, expanded browser coverage, and a
  parallel CI graph.

## Current retention, sharing, and analytics implementation

Do not assume these are stronger than they are. Inspect them directly.

### Local retention

`src/lib/progress.ts` stores meta-state only under `matchcut:v1`:

- per-mode daily `lastSeed`, streak, and personal best for Solo, Chronology,
  and Connections;
- Duel plays and wins per difficulty;
- intro and Duel drag-hint dismissal;
- last selected Duel difficulty.

Rules and deals do not read this state. There are no accounts, cloud sync,
notifications, friend graph, seasons, unlock economy, or server leaderboard.

### Analytics

`src/lib/analytics.ts` sends three best-effort Vercel custom events:

- `mode_start`;
- `mode_finish` with mode-specific outcome fields;
- `share`, only after a successful clipboard copy.

The script is loaded through `/_vercel/insights/script.js`. It must never break
gameplay and carries no PII. Production receipt, funnel dashboards, cohorts,
retention, invite attribution, Web Vitals, and alerting are not yet proven.

### Sharing

`src/lib/share.ts` and `src/components/ShareCopy.tsx` generate a three-line,
spoiler-safe text result and copy it to the clipboard. The share contains no
URL and has no direct Web Share/iMessage button, challenge token, referral or
invite attribution, friend comparison, or link preview.

Treat the iMessage/social loop as an open product opportunity, not as permission
to silently change the existing share contract.

## Required sources

Read `AGENTS.md` first. Then inspect, at minimum:

### Product and decisions

- `docs/master-plan.md` — the only live build plan; focus on §0, §2, §6, §7,
  and §9.
- `docs/production-polish-release-candidate.md`.
- `docs/production-polish-design-qa.md`.
- `docs/production-polish-requirements.md`.
- `docs/production-release-checklist.md`.
- `docs/production-polish-audit-2026-08-08.md`.
- `docs/delivery-foundations-report.md`.
- `docs/ui-contracts.md`.
- `RULEBOOK.md` and `sim/RULESET.md`.
- `docs/feedback-batch1-plan.md` and `docs/feedback-log.md`.
- `design-qa.md` for the historical Connections QA record.
- `design_handoff_the_stub/README.md` and the six frozen reference screens.

Treat older `PLAN.md`, `orchestration-plan.md`, and `ui-tasks.md` as bannered
history, not current authority.

### Product code

- `src/App.tsx` and `src/index.css`.
- `src/SoloGame.tsx`.
- `src/ChronologyGame.tsx`.
- `src/ConnectionsGame.tsx`.
- `src/DuelGame.tsx` — high blast radius; inspect without proposing a casual
  rewrite.
- Every file in `src/components/`, especially `HowToPlay.tsx`, `StubCard.tsx`,
  `Hand.tsx`, `ChronoCard.tsx`, `DailyModeHeader.tsx`, `Results.tsx`,
  `ShareCopy.tsx`, `Icon.tsx`, and `useDialogA11y.ts`.
- `src/lib/analytics.ts`, `progress.ts`, `share.ts`, `daily.ts`, `motion.ts`,
  rule/scoring helpers, solvers, and difficulty logic.
- Movie pools, baked grids, and the code paths that select each mode's content.

### Engineering and delivery

- `package.json`, lockfile, TypeScript/Vite/Tailwind configuration.
- `.github/workflows/ci.yml`.
- `tests/browser/delivery-smoke.spec.ts` and `playwright.config.ts`.
- `scripts/check-bundle.mjs`.
- all four simulation/verifier entry points under `sim/`.
- the production manifest/chunk graph and Vercel link/configuration.
- recent Git history from Wave 3 through `5316b04`.

### Visual evidence

Inspect the saved screenshots in:

- `audit/production-polish-2026-08-08/`;
- `audit/production-polish-phase1-2026-08-08/`;
- `audit/production-polish-phase2-2026-08-08/`;
- `audit/production-polish-phase3-2026-08-08/`.

Open the images. Do not cite filenames you have not visually inspected.

## Review method

### 1. Establish product truth

Map the complete player journey:

`arrival → first-run framing → menu choice → mode onboarding → first meaningful
action → comprehension/feedback → tension and mastery → terminal result → share
or replay → return signal → next-day return`

For each transition, record:

- the player's question or motivation;
- the screen/control that answers it;
- likely hesitation or abandonment point;
- evidence from UI/code rather than assumption;
- the event or metric that should reveal whether it works.

### 2. Use the live product like a new and returning player

Clear site data and inspect a genuinely fresh session, then create returning
states with played-today status, streaks, best scores, and Duel history.

Exercise all four modes on production and locally where necessary. Include:

- menu and first-run dialog;
- every How to Play context;
- first meaningful action and invalid/error feedback;
- one complete terminal path per mode where practical;
- result, copy/share, replay, and return-to-menu actions;
- daily versus practice distinctions;
- short phone, modern tall phone, tablet, 1280×720, and 1440×900;
- keyboard-only, reduced motion, 200% zoom/text enlargement, and screen-reader
  risk assessment;
- browser console, first-party network failures, lazy loading, and performance.

Do not claim real iPhone, Android, VoiceOver, or TalkBack evidence unless you
actually have those surfaces. Name attended blockers instead.

### 3. Product-design and UI audit

Review:

- visual hierarchy and the clarity of the next action;
- typography, microcopy, essential text size, contrast, touch targets, focus,
  scrolling, safe areas, and modal/result reachability;
- mobile and desktop composition, not merely responsive resizing;
- card readability, information density, state change, feedback, and motion;
- consistency of shared shell, help, icons, buttons, chips, and result tickets;
- whether the Stub/movie-house identity feels distinctive, coherent, and
  contemporary rather than decorative or nostalgic for its own sake;
- empty, loading, error, invalid, stuck, win, loss, share, and replay states;
- where Connections should remain untouched because its core board is already
  accepted, versus where shared framing can improve;
- whether any mode looks or behaves like it belongs to a different product;
- whether the current menu accurately sets expectations for four fairly
  different games.

For every recommendation, include:

- evidence and affected screen/state;
- user impact;
- proposed design behavior, not only adjectives;
- affected files/components;
- mobile/desktop/accessibility implications;
- whether it is polish, structural UX, product scope, or rule change.

### 4. Game design, delight, and healthy “addictiveness”

Interpret addictiveness as durable intrinsic motivation and a healthy return
habit—not compulsion, manipulative loss aversion, fake urgency, or excessive
notifications.

Evaluate each mode against:

- time to understand;
- time to first satisfying connection or insight;
- perceived agency versus luck;
- difficulty ramp and mastery ceiling;
- tension, surprise, recovery, and “one more try” energy;
- result meaning—whether a player understands how well they did;
- desire to replay immediately;
- desire to return tomorrow;
- desire to compare or challenge a friend;
- content freshness and risk of repetition;
- fit between daily and practice experiences;
- whether four modes create breadth or fragment the product promise.

Identify the strongest core loop and the weakest. Decide whether Match Cut
should lead with one hero mode, a rotating daily program, a multi-mode daily
passport, or the current equal-weight menu. Make a clear recommendation with
tradeoffs—do not return a giant option tree.

Assess possible retention mechanics such as:

- a daily program/passport across modes;
- honest streaks, weekly consistency, personal bests, and mastery stats;
- spoiler-safe friend comparison;
- daily recap or “tonight at the movies” ritual;
- curated weekly challenge;
- lightweight collections or achievements;
- practice goals and skill coaching;
- asynchronous Duel challenges;
- reminders or installability only if earned by measured user demand.

For each proposed mechanic, state:

- player value;
- behavior it is expected to change;
- success metric and guardrail metric;
- implementation complexity;
- whether it requires accounts/backend/personal data;
- risk to rules, fairness, or the quiet movie-house tone.

### 5. Design a concrete iMessage invite/challenge concept

Produce one recommended v1 social loop that can plausibly ship without accounts
or a large backend. Cover the full flow:

1. where the invite appears and when;
2. the exact button labels and message copy;
3. Web Share API versus clipboard fallback behavior;
4. what the recipient sees in iMessage, including link-preview title,
   description, and social image direction;
5. the deep-link contract—mode, daily date/seed, difficulty, inviter score, or
   anonymous challenge token;
6. how to remain spoiler-safe and avoid putting a trusted score entirely under
   client control;
7. recipient landing, first action, result comparison, and rematch/return path;
8. privacy, abuse, expired links, timezone/date rollover, and accessibility;
9. graceful behavior on desktop and non-Apple devices;
10. exact analytics events and attribution boundaries.

Include a compact screen/flow specification for:

- result-state invite CTA;
- native share sheet/iMessage message;
- recipient landing card;
- post-result comparison;
- invite-sender feedback if a friend completes the challenge, if feasible
  without accounts.

Be explicit about browser/platform limits: the Web Share API cannot prove which
app was selected, and iMessage completion cannot be measured without a link or
anonymous server receipt. Recommend the smallest honest attribution model.

Evaluate whether existing clipboard shares should remain, be supplemented by
`Invite a friend`, or be replaced. Do not silently assume URL-in-share is
approved; it is currently a separate public-launch switch.

### 6. Retention and analytics plan

Audit current `mode_start`, `mode_finish`, and `share` instrumentation for
coverage, semantics, duplicate firing, daily/practice identity, outcome fields,
and privacy.

Design a minimal event taxonomy that can answer:

- What percentage of visitors start any game?
- Which mode creates the strongest first-session activation?
- Where do players abandon each mode?
- What percentage finish?
- Who starts a second mode or replay in the same session?
- D1, D7, and weekly return rates by first mode and acquisition source?
- Does a streak correlate with return, or merely describe already-retained
  players?
- What percentage copy/share or open the native invite?
- How many invite links are opened, started, completed, and followed by a
  rematch/next-day return?
- Which modes create organic invites?
- Do UI changes improve completion without flattening difficulty?

For each recommended event provide:

- event name;
- exact trigger;
- required properties and allowed values;
- what question it answers;
- deduplication/session/daily rules;
- privacy and retention notes.

Keep the schema small. Separate launch-critical events from later nice-to-have
telemetry. Include a proposed activation definition, north-star metric,
retention cohort definitions, funnel dashboard, social-loop funnel, and three
initial product experiments. Each experiment must have a hypothesis, variant,
primary metric, guardrail, sample-size caveat, and stop rule.

Do not recommend invasive fingerprinting or collecting movie taste/identity
data without clear user value and consent.

### 7. Software and architecture audit

Review the repository as a production system:

- React component boundaries, state ownership, rendering behavior, and type
  safety;
- the very large `DuelGame.tsx` state surface and realistic containment options;
- whether shared components truly encode shared behavior or create coupling;
- sim↔React parity by construction;
- deterministic dailies, append-only content assumptions, baked grid integrity,
  and timezone behavior;
- localStorage schema resilience, corruption/migration behavior, and tests;
- share/clipboard fallbacks and future deep-link attack surface;
- analytics failure isolation and event correctness;
- accessibility semantics and focus lifecycle;
- performance, lazy loading, asset graph, caching, and bundle ceilings;
- browser tests: coverage quality, brittleness, E2E-only seams, and missing
  production-critical journeys;
- verification runtime and CI graph efficiency;
- dependency health, Node/Vercel alignment, build reproducibility, and supply
  chain risk;
- CSP/security headers, XSS or unsafe rendering, URL parsing, storage trust,
  client-score trust, abuse, rate limiting, and privacy;
- monitoring, Web Vitals, error reporting, rollback, spend controls, and release
  receipts;
- code clarity, dead/stale paths, duplication, comments, and documentation drift.

Do not recommend a wholesale rewrite merely because a file is large. For major
architecture suggestions, give a safe migration sequence with characterization
tests, blast radius, and stop conditions.

### 8. Validate existing gates

Run the existing local matrix if time and resources permit:

- `npm ci`
- `npm run build`
- `npm run check:bundle`
- `npm run verify` — expected 64/64
- `npm run verify:solo` — expected 8/8
- `npm run verify:chronology` — expected 42/42
- `npm run verify:connections` — expected 14/14
- `npm run test:smoke` — expected 14/14
- `git diff --check`

Do not run `npm run audit:names` unless content has changed; it should not during
a read-only audit. Confirm normal production chunks contain no E2E completion
seam. Record actual durations and distinguish local evidence from GitHub and
production evidence.

## Known constraints and open risks

- `sim/RULESET.md` is canonical. Rule/scoring/deal changes invalidate tuning and
  require full parity verification.
- React 18, Vite, Tailwind 4, and Framer Motion are the locked production stack.
- `DuelGame.tsx` is the highest-blast-radius file. Do not wave away its risks
  with “convert everything to a reducer.”
- Game rules/deals are stateless and seed-derived; localStorage is meta-state
  only.
- Connections' core 4×4 board, bill, selection order, feedback, reveal flow,
  and result ergonomics are accepted. Critique with evidence, but do not assume
  it needs a redesign.
- Existing shares are intentionally URL-free and `noindex` is intentional until
  a separate public-launch decision.
- No account/backend/leaderboard exists.
- Real-device, VoiceOver, TalkBack, 200% zoom, instrumented contrast, production
  analytics receipt, Web Vitals, error alerts, rollback drill, spend ceiling,
  privacy/retention copy, and TMDB commercial-use decisions remain launch work.
- A pre-existing Duel keyboard/tap event collision is separately gated: with a
  raised card, keyboard activation of the pile may also reach the tap-to-flip
  handler and charge the first flip before the play resolves. Treat it as a
  scoring/parity issue, not casual UI cleanup.
- The release-candidate report was written before commit/push/deploy, so its
  publication-status prose is historically accurate to that checkpoint but is
  now superseded by the verified state in this prompt.

## Required final deliverable

Create a durable Markdown report in the repository, but do not commit it. The
report must lead with decisions and evidence, not a tour of the work performed.

Use this structure:

1. **Executive verdict** — where Match Cut stands, who it is for, its strongest
   advantage, its largest product risk, and whether it is prototype, quiet beta,
   launch candidate, or launch-ready.
2. **Evidence and methodology** — exact SHA, production asset/deployment, files,
   screenshots, viewports, flows, commands, and limitations.
3. **Product scorecard** — 1–5 ratings with one-line evidence for onboarding,
   comprehension, delight, depth, replay, daily return, social pull, UI quality,
   accessibility risk, performance, reliability, measurement, and operations.
4. **Player journey audit** — arrival through next-day return, including drop-off
   risks and missing measurements.
5. **Mode-by-mode review** — Daily Puzzle, Chronology, Connections, and Duel:
   strengths, friction, mastery, replay, return, social potential, and concrete
   UI/product recommendations.
6. **Cross-product UI/design audit** — mobile, desktop, shared system, help,
   results, states, accessibility, and prioritized visual recommendations.
7. **Healthy retention diagnosis** — current loop, strongest/weakest return
   signals, recommended hero loop, and what not to add yet.
8. **Recommended iMessage invite v1** — exact flow, copy, deep-link/data
   contract, preview, landing, comparison, privacy, fallback, and platform limits.
9. **Analytics and learning plan** — activation, north star, D1/D7 definitions,
   core event schema, dashboards, invite funnel, and three experiments.
10. **Software architecture and code-quality review** — strengths, risks,
    security, performance, testing, delivery, operational gaps, and safe
    refactoring sequence where justified.
11. **Prioritized findings table** with:
    `ID | severity | area | evidence | recommendation | player impact | effort |
    confidence | affected files | rule/product approval?`
12. **Now / Next / Later roadmap** — one decisive sequence, not a giant option
    tree. Include dependencies and validation gates.
13. **Top ten recommendations** — ranked. Identify the top three that should be
    built first and explain why.
14. **Questions for Buri** — only decisions that materially change direction;
    do not ask things the code or docs already answer.
15. **Appendix** — commands/results, screenshot index, event dictionary, and
    explicit attended/external blockers.

## Quality bar

- Be specific enough that another engineer and designer could implement the
  recommendation without guessing what “make it more engaging” means.
- Anchor every major conclusion in the live UI, screenshot evidence, code,
  tests, or product contract.
- Separate fact, inference, preference, and hypothesis.
- Use exact screen states and file paths.
- Surface tradeoffs and unintended consequences.
- Preserve the distinctive movie-house identity unless evidence supports a
  different strategic direction.
- Do not let passing tests stand in for product quality, and do not let visual
  taste stand in for rule correctness.
- Recommend healthy retention, not manipulative engagement.
- End with a clear recommendation for Match Cut's next product milestone and
  the evidence required to approve it.
```
