interface ResultActionsProps {
  primaryLabel: string
  onPrimary: () => void
  onMenu: () => void
}

// One terminal action hierarchy for every mode: the replay/deal action is the
// amber primary, while Menu is the stable outlined escape. The wrapper owns
// responsive stacking so individual result screens cannot drift at narrow
// widths or 200% zoom.
export default function ResultActions({
  primaryLabel,
  onPrimary,
  onMenu,
}: ResultActionsProps) {
  return (
    <div className="app-result-actions" data-result-actions aria-label="Replay and menu actions">
      <button
        type="button"
        data-result-cta="primary"
        onClick={onPrimary}
        className="app-result-action app-result-action--primary active:scale-[0.98]"
      >
        {primaryLabel}
      </button>
      <button
        type="button"
        data-result-cta="menu"
        onClick={onMenu}
        className="app-result-action app-result-action--secondary active:scale-[0.98]"
      >
        Menu
      </button>
    </div>
  )
}
