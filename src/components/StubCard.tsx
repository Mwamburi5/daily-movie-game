// StubCard — the one card frame of "The Stub" redesign. Every mode (Duel, Solo,
// Chronology, Connections) wears this frame at four sizes. It replaces Card.tsx's
// CardView at the W3 wire; until then it stands alone. Visual truth order:
// design_handoff_the_stub/README.md (values) > reference/the-stub-screens.html
// (§7a line 16, §7e line 246 — card internals) > design_handoff_screenshots/{7a,7e}
// (composition) > reference/uploads/card-*.png (frame anatomy — Godfather/Batman/Taxi).
//
// This component owns NO motion wrapper and NO layoutId: parents attach a
// motion.div with layoutId={cardId} so hand/pile/shelf share one FLIP namespace
// (a self-owned wrapper would fork that namespace and break the deal/take travel).
// It spreads `className` on the root for parent-driven positioning. Internal
// state transitions (border on selected/hint) ride CSS, honoring reduced motion
// for free since they're color-only.
import type { CSSProperties } from 'react'
import type { Movie } from '../data/types.ts'
import { isWild } from '../lib/duel.ts'

export type StubCardSize = 'thumb' | 'hand' | 'pile' | 'raised'

interface StubCardProps {
  movie: Movie
  size: StubCardSize
  /** face-down = ticket back. default true. */
  faceUp?: boolean
  /**
   * Progressive disclosure per mode. Duel/Solo pass {year, credits}; Chronology
   * hides the year pre-placement; Connections shows title-only until solve.
   * `art` is accepted for API-future-proofing but ALWAYS ignored this build
   * (the art slot is typographic — see below). Defaults to full reveal.
   * CRITICAL: a hidden field is omitted from the DOM entirely, not just visually
   * suppressed — Chronology's no-year-leak rule is structural.
   */
  reveal?: { year?: boolean; credits?: boolean; art?: boolean }
  /** amber selected/takeable treatment (border 2.5px + amber glow). */
  selected?: boolean
  /** teal hint treatment (border 2.5px + teal glow + optional pill above). */
  hint?: boolean
  /** e.g. "HINT · PACINO" — pill floats above the frame; hand+ sizes only. */
  hintLabel?: string
  /** DEEP CUT badge in the art region (genre-family colored, per uploads). */
  deepCut?: boolean
  /** "⇄ FLIP FOR CREDITS" mono caption under the poster panel. OPT-IN: pass true
      only where a tap really flips the card (Duel/Solo pile tops, the raised
      card). Renders only at pile/raised with credits hidden — a fan card or a
      revealed face never shows it. */
  flipHint?: boolean
  className?: string
}

// ── Genre → spine color ──────────────────────────────────────────────────────
// The Stub spine is GENRE-family driven (never Movie.posterColor, the old
// per-movie system). Rule (docs/ui-contracts.md Appendix A·5): snap to the
// nearest existing stub-* token; only purple earned a mint (--color-stub-genre-pip).
// Comp anchors: Godfather (Crime) = stub-red; Taxi (Thriller) = genre-pip plum;
// Batman (Action) = stub-slate. Amber and teal are deliberately excluded — amber
// is the ONLY action/highlight color and teal is hint-only, so neither can double
// as a resting spine without muddying those affordances. That leaves six spine
// hues for twelve genres, so families share (allowed by the ruling). Mapped by
// mood so neighbors stay legible: bloody/warm → red, nocturnal/tense → plum,
// cool/systemic → navies, earthy/muted → slates.
const GENRE_SPINE: Record<string, string> = {
  Crime: 'var(--color-stub-red)', //          #A02C2C — Godfather anchor
  Horror: 'var(--color-stub-red)', //         blood family
  Thriller: 'var(--color-stub-genre-pip)', // #58486C — Taxi anchor (minted plum)
  Romance: 'var(--color-stub-genre-pip)', //  moody plum neighbor
  'Sci-Fi': 'var(--color-stub-navy)', //      #1F3A52 — "sci-fi navies" (types.ts)
  Action: 'var(--color-stub-slate)', //       #5B6B7A — Batman anchor (#546473→slate)
  Adventure: 'var(--color-stub-slate)', //    kinetic slate neighbor
  Drama: 'var(--color-stub-navy-mid)', //     #41586E — sober navy-mid
  War: 'var(--color-stub-navy-mid)', //       grave navy-mid neighbor
  Comedy: 'var(--color-stub-slate-light)', // #8FA6BC — the lightest, airiest step
  Animation: 'var(--color-stub-slate-light)', // bright neighbor
  Western: 'var(--color-stub-slate)', //      dusty slate
}
// Any genre added later without a mapping falls back to navy (a safe, on-brand ink).
function spineColor(genre: string): string {
  return GENRE_SPINE[genre] ?? 'var(--color-stub-navy)'
}

// ── Art-slot monogram ────────────────────────────────────────────────────────
// The monogram is the title's INITIAL — a DEMOTED corner accent under the
// "NAME IS THE HERO" redesign (Buri grill, 2026-07-08): the full title now owns
// the face; this is a small ticket-stub flourish, not the hero. Skip a leading
// article so "The Godfather" → G, "A Clockwork Orange" → C. Falls back to '?'.
function titleInitial(title: string): string {
  const stripped = title.replace(/^(the|a|an)\s+/i, '').trim()
  const first = (stripped || title).trim().charAt(0)
  return (first || '?').toUpperCase()
}

// ── Adaptive title fit — the NAME-IS-THE-HERO guarantee (Buri, 2026-07-08) ─────
// The full movie name must ALWAYS be readable: no "…", no mid-word break, at
// every card size. Same proven heuristic as ConnectionsGame.tileFontSize (shipped
// + Buri-approved same day): shrink the font on a pure CHAR COUNT — no canvas
// measureText that would race the web-font load and mis-size the first paint —
// against two caps, taking the smaller:
//   • widthCap: the LONGEST word must fit the title box on one line, so a
//     proper-noun single word ("MONEYBALL") can never force-break mid-glyph.
//   • lineCap: the WHOLE title must fit in `maxLines`, so a many-short-word title
//     ("ONCE UPON A TIME IN HOLLYWOOD") shrinks instead of overflowing the fixed
//     title band (which would break the locked zone ratio).
// Domine caps advance: the WIDEST caps (M/W/E-heavy words like "MEMENTO") measure
// ~0.80px per char per font-px in the shipped subset; 0.82 adds a safety margin so
// the fitted size guarantees the longest word fits one line (verified 0 mid-word
// breaks across the whole pool via ?preview=StubTitleAudit's canvas measure). The
// Connections tile fit's 0.73 was calibrated to its own wider tiles + shorter
// titles; StubCard's narrower title box needs the true worst-case advance.
// `break-word` stays as the final backstop; the floor keeps long titles legible.
const CAPS_ADVANCE = 0.82
function titleFit(
  title: string,
  boxW: number,
  basePx: number,
  floorPx: number,
  maxLines: number,
): number {
  const words = title.split(/\s+/).filter(Boolean)
  const longestLen = words.reduce((a, w) => Math.max(a, w.length), 1)
  const totalLen = title.replace(/\s+/g, ' ').trim().length || 1
  const widthCap = boxW / (CAPS_ADVANCE * longestLen)
  // chars that fit one line at font f = boxW/(0.73·f); want totalLen ≤ maxLines·that
  const lineCap = (boxW * maxLines) / (CAPS_ADVANCE * totalLen)
  return Math.max(floorPx, Math.min(basePx, widthCap, lineCap))
}

// ── Adaptive ledger-name fit (W5d) ────────────────────────────────────────────
// Same char-count discipline as titleFit, tuned for Inter mixed-case: measured
// real advance across the pool's credits runs ≈0.56–0.59em/char at weight 700;
// 0.60 adds the margin (0.58 left "Adam McKay"/"Jonathan Demme" 1px over —
// audit-caught). Below the 6.5px legibility floor we don't shrink further — we
// go ticket-style instead: "Francis Ford Coppola" → "F. Ford Coppola" →
// "F. Coppola" → "Coppola" → (hyphenated surnames) last segment. If no
// candidate clears 6.5, a second pass accepts ≥5px: a small WHOLE name beats an
// ellipsis (NAME IS THE HERO doctrine; ChronoCard's line size already floors at
// 4). The +2 director row must NEVER truncate — the auteur name is the
// information a player weighs. `truncate` stays as a backstop only.
const NAME_ADVANCE = 0.6
const NAME_FLOOR_PX = 6.5
const NAME_LAST_RESORT_PX = 5
function nameFit(
  name: string,
  boxW: number,
  basePx: number,
): { px: number; text: string } {
  const fitPx = (t: string) => boxW / (NAME_ADVANCE * Math.max(t.length, 1))
  const words = name.split(/\s+/).filter(Boolean)
  const last = words[words.length - 1]
  const candidates = [name]
  if (words.length >= 2) {
    candidates.push(`${words[0].charAt(0)}. ${words.slice(1).join(' ')}`)
    if (words.length >= 3) candidates.push(`${words[0].charAt(0)}. ${last}`)
    candidates.push(last)
  }
  // "Gordon-Levitt" → "Levitt": a hyphenated surname's final segment is the
  // only step smaller than the whole surname.
  const lastSegment = last.split('-').filter(Boolean).pop()
  if (lastSegment && lastSegment !== last) candidates.push(lastSegment)
  for (const floor of [NAME_FLOOR_PX, NAME_LAST_RESORT_PX]) {
    for (const text of candidates) {
      const px = Math.min(basePx, fitPx(text))
      if (px >= floor) return { px, text }
    }
  }
  // Nothing fits even fully abbreviated — floor + the truncate backstop.
  return { px: NAME_LAST_RESORT_PX, text: candidates[candidates.length - 1] }
}

// ── +1 / +2 ledger mapping ───────────────────────────────────────────────────
// The face carries the information a player weighs before peeking/playing: cast
// and the director. deepCast is NEVER rendered (deep-cut discovery mechanic).
// Point chips mirror RULEBOOK.md link scoring, read off the uploads comps:
//   • an ACTOR row → round marker, +1  (RULEBOOK: standard link = one shared actor)
//   • the DIRECTOR row → amber square marker, +2  (strong link = shared director)
// Writers count for links too but the comps show director only on the face (three
// cast + one director on Godfather); we follow the comp — director stands for the
// auteur affordance, writers stay off-face like deepCast. Cast is capped to what
// fits per size; the director row always shows when credits are revealed.
type LedgerRow = { name: string; chip: '+1' | '+2'; kind: 'actor' | 'director' }

function buildLedger(movie: Movie, maxCast: number): LedgerRow[] {
  const rows: LedgerRow[] = movie.topCast
    .slice(0, maxCast)
    .map((name) => ({ name, chip: '+1' as const, kind: 'actor' as const }))
  const director = movie.director[0]
  if (director) rows.push({ name: director, chip: '+2', kind: 'director' })
  return rows
}

// ── Per-size internal scale ──────────────────────────────────────────────────
// What each size shows (matched to the comps):
//   thumb  ~30px  — meld-shelf chip: frame + spine silhouette only. No text,
//                   no ledger, no art block, no rail. Reads as a colored spine.
//   hand   ~96px  — fan card: full frame, tight type, up to 2 cast + director.
//                   Rail shows pip + inset bar + perforation, OMITS ADMIT ONE
//                   text (illegible at 96px) and the corner notches.
//   pile   ~130px — marquee pile: full rail (pip + bar + ADMIT ONE + dots),
//                   notches, up to 3 cast + director.
//   raised ~184px — the hero (travel/flip): full fidelity, all frame detail.
// Rail anatomy (comp card-godfather-cut.png): a CREAM column at the card's left
// edge holding, top→bottom, the genre diamond pip, an inset genre BAR (rounded
// ends, not touching top/bottom), and vertical ADMIT ONE navy mono at the foot;
// a dotted navy perforation runs full-height to the rail's right. `railW` is the
// cream column; `perfW` the dotted strip. Frame stays aspect-ratio 3/4; parent
// sets pixel width, so everything below is width-relative.
const SIZES = {
  thumb: {
    width: 30,
    radius: 'var(--radius-stub-thumb)', // 6px
    borderPx: 1.5,
    spineW: 6, // edge-to-edge genre spine — the whole silhouette at thumb
    railW: 0,
    perfW: 0,
    showChrome: false,
    showAdmit: false,
    showNotch: false,
    showTitle: false,
    showArt: false,
    showLedger: false,
    maxCast: 0,
    pad: 0,
    titlePx: 0,
    yearPx: 0,
    rowPx: 0,
    chipPx: 0,
    admitPx: 0,
    notchPx: 0,
    gap: 0,
    titleBasePx: 0,
    titleFloorPx: 0,
    titleMaxLines: 0,
    panelRadius: '0px',
    monoTallPx: 0,
    monoShortPx: 0,
    genPx: 0,
    genShortPx: 0,
    genTrack: '0em',
    cornerPx: 0,
    stampPx: 0,
    deeperPx: 0,
    hintPx: 0,
  },
  hand: {
    width: 96,
    radius: '11px', // README: 10–11 at hand size
    borderPx: 2,
    spineW: 0, // no separate spine; the rail's bar is the genre marker
    railW: 12, // cream rail column (pip + inset bar; no ADMIT ONE at this size)
    perfW: 6, // dotted perforation strip
    showChrome: true,
    showAdmit: false, // ADMIT ONE too small to read at 96px — omit
    showNotch: false, // notches too small at 96px — omit
    showTitle: true,
    showArt: true,
    showLedger: true,
    maxCast: 2,
    pad: 7,
    titlePx: 11,
    yearPx: 8.5,
    rowPx: 8.5,
    chipPx: 8,
    admitPx: 6,
    notchPx: 0,
    gap: 3,
    // NAME IS THE HERO: title owns the face; base bumped from the old 11.
    // maxLines 2 keeps title+panel+full-ledger inside the tight frame with
    // NO clip (verified across the whole pool via ?preview=StubTitleAudit).
    titleBasePx: 12,
    titleFloorPx: 6,
    titleMaxLines: 2,
    // Poster panel (W5d, comp docs/card-redesign-proposal.html §2): numbers read
    // off the comp's 96px hand card; short-mode mono ≈ half the tall mono.
    panelRadius: '6px',
    monoTallPx: 26,
    monoShortPx: 13,
    genPx: 6.5,
    genShortPx: 6.5,
    genTrack: '0.18em', // comp tightens tracking at 96px (.18 vs .22)
    cornerPx: 0, // corner diamonds are pile/raised chrome — omit at 96px
    stampPx: 22,
    deeperPx: 0, // +N DEEPER CREDITS is pile/raised only (queue ruling)
    hintPx: 0, // flip hint is pile/raised only — fan taps raise, not flip
  },
  pile: {
    width: 130,
    radius: 'var(--radius-stub-card)', // 12px
    borderPx: 2,
    spineW: 0,
    railW: 15, // full rail: pip + inset bar + ADMIT ONE
    perfW: 6,
    showChrome: true,
    showAdmit: true,
    showNotch: true,
    showTitle: true,
    showArt: true,
    showLedger: true,
    maxCast: 3,
    pad: 9,
    titlePx: 12.5,
    yearPx: 9.5,
    rowPx: 10,
    chipPx: 9.5,
    admitPx: 7,
    notchPx: 12,
    gap: 4,
    titleBasePx: 14,
    titleFloorPx: 8,
    titleMaxLines: 2,
    // Poster panel — the comp's anchor size (130px card in the proposal §1).
    panelRadius: '8px',
    monoTallPx: 40,
    monoShortPx: 20,
    genPx: 7.5,
    genShortPx: 6.5,
    genTrack: '0.22em',
    cornerPx: 5,
    stampPx: 30,
    deeperPx: 6.5,
    hintPx: 6.5,
  },
  raised: {
    width: 184,
    radius: 'var(--radius-stub-panel)', // 14px — comps round the raised card a touch more
    borderPx: 2.5,
    spineW: 0,
    railW: 20, // full rail at hero fidelity
    perfW: 8,
    showChrome: true,
    showAdmit: true,
    showNotch: true,
    showTitle: true,
    showArt: true,
    showLedger: true,
    maxCast: 3,
    pad: 12,
    titlePx: 17.5,
    yearPx: 11.5,
    rowPx: 12.5,
    chipPx: 11,
    admitPx: 9,
    notchPx: 14,
    gap: 5,
    titleBasePx: 20,
    titleFloorPx: 9,
    titleMaxLines: 2,
    // Poster panel scaled 184/130 from the comp's 130px anchor.
    panelRadius: '10px',
    monoTallPx: 56,
    monoShortPx: 28,
    genPx: 10.5,
    genShortPx: 9,
    genTrack: '0.22em',
    cornerPx: 7,
    stampPx: 42,
    deeperPx: 9,
    hintPx: 8.5,
  },
} as const

export function StubCard({
  movie,
  size,
  faceUp = true,
  reveal,
  selected = false,
  hint = false,
  hintLabel,
  deepCut = false,
  flipHint = false,
  className,
}: StubCardProps) {
  const s = SIZES[size]
  // A wild is a mechanical card (12 Angry Men / Casablanca / Citizen Kane) with
  // no real credits — it plays anywhere and fills melds but scores 0. It wears the
  // same ticket frame, amber-accented (amber = the Stub's action/highlight hue, so
  // the wild reads as the one special ticket), with a ★ WILD lockup in the art slot
  // instead of a monogram, and NO ledger/year (there are no credits to weigh). This
  // is EXTRAPOLATED — the comps have no wild card (checkpoint flag).
  const wild = isWild(movie.id)
  const showYear = wild ? false : (reveal?.year ?? true)
  const showCredits = reveal?.credits ?? true
  const spine = wild ? 'var(--color-stub-amber)' : spineColor(movie.genre)

  // Frame border + shadow. selected (amber) beats hint (teal) beats resting.
  // The 3/4 aspect + parent-set width means everything below is width-relative.
  const frameStyle: CSSProperties = {
    aspectRatio: '3 / 4',
    width: s.width,
    borderRadius: s.radius,
    borderWidth: selected || hint ? 2.5 : s.borderPx,
    borderColor: selected
      ? 'var(--color-stub-amber)'
      : hint
        ? 'var(--color-stub-teal)'
        : 'var(--color-stub-navy)',
    background: 'var(--color-stub-paper)',
    boxShadow: selected
      ? `${'var(--shadow-stub-glow-amber)'}${size === 'raised' ? ', var(--shadow-stub-card-raised)' : ''}`
      : hint
        ? 'var(--shadow-stub-glow-teal)'
        : size === 'raised'
          ? 'var(--shadow-stub-card-raised)'
          : 'var(--shadow-stub-card-resting)',
    // color-only transition → identical under reduced motion, so no guard needed.
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  }

  // ── Face-down: ticket back ──────────────────────────────────────────────────
  // Navy block, 1px dashed cream inner frame, vertical "MATCH CUT" in Domine.
  // (The 7a deck's vertical mark reads "MARQUEE" — pre-rename brand; the card
  // back carries the product name.) Consistent with the §3 deck-back language.
  if (!faceUp) {
    return (
      <div
        className={`box-border overflow-hidden border-solid ${className ?? ''}`}
        style={{ ...frameStyle, background: 'var(--color-stub-navy)' }}
        data-stub-card="back"
      >
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ padding: Math.max(3, s.pad - 3) }}
        >
          <div
            className="flex h-full w-full items-center justify-center border-dashed"
            style={{
              borderWidth: 1,
              borderColor: 'rgba(240,235,216,.55)', // cream @ 55%, per §3 deck frame
              borderRadius: `calc(${s.radius} - 4px)`,
            }}
          >
            {size !== 'thumb' && (
              <span
                className="font-stub-display text-stub-cream"
                style={{
                  writingMode: 'vertical-rl',
                  letterSpacing: '0.2em',
                  fontSize: s.titlePx,
                  fontWeight: 700,
                }}
              >
                MATCH CUT
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Thumb: silhouette only. Collapses the whole rail to one edge-to-edge genre
  // spine — the card's today-color on the meld shelf. No pip/dots/text (would be
  // sub-pixel at 30px); the orchestrator ruling is "keep it simple" here. ───────
  if (!s.showChrome) {
    return (
      <div
        className={`box-border flex overflow-hidden border-solid ${className ?? ''}`}
        style={frameStyle}
        data-stub-card="thumb"
        aria-label={movie.title}
      >
        <div style={{ width: s.spineW, background: spine, flex: 'none' }} />
        <div style={{ flex: 1 }} />
      </div>
    )
  }

  const ledger = wild ? [] : showCredits ? buildLedger(movie, s.maxCast) : []

  // Title box inner width = card − rail − perforation − the main column's own
  // left(gap)/right(pad) padding, minus a 2px safety buffer. Feeds the adaptive
  // fit so the fitted size is derived from the real space the name has to live in.
  const titleBoxW = Math.max(1, s.width - s.railW - s.perfW - s.gap - s.pad - 4)
  const titlePx = titleFit(
    movie.title,
    titleBoxW,
    s.titleBasePx,
    s.titleFloorPx,
    s.titleMaxLines,
  )

  // Poster-panel mode (W5d): TALL when credits are hidden — big monogram over
  // the genre word, a letterpress one-sheet — and SHORT when the ledger is up
  // (small monogram BESIDE the genre in a row: a column at that height
  // overflows the panel's slack and pushes the ledger past the frame). A wild
  // never shows credits, so it is always the tall ★ WILD one-sheet.
  const tall = wild || !showCredits
  // Ledger name box: main column width minus the marker, the Domine point chip
  // ("+1"/"+2" ≈ 0.7em/char → 1.4·rowPx), and the row's two gaps.
  const nameBoxW = Math.max(
    1,
    titleBoxW - s.chipPx - 1.4 * s.rowPx - 2 * s.gap - 2,
  )
  // DEEP CUT stamp: comp geometry — tall panels wear the full-size stamp, short
  // panels the 0.73× one (30px→22px at the comp's 130 anchor); the negative
  // offsets scale with the diameter so the overlap reads the same at every size.
  const stampD = tall ? s.stampPx : Math.round(s.stampPx * 0.73)

  return (
    <div className={`relative ${className ?? ''}`} style={{ width: s.width }}>
      {/* hint pill floats above the frame (README: "HINT · PACINO"). */}
      {hint && hintLabel && (
        <div
          className="absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-stub-pill font-stub-label"
          style={{
            bottom: `calc(100% + ${s.gap}px)`,
            background: 'var(--color-stub-teal)',
            color: 'var(--color-stub-cream)',
            fontSize: s.chipPx,
            fontWeight: 700,
            letterSpacing: '0.08em',
            padding: `3px ${s.pad}px`,
          }}
        >
          {hintLabel}
        </div>
      )}

      <div
        className="relative box-border flex overflow-hidden border-solid"
        style={frameStyle}
        data-stub-card="front"
      >
        {/* ── Ticket notches (comp): cream circles w/ navy border punched into the
            top-center + bottom-center edges. Positioned so the header row clears
            the top notch. overflow-hidden on the frame does the half-clipping. ── */}
        {s.showNotch && (
          <>
            <div
              className="pointer-events-none absolute left-1/2 z-10"
              style={{
                top: 0,
                width: s.notchPx,
                height: s.notchPx,
                borderRadius: '50%',
                background: 'var(--color-stub-cream)',
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: 'var(--color-stub-navy)',
                transform: 'translate(-50%, -50%)',
              }}
            />
            <div
              className="pointer-events-none absolute left-1/2 z-10"
              style={{
                bottom: 0,
                width: s.notchPx,
                height: s.notchPx,
                borderRadius: '50%',
                background: 'var(--color-stub-cream)',
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: 'var(--color-stub-navy)',
                transform: 'translate(-50%, 50%)',
              }}
            />
          </>
        )}

        {/* ── Left rail (comp anatomy): a CREAM column holding the genre diamond
            pip, an inset genre BAR (rounded ends, floating clear of top/bottom),
            and vertical ADMIT ONE mono at its foot. A dotted navy perforation
            runs full-height to its right, separating rail from body. ── */}
        <div
          className="relative flex flex-none flex-col items-center"
          style={{
            width: s.railW,
            background: 'var(--color-stub-cream)',
            paddingBlock: s.pad * 0.55,
          }}
        >
          {/* diamond pip — genre-colored rotated square, floating near the top */}
          <div
            className="flex-none"
            style={{
              width: Math.max(4, s.railW - 6),
              height: Math.max(4, s.railW - 6),
              background: spine,
              transform: 'rotate(45deg)',
            }}
          />
          {/* inset genre bar — rounded ends, the middle stretch, not touching edges */}
          <div
            className="flex-1"
            style={{
              width: Math.max(4, s.railW - 7),
              marginBlock: s.pad * 0.5,
              background: spine,
              borderRadius: 999,
            }}
          />
          {s.showAdmit && (
            <span
              className="flex-none font-stub-label text-stub-navy"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                fontSize: s.admitPx,
                fontWeight: 600,
                letterSpacing: '0.14em',
              }}
            >
              ADMIT ONE
            </span>
          )}
        </div>

        {/* dotted perforation — repeating navy dots, full-height, rail↔body seam */}
        <div
          className="flex-none self-stretch"
          style={{
            width: s.perfW,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 2,
              height: '100%',
              backgroundImage:
                'repeating-linear-gradient(var(--color-stub-navy) 0 2px, transparent 2px 5px)',
            }}
          />
        </div>

        {/* ── Main column: title, art, ledger. Top/bottom pad reserve headroom
            for the punched notches so the header clears the top notch and the
            ledger clears the bottom one (comp: header sits below the top notch). */}
        <div
          className="flex min-w-0 flex-1 flex-col"
          style={{
            padding: s.pad,
            gap: s.gap,
            paddingLeft: s.gap,
            paddingTop: Math.max(s.pad, s.notchPx / 2 + 2),
            paddingBottom: Math.max(s.pad, s.notchPx / 2 + 2),
          }}
        >
          {/* ── Title band — NAME IS THE HERO (Buri grill, 2026-07-08): the full
              movie name owns the face. `titlePx` is adaptively fitted so the name
              is ALWAYS whole — no "…", no mid-word break — wrapping on whole words
              up to titleMaxLines. The year is demoted to a small tabular eyebrow
              ABOVE the name (off the title's line, so the name gets the full
              column width). Thin navy rule beneath. `hyphens:manual` kills the old
              auto-hyphenation that chopped proper nouns ("MONEYBAL/L"). ── */}
          <div style={{ flex: 'none' }}>
            {showYear && (
              <div
                className="font-stub-label text-stub-slate"
                style={{
                  fontSize: s.yearPx,
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '0.1em',
                  lineHeight: 1,
                  marginBottom: 1,
                }}
              >
                {movie.year}
              </div>
            )}
            <span
              className="block min-w-0 break-words font-stub-display uppercase text-stub-navy"
              lang="en"
              style={{
                fontSize: titlePx,
                fontWeight: 700,
                lineHeight: 1.03,
                overflowWrap: 'break-word', // backstop only — titleFit prevents it
                hyphens: 'manual', // NO auto-hyphenation (the old mid-word culprit)
              }}
            >
              {movie.title}
            </span>
            <div
              style={{
                marginTop: 2,
                height: 1,
                background: 'var(--color-stub-navy)',
                opacity: 0.9,
              }}
            />
          </div>

          {/* ── Poster panel (W5d, Buri-approved comp docs/card-redesign-proposal.html):
              a flex-1 FRAMED panel — navy border, cream + halftone, genre wash,
              −7° diagonal band — replaces the 14px strip AND the old bottom
              spacer: the slack the invisible spacer used to eat is now inside
              the frame, so cards still share one ratio but the face reads as a
              letterpress one-sheet instead of blank paper. Typographic-only this
              build; when real scene art lands it drops into this exact frame
              with zero layout change. reveal.art stays ignored (§2.6). ── */}
          {s.showArt && (
            <div
              className="relative flex min-h-0 flex-1 flex-col items-center justify-center"
              style={{
                borderWidth: Math.max(1, s.borderPx - 0.5),
                borderStyle: 'solid',
                borderColor: 'var(--color-stub-navy)',
                borderRadius: s.panelRadius,
                background: 'var(--color-stub-cream)',
                // short mode: never crush the mono+genre row out of legibility.
                // Exactly the mono height — the +4 breathing room cost 3-line
                // titles (THE TRUMAN SHOW at pile) their last ledger pixels.
                minHeight: tall ? undefined : s.monoShortPx,
                // overflow stays VISIBLE — the DEEP CUT stamp overlaps the edge
              }}
            >
              {/* clipped inner: halftone + genre wash (.13) + −7° band (.15) */}
              <div
                className="pointer-events-none absolute inset-0 overflow-hidden"
                style={{ borderRadius: `calc(${s.panelRadius} - 1.5px)` }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      'radial-gradient(rgba(31,58,82,.07) 1px, transparent 1.2px)',
                    backgroundSize: '7px 7px',
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: spine, opacity: 0.13 }}
                />
                <div
                  className="absolute"
                  style={{
                    left: '-12%',
                    right: '-12%',
                    height: '22%',
                    top: '57%',
                    transform: 'rotate(-7deg)',
                    background: spine,
                    opacity: 0.15,
                  }}
                />
              </div>

              {/* corner diamonds — tall pile/raised chrome only (comp §1) */}
              {tall &&
                s.cornerPx > 0 &&
                (
                  [
                    { top: 5, left: 5 },
                    { top: 5, right: 5 },
                    { bottom: 5, left: 5 },
                    { bottom: 5, right: 5 },
                  ] as const
                ).map((pos, i) => (
                  <div
                    key={i}
                    className="pointer-events-none absolute"
                    style={{
                      ...pos,
                      width: s.cornerPx,
                      height: s.cornerPx,
                      background: spine,
                      opacity: 0.5,
                      transform: 'rotate(45deg)',
                    }}
                  />
                ))}

              {/* monogram + FULL genre word — the panel is wide enough that the
                  longest genre (ADVENTURE/ANIMATION) fits untruncated at every
                  size, which the 14px strip never could. TALL: poster column.
                  SHORT: compact row beside the ledger. */}
              <div
                className={`relative flex min-w-0 items-center justify-center ${
                  tall ? 'flex-col' : 'flex-row'
                }`}
                style={{ gap: tall ? 3 : s.gap, paddingInline: 2 }}
              >
                <span
                  className="flex-none font-stub-display"
                  style={{
                    fontSize: tall ? s.monoTallPx : s.monoShortPx,
                    fontWeight: 700,
                    lineHeight: 1,
                    color: spine,
                  }}
                >
                  {wild ? '★' : titleInitial(movie.title)}
                </span>
                <span
                  className="whitespace-nowrap font-stub-label text-stub-slate"
                  style={{
                    fontSize: tall ? s.genPx : s.genShortPx,
                    fontWeight: 600,
                    letterSpacing: s.genTrack,
                  }}
                >
                  {wild ? 'WILD' : movie.genre.toUpperCase()}
                </span>
              </div>

              {/* DEEP CUT — the comp's corner stamp: genre-hue disc, inset cream
                  ring, rotated 8°, overlapping the panel's bottom-right edge.
                  Restored from the illegible 11.5px in-strip dot (review major). */}
              {deepCut && !wild && stampD > 0 && (
                <div
                  className="absolute flex items-center justify-center rounded-full"
                  style={{
                    width: stampD,
                    height: stampD,
                    right: -Math.round(stampD * 0.2),
                    bottom: -Math.round(stampD * 0.23),
                    background: spine,
                    boxShadow:
                      'inset 0 0 0 1.5px var(--color-stub-cream), 0 1px 4px rgba(31,58,82,.35)',
                    transform: 'rotate(8deg)',
                    zIndex: 5,
                  }}
                >
                  <span
                    className="text-center font-stub-label"
                    style={{
                      color: 'var(--color-stub-cream)',
                      fontSize: stampD * 0.2,
                      fontWeight: 700,
                      lineHeight: 1.1,
                      letterSpacing: '0.04em',
                    }}
                  >
                    DEEP
                    <br />
                    CUT
                  </span>
                </div>
              )}
            </div>
          )}

          {/* "⇄ FLIP FOR CREDITS" — opt-in tap affordance under the panel.
              Tall (unrevealed) pile/raised faces only: once the ledger is up
              there is nothing left to flip for. */}
          {flipHint && tall && !wild && s.hintPx > 0 && (
            <div
              className="flex flex-none items-center justify-center whitespace-nowrap font-stub-label"
              style={{
                gap: 4,
                fontSize: s.hintPx,
                fontWeight: 600,
                letterSpacing: '0.1em', // .14em wraps the caption at pile width
                color: 'var(--color-stub-slate-light)',
              }}
            >
              <span style={{ fontSize: s.hintPx + 2 }}>⇄</span>
              FLIP FOR CREDITS
            </div>
          )}

          {/* ── Credit ledger: marker + name + point chip, hairline-ruled.
              Names ride nameFit: shrink to the 6.5px floor, then fall back to
              the ticket-style initial ("C. Nolan") — the +2 director never
              truncates (W5d; truncate class is a backstop only). ── */}
          {s.showLedger && ledger.length > 0 && (
            <div className="flex flex-none flex-col">
              {ledger.map((row, i) => {
                const fitted = nameFit(row.name, nameBoxW, s.rowPx)
                return (
                <div
                  key={`${row.kind}-${row.name}`}
                  className="flex items-center"
                  style={{
                    gap: s.gap,
                    paddingBlock: Math.max(1, s.gap - 2),
                    borderTop:
                      i === 0
                        ? undefined
                        : '1px solid rgba(31,58,82,.5)', // navy hairline between rows
                  }}
                >
                  {/* marker: round = actor, amber square = director */}
                  {row.kind === 'director' ? (
                    <span
                      className="flex-none"
                      style={{
                        width: s.chipPx,
                        height: s.chipPx,
                        background: 'var(--color-stub-amber)',
                        borderRadius: 2,
                      }}
                    />
                  ) : (
                    <span
                      className="flex-none rounded-full"
                      style={{
                        width: s.chipPx,
                        height: s.chipPx,
                        background: 'var(--color-stub-slate)',
                      }}
                    />
                  )}
                  <span
                    className="min-w-0 flex-1 truncate font-stub-ui text-stub-navy"
                    style={{ fontSize: fitted.px, fontWeight: 700, lineHeight: 1.1 }}
                  >
                    {fitted.text}
                  </span>
                  <span
                    className="flex-none font-stub-display text-stub-navy"
                    style={{
                      fontSize: s.rowPx,
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                      // Domine's default line box is taller than the Inter name's
                      // — pin it or every row grows and the pile frame overflows.
                      lineHeight: 1.1,
                    }}
                  >
                    {row.chip}
                  </span>
                </div>
                )
              })}
            </div>
          )}

          {/* ── "+N DEEPER CREDITS" — the deep-cut tease (W5d restore): the rule
              HowToPlay/RULEBOOK document — N hidden names that still score on a
              link. Red mono, comp §1 flipped card. Pile/raised, revealed faces
              with a deep roster only; the names themselves stay off-face (the
              discovery mechanic is the point). ── */}
          {s.deeperPx > 0 &&
            deepCut &&
            !wild &&
            showCredits &&
            (movie.deepCast?.length ?? 0) > 0 && (
              <div
                className="flex-none text-center font-stub-label"
                style={{
                  fontSize: s.deeperPx,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  lineHeight: 1,
                  color: 'var(--color-stub-red)',
                }}
              >
                +{movie.deepCast!.length} DEEPER CREDITS
              </div>
            )}
          {/* No bottom spacer anymore — the flex-1 poster panel absorbs the
              slack, which is what keeps every card at one shared ratio. */}
        </div>
      </div>
    </div>
  )
}

export default StubCard
