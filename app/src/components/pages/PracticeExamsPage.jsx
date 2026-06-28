import { useState } from 'react'
import { Grid, Column, Tag, Button } from '@carbon/react'
import { ArrowLeft, Idea, Help, ChevronDown, ChevronUp, Checkmark } from '@carbon/icons-react'
import { practiceExams } from '../../data/practiceExams'

// ── Tag colour map ────────────────────────────────────────────────────────────
const LEVEL_TAG = { green: 'green', teal: 'teal', purple: 'purple' }

// ── Single task row inside a challenge detail view ───────────────────────────
function TaskRow({ task }) {
  const [hintOpen, setHintOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [done, setDone] = useState(false)

  return (
    <div className={`ocp-pe__task${done ? ' ocp-pe__task--done' : ''}`}>
      <div className="ocp-pe__task-header">
        <button
          className="ocp-pe__task-check"
          aria-label={done ? 'Mark incomplete' : 'Mark complete'}
          onClick={() => setDone(d => !d)}
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
function ChallengeDetail({ exam, onBack }) {
  const [allDone, setAllDone] = useState(false)

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

      <p className="ocp-pe__task-count">{exam.tasks.length} tasks — click a task title to expand hints &amp; solutions</p>

      <ol className="ocp-pe__task-list">
        {exam.tasks.map((task, i) => (
          <li key={task.id} className="ocp-pe__task-item">
            <div className="ocp-pe__task-num">{i + 1}</div>
            <div className="ocp-pe__task-body">
              <h4 className="ocp-pe__task-title">{task.title}</h4>
              <TaskRow task={task} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

// ── Card on the list view ─────────────────────────────────────────────────────
function ChallengeCard({ exam, onSelect }) {
  return (
    <button className="ocp-wt__card ocp-pe__card" onClick={() => onSelect(exam.id)}>
      <div className="ocp-pe__card-tags">
        <Tag type={LEVEL_TAG[exam.levelType]} size="sm">{exam.level}</Tag>
        <Tag type="cool-gray" size="sm">{exam.source}</Tag>
      </div>
      <h4 className="ocp-wt__card-title">{exam.title}</h4>
      <p className="ocp-wt__card-desc">{exam.desc}</p>
      <span className="ocp-wt__step-count">{exam.tasks.length} tasks</span>
    </button>
  )
}

// ── Page root ─────────────────────────────────────────────────────────────────
export default function PracticeExamsPage() {
  const [activeId, setActiveId] = useState(null)
  const active = practiceExams.find(e => e.id === activeId)

  if (active) {
    return (
      <Grid>
        <Column lg={12} md={8} sm={4}>
          <ChallengeDetail
            exam={active}
            onBack={() => { setActiveId(null); window.scrollTo(0, 0) }}
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
              onSelect={id => { setActiveId(id); window.scrollTo(0, 0) }}
            />
          </Column>
        ))}
      </Grid>
    </div>
  )
}
