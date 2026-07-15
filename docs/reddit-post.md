# r/ClaudeAI outreach post — draft

Modeled on the "Beat the Couch" post (the market-timing game). Same voice:
specific, unpretentious, leads with a clever idea, ends with self-aware
limitations. Everything technical below is true to this repo.

## Before you post — three things only you can fill in

1. **`[URL]`** — your live link.
2. **Play count** — the couch post opens with "over 25K plays." Match Cut went
   public ~2026-07-04, so you probably don't have that number yet. The
   recommended title below leans on the *rigor* instead of traction, which is the
   stronger story for a fresh launch anyway. If you *do* have a number worth
   citing, there's a title variant with a `[X]` slot.
3. **The "why"** — the couch author built his "to settle an argument with a
   friend who thinks he can time the market." That one personal line does a lot of
   work. I left a `[replace with your real reason]` placeholder in the body —
   swap in your actual story; don't post mine.

---

## Title options (pick one)

**Recommended (leads on the idea + the rigor, no traction claim needed):**
> I built a daily movie game with Claude: you connect films through the actors and directors they share — and a solver proves every puzzle is winnable before it's dealt.

**If you have a play count worth citing:**
> I built a daily movie game with [X] plays using Claude: connect movies through the people who made them, race a computer you can actually beat, and a hidden sim tunes the whole thing.

**Punchiest / most "r/ClaudeAI":**
> I used Claude to build a daily movie game — and accidentally built a permutation-test-grade rigor engine hiding behind a game about movie trivia.

---

## Post body (recommended version)

I built a daily movie game called Match Cut. every card is a movie, and movies connect through the people who made them — *Titanic* and *Inception* link because Leonardo DiCaprio is in both; *The Dark Knight* and *Inception* link because Christopher Nolan directed both: [URL]

[replace with your real reason — one honest sentence. the couch guy's was "to settle an argument with a friend who thinks he can time the market." mine's a placeholder: "i'm the person who pauses the movie to argue about where else you've seen that actor, so i built the game i'd lose sleep to."]

there are four modes, all daily, all seeded so everyone gets the same board that day:

- **Daily Puzzle** (solo) — connect a hand of linked films in as few moves as you can. golf scoring, low wins.
- **Duel** — head-to-head movie-rummy against the computer: play links, bank sets, race to 20.
- **Chronology** — no links, just release dates. drop films onto a timeline in the order they came out.
- **Connections** — the NYT shape, but the sixteen tiles are movies and the four hidden groups are a shared director, actor, series, or genre.

i'd had the idea for a while; Claude is what made it actually buildable. i guided the structure, the four modes, the edge cases and the tone of voice — Claude wrote the game engine, the solver, and the simulation harness underneath it.

that harness is the part i'm weirdly proud of, because none of it shows on screen:

- every **Daily Puzzle** is run through a solver *before* it's dealt — it proves a winning line exists and prices "par" from the best possible path, so you never get an unsolvable day.
- every **Connections** board is built by enumerating ~9.5 million possible groupings (needs ~12 GB of RAM, can't run in a browser) to guarantee no movie honestly fits two groups — there's always exactly one clean answer.
- the **Duel** opponent's three difficulty tiers were tuned by a headless sim that plays 4,000–8,000 games against itself, so a casual player wins about 65 / 50 / 41% across the tiers — instead of me eyeballing it.

technical notes: it's a React app (React 18 / Vite / Tailwind / Framer Motion, no other runtime deps), live on Vercel. no accounts, no login. the only thing saved is local — your streaks and personal bests live in your own browser, and nothing a game rule ever reads. analytics is event-level and privacy-safe (a mode started / finished / shared, no PII). the ~240 films are all entered by hand and their credits cross-checked against TMDB.

known limitations, before you find them: the pool skews mainstream Hollywood, because a link only works if the cast is common knowledge — so world cinema is thin right now. names are matched as exact strings, so an actor credited two different ways won't link (there's literally an audit script for this and it still misses some). Chronology and Connections are still "preview" while i grow and fact-check the pool, so a daily regular will start seeing familiar titles. and yes — it's a client-side app, so the movie data and today's seed are sitting in the page source if beating a card game matters that much to you.

happy to answer anything about the movie data, the solver, or the sim.

---

## Shorter variant (~180 words, if the above feels long for the sub)

I built a daily movie game with Claude called Match Cut: every card is a movie, and movies connect through the people who made them (*Titanic* + *Inception* = Leonardo DiCaprio; *The Dark Knight* + *Inception* = Christopher Nolan). four daily modes — a solo "connect the hand in fewest moves" puzzle, a head-to-head Duel vs the computer, a release-date Chronology, and a movie-flavored Connections: [URL]

i had the idea for a while; Claude made it buildable. i drove the structure, the modes and the tone; Claude wrote the engine, the solver and the sim.

the part i like best never shows on screen: a solver proves every daily puzzle is winnable before it's dealt, every Connections board is checked (by enumerating ~9.5M groupings) to have exactly one clean answer, and the Duel AI was tuned by a sim playing thousands of games against itself so a casual player wins ~65/50/41% across three difficulties.

React + Vite, live on Vercel, no accounts. honest caveats: skews mainstream Hollywood, and the data's in the page source if you really want to cheat. ask me anything.
