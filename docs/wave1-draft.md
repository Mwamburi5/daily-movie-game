# Wave 1 draft — 74 films, 89 → 163 (REVIEW FILE, do not merge)

**Status: CROSS-CHECKED (2026-07-05) — web pass done, diffs arbitrated by Buri,
rulings applied. See `docs/wave1-diffs.md`. Awaiting merge (after duelPool split).** Nothing here is in `src/data/movies.ts`. Billing order, writer credits
and a few years are from model memory — every film needs the human pass before
it enters the pool. Entries are Movie-shaped TS objects so the post-review merge
is copy-paste.

Driven by `docs/connections-yield.md` (the WS2.1 shopping list): every
completable one-short name gets its 4th film, plus self-contained new clusters
for breadth. Target mix ~85% recognizable / ~15% deep cuts — deep cuts are
tagged `[deep cut]`.

## 🚨 MERGE BLOCKERS (read before any film enters src/data)

1. **`duelPool` split does not exist yet.** Duel and the Solo daily both deal
   from `MOVIES` directly today. Merging wave 1 into movies.ts would silently
   grow Duel's deal (invalidating the difficulty tuning) **and** reshuffle every
   future Solo daily (tripping the solo-verify append-only pin). Before the
   first merge: add a locked `DUEL_POOL_IDS` (the current 89) that Duel — and,
   until the user's conscious pin-cutover date, Solo — deals from. Then the full
   gate sweep must stay green: verify 63/63 · chronology 42/42 · solo 8/8 ·
   eval tune unchanged.
2. **Human date/credits pass** — the gate this file waits on.
3. **Chronology overlap:** several classics here (2001, Jaws, Psycho, Star
   Wars, ...) may already exist in the 162-film chronology pool by a different
   id. The merge pass must dedupe against `chronology-pool.json` ids/titles so
   the eventual unified pool has one canonical entry per film.

## Open judgment calls for the reviewer — ALL RESOLVED 2026-07-05 (grill + arbitration; see wave1-diffs.md)

- **Diane Keaton's 4th**: drafted as *Father of the Bride* (safe, recognizable).
  The classic alternative is *Annie Hall* (Woody Allen — your call on name
  baggage). Either completes her.
- **Chinatown** completes nothing by itself (Nicholson is completed by Cuckoo's
  Nest) and carries the Polanski name — included for classic-canon strength,
  easy to drop.
- **Toy Story 4 / Don Rickles**: Rickles is credited in TS4 via archive
  recordings (he died in 2017). Drafted WITHOUT him; add to deepCast only if
  you're comfortable counting an archive credit.
- **New genre: Horror** (The Shining, Psycho, Get Out, The Exorcist). Needs a
  posterColor family — proposed **blood-plum `#331025`–`#3a1220`**. If you'd
  rather not add a genre family, recolor these as Thriller and the Horror genre
  group disappears (the films still work for director/actor groups).
- **Star Wars titles**: drafted as "Star Wars" (1977) not "A New Hope";
  Empire/Jedi writer credits list screenplay writers (Lucas has story credit on
  both — included only on Jedi where he shares screenplay credit ⚠ verify).

## Uncompletable one-shorts (no 4th film exists — don't hunt for one)

- series `godfather`, `lotr`, `dark-knight` — trilogies, complete as people
  instead (Coppola ✓ via Apocalypse Now, Jackson/McKellen/Holm ✓ via The Hobbit;
  the Batman trilogy's people already run through Nolan/Bale/Caine).
- Lilly Wachowski has no solo 4th — completed via Cloud Atlas (co-directed).

---

## Cluster 1 — Franchise cappers (6) — completes toy-story, matrix, mission-impossible series + Coppola, Coens, Shire, Brolin, Fishburne, Keanu, Jada, Lana W., Tim Allen, Wallace Shawn

```ts
{
  id: 'toy-story-4',
  title: 'Toy Story 4',
  year: 2019,
  director: ['Josh Cooley'],
  writers: ['Andrew Stanton', 'Stephany Folsom'],
  topCast: ['Tom Hanks', 'Tim Allen', 'Annie Potts', 'Tony Hale', 'Keegan-Michael Key'],
  deepCast: ['Wallace Shawn', 'Joan Cusack', 'Keanu Reeves', 'Jordan Peele'],
  posterColor: '#2d70b6',
  genre: 'Animation',
  series: 'toy-story',
},
{
  id: 'the-matrix-resurrections',
  title: 'The Matrix Resurrections',
  year: 2021,
  director: ['Lana Wachowski'], // Lana only — Lilly sat this one out
  writers: ['Lana Wachowski', 'David Mitchell', 'Aleksandar Hemon'],
  topCast: ['Keanu Reeves', 'Carrie-Anne Moss', 'Yahya Abdul-Mateen II', 'Jessica Henwick', 'Jonathan Groff'],
  deepCast: ['Jada Pinkett Smith', 'Neil Patrick Harris', 'Priyanka Chopra Jonas'],
  posterColor: '#24316a',
  genre: 'Sci-Fi',
  series: 'matrix',
},
{
  id: 'mission-impossible-ghost-protocol',
  title: 'Mission: Impossible — Ghost Protocol',
  year: 2011,
  director: ['Brad Bird'],
  writers: ['Josh Appelbaum', 'André Nemec'],
  topCast: ['Tom Cruise', 'Jeremy Renner', 'Simon Pegg', 'Paula Patton'],
  deepCast: ['Ving Rhames', 'Michelle Monaghan', 'Tom Wilkinson'],
  posterColor: '#26303c',
  genre: 'Action',
  series: 'mission-impossible',
},
{
  id: 'apocalypse-now',
  title: 'Apocalypse Now',
  year: 1979,
  director: ['Francis Ford Coppola'],
  writers: ['John Milius', 'Francis Ford Coppola'],
  topCast: ['Marlon Brando', 'Robert Duvall', 'Martin Sheen', 'Frederic Forrest', 'Albert Hall'],
  deepCast: ['Laurence Fishburne', 'Harrison Ford', 'Dennis Hopper'],
  posterColor: '#4e4f2c',
  genre: 'War',
},
{
  id: 'rocky',
  title: 'Rocky',
  year: 1976,
  director: ['John G. Avildsen'],
  writers: ['Sylvester Stallone'],
  topCast: ['Sylvester Stallone', 'Talia Shire', 'Burt Young', 'Carl Weathers', 'Burgess Meredith'],
  posterColor: '#6f5022',
  genre: 'Drama',
},
{
  id: 'true-grit',
  title: 'True Grit',
  year: 2010,
  director: ['Joel Coen', 'Ethan Coen'],
  writers: ['Joel Coen', 'Ethan Coen'],
  topCast: ['Jeff Bridges', 'Matt Damon', 'Josh Brolin', 'Barry Pepper', 'Hailee Steinfeld'],
  posterColor: '#83461e',
  genre: 'Western',
},
```

## Cluster 2 — Middle-earth diaspora (5) — completes Peter Jackson, McKellen, Holm, Viggo, Bloom, Astin, Tyler

```ts
{
  id: 'the-hobbit-an-unexpected-journey',
  title: 'The Hobbit: An Unexpected Journey',
  year: 2012,
  director: ['Peter Jackson'],
  writers: ['Fran Walsh', 'Philippa Boyens', 'Peter Jackson', 'Guillermo del Toro'],
  topCast: ['Ian McKellen', 'Martin Freeman', 'Richard Armitage'],
  deepCast: ['Ian Holm', 'Elijah Wood', 'Cate Blanchett', 'Andy Serkis', 'Hugo Weaving'],
  posterColor: '#2f5e30',
  genre: 'Adventure',
},
{
  id: 'green-book',
  title: 'Green Book',
  year: 2018,
  director: ['Peter Farrelly'],
  writers: ['Nick Vallelonga', 'Brian Currie', 'Peter Farrelly'],
  topCast: ['Viggo Mortensen', 'Mahershala Ali', 'Linda Cardellini'],
  posterColor: '#6b4a23',
  genre: 'Drama',
},
{
  id: 'pirates-of-the-caribbean-the-curse-of-the-black-pearl',
  title: 'Pirates of the Caribbean: The Curse of the Black Pearl',
  year: 2003,
  director: ['Gore Verbinski'],
  writers: ['Ted Elliott', 'Terry Rossio'],
  topCast: ['Johnny Depp', 'Geoffrey Rush', 'Orlando Bloom', 'Keira Knightley', 'Jonathan Pryce'],
  posterColor: '#2a5a32',
  genre: 'Adventure',
},
{
  id: 'armageddon',
  title: 'Armageddon',
  year: 1998,
  director: ['Michael Bay'],
  writers: ['Jonathan Hensleigh', 'J.J. Abrams'],
  topCast: ['Bruce Willis', 'Billy Bob Thornton', 'Liv Tyler', 'Ben Affleck', 'Steve Buscemi'],
  deepCast: ['Owen Wilson', 'Michael Clarke Duncan', 'William Fichtner'],
  posterColor: '#28323e',
  genre: 'Action',
},
{
  id: 'the-goonies',
  title: 'The Goonies',
  year: 1985,
  director: ['Richard Donner'],
  writers: ['Chris Columbus'], // Spielberg = story-only, excluded (2026-07-05 ruling)
  topCast: ['Sean Astin', 'Josh Brolin', 'Jeff Cohen', 'Corey Feldman', 'Kerri Green'],
  posterColor: '#306038',
  genre: 'Adventure',
},
```

## Cluster 3 — Ridley Scott & Harrison Ford (4) — completes Ridley Scott, Harrison Ford; grows Spielberg, Tommy Lee Jones

```ts
{
  id: 'blade-runner',
  title: 'Blade Runner',
  year: 1982,
  director: ['Ridley Scott'],
  writers: ['Hampton Fancher', 'David Peoples'],
  topCast: ['Harrison Ford', 'Rutger Hauer', 'Sean Young', 'Edward James Olmos', 'Daryl Hannah'],
  posterColor: '#1c2858',
  genre: 'Sci-Fi',
},
{
  id: 'alien',
  title: 'Alien',
  year: 1979,
  director: ['Ridley Scott'],
  writers: ['Dan O\'Bannon'],
  topCast: ['Sigourney Weaver', 'Tom Skerritt', 'John Hurt', 'Ian Holm', 'Harry Dean Stanton'],
  posterColor: '#182350',
  genre: 'Sci-Fi',
},
{
  id: 'indiana-jones-and-the-last-crusade',
  title: 'Indiana Jones and the Last Crusade',
  year: 1989,
  director: ['Steven Spielberg'],
  writers: ['Jeffrey Boam'],
  topCast: ['Harrison Ford', 'Sean Connery', 'Denholm Elliott', 'Alison Doody'],
  deepCast: ['River Phoenix', 'Julian Glover'],
  posterColor: '#43682e',
  genre: 'Adventure', // no series id: pool's Raiders has none, and existing films are locked
},
{
  id: 'the-fugitive',
  title: 'The Fugitive',
  year: 1993,
  director: ['Andrew Davis'],
  writers: ['Jeb Stuart', 'David Twohy'],
  topCast: ['Harrison Ford', 'Tommy Lee Jones', 'Sela Ward'],
  deepCast: ['Julianne Moore', 'Joe Pantoliano'],
  posterColor: '#463a5e',
  genre: 'Thriller',
},
```

## Cluster 4 — Kubrick (4) — NEW director group; grows Nicholson, War, Comedy

```ts
{
  id: 'the-shining',
  title: 'The Shining',
  year: 1980,
  director: ['Stanley Kubrick'],
  writers: ['Stanley Kubrick', 'Diane Johnson'],
  topCast: ['Jack Nicholson', 'Shelley Duvall', 'Danny Lloyd', 'Scatman Crothers'],
  posterColor: '#331025',
  genre: 'Horror', // NEW genre family — see judgment calls
},
{
  id: '2001-a-space-odyssey',
  title: '2001: A Space Odyssey',
  year: 1968,
  director: ['Stanley Kubrick'],
  writers: ['Stanley Kubrick', 'Arthur C. Clarke'],
  topCast: ['Keir Dullea', 'Gary Lockwood', 'William Sylvester'],
  posterColor: '#20305f',
  genre: 'Sci-Fi',
},
{
  id: 'full-metal-jacket',
  title: 'Full Metal Jacket',
  year: 1987,
  director: ['Stanley Kubrick'],
  writers: ['Stanley Kubrick', 'Michael Herr', 'Gustav Hasford'],
  topCast: ['Matthew Modine', 'Adam Baldwin', 'Vincent D\'Onofrio', 'R. Lee Ermey'],
  posterColor: '#44442c',
  genre: 'War',
},
{
  id: 'dr-strangelove',
  title: 'Dr. Strangelove',
  year: 1964,
  director: ['Stanley Kubrick'],
  writers: ['Stanley Kubrick', 'Terry Southern', 'Peter George'],
  topCast: ['Peter Sellers', 'George C. Scott', 'Sterling Hayden', 'Keenan Wynn', 'Slim Pickens'],
  deepCast: ['James Earl Jones'], // his debut — quietly sets up a JEJ group with Star Wars
  posterColor: '#226b62',
  genre: 'Comedy',
},
```

## Cluster 5 — Hitchcock (4) — NEW director group

```ts
{
  id: 'psycho',
  title: 'Psycho',
  year: 1960,
  director: ['Alfred Hitchcock'],
  writers: ['Joseph Stefano'],
  topCast: ['Anthony Perkins', 'Janet Leigh', 'Vera Miles', 'John Gavin'],
  posterColor: '#3a1220',
  genre: 'Horror',
},
{
  id: 'vertigo',
  title: 'Vertigo',
  year: 1958,
  director: ['Alfred Hitchcock'],
  writers: ['Alec Coppel', 'Samuel A. Taylor'],
  topCast: ['James Stewart', 'Kim Novak', 'Barbara Bel Geddes'],
  posterColor: '#41365a',
  genre: 'Thriller',
},
{
  id: 'rear-window',
  title: 'Rear Window',
  year: 1954,
  director: ['Alfred Hitchcock'],
  writers: ['John Michael Hayes'],
  topCast: ['James Stewart', 'Grace Kelly', 'Wendell Corey', 'Thelma Ritter', 'Raymond Burr'],
  posterColor: '#4d4066',
  genre: 'Thriller',
},
{
  id: 'north-by-northwest',
  title: 'North by Northwest',
  year: 1959,
  director: ['Alfred Hitchcock'],
  writers: ['Ernest Lehman'],
  topCast: ['Cary Grant', 'Eva Marie Saint', 'James Mason', 'Martin Landau'],
  posterColor: '#352c48',
  genre: 'Thriller',
},
```

## Cluster 6 — Horror completion (2) — NEW genre group with Shining + Psycho

```ts
{
  id: 'get-out',
  title: 'Get Out',
  year: 2017,
  director: ['Jordan Peele'],
  writers: ['Jordan Peele'],
  topCast: ['Daniel Kaluuya', 'Allison Williams', 'Bradley Whitford', 'Catherine Keener'],
  deepCast: ['LaKeith Stanfield'],
  posterColor: '#331025',
  genre: 'Horror',
},
{
  id: 'the-exorcist',
  title: 'The Exorcist',
  year: 1973,
  director: ['William Friedkin'],
  writers: ['William Peter Blatty'],
  topCast: ['Ellen Burstyn', 'Max von Sydow', 'Linda Blair', 'Jason Miller'],
  posterColor: '#3a1220',
  genre: 'Horror',
},
```

## Cluster 7 — Paul Thomas Anderson (3) — NEW director group (with existing There Will Be Blood); completes Day-Lewis, Philip Seymour Hoffman

```ts
{
  id: 'phantom-thread',
  title: 'Phantom Thread',
  year: 2017,
  director: ['Paul Thomas Anderson'],
  writers: ['Paul Thomas Anderson'],
  topCast: ['Daniel Day-Lewis', 'Vicky Krieps', 'Lesley Manville'],
  posterColor: '#5e421f',
  genre: 'Drama',
},
{
  id: 'boogie-nights',
  title: 'Boogie Nights', // [deep cut] cinephile-famous
  year: 1997,
  director: ['Paul Thomas Anderson'],
  writers: ['Paul Thomas Anderson'],
  topCast: ['Mark Wahlberg', 'Burt Reynolds', 'Julianne Moore', 'John C. Reilly', 'Heather Graham'],
  deepCast: ['Philip Seymour Hoffman', 'Don Cheadle', 'William H. Macy'],
  posterColor: '#765425',
  genre: 'Drama',
},
{
  id: 'magnolia',
  title: 'Magnolia', // [deep cut] cinephile-famous
  year: 1999,
  director: ['Paul Thomas Anderson'],
  writers: ['Paul Thomas Anderson'],
  topCast: ['Tom Cruise', 'Julianne Moore', 'Philip Seymour Hoffman', 'John C. Reilly', 'William H. Macy'],
  posterColor: '#66461f',
  genre: 'Drama',
},
```

## Cluster 8 — Nicholson classics (2) — completes Nicholson

```ts
{
  id: 'one-flew-over-the-cuckoos-nest',
  title: 'One Flew Over the Cuckoo\'s Nest',
  year: 1975,
  director: ['Miloš Forman'],
  writers: ['Lawrence Hauben', 'Bo Goldman'],
  topCast: ['Jack Nicholson', 'Louise Fletcher', 'Will Sampson'],
  deepCast: ['Danny DeVito', 'Christopher Lloyd', 'Brad Dourif'],
  posterColor: '#7b5a28',
  genre: 'Drama',
},
{
  id: 'chinatown',
  title: 'Chinatown', // see judgment calls — droppable
  year: 1974,
  director: ['Roman Polanski'],
  writers: ['Robert Towne'],
  topCast: ['Jack Nicholson', 'Faye Dunaway', 'John Huston'],
  posterColor: '#5f1717',
  genre: 'Crime',
},
```

## Cluster 9 — Fincher × Foster (1) — completes Jodie Foster, grows Fincher

```ts
{
  id: 'panic-room',
  title: 'Panic Room',
  year: 2002,
  director: ['David Fincher'],
  writers: ['David Koepp'],
  topCast: ['Jodie Foster', 'Forest Whitaker', 'Dwight Yoakam', 'Jared Leto', 'Kristen Stewart'],
  posterColor: '#36304a',
  genre: 'Thriller',
},
```

## Cluster 10 — Actor completions, modern (15) — completes Ejiofor, Wright, Robbie, Gosling, Hardy, RDJ, JGL+Willis, Neeson, Jonah Hill, García+Clooney, De Palma, Keaton, Lilly Wachowski; unlocks Romance genre

```ts
{
  id: '12-years-a-slave',
  title: '12 Years a Slave',
  year: 2013,
  director: ['Steve McQueen'],
  writers: ['John Ridley'],
  topCast: ['Chiwetel Ejiofor', 'Michael Fassbender', 'Lupita Nyong\'o', 'Benedict Cumberbatch', 'Brad Pitt'],
  deepCast: ['Paul Giamatti', 'Paul Dano', 'Sarah Paulson'],
  posterColor: '#684724',
  genre: 'Drama',
},
{
  id: 'the-princess-bride',
  title: 'The Princess Bride',
  year: 1987,
  director: ['Rob Reiner'],
  writers: ['William Goldman'],
  topCast: ['Cary Elwes', 'Robin Wright', 'Mandy Patinkin', 'Chris Sarandon', 'André the Giant'],
  deepCast: ['Billy Crystal', 'Peter Falk', 'Fred Savage'],
  posterColor: '#26542e',
  genre: 'Adventure',
},
{
  id: 'barbie',
  title: 'Barbie',
  year: 2023,
  director: ['Greta Gerwig'],
  writers: ['Greta Gerwig', 'Noah Baumbach'],
  topCast: ['Margot Robbie', 'Ryan Gosling', 'America Ferrera', 'Kate McKinnon', 'Will Ferrell'],
  deepCast: ['Michael Cera', 'Issa Rae', 'Simu Liu', 'Helen Mirren'],
  posterColor: '#2a6f66',
  genre: 'Comedy',
},
{
  id: 'la-la-land',
  title: 'La La Land',
  year: 2016,
  director: ['Damien Chazelle'],
  writers: ['Damien Chazelle'],
  topCast: ['Ryan Gosling', 'Emma Stone', 'John Legend', 'Rosemarie DeWitt'],
  deepCast: ['J.K. Simmons'],
  posterColor: '#8c3e58',
  genre: 'Romance',
},
{
  id: 'the-notebook',
  title: 'The Notebook',
  year: 2004,
  director: ['Nick Cassavetes'],
  writers: ['Jeremy Leven'], // Sardi = "adaptation by" credit, excluded (2026-07-05 convention ruling)
  topCast: ['Ryan Gosling', 'Rachel McAdams', 'James Garner', 'Gena Rowlands', 'James Marsden'],
  posterColor: '#8f4260',
  genre: 'Romance', // Romance hits 4 — new genre group
},
{
  id: 'mad-max-fury-road',
  title: 'Mad Max: Fury Road',
  year: 2015,
  director: ['George Miller'],
  writers: ['George Miller', 'Brendan McCarthy', 'Nico Lathouris'],
  topCast: ['Tom Hardy', 'Charlize Theron', 'Nicholas Hoult', 'Hugh Keays-Byrne'],
  deepCast: ['Zoë Kravitz', 'Rosie Huntington-Whiteley'],
  posterColor: '#1d2530',
  genre: 'Action',
},
{
  id: 'the-avengers',
  title: 'The Avengers',
  year: 2012,
  director: ['Joss Whedon'],
  writers: ['Joss Whedon'],
  topCast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Chris Hemsworth', 'Scarlett Johansson'],
  deepCast: ['Jeremy Renner', 'Tom Hiddleston', 'Samuel L. Jackson'],
  posterColor: '#2c3642',
  genre: 'Action',
},
{
  id: 'looper',
  title: 'Looper',
  year: 2012,
  director: ['Rian Johnson'],
  writers: ['Rian Johnson'],
  topCast: ['Joseph Gordon-Levitt', 'Bruce Willis', 'Emily Blunt', 'Paul Dano', 'Jeff Daniels'],
  posterColor: '#2f3d78',
  genre: 'Sci-Fi', // completes JGL AND Willis; Dano quietly reaches 4 too
},
{
  id: 'taken',
  title: 'Taken',
  year: 2008,
  director: ['Pierre Morel'],
  writers: ['Luc Besson', 'Robert Mark Kamen'],
  topCast: ['Liam Neeson', 'Maggie Grace', 'Famke Janssen'],
  posterColor: '#242e3a',
  genre: 'Action',
},
{
  id: 'superbad',
  title: 'Superbad',
  year: 2007,
  director: ['Greg Mottola'],
  writers: ['Seth Rogen', 'Evan Goldberg'],
  topCast: ['Jonah Hill', 'Michael Cera', 'Christopher Mintz-Plasse', 'Bill Hader'],
  deepCast: ['Emma Stone', 'Seth Rogen'],
  posterColor: '#257068',
  genre: 'Comedy',
},
{
  id: 'oceans-twelve',
  title: 'Ocean\'s Twelve',
  year: 2004,
  director: ['Steven Soderbergh'],
  writers: ['George Nolfi'],
  topCast: ['George Clooney', 'Brad Pitt', 'Matt Damon', 'Catherine Zeta-Jones', 'Julia Roberts'],
  deepCast: ['Andy García', 'Don Cheadle', 'Bernie Mac', 'Casey Affleck', 'Vincent Cassel'],
  posterColor: '#6b2020',
  genre: 'Crime', // no series id — pool's Ocean's Eleven has none and is locked
},
{
  id: 'oceans-thirteen',
  title: 'Ocean\'s Thirteen',
  year: 2007,
  director: ['Steven Soderbergh'],
  writers: ['Brian Koppelman', 'David Levien'],
  topCast: ['George Clooney', 'Brad Pitt', 'Matt Damon', 'Al Pacino', 'Ellen Barkin'],
  deepCast: ['Andy García', 'Don Cheadle', 'Casey Affleck', 'Bernie Mac'],
  posterColor: '#702a1a',
  genre: 'Crime',
},
{
  id: 'carlitos-way',
  title: 'Carlito\'s Way', // [deep cut]
  year: 1993,
  director: ['Brian De Palma'],
  writers: ['David Koepp'],
  topCast: ['Al Pacino', 'Sean Penn', 'Penelope Ann Miller'],
  deepCast: ['John Leguizamo', 'Viggo Mortensen'],
  posterColor: '#59161c',
  genre: 'Crime',
},
{
  id: 'father-of-the-bride',
  title: 'Father of the Bride', // see judgment calls — Annie Hall is the alt
  year: 1991,
  director: ['Charles Shyer'],
  writers: ['Frances Goodrich', 'Albert Hackett', 'Nancy Meyers', 'Charles Shyer'], // 1950 writers keep shared screenplay credit on the remake
  topCast: ['Steve Martin', 'Diane Keaton', 'Kimberly Williams', 'Martin Short'],
  posterColor: '#1f6868',
  genre: 'Comedy',
},
{
  id: 'cloud-atlas',
  title: 'Cloud Atlas', // [deep cut] — the only film that can complete Lilly Wachowski
  year: 2012,
  director: ['Lana Wachowski', 'Lilly Wachowski', 'Tom Tykwer'],
  writers: ['Lana Wachowski', 'Lilly Wachowski', 'Tom Tykwer'],
  topCast: ['Tom Hanks', 'Halle Berry', 'Jim Broadbent', 'Hugo Weaving', 'Jim Sturgess'],
  deepCast: ['Hugh Grant', 'Ben Whishaw', 'Doona Bae'],
  posterColor: '#253468',
  genre: 'Sci-Fi',
},
```

## Cluster 11 — Wes Anderson (4) — NEW director group; NEW Bill Murray group (emergent: Owen Wilson too)

```ts
{
  id: 'the-grand-budapest-hotel',
  title: 'The Grand Budapest Hotel',
  year: 2014,
  director: ['Wes Anderson'],
  writers: ['Wes Anderson'],
  topCast: ['Ralph Fiennes', 'Tony Revolori', 'F. Murray Abraham', 'Adrien Brody', 'Saoirse Ronan'],
  deepCast: ['Willem Dafoe', 'Jude Law', 'Edward Norton', 'Bill Murray', 'Jeff Goldblum', 'Harvey Keitel', 'Owen Wilson', 'Tilda Swinton'],
  posterColor: '#22706a',
  genre: 'Comedy',
},
{
  id: 'moonrise-kingdom',
  title: 'Moonrise Kingdom',
  year: 2012,
  director: ['Wes Anderson'],
  writers: ['Wes Anderson', 'Roman Coppola'],
  topCast: ['Jared Gilman', 'Kara Hayward', 'Bruce Willis', 'Edward Norton', 'Bill Murray'],
  deepCast: ['Frances McDormand', 'Tilda Swinton', 'Harvey Keitel', 'Jason Schwartzman'],
  posterColor: '#2a6f66',
  genre: 'Comedy',
},
{
  id: 'the-royal-tenenbaums',
  title: 'The Royal Tenenbaums',
  year: 2001,
  director: ['Wes Anderson'],
  writers: ['Wes Anderson', 'Owen Wilson'],
  topCast: ['Gene Hackman', 'Anjelica Huston', 'Ben Stiller', 'Gwyneth Paltrow', 'Bill Murray'],
  deepCast: ['Owen Wilson', 'Luke Wilson', 'Danny Glover'],
  posterColor: '#226b62',
  genre: 'Comedy',
},
{
  id: 'fantastic-mr-fox',
  title: 'Fantastic Mr. Fox',
  year: 2009,
  director: ['Wes Anderson'],
  writers: ['Wes Anderson', 'Noah Baumbach'],
  topCast: ['George Clooney', 'Meryl Streep', 'Jason Schwartzman', 'Bill Murray'],
  deepCast: ['Willem Dafoe', 'Owen Wilson'],
  posterColor: '#2f74ba',
  genre: 'Animation', // completes Clooney (with the Ocean's pair)
},
```

## Cluster 12 — Pixar breadth (3) — grows Animation genre; Pete Docter to 3

```ts
{
  id: 'finding-nemo',
  title: 'Finding Nemo',
  year: 2003,
  director: ['Andrew Stanton'],
  writers: ['Andrew Stanton', 'Bob Peterson', 'David Reynolds'],
  topCast: ['Albert Brooks', 'Ellen DeGeneres', 'Alexander Gould', 'Willem Dafoe'],
  posterColor: '#2e6fb4',
  genre: 'Animation',
},
{
  id: 'up',
  title: 'Up',
  year: 2009,
  director: ['Pete Docter'],
  writers: ['Pete Docter', 'Bob Peterson'],
  topCast: ['Ed Asner', 'Christopher Plummer', 'Jordan Nagai'],
  posterColor: '#3378be',
  genre: 'Animation',
},
{
  id: 'inside-out',
  title: 'Inside Out',
  year: 2015,
  director: ['Pete Docter'],
  writers: ['Pete Docter', 'Meg LeFauve', 'Josh Cooley'],
  topCast: ['Amy Poehler', 'Phyllis Smith', 'Bill Hader', 'Lewis Black', 'Mindy Kaling'],
  posterColor: '#2b6cb0',
  genre: 'Animation', // Docter at 3 — Soul (2020) completes him in wave 2
},
```

## Cluster 13 — Spielberg blockbusters (2) — recognizability anchors

```ts
{
  id: 'jaws',
  title: 'Jaws',
  year: 1975,
  director: ['Steven Spielberg'],
  writers: ['Peter Benchley', 'Carl Gottlieb'],
  topCast: ['Roy Scheider', 'Robert Shaw', 'Richard Dreyfuss'],
  posterColor: '#3d3158',
  genre: 'Thriller',
},
{
  id: 'e-t-the-extra-terrestrial', // id reused verbatim from chronology-pool.json
  title: 'E.T. the Extra-Terrestrial',
  year: 1982,
  director: ['Steven Spielberg'],
  writers: ['Melissa Mathison'],
  topCast: ['Henry Thomas', 'Dee Wallace', 'Drew Barrymore', 'Peter Coyote'],
  posterColor: '#2a3a72',
  genre: 'Sci-Fi',
},
```

## Cluster 14 — Star Wars (4) — NEW completable series + NEW Hamill, Fisher, James Earl Jones groups; Ford to 7

```ts
{
  id: 'star-wars',
  title: 'Star Wars',
  year: 1977,
  director: ['George Lucas'],
  writers: ['George Lucas'],
  topCast: ['Mark Hamill', 'Harrison Ford', 'Carrie Fisher', 'Peter Cushing', 'Alec Guinness'],
  deepCast: ['James Earl Jones', 'Anthony Daniels', 'Kenny Baker', 'Peter Mayhew'],
  posterColor: '#28336e',
  genre: 'Sci-Fi',
  series: 'star-wars',
},
{
  id: 'the-empire-strikes-back',
  title: 'The Empire Strikes Back',
  year: 1980,
  director: ['Irvin Kershner'],
  writers: ['Leigh Brackett', 'Lawrence Kasdan'], // Lucas = story-only, excluded (verified 2026-07-05)
  topCast: ['Mark Hamill', 'Harrison Ford', 'Carrie Fisher', 'Billy Dee Williams'],
  deepCast: ['James Earl Jones', 'Frank Oz', 'Anthony Daniels'],
  posterColor: '#1f2a5e',
  genre: 'Sci-Fi',
  series: 'star-wars',
},
{
  id: 'return-of-the-jedi',
  title: 'Return of the Jedi',
  year: 1983,
  director: ['Richard Marquand'],
  writers: ['Lawrence Kasdan', 'George Lucas'],
  topCast: ['Mark Hamill', 'Harrison Ford', 'Carrie Fisher', 'Billy Dee Williams'],
  deepCast: ['James Earl Jones', 'Ian McDiarmid', 'Frank Oz'],
  posterColor: '#20305f',
  genre: 'Sci-Fi',
  series: 'star-wars',
},
{
  id: 'the-force-awakens',
  title: 'The Force Awakens',
  year: 2015,
  director: ['J.J. Abrams'],
  writers: ['Lawrence Kasdan', 'J.J. Abrams', 'Michael Arndt'],
  topCast: ['Daisy Ridley', 'John Boyega', 'Adam Driver', 'Harrison Ford', 'Carrie Fisher'],
  deepCast: ['Mark Hamill', 'Oscar Isaac', 'Lupita Nyong\'o', 'Andy Serkis', 'Domhnall Gleeson'],
  posterColor: '#182350',
  genre: 'Sci-Fi',
  series: 'star-wars',
},
```

## Cluster 15 — Michael Mann + Jamie Foxx (3) — NEW Mann group (with existing Heat + Collateral); completes Foxx

```ts
{
  id: 'the-insider',
  title: 'The Insider', // [deep cut]
  year: 1999,
  director: ['Michael Mann'],
  writers: ['Eric Roth', 'Michael Mann'],
  topCast: ['Al Pacino', 'Russell Crowe', 'Christopher Plummer'],
  posterColor: '#715326',
  genre: 'Drama',
},
{
  id: 'ali',
  title: 'Ali', // [deep cut]
  year: 2001,
  director: ['Michael Mann'],
  writers: ['Stephen J. Rivele', 'Christopher Wilkinson', 'Eric Roth', 'Michael Mann'],
  topCast: ['Will Smith', 'Jamie Foxx', 'Jon Voight', 'Mario Van Peebles'],
  posterColor: '#7f5c20',
  genre: 'Drama',
},
{
  id: 'ray',
  title: 'Ray',
  year: 2004,
  director: ['Taylor Hackford'],
  writers: ['James L. White'],
  topCast: ['Jamie Foxx', 'Kerry Washington', 'Clifton Powell', 'Regina King'],
  posterColor: '#7d5e23',
  genre: 'Drama',
},
```

## Cluster 16 — Tommy Lee Jones capper (1)

```ts
{
  id: 'men-in-black',
  title: 'Men in Black',
  year: 1997,
  director: ['Barry Sonnenfeld'],
  writers: ['Ed Solomon'],
  topCast: ['Tommy Lee Jones', 'Will Smith', 'Linda Fiorentino', 'Vincent D\'Onofrio', 'Rip Torn'],
  posterColor: '#2f3d78',
  genre: 'Sci-Fi', // genre call: sci-fi comedy — flagged for the reviewer
},
```

## Cluster 17 — Tony Scott × Cruise (2) — completes Duvall; Cruise to 8

```ts
{
  id: 'top-gun',
  title: 'Top Gun',
  year: 1986,
  director: ['Tony Scott'],
  writers: ['Jim Cash', 'Jack Epps Jr.'],
  topCast: ['Tom Cruise', 'Kelly McGillis', 'Val Kilmer', 'Anthony Edwards'],
  deepCast: ['Tim Robbins', 'Meg Ryan'],
  posterColor: '#232c38',
  genre: 'Action',
},
{
  id: 'days-of-thunder',
  title: 'Days of Thunder', // [deep cut] — the Duvall completer
  year: 1990,
  director: ['Tony Scott'],
  writers: ['Robert Towne'],
  topCast: ['Tom Cruise', 'Robert Duvall', 'Randy Quaid', 'Nicole Kidman'],
  deepCast: ['John C. Reilly'],
  posterColor: '#1f2934',
  genre: 'Action',
},
```

## Cluster 18 — Jim Carrey (2) — NEW group with existing Truman Show + Eternal Sunshine

```ts
{
  id: 'the-mask',
  title: 'The Mask',
  year: 1994,
  director: ['Chuck Russell'],
  writers: ['Mike Werb'],
  topCast: ['Jim Carrey', 'Cameron Diaz', 'Peter Riegert'],
  posterColor: '#257068',
  genre: 'Comedy',
},
{
  id: 'bruce-almighty',
  title: 'Bruce Almighty',
  year: 2003,
  director: ['Tom Shadyac'],
  writers: ['Steve Koren', 'Mark O\'Keefe', 'Steve Oedekerk'],
  topCast: ['Jim Carrey', 'Morgan Freeman', 'Jennifer Aniston'],
  deepCast: ['Steve Carell'],
  posterColor: '#1f6868',
  genre: 'Comedy',
},
```

## Cluster 19 — Robin Williams (3) — NEW group with existing Good Will Hunting

```ts
{
  id: 'mrs-doubtfire',
  title: 'Mrs. Doubtfire',
  year: 1993,
  director: ['Chris Columbus'],
  writers: ['Randi Mayem Singer', 'Leslie Dixon'],
  topCast: ['Robin Williams', 'Sally Field', 'Pierce Brosnan', 'Harvey Fierstein'],
  posterColor: '#2a6f66',
  genre: 'Comedy',
},
{
  id: 'dead-poets-society',
  title: 'Dead Poets Society',
  year: 1989,
  director: ['Peter Weir'],
  writers: ['Tom Schulman'],
  topCast: ['Robin Williams', 'Robert Sean Leonard', 'Ethan Hawke'],
  posterColor: '#6f4f24',
  genre: 'Drama', // Weir at 2 with Truman Show — wave-2 note
},
{
  id: 'jumanji',
  title: 'Jumanji',
  year: 1995,
  director: ['Joe Johnston'],
  writers: ['Jonathan Hensleigh', 'Greg Taylor', 'Jim Strain'],
  topCast: ['Robin Williams', 'Kirsten Dunst', 'David Alan Grier', 'Bonnie Hunt'],
  deepCast: ['Bebe Neuwirth'],
  posterColor: '#356233',
  genre: 'Adventure',
},
```

## Cluster 20 — Westerns, Kill Bill, Streep/Blunt (4) — Western genre to 4; QT to 8; completes Emily Blunt

```ts
{
  id: 'tombstone',
  title: 'Tombstone',
  year: 1993,
  director: ['George P. Cosmatos'],
  writers: ['Kevin Jarre'],
  topCast: ['Kurt Russell', 'Val Kilmer', 'Sam Elliott', 'Bill Paxton', 'Powers Boothe'],
  deepCast: ['Michael Biehn', 'Charlton Heston'],
  posterColor: '#7e431a',
  genre: 'Western', // Western hits 4 with True Grit — new genre group
},
{
  id: 'kill-bill-vol-1',
  title: 'Kill Bill: Vol. 1',
  year: 2003,
  director: ['Quentin Tarantino'],
  writers: ['Quentin Tarantino'],
  topCast: ['Uma Thurman', 'Lucy Liu', 'Vivica A. Fox', 'Daryl Hannah', 'David Carradine'],
  deepCast: ['Michael Madsen', 'Sonny Chiba'],
  posterColor: '#28323e',
  genre: 'Action',
  series: 'kill-bill', // 2-film series: harmless metadata, mirrors pool convention
},
{
  id: 'kill-bill-vol-2',
  title: 'Kill Bill: Vol. 2',
  year: 2004,
  director: ['Quentin Tarantino'],
  writers: ['Quentin Tarantino'],
  topCast: ['Uma Thurman', 'David Carradine', 'Michael Madsen', 'Daryl Hannah'],
  deepCast: ['Samuel L. Jackson'],
  posterColor: '#242e3a',
  genre: 'Action',
  series: 'kill-bill',
},
{
  id: 'the-devil-wears-prada',
  title: 'The Devil Wears Prada',
  year: 2006,
  director: ['David Frankel'],
  writers: ['Aline Brosh McKenna'],
  topCast: ['Meryl Streep', 'Anne Hathaway', 'Emily Blunt', 'Stanley Tucci', 'Adrian Grenier'],
  posterColor: '#2a6f66',
  genre: 'Comedy', // completes Emily Blunt (Sicario · Oppenheimer · Looper · this)
},
```

---

## What this wave unlocks (expected — re-run `npm run gen:connections` after merge to confirm)

- **Series**: `star-wars` becomes the first 4-film series group; toy-story,
  matrix, mission-impossible complete.
- **New director groups**: Kubrick, Hitchcock, Wes Anderson, Paul Thomas
  Anderson, Michael Mann (+ completions: Coens ×2, Coppola, Jackson, Ridley
  Scott, De Palma, both Wachowskis).
- **New actor groups** (beyond the shopping-list completions): Bill Murray,
  Owen Wilson, Jim Carrey, Robin Williams, Mark Hamill, Carrie Fisher,
  James Earl Jones, Paul Dano, Jack Nicholson, Bruce Willis, Ryan Gosling,
  Tommy Lee Jones, Jamie Foxx, Philip Seymour Hoffman, Harrison Ford,
  Emily Blunt, George Clooney, Julianne Moore (Lebowski · Fugitive · Boogie
  Nights · Magnolia).
- **New genre groups**: Horror (new family), Romance (2→4), Western (2→4).
- **Left at 3 on purpose (wave-2 seeds)**: Edward Norton (Birdman), Uma Thurman
  (Gattaca), Pete Docter (Soul), Val Kilmer (Heat · Top Gun · Tombstone → The
  Doors), Will Smith (I Am Legend), Eric Roth, Tony Scott, Peter Weir, Willem
  Dafoe, John C. Reilly, Don Cheadle, Wahlberg.

## Reviewer checklist (per film)

- [ ] Year correct · director(s) correct · writers = screenplay credits
- [ ] topCast is genuinely top billing (≤5); deepCast credits are real
- [ ] Names byte-identical to existing pool spellings (matching is exact string
  equality — e.g. 'Andy García' with the accent, 'Robert De Niro' spacing)
- [ ] Genre call sensible; Horror family color approved
- [ ] Recognizability mix acceptable (9 tagged deep cuts ≈ 12%)
