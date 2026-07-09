import { useEffect, useRef, useState } from 'react'
import PlayBanner, { LastPlayLine, TurnPill, type PlayBannerData } from '../PlayBanner.tsx'

// Preview convention (src/components/previews/Sample.preview.tsx): file name =
// preview name, default export is self-contained (own mock state, no app
// imports). Cycles through banner messages via a seq bump on a timer so the
// seq-as-remount-key re-animation is visible without user interaction.
const MESSAGES: Omit<PlayBannerData, 'seq'>[] = [
  { who: 'You', text: 'played it — links on Pacino', tier: 'standard', points: 1, deep: false },
  { who: 'CPU', text: 'super link: The Godfather via Pacino', tier: 'super', points: 4, deep: false },
  { who: 'You', text: 'kept the card — deep cut!', tier: 'strong', points: 2, deep: true },
  { who: 'CPU', text: 'kept the card', tier: null, points: null, deep: false },
]

export default function PlayBannerPreview() {
  const [i, setI] = useState(0)
  const seq = useRef(0)

  useEffect(() => {
    const t = setInterval(() => {
      seq.current += 1
      setI((n) => (n + 1) % MESSAGES.length)
    }, 1800)
    return () => clearInterval(t)
  }, [])

  const banner: PlayBannerData = { ...MESSAGES[i], seq: seq.current }

  return (
    <div className="relative h-[520px] w-full max-w-[420px] overflow-hidden bg-stub-cream">
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="font-stub-display text-lg font-bold text-stub-navy">Duel</span>
        <TurnPill label="YOUR TURN" />
      </div>

      <div className="relative mt-10">
        <PlayBanner banner={banner} reduce={false} />
      </div>

      <div className="absolute inset-x-0 top-[220px]">
        <LastPlayLine text="LAST · CPU PLAYED THE GODFATHER → PACINO" delta={{ label: 'CPU +1', value: -1 }} />
      </div>
      <div className="absolute inset-x-0 top-[248px]">
        <LastPlayLine text="LAST · YOU PLAYED TAXI DRIVER → DE NIRO" delta={{ label: 'YOU +2', value: 2 }} />
      </div>

      <p className="absolute inset-x-0 bottom-4 px-4 text-center text-[11px] text-stub-slate">
        message #{i + 1}/{MESSAGES.length} · seq {seq.current} (bumps every 1.8s, remounts the pill even on repeat text)
      </p>
    </div>
  )
}
