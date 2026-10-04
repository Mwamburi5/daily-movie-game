import { DAILY_MODE_LABEL, dailyProgram, type DailyMode } from '../lib/progress.ts'
import ProgressNotice from './ProgressNotice.tsx'
import { useLocalDateSeed } from '../lib/useLocalDateSeed.ts'

export interface DailyResultNavigation {
  mode: DailyMode
  seed: string
  onNavigate: (mode: DailyMode) => void
}

interface ResultActionsProps {
  primaryLabel: string
  onPrimary: () => void
  onMenu: () => void
  dailyNavigation?: DailyResultNavigation
}

// Menu is the primary way to finish a visit. The next daily is optional.
// Shared stacking keeps result actions usable at narrow widths and zoom.
export default function ResultActions({
  primaryLabel,
  onPrimary,
  onMenu,
  dailyNavigation,
}: ResultActionsProps) {
  const todaySeed = useLocalDateSeed()
  const program = dailyNavigation ? dailyProgram(todaySeed, dailyNavigation) : null
  const next = program?.next
  const previousDay = dailyNavigation && dailyNavigation.seed !== todaySeed
  const replayLabel = previousDay
    ? `Replay this ${dailyNavigation.mode === 'solo' ? 'hand' : dailyNavigation.mode === 'chronology' ? 'line' : 'grid'}`
    : primaryLabel
  return (
    <div className="app-result-actions" data-result-actions aria-label="Next game, replay and menu actions">
      <ProgressNotice />
      {program && (
        <p className="col-span-full font-stub-ui text-[13px] leading-snug text-stub-navy" data-result-program aria-live="polite">
          {previousDay
            ? `A new day, three fresh dailies. This result is for ${dailyNavigation!.seed}.`
            : program.completed === 3
              ? 'Triple Feature complete! Fresh puzzles arrive at your local midnight.'
              : `${program.completed}/3 daily stubs stamped. One puzzle is enough; another is optional. Fresh puzzles arrive at your local midnight.`}
        </p>
      )}
      {next && dailyNavigation && (
        <button
          type="button"
          data-result-cta="next-daily"
          data-next-daily={next}
          onClick={() => dailyNavigation.onNavigate(next)}
          className="app-result-action app-result-action--secondary col-span-full active:scale-[0.98]"
        >
          Next: {DAILY_MODE_LABEL[next]}
        </button>
      )}
      <button
        type="button"
        data-result-cta="primary"
        onClick={onPrimary}
        className={`app-result-action ${next ? 'app-result-action--secondary' : 'app-result-action--primary'} active:scale-[0.98]`}
      >
        {replayLabel}
      </button>
      <button
        type="button"
        data-result-cta="menu"
        onClick={onMenu}
        className="app-result-action app-result-action--primary active:scale-[0.98]"
      >
        Menu
      </button>
    </div>
  )
}
