# AGENTS.md — Match Cut (Daily Movie Game)

This repo uses **CLAUDE.md** as its primary context / working-guidelines doc.
Read it first — it covers behavioral rules, project guardrails, the sim↔React
parity contract, and the locked dependency policy.

- **Context doc:** [`CLAUDE.md`](./CLAUDE.md) — start here.
- **Living build plan:** `docs/master-plan.md` (and its Ledger).
- **Canonical ruleset:** `sim/RULESET.md` — the sim is the source of truth.
- **Plain-English guide:** `RULEBOOK.md` — every mode explained for a 12-year-old.

## Branch policy

All agent work goes on a feature branch (e.g. `agent/…`). **Never push directly
to `main`.** Open a PR when the work is reviewable.

## Tech stack

React 18 · Vite · Tailwind 4 · Framer Motion. No new dependencies without
explicit approval.

## Verification

Before any rule or scoring change ships, run `npm run verify` (64/64) plus the
solo, chronology, and connections suites. See CLAUDE.md for full details.
