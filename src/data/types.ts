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
}

export interface Puzzle {
  id: string
  starterMovieId: string
  handMovieIds: string[]
  par: number
}
