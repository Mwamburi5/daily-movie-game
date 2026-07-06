# Wave 2 cross-check — diff report (2026-07-05)

**Method:** `tmdb:audit` on all 74 draft films (scripts/wave2-candidate.ts,
generated from docs/wave2-draft.md) + a job-level screenplay comparison
(TMDB jobs Screenplay/Writer vs ours) + targeted web verification (Wikipedia
infobox/wikitext, IMDb, script title pages) of every naming/billing question
TMDB couldn't settle. Conventions locked 2026-07-05 applied throughout, not
re-litigated.

**Stats:** 74 films · **13 fully clean** · 61 TMDB-flagged, resolving to:
**2 likely-wrong** (both the same writer-spelling normalization) ·
**6 uncertain** (convention/taste calls) · the rest cosmetic (policy-covered
recognizability picks, short top-cast lists, and naming keeps).
**Zero year errors** (Casablanca's flag is TMDB's 1943 wide date vs our 1942
original-release convention — ours correct) · **zero director errors**
(Parasite's flag is TMDB's hyphenless "Bong Joon Ho" romanization) ·
**zero fake credits** — every draft deepCast name TMDB "missed" is a
rename (Mos Def→Yasiin Bey, Analeigh→Lio Tipton), confirmed performed.
Job-level writer check: only 9 diffs in 74, all orthography — the
screenplay-only convention held everywhere.

**Id/order checks:** 74 unique ids, zero clashes with the live 163
(append-safe); all 9 chronology-pool id reuses verbatim.

---

## Group 1 — likely-wrong (fix before merge)

1. `twelve-monkeys` · writers | draft: 'David Peoples' | canonical: **'David
   Webb Peoples'** — the frozen 89's Unforgiven already stores the full form
   (also Wikipedia/TMDB standard). Exact-string matching demands one spelling.
2. **LIVE POOL** `blade-runner` · writers | current: 'David Peoples' | fix to
   **'David Webb Peoples'** — wave-1 entry (outside the frozen 89, light
   gate). Today the Unforgiven↔Blade Runner writer link is SILENTLY BROKEN by
   the split spelling; this fix un-breaks it, and with fix 1 David Webb
   Peoples becomes a legitimate 3-film writer thread (Blade Runner ·
   Unforgiven · 12 Monkeys). On-screen BR credit is "David Peoples", but the
   Fishburne precedent (pool-standard spelling when links are at stake)
   governs.

## Group 2 — uncertain (convention/taste calls for Buri)

1. `the-doors` · writers | draft: 'J. Randal Johnson' | standard spelling:
   Randall Jahnson — BUT the on-screen credit IS "J. Randal Johnson" (a
   documented credited-as variant; IMDb "written by (as J. Randal Johnson)").
   REC: **keep draft** — Green Book precedent (on-screen credit wins when the
   name carries zero links); he appears nowhere else in the pool.
2. `grease` · writers | draft: 'Bronte Woodard' | Wikipedia titles the
   article "Bronté" but the 1977 script title pages read "BRONTE WOODARD"
   and IMDb agrees unaccented. REC: **keep draft** (unaccented). Zero links.
3. `birdman` · topCast | draft (Keaton, Galifianakis, Norton, Riseborough,
   Amy Ryan) is EXACTLY the official billing block top-5 — Emma Stone is
   billed 6th. Optional recognizability swap (Stone in, Ryan out) is
   policy-legal; her links ride deepCast either way. REC: **keep draft**.
4. `spirited-away` · topCast = original Japanese voice cast (the credited
   performances) — draft's own open question. REC: **keep JP cast**
   (performed-for-the-film rule; zero link value either way).
5. Cruise density → ~11 films — draft's own watch item. REC: **merge all,
   read the yield report**; trim Rogue Nation / Edge of Tomorrow later only
   if grids clump.
6. 2-film series ids `terminator` + `harry-potter` — REC: **keep**
   (kill-bill precedent: harmless metadata until a 4th film).

## Group 3 — cosmetic (policy-covered; keep, flag only)

Billing verified correct against TMDB's order (TMDB is the artifact):
`batman` Nicholson 1st ✓ · `grease` Travolta 1st ✓ · `jerry-maguire`
Gooding Jr. 2nd ✓ · `back-to-the-future` Thompson 3rd ✓ (all Wikipedia
billing blocks). Naming keeps (on-screen/pool-standard vs TMDB variant):
Mos Def (TMDB: Yasiin Bey) · Analeigh Tipton (TMDB: Lio Tipton; credited
Analeigh in 2011) · Bong Joon-ho · Chow Yun-fat · Wang Hui-ling · Tsai
Kuo-jung · Alexander Dinelaris Jr. · W. Blake Herron · Age & Scarpelli
(standard duo credit, Wikipedia verbatim) · Casablanca year 1942
(original-release convention; TMDB's 1943 = wide date) · Elf writers =
Berenbaum solo (TMDB's Favreau "Writer" job is not a screenplay credit).
Everything else in the 61 TMDB flags = deliberate short lists (2–4 names)
and recognizability-first picks under the locked billing policy.

## Confirmed clean by the check (draft's own ⚠ flags that held)

- Wallace Shawn in The Incredibles (Gilbert Huph) — in TMDB's full cast ✓
- Kevin Bacon in Crazy, Stupid, Love — deepCast membership ✓ (→4 films)
- Jessica Chastain in The Martian — no flag ✓ (→4 films)
- Remember the Titans writers = Gregory Allen Howard screenplay ✓ (the same
  name excluded from Ali for story-only; here he holds the screenplay)
- All 9 story/novel/characters exclusions the job-level check touched
  (Mystic River, Million Dollar Baby, Steve Jobs, The Revenant, Witness,
  Edge of Tomorrow, Slumdog, harry-potters ×2) ✓ screenplay-only held

## Clean films count: 13 / 74 fully clean at the audit's literal top-5 bar;
## effectively ~66 / 74 clean once the locked policies are applied.
