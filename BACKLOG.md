# Backlog — Match Cut (Daily Movie Game)

Small, scoped items suitable for a single agent session. Add new items to the
bottom; strike items when complete.

---

1. ~~**Add a "How to Play" modal**~~ — onboarding overlay triggered from the main
   menu that surfaces a 3-step quickstart (pick a mode → guess the movie →
   score). Reuse copy from RULEBOOK.md so it never drifts.
   Shipped: mode-specific How to Play plus a four-screen first-run welcome —
   `src/components/HowToPlay.tsx`, `src/components/Onboarding.tsx` (2026-08-24).

2. ~~**Persist personal bests to localStorage**~~ — per-mode best score / best
   streak stored under `mc.personalBest.<mode>`. Guard against stale schema;
   migrate if a prior key format exists. Meta-state only — never persist
   game-rules state.
   Shipped: personal bests live in the `matchcut:v1` meta blob with a
   sanitizer — `src/lib/progress.ts` — not under the proposed
   `mc.personalBest.<mode>` key.

3. ~~**Add a share-result button**~~ — generates a text summary of the day's
   result (mode, score, streak) for clipboard copy. No external deps; use
   `navigator.clipboard.writeText`.
   Shipped: family share format with clipboard copy and a manual fallback —
   `src/lib/share.ts`, `src/components/ShareCopy.tsx`.

4. **Keyboard shortcut hint in DuelGame** — show a small overlay or footer
   listing active keyboard shortcuts (Enter to submit, Backspace to clear,
   etc.) on first play, dismissible with localStorage flag.

5. **Audit `say()` messages for tone consistency** — sweep all `say()` call
   sites and flag any messages that break the lowercase, informal voice
   established in CLAUDE.md. Report-only; do not auto-fix.
