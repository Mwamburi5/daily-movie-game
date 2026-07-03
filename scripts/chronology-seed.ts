// scripts/chronology-seed.ts — curated seed for the Chronology pool (STAGE A).
//
// This is the hand-curated input to scripts/build-chronology-pool.ts: a human
// picks famous, era-spread films (the recognizability decision), and fills each
// one's canonical release date by hand. It is author-time content, not shipped to
// the app bundle; the app reads the emitted chronology-pool.json.
//
// STAGE A: ~160 films, roughly evenly spread across the 1970s to the 2020s. This
// unblocks the core, UI, and feel work (design/chronology.md, Phase 1, staged
// build). Stage B grows this to 300 to 500 with more of the same quality before
// the public daily; pool size is a parameter to dealRound, so growth is content,
// not code. The pool must be LOCKED before the public daily, because the daily
// deal is a function of the pool.
//
// Bootstrapped from the 89 recognizable titles in src/data/movies.ts (titles
// copied, the module deliberately NOT imported, so the two pools stay decoupled:
// movies.ts is governed by Duel's link needs, and a Duel edit must not shift the
// Chronology daily). Those 89 clump toward 1990 to 2019, so new curation is
// weighted to the under-filled 1970s, 1980s, and 2020s.
//
// DATE POLICY (locked 2026-06-27): releaseDate is the US THEATRICAL release date.
//   - Exclude festival premieres (Cannes, Venice) and streaming-only dates.
//   - Prefer the first US public theatrical opening (limited counts).
//   - Reason: this is a "when did it come out" game played from cultural memory,
//     and memory tracks the theatrical arrival, not the festival premiere. TMDB's
//     "primary release date" is often the earliest date and mixes policies film to
//     film, so dates are curated by hand to apply ONE policy consistently.
//   - Watch case: foreign/awards films whose US-theatrical YEAR differs from the
//     festival year. There the policy changes the card's face year. Example below:
//     Memento (Venice 2000) opened in the US 2001-03-16, so its card year is 2001.
//
// VERIFICATION NOTE: these dates are curated under the policy above but warrant a
// human verification pass (especially limited-vs-wide openings and recent films)
// BEFORE the pool is locked for the public daily. The build validator checks ISO
// validity, the era window, decade spread, and unique ids; it cannot check that a
// date is the historically correct one. That remains a human job.
//
// Notable demo: se7en (1995-09-22) and toy-story (1995-11-22) share a face year
// but resolve to different slots by date, the signature same-year tie case.
// Same-DAY releases exist too (barbie / oppenheimer 2023-07-21, the "Barbenheimer"
// pair); correctSlot's id tiebreak still gives them one stable order.

// A curated seed entry. `releaseDate` is the hand-looked-up resolver (full ISO
// 'YYYY-MM-DD'); `popularity` is an optional carried signal, omitted here rather
// than fabricated. `year` and `decade` are derived at build time from the date.
export interface SeedEntry {
  id: string
  title: string
  releaseDate: string
  popularity?: number
}

export const CHRONOLOGY_SEED: SeedEntry[] = [
  // ── 1970s ──────────────────────────────────────────────────────────────
  { id: 'a-clockwork-orange', title: 'A Clockwork Orange', releaseDate: '1971-12-19' },
  { id: 'the-french-connection', title: 'The French Connection', releaseDate: '1971-10-09' },
  { id: 'dirty-harry', title: 'Dirty Harry', releaseDate: '1971-12-23' },
  { id: 'the-godfather', title: 'The Godfather', releaseDate: '1972-03-24' },
  { id: 'the-exorcist', title: 'The Exorcist', releaseDate: '1973-12-26' },
  { id: 'chinatown', title: 'Chinatown', releaseDate: '1974-06-20' },
  { id: 'blazing-saddles', title: 'Blazing Saddles', releaseDate: '1974-02-07' },
  { id: 'young-frankenstein', title: 'Young Frankenstein', releaseDate: '1974-12-15' },
  // GF II: US wide a few days after its Dec 1974 premiere.
  { id: 'the-godfather-part-ii', title: 'The Godfather Part II', releaseDate: '1974-12-20' },
  { id: 'jaws', title: 'Jaws', releaseDate: '1975-06-20' },
  { id: 'one-flew-over-the-cuckoos-nest', title: "One Flew Over the Cuckoo's Nest", releaseDate: '1975-11-19' },
  { id: 'taxi-driver', title: 'Taxi Driver', releaseDate: '1976-02-09' },
  { id: 'rocky', title: 'Rocky', releaseDate: '1976-11-21' },
  { id: 'all-the-presidents-men', title: "All the President's Men", releaseDate: '1976-04-09' },
  { id: 'carrie', title: 'Carrie', releaseDate: '1976-11-03' },
  { id: 'network', title: 'Network', releaseDate: '1976-11-27' },
  { id: 'star-wars', title: 'Star Wars', releaseDate: '1977-05-25' },
  { id: 'annie-hall', title: 'Annie Hall', releaseDate: '1977-04-20' },
  { id: 'close-encounters-of-the-third-kind', title: 'Close Encounters of the Third Kind', releaseDate: '1977-11-16' },
  { id: 'saturday-night-fever', title: 'Saturday Night Fever', releaseDate: '1977-12-16' },
  { id: 'grease', title: 'Grease', releaseDate: '1978-06-16' },
  { id: 'halloween', title: 'Halloween', releaseDate: '1978-10-25' },
  // The Deer Hunter: limited US opening in Dec 1978 (wide Feb 1979).
  { id: 'the-deer-hunter', title: 'The Deer Hunter', releaseDate: '1978-12-08' },
  { id: 'superman', title: 'Superman', releaseDate: '1978-12-15' },
  { id: 'alien', title: 'Alien', releaseDate: '1979-05-25' },
  { id: 'apocalypse-now', title: 'Apocalypse Now', releaseDate: '1979-08-15' },
  { id: 'kramer-vs-kramer', title: 'Kramer vs. Kramer', releaseDate: '1979-12-19' },

  // ── 1980s ──────────────────────────────────────────────────────────────
  { id: 'the-empire-strikes-back', title: 'The Empire Strikes Back', releaseDate: '1980-05-21' },
  { id: 'the-shining', title: 'The Shining', releaseDate: '1980-05-23' },
  { id: 'raging-bull', title: 'Raging Bull', releaseDate: '1980-12-19' },
  { id: 'raiders-of-the-lost-ark', title: 'Raiders of the Lost Ark', releaseDate: '1981-06-12' },
  { id: 'e-t-the-extra-terrestrial', title: 'E.T. the Extra-Terrestrial', releaseDate: '1982-06-11' },
  // Blade Runner and The Thing famously opened the same day, 1982-06-25.
  { id: 'blade-runner', title: 'Blade Runner', releaseDate: '1982-06-25' },
  { id: 'the-thing', title: 'The Thing', releaseDate: '1982-06-25' },
  { id: 'scarface', title: 'Scarface', releaseDate: '1983-12-09' },
  { id: 'return-of-the-jedi', title: 'Return of the Jedi', releaseDate: '1983-05-25' },
  // Ghostbusters and Gremlins also shared a day, 1984-06-08.
  { id: 'ghostbusters', title: 'Ghostbusters', releaseDate: '1984-06-08' },
  { id: 'gremlins', title: 'Gremlins', releaseDate: '1984-06-08' },
  { id: 'the-terminator', title: 'The Terminator', releaseDate: '1984-10-26' },
  { id: 'the-breakfast-club', title: 'The Breakfast Club', releaseDate: '1985-02-15' },
  { id: 'back-to-the-future', title: 'Back to the Future', releaseDate: '1985-07-03' },
  { id: 'top-gun', title: 'Top Gun', releaseDate: '1986-05-16' },
  { id: 'ferris-buellers-day-off', title: "Ferris Bueller's Day Off", releaseDate: '1986-06-11' },
  { id: 'aliens', title: 'Aliens', releaseDate: '1986-07-18' },
  { id: 'platoon', title: 'Platoon', releaseDate: '1986-12-19' },
  { id: 'predator', title: 'Predator', releaseDate: '1987-06-12' },
  { id: 'the-untouchables', title: 'The Untouchables', releaseDate: '1987-06-03' },
  { id: 'full-metal-jacket', title: 'Full Metal Jacket', releaseDate: '1987-06-26' },
  { id: 'beetlejuice', title: 'Beetlejuice', releaseDate: '1988-03-30' },
  // Die Hard: limited opening 1988-07-15 (wide a week later).
  { id: 'die-hard', title: 'Die Hard', releaseDate: '1988-07-15' },
  { id: 'rain-man', title: 'Rain Man', releaseDate: '1988-12-16' },
  { id: 'indiana-jones-and-the-last-crusade', title: 'Indiana Jones and the Last Crusade', releaseDate: '1989-05-24' },
  { id: 'dead-poets-society', title: 'Dead Poets Society', releaseDate: '1989-06-09' },
  { id: 'batman', title: 'Batman', releaseDate: '1989-06-23' },
  { id: 'when-harry-met-sally', title: 'When Harry Met Sally...', releaseDate: '1989-07-21' },

  // ── 1990s ──────────────────────────────────────────────────────────────
  { id: 'goodfellas', title: 'Goodfellas', releaseDate: '1990-09-19' },
  { id: 'the-godfather-part-iii', title: 'The Godfather Part III', releaseDate: '1990-12-25' },
  { id: 'the-silence-of-the-lambs', title: 'The Silence of the Lambs', releaseDate: '1991-02-14' },
  { id: 'unforgiven', title: 'Unforgiven', releaseDate: '1992-08-07' },
  { id: 'a-few-good-men', title: 'A Few Good Men', releaseDate: '1992-12-11' },
  // Reservoir Dogs: US theatrical opening 1992-10-23 (Sundance premiere Jan 1992).
  { id: 'reservoir-dogs', title: 'Reservoir Dogs', releaseDate: '1992-10-23' },
  { id: 'jurassic-park', title: 'Jurassic Park', releaseDate: '1993-06-11' },
  { id: 'schindlers-list', title: "Schindler's List", releaseDate: '1993-12-15' },
  { id: 'philadelphia', title: 'Philadelphia', releaseDate: '1993-12-22' },
  { id: 'forrest-gump', title: 'Forrest Gump', releaseDate: '1994-07-06' },
  // Pulp Fiction: Cannes premiere May 1994; US theatrical is the resolver.
  { id: 'pulp-fiction', title: 'Pulp Fiction', releaseDate: '1994-10-14' },
  // Shawshank: limited US opening 1994-09-23 (wide Oct 1994).
  { id: 'the-shawshank-redemption', title: 'The Shawshank Redemption', releaseDate: '1994-09-23' },
  { id: 'se7en', title: 'Se7en', releaseDate: '1995-09-22' },
  { id: 'toy-story', title: 'Toy Story', releaseDate: '1995-11-22' },
  { id: 'casino', title: 'Casino', releaseDate: '1995-11-22' },
  { id: 'heat', title: 'Heat', releaseDate: '1995-12-15' },
  { id: 'apollo-13', title: 'Apollo 13', releaseDate: '1995-06-30' },
  { id: 'fargo', title: 'Fargo', releaseDate: '1996-03-08' },
  { id: 'mission-impossible', title: 'Mission: Impossible', releaseDate: '1996-05-22' },
  { id: 'titanic', title: 'Titanic', releaseDate: '1997-12-19' },
  { id: 'good-will-hunting', title: 'Good Will Hunting', releaseDate: '1997-12-05' },
  { id: 'jackie-brown', title: 'Jackie Brown', releaseDate: '1997-12-25' },
  { id: 'saving-private-ryan', title: 'Saving Private Ryan', releaseDate: '1998-07-24' },
  { id: 'the-big-lebowski', title: 'The Big Lebowski', releaseDate: '1998-03-06' },
  { id: 'the-truman-show', title: 'The Truman Show', releaseDate: '1998-06-05' },
  { id: 'the-matrix', title: 'The Matrix', releaseDate: '1999-03-31' },
  { id: 'fight-club', title: 'Fight Club', releaseDate: '1999-10-15' },
  { id: 'the-sixth-sense', title: 'The Sixth Sense', releaseDate: '1999-08-06' },
  { id: 'the-green-mile', title: 'The Green Mile', releaseDate: '1999-12-10' },
  { id: 'toy-story-2', title: 'Toy Story 2', releaseDate: '1999-11-24' },

  // ── 2000s ──────────────────────────────────────────────────────────────
  { id: 'gladiator', title: 'Gladiator', releaseDate: '2000-05-05' },
  { id: 'mission-impossible-2', title: 'Mission: Impossible 2', releaseDate: '2000-05-24' },
  // Memento: Venice 2000, but US theatrical 2001-03-16, so the card year is 2001.
  { id: 'memento', title: 'Memento', releaseDate: '2001-03-16' },
  { id: 'training-day', title: 'Training Day', releaseDate: '2001-10-05' },
  { id: 'oceans-eleven', title: "Ocean's Eleven", releaseDate: '2001-12-07' },
  { id: 'monsters-inc', title: 'Monsters, Inc.', releaseDate: '2001-11-02' },
  { id: 'the-fellowship-of-the-ring', title: 'The Lord of the Rings: The Fellowship of the Ring', releaseDate: '2001-12-19' },
  { id: 'catch-me-if-you-can', title: 'Catch Me If You Can', releaseDate: '2002-12-25' },
  { id: 'gangs-of-new-york', title: 'Gangs of New York', releaseDate: '2002-12-20' },
  { id: 'the-two-towers', title: 'The Lord of the Rings: The Two Towers', releaseDate: '2002-12-18' },
  { id: 'the-return-of-the-king', title: 'The Lord of the Rings: The Return of the King', releaseDate: '2003-12-17' },
  { id: 'the-matrix-reloaded', title: 'The Matrix Reloaded', releaseDate: '2003-05-15' },
  { id: 'the-matrix-revolutions', title: 'The Matrix Revolutions', releaseDate: '2003-11-05' },
  { id: 'the-aviator', title: 'The Aviator', releaseDate: '2004-12-25' },
  { id: 'eternal-sunshine-of-the-spotless-mind', title: 'Eternal Sunshine of the Spotless Mind', releaseDate: '2004-03-19' },
  { id: 'collateral', title: 'Collateral', releaseDate: '2004-08-06' },
  { id: 'batman-begins', title: 'Batman Begins', releaseDate: '2005-06-15' },
  { id: 'the-departed', title: 'The Departed', releaseDate: '2006-10-06' },
  { id: 'the-prestige', title: 'The Prestige', releaseDate: '2006-10-20' },
  { id: 'inside-man', title: 'Inside Man', releaseDate: '2006-03-24' },
  { id: 'no-country-for-old-men', title: 'No Country for Old Men', releaseDate: '2007-11-09' },
  { id: 'there-will-be-blood', title: 'There Will Be Blood', releaseDate: '2007-12-26' },
  { id: 'american-gangster', title: 'American Gangster', releaseDate: '2007-11-02' },
  { id: 'zodiac', title: 'Zodiac', releaseDate: '2007-03-02' },
  { id: 'the-dark-knight', title: 'The Dark Knight', releaseDate: '2008-07-18' },
  { id: 'iron-man', title: 'Iron Man', releaseDate: '2008-05-02' },
  { id: 'inglourious-basterds', title: 'Inglourious Basterds', releaseDate: '2009-08-21' },

  // ── 2010s ──────────────────────────────────────────────────────────────
  { id: 'inception', title: 'Inception', releaseDate: '2010-07-16' },
  { id: 'the-social-network', title: 'The Social Network', releaseDate: '2010-10-01' },
  { id: 'toy-story-3', title: 'Toy Story 3', releaseDate: '2010-06-18' },
  { id: 'shutter-island', title: 'Shutter Island', releaseDate: '2010-02-19' },
  { id: 'the-fighter', title: 'The Fighter', releaseDate: '2010-12-10' },
  { id: 'moneyball', title: 'Moneyball', releaseDate: '2011-09-23' },
  { id: 'the-dark-knight-rises', title: 'The Dark Knight Rises', releaseDate: '2012-07-20' },
  { id: 'django-unchained', title: 'Django Unchained', releaseDate: '2012-12-25' },
  { id: 'lincoln', title: 'Lincoln', releaseDate: '2012-11-09' },
  { id: 'the-wolf-of-wall-street', title: 'The Wolf of Wall Street', releaseDate: '2013-12-25' },
  { id: 'american-hustle', title: 'American Hustle', releaseDate: '2013-12-13' },
  { id: 'prisoners', title: 'Prisoners', releaseDate: '2013-09-20' },
  { id: 'interstellar', title: 'Interstellar', releaseDate: '2014-11-05' },
  { id: 'the-martian', title: 'The Martian', releaseDate: '2015-10-02' },
  { id: 'sicario', title: 'Sicario', releaseDate: '2015-10-02' },
  { id: 'the-big-short', title: 'The Big Short', releaseDate: '2015-12-11' },
  { id: 'arrival', title: 'Arrival', releaseDate: '2016-11-11' },
  { id: 'dunkirk', title: 'Dunkirk', releaseDate: '2017-07-21' },
  { id: 'blade-runner-2049', title: 'Blade Runner 2049', releaseDate: '2017-10-06' },
  { id: 'mission-impossible-fallout', title: 'Mission: Impossible - Fallout', releaseDate: '2018-07-27' },
  // Parasite: Cannes / Korea May 2019; US theatrical is the resolver.
  { id: 'parasite', title: 'Parasite', releaseDate: '2019-10-11' },
  { id: 'joker', title: 'Joker', releaseDate: '2019-10-04' },
  { id: 'once-upon-a-time-in-hollywood', title: 'Once Upon a Time in Hollywood', releaseDate: '2019-07-26' },
  { id: 'ford-v-ferrari', title: 'Ford v Ferrari', releaseDate: '2019-11-15' },
  // The Irishman: brief US theatrical run before its Netflix bow.
  { id: 'the-irishman', title: 'The Irishman', releaseDate: '2019-11-01' },

  // ── 2020s ──────────────────────────────────────────────────────────────
  { id: 'tenet', title: 'Tenet', releaseDate: '2020-09-03' },
  { id: 'a-quiet-place-part-ii', title: 'A Quiet Place Part II', releaseDate: '2021-05-28' },
  { id: 'no-time-to-die', title: 'No Time to Die', releaseDate: '2021-10-08' },
  // Dune: Venice Sept 2021; US theatrical + HBO Max day-and-date is the resolver.
  { id: 'dune', title: 'Dune', releaseDate: '2021-10-22' },
  { id: 'encanto', title: 'Encanto', releaseDate: '2021-11-24' },
  { id: 'west-side-story', title: 'West Side Story', releaseDate: '2021-12-10' },
  { id: 'spider-man-no-way-home', title: 'Spider-Man: No Way Home', releaseDate: '2021-12-17' },
  { id: 'the-batman', title: 'The Batman', releaseDate: '2022-03-04' },
  // EEAAO: limited US opening 2022-03-25 (wide April 2022).
  { id: 'everything-everywhere-all-at-once', title: 'Everything Everywhere All at Once', releaseDate: '2022-03-25' },
  { id: 'top-gun-maverick', title: 'Top Gun: Maverick', releaseDate: '2022-05-27' },
  { id: 'elvis', title: 'Elvis', releaseDate: '2022-06-24' },
  { id: 'nope', title: 'Nope', releaseDate: '2022-07-22' },
  { id: 'avatar-the-way-of-water', title: 'Avatar: The Way of Water', releaseDate: '2022-12-16' },
  { id: 'john-wick-chapter-4', title: 'John Wick: Chapter 4', releaseDate: '2023-03-24' },
  { id: 'the-super-mario-bros-movie', title: 'The Super Mario Bros. Movie', releaseDate: '2023-04-05' },
  // Barbie and Oppenheimer shared 2023-07-21 (the "Barbenheimer" pair).
  { id: 'oppenheimer', title: 'Oppenheimer', releaseDate: '2023-07-21' },
  { id: 'barbie', title: 'Barbie', releaseDate: '2023-07-21' },
  { id: 'killers-of-the-flower-moon', title: 'Killers of the Flower Moon', releaseDate: '2023-10-20' },
  { id: 'wonka', title: 'Wonka', releaseDate: '2023-12-15' },
  { id: 'dune-part-two', title: 'Dune: Part Two', releaseDate: '2024-03-01' },
  { id: 'inside-out-2', title: 'Inside Out 2', releaseDate: '2024-06-14' },
  { id: 'deadpool-and-wolverine', title: 'Deadpool & Wolverine', releaseDate: '2024-07-26' },
  // Wicked and Gladiator II shared 2024-11-22 (the "Glicked" weekend).
  { id: 'wicked', title: 'Wicked', releaseDate: '2024-11-22' },
  { id: 'gladiator-ii', title: 'Gladiator II', releaseDate: '2024-11-22' },
  { id: 'a-minecraft-movie', title: 'A Minecraft Movie', releaseDate: '2025-04-04' },
]
