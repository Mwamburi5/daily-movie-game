# 01 — Overview

**Last verified:** 2026-09-13 on `codex/handoff-refresh-2026-09-13` (from main 8100e29)

## What it is

Match Cut is a free, browser-based daily movie game at
[matchcutdaily.com](https://matchcutdaily.com). Every card is a movie; movies
connect through the people who made them (shared actor, director, writer) or by
being in the same series. Four modes share that idea and end in a shareable
emoji recap, Wordle-style. There are no accounts, no ads, no backend: the whole
game is a static React site that deals every puzzle from a date seed, so
everyone in the world sees the same board on the same calendar day.

The four modes, as the player sees them:

| Mode | Shape | Daily? | Scoring |
|---|---|---|---|
| **Daily Puzzle** (internally "Solo") | Chain a hand of 7 films back to a starter through shared people; flipping a card to see its credits costs a stroke | Yes, date-seeded, solver-guaranteed solvable, computed par | Golf: lower wins |
| **Duel vs Computer** | Rummy-like card game against a CPU ("Taz") with melds, wild cards, and a race to 20 points; three difficulty tiers Matinee / Feature / Director's Cut | No (deliberately session-based) | Points: highest net wins |
| **Chronology** | Place films one at a time onto a year-ordered timeline; years hidden until placed | Yes | Golf: strokes for misplacements |
| **Connections** | NYT-Connections-style 4×4 grid; find four groups of four films sharing a director, actor, series, or genre | Yes, from a pre-baked year of grids | Win/lose in ≤4 mistakes |

## Who it is for

Built and owned by Buri (Mwamburi Mkaya, GitHub `Mwamburi5`). The intended
audience is casual daily-puzzle players first and film buffs second. A "circle"
of 5–10 friends has played since 2026-07-10 as the quiet-launch test group; the
public launch is planned for 2026-09-27. The project is also a candidate for a
physical card game later (Duel translates directly to a table).

## Names and aliases

| Name | Where it appears | Meaning |
|---|---|---|
| **Match Cut** | Product name since 2026-07-04; all player-facing copy, share lines (`Match Cut · <Mode>`), package name `matchcut` | The current name. A "match cut" joins two scenes through a shared element, which is the game's mechanic |
| **Marquee** | Pre-2026-07-04 name. Older docs, `design/` folder, the Stub handoff, memory file names (`marquee-*`), Vercel project name `marquee`, alias `marquee-one-iota.vercel.app` | The old product name. Do not rename in history. Lowercase "marquee" is **still a live game term**: the Duel's two face-up "Double Feature" piles are "the marquee" |
| **Daily Movie Game / Daily Movie Chain** | Repo folder name `~/Projects/Daily Movie Game`, memory directory, earliest sessions | The original working name before the pivot |
| **Solo** | Code (`SoloGame.tsx`, `verify:solo`), docs | Internal name for the Daily Puzzle mode |
| **Taz** | Duel CPU persona, `TazCorner` component | The CPU opponent. Player-facing label was swept to "CPU" on 2026-07-09; taunts kept |
| **The Stub** | `design_handoff_the_stub/`, `StubCard`, `stub-*` CSS tokens | The locked visual language (cream/navy/amber ticket-stub design), ruled 2026-07-05 |
| **216 + 16** | Everything from late August on | The launch content: 216 curated films for Daily/Duel plus 16 wild cards; first deals 2026-09-27 |
| **Approvals 1–5** | September docs and memory | Buri's sequenced go/no-go gates: 1–2 commit/merge (done 09-01), 3 protected Preview (done 09-03), 4 production deploy (done 09-05), 5 the go-public switches (ruled 2026-09-13: **Saturday 09-19**; the commit is `5edaec3` on `codex/approval-5`, CI green, not deployed) |
| **W0–W6, P1/P2, M4a** | `docs/master-plan.md` | The July build waves (W6 = "SEND", the quiet launch) and parallel lanes |
| **codex/** | Branch names | Buri also drives this repo with Codex (`/goal` prompts); branches are named `codex/…` regardless of which agent ran them |

## History in ten lines

1. **2026-06-11** — Pivot from a movie-chain idea to "Marquee": a movie card
   solitaire plus a Duel vs CPU. Stack locked (React 18 / Vite / Tailwind 4 /
   Framer Motion, nothing else). *(memory `marquee-pivot-and-stack`)*
2. **2026-06-17 → 06-30** — The Duel simulator becomes the rules contract
   (`sim/RULESET.md`, `npm run verify`); the "flow" and "funpass" rule packages
   are simmed, locked, and ported to React. Chronology mode built 06-28 → 06-30.
3. **2026-07-03** — First git commit. Daily Puzzle becomes a real date-seeded
   daily with a constructive dealer and solver-priced par.
4. **2026-07-04** — "First-principles grill": goal = public launch; persistence
   guardrail lifted (localStorage streaks + Vercel Analytics); build Connections
   as mode 4; renamed **Match Cut**; domains bought.
5. **2026-07-05 → 07-06** — TMDB author-time pipeline; pool grows 89 → 237 in
   audited waves; orchestrated multi-agent build era begins; Buri calls the
   project "lost and bloated" → **`docs/master-plan.md` becomes the only live plan**.
6. **2026-07-06 → 07-10** — Waves W1–W5: the whole game re-dressed in the Stub
   UI, Connections shipped, data readouts, polish. **W6 SEND 2026-07-10: live at
   matchcutdaily.com** (noindex, URL-free shares) and texted to the circle.
7. **2026-07-12 → 07-17** — Chronology Stage B pool 162 → 438 (deployed);
   circle feedback batch 1 logged (27 entries) and fixed.
8. **2026-08-07 → 08-24** — Status audit → production-polish program (Phases
   1–4), delivery foundations (code split, budgets, CI), security hardening
   (CSP, pinned actions, `check:security`), Wave 3 pool → 482 dated films,
   onboarding. Production refreshed 08-18 (`c063f26`).
9. **2026-08-24 → 08-31** — The **216 + 16 content cutover** chosen via a picker
   tool, retuned (65.9 / 50.3 / 41.4 win rates), fully reviewed, fix-passed,
   and taken through launch-readiness Goals 0–8.
10. **2026-09-01 → 09-05** — Approvals 1–4: merged (PR #2), Preview-verified,
    three polish batches (PRs #10–#13), **production deploy of `9a5fdbb`
    2026-09-05**, rollback drilled, nightly smoke + canary crons live (PR #14).
    **2026-09-07 → 09-13, docs only:** handoff folder, stale-docs pass,
    master-plan v6 (PR #16), process retrospective run, the attended-lanes
    pack + owner checklist built (09-10), Buri's rulings (09-13, PR #17):
    lanes A–E booked for **Tue 09-15**, Approval 5 = **Sat 09-19** with the
    URL on every share, small-phone pass skipped. Then freeze 09-24,
    **premiere 2026-09-27**.

## Vocabulary

- **Sim / verify / parity** — `sim/` holds a headless Duel simulator and per-mode
  verification suites. React and the sim call the same functions in `src/lib/`,
  so rules cannot drift ("parity by construction"). Gate counts: Duel 64/64,
  Solo 8/8, Chronology 42/42, Connections 14/14.
- **Tune** — the Duel difficulty calibration (casual-player win rate per tier,
  targets 65 / 50 / 41). Any pool or rule change invalidates it.
- **Pin** — a verify assertion that today's published dailies still deal the
  same boards (a hash of a known seed). Bumping a pin is a conscious "cutover".
- **Cutover** — switching a daily mode to a new pool on a fixed date (the 216
  pool from 2026-09-27; seeds before that stay on the legacy 89).
- **Deep cut** — a credit a card does not show on its face but that still counts
  for links; discovering one is part of the skill.
- **Meld / ladder / rung** — Duel sets of linked cards scored by the highest
  category: Auteur +3 > Actor +2 > Series +1 > Genre +1 per card.
- **Wild** — 16 blank-credit "Hall of Fame" cards spliced into the Duel deck.
- **Final Cut / Recast** — the two one-shot Duel tokens.
- **Gate-split autonomy** — objective work (sim, pool, tooling) auto-commits and
  pushes; UI work stops for Buri's eyes with side-by-side screenshots.
- **Checkpoint** — a stop point where Buri reviews before anything continues.
- **Quiet phase** — live but `noindex` and URL-free shares; flips at Approval 5.
- **Attended lanes A–E** — real-hardware acceptance: desktop Safari, real iPhone,
  real Android, VoiceOver, TalkBack. Never closable by automation. Run-sheets
  live in `docs/attended-lanes/`; all five are booked for Tuesday 2026-09-15
  (Buri runs them himself).
- **Freeze** — 72 hours before the premiere: no deploys, DNS, or Vercel changes.
- **Practice rows** — the four menu entries that deal a non-daily round.
- **Front door** — which mode the public landing leads with; undecided, leaning
  Chronology, ruled after D+14 interviews.
- **Jar** — the SSO-bypass cookie jar needed to reach a protected Vercel
  Preview. Minted by Buri by hand at the start of a fixed weekly slot (ruled
  2026-09-13; first use the Approval 5 Preview on 09-19); agents must never
  read the Vercel token.
