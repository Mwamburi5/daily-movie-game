// Orchestrator ruling (Wave A brief): ONE component covering both the CPU-side
// (DuelGame.tsx:1324-1340, read-only) and player-side (:1667-1699, Final Cut is
// a live toggle) token blocks, via a `side` prop — today those are two separate
// hand-written markup blocks, not a shared component (docs/ui-contracts.md
// "TokenChips" Risk). The co-located "Meld" button (:1700-1719) is explicitly
// OUT OF SCOPE per the brief — it stays inline in DuelGame.tsx.
//
// Stub pills (7a items 1/2): solid navy pill = available "FINAL CUT"; spent =
// #9AA5AD/stub-disabled border+text with a line-through. Always visible,
// never hidden (README "Interactions & Behavior").
//
// W0d ruling (orchestrator, 2026-07-06): CPU-side token pills render inside
// TazCorner — the 7a booth owns them. TokenChips is player-side only in
// W1–W3 wiring; the side='cpu' path stays dormant (kept, not wired — do not
// mount it anywhere).
export interface TokenChipsProps {
  side: 'cpu' | 'player'
  finalCut: boolean
  recast: boolean
  /** Player side only: whether Final Cut is currently armed (next card ignores link rules). */
  fcArmed?: boolean
  /** Player side only: disables the Final Cut toggle without changing its spent/available look. */
  finalCutDisabled?: boolean
  /** Player side only: fires when the Final Cut chip is tapped. Parent owns the say() side-effect
   *  and the `fcArmed` state (docs/ui-contracts.md TokenChips "Behavior notes" recommends this
   *  boundary over threading a `say`-like reporter into a presentational component). */
  onToggleFinalCut?: () => void
  /** Player side only: shrink the pills for 667px-class heights (W3). The CPU booth is
   *  already compact (W1 TazCorner); this brings the player pills to the same footprint
   *  so the bottom-left HUD doesn't crowd the fan on short viewports. */
  compact?: boolean
}

export default function TokenChips({
  side,
  finalCut,
  recast,
  fcArmed = false,
  finalCutDisabled = false,
  onToggleFinalCut,
  compact = false,
}: TokenChipsProps) {
  const interactive = side === 'player'
  // Player pill footprint: compact drops to the CPU booth's px-2/py-1/7.5px so the
  // two token HUDs read as one family at 667px (only the player side toggles size —
  // the cpu path is display-only and already compact).
  const playerPill = compact ? 'px-2 py-1 text-[7.5px]' : 'px-2.5 py-1.5 text-[8px]'

  return (
    <div
      className={`flex gap-1.5 ${side === 'cpu' ? 'flex-col items-end' : 'flex-col items-start'}`}
      data-token-chips={side}
    >
      {interactive ? (
        <button
          type="button"
          data-token="finalCut"
          disabled={!finalCut || finalCutDisabled}
          onClick={onToggleFinalCut}
          className={`rounded-stub-pill border-2 ${playerPill} font-stub-label font-bold uppercase tracking-[.08em] transition-transform active:scale-95 ${
            !finalCut
              ? 'border-stub-disabled bg-stub-paper text-stub-disabled line-through'
              : fcArmed
                ? 'scale-105 border-stub-amber bg-stub-amber text-stub-navy shadow-stub-glow-amber'
                : 'border-stub-navy bg-stub-paper text-stub-navy'
          }`}
        >
          Final Cut
        </button>
      ) : (
        <span
          data-cpu-token="finalCut"
          className={`rounded-stub-pill px-2 py-1 font-stub-label text-[7.5px] font-bold uppercase tracking-[.08em] ${
            finalCut
              ? 'bg-stub-navy text-stub-cream'
              : 'border border-stub-disabled text-stub-disabled line-through'
          }`}
        >
          Final Cut
        </span>
      )}

      {/* Recast is never armed ahead of time (docs/ui-contracts.md: "recast is
          only ever spent reactively, via playerRecast() inside the RecastOffer
          overlay") — both sides render it as a static display chip. */}
      <span
        data-token="recast"
        className={
          side === 'player'
            ? `rounded-stub-pill border-2 ${playerPill} font-stub-label font-bold uppercase tracking-[.08em] ${
                recast
                  ? 'border-stub-navy bg-stub-paper text-stub-navy'
                  : 'border-stub-disabled bg-stub-paper text-stub-disabled line-through'
              }`
            : `rounded-stub-pill px-2 py-1 font-stub-label text-[7.5px] font-bold uppercase tracking-[.08em] ${
                recast
                  ? 'bg-stub-navy text-stub-cream'
                  : 'border border-stub-disabled text-stub-disabled line-through'
              }`
        }
      >
        Recast
      </span>
    </div>
  )
}
