# Attended lanes A–E — schedule grid, hardware, runway math, outreach drafts

Built 2026-09-10 (Thursday), re-dated 2026-09-13 (Sunday) because no sitting
had been booked by then. Candidate = production `main@9a5fdbb` at
`https://matchcutdaily.com`. Nothing here has been booked or sent; Buri fills
the *Who* and *Booked* columns and sends the drafts himself.

## 1. The grid

Three sittings close five lanes. A and D share the Mac; C and E share the
Android phone; B is the iPhone.

| lane | sitting | who | hardware needed | earliest | candidate dates | booked date | status |
|---|---|---|---|---|---|---|---|
| A — desktop Safari | **1 · Mac** (~45 min for A + D) | ________ (Buri can run this one alone) | a Mac on current macOS with current Safari; the JavaScript console | Sun 09-13 | Sun 09-13 · Mon 09-14 · Tue 09-15 | | not booked |
| D — VoiceOver | **1 · Mac** | ________ (same person as A) | the same Mac, VoiceOver (built in) | Sun 09-13 | same sitting as A | | not booked |
| B — iPhone Safari | **2 · iPhone** (~30 min) | ________ | a physical iPhone on current iOS (a small-class phone — SE / mini — is the more valuable one; one phone is acceptable); a cable + a Mac if surface 6 is to be run on-device | Mon 09-14 | Mon 09-14 · Tue 09-15 · backstop Wed 09-16 | | not booked |
| C — Android Chrome | **3 · Android** (~45 min for C + E) | ________ | a physical Android phone on current Chrome (a 360-wide screen is the one that matters); a USB cable + any computer with Chrome if surface 6 is to be run on-device | Mon 09-14 | Mon 09-14 · Tue 09-15 · backstop Wed 09-16 | | not booked |
| E — TalkBack | **3 · Android** | ________ (same person as C) | the same Android, TalkBack (built in on stock Android and Samsung) | Mon 09-14 | same sitting as C | | not booked |

Hard stop for all five: **Sat 09-19** (the day Approval 5 is targeted). A
lane finished on 09-19 leaves no room for a fix.

## 2. Hardware list (bring to the sitting)

- Mac, charged, current macOS + Safari; VoiceOver works out of the box.
- iPhone, charged, current iOS; Lightning / USB-C cable; Web Inspector toggle
  is in Settings → Safari → Advanced.
- Android phone, charged, current Chrome; USB cable; Developer options → USB
  debugging for the console step.
- Somewhere to paste the share text (Notes on each device is fine).
- The lane sheet, printed or open on a second screen (`docs/attended-lanes/lane-<X>.md`).
- For surface 7 every device's clock gets set to **2026-09-25** for a few
  minutes and then restored; if a device cannot change its clock (Screen Time,
  MDM), record surface 7 as NOT RUN rather than skipping silently.

## 3. Runway math

- Sun 09-13 → premiere Sun **09-27**: 14 days. Freeze from **Thu 09-24
  00:00 local**. Last comfortable deploy **Sun 09-20**; absolute last **Wed
  09-23** (never within ~2 h of local midnight). Approval 5 is targeted
  **Sat 09-19** with 09-20 as the retry day.
- A defect found in a lane costs, end to end: fix + PR + CI (~1 h of agent
  time) + Buri's review + a Preview gate + Buri's deploy. Every one of those
  human steps has taken up to a day when Buri was away from the Mac (the
  09-01 jar mint took a day). Budget **two calendar days** per defect.
- So: lanes done by **Tue 09-15** leaves four days of fix margin before
  09-19; by **Wed 09-16** leaves three; on 09-19 leaves none (a fix would
  then have to ride the 09-20 → 09-23 retry window, sharing it with
  Approval 5, and any defect found *after* Approval 5 forces a second
  go-public deploy inside the last three days).
- Recommendation: Sitting 1 (Mac, Buri alone) **tonight, Sun 09-13**, or
  Mon 09-14; Sittings 2 and 3 on **Mon 09-14 / Tue 09-15**; Wed 09-16 as the
  one backstop. The 09-11 → 09-13 window this pack first proposed has passed
  unbooked. Lanes C and E are the ones most likely to need someone else's
  phone — send that draft first.

## 4. Outreach drafts (Buri sends; nothing here has been sent)

Each asks for ~30–45 minutes, names the hardware, says what the person will
do, and asks them not to pass the URL around yet (the site is deliberately
unlisted until launch).

### 4a. Android + TalkBack sitting (lanes C + E) — send first

> Hi ___ — could I borrow you and your Android phone for about 45 minutes
> one evening early this week (Mon 14th or Tue 15th; Wed 16th as a fallback)?
> I'm launching a small daily movie game on the 27th and need it played
> through once on a real Android phone in Chrome, then once more with
> TalkBack turned on so I can hear how a screen reader reads it. You'd play
> each of the four modes for a minute or two, copy a result, and tell me
> anything that looks or sounds wrong; I'll sit next to you with a checklist.
> Bring the phone charged and a USB cable if you have one. It's at
> matchcutdaily.com — please don't share the link yet, it's unlisted until
> launch. Thank you!

### 4b. iPhone sitting (lane B)

> Hi ___ — could I get about 30 minutes with you and your iPhone one day
> early this week (Mon 14th or Tue 15th; Wed 16th as a fallback)? I'm launching
> a small daily movie game on the 27th and it has never been played on a
> real iPhone. You'd open it in Safari, play each of the four modes for a
> minute or two in portrait and landscape, copy a result, and tell me
> anything that looks off; I'll have a checklist. If your phone is one of the
> smaller ones (SE or mini) that's even better. It's at matchcutdaily.com —
> please keep the link to yourself for now, it's unlisted until launch.
> Thanks!

### 4c. Mac + VoiceOver sitting (lanes A + D) — only if Buri does not run it himself

> Hi ___ — could you spare about 45 minutes on a Mac this week? I'm launching
> a small daily movie game on the 27th and need it played through once in
> Safari and once more with VoiceOver on, so I can record what a screen
> reader actually says on each screen. You'd play each of the four modes for
> a minute or two, copy a result, and read me what VoiceOver announces at a
> few points I'll mark on a checklist. No setup — VoiceOver is built in
> (Cmd + F5). It's at matchcutdaily.com; please don't share the link yet.
> Thank you!

## 5. What only Buri can do

1. Pick the people (or himself) and write them into the *who* column.
2. Send the drafts above and put the three sittings on the calendar.
3. Sit in on each sitting with the lane sheet; sign the result line.
4. Tell an agent when a sheet is signed so the acceptance matrix is updated
   from the sheet, and so any defect gets a fix branch the same day.
