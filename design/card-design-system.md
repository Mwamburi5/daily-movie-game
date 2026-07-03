# Marquee · Card Design System

> The visual rulebook for cards. Built for **portrait, one-handed mobile play**.
> Goal: a player can parse any card instantly, even when it is fanned, overlapped,
> or shrunk to a tile. This document feeds the art prompts and the React layout.
>
> **Last updated:** 2026-06-22 · Companion to RULEBOOK.md

---

## What a Marquee card actually carries

Marquee is not Phase 10. There are no numbers or suits. So we map the classic
card-game roles onto Marquee's real information:

| Card-game concept | Marquee equivalent | Why it matters |
|---|---|---|
| Suit / color | **Genre** (double-coded: color + shape) | The fast at-a-glance identity |
| Card value | **Connect-credits** (the people you link through) + their point worth | This is what you actually play |
| Title | **Movie title + year** | The card's name; must be big and legible |
| Action / wild | **Powers** (Final Cut, Recast) and **Deep Cut** state | Special plays, flagged with bold icons |
| Card back | **Cast & crew "peek"** (the flip) | The +1-stroke reveal |
| Deck back | A separate uniform pattern | Hides identity, contrasts with the table |

---

## The seven rules

### 1. The top-left index
The most critical info lives hard against the **top-left corner**: a **genre pip**
(color + shape) immediately followed by the **title**. When cards fan and overlap,
the top-left strip is often all you see, so genre + title must read from that corner
alone. Never spend the top-left on artwork.

### 2. Double-coding (accessibility is non-negotiable)
Genre is never color alone. Every genre = **a color AND a distinct shape**, so it
survives colorblindness and tiny sizes. Locked taxonomy:

| Genre | Color | Shape glyph |
|---|---|---|
| Drama | Teal | Circle |
| Romance | Rose / pink | Heart |
| Sci-Fi | Blue | Triangle |
| Action | Red | Chevron |
| Comedy | Amber | Star |
| Horror | Purple | Crescent |
| Thriller | Slate | Square |
| Animation / Family | Green | Rounded square |

Roles inside the connect-credits are **also** double-coded: actor = blue circle,
director = amber square, writer = purple triangle.

### 3. Ruthless visual hierarchy
Eyes should travel in this order:

1. **Primary:** title + genre index (what is this card?)
2. **Secondary:** connect-credits and their point values (what can I do with it?)
3. **Tertiary:** key art and flavor (the mood)

Keep the **center clean enough** that the art reads at thumbnail size. Powers and
Deep Cut use **bold universal icons**, never small text.

### 4. Mobile aspect ratio
Cards are **tiles, not paper**. Target ratio roughly **3:4** (slightly squatter than
a poker card's 1:1.4) so ten of them survive a portrait fan. Art must hold up
**miniaturized**: bold shapes and high contrast, no fine detail that turns to mud.

### 5. Physical tells
Keep the board-game feel: a **distinct border** separating card from table, a
**3–5mm corner radius** (no sharp 90° corners), and a consistent inner frame around
the art. Cards should look die-cut.

### 6. Card-back contrast
- The **deck back** (draw pile) is a single uniform design that contrasts **heavily**
  with the play surface, so the draw deck is unmistakable.
- The **flip back** of an individual card shows the **full cast & crew** plus the
  **hidden deep-cut credits**. This is the "peek."

### 7. Portrait, thumb-zone layout
- **Bottom third (golden zone):** the player's hand. Tap-to-spread (dock-style),
  auto-sort toggle (by genre / by year).
- **Middle (stretch zone):** the **pile top** (always visible, with its connectable
  names highlighted so "what can I link through?" is never hidden in a menu),
  the deck, and the meld shelf (played cards shrink ~50%).
- **Top third (look-don't-touch):** opponent status, scores, game state.
- Favor **gestures over buttons**: flick up to toss/discard, tap to multi-select,
  swipe to meld.

---

## Locked direction (fronts)

**Decided 2026-07-03**, after reviewing the Stitch style tournament ("Marquee Card
Prototypes" project): two house styles, same symbolic key-art approach (evoke the
film through setting, objects, mood, and color, never a real poster, still, logo,
or actor likeness):

- **A · Repertory Ticket**, rendered in **screen-print** texture — full production
  spec: `card-spec-A-repertory-ticket.md`.
- **C · Silent Era**, rendered in **antique engraving on aged paper** — full
  production spec: `card-spec-C-silent-era.md`.
- **B · Marquee Lights** is dropped: it renders beautifully but the bulb frame eats
  edge real estate at fan/thumbnail size and is costly for physical print.
- The Pokémon-style Trading Tile idea was folded into the credit-row layout both
  locked styles already use (scored "moves" rows).

The movie-independent layer — fixed geometry, identical art window, data contract,
and the batch protocol for scaling to 200–400 movies — lives in
`card-template-contract.md`. Historical exploration notes: `stitch-card-styles.md`;
older prompt: `card-art-prompt.md` (superseded by the per-style templates).
