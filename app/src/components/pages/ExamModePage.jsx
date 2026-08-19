import { useEffect, useRef, useState } from 'react'
import { Button, Column, Grid, Tag } from '@carbon/react'
import { allCards } from '../../data/flashcards'
import { useStudyProgress } from '../../hooks/useStudyProgress'

const ACTIVE_EXAM_KEY = 'ocp-active-exam-v1'
const LETTERS = ['A', 'B', 'C', 'D']

const EXAM_POOLS = {
  general: { label: 'General OpenShift', tags: null },
  ex280: { label: 'EX280 Administration', tags: ['core', 'ocp', 'networking', 'storage', 'ha', 'cli', 'advanced'] },
  ex370: { label: 'EX370 Data Foundation', tags: ['storage', 'ex370'] },
  ex380: { label: 'EX380 Advanced Administration', tags: ['ocp', 'networking', 'ha', 'cli', 'advanced', 'ex380'] },
  ex430: { label: 'EX430 Advanced Cluster Security', tags: ['ex430'] },
  ex432: { label: 'EX432 Advanced Cluster Management', tags: ['hcp', 'ex432'] },
}

const TAG_LABELS = {
  core: 'Kubernetes Core', ocp: 'OpenShift', networking: 'Networking', storage: 'Storage',
  ha: 'HA & Reliability', cli: 'CLI', advanced: 'Advanced Administration', ex380: 'EX380',
  hcp: 'Hosted Control Planes', ex432: 'EX432 / ACM', ex430: 'EX430 / ACS', ex370: 'EX370 / ODF',
}

const doc = typeof document !== 'undefined' ? document : null
function decodeHtml(value) {
  if (!doc) return value
  const element = doc.createElement('textarea')
  element.innerHTML = value
  return element.value
}

function shuffled(values) {
  const copy = [...values]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[other]] = [copy[other], copy[index]]
  }
  return copy
}

function poolQuestionIds(poolId) {
  const tags = EXAM_POOLS[poolId]?.tags
  return allCards
    .map((card, index) => ({ card, id: `fc-${index}` }))
    .filter(({ card }) => !tags || tags.includes(card.tag))
    .map(({ id }) => id)
}

function questionCountOptions(poolSize) {
  return [...new Set([5, 10, 25, 50, poolSize].filter(count => count > 0 && count <= poolSize))]
    .sort((a, b) => a - b)
}

function readActiveExam() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ACTIVE_EXAM_KEY))
    if (!parsed || parsed.status !== 'active' || !EXAM_POOLS[parsed.poolId]) return null
    const validIds = new Set(allCards.map((_, index) => `fc-${index}`))
    const questionIds = [...new Set((parsed.questionIds || []).filter(id => validIds.has(id)))]
    if (!questionIds.length) return null
    const answers = {}
    for (const [id, answer] of Object.entries(parsed.answers || {})) {
      if (questionIds.includes(id) && Number.isInteger(answer) && answer >= 0 && answer <= 3) answers[id] = answer
    }
    return {
      ...parsed,
      questionIds,
      answers,
      flagged: (parsed.flagged || []).filter(id => questionIds.includes(id)),
      currentIndex: Math.min(Math.max(0, Number(parsed.currentIndex) || 0), questionIds.length - 1),
    }
  } catch {
    return null
  }
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds)
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`
}

export default function ExamModePage() {
  const { progress, saveExamAttempt } = useStudyProgress()
  const defaultPool = EXAM_POOLS[progress.selectedPath] ? progress.selectedPath : 'general'
  const [poolId, setPoolId] = useState(defaultPool)
  const [questionCount, setQuestionCount] = useState(() => Math.min(10, poolQuestionIds(defaultPool).length))
  const [minutes, setMinutes] = useState(20)
  const [passThreshold, setPassThreshold] = useState(70)
  const [session, setSession] = useState(readActiveExam)
  const [result, setResult] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const finishingRef = useRef(false)

  const poolSize = poolQuestionIds(poolId).length
  const countOptions = questionCountOptions(poolSize)

  useEffect(() => {
    if (!countOptions.includes(questionCount)) setQuestionCount(Math.min(10, poolSize))
  }, [poolId, poolSize, questionCount, countOptions])

  useEffect(() => {
    if (!session) return undefined
    try { localStorage.setItem(ACTIVE_EXAM_KEY, JSON.stringify(session)) } catch { /* session remains in memory */ }
    return undefined
  }, [session])

  useEffect(() => {
    if (!session) return undefined
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [session])

  function finishExam(autoSubmitted = false) {
    if (!session || finishingRef.current) return
    finishingRef.current = true
    const details = session.questionIds.map(id => {
      const card = allCards[Number(id.slice(3))]
      const selected = session.answers[id]
      return { id, card, selected, correct: selected === card.correct }
    })
    const correctCount = details.filter(item => item.correct).length
    const score = Math.round((correctCount / details.length) * 100)
    const missedByCategory = {}
    details.filter(item => !item.correct).forEach(item => {
      missedByCategory[item.card.tag] = (missedByCategory[item.card.tag] || 0) + 1
    })
    const finishedResult = {
      id: session.id,
      poolId: session.poolId,
      poolLabel: EXAM_POOLS[session.poolId].label,
      score,
      passed: score >= session.passThreshold,
      passThreshold: session.passThreshold,
      correctCount,
      total: details.length,
      unanswered: details.filter(item => item.selected === undefined).length,
      missedByCategory,
      details,
      autoSubmitted,
      finishedAt: Date.now(),
    }
    saveExamAttempt({
      id: finishedResult.id,
      poolId: finishedResult.poolId,
      score,
      passed: finishedResult.passed,
      correctCount,
      total: details.length,
      finishedAt: finishedResult.finishedAt,
    })
    try { localStorage.removeItem(ACTIVE_EXAM_KEY) } catch { /* no-op */ }
    setResult(finishedResult)
    setSession(null)
    setConfirmSubmit(false)
  }

  useEffect(() => {
    if (session && now >= session.endAt) finishExam(true)
  })

  function startExam() {
    const questionIds = shuffled(poolQuestionIds(poolId)).slice(0, questionCount)
    const startedAt = Date.now()
    finishingRef.current = false
    setResult(null)
    setConfirmSubmit(false)
    setNow(startedAt)
    setSession({
      id: `exam-${startedAt}`,
      status: 'active',
      poolId,
      questionIds,
      answers: {},
      flagged: [],
      currentIndex: 0,
      passThreshold,
      startedAt,
      endAt: startedAt + minutes * 60 * 1000,
    })
  }

  function updateSession(changes) {
    setSession(current => ({ ...current, ...changes }))
  }

  if (result) {
    const missed = result.details.filter(item => !item.correct)
    return (
      <div className="ocp-exam">
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <section className={`ocp-exam__result ocp-exam__result--${result.passed ? 'pass' : 'fail'}`}>
              <Tag type={result.passed ? 'green' : 'red'} size="sm">{result.passed ? 'PASS' : 'REVIEW NEEDED'}</Tag>
              <h2>{result.score}%</h2>
              <p>{result.correctCount} of {result.total} correct · Passing threshold {result.passThreshold}%</p>
              {result.autoSubmitted && <p>The time limit expired, so the exam was submitted automatically.</p>}
              {result.unanswered > 0 && <p>{result.unanswered} unanswered question{result.unanswered === 1 ? '' : 's'} counted as incorrect.</p>}
              <Button onClick={() => { finishingRef.current = false; setResult(null) }}>Start another exam</Button>
            </section>

            <section className="ocp-exam__missed-summary">
              <h3>Missed objective areas</h3>
              {Object.keys(result.missedByCategory).length ? (
                <div>{Object.entries(result.missedByCategory).map(([tag, count]) => <Tag key={tag} type="cool-gray">{TAG_LABELS[tag] || tag}: {count}</Tag>)}</div>
              ) : <p>No missed objectives—excellent work.</p>}
            </section>

            {missed.length > 0 && <h3 className="ocp-exam__review-heading">Review missed questions</h3>}
            {missed.map((item, index) => (
              <article key={item.id} className="ocp-exam__review-card">
                <h4>{index + 1}. <span dangerouslySetInnerHTML={{ __html: item.card.q }} /></h4>
                <p className="ocp-exam__selected">Your answer: {item.selected === undefined ? 'No answer' : `${LETTERS[item.selected]}. ${decodeHtml(item.card.opts[item.selected])}`}</p>
                <p className="ocp-exam__correct">Correct answer: {LETTERS[item.card.correct]}. {decodeHtml(item.card.opts[item.card.correct])}</p>
                <div dangerouslySetInnerHTML={{ __html: item.card.explanation }} />
                <a href={item.card.doc} target="_blank" rel="noopener noreferrer">{item.card.docLabel} ↗</a>
              </article>
            ))}
          </Column>
        </Grid>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="ocp-exam">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <h2 className="ocp-page-heading">Real Exam Mode</h2>
            <p className="ocp-page-sub">Run a randomized, timed assessment. Answers and explanations remain hidden until you submit.</p>
          </Column>
          <Column lg={10} md={8} sm={4}>
            <section className="ocp-exam__setup">
              <div className="ocp-exam__field">
                <label htmlFor="exam-pool">Question pool</label>
                <select id="exam-pool" value={poolId} onChange={event => setPoolId(event.target.value)}>
                  {Object.entries(EXAM_POOLS).map(([id, pool]) => <option key={id} value={id}>{pool.label} ({poolQuestionIds(id).length} available)</option>)}
                </select>
              </div>
              <div className="ocp-exam__field">
                <label htmlFor="exam-count">Questions</label>
                <select id="exam-count" value={questionCount} onChange={event => setQuestionCount(Number(event.target.value))}>
                  {countOptions.map(count => <option key={count} value={count}>{count}</option>)}
                </select>
              </div>
              <div className="ocp-exam__field">
                <label htmlFor="exam-time">Time limit</label>
                <select id="exam-time" value={minutes} onChange={event => setMinutes(Number(event.target.value))}>
                  {[10, 20, 45, 60].map(value => <option key={value} value={value}>{value} minutes</option>)}
                </select>
              </div>
              <div className="ocp-exam__field">
                <label htmlFor="exam-pass">Passing score</label>
                <select id="exam-pass" value={passThreshold} onChange={event => setPassThreshold(Number(event.target.value))}>
                  {[70, 75, 80, 85].map(value => <option key={value} value={value}>{value}%</option>)}
                </select>
              </div>
              <Button onClick={startExam}>Start timed exam</Button>
              <p className="ocp-exam__setup-note">The active attempt is saved on this device and resumes after a refresh.</p>
            </section>
          </Column>
          {progress.examAttempts.length > 0 && (
            <Column lg={6} md={8} sm={4}>
              <section className="ocp-exam__history">
                <h3>Recent attempts</h3>
                {progress.examAttempts.slice(0, 5).map(attempt => (
                  <div key={attempt.id}><span>{EXAM_POOLS[attempt.poolId]?.label || attempt.poolId}</span><strong className={attempt.passed ? 'pass' : 'fail'}>{attempt.score}%</strong></div>
                ))}
              </section>
            </Column>
          )}
        </Grid>
      </div>
    )
  }

  const questionId = session.questionIds[session.currentIndex]
  const card = allCards[Number(questionId.slice(3))]
  const selected = session.answers[questionId]
  const flagged = session.flagged.includes(questionId)
  const answeredCount = Object.keys(session.answers).length
  const remainingSeconds = Math.max(0, Math.ceil((session.endAt - now) / 1000))

  return (
    <div className="ocp-exam">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <header className="ocp-exam__header">
            <div><Tag type="red" size="sm">{EXAM_POOLS[session.poolId].label}</Tag><span>{answeredCount}/{session.questionIds.length} answered</span></div>
            <time className={remainingSeconds < 300 ? 'ocp-exam__timer--warning' : ''} aria-label={`${remainingSeconds} seconds remaining`}>{formatTime(remainingSeconds)}</time>
          </header>
        </Column>

        <Column lg={4} md={8} sm={4}>
          <aside className="ocp-exam__navigator" aria-label="Question navigator">
            {session.questionIds.map((id, index) => (
              <button
                key={id}
                className={`${index === session.currentIndex ? 'current ' : ''}${session.answers[id] !== undefined ? 'answered ' : ''}${session.flagged.includes(id) ? 'flagged' : ''}`}
                aria-label={`Question ${index + 1}${session.answers[id] !== undefined ? ', answered' : ''}${session.flagged.includes(id) ? ', flagged' : ''}`}
                onClick={() => updateSession({ currentIndex: index })}
              >{index + 1}</button>
            ))}
          </aside>
        </Column>

        <Column lg={10} md={8} sm={4}>
          <section className="ocp-exam__question">
            <div className="ocp-exam__question-meta"><span>Question {session.currentIndex + 1} of {session.questionIds.length}</span><button aria-pressed={flagged} onClick={() => updateSession({ flagged: flagged ? session.flagged.filter(id => id !== questionId) : [...session.flagged, questionId] })}>{flagged ? '⚑ Flagged' : '⚐ Flag for review'}</button></div>
            <h3 dangerouslySetInnerHTML={{ __html: card.q }} />
            <div className="ocp-exam__options">
              {card.opts.map((option, index) => (
                <button key={option} className={selected === index ? 'selected' : ''} aria-pressed={selected === index} onClick={() => updateSession({ answers: { ...session.answers, [questionId]: index } })}>
                  <span>{LETTERS[index]}</span>{decodeHtml(option)}
                </button>
              ))}
            </div>
          </section>
          <div className="ocp-exam__actions">
            <Button kind="ghost" disabled={session.currentIndex === 0} onClick={() => updateSession({ currentIndex: session.currentIndex - 1 })}>← Previous</Button>
            {session.currentIndex < session.questionIds.length - 1
              ? <Button onClick={() => updateSession({ currentIndex: session.currentIndex + 1 })}>Next →</Button>
              : <Button kind="danger" onClick={() => setConfirmSubmit(true)}>Submit exam</Button>}
          </div>
          {confirmSubmit && (
            <div className="ocp-exam__confirm" role="alert">
              <p>Submit now? {session.questionIds.length - answeredCount} question{session.questionIds.length - answeredCount === 1 ? '' : 's'} remain unanswered.</p>
              <Button kind="ghost" size="sm" onClick={() => setConfirmSubmit(false)}>Keep working</Button>
              <Button kind="danger" size="sm" onClick={() => finishExam(false)}>Submit and score</Button>
            </div>
          )}
        </Column>
      </Grid>
    </div>
  )
}
