// Preview: ?preview=StubTitleAudit — the NAME-IS-THE-HERO adversarial gate.
// Renders EVERY Duel/Solo pool film's StubCard at hand · pile · raised so an
// in-browser pass can measure that no title clips (frame scrollHeight ≤ clientH)
// and no word overflows its box (span scrollWidth ≤ clientW) — real Domine fonts,
// real layout, whole pool, not a hand-picked ten. Each card is tagged
// data-audit-id/data-audit-size for pinpointing any failure. Throwaway harness for
// the 2026-07-08 title redesign; safe to keep as a pool-merge regression guard.
import StubCard, { type StubCardSize } from '../StubCard'
import { DUEL_POOL } from '../../data/duelPool.ts'

const SIZES: StubCardSize[] = ['hand', 'pile', 'raised']

export default function StubTitleAuditPreview() {
  return (
    <div className="min-h-full w-full overflow-auto bg-stub-cream p-6">
      <h1 className="mb-4 font-stub-display text-xl font-bold text-stub-navy">
        StubTitleAudit — {DUEL_POOL.length} films × {SIZES.length} sizes = fit gate
      </h1>
      {SIZES.map((size) => (
        <section key={size} className="mb-8">
          <p className="mb-2 font-stub-label text-[10px] font-semibold uppercase tracking-[0.1em] text-stub-slate">
            {size}
          </p>
          <div className="flex flex-wrap items-end gap-3">
            {DUEL_POOL.map((m) => (
              <div key={m.id} data-audit-id={m.id} data-audit-size={size}>
                <StubCard movie={m} size={size} deepCut={!!m.deepCast?.length} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
