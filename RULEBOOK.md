# Match Cut — Rulebook

> **Living document.** This is the plain-English guide to how Match Cut plays *right
> now*. Update it whenever a rule or mode changes, so the words here always match
> the game. Written so anyone 12 and up can follow it.
>
> **Last updated:** 2026-07-10 — **The Stub card redesign** (poster-panel card faces, ticket-stub Connections tiles, framed menu cards) plus one rule alignment: a **wild in your draw-3 is kept automatically** (that was always the rule under the hood; the buttons now enforce it). Previous: Daily Puzzle real daily (2026-07-03), Funpass Update (Meld Ladder · Genre Melds · Wild Cards · Take-to-Meld), Flow Update (Double Feature · Draw-3 · Race-to-20).
> **Modes:** Daily Puzzle (live, daily), Duel vs Computer (live), Chronology (live, daily — film pool still growing), Connections (live, daily).

---

## The big idea (all four modes)

Every card is a **movie**, doing **more with less** is always the goal (fewest
moves, fewest mistakes), and every mode ends with a little **emoji row** you can
share. That is the family bond that ties all four together.

There are **four ways to play**:

1. **Daily Puzzle** (Mode 1) is solo. Connect a hand of linked films in as few moves
   as you can, like golf.
2. **Duel vs Computer** (Mode 2) is the head-to-head. Take turns scoring links and
   try to outscore the computer.
3. **Chronology** (Mode 3) is solo too, but it drops the links entirely. Put movies
   in the order they came out.
4. **Connections** (Mode 4) is solo. Sort sixteen movies into four hidden groups of
   four — same director, actor, series, or genre.

### How Modes 1, 2, and 4 connect movies

Modes 1 and 2 share one idea. You **connect movies through the people who made
them** (actors, directors, and writers), or because they are in the **same series**.

> Example: *Titanic* and *Inception* connect because **Leonardo DiCaprio** is in both.
> *The Dark Knight* and *Inception* connect because **Christopher Nolan** directed both.

**Connections (Mode 4) uses the same links** to *group* films — four films that
share a director, an actor, a series, or a genre — instead of chaining them.

**Chronology does not use these links at all.** It is pure release-date ordering:
your only tool is your sense of *when* a film came out. Its own big idea is in the
Mode 3 section below.

---

## Mode 1 — Daily Puzzle (Solo) · LIVE

A quiet brain-teaser. No computer, no clock. Just you and one hand of cards.

### How to play in 30 seconds
1. You start with a hand of movie cards and **one starter card** on the pile.
2. Play a card onto the pile **if it shares a person with the top card**.
3. Keep stacking until your **hand is empty**. The fewer moves, the better — like golf.

### Daily vs practice
- **Daily:** the card's main button. Everyone playing on the same calendar day gets the
  **same starter and hand** (your day rolls over at your own local midnight, like
  Chronology's daily). Every daily is **guaranteed solvable** — a solver proves a winning
  order exists before the hand is dealt.
- **Par is computed, not guessed:** the solver finds the **best possible line** through the
  hand and prices the day from it — a hand rich in combo chains gets a *tougher* par,
  because a sharp player could earn more strokes back. Pars run about **7–12**.
- **Practice:** the small button under it replays the **original hand-designed puzzle**
  (the Scorsese-clique hand, par 9) any time, as a fixed warm-up.

### What's on screen
```
  Flips · Score · Par        (top bar — your running tally)
        ┌─────────┐
        │  PILE   │          (the top card; tap it to peek at the back)
        └─────────┘
   [ your hand of cards ]    (tap to lift, drag onto the pile to play)
```

### Scoring — golf, so LOW is good
- **Peek at a card's back** (its cast & crew): **+1 stroke**, the first time you flip it.
- **Play a card that doesn't connect** (oops): **+2 strokes**.
- **Combo:** connect several cards in a row through the **same person** and you earn a
  stroke **back** (−1) for each extra one. A `Name ×3` badge pops up.
- **Your score = strokes − combo.** Try to finish **under Par**.

### How it ends
- **Solved!** — you emptied your hand. 🎬🟩🟩…
- **Stuck.** — none of your remaining cards can connect to the pile. You can tap
  **Reveal one solution** to see an order that would have worked.
- You get a little emoji row to share how you did.

---

## Mode 2 — Duel vs Computer · LIVE

The main event. You and the computer share **two marquees** (two top cards) and take turns
scoring links, racing to a finish line.

### How to play in 30 seconds
1. You each hold a hand; **two starter cards** sit out — the two **marquees**.
2. On your turn, **play a card that connects** to **either** marquee and score points.
3. First to **20 points** rings the bell — or someone empties their hand. **Highest net score wins.**

### What's on screen
```
   [ computer's cards ]   🎭🎬   (top — how many cards it holds + its 2 powers)
                                   score chips, top-right · "show ends at 20"
   [ DECK ]   ┌──────┐ ┌──────┐   (two marquees — drag a card onto EITHER one;
              │ MARQ │ │ MARQ │    tap the deck to draw 3 and keep 1)
              └──────┘ └──────┘
   [ your hand of cards ]
  🎭 Meld                ◎ Hint    (bottom-left: powers + Meld · bottom-right: hint)
```

**Peeking is free:** tap a marquee's top card — or your own raised card — to **flip it**
and read its credits. It costs nothing and doesn't use your turn (that's a Daily Puzzle
rule; here, study all you like).

### Your turn — pick ONE
- **Play** — drag a card onto **either** marquee. It must share at least one person with that
  marquee's top card. (A **run** stays on the marquee it started — see Runs.)
- **Draw** — tap the deck to **reveal 3 cards** and tap one to **keep** (the other two are
  gone for good). Then **Keep** it in hand, **Toss** it onto a marquee (no points — to unstick
  yourself or hand the computer a dead card), or **play** it if it connects. If a **wild**
  turns up in the reveal, it is **always the keep** — wilds are never burned (the other
  cards gray out; the computer follows the same rule).
- **Meld** — bank **3+ films that share a link** (see Melds below) for points by **rung**.
- **Lay off** — drag a matching card onto a melded row for that row's per-card points.
- **Take** — when a marquee's top card would **finish a meld** for you, a
  **"↑ Take"** button appears on it. Tap it to lift the card into your hand *instead of
  drawing* — then bank the meld **next** turn. (You can't take a card hidden under a wild.)
  On **Matinee**, this gets the beginner treatment: the card **glows gold**, and there's a
  second way to find it — tap **Meld**, pick the **2 cards** you want to build with, and the
  marquee that completes them lights up. On the harder tiers the take is still there, just
  without the glow — spotting it is part of the game.
- **Pass** — only allowed when the deck is empty. Two passes in a row ends the game.

### Melds — now a ladder
A **meld** is **3+ films that share a through-line**. The stronger the link, the more each
card is worth — **highest rung wins**:

| Rung | Each card | What links them |
|---|---|---|
| 🎬 **Auteur** | **+3** | the same **director or writer** |
| ⭐ **Actor** | **+2** | the same **actor** |
| 🎞️ **Series** | **+1** | the same **series/franchise** |
| 🎟️ **Genre** | **+1** | **3+ of the same genre** (a rescue for stranded cards) |

A meld is **named and scored by its top rung** the moment you bank it — a Cillian-Murphy-and-
Christopher-Nolan row is a **Nolan (Auteur)** meld, and it stays that way. Lay-offs onto it
earn that locked per-card amount.

### Points
| Link | Worth | When |
|---|---|---|
| **Standard** | **+1** | one shared actor |
| **Strong** | **+2** | a shared director/writer, or two shared people |
| **Super** | **+4** *and a free extra play* | same series, or 3+ shared people |
| **Meld / Lay off** | **+3 / +2 / +1** per card | by the meld's rung (above) |
| **Final Cut** | **+1** | a wildcard play (see Powers) |
| **Wild card** | **+0** | plays anywhere / fills a meld (see Wild Cards) |

### Wild cards
Three famous films — **12 Angry Men**, **Casablanca**, **Citizen Kane** — are shuffled into the
deck as **wilds** (gold cards). A wild is worth **0 points**, but it's flexible:
- **Plays anywhere** — drag it onto either marquee to get unstuck. It sits on top but is
  *see-through*: the real card underneath still counts for connecting.
- **Fills a meld** — use **one** wild plus **two real** films that share a link to make a
  3-card meld. The wild itself scores 0 (genre melds don't take wilds).

### Runs
After you play, if another card in your hand connects through the **same person**, you
can chain it — up to **3 cards in one turn**. A **Super** link gives you a bonus
"**encore**" play on top of that.

### Powers — one of each, per game
- 🎬 **Final Cut** — play **any** card, even if it doesn't connect (+1). (If it happens
  to connect on its own, you keep the power.)
- 🎭 **Recast** — cancel the computer's **Super link** or **Final Cut** before it lands.
  Their card goes back, they score nothing, their turn is done. *(The computer can do
  this to you, too.)*

### How it ends & who wins
- The game ends the moment **someone reaches 20 points**, OR **someone empties their hand**,
  OR the **deck runs out and both players pass**.
- **Net score = points scored − cards still in your hand.**
- **Highest net score wins** — even if the *other* player crossed 20 or emptied their hand
  first. Reaching 20 just **rings the bell**; **net** decides who actually wins, so holding a
  big hand at the end hurts.
- Scores land around **20** (not ~60 like the old long games) — that's the race, not a bug.
- **Watch the top bar:** when the computer is down to its **last card**, its hand counter
  flags it — your cue to race for points or block the out.
- After the final play, a **recap reel** replays the game's highlights — the big links,
  melds, and super cuts from both sides — before the score card.

### Difficulty & hints
- **Matinee** (easy, default) — plays casually, only reads the credits printed on the
  cards. **Unlimited hints**, plus two beginner helpers: the take-glow (see Take) and a
  **⇲ Sort** button that groups your hand so shared names sit side by side.
- **Feature** (medium) — a fair fight. **3 hints per game.**
- **Director's Cut** (hard) — sees *everything*, including hidden credits, and plays to
  block you. **No hints** — your memory is the game.

### Deep cuts
Some cards say **"+N deeper credits"** — extra famous names that aren't printed on the
card but still count *if you know them*. A link that works **only** through hidden names
is a **deep cut**: the pile glows teal. Same points, extra bragging rights.

---

## Mode 3 - Chronology (Solo) · NEW

> Playable right now. The **public daily** is still warming up while we grow and
> fact-check the film pool, so treat today's rounds as a preview.

A film-history brain-teaser. No casts, no connections. Just you, a row of movies,
and your sense of *when*.

### How to play in 30 seconds
1. One movie starts on the **line**. You hold a hand of cards, titles up and **years hidden**.
2. On your turn, **slot a card into the line** where you think it belongs in time:
   older to the left, newer to the right.
3. **Right slot, it sticks.** Wrong slot, the card **flips to show its real year**,
   snaps to where it actually goes, and you take a stroke. Either way the line stays
   in true order, so every flip teaches you something.
4. Empty your hand. Like golf, **low score wins**.

### What's on screen
```
   Strokes · Streak                      (top bar)

 1979      1994             2016         (the LINE, left = older)
 ┌────┐   ┌────┐           ┌────┐
 │ ●  │ … │ ●  │    ⌄?⌄    │ ●  │         (drop a card into any gap)
 └────┘   └────┘           └────┘
         [ your hand of cards ]          (tap to lift, drag into a gap)
```

### Scoring (golf, so LOW is good)
- **Clean placement** (right gap): **+0**.
- **Misfire** (wrong gap): **+1 stroke**, and the card reveals its year and corrects itself.
- **Streak:** three clean placements in a row earns a stroke **back** (−1). A `Streak ×3`
  badge pops.
- **Tight-call mercy:** land a clean card in a gap whose two neighbors are only a few
  years apart, and a hot streak survives your **next** misfire. It rewards the brave call.
- **Same-year films** still have exactly one right slot, because the game knows the full
  release dates behind the scenes. On a same-year miss it tells you the years matched and
  the date decided it.
- **Your score = strokes − streak credits.** Lower is better.

### How it ends
- **Cleared!** Your hand is empty. You get an emoji row to share (🎬 leads, then 🟩 for
  each clean placement and 🟥 for each misfire, in the order you played), so the shape of
  your run is shareable like the other two modes.
- There is **no "stuck" state**. A card can always go somewhere, so a round always finishes.

### Daily vs practice, and the Wide/Tight dial
- **Daily:** the Chronology card's main button. Everyone playing on the same calendar day
  gets the **same** anchor and hand, so you can compare runs. (Your day rolls over at your
  own local midnight, not a global clock.)
- **Practice:** the `Wide` and `Tight` pills under it start a fresh **random** round any
  time. They only change how the 10 cards are **spread in time**, never a rule or the score:
  - **Wide** (easier) spreads the hand across the decades, so the gaps are roomy.
  - **Tight** (harder) bunches the hand into one narrow window (say, a single decade), so
    the gaps are small and the calls are close.

**The twist:** every card you place makes the next one harder, because the gaps get
smaller. The first card is a gimme. The last one might be threading 1997 between 1995
and 1999.

---

## Mode 4 - Connections (Solo) · NEW

> Playable right now. Like Chronology, the **public daily** is warming up while we
> grow and fact-check the film pool, so treat today's boards as a preview.

Sixteen movies, **four hidden groups of four**. If you've played the newspaper word
game, you know the shape — here the connection is always about the *movies*.

### How to play in 30 seconds
1. You see a **4×4 grid** of sixteen movie titles. Hidden inside are **four groups of
   four**, each joined by one thing: the same **director**, **actor**, **series**, or
   **genre**.
2. **Tap four** titles you think belong together, then tap **Submit**.
3. **Right** — the group locks in and reveals its connection (e.g. *Director · Martin
   Scorsese*).
4. **Wrong** — you lose one of your **four guesses**. If **three** of your four shared
   a group, it tells you **"one away."**
5. Solve **all four groups** before you run out of guesses.

### What's on screen
```
   Connections            Mistakes left ● ● ● ●   (top bar)

 ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
 │TITLE │ │TITLE │ │TITLE │ │TITLE │             (16 title tiles, 4×4)
 └──────┘ └──────┘ └──────┘ └──────┘
      … solved groups slide up as colored bands …
   [ Shuffle ]  [ Deselect ]  [ Submit ]         (Submit lights at 4 picked)
```

### Scoring — fewest mistakes
- You get **four mistakes**. Each wrong guess spends one (a dot goes dark).
- **Solve all four groups** and you win; the fewer mistakes, the better your day.
- Run out of guesses and the board **reveals** the remaining groups — you still keep
  your streak for showing up (like a stuck Daily Puzzle).

### The one rule that makes it fair
Every movie belongs to **exactly one** group. No title honestly fits two connections
at once — so there is always **one clean answer**, never a coin-flip. (Behind the
scenes the game checks this for a whole year of boards before any of them ship.)

### How it ends
- **Solved!** All four groups found. You get an emoji **grid** to share — one row of
  four squares per guess, colored by each tile's real group, so friends see how tangled
  your path was without spoiling the answers.
- **Missed it** — out of guesses. The groups reveal themselves on the board.

### Daily vs practice
- **Daily:** the Connections card's main button. Everyone on the same calendar day gets
  the **same sixteen**, so you can compare. (Your day rolls over at your own local midnight.)
- **Practice:** the **Random grid** pill deals a fresh, already-checked board any time.

---

## Words to know

- **Link** — a connection between two movies (a shared person, or same series).
- **Marquee** — a top card you play onto in the Duel; there are **two** (Double Feature), and
  only each one's **top card** matters for connecting. *(The Daily Puzzle has a single **pile**.)*
- **Double Feature** — the Duel's two-marquee setup: two chances to connect every turn.
- **Hand** — the cards you're holding.
- **Deck** — the face-down draw pile (Duel only). A draw reveals **3**; you keep **1**.
- **Meld** — a banked row of 3+ movies sharing a person, a series, or a genre.
- **Rung / ladder** — how a meld is scored: Auteur (+3) beats Actor (+2) beats Series (+1)
  beats Genre (+1). The meld takes its **highest** rung and keeps it.
- **Lay off** — adding one more matching card to an existing meld (earns its locked rung).
- **Wild** — a gold card worth 0 that plays anywhere or fills a meld (one per meld).
- **Take** — lifting a marquee's top card into your hand to finish a meld, instead of drawing.
- **Run** — playing several cards in one turn through the same person.
- **Encore** — the free bonus play you earn from a Super link.
- **Net score** — points minus the cards left in your hand. This decides the winner.
- **Brick** — a card that connects to almost nothing; hard to get rid of.
- **Par** — the target score to beat in the Daily Puzzle. Computed per day by a solver
  from the best possible line through the hand (combo-richer hand → tougher par).

*Chronology terms:*

- **Line:** the row of placed movies in release order, oldest on the left (Chronology's board).
- **Gap (slot):** a space between two cards on the line, or at either end, where a new card can go.
- **Anchor:** the single movie already sitting on the line when a Chronology round starts.
- **Placement:** slotting one hand card into the line. It comes out clean or a misfire.
- **Misfire:** a placement in the wrong gap. The card flips to show its year and snaps to the right spot for +1 stroke.
- **Streak credit:** the stroke you earn back after three clean placements in a row.
- **Tight-call mercy:** a shield you get for landing a clean card between two close years. It lets a streak survive one later misfire.

*Connections terms:*

- **Grid:** the 4×4 board of sixteen movie titles (Connections' board).
- **Group:** four movies joined by one shared thing — a director, actor, series, or genre.
- **Guess:** one submitted set of four tiles. You get four wrong guesses before the game ends.
- **One away:** the hint you see when three of your four picks belonged to the same group.
- **Band:** the colored strip a solved group collapses into, showing its connection.

---

## What's new

**Connections (Mode 4) is playable (2026-07-07).** A fourth, solo mode: sort sixteen
movies into four hidden groups of four (same director, actor, series, or genre) within
four mistakes. Every board is checked so exactly one clean solution exists, and it ships
with a date-seeded **daily** plus a **Random grid** practice board. Like Chronology, the
public daily waits on locking the film pool, so until then it is a preview.

**The Daily Puzzle is now really daily (2026-07-03).** Mode 1 used to serve one fixed,
hand-designed puzzle; it now deals a **fresh date-seeded hand every day** — the same board
for everyone, guaranteed solvable, with **par computed by a solver** from the day's best
possible line. The original puzzle lives on under the menu's **practice** button.

**Chronology (Mode 3) is playable (2026-06-30).** A third, solo mode with no links at
all: place a hand of movies into a year-ordered line, golf scoring. It ships with a
date-seeded **daily** and a **Wide/Tight** practice dial. The public daily is gated on
locking the film pool, so until then it is a preview.

**The Funpass Update shipped (2026-06-30)** — four new ways to score, now folded into the Duel
rules above:

1. **Meld Ladder** — melds are worth more when the link is stronger (Auteur +3 > Actor +2 >
   Series +1 > Genre +1), and a meld keeps its top rung.
2. **Genre Melds** — 3+ films of the same genre form a low-value meld, so stranded cards
   aren't dead weight.
3. **Wild Cards ×3** — three famous films play anywhere or fill a meld (worth 0).
4. **Take-to-Meld** — grab a marquee's top card to finish a meld, instead of drawing.

**The Flow Update shipped (2026-06-22)** — its three changes:

1. **Double Feature** — two marquees instead of one, so there's almost always something to play.
2. **Draw 3, Keep 1** — a draw reveals three and you keep the best; the game moves faster.
3. **Race to 20** — a finish line, so matches run ~5–8 minutes and end on a beat.

Difficulties were re-tuned (2026-06-30) for the full game so a casual player wins about
**65 / 50 / 41 %** vs Matinee / Feature / Director's.

*Parked (decision **D1**):* the two un-kept draw cards stay **hidden** for now. We may add a
visible discard area later — to be revisited after a play-and-feel pass.
