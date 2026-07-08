// Preview: ?preview=DrawChoice — the draw-3-keep-1 modal, EXTRAPOLATED (no
// reference comp; composed from the Stub library as 7c's sibling). Self-
// contained: real movies from src/data/movies.ts, face-down StubCards injected
// as cardSlots. Verifies: diorama stack + awning render, the amber CONNECTS
// pill lands only on connecting options, three cards clear a 375px frame, and
// the 2-option / 1-option (deck-ran-short) states read correctly.
//
// Each modal is mounted inside a relatively-positioned phone-sized frame so the
// component's own `absolute inset-0` scrim fills the frame, not the page.
import DrawChoice, { type DrawOption } from '../DrawChoice'
import StubCard from '../StubCard.tsx'
import { MOVIES } from '../../data/movies.ts'

const byId = (id: string) => MOVIES.find((m) => m.id === id)!

// Face-down card slot, exactly as DuelGame injects it (StubCard faceUp={false}
// ticket back — CardView/Card.tsx retired W3 inc2).
function faceDown(id: string) {
  return <StubCard movie={byId(id)} faceUp={false} size="hand" />
}

function opt(id: string, connects: boolean): DrawOption {
  return { id, connects, cardSlot: faceDown(id) }
}

const noop = (id: string) => console.log('picked', id)

export default function DrawChoicePreview() {
  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-auto bg-stub-cream p-8">
      <div className="mx-auto w-full max-w-[440px] space-y-8">
        <Section label="EXTRAPOLATED — no reference comp · 3 options, one connects (390×700)">
          <PhoneFrame width={390}>
            <DrawChoice
              options={[
                opt('the-godfather', false),
                opt('taxi-driver', true),
                opt('the-dark-knight', false),
              ]}
              onPick={noop}
              reduce={false}
            />
          </PhoneFrame>
        </Section>

        <Section label="EXTRAPOLATED — no reference comp · 3 options, none connect (390×700)">
          <PhoneFrame width={390}>
            <DrawChoice
              options={[
                opt('inception', false),
                opt('interstellar', false),
                opt('the-martian', false),
              ]}
              onPick={noop}
              reduce={false}
            />
          </PhoneFrame>
        </Section>

        <Section label="EXTRAPOLATED — no reference comp · 2 options, deck ran short (390×700)">
          <PhoneFrame width={390}>
            <DrawChoice
              options={[opt('casino', true), opt('the-departed', false)]}
              onPick={noop}
              reduce={false}
            />
          </PhoneFrame>
        </Section>

        <Section label="EXTRAPOLATED — no reference comp · 3 options at 375-wide stress (375×700)">
          <PhoneFrame width={375}>
            <DrawChoice
              options={[
                opt('goodfellas', true),
                opt('casino', false),
                opt('the-departed', true),
              ]}
              onPick={noop}
              reduce={false}
            />
          </PhoneFrame>
        </Section>

        <Section label="EXTRAPOLATED — no reference comp · 1 option, last card (390×700)">
          <PhoneFrame width={390}>
            <DrawChoice
              options={[opt('interstellar', false)]}
              onPick={noop}
              reduce={false}
            />
          </PhoneFrame>
        </Section>
      </div>
    </div>
  )
}

// Phone-sized viewport: the modal's absolute scrim pins to THIS frame (relative
// + overflow-hidden), mirroring the parent's z-[85] overlay slot in-game.
function PhoneFrame({
  width,
  children,
}: {
  width: number
  children: React.ReactNode
}) {
  return (
    <div
      className="relative mx-auto overflow-hidden rounded-[28px] border-2 border-stub-navy bg-stub-cream"
      style={{ width, height: 700 }}
    >
      {/* Cream halftone, so the scrim reads over the real canvas texture. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(rgba(31,58,82,.06) 1px, transparent 1.2px)',
          backgroundSize: '7px 7px',
        }}
      />
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
