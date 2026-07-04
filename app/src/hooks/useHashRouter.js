// Hash-based router — reads/writes window.location.hash
// Format: /#/<pageId>
// No dependencies, no server config changes needed.
import { useState, useEffect, useCallback } from 'react'

const VALID_PAGES = new Set([
  'home', 'learn', 'flashcards', 'walkthroughs',
  'glossary', 'troubleshooting', 'practice',
])

function readHash() {
  const raw = window.location.hash.replace(/^#\/?/, '') // strip #/ or #
  return VALID_PAGES.has(raw) ? raw : 'home'
}

export function useHashRouter() {
  const [page, setPage] = useState(readHash)

  // Keep state in sync when hash changes externally (back/forward)
  useEffect(() => {
    const onHashChange = () => setPage(readHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((id) => {
    const target = VALID_PAGES.has(id) ? id : 'home'
    window.location.hash = `/${target}`
    setPage(target)
    window.scrollTo(0, 0)
  }, [])

  return { page, navigate }
}
