# Phase 1-lite checkpoint — Canva mockup sprint

Written 2026-09-01. STOP point — Buri reviews before anything derives from
these. These are **directions, not finals**; expect a bounce round on the
mark (Mockup A) before B–D language locks. This sprint ran ahead of Phase
0-captures by design and does **not** mark Prompt 3's preconditions met
(`docs/promo-execution-prompts.md` Prompt 3 still runs later, after captures
exist and the brand sheet is red-penned).

## Contact sheet — what's in `promo/canva-mockups/`

| # | File | What it shows |
|---|---|---|
| A·1 | `mockup-a-1-mark-incumbent-game-amber.png` | favicon geometry verbatim, **game amber #CF952A**, Ø560 circle-crop preview + 48px check |
| A·2 | `mockup-a-2-mark-incumbent-marketing-gold.png` | same geometry, **marketing gold #DDA321** — the amber question, side by side with A·1 |
| A·3 | `mockup-a-3-mark-mc-monogram.png` | "M \| C" monogram, amber on navy, cream tear-dashes between the letters |
| A·4 | `mockup-a-4-mark-wildcard-circle-native.png` | wildcard: mark re-cut FOR the circle crop — full-bleed band with arc-matched ends + edge die-cut bites |
| B·1–4 | `mockup-b-*-carousel-*.png` | four ticket-card slides (gold/teal/rose/purple spines), kicker · mode name · one-liner verbatim, wordmark header, PLAY AT footer |
| C | `mockup-c-share-grid-showcase.png` | share text as chat-bubble hero on navy, "Make the connection." hook, mini mark + footer, story-safe zones respected |
| D·feed | `mockup-d-frame-feed-1080x1080.png` | phone frame, EMPTY 390:844 capture slot, tagline hook, footer |
| D·story | `mockup-d-frame-story-1080x1920.png` | story variant of the same template |

Canva IDs, edit URLs, and the full deviation list: `promo/canva-mockups-manifest.md`.

## Which Phase-0 open questions these answer

- **Q1 (which amber leads)** — now answerable **visually**: A·1 vs A·2 are
  pixel-identical except the bar hex. Pick one; the Canva kit order follows.
- **Q4 (wordmark treatment)** — sharpened, not answered: the italic-serif
  lockup couldn't even be imported (social-preview.png is 404 on prod), and
  every mockup falls back to upright bold caps. Evidence for commissioning a
  properly re-set promo wordmark as a Phase 1 task.
- Q2 (evergreen-practice ruling), Q3 (Duel 216-pool captures), Q5 (menu
  shot) — untouched; they belong to the captures phase.

## v2 upgrade pass (same day, after Buri's "too basic" bounce)

Buri asked for a more impressive treatment, "use Mobbin for inspiration."
Searched Mobbin and applied three patterns: structured branded share cards
(Duolingo year-in-review, Uxcel share-to-story — kicker row / centerpiece /
stat chips / logo), fanned rotated card stacks under bold display type
(CapWords, BitePal, Vibecode onboarding), and icon-chip + headline + pill
CTA + cropped-phone hero layouts (Aave, Partiful landing sections). All
executed with the Stub's sanctioned vocabulary only — awning stripes,
halftone dots, paper-diorama layers, pills, notches, tear lines; still no
shadows, gradients, posters, or invented copy. v2 judgment calls:

- **B's peek tickets** are solid mode-colored rounded cards (no full
  anatomy) — they read as the other three tickets in the stack without
  competing with the hero card.
- **C's stat chips** re-present the share line's own numbers as
  SCORE 6 / 8 STROKES / 2 BACK — factual to the invented example, but the
  chip labels are my formatting, not product copy.
- **The ghost index numerals and ghost tear spine** use diorama tones /
  low-opacity cream so they read as paper texture, not new palette entries.
- Exports overwritten in place; design IDs and edit URLs unchanged.

## Judgment calls (red pen)

1. **Deterministic build over AI generation.** The connector's AI generator
   invents copy and pulls stock imagery — collides with the verbatim-copy and
   no-posters rules — so every page was built from exact-hex SVG shape paths
   and explicit text ops. One AI generation was used only as a "door" to get
   an editable canvas (no create-blank API), wiped before use.
2. **Mark redrawn, not placed as asset.** The favicon's 5 primitives were
   re-authored as paths in the original 64-unit viewBox, so the gold recolor
   (A·2) is geometry-identical, not a filter approximation. The uploaded
   favicon asset is in the folder for reference but unused in the boards.
3. **A·4 wildcard concept is mine**: circle crops clip the rounded-square
   tile's corners, so the wildcard re-cuts the mark natively for the circle
   (band spans the full circle, ends follow the arc; edge bites = die-cut).
   It stays inside the Stub vocabulary (band, notch, tear) — no new shapes.
4. **Monogram tear-dashes cream, not navy** — navy-on-navy was invisible
   (caught via thumbnail during the build). Cream = cut showing through.
5. **Carousel speaks the marketing-canvas layer** (#17364E ground, #FFFDF9
   ticket, #DDA321 gold) because the spine colors and card language come
   from the social preview; Mockups C/D speak the promo primaries
   (#1F3A52/#CF952A/#F4EFE6). Layers never mixed inside one element, per
   the brand sheet's rule.
6. **Mockup C invented grid**: Chronology, `score 6 (8 strokes, 2 back)`,
   8 tiles / 2 misfires — arithmetically consistent with
   `ChronologyGame.tsx`'s share math, and the format carries no movie
   titles. Chat framing is done with shapes only (ghost bubbles, tail); no
   invented chat copy, keeping the §5-verbatim rule intact.
7. **C uses the daily share format (no `practice · ` marker)** — same call
   as the shot list's share-text shot: the promo grid shouldn't brand
   itself practice.
8. **D slot ratio locked to 390:844** so real Phase-0 captures drop in
   without letterboxing; slot labeled rather than dash-bordered (API limit,
   see manifest). Story-format text kept inside IG-safe zones (~top 250 /
   bottom 310).
9. **Hook lines** limited to approved taglines: D uses "Four movie games,
   one daily ritual"; C uses "Make the connection." Nothing new written.
10. **Fonts are the honest gap** — everything renders in Canva's default
    face because the API has no font-family control (details + per-role
    intent in the manifest). Judge composition/color/anatomy now; typography
    fidelity lands when the real faces are applied in-editor.

## Guardrails held

No tracked file touched; nothing staged/committed/pushed/deployed; no game
code, tuning, content, or `public/` changes. All local output is new
untracked files under `promo/`. Nothing was posted, published, or shared —
designs are private in the Canva account; exports are local. No posters,
stills, or key art anywhere; typographic only; amber used as accent only
(never a wash); no movie titles in the invented share grid.

## For the launch-readiness resume session

`promo/` (now including `canva-mockups/`, this checkpoint, the manifest,
and `canva-mockups-kickoff-prompt.md`) plus `docs/promo-execution-prompts.md`
are expected promo-track untracked output — do not sweep them into the ship
pass commit.

## Buri's review ruling (2026-09-01, same day)

**Mark = the incumbent ticket-stub, ruled.** Monogram (A·ii) and
circle-native wildcard (A·iii) retired — boards blanked, exports deleted.
B (carousel), C (share showcase), and D (both device frames) approved as
directions in their v2 form. Still open from Mockup A: **which amber leads —
game #CF952A (A·1) or marketing gold #DDA321 (A·2)** (= Phase-0 open
question 1).

## Next (after the ruling)

1. ~~Pick the amber~~ — **Buri DEFERRED the amber pick (2026-09-01)** to
   Phase 1 proper, when the brand kit is actually built. Both boards
   (A·1 #CF952A / A·2 #DDA321) stay in the design; Phase-0 Q1 remains open
   and becomes a Prompt-3 day-one decision.
2. Buri, Canva chores (~2 min, editor-only): delete the two blank pages in
   Mockup A · delete the "door" scaffolding design · drag-drop
   `public/social-preview.png` into the folder (URL upload impossible —
   404 on prod).
3. **Phase 0-captures is the next gate** (Prompt 2 in
   `docs/promo-execution-prompts.md`): needs the red-penned brand sheet +
   shot list, and the still-unanswered evergreen-practice ruling touches
   6 of 9 shots' spoiler-safe sourcing.
4. Phase 1 proper (Prompt 3) then derives everything from the chosen mark:
   brand kit with real fonts, captures dropped into the D templates,
   shadow pass, wordmark re-set decision (Q4).
