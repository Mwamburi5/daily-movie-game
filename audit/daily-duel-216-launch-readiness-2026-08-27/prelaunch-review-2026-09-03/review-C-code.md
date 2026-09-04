# Review C — pre-launch code review of the launch surface (READ-ONLY)

Repo: `/Users/mwamburi/Projects/Daily Movie Game` · branch `codex/preview-gate-skip-toolbar` @ `6b758b0`
Date: 2026-09-03 · Node v24.14.0

Gates run this session (all read-only, all green):

| gate | result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm run verify:solo` | 8 passed, 0 failed (incl. the 09-26→89 / 09-27→216 pin) |
| `npm run verify:analytics` | 12 valid contracts, 14 forbidden payloads PASS |
| `npm run verify:progress` | malformed/version/bounds/round-trip/storage-isolation PASS |
| `npm run check:security` | PASS (285 repo files, 26 production files) |
| `dist/bundle-report.json` (existing, 2026-09-03T00:30Z) | `pass: true`, menu **102,246 B of 102,400 B** |

---

## Ranked findings

### 1 — P1 · No error boundary anywhere in the app

**Where:** `src/main.tsx:52-63` (root render), `src/App.tsx:107-116` (the only `<Suspense>`).
Grep for `componentDidCatch|getDerivedStateFromError|ErrorBoundary|onerror|unhandledrejection`
across `src/`, `index.html`, `scripts/`, `tests/` returns **zero hits**.

**Why it matters.** `<Suspense>` handles a pending promise; it does not handle a
*rejected* one. Concrete failure scenario:

1. A player has the menu open (a daily game is exactly the kind of tab people leave open).
2. Buri promotes a new production deployment — which the runbook plans for Approval 4,
   plus any hotfix during the soak.
3. The player taps **Daily Puzzle** → `lazy(() => import('./SoloGame.tsx'))` requests
   `/assets/SoloGame-BC_05OSu.js`, a content-hashed path that is not part of the newly
   promoted deployment → 404 → the lazy promise rejects.
4. No boundary catches it, so React 18 unmounts the **entire root tree**. The player gets
   a blank cream-less white page with no message and no reload affordance. The same is
   true for any uncaught render throw inside a mode (e.g. a `movieById.get(id)!` that
   ever returns `undefined`).

The browser smoke suite does not cover this (`tests/browser/delivery-smoke.spec.ts` has no
`route()`/abort/chunk-failure test; line 690 only proves the chunks stay lazy).

**Proposed minimal change — two independent pieces, take either or both.**

*(a) Cheapest, covers the most likely trigger.* Vite's preload helper dispatches
`vite:preloadError` and it is already present in the shipped entry chunk
(`grep -o "vite:preloadError" dist/assets/index-Bzdp8_FV.js` hits). In `src/main.tsx`,
above `installAnalytics()`:

```diff
+// A promoted deployment retires the previous build's content-hashed chunks, so a
+// tab left open across a deploy 404s on its first mode load. Vite fires this on
+// that failure; reload once (sessionStorage one-shot) so a genuinely offline
+// device can't spin. Without it the lazy promise rejects with no boundary and
+// React 18 unmounts the whole tree to a blank page.
+window.addEventListener('vite:preloadError', (event) => {
+  event.preventDefault()
+  if (sessionStorage.getItem('matchcut:reloaded') === '1') return
+  try { sessionStorage.setItem('matchcut:reloaded', '1') } catch { /* private mode */ }
+  window.location.reload()
+})
```

*(b) The general safety net.* A ~25-line class `ErrorBoundary`
(`getDerivedStateFromError` + a Stub-styled card: "The reel jammed." + a reload button)
wrapping `<App />` in `main.tsx`. This is the piece that also catches render throws.

**Blast radius.** No `DuelGame.tsx`, no rules, no sim parity. **But: the menu chunk has
154 bytes of gzip headroom** (finding #4), and both pieces land in the entry chunk. (a) is
~120–160 B gzip and may just fit; (b) is ~300–450 B gzip and **will fail `check:bundle`**
unless the budget is raised in the same commit. Do not land (b) without deciding #4 first.

**Verification.** `npm run build && npm run check:bundle`; then a new smoke case:
`page.route('**/assets/SoloGame-*.js', r => r.abort())`, click Daily Puzzle, assert the
page is not blank (either the reload fires or the boundary card is visible).

---

### 2 — P1 · The manual-copy share fallback deletes itself after 2.2 seconds

**Where:** `src/components/ShareCopy.tsx:15-19` and `:49-56`.

```ts
useEffect(() => {
  if (copy === 'idle') return
  const t = window.setTimeout(() => setCopy('idle'), 2200)
  return () => window.clearTimeout(t)
}, [copy])
```

The `<pre data-share-fallback>` renders only while `copy === 'failed'`.

**Why it matters.** The timer is armed for `'failed'` as well as `'copied'`, so the
escape hatch for a blocked clipboard is on screen for 2.2 s and then vanishes — long
enough to read, not long enough to long-press, select, and copy on a phone. Concrete
path: any browser where both `navigator.clipboard.writeText` rejects **and**
`document.execCommand('copy')` returns false — an insecure origin, an in-app webview
(Instagram/Twitter browsers, which is exactly where a shared link lands), Firefox with
`dom.events.asyncClipboard.clipboardItem` disabled, or a denied clipboard permission.
Those players end the game with **no way to get their score out**, which is the entire
word-of-mouth loop on launch day.

`share_attempt: manual_fallback` is instrumented (`ShareCopy.tsx:24-28`), so Buri would
see the volume but not the cause.

**Proposed minimal diff.**

```diff
-  // Revert the transient "copied" / "failed" label back to idle after a beat.
+  // Only the transient "copied" label reverts. 'failed' must persist: it's the
+  // manual-copy fallback, and 2.2s isn't long enough to select the text by hand.
   useEffect(() => {
-    if (copy === 'idle') return
+    if (copy !== 'copied') return
     const t = window.setTimeout(() => setCopy('idle'), 2200)
     return () => window.clearTimeout(t)
   }, [copy])
```

**Blast radius.** One file, one line. Used by all four end screens. No rules, no sim, no
data. Bundle delta ≈ 0 and it lands in the **mode** chunks, not the menu, so the 154 B
menu headroom is untouched.

**Verification.** `delivery-smoke.spec.ts:186-189` already forces the fallback; extend it
by two lines:

```ts
await expect(page.locator('[data-share-fallback]')).toBeVisible()
await page.waitForTimeout(2600)
await expect(page.locator('[data-share-fallback]')).toBeVisible()  // must NOT disappear
```

---

### 3 — P1 · The deploy runbook's property-cap analysis undercounts `mode_finish`

**Where:** `docs/daily-duel-216-deploy-and-indexing-runbook.md:19-21` vs
`src/lib/analytics.ts:62-89` and `:169-190`.

The runbook says the dictionary "sends **three** properties on `mode_start`,
`first_action`, and `friction`". Reading the validator's exact-key lists, that is wrong:

| event | properties | count |
| --- | --- | --- |
| `mode_finish` (solo) | mode, kind, result, flips, score, par | **6** |
| `mode_finish` (chronology) | mode, kind, result, strokes, score | **5** |
| `mode_start` | mode, kind\|difficulty, session_mode_ordinal | 3 |
| `first_action` | mode, kind\|difficulty, action | 3 |
| `friction` | mode, kind, count_bucket | 3 |
| `mode_finish` (connections/duel), `help_open`, `help_return`, `share_attempt` | — | 2 |
| `share`, `replay` | — | 2 |

**Why it matters.** §6 of the launch checkpoint and step 4 of the Approval-4 runbook both
scope the live-dashboard confirmation to "the three-property events". If the team lands on
base Pro (2-property cap), the worst offender is `mode_finish` at 6 properties — the one
event that carries the actual outcome data, and the one nobody would check. A "3 is fine"
dashboard reading would be taken as a green light for a dictionary that has a 6-property
event in it.

**Proposed change.** Docs only — replace the "three properties on three events" sentence
with the table above, and widen step 4 to "confirm every event's properties surface,
`mode_finish` first." No source change.

**Blast radius.** Zero code. **Verification:** none needed.

---

### 4 — P2 · Menu bundle is at 99.85 / 100 KiB — 154 bytes of headroom

**Where:** `scripts/check-bundle.mjs` (`menuGzip: 100 * KIB`), current
`dist/bundle-report.json` → `menu.gzip = 102246` of `102400`.

**Why it matters.** This is not a size problem, it's a *process* problem: the next edit
that touches `App.tsx`, `HowToPlay.tsx`, `Onboarding.tsx`, `Icon.tsx`, `progress.ts`,
`analytics.ts`, `difficulty.ts` or `motion.ts` by more than ~150 gzipped bytes turns the
`build-and-budgets` CI job red — including finding #1's error boundary, i.e. the budget is
currently blocking a safety fix. It also means CI will fail for a reason unrelated to
whatever the commit was about, during launch week.

**Proposed change.** One of:

```diff
 const BUDGETS = {
-  menuGzip: 100 * KIB,
+  // Raised from 100 KiB 2026-09: the menu shell sat at 99.85 KiB, leaving 154 B
+  // of headroom — not enough for a bug fix. This is a ceiling, not a target.
+  menuGzip: 104 * KIB,
```

or explicitly declare the menu frozen and route new menu-shell code into a lazy chunk.
Either way it should be a conscious call before launch week, not a surprise red build.

**Blast radius.** One constant in a script. No runtime bytes.
**Verification.** `npm run build && npm run check:bundle`.

---

### 5 — P2 · `verify:analytics` and `verify:progress` are not wired into CI

**Where:** `.github/workflows/ci.yml`. Jobs run `build`, `check:bundle`, `check:security`,
`npm audit`, `verify`, `verify:solo`, `verify:chronology`, `verify:connections`,
`test:smoke`. Neither `verify:analytics` nor `verify:progress` appears.

**Why it matters.** Both verifiers exist, both pass, and both guard exactly the two
things this review found most fragile: the analytics dictionary (no PII, exact keys) and
the localStorage sanitiser (the thing standing between a corrupted blob and a broken
menu). A regression in either lands on `main` silently and is only caught if a human
remembers to run the script.

**Proposed change.** Two steps appended to the existing `daily-rules` job (it already has
checkout + node + `npm ci`, so this costs seconds, not a new runner):

```diff
       - name: Verify Chronology
         run: npm run verify:chronology
+
+      - name: Verify analytics dictionary
+        run: npm run verify:analytics
+
+      - name: Verify progress meta-state
+        run: npm run verify:progress
```

**Blast radius.** CI only. **Verification:** the two commands already pass locally
(receipts at the top of this file).

---

### 6 — P2 · Removing `noindex` at launch will turn CI red (the held diff is incomplete)

**Where:** `index.html:14` and `tests/browser/delivery-smoke.spec.ts:69, 76`.

```ts
test('social discovery metadata is complete while indexing stays closed', ...)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
```

**Why it matters.** The Approval-5 held diff in
`docs/daily-duel-216-deploy-and-indexing-runbook.md:77-82` is presented as a single
`index.html` line. Applying only that line fails the `browser-smoke` job, on launch day,
on the one commit that must not be blocked. Also note the test's *name* asserts the quiet
phase, so the fix is a rename, not just an assertion flip.

**Proposed change.** Pre-write the paired edit into the runbook's §3a held diff:
rename the test to `'social discovery metadata is complete and indexing is open'` and
replace line 76 with `await expect(page.locator('meta[name="robots"]')).toHaveCount(0)`.

**Blast radius.** One test + one HTML line, both already inventoried as a launch switch.
**Verification.** `npm run test:smoke` (owned by another reviewer this session).

---

### 7 — P2 · `DAILY_EPOCH` makes the first public player see "day 86"

**Where:** `src/lib/progress.ts:24` — `const DAILY_EPOCH = '2026-07-04'`, consumed by
`dayNumber()` at `:197-199` and rendered by `Results.tsx:129` (`day {daily.day} · streak
{daily.streak}`) and the sibling end screens.

**Why it matters.** `dayNumber('2026-09-27')` = 86. A brand-new player finishing the very
first *public* daily sees **"day 86 · streak 1"**. The constant's comment calls it "Day 1
of the public count — the WS1 ship date", but WS1 never went public (prod is still
`c063f26`, the site is `noindex`), so the epoch dates a private build.

Two readings, and they point opposite ways — this is a Buri call, not a bug:
- *Keep 07-04*: the number reads as "this game has been running a while", Wordle-style.
- *Move to 09-27*: "day 1" on launch day is honest and gives the launch a marker.

Mechanically the change is safe and cheap — `dayNumber` is derived from the seed and
**nothing is persisted**, so no migration is involved. But it is **now-or-never**: once
players have seen day numbers, moving the epoch renumbers everyone retroactively.

**Proposed change (if Buri picks the second reading).** One constant + its comment. Do
**not** fold this into another commit.

**Blast radius.** One line. No rules, no sim, no storage. Cosmetic on three end screens.
**Verification.** `npm run verify:progress` (the epoch is not pinned there — worth adding
a `dayNumber('<epoch>') === 1` assertion in the same commit).

---

### 8 — P3 · `DuelGame`'s `lowerTimer` is the one timer with no unmount cleanup

**Where:** `src/DuelGame.tsx:509-515` sets `lowerTimer.current`; it is cleared at `:511`
(re-arm) and `:1370` (`newGame`) but never on unmount. Compare `src/SoloGame.tsx:105-111`
and `src/ChronologyGame.tsx:220-226`, which both have the cleanup effect.

**Why it matters.** Exiting to the menu within 650 ms of an invalid play leaves a pending
`setRaisedId` on an unmounted component. React 18 no longer warns and does not leak
meaningfully, so this is consistency, not a defect — but it's the single outlier in an
otherwise clean sweep (every other `setTimeout`/`matchMedia` listener in the four mode
files has a cleanup return).

**Proposed change.** Mirror SoloGame's block near the other Duel effects:

```diff
+  useEffect(() => () => window.clearTimeout(lowerTimer.current), [])
```

**Blast radius.** Touches `DuelGame.tsx` — one added line, no state, no rules, no sim.
Per CLAUDE.md this is worth doing only if something else is already opening that file.
**Verification.** `npx tsc --noEmit`.

---

### 9 — P3 · `Results.tsx:160` keys the solution list by title string

`solution.map((step, i) => <div key={step.title}>` — `step.title` is `` `${m.title} (${m.year})` ``
(`SoloGame.tsx:121-130`), so a collision needs two identical title+year strings in one
board, which `dailySoloPuzzle`'s `used` set already prevents. Safe today; `key={`${i}-${step.title}`}`
is free and removes the dependency on that invariant. Mode chunk, ~0 bytes.

---

### 10 — P3 · Dead / vestigial (mention-only per CLAUDE.md — I did not touch these)

- **No ESLint is installed** (`package.json` has no eslint dep, no config file in the
  repo root), yet `// eslint-disable-next-line react-hooks/exhaustive-deps` appears in
  `SoloGame.tsx:276`, `ChronologyGame.tsx:277/318`, `ConnectionsGame.tsx:173/208`,
  `DuelGame.tsx:1333/1362/1425`. They document intent, which has value — but nothing
  enforces the rule they suppress.
- `ProgressV1.seenIntro` (`progress.ts:46`) is retired-but-round-tripped, correctly
  commented. Leave it.
- Chronology and Connections have no equivalent of Solo's `initialDailySeed()` E2E
  `?dailySeed=` override (`SoloGame.tsx:29-35`), so only Solo can be date-pinned from the
  browser suite. That's why the 09-26/09-27 cutover is proved in `sim/solo-verify.ts` and
  not in a browser — fine, but note it if anyone wants a browser-level launch-boundary test.

---

## The Hobby-analytics recommendation

### What actually happens on Hobby

The repo already answers this, and it is stronger than "properties get trimmed."
`docs/daily-duel-216-deploy-and-indexing-runbook.md:12-17` carries the plan table:

| | Hobby | Pro | Pro + Web Analytics Plus | Enterprise |
|---|---|---|---|---|
| Custom events | **not included** | included | included | included |
| Properties per custom event | **—** | **2** | **8** | 8 |
| Included events | 50k/mo (page views only) | usage-billed | usage-billed | custom |
| Reporting window | 1 month | 12 months | 24 months | 24 months |

So on Hobby the question is not "are properties stripped" — **custom events are not a
Hobby feature at all.** All nine journey events go unrecorded; the project gets page views
and nothing else. `installAnalytics()` still injects `/_vercel/insights/script.js`
(`analytics.ts:242-246`) and `track()` still pushes into `window.va`, so beacons are sent
and discarded server-side.

**The load-bearing consequence: folding properties into event names buys nothing on
Hobby.** A 12-name, 0-property dictionary is still a custom-event dictionary, and custom
events are the part the plan excludes. Any "smallest safe change" that keeps signal on
Hobby does not exist in code — it is a billing decision.

*Labelled speculation (I could not verify these from the repo or from Vercel docs I can
cite):* (i) whether the collector rejects the custom-event beacon at the edge or accepts
and drops it; (ii) whether those beacons consume any of the Hobby 50k/mo included events;
(iii) on base Pro, whether an over-cap event drops the extra properties or drops the whole
event — the runbook at line 30 says the custom-events doc does not define this either, and
step 4 of the Approval-4 runbook already exists to settle it on the live dashboard.

### Recommendation, in order

1. **Do nothing to the code until Buri names the plan.** The dictionary is already
   correct, validated, PII-free and CI-adjacent; redesigning it against an unknown cap is
   how you end up with two wrong designs. The runbook's own §6 "no silent dictionary
   redesign" rule is right.
2. **If the plan stays Hobby:** accept page-views-only for launch. Leave `track()` and
   `journeyAnalytics.ts` exactly as they are — they cost nothing at runtime, and they
   start reporting the moment a plan upgrade lands, with zero code change. Fix finding #3
   (the runbook's undercount) so the record is accurate. Consider softening the
   `HowToPlay.tsx:374-376` privacy line ("records anonymous page views **and a small set
   of journey events**"), which currently over-describes what is collected — that's the
   safe direction to be wrong in, so it is optional.
3. **If the plan is base Pro (2-property cap) and Buri does not want the +$10/mo Plus
   add-on:** the smallest safe fold is **move `mode` out of the payload and into the event
   name**, uniformly, for the four events that exceed 2:

   | today | after the fold | properties after |
   | --- | --- | --- |
   | `mode_start` {mode, kind\|difficulty, ordinal} | `mode_start_solo` … `mode_start_duel` | 2 |
   | `first_action` {mode, kind\|difficulty, action} | `first_action_solo` … `first_action_duel` | 2 |
   | `friction` {mode, kind, count_bucket} | `friction_solo` … `friction_duel` | 2 |
   | `mode_finish` {mode, kind, result, flips, score, par} | `mode_finish_solo` … | see below |

   `mode_finish` cannot be folded to 2 by name alone — solo carries four outcome fields.
   The honest 2-property shape is `mode_finish_solo` with `{kind, result}`, and the
   numeric outcome (flips/score/par) either goes into a **bucketed** second event
   (`solo_score_under_par` / `_even` / `_over`, 0 extra properties) or is dropped. That is
   a real loss of the golf-distribution signal and is a Buri call, not a mechanical fix.

   Why fold `mode` and not the ordinal/action: `mode` has exactly 4 values, so it produces
   4 names per event (16 total) instead of 13+ for `action`; and every dashboard question
   is already "per mode", so mode-as-name matches how the data gets read.

   **Verifier change this implies** (`scripts/verify-analytics.ts` + `src/lib/analytics.ts`):
   - `AnalyticsEventName` becomes the folded name union; `AnalyticsDataMap` keys follow.
   - `isValidAnalyticsEvent` gains a name→mode decode (`mode_start_solo` → `'solo'`) before
     the existing `validIdentity`/`hasExactKeys` checks, and `identityKeys()` drops `'mode'`.
   - Add a **new assertion class** to the verifier: for every valid contract,
     `Object.keys(data).length <= 2` — i.e. the property cap becomes a *tested invariant*,
     not a doc note. That single assertion is the thing that prevents this recurring.
   - `delivery-smoke.spec.ts:159-199` pins literal event names in four places and must be
     updated in the same commit.

   Blast radius of the fold: `analytics.ts`, `journeyAnalytics.ts`, the ~10 `track()` call
   sites across four mode files (including `DuelGame.tsx`), the verifier, and the smoke
   spec. It is **not** a small commit and it is **not** a launch-week change. Only worth
   doing if the plan is base Pro *and* the +$10/mo Plus add-on is refused.
4. **Cheapest path to the signal Buri actually wants:** Pro + Web Analytics Plus fits the
   dictionary as written with headroom (8-property cap), and costs one line of code:
   none.

**PII check (independent of plan): clean.** Every `track()` payload is validated against
fixed enums and bounded safe integers before `window.va` is called
(`analytics.ts:159-229`). `hasExactKeys` rejects *any* extra key, and the verifier's
forbidden list explicitly proves that `movie_id`, `seed`, free text (`text: 'please help'`,
`clipboard: 'movie titles'`) and `localStorage: {streak: 7}` are all rejected. No seed, no
movie id, no person name, no score outside the bounded integers, no free text, no device
id. The `HowToPlay.tsx:364-386` disclosure matches.

---

## Not quick wins (need a design / rule / product decision)

1. **The share text carries no day number and no URL.** `matchCutShare()`
   (`lib/share.ts:6-8`) emits `Match Cut · <Mode>` / score line / emoji row. Two people
   who post their results cannot tell whether they played the same board, and a reader has
   no way to find the game. `Results.tsx` *knows* the day (`daily.day`) and does not put
   it in the share string. Adding "day N" is three one-line edits, but it changes the
   byte-identical brand-line contract (§7·7c) and interacts with the URL-in-share launch
   switch — one decision, not two. I'd rate this the single highest-leverage share change
   available, and I am deliberately not proposing a diff.
2. **Analytics plan/dictionary** — see above; spend vs signal.
3. **`DAILY_EPOCH`** (finding #7) — listed as a finding because the *code* change is
   trivial, but the choice is Buri's and the window closes at launch.
4. **Duel first-player tilt (~7pp, memory: open since 2026-07-03)** — rules territory,
   invalidates tuning, explicitly out of scope for a "cheap correctness wins" pass.
5. **Solo `MAX_ATTEMPTS` throw** (`lib/daily.ts:84`): if a future pool change ever made a
   seed undealable, `dailySoloPuzzle` throws during render and — with no error boundary —
   blanks the page. `verify:solo` pins 365 seeds from the cutover anchor, so it cannot
   happen with today's pool; the right mitigation is finding #1, not a change here.

---

## Checked and FINE (so nobody re-checks these)

**Dates / timezones**
- `localDateSeed()` (`daily.ts:17-22`) reads local calendar fields only — DST-immune by
  construction (no arithmetic on wall-clock ms).
- All streak math is `Date.UTC` on the seed string (`progress.ts:181-199`), so `prevSeed`
  is correct across month ends, year ends, and leap days, and never consults the local
  clock. Verified by reading, and `verify:progress` covers the bounds cases.
- **Midnight mid-game is handled**: all three daily modes freeze the seed at mount in a
  ref (`SoloGame.tsx:56`, `ChronologyGame.tsx:119`, `ConnectionsGame.tsx:136`), so the
  deal and the `recordDailyFinish` write can never key off different days.
- **The 09-27 cutover is clean.** `dailyDuelPoolForSeed` (`duelPool.ts:183-185`) is a
  lexical compare on ISO strings, no persisted state, no `Date` object. A player in UTC+13
  gets the 216 pool ~23 h before a player in UTC−10 — that is the *intended* "same board
  on your own calendar day" rule, not a bug. `verify:solo` #3 pins `2026-09-26 → 89` and
  `2026-09-27/28 → 216`.
- Device clock skew: a wrong clock yields a valid-but-wrong seed; `validSeed` accepts any
  real date ≥ 2000. Worst case is one bogus streak entry on that device. Not worth code.

**Persistence**
- `progress.ts` is the only `localStorage` consumer in `src/`. `loadProgress` wraps
  `getItem` + `JSON.parse` + `sanitizeProgress` in one try/catch; `save` wraps `setItem`
  (Safari private mode / quota both degrade to "no memory"). Both paths tested by
  `verify:progress`.
- Nothing rule-affecting is persisted. `lastDifficulty` is a picker default handed to
  DuelGame as a prop; `seenOnboarding`/`seenDragPlay` are UI gates. Confirmed by reading
  every consumer of `progress.ts` (App.tsx, the four mode files, Results).
- Version key: `v !== 1` → `fresh()`. Additive optional fields survive. The comment at
  `:17-19` correctly flags that a *key* rename would need a read-old-write-new migration.

**Share**
- URL-free in all four modes (`matchCutShare` takes only mode/scoreLine/emoji).
- Emoji rows are derived from the play/guess log, one glyph per move
  (`SoloGame.tsx:132-135`, `ChronologyGame.tsx:1016`, `ConnectionsGame.tsx:755-757`), so
  row length always matches the run.
- No `navigator.share` anywhere — nothing to guard.
- The clipboard fallback chain (`share.ts:14-37`) is correct; only its *lifetime* is
  wrong (finding #2).

**Error handling / console**
- Zero `console.log/warn/error` in production source. The three `console.info` calls live
  in `devAssertions.ts`, dynamically imported behind `import.meta.env.DEV`; confirmed
  absent from `dist/assets/*.js`.
- The `?preview=` harness and its 12 `.preview.tsx` modules are DEV-gated and provably
  tree-shaken (`grep "No preview named" dist/assets/*.js` → no hits).
- The `VITE_E2E` completion seam is enforced out of the normal build by
  `check-bundle.mjs`'s `seamMarker` check.
- No unhandled-rejection sources: `track()` and `JourneyAnalytics.emit` both swallow.

**Performance / robustness**
- Lazy split is real: `dist/assets/` has one chunk per mode plus a shared `movies-*.js`;
  the menu ships no mode code and no movie pool. `check-bundle.mjs` enforces menu ≤100 KiB
  and cold-mode ≤250 KiB from Vite's manifest, and the smoke suite pins laziness.
- Timer/listener cleanup: every `setTimeout` inside an effect returns a clear, every
  `matchMedia`/`keydown` listener is removed, every `requestAnimationFrame` is cancelled
  (`ChronologyGame.tsx:220-226` cancels both the flip timer and the auto-scroll rAF).
  The one exception is finding #8.
- StrictMode double-invoke is safe: `JourneyAnalytics.entryStarted` guards `mode_start`
  (asserted in `verify-analytics.ts:18-21`), and `recordDailyFinish` is once-per-seed
  (`progress.ts:219-221`).
- No fonts are preloaded — deliberate, with a comment at `index.html:53-55` explaining the
  Safari false-positive. Correct call.

**Security**
- `vercel.json` and `security-headers.ts` are byte-consistent; `check:security` passes;
  CSP is `default-src 'none'` with `script-src 'self'` and no `unsafe-inline` on scripts.
  `style-src-attr 'unsafe-inline'` is required by Framer Motion and correctly scoped to
  attributes. **I found no hole and propose no CSP change.**
- `npm audit` runs in CI; the browserslist advisory was closed by `6b758b0`.

**Docs**
- `RULEBOOK.md` header (updated 2026-08-27) states the 89→216 cutover and the
  2026-09-26/27 boundary correctly, matching `duelPool.ts`. Line 81 matches the code.
- `README.md` is accurate; its script table omits `verify:analytics`, `verify:progress`,
  `check:security`, `check:bundle` and `test:smoke` — worth one line if anyone is editing
  it, not worth its own commit.
- No `sim/RULESET.md` parity concern surfaced. Nothing I propose touches a rule, a score,
  a deal, or a difficulty knob; `verify` (64 sims) is not implicated by any finding above.

---

## Least confident

Finding #1's exact trigger. I'm confident there is no error boundary and confident that an
unhandled lazy rejection blanks a React 18 tree; what I could not verify without a
production network is Vercel's precise behaviour when the promoted alias is asked for a
previous deployment's content-hashed asset (404 vs. some fallback). If Vercel happens to
serve old build assets on the alias, the deploy-window scenario softens and the boundary
becomes ordinary insurance rather than a launch-week fix — the recommendation doesn't
change, only the urgency. I'm also relying on the runbook's plan table (not a live
dashboard) for "Hobby = no custom events", and on inference for whether Hobby beacons burn
the 50k allowance.

## What Buri might be missing

The 154-byte menu budget headroom is quietly the most consequential fact in this review:
it means the app is currently in a state where the cheapest safety fix available cannot be
merged without a budget edit, and where a routine copy tweak on the menu turns CI red
during launch week. It has been converting a size *target* into a shipping *freeze* without
anyone deciding that. Decide #4 before you decide anything else here — it gates #1. The
second thing: the analytics work is a sunk asset either way. If the plan stays Hobby, the
correct move is to leave every line of it alone and change nothing; the temptation will be
to "make it work on Hobby", and there is no code shape that does.
