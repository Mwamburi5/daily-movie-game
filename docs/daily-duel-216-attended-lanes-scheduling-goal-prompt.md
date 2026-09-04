# Match Cut 216+16 — attended lanes A–E scheduling pack (follow-up) — Goal prompt

Run this in a fresh session, after (or in parallel with) the Preview
verification pass. The five attended lanes are the launch-readiness pass's
only remaining human blockers and the declared long pole of the 2026-09-27
runway. A session cannot run them — they need a present human, named
hardware, and real assistive tech — but it CAN remove every ounce of
friction so a booked human closes a lane in under 30 minutes. That is this
goal: a complete scheduling-and-execution pack, not the lanes themselves.

Governing context (read first): `docs/daily-duel-216-attended-acceptance.md`
(the evidence-tier matrix, shared surface list, and continuation scripts A–E
are the canon — transcribe, don't reinvent), then
`docs/daily-duel-216-ship-receipt.md` (merged candidate identity) and
`docs/daily-duel-216-launch-readiness-checkpoint.md` §9.

## Ground rules

1. **Candidate identity moved.** The acceptance doc pins the 08-31 dirty-tree
   candidate; the candidate is now merged `main` =
   `14a546e79ae1af3206e470f8f555d74257ff3a58`. Update the doc's candidate
   line (and nothing else in it beyond the status columns this pass touches)
   so lanes record the right identity. Lanes may target a local
   `npm run build && npm run preview` of that SHA or the protected Preview
   once Approval 3 stands — record which.
2. **Evidence rule is untouchable:** named hardware + present human + this
   exact candidate. Old receipts, simulators, and automation never close a
   lane.
3. No commit/push (docs edits stay local for Buri's later docs-only commit);
   no deploy; no indexing change; no messaging sent anywhere on Buri's
   behalf — outreach text is DRAFTED for him to send himself.

## Deliverables

1. **Lane run-sheets ×5** — `docs/attended-lanes/lane-A.md` … `lane-E.md`
   (new local files): one page each, transcribed from the acceptance doc's
   shared surface list + that lane's continuation script, with a fill-in
   header (device model, OS/browser/AT version, tester, date, candidate SHA,
   portrait/landscape), a checkbox per surface (1–8), a defect column
   defaulting to `none`, and the exact evidence-drop path
   (`audit/daily-duel-216-launch-readiness-2026-08-27/attended/`). Include
   the lane-specific setup line (e.g. B/C: `npm run preview -- --host` LAN
   URL; D: VoiceOver on in macOS Safari; the 2026-09-25 long-title board via
   device clock for surface 7).
2. **Scheduling grid** — `docs/attended-lanes/schedule.md`: the five lanes ×
   (who / hardware needed / earliest date / booked date / status), prefilled
   with the hardware each lane demands and honest blanks for people. Flag
   pairings that can share a sitting (A+D on the Mac; C+E on the Android).
3. **Outreach drafts** — in the same file: a short message per distinct
   tester ask (Mac/VoiceOver sitting, iPhone sitting, Android/TalkBack
   sitting) that Buri can paste to a human, stating time cost (~30 min),
   hardware, and what they'll do. Draft only — Buri sends.
4. **Evidence scaffolding** — create the empty
   `audit/daily-duel-216-launch-readiness-2026-08-27/attended/` directory
   with a `README.md` naming convention line (gitignored tree; local).
5. **Status wiring** — update the acceptance doc's matrix rows 4–8 to point
   at the run-sheets, statuses still honestly `ATTENDED NOT RUN`.
6. Memory update + a closing report: the grid, the two-sittings insight,
   the runway math (lanes should complete before the production-soak window
   narrows — first 216 Daily is 2026-09-27), and what Buri must do himself
   (pick people, send outreach, put sittings on the calendar).

## Completion gate

Complete when the five run-sheets, the schedule grid with outreach drafts,
the evidence scaffold, the candidate-identity update, and the memory/report
exist — with zero lanes falsely marked run, zero messages sent externally,
and zero commits. Anything a run-sheet needs that the acceptance doc doesn't
answer: list it as an open question for Buri rather than inventing it.

---

Paste-able `/goal` block:

````text
/goal Produce the Match Cut attended-lanes A–E scheduling pack. Read
docs/daily-duel-216-attended-lanes-scheduling-goal-prompt.md FIRST and follow
it verbatim; this condition is only its completion gate. The lanes themselves
are NOT runnable by a session (present human + named hardware required) —
the goal is the pack: five one-page lane run-sheets under
docs/attended-lanes/ transcribed from docs/daily-duel-216-attended-acceptance.md,
a schedule grid with hardware needs and shared-sitting pairings (A+D Mac,
C+E Android), paste-able outreach drafts Buri sends himself, the gitignored
attended/ evidence scaffold, the acceptance doc's candidate line updated to
merged main 14a546e79ae1af3206e470f8f555d74257ff3a58 with rows 4–8 still
honestly ATTENDED NOT RUN, and a memory update + closing report with the
runway math to 2026-09-27. Hard constraints: no commit/push, no deploy, no
indexing change, no external message sent, no invented test content — open
questions go to Buri. Stop when the pack is complete and reported.
````
