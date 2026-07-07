import { motion, useReducedMotion } from 'framer-motion'
import { movieById } from '../data/movies.ts'
import { isWild, wildMovie, type Meld } from '../lib/duel.ts'

// The Stub replacement for MeldZone. Two faces, same chip DNA:
//   • MeldShelf   — the 7a/7e horizontal shelf strip of banked marquee rows
//   • LayoffPicker — the 7b bottom sheet for choosing a lay-off target
// Both live here (not a `mode` prop, not a shared BottomSheet primitive) so the
// meld-chip internals — thumbnails, wild ★ tile, label, layoutId FLIP — are
// written once and can't drift between the strip and the sheet. See report.

// Name a banked meld by its LOCKED highest rung (stored at bank time) — so a
// Murphy+Nolan row reads "Christopher Nolan", and never flips as lay-offs arrive.
// Falls back to the old series/person label for any pre-ladder meld.
// Carried forward verbatim from MeldZone: DuelGame imports meldLabel from here
// at 6 sites and the wire pass only switches the import path — semantics frozen.
export const meldLabel = (m: Meld) =>
  m.rungName ?? (m.series ? m.series.split('-').join(' ') : m.people[0] ?? 'meld')

// One 30px card thumbnail. Minimal inline frame this wave (StubCard is forged in
// parallel and not importable): paper bg + navy border, with the movie's legacy
// posterColor as a thin genre spine down the left edge — the ticket-stub spine
// motif at thumb scale. `layoutId={cid}` is the SHARED FLIP namespace (hand /
// pile / shelf); dropping it silently kills the fly-to-shelf animation. Wild ids
// aren't in movieById, so callers branch on isWild BEFORE rendering a Thumb.
// `spineColor` lets ineligible picker rows dim the border to slate to match 7b.
function Thumb({ cid, spineColor }: { cid: string; spineColor: string }) {
  const m = movieById.get(cid)!
  return (
    <motion.div
      layoutId={cid}
      className="relative h-10 w-[30px] shrink-0 overflow-hidden rounded-stub-thumb bg-stub-paper"
      style={{ border: `1.5px solid ${spineColor}` }}
    >
      <div
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: m.posterColor }}
      />
    </motion.div>
  )
}

// The wild ★ tile in Stub language: an amber-family tile (amber is THE action
// color), navy border to sit with the paper thumbs. Non-motion — wild ids have
// no cross-surface FLIP identity (they're pile-transparent).
function WildThumb({ cid, borderColor }: { cid: string; borderColor: string }) {
  return (
    <div
      className="flex h-10 w-[30px] shrink-0 items-center justify-center rounded-stub-thumb bg-stub-amber/85 text-[13px] leading-none text-stub-paper"
      style={{ border: `1.5px solid ${borderColor}` }}
      title={wildMovie(cid)?.title}
    >
      ★
    </div>
  )
}

// ── Face A: the shelf strip (7a §5 / 7e) ───────────────────────────────────
// Banked marquee rows, shared by both players. Rows light up (amber border +
// glow) when the raised card could lay off onto them — they double as drop
// targets via setRowRef → DuelGame.meldRowRefs → findMeldAt() hit-testing.
export default function MeldShelf({
  melds,
  highlightIds,
  setRowRef,
}: {
  melds: Meld[]
  highlightIds: ReadonlySet<number>
  setRowRef: (id: number, el: HTMLDivElement | null) => void
}) {
  // No empty-state shelf — return null when there's nothing banked (contract).
  if (melds.length === 0) return null
  return (
    // In-flow root, no self-pinning: the parent's column owns the position
    // (Appendix A·1 doctrine). Keep the resting z-layer var from MeldZone.
    <div className="relative z-[var(--z-resting)] w-full">
      {/* Horizontal scroll strip. overflow-x-auto (not hidden) so the rows
          are actually swipeable on touch — the comp's `overflow:hidden` is a
          static-mockup artifact; the caption says SWIPE. */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {melds.map((meld) => {
          const lit = highlightIds.has(meld.id)
          return (
            <div
              key={meld.id}
              ref={(el) => setRowRef(meld.id, el)}
              data-meld-row={meld.id}
              className={`flex-none rounded-stub-card border-2 bg-stub-paper px-2 py-[5px] ${
                lit
                  ? 'border-stub-amber shadow-stub-glow-amber'
                  : 'border-stub-navy'
              }`}
            >
              {/* Label: navy when the row is an active lay-off target, slate at
                  rest — matches the 7a color logic. Text stays meldLabel ×N
                  (the comp's "· +N" is picker-only data the shelf can't feed). */}
              <div
                className={`mb-1 font-stub-label text-[7.5px] font-semibold uppercase leading-none tracking-[0.08em] ${
                  lit ? 'text-stub-navy' : 'text-stub-slate'
                }`}
              >
                {meldLabel(meld)} ×{meld.cardIds.length}
              </div>
              <div className="flex gap-1">
                {meld.cardIds.map((cid) =>
                  isWild(cid) ? (
                    <WildThumb key={cid} cid={cid} borderColor="var(--color-stub-navy)" />
                  ) : (
                    <Thumb key={cid} cid={cid} spineColor="var(--color-stub-navy)" />
                  ),
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Right edge fades to cream — signals more rows off-screen (7a). */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-10 bg-gradient-to-l from-stub-cream/95 to-transparent" />

      {/* Caption (mono caps). Count is real; the affordance copy is fixed. */}
      <div className="mt-1.5 text-center font-stub-label text-[7.5px] font-semibold uppercase tracking-[0.12em] text-stub-slate">
        {melds.length} {melds.length === 1 ? 'MELD' : 'MELDS'} · SWIPE · AMBER ROWS ACCEPT A LAY-OFF
      </div>
    </div>
  )
}

// ── Face B: the lay-off picker sheet (7b) ──────────────────────────────────
// Presentational only. The parent computes eligibility + points at wire time and
// passes rows down; only `eligible` rows are tappable.
export interface LayoffRow {
  meld: Meld
  eligible: boolean
  pts?: number
}

// BOUNDARY NOTE (wire time): this component renders ONLY the bottom sheet. The
// navy scrim over the board, the "LAY OFF — PICK A ROW" header pill, and the
// raised card floating above the sheet (all seen in the 7b comp) are the
// PARENT's overlay furniture — do not build them here.
export function LayoffPicker({
  rows,
  onPickRow,
  onCancel,
}: {
  rows: LayoffRow[]
  onPickRow: (meldId: number) => void
  onCancel: () => void
}) {
  const reduce = useReducedMotion()

  // "SCROLL FOR N MORE" — N is how many rows sit past the sheet's max height.
  // The sheet shows ~5 rows before scrolling; below that, omit the count
  // gracefully (README: "compute N or omit gracefully").
  const VISIBLE_ROWS = 5
  const hiddenCount = Math.max(0, rows.length - VISIBLE_ROWS)

  return (
    // Cream sheet, top-only radius, 2px navy top border, slides up on mount /
    // down on dismiss. This is an overlay child the parent mounts/unmounts
    // inside AnimatePresence at wire time; the slide is expressed here via
    // variants so the parent just toggles presence. Reduced motion → crossfade.
    <motion.div
      initial="hidden"
      animate="shown"
      exit="hidden"
      variants={reduce ? sheetFade : sheetSlide}
      className="flex max-h-[430px] w-full flex-col rounded-t-[22px] border-t-2 border-stub-navy bg-stub-cream px-4 pt-3.5 pb-[18px] shadow-stub-modal"
    >
      {/* Grab handle */}
      <div className="mx-auto mb-2.5 h-1 w-11 rounded-stub-pill bg-stub-disabled" />

      {/* Header row */}
      <div className="mb-2.5 flex items-center justify-between">
        <span className="font-stub-label text-[9px] font-semibold uppercase tracking-[0.14em] text-stub-slate">
          ALL MELDS · {rows.length}
        </span>
        <button
          type="button"
          onClick={onCancel}
          // ::before hit-slop keeps the pill visually small (7b) while the
          // tappable area clears the ≥44px floor (README 7e touch rule).
          className="relative rounded-stub-pill border-2 border-stub-navy bg-stub-paper px-3 py-[5px] font-stub-label text-[8.5px] font-bold uppercase tracking-[0.08em] text-stub-navy before:absolute before:-inset-x-2 before:-inset-y-3 before:content-['']"
        >
          CANCEL
        </button>
      </div>

      {/* Rows — the only scroll region. Last visible row fades under a cream
          gradient (rendered as an overlay so it doesn't scroll with content). */}
      <div className="relative min-h-0 flex-1">
        <div className="flex h-full flex-col gap-1.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {rows.map(({ meld, eligible, pts }) => {
            const thumbBorder = eligible
              ? 'var(--color-stub-navy)'
              : 'var(--color-stub-slate)'
            return (
              <button
                key={meld.id}
                type="button"
                // Only eligible rows are tappable (contract). Ineligible rows
                // are inert — disabled + no pointer feedback.
                disabled={!eligible}
                onClick={() => onPickRow(meld.id)}
                className={`flex shrink-0 items-center gap-2 rounded-stub-card border-2 px-2.5 py-1.5 text-left ${
                  eligible
                    ? 'border-stub-amber bg-stub-paper shadow-stub-glow-amber'
                    : 'cursor-default border-stub-disabled bg-stub-paper/60 opacity-60'
                }`}
              >
                <span
                  className={`min-w-[110px] font-stub-label text-[8px] font-semibold uppercase tracking-[0.06em] ${
                    eligible ? 'text-stub-navy' : 'text-stub-slate'
                  }`}
                >
                  {meldLabel(meld)} ×{meld.cardIds.length}
                </span>
                <div className="flex gap-1">
                  {meld.cardIds.map((cid) =>
                    isWild(cid) ? (
                      <WildThumb key={cid} cid={cid} borderColor={thumbBorder} />
                    ) : (
                      <Thumb key={cid} cid={cid} spineColor={thumbBorder} />
                    ),
                  )}
                </div>
                {/* Trailing amber points pill — eligible rows only. */}
                {eligible && pts != null && (
                  <span className="ml-auto whitespace-nowrap rounded-stub-pill bg-stub-amber px-[9px] py-1 font-stub-label text-[8.5px] font-bold leading-none text-stub-navy">
                    +{pts} ▸
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {/* Cream fade over the last visible row (7b). Sits inside the scroll
            frame, above the content, non-interactive. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-stub-cream to-transparent" />
      </div>

      {/* Footer caption. Omit the "SCROLL FOR N MORE" clause when nothing is
          hidden — the affordance would be a lie otherwise. */}
      <div className="mt-2.5 text-center font-stub-label text-[8px] font-semibold uppercase tracking-[0.12em] text-stub-slate">
        {hiddenCount > 0 ? `SCROLL FOR ${hiddenCount} MORE · ` : ''}AMBER ROWS ACCEPT THIS CARD
      </div>
    </motion.div>
  )
}

// Sheet slides up on mount / down on dismiss, 300ms ease-out (7b spec). The
// exit half runs when the parent's AnimatePresence unmounts this on dismiss.
const sheetSlide = {
  hidden: { y: '100%' },
  shown: { y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } },
}

// Reduced motion: a 150ms crossfade, no travel.
const sheetFade = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.15 } },
}
