import type { ReactNode } from 'react'
import Icon from './Icon.tsx'

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
      className={`app-shell-header daily-mode-header relative z-50 flex flex-none items-center justify-between overflow-visible bg-stub-navy px-3 ${className}`}
    >
      <div className="relative flex min-w-0 items-center">
        <button
          type="button"
          aria-label="Back to menu"
          onClick={onBack}
          className="app-back-button daily-icon-button daily-icon-lg text-stub-amber transition-transform active:scale-90"
        >
          <Icon name="back" size={24} />
        </button>
        <div className="flex min-w-0 flex-col leading-none">
          <span className="daily-mode-title whitespace-nowrap font-stub-display font-bold tracking-tight text-stub-cream">
            {title}
          </span>
          <span className="mt-1 font-stub-label text-[9px] font-bold uppercase tracking-[0.16em] text-stub-amber">
            {eyebrow}
          </span>
        </div>
      </div>
      <div className="relative ml-2 flex flex-none items-center justify-end">{right}</div>
      <span className="app-shell-header-tab daily-mode-header-tab" aria-hidden="true" />
    </header>
  )
}
