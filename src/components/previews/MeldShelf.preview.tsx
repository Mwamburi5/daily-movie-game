// Preview: ?preview=MeldShelf — both faces of the Stub meld surface with mock
// props. Self-contained (own mock Melds built from real movie ids + one wild;
// no app state). Verifies: shelf strip renders chips with 30px thumbs + genre
// spines, amber-lit rows (highlightIds) vs resting, right-edge fade + caption,
// the empty shelf renders nothing, and the 7b picker sheet's eligible (+N pill)
// vs ineligible (60% / slate) rows, cream fade, and footer "SCROLL FOR N MORE".
import type { Meld } from '../../lib/duel.ts'
import { WILD_IDS } from '../../lib/duel.ts'
import MeldShelf, { LayoffPicker, type LayoffRow } from '../MeldShelf'

// Mock Melds — only the fields MeldShelf reads matter (cardIds for thumbs,
// rungName/people/series for meldLabel, id for keys/refs). rungPts is display-
// irrelevant to the shelf; the picker takes points via LayoffRow.pts instead.
const mk = (
  id: number,
  cardIds: string[],
  label: { rungName?: string; people?: string[]; series?: string | null },
): Meld => ({
  id,
  cardIds,
  people: label.people ?? [],
  series: label.series ?? null,
  rungName: label.rungName,
})

// A wild-bearing meld (2 real + 1 wild) to exercise the ★ tile branch.
const WILD = WILD_IDS[0]

const THREE_MELDS: Meld[] = [
  mk(1, ['taxi-driver', 'goodfellas', 'the-departed'], { rungName: 'De Niro' }),
  mk(2, ['inception', 'the-dark-knight', 'interstellar'], { rungName: 'Nolan' }),
  mk(3, ['pulp-fiction', WILD, 'django-unchained'], { rungName: 'Tarantino' }),
]

const TEN_MELDS: Meld[] = [
  mk(1, ['taxi-driver', 'goodfellas', 'the-departed'], { rungName: 'De Niro' }),
  mk(2, ['inception', 'the-dark-knight', 'interstellar'], { rungName: 'Nolan' }),
  mk(3, ['pulp-fiction', 'django-unchained', 'inglourious-basterds'], { rungName: 'Tarantino' }),
  mk(4, ['goodfellas', 'casino', 'the-departed'], { rungName: 'Scorsese' }),
  mk(5, ['forrest-gump', 'catch-me-if-you-can'].concat('saving-private-ryan'), { rungName: 'Hanks' }),
  mk(6, ['the-martian', 'interstellar', 'inception'], { rungName: 'Sci-Fi', people: [] }),
  mk(7, ['jurassic-park', 'saving-private-ryan', WILD], { rungName: 'Spielberg' }),
  mk(8, ['once-upon-a-time-in-hollywood', 'pulp-fiction'].concat('django-unchained'), { rungName: 'Pitt' }),
  mk(9, ['casino', 'goodfellas', 'taxi-driver'], { rungName: 'Pesci' }),
  mk(10, ['the-dark-knight', 'inception', 'interstellar'], { rungName: 'Caine' }),
]

// The raised card in the comp is Pacino/Godfather; here the picker rows mirror
// TEN_MELDS with a mix of eligible (with points) and ineligible.
const PICKER_ROWS: LayoffRow[] = [
  { meld: TEN_MELDS[0], eligible: true, pts: 2 },
  { meld: TEN_MELDS[3], eligible: true, pts: 1 },
  { meld: TEN_MELDS[1], eligible: false },
  { meld: TEN_MELDS[8], eligible: false },
  { meld: TEN_MELDS[2], eligible: false },
]

const PICKER_ROWS_MANY: LayoffRow[] = TEN_MELDS.map((meld, i) => ({
  meld,
  eligible: i < 2,
  pts: i === 0 ? 2 : i === 1 ? 1 : undefined,
}))

export default function MeldShelfPreview() {
  const noop = () => {}
  const noRef = () => {}

  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-auto bg-stub-cream p-8">
      <div className="mx-auto w-full max-w-[390px] space-y-8">
        <Section label="Shelf (7a) — 3 melds, one amber-eligible (id 2)">
          <MeldShelf
            melds={THREE_MELDS}
            highlightIds={new Set([2])}
            setRowRef={noRef}
          />
        </Section>

        <Section label="Shelf — 10 melds (horizontal scroll + right-edge fade)">
          <MeldShelf
            melds={TEN_MELDS}
            highlightIds={new Set([4, 7])}
            setRowRef={noRef}
          />
        </Section>

        <Section label="Shelf — empty (renders nothing; box below is intentionally blank)">
          <div className="rounded-stub-panel border border-dashed border-stub-slate-faint p-4 text-center font-stub-label text-[9px] uppercase tracking-[0.1em] text-stub-slate-light">
            <MeldShelf melds={[]} highlightIds={new Set()} setRowRef={noRef} />
            (no shelf)
          </div>
        </Section>

        {/* Picker faces: the parent's scrim + header pill + raised card are
            omitted here (that's overlay furniture at wire time). A navy panel
            stands in for the scrim so the cream sheet reads in context. */}
        <Section label="Picker (7b) — mixed eligible (+2 / +1) and ineligible rows">
          <div className="overflow-hidden rounded-stub-panel bg-stub-scrim p-4 pt-10">
            <LayoffPicker rows={PICKER_ROWS} onPickRow={noop} onCancel={noop} />
          </div>
        </Section>

        <Section label="Picker — many rows (scroll fade + 'SCROLL FOR N MORE' footer)">
          <div className="overflow-hidden rounded-stub-panel bg-stub-scrim p-4 pt-10">
            <LayoffPicker rows={PICKER_ROWS_MANY} onPickRow={noop} onCancel={noop} />
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-3 font-stub-label text-[10px] font-semibold uppercase tracking-[0.1em] text-stub-slate">
        {label}
      </p>
      {children}
    </div>
  )
}
