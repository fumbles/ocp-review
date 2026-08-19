import { useState, useMemo, useEffect } from 'react'
import { Grid, Column, Search, Button } from '@carbon/react'
import { Checkmark } from '@carbon/icons-react'
import { topics } from '../../data/topics'
import { useStudyProgress } from '../../hooks/useStudyProgress'

export default function LearnPage({ targetId, onTargetChange }) {
  const { progress, toggleTopic } = useStudyProgress()
  const [activeId, setActiveId] = useState(() =>
    // If arriving from search with a known topic id, start on that topic
    targetId && topics.find(t => t.id === targetId) ? targetId : topics[0].id
  )
  const [query, setQuery] = useState('')

  // If targetId changes (user clicks another search result while already on Learn),
  // switch to the new topic
  useEffect(() => {
    if (targetId && topics.find(t => t.id === targetId)) {
      setActiveId(targetId)
    }
  }, [targetId])

  const filtered = useMemo(() =>
    query.trim()
      ? topics.filter(t => t.label.toLowerCase().includes(query.toLowerCase()))
      : topics,
    [query]
  )

  // If the active topic is filtered out, fall back to first visible
  const visibleActive = filtered.find(t => t.id === activeId)
    ? activeId
    : filtered[0]?.id

  const activeTopic = topics.find(t => t.id === visibleActive)
  const completedTopics = new Set(progress.topics)

  return (
    <div className="ocp-learn">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <h2 className="ocp-page-heading">Resource Library</h2>
          <p className="ocp-page-sub">Select a topic to explore definitions, commands, and YAML examples.</p>
          <div className="ocp-study-progress" aria-label={`${progress.topics.length} of ${topics.length} topics completed`}>
            <div className="ocp-study-progress__summary">
              <span>Library progress</span>
              <strong>{progress.topics.length} / {topics.length}</strong>
            </div>
            <div className="ocp-study-progress__track" aria-hidden="true">
              <span style={{ width: `${(progress.topics.length / topics.length) * 100}%` }} />
            </div>
          </div>
        </Column>
      </Grid>

      <Grid className="ocp-learn__grid" fullWidth>
        {/* ── Sidebar ── */}
        <Column lg={4} md={8} sm={4} className="ocp-learn__sidebar-col">
          <div className="ocp-learn__sidebar">
            <Search
              id="topic-search"
              labelText="Search topics"
              placeholder="Search topics…"
              size="sm"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onClear={() => setQuery('')}
            />
            <div className="ocp-learn__nav-wrap">
              <nav aria-label="Topics" className="ocp-learn__nav-scroll">
                {filtered.length === 0 && (
                  <p className="ocp-learn__no-results">No topics match.</p>
                )}
                {filtered.map(t => (
                  <button
                    key={t.id}
                    className={`ocp-learn__topic-item${t.id === visibleActive ? ' ocp-learn__topic-item--active' : ''}`}
                    onClick={() => {
                      setActiveId(t.id)
                      onTargetChange?.(t.id)
                    }}
                  >
                    <span>{t.label}</span>
                    {completedTopics.has(t.id) && <span className="ocp-complete-mark" aria-label="Completed">✓</span>}
                  </button>
                ))}
              </nav>
              <div className="ocp-learn__scroll-hint" aria-hidden="true">▼ more topics</div>
            </div>
          </div>
        </Column>

        {/* ── Content ── */}
        <Column lg={12} md={8} sm={4}>
          {activeTopic ? (
            <div className="ocp-learn__content">
              <div className="ocp-learn__completion">
                <Button
                  kind={completedTopics.has(activeTopic.id) ? 'tertiary' : 'primary'}
                  size="sm"
                  renderIcon={Checkmark}
                  onClick={() => toggleTopic(activeTopic.id)}
                >
                  {completedTopics.has(activeTopic.id) ? 'Mark topic incomplete' : 'Mark topic complete'}
                </Button>
              </div>
              <div
                className="ocp-topic-body"
                // Content is authored HTML in the data file — same source as the
                // vanilla app, no XSS risk from external input.
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: activeTopic.content }}
              />
            </div>
          ) : (
            <p className="ocp-learn__no-results">No topic selected.</p>
          )}
        </Column>
      </Grid>
    </div>
  )
}
