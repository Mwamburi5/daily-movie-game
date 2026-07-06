# Wave 1 cross-check — diff report (2026-07-05)

**Method:** all 74 draft films verified against Wikipedia infoboxes + raw wikitext,
TMDB credit order, and poster billing via web search (IMDb blocks automated fetch;
used as tiebreaker via search snippets only). Local checks: draft ids vs
`chronology-pool.json` (id-identity for future pool unification) and draft name
spellings vs `movies.ts` (exact-string matching contract).

**Stats:** 74 films checked · **24 fully clean** · 2 likely-wrong (both writer
credits) · 10 uncertain (convention calls) · ~40 cosmetic-billing lines (12 with
an apply recommendation, the rest deliberate recognizability picks — flag only).
**Zero year errors. Zero director errors. Zero fake credits** — every deepCast
name is a real performance.

**Local checks:** 18 draft films already exist in the chronology pool by
title+year; 17 ids match verbatim, **1 mismatch**: draft `et-the-extra-terrestrial`
→ pool has **`e-t-the-extra-terrestrial`** (mechanical fix at merge, id-reuse
rule). Name spellings: 462 distinct people in the draft, 135 shared with the
current pool — **all 135 byte-identical**, zero mismatches.

Locked calls honored (not re-checked as decisions): Father of the Bride in,
Chinatown in, Rickles TS4 archive credit out, Horror family #331025–#3a1220.

---

## Group 1 — likely-wrong (recommend fix before merge)

1. `the-goonies` · writers | draft: Chris Columbus, Steven Spielberg | sourced: Screenplay = Chris Columbus alone; Spielberg = story credit only (Wikipedia) | **REC: remove Spielberg** (dataset convention is screenplay-only — the draft's own ⚠ flag, confirmed)
2. `father-of-the-bride` · writers | draft: Nancy Meyers, Charles Shyer | sourced: on-screen screenplay credit is "Frances Goodrich & Albert Hackett and Nancy Meyers & Charles Shyer" — the 1950 writers retain shared SCREENPLAY credit on the remake (Wikipedia) | **REC: add Frances Goodrich + Albert Hackett**
3. `et-the-extra-terrestrial` · id | draft: et-the-extra-terrestrial | sourced: chronology-pool.json has `e-t-the-extra-terrestrial` | **REC: reuse pool id verbatim** (mechanical, applied at merge per id-reuse rule)

## Group 2 — uncertain (convention calls for Buri)

1. `the-notebook` · writers | draft: Jeremy Leven, Jan Sardi | sourced: Screenplay by Jeremy Leven; Sardi holds a separate WGA "Adaptation by" credit (Wikipedia) | REC: drop Sardi under strict screenplay-only; keep if "adaptation by" counts as a writing credit — decide once, applies to future waves
2. `barbie` · deepCast Helen Mirren | draft: included | sourced: credited Narrator, voice-only, never on screen (Wikipedia) | REC: keep — credited performance made *for* the film (animation voice casts are already precedent); unlike the Rickles archive case
3. `star-wars` + `the-empire-strikes-back` · deepCast James Earl Jones | draft: included in both | sourced: performed Vader's voice in both, but UNCREDITED in 1977/1980 at his own request; first credited 1983 (Wikipedia) | REC: keep — rule is "performed in the film", he performed; archive rule doesn't apply
4. `green-book` · writers Brian Currie | draft: 'Brian Currie' | sourced: on-screen film credit "Brian Currie"; Wikipedia/IMDb standard name "Brian Hayes Currie" | REC: keep draft (on-screen credit; zero link impact — he's nowhere else in the pool)
5. `taken` · year | draft: 2008 | sourced: France (original) Feb 2008, US Jan 2009 | REC: keep 2008 per original-theatrical convention; note players may expect 2009
6. `up` + `inside-out` · director | draft: Pete Docter alone | sourced: on-screen co-director credits (Bob Peterson / Ronnie del Carmen) | REC: keep — pool precedent already does this (Toy Story 2 lists Lasseter alone, dropping Brannon/Unkrich co-credits)
7. `apocalypse-now` · deepCast Laurence Fishburne | draft: 'Laurence Fishburne' | sourced: credited on-screen as "Larry Fishburne" in this film | REC: keep 'Laurence' — exact-string matching requires his pool-standard spelling
8. `bruce-almighty` · deepCast Steve Carell | draft: 'Steve Carell' | sourced: on-screen credit quirk "Steven Carell" | REC: keep 'Steve Carell' (universal standard)
9. `boogie-nights` · topCast order | draft: Wahlberg, Reynolds, Moore, Reilly, Graham | sourced: TMDB + poster match draft EXACTLY; Wikipedia infobox swaps Moore/Reynolds and inserts Cheadle | REC: keep draft (two sources beat one)
10. `up` · writers order | draft: Docter, Peterson | sourced: credited order "Bob Peterson & Pete Docter" | REC: keep (order has zero game meaning; Docter-first reads with the director field)

## Group 3a — cosmetic-billing, APPLY recommended (draft contradicts billing with no recognizability upside)

1. `apocalypse-now` · topCast | draft: Brando, **Sheen, Duvall**, Forrest, Hall | sourced: Brando, **Duvall, Sheen**, Forrest, Hall (Wikipedia) | REC: swap 2↔3
2. `the-hobbit-an-unexpected-journey` · topCast | draft: **Freeman, McKellen**, Armitage | sourced: **McKellen, Freeman**, Armitage (Wikipedia) | REC: swap 1↔2
3. `indiana-jones-and-the-last-crusade` · topCast | draft: Ford, Connery, **Doody, Elliott** | sourced: Ford, Connery, **Elliott, Doody** (TMDB) | REC: swap 3↔4
4. `full-metal-jacket` · topCast | draft: Modine, **D'Onofrio, Ermey, Baldwin** | sourced: Modine, **Baldwin, D'Onofrio, Ermey** (Wikipedia + TMDB agree) | REC: reorder
5. `days-of-thunder` · topCast | draft: Cruise, Duvall, **Kidman, Quaid** | sourced: Cruise, Duvall, **Quaid, Kidman** (Wikipedia wikitext) | REC: swap 3↔4
6. `jumanji` · topCast | draft: Williams, **Hunt, Dunst, Grier** | sourced: Williams, **Dunst, Grier, Hunt** (Wikipedia) | REC: reorder
7. `rear-window` · topCast | draft: Stewart, Kelly, Ritter, Burr | sourced: Stewart, Kelly, **Wendell Corey**, Ritter, Burr (Wikipedia) | REC: insert Corey 3rd — all 5 fit
8. `dr-strangelove` · topCast | draft: Sellers, Scott, Hayden, Pickens | sourced: Sellers, Scott, Hayden, **Keenan Wynn**, Pickens (Wikipedia) | REC: insert Wynn 4th — all 5 fit
9. `star-wars` · topCast | draft: Hamill, Ford, Fisher, **Guinness, Cushing** | sourced: Hamill, Ford, Fisher, **Cushing, Guinness** — "…and Alec Guinness" is billed last (Wikipedia) | REC: swap 4↔5
10. `ray` · topCast | draft: Foxx, Washington, **King, Powell** | sourced: Foxx, Washington, **Powell**, …, King billed LAST of block (Wikipedia) | REC: Foxx, Washington, Powell, King (keep King 4th for recognizability, behind Powell)
11. `pirates-of-the-caribbean…` · topCast slot 5 | draft: Jack Davenport | sourced: 5th billed = **Jonathan Pryce**; Davenport below the billing block (Wikipedia) | REC: swap in Pryce (also the more linkable name)
12. `true-grit` · topCast | draft: Bridges, **Steinfeld 2nd** | sourced: Steinfeld billed 5th (Bridges, Damon, Brolin, Pepper, Steinfeld) (Wikipedia) | REC: apply billing order — or keep her 2nd as the co-lead; your call, listed here because it's a pure order question

## Group 3b — cosmetic-billing, KEEP recommended (deliberate recognizability/link-visibility picks; flag only)

1. `alien` · topCast | draft: Weaver 1st, Holm 4th | sourced: billing = Skerritt, Weaver, Cartwright, Stanton, Hurt (Holm 6th) | REC: keep — Weaver is the film's face; Holm on the card face feeds the Ian Holm completion
2. `blade-runner` · topCast slot 5 | draft: Daryl Hannah | sourced: 5th billed = M. Emmet Walsh, Hannah 6th (TMDB) | REC: keep — Hannah links to Kill Bill
3. `the-shining` · topCast 3/4 | draft: Lloyd, Crothers | sourced: Wikipedia says Crothers, Lloyd; TMDB matches draft | REC: keep (sources split)
4. `2001-a-space-odyssey` · topCast slot 3 | draft: William Sylvester | sourced: infobox lists only Dullea, Lockwood; Sylvester 3rd on TMDB | REC: keep
5. `psycho` · topCast order | draft: Perkins, Leigh, Miles, Gavin | sourced: 1960 billing = Perkins, Miles, Gavin, "and Janet Leigh" special-last; TMDB matches draft | REC: keep
6. `north-by-northwest` · topCast slot 4 | draft: Martin Landau | sourced: billing block = Grant, Saint, Mason, Jessie Royce Landis; Landau below | REC: keep (performed, recognizable) — or trim to 3
7. `the-exorcist` · topCast | draft: Burstyn, von Sydow, Blair, Miller | sourced: billing = Burstyn, von Sydow, Lee J. Cobb, …, Miller, Blair last | REC: keep — Blair is the film's icon
8. `get-out` · topCast slot 4 | draft: Catherine Keener | sourced: Caleb Landry Jones billed 4th, Keener 6th (in block) | REC: keep
9. `magnolia` · topCast | draft: Cruise, Moore, Hoffman, Reilly, Macy | sourced: ensemble billed alphabetically (Blackman first) | REC: keep star subset — all 5 in the official block
10. `one-flew-over-the-cuckoos-nest` · topCast slot 3 | draft: Will Sampson | sourced: William Redfield billed 3rd | REC: keep Sampson (Chief Bromden recognizability)
11. `chinatown` · topCast slot 3 | draft: John Huston | sourced: Huston billed 6th (after Hillerman, Lopez, Young) | REC: keep — Huston is the name that matters
12. `12-years-a-slave` · topCast 3–5 | draft: Nyong'o, Cumberbatch, Pitt | sourced: block order = Cumberbatch, Dano, Giamatti, Nyong'o, … Pitt (alphabetical-ish poster) | REC: keep fame-weighted pick
13. `the-princess-bride` · topCast slot 2 | draft: Robin Wright | sourced: billed 7th ("introducing"); block = Elwes, Patinkin, Sarandon, Guest, Shawn | REC: keep — Wright completion is why this film is in the wave; spelling "Robin Wright" confirmed correct for 1987
14. `barbie` · topCast slot 5 | draft: Will Ferrell | sourced: Issa Rae + Rhea Perlman billed 5–6 before Ferrell | REC: keep (Rae already in deepCast)
15. `looper` · topCast | draft: JGL 1st | sourced: infobox leads Willis; poster block leads JGL | REC: keep (poster wins)
16. `taken` · topCast slot 3 | draft: Famke Janssen | sourced: billed 8th of block | REC: keep (the three recognizable principals)
17. `superbad` · topCast slot 3 | draft: Mintz-Plasse | sourced: infobox has Rogen 3rd, no Mintz-Plasse | REC: keep (McLovin recognizability; Rogen already deepCast)
18. `oceans-twelve` · topCast slot 5 | draft: Julia Roberts | sourced: billed 8th (García, Cheadle, Mac billed 5–7) | REC: keep (García/Cheadle/Mac all in deepCast)
19. `oceans-thirteen` · topCast slots 4–5 | draft: Pacino, Barkin | sourced: Pacino billed 8th, Barkin 7th, after García/Cheadle/Mac | REC: keep — Pacino's card-face visibility is the film's purpose
20. `the-grand-budapest-hotel` · topCast | draft: narrative-lead order (Revolori 2nd) | sourced: Fiennes then alphabetical; Revolori billed LAST ("introducing") | REC: keep narrative order
21. `moonrise-kingdom` · topCast | draft: kids 1–2, adults 3–5 | sourced: adults billed first; kids "introducing" last | REC: keep — kids are the leads; Willis/Norton/Murray all still on the card
22. `the-royal-tenenbaums` · topCast | draft: Hackman, Huston, Stiller, Paltrow, Murray | sourced: alphabetical by FIRST name — Danny Glover billed 1st | REC: keep (Glover stays deepCast)
23. `inside-out` · topCast | draft: Poehler, Smith, Hader, Black, Kaling | sourced: Richard Kind (Bing Bong) billed 3rd | REC: keep; optionally add Kind to deepCast
24. `et…` · topCast | draft: Thomas 1st | sourced: billing = Dee Wallace, Coyote, MacNaughton, Barrymore, "and Henry Thomas as Elliott" last | REC: keep Thomas-first (Elliott is the film's face)
25. `the-force-awakens` · topCast | draft: Ridley, Boyega, Driver, Ford, Fisher | sourced: billing = Ford 1st, Hamill 2nd, Fisher, Driver, Ridley | REC: keep — new-lead order; Hamill-in-deepCast is a deliberate deep cut (he has no lines)
26. `the-mask` · topCast slot 2 | draft: Cameron Diaz | sourced: Riegert billed 2nd; Diaz "introducing" last | REC: keep Diaz 2nd
27. `tombstone` · topCast 3–5 | draft: Elliott, Paxton, Boothe | sourced: only Russell/Kilmer top-billed, rest alphabetical (Biehn 3rd) | REC: keep famous four; Biehn already deepCast
28. `kill-bill-vol-1` · topCast slot 5 | draft: Carradine | sourced: Madsen billed 5th, Carradine 6th | REC: keep Bill on the card; Madsen already deepCast
29. `the-devil-wears-prada` · topCast | draft: Blunt 3rd, Grenier 5th | sourced: Tucci 3rd, Simon Baker 4th, Blunt 5th, Grenier 6th | REC: keep — Blunt completion stays visible either way
30. `jumanji` · deepCast Bebe Neuwirth | sourced: billed 6th in the starring block, not deep | REC: keep in deepCast (slot just means "not on the card face")
31. `armageddon` · topCast slot 5 | draft: Steve Buscemi | sourced: billed 8th (Will Patton 5th) | REC: keep — Buscemi is a 5-film pool actor; card-face link visibility

## Confirmed clean by the check (the draft's own ⚠ flags that held)

- `the-empire-strikes-back` writers = Brackett & Kasdan screenplay; Lucas story-only, correctly excluded ✓
- `return-of-the-jedi` writers = Kasdan + Lucas shared screenplay ✓
- `armageddon` writers = Hensleigh & Abrams screenplay (Gilroy/Salerno "adaptation by", story separate) ✓
- `the-grand-budapest-hotel` writers = Anderson solo screenplay (Guinness story-only) ✓
- `the-avengers` writers = Whedon solo screenplay (Penn story-only) ✓
- `days-of-thunder` writers = Towne solo screenplay (Towne & Cruise story) ✓
- `kill-bill-vol-2` deepCast Samuel L. Jackson = credited on-screen performance (Rufus) ✓
- `mission-impossible-ghost-protocol` writers = Appelbaum & Nemec ✓
- `ali` writers = all four screenplay-credited (Howard story-only excluded) ✓
- `cloud-atlas`, `carlitos-way`, `panic-room`, `la-la-land`, `mad-max-fury-road`, `top-gun`, `mrs-doubtfire`, `dead-poets-society`, `men-in-black`, `the-fugitive`, `vertigo`, `phantom-thread`, `jaws`, `finding-nemo`, `fantastic-mr-fox`, `rocky`, `toy-story-4`, `the-matrix-resurrections`, `the-insider`, `return-of-the-jedi` — fully clean ✓

## Clean films count: 24 / 74
