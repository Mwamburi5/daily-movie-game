// Preview: ?preview=RecastOffer — the 7c drama-moment overlay, super-link and
// Final Cut variants, each with a real StubCard as the injected cardSlot.
// Self-contained (own mock props). Verifies: scrim + amber glow read behind the
// modal, diorama stack + awning, the amber-ring card slot, both buttons, and
// the consequence line swapping copy by variant.
//
// The PREVIEW may import StubCard + real movies (the component itself must not).
// Each overlay lives in a relatively-positioned phone-sized frame so the
// absolute-inset overlay reads correctly.
import { useReducedMotion } from 'framer-motion'
import RecastOffer from '../RecastOffer.tsx'
import StubCard from '../StubCard.tsx'
import { movieById } from '../../data/movies.ts'

const godfather = movieById.get('the-godfather')!
const taxiDriver = movieById.get('taxi-driver')!

export default function RecastOfferPreview() {
  const reduce = useReducedMotion() ?? false

  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-auto bg-stub-cream p-8">
      <div className="mx-auto w-full max-w-[430px] space-y-8">
        <Section label="Super link — CPU lands +4 and an encore">
          <Frame>
            <RecastOffer
              finalCut={false}
              movie={godfather}
              cardSlot={
                <StubCard movie={godfather} faceUp size="pile" />
              }
              onRecast={() => console.log('recast')}
              onAllow={() => console.log('allow')}
              reduce={reduce}
            />
          </Frame>
        </Section>

        <Section label="Final Cut — no connection needed">
          <Frame>
            <RecastOffer
              finalCut
              movie={taxiDriver}
              cardSlot={
                <StubCard movie={taxiDriver} faceUp size="pile" />
              }
              onRecast={() => console.log('recast')}
              onAllow={() => console.log('allow')}
              reduce={reduce}
            />
          </Frame>
        </Section>
      </div>
    </div>
  )
}

// Phone-sized, relatively-positioned, overflow-hidden — so RecastOffer's
// absolute inset-0 overlay clips to the frame instead of the whole page.
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto h-[700px] w-[390px] overflow-hidden rounded-xl border border-stub-slate-faint bg-stub-cream">
      {children}
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
