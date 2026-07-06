# Connections yield & cluster shopping list

Emitted by `npm run gen:connections` (sim/connections-gen.ts) on the credited pool. Re-run per wave — the ambiguity gate must hold on every pool bump (PLAN.md WS2).

  pool: 237 credited films (src/data/movies.ts)

## Key census (formation pools)

  director: 25 group-ready (≥4 films) · 6 at exactly 3
    ready: Alfred Hitchcock (4) · Brian De Palma (4) · Chris Columbus (4) · Christopher Nolan (9) · David Fincher (6) · Denis Villeneuve (5) · Ethan Coen (4) · Francis Ford Coppola (4) · James Cameron (4) · Joel Coen (4) · Lana Wachowski (5) · Lilly Wachowski (4) · Martin Scorsese (10) · Michael Mann (4) · Paul Thomas Anderson (4) · Pete Docter (4) · Peter Jackson (4) · Peter Weir (4) · Quentin Tarantino (9) · Ridley Scott (5) · Stanley Kubrick (4) · Steven Soderbergh (4) · Steven Spielberg (9) · Tony Scott (4) · Wes Anderson (4)
  actor: 100 group-ready (≥4 films) · 44 at exactly 3
    ready: Al Pacino (10) · Amy Adams (4) · Andy García (5) · Andy Serkis (5) · Anne Hathaway (4) · Barry Pepper (4) · Bill Murray (4) · Bill Paxton (6) · Brad Pitt (11) · Bruce Willis (7) · Cameron Diaz (4) · Carrie Fisher (6) · Carrie-Anne Moss (5) · Casey Affleck (6) · Cate Blanchett (4) · Chiwetel Ejiofor (4) · Christian Bale (8) · Christopher Plummer (6) · Cillian Murphy (4) · Daniel Day-Lewis (4) · Denzel Washington (6) · Diane Keaton (4) · Don Cheadle (5) · Edward Norton (6) · Elijah Wood (5) · Emily Blunt (6) · Emma Stone (5) · Gary Oldman (5) · Gene Hackman (4) · George Clooney (4) · Gwyneth Paltrow (4) · Harrison Ford (11) · Harvey Keitel (6) · Hugo Weaving (8) · Ian Holm (7) · Ian McKellen (4) · Jack Nicholson (6) · Jada Pinkett Smith (4) · Jake Gyllenhaal (4) · James Earl Jones (5) · Jamie Foxx (5) · Jeremy Renner (6) · Jessica Chastain (4) · Jim Carrey (4) · Jodie Foster (4) · Joe Pesci (5) · John C. Reilly (7) · John Rhys-Davies (4) · Jon Voight (4) · Jonah Hill (4) · Joseph Gordon-Levitt (4) · Josh Brolin (6) · Julia Roberts (4) · Julianne Moore (5) · Kate Winslet (4) · Keanu Reeves (5) · Kevin Bacon (4) · Laurence Fishburne (6) · Leonardo DiCaprio (11) · Liam Neeson (4) · Liv Tyler (4) · Margot Robbie (4) · Mark Hamill (5) · Mark Ruffalo (6) · Mark Wahlberg (4) · Matt Damon (13) · Meg Ryan (4) · Michael Caine (6) · Michael Keaton (5) · Michael Madsen (4) · Morgan Freeman (8) · Orlando Bloom (4) · Owen Wilson (4) · Paul Dano (4) · Philip Seymour Hoffman (4) · Robert De Niro (11) · Robert Downey Jr. (4) · Robert Duvall (4) · Robin Williams (4) · Robin Wright (4) · Russell Crowe (5) · Ryan Gosling (7) · Samuel L. Jackson (10) · Sean Astin (4) · Steve Buscemi (6) · Steve Carell (4) · Talia Shire (4) · Tim Allen (4) · Tom Cruise (13) · Tom Hanks (13) · Tom Hardy (5) · Tommy Lee Jones (4) · Uma Thurman (4) · Val Kilmer (4) · Viggo Mortensen (7) · Ving Rhames (6) · Wallace Shawn (5) · Will Ferrell (4) · Will Smith (4) · Willem Dafoe (5)
  series: 4 group-ready (≥4 films) · 3 at exactly 3
    ready: matrix (4) · mission-impossible (5) · star-wars (5) · toy-story (4)
  genre: 12 group-ready (≥4 films) · 0 at exactly 3
    ready: Action (22) · Adventure (17) · Animation (16) · Comedy (22) · Crime (29) · Drama (43) · Horror (6) · Romance (10) · Sci-Fi (32) · Thriller (27) · War (7) · Western (6)

## Yield

  viable key-quadruples (≥1 unambiguous grid): 9862379 of 15777195 candidate key-sets
  distinct film-level grids across them: 8,459,156,797,965,653,001
  (a "distinct puzzle" in the meaningful sense = a key-quadruple; film-level
   variety within one quadruple mostly reshuffles genre filler)
  category mixes (d/a/s/g per key-set): aaad×2644194 · aaaa×2494553 · aadd×1049299 · aaag×1017824 · aadg×785392 · aaas×441937 · aads×351980 · addg×202637 · addd×184679 · aagg×166451 · aags×136612 · adds×93361 · adgg×84628 · adgs×70705 · aass×22505 · dddg×17455 · aggs×15353 · aggg×13608 · dddd×12145 · adss×11934 · ddgg×10824 · ddgs×9187 · ddds×8238 · agss×4743 · dggs×3948 · dggg×3465 · ddss×1580 · dgss×1232 · gggs×660 · gggg×495 · asss×345 · ggss×280 · dsss×91 · gsss×38 · ssss×1

## Accidental-group diagnostic (NOT gating — proposed WS4 check)

  (diagnostic sampled 20,000 of 9,862,379 viable key-sets — rates, not totals)
  first sampled grid per checked key-set: 16910/20000 contain a coherent
  4-set spanning groups (an alternative solution the puzzle would call wrong)
  most frequent: genre:Crime ×5193 · genre:Sci-Fi ×4712 · genre:Drama ×3243 · genre:Comedy ×2103 · genre:Thriller ×1806 · genre:Action ×1630
  STRICT yield (≥1 accidental-free grid within 8 seeded tries):
  6175/20000 checked key-sets ≈ 3,045,010 of 9,862,379 extrapolated — lower bound; the dealer retries up to 16

## Demo deal (seed "2026-07-04")

  [director] David Fincher: Gone Girl · Panic Room · The Social Network · Zodiac
  [actor] Emma Stone: Crazy, Stupid, Love. · La La Land · Superbad · The Help
  [actor] George Clooney: Fantastic Mr. Fox · Ocean's Eleven · Ocean's Thirteen · Ocean's Twelve
  [actor] Hugo Weaving: The Fellowship of the Ring · The Matrix Reloaded · The Matrix Revolutions · The Return of the King
  accidental-free ✓
  determinism: same seed re-dealt identically ✓

## Cluster shopping list (one film short of a group of 4)

  unlock counts use a best-case phantom 4th film (only the missing credit);
  a real pick can land lower if its genre/co-stars collide. Human pass decides.

  +335197 key-sets · director Robert Zemeckis — has: Forrest Gump · Cast Away · Back to the Future
  +333456 key-sets · actor    Clint Eastwood — has: Unforgiven · Million Dollar Baby · The Good, the Bad and the Ugly
  +331599 key-sets · actor    Drew Barrymore — has: E.T. the Extra-Terrestrial · Scream · Donnie Darko
  +324155 key-sets · actor    Michael Biehn — has: Tombstone · Aliens · The Terminator
  +323308 key-sets · actor    Simon Pegg — has: Mission: Impossible — Fallout · Mission: Impossible — Ghost Protocol · Mission: Impossible — Rogue Nation
  +319320 key-sets · actor    Mary Steenburgen — has: Philadelphia · Step Brothers · Elf
  +318637 key-sets · actor    J.K. Simmons — has: La La Land · Spider-Man · Whiplash
  +316555 key-sets · actor    Sigourney Weaver — has: Alien · Aliens · WALL-E
  +315056 key-sets · actor    Seth Rogen — has: Superbad · Steve Jobs · Donnie Darko
  +315049 key-sets · director Clint Eastwood — has: Unforgiven · Mystic River · Million Dollar Baby
  +314973 key-sets · actor    Ethan Hawke — has: Training Day · Dead Poets Society · Gattaca
  +314112 key-sets · actor    Joaquin Phoenix — has: Gladiator · Joker · Hotel Rwanda
  +312966 key-sets · actor    John Ratzenberger — has: Toy Story · Toy Story 3 · WALL-E
  +311705 key-sets · actor    Michael Fassbender — has: Inglourious Basterds · 12 Years a Slave · Steve Jobs
  +308112 key-sets · actor    Richard Harris — has: Gladiator · Unforgiven · Harry Potter and the Sorcerer's Stone
  +305734 key-sets · actor    Joan Cusack — has: Toy Story 2 · Toy Story 3 · Toy Story 4
  +303551 key-sets · series   godfather — has: The Godfather · The Godfather Part II · The Godfather Part III
  +303245 key-sets · actor    Rebecca Ferguson — has: Mission: Impossible — Fallout · Dune · Mission: Impossible — Rogue Nation
  +303069 key-sets · actor    Daryl Hannah — has: Blade Runner · Kill Bill: Vol. 1 · Kill Bill: Vol. 2
  +302753 key-sets · director Adam McKay — has: The Big Short · Anchorman: The Legend of Ron Burgundy · Step Brothers
  +302507 key-sets · actor    Ed Harris — has: Apollo 13 · The Truman Show · A Beautiful Mind
  +302167 key-sets · actor    Frank Oz — has: The Empire Strikes Back · Return of the Jedi · Knives Out
  +301890 key-sets · actor    Oscar Isaac — has: The Force Awakens · Dune · Star Wars: The Last Jedi
  +300812 key-sets · actor    Billy Crystal — has: Monsters, Inc. · The Princess Bride · When Harry Met Sally...
  +298936 key-sets · actor    Regina King — has: Ray · Enemy of the State · Jerry Maguire
  +298674 key-sets · actor    David Morse — has: The Green Mile · The Hurt Locker · 12 Monkeys
  +296385 key-sets · director Rob Reiner — has: A Few Good Men · The Princess Bride · When Harry Met Sally...
  +296219 key-sets · actor    Domhnall Gleeson — has: The Force Awakens · The Revenant · Star Wars: The Last Jedi
  +296039 key-sets · actor    Kirsten Dunst — has: Eternal Sunshine of the Spotless Mind · Jumanji · Spider-Man
  +295225 key-sets · actor    Tim Robbins — has: The Shawshank Redemption · Top Gun · Mystic River
  +295124 key-sets · actor    Don Rickles — has: Casino · Toy Story · Toy Story 2
  +294449 key-sets · actor    Billy Dee Williams — has: The Empire Strikes Back · Return of the Jedi · Batman
  +294031 key-sets · director Brad Bird — has: Mission: Impossible — Ghost Protocol · The Incredibles · Ratatouille
  +291414 key-sets · actor    Sally Field — has: Forrest Gump · Lincoln · Mrs. Doubtfire
  +291122 key-sets · actor    Cuba Gooding Jr. — has: American Gangster · A Few Good Men · Jerry Maguire
  +289877 key-sets · actor    Jared Leto — has: Fight Club · Blade Runner 2049 · Panic Room
  +287264 key-sets · actor    Tim Roth — has: Pulp Fiction · Reservoir Dogs · The Hateful Eight
  +287143 key-sets · actor    Ben Affleck — has: Good Will Hunting · Armageddon · Gone Girl
  +285705 key-sets · actor    Jeff Daniels — has: The Martian · Looper · Steve Jobs
  +284667 key-sets · actor    Paul Giamatti — has: Saving Private Ryan · The Truman Show · 12 Years a Slave
  +282922 key-sets · director Rian Johnson — has: Looper · Knives Out · Star Wars: The Last Jedi
  +282161 key-sets · actor    Kurt Russell — has: Once Upon a Time in Hollywood · Tombstone · The Hateful Eight
  +281888 key-sets · series   dark-knight — has: The Dark Knight · Batman Begins · The Dark Knight Rises
  +280793 key-sets · actor    Ralph Fiennes — has: Schindler's List · The Grand Budapest Hotel · The Hurt Locker
  +279263 key-sets · actor    William H. Macy — has: Fargo · Boogie Nights · Magnolia
  +273027 key-sets · actor    Javier Bardem — has: No Country for Old Men · Collateral · Dune
  +270239 key-sets · actor    Joe Pantoliano — has: Memento · The Matrix · The Fugitive
  +267603 key-sets · series   lotr — has: The Fellowship of the Ring · The Two Towers · The Return of the King
  +264792 key-sets · actor    Jeff Bridges — has: The Big Lebowski · Iron Man · True Grit
  +261800 key-sets · actor    Alec Baldwin — has: The Departed · The Aviator · Mission: Impossible — Rogue Nation
  +260253 key-sets · actor    Martin Sheen — has: The Departed · Catch Me If You Can · Apocalypse Now
  +260166 key-sets · actor    Jude Law — has: The Grand Budapest Hotel · Contagion · Gattaca
  +242252 key-sets · actor    Marion Cotillard — has: Inception · The Dark Knight Rises · Contagion

