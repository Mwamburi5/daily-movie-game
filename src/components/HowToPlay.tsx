import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MOTION } from '../lib/motion.ts'
import Icon from './Icon.tsx'
import { useDialogA11y } from './useDialogA11y.ts'

export type HelpContext = 'overview' | 'solo' | 'chronology' | 'connections' | 'duel'

type HelpSection = {
  title: string
  items: string[]
  ordered?: boolean
}

type ModeHelp = {
  label: string
  objective: string
  sections: HelpSection[]
  details: HelpSection[]
}

const MODE_HELP: Record<Exclude<HelpContext, 'overview'>, ModeHelp> = {
  solo: {
    label: 'Daily Puzzle',
    objective: 'Connect every card in your hand to the pile in as few moves as possible.',
    sections: [
      {
        title: 'What you do',
        ordered: true,
        items: [
          'Choose a hand card, then tap it or press Enter to raise it.',
          'Drag the raised card to the pile, or activate the pile by keyboard, when the movies share a valid credit.',
          'If you need a clue, tap the pile or raised card to flip for credits. Keep connecting until your hand is empty.',
        ],
      },
      {
        title: 'Golf score and par',
        items: [
          'The first credits flip on a card costs +1. Flipping that card again is free.',
          'An invalid play costs +2. Consecutive links through the same person can earn strokes back. Low score wins against the day’s computed par.',
        ],
      },
      {
        title: 'Actions and terms',
        items: [
          'Tap or press Enter to raise; drag to the pile or activate the pile to play; Escape returns a raised card to its rack slot.',
          'A deep cut is a valid link through a notable credit that is not printed on the face. The round DEEP CUT stamp marks films that carry those hidden credits.',
          'When no card can connect, the run is Stuck and you may reveal one valid solution.',
        ],
      },
      {
        title: 'Daily and practice',
        items: [
          'The daily is the same solver-proven hand for everyone on your local calendar day. Practice replays the original hand-designed puzzle.',
        ],
      },
    ],
    details: [
      {
        title: 'Full rules for Daily Puzzle',
        items: [
          'Cards connect through shared actors, directors, or writers. The pile’s top card is the only card your next play must connect to.',
          'A same-person chain keeps narrowing to the names shared by consecutive plays; each extra card after the first link earns one stroke back.',
          'A daily replay deals the same board. A practice result is labelled practice, and share output stays URL-free.',
        ],
      },
    ],
  },
  chronology: {
    label: 'Chronology',
    objective: 'Place ten hidden-year movie titles into one older-to-newer line.',
    sections: [
      {
        title: 'What you do',
        ordered: true,
        items: [
          'Choose a title without seeing its year, then tap it or press Enter to raise it.',
          'Read the reel from older on the left to newer on the right and choose any legal gap.',
          'Drag the raised card to that gap, or activate the gap by keyboard. Correct cards stay; mistakes reveal and move to their true place.',
        ],
      },
      {
        title: 'Strokes and streaks',
        items: [
          'A clean placement costs 0. A misfire costs +1 stroke. Three clean placements in a row earn one stroke back.',
          'A clean placement in a gap whose neighbors are only a few years apart arms tight-call mercy: your next misfire keeps the streak but spends that shield.',
        ],
      },
      {
        title: 'Actions and terms',
        items: [
          'Every gap, including the older and newer ends, is legal and keyboard reachable. Swipe the reel when the placed line grows wider than the screen.',
          'Escape returns the raised title to its tray slot. Years remain hidden until placement; same-year order is decided by exact release date.',
        ],
      },
      {
        title: 'Daily and practice',
        items: [
          'The daily line is shared for your local calendar day. Wide practice spreads films across decades; Tight practice bunches them into the same era. The dial changes only the deal, never the rules or score.',
        ],
      },
    ],
    details: [
      {
        title: 'Full rules for Chronology',
        items: [
          'The line is always kept in true chronological order. A wrong choice reveals the year, adds one stroke, and corrects itself so the next decision remains fair.',
          'An open-ended start or end gap never arms mercy. When two films share a year, the feedback says that the exact date decided the order.',
          'The round ends only when all ten hand cards are placed. A daily replay uses the same line; practice deals a fresh round.',
        ],
      },
    ],
  },
  connections: {
    label: 'Connections',
    objective: 'Sort sixteen movie titles into four hidden groups of four.',
    sections: [
      {
        title: 'What you do',
        ordered: true,
        items: [
          'Select four movie tickets you think share one director, actor, series, or genre.',
          'Use Deselect to clear the picks, Shuffle to reorder the board, and Submit when four are selected.',
          'A solve locks and names the group. Keep going until all four groups are found or the mistakes run out.',
        ],
      },
      {
        title: 'Four mistakes',
        items: [
          'A wrong submission spends one of four mistakes. One away means three selected movies belong to the same hidden group; a miss means they do not.',
          'A loss reveals the remaining groups on the board. It never claims that those groups were found.',
        ],
      },
      {
        title: 'Today’s Bill',
        items: [
          'Category types may repeat, and at most one group is a genre. Today’s Bill names the exact remaining category multiset, such as Actor ×3 · Genre ×1.',
          'The Bill never maps a category to a particular tile, solved-band color, or share color. Every movie belongs to exactly one group.',
        ],
      },
      {
        title: 'Daily and practice',
        items: [
          'The daily grid is the same baked, verified board for everyone on your local calendar day. Random grid starts a fresh verified practice board.',
        ],
      },
    ],
    details: [
      {
        title: 'Full rules for Connections',
        items: [
          'Solved groups leave the 4×4 sorting field as labelled tickets. Selection order is shown only to help you revise a guess.',
          'Shuffle changes presentation only. It does not change group membership, the deal, or the answer.',
          'After a loss, See the revealed groups steps aside from the result ticket so every answer remains readable.',
        ],
      },
    ],
  },
  duel: {
    label: 'Duel vs Computer',
    objective: 'Take turns linking movies across two marquees and finish with the highest net score.',
    sections: [
      {
        title: 'What you do',
        ordered: true,
        items: [
          'On your turn, play one hand card that shares a valid credit with either marquee pile, or draw three and keep one.',
          'Score links, bank Melds, and use your one Final Cut and one Recast token when they matter.',
          'The show ends at 20 points, an empty hand, or two passes with an empty deck. Highest net score wins: points minus cards still held.',
        ],
      },
      {
        title: 'Links and scoring',
        items: [
          'Standard links score +1, strong links +2, and super links +4 plus an encore. Meld cards score by their locked Auteur, Actor, Series, or Genre rung.',
          'Reaching 20 rings the bell; it does not override the final net-score comparison.',
        ],
      },
      {
        title: 'Actions and terms',
        items: [
          'Flip any playable card for free to read its printed credits. A deep cut links only through a hidden notable credit.',
          'Meld banks 3+ related films. Final Cut plays any card for +1. Recast cancels an opponent’s super link or Final Cut. Each token can be spent once.',
          'A draw reveals three: keep one, toss one to a marquee for no points, or play a kept card if it connects. A drawn wild is always kept.',
        ],
      },
      {
        title: 'Difficulty',
        items: [
          'Matinee, Feature, and Director’s Cut change the rival’s knowledge, choices, and hint allowance. They do not change the rules, scoring, deck, or your legal actions.',
        ],
      },
    ],
    details: [
      {
        title: 'Full rules for Duel',
        items: [
          'A run may chain up to three cards through the same person. A super link grants an unrestricted encore instead.',
          'Take lifts a marquee top that completes a Meld into your hand instead of drawing; bank it on a later turn. A wild covering the pile blocks Take.',
          'A wild scores 0, plays anywhere, and may fill one slot in a person or series Meld. Pass is available only when the deck is empty.',
        ],
      },
    ],
  },
}

const OVERVIEW = [
  ['Daily Puzzle', 'Connect one hand to the pile. Golf scoring: low wins.'],
  ['Chronology', 'Place ten hidden-year titles from older to newer.'],
  ['Connections', 'Sort sixteen titles into four clean groups of four.'],
  ['Duel vs Computer', 'Trade linked plays across two marquees and race to the highest net score.'],
] as const

function Section({ section }: { section: HelpSection }) {
  const List = section.ordered ? 'ol' : 'ul'
  return (
    <section className="rounded-stub-panel border border-stub-navy/15 bg-stub-paper p-4" data-help-section={section.title}>
      <h3 className="font-stub-label text-[11px] font-bold uppercase tracking-[0.12em] text-stub-slate">
        {section.title}
      </h3>
      <List className={`mt-2 space-y-2 pl-5 font-stub-ui text-[14px] leading-relaxed text-stub-navy ${section.ordered ? 'list-decimal' : 'list-disc'}`}>
        {section.items.map((item) => <li key={item}>{item}</li>)}
      </List>
    </section>
  )
}

export default function HowToPlay({
  context,
  onClose,
  onReplayIntro,
}: {
  context: HelpContext
  onClose: () => void
  // Only the overview sheet passes this — the one place a player can ask for
  // the first-run onboarding back. A plain text link, deliberately NOT an
  // <article> or a second expand control: the overview sheet's shape (four
  // cards, no expander) is a tested contract.
  onReplayIntro?: () => void
}) {
  const reduce = useReducedMotion()
  const [expanded, setExpanded] = useState(false)
  const dialogRef = useDialogA11y(onClose)
  const mode = context === 'overview' ? null : MODE_HELP[context]
  const activeMode = mode as ModeHelp
  const label = mode?.label ?? 'all modes'

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`How to play ${label}`}
      tabIndex={-1}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-stub-scrim sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? MOTION.duration.reduced : MOTION.duration.reveal }}
      data-rules
      data-help-context={context}
    >
      <motion.div
        className="flex h-full w-full flex-col overflow-hidden bg-stub-cream sm:max-h-[min(760px,calc(100dvh-32px))] sm:max-w-[760px] sm:rounded-[22px] sm:border-2 sm:border-stub-navy sm:shadow-stub-modal"
        initial={{ opacity: 0, y: reduce ? 0 : 18, scale: reduce ? 1 : 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reduce ? 0 : 18, scale: reduce ? 1 : 0.98 }}
        transition={reduce ? { duration: MOTION.duration.reduced } : MOTION.spring.overlay}
      >
        <header className="flex flex-none items-center justify-between border-b border-stub-navy/15 bg-stub-cream px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <p className="font-stub-label text-[10px] font-bold uppercase tracking-[0.16em] text-stub-amber">Match Cut</p>
            <h2 className="truncate font-stub-display text-[28px] font-bold leading-tight text-stub-navy sm:text-[32px]">
              How to Play
            </h2>
            <p className="font-stub-ui text-[14px] font-semibold text-stub-slate">{label}</p>
          </div>
          <button
            type="button"
            aria-label="Close rules"
            data-rules-close
            onClick={onClose}
            className="flex h-11 w-11 flex-none items-center justify-center rounded-stub-pill bg-stub-navy text-lg text-stub-cream shadow-stub-card-resting active:scale-90"
          >
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7" data-rules-body>
          {context === 'overview' ? (
            <>
              <p className="max-w-[620px] font-stub-ui text-[15px] leading-relaxed text-stub-navy">
                Four ways to play with movies. Pick the kind of challenge you want; each game explains only its own rules once you enter.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2" data-help-overview>
                {OVERVIEW.map(([title, copy]) => (
                  <article key={title} className="relative rounded-stub-panel border-2 border-stub-navy bg-stub-paper p-4 shadow-stub-card-resting">
                    <h3 className="font-stub-display text-[18px] font-bold text-stub-navy">{title}</h3>
                    <p className="mt-1 font-stub-ui text-[14px] leading-relaxed text-stub-slate">{copy}</p>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="max-w-[650px] font-stub-ui text-[16px] font-semibold leading-relaxed text-stub-navy">
                {activeMode.objective}
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {activeMode.sections.map((section) => <Section key={section.title} section={section} />)}
              </div>
              <button
                type="button"
                data-rules-expand
                aria-expanded={expanded}
                onClick={() => setExpanded((value) => !value)}
                className="mt-4 min-h-12 w-full rounded-stub-pill border-2 border-stub-navy bg-stub-paper px-7 py-3 font-stub-ui text-[14px] font-bold text-stub-navy shadow-stub-card-resting active:scale-[0.99]"
              >
                {expanded ? 'Hide full rules' : `Full rules for ${activeMode.label}`}
              </button>
              {expanded && (
                <div className="mt-3 grid gap-3 md:grid-cols-2" data-rules-expanded>
                  {activeMode.details.map((section) => <Section key={section.title} section={section} />)}
                </div>
              )}
            </>
          )}

          {context === 'overview' && onReplayIntro && (
            <p className="mt-4 text-center">
              <button
                type="button"
                data-replay-intro
                onClick={onReplayIntro}
                className="min-h-11 px-2 font-stub-ui text-[13px] font-semibold text-stub-slate underline underline-offset-4 active:text-stub-navy"
              >
                Watch the intro again
              </button>
            </p>
          )}

          <section className="mt-5 border-t border-stub-slate-light/40 pt-4" data-tmdb-attribution>
            <h3 className="font-stub-label text-[11px] font-bold uppercase tracking-wider text-stub-slate">About the data</h3>
            <img src="/tmdb-logo.svg" alt="TMDB" className="mb-2 mt-2 h-3 w-auto" />
            <p className="font-stub-ui text-[12px] leading-relaxed text-stub-slate">
              This product uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.
            </p>
          </section>

        </div>

        <footer className="flex-none border-t border-stub-navy/15 bg-stub-cream px-5 py-3 sm:px-7" data-rules-footer>
          <button
            type="button"
            data-rules-primary
            onClick={onClose}
            className="min-h-12 w-full rounded-stub-pill bg-stub-amber px-7 py-3 font-stub-ui text-[15px] font-bold text-stub-navy shadow-stub-card-resting active:scale-[0.99]"
          >
            {context === 'overview' ? 'Got it — choose a mode' : 'Got it — keep playing'}
          </button>
        </footer>
      </motion.div>
    </motion.div>
  )
}
