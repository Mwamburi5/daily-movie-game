# Match Cut — pre-launch review brief (2026-09-03)

LOCAL-ONLY consolidation of five parallel read-only reviews (Opus sub-agents)
run after PR #9 merged. Raw reports + screenshots:
`audit/daily-duel-216-launch-readiness-2026-08-27/prelaunch-review-2026-09-03/`
(`review-A-status.md` plans-vs-reality · `review-B-polish.md` player-facing
polish · `review-C-code.md` code quick wins · `review-D-ops.md` launch-ops ·
`review-E-content.md` first-month content). Nothing was changed by the
reviews; every item below is a proposal.

## 0. Where we are (one screen)

- `main` = **`2be26f4`** (PR #9, 2026-09-03T11:56Z): the verified `14a546e`
  tree + the Preview-gate toolbar header + the browserslist audit fix. CI green.
  Bundle byte-identical to the Preview-verified build.
- Production still serves **`c063f26`** (2026-08-18), which contains **no
  cutover code**. Approval 4 (deploy) is next; Approval 5 (indexing) after a soak.
- Approval 3 complete: Preview `dpl_FTnT…` of `14a546e` — security gate green,
  four-mode matrix pass, 0 faults.
- Runway to the first 216 Daily (**Sun 2026-09-27**): 24 days. Latest safe
  deploy ≈ **09-13**; recommended **09-04/05**. If 09-27 slips nothing breaks —
  prod keeps dealing the legacy pool. It is a content milestone, not a cliff.
- The critical path is decisions, not engineering (§1). Attended lanes A–E
  (humans + hardware) are the only item no agent time compresses.

## 1. Decisions only Buri can make (ranked by runway burned)

| # | decision | options | recommendation |
|---|---|---|---|
| D1 | **Analytics on a Hobby plan.** Custom events are *not included* on Hobby at all (page views only) — no code shape preserves signal; folding properties into names buys nothing. | (a) accept, deploy, revisit; (b) Pro + Analytics Plus; (c) base Pro (2-prop cap, `mode_finish` carries 5–6 props → needs a real fold); (d) fold now | **(a) now**, revisit (b) during soak. Leave the analytics code untouched — it starts reporting the moment a plan lands. Verify the plan on the billing page first ("legacy iteration" flag). |
| D2 | **Deploy date + soak length.** | 09-04/05 vs later | **09-04/05**, ≥1-week soak, 72-h freeze before 09-27, never within ~2 h of local midnight. |
| D3 | **Attended lanes: target + booking.** | Preview (needs a hand-minted ~1 h SSO jar per person) vs production post-deploy | **Production after D2.** Book 3 paired sittings (A+D Mac, C+E Android, B iPhone) for 09-06/07, backstop 09-12/13. Run the lane-pack prompt this week. |
| D4 | **Evergreen-practice ruling** (open since 08-20; the question itself was never written down). Scope = the four menu practice rows. | keep / remove | **Restate the question first; default "practice stays"** — removal is a menu change against ~150 B of budget headroom and re-cuts 6 of 9 promo shots. |
| D5 | **Menu bundle budget: 99.85/100 KiB, 154 B headroom.** A size target has become a shipping freeze: the error-boundary fix (Q1) and any menu copy tweak turn CI red. | bump `menuGzip` to ~104 KiB with a comment / declare the menu frozen | **Bump to 104 KiB** with a comment; it gates Q1. |
| D6 | **`DAILY_EPOCH = '2026-07-04'`** → first public player sees "day 86 · streak 1". Now-or-never (moving it later renumbers everyone). | keep / move to 09-27 / move to deploy date | Your call; if moved, do it as its own commit before deploy. |
| D7 | **`playmatchcut.com`** serves Vercel `DEPLOYMENT_NOT_FOUND` under HSTS. | attach to project as redirect → apex | Fix before 09-27 (dashboard, ~5 min, own approval). |
| D8 | **Franchise-shaped Connections groups** (launch day's grid has `actor: Maggie Smith` = 4 Harry Potter films; 47 such groups in the year). | accept / dealer post-filter + re-bake | **Accept for launch**; it's a dealer change, not a quick win. |
| D9 | **URL-in-share + noindex timing** (Approval 5). Smoke test pins `noindex` (`delivery-smoke.spec.ts:76`) — the removal is a two-file diff. `p3-matrix` asserts URL-free too. | ~09-20 both together | ~09-20, paired, one commit. |
| D10 | **Dependabot freeze.** Five open PRs incl. `vite 6→8`, `plugin-react 4→6`. | close/snooze until post-launch | Snooze; security lockfile bumps only. |
| D11 | **Small-phone layout pass** (§3, four P1/P2 items at 375×667 fail in the same direction). | spot fixes vs one vertical-rhythm pass on the daily-mode shell | One pass, UI wave → checkpoint with side-by-sides, only if it fits before D2's freeze. |

## 2. Quick wins — executable now, no rule/scoring change, no design call

**Batch Q-copy (one commit; copy/a11y one-liners; no menu bytes; smoke + verifies):**

| # | file | change |
|---|---|---|
| Q-c1 | `src/components/ShareCopy.tsx:15-19` | `if (copy === 'idle') return` → `if (copy !== 'copied') return` — the manual-copy fallback currently deletes itself after 2.2 s (P1). Extend the smoke case to assert `[data-share-fallback]` persists. |
| Q-c2 | `src/ChronologyGame.tsx:1054` | pluralise "1 strokes". |
| Q-c3 | `src/ConnectionsGame.tsx:334,381` | pluralise "1 mistakes left" (aria + desktop rail). |
| Q-c4 | `src/ChronologyGame.tsx:352` + `RULEBOOK.md` | exact-date tie branch: when neighbours share an identical `releaseDate`, say "same release day — tiebreak" instead of "decided by exact date" (fires 2026-10-29: Gladiator II / Wicked). Same pass updates the RULEBOOK sentence. |
| Q-c5 | `src/components/Results.tsx:105` | "Solved in -1, par 9" → "Score −1 · par 9 (…)" wording. |
| Q-c6 | Duel `ResultMeaning` detail | ASCII hyphen → en dash in "played – held" (one char, DuelGame.tsx). |
| Q-c7 | `App.tsx`, `ConnectionsGame.tsx:388`, `HowToPlay.tsx:135,137`, `Results.tsx:152` | normalise apostrophes to `’`; "Today's bill" sentence case both places. |
| Q-c8 | `index.html` | add `<meta name="apple-mobile-web-app-title" content="Match Cut" />` (HTML only, no JS bytes). |
| Q-c9 | `src/components/HowToPlay.tsx:54` | rewrite the "216-film pool from September 27" build-log clause as player copy. |
| Q-c10 | Connections/other loss result | on a loss print "played N" (or append "showing up counts") instead of "streak N" — copy only; the streak arithmetic is documented and stays. |
| Q-c11 | `src/components/ScoreRace.tsx:132-147` | compact (375) header: `aria-label`s on both numerals incl. "show ends at 20" (Duel chunk only). |
| Q-c12 | `src/ConnectionsGame.tsx:117` | `tileFontSize` divisor `91→86` so "CHINATOWN" stops breaking mid-word at 375 — **loop all baked grids first** to confirm no title regresses. |

**Batch Q-safety (needs D5 first):**

| # | change |
|---|---|
| Q-s1 | `src/main.tsx`: `vite:preloadError` handler (preventDefault, one-shot sessionStorage guard, reload) ≈150 B — covers the stale-tab-after-deploy blank page. |
| Q-s2 | ~25-line `ErrorBoundary` around `<App />` with a reload affordance ≈400 B — fails `check:bundle` until D5. Add a smoke case that aborts `SoloGame-*.js` and asserts the page isn't blank. |
| Q-s3 | `.github/workflows/ci.yml`: add `verify:analytics` + `verify:progress` steps (seconds). |

**Batch Q-ops (docs/config; some need their own approval):**

| # | change |
|---|---|
| Q-o1 | Runbook fixes: deploy from a **clean clone** (`.vercelignore` doesn't exclude `promo/`, `output/`, `design/`, `tools/`, `dist-e2e/` → Tailwind drift), `npx vercel whoami` first (token refresh), `npx --yes vercel@59.11.1 deploy --prod --yes`, served-SHA check via `vercel inspect` meta + hash compare against the `.vercelignore`-clean rebuild (expect `index-mVMzX4p-.js` / `index-C6yCZ_ke.css`, NOT the in-tree hashes), rollback command + **current** target `dpl_8SighytERqgygRYvbf1eMyLis6SL`, point `verify:preview-security --url=https://matchcutdaily.com` and the matrix at prod post-deploy, first-hour watch list, abort criteria pointer. |
| Q-o2 | Promote `scratchpad/p3-matrix.mjs` → `scripts/prod-smoke.mjs` (`--root`, `--base`, `--seed`, `clock.install`) → enables (a) the **clock-shifted 09-27…09-30 dress rehearsal** (the 216 deal has never been played in a browser except once in review B's simulated clock), (b) a daily GH-Actions production smoke at ~00:20 ET that opens an issue on failure, (c) the checklist's live four-mode matrix. Highest-leverage engineering item. |
| Q-o3 | `vercel.json`: `Cache-Control: public, max-age=31536000, immutable` on `/assets/(.*)` (today every hashed asset revalidates). Header change → re-opens the security checklist (own commit). |
| Q-o4 | `public/.well-known/security.txt` (4 lines) · web app manifest (CSP already reserves `manifest-src`) · `robots.txt` + `sitemap.xml` **with Approval 5, not before**. |
| Q-o5 | Rollback drill script (in review D §5) — run once after deploy, record the seconds. |
| Q-o6 | Stale-docs pass (review A §4 lists every line: checkpoint §14/§15, release checklist boxes/counts, attended-acceptance candidate SHA, master-plan ledger v6, BACKLOG.md reconcile) + **docs-only commit of the untracked receipts/prompts** — the whole A3–A5 evidence chain is one `git clean` from gone. |
| Q-o7 | `sim/solo-verify.ts`: add a **non-blocking readout** "face-readable winning lines per day" (see §4 R1) — an instrument, not a gate. |
| Q-o8 | Calendar: TLS cert expires **2026-10-03** (auto-renew check ~09-20) · TMDB re-audit due 2027-01-05 · Connections bake ends **2027-07-05** (extend before any published-daily pin lands) · re-confirm the two forward-dated 2026 Chronology films (Super Mario Galaxy 04-01, Spider-Man: Brand New Day 07-31; dealt 10-16 / 10-20). |

## 3. Small-phone layout items (D11 — design call, not one-liners)

At **375×667**: Solo pile card's top 14 px sits under the header (year half-covered; at 200 % text the year and title vanish) · Solo "NO LINK YET · FLIP FOR CREDITS OR CHOOSE ANOTHER TICKET" overprinted by the raised card · Chronology board leaves ~30 % of the viewport empty between reel and tray (27 % at 390) · Duel hand fan hides 6 of 7 titles ("ETERNAL OF THE MIND"). Contrast: amber `#CF952A` text on cream is 2.2:1 (eyebrows everywhere) → needs an amber-ink token split; card "FLIP FOR CREDITS" slate at 2.4:1 and 6.5–8.5 px. Screenshots in `review-B-shots/`.

## 4. Risks to carry into Approval 4

- **R1 · 216 findability (biggest, unmeasured).** All 35 first-month Daily Puzzles are solvable, par in bounds, gates 8/8 · 42/42 · 14/14 · 64/64. But on **26 of 35 days every winning line needs ≥1 credit the card faces never show** (deepCast/writers are not rendered); 8 days have exactly one winning order; day two (09-28) and 10-01/10-04 have an *invisible only opener*. Day one (09-27) is excellent. Not a bug — deep cuts are a designed mechanic — but a launch-week "unfair vs hard" retention risk no gate measures. Q-o7 instruments it; any tuning response is a W5-class decision, not a quick win.
- **R2 · 2026-10-29 Chronology coin flip** (identical release dates, id tiebreak; message currently false) → Q-c4. 4 such days/year; 25 exact-date pairs in the pool (list in review E §7).
- **R3 · No monitoring, ever.** Nothing watches production; on Hobby even event volume is blind. Q-o2 + a curl canary.
- **R4 · Rollback never drilled**; recorded target one deployment stale. Q-o1/Q-o5.
- **R5 · No error boundary** → stale tab after a deploy = blank page. Q-s1/2 (gated by D5).
- **R6 · Cutover rolls around the globe over ~26 h** (local-date seed): UTC+13 sees the 216 board while UTC−7 still deals legacy. Correct by design; name it in launch copy.
- **R7 · Evidence chain untracked** (receipts, prompts, audit trees) → Q-o6.

## 5. Proposed sequence

1. **Today:** D1, D5, D6 answered → Batch Q-copy (one commit, smoke + verifies) → Q-s1/s2/s3 (one commit) → Q-o1 runbook + Q-o6 docs-only commit.
2. **Then:** Q-o2 prod-smoke + clock-shifted 09-27…30 dress rehearsal (against a local serve of the exact deploy SHA, then against prod after deploy).
3. **Approval 4 (09-04/05):** clean-clone `--prod` deploy → post-deploy gate + matrix vs prod → Q-o5 rollback drill → update rollback target.
4. **Soak:** lanes A–E on production (D3), daily prod smoke live, D7 domain fix, D11 layout pass only if it fits before the freeze.
5. **Approval 5 (~09-20):** noindex removal + URL-in-share + robots/sitemap, one commit, then 72-h freeze.

Everything in §2 is proposal-only until approved; nothing was applied.
