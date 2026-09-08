# Phase 0-docs checkpoint — promo foundations

Written 2026-08-31. STOP point per `docs/promo-execution-prompts.md` §0 —
Buri reviews before Phase 0-captures runs.

## Produced

- `promo/brand-sheet.md` — one-page promo brand kit: two-layer palette (game
  tokens + marketing canvas), mode spine colors, type stack, stub-motif
  anatomy, mark usage, approved copy, do/don't, and the Canva Brand Kit setup
  (palette entries, font plan with researched substitutes, upload assets).
- `promo/shot-list.md` — 9 numbered shots covering all four modes + menu +
  share text, each with mode, exact state, sales rationale, size, spoiler-rule
  source, and pool flag. Includes capture-session ground rules (clock override
  for past dates, fresh profiles, dev boot param, no dev UI in frame).
- This checkpoint.

Guardrails held: no tracked file touched, nothing staged/committed, all output
is new untracked files under `promo/`. Note for the launch-readiness resume
session: `promo/` in `git status` is expected promo-track output.

## Open questions for Buri

1. **Which amber does the Canva kit lead with?** §0 canon says `#CF952A`
   (in-game amber), but every marketing-canvas gold — spine, CTA pill, marquee
   rule — is `#DDA321`. The brand sheet enters both and leads with §0's; if
   promo assets should match the social preview instead, flip the order.
2. **The 08-20 evergreen-practice-removal ruling is still unexecuted** (memory
   flag). Six of nine shots source from practice modes. If that ruling removes
   or reshapes practice affordances, the shot list's spoiler-safe sourcing
   needs a re-cut — please confirm practice modes survive before captures run.
3. **Duel captures will show the 216 pool** (the working tree is the cutover
   candidate). That's post-cutover-correct but ahead of prod. OK, or should
   Duel shots wait / run against the deployed legacy build?
4. **Wordmark treatment:** the marketing wordmark is bold *italic* serif, but
   Domine has no italic. The sheet's interim rule is "crop it from
   social-preview.png as an image asset." Want a properly re-set promo wordmark
   instead (would be a Phase 1 design task)?
5. **Menu as shot 1:** the goal asked for gameplay moments; I included the
   menu as the storefront shot. Cut it if you want pure gameplay (list stays
   at 8).

## Red pen — every judgment call made

- **Palette presented as two layers** rather than one merged list. The repo
  genuinely has two (Stub tokens vs. `social-preview.svg`), and §0's canon line
  itself mixes them (game navy/amber + marketing cream `#f4efe6`). I transcribed
  §0 as "promo primaries" and documented both layers beneath, rather than
  silently reconciling hexes.
- **Mode spine hexes taken from `social-preview.svg`**, not the PNG — the SVG
  is the authorable source with exact values (`#DDA321/#6EA6A0/#B66B79/#755B99`).
  §0 only names them by color word.
- **Canva font plan leads with uploading the real fonts** (Pro feature; all
  three faces are OFL) and demotes substitutes to a fallback. The goal asked
  for substitutes; I researched them but judged exact-font upload the better
  primary path. Substitutes named: Inter and JetBrains Mono are in Canva's
  library (use directly); Domine unconfirmed → Bitter / Roboto Slab / Libre
  Baskerville in that order. Bitter-first is my call from type knowledge
  (closest slab voice), not a Canva-documented equivalence.
- **Repo woff2 fonts flagged as un-uploadable** — Canva accepts OTF/TTF/WOFF
  only, so the sheet says download TTFs from Google Fonts.
- **Past-date deals via Playwright clock override** — the app has no seed/date
  URL param (daily seed = local calendar date), so I specified the rig fixes
  the clock, and I banned future dates as spoilers. Suggested past date
  2026-08-24 is arbitrary (a week back, pre-cutover, pinned legacy).
- **Share-text shot sources from a past-date daily, not practice**,
  specifically to avoid the `practice · ` marker branding the promo share text
  — and I classified share-text as pool-agnostic because `src/lib/share.ts`
  emits no movie titles. That classification is mine, not §0's.
- **Solo opening-deal shot prefers the fixed practice hand** over a past-date
  daily for reproducibility, accepting the visible practice affordance in
  frame; the past-date fallback is written in.
- **Shot 4 gets a 375×667 variant** — extrapolated from the repo's own 7e
  small-phone stress-test doctrine; the goal only asked for 390×844.
- **Duel difficulty pinned to Matinee for shots 5 and 8** — shot 5 requires it
  (take-glow is Matinee-gated in `src/DuelGame.tsx`), and a scripted win for
  the recap shot is only reliable at Matinee.
- **"Sanctioned shadows" list** in the do/don't section: §0 bans shadows
  "foreign to the Stub" without enumerating the native ones; I enumerated them
  from the token table + `social-preview.svg`'s ticket-shadow filter so the
  rule is checkable in Canva.
- **Genre-pip plum vs. Duel purple warning** added on my own initiative — two
  near-identical purples (`#58486C` vs `#755B99`) with different jobs seemed
  like the likeliest promo drift.
- **Chronology practice pill choice (Wide)** for shot 6 is a legibility call —
  decades-apart years read better in a still — not a canon ruling.

## Next (after Buri's pass)

Phase 0-captures (Prompt 2 in `docs/promo-execution-prompts.md`): Playwright
rig under `promo/capture/`, one PNG per shot above, manifest + checkpoint.
Not started — this phase stops here.
