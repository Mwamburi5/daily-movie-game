import type { ReactNode } from 'react'

interface DailyModeHeaderProps {
  title: string
  eyebrow: string
  onBack: () => void
  right: ReactNode
  className?: string
}

// One movie-house marquee for the three daily games. Mode components keep
// ownership of their score/status content; this shell owns only the proven
// texture, type hierarchy, 44px navigation target, amber keyline, and center
// ticket tab from the selected Premiere Reel direction.
export default function DailyModeHeader({
  title,
  eyebrow,
  onBack,
  right,
  className = '',
}: DailyModeHeaderProps) {
  return (
    <header
      className={`daily-mode-header relative z-50 flex min-h-[82px] flex-none items-center justify-between overflow-visible rounded-b-stub-header bg-stub-navy px-3 pb-3 pt-4 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-stub-header"
        style={{
          backgroundImage: 'radial-gradient(rgba(240,235,216,.10) 1px, transparent 1.2px)',
          backgroundSize: '6px 6px',
        }}
      />
      <div className="relative flex min-w-0 items-center">
        <button
          type="button"
          aria-label="Back to menu"
          onClick={onBack}
          className="flex h-11 w-9 flex-none items-center justify-center text-2xl text-stub-amber transition-transform active:scale-90"
        >
          ‹
        </button>
        <div className="flex min-w-0 flex-col leading-none">
          <span className="daily-mode-title truncate font-stub-display font-bold tracking-tight text-stub-cream">
            {title}
          </span>
          <span className="mt-1 font-stub-label text-[9px] font-bold uppercase tracking-[0.16em] text-stub-amber">
            {eyebrow}
          </span>
        </div>
      </div>
      <div className="relative ml-2 flex flex-none items-center justify-end">{right}</div>
      <span className="daily-mode-header-tab" aria-hidden="true" />
    </header>
  )
}
