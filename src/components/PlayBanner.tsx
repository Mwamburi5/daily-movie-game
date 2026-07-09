import { AnimatePresence, motion } from 'framer-motion'
import type { LinkTier } from '../lib/solver.ts'

// Matches DuelGame.tsx's DuelBanner shape verbatim (docs/ui-contracts.md
// "PlayBanner" section) — do not rename/reshape fields, the parent owns the
// state and the ~20 say() call sites that populate it.
export interface PlayBannerData {
  who: 'You' | 'CPU'
  text: string
  tier: LinkTier | null
  points: number | null
  deep: boolean
  seq: number
}

// The turn/announcement line (Stub 7a item 4: "LAST · CPU PLAYED THE
// GODFATHER → PACINO" mono/slate, delta in stub-red). Presentational only —
// the parent still owns the banner state and the 2400ms auto-dismiss timer
// (contract: "Callbacks out: none").
// POSITIONING: this component renders IN FLOW. The parent owns the pin
// (`absolute inset-x-0 top-* z-*` per docs/ui-contracts.md PlayBanner) — a
// self-pin here regresses the small-phone (667px) layout fix (master-plan
// W0d).
export default function PlayBanner({
  banner,
  reduce,
}: {
  banner: PlayBannerData | null
  reduce: boolean
}) {
  return (
    <div className="pointer-events-none flex justify-center px-4">
      <AnimatePresence>
        {banner && (
          <motion.div
            // seq-as-remount-key: a monotonic counter so two consecutive
            // identical messages (e.g. "kept the card" twice) still remount
            // and retrigger the enter animation instead of no-opping as "the
            // same node" (docs/ui-contracts.md PlayBanner "Risk").
            key={banner.seq}
            initial={{ opacity: 0, y: reduce ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 320, damping: 24 }}
            // The two raw hexes below (#a3411a super / #7a5a10 strong) are a
            // documented palette exception — see docs/ui-contracts.md
            // Appendix A (pre-Stub app tier accents; W1 checkpoint judges
            // them on real pixels).
            className={`flex items-center gap-2 rounded-stub-pill border-2 border-stub-navy py-1.5 pl-1.5 pr-2.5 font-stub-label shadow-stub-card-resting ${
              banner.tier === 'super'
                ? 'bg-[#a3411a]'
                : banner.tier === 'strong'
                  ? 'bg-[#7a5a10]'
                  : 'bg-stub-navy'
            }`}
          >
            <span
              className={`rounded-stub-pill px-2 py-1 text-[8.5px] font-bold uppercase tracking-[.12em] text-stub-cream ${
                banner.who === 'You' ? 'bg-stub-amber text-stub-navy' : 'bg-stub-navy-mid'
              }`}
            >
              {banner.who}
            </span>
            {/* Lowercase say() voice preserved verbatim — CAPS is a CSS treatment
                on the wrapper's uppercase siblings, never re-case this span. */}
            <span className="text-[13px] font-semibold normal-case text-stub-cream">{banner.text}</span>
            {banner.deep && (
              <span
                data-banner-deep
                className="rounded-stub-pill bg-stub-teal px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-stub-cream"
              >
                Deep cut
              </span>
            )}
            {banner.points !== null && (
              <span
                data-banner-points
                className="rounded-stub-pill bg-white/25 px-1.5 py-0.5 text-[11px] font-extrabold tabular-nums text-stub-cream"
              >
                +{banner.points}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// The Stub 7a item 4 "last play" strip — a separate, always-visible line
// (mono 8.5px slate) distinct from the animated banner above. Contract text:
// left "LAST · <WHO> PLAYED <TITLE> → <LINK>"-style copy comes in via props
// verbatim (lowercase say() voice preserved by the caller); right delta is
// signed and renders in stub-red only when negative (per the reference:
// "CPU +1" in red is the OPPONENT's gain from the PLAYER's point of view —
// callers decide sign, this component just paints negative red).
export function LastPlayLine({
  text,
  delta,
}: {
  text: string
  delta: { label: string; value: number } | null
}) {
  return (
    <div className="relative z-[var(--z-hud)] flex justify-between px-4 font-stub-label text-[8.5px] font-semibold tracking-[.08em] text-stub-slate">
      <span>{text}</span>
      {delta && <span className={delta.value < 0 ? 'text-stub-red' : undefined}>{delta.label}</span>}
    </div>
  )
}

// FORGE BRIEF NOTE (not a contract item — flag for the orchestrator): the
// "YOUR TURN" pill (Stub 7a item 1) is, per docs/ui-contracts.md, part of
// ScoreRace's header zone (DuelGame.tsx:1268-1303's `data-turn` caption),
// not PlayBanner's. ScoreRace.tsx is out of scope for this Wave A brief, so
// this small pill is exported here per the brief's explicit instruction
// ("+ the YOUR TURN pill from item 1") rather than left unbuilt. Whoever
// wires the real header should decide whether this lives here or gets
// folded into a future ScoreRace restyle — do not treat this export's
// location as a locked architectural decision.
export function TurnPill({ label }: { label: string }) {
  return (
    <span className="rounded-stub-pill bg-stub-amber px-3.5 py-1.5 font-stub-label text-[8.5px] font-bold tracking-[.12em] text-stub-navy">
      {label}
    </span>
  )
}
