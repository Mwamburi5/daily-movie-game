export interface Movie {
  id: string
  title: string
  year: number
  director: string[]
  writers: string[]
  topCast: string[] // top billing — shown on the card back
  // Deeper-billed actors: hidden from the card, but they still count for
  // links and melds. Connecting purely through these = "deep cut" celebration.
  deepCast?: string[]
  posterColor: string // genre family color (crime reds, sci-fi navies, ...)
  genre: string
  series?: string // shared id marks franchise/trilogy mates (super link)
  // US THEATRICAL release date (ISO YYYY-MM-DD), locked policy 2026-06-27:
  // release types 2+3, limited counts, NO festival premieres / streaming-only
  // dates. Optional and inert to Duel/Solo/Connections — read only by the
  // Chronology pool build (scripts/build-chronology-pool.ts), which derives the
  // card's year+decade from it. A film may carry a card-face `year` under a
  // different (original-release) convention; both are deliberate. See
  // docs/pool-unification.md and the seed's date-policy note.
  releaseDate?: string
}

// A dates-only pool entry: a film that carries a locked US-theatrical release
// date but has no credits yet, so it is NOT a full Movie (crediting it would
// force fabricated genre/posterColor and pollute MOVIES' meaning as "the
// credited pool"). Chronology deals from MOVIES-with-dates ∪ DATED_STUBS; a stub
// GRADUATES to a Movie when a future wave credits it (same id + releaseDate, so
// the Chronology view is unaffected). See docs/pool-unification.md §"stubs".
export interface DatedStub {
  id: string
  title: string
  releaseDate: string // ISO YYYY-MM-DD, same locked policy as Movie.releaseDate
}

export interface Puzzle {
  id: string
  starterMovieId: string
  handMovieIds: string[]
  par: number
}
