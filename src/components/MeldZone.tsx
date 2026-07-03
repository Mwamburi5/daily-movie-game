import { motion } from 'framer-motion'
import { movieById } from '../data/movies.ts'
import { isWild, wildMovie, type Meld } from '../lib/duel.ts'

// Name a banked meld by its LOCKED highest rung (stored at bank time) — so a
// Murphy+Nolan row reads "Christopher Nolan", and never flips as lay-offs arrive.
// Falls back to the old series/person label for any pre-ladder meld.
export const meldLabel = (m: Meld) =>
  m.rungName ?? (m.series ? m.series.split('-').join(' ') : m.people[0] ?? 'meld')

// Banked marquee rows, shared by both players. Rows light up when the
// raised card could lay off onto them — they double as drop targets.
export default function MeldZone({
  melds,
  highlightIds,
  setRowRef,
}: {
  melds: Meld[]
  highlightIds: ReadonlySet<number>
  setRowRef: (id: number, el: HTMLDivElement | null) => void
}) {
  if (melds.length === 0) return null
  return (
    <div className="absolute inset-x-0 top-[440px] z-10 flex flex-col items-center gap-1.5 px-3">
      {melds.map((meld) => (
        <div
          key={meld.id}
          ref={(el) => setRowRef(meld.id, el)}
          data-meld-row={meld.id}
          className={`flex max-w-full items-center gap-1 rounded-lg bg-white/60 px-2 py-1 shadow-sm ${
            highlightIds.has(meld.id) ? 'ring-2 ring-[#7a5a10]' : ''
          }`}
        >
          <span className="max-w-[76px] shrink-0 truncate text-[8px] font-extrabold uppercase tracking-wider text-[#7d7563]">
            {meldLabel(meld)} ×{meld.cardIds.length}
          </span>
          {meld.cardIds.map((cid) =>
            isWild(cid) ? (
              <div
                key={cid}
                className="flex h-10 w-7 shrink-0 items-center justify-center rounded bg-[#caa53d] text-[12px] text-white ring-1 ring-inset ring-white/50"
                title={wildMovie(cid)?.title}
              >
                ★
              </div>
            ) : (
              <motion.div
                key={cid}
                layoutId={cid}
                className="h-10 w-7 shrink-0 rounded ring-1 ring-inset ring-white/40"
                style={{ background: movieById.get(cid)!.posterColor }}
              />
            ),
          )}
        </div>
      ))}
    </div>
  )
}
