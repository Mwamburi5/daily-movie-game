# Handoff: Marquee — "The Stub" game UI

## Overview
A full visual redesign of Marquee (a daily movie card game) in a locked design language called **"The Stub"**: a warm cream canvas, deep navy ink, and a single amber action color, with punched-ticket shapes, pill buttons, and a paper-diorama opponent booth. This package covers the six screens of the Duel mode: the main board, the lay-off picker, the recast overlay, the end-of-game recap, a small-phone stress test, and a design-token summary.

## About the Design Files
The files in `reference/` are **design references created in HTML** — static, pixel-accurate mockups showing intended look and layout, not production code to copy directly. The task is to **recreate these designs in the target codebase's existing environment** (React, React Native, Swift, etc.) using its established patterns and component libraries. If no frontend exists yet, choose the most appropriate framework for a mobile-first web game (e.g. React + a spring animation library) and implement the designs there.

Open `reference/the-stub-screens.html` in a browser to view all six screens side by side. IDs 7a–7f below match the badges in that file. `RULEBOOK.md` (included) documents the game rules the UI expresses.

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, and copy are final. Recreate pixel-perfectly. The three card images in `reference/uploads/` are the real card art assets; every card in the game uses the identical frame treatment described below.

## Design Tokens (source of truth — also rendered as screen 7f)

Colors
- `canvas.cream` #F0EBD8 — page background
- `paper` #FCF9F8 — cards and panels
- `ink.navy` #1F3A52 — primary ink, headers, borders; mid tone #41586E
- `action.amber` #CF952A — the ONLY action/highlight color (primary buttons, TAKE, eligible rows, glows)
- muted slate: #5B6B7A (labels), #8FA6BC, #B9C8D6 (opponent score)
- `hint.teal` #2C89A1 — hint affordance only
- `alert.red` #A02C2C — negative deltas / warnings
- `disabled` #9AA5AD — always paired with strikethrough on spent tokens
- overlay scrim: rgba(31,58,82,.62–.66)

Type
- Display: **Domine** 700 (titles, scores; scores use `font-variant-numeric: tabular-nums`)
- UI: **Inter** 400–800
- Labels: **JetBrains Mono** 600–700, ALL CAPS, letter-spacing .06–.18em

Shape & depth
- Radii: header block 24px (bottom corners only) · panels 14px · cards 12px · thumbnails 6px · buttons/pills 999px
- **Borders do the work**: 2px solid navy everywhere; no bevels or gradients
- Ticket-stub notches: 12–14px circles (canvas-colored, 2px navy border) punched into the left/right edges of ticket strips and score rows
- Paper-diorama stack (booth, modals): two offset paper layers behind the front panel — layer 1 #E7E1CC inset 5px/offset 4px, layer 2 #D9D2BC inset 10px/offset 8px, both 2px navy border, same radius
- Awning strip: `repeating-linear-gradient(90deg, #CF952A 0 14px, #F0EBD8 14px 28px)`, 8px tall, sits on the top edge of booth/modal panels
- Texture: halftone dot — `radial-gradient(rgba(31,58,82,.06) 1px, transparent 1.2px)` at 7px tile on cream; same in cream-on-navy at 6px inside the header
- Glows: take/eligible `0 0 18px rgba(207,149,42,.4)`; hint `0 0 16px rgba(44,137,161,.5)`

Z-layers
`0` canvas · `10` resting cards · `20` shelf/booth · `30` traveling + raised cards · `40` HUD/header · `50` contextual bars · `60` overlays/sheets

Motion
- Springs: stiffness 320 / damping 24; all interactions ≤ 400ms
- Deal stagger: 60ms per card
- Race bar: 500ms ease-out width change + score tick-up
- `prefers-reduced-motion`: replace with 150ms crossfades

## The card component (identical everywhere)
Every card — hand, marquee piles, raised, meld thumbnails — is the same frame at different sizes:
- Background #FCF9F8, border 2px solid #1F3A52, radius 12px (10–11px at hand size, 5–6px at thumbnail size), `overflow: hidden`
- Card art `object-fit: contain` at aspect-ratio 3/4
- Selected/takeable: border switches to #CF952A (2.5px) + amber glow
- Hint: border #2C89A1 (2.5px) + teal glow + a teal pill label above ("HINT · PACINO")
- Resting shadow: `0 4–6px 12–14px rgba(31,58,82,.28–.3)`; raised/traveling: `0 18px 40px rgba(31,58,82,.45)` + glow

## Screens

### 7a — Duel board (390×844, the master screen)
Vertical flex on cream + halftone texture.
1. **Navy header** (z-40): #1F3A52, bottom corners 24px, cream halftone inside. Row 1: back arrow (amber) + "DUEL" (Domine 21px, cream) left; "SHOW ENDS AT 20" (mono 9px, amber) right. Row 2: your score 40px Domine cream + "YOU" amber mono; centered "YOUR TURN" amber pill (mono 8.5px, navy text); opponent "TAZ" muted + score 40px #B9C8D6. Row 3: race bar — 10px tall, 999px radius, 1px cream-45% border; your share amber, remainder #41586E. Bar shares one track (tug-of-war): your fill grows left→right.
2. **Opponent booth** (paper diorama, margins 18px/16px): stacked paper layers + front panel #FCF9F8 2px navy r14, amber/cream awning strip on top. Contents: 38px navy circle avatar with amber Domine "T"; "TAZ · CPU · 6 CARDS" mono 10px navy; italic quote Inter 11px slate; 6 card-back pips (11×16px navy, r3) showing hand count; token stack right — "FINAL CUT" solid navy pill, "RECAST" disabled pill (#9AA5AD border/text + strikethrough when spent).
3. **Board grid**: `grid-template-columns: 64px 1fr 1fr; gap: 12px`, aligned to bottom. Deck: navy block r12 with 1px dashed cream inner frame, vertical "MARQUEE" Domine + count; label "DECK 23" above. Marquee A: standard card + mono label. Marquee B (takeable): amber border + glow, "↑ TAKE" amber pill in its label row.
4. **Last-play line**: mono 8.5px slate, left "LAST · TAZ PLAYED THE GODFATHER → PACINO", right delta in #A02C2C.
5. **Meld shelf**: horizontal scroll strip of chips — #FCF9F8, 2px navy, r12, mono label + 30px card thumbnails. Rows that accept a lay-off get the amber border. Right edge fades to cream. Caption: "10 MELDS · SWIPE · AMBER ROWS ACCEPT A LAY-OFF".
6. **Action rails** (z-50, floating above the fan): left column — "MELD" solid amber pill (Inter 800 10px), "FINAL CUT" navy-outline pill, "RECAST" disabled pill; right column — "⇲ SORT" solid navy pill, "◎ HINT · 3" navy pill with 2px teal border.
7. **Hand fan** (z-30, bottom, overflowing the bottom edge by ~44px): 7 cards, 98px wide, rotations −18/−12/−6/0/6/12/18°, `transform-origin: bottom center`, bottoms 36/48/56/62/56/48/36px, lefts 24→264 in 40px steps. Center card is the hint card (upright, teal treatment, z above neighbors).

### 7b — Lay-off picker (390×844, overlay state of 7a)
- Board dimmed by navy scrim rgba(31,58,82,.62), z-60 content above.
- Top: "LAY OFF — PICK A ROW" (navy pill, amber mono text), then the raised card (188px, amber border + glow + deep shadow) centered.
- Bottom sheet: cream #F0EBD8, top radius 22px, 2px navy top border, grab handle (44×4px #9AA5AD pill). Header row: "ALL MELDS · 10" mono slate left, "CANCEL" navy-outline pill right.
- Rows (r12, mono name min-width 110px + card thumbnails 30px):
  - **Eligible**: #FCF9F8, 2px amber border, amber glow, trailing amber pill "+2 ▸" / "+1 ▸"
  - **Ineligible**: 60% opacity, 2px #9AA5AD border, slate text, no pill
- Last visible row fades under a cream gradient; footer caption "SCROLL FOR 4 MORE · AMBER ROWS ACCEPT THIS CARD".

### 7c — Recast overlay (390×844, modal)
- Navy scrim .66 + a soft amber radial glow (560×480, centered ~46%) behind the modal.
- Modal = paper-diorama stack (r18) with awning strip, max-width 300px, centered, shadow `0 20px 46px rgba(9,22,34,.55)`. Contents centered: "TAZ PLAYS" mono slate → movie title Domine 26px navy → consequence line Inter 11.5px in #A02C2C ("Super link — +4 and an encore") → the offered card (128px, navy border + amber ring `0 0 0 3px rgba(207,149,42,.85)`).
- Buttons full-width pills: primary "RECAST — CANCEL IT" solid amber, Inter 800 12px navy text; secondary "ALLOW IT" paper with 2px navy border. Footnote mono 8.5px slate: "YOUR RECAST TOKEN · ONE PER SHOW".

### 7d — End-of-game recap (390×844)
- Cream page + halftone, double navy frame: 2px navy r18 inset 12px, 1px navy-35% r14 inset 17px. Content centered.
- Top: 5 alternating amber/navy 6px dots → "You win!" Domine 42px navy → subline Inter 13px slate → scoring rule mono 8.5px caps.
- **Score rows as ticket stubs** (max-width 286px, r14, punched 14px notches both sides): winner row solid navy — "YOU" mono, breakdown Inter 10.5px #8FA6BC, score Domine 24px amber; loser row paper with 2px navy border, score navy.
- Summary line, then **event ledger** (max-width 296px): rows r10 paper, 1.5px border (navy for YOU rows, #9AA5AD for TAZ rows); leading pill YOU=amber/TAZ=navy; event text Inter 10.5px; delta Domine 13px right.
- Pinned to bottom: "SHARE — 🎬🟨🟦🟨🟨🟦" solid amber pill; "DEAL AGAIN" + "MENU" outline pills side by side.

### 7e — Small-phone stress test (375×667, iPhone SE floor)
Proves the layout at minimum size with a 10-card hand and a raised card in transit. Deltas from 7a:
- Header collapses to one row (r18 bottom): back + "DUEL" 16px + inline race bar with 17px Domine scores at each end. No "YOUR TURN" pill.
- Booth collapses to a one-line **ticket strip** (r12, punched notches): 24px avatar, "TAZ · 8 CARDS", truncating italic quote, "FC"/"RC" micro pills.
- Deck 66×100px; marquee piles 120px wide.
- Raised card (z-30): 180px, amber border + glow, centered at top:92px, riding OVER the piles/shelf and UNDER the header; "FLIP" navy pill hanging below it.
- Fan: 10 cards, 94px, rotations −20…+20° (4g curve), lefts 6→258 in 28px steps, bottoms 26/34/41/46/49/49/46/41/34/26.
- Minimum hit target stays ≥44px: cards are 94px wide; pills get padding to reach 32px visual/44px tappable.

### 7f — Token summary
Rendered version of the Design Tokens section above (560px card). Use it as the visual checksum for the token file; port values to the codebase's token/theme system (Tailwind config, styled-system theme, etc.).

## Interactions & Behavior
- **Card play**: tap a hand card → it raises to the traveling layer (z-30) with the amber treatment; valid drop zones (marquee pile, eligible meld rows, MELD button) light amber. Drag or tap-a-target to commit. Spring: 320/24.
- **Take**: the TAKE-marked marquee card animates from pile to hand (traveling layer), fan reflows with 60ms stagger.
- **Lay-off (7b)**: raising a card that fits an existing meld opens the bottom sheet; only amber rows are tappable; CANCEL or scrim-tap dismisses (sheet slides down 300ms ease-out).
- **Recast (7c)**: modal is blocking; RECAST consumes the token → the opponent booth's RECAST pill flips to the disabled/strikethrough state.
- **Race bar**: animates width 500ms ease-out on every score change; score numerals tick up.
- **Hint**: tapping HINT applies the teal treatment to the recommended card + label pill; decrements the counter in the button.
- **Disabled tokens**: always #9AA5AD + line-through, never hidden.
- **Reduced motion**: all travel/spring animations become 150ms crossfades.

## State Management (minimum)
- `phase`: idle | cardRaised | layOffPicker | recastOffer | gameOver
- `hand[]`, `melds[]` (owner, label, cards, eligibleForRaised), `marqueeA/B`, `deckCount`
- `scores {you, opp}`, `target: 20`, `turn`, `lastPlay {actor, card, link, delta}`
- `tokens {you: {finalCut, recast}, opp: {...}}`, `hintsRemaining`
- `raisedCard` (id + origin, for the traveling layer and cancel-return)

## Assets
- `reference/uploads/card-godfather-cut.png`, `card-batman-cut.png`, `card-taxi-cut.png` — final card art (transparent-cut PNGs supplied by the user). All other visuals (booth, awning, notches, pips, deck back) are pure CSS — do not export them as images.
- Fonts: Domine, Inter, JetBrains Mono (all on Google Fonts).

## Files
- `reference/the-stub-screens.html` — all six screens (7a–7f), plain HTML/inline CSS, open in any browser
- `reference/uploads/` — card art
- `RULEBOOK.md` — game rules the UI expresses
