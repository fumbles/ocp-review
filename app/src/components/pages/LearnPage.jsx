import { useState, useMemo, useEffect } from 'react'
import { Grid, Column, Search } from '@carbon/react'
import { topics } from '../../data/topics'

export default function LearnPage({ targetId, onTargetChange }) {
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

  return (
    <div className="ocp-learn">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <h2 className="ocp-page-heading">Resource Library</h2>
          <p className="ocp-page-sub">Select a topic to explore definitions, commands, and YAML examples.</p>
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
                    {t.label}
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
