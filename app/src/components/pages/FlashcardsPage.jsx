import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Grid,
  Column,
  Button,
  Tag,
  ProgressBar,
} from '@carbon/react'
import { Shuffle } from '@carbon/icons-react'
import { allCards } from '../../data/flashcards'
import { getNextReviewInterval, useStudyProgress } from '../../hooks/useStudyProgress'

// Decode HTML entities in data strings that weren't authored for dangerouslySetInnerHTML
const doc = typeof document !== 'undefined' ? document : null
function decodeHtml(str) {
  if (!doc) return str
  const el = doc.createElement('textarea')
  el.innerHTML = str
  return el.value
}

const TAG_LABELS = {
  core: 'K8s Core',
  ocp: 'OpenShift',
  networking: 'Networking',
  storage: 'Storage',
  ha: 'HA & Reliability',
  cli: 'CLI',
  advanced: '⚡ Advanced',
  ex380: 'EX380',
  hcp: 'HCP (EX280+)',
  ex432: 'EX432 — ACM',
  ex430: 'EX430 — ACS',
  ex370: 'EX370 — ODF',
}

const FILTERS = ['all', 'core', 'ocp', 'networking', 'storage', 'ha', 'cli', 'advanced', 'ex380', 'hcp', 'ex432', 'ex430', 'ex370']
const REVIEW_FILTERS = ['due', 'weak', 'bookmarked']
const ALL_FILTERS = [...REVIEW_FILTERS, ...FILTERS]
const LETTERS = ['A', 'B', 'C', 'D']

function cardId(card) {
  const index = allCards.indexOf(card)
  return index >= 0 ? `fc-${index}` : null
}

function cardsForFilter(filter, flashcardProgress) {
  if (filter === 'all') return allCards
  if (filter === 'bookmarked') {
    const bookmarks = new Set(flashcardProgress.bookmarks)
    return allCards.filter(card => bookmarks.has(cardId(card)))
  }
  if (filter === 'due') {
    const now = Date.now()
    return allCards.filter(card => {
      const record = flashcardProgress.records[cardId(card)]
      return record?.dueAt > 0 && record.dueAt <= now
    })
  }
  if (filter === 'weak') {
    return allCards.filter(card => {
      const record = flashcardProgress.records[cardId(card)]
      if (!record?.attempts) return false
      return ['again', 'hard'].includes(record.lastRating) || record.correct / record.attempts < 0.7
    })
  }
  return allCards.filter(card => card.tag === filter)
}

function formatInterval(days) {
  if (days < 1 / 24) return `${Math.max(1, Math.round(days * 24 * 60))}m`
  if (days < 1) return `${Math.max(1, Math.round(days * 24))}h`
  if (days < 30) return `${Math.max(1, Math.round(days))}d`
  return `${Math.round(days / 30)}mo`
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function FlashcardsPage({ targetId, onTargetChange }) {
  const {
    progress: studyProgress,
    toggleFlashcardBookmark,
    recordFlashcardAnswer,
    rateFlashcard,
  } = useStudyProgress()
  const flashcardProgress = studyProgress.flashcards
  const [filter, setFilter] = useState('all')
  const [deck, setDeck] = useState(allCards)
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState(null)   // null = unanswered
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const internalTargetRef = useRef(null)

  useEffect(() => {
    if (internalTargetRef.current === targetId) {
      internalTargetRef.current = null
      return
    }
    const match = /^fc-(\d+)$/.exec(targetId ?? '')
    const targetIndex = match ? Number(match[1]) : -1
    if (targetIndex >= 0 && targetIndex < allCards.length) {
      setFilter('all')
      setDeck(allCards)
      setIndex(targetIndex)
      setChosen(null)
    }
  }, [targetId])

  const filtered = deck

  const card = filtered[index] ?? filtered[0]
  const answered = chosen !== null
  const isCorrect = answered && card && chosen === card.correct
  const progress = filtered.length ? ((index + 1) / filtered.length) * 100 : 0
  const currentCardId = card ? cardId(card) : null
  const currentRecord = currentCardId ? flashcardProgress.records[currentCardId] : null
  const bookmarked = currentCardId ? flashcardProgress.bookmarks.includes(currentCardId) : false

  const performance = useMemo(() => {
    const byCategory = {}
    let attempts = 0
    let correctAnswers = 0
    let reviewed = 0

    allCards.forEach(cardItem => {
      const record = flashcardProgress.records[cardId(cardItem)]
      if (!record?.attempts) return
      reviewed += 1
      attempts += record.attempts
      correctAnswers += record.correct
      const category = byCategory[cardItem.tag] || { attempts: 0, correct: 0 }
      category.attempts += record.attempts
      category.correct += record.correct
      byCategory[cardItem.tag] = category
    })

    return { byCategory, attempts, correctAnswers, reviewed }
  }, [flashcardProgress.records])

  const dueCount = useMemo(
    () => cardsForFilter('due', flashcardProgress).length,
    [flashcardProgress]
  )

  function updateTarget(cardToShow) {
    const sourceIndex = allCards.indexOf(cardToShow)
    if (sourceIndex < 0) return
    const id = `fc-${sourceIndex}`
    internalTargetRef.current = id
    onTargetChange?.(id)
  }

  function changeFilter(f) {
    const nextDeck = cardsForFilter(f, flashcardProgress)
    setFilter(f)
    setIndex(0)
    setChosen(null)
    setCorrect(0)
    setWrong(0)
    setDeck(nextDeck)
    if (nextDeck[0]) updateTarget(nextDeck[0])
    else onTargetChange?.(null)
  }

  function handleShuffle() {
    const shuffled = shuffle(deck)
    setDeck(shuffled)
    setIndex(0)
    setChosen(null)
    setCorrect(0)
    setWrong(0)
    updateTarget(shuffled[0])
  }

  function select(i) {
    if (answered) return
    setChosen(i)
    recordFlashcardAnswer(currentCardId, i === card.correct)
    if (i === card.correct) setCorrect(c => c + 1)
    else setWrong(w => w + 1)
  }

  function rate(rating) {
    if (!currentCardId) return
    rateFlashcard(currentCardId, rating)
    if (filter === 'due' || filter === 'weak') {
      const remaining = filtered.filter(cardItem => cardId(cardItem) !== currentCardId)
      const nextIdx = remaining.length ? index % remaining.length : 0
      setDeck(remaining)
      setIndex(nextIdx)
      setChosen(null)
      if (remaining[nextIdx]) updateTarget(remaining[nextIdx])
      else onTargetChange?.(null)
      return
    }
    next()
  }

  function next() {
    const nextIdx = (index + 1) % filtered.length
    if (nextIdx === 0) { setCorrect(0); setWrong(0) }
    setIndex(nextIdx)
    setChosen(null)
    updateTarget(filtered[nextIdx])
  }

  function prev() {
    const prevIdx = (index - 1 + filtered.length) % filtered.length
    setIndex(prevIdx)
    setChosen(null)
    updateTarget(filtered[prevIdx])
  }

  // Keyboard shortcuts: ← prev, → / Enter next (when answered), 1-4 select option
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft') { prev(); return }
      if ((e.key === 'ArrowRight' || e.key === 'Enter') && answered) { next(); return }
      if (e.key >= '1' && e.key <= '4' && !answered) select(Number(e.key) - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="ocp-fc">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <h2 className="ocp-page-heading">Flashcard Review</h2>
          <p className="ocp-page-sub">Answer a card, study the explanation, then rate your recall to schedule the next review.</p>
        </Column>

        {/* ── Filter bar ── */}
        <Column lg={16} md={8} sm={4}>
          <div className="ocp-fc__filters">
            {ALL_FILTERS.map(f => (
              <button
                key={f}
                className={`ocp-fc__filter-btn${filter === f ? ' ocp-fc__filter-btn--active' : ''}`}
                aria-pressed={filter === f}
                onClick={() => changeFilter(f)}
              >
                {f === 'due' ? `Due (${dueCount})` : f === 'weak' ? 'Weak topics' : f === 'bookmarked' ? `★ Saved (${flashcardProgress.bookmarks.length})` : TAG_LABELS[f] ?? 'All'}
              </button>
            ))}
            <button className="ocp-fc__shuffle-btn" onClick={handleShuffle}>
              <Shuffle size={16} /> Shuffle
            </button>
          </div>
        </Column>

        <Column lg={16} md={8} sm={4}>
          <div className="ocp-fc__performance" aria-label="Persistent flashcard performance">
            <div><strong>{performance.reviewed}</strong><span>cards reviewed</span></div>
            <div><strong>{performance.attempts ? Math.round((performance.correctAnswers / performance.attempts) * 100) : 0}%</strong><span>all-time accuracy</span></div>
            <div><strong>{dueCount}</strong><span>due now</span></div>
            <div><strong>{flashcardProgress.bookmarks.length}</strong><span>saved cards</span></div>
          </div>
          {Object.keys(performance.byCategory).length > 0 && (
            <div className="ocp-fc__category-performance">
              {Object.entries(performance.byCategory).map(([tag, stats]) => (
                <span key={tag}>{TAG_LABELS[tag] ?? tag}: <strong>{Math.round((stats.correct / stats.attempts) * 100)}%</strong></span>
              ))}
            </div>
          )}
        </Column>

        {/* ── Progress ── */}
        <Column lg={16} md={8} sm={4}>
          <div className="ocp-fc__meta">
            <ProgressBar
              label=""
              hideLabel
              value={progress}
              max={100}
              size="sm"
              className="ocp-fc__progress"
            />
            <div className="ocp-fc__scoreline">
              <span>Question <strong>{filtered.length ? index + 1 : 0}</strong> of <strong>{filtered.length}</strong></span>
              <span>✅ <strong>{correct}</strong> correct · ❌ <strong>{wrong}</strong> wrong</span>
            </div>
          </div>
        </Column>

        {/* ── Arena ── */}
        <Column lg={10} md={8} sm={4}>
          {!card && (
            <div className="ocp-fc__empty">
              <h3>No cards in this review deck</h3>
              <p>{filter === 'due' ? 'Nothing is due yet. Review another deck or return when scheduled cards become due.' : 'Complete and rate some cards, or save cards with the star button, to build this deck.'}</p>
              <Button size="sm" onClick={() => changeFilter('all')}>Review all cards</Button>
            </div>
          )}
          {card && <>
          {/* Question card */}
          <div className="ocp-fc__question">
            <div className="ocp-fc__question-topline">
              <div className="ocp-fc__q-label">Question {index + 1}</div>
              <button
                className={`ocp-fc__bookmark${bookmarked ? ' ocp-fc__bookmark--active' : ''}`}
                aria-label={bookmarked ? 'Remove flashcard bookmark' : 'Bookmark flashcard'}
                aria-pressed={bookmarked}
                onClick={() => toggleFlashcardBookmark(currentCardId)}
              >
                {bookmarked ? '★ Saved' : '☆ Save'}
              </button>
            </div>
            <div
              className="ocp-fc__q-text"
              dangerouslySetInnerHTML={{ __html: card.q }}
            />
            <Tag type="cool-gray" size="sm" className="ocp-fc__tag">
              {TAG_LABELS[card.tag] ?? card.tag}
            </Tag>
          </div>

          {/* Options */}
          <div className="ocp-fc__options">
            {card.opts.map((opt, i) => {
              let state = ''
              if (answered) {
                if (i === card.correct) state = 'correct'
                else if (i === chosen) state = 'wrong'
              }
              return (
                <button
                  key={i}
                  className={`ocp-fc__opt${state ? ` ocp-fc__opt--${state}` : ''}${answered ? ' ocp-fc__opt--disabled' : ''}`}
                  onClick={() => select(i)}
                  disabled={answered}
                >
                  <span className="ocp-fc__opt-letter">{LETTERS[i]}</span>
                  <span className="ocp-fc__opt-text">{decodeHtml(opt)}</span>
                  {answered && i === card.correct && <span className="ocp-fc__opt-icon">✓</span>}
                  {answered && i === chosen && i !== card.correct && <span className="ocp-fc__opt-icon">✗</span>}
                </button>
              )
            })}
          </div>

          {/* Prev / Next — always visible */}
          <div className="ocp-fc__next-row">
            <Button kind="ghost" size="sm" onClick={prev}>
              ← Prev
            </Button>
            <Button size="sm" onClick={next}>
              Next →
            </Button>
          </div>

          {/* Result panel — only after answering */}
          {answered && (
            <div className="ocp-fc__result">
              <div className={`ocp-fc__verdict ocp-fc__verdict--${isCorrect ? 'correct' : 'wrong'}`}>
                {isCorrect
                  ? `✓ Correct · ${decodeHtml(card.opts[card.correct])}`
                  : `✗ Incorrect · The correct answer is: ${decodeHtml(card.opts[card.correct])}`}
              </div>
              <div
                className="ocp-fc__explanation"
                dangerouslySetInnerHTML={{ __html: card.explanation }}
              />
              <a
                className="ocp-fc__doc-link"
                href={card.doc}
                target="_blank"
                rel="noopener noreferrer"
              >
                📖 {card.docLabel} ↗
              </a>
              <div className="ocp-fc__rating" aria-label="Schedule next review">
                <p>How well did you know it?</p>
                <div className="ocp-fc__rating-buttons">
                  {['again', 'hard', 'good', 'easy'].map(rating => (
                    <button key={rating} className={`ocp-fc__rating-btn ocp-fc__rating-btn--${rating}`} onClick={() => rate(rating)}>
                      <strong>{rating[0].toUpperCase() + rating.slice(1)}</strong>
                      <span>{formatInterval(getNextReviewInterval(currentRecord, rating))}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          </>}
        </Column>
      </Grid>
    </div>
  )
}
