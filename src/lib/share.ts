// The family share format — every mode ends with the same three lines: a brand
// line, the score in that mode's own words, and a 🎬-led emoji row. Lifted from
// ChronologyGame (the app's first copy action) so Solo and Duel read as siblings.
// Brand renamed Marquee → Match Cut 2026-07-04 (domains bought; "marquee" lives
// on as the Duel pile term only).
export function matchCutShare(mode: string, scoreLine: string, emoji: string): string {
  return `Match Cut · ${mode}\n${scoreLine}\n${emoji}`
}

// Best-effort copy: the async Clipboard API where it exists (needs the click's
// user gesture + a secure context), else a hidden-textarea execCommand fallback
// for older / insecure-origin browsers. Returns whether the copy landed so the
// UI can show "copied" or a manual-copy fallback.
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // permission denied / insecure origin — fall through to the legacy path
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.top = '-1000px'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}
