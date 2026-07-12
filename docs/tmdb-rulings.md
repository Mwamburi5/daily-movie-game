# TMDB rulings — accepted differences

Hand-curated, append-only ledger. When a TMDB audit flags a disagreement and
Buri rules that OUR data is correct (deliberate title convention, date-policy
difference, archive credit, etc.), the ruling is recorded here so the next
`/tmdb-check` run treats it as settled instead of re-flagging it.

Format (one line per ruling):

    - <movie-id> · <field>: ours <X> vs TMDB <Y> — RULED ours-correct <YYYY-MM-DD>, <reason>

Rulings that went the other way ("we're wrong") don't belong here — those are
fixed directly in `src/data/movies.ts` and the flag disappears on its own.

## Rulings

- rocky · releaseDate: ours 1976-11-21 vs TMDB 1976-12-03 — RULED ours-correct 2026-07-05, TMDB lacks the Nov 21 NYC limited opening (policy: limited counts)
- close-encounters-of-the-third-kind · releaseDate: ours 1977-11-16 vs TMDB 1977-12-14 — RULED ours-correct 2026-07-05, TMDB lacks the Nov 16 NYC limited opening
- rain-man · releaseDate: ours 1988-12-16 vs TMDB 1988-12-12 — RULED ours-correct 2026-07-05, Dec 12 was the Hollywood premiere mistyped as Theatrical (limited); premieres excluded
- gangs-of-new-york · releaseDate: ours 2002-12-20 vs TMDB 2002-12-19 — RULED ours-correct 2026-07-05, off-by-one Thursday-preview artifact; previews excluded
- collateral · releaseDate: ours 2004-08-06 vs TMDB 2004-08-04 — RULED ours-correct 2026-07-05, TMDB's earlier entry is noted "Urbanworld Film Festival"; festivals excluded
- the-departed · releaseDate: ours 2006-10-06 vs TMDB 2006-10-05 — RULED ours-correct 2026-07-05, off-by-one preview artifact
- american-hustle · releaseDate: ours 2013-12-13 vs TMDB 2013-12-03 — RULED ours-correct 2026-07-05, Dec 3 = industry/premiere event, Dec 12 = Thursday previews; Dec 13 is the 6-theater public limited opening (THR/Box Office Mojo)
- dunkirk · releaseDate: ours 2017-07-21 vs TMDB 2017-07-19 — RULED ours-correct 2026-07-05, July 19 was the international 70mm rollout; US paid previews July 20 excluded; July 21 first US public date
- wicked · releaseDate: ours 2024-11-22 vs TMDB 2024-10-16 — RULED ours-correct 2026-07-05, TMDB's entry is noted "Universal Studios Lot for influencers only"; not a public opening
- casablanca · year: ours 1942 vs TMDB 1943 — RULED ours-correct 2026-07-05, original-release convention (Hollywood Theatre NYC 1942-11-26); TMDB uses the 1943 wide date
- parasite · director: ours Bong Joon-ho vs TMDB Bong Joon Ho — RULED ours-correct 2026-07-05, standard hyphenated romanization
- the-italian-job · deepCast: ours Mos Def vs TMDB Yasiin Bey — RULED ours-correct 2026-07-05, credited as Mos Def in the 2003 titles (performed, Left Ear); TMDB uses his later name
- crazy-stupid-love · deepCast/topCast: ours Analeigh Tipton vs TMDB Lio Tipton — RULED ours-correct 2026-07-05, credited as Analeigh Tipton in 2011; name changed 2021
- the-doors · writers: ours J. Randal Johnson vs TMDB Randall Jahnson — RULED ours-correct 2026-07-05, the literal on-screen credited-as variant (Green Book precedent; zero pool links)
- grease · writers: ours Bronte Woodard vs TMDB Bronté Woodard — RULED ours-correct 2026-07-05, script title pages + IMDb unaccented; zero pool links
- birdman · writers: ours Alexander Dinelaris Jr. vs TMDB Alexander Dinelaris — RULED ours-correct 2026-07-05, Oscar-credited "Jr." form; zero pool links
- the-bourne-identity · writers: ours W. Blake Herron vs TMDB William Blake Herron — RULED ours-correct 2026-07-05, on-screen credit form; zero pool links
- the-good-the-bad-and-the-ugly · writers: ours "Age & Scarpelli" vs TMDB split Incrocci/Scarpelli — RULED ours-correct 2026-07-05, standard duo credit form (Wikipedia infobox verbatim)
- crouching-tiger-hidden-dragon · topCast/writers: ours Chow Yun-fat, Wang Hui-ling, Tsai Kuo-jung vs TMDB casing/transliteration variants — RULED ours-correct 2026-07-05, standard forms
- elf · writers: ours David Berenbaum solo vs TMDB +Jon Favreau — RULED ours-correct 2026-07-05, screenplay credit is Berenbaum alone; Favreau's TMDB "Writer" job is not a screenplay credit
- batman · topCast order: ours Nicholson 1st vs TMDB Keaton 1st — RULED ours-correct 2026-07-05, 1989 billing famously bills Nicholson first
- grease · topCast order: ours Travolta 1st vs TMDB Newton-John 1st — RULED ours-correct 2026-07-05, poster billing
- jerry-maguire · topCast order: ours Gooding Jr. 2nd vs TMDB Zellweger 2nd — RULED ours-correct 2026-07-05, billing block
- back-to-the-future · topCast order: ours Thompson 3rd vs TMDB Glover 3rd — RULED ours-correct 2026-07-05, billing block
- spirited-away · releaseDate: policy 2002-09-20 (first US theatrical, Disney limited; SFIFF t1 excluded) vs origin year 2001 — RULED policy-date 2026-07-12, US-theatrical convention wins over origin-country year; card year follows the policy date (2002)
- 300 · wrong-film match: auto-matcher grabbed Rob-B-Hood (tmdb 25676) with its 2007-12-26 date; intended 300 (tmdb 1271) @ 2007-03-09 would move card year to 2007 — RULED struck 2026-07-12, dropped from Stage B batch 2 at Buri's call; slate updated to 277 kept

## Standing policies (cover whole flag classes; do not re-present matches)

- topCast set/order diffs vs TMDB's literal top-5 are POLICY, not errors:
  recognizability-first picks, short lists (2–4 names), and deliberate
  card-face link visibility are all locked conventions (2026-07-05). Only a
  demonstrated TRUE billing error (poster/titles contradict ours with no
  recognizability upside) goes to Buri.
- writers = screenplay-only: TMDB Writing-department extras with
  story/novel/characters/adaptation/lyrics jobs are expected diffs, not flags.
- deepCast names TMDB "lacks" via a performer's later legal name change are
  settled by the credited-at-the-time rule.
- international films date to their first US theatrical run (types 2+3,
  earliest), never the origin-country year; the card year follows the policy
  date (Spirited Away precedent, RULED 2026-07-12). Pre-cleared for future
  intl adds — do not re-present this class.
