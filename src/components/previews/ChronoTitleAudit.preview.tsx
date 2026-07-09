// Preview: ?preview=ChronoTitleAudit — the ride-along fit gate. Renders every
// Chronology pool card's TITLE face (faceUp=false) at line · hand · raised so an
// in-browser canvas pass can confirm no title breaks mid-word (real Domine, whole
// 162-film pool). Tagged data-audit-id/data-audit-size. Throwaway (2026-07-08).
import { ChronoCardView } from '../ChronoCard'
import { CHRONOLOGY_POOL } from '../../data/chronologyPool.ts'
import type { ChronoCardSize } from '../ChronoCard'

const SIZES: ChronoCardSize[] = ['line', 'hand', 'raised']

export default function ChronoTitleAuditPreview() {
  return (
    <div className="min-h-full w-full overflow-auto bg-stub-cream p-6">
      <h1 className="mb-4 font-stub-display text-xl font-bold text-stub-navy">
        ChronoTitleAudit — {CHRONOLOGY_POOL.length} films × {SIZES.length} sizes
      </h1>
      {SIZES.map((size) => (
        <section key={size} className="mb-8">
          <p className="mb-2 font-stub-label text-[10px] font-semibold uppercase tracking-[0.1em] text-stub-slate">
            {size}
          </p>
          <div className="flex flex-wrap items-end gap-3">
            {CHRONOLOGY_POOL.map((c) => (
              <div key={c.id} data-audit-id={c.id} data-audit-size={size}>
                <ChronoCardView card={c} faceUp={false} size={size} showYear={false} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
