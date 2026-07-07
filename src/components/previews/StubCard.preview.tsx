// Preview: ?preview=StubCard — the one Stub card frame at all four sizes and
// every prop path. Self-contained: pulls a handful of real MOVIES read-only to
// exercise distinct genre spines (Crime/Thriller/Action/Sci-Fi/Drama/Comedy),
// then drives size · reveal · faceUp/faceDown · selected · hint · deepCut by hand.
// Cream canvas so paper/navy/spine read exactly as in the reference.
import StubCard from '../StubCard'
import { MOVIES } from '../../data/movies.ts'
import type { Movie } from '../../data/types.ts'

const byId = (id: string): Movie => {
  const m = MOVIES.find((x) => x.id === id)
  if (!m) throw new Error(`preview: no movie ${id}`)
  return m
}

// Six films chosen so each lands on a DIFFERENT spine family (see StubCard's
// GENRE_SPINE): red, plum, slate, navy, navy-mid, slate-light.
const godfather = byId('the-godfather') //      Crime    → stub-red
const taxi = byId('taxi-driver') //             Thriller → genre-pip plum
const batman = byId('the-dark-knight') //       Action   → stub-slate
const inception = byId('inception') //          Sci-Fi   → stub-navy
const forrest = byId('forrest-gump') //         Drama    → stub-navy-mid
const catchMe = byId('catch-me-if-you-can') //  Comedy   → stub-slate-light
const interstellar = byId('interstellar') //    Sci-Fi (long title stress)
// New-anatomy stressors: long titles (prove header 2-line wrap + monogram initial
// past a leading article) and one short title (prove the monogram scales up).
const heat = byId('heat') //                     Crime, SHORT title → monogram "H"
const shawshank = byId('the-shawshank-redemption') // Drama, long → wraps, monogram "S"
const hollywood = byId('once-upon-a-time-in-hollywood') // Comedy, very long → monogram "O"

export default function StubCardPreview() {
  return (
    <div className="min-h-full w-full overflow-auto bg-stub-cream p-8">
      <div className="mx-auto flex w-full max-w-[520px] flex-col gap-10">
        <h1 className="font-stub-display text-2xl font-bold text-stub-navy">
          StubCard — the one frame, all sizes
        </h1>

        <Section label="Four sizes · full reveal (thumb / hand / pile / raised)">
          <Row>
            <StubCard movie={godfather} size="thumb" deepCut />
            <StubCard movie={godfather} size="hand" deepCut />
            <StubCard movie={godfather} size="pile" deepCut />
            <StubCard movie={godfather} size="raised" deepCut />
          </Row>
        </Section>

        <Section label="Anatomy — long title wraps 2 lines (hand + pile) · short title monogram scales">
          <Row>
            <div className="flex flex-col items-center gap-1">
              <StubCard movie={hollywood} size="hand" deepCut />
              <Cap>long @ hand — 2-line wrap, "O"</Cap>
            </div>
            <div className="flex flex-col items-center gap-1">
              <StubCard movie={shawshank} size="pile" deepCut />
              <Cap>long @ pile — 2-line wrap, "S"</Cap>
            </div>
            <div className="flex flex-col items-center gap-1">
              <StubCard movie={heat} size="pile" deepCut />
              <Cap>short — monogram "H"</Cap>
            </div>
            <div className="flex flex-col items-center gap-1">
              <StubCard movie={hollywood} size="raised" deepCut />
              <Cap>very long @ raised</Cap>
            </div>
          </Row>
        </Section>

        <Section label="Genre spines (Crime · Thriller · Action · Sci-Fi · Drama · Comedy)">
          <Row>
            <StubCard movie={godfather} size="pile" />
            <StubCard movie={taxi} size="pile" />
            <StubCard movie={batman} size="pile" />
            <StubCard movie={inception} size="pile" />
            <StubCard movie={forrest} size="pile" />
            <StubCard movie={catchMe} size="pile" />
          </Row>
        </Section>

        <Section label="Reveal variants (full · year-hidden · title-only) — hidden fields leave the DOM">
          <Row>
            <div className="flex flex-col items-center gap-1">
              <StubCard movie={taxi} size="pile" reveal={{ year: true, credits: true }} />
              <Cap>full</Cap>
            </div>
            <div className="flex flex-col items-center gap-1">
              <StubCard movie={taxi} size="pile" reveal={{ year: false, credits: true }} />
              <Cap>year hidden (Chronology)</Cap>
            </div>
            <div className="flex flex-col items-center gap-1">
              <StubCard movie={taxi} size="pile" reveal={{ year: false, credits: false }} />
              <Cap>title only (Connections)</Cap>
            </div>
          </Row>
        </Section>

        <Section label="Face up vs face down (ticket back) — all sizes">
          <Row>
            <StubCard movie={inception} size="thumb" faceUp={false} />
            <StubCard movie={inception} size="hand" faceUp={false} />
            <StubCard movie={inception} size="pile" faceUp={false} />
            <StubCard movie={inception} size="raised" faceUp={false} />
          </Row>
        </Section>

        <Section label="Selected (amber) vs hint (teal + label pill)">
          <Row>
            <div className="flex flex-col items-center gap-1">
              <StubCard movie={batman} size="pile" selected deepCut />
              <Cap>selected</Cap>
            </div>
            <div className="flex flex-col items-center gap-1">
              <StubCard movie={godfather} size="pile" hint hintLabel="HINT · PACINO" />
              <Cap>hint + label</Cap>
            </div>
            <div className="flex flex-col items-center gap-1">
              <StubCard movie={forrest} size="hand" hint hintLabel="HINT · HANKS" />
              <Cap>hint @ hand</Cap>
            </div>
          </Row>
        </Section>

        <Section label="DEEP CUT badge across spine families (filled vs light)">
          <Row>
            <StubCard movie={godfather} size="pile" deepCut />
            <StubCard movie={taxi} size="pile" deepCut />
            <StubCard movie={batman} size="pile" deepCut />
            <StubCard movie={catchMe} size="pile" deepCut />
          </Row>
        </Section>

        <Section label="Raised hero with its deep shadow (long-title stress)">
          <Row>
            <StubCard movie={interstellar} size="raised" deepCut />
            <StubCard movie={godfather} size="raised" selected deepCut />
          </Row>
        </Section>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 font-stub-label text-[10px] font-semibold uppercase tracking-[0.1em] text-stub-slate">
        {label}
      </p>
      {children}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-end gap-5">{children}</div>
}

function Cap({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-stub-label text-[8px] uppercase tracking-[0.08em] text-stub-slate">
      {children}
    </span>
  )
}
