import {
  Grid,
  Column,
  ClickableTile,
  Tag,
} from '@carbon/react'
import {
  Book,
  Idea,
  Rocket,
  Catalog,
  Debug,
  Certificate,
} from '@carbon/icons-react'

const FEATURE_CARDS = [
  {
    id: 'learn',
    icon: <Book size={32} />,
    title: 'Resource Library',
    body: 'In-depth definitions, explanations, and CLI reference for every DO180 topic with real YAML examples.',
  },
  {
    id: 'flashcards',
    icon: <Idea size={32} />,
    title: 'Flashcard Review',
    body: '100+ flashcards covering Kubernetes core concepts, OpenShift specifics, and exam-critical commands.',
  },
  {
    id: 'walkthroughs',
    icon: <Rocket size={32} />,
    title: 'Concept Walkthroughs',
    body: 'Step-by-step guides for deploying apps, configuring networking, setting up storage, and more.',
  },
  {
    id: 'glossary',
    icon: <Catalog size={32} />,
    title: 'Glossary',
    body: 'Every OCP & Kubernetes object, acronym, and concept — from basic to SME level, fully searchable.',
  },
  {
    id: 'troubleshooting',
    icon: <Debug size={32} />,
    title: 'Troubleshooting',
    body: '12 sections of OpenShift & Kubernetes oc commands — basic triage through expert debugging.',
  },
]

const STATS = [
  { num: '12',   label: 'Topic Areas' },
  { num: '66',   label: 'Flashcards' },
  { num: '17',   label: 'Walkthroughs' },
  { num: '100+', label: 'oc Commands' },
  { num: 'DO180',label: 'Aligned' },
]

export default function HomePage({ onNavigate }) {
  return (
    <div className="ocp-home">
      {/* ── Hero ── */}
      <Grid className="ocp-hero" fullWidth>
        <Column lg={16} md={8} sm={4}>
          <div className="ocp-hero__inner">
            <div className="ocp-hero__tags">
              <Tag type="red" size="sm">DO180</Tag>
              <Tag type="red" size="sm">OpenShift 4.21</Tag>
              <Tag type="cool-gray" size="sm">Kubernetes</Tag>
            </div>
            <h1 className="ocp-hero__heading">
              Master <span className="ocp-brand-red">OpenShift</span> Administration
            </h1>
            <p className="ocp-hero__sub">
              Comprehensive study hub for Red Hat OpenShift Administration I —
              resources, definitions, examples, flashcards, and step-by-step
              walkthroughs aligned to DO180.
            </p>
          </div>
        </Column>
      </Grid>

      {/* ── Feature cards ── */}
      <Grid className="ocp-feature-grid">
        {FEATURE_CARDS.map(card => (
          <Column key={card.id} lg={4} md={4} sm={4}>
            <ClickableTile
              className="ocp-feature-tile"
              onClick={() => onNavigate?.(card.id)}
            >
              <div className="ocp-feature-tile__icon">{card.icon}</div>
              <h3 className="ocp-feature-tile__title">{card.title}</h3>
              <p className="ocp-feature-tile__body">{card.body}</p>
            </ClickableTile>
          </Column>
        ))}
      </Grid>

      {/* ── External links ── */}
      <Grid className="ocp-external-links">
        <Column lg={8} md={4} sm={4}>
          <ClickableTile
            className="ocp-external-tile"
            href="https://docs.redhat.com/en/documentation/openshift_container_platform/4.21/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="ocp-feature-tile__icon"><Book size={24} /></div>
            <h4 className="ocp-feature-tile__title">Official OCP 4.21 Docs</h4>
            <p className="ocp-feature-tile__body">Red Hat OpenShift Container Platform 4.21 documentation on docs.redhat.com.</p>
          </ClickableTile>
        </Column>
        <Column lg={8} md={4} sm={4}>
          <ClickableTile
            className="ocp-external-tile"
            href="https://rh-cert-map.wasmer.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="ocp-feature-tile__icon"><Certificate size={24} /></div>
            <h4 className="ocp-feature-tile__title">Red Hat Certification Path Map</h4>
            <p className="ocp-feature-tile__body">Interactive map of all Red Hat certification paths — visualise the full journey from RHCSA to architect-level certs.</p>
          </ClickableTile>
        </Column>
      </Grid>

      {/* ── Stats ── */}
      <Grid className="ocp-stats">
        {STATS.map(s => (
          <Column key={s.label} lg={3} md={2} sm={2}>
            <div className="ocp-stat">
              <div className="ocp-stat__num">{s.num}</div>
              <div className="ocp-stat__label">{s.label}</div>
            </div>
          </Column>
        ))}
      </Grid>
    </div>
  )
}
