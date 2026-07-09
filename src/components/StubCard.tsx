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
    monoPx: 0,
    badgePx: 0,
    notchPx: 0,
    gap: 0,
    titleBasePx: 0,
    titleFloorPx: 0,
    titleMaxLines: 0,
    artH: 0,
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
    monoPx: 6.5,
    badgePx: 8,
    notchPx: 0,
    gap: 3,
    // NAME IS THE HERO: title owns the face; base bumped from the old 11, art
    // strip demoted to a thin genre+monogram band (was flex-1 filling the card).
    // maxLines 2 + a slim artH so title+art+full-ledger fit the tight frame with
    // NO clip (verified across the whole pool via ?preview=StubTitleAudit).
    titleBasePx: 12,
    titleFloorPx: 6,
    titleMaxLines: 2,
    artH: 14,
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
    monoPx: 8,
    badgePx: 9.5,
    notchPx: 12,
    gap: 4,
    titleBasePx: 14,
    titleFloorPx: 8,
    titleMaxLines: 2,
    artH: 14,
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
    monoPx: 10,
    badgePx: 12,
    notchPx: 14,
    gap: 5,
    titleBasePx: 20,
    titleFloorPx: 9,
    titleMaxLines: 2,
    artH: 24,
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

          {/* ── Art strip → DEMOTED (Buri grill, 2026-07-08): a FIXED-height band
              (was flex-1, which swelled the monogram whenever credits were hidden
              — the reason cards didn't share one ratio). Holds a SMALL monogram
              accent + the genre tag; the name is the hero now, this is a ticket
              flourish. reveal.art is ignored (typographic-face ruling §2.6). DEEP
              CUT rides the bottom-right as a circular double-ring stamp. ── */}
          {s.showArt && (
            <div
              className="relative flex-none overflow-hidden"
              style={{
                height: s.artH,
                borderWidth: Math.max(1, s.borderPx - 0.5),
                borderStyle: 'solid',
                borderColor: 'var(--color-stub-navy)',
                borderRadius: `calc(${s.radius} - 4px)`,
                background: 'var(--color-stub-cream)',
              }}
            >
              {/* halftone texture, matching the board's cream field */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    'radial-gradient(rgba(31,58,82,.06) 1px, transparent 1.2px)',
                  backgroundSize: '7px 7px',
                }}
              />
              {/* monogram · genre · deep-cut, laid out as a FLEX ROW so nothing
                  overlaps in the thin strip. genre takes the middle and truncates;
                  the stamp is an inline flex item on the right (the old absolute
                  bottom-right stamp collided with the now vertically-centered
                  content once the art slot shrank to a band). */}
              <div
                className="flex h-full w-full items-center"
                style={{ paddingInline: s.pad, gap: s.gap }}
              >
                {/* small monogram accent — title INITIAL (★ for a wild), spine
                    hue; sized to the strip so it reads as a flourish, not a hero. */}
                <span
                  className="flex-none font-stub-display"
                  style={{
                    fontSize: Math.round(s.artH * 0.78),
                    fontWeight: 700,
                    lineHeight: 0.9,
                    color: spine,
                  }}
                >
                  {wild ? '★' : titleInitial(movie.title)}
                </span>
                <span
                  className="min-w-0 flex-1 truncate text-center font-stub-label text-stub-slate"
                  style={{
                    fontSize: s.monoPx,
                    fontWeight: 600,
                    letterSpacing: '0.16em',
                  }}
                >
                  {wild ? 'WILD' : movie.genre.toUpperCase()}
                </span>

                {deepCut && !wild && s.badgePx > 0 && (
                  <div
                    className="flex flex-none items-center justify-center rounded-full"
                    style={{
                      // capped to the strip height so it fits the band (comp's
                      // filled genre-hue disc + thin cream inner ring look).
                      width: Math.min(s.badgePx * 2.6, s.artH * 0.82),
                      height: Math.min(s.badgePx * 2.6, s.artH * 0.82),
                      background: spine,
                      boxShadow: `inset 0 0 0 1.5px var(--color-stub-cream)`,
                    }}
                  >
                    <span
                      className="text-center font-stub-label"
                      style={{
                        color: 'var(--color-stub-cream)',
                        fontSize: Math.min(s.badgePx * 2.6, s.artH * 0.82) * 0.22,
                        fontWeight: 700,
                        lineHeight: 1.05,
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
            </div>
          )}

          {/* ── Credit ledger: marker + name + point chip, hairline-ruled ── */}
          {s.showLedger && ledger.length > 0 && (
            <div className="flex flex-none flex-col">
              {ledger.map((row, i) => (
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
                    style={{ fontSize: s.rowPx, fontWeight: 700, lineHeight: 1.1 }}
                  >
                    {row.name}
                  </span>
                  <span
                    className="flex-none font-stub-display text-stub-navy"
                    style={{
                      fontSize: s.rowPx,
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {row.chip}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Bottom spacer — absorbs slack so the title + art zones stay pinned to
              the top at a constant size whether or not the ledger is present (an
              unflipped, credits-hidden card looks proportionally identical to a
              revealed one). This is what locks the "one ratio across every card". */}
          <div style={{ flex: 1 }} />
        </div>
      </div>
    </div>
  )
}

export default StubCard
