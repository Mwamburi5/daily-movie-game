import { motion, useReducedMotion } from 'framer-motion'
import type { Movie } from '../data/types.ts'
import { isWild } from '../lib/duel.ts'

export type CardSize = 'hand' | 'raised' | 'pile'

const DIMS = {
  hand: {
    w: 96,
    h: 144,
    pad: 'p-1.5',
    title: 'text-[13px]',
    meta: 'text-[10px]',
    backTitle: 'text-[10px]',
    backBody: 'text-[7px]',
    backPad: 'p-2',
  },
  raised: {
    w: 188,
    h: 282,
    pad: 'p-2.5',
    title: 'text-[21px]',
    meta: 'text-[13px]',
    backTitle: 'text-[16px]',
    backBody: 'text-[11px]',
    backPad: 'p-4',
  },
  // Two of these sit side by side under Double Feature, so the pile card is sized
  // to fit a pair plus the deck on a ~420px board.
  pile: {
    w: 124,
    h: 186,
    pad: 'p-1.5',
    title: 'text-[14px]',
    meta: 'text-[10px]',
    backTitle: 'text-[11px]',
    backBody: 'text-[8px]',
    backPad: 'p-2.5',
  },
} as const

interface FaceProps {
  movie: Movie
  size: CardSize
  flat?: boolean
}

function FrontFace({ movie, size, flat }: FaceProps) {
  const d = DIMS[size]
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-xl shadow-[0_8px_22px_rgba(40,32,18,0.25)]"
      style={{
        background: movie.posterColor,
        backfaceVisibility: flat ? undefined : 'hidden',
        WebkitBackfaceVisibility: flat ? undefined : 'hidden',
      }}
    >
      <div className={`flex h-full flex-col ${d.pad}`}>
        <div className="flex h-full flex-col rounded-lg p-2 ring-1 ring-inset ring-white/30">
          <span className={`font-extrabold leading-[1.1] text-white ${d.title}`}>
            {movie.title}
          </span>
          <span className={`mt-auto font-semibold tracking-wide text-white/70 ${d.meta}`}>
            {movie.year} · {movie.genre}
          </span>
        </div>
      </div>
    </div>
  )
}

function BackFace({ movie, size, flat }: FaceProps) {
  const d = DIMS[size]
  return (
    <div
      className={`absolute inset-0 overflow-hidden rounded-xl bg-[#fcf9f2] shadow-[0_8px_22px_rgba(40,32,18,0.25)] ${d.backPad}`}
      style={{
        transform: flat ? undefined : 'rotateY(180deg)',
        backfaceVisibility: flat ? undefined : 'hidden',
        WebkitBackfaceVisibility: flat ? undefined : 'hidden',
        borderTop: `5px solid ${movie.posterColor}`,
      }}
    >
      <div className={`flex h-full flex-col overflow-hidden leading-snug ${d.backBody}`}>
        <div className={`font-extrabold leading-tight text-[#23211c] ${d.backTitle}`}>
          {movie.title}
        </div>
        <div className="mb-1.5 font-medium text-[#8a8270]">{movie.year}</div>
        <div className="font-bold uppercase tracking-wider text-[#8a8270]">Director</div>
        <div className="mb-1 font-semibold text-[#23211c]">{movie.director.join(', ')}</div>
        <div className="font-bold uppercase tracking-wider text-[#8a8270]">Writers</div>
        <div className="mb-1 font-semibold text-[#23211c]">{movie.writers.join(', ')}</div>
        <div className="font-bold uppercase tracking-wider text-[#8a8270]">Cast</div>
        <div className="font-semibold text-[#23211c]">
          {movie.topCast.map((n) => (
            <div key={n}>{n}</div>
          ))}
        </div>
        {movie.deepCast && movie.deepCast.length > 0 && (
          <div className="mt-auto pt-1 font-bold uppercase tracking-wider text-[#a3411a]">
            +{movie.deepCast.length} deeper credits
          </div>
        )}
      </div>
    </div>
  )
}

// A mechanical wild: no real credits to flip to, so it shows one gold face that
// reads as universal — "plays anywhere · meld filler". No 3D spin.
function WildFace({ movie, size }: { movie: Movie; size: CardSize }) {
  const d = DIMS[size]
  return (
    <div className="relative" style={{ width: d.w, height: d.h }}>
      <div
        className="absolute inset-0 overflow-hidden rounded-xl shadow-[0_8px_22px_rgba(40,32,18,0.25)]"
        style={{ background: 'linear-gradient(150deg, #d8b24a 0%, #b98a25 100%)' }}
      >
        <div className={`flex h-full flex-col items-center justify-center text-center ${d.pad}`}>
          <span className="text-2xl leading-none text-white">★</span>
          <span className={`mt-0.5 font-extrabold uppercase tracking-[0.2em] text-white/90 ${d.meta}`}>
            Wild
          </span>
          <span className={`mt-1 font-black italic leading-[1.05] text-white ${d.title}`}>
            {movie.title}
          </span>
          <span className={`mt-auto font-semibold leading-tight text-white/80 ${d.meta}`}>
            plays anywhere · meld filler
          </span>
        </div>
      </div>
    </div>
  )
}

export function CardView({
  movie,
  faceUp,
  size,
}: {
  movie: Movie
  faceUp: boolean
  size: CardSize
}) {
  const reduce = useReducedMotion()
  const d = DIMS[size]

  if (isWild(movie.id)) return <WildFace movie={movie} size={size} />

  // Reduced motion: crossfade faces instead of a 3D spin.
  if (reduce) {
    return (
      <div className="relative" style={{ width: d.w, height: d.h }}>
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: faceUp ? 0 : 1 }}
          transition={{ duration: 0.15 }}
        >
          <FrontFace movie={movie} size={size} flat />
        </motion.div>
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: faceUp ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <BackFace movie={movie} size={size} flat />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative" style={{ width: d.w, height: d.h, perspective: 1000 }}>
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{ rotateY: faceUp ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      >
        <FrontFace movie={movie} size={size} />
        <BackFace movie={movie} size={size} />
      </motion.div>
    </div>
  )
}
