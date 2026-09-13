# Match Cut — gameplay shot list (Phase 0)

Written 2026-08-31. Governs Phase 0-captures. §0 of
`docs/promo-execution-prompts.md` is in force — especially the **spoiler rule**
(never the current or upcoming date's real daily deal) and the **cutover rule**
(first 216-pool Daily is 2026-09-27).

## Ground rules for the capture session

- **Baseline size: 390×844** (deviceScaleFactor 3 → 1170×2532). One shot also
  wants a 375×667 variant, marked below.
- **Sources.** Every shot names its deal source: `practice` (menu practice
  affordances) or `past-date daily` (a date **before** today). The daily seed is
  the player's local calendar date (`src/lib/daily.ts`) with **no URL override**
  — past dates need the rig to fix the clock (Playwright `page.clock`) *before*
  page load. Never set a future date: post-cutover dailies are real, unplayed
  deals — capturing one violates the spoiler rule.
- **Pool flags.** The working tree is the 216+16 cutover candidate, so the dev
  server already deals Duel/practice from the **216 pool** — Duel captures made
  now match post-cutover reality (they show content not yet live in prod;
  flagged per shot). Past-date dailies (≤ 2026-09-26) pin to the legacy 89 pool
  → those captures are **legacy-bound**. Chronology and Connections moments are
  pool-agnostic per §0. Share text contains no movie titles, so share-text
  shots are pool-agnostic regardless of the deal behind them.
- **DEV boot param:** `?mode=solo|duel|chronology|connections` lands straight in
  a mode's daily start (dev-only, `src/App.tsx`). Practice starts still need a
  menu click, or extend the rig to drive the menu.
- **Fresh profile per shot** unless noted: localStorage carries streaks, the
  daily passport, and the last-picked Duel difficulty (`matchcut:v1`).
- No dev-only UI in frame (devAssertions banners, HMR badges). Keep the TMDB
  attribution visible if the rules modal appears (it does in no shot below).

## The shots

### 1 · Menu — "Tonight's Program"
- **Mode:** menu (all four).
- **State:** fresh profile, top of the menu: Match Cut header, daily passport
  row, all four mode cards with spine colors + practice rows visible.
- **Why it sells:** the storefront — four games, one ritual, one glance; it's
  the social-preview promise kept in real UI.
- **Size:** 390×844.
- **Source:** none needed — the menu shows no deal content. Spoiler-safe.
- **Pool:** **pool-agnostic** (no movie titles rendered).

### 2 · Daily Puzzle — the opening deal
- **Mode:** Solo (Daily Puzzle).
- **State:** board just dealt, nothing played: starter card up, 7-card hand
  fanned, par chip and day label visible. Let the deal stagger finish.
- **Why it sells:** "this is the daily" — the whole premise (a dealt hand, a
  par, one try) in a single frame.
- **Size:** 390×844.
- **Source:** **practice** (the fixed marquee-001 warm-up hand — stable and
  spoiler-safe). If the practice badge reads too loudly in frame, fallback:
  past-date daily (suggest 2026-08-24) via clock override.
- **Pool:** **legacy-bound** either way (practice hand is the designed legacy
  hand; past dates pin to legacy 89). Static-asset use only per §0.

### 3 · Daily Puzzle — a link landing (combo moment)
- **Mode:** Solo.
- **State:** mid-run, playing a card onto the line: the shared-person link
  label showing (actor/director connecting the two titles), combo/score chip
  ticking. Capture at the moment the link line is legible.
- **Why it sells:** the core verb — *connect movies by the people who made
  them* — shown, not told.
- **Size:** 390×844.
- **Source:** **practice** (marquee-001; its solve line is stable, so the rig
  can script the same two plays every run).
- **Pool:** **legacy-bound** (titles + a person name in frame).

### 4 · Duel — the board (hero shot)
- **Mode:** Duel, Matinee.
- **State:** mid-game, your turn: navy header with both scores + race bar
  partly filled, Taz's booth with quote and card pips, marquee piles up, meld
  shelf populated (2–3 melds), 7-card fan. The 7a master composition, live.
- **Why it sells:** the flagship screen — the Stub design language at full
  density; instantly reads as "a real game, not a quiz."
- **Size:** 390×844, **plus a 375×667 variant** (the 7e compact layout proves
  the game fits small phones — useful crop for ads).
- **Source:** **practice** (all Duel play is practice; no daily exists).
- **Pool:** **216-pool** — survives the cutover; shows content not yet in prod
  (acceptable: nothing is posted before launch, and this tree is the candidate).

### 5 · Duel — Matinee take-glow, meld completing
- **Mode:** Duel, Matinee (the glow is a Matinee-only aid — higher tiers
  never show it; `takeGlowEnabled`, `src/DuelGame.tsx`).
- **State:** the marquee card glowing amber with the "↑ TAKE" pill while two
  hand cards are selected toward a meld — the take-to-meld discovery moment.
  Ideally capture the beat where the taken card completes the meld.
- **Why it sells:** the game's most satisfying interaction plus the amber
  action language doing its job — you can *feel* the tap from a still.
- **Size:** 390×844.
- **Source:** **practice** (Duel).
- **Pool:** **216-pool** (as shot 4).

### 6 · Chronology — a card landing in its year slot
- **Mode:** Chronology.
- **State:** mid-round: timeline holding 3–4 placed films, a card just dropped
  into its correct slot showing the clean-placement (🟩) feedback and the
  revealed year.
- **Why it sells:** zero-explanation gameplay — anyone who has argued about
  what came out first gets it in one frame.
- **Size:** 390×844.
- **Source:** **practice** (Wide pill — decades-apart spread reads clearest in
  a still; the deal is random, so the rig captures whatever verified deal it
  gets, or re-deals until the frame is legible).
- **Pool:** **pool-agnostic** (§0 names Chronology moments as such).

### 7 · Connections — a group resolving
- **Mode:** Connections.
- **State:** first or second group just found: the four titles collapsing into
  their colored group row (label revealed), 12 tiles still in play below.
- **Why it sells:** the format is instantly familiar (NYT-shaped), and the
  colored-row payoff is the mode's dopamine beat — in Stub clothes.
- **Size:** 390×844.
- **Source:** **practice** (fresh random verified grid — spoiler-safe;
  non-reproducible run-to-run, which is fine for a still).
- **Pool:** **pool-agnostic** (§0 names Connections moments as such).

### 8 · Duel — endgame recap ("You win!")
- **Mode:** Duel, Matinee.
- **State:** the recap screen: "You win!" Domine headline, ticket-stub score
  rows (punched notches, navy winner row with amber score), Taz's recap reel /
  event ledger, share + deal-again pills at the bottom.
- **Why it sells:** the win screen is the brand at its purest — ticket stubs
  as scoreboard — and it previews the share loop.
- **Size:** 390×844.
- **Source:** **practice** (Duel; Matinee so a scripted run can reliably win).
- **Pool:** **216-pool** (titles appear in the ledger/recap).

### 9 · The share-grid text itself
- **Mode:** any daily mode's results share panel; **Chronology recommended**
  (its "Cleared!" screen is the family's cleanest, and Phase 1's Deliverable D
  frames a Cleared-style grid).
- **State:** the share text block as the app presents it at copy time:
  `Match Cut · Chronology` ⏎ `score N (tally)` ⏎ `🎬🟩🟩🟥🟩…` — with the
  copied/"copy" affordance visible.
- **Why it sells:** this is the organic-growth artifact — the thing friends
  will actually see in a group chat. It must look enviable bare.
- **Size:** 390×844 (tight crop planned in Phase 1; capture full frame).
- **Source:** **past-date daily** (suggest 2026-08-24) via clock override — a
  daily source avoids the `practice · ` prefix that would brand the text as
  practice in the promo frame. Past date = spoiler-safe.
- **Pool:** **pool-agnostic** — the share text carries no movie titles, only
  emoji and score words, so it survives the cutover regardless of deal source.

## Coverage check

Modes: menu ×1, Solo ×2, Duel ×3, Chronology ×1 (+share), Connections ×1 —
every mode appears; the Duel weight matches its flagship status. Pool split:
4 pool-agnostic, 3 216-pool, 2 legacy-bound — the legacy-bound pair are
statics, which §0 permits pre-cutover. All 9 sources are practice or past-date
per the spoiler rule.
