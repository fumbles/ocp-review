import { useState } from 'react'
import { Grid, Column, Tag } from '@carbon/react'
import { ArrowLeft } from '@carbon/icons-react'
import { walkthroughs } from '../../data/walkthroughs'

function WalkthroughCard({ w, onSelect }) {
  return (
    <button className="ocp-wt__card" onClick={() => onSelect(w.id)}>
      <Tag type="red" size="sm">Walkthrough</Tag>
      <h4 className="ocp-wt__card-title">{w.title}</h4>
      <p className="ocp-wt__card-desc">{w.desc}</p>
      <span className="ocp-wt__step-count">{w.steps.length} steps</span>
    </button>
  )
}

function WalkthroughDetail({ w, onBack }) {
  return (
    <div className="ocp-wt__detail">
      <button className="ocp-wt__back" onClick={onBack}>
        <ArrowLeft size={16} /> Back to walkthroughs
      </button>
      <h3 className="ocp-wt__detail-title">{w.title}</h3>
      <p className="ocp-wt__detail-desc">{w.desc}</p>
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

export default function WalkthroughsPage() {
  const [activeId, setActiveId] = useState(null)
  const active = walkthroughs.find(w => w.id === activeId)

  if (active) {
    return (
      <Grid>
        <Column lg={12} md={8} sm={4}>
          <WalkthroughDetail w={active} onBack={() => { setActiveId(null); window.scrollTo(0, 0) }} />
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
        </Column>
        {walkthroughs.map(w => (
          <Column key={w.id} lg={5} md={4} sm={4}>
            <WalkthroughCard w={w} onSelect={id => { setActiveId(id); window.scrollTo(0, 0) }} />
          </Column>
        ))}
      </Grid>
    </div>
  )
}
