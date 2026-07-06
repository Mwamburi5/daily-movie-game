// Preview harness for ScoreRace (?preview=ScoreRace). Dev-only, self-contained:
// owns its own mock props and a timer that walks the scores upward so the race
// bar animates and the numerals tick. Mounts the component twice — the 7a
// default block on its navy header, and the 7e compact inline bar — plus a
// reduced-motion note (toggle OS "reduce motion" to exercise that path).
import { useEffect, useState } from 'react'
import ScoreRace from '../ScoreRace'

const TARGET_SCORE = 20

type Status = 'playerTurn' | 'cpuTurn' | 'recastOffer' | 'over'

// A little script that drifts both scores toward 20 so the bar visibly moves.
// Loops so the reviewer always sees motion within a few seconds of loading.
const SCRIPT: { you: number; taz: number; status: Status; run: number | null }[] = [
  { you: 0, taz: 0, status: 'playerTurn', run: null },
  { you: 4, taz: 0, status: 'cpuTurn', run: null },
  { you: 4, taz: 3, status: 'playerTurn', run: 1 }, // run offer → caption reads "Run ×2?"
  { you: 8, taz: 3, status: 'cpuTurn', run: null },
  { you: 8, taz: 9, status: 'recastOffer', run: null }, // CPU pill stays active
  { you: 13, taz: 9, status: 'playerTurn', run: null },
  { you: 13, taz: 15, status: 'cpuTurn', run: null },
  { you: 18, taz: 15, status: 'playerTurn', run: null },
  { you: 20, taz: 15, status: 'over', run: null }, // gameOver → hint + caption hide
]

function useScript(intervalMs: number) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % SCRIPT.length), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return SCRIPT[i]
}

export default function ScoreRacePreview() {
  const s = useScript(1600)
  const gameOver = s.status === 'over'
  const run = s.run === null ? null : { people: ['Pacino'], count: s.run, pileIdx: 0 }

  return (
    <div className="flex min-h-full w-full flex-col items-center gap-8 bg-stub-cream p-6">
      <div className="w-full max-w-[420px]">
        <p className="mb-2 font-stub-label text-[10px] uppercase tracking-[0.14em] text-stub-slate">
          7a — default (on navy header)
        </p>
        {/* Recreate just enough header chrome (navy block, halftone, top row) so
            the cream scores and amber bar read against their real backdrop. */}
        <div
          className="relative rounded-b-stub-header bg-stub-navy px-4 pb-3.5 pt-3 text-stub-cream"
          style={{
            backgroundImage:
              'radial-gradient(rgba(31,58,82,.06) 1px, transparent 1.2px)',
            backgroundSize: '6px 6px',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-stub-display text-[21px] font-bold text-stub-cream">DUEL</span>
            <span className="font-stub-label text-[9px] font-semibold uppercase tracking-[0.14em] text-stub-amber">
              Show ends at {TARGET_SCORE}
            </span>
          </div>
          <ScoreRace
            playerScore={s.you}
            cpuScore={s.taz}
            status={s.status}
            runState={run}
            gameOver={gameOver}
            TARGET_SCORE={TARGET_SCORE}
          />
        </div>
      </div>

      <div className="w-full max-w-[375px]">
        <p className="mb-2 font-stub-label text-[10px] uppercase tracking-[0.14em] text-stub-slate">
          7e — compact (inline, small phone)
        </p>
        <div className="flex items-center gap-2.5 rounded-b-[18px] bg-stub-navy px-3.5 pb-3 pt-2.5 text-stub-cream">
          <span className="font-stub-ui text-[14px] text-stub-amber">←</span>
          <span className="font-stub-display text-[16px] font-bold tracking-[0.03em]">DUEL</span>
          <ScoreRace
            compact
            playerScore={s.you}
            cpuScore={s.taz}
            status={s.status}
            runState={run}
            gameOver={gameOver}
            TARGET_SCORE={TARGET_SCORE}
          />
        </div>
      </div>

      <p className="max-w-[420px] text-center font-stub-ui text-[11px] text-stub-slate">
        Scores advance every 1.6s so the bar width (500ms ease-out) and the
        count-up numerals animate. Enable your OS "reduce motion" setting to
        verify the 150ms crossfade path (no travel).
      </p>
    </div>
  )
}
