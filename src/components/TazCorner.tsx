import { motion } from 'framer-motion'

// TazCorner — the CPU opponent's presence ("The Stub" design language).
//
// PRESENTATIONAL ONLY. Props in, nothing out. No game state, no timers, no
// interaction (the nameplate is inert display; the real DuelGame contract wires
// no onTap here). Reskin of the paper-diorama booth (design_handoff 7a item 2)
// with a compact one-line ticket-strip variant (7e).
//
// POSITIONING: this component renders IN FLOW. The parent owns the pin
// (`absolute inset-x-0 top-[64px] z-10` per docs/ui-contracts.md TazCorner) —
// we must NOT self-position, or the coordinated top offset double-applies.
//
// layoutId: each face-down card-back pip carries `layoutId={id}` bound to the
// card id (NOT the array index). Framer uses this to FLIP the collapse as
// cpuHand shrinks, and the id namespace is shared with the hand/pile/meld-shelf
// surfaces — renaming it silently breaks cross-zone fly animations. No
// AnimatePresence: cards vanish immediately on removal (current accepted
// behavior — not "fixed" here).

interface Tokens {
  finalCut: boolean
  recast: boolean
}

export interface TazCornerProps {
  /** CPU hand — card ids only, never revealed. One card-back pip per entry. */
  cpuHand: string[]
  /** Which tokens Taz still holds; a spent token flips to disabled + strike. */
  cpuTokens: Tokens
  /**
   * The say() message, verbatim. Lowercase comes through as-is — never re-case
   * it (the banner voice is intentionally lowercase). Shown as the italic quote.
   */
  quote?: string
  /** Compact one-line ticket strip (7e) instead of the full booth (7a). */
  compact?: boolean
  /**
   * Taz is one card from going out — surface a calm stub-red "last card"
   * warning (Buri's "quiet booth warning" call, 2026-07-08). Presentational
   * only: the count is already public via the pips, so this is emphasis on
   * visible state, NOT new information — no rule/difficulty change.
   */
  warn?: boolean
}

// A spent token stays VISIBLE (README: "disabled tokens are ALWAYS visible,
// never hidden") but flips to the disabled slate + line-through treatment.
function TokenPill({
  label,
  spent,
  compact,
}: {
  label: string
  spent: boolean
  compact: boolean
}) {
  const pad = compact ? 'px-1.5 py-0.5' : 'px-2 py-[3px]'
  const size = compact ? 'text-[7px]' : 'text-[7.5px]'
  return (
    <span
      className={`${pad} ${size} rounded-stub-pill font-stub-label font-bold tracking-[0.08em] ${
        spent
          ? 'border border-stub-disabled text-stub-disabled line-through'
          : 'bg-stub-navy text-stub-cream'
      }`}
    >
      {label}
    </span>
  )
}

export default function TazCorner({
  cpuHand,
  cpuTokens,
  quote,
  compact = false,
  warn = false,
}: TazCornerProps) {
  const count = cpuHand.length

  // ---- Compact: one-line ticket strip (7e) ---------------------------------
  if (compact) {
    return (
      <div className="relative flex items-center gap-2 rounded-stub-panel border-2 border-stub-navy bg-stub-paper px-3 py-1.5">
        {/* Punched ticket notches — canvas-colored circles with a navy ring,
            straddling the left/right edges (translated half outside). */}
        <div className="absolute -left-2 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-stub-navy bg-stub-cream" />
        <div className="absolute -right-2 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-stub-navy bg-stub-cream" />
        {/* 24px avatar */}
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stub-navy font-stub-display text-xs font-bold text-stub-amber">
          T
        </div>
        {/* warn → the count goes stub-red; the tight strip has no room for a
            pill, so the recolored "1 CARD" carries the last-card signal. */}
        <span
          className={`whitespace-nowrap font-stub-label text-[9px] font-bold tracking-[0.08em] ${
            warn ? 'text-stub-red' : 'font-semibold text-stub-navy'
          }`}
        >
          TAZ · {count} {count === 1 ? 'CARD' : 'CARDS'}
        </span>
        {/* Truncating italic quote — verbatim say() text, min-w-0 so ellipsis
            actually kicks in inside the flex row. */}
        <span className="min-w-0 flex-1 truncate font-stub-ui text-[10px] italic text-stub-slate">
          {quote ? `“${quote}”` : ''}
        </span>
        <TokenPill label="FC" spent={!cpuTokens.finalCut} compact />
        <TokenPill label="RC" spent={!cpuTokens.recast} compact />
      </div>
    )
  }

  // ---- Default: paper-diorama booth (7a) -----------------------------------
  return (
    <div className="relative">
      {/* Diorama stack — two offset paper layers behind the front panel. Both
          2px navy, same 14px radius as the front. Layer 2 (deeper) inset 10px /
          offset 8px; layer 1 inset 5px / offset 4px. inset-x + top/bottom
          recreate the reference's inset-inline + vertical offset. */}
      <div className="absolute inset-x-[10px] top-2 -bottom-2 rounded-stub-panel border-2 border-stub-navy bg-stub-paper-layer-2" />
      <div className="absolute inset-x-[5px] top-1 -bottom-1 rounded-stub-panel border-2 border-stub-navy bg-stub-paper-layer-1" />

      {/* Front panel */}
      <div className="relative rounded-stub-panel border-2 border-stub-navy bg-stub-paper px-[14px] py-[10px]">
        {/* Awning strip — amber/cream 14px stripes, 8px tall, riding the top
            edge (slightly wider than the panel, no bottom border, top corners
            only). */}
        <div
          className="absolute -top-2 inset-x-[-2px] h-2 rounded-t-[10px] border-2 border-b-0 border-stub-navy"
          style={{
            background:
              'repeating-linear-gradient(90deg, #CF952A 0 14px, #F0EBD8 14px 28px)',
          }}
        />

        <div className="flex items-center gap-[11px]">
          {/* 38px navy avatar with amber Domine "T" */}
          <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-stub-navy font-stub-display text-lg font-bold text-stub-amber">
            T
          </div>

          {/* Nameplate + quote */}
          <div className="min-w-0 flex-1">
            <div
              className={`font-stub-label text-[10px] tracking-[0.1em] ${
                warn ? 'font-bold text-stub-red' : 'font-semibold text-stub-navy'
              }`}
            >
              TAZ · CPU · {count} {count === 1 ? 'CARD' : 'CARDS'}
              {warn && (
                <span className="ml-1.5 inline-block rounded-stub-pill bg-stub-red px-1.5 py-[1px] align-middle font-stub-label text-[8px] font-bold uppercase tracking-wider text-stub-cream">
                  Last card
                </span>
              )}
            </div>
            <div className="mt-0.5 truncate font-stub-ui text-[11px] italic text-stub-slate">
              {quote ? `“${quote}”` : ''}
            </div>
          </div>

          {/* Card-back pips — one 11×16px navy tile per hand card. layoutId is
              the card id so Framer FLIP-tracks each across the collapse; keying
              on id (not index) is what keeps the reflow smooth. */}
          <div className="flex gap-[3px]">
            {cpuHand.map((id) => (
              <motion.div
                key={id}
                layoutId={id}
                className={`h-4 w-[11px] rounded-[3px] ${warn ? 'bg-stub-red' : 'bg-stub-navy'}`}
              />
            ))}
          </div>

          {/* Token stack — right, top-aligned column. Spent tokens stay visible
              (disabled + strike), never hidden. */}
          <div className="flex flex-col items-end gap-[3px]">
            <TokenPill
              label="FINAL CUT"
              spent={!cpuTokens.finalCut}
              compact={false}
            />
            <TokenPill
              label="RECAST"
              spent={!cpuTokens.recast}
              compact={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
