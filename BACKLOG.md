# Backlog — Match Cut (Daily Movie Game)

Small, scoped items suitable for a single agent session. Add new items to the
bottom; strike items when complete.

---

1. **Add a "How to Play" modal** — onboarding overlay triggered from the main
   menu that surfaces a 3-step quickstart (pick a mode → guess the movie →
   score). Reuse copy from RULEBOOK.md so it never drifts.

2. **Persist personal bests to localStorage** — per-mode best score / best
   streak stored under `mc.personalBest.<mode>`. Guard against stale schema;
   migrate if a prior key format exists. Meta-state only — never persist
   game-rules state.

3. **Add a share-result button** — generates a text summary of the day's
   result (mode, score, streak) for clipboard copy. No external deps; use
   `navigator.clipboard.writeText`.

4. **Keyboard shortcut hint in DuelGame** — show a small overlay or footer
   listing active keyboard shortcuts (Enter to submit, Backspace to clear,
   etc.) on first play, dismissible with localStorage flag.

5. **Audit `say()` messages for tone consistency** — sweep all `say()` call
   sites and flag any messages that break the lowercase, informal voice
   established in CLAUDE.md. Report-only; do not auto-fix.
