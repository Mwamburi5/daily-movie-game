# Wave 3 metadata arbitration

**Scope:** 67 selected cards — A01–A16, B01–B12, C01–C17, E01–E12, F01–F10.
**Candidate:** `scripts/wave3-candidate.ts` (review-only until merge).
**Result:** no genuinely new human ruling remains. Every surviving audit flag is covered by an existing standing policy or an individual ruling in `docs/tmdb-rulings.md`.

## Audit results

| Check | Result | Interpretation |
|---|---:|---|
| TMDB credential probe | pass | Credentials and API access confirmed before the batch audit. |
| Direct candidate audit | 57 clean · 9 flagged · 1 unmatched | Snowpiercer and Memories of Murder matched unrelated same-title films because Match Cut uses later U.S.-policy years; the disambiguated Superman card title did not match. Recognizability-first top-cast choices add two expected raw flags. |
| Origin-year/title supplemental audit | 61 clean · 6 flagged · 0 unmatched | Correct TMDB films were reached for every selected card. The six remaining flags are all settled classes below. |
| Live + draft exact-name audit | 0 clusters across 1,366 spellings | The draft introduces no fold-identical or structural near-duplicate credit spelling. |
| Date draft | 53 clean · 2 title-match warnings · 12 multiple-date warnings | Both title warnings are harmless conventions; all multiple-date warnings were checked against festival, premiere, re-release, and streaming rules. |

## Surviving TMDB flags — all already settled

| Film | Flag | Disposition |
|---|---|---|
| *The Iron Giant* | Curated top five differs from TMDB order | Keep Vin Diesel, Eli Marienthal, Jennifer Aniston, Harry Connick Jr., and Christopher McDonald. Existing policy makes top cast recognizability-first; Eli is the child lead. |
| *Do the Right Thing* | Curated top five differs from TMDB order | Keep Spike Lee on the face as the lead performer and director. Existing top-cast policy applies. |
| *Snowpiercer* | `Bong Joon-ho` vs TMDB `Bong Joon Ho` | Keep the hyphenated canonical pool spelling under the existing *Parasite* ruling. |
| *Memories of Murder* | `Bong Joon-ho` vs TMDB `Bong Joon Ho` | Same settled exact-name ruling. |
| *Mickey 17* | `Bong Joon-ho` vs TMDB `Bong Joon Ho` | Same settled exact-name ruling. |
| *My Neighbor Totoro* | Match Cut year 1993 vs TMDB origin year 1988 | Standing international policy applies: card year follows the first qualifying U.S. theatrical run. The Streamline dub opened in the U.S. on 1993-05-07 ([GKIDS](https://gkids.com/films/my-neighbor-totoro/), [TMDB release evidence](https://www.themoviedb.org/movie/8392/releases?language=en-US)). |

No line above creates a new exception, so nothing is appended to the ours-correct ledger.

## Date adjudication

The raw date report is evidence, not an auto-merge source. These are the material corrections and traps resolved during review:

- *Ex Machina* → `2015-04-10`, card year 2015. A24 classifies it as a 2015 film and its first public U.S. theatrical run began April 10 ([A24](https://a24films.com/films/ex-machina)).
- *My Neighbor Totoro* → `1993-05-07`, card year 1993. The unsupported 1990 TMDB type-3 row is rejected in favor of the sourced Streamline limited opening.
- *Oldboy* → `2005-03-25`, card year 2005. The March 11 row is a film-festival screening and therefore excluded; March 25 is the public U.S. opening ([Rotten Tomatoes](https://www.rottentomatoes.com/m/oldboy)).
- *RRR* → `2022-03-25`, card year 2022. The March 30 TMDB row is not the first U.S. public release ([Box Office Mojo](https://www.boxofficemojo.com/release/rl641303297/)).
- *Wicked* remains `2024-11-22`; the earlier influencer event is already ruled out in `docs/tmdb-rulings.md`.
- *KPop Demon Hunters* remains undated. Netflix identifies June 20 as an only-on-Netflix premiere; the August sing-along was a later theatrical event, so the existing `Soul` streaming-only class applies ([Netflix Tudum](https://www.netflix.com/tudum/articles/kpop-demon-hunters-release-date-cast-news?inapp=true)).
- Re-release rows for *Cars*, *Avatar*, *Shaun of the Dead*, *Princess Mononoke*, *Howl's Moving Castle*, *Halloween*, *Sinners*, and *One Battle After Another* do not displace their earliest qualifying openings.
- The *School of Rock* and *Amélie* match warnings are query-string artifacts: the final card titles are the intended common U.S. title and accented title respectively.

## Screenplay-only and performance review

TMDB writing-department lists were not bulk accepted. The draft excludes source authors, story-only contributors, character creators, lyricists, and uncredited rewrites. Material corrections included:

- *The Iron Giant*: Tim McCanlies only for the original theatrical screenplay credit; Brad Bird's screen-story credit is excluded.
- *The Rock*: David Weisberg, Douglas S. Cook, and Mark Rosner; Jonathan Hensleigh's uncredited rewrite is excluded ([AFI Catalog](https://catalog.afi.com/Film/62123-THE-ROCK)).
- *Malcolm X*: Arnold Perl and Spike Lee; James Baldwin is not a credited screenplay writer on the finished film.
- *Selma*: Paul Webb is the credited screenwriter; Ava DuVernay's uncredited rewrite is not represented.
- Bong Joon-ho is normalized byte-for-byte across director and writer fields.
- Archive/cut-film links were removed from *Vice*. Retained deep-cast names represent real performances, including voice performances and genuine cameos.

## Merge authorization boundary

The selected slate contains no unresolved new metadata judgment. It may proceed through the local merge and verification pipeline. This does not authorize a commit, push, deployment, generated artwork, or a Solo/Duel pool cutover.
