// Global search index — built once at module load from all data sources.
// Returns { results } for a given query string.
// Each result: { page, pageLabel, title, excerpt }
import { useMemo } from 'react'
import { glossaryTerms } from '../data/glossary'
import { topics } from '../data/topics'
import { allCards } from '../data/flashcards'
import { walkthroughs } from '../data/walkthroughs'
import { troubleshootingSections } from '../data/troubleshooting'
import { practiceExams } from '../data/practiceExams'

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

// Build a flat index once — each entry is { page, pageLabel, title, body, id }
const INDEX = [
  // Glossary
  ...glossaryTerms.map(t => ({
    page: 'glossary', pageLabel: 'Glossary', id: t.term,
    title: t.abbr ? `${t.term} (${t.abbr})` : t.term,
    body: t.def,
  })),
  // Learn topics
  ...topics.map(t => ({
    page: 'learn', pageLabel: 'Learn', id: t.id,
    title: t.label,
    body: stripHtml(t.content),
  })),
  // Flashcards
  ...allCards.map((c, i) => ({
    page: 'flashcards', pageLabel: 'Flashcards', id: `fc-${i}`,
    title: c.q,
    body: c.opts.join(' · ') + ' — ' + c.explanation,
  })),
  // Walkthroughs
  ...walkthroughs.map(w => ({
    page: 'walkthroughs', pageLabel: 'Walkthroughs', id: w.id,
    title: w.title,
    body: w.desc + ' ' + w.steps.map(s => s.h + ' ' + s.b).join(' '),
  })),
  // Troubleshooting sections
  ...troubleshootingSections.map(s => ({
    page: 'troubleshooting', pageLabel: 'Troubleshooting', id: s.id,
    title: s.label,
    body: s.desc + ' ' + [
      ...s.basic.map(c => c.cmd + ' ' + c.desc),
      ...(s.expert || []).map(c => c.cmd + ' ' + c.desc),
    ].join(' '),
  })),
  // Practice exams
  ...practiceExams.map(e => ({
    page: 'practice', pageLabel: 'Practice', id: e.id,
    title: e.title,
    body: e.desc + ' ' + e.tasks.map(t => t.title + ' ' + t.objective).join(' '),
  })),
]

const MAX_RESULTS = 40

export function useSearch(query) {
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    return INDEX
      .filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q)
      )
      .slice(0, MAX_RESULTS)
      .map(item => ({
        page: item.page,
        pageLabel: item.pageLabel,
        id: item.id,         // term name (glossary) | topic id (learn) | etc.
        title: item.title,
        excerpt: excerpt(item.body, q),
      }))
  }, [query])

  return results
}
