import type { ReactNode } from 'react'

export type IconName =
  | 'back'
  | 'close'
  | 'flip'
  | 'help'
  | 'hint'
  | 'restart'
  | 'sort'

const PATHS: Record<IconName, ReactNode> = {
  back: <path d="m15 18-6-6 6-6" />,
  close: (
    <>
      <path d="m7 7 10 10" />
      <path d="m17 7-10 10" />
    </>
  ),
  flip: (
    <>
      <path d="M7 7h10l-2.5-2.5" />
      <path d="m17 7-2.5 2.5" />
      <path d="M17 17H7l2.5 2.5" />
      <path d="M7 17 9.5 14.5" />
    </>
  ),
  help: (
    <>
      <path d="M9.4 9a2.8 2.8 0 1 1 4.7 2c-1.1.9-2.1 1.4-2.1 3" />
      <path d="M12 18h.01" />
    </>
  ),
  hint: (
    <>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M8.2 14.2a6 6 0 1 1 7.6 0C14.7 15 14 16 14 17h-4c0-1-.7-2-1.8-2.8Z" />
    </>
  ),
  restart: (
    <>
      <path d="M4 11a8 8 0 1 1 2.3 5.7" />
      <path d="M4 5v6h6" />
    </>
  ),
  sort: (
    <>
      <path d="M8 6h11" />
      <path d="M8 12h8" />
      <path d="M8 18h5" />
      <path d="m3.5 16.5 2 2 2-2" />
      <path d="M5.5 18.5v-13" />
    </>
  ),
}

export default function Icon({
  name,
  size = 20,
  className = '',
}: {
  name: IconName
  size?: 16 | 20 | 24
  className?: string
}) {
  return (
    <svg
      aria-hidden="true"
      className={`icon-glyph ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}
