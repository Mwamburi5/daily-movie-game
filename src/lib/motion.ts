// Shared runtime motion values. CSS owns visual duration/easing tokens; Framer
// springs live here because components need numeric physics at runtime.
export const MOTION = {
  duration: {
    press: 0.1,
    reduced: 0.15,
    reveal: 0.25,
    result: 0.35,
  },
  spring: {
    settle: { type: 'spring', stiffness: 320, damping: 24 },
    raised: { type: 'spring', stiffness: 340, damping: 26 },
    overlay: { type: 'spring', stiffness: 320, damping: 26 },
  },
  easing: {
    standard: [0.16, 1, 0.3, 1],
  },
} as const
