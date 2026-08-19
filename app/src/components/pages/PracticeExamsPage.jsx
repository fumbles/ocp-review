import { useEffect, useState } from 'react'
import { Grid, Column, Tag, Button } from '@carbon/react'
import { ArrowLeft, Idea, Help, ChevronDown, ChevronUp, Checkmark, Launch } from '@carbon/icons-react'
import { practiceExams } from '../../data/practiceExams'
import { useStudyProgress } from '../../hooks/useStudyProgress'

// ── Tag colour map ────────────────────────────────────────────────────────────
const LEVEL_TAG = { green: 'green', teal: 'teal', purple: 'purple' }

// ── Single task row inside a challenge detail view ───────────────────────────
function TaskRow({ task, done, onToggle }) {
  const [hintOpen, setHintOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <div className={`ocp-pe__task${done ? ' ocp-pe__task--done' : ''}`}>
      <div className="ocp-pe__task-header">
        <button
          className="ocp-pe__task-check"
          aria-label={done ? 'Mark incomplete' : 'Mark complete'}
          onClick={onToggle}
        >
          <Checkmark size={16} />
        </button>
        <p className="ocp-pe__task-objective">{task.objective}</p>
      </div>

      <div className="ocp-pe__task-actions">
        <Button
          kind="ghost"
          size="sm"
          renderIcon={hintOpen ? ChevronUp : ChevronDown}
          iconDescription="Toggle hint"
          onClick={() => { setHintOpen(o => !o); setHelpOpen(false) }}
        >
          <Idea size={16} />
          Hint
        </Button>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={helpOpen ? ChevronUp : ChevronDown}
          iconDescription="Toggle solution"
          onClick={() => { setHelpOpen(o => !o); setHintOpen(false) }}
        >
          <Help size={16} />
          Solution
        </Button>
      </div>

      {hintOpen && (
        <div className="ocp-pe__reveal ocp-pe__reveal--hint">
          <p>{task.hint}</p>
        </div>
      )}
      {helpOpen && (
        <div className="ocp-pe__reveal ocp-pe__reveal--help">
          <pre>{task.help}</pre>
        </div>
      )}
    </div>
  )
}

// ── Detail view for one challenge ─────────────────────────────────────────────
function ChallengeDetail({ exam, onBack, completedTaskIds, onToggleTask }) {
  const completedCount = exam.tasks.filter(task => completedTaskIds.has(task.id)).length
  return (
    <div className="ocp-pe__detail">
      <button className="ocp-wt__back" onClick={onBack}>
        <ArrowLeft size={16} /> Back to challenges
      </button>

      <div className="ocp-pe__detail-meta">
        <Tag type={LEVEL_TAG[exam.levelType]} size="sm">{exam.level}</Tag>
        <Tag type="cool-gray" size="sm">{exam.source}</Tag>
      </div>
      <h3 className="ocp-wt__detail-title">{exam.title}</h3>
      <p className="ocp-wt__detail-desc">{exam.desc}</p>

      {exam.links?.length > 0 && (
        <div className="ocp-pe__links">
          <span className="ocp-pe__links-label">Resources:</span>
          {exam.links.map(l => (
            <a
              key={l.url}
              className="ocp-pe__link"
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Launch size={14} />
              {l.label}
            </a>
          ))}
        </div>
      )}

      <div className="ocp-study-progress" aria-label={`${completedCount} of ${exam.tasks.length} tasks completed`}>
        <div className="ocp-study-progress__summary">
          <span>Challenge progress</span>
          <strong>{completedCount} / {exam.tasks.length}</strong>
        </div>
        <div className="ocp-study-progress__track" aria-hidden="true">
          <span style={{ width: `${(completedCount / exam.tasks.length) * 100}%` }} />
        </div>
      </div>

      <p className="ocp-pe__task-count">Use Hint or Solution when you need help. Completed tasks are saved on this device.</p>

      <ol className="ocp-pe__task-list">
        {exam.tasks.map((task, i) => (
          <li key={task.id} className="ocp-pe__task-item">
            <div className="ocp-pe__task-num">{i + 1}</div>
            <div className="ocp-pe__task-body">
              <h4 className="ocp-pe__task-title">{task.title}</h4>
              <TaskRow
                task={task}
                done={completedTaskIds.has(task.id)}
                onToggle={() => onToggleTask(task.id)}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

// ── Card on the list view ─────────────────────────────────────────────────────
function ChallengeCard({ exam, onSelect, completedCount }) {
  const complete = completedCount === exam.tasks.length
  return (
    <button className="ocp-wt__card ocp-pe__card" onClick={() => onSelect(exam.id)}>
      <div className="ocp-pe__card-tags">
        <Tag type={LEVEL_TAG[exam.levelType]} size="sm">{exam.level}</Tag>
        <Tag type="cool-gray" size="sm">{exam.source}</Tag>
        {complete && <Tag type="green" size="sm">Completed</Tag>}
      </div>
      <h4 className="ocp-wt__card-title">{exam.title}</h4>
      <p className="ocp-wt__card-desc">{exam.desc}</p>
      <span className="ocp-wt__step-count">{completedCount} / {exam.tasks.length} tasks completed</span>
    </button>
  )
}

// ── Page root ─────────────────────────────────────────────────────────────────
export default function PracticeExamsPage({ targetId, onTargetChange }) {
  const { progress, togglePracticeTask } = useStudyProgress()
  const [activeId, setActiveId] = useState(() =>
    practiceExams.some(exam => exam.id === targetId) ? targetId : null
  )
  const active = practiceExams.find(e => e.id === activeId)

  useEffect(() => {
    setActiveId(practiceExams.some(exam => exam.id === targetId) ? targetId : null)
  }, [targetId])

  const selectChallenge = id => {
    setActiveId(id)
    onTargetChange?.(id)
    window.scrollTo(0, 0)
  }

  const showList = () => {
    setActiveId(null)
    onTargetChange?.(null)
    window.scrollTo(0, 0)
  }

  if (active) {
    return (
      <Grid>
        <Column lg={12} md={8} sm={4}>
          <ChallengeDetail
            exam={active}
            onBack={showList}
            completedTaskIds={new Set(progress.practiceTasks[active.id] || [])}
            onToggleTask={taskId => togglePracticeTask(active.id, taskId)}
          />
        </Column>
      </Grid>
    )
  }

  return (
    <div className="ocp-wt">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <h2 className="ocp-page-heading">Practice Challenges</h2>
          <p className="ocp-page-sub">
            Hands-on scenarios aligned to DO180 / EX280. Each task includes a
            progressive hint and a full solution — try it yourself before peeking.
          </p>
        </Column>
        {practiceExams.map(exam => (
          <Column key={exam.id} lg={5} md={4} sm={4}>
            <ChallengeCard
              exam={exam}
              onSelect={selectChallenge}
              completedCount={exam.tasks.filter(task => (progress.practiceTasks[exam.id] || []).includes(task.id)).length}
            />
          </Column>
        ))}
      </Grid>
    </div>
  )
}
