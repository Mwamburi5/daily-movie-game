# Chronology Reel acceptance references

These images are the approved visual targets for the mobile Chronology reel.
`chronology-reel-390x844.png` is the approved source mock (native export
852x1846, representing a 390x844 viewport). The compact 375x667 reference is a
separate fitted composition, not a crop of the tall layout.

## Interaction

- The settled timeline remains a native, momentum-scrolling horizontal rail.
- Three central movie cards form a readable, nearly flat plateau. Scale,
  rotation, opacity, depth, and vertical falloff begin on the first card
  outside those three; farther cards are viewport-clipped edge slivers.
- Raising a hand card adds a restrained teal selection glow. Dragging remains
  the primary placement action; tapping a gap is the accessible fallback.
- Every available gap has a quiet slate line. Only the nearest valid gap is
  amber, with top and bottom markers. Outside and blocked-edge releases never
  score.
- The seven navigation markers show normalized progress across the complete
  reel. The elongated amber marker identifies the current progress segment,
  while assistive text announces the centered movie and its position.

## Geometry

| Viewport | Reel card | Reel outcome |
| --- | --- | --- |
| 390x844 | approximately 100x142px | three readable central cards; 12-16px visual pitch; clipped outer slivers |
| 375x667 | approximately 88x126px | smaller, raised reel and hand card; compact vertical spacing; the same three-card plateau |

The flat rail owns all measurement, scrolling, and centering geometry. Framer
Motion owns the raised-to-line flight on the nested `layoutId` element. Reel
perspective transforms belong only to a visual wrapper inside that element.
Nothing in either viewport may collide with the navigation, feedback, active
target, raised card, instruction, or hand.
