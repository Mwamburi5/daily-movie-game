# Canva mockup sprint — manifest

Produced 2026-09-01 (mockup sprint, Phase 1-lite — runs ahead of Phase
0-captures; see `promo/canva-mockups-kickoff-prompt.md`). Everything built
via the Canva connector API, deterministically (exact-hex shapes + verbatim
copy), not AI-generated layouts. Exports live in `promo/canva-mockups/`.

**v2 (same day):** after Buri's "too basic" bounce, all five designs were
upgraded IN PLACE (same IDs/URLs; exports overwritten) using Mobbin
references for composition and the Stub's own sanctioned decorative
vocabulary for execution — awning stripes, halftone dot fields,
paper-diorama offset layers (#E7E1CC/#D9D2BC), pill CTAs, notched ticket
plates. New treatment per design:

- **A (boards)** — navy header band with mark chip + gold kicker, awning
  stripe, giant ghost index numerals (01–04 in #E7E1CC), diorama circles
  layered behind the mark, and the caption block rebuilt as a notched
  ticket-stub plate (variant-colored spine, tear line, 48px check in the
  stub half).
- **B (carousel)** — fanned stack of the other three modes' tickets rotated
  behind the hero card (CapWords/BitePal pattern), awning stripe, 4-dot
  mode-position row (active dot = mode spine color), gold pill CTA, rotated
  "MATCH CUT" stub label right of the tear line, "0N / 04" index.
- **C (share showcase)** — restructured as a Duolingo/Uxcel-style branded
  share card: in-card brand row (mark chip + MATCH CUT + divider), share
  text, emoji grid, then a 3-chip stat row (SCORE 6 / 8 STROKES / 2 BACK —
  same numbers as the share line, re-presented), full-height ghost tear
  spine at 8% behind everything, halftone corners, amber pill CTA.
- **D feed** — rebuilt as an Aave-style hero: left column (88px mark chip,
  stacked 3-line headline, amber pill CTA), phone right with two diorama
  plates behind it, halftone corners, awning stripe.
- **D story** — centered version of the same: chip above headline, diorama
  plates behind the phone, halftone corners, pill CTA footer.

## Canva inventory

| Item | ID | Link |
|---|---|---|
| Folder — Match Cut Promo (root) | `FAHT85UIB58` | https://www.canva.com/folder/FAHT85UIB58 |
| Folder — Mockups (all designs) | `FAHT8yxx3qc` | https://www.canva.com/folder/FAHT8yxx3qc |
| Asset — Match Cut mark (favicon.svg, 64×64) | `MAHT8-e9mDs` | uploaded from https://matchcutdaily.com/favicon.svg |
| Scaffolding — "MC base canvas (door)" | `DAHT87aTsH0` | root promo folder — **ignore/delete by hand** (no delete API) |

**social-preview.png upload FAILED** — `https://matchcutdaily.com/social-preview.png`
returns **404 on prod** (the asset ships with the unpushed branch; prod
c063f26 has no og:image at all). Per §0, no third-party hosting workaround.
→ **Manual drag-drop for Buri:** upload `public/social-preview.png` into the
"Match Cut Promo" folder when convenient. The mockups don't depend on it —
its card language was rebuilt from the brand sheet's transcribed values.

## Designs

| Mockup | Design ID | Edit URL | Pages | Exports |
|---|---|---|---|---|
| A — Mark directions (1024×1024) | `DAHT8xIY1zY` | https://www.canva.com/d/8Sa_8AQ9u6TSzw_ | 4 (pages 3–4 blanked) | `mockup-a-1-mark-incumbent-game-amber.png` · `mockup-a-2-mark-incumbent-marketing-gold.png` |

**Mark RULED 2026-09-01 (Buri):** the **incumbent ticket-stub mark wins**;
the MC monogram (A·ii) and circle-native wildcard (A·iii) are **retired** —
their boards blanked in Canva and their exports deleted. The API cannot
delete pages, so pages 3–4 remain as empty cream pages: **Buri, delete the
two blank pages in the editor** (right-click page → Delete) whenever
convenient. Amber vs marketing gold (A·1 vs A·2) still undecided.
| B — Mode carousel (1080×1080) | `DAHT84JXgWE` | https://www.canva.com/d/yuxW_bDpwouid4w | 4 | `mockup-b-1-carousel-daily-puzzle.png` · `mockup-b-2-carousel-chronology.png` · `mockup-b-3-carousel-connections.png` · `mockup-b-4-carousel-duel.png` |
| C — Share-grid showcase (1080×1920) | `DAHT8397C9A` | https://www.canva.com/d/fJJujsUSLeryUj- | 1 | `mockup-c-share-grid-showcase.png` |
| D — Device frame, feed (1080×1080) | `DAHT85LpmkQ` | https://www.canva.com/d/NYdcXSZBfB2AKlz | 1 | `mockup-d-frame-feed-1080x1080.png` |
| D — Device frame, story (1080×1920) | `DAHT899TXeY` | https://www.canva.com/d/ce9k9btv3rW--F0 | 1 | `mockup-d-frame-story-1080x1920.png` |

All exports verified at exact target pixel dimensions (sips), lossless PNG.

## Fonts actually used — every design

**Canva default face (fontRef `YACgEZ1cb1Q` — Canva Sans), all text, all
designs.** Neither font path in the brand sheet's §7 was executable from
this session: the connector's edit API exposes no font-family control at
all (only size/weight/style/color/align), so the Pro font-upload path
(editor-only) and the library-fallback path (Inter / JetBrains Mono /
Bitter) were both out of reach. Type hierarchy is approximated with
weight + size + ALL CAPS:

- Domine 700 intent → default face, bold (mode names, variant titles, hooks, monogram letters)
- Inter intent → default face, regular (one-liners, notes)
- JetBrains Mono caps intent → default face, ALL CAPS (kickers, footers, labels) — **no letterspacing** (API has no letter-spacing op)

Applying the real faces is a per-design editor pass (Buri, or Phase 1
proper once the brand kit exists).

## Deviations from the brand sheet (all recorded, none silent)

1. **Fonts** — see above. Biggest fidelity gap in the set.
2. **No letterspacing** on mono-caps kickers/labels (API limitation).
3. **Sanctioned shadows omitted** (no shadow op in the API). Cards sit flat;
   the 2–3px navy borders carry the Stub language instead. The brand sheet's
   §3 shadow list applies at Phase 1 proper.
4. **Wordmark** shown as upright bold caps text ("MATCH CUT"), not the
   italic-serif lockup — the lockup's source asset is the social-preview
   crop (404, see above), and wordmark treatment is open question 4 anyway.
5. **Mockup A page 3 (monogram)**: tear-line dashes recolored **cream**
   (`#F4EFE6`) — favicon's navy dashes sit on the amber bar; with no bar
   behind them they'd be navy-on-navy invisible. Cream reads as the die-cut
   showing through. Same at the 48px check.
6. **Mockup D capture slot**: solid 2px navy outline + explicit
   "CAPTURE SLOT / 390 × 844" label instead of a dashed placeholder border
   (dashed rectangle outlines are impractical as single shape paths; the
   label makes the emptiness unambiguous). Slot is exact 390:844 ratio.
7. **Scaffolding design** left in the root folder — the API can create but
   not delete designs. One AI "door" generation was used solely to obtain an
   editable canvas; it was wiped to blank before any fork.
8. Ghost chat bubbles on Mockup C are cream at 14% opacity (suggesting a
   thread without inventing chat copy — §5-only copy rule held).

## Copy audit (verbatim-only rule)

Every line traced to source: taglines + program copy + mode one-liners +
kickers from `promo/brand-sheet.md` §1/§5 · share text format from
`src/lib/share.ts` + `src/ChronologyGame.tsx` (`Match Cut · Chronology` /
`score 6 (8 strokes, 2 back)` / 🎬 + 🟩🟥 row — invented but arithmetically
consistent: 8 strokes − 2 back = 6, two misfire tiles; **no movie titles**)
· board labels (variant names, "48 PX", "CAPTURE SLOT") are template/spec
furniture, not promo copy.
