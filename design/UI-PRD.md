# Marquee — Game UI Redesign PRD

A generation-ready design brief for the full game UI — everything EXCEPT the playing
cards, which are a separate workstream. Paste this whole document into a visual
design tool (Claude Design, Stitch, etc.), then append exactly ONE of the four
Direction add-ons at the bottom. Run it once per direction to get comparable options.

---

## 1. Product overview

**Marquee** is a daily movie card game — Wordle cadence, played in short sessions,
mobile-first web app. Players connect movies by the people who made them
(directors, actors, writers, franchises). Three modes share one design language:

- **Duel** (the hero mode): you vs. Taz, a CPU host with personality. Turn-based
  card play, build melds, race to 20 points.
- **Daily Puzzle (Solo)**: today's hand, same for everyone; golf scoring (fewest
  flips wins).
- **Chronology**: place today's movies in release-date order on a timeline; golf
  scoring.

Brand voice: film-literate, warm, a little theatrical. Taz speaks in lowercase
one-liners ("that one stings", "take it if you dare"). Logo is "Marquee" in a
black italic serif.

**The problem with the current UI:** it renders everything in a fixed 420px
column (desktop = a letterboxed phone strip on a flat cream field), zones are
absolutely positioned at hardcoded pixel offsets (overlap risk as content grows),
and the whole thing reads bland — flat background, floating text, no sense of
place. The redesign should make it feel like a great modern online card game:
a *table you sit at*, not a stack of divs.

---

## 2. Scope rule — cards are placeholders

**Do NOT design the playing cards.** Card faces are being designed separately.
Render every card as a neutral placeholder (plain gray rounded rectangle labeled
"CARD", 12px radius) at these EXACT sizes:

| Placeholder      | Size (px)  | Where it appears                          |
| ---------------- | ---------- | ----------------------------------------- |
| Hand card        | 96 × 144   | player fan, draw choices, overlays        |
| Pile card        | 124 × 186  | marquee piles, deck                       |
| Raised card      | 188 × 282  | inspect slot above the fan                |
| Meld chip        | 28 × 40    | banked meld rows (tiny color swatches)    |
| CPU card back    | 42 × 64    | opponent's face-down fan                  |

Everything AROUND the cards is the assignment: table surface, layout, HUD,
chrome, typography, color system, motion. The design must work such that any
card art dropped into the placeholders later just works.

---

## 3. Current design tokens (seed — evolve or replace per direction)

- Cream table `#f4efe6` · Ink `#23211c` · Forest green (player) `#2c5240` ·
  Burnt orange (CPU) `#b3541e` / `#a3411a` · Marquee gold `#d8b24a` / `#7a5a10` ·
  Muted taupe text `#7d7563` / `#9a917c` · Deep-cut teal `#0f766e`
- Serif italic display (logo, big numerals) + system sans for UI text
- Player = green, CPU = orange is a load-bearing convention (scores, banners,
  recap chips all use it). Keep a two-player color coding even if the hues change.

---

## 4. Layout requirements (the core ask)

1. **Mobile first** — design at 390×844; must also work at 375×667 (iPhone SE)
   and 430×932. Portrait, one-handed, thumb-reachable actions, safe-area aware.
   **Zones must flex — no fixed pixel stacking.** A fat 10-card fan, a raised
   card, AND a growing meld shelf must coexist on a 667px screen with zero overlap.
2. **Desktop (1440×900)** — do NOT letterbox the phone layout. Design a real
   table: play area centered and breathing, ambient backdrop that sets a scene,
   extra width used intelligently (meld shelf as a side rail, score race along
   the top, Taz's corner as a real presence). Cards keep their fixed sizes —
   the TABLE scales, not the cards.
3. **Z-layering system** with named layers: table surface < resting cards <
   traveling cards < HUD < contextual bars < overlays. A card traveling
   deck→hand must pass over the table but under the HUD.
4. **Stress tests to show**: meld shelf at 10+ melds; hand at 10 cards; the
   667px-tall screen.

## 5. Known gaps the redesign must answer

- **Race-to-20 visualization**: scores are currently two bare pills. Design the
  race as a visible thing — progress track, tug-of-war bar, or lit marquee
  counter — so every play feels consequential.
- **Taz's presence**: quips currently float as naked text. Give the opponent a
  home — nameplate/avatar corner where quips, "thinking…" state, card count,
  and tokens live.
- **Meld shelf growth strategy**: scrolling shelf, collapsing rows, or desktop
  side rail. Unbounded content needs a plan, not hope.
- **Deck economy**: cards remaining, whose turn, tokens spent — glanceable.
- **Idle life**: subtle ambient motion (marquee glow cycle, deck sheen, Taz
  blink) so the table never feels dead. Cheap and slow, never busy.

---

## 6. Screen inventory & specs

### S1 · Menu

- "Marquee" serif italic logo + tagline "Connect movies by the people who made them."
- Three mode cards: **Duel vs Computer** (primary, dark card, with a 3-option
  difficulty pill row — Matinee / Feature / Director's Cut — plus a one-line
  blurb per difficulty), **Daily Puzzle** (with a "practice: The original hand"
  secondary pill), **Chronology** (with practice pills "Wide" / "Tight").
- "How to play" ghost button.
- Redesign freely; this is the storefront and currently the blandest screen.

### S2 · Duel board (the hero screen — spend the effort here)

Zones, top to bottom (current mobile order; rearrange if the design is better):

1. **Header/HUD**: back-to-menu, mode title, "?" rules button · score race
   (You green vs CPU orange, active player emphasized, "show ends at 20") ·
   turn status line ("Your turn" / "CPU is thinking…" / "Run ×2?").
2. **Taz's zone**: face-down fan (up to ~8 card backs, 42×64, overlapping),
   "CPU · 6 cards" count, and two token chips — **Final Cut** and **Recast** —
   shown lit or spent (struck-through when used).
3. **Center**: draw **deck** (tappable, shows remaining) + the **marquee** —
   two face-up pile cards (124×186) side by side. Legal-take state = an
   inviting glow/pulse. This is the table's focal point.
4. **Announcement banner** (transient, mid-board): pill announcing each play —
   who-chip + text + optional "DEEP CUT" chip + "+points" chip. Three tiers
   (normal / strong / super) currently coded by background color. There is also
   a full-screen radial gold flash on super links — keep a celebration beat.
5. **Idle cue** (only on your idle turn): "one move — play a card or draw".
6. **Meld shelf**: banked melds, each = label ("CHRISTOPHER NOLAN ×4") + row of
   meld chips (28×40). Rows light up as drop targets when the raised card can
   lay off onto them. UNBOUNDED — needs the growth strategy from §5.
7. **Player tokens** (left rail today): your Final Cut / Recast chips —
   Final Cut is armable (tap to arm, glows when armed). **Meld button**
   (right rail today): enters meld-selection mode.
8. **Your hand**: fanned cards (96×144, fan tightens as it grows past 7, slight
   arc + rotation). Tap raises a card to the **raised slot** (188×282, above
   the fan) with a flip button; drag the raised card onto a pile/meld to play.
   Long-press + slide reorders the fan. Hint state = pulsing green ring on a
   fan card (easy difficulties).
9. **Contextual action bars** (replace each other, sit above the fan):
   - Keep/Toss after a draw ("It connects — drag it onto the pile" + Keep · Toss)
   - Run continuation ("Run ×2? Play another via Emily Blunt…" + End turn)
   - Meld selection ("Pick 2 more — a person, series, or 3+ of a genre" +
     Bank meld +6 · Cancel); selected fan cards lift with a gold ring.

### S3 · Duel overlays (modal moments)

- **Draw choice** (dimmed backdrop): "Keep one — the other two leave play" +
  three face-down hand cards, "CONNECTS" tag on eligible ones. Tap to keep.
- **Recast offer** (the suspense moment): centered card panel — "CPU plays
  *Oppenheimer* — Super link, +4 and an encore" with the card, and two big
  buttons: "Recast — cancel it" (destructive-accent) / "Allow it". Give this
  drama; it's the game's biggest decision.
- **How to play**: rules sheet (currently a full-screen overlay).

### S4 · End of game (recap)

Full-screen takeover: result headline ("You win!" / "CPU wins." / "Dead heat.")
+ end reason · scoring table (You/CPU rows: "18 played − 2 held" → big net
numeral, winner row inverted) · **recap reel** — scrollable highlight list of
the match's big moments (who-chip + "banked Christopher Nolan ×4" + points) ·
**Share** button (copies an emoji-grid result, Wordle-style) · "Deal again".
Design this as a satisfying curtain call — it's the screenshot people share.

### S5 · Solo board (lighter pass, same language)

Starter pile top-center, your fan + raised card bottom (same hand mechanics),
flip-count golf score in the header, end screen with par result + share.

### S6 · Chronology board (lighter pass, same language)

A horizontal, scrollable **timeline row** of placed cards near the top (order =
release year), your fan at the bottom; drag cards into gaps between placed
cards. Golf scoring, "Cleared" end state + share. Practice spreads: Wide/Tight.

---

## 7. Motion & fluidity spec (show live where the tool allows)

- **Deal/draw**: cards travel deck → fan with stagger; fan re-spaces with a
  spring as cards enter/leave.
- **Raise/lower**: fan card springs up to the raised slot, keeps its fan gap.
- **Turn handoff**: fast clear beat when Taz plays — his card travels, quip pops.
- **Score moment**: points land on the race track with weight (tick-up, small punch).
- **Meld bank**: cards shrink/fly into a new shelf row — a locking-in beat.
- **Take-glow** on the marquee: pulsing invitation (currently gold, Matinee only).
- **Invalid play**: damped horizontal shake on the raised card (exists — keep).
- **Super-link flash**: radial gold burst (exists — restyle, don't remove).
- Interactions < 400ms; ambient loops slow and subtle; respect
  `prefers-reduced-motion` (crossfades instead of springs/spins).

---

## 8. Constraints

- Implementable in **React 18 + Tailwind CSS 4 + Framer Motion ONLY** — CSS
  transforms/gradients/shadows/blend-modes fine; **no canvas, no WebGL, no new
  libraries**.
- Touch targets ≥ 44px. Text contrast AA. `tabular-nums` for scores.
- No movie posters, stills, faces, or studio logos anywhere in the chrome.
- Game rules and copy are FROZEN — restyle the words' containers, not the words
  (quips stay lowercase; labels like "Final Cut", "Recast", "Deep cut" stay).

## 9. Deliverables (what to ask the tool for)

1. Rendered screens: Menu, Duel board (mobile 390×844 AND desktop 1440×900),
   the meld-shelf stress test, Recast offer overlay, End-of-game recap.
2. A **design-token summary**: palette (hex), spacing scale, radii, shadow
   recipes, named z-layers, timing/easing values — so it ports cleanly to code.

---

## 10. Direction add-ons — append exactly ONE per run

### Option A — "Lobby at golden hour" (evolve the current warmth)

> DIRECTION: Keep the warm film-lobby soul but make it rich instead of flat:
> layered cream-to-amber gradients, a soft vignette on the table, brass/gold
> structural accents, deep green felt for the desktop play surface. The flat
> #f4efe6 becomes a lit room. Editorial serif for HUD numerals. Tactile, warm,
> premium — a beautifully lit theater lobby, not beige.

### Option B — "Night screening" (dark; the Balatro/A24 lane)

> DIRECTION: Dark theater. Deep charcoal-navy table with a projector-beam light
> pool where the action happens; HUD elements glow softly like exit signs and
> marquee bulbs. Score race = a lit marquee counter. Gold and accent colors turn
> luminous. Desktop backdrop is a dim auditorium fading to black at the edges.
> Moody but readable — glow is hierarchy, not decoration.

### Option C — "Broadsheet" (clean modern app, zero nostalgia)

> DIRECTION: Crisp 2026 product design — the Linear/NYT Games school. Cool
> neutral background, zones defined by hairline rules and whitespace instead of
> boxes, one confident accent, oversized numerals for the score race, tight
> radii, precise springy motion. NYT Games builds a card battler. Quiet, sharp,
> no texture.

### Option D — "Deco marquee" (theatrical, modernized)

> DIRECTION: Modern art-deco cinema architecture as the TABLE: the score race is
> a literal marquee sign across the top, zones framed by thin deco geometry
> (chevrons, stepped corners), Taz's corner styled as a ticket booth, a subtle
> sunburst behind the meld shelf on desktop. Flat contemporary vector rendering,
> restrained palette, generous space — Wes Anderson symmetry, not casino kitsch.

---

## 11. Stitch quick prompts (if using Stitch instead)

Stitch works best one screen at a time with shorter prompts. Prepend this
context line to each, plus your chosen direction paragraph from §10:

> Context: "Marquee", a daily movie card game. Playing cards are neutral gray
> placeholder rectangles (hand 96×144, pile 124×186, raised 188×282, chip
> 28×40) — do not design card faces. Player = green, CPU = orange.

1. **Menu (mobile)**: Title screen for a movie card game. Serif italic "Marquee"
   logo, three mode cards (Duel vs Computer with 3 difficulty pills, Daily
   Puzzle, Chronology), How to play button.
2. **Duel board (mobile 390×844)**: Card-game table. Top: opponent "Taz" corner
   with face-down card fan, card count, two token chips. Center: draw deck +
   two face-up piles, one glowing as takeable. A score race to 20 in the
   header. Middle: shelf of banked melds (label + tiny chips). Bottom: fanned
   player hand, one raised inspect card above it, Meld button, two token chips.
3. **Duel board (desktop 1440×900)**: Same game as a real desktop table — play
   area center, ambient backdrop, meld shelf as a right side rail, score race
   across the top, opponent corner top-left. Cards same sizes as mobile.
4. **Recast overlay (mobile)**: Dramatic modal — "CPU plays Oppenheimer — super
   link +4" over a card, two stacked buttons "Recast — cancel it" / "Allow it",
   dimmed table behind.
5. **End screen (mobile)**: "You win!" headline, two-row scoring table with big
   net numerals, scrollable highlight reel of the match's plays, Share and
   Deal again buttons.
