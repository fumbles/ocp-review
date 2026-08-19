import { useEffect, useState } from 'react'
import { Grid, Column, Tag, Button } from '@carbon/react'
import { ArrowLeft, Checkmark } from '@carbon/icons-react'
import { walkthroughs } from '../../data/walkthroughs'
import { useStudyProgress } from '../../hooks/useStudyProgress'

function WalkthroughCard({ w, onSelect, completed }) {
  return (
    <button className="ocp-wt__card" onClick={() => onSelect(w.id)}>
      <div className="ocp-wt__card-tags">
        <Tag type="red" size="sm">Walkthrough</Tag>
        {completed && <Tag type="green" size="sm">Completed</Tag>}
      </div>
      <h4 className="ocp-wt__card-title">{w.title}</h4>
      <p className="ocp-wt__card-desc">{w.desc}</p>
      <span className="ocp-wt__step-count">{w.steps.length} steps</span>
    </button>
  )
}

function WalkthroughDetail({ w, onBack, completed, onToggleComplete }) {
  return (
    <div className="ocp-wt__detail">
      <button className="ocp-wt__back" onClick={onBack}>
        <ArrowLeft size={16} /> Back to walkthroughs
      </button>
      <h3 className="ocp-wt__detail-title">{w.title}</h3>
      <p className="ocp-wt__detail-desc">{w.desc}</p>
      <Button
        className="ocp-wt__complete-btn"
        kind={completed ? 'tertiary' : 'primary'}
        size="sm"
        renderIcon={Checkmark}
        onClick={onToggleComplete}
      >
        {completed ? 'Mark walkthrough incomplete' : 'Mark walkthrough complete'}
      </Button>
      <ol className="ocp-wt__steps">
        {w.steps.map((s, i) => (
          <li key={i} className="ocp-wt__step">
            <div className="ocp-wt__step-num">{i + 1}</div>
            <div className="ocp-wt__step-body">
              <h4 className="ocp-wt__step-heading">{s.h}</h4>
              <p className="ocp-wt__step-text">{s.b}</p>
              <pre
                className="ocp-wt__step-cmd"
                dangerouslySetInnerHTML={{ __html: s.cmd }}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function WalkthroughsPage({ targetId, onTargetChange }) {
  const { progress, toggleWalkthrough } = useStudyProgress()
  const [activeId, setActiveId] = useState(() =>
    walkthroughs.some(w => w.id === targetId) ? targetId : null
  )
  const active = walkthroughs.find(w => w.id === activeId)
  const completedWalkthroughs = new Set(progress.walkthroughs)

  useEffect(() => {
    setActiveId(walkthroughs.some(w => w.id === targetId) ? targetId : null)
  }, [targetId])

  const selectWalkthrough = id => {
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
          <WalkthroughDetail
            w={active}
            onBack={showList}
            completed={completedWalkthroughs.has(active.id)}
            onToggleComplete={() => toggleWalkthrough(active.id)}
          />
        </Column>
      </Grid>
    )
  }

  return (
    <div className="ocp-wt">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <h2 className="ocp-page-heading">Concept Walkthroughs</h2>
          <p className="ocp-page-sub">Step-by-step guides for core OpenShift administration tasks.</p>
          <div className="ocp-study-progress" aria-label={`${progress.walkthroughs.length} of ${walkthroughs.length} walkthroughs completed`}>
            <div className="ocp-study-progress__summary">
              <span>Walkthrough progress</span>
              <strong>{progress.walkthroughs.length} / {walkthroughs.length}</strong>
            </div>
            <div className="ocp-study-progress__track" aria-hidden="true">
              <span style={{ width: `${(progress.walkthroughs.length / walkthroughs.length) * 100}%` }} />
            </div>
          </div>
        </Column>
        {walkthroughs.map(w => (
          <Column key={w.id} lg={5} md={4} sm={4}>
          <WalkthroughCard w={w} onSelect={selectWalkthrough} completed={completedWalkthroughs.has(w.id)} />
          </Column>
        ))}
      </Grid>
    </div>
  )
}
