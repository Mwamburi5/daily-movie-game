# Chronology Reel design QA

## Comparison targets

- Source visual truth: `design_handoff_the_stub/chronology_reel/chronology-reel-390x844.png`
- Source visual truth: `design_handoff_the_stub/chronology_reel/chronology-reel-375x667.png`
- Implementation: `/tmp/chronology-reel-evidence/390-checkpoint-refined.png` at 390x844
- Implementation: `/tmp/chronology-reel-evidence/375-checkpoint-refined.png` at 375x667
- Full-view comparisons:
  - `/Users/mwamburi/.codex/visualizations/2026/07/12/019f5726-a577-7a81-b225-3c1c5963aaa4/chronology-reel-390-side-by-side.png`
  - `/Users/mwamburi/.codex/visualizations/2026/07/12/019f5726-a577-7a81-b225-3c1c5963aaa4/chronology-reel-375-side-by-side.png`
- State: full native reel with three readable central cards, clipped outer
  slivers, one raised card, selected amber insertion target, instruction, and
  four remaining fan cards.

Focused-region comparison was not separated from the full view: at these mobile
viewport sizes the full-resolution side-by-sides keep the header type, marker
row, card titles, target markers, raised-card glow, instruction, and hand cards
legible together.

## Findings

- No actionable P0/P1/P2 mismatch remains.
- Fonts and typography: the existing Domine, Inter, and JetBrains Mono families
  preserve the approved hierarchy. Titles remain whole and legible at both reel
  sizes; no truncation or mid-word breaking was observed.
- Spacing and layout: the implementation preserves three flat readable central
  cards, 14px rail gaps, clipped slivers, and separate reel/feedback/raised/
  instruction/hand zones. The 375x667 DOM check found zero off-viewport hand or
  raised cards.
- Colors and tokens: navy, cream, paper, amber, slate, and restrained teal use
  the existing Stub tokens. The amber target is singular; all other available
  gaps remain quiet slate.
- Image and asset fidelity: the screen is code-native UI and uses the existing
  ticket components; no reference image asset was replaced or approximated.
- Copy and content: navigation and instruction copy match the locked wording.
  Movie and score content differs naturally because the evidence is a played
  daily state rather than the static mock.
- Accessibility and behavior: gap targets expose 44x44 buttons with neighbor
  labels, the centered movie is announced with its position, and pre-placement
  cards contain zero four-digit year answers in the DOM.

## Comparison history

1. Initial pass: P1 at the full-reel right edge. A settled card's mounted hidden
   3D back face composited as black rectangles once nested inside the reel
   transform. Fix: BackFace now mounts only for an actual flip; settled public
   years stay on the front. Post-fix evidence:
   `/tmp/chronology-reel-evidence/375-full-right-fixed.png`.
2. Initial pass: P2 raised card and hand density were larger than the approved
   hierarchy. Fix: dedicated numeric raised/compact/hand sizes and shorter fan
   curves. Post-fix evidence is the two final side-by-sides above.

## Tested interactions

- native swipe and normalized marker progress at left, center, and right
- raised card, moving target resolver, guarded blocked-edge release, and
  edge-hold auto-scroll
- clean placement, misfire flip/correction, toast, final-card placement, and
  tap-a-gap fallback
- reduced-motion capture at
  `/tmp/chronology-reel-evidence/375-reduced-motion.png`
- console errors checked in the in-app browser

## Follow-up polish

- P3: the image-generated references draw taller reel tickets than the locked
  written geometry. The implementation intentionally follows the acceptance
  numbers: 100x142 at 390x844 and 88x126 at 375x667.

final result: passed
