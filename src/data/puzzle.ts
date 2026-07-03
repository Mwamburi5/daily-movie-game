import type { Puzzle } from './types.ts'

// Designed structure: Goodfellas/Casino/Taxi Driver/The Departed form a Scorsese
// clique whose only exit is The Departed (DiCaprio -> Inception, Damon -> space films).
// Combos available: De Niro / Scorsese early, Nolan / Caine late.
// Traps: playing The Departed before the other Scorsese films, or Interstellar
// straight after The Departed, strands the rest of the hand.
export const PUZZLE: Puzzle = {
  id: 'marquee-001',
  starterMovieId: 'goodfellas',
  handMovieIds: [
    'interstellar',
    'casino',
    'the-martian',
    'the-departed',
    'inception',
    'taxi-driver',
    'the-dark-knight',
  ],
  par: 9,
}
