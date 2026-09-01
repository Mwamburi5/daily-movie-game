import { useEffect, useRef } from 'react'

// useDialogA11y — shared modal keyboard contract (§7·7b a11y slice).
//
// Every full-screen overlay (rules, intro, draw-3 picker, recast offer, the
// four end screens) renders over a board that stays in the DOM, so without
// containment Tab walks into the covered background. This hook gives each
// dialog the standard trio:
//   • initial focus — the dialog root takes focus on mount (root needs
//     tabIndex={-1}); screen readers enter the dialog context
//   • a Tab cycle — focus wraps within the dialog's focusables, and a focus
//     that somehow lands outside snaps back in
//   • Escape — calls onClose when the dialog HAS a dismiss affordance; forced
//     choices (draw picker, recast, end screens) pass no onClose and simply
//     trap
// On unmount, focus returns to the previously-focused element best-effort
// (end screens replace the board, so the old target may be gone — null-safe).
//
// The caller spreads dialog semantics itself (role="dialog" aria-modal
// aria-label tabIndex={-1}) — this hook only owns behavior, matching the
// house "wrapper owns the pin" split between structure and conduct.

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// `active` exists for dialogs rendered INLINE behind a condition (Duel's
// game-over): the ref only attaches once the overlay renders, so the effect
// keys off the caller's visibility flag instead of mount. Components that
// mount/unmount whole (rules, results, draw picker) leave it defaulted.
export function useDialogA11y(onClose?: () => void, active = true) {
  const ref = useRef<HTMLDivElement>(null)
  // Ref the callback so the effect never re-runs (re-running would re-steal focus).
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!active) return
    const node = ref.current
    if (!node) return
    const prev = document.activeElement instanceof HTMLElement ? document.activeElement : null
    node.focus({ preventScroll: true })

    const focusables = () =>
      [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null, // visible only
      )

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeRef.current) {
        e.stopPropagation()
        closeRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const active = document.activeElement
      const idx = items.indexOf(active as HTMLElement)
      const outside = active !== node && idx === -1
      if (outside || (e.shiftKey && (idx === 0 || active === node))) {
        e.preventDefault()
        items[e.shiftKey ? items.length - 1 : 0].focus()
      } else if (!e.shiftKey && idx === items.length - 1) {
        e.preventDefault()
        items[0].focus()
      }
    }

    // Document-level: the trap must catch Tab even if focus escaped the dialog.
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      prev?.focus?.({ preventScroll: true })
    }
  }, [active])

  return ref
}
