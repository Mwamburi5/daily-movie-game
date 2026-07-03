# Marquee (Daily Movie Game)

A movie-trivia card game built as three modes, all sharing one idea: every card
is a movie, every mode is scored like golf (low score wins), and every mode ends
with a shareable emoji recap.

- **Daily Puzzle** (solo) — connect a hand of linked films in as few moves as
  possible. Date-seeded, one real puzzle per day, solver-guaranteed.
- **Duel vs Computer** — head-to-head, take turns scoring links to outscore the
  CPU. Includes Matinee / Feature / Director's Cut difficulty tiers.
- **Chronology** — solo, no links: put movies in the order they were released.

Movies connect through the people who made them (shared actor, director, or
writer) or by being in the same series — see [`RULEBOOK.md`](./RULEBOOK.md)
for the full plain-English rules.

## Stack

React 18 · Vite · Tailwind CSS 4 · Framer Motion — no other runtime
dependencies.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck and build for production |
| `npm run preview` | Preview the production build |
| `npm run verify` | Run the Duel simulation contract check |
| `npm run verify:chronology` | Run the Chronology simulation contract check |
| `npm run verify:solo` | Run the Daily Puzzle simulation contract check |
| `npm run sim` | Run the Duel gameplay simulator |
| `npm run eval` | Evaluate Duel difficulty tuning |
| `npm run eval:chronology` | Evaluate Chronology difficulty tuning |

## Project structure

- `src/` — React app (game UI, one component per mode)
- `sim/` — headless game simulation and verification harness; this is the
  source of truth for game rules — `sim/RULESET.md` documents the contract
- `design/` — card art production specs and reference renders
- `docs/` — supporting design/reference docs
- `RULEBOOK.md` — living plain-English rules guide for players
- `PLAN.md` — project planning notes

## Status

Live and actively developed. Daily Puzzle and Duel are shipped; Chronology is
playable with a growing content pool ahead of its own public daily.
