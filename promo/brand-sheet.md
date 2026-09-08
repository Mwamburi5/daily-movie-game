# Match Cut — promo brand sheet

Phase 0-docs · written 2026-08-31 · transcribed from repo canon, not invented.
Sources: `docs/promo-execution-prompts.md` §0 · `design_handoff_the_stub/README.md`
(token table, = rendered screen 7f) · `src/index.css` `@theme` block ·
`public/favicon.svg` · `public/social-preview.svg`/`.png` · `src/lib/share.ts`.

---

## 1 · Color

The repo carries **two palette layers**. In-game screenshots already carry the
game layer; anything designed *around* them in Canva uses the promo primaries
below. Don't mix hexes across layers inside one element.

**Promo primaries (§0 canon):**

| Role | Hex | Rule |
|---|---|---|
| Navy — ground/ink | `#1F3A52` | Headers, borders, dark grounds |
| Amber — THE action color | `#CF952A` | Accents and CTAs **only**, never a background wash |
| Cream — paper | `#F4EFE6` | Page/canvas ground |

**Game layer** (Stub tokens, verbatim from the token table / `@theme`):
paper `#FCF9F8` · navy-mid `#41586E` · slate `#5B6B7A` (labels) · slate-light
`#8FA6BC` · slate-faint `#B9C8D6` · hint teal `#2C89A1` (hint affordance only —
never decorative) · alert red `#A02C2C` · disabled `#9AA5AD` (always with
strikethrough) · diorama layers `#E7E1CC` / `#D9D2BC` · canvas cream `#F0EBD8`
· genre-pip plum `#58486C` (card genre variant only — **not** the Duel purple).

**Marketing-canvas layer** (`social-preview.svg` — the marketing translation):
navy `#17364E` · gold `#DDA321` · ticket paper `#FFFDF9` · body slate `#53697A`.

**The four mode spine colors** (from the social preview's ticket stubs):

| Mode | Spine | Kicker text | Kicker copy |
|---|---|---|---|
| Daily Puzzle | `#DDA321` gold | `#DDA321` | DAILY · GOLF |
| Chronology | `#6EA6A0` teal | `#6A8F8B` | DAILY · ORDER |
| Connections | `#B66B79` rose | `#A85C6B` | DAILY · GROUP |
| Duel | `#755B99` purple | `#755B99` | HEAD-TO-HEAD |

## 2 · Type

| Role | Face | Weights | Usage |
|---|---|---|---|
| Display | **Domine** | 700 | Titles, scores, mode names, "Cleared!" |
| UI | **Inter** | 400–800 | Body, buttons (800 on pills), sublines |
| Labels | **JetBrains Mono** | 600–700 | ALL CAPS, letter-spacing .06–.18em — kickers, tickets, captions |

All three are Google Fonts (self-hosted in `public/fonts/` as latin woff2).
Wordmark note: the social canvas sets "Match Cut" in **bold italic serif**
(Georgia italic in the SVG source — Domine ships no italic). Treat the italic
wordmark as an *image asset* (crop of `social-preview.png`) until Buri rules on
a re-set wordmark; in-app the title is upright Domine 700.

## 3 · The ticket-stub motif (anatomy)

- **Spine** — a 16px rounded color bar flush on the ticket's left edge; the
  spine color is the mode color. Ticket body: paper fill, 2–3px solid navy
  border, generous radius (r14–18).
- **Notches** — punched circles centered on the left/right edges (10px on the
  marketing canvas, 12–14px in-game), filled with the *ground* color and
  stroked 2px navy — they read as die-cut holes.
- **Dashed tear line — "the cut"** — a navy dashed rule crossing the ticket
  off-center (the favicon places it ~⅔ across). This is the brand pun; keep it.
- Supporting vocabulary (use sparingly, from the Stub): amber/cream **awning
  stripe** (repeating 14px bands) on panel tops; **halftone dot** texture on
  navy and cream grounds; **paper-diorama** offset layers behind modals;
  pill buttons (r999); borders do the work — 2px navy everywhere.
- Sanctioned shadows only: resting card `0 5px 13px rgba(31,58,82,.29)`,
  raised `0 18px 40px rgba(31,58,82,.45)`, modal `0 20px 46px rgba(9,22,34,.55)`,
  amber glow `0 0 18px rgba(207,149,42,.4)`, and the canvas's soft ticket
  drop (dy 6 / blur 5 @ 16%). Nothing else casts.

## 4 · Logo / mark

`public/favicon.svg` is the mark: navy rounded-square tile (r14 at 64), amber
ticket bar across the middle (r5), two navy punch notches at the ticket's edge
midpoints, navy dashed tear line right of center. Rasterizations:
`favicon-32.png`, `apple-touch-icon.png`.

Usage: the amber ticket always sits on the navy tile — never place the bare
ticket on amber or cream without its tile. Don't redraw, recolor, or drop the
tear line. Minimum-size check: the mark must survive 48px (it does — two
shapes, one line). The italic "Match Cut" wordmark + "FOUR MOVIE GAMES · ONE
DAILY RITUAL" kicker lockup lives on `social-preview.png`.

## 5 · Approved copy

Taglines (§0, verbatim):
- **Four movie games, one daily ritual** (kicker: mono caps under the wordmark)
- **Make the connection.**
- **Connect movies by the people who made them.**

Program copy (social canvas): "TONIGHT'S PROGRAM" · "PLAY AT MATCHCUTDAILY.COM"
· mode one-liners — Daily Puzzle "Play the whole hand. Low score wins." /
Chronology "Place movies in release order." / Connections "Find four groups of
four." / Duel "Race the computer to 20."

Share format (in-product, `src/lib/share.ts`):
`Match Cut · <Mode>` ⏎ `<score line>` ⏎ `🎬<emoji row>` — e.g.
`Cleared`-family lines like `score 7, par 9 (2 under par)`.

## 6 · Do / don't

**Do** — navy-on-cream or cream-on-navy grounds only · amber for the one thing
you want tapped/read · mono labels ALL CAPS + letterspaced · sentence case for
all promo prose, short declaratives, no hype-speak · typographic card faces ·
keep TMDB attribution visible if the rules modal is in frame.

**Don't** — amber as a background wash · movie posters, stills, frames, or key
art (deliberate legal position, not a style gap) · drop shadows or gradients
foreign to the Stub (§3 lists the only sanctioned ones) · lowercase in-game
`say()` voice in promo copy (it stays in-game) · the hint teal as decoration ·
genre-pip plum `#58486C` where Duel purple `#755B99` belongs · hiding disabled
states (always `#9AA5AD` + strikethrough) · bevels, embossing, 3-D.

## 7 · Canva Brand Kit setup

Enter exactly this:

**Palette** (11 swatches, in this order): `#1F3A52` navy · `#CF952A` amber ·
`#F4EFE6` cream · `#FCF9F8` paper · `#41586E` navy-mid · `#5B6B7A` slate ·
`#DDA321` spine gold · `#6EA6A0` spine teal · `#B66B79` spine rose ·
`#755B99` spine purple · `#17364E` marketing navy.

**Fonts — primary path (Canva Pro, this account):** upload the real faces to
the Brand Kit ("Upload a font" under Brand Fonts — a
[Pro/Teams feature](https://www.canva.com/help/upload-fonts/); accepts
OTF/TTF/WOFF, **not woff2**, so download TTFs from Google Fonts — Domine 700,
Inter 400/600/700/800, JetBrains Mono 600/700 — rather than reusing the repo's
woff2 subsets. All three are open-licensed (SIL OFL) so embedding is fine.

**Fonts — library fallback** (if upload is unavailable):
- **Inter** — in the Canva library; use directly
  ([Blogging Guide](https://bloggingguide.com/canva-font-equivalents/)).
- **JetBrains Mono** — in the Canva library; use directly
  ([Creative Ultra](https://creativeultra.com/best-monospace-font-in-canva/),
  [Font Burst](https://fontburst.com/best-monospace-font-in-canva/)).
- **Domine** — availability unconfirmed; search the library first. If absent,
  substitutes in confidence order: **Bitter** (screen-optimized slab, closest
  voice), **Roboto Slab**, or **Libre Baskerville** (Canva-confirmed serif,
  softer; [Levee Road Studio](https://leveeroadstudio.com/serif-fonts-on-canva/),
  [Typewolf on Inter pairings](https://www.typewolf.com/inter)).

**Assets to upload:** `public/favicon.svg` rasterized at 1024×1024 PNG (the
mark) · `public/social-preview.png` (wordmark lockup + mode-ticket reference).
Live URLs for Prompt 3's upload-from-url: `https://matchcutdaily.com/favicon.svg`
and `https://matchcutdaily.com/social-preview.png`.
