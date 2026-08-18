// Global search index — built once at module load from all data sources.
// Returns { results } for a given query string.
// Each result: { page, pageLabel, title, excerpt }
import { useEffect, useState } from 'react'

// Strip HTML tags for plain-text excerpt
function stripHtml(str) {
  return str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function excerpt(text, query, maxLen = 120) {
  const plain = stripHtml(text)
  const idx = plain.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return plain.slice(0, maxLen) + (plain.length > maxLen ? '…' : '')
  const start = Math.max(0, idx - 40)
  const snippet = plain.slice(start, start + maxLen)
  return (start > 0 ? '…' : '') + snippet + (start + maxLen < plain.length ? '…' : '')
}

let indexPromise

// Load the large content collections only when search is first used. Route-level
// code splitting can then keep them out of the home page's initial download.
async function getIndex() {
  if (indexPromise) return indexPromise

  indexPromise = Promise.all([
    import('../data/glossary'),
    import('../data/topics'),
    import('../data/flashcards'),
    import('../data/walkthroughs'),
    import('../data/troubleshooting'),
    import('../data/practiceExams'),
  ]).then(([glossary, learn, flashcards, walkthroughData, troubleshooting, practice]) => [
  // Glossary
  ...glossary.glossaryTerms.map(t => ({
    page: 'glossary', pageLabel: 'Glossary', id: t.term,
    title: t.abbr ? `${t.term} (${t.abbr})` : t.term,
    body: t.def,
  })),
  // Learn topics
  ...learn.topics.map(t => ({
    page: 'learn', pageLabel: 'Learn', id: t.id,
    title: t.label,
    body: stripHtml(t.content),
  })),
  // Flashcards
  ...flashcards.allCards.map((c, i) => ({
    page: 'flashcards', pageLabel: 'Flashcards', id: `fc-${i}`,
    title: c.q,
    body: c.opts.join(' · ') + ' — ' + c.explanation,
  })),
  // Walkthroughs
  ...walkthroughData.walkthroughs.map(w => ({
    page: 'walkthroughs', pageLabel: 'Walkthroughs', id: w.id,
    title: w.title,
    body: w.desc + ' ' + w.steps.map(s => s.h + ' ' + s.b).join(' '),
  })),
  // Troubleshooting sections
  ...troubleshooting.troubleshootingSections.map(s => ({
    page: 'troubleshooting', pageLabel: 'Troubleshooting', id: s.id,
    title: s.label,
    body: s.desc + ' ' + [
      ...s.basic.map(c => c.cmd + ' ' + c.desc),
      ...(s.expert || []).map(c => c.cmd + ' ' + c.desc),
    ].join(' '),
  })),
  // Practice exams
  ...practice.practiceExams.map(e => ({
    page: 'practice', pageLabel: 'Practice', id: e.id,
    title: e.title,
    body: e.desc + ' ' + e.tasks.map(t => t.title + ' ' + t.objective).join(' '),
  })),
  ])

  return indexPromise
}

const MAX_RESULTS = 40

export function useSearch(query) {
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const q = query.trim().toLowerCase()
    let cancelled = false

    if (q.length < 2) {
      setResults([])
      setIsLoading(false)
      return () => { cancelled = true }
    }

    setIsLoading(true)
    getIndex().then(index => {
      if (cancelled) return
      setResults(index
        .filter(item =>
          item.title.toLowerCase().includes(q) ||
          item.body.toLowerCase().includes(q)
        )
        .slice(0, MAX_RESULTS)
        .map(item => ({
          page: item.page,
          pageLabel: item.pageLabel,
          id: item.id,
          title: item.title,
          excerpt: excerpt(item.body, q),
        })))
      setIsLoading(false)
    }).catch(() => {
      if (cancelled) return
      setResults([])
      setIsLoading(false)
    })

    return () => { cancelled = true }
  }, [query])

  return { results, isLoading }
}
