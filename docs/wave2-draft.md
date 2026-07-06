# Wave 2 draft — 74 films, 163 → 237 (MERGED 2026-07-05 — historical)

**Status: ✅ MERGED 2026-07-05** after the wave-1 protocol (tmdb:audit +
job-level writer check + web verification → Buri arbitrated: David Webb
Peoples normalization ×2, six convention keeps → append-only merge → gates
all green, tune byte-identical → yield 9.86M key-sets / ≈3.05M strict).
Diff report: docs/wave2-diffs.md. Original draft header follows. Credits below are model memory; billing orders and
writer credits follow the conventions locked 2026-07-05 (screenplay-only, no
story/adaptation-by credits · recognizability-first topCast with real billing
errors fixed · voice performances count · primary director only).

Driven by the post-wave-1 shopping list (docs/connections-yield.md) + the 12
known seeds from wave 1. Deep cuts tagged `[deep cut]` (7 ≈ 9%; wave total
stays under the 15% ceiling).

## Known-seed coverage (all 12 from the wave-1 handoff ✓)

Norton→Birdman · Uma→Gattaca · Docter→Soul · Kilmer→The Doors ·
Will Smith→Enemy of the State + I Am Legend · Eric Roth→Dune ·
Tony Scott→Enemy of the State + Crimson Tide · Peter Weir→Witness + Master and
Commander · Dafoe→Spider-Man · JCR→Chicago · Cheadle→Hotel Rwanda ·
Wahlberg→The Italian Job

## Chronology-pool id reuse (id-identity rule — 9 overlaps found)

`grease` · `the-terminator` · `back-to-the-future` · `aliens` · `rain-man` ·
`batman` · `when-harry-met-sally` · `parasite` · `dune` — all reused verbatim
below. (A Quiet Place Part II is in the chronology pool; Part I is not — new id.)

## Open judgment calls for the reviewer

- **Spirited Away voice cast**: drafted with the original Japanese cast (the
  credited performances). Zero link value either way; the English dub cast
  (Daveigh Chase etc.) would also be defensible. Or drop the film if neither
  feels right — it's a breadth pick.
- **Cruise density**: wave 2 takes Tom Cruise to ~11 films. The dealer's
  disjointness gate handles it, but Cruise will anchor a LOT of grids — watch
  grid variety in the yield report; trimming Rogue Nation or Edge of Tomorrow
  is the easy release valve.
- **2-film series ids**: `terminator` and `harry-potter` drafted (kill-bill
  precedent: harmless metadata). Alien+Aliens could get `alien` too but that
  means editing the merged wave-1 `alien` entry — flagged, not drafted.
- **Wallace Shawn in The Incredibles** (Gilbert Huph) — from memory, verify.
- **Remember the Titans writer = Gregory Allen Howard** — the same name whose
  *story-only* credit was excluded from Ali; here he holds the screenplay.
- **Wave-3 seeds this wave creates**: avengers series (Age of Ultron + Infinity
  War + Endgame complete a 4-series), Zemeckis (3), Eastwood-actor (3), McKay
  (3), Brad Bird (3), Regina King (3), Kevin Bacon (→4 via Crazy Stupid Love +
  Mystic River — verify), Chastain (→4 if The Martian credit holds), Diaz (→4
  if Gangs of New York credit holds), Guy Pearce (2), Travolta (2), Hoffman (1).

---

## Cluster 1 — Completion double-plays (8) — completes Soderbergh, Paltrow, Voight, Pepper, Madsen, Plummer→5, Crowe, Blanchett, Hathaway, Docter, Eric Roth

```ts
{
  id: 'contagion',
  title: 'Contagion',
  year: 2011,
  director: ['Steven Soderbergh'],
  writers: ['Scott Z. Burns'],
  topCast: ['Marion Cotillard', 'Matt Damon', 'Laurence Fishburne', 'Jude Law', 'Gwyneth Paltrow'],
  deepCast: ['Kate Winslet', 'Jennifer Ehle', 'Bryan Cranston'],
  posterColor: '#3d3158',
  genre: 'Thriller', // billing is alphabetical — verify top-5 slice
},
{
  id: 'enemy-of-the-state',
  title: 'Enemy of the State',
  year: 1998,
  director: ['Tony Scott'],
  writers: ['David Marconi'],
  topCast: ['Will Smith', 'Gene Hackman', 'Jon Voight', 'Lisa Bonet', 'Regina King'],
  deepCast: ['Barry Pepper', 'Jack Black', 'Seth Green', 'Gabriel Byrne'],
  posterColor: '#463a5e',
  genre: 'Thriller', // completes Voight AND Pepper; Tony Scott to 3
},
{
  id: 'the-hateful-eight',
  title: 'The Hateful Eight',
  year: 2015,
  director: ['Quentin Tarantino'],
  writers: ['Quentin Tarantino'],
  topCast: ['Samuel L. Jackson', 'Kurt Russell', 'Jennifer Jason Leigh', 'Walton Goggins', 'Demián Bichir'],
  deepCast: ['Tim Roth', 'Michael Madsen', 'Bruce Dern', 'Channing Tatum'],
  posterColor: '#7e431a',
  genre: 'Western', // Western to 6; completes Madsen; QT to 9
},
{
  id: 'knives-out',
  title: 'Knives Out',
  year: 2019,
  director: ['Rian Johnson'],
  writers: ['Rian Johnson'],
  topCast: ['Daniel Craig', 'Chris Evans', 'Ana de Armas', 'Jamie Lee Curtis', 'Michael Shannon'],
  deepCast: ['Don Johnson', 'Toni Collette', 'LaKeith Stanfield', 'Christopher Plummer', 'Frank Oz'],
  posterColor: '#41365a',
  genre: 'Thriller', // Frank Oz on-screen (the lawyer) — his 3rd credit with ESB/RotJ voice work
},
{
  id: 'a-beautiful-mind',
  title: 'A Beautiful Mind',
  year: 2001,
  director: ['Ron Howard'],
  writers: ['Akiva Goldsman'],
  topCast: ['Russell Crowe', 'Ed Harris', 'Jennifer Connelly', 'Christopher Plummer'],
  deepCast: ['Paul Bettany', 'Adam Goldberg', 'Josh Lucas'],
  posterColor: '#6b4a23',
  genre: 'Drama', // completes Crowe; Ed Harris to 3 (Apollo 13 · Truman Show)
},
{
  id: 'oceans-8',
  title: "Ocean's 8",
  year: 2018,
  director: ['Gary Ross'],
  writers: ['Gary Ross', 'Olivia Milch'],
  topCast: ['Sandra Bullock', 'Cate Blanchett', 'Anne Hathaway', 'Mindy Kaling', 'Sarah Paulson'],
  deepCast: ['Rihanna', 'Helena Bonham Carter', 'Awkwafina', 'James Corden'],
  posterColor: '#6b2020',
  genre: 'Crime', // completes Blanchett AND Hathaway; no series id (pool convention)
},
{
  id: 'soul',
  title: 'Soul',
  year: 2020,
  director: ['Pete Docter'], // Kemp Powers co-director — primary-director convention
  writers: ['Pete Docter', 'Mike Jones', 'Kemp Powers'],
  topCast: ['Jamie Foxx', 'Tina Fey', 'Phylicia Rashad', 'Daveed Diggs'],
  deepCast: ['Angela Bassett', 'Graham Norton'],
  posterColor: '#2b6cb0',
  genre: 'Animation', // completes Docter; Foxx to 5
},
{
  id: 'dune',
  title: 'Dune',
  year: 2021,
  director: ['Denis Villeneuve'],
  writers: ['Jon Spaihts', 'Denis Villeneuve', 'Eric Roth'],
  topCast: ['Timothée Chalamet', 'Rebecca Ferguson', 'Oscar Isaac', 'Josh Brolin', 'Zendaya'], // ⚠ verify slice — big alphabetical block
  deepCast: ['Javier Bardem', 'Jason Momoa', 'Stellan Skarsgård', 'Dave Bautista', 'Charlotte Rampling'],
  posterColor: '#20305f',
  genre: 'Sci-Fi', // completes Eric Roth (writer); Villeneuve to 5; Brolin to 6
},
```

## Cluster 2 — User-locked seeds (4) — completes Norton, Uma, Kilmer; Will Smith to 3

```ts
{
  id: 'birdman',
  title: 'Birdman',
  year: 2014,
  director: ['Alejandro G. Iñárritu'],
  writers: ['Alejandro G. Iñárritu', 'Nicolás Giacobone', 'Alexander Dinelaris Jr.', 'Armando Bo'],
  topCast: ['Michael Keaton', 'Zach Galifianakis', 'Edward Norton', 'Andrea Riseborough', 'Amy Ryan'],
  deepCast: ['Emma Stone', 'Naomi Watts'],
  posterColor: '#257068',
  genre: 'Comedy', // completes Norton; Keaton to 3 (Toy Story 3 · Batman)
},
{
  id: 'gattaca',
  title: 'Gattaca', // [deep cut]
  year: 1997,
  director: ['Andrew Niccol'],
  writers: ['Andrew Niccol'],
  topCast: ['Ethan Hawke', 'Uma Thurman', 'Alan Arkin', 'Jude Law', 'Loren Dean'],
  deepCast: ['Ernest Borgnine', 'Tony Shalhoub'],
  posterColor: '#28336e',
  genre: 'Sci-Fi', // completes Uma; Law to 3 (Cloud Atlas deep · Contagion)
},
{
  id: 'the-doors',
  title: 'The Doors', // [deep cut]
  year: 1991,
  director: ['Oliver Stone'],
  writers: ['J. Randal Johnson', 'Oliver Stone'],
  topCast: ['Val Kilmer', 'Meg Ryan', 'Kevin Dillon', 'Kyle MacLachlan'],
  deepCast: ['Kathleen Quinlan', 'Billy Idol'],
  posterColor: '#715326',
  genre: 'Drama', // completes Kilmer; Meg Ryan to 2 (Top Gun deep)
},
{
  id: 'i-am-legend',
  title: 'I Am Legend',
  year: 2007,
  director: ['Francis Lawrence'],
  writers: ['Mark Protosevich', 'Akiva Goldsman'],
  topCast: ['Will Smith', 'Alice Braga', 'Charlie Tahan'],
  deepCast: ['Dash Mihok'],
  posterColor: '#182350',
  genre: 'Sci-Fi', // Will Smith: MIB · Ali · EotS · this = 4 ✓; Goldsman to 2
},
```

## Cluster 3 — Tony Scott + Peter Weir completions (3)

```ts
{
  id: 'crimson-tide',
  title: 'Crimson Tide',
  year: 1995,
  director: ['Tony Scott'],
  writers: ['Michael Schiffer'],
  topCast: ['Denzel Washington', 'Gene Hackman', 'George Dzundza', 'Viggo Mortensen', 'Matt Craven'],
  deepCast: ['James Gandolfini', 'Steve Zahn', 'Ryan Phillippe'],
  posterColor: '#1d2530',
  genre: 'Thriller', // completes Tony Scott (4); Denzel to 5; Hackman to 3; Viggo to 6
},
{
  id: 'witness',
  title: 'Witness', // [deep cut]
  year: 1985,
  director: ['Peter Weir'],
  writers: ['Earl W. Wallace', 'William Kelley'],
  topCast: ['Harrison Ford', 'Kelly McGillis', 'Josef Sommer', 'Lukas Haas'],
  deepCast: ['Viggo Mortensen', 'Danny Glover', 'Alexander Godunov'],
  posterColor: '#4a3960',
  genre: 'Thriller', // Weir to 3; McGillis to 2 (Top Gun); Ford to 9
},
{
  id: 'master-and-commander',
  title: 'Master and Commander: The Far Side of the World',
  year: 2003,
  director: ['Peter Weir'],
  writers: ['Peter Weir', 'John Collee'],
  topCast: ['Russell Crowe', 'Paul Bettany'],
  deepCast: ['Billy Boyd', 'James D\'Arcy'],
  posterColor: '#2a5a32',
  genre: 'Adventure', // completes Weir (4); Crowe to 5; Bettany to 2
},
```

## Cluster 4 — Actor completions (4) — completes JCR, Cheadle, Wahlberg, Dafoe

```ts
{
  id: 'chicago',
  title: 'Chicago',
  year: 2002,
  director: ['Rob Marshall'],
  writers: ['Bill Condon'],
  topCast: ['Renée Zellweger', 'Catherine Zeta-Jones', 'Richard Gere'],
  deepCast: ['Queen Latifah', 'John C. Reilly', 'Lucy Liu', 'Taye Diggs'],
  posterColor: '#66461f',
  genre: 'Drama', // completes John C. Reilly; Zeta-Jones to 2; Lucy Liu to 2
},
{
  id: 'hotel-rwanda',
  title: 'Hotel Rwanda',
  year: 2004,
  director: ['Terry George'],
  writers: ['Keir Pearson', 'Terry George'],
  topCast: ['Don Cheadle', 'Sophie Okonedo', 'Nick Nolte', 'Joaquin Phoenix'],
  posterColor: '#684724',
  genre: 'Drama', // completes Cheadle; Phoenix to 3 (Joker · Gladiator)
},
{
  id: 'the-italian-job',
  title: 'The Italian Job',
  year: 2003,
  director: ['F. Gary Gray'],
  writers: ['Donna Powers', 'Wayne Powers'],
  topCast: ['Mark Wahlberg', 'Charlize Theron', 'Edward Norton', 'Seth Green', 'Jason Statham'],
  deepCast: ['Mos Def', 'Donald Sutherland'],
  posterColor: '#26303c',
  genre: 'Action', // completes Wahlberg; Theron to 2 (Fury Road); Norton to 6
},
{
  id: 'spider-man',
  title: 'Spider-Man',
  year: 2002,
  director: ['Sam Raimi'],
  writers: ['David Koepp'],
  topCast: ['Tobey Maguire', 'Willem Dafoe', 'Kirsten Dunst', 'James Franco'],
  deepCast: ['J.K. Simmons', 'Cliff Robertson', 'Rosemary Harris'],
  posterColor: '#2c3642',
  genre: 'Action', // completes Dafoe; Dunst to 3 (Jumanji); Koepp writer x4 poison-net
},
```

## Cluster 5 — James Cameron (3) — completes Cameron (with Titanic), Paxton; NEW terminator series

```ts
{
  id: 'aliens',
  title: 'Aliens', // id reused from chronology-pool.json
  year: 1986,
  director: ['James Cameron'],
  writers: ['James Cameron'],
  topCast: ['Sigourney Weaver', 'Carrie Henn', 'Michael Biehn', 'Paul Reiser', 'Lance Henriksen'],
  deepCast: ['Bill Paxton', 'Jenette Goldstein'],
  posterColor: '#182350',
  genre: 'Sci-Fi', // Weaver to 2; Biehn to 2 (Tombstone deep); no series id — see judgment calls
},
{
  id: 'the-terminator',
  title: 'The Terminator', // id reused from chronology-pool.json
  year: 1984,
  director: ['James Cameron'],
  writers: ['James Cameron', 'Gale Anne Hurd'],
  topCast: ['Arnold Schwarzenegger', 'Michael Biehn', 'Linda Hamilton', 'Paul Winfield'],
  posterColor: '#1f2a5e',
  genre: 'Sci-Fi',
  series: 'terminator',
},
{
  id: 'terminator-2-judgment-day',
  title: 'Terminator 2: Judgment Day',
  year: 1991,
  director: ['James Cameron'],
  writers: ['James Cameron', 'William Wisher'],
  topCast: ['Arnold Schwarzenegger', 'Linda Hamilton', 'Edward Furlong', 'Robert Patrick'],
  deepCast: ['Joe Morton'],
  posterColor: '#242e3a',
  genre: 'Sci-Fi', // completes Cameron (4: Titanic · Aliens · T1 · T2); Furlong pairs with AHX
  series: 'terminator',
},
```

## Cluster 6 — Animation breadth (6) — Brad Bird to 3; completes James Earl Jones group (5)

```ts
{
  id: 'the-incredibles',
  title: 'The Incredibles',
  year: 2004,
  director: ['Brad Bird'],
  writers: ['Brad Bird'],
  topCast: ['Craig T. Nelson', 'Holly Hunter', 'Samuel L. Jackson', 'Jason Lee'],
  deepCast: ['Sarah Vowell', 'Spencer Fox', 'Wallace Shawn'], // ⚠ verify Shawn (Gilbert Huph)
  posterColor: '#2d70b6',
  genre: 'Animation', // SLJ to 8; Brad Bird to 2 (Ghost Protocol)
},
{
  id: 'ratatouille',
  title: 'Ratatouille',
  year: 2007,
  director: ['Brad Bird'],
  writers: ['Brad Bird'],
  topCast: ['Patton Oswalt', 'Ian Holm', 'Lou Romano', 'Janeane Garofalo'],
  deepCast: ['Peter O\'Toole', 'Brian Dennehy', 'Brad Garrett'],
  posterColor: '#2e6fb4',
  genre: 'Animation', // Brad Bird to 3 (wave-3 seed); Ian Holm to 6
},
{
  id: 'shrek',
  title: 'Shrek',
  year: 2001,
  director: ['Andrew Adamson', 'Vicky Jenson'],
  writers: ['Ted Elliott', 'Terry Rossio', 'Joe Stillman', 'Roger S.H. Schulman'],
  topCast: ['Mike Myers', 'Eddie Murphy', 'Cameron Diaz', 'John Lithgow'],
  posterColor: '#306038',
  genre: 'Animation', // Diaz to 3; Elliott+Rossio writer pair with Pirates
},
{
  id: 'wall-e',
  title: 'WALL-E',
  year: 2008,
  director: ['Andrew Stanton'],
  writers: ['Andrew Stanton', 'Jim Reardon'],
  topCast: ['Ben Burtt', 'Elissa Knight', 'Jeff Garlin'],
  deepCast: ['Sigourney Weaver', 'John Ratzenberger', 'Fred Willard', 'Kathy Najimy'],
  posterColor: '#3378be',
  genre: 'Animation', // Stanton directs 2 (Nemo); Weaver to 3
},
{
  id: 'the-lion-king',
  title: 'The Lion King',
  year: 1994,
  director: ['Roger Allers', 'Rob Minkoff'],
  writers: ['Irene Mecchi', 'Jonathan Roberts', 'Linda Woolverton'],
  topCast: ['Matthew Broderick', 'James Earl Jones', 'Jeremy Irons', 'Moira Kelly', 'Nathan Lane'],
  deepCast: ['Whoopi Goldberg', 'Rowan Atkinson'],
  posterColor: '#2f74ba',
  genre: 'Animation', // JEJ to 5 — the group (Strangelove + 3 Star Wars) becomes dealable
},
{
  id: 'spirited-away',
  title: 'Spirited Away',
  year: 2001,
  director: ['Hayao Miyazaki'],
  writers: ['Hayao Miyazaki'],
  topCast: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki'], // see judgment calls — JP voice cast
  posterColor: '#2b6cb0',
  genre: 'Animation', // intl breadth (funpass lever 2.5 — mechanically neutral)
},
```

## Cluster 7 — Classic-era anchors (2) — Chronology-future depth

```ts
{
  id: 'casablanca',
  title: 'Casablanca',
  year: 1942,
  director: ['Michael Curtiz'],
  writers: ['Julius J. Epstein', 'Philip G. Epstein', 'Howard Koch'],
  topCast: ['Humphrey Bogart', 'Ingrid Bergman', 'Paul Henreid'],
  deepCast: ['Claude Rains', 'Peter Lorre', 'Sydney Greenstreet'],
  posterColor: '#8c3e58',
  genre: 'Romance', // first pre-1950 film in the credited pool
},
{
  id: 'the-wizard-of-oz',
  title: 'The Wizard of Oz',
  year: 1939,
  director: ['Victor Fleming'],
  writers: ['Noel Langley', 'Florence Ryerson', 'Edgar Allan Woolf'],
  topCast: ['Judy Garland', 'Frank Morgan', 'Ray Bolger', 'Bert Lahr', 'Jack Haley'],
  deepCast: ['Margaret Hamilton'],
  posterColor: '#2f5e30',
  genre: 'Adventure',
},
```

## Cluster 8 — Zemeckis + 90s/00s anchors (8) — completes Bacon, Emma Stone; Eastwood + Zemeckis to 3

```ts
{
  id: 'cast-away',
  title: 'Cast Away',
  year: 2000,
  director: ['Robert Zemeckis'],
  writers: ['William Broyles Jr.'],
  topCast: ['Tom Hanks', 'Helen Hunt'],
  deepCast: ['Nick Searcy'],
  posterColor: '#6f4f24',
  genre: 'Drama', // Hanks to 10; Zemeckis to 2 (Forrest Gump)
},
{
  id: 'back-to-the-future',
  title: 'Back to the Future', // id reused from chronology-pool.json
  year: 1985,
  director: ['Robert Zemeckis'],
  writers: ['Robert Zemeckis', 'Bob Gale'],
  topCast: ['Michael J. Fox', 'Christopher Lloyd', 'Lea Thompson', 'Crispin Glover'],
  deepCast: ['Thomas F. Wilson'],
  posterColor: '#2f3d78',
  genre: 'Sci-Fi', // Zemeckis to 3 (wave-3 seed); Lloyd to 2 (Cuckoo's Nest deep)
},
{
  id: 'the-bourne-identity',
  title: 'The Bourne Identity',
  year: 2002,
  director: ['Doug Liman'],
  writers: ['Tony Gilroy', 'W. Blake Herron'],
  topCast: ['Matt Damon', 'Franka Potente', 'Chris Cooper', 'Clive Owen'],
  deepCast: ['Brian Cox', 'Julia Stiles'],
  posterColor: '#28323e',
  genre: 'Action', // Damon to 10; Liman pairs with Edge of Tomorrow
},
{
  id: 'gone-girl',
  title: 'Gone Girl',
  year: 2014,
  director: ['David Fincher'],
  writers: ['Gillian Flynn'],
  topCast: ['Ben Affleck', 'Rosamund Pike', 'Neil Patrick Harris', 'Tyler Perry'],
  deepCast: ['Carrie Coon', 'Kim Dickens'],
  posterColor: '#36304a',
  genre: 'Thriller', // Fincher to 6; Affleck to 2; NPH to 2 (Resurrections deep)
},
{
  id: 'whiplash',
  title: 'Whiplash',
  year: 2014,
  director: ['Damien Chazelle'],
  writers: ['Damien Chazelle'],
  topCast: ['Miles Teller', 'J.K. Simmons'],
  deepCast: ['Paul Reiser', 'Melissa Benoist'],
  posterColor: '#5e421f',
  genre: 'Drama', // Chazelle to 2; Simmons to 3 (La La deep · Spider-Man)
},
{
  id: 'crazy-stupid-love',
  title: 'Crazy, Stupid, Love.',
  year: 2011,
  director: ['Glenn Ficarra', 'John Requa'],
  writers: ['Dan Fogelman'],
  topCast: ['Steve Carell', 'Ryan Gosling', 'Julianne Moore', 'Emma Stone'],
  deepCast: ['Marisa Tomei', 'Kevin Bacon', 'Analeigh Tipton'],
  posterColor: '#1f6868',
  genre: 'Comedy', // completes Emma Stone (4); Gosling to 5; Moore to 5
},
{
  id: 'mystic-river',
  title: 'Mystic River',
  year: 2003,
  director: ['Clint Eastwood'],
  writers: ['Brian Helgeland'],
  topCast: ['Sean Penn', 'Tim Robbins', 'Kevin Bacon', 'Laurence Fishburne'],
  deepCast: ['Marcia Gay Harden', 'Laura Linney'],
  posterColor: '#7a1f1f',
  genre: 'Crime', // completes Bacon (AFGM · Apollo 13 · CSL); Fishburne to 6; Penn to 2
},
{
  id: 'million-dollar-baby',
  title: 'Million Dollar Baby',
  year: 2004,
  director: ['Clint Eastwood'],
  writers: ['Paul Haggis'],
  topCast: ['Clint Eastwood', 'Hilary Swank', 'Morgan Freeman'],
  posterColor: '#7b5a28',
  genre: 'Drama', // Eastwood directs 3 (Unforgiven · Mystic River) — wave-3 seed; Freeman to 7
},
```

## Cluster 9 — Romance depth (4) — family 4 → 9; Julia Roberts + Meg Ryan hubs

```ts
{
  id: 'when-harry-met-sally',
  title: 'When Harry Met Sally...', // id reused from chronology-pool.json
  year: 1989,
  director: ['Rob Reiner'],
  writers: ['Nora Ephron'],
  topCast: ['Billy Crystal', 'Meg Ryan', 'Carrie Fisher', 'Bruno Kirby'],
  posterColor: '#8f4260',
  genre: 'Romance', // Carrie Fisher to 5(!); Crystal to 2 (Princess Bride deep); Reiner directs 2
},
{
  id: 'sleepless-in-seattle',
  title: 'Sleepless in Seattle',
  year: 1993,
  director: ['Nora Ephron'],
  writers: ['Nora Ephron', 'David S. Ward', 'Jeff Arch'],
  topCast: ['Tom Hanks', 'Meg Ryan', 'Bill Pullman'],
  deepCast: ['Rosie O\'Donnell', 'Rob Reiner', 'Victor Garber'],
  posterColor: '#8c3e58',
  genre: 'Romance', // Hanks to 11; Ryan to 3 (Ephron writes 2 — poison-net texture)
},
{
  id: 'notting-hill',
  title: 'Notting Hill',
  year: 1999,
  director: ['Roger Michell'],
  writers: ['Richard Curtis'],
  topCast: ['Julia Roberts', 'Hugh Grant', 'Rhys Ifans'],
  posterColor: '#8f4260',
  genre: 'Romance', // Roberts to 2; Grant to 2 (Cloud Atlas deep)
},
{
  id: 'pretty-woman',
  title: 'Pretty Woman',
  year: 1990,
  director: ['Garry Marshall'],
  writers: ['J.F. Lawton'],
  topCast: ['Richard Gere', 'Julia Roberts', 'Ralph Bellamy', 'Jason Alexander'],
  deepCast: ['Héctor Elizondo', 'Laura San Giacomo'],
  posterColor: '#8c3e58',
  genre: 'Romance', // Roberts to 3 (wave-3 seed: Erin Brockovich); Gere to 2 (Chicago)
},
```

## Cluster 10 — Horror depth (2) — family 4 → 6; Blunt to 6

```ts
{
  id: 'a-quiet-place',
  title: 'A Quiet Place',
  year: 2018,
  director: ['John Krasinski'],
  writers: ['Bryan Woods', 'Scott Beck', 'John Krasinski'],
  topCast: ['Emily Blunt', 'John Krasinski', 'Millicent Simmonds', 'Noah Jupe'],
  posterColor: '#331025',
  genre: 'Horror', // Part II already in chronology pool — series option later
},
{
  id: 'scream',
  title: 'Scream',
  year: 1996,
  director: ['Wes Craven'],
  writers: ['Kevin Williamson'],
  topCast: ['David Arquette', 'Neve Campbell', 'Courteney Cox', 'Matthew Lillard', 'Rose McGowan'],
  deepCast: ['Drew Barrymore', 'Skeet Ulrich'],
  posterColor: '#3a1220',
  genre: 'Horror', // Barrymore to 2 (E.T.)
},
```

## Cluster 11 — Denzel + Norton depth (2)

```ts
{
  id: 'remember-the-titans',
  title: 'Remember the Titans',
  year: 2000,
  director: ['Boaz Yakin'],
  writers: ['Gregory Allen Howard'], // see judgment calls — his Ali credit was story-only
  topCast: ['Denzel Washington', 'Will Patton'],
  deepCast: ['Ryan Gosling', 'Wood Harris', 'Donald Faison', 'Kate Bosworth'],
  posterColor: '#6f5022',
  genre: 'Drama', // Denzel to 6; Gosling deep-cut to 6
},
{
  id: 'american-history-x',
  title: 'American History X', // [deep cut]
  year: 1998,
  director: ['Tony Kaye'],
  writers: ['David McKenna'],
  topCast: ['Edward Norton', 'Edward Furlong'],
  deepCast: ['Beverly D\'Angelo', 'Ethan Suplee', 'Stacy Keach', 'Fairuza Balk'],
  posterColor: '#68461f',
  genre: 'Drama', // Norton to 7; Furlong to 2 (T2)
},
```

## Cluster 12 — Iñárritu pair-up (1)

```ts
{
  id: 'the-revenant',
  title: 'The Revenant',
  year: 2015,
  director: ['Alejandro G. Iñárritu'],
  writers: ['Mark L. Smith', 'Alejandro G. Iñárritu'],
  topCast: ['Leonardo DiCaprio', 'Tom Hardy', 'Domhnall Gleeson', 'Will Poulter'],
  posterColor: '#2f5e30',
  genre: 'Adventure', // DiCaprio to 11; Hardy to 5; Gleeson to 2 (TFA deep); Iñárritu to 2
},
```

## Cluster 13 — Sorkin / Boyle / Kaufman (3) — completes Sorkin's writer net

```ts
{
  id: 'steve-jobs',
  title: 'Steve Jobs',
  year: 2015,
  director: ['Danny Boyle'],
  writers: ['Aaron Sorkin'],
  topCast: ['Michael Fassbender', 'Kate Winslet', 'Seth Rogen', 'Jeff Daniels'],
  deepCast: ['Katherine Waterston', 'Michael Stuhlbarg'],
  posterColor: '#5e421f',
  genre: 'Drama', // Sorkin writer x4 (AFGM · Social Network · Moneyball); Fassbender to 2
},
{
  id: 'slumdog-millionaire',
  title: 'Slumdog Millionaire',
  year: 2008,
  director: ['Danny Boyle'], // Loveleen Tandan co-director — primary convention
  writers: ['Simon Beaufoy'],
  topCast: ['Dev Patel', 'Freida Pinto', 'Anil Kapoor', 'Irrfan Khan'],
  posterColor: '#765425',
  genre: 'Drama', // Boyle to 2
},
{
  id: 'being-john-malkovich',
  title: 'Being John Malkovich', // [deep cut]
  year: 1999,
  director: ['Spike Jonze'],
  writers: ['Charlie Kaufman'],
  topCast: ['John Cusack', 'Cameron Diaz', 'Catherine Keener', 'John Malkovich'],
  deepCast: ['Mary Kay Place', 'Charlie Sheen'],
  posterColor: '#226b62',
  genre: 'Comedy', // Kaufman writes 2 (Eternal Sunshine); Diaz to 4? — verify Gangs of NY credit
},
```

## Cluster 14 — Keaton completion (2) — completes Keaton; NEW Burton

```ts
{
  id: 'batman',
  title: 'Batman', // id reused from chronology-pool.json
  year: 1989,
  director: ['Tim Burton'],
  writers: ['Sam Hamm', 'Warren Skaaren'],
  topCast: ['Jack Nicholson', 'Michael Keaton', 'Kim Basinger'], // Nicholson billed FIRST (famous credit)
  deepCast: ['Billy Dee Williams', 'Jack Palance'],
  posterColor: '#26303c',
  genre: 'Action', // Nicholson to 6; Billy Dee to 3 (ESB · RotJ)
},
{
  id: 'spotlight',
  title: 'Spotlight',
  year: 2015,
  director: ['Tom McCarthy'],
  writers: ['Josh Singer', 'Tom McCarthy'],
  topCast: ['Mark Ruffalo', 'Michael Keaton', 'Rachel McAdams', 'Liev Schreiber', 'John Slattery'],
  deepCast: ['Stanley Tucci', 'Billy Crudup'],
  posterColor: '#66461f',
  genre: 'Drama', // completes Keaton (TS3 · Birdman · Batman); Ruffalo to 5; McAdams to 2; Tucci to 2
},
```

## Cluster 15 — Franchise growth (5) — completes Renner, Columbus; star-wars to 5; NEW harry-potter series

```ts
{
  id: 'mission-impossible-rogue-nation',
  title: 'Mission: Impossible — Rogue Nation',
  year: 2015,
  director: ['Christopher McQuarrie'],
  writers: ['Christopher McQuarrie'],
  topCast: ['Tom Cruise', 'Jeremy Renner', 'Simon Pegg', 'Rebecca Ferguson'],
  deepCast: ['Ving Rhames', 'Alec Baldwin', 'Sean Harris'],
  posterColor: '#2c3642',
  genre: 'Action', // completes Renner (GP · Avengers deep · Hurt Locker); Rhames to 5
  series: 'mission-impossible',
},
{
  id: 'harry-potter-and-the-sorcerers-stone',
  title: 'Harry Potter and the Sorcerer\'s Stone',
  year: 2001,
  director: ['Chris Columbus'],
  writers: ['Steve Kloves'],
  topCast: ['Daniel Radcliffe', 'Rupert Grint', 'Emma Watson'],
  deepCast: ['Alan Rickman', 'Maggie Smith', 'Richard Harris', 'Robbie Coltrane', 'John Cleese'],
  posterColor: '#43682e',
  genre: 'Adventure',
  series: 'harry-potter',
},
{
  id: 'harry-potter-and-the-chamber-of-secrets',
  title: 'Harry Potter and the Chamber of Secrets',
  year: 2002,
  director: ['Chris Columbus'],
  writers: ['Steve Kloves'],
  topCast: ['Daniel Radcliffe', 'Rupert Grint', 'Emma Watson'],
  deepCast: ['Kenneth Branagh', 'Alan Rickman', 'Maggie Smith', 'Jason Isaacs'],
  posterColor: '#3f632b',
  genre: 'Adventure', // Columbus to 3 with Doubtfire
  series: 'harry-potter',
},
{
  id: 'home-alone',
  title: 'Home Alone',
  year: 1990,
  director: ['Chris Columbus'],
  writers: ['John Hughes'],
  topCast: ['Macaulay Culkin', 'Joe Pesci', 'Daniel Stern', 'Catherine O\'Hara', 'John Heard'],
  deepCast: ['John Candy'],
  posterColor: '#2a6f66',
  genre: 'Comedy', // completes Columbus (4); JOE PESCI to 5 — casual-friendly Pesci group unlock
},
{
  id: 'star-wars-the-last-jedi',
  title: 'Star Wars: The Last Jedi',
  year: 2017,
  director: ['Rian Johnson'],
  writers: ['Rian Johnson'],
  topCast: ['Mark Hamill', 'Carrie Fisher', 'Adam Driver', 'Daisy Ridley', 'John Boyega'],
  deepCast: ['Oscar Isaac', 'Andy Serkis', 'Domhnall Gleeson', 'Benicio del Toro', 'Laura Dern'],
  posterColor: '#20305f',
  genre: 'Sci-Fi', // Rian Johnson to 3 (Looper · Knives Out); Hamill to 5; Fisher to 6
  series: 'star-wars',
},
```

## Cluster 16 — Chastain / Bigelow / Gyllenhaal (5) — completes Gyllenhaal; Chastain to 4?

```ts
{
  id: 'the-help',
  title: 'The Help',
  year: 2011,
  director: ['Tate Taylor'],
  writers: ['Tate Taylor'],
  topCast: ['Emma Stone', 'Viola Davis', 'Octavia Spencer', 'Bryce Dallas Howard', 'Jessica Chastain'],
  deepCast: ['Allison Janney', 'Sissy Spacek'],
  posterColor: '#6b4a23',
  genre: 'Drama', // Stone to 5; Davis to 2 (Prisoners); Chastain — verify The Martian credit for 4
},
{
  id: 'zero-dark-thirty',
  title: 'Zero Dark Thirty',
  year: 2012,
  director: ['Kathryn Bigelow'],
  writers: ['Mark Boal'],
  topCast: ['Jessica Chastain', 'Jason Clarke', 'Joel Edgerton'],
  deepCast: ['Chris Pratt', 'Mark Duplass', 'James Gandolfini'],
  posterColor: '#44442c',
  genre: 'Thriller', // Pratt to 2 (Moneyball); Gandolfini to 2 (Crimson Tide deep)
},
{
  id: 'the-hurt-locker',
  title: 'The Hurt Locker',
  year: 2008,
  director: ['Kathryn Bigelow'],
  writers: ['Mark Boal'],
  topCast: ['Jeremy Renner', 'Anthony Mackie', 'Brian Geraghty'],
  deepCast: ['Guy Pearce', 'Ralph Fiennes', 'David Morse', 'Evangeline Lilly'],
  posterColor: '#4e4f2c',
  genre: 'War', // War to 7; Bigelow directs 2; Boal writes 2; Pearce to 2 (Memento)
},
{
  id: 'nightcrawler',
  title: 'Nightcrawler',
  year: 2014,
  director: ['Dan Gilroy'],
  writers: ['Dan Gilroy'],
  topCast: ['Jake Gyllenhaal', 'Rene Russo', 'Riz Ahmed', 'Bill Paxton'],
  posterColor: '#3d3158',
  genre: 'Thriller', // Gyllenhaal to 3 (Zodiac · Prisoners); Paxton to 5(!)
},
{
  id: 'donnie-darko',
  title: 'Donnie Darko', // [deep cut]
  year: 2001,
  director: ['Richard Kelly'],
  writers: ['Richard Kelly'],
  topCast: ['Jake Gyllenhaal', 'Jena Malone', 'Drew Barrymore', 'Mary McDonnell', 'Patrick Swayze'],
  deepCast: ['Maggie Gyllenhaal', 'Seth Rogen', 'Noah Wyle'],
  posterColor: '#2f3d78',
  genre: 'Sci-Fi', // completes Gyllenhaal (4); Barrymore to 3; Rogen to 3
},
```

## Cluster 17 — McKay / Favreau comedy (3) — completes Carell?, Ferrell; NEW McKay net

```ts
{
  id: 'anchorman',
  title: 'Anchorman: The Legend of Ron Burgundy',
  year: 2004,
  director: ['Adam McKay'],
  writers: ['Will Ferrell', 'Adam McKay'],
  topCast: ['Will Ferrell', 'Christina Applegate', 'Paul Rudd', 'Steve Carell'],
  deepCast: ['David Koechner', 'Fred Willard', 'Vince Vaughn', 'Jack Black'],
  posterColor: '#257068',
  genre: 'Comedy', // McKay also directed pool's The Big Short — instant 2-net
},
{
  id: 'step-brothers',
  title: 'Step Brothers',
  year: 2008,
  director: ['Adam McKay'],
  writers: ['Will Ferrell', 'Adam McKay'],
  topCast: ['Will Ferrell', 'John C. Reilly', 'Mary Steenburgen', 'Richard Jenkins'],
  deepCast: ['Adam Scott', 'Kathryn Hahn'],
  posterColor: '#1f6868',
  genre: 'Comedy', // McKay directs 3 (wave-3 seed: Vice); JCR to 5
},
{
  id: 'elf',
  title: 'Elf',
  year: 2003,
  director: ['Jon Favreau'],
  writers: ['David Berenbaum'],
  topCast: ['Will Ferrell', 'James Caan', 'Bob Newhart', 'Ed Asner', 'Mary Steenburgen'],
  deepCast: ['Zooey Deschanel', 'Peter Dinklage'],
  posterColor: '#2a6f66',
  genre: 'Comedy', // completes Ferrell (4); Favreau directs 2 (Iron Man!); Caan to 2 (Godfather); Asner to 2 (Up)
},
```

## Cluster 18 — Cruise hubs + era anchors (4) — Cruise toward 11 (see judgment calls)

```ts
{
  id: 'grease',
  title: 'Grease', // id reused from chronology-pool.json
  year: 1978,
  director: ['Randal Kleiser'],
  writers: ['Bronte Woodard'],
  topCast: ['John Travolta', 'Olivia Newton-John', 'Stockard Channing'],
  deepCast: ['Jeff Conaway', 'Didi Conn'],
  posterColor: '#8f4260',
  genre: 'Romance', // Travolta to 2 (Pulp Fiction)
},
{
  id: 'rain-man',
  title: 'Rain Man', // id reused from chronology-pool.json
  year: 1988,
  director: ['Barry Levinson'],
  writers: ['Ronald Bass', 'Barry Morrow'],
  topCast: ['Dustin Hoffman', 'Tom Cruise', 'Valeria Golino'],
  posterColor: '#7b5a28',
  genre: 'Drama', // Hoffman enters the pool (wave-3 seed: Graduate/Tootsie)
},
{
  id: 'jerry-maguire',
  title: 'Jerry Maguire',
  year: 1996,
  director: ['Cameron Crowe'],
  writers: ['Cameron Crowe'],
  topCast: ['Tom Cruise', 'Cuba Gooding Jr.', 'Renée Zellweger'],
  deepCast: ['Regina King', 'Bonnie Hunt', 'Jay Mohr', 'Kelly Preston'],
  posterColor: '#6f5022',
  genre: 'Drama', // Zellweger to 2 (Chicago); Regina King to 3(!); Bonnie Hunt to 2 (Jumanji)
},
{
  id: 'edge-of-tomorrow',
  title: 'Edge of Tomorrow',
  year: 2014,
  director: ['Doug Liman'],
  writers: ['Christopher McQuarrie', 'Jez Butterworth', 'John-Henry Butterworth'],
  topCast: ['Tom Cruise', 'Emily Blunt', 'Bill Paxton', 'Brendan Gleeson'],
  posterColor: '#242e3a',
  genre: 'Sci-Fi', // Blunt to 6; Paxton to 6(!); Liman directs 2 (Bourne); McQuarrie writes 2
},
```

## Cluster 19 — International anchors (2) — funpass lever 2.5 (mechanically neutral)

```ts
{
  id: 'parasite',
  title: 'Parasite', // id reused from chronology-pool.json
  year: 2019,
  director: ['Bong Joon-ho'],
  writers: ['Bong Joon-ho', 'Han Jin-won'],
  topCast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik', 'Park So-dam'],
  posterColor: '#3d3158',
  genre: 'Thriller', // wave-3 seed: Snowpiercer (Bong + Chris Evans + Swinton)
},
{
  id: 'crouching-tiger-hidden-dragon',
  title: 'Crouching Tiger, Hidden Dragon',
  year: 2000,
  director: ['Ang Lee'],
  writers: ['Wang Hui-ling', 'James Schamus', 'Tsai Kuo-jung'],
  topCast: ['Chow Yun-fat', 'Michelle Yeoh', 'Zhang Ziyi', 'Chang Chen'],
  posterColor: '#2a5a32',
  genre: 'Action', // wave-3 seed: Ang Lee (Life of Pi · Brokeback)
},
```

## Cluster 20 — Western + hub padding (3) — Eastwood-actor to 3; Holm/Willis/Oldman density

```ts
{
  id: 'the-good-the-bad-and-the-ugly',
  title: 'The Good, the Bad and the Ugly',
  year: 1966,
  director: ['Sergio Leone'],
  writers: ['Age & Scarpelli', 'Luciano Vincenzoni', 'Sergio Leone'],
  topCast: ['Clint Eastwood', 'Eli Wallach', 'Lee Van Cleef'],
  posterColor: '#83461e',
  genre: 'Western', // Western to 7; Eastwood-as-actor 3 (Unforgiven · MDB) — wave-3 seed
},
{
  id: 'the-fifth-element',
  title: 'The Fifth Element',
  year: 1997,
  director: ['Luc Besson'],
  writers: ['Luc Besson', 'Robert Mark Kamen'],
  topCast: ['Bruce Willis', 'Gary Oldman', 'Ian Holm', 'Milla Jovovich', 'Chris Tucker'],
  posterColor: '#2f3d78',
  genre: 'Sci-Fi', // Willis to 5; Oldman to 5; Holm to 7(!); Besson+Kamen pair with Taken
},
{
  id: 'twelve-monkeys',
  title: '12 Monkeys', // [deep cut]
  year: 1995,
  director: ['Terry Gilliam'],
  writers: ['David Peoples', 'Janet Peoples'],
  topCast: ['Bruce Willis', 'Madeleine Stowe', 'Brad Pitt'],
  deepCast: ['Christopher Plummer', 'David Morse'],
  posterColor: '#2f3d78',
  genre: 'Sci-Fi', // Pitt to 9; Plummer to 6(!); David Peoples pairs with Blade Runner
},
```

---

## What this wave should unlock (verify with `gen:connections` after merge)

- **Completions**: Soderbergh, Paltrow, Voight, Pepper, Madsen, Crowe,
  Blanchett, Hathaway, Docter, Eric Roth (writer-net), Norton⁺, Uma, Kilmer,
  Will Smith, Tony Scott, Weir, JCR, Cheadle, Wahlberg, Dafoe, Cameron,
  Paxton→6, Bacon, Emma Stone, Gyllenhaal, Renner, Columbus, Keaton, Ferrell,
  James Earl Jones (5 — group dealable).
- **New/near director nets**: Iñárritu (2), Eastwood (3), Zemeckis (3),
  Brad Bird (3), McKay (3), Bigelow (2), Boyle (2), Liman (2), R. Johnson (3),
  Favreau (2 — Iron Man!), Nora Ephron (dir 1 + writer 2).
- **Series**: star-wars→5, mission-impossible→5, NEW harry-potter (2),
  terminator (2), kill-bill (2) — HP needs 2 more films (wave 3) for a series group.
- **Mega-hubs to watch**: Ian Holm 7 · Paxton 6 · Plummer 6 · Fisher 6 ·
  Cruise 11 · Hanks 11 · DiCaprio 11 — great for Duel melds; the Connections
  dealer's disjointness gate keeps them honest.

## Reviewer checklist (per film) — same as wave 1

- [ ] Year · director(s) · writers = screenplay credits (conventions as locked 2026-07-05)
- [ ] topCast ≤5, billing-honest (recognizability picks allowed, order errors not)
- [ ] deepCast credits are real performances; spellings byte-identical to pool
- [ ] Genre + posterColor family sensible
- [ ] Deep-cut ratio acceptable (7 tagged ≈ 9%)
