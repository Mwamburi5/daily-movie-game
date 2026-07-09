// Preview: ?preview=TazCorner — booth (7a) + ticket-strip (7e) variants with
// mock props. Self-contained (own mock data; no app state). Verifies: diorama
// layers + awning render, card-back pips track hand count, notches on the
// strip, and a SPENT token shows the disabled + line-through treatment.
import TazCorner from '../TazCorner'

// Cream canvas so the paper panels/notches read exactly as in the reference.
export default function TazCornerPreview() {
  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-auto bg-stub-cream p-8">
      <div className="mx-auto w-full max-w-[358px] space-y-8">
        <Section label="Booth (7a) — both tokens live">
          <TazCorner
            cpuHand={['a', 'b', 'c', 'd', 'e', 'f']}
            cpuTokens={{ finalCut: true, recast: true }}
            quote="take it if you dare"
          />
        </Section>

        <Section label="Booth — recast SPENT (disabled + strike, still visible)">
          <TazCorner
            cpuHand={['a', 'b', 'c']}
            cpuTokens={{ finalCut: true, recast: false }}
            quote="that one stings"
          />
        </Section>

        <Section label="Booth — long quote truncates">
          <TazCorner
            cpuHand={['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']}
            cpuTokens={{ finalCut: false, recast: true }}
            quote="you really thought that was going to work against me? adorable, honestly"
          />
        </Section>

        <Section label="Booth — WARN: Taz on his last card (stub-red pip + LAST CARD tag)">
          <TazCorner
            cpuHand={['a']}
            cpuTokens={{ finalCut: true, recast: true }}
            quote="one card left — don't blink"
            warn
          />
        </Section>

        <Section label="Compact strip (7e) — both live">
          <TazCorner
            compact
            cpuHand={['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']}
            cpuTokens={{ finalCut: true, recast: true }}
            quote="that one stings"
          />
        </Section>

        <Section label="Compact strip — recast spent + long truncating quote">
          <TazCorner
            compact
            cpuHand={['a', 'b', 'c', 'd', 'e']}
            cpuTokens={{ finalCut: true, recast: false }}
            quote="you really thought that was going to work against me? adorable, honestly"
          />
        </Section>

        <Section label="Compact strip — WARN: last card (count goes stub-red)">
          <TazCorner
            compact
            cpuHand={['a']}
            cpuTokens={{ finalCut: true, recast: true }}
            quote="one card left — don't blink"
            warn
          />
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
