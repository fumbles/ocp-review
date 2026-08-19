// Hash-based router — reads/writes window.location.hash
// Format: /#/<pageId>/<optional encoded item id>
// No dependencies, no server config changes needed.
import { useState, useEffect, useCallback } from 'react'

const VALID_PAGES = new Set([
  'home', 'learn', 'flashcards', 'walkthroughs',
  'glossary', 'troubleshooting', 'practice', 'paths', 'exam', 'visuals',
])

function readHash() {
  const raw = window.location.hash.replace(/^#\/?/, '') // strip #/ or #
  const [pagePart, ...targetParts] = raw.split('/')
  const page = VALID_PAGES.has(pagePart) ? pagePart : 'home'

  let targetId = null
  if (page !== 'home' && targetParts.length) {
    try {
      targetId = decodeURIComponent(targetParts.join('/')) || null
    } catch {
      targetId = null
    }
  }

  return { page, targetId }
}

export function useHashRouter() {
  const [route, setRoute] = useState(readHash)

  // Keep state in sync when hash changes externally (back/forward)
  useEffect(() => {
    const onHashChange = () => setRoute(readHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((id, targetId = null) => {
    const target = VALID_PAGES.has(id) ? id : 'home'
    const nextHash = targetId
      ? `/${target}/${encodeURIComponent(targetId)}`
      : `/${target}`
    window.location.hash = nextHash
    setRoute({ page: target, targetId: targetId || null })
    window.scrollTo(0, 0)
  }, [])

  return { ...route, navigate }
}
