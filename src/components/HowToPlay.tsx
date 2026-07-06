import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mb-7">
    <h3 className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-[#9a917c]">
      {title}
    </h3>
    <div className="space-y-2 text-[13.5px] leading-relaxed text-[#3a352a]">{children}</div>
  </section>
)

const B = ({ children }: { children: ReactNode }) => (
  <strong className="font-bold text-[#23211c]">{children}</strong>
)

const TierPill = ({ bg, children }: { bg: string; children: ReactNode }) => (
  <span
    className="inline-block rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white"
    style={{ background: bg }}
  >
    {children}
  </span>
)

const TokenPill = ({ children }: { children: ReactNode }) => (
  <span className="inline-block rounded-full bg-[#23211c] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-[#f4efe6]">
    {children}
  </span>
)

// Full-screen scrollable rules. Opaque on purpose: it can sit over a live
// duel without losing any game state underneath.
export default function HowToPlay({ onClose }: { onClose: () => void }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className="absolute inset-0 z-[120] overflow-y-auto overscroll-contain bg-[#f4efe6]"
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduce ? 0 : 24 }}
      transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 300, damping: 30 }}
      data-rules
    >
      <div className="mx-auto w-full max-w-[420px] px-5 pb-16">
        <header className="sticky top-0 z-10 -mx-5 mb-4 flex items-center justify-between bg-[#f4efe6]/95 px-5 pb-2 pt-4 backdrop-blur-sm">
          <h2 className="font-serif text-3xl font-black italic tracking-tight">How to Play</h2>
          <button
            type="button"
            aria-label="Close rules"
            data-rules-close
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#23211c] text-lg text-[#f4efe6] shadow-md active:scale-90"
          >
            ✕
          </button>
        </header>

        <Section title="The goal">
          <p>
            Connect movies through the people who made them — actors, directors, writers. Links
            earn points, and every card still in your hand at the end costs <B>−1</B>.
          </p>
          <p>
            The show ends the moment someone reaches <B>20 points</B>, someone plays their last
            card, or the deck is empty and both players pass. Reaching 20 just rings the bell —{' '}
            <B>highest net score wins</B> (points − cards held), even if the other player crossed
            the line first.
          </p>
        </Section>

        <Section title="Reading a card">
          <p>
            The front shows title, year, and genre — the color <B>is</B> the genre family (crime
            reds, sci-fi navies, drama bronzes…).
          </p>
          <p>
            <B>Tap any card to flip it.</B> The back lists the director, writers, and the
            top-billed cast.
          </p>
          <p>
            <span className="font-bold uppercase tracking-wider text-[#a3411a] text-[11px]">
              +N deeper credits
            </span>{' '}
            means the film has more notable names than the card shows. They are hidden — but they
            still count, if you know them.
          </p>
        </Section>

        <Section title="Your turn — pick one">
          <p>
            <B>Play</B> · Tap a card to raise it, then drag it onto <B>either marquee</B> (the two
            top cards — a double feature). It must share at least one person with that marquee's
            top card.
          </p>
          <p>
            <B>Draw</B> · Tap the deck to <B>reveal 3 cards and keep 1</B> (the other two are gone
            for good). Then <B>Keep</B> it in hand, <B>Toss</B> it onto a marquee (no points —
            unstick yourself, or hand your opponent a brick), or drag it to a marquee to play it
            if it connects.
          </p>
          <p>
            <B>Meld</B> · Bank 3+ films that share a through-line — points per card by the{' '}
            <B>ladder</B> below.
          </p>
          <p>
            <B>Lay off</B> · Drag a matching card onto an open meld row for that row's locked
            per-card points.
          </p>
          <p>
            <B>Take</B> · When a marquee's top card would <B>finish a meld</B> for you, a{' '}
            <B>↑ Take</B> button appears on it. Lift the card into your hand <B>instead of
            drawing</B>, then bank the meld next turn. (You can't take a card hidden under a
            wild.)
          </p>
          <p>
            <B>Pass</B> · Only when the deck is empty. Two passes in a row ends the game.
          </p>
        </Section>

        <Section title="Links & points">
          <div className="flex flex-wrap items-center gap-1.5 pb-1">
            <TierPill bg="#23211c">Standard +1</TierPill>
            <TierPill bg="#7a5a10">Strong +2</TierPill>
            <TierPill bg="#a3411a">Super +4</TierPill>
          </div>
          <p>
            <B>Standard +1</B> — one shared actor.
          </p>
          <p>
            <B>Strong +2</B> — a shared director or writer, or two shared people.
          </p>
          <p>
            <B>Super +4</B> — same trilogy, or three+ shared people. A super link is an{' '}
            <B>encore</B>: you immediately play again.
          </p>
        </Section>

        <Section title="Deep cuts">
          <p>
            <span
              className="mr-1.5 inline-block rounded-full bg-[#0f766e] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white"
              style={{ boxShadow: '0 0 10px 2px rgba(45,212,191,0.6)' }}
            >
              Deep cut
            </span>
            A link that runs <B>only through hidden credits</B> — the pile glows teal. Same
            points, eternal respect.
          </p>
        </Section>

        <Section title="Runs">
          <p>
            After you play, if another card in your hand connects through the <B>same person</B>,
            you may chain it — up to <B>3 cards in one turn</B>. The banner counts Run ×2, ×3.
            Tap <B>End turn</B> to stop early.
          </p>
        </Section>

        <Section title="Melds — a ladder">
          <div className="mb-1 flex items-center gap-1 rounded-lg bg-white/60 px-2 py-1 shadow-sm">
            <span className="text-[8px] font-extrabold uppercase tracking-wider text-[#7d7563]">
              De Niro ×3
            </span>
            <span className="h-10 w-7 rounded ring-1 ring-inset ring-white/40" style={{ background: '#7a1f1f' }} />
            <span className="h-10 w-7 rounded ring-1 ring-inset ring-white/40" style={{ background: '#8c2430' }} />
            <span className="h-10 w-7 rounded ring-1 ring-inset ring-white/40" style={{ background: '#4a3960' }} />
          </div>
          <p>
            Tap <B>Meld</B>, select 3+ films sharing a through-line, and bank them into a marquee
            row. The stronger the link, the more each card is worth — <B>highest rung wins</B>:
          </p>
          <p>
            🎬 <B>Auteur +3</B> — the same director or writer.
            <br />⭐ <B>Actor +2</B> — the same actor.
            <br />🎞️ <B>Series +1</B> — the same trilogy or franchise.
            <br />🎟️ <B>Genre +1</B> — 3+ of the same genre (a rescue for stranded cards).
          </p>
          <p>
            A meld is <B>named and scored by its top rung the moment you bank it</B>, and it stays
            that way — a Cillian-Murphy-and-Christopher-Nolan row is a Nolan (Auteur) meld for
            good.
          </p>
          <p>
            Rows are <B>open to both players</B>: on your turn, drag a matching card onto a row to
            lay off for its locked per-card points. Rows light up when your raised card fits.
          </p>
          <p>
            Banked cards leave your hand for good — they can't be played to a marquee, and they
            don't count against you at the end.
          </p>
        </Section>

        <Section title="Wild cards">
          <p>
            Three famous films — <B>12 Angry Men</B>, <B>Casablanca</B>, <B>Citizen Kane</B> — are
            shuffled into the deck as <B>wilds</B> (gold cards). A wild is worth <B>0 points</B>,
            but it's flexible:
          </p>
          <p>
            <B>Plays anywhere</B> — drag it onto either marquee to get unstuck. It sits on top but
            is see-through: the real card underneath still counts for connecting.
          </p>
          <p>
            <B>Fills a meld</B> — one wild plus two real films that share a link make a 3-card
            meld. The wild itself scores 0 (genre melds don't take wilds).
          </p>
        </Section>

        <Section title="Powers — one of each per game">
          <p>
            <TokenPill>Final Cut</TokenPill>{' '}
            Arm it, then play <B>any card</B>, connection or not (+1). If your card turns out to
            connect on its own, the token isn't spent.
          </p>
          <p>
            <TokenPill>Recast</TokenPill>{' '}
            When your opponent lands a <B>super link</B> or a <B>Final Cut</B>, cancel it before
            it resolves: the card goes back, no points, and their turn is spent.
          </p>
          <p>The CPU holds the same two — its pills sit next to its hand count.</p>
        </Section>

        <Section title="Difficulty & hints">
          <p>
            Pick your rival on the menu: <B>Matinee</B> plays casually and reads only the credits
            printed on the cards, <B>Feature</B> is a fair fight, and <B>Director's Cut</B> sees
            everything — including the hidden deeper credits — and plays to deny you.
          </p>
          <p>
            On Matinee and Feature, the <B>◎ Hint</B> button (bottom right) pulses one card in
            your hand that can play — unlimited on Matinee, <B>3 per game</B> on Feature.
            Director's Cut has no hints — recall is the game.
          </p>
        </Section>

        <Section title="The screen">
          <p>
            <B>Score chips</B> (top right) — live points; the ringed chip shows whose turn it is.
          </p>
          <p>
            <B>Deck</B> — tap to draw 3 and keep 1; the number is cards left. Becomes <B>Pass</B>{' '}
            when empty.
          </p>
          <p>
            <B>The two marquees</B> — drag cards onto either one to play; tap a top card to study
            its credits. A <B>↑ Take</B> button appears on a marquee when its top card finishes a
            meld for you.
          </p>
          <p>
            <B>Your hand</B> — tap a card to raise it; <B>press and hold</B>, then slide to
            reorder it. On Matinee, the <B>⇲ Sort</B> button groups shared names together so
            links and melds stand out.
          </p>
          <p>
            <B>Bottom left</B> — your tokens and the Meld button. <B>Bottom right</B> — the Hint
            button (easier difficulties). <B>Top</B> — the CPU's cards and its remaining tokens.
          </p>
        </Section>

        <Section title="Daily puzzle (solo)">
          <p>
            One hand, golf scoring — <B>low wins</B>: every card you flip costs <B>+1</B>, invalid
            plays cost <B>+2</B>, and chaining through the same person earns strokes back. Clear
            the whole hand and beat par.
          </p>
          <p>
            It's a true daily: everyone gets the <B>same hand on the same day</B> (your day rolls
            over at your own midnight), and every daily is <B>guaranteed solvable</B>. <B>Par</B>{' '}
            is set by a solver that prices the best possible line — a combo-rich hand means a
            tougher par. The <B>practice</B> button on the menu replays the original hand-designed
            puzzle any time.
          </p>
        </Section>

        <Section title="Chronology (solo)">
          <p>
            No links at all — just <B>when</B>. Slot each movie into the line where you think it
            belongs in time, older to the left. Right slot, it sticks; wrong slot, the card flips
            to show its real year, snaps to where it goes, and costs <B>+1 stroke</B>.
          </p>
          <p>
            Golf scoring — <B>low wins</B>. Three clean placements in a row earn a stroke back,
            and a brave call (landing a card between two close years) shields your streak from
            the next miss. The line only tightens: the first card is a gimme, the last might be
            threading 1997 between 1995 and 1999.
          </p>
        </Section>

        {/* TMDB free-tier attribution — required alongside any TMDB-derived
            data in the pool (docs/tmdb-plan.md "Obligations"). */}
        <section className="mb-7 border-t border-[#d8d0bd] pt-5" data-tmdb-attribution>
          <h3 className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-[#9a917c]">
            About the data
          </h3>
          <img src="/tmdb-logo.svg" alt="TMDB" className="mb-2 h-3 w-auto" />
          <p className="text-[11px] leading-relaxed text-[#9a917c]">
            This product uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise
            approved by TMDB.
          </p>
        </section>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 min-h-12 w-full rounded-full bg-[#23211c] px-7 py-3 text-[15px] font-bold text-[#f4efe6] shadow-md active:scale-95"
        >
          Got it — deal me in
        </button>
      </div>
    </motion.div>
  )
}
