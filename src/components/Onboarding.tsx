import { useState, type ReactNode } from 'react'
import { useDialogA11y } from './useDialogA11y.ts'

// Onboarding — the one-time, four-screen first-run flow (Buri, 2026-08-20). It
// replaces the single IntroOverlay welcome card and is deliberately STATIC: no
// animation, no playable demo, no gesture choreography. Each screen states one
// thought and shows a framed slice of real-looking UI built from plain styled
// divs, so the menu chunk never pays for a mode component.
//
// DELIBERATELY NOT StubCard: the real card frame is ~960 lines and lives behind
// the lazy mode boundary. The mini stubs below borrow its vocabulary (paper
// face, navy rule, genre spine) at a size where none of that machinery reads.
// Genre spines are hardcoded to the same tokens StubCard maps Crime → red /
// Thriller → plum to; if that map moves, these are decoration, not truth.
//
// Static by construction means reduced motion needs no branch — there is
// nothing to reduce.

const CRIME_SPINE = 'var(--color-stub-red)'
const THRILLER_SPINE = 'var(--color-stub-genre-pip)'
const DRAMA_SPINE = 'var(--color-stub-navy-mid)'

// The cream panel every screen frames its example in — the menu's own dotted
// canvas, so the slice reads as a piece of the game rather than an illustration.
// The height FLOOR matters: the four slices differ in content weight (two stubs
// vs. a three-line program), and without it the headline would walk up and down
// the screen as the player advances.
function Slice({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      aria-label={label}
      role="img"
      className="flex w-full shrink-0 items-center rounded-stub-panel border-2 border-stub-navy bg-stub-cream px-4 py-4 shadow-stub-card-resting"
      style={{
        // 200px on any phone held upright; a landscape viewport gives the floor
        // back so the sentence and the CTA still fit without a scroll.
        minHeight: 'min(200px, 34dvh)',
        backgroundImage: 'radial-gradient(rgba(31,58,82,.06) 1px, transparent 1.2px)',
        backgroundSize: '7px 7px',
      }}
    >
      <div className="w-full">{children}</div>
    </div>
  )
}

// A ticket stub at thumbnail scale: spine, paper face, mono title, mono year.
function MiniStub({ title, year, spine }: { title: string; year?: string; spine: string }) {
  return (
    <span className="flex min-w-0 flex-1 overflow-hidden rounded-stub-thumb border-2 border-stub-navy bg-stub-paper">
      <span className="w-1.5 flex-none" style={{ background: spine }} />
      <span className="min-w-0 flex-1 px-1.5 py-2 text-center">
        <span className="block truncate font-stub-label text-[9px] font-bold uppercase tracking-[0.03em] text-stub-navy">
          {title}
        </span>
        {year && (
          <span className="mt-0.5 block font-stub-label text-[8px] font-bold text-stub-slate">{year}</span>
        )}
      </span>
    </span>
  )
}

// The golf tag is per-mode on purpose: Puzzle and Chronology score strokes,
// Connections spends mistakes. A blanket "golf" footer under all three would
// teach a rule Connections does not have.
const DAILIES = [
  ['Daily Puzzle', 'Play out your hand.', true],
  ['Chronology', 'Place movies in release order.', true],
  ['Connections', 'Find four groups of four.', false],
] as const

const STAMPS = [
  ['Puzzle', CRIME_SPINE],
  ['Chronology', THRILLER_SPINE],
  ['Connections', DRAMA_SPINE],
] as const

type Screen = {
  key: string
  sentence: string
  slice: ReactNode
  sliceLabel: string
}

const SCREENS: Screen[] = [
  {
    key: 'links',
    sentence: 'Movies connect through the people who make them.',
    sliceLabel: 'Goodfellas 1990 and Casino 1995, linked by De Niro',
    slice: (
      <span className="flex items-center gap-2">
        <MiniStub title="Goodfellas" year="1990" spine={CRIME_SPINE} />
        <span className="flex flex-none items-center gap-1 rounded-stub-pill bg-stub-amber px-2 py-1 font-stub-label text-[9px] font-bold uppercase tracking-[0.04em] text-stub-navy shadow-stub-card-resting">
          <span aria-hidden="true">←</span>
          De Niro
          <span aria-hidden="true">→</span>
        </span>
        <MiniStub title="Casino" year="1995" spine={CRIME_SPINE} />
      </span>
    ),
  },
  {
    key: 'dailies',
    sentence: 'Three fresh puzzles every day.',
    sliceLabel: 'Tonight’s program: Daily Puzzle (golf), Chronology (golf), Connections. Golf — low score wins.',
    slice: (
      <span className="block">
        {DAILIES.map(([title, line, golf]) => (
          <span key={title} className="mb-2 flex items-baseline gap-2 last:mb-0">
            <span className="h-1.5 w-1.5 flex-none translate-y-[-2px] rounded-full bg-stub-amber" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block font-stub-display text-[13px] font-bold leading-tight text-stub-navy">
                {title}
                {golf && (
                  <span className="ml-1.5 inline-flex rounded-stub-pill bg-stub-amber px-1.5 py-0.5 align-middle font-stub-label text-[9px] font-bold uppercase tracking-[0.08em] text-stub-navy">
                    golf
                  </span>
                )}
              </span>
              <span className="block font-stub-ui text-[11px] leading-snug text-stub-slate">{line}</span>
            </span>
          </span>
        ))}
        <span className="mt-3 block border-t border-dashed border-stub-navy/25 pt-2 text-center font-stub-label text-[10px] font-bold uppercase tracking-[0.08em] text-stub-navy">
          Golf — low score wins
        </span>
      </span>
    ),
  },
  {
    key: 'duel',
    sentence: 'Reaching 20 ends the show; highest net score wins.',
    sliceLabel: 'A duel scoreboard: you 14, CPU 11; reaching 20 ends the show and highest net score wins',
    slice: (
      <span className="block">
        <span className="flex items-baseline justify-between font-stub-label text-[10px] font-bold uppercase tracking-[0.06em] text-stub-navy">
          <span>
            You <span className="text-[13px] tabular-nums">14</span>
          </span>
          <span className="text-stub-slate">Ends at 20</span>
          <span className="text-stub-slate">
            CPU <span className="text-[13px] tabular-nums">11</span>
          </span>
        </span>
        <span className="mt-2 block h-2 w-full overflow-hidden rounded-stub-pill border border-stub-navy bg-stub-paper">
          <span className="block h-full w-[70%] bg-stub-amber" />
        </span>
        <span className="mt-3 flex items-center gap-2">
          <MiniStub title="Heat" year="1995" spine={CRIME_SPINE} />
          <MiniStub title="Alien" year="1979" spine={THRILLER_SPINE} />
        </span>
      </span>
    ),
  },
  {
    key: 'ritual',
    sentence: 'Tear all three stubs in one night — that’s a Triple Feature.',
    sliceLabel: 'Three torn stubs — Puzzle, Chronology, Connections — stamped as a Triple Feature',
    slice: (
      <span className="block">
        <span className="flex items-stretch gap-2">
          {STAMPS.map(([label, spine]) => (
            <span
              key={label}
              className="flex min-w-0 flex-1 overflow-hidden rounded-stub-thumb border-2 border-stub-navy bg-stub-paper"
            >
              <span className="w-1.5 flex-none" style={{ background: spine }} />
              <span className="flex min-w-0 flex-1 items-center gap-1 py-2 pl-1 pr-1.5">
                <span className="font-stub-label text-[10px] font-bold text-stub-amber" aria-hidden="true">
                  ✓
                </span>
                <span className="min-w-0 flex-1 truncate font-stub-label text-[8px] font-bold uppercase tracking-[0.03em] text-stub-navy">
                  {label}
                </span>
              </span>
            </span>
          ))}
        </span>
        <span className="mt-3 block border-t border-dashed border-stub-navy/25 pt-2 text-center font-stub-label text-[10px] font-bold uppercase tracking-[0.12em] text-stub-amber">
          Triple Feature
        </span>
      </span>
    ),
  },
]

export default function Onboarding({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0)
  // Dialog contract (§7·7b a11y): focus enters, Tab cycles inside, Esc leaves.
  // Esc dismisses for good — the same one-shot promise the CTA makes.
  const dialogRef = useDialogA11y(onDismiss)
  const screen = SCREENS[step]
  const last = step === SCREENS.length - 1

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Match Cut"
      tabIndex={-1}
      data-onboarding
      className="fixed inset-0 z-[130] flex flex-col items-center bg-stub-navy px-6"
      style={{
        paddingTop: 'calc(var(--app-safe-top) + 18px)',
        paddingBottom: 'calc(var(--app-safe-bottom) + 18px)',
        backgroundImage: 'radial-gradient(rgba(240,235,216,.07) 1px, transparent 1.2px)',
        backgroundSize: '7px 7px',
      }}
    >
      {/* min-h-0 is load-bearing: a flex child defaults to min-height:auto, so
          without it a short viewport (landscape phone) grows this column past
          the screen and pushes the CTA somewhere nothing can scroll to — the
          same trap the menu's scroll container documents. With it, the middle
          region absorbs the squeeze and scrolls on its own. */}
      <div className="flex min-h-0 w-full max-w-[360px] flex-1 flex-col">
        <div className="flex flex-none items-center justify-between">
          <span className="font-stub-display text-[15px] font-bold italic tracking-tight text-stub-cream">
            Match Cut
          </span>
          {/* The E2E dismiss contract: exactly ONE visible [data-intro-dismiss]
              per screen — Skip here, the CTA on the last screen. Both mark the
              flow seen, so neither path nags a returning player. */}
          {!last && (
            <button
              type="button"
              data-intro-dismiss
              onClick={onDismiss}
              className="-mr-2 flex min-h-11 items-center px-2 font-stub-label text-[11px] font-bold uppercase tracking-[0.08em] text-stub-cream/55 underline underline-offset-4 active:text-stub-cream"
            >
              Skip
            </button>
          )}
        </div>

        {/* Advancing swaps this region in place while focus stays on the CTA,
            so a screen reader would otherwise hear nothing change.
            `my-auto` on the inner column, NOT justify-center on the scroller:
            centered flex overflow spills off BOTH ends and the top half can
            never be scrolled to — the menu's scroll container carries the same
            note for the same reason. */}
        <div aria-live="polite" className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto py-5">
          <div className="my-auto flex w-full flex-col items-center gap-5">
            <Slice label={screen.sliceLabel}>{screen.slice}</Slice>
            <h2 className="shrink-0 text-balance text-center font-stub-display text-[19px] font-bold leading-snug text-stub-cream">
              {screen.sentence}
            </h2>
          </div>
        </div>

        {/* Solid ground under the dots: when the middle region does scroll
            (landscape), text must cut off behind this block, not bleed through
            it. */}
        <div className="flex flex-none flex-col items-center gap-4 bg-stub-navy pt-2">
          <p className="sr-only">{`Screen ${step + 1} of ${SCREENS.length}`}</p>
          <span className="flex items-center gap-2" aria-hidden="true">
            {SCREENS.map((s, index) => (
              <span
                key={s.key}
                data-onboarding-dot
                className={`h-1.5 rounded-stub-pill ${
                  index === step ? 'w-5 bg-stub-amber' : 'w-1.5 bg-stub-cream/30'
                }`}
              />
            ))}
          </span>
          <button
            type="button"
            data-intro-dismiss={last ? true : undefined}
            onClick={last ? onDismiss : () => setStep((value) => value + 1)}
            className="min-h-12 w-full rounded-stub-pill bg-stub-amber px-6 py-3 font-stub-label text-[13px] font-bold uppercase tracking-wider text-stub-navy shadow-stub-card-resting active:scale-[0.98]"
          >
            {last ? 'Let’s play!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
