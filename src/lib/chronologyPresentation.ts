import type { ChronologyCard } from './chronology.ts'

// Presentation only: the pool, IDs and ordering keys remain canonical.
export function chronologyTitle(card: Pick<ChronologyCard, 'id' | 'title' | 'year'>): string {
  // The credited movie record identifies this adaptation without giving its year.
  if (card.id === 'frankenstein-2025') return 'Frankenstein (del Toro)'
  return card.title.replace(new RegExp(`\\s+\\(${card.year}\\)$`), '')
}

// Test hooks are also DOM: disambiguation years must not hide there. Numbers
// intrinsic to titles (1917, Blade Runner 2049) keep their existing hooks.
export function chronologyDomId(card: Pick<ChronologyCard, 'id' | 'title' | 'year'>): string {
  const suffix = `-${card.year}`
  return card.id.endsWith(suffix) && !chronologyTitle(card).includes(String(card.year))
    ? `${card.id.slice(0, -suffix.length)}-edition`
    : card.id
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function chronologyDateLabel(card: Pick<ChronologyCard, 'releaseDate' | 'year'>): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(card.releaseDate)
  if (!match) return `${card.year} · exact date unavailable`
  const [, year, month, day] = match
  const parsed = new Date(`${card.releaseDate}T12:00:00Z`)
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== card.releaseDate) {
    return `${card.year} · exact date unavailable`
  }
  return `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`
}

export function chronologyOrderNote(card: ChronologyCard, line: ChronologyCard[]): string {
  const sameDay = line.find((other) => other.id !== card.id && other.releaseDate === card.releaseDate)
  if (sameDay) return `Same release day as ${sameDay.title}; fixed catalogue order breaks the tie.`
  return 'First U.S. theatrical opening; limited releases count. Same-year films use the exact date.'
}
