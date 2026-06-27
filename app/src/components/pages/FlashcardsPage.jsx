import { useState, useMemo, useEffect } from 'react'
import {
  Grid,
  Column,
  Button,
  Tag,
  ProgressBar,
} from '@carbon/react'
import { Shuffle } from '@carbon/icons-react'
import { allCards } from '../../data/flashcards'

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
}

const FILTERS = ['all', 'core', 'ocp', 'networking', 'storage', 'ha', 'cli', 'advanced']
const LETTERS = ['A', 'B', 'C', 'D']

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function FlashcardsPage() {
  const [filter, setFilter] = useState('all')
  const [deck, setDeck] = useState(allCards)
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState(null)   // null = unanswered
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)

  const filtered = useMemo(
    () => filter === 'all' ? deck : deck.filter(c => c.tag === filter),
    [filter, deck]
  )

  const card = filtered[index] ?? filtered[0]
  const answered = chosen !== null
  const isCorrect = answered && chosen === card.correct
  const progress = ((index + 1) / filtered.length) * 100

  function changeFilter(f) {
    setFilter(f)
    setIndex(0)
    setChosen(null)
    setCorrect(0)
    setWrong(0)
    setDeck(allCards)
  }

  function handleShuffle() {
    setDeck(prev => shuffle(filter === 'all' ? allCards : allCards.filter(c => c.tag === filter)))
    setIndex(0)
    setChosen(null)
    setCorrect(0)
    setWrong(0)
  }

  function select(i) {
    if (answered) return
    setChosen(i)
    if (i === card.correct) setCorrect(c => c + 1)
    else setWrong(w => w + 1)
  }

  function next() {
    const nextIdx = (index + 1) % filtered.length
    if (nextIdx === 0) { setCorrect(0); setWrong(0) }
    setIndex(nextIdx)
    setChosen(null)
  }

  function prev() {
    const prevIdx = (index - 1 + filtered.length) % filtered.length
    setIndex(prevIdx)
    setChosen(null)
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

  if (!card) return null

  return (
    <div className="ocp-fc">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <h2 className="ocp-page-heading">Flashcard Review</h2>
          <p className="ocp-page-sub">Choose the correct answer, then read the explanation and docs link.</p>
        </Column>

        {/* ── Filter bar ── */}
        <Column lg={16} md={8} sm={4}>
          <div className="ocp-fc__filters">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`ocp-fc__filter-btn${filter === f ? ' ocp-fc__filter-btn--active' : ''}`}
                onClick={() => changeFilter(f)}
              >
                {TAG_LABELS[f] ?? 'All'}
              </button>
            ))}
            <button className="ocp-fc__shuffle-btn" onClick={handleShuffle}>
              <Shuffle size={16} /> Shuffle
            </button>
          </div>
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
              <span>Question <strong>{index + 1}</strong> of <strong>{filtered.length}</strong></span>
              <span>✅ <strong>{correct}</strong> correct · ❌ <strong>{wrong}</strong> wrong</span>
            </div>
          </div>
        </Column>

        {/* ── Arena ── */}
        <Column lg={10} md={8} sm={4}>
          {/* Question card */}
          <div className="ocp-fc__question">
            <div className="ocp-fc__q-label">Question {index + 1}</div>
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
            </div>
          )}
        </Column>
      </Grid>
    </div>
  )
}
