// scripts/tmdb-probe.ts — one-shot credential + connectivity check.
//
//   npm run tmdb:probe
//
// Looks up a film we know cold (Goodfellas, 1990) and prints what TMDB says.
// If this prints Scorsese, the key works and the audit can run; if it exits
// with a 401, the token in .env.local is wrong or missing.

import { assertCredentials, searchMovie, movieWithCredits } from './tmdb.ts'

assertCredentials()

const hit = await searchMovie('Goodfellas', 1990)
if (!hit) {
  console.error('search returned nothing — key may be valid but something is off')
  process.exit(1)
}

const movie = await movieWithCredits(hit.id)
const directors = movie.credits.crew.filter((c) => c.job === 'Director').map((c) => c.name)
const top5 = movie.credits.cast.slice(0, 5).map((c) => c.name)

console.log('TMDB is talking to us. proof of life:')
console.log(`  title:     ${movie.title} (${movie.release_date.slice(0, 4)})`)
console.log(`  director:  ${directors.join(', ')}`)
console.log(`  top cast:  ${top5.join(', ')}`)
console.log(`  genres:    ${movie.genres.map((g) => g.name).join(', ')}`)
console.log('\ncredentials good — npm run tmdb:audit is ready to use.')
