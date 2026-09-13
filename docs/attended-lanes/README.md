# Attended lanes A–E — the pack (built 2026-09-10)

The five attended lanes are the only launch gate no automation can close.
This folder is everything a booked human needs to close one in about 30
minutes, plus the grid Buri fills in to book them.

| file | what it is |
|---|---|
| `lane-A.md` | desktop Safari, all four modes (Mac) |
| `lane-B.md` | real iPhone Safari, portrait + landscape |
| `lane-C.md` | real Android Chrome, portrait + landscape |
| `lane-D.md` | VoiceOver end-to-end (same Mac as A) |
| `lane-E.md` | TalkBack end-to-end (same Android as C) |
| `schedule.md` | the booking grid, hardware list, runway math, and the outreach drafts Buri sends himself |
| `owner-checklist.md` | the owner-only account chores for the same week (MFA, `main` ruleset, dashboard look, DNS export + D7, Dependabot) |

**Candidate:** production `main@9a5fdbb` (`dpl_HWeNAMnK2eLernz47PCG9RAmgCu6`)
at `https://matchcutdaily.com`, served bundle `index-DAtVcX_d.js`. Lanes run
against production (decision D3 in `docs/prelaunch-review-2026-09-03.md`); no
Preview, no bypass cookie, nothing to mint.

**Evidence rule (unchangeable):** a lane closes only with the named hardware,
a present human, and this exact candidate. Old receipts, simulators, and
automation never close a lane. If the served asset name is not
`index-DAtVcX_d.js` on the day, stop — the candidate moved.

**How a sitting works.** Fill the header of the lane sheet, work down the
eight surfaces ticking each, write `none` or the defect in the last column,
sign the result line. Screenshots go into
`audit/daily-duel-216-launch-readiness-2026-08-27/attended/` (gitignored,
local; see its README for names). The filled sheet is the receipt — an agent
transcribes its result into `docs/daily-duel-216-attended-acceptance.md`
rows 4–8 afterwards; nobody edits the matrix from a phone.

**Canon.** The surface list and the continuation scripts are transcribed from
`docs/daily-duel-216-attended-acceptance.md`; if the two ever disagree, that
file wins.
