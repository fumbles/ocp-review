import { useEffect, useMemo, useState } from 'react'
import { Button, Column, Grid, Tag } from '@carbon/react'
import { Launch } from '@carbon/icons-react'
import { certificationPaths } from '../../data/certificationPaths'
import { topics } from '../../data/topics'
import { useStudyProgress } from '../../hooks/useStudyProgress'

const topicLabels = new Map(topics.map(topic => [topic.id, topic.label]))

function uniqueTopicIds(path) {
  return [...new Set(path.objectives.flatMap(objective => objective.topicIds))]
    .filter(id => topicLabels.has(id))
}

export default function LearningPathsPage({ targetId, onTargetChange, onNavigateToTopic }) {
  const { progress, setSelectedPath } = useStudyProgress()
  const [activeId, setActiveId] = useState(() =>
    certificationPaths.some(path => path.id === targetId)
      ? targetId
      : certificationPaths.some(path => path.id === progress.selectedPath)
        ? progress.selectedPath
        : certificationPaths[0].id
  )
  const completedTopics = useMemo(() => new Set(progress.topics), [progress.topics])

  useEffect(() => {
    if (certificationPaths.some(path => path.id === targetId)) {
      setActiveId(targetId)
      setSelectedPath(targetId)
    }
  }, [targetId, setSelectedPath])

  const active = certificationPaths.find(path => path.id === activeId) || certificationPaths[0]
  const mappedTopicIds = uniqueTopicIds(active)
  const completedCount = mappedTopicIds.filter(id => completedTopics.has(id)).length
  const percent = mappedTopicIds.length ? (completedCount / mappedTopicIds.length) * 100 : 0
  const coveredObjectives = active.objectives.filter(objective => objective.topicIds.length > 0).length

  const selectPath = id => {
    setActiveId(id)
    setSelectedPath(id)
    onTargetChange?.(id)
  }

  return (
    <div className="ocp-paths">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <h2 className="ocp-page-heading">Certification Learning Paths</h2>
          <p className="ocp-page-sub">
            Choose your target to focus the library. Completion is calculated from the topics you mark complete and saved on this device.
          </p>
        </Column>

        <Column lg={16} md={8} sm={4}>
          <div className="ocp-paths__selector" aria-label="Choose a certification path">
            {certificationPaths.map(path => (
              <button
                key={path.id}
                className={`ocp-paths__selector-btn${path.id === active.id ? ' ocp-paths__selector-btn--active' : ''}`}
                aria-pressed={path.id === active.id}
                onClick={() => selectPath(path.id)}
              >
                <strong>{path.code}</strong>
                <span>{path.kind}</span>
              </button>
            ))}
          </div>
        </Column>

        <Column lg={12} md={8} sm={4}>
          <section className="ocp-paths__overview">
            <div className="ocp-paths__tags">
              <Tag type={active.kind === 'Exam' ? 'red' : 'blue'} size="sm">{active.code}</Tag>
              <Tag type="cool-gray" size="sm">{active.version}</Tag>
            </div>
            <h3>{active.title}</h3>
            <p>{active.summary}</p>

            <div className="ocp-study-progress" aria-label={`${completedCount} of ${mappedTopicIds.length} mapped topics completed`}>
              <div className="ocp-study-progress__summary">
                <span>Path progress</span>
                <strong>{completedCount} / {mappedTopicIds.length} topics</strong>
              </div>
              <div className="ocp-study-progress__track" aria-hidden="true">
                <span style={{ width: `${percent}%` }} />
              </div>
            </div>

            <div className="ocp-paths__source-row">
              <span>{coveredObjectives} of {active.objectives.length} objective areas have mapped content</span>
              <a href={active.officialUrl} target="_blank" rel="noopener noreferrer">
                Official Red Hat page <Launch size={14} />
              </a>
              <span>Verified {active.lastVerified}</span>
            </div>
          </section>
        </Column>

        <Column lg={16} md={8} sm={4}>
          <h3 className="ocp-paths__objectives-heading">Objective coverage</h3>
        </Column>

        {active.objectives.map(objective => {
          const validIds = objective.topicIds.filter(id => topicLabels.has(id))
          const objectiveDone = validIds.filter(id => completedTopics.has(id)).length
          return (
            <Column key={objective.title} lg={8} md={4} sm={4}>
              <article className="ocp-paths__objective">
                <div className="ocp-paths__objective-heading">
                  <h4>{objective.title}</h4>
                  <Tag type={validIds.length ? 'green' : 'magenta'} size="sm">
                    {validIds.length ? `${objectiveDone}/${validIds.length} complete` : 'Content gap'}
                  </Tag>
                </div>
                {validIds.length ? (
                  <div className="ocp-paths__topic-links">
                    {validIds.map(id => (
                      <Button
                        key={id}
                        kind="ghost"
                        size="sm"
                        onClick={() => onNavigateToTopic?.(id)}
                      >
                        {completedTopics.has(id) ? '✓ ' : ''}{topicLabels.get(id)}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="ocp-paths__gap">{objective.coverageNote}</p>
                )}
              </article>
            </Column>
          )
        })}
      </Grid>
    </div>
  )
}
