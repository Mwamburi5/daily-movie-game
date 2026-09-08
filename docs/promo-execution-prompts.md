# Match Cut promo asset production — execution prompts (Phases 0–2)

Written 2026-08-31. Four paste-able prompts, one per phase. Run each in a
fresh session, in order — Phase 0-docs → Phase 0-captures → Phase 1 →
Phase 2. Each prompt references §0 of this file for shared context; the
executing session must read §0 before editing anything.

The promo track is **production only**. Nothing produced here gets posted,
published, or distributed — distribution waits for the launch switches
(indexing, URL-in-share, front door), which belong to the launch-readiness
pass, not this track.

---

## §0 Shared context & guardrails (in force for every prompt below)

**Repository:** `/Users/mwamburi/Projects/Daily Movie Game`

**Repo state:** the working tree holds the uncommitted 216+16 content-cutover
candidate. Therefore, in every promo session:

1. **Never** stage, commit, push, or deploy. Never modify any tracked file.
   All promo output goes to **new untracked files** under `promo/` (create
   it). If a task seems to need a tracked-file edit, stop and report instead.
2. Do not touch game code, tuning, content data, or `public/` — including
   adding files to `public/` (it ships).
3. `promo/` appearing in `git status` is expected promo-track output. Note
   for Buri: the launch-readiness resume pass reconciles untracked files —
   tell that session `promo/` and `docs/promo-execution-prompts.md` are
   expected, or run it first.

**Brand canon** (source of truth — transcribe, don't reinvent):

- Colors: navy `#1F3A52` (ground), amber `#CF952A` (THE action color —
  accents and CTAs only, never a background wash), cream `#f4efe6` (paper).
  Mode spine colors from `public/social-preview.png`: Daily Puzzle gold,
  Chronology teal, Connections rose, Duel purple.
- Type: Domine 700 (display serif), Inter 400–800 (UI), JetBrains Mono
  600–700 (ticket labels, letterspaced smallcaps).
- Motif: the ticket stub — cream card, colored spine, edge notches, dashed
  tear line ("the cut"). Canon artifacts: `public/favicon.svg` (mark),
  `public/social-preview.png` (marketing-canvas translation),
  `design_handoff_screenshots/` (in-game reference), README token table.
- Voice: "Four movie games, one daily ritual" / "Make the connection." /
  "Connect movies by the people who made them." Lowercase in-game `say()`
  voice stays in-game; promo copy is sentence case, short, no hype-speak.

**Legal / content rules:**

4. **No movie posters, stills, frames, or key art** in any asset. Typographic
   card faces only — this is a deliberate legal position, not a style gap.
5. TMDB attribution (`public/tmdb-logo.svg`) is required wherever TMDB data
   is surfaced; plain title/year text in gameplay captures does not trigger
   it, but keep the rules-modal attribution visible if it appears in frame.
6. **Spoiler rule:** never feature the *current or upcoming* date's real
   daily deal in an asset. Capture from practice modes or a clearly past
   date's deal.
7. **Cutover rule:** the first 216-pool Daily is 2026-09-27; before that,
   captures show the legacy pool. Statics may use legacy captures; anything
   expensive to redo (video) either waits for post-cutover captures or uses
   pool-agnostic shots (tight crops, Chronology/Connections moments).

**Checkpoint discipline:** every phase ends with a written checkpoint file in
`promo/` and a STOP for Buri. Asset look-and-feel is a subjective gate —
never self-approve visual output.

---

## Prompt 1 — Phase 0-docs: brand sheet + shot list

````text
/goal Produce the Match Cut promo foundations: a one-page promo brand sheet
and a gameplay shot list. Docs only — no captures, no Canva work, no code.
Read docs/promo-execution-prompts.md §0 first; its guardrails are in force
verbatim. Do not stage, commit, or modify any tracked file; all output is
new untracked files under promo/.

Repository:
`/Users/mwamburi/Projects/Daily Movie Game`

## Outcome

1. `promo/brand-sheet.md` — the promo brand kit on one page, transcribed
   from repo canon (§0 lists the sources): hex tokens with roles, the four
   mode spine colors, type stack with weights and usage (Domine display /
   Inter UI / JetBrains Mono letterspaced labels), the ticket-stub motif
   anatomy (spine, notches, dashed tear line), logo/mark usage, approved
   taglines, and an explicit do/don't list (amber never a wash; no posters
   or stills; no drop shadows or gradients foreign to the Stub; sentence-
   case promo voice). Include a "Canva Brand Kit setup" subsection listing
   exactly what to enter in Canva: palette hexes, closest available Canva
   font substitutes for Domine/Inter/JetBrains Mono (research and name
   them), and which assets to upload (favicon.svg rasterized at 1024,
   social-preview.png).
2. `promo/shot-list.md` — 6 to 10 numbered gameplay moments worth
   capturing, each with: mode, the exact game state to reach, why it sells
   the game, capture size (390x844 baseline), and whether it is
   pool-agnostic (survives the 2026-09-27 cutover) or legacy-bound. Seed
   candidates: Daily deal opening, a Duel meld completing with the Matinee
   take-glow, a Chronology card landing in its year slot, a Connections
   group resolving, the Results/share screen, the share-grid text itself.
   Respect §0's spoiler rule — every shot must come from practice or a past
   date's deal, and the shot list must say which per shot.
3. `promo/phase0-docs-checkpoint.md` — what was produced, open questions
   for Buri, and a red-pen section listing every judgment call made.

Then STOP for Buri review. Do not proceed to captures or Canva.
````

---

## Prompt 2 — Phase 0-captures: real gameplay screenshots

````text
/goal Capture real Match Cut gameplay screenshots per the approved
promo/shot-list.md. Read docs/promo-execution-prompts.md §0 first; its
guardrails are in force verbatim. No tracked-file edits, no commits; all
output is new untracked files under promo/.

Repository:
`/Users/mwamburi/Projects/Daily Movie Game`

Precondition: promo/brand-sheet.md and promo/shot-list.md exist and Buri
has reviewed them. If missing, stop and report.

## Outcome

1. Capture rig: a throwaway Playwright script under `promo/capture/`
   (untracked; do not add to tests/ or modify playwright config — reuse the
   existing browser-test toolchain read-only). Viewport 390x844,
   deviceScaleFactor 3 (crisp 1170x2532 output), light theme, animations
   settled before each shot. Drive the real dev server; never mock the UI.
2. `promo/captures/` — one PNG per shot-list item, named
   `NN-mode-moment.png` per the shot list numbers. Practice modes or past-
   date deals only (§0 spoiler rule). For moments a script cannot reliably
   reach (mid-animation states), fall back to driving the game manually via
   the browser pane and note the shot as manual in the manifest.
3. `promo/captures/manifest.md` — per shot: how it was reached (seed/mode/
   moves), pool-agnostic or legacy-bound flag, and any shot-list deviations.
4. Quality gate: every capture reviewed at 100% zoom for clipped text,
   mid-animation blur, or dev-only UI (devAssertions banners, HMR badges).
   Reject and reshoot rather than ship a flawed frame.
5. `promo/phase0-captures-checkpoint.md` — contact-sheet summary, misses,
   and anything the shot list got wrong in practice.

Then STOP for Buri review. Do not start Canva work.
````

---

## Prompt 3 — Phase 1: Canva static promo set

````text
/goal Build the Match Cut static promo set in Canva: brand kit setup, mark/
avatar variants, device-framed screenshot cards, a mode-explainer carousel,
and a share-grid showcase template. Read docs/promo-execution-prompts.md §0
first; its guardrails are in force verbatim. Production only — create and
export designs, but do not post, publish, or share anything anywhere.

Repository:
`/Users/mwamburi/Projects/Daily Movie Game`

Preconditions: promo/brand-sheet.md and promo/captures/ exist and are
Buri-approved. The Canva connector is connected on this account (verified
2026-08-31; no Match Cut brand kit exists yet — do not repurpose the
unrelated existing kits). Canva tools load via ToolSearch. If Canva tools
are unavailable or unauthorized, stop and tell Buri to reconnect the Canva
connector in claude.ai settings — do not improvise a workaround.

## Outcome

1. Canva housekeeping: create a root folder "Match Cut Promo" with
   subfolders per deliverable. All designs land in it.
2. Brand foundation in Canva per the brand-sheet's setup subsection. Upload
   brand assets: the live-site URLs work for upload-asset-from-url
   (https://matchcutdaily.com/favicon.svg, /social-preview.png). Local
   captures have no public URL — if URL upload is not possible for them,
   list the exact files for Buri to drag-drop into Canva at the checkpoint
   and build the frames with placeholder slots; do not host repo files on
   third-party services to get URLs.
3. Deliverable A — mark/avatar directions, 1024x1024, 2 to 3 variants:
   (i) the incumbent ticket-stub mark scaled for social, (ii) an "MC"
   monogram cut, (iii) optional wildcard consistent with the Stub. Each
   presented on a circle-crop preview (TikTok/IG/X avatars crop to
   circles) plus a 48px legibility check.
4. Deliverable B — device-framed capture cards: one 1080x1080 feed
   template and one 1080x1920 story template. Phone frame, one capture,
   one hook line, matchcutdaily.com footer. Build as reusable templates,
   then instantiate one real example each from the approved captures.
5. Deliverable C — mode-explainer carousel: four 1080x1080 slides, one per
   mode, using the mode spine colors and the social-preview card language
   (label · title · one-line rule, e.g. "DAILY · GOLF / Daily Puzzle /
   Play the whole hand. Low score wins.").
6. Deliverable D — share-grid showcase: a 1080x1920 template that frames
   the emoji share grid ("Match Cut · <Mode>" + grid + "Cleared · par N")
   as the hero. This is the organic-growth asset; make the grid enviable.
7. Export every design as PNG into `promo/canva-exports/`, and write
   `promo/canva-manifest.md`: design IDs, edit URLs, export filenames, and
   which Canva fonts substituted for Domine/Inter/JetBrains Mono.
8. `promo/phase1-checkpoint.md` — contact sheet of all exports, judgment
   calls, and the manual-upload list from item 2 if any.

Then STOP for Buri review. Look-and-feel is Buri's gate; expect a bounce
round on Deliverable A before anything derives from a chosen mark.
````

---

## Prompt 4 — Phase 2: motion / footage

````text
/goal Produce Match Cut motion assets: storyboards, real gameplay screen
recordings, and vertical clip cuts. Read docs/promo-execution-prompts.md §0
first; its guardrails are in force verbatim. Production only — nothing is
posted or published; §0's cutover rule governs what may be recorded.

Repository:
`/Users/mwamburi/Projects/Daily Movie Game`

Preconditions: Phases 0 and 1 are Buri-approved (approved shot list,
captures, and a chosen mark from Phase 1 Deliverable A). If the date is
before 2026-09-27, record pool-agnostic shots only, or stop and confirm
with Buri that legacy-pool footage is acceptable for the intended use.

## Outcome

1. `promo/storyboards/` — one storyboard per clip, 3 clips, 15 to 30
   seconds each, vertical 9:16: (a) "beat today's par" Daily hook,
   (b) one-mode explainer (pick the most legible mode in motion),
   (c) share-grid payoff ("play → clear → brag"). Each storyboard: beat
   timings, on-screen caption copy in brand voice, capture notes, end card
   with the Phase 1 mark + matchcutdaily.com.
2. Raw footage: extend the Phase 0 Playwright rig to record video
   (Playwright video capture, 390x844 at deviceScaleFactor 3) driving real
   gameplay per the storyboards, saved to `promo/footage-raw/`. Practice or
   past-date deals only (§0 spoiler rule). For beats scripted play cannot
   hit cleanly, write the beat into the manifest as a manual pickup for
   Buri (phone screen recording) rather than faking the moment.
3. Assembly: cut end-card and caption overlay frames in Canva (reuse the
   Phase 1 folder and templates; export stills or clips to
   `promo/footage-assets/`). If full video assembly in Canva proves
   impractical via the API, deliver per-clip assembly kits (raw footage +
   ordered overlays + timing sheet) so Buri can assemble each clip in the
   Canva editor in under ten minutes.
4. `promo/phase2-checkpoint.md` — clip status matrix (storyboard / footage
   / assembly per clip), pickup list, and a reshoot plan for post-cutover
   if legacy footage was recorded.

Then STOP for Buri review.
````

---

## Sequencing notes (for Buri, not the executing sessions)

- Prompts 1 and 2 can run back-to-back in one day; the review between them
  is a red-pen pass, not a design gate.
- Prompt 3's Deliverable A (mark choice) is the only hard dependency inside
  Phase 1 — expect one bounce round there before B–D lock.
- Prompt 4 is the only phase with a calendar coupling (2026-09-27 cutover).
  If launch wants motion sooner, run it pool-agnostic and schedule the
  post-cutover reshoot from the checkpoint's matrix.
- Distribution (posting, channel strategy, launch timing) is deliberately
  outside all four prompts — it rides the launch-readiness track.
