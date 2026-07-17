import type { CSSProperties } from 'react'

// FixedDigits — jitter-proof numerals for the Domine display face (§7·7b).
//
// Domine ships no `tnum` (absent from the subsetted woff2 AND upstream), so the
// `tabular-nums` utility and fontVariantNumeric are silent no-ops on
// font-stub-display: its digit advances span 0.42–0.68em ("1" vs "0", measured
// in-browser 2026-07-17), and a value that ticks while visible (the header
// count-up, the deck countdown, the strokes tally) reflows its row on every
// step. Boxing each digit in a 1ch inline-block pins the geometry without
// swapping fonts — `ch` is the "0" advance, which in Domine is the WIDEST
// digit, so the box always fits and the constant is self-derived from the
// element's own font. Only a digit-count crossing (9→10) still moves anything,
// one discrete step per crossing — no reserved slots, because a pre-booked
// empty box reads as a hole next to a single-digit score at display sizes.
//
// Non-digit chars (a minus, a plus) render at natural width. The value is
// announced whole via aria-label (role="text" — WebKit honors it, and the
// circle is iPhone-heavy) with the boxed spans hidden, so "12" can't announce
// as "one, two".

const SLOT: CSSProperties = { display: 'inline-block', width: '1ch', textAlign: 'center' }

const isDigit = (c: string) => c >= '0' && c <= '9'

export default function FixedDigits({ value }: { value: number | string }) {
  const s = String(value)
  return (
    <span role="text" aria-label={s}>
      <span aria-hidden="true">
        {[...s].map((c, i) => (
          <span key={i} style={isDigit(c) ? SLOT : undefined}>
            {c}
          </span>
        ))}
      </span>
    </span>
  )
}
