# Circle feedback log (post-SEND window, 2026-07-10 → interviews ~2026-07-24)

Append-only ledger of every report from the 5–10 circle — texts, screenshots,
in-person comments, anything. One line per report, newest at the bottom. The
~2026-07-24 interview session reads this file alongside the Vercel Analytics
data (share + outcome events) to pick the front door; a report that never got
logged is a report that never happened.

Format (keep it one line; split multi-issue texts into multiple lines):

```
YYYY-MM-DD · who · mode (duel/solo/chronology/connections/menu/general) · device · gist · tag
```

Tags: **bug** (it broke) · **feel** (works, but the experience) · **confusion**
(didn't understand a rule/affordance). Add `!` for anything blocking someone
from playing — §2.11 exception (a): blockers may deploy mid-window.

---

<!-- entries below; do not edit or reorder earlier lines -->
2026-07-10 · Buri · chronology · unspecified · line overflows at 4–5 cards; can't scroll while a card is raised (backdrop) or mid-drag (pointer capture), so edge gaps are unreachable and the nearest-visible-gap hit-test scores unintended misfires ("got a bunch wrong") · bug
2026-07-10 · (ruling) · chronology · — · entry above ruled `!` in-session (score-corrupting → §2.11 exception a): fix 267a8be DEPLOYED same day (dpl_7tUmeLkVxnTVBmZQ7RJUHz8Uq8gK); chronology feedback + analytics split pre/post this deploy · bug!
<!-- 2026-07-16 batch: first circle feedback — six screenshots processed this day (four texters + one 13-item shared note). Where a message timestamp was visible it's noted in the gist; all texts appear to fall in the post-Stage-B window (build index-CjEFO-7t.js, 438 pool, live 07-12). The shared note's own header is pixel-cut in the screenshot ("July 1?, 2026"), so its exact day — and whether it predates the Stage B deploy — is unconfirmed. -->
2026-07-16 · Hans · general · phone (iMessage) · "games are a lot of fun" — favorites = Connections + Chronology; warmed to the daily + vs-computer modes once he got into them; clear would-return on both favorites · feel
2026-07-16 · Hans · chronology · phone (iMessage) · drew The Little Mermaid and couldn't tell WHICH — "didn't know which version it was the original animated or live action"; both films are in the 438 pool under the bare title, so the card is genuinely undecidable · confusion
2026-07-16 · unnamed friend · connections · Android (RCS) · expected the grid to be one group of each category type ("I thought it was one of each category"), so end-game he hunted series+genre groups that weren't there · confusion
2026-07-16 · unnamed friend · chronology · Android (RCS) · Little Mermaid remake trap again, independent of Hans — "Cronology is tough when the same movie is remade lol I got the little mermaid and it came out in 2023" · confusion
2026-07-16 · unnamed friend · duel · Android (RCS) · "I did not understand the duel vs computer at all" — total comprehension failure, not a partial one · confusion
2026-07-16 · unnamed friend · general · Android (RCS) · "I would Def come back to Cronology and connections" — same would-return pair as Hans · feel
2026-07-16 · Charlie Dinning · general · phone (group iMessage, msg ≤07-14) · "I do not know enough about films. But everything worked like it should!" — non-buff, zero breakage · feel
2026-07-16 · Eyad · connections · phone (group iMessage, msg 07-15) · "Everything worked btw" then "Couldn't get a single one for connections 😂" — nothing broke, but the difficulty wall was total for a non-buff · feel
2026-07-16 · Uzair Abbasi · connections · iPhone (group iMessage, msg 07-16 1:44am) · got 2 of 4 groups; genre categories read subjective — "Gone girl doesn't feel like a thriller to me, more of a drama" · feel
2026-07-16 · Uzair Abbasi · connections · iPhone · easy-mode suggestion: after a guess, reveal that film's color/category so the rest can be inferred (his example: Batman Begins → actor/purple → Big Short must be the Christian Bale group) · feel
2026-07-16 · Uzair Abbasi · solo · iPhone · daily-puzzle onboarding: "didn't realize flipping was a bad thing at first" + drag-to-play took a sec to discover — wants an explicit drag prompt · confusion
2026-07-16 · Uzair Abbasi · solo · iPhone · wants a short overall-summary popup up front with a button through to the detailed instructions · feel
2026-07-16 · Uzair Abbasi · chronology · iPhone Safari (screenshot in thread) · tight practice: card row runs off-screen right — "gotta figure out a way to display all on one screen or show a prompt that you can scroll with finger"; scroll works post-267a8be but the affordance is undiscoverable · confusion
2026-07-16 · Uzair Abbasi · chronology · iPhone · same-year runs (his tight deal had five 2014s): wants the month shown when placed cards share a year, or even quarter/season ("summer blockbuster vs fall horror") · feel
2026-07-16 · note author (name unknown) · connections · shared Apple note ("Match Cut Notes", header date cut: July 1?) · wants the 4 groups to always be the same 4 category types, one of each, "rather than all 4 being one category" — second report of the one-of-each expectation · feel
2026-07-16 · note author · connections · shared note · "should have 3 hints" · feel
2026-07-16 · note author · solo · shared note · "better be able to see the names of movies in your hand" — hand readability · feel
2026-07-16 · note author · solo · shared note · "Daily puzzle - best play option" — ambiguous: either praise (daily = the best mode to play) or a request for a best-play hint; clarify at interviews · feel
2026-07-16 · note author · solo · shared note · "can you only connect by actor or director? I wanted to make a sci fi but it wouldn't let me (interstellar and arrival)" — genre melds need 3 cards; the floor is invisible in-game so it read as a missing feature · confusion
2026-07-16 · note author · general · shared note · "Rules should be formatted better" · feel
2026-07-16 · note author · duel · shared note · "Deep cut?" — the deep-cut concept/stamp needs explaining · confusion
2026-07-16 · note author · chronology · shared note · "Wide and tight lol" — the practice pill labels read as jargon · confusion
2026-07-16 · note author · chronology · shared note · suggestion: don't correct each placement immediately; batch submit, then reveal which cards are out of place — ⚠ scoring-rule change, would invalidate chronology tuning + verify pins if adopted · feel
2026-07-16 · note author · chronology · shared note · suggestion: "Timeline on chronology going vertical" — (the codex/chronology-reel branch is already exploring a reel layout in this direction) · feel
2026-07-16 · note author · chronology · shared note · suggestion: "goal should be lowest time" — ⚠ scoring-rule change, same caveat as the batch-submit idea · feel
2026-07-16 · note author · chronology · shared note · "Input month if it's the same year. Add an extra step" — second independent ask for same-year month disambiguation (see Uzair) · feel
2026-07-16 · note author · general · shared note · "Does genre make it easier?" — ambiguous (duel genre melds? connections genre groups?); needs follow-up at interviews · confusion
