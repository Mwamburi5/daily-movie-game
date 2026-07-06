import type { Movie } from './types.ts'
import { MOVIES } from './movies.ts'

// The tuned Duel deal, FROZEN 2026-07-05 (WS2 grill call #6). Duel — and, until
// the WS5 pin-cutover, the Solo daily — deal from exactly these 89 films.
// Content waves grow MOVIES; they must never touch this list. Editing it
// invalidates the difficulty tuning like a rule change (the verify pool-pin
// check + eval tune gate any change), and reshuffles published Solo dailies
// (the solo-verify append-only pin). Chronology has its own pool; Connections
// deals from the full credited MOVIES.
export const DUEL_POOL_IDS: readonly string[] = [
  'goodfellas', 'casino', 'taxi-driver', 'the-departed',
  'inception', 'the-dark-knight', 'interstellar', 'the-martian',
  'pulp-fiction', 'django-unchained', 'inglourious-basterds', 'once-upon-a-time-in-hollywood',
  'forrest-gump', 'catch-me-if-you-can', 'saving-private-ryan', 'jurassic-park',
  'the-wolf-of-wall-street', 'titanic', 'fight-club', 'good-will-hunting',
  'the-godfather', 'the-godfather-part-ii', 'heat', 'the-irishman',
  'shutter-island', 'the-aviator', 'gangs-of-new-york', 'batman-begins',
  'the-prestige', 'se7en', 'the-shawshank-redemption', 'the-green-mile',
  'apollo-13', 'schindlers-list', 'reservoir-dogs', 'gladiator',
  'american-gangster', 'toy-story', 'the-dark-knight-rises', 'the-godfather-part-iii',
  'toy-story-2', 'raging-bull', 'scarface', 'the-untouchables',
  'jackie-brown', 'joker', 'american-hustle', 'the-fighter',
  'training-day', 'inside-man', 'philadelphia', 'the-silence-of-the-lambs',
  'no-country-for-old-men', 'fargo', 'the-big-lebowski', 'oceans-eleven',
  'the-big-short', 'moneyball', 'the-social-network', 'zodiac',
  'a-few-good-men', 'lincoln', 'there-will-be-blood', 'raiders-of-the-lost-ark',
  'unforgiven', 'the-truman-show', 'eternal-sunshine-of-the-spotless-mind', 'the-sixth-sense',
  'memento', 'dunkirk', 'oppenheimer', 'the-matrix',
  'the-matrix-reloaded', 'the-matrix-revolutions', 'blade-runner-2049', 'arrival',
  'sicario', 'prisoners', 'collateral', 'mission-impossible',
  'mission-impossible-2', 'mission-impossible-fallout', 'iron-man', 'ford-v-ferrari',
  'the-fellowship-of-the-ring', 'the-two-towers', 'the-return-of-the-king', 'monsters-inc',
  'toy-story-3',
]

const inPool = new Set(DUEL_POOL_IDS)

// filter() keeps MOVIES order, so while MOVIES is exactly the 89 this is
// byte-identical to dealing from MOVIES — and stays identical after waves
// merge as long as new films are appended (the 89 keep their relative order).
export const DUEL_POOL: Movie[] = MOVIES.filter((m) => inPool.has(m.id))
