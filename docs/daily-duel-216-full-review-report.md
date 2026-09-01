# Match Cut 216+16 full product review

Review window: 2026-08-26 through 2026-08-27  
Review checkpoint: read-only; no fixes implemented  
Candidate: codex/daily-mode-polish at ce398376d0c03be5356d64000557817c2f0150c3 plus the deliberately uncommitted 216+16 worktree  
Recommendation: TARGETED FIX, then re-run the complete gate. HOLD publication of this candidate until the P1 smoke reliability and 320 px Chronology issues are closed.

## 1. Executive verdict

The approved 216-real-film Daily/Duel cutover and 16-wild Duel remain data-correct, deterministic where promised, simulation-green, and playable. The pool hash, date boundary, pinned first cutover board, Chronology hash, Connections digest, all four rule verifiers, bundle ceilings, security assertions, and live-flow tune all match their approved contracts.

The whole local candidate is not release-gate green:

1. The required browser smoke command finished 26/27. A ten-repeat diagnosis of its reduced-motion test passed only 4/10 because the test assumes a generic first-turn cue and an ordinary Draw 3 dialog even when randomized legal states expose a Take helper or a wild-specific draw dialog. The product states are correct; the gate is nondeterministic.
2. At 320x568, the Chronology title collides with the STROKES label. This is a confirmed responsive defect and an accessibility/text-enlargement risk.
3. Menu/onboarding copy still presents Duel as a simple race to 20 and shows Taz, while the current UI says CPU and the settled winner rule is highest net after the bell. RULEBOOK also over-generalizes same-series links to Daily even though Daily's implemented legal move is shared people only.

Answers to the five goal questions:

| question | answer |
|---|---|
| Complete technical/data/simulation/browser/security contracts? | Not completely. Data, rules, simulations, build, bundle, and security are green; the required full browser smoke is red and demonstrably flaky. |
| First-time and returning-player sense/satisfaction? | Mostly yes. Every mode supports a clear direct first action, feedback, recovery, result, replay/share/menu loop, and daily/practice reason to return. Duel has the steepest terminology load, and its menu/onboarding promise is misleading. |
| One coherent product with intentional differences? | Visually and structurally yes. Shared cards, help, results, Passport, share format, and navigation are coherent. Daily-versus-Duel link and scoring explanations need one copy pass. |
| Remaining UI/help/accessibility/telemetry issues? | One confirmed compact-header collision; misleading Duel and Daily-link copy; no support/reporting or privacy/analytics route; sparse journey telemetry; nondeterministic smoke coverage; unattended device/assistive-tech gates remain. |
| What first, and what crosses boundaries? | First stabilize the smoke test, then fix the 320 px Chronology header, then reconcile player-facing copy to settled rules. These are test/layout/copy changes. Any change that makes series-only pairs legal, alters race/net scoring, adds persistent analytics identity, publishes, deploys, or indexes crosses an explicit approval gate. |

No P0 was found. The 216+16 content itself is proceed-ready. The release candidate as a whole is not publication-ready until the two P1s are fixed and the full matrix is rerun at the exact candidate SHA.

## 2. Scope, repository state, evidence tiers, and limitations

### Authority honored

Only this report, the screenshot manifest, and review screenshots/diagnostics were created. Application source, rules, data, tests, existing documentation, package files, CI, external services, and production were not changed. No dependency was installed. No Git mutation, TMDB call, rebake, deployment, indexing change, or external event send occurred.

### Repository baseline

| item | observed |
|---|---|
| branch | codex/daily-mode-polish |
| HEAD | ce398376d0c03be5356d64000557817c2f0150c3 |
| upstream | origin/codex/daily-mode-polish |
| ahead/behind | 1 ahead, 0 behind |
| baseline dirty state | 20 modified paths and 27 untracked paths before review artifacts |
| Node / npm | v22.23.2 / 10.9.8 |
| declared Node engine | 24.x |

The five recent commits were ce39837 onboarding polish, 31bc25f Goal 5 candidate, c063f26 Goals 2-4/security, 5316b04 production-polish candidate, and a710fff Wave 3 expansion.

Baseline dirty work grouped by purpose:

- UI/player guidance: RULEBOOK.md, docs/master-plan.md, src/DuelGame.tsx, src/SoloGame.tsx, src/components/DrawChoice.tsx, and src/components/HowToPlay.tsx.
- Runtime data/rules/helpers: sim/RULESET.md, src/data/duelPool.ts, src/data/movies.ts, src/lib/difficulty.ts, src/lib/duel.ts, src/lib/solver.ts, and src/devAssertions.ts.
- Generated and verification data: src/data/connections-grids.json, sim/connections-verify.ts, sim/duel-sim.ts, sim/solo-verify.ts, and sim/verify.ts.
- Browser coverage: tests/browser/delivery-smoke.spec.ts.
- Reports, prompts, selection records, simulations, and the local pool picker: the pre-existing untracked docs, scripts, sim evaluator, and tools/daily-duel-pool-picker paths shown in Appendix A.
- No unrelated writer was identified. Every pre-existing path was preserved.

### Evidence tiers

| tier | use in this review |
|---|---|
| source inspection | rules, help, telemetry, persistence, sharing, UI and test contracts |
| automated local check | build, security, hashes, rule verifiers, simulations, browser tests |
| browser-observed local behavior | normal player controls and direct visual inspection |
| fresh saved screenshot | current local candidate or current public production, with state and viewport in the manifest |
| automated trace/diagnostic | rare wild states and flaky-test classification; not treated as direct play |
| old saved screenshot | historical visual comparison only; screenshot 48 is explicitly labeled reference |
| production observation | public HTML/assets/headers only; never treated as local-candidate proof |
| attended evidence still required | real iPhone/Android, Safari/WebKit final matrix, VoiceOver, TalkBack, and an owner-observed 200 percent zoom pass |

### Limitations

- Daily, Chronology, and Connections reached terminal states through normal controls. Duel normal play and its major tools were exercised directly, but its current result was reached through the existing test-only terminal seam; the image in screenshot 48 is historical reference, while the current smoke independently revalidated result/share/menu semantics.
- The in-app browser did not expose a trustworthy independent 200 percent zoom receipt in this run. A 320x568 stress matrix was completed, and older 200 percent screenshots were reviewed only as historical evidence. This remains an attended gate.
- No real phone, VoiceOver, or TalkBack session was attended; no claim is made for them.
- The public site was inspected read-only. It serves different asset filenames from the local candidate, so production is not evidence for the candidate.

## 3. Release-contract matrix

| contract / command | actual result | duration | evidence tier | disposition |
|---|---|---:|---|---|
| npm run build | PASS; 441 modules | 2.28 s | automated local | green |
| npm run check:bundle | PASS; menu 97.81 KiB gzip JS; Solo 40.19 inc / 138.00 cold; Chronology 22.12 / 119.93; Connections 52.26 / 150.08; Duel 51.30 / 149.12 | about 0.15 s | automated local | green |
| npm run check:security | PASS; 225 repository files / 25 production files | about 0.15 s | automated local | green assertions; receipt counts drifted from 224 / 26 |
| npm run verify | PASS 64/64 | 130.26 s | automated local | green |
| npm run verify:solo | PASS 8/8; 365 unique solver-valid boards, all 216 exposed, par min 6 / median 10 / max 12 | 0.22 s | automated local | green |
| npm run verify:chronology | PASS 42/42 | 0.13 s | automated local | green |
| npm run verify:connections | PASS 14/14 | 435.12 s | automated local | green |
| npm run test:smoke | FAIL 26/27 | 45.82 s | automated local | red release gate |
| targeted reduced-motion test, one rerun | PASS 1/1 | 4.5 s | automated local | confirms nondeterminism |
| targeted reduced-motion test, repeat-each 10 | FAIL; 4 passed / 6 failed | 17.5 s | automated local | five Take-helper cue assumptions; one wild-dialog assumption |
| deterministic multi-wild browser test | PASS 1/1; hand count 10 after retaining all three wilds | 6.4 s | automated local trace | green rare-state contract |
| npm run eval -- tune 8000 --seed=200824 --assert | PASS; 65.9 / 50.3 / 41.4 percent, zero live-flow stalemates | 49.68 s | automated local | green shipped model |
| npm run eval -- report 4000 --seed=200824 --assert | PASS; old one-pile/no-race diagnostic scaffold | 686.51 s | automated local | diagnostic only, not shipped regression evidence |
| git diff --check | PASS; no output | 0.01 s | automated local | green after review artifacts |

The old report scaffold showed, for example, casual-versus-Matinee 44.0 percent with 84.4 percent scaffold stalemates and trivia-god-versus-Director's 49.7 percent with 60.3 percent scaffold stalemates. Per the canonical checkpoint, those numbers describe the retired one-pile/no-race model and do not override the live-flow tune.

### Independent data checks

| invariant | actual | verdict |
|---|---|---|
| credited MOVIES | 320 | exact |
| ordered Duel/Daily real pool | 216 unique IDs | exact |
| ordered real-pool SHA-256 | d9b988232fabddadd2616d4fcc6c1ad604bce1207106b9ac6539784b50a38fdb | exact |
| legacy real pool | 89 | exact |
| Daily 2026-09-26 | 89-pool deal | exact |
| Daily 2026-09-27 | 216-pool deal | exact |
| first cutover board | Mission: Impossible Dead Reckoning Part One starter; seven pinned hand cards; par 9 | exact |
| first cutover direct solution | Ghost Protocol → Jerry Maguire → A Few Good Men → Batman → Spotlight → Birdman → The Revenant | solver-valid |
| Daily cutover boards | 365 unique, solver-valid, expose all 216 | exact |
| Duel wilds | 16 unique, no real-pool overlap | exact |
| wild credit/adjacency isolation | actor/director/writer arrays blank; no person/genre adjacency | exact |
| multi-wild conservation | all wilds retained; only non-wilds burned | React/sim/browser green |
| same-series pairs without a shared person in current 216 pool | 0 | current pool masks the broader copy/legal-helper ambiguity |
| Chronology catalog | 482 | exact |
| Chronology SHA-256 | 578aae49cd6f136eaa0d288fb4d213273fe5bcd579427e1e41135a51173c951e | exact |
| Connections bake | 365 grids over 320 credited films | exact |
| Connections semantic digest | 0f333d3236fea7c2033f3b49577acfa9c9b9e9c199d3802b5e0d48e2e8c6cab6 | exact |
| production build E2E marker | absent from normal dist; present in dist-e2e by design | contained |

## 4. Prioritized findings

| ID | severity / type | evidence and reproducibility | player/release impact | smallest recommendation | boundary / effort / confidence | proof for a future fix |
|---|---|---|---|---|---|---|
| MC216-F01 | P1 architecture/operations risk | Required smoke 26/27; ten repeats 4/10. Failure diagnostics 49-50 show valid Take-helper and wild-dialog states contradict fixed test assumptions. | A release can be blocked or falsely green based on random deal contents; reduced-motion coverage is not deterministic. | Give this test a deterministic deal or assert the valid conditional states, while retaining separate static-cue and wild-dialog checks. | tests only; S; high | 10/10 targeted, full 27/27 twice, no weakened assertion of reduced motion or wild conservation |
| MC216-F02 | P1 confirmed UI/accessibility defect | Screenshot 42, direct late-line play at 320x568: Chronology overlaps STROKES. Repeatable whenever that header renders at 320 px. | Essential mode and score labels become hard to parse; likely worsens with text enlargement. | Add a compact-header layout breakpoint using the existing header system; do not hide score meaning. | UI CSS/component; S; high | fresh 320/360/390 and 200 percent screenshots; keyboard/help controls still fit |
| MC216-F03 | P1 continuity contradiction | App menu says Race to 20 — high score wins; onboarding says Race to 20 and shows Taz 11; help and result correctly say 20 only rings the end and highest net wins; runtime says CPU. | A first-time player can believe crossing 20 automatically wins and encounter a different opponent identity. | Make menu/onboarding promise the settled rule in one short sentence and choose CPU or Taz consistently. | copy only if settled behavior retained; S; high | source string check plus fresh onboarding/menu/help/result matrix |
| MC216-F04 | P2 continuity/rule-contract risk | RULEBOOK says Modes 1 and 2 connect by people or same series; Daily help/runtime/solver use shared people only. Duel legalPlays is also person-gated, while series upgrades an already-legal link and supports melds. Current 216 pool has zero series-only pairs, so gameplay does not expose it today. | Documentation teaches a rule the legal helper does not implement; future content could turn it into a real illegal-move surprise. | State Daily as people-only. Clarify exactly where series applies in Duel. | copy/docs if behavior retained; changing series-only legality is rules/content/sim/tuning; S copy or L rule; high | cross-source matrix plus a characterization test for a synthetic series-only pair |
| MC216-F05 | P2 support gap | Overview/mode help has no bad-data, broken-game, accessibility, or contact path. TMDB attribution exists. | Launch-week failures have no obvious recovery or triage route. | Add one concise Help footer with an owner-approved destination and three report categories. | external support destination and publication copy; S; high | compact help screenshot, working destination, owner response/ownership test |
| MC216-F06 | P2 telemetry gap | Only mode_start, mode_finish, and successful share are tracked. No first action, help/recovery, invalid/stuck friction, clipboard failure, replay, session mode ordinal, or abandonment signal. | Starts cannot be separated from confused starts; support and retention decisions lack evidence. | Add the minimal event dictionary in section 12 after privacy/retention approval; keep primitives and no free text. | analytics/privacy; M; high | local queue assertions for exact once, blocked analytics isolation, production dashboard receipt |
| MC216-F07 | P2 accessibility/publication gate | Automated keyboard/focus/escape/touch/drag coverage is strong, but no current attended 200 percent, real iPhone/Android, VoiceOver, or TalkBack receipt exists. | Automated evidence cannot establish real assistive-tech or device usability. | Complete the existing attended matrix after F01-F03. | publication; attended; high | signed device/AT receipt at the exact candidate SHA |
| MC216-F08 | P2 operations/publication state | Local candidate is deliberately uncommitted, unpushed, undeployed, and noindexed. Live asset names differ from local; live responds 200 with security headers. | Production cannot be used as acceptance evidence, and discovery is intentionally disabled. | After fixes, create an exact-SHA release receipt; only then separately approve deploy and indexing. | commit/push/deploy/index; owner approval; high | CI SHA, production asset match, live four-mode matrix, indexing decision |
| MC216-F09 | P3 reproducibility risk | Review ran on Node v22.23.2 while package engines and CI select 24.x. All local checks passed. | A local-only pass may miss Node 24 behavior or produce different timings. | Re-run the final release matrix on declared Node 24.x; do not loosen engines. | environment only; S; high | node --version receipt and full green matrix |
| MC216-F10 | P3 receipt drift | Security output is 225 repository / 25 production files, not the authoring receipt's 224 / 26; assertions pass. | Reviewers may mistake file-count drift for a security regression or overlook classification drift. | Explain or update the release receipt after determining which file moved classification. | report/security tooling; S; medium | exact before/after file list and unchanged security assertions |
| MC216-F11 | P3 resilience risk | progress.ts rejects malformed JSON/version/major missing fields but trusts nested values; corrupt meta can surface nonsensical streak/best/record display. Rules and deals never read this data. | Cosmetic progress may be wrong after manual or legacy corruption; gameplay remains safe. | Clamp/validate nested meta on read, preserving additive migration. | persistence meta only; S; medium | malformed-storage tests showing fresh/sanitized UI and unchanged deals |
| MC216-F12 | P3 subjective polish/legibility risk | Screenshots 17, 18, and 24 contain very dense long Connections titles at compact/desktop sizes. Text remains contained and named controls are correct. | A small subset of titles requires more effort to scan; no clipping was confirmed. | Measure title-fit cases before changing type. Prefer the current component's existing fit logic over per-title hacks. | UI typography; S investigation; medium | title corpus screenshot matrix at 320/360/390 and attended readability check |

## 5. Fresh screenshot matrix

The complete 50-image matrix, evidence tier, direct/seam distinction, viewport, and verdict are in [the screenshot manifest](../audit/daily-duel-216-full-review-2026-08-26/manifest.md).

| surface | representative current evidence | coverage |
|---|---|---|
| Menu | [fresh onboarding](../audit/daily-duel-216-full-review-2026-08-26/01-menu-390x844-fresh-onboarding.png), [320 stress](../audit/daily-duel-216-full-review-2026-08-26/04-menu-320x568-normal-stress.png), [3/3 Passport](../audit/daily-duel-216-full-review-2026-08-26/44-menu-390x844-passport-3-of-3.png) | onboarding, normal, compact, overview help, completed return state |
| Daily | [legacy start](../audit/daily-duel-216-full-review-2026-08-26/06-daily-360x800-legacy-start-2026-08-26.png), [cutover start](../audit/daily-duel-216-full-review-2026-08-26/39-daily-390x844-cutover-start-2026-09-27-e2e.png), [solved](../audit/daily-duel-216-full-review-2026-08-26/40-daily-390x844-solved-result-direct.png), [stuck](../audit/daily-duel-216-full-review-2026-08-26/41-daily-390x844-stuck-result-direct.png) | raised, credits, success, invalid, help, both terminal meanings |
| Chronology | [tablet start](../audit/daily-duel-216-full-review-2026-08-26/12-chronology-768x1024-daily-start.png), [direct correct](../audit/daily-duel-216-full-review-2026-08-26/14-chronology-390x844-correct-feedback.png), [320 defect](../audit/daily-duel-216-full-review-2026-08-26/42-chronology-320x568-compact-late-line-direct.png), [result](../audit/daily-duel-216-full-review-2026-08-26/43-chronology-390x844-solved-result-direct.png) | start, raised/gaps, correct, misfire, compact late line, help, result |
| Connections | [desktop idle](../audit/daily-duel-216-full-review-2026-08-26/17-connections-1024x768-daily-idle.png), [one-away](../audit/daily-duel-216-full-review-2026-08-26/19-connections-390x844-one-away.png), [loss](../audit/daily-duel-216-full-review-2026-08-26/21-connections-390x844-loss-result.png), [revealed groups](../audit/daily-duel-216-full-review-2026-08-26/22-connections-1024x768-revealed-groups.png) | idle, selection, one-away, solved group, loss, reveal, practice, help |
| Duel | [Matinee desktop](../audit/daily-duel-216-full-review-2026-08-26/25-duel-1440x900-matinee-start.png), [direct success](../audit/daily-duel-216-full-review-2026-08-26/27-duel-390x844-direct-success.png), [Meld](../audit/daily-duel-216-full-review-2026-08-26/33-duel-1024x768-meld-banked.png), [three wilds](../audit/daily-duel-216-full-review-2026-08-26/45-duel-390x844-three-wild-draw-trace.jpeg), [flaky-test diagnostics](../audit/daily-duel-216-full-review-2026-08-26/50-duel-390x844-reduced-motion-take-helper-test-false-negative.png) | all difficulties, play, Draw 3, wild conservation, Take/Meld, run/encore, Recast, Final Cut armed, help, result semantics |
| Production | [live menu baseline](../audit/daily-duel-216-full-review-2026-08-26/47-production-390x844-live-baseline.png) | current public shell only; assets differ from local |

All saved images were opened. Transitional frames 17 and 33 are labeled as such and were checked against later stable endpoints. Screenshot 37 was relabeled to avoid claiming that Final Cut was consumed when it only proves the armed/credits-open state.

## 6. Daily versus Duel paired audit

| concept | Daily | Duel | verdict / risk |
|---|---|---|---|
| content | 89 through 2026-09-26; 216 from 2026-09-27 | 216 real plus 16 isolated wilds | correctly versioned and separated |
| target count | one pile | two marquees | clearly visible and explained |
| legal ordinary play | shared actor/director/writer with pile top | shared person with either top; series can upgrade a person-linked play; tokens/wilds add exceptions | RULEBOOK wording is broader than helpers |
| credit flip | first flip costs +1 | free | mode help is correct; overview does not highlight the difference |
| draw/burn | none | Draw 3, keep one; keep every wild, burn non-wilds | correct in source/sim/browser |
| scoring | golf: flips and invalid penalties minus combos, compare to par | positive link/meld points minus cards held; highest net | internally correct |
| 20 | not applicable | rings the end; does not automatically win | menu/onboarding are misleading |
| special systems | combo and solution reveal | run/encore, Meld, Take, Final Cut, Recast, wilds | substantial learning load but contextual feedback works |
| finish | empty hand solved or no legal move stuck | 20, empty hand, or two passes with empty deck; compare net | help/result correct |
| replay/return | same daily, practice warm-up, streak/Passport | fresh deal, difficulty record | clearly differentiated |

Smallest continuity correction: state Daily as people-only; state Duel as two marquees where reaching 20 ends the show but highest net wins; define series precisely without changing the legal helper.

If Buri instead wants a series-only pair to be a legal pile/marquee play, that is not a copy fix. It changes rules, shared helpers, React/sim parity, content assumptions, verification, and likely tuning.

## 7. Four-mode continuity and confusion table

| concept | Daily | Duel | Chronology | Connections | intentional? / explanation | confusion risk / recommendation |
|---|---|---|---|---|---|---|
| core task | chain people links | score links head-to-head | place by release date | group four shared categories | yes; four movie skills | overview explains each well |
| people links | legal move | legal/scoring move | unused | grouping category | yes | correct RULEBOOK over-generalization |
| series | not an independent legal move | scoring/meld concept; current pool series pairs also share people | unused | grouping category | yes | clarify exact Duel use and remove Daily implication |
| genre | cosmetic on card | meld rung only, not ordinary link | unused | grouping category | yes | Duel help already says Meld; keep ordinary-link language precise |
| Deep Cut | hidden notable person link | hidden notable person link | not used | not used | yes | help explains stamp; no issue |
| credit flip | first costs +1 | free | no credits | no credits | yes | add one overview comparison sentence |
| piles/targets | one pile | two marquees plus meld rows | chronological gaps | four selected tiles then Submit | yes | direct target glows/labels are clear |
| draw/burn/wild | none | Draw 3 and wild conservation | none | none | yes | direct and rare-state feedback strong |
| golf/par | lower score versus par | no | lower net strokes | fewer mistakes/best | yes | result cards clearly label lower/higher |
| race/net | no | 20 ends; highest net wins | no | no | yes | menu/onboarding contradiction is high risk |
| mastery | combos | tiers, run/encore, Meld/Take/tokens | streak/tight-call mercy | category inference/one-away | yes | Duel has highest terminology burden |
| daily/practice | seeded daily and fixed warm-up | fresh non-daily deals and difficulties | seeded daily plus Wide/Tight | seeded daily plus random practice | yes | Passport correctly excludes practice |
| result | solved/stuck | won/lost/draw | cleared | solved/missed | yes | headline plus semantic subline works |
| share | score and emoji; practice labeled | result/net and recap emoji | score and placements | result/guess grid | yes | family format coherent; failed-copy telemetry absent |
| navigation/help | shared back/help, modal focus/escape | same | same | same | intentionally shared | strong continuity |

## 8. Mode-by-mode direct-play review

| mode | menu promise → first action | feedback/recovery | mastery/result/return | likely question and current answer | current metric |
|---|---|---|---|---|---|
| Daily | Recommended start and golf promise lead to a raised hand ticket and glowing pile. | Success names the shared person; invalid play gives text plus +2; flips show credits; stuck offers one solution. | Combo/par gives mastery; solved/stuck results explain score; replay/menu/share and daily streak/Passport support return. | Why did this connect? Banner names the person. Why did a flip cost? Help explains first-flip +1. | start/finish/share only |
| Duel | Difficulty picker leads to one card or Draw; two marquees and tools are visible. | Link tier and points are named; Take/Meld/Recast overlays are recoverable; Draw 3 states explain keep/burn/wild. | Runs, encore, meld ladder and net create tension; result compares played minus held; replay and difficulty record support return. | Does 20 win? Help/result say no; menu/onboarding imply yes. | start/finish/share by difficulty only |
| Chronology | Daily/practice choice leads to a raised hidden-year title and legal gaps. | Clean/misfire text, strokes, revealed year, and persistent line make correction clear. | Streak/tight-call mercy rewards skill; cleared result shows score arithmetic; replay/share/menu and daily streak support return. | How is a same-year tie decided? Expanded help says exact date. | start/finish/share only |
| Connections | Daily/practice choice leads to numbered tile selection and Submit. | One-away/miss is textual; Deselect/Shuffle recover; solved band names category. | Category mix, remaining grid and reveal screen support learning; result/guess history/replay/share/menu support return. | What does one-away mean? Mode help defines it. | start/finish/share only |

Direct input evidence: normal click/tap actions were observed in all modes. Existing smoke covers Enter, Space, touch emulation, and drag paths, plus named controls and focus. The full smoke failure is classified in F01; it does not invalidate the direct successful actions.

## 9. Shared UI/design and accessibility review

### Clean passes

- The Stub visual language remains coherent across menu, ticket cards, headers, help sheets, result panels, feedback pills, and CTA order.
- Mobile and desktop are composed rather than merely scaled: Duel becomes a theater table, Connections gets side rails, and Chronology preserves the reel.
- Result action order is consistent: copy, replay/deal again, Menu; the Connections reveal detour returns to results.
- State is not color-only: labels, pick numbers, points, one-away text, result headings, and aria state accompany color.
- Help/result dialogs expose modal semantics, focus containment, Escape close, and focus return in automated coverage.
- Named controls exist across modes; two-tone focus and keyboard navigation are covered by smoke.
- Reduced motion removes transform animation from the tested Draw control and keeps the generic cue static when that cue is the active first-turn guidance.

### Risks and blockers

- F02 is a real compact header collision.
- F01 means the reduced-motion test currently conflates reduced-motion behavior with randomized gameplay variants.
- The automated viewport suite starts at 375 px for several matrices; the fresh 320 capture found a defect it could not catch.
- 200 percent zoom and real assistive-tech/device checks remain attended gates.
- Some screenshots intentionally caught entry/bank transitions. Stable later frames, not transitional opacity/blank cards, were used for endpoint verdicts.

No wholesale DuelGame rewrite is recommended. Any future containment should begin with characterization tests around deals, terminal reasons, tokens, draw variants, and sim-shared helpers, then extract one small boundary at a time with rollback.

## 10. 216+16 content, data, and tuning review

The cutover is internally consistent:

- Pre-boundary Daily remains on the 89-card deal; 2026-09-27 switches to the approved ordered 216.
- The pinned first cutover board renders cleanly at 390x844 and solves on the verified nine-card line.
- All 365 cutover boards are unique, solver-valid, and expose every approved real film.
- Duel contains exactly 216 unique real films and 16 unique wilds. Wilds are not in the real pool, have blank person credits, and cannot create person/genre adjacency.
- The shared draw helper conserves every wild for human, CPU, React, and sim paths. The deterministic three-wild test leaves a ten-card player hand.
- The 16 approved wild titles match the release receipt.
- Current 216 same-series pairs all share at least one person. That prevents a present-day series-only play discrepancy but does not resolve the documentation/helper contract for future cards.
- Chronology remains 482 dated cards with its exact hash.
- Connections remains 365 baked, unambiguous grids over 320 credited films with its exact semantic digest.
- The live-flow tune remains inside all asserted bands: Matinee 65.9 percent, Feature 50.3 percent, Director's Cut 41.4 percent, with zero shipped-flow stalemates.
- Bundle budgets remain green; the larger pool did not create a visible loading, card, help, or result regression in this review.

No TMDB query was made and no settled recognizability ruling was reopened.

## 11. Help/support audit and launch-week question table

| likely question | mode/state | current answer/location | correct? / discoverability | gap and smallest recommendation | approval? |
|---|---|---|---|---|---|
| Why did these movies connect or fail? | Daily/Duel | banners, flipped credits, help | correct; strong after action | keep; add no extra platform | no |
| What is a Deep Cut? | Daily/Duel | mode help | correct; one scroll away | overview glossary could link to mode help, optional | copy |
| Why did a flip cost here but not Duel? | cross-mode | separate mode help | correct but not compared | add one overview comparison sentence | copy |
| Does 20 automatically win Duel? | Duel | help/result say no | correct but menu/onboarding conflict | fix the promise at first exposure | copy; scoring only if behavior changes |
| What happened to other Draw 3 cards? | Duel | dialog says the rest leave the show | correct and immediate | none | no |
| Why were several wilds kept; what can a wild block? | Duel rare draw | special dialog and expanded help | conservation is clear; blocking nuance is deeper | keep compact wild explanation in expanded help | copy |
| Run versus encore versus Meld versus Take versus Recast versus Final Cut? | Duel | expanded help plus contextual overlays | correct but terminology-heavy | preserve contextual help; add a compact actions glossary order | copy |
| Why can an old Daily differ? | Daily history | RULEBOOK pool-version section | correct but not in app | add only if archived-date play becomes player-facing | product decision |
| Is lower or higher better; what are par/net? | all results | mode menu/help/result labels | mostly correct | fix Duel menu; keep result arithmetic | copy |
| What does one-away mean? | Connections | immediate banner and mode help | correct and discoverable | none | no |
| How do tight-call mercy and streak credit work? | Chronology | expanded help | correct; deeper concept appropriately deferred | none | no |
| Daily versus practice; what stamps Passport? | Menu/all dailies | Passport card and help | correct and visible | none | no |
| What gets shared; what if copy fails? | results | URL-free family text; manual-select fallback | behavior correct; help does not explain fallback | one short help line; instrument success/failure separately | copy + analytics |
| How do I report bad data, accessibility trouble, or a broken game? | all | no route | absent | one owner-approved Help footer destination and category prompt | support/publication |
| What data is measured and retained? | overview/help | no player-facing language | absent | concise analytics/privacy statement before broader telemetry | privacy/publication |

The smallest useful support step is a single in-product Help footer and a durable owner-controlled destination. A support platform is not justified by current evidence.

## 12. Tracking and learning audit

### Current implementation

| event | exact trigger/properties | evidence | gap |
|---|---|---|---|
| mode_start | mode mount; replay/new deal explicitly re-fires; mode plus daily/practice kind or Duel difficulty | source inspection; local queue stub accepts a primitive event | no first-action or session ordinal |
| mode_finish | every terminal state; natural result and score fields per mode | source inspection; terminal browser tests | no abandonment derivation without session context |
| share | only after clipboard copy succeeds; mode identity | source plus passing share smoke | failed copy/manual fallback invisible |

The analytics loader queues locally, does not load an external collector on localhost, isolates failures, and uses primitive non-PII properties. The production-preview smoke proves one synthetic event queues once. Source call sites are mount/terminal/action gated, but this review did not prove every real call exactly once against a captured live event stream.

### Minimal proposed event dictionary

| event | exact trigger | properties/values | product question | dedupe | privacy | launch critical? |
|---|---|---|---|---|---|---|
| first_action | first valid or invalid player action after each mode_start | mode, kind/difficulty, action: play/place/select/draw | Do starts become attempts? | in-memory once per round | no text/IDs | yes |
| help_open | help open | mode or overview, state: menu/playing/result | Where is help needed? | every explicit open | no text | yes |
| help_return | close help then next action within the same mounted round | mode, resolved: true/false | Did help unblock play? | once per help open | in-memory only | next |
| friction | invalid Daily play, Chronology misfire, Connections one-away/miss, Duel no-play/draw | mode, kind: fixed enum, count bucket | Where do players struggle? | one per resulting state transition | no movie/title/person | yes |
| share_attempt | copy button resolves | mode, result: copied/manual_fallback | Is sharing blocked? | one per click result | no clipboard text | yes |
| replay | replay/deal-again click | mode, kind/difficulty | Is the result loop satisfying? | one per click | no text | yes |
| mode_start extension | same existing event | session_mode_ordinal: 1/2/3/4+ held only in memory | Do players try a second mode? | increment per page session | no stable identity | next |

Abandonment can be approximated as mode_start without mode_finish only if the analytics product supports a privacy-safe session funnel. D1/D7 return requires a stable identifier or consented analytics mechanism; that is not a free property addition. Do not add fingerprinting or taste/movie telemetry. Buri must approve purpose, retention, disclosure, and consent before any persistent return measurement.

Operational monitoring is separate: console errors, Web Vitals, uptime, CSP reports, deploy/rollback receipts, spend alerts, and exact-SHA production checks should not be disguised as product events.

## 13. Software, security, performance, and operations review

- React and the sim share the critical Duel helper paths; all four rule verifiers are green.
- Deals remain seed-derived/stateless; localStorage is meta-only. F11 is display resilience, not rule corruption.
- Daily date arithmetic is local-calendar based; progress streak arithmetic uses seed strings and UTC day math, avoiding DST drift.
- Clipboard has async Clipboard API plus manual-selection fallback. Analytics only counts successful copy today.
- E2E terminal/wild controls are gated behind VITE_E2E; normal dist contains no marker.
- Lazy mode bundles and all budgets pass. Menu shell remains 97.81 KiB gzip JS.
- CSP forbids inline/eval script; public response includes CSP, frame denial, MIME sniffing protection, referrer and permissions policies.
- No unsafe rendering, new dependency, or external content call was introduced by this review.
- Node engine drift (F09) and security receipt count drift (F10) should be resolved in the release receipt, not hidden.
- The public site returned HTTP 200 on 2026-08-27 with the expected headers and noindex/nofollow. Its JS/CSS assets were index-Ch7qjnS-.js and index-BGXpqkZ5.css; local candidate assets were index-BcDwy6JR.js and index-CFhBdeJ6.css.
- Push is not deployment, and deployment is not indexing. Exact-SHA CI, live four-mode checks, attended accessibility, privacy/monitoring, rollback, and indexing remain independent gates.

## 14. Now / Next / Later sequence

### Now — required before another release-candidate claim

1. Fix F01 without weakening assertions: deterministic/conditional reduced-motion coverage, separate ordinary and wild Draw 3 cases.
2. Fix F02 at 320 px using the shared compact header.
3. Fix F03 and the copy-only portion of F04: Duel 20/net/identity and Daily person-only wording.
4. Re-run build, bundle, security, all four verifiers, full smoke twice, tune, and diff check on Node 24.x.

Gate: full deterministic green matrix plus fresh 320/360/390 screenshots. No rule, data, difficulty, analytics, share, or publication change.

### Next — launch readiness

1. Add the owner-approved support route and concise privacy/analytics language.
2. Complete 200 percent zoom, real iPhone/Android, VoiceOver, TalkBack, and Safari/WebKit attended acceptance.
3. If approved, implement the launch-critical minimal analytics events and local exact-once tests.

Gate: owner approvals for support and analytics plus attended receipts.

### Later — publication and learning

1. Create a clean exact-SHA candidate and green CI receipt.
2. Approve deploy independently; verify production asset/SHA, all modes, CSP, analytics, monitoring, and rollback.
3. Approve removal of noindex independently.
4. Revisit D1/D7 measurement only after value, privacy, retention, and consent are explicit.

## 15. Ranked top ten and first three improvements

1. F01 — make the browser release gate deterministic.
2. F02 — remove the 320 px Chronology header collision.
3. F03/F04 copy-only — align Duel race/net/identity and Daily-versus-Duel link wording to settled behavior.
4. F05 — give players a bad-data/accessibility/broken-game support route.
5. F06 — add first-action, friction, failed-share, replay, and in-session sequence telemetry after approval.
6. F07 — complete attended 200 percent/device/screen-reader acceptance.
7. F08 — produce an exact-SHA publication receipt and keep deploy/index approvals separate.
8. F09 — run the final matrix on declared Node 24.x.
9. F10 — reconcile the 225/25 security file counts with the prior 224/26 receipt.
10. F11/F12 — harden corrupt meta display and measure long-title legibility before polish.

The first three are intentionally surgical. They restore a trustworthy gate, fix one confirmed visual defect, and remove high-impact confusion without changing rules or tuning.

## 16. Questions for Buri

Only decisions not answerable from the repository:

1. Authorize a separate fix pass for the first three improvements, or keep the candidate on hold unchanged?
2. Which public opponent identity should be canonical: CPU everywhere, or restore Taz deliberately? The current product uses both.
3. Confirm the desired wording: reaching 20 ends the Duel, but highest net wins. If Buri instead wants first-to-20 to win or series-only marquee plays, that is a rule/scoring change requiring the full parity and tune process.
4. What owner-controlled support destination should Help use, and who owns response/triage?
5. What product analytics purpose, retention, disclosure, and consent policy is approved? In particular, is persistent D1/D7 measurement worth introducing identity?
6. After a fixed exact-SHA candidate passes all automated and attended gates, should deployment and removal of noindex be proposed as two separate approvals?

## 17. Appendix

### A. Baseline modified paths

Modified before review:

~~~text
RULEBOOK.md
docs/master-plan.md
docs/name-audit.md
sim/RULESET.md
sim/connections-verify.ts
sim/duel-sim.ts
sim/solo-verify.ts
sim/verify.ts
src/DuelGame.tsx
src/SoloGame.tsx
src/components/DrawChoice.tsx
src/components/HowToPlay.tsx
src/data/connections-grids.json
src/data/duelPool.ts
src/data/movies.ts
src/devAssertions.ts
src/lib/difficulty.ts
src/lib/duel.ts
src/lib/solver.ts
tests/browser/delivery-smoke.spec.ts
~~~

Untracked before review:

~~~text
docs/daily-duel-16-wild-simulation-data.json
docs/daily-duel-16-wild-simulation-report.md
docs/daily-duel-200-card-cutover-goal-prompt.md
docs/daily-duel-216-cutover-checkpoint.md
docs/daily-duel-216-full-review-goal-prompt.md
docs/daily-duel-216-release-checkpoint.md
docs/daily-duel-216-selection.md
docs/daily-duel-candidate-audit.md
docs/daily-duel-candidate-names.md
docs/daily-duel-pool-expansion-slate.md
docs/daily-duel-pool-model-data.json
docs/daily-duel-pool-model-report.md
docs/daily-duel-wild-simulation-data.json
docs/daily-duel-wild-simulation-report.md
docs/full-product-code-review-kickoff-prompt.md
docs/movie-pool-health-data-2026-08-24.json
docs/movie-pool-health-report-2026-08-24.md
docs/pool-expansion-goal-prompt.md
docs/ui-lock-and-movie-pool-health-kickoff-prompt.md
scripts/daily-duel-candidate.ts
scripts/daily-duel-pool-challengers.ts
scripts/daily-duel-pool-model.ts
sim/daily-duel-cutover-eval.ts
sim/daily-duel-tune-eval.ts
tools/daily-duel-pool-picker/app.js
tools/daily-duel-pool-picker/data.js
tools/daily-duel-pool-picker/index.html
tools/daily-duel-pool-picker/styles.css
~~~

### B. Exact flaky-test diagnosis

Required full smoke: 26 passed, one failed.

Targeted one-off rerun:

~~~text
1 passed (4.5s)
~~~

Ten repeats:

~~~text
6 failed
4 passed (17.5s)
~~~

Five failures could not find the generic idle cue because the randomized first deal exposed Take for meld, and the component intentionally suppresses the generic cue while that specific helper is present. One failure expected dialog Drew three — keep one, but the randomized draw contained a wild and correctly rendered Drew 3 — keep all 1 wild. Diagnostics are screenshots 49 and 50.

### C. Simulation outputs

Live-flow tune:

~~~text
Matinee        65.9 percent [64.9–67.0]
Feature        50.3 percent [49.2–51.4]
Director's Cut 41.4 percent [40.3–42.5]
stalemates     0 for all three
real           49.68 s
~~~

Old report scaffold selected rows:

~~~text
casual vs Matinee:      44.0 percent [42.4–45.5], scaffold stalemates 84.4 percent
casual vs Feature:      58.8 percent [57.3–60.3], scaffold stalemates 85.9 percent
casual vs Director's:   46.5 percent [44.9–48.0], scaffold stalemates 84.0 percent
expert vs Feature:      54.8 percent [53.2–56.3], scaffold stalemates 79.0 percent
expert vs Director's:   43.1 percent [41.6–44.6], scaffold stalemates 76.2 percent
trivia-god vs Director's: 49.7 percent [48.2–51.3], scaffold stalemates 60.3 percent
real                    686.51 s
~~~

These scaffold stalemates are not shipped-flow regressions.

### D. Screenshot index

See [manifest.md](../audit/daily-duel-216-full-review-2026-08-26/manifest.md) for all 50 files. Every image was opened. Fresh, trace, production, and historical-reference tiers are labeled separately.

### E. Attended/external blockers

- Current 200 percent zoom/text-enlargement receipt.
- Real iPhone and Android touch/safe-area/keyboard-overlap checks.
- VoiceOver and TalkBack end-to-end checks.
- Safari/WebKit final exact-SHA matrix.
- Owner-approved support destination.
- Owner-approved analytics/privacy/retention/consent policy.
- Clean commit/push/CI, deploy, production exact-SHA, monitoring/rollback, and indexing approvals.

### F. Review stop status

No application/source fix, staging, commit, push, PR, merge, deploy, indexing change, TMDB call, rebake, seed change, analytics send, or external mutation was performed. This report stops at the requested Review checkpoint.
