import { useEffect, useState } from 'react'
import { localDateSeed } from './daily.ts'

// Live calendar for recommendations only. Games keep their own mount-time
// seed, so midnight can refresh the program without replacing an active deal
// or the result that was earned before midnight.
export function useLocalDateSeed(): string {
  const [seed, setSeed] = useState(() => localDateSeed())
  useEffect(() => {
    let timer: number
    const refresh = () => {
      window.clearTimeout(timer)
      const now = new Date()
      setSeed(localDateSeed(now))
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      timer = window.setTimeout(refresh, Math.max(1, midnight.getTime() - now.getTime() + 50))
    }
    refresh()
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])
  return seed
}
