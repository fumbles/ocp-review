import { useEffect, useMemo, useState } from 'react'
import { Button, Column, Grid, Tag } from '@carbon/react'
import { Launch } from '@carbon/icons-react'
import { visualMaps } from '../../data/visualMaps'

const CATEGORIES = [
  ['all', 'All maps'],
  ['architecture', 'Architecture'],
  ['workloads', 'Workloads'],
  ['networking', 'Networking'],
  ['storage', 'Storage'],
  ['operations', 'Operations'],
  ['data-protection', 'Data protection'],
  ['virtualization', 'Virtualization'],
  ['troubleshooting', 'Troubleshooting'],
]

export default function VisualMapsPage({ targetId, onTargetChange, onNavigateToTopic }) {
  const [category, setCategory] = useState('all')
  const [activeId, setActiveId] = useState(() =>
    visualMaps.some(map => map.id === targetId) ? targetId : visualMaps[0].id
  )
  const activeMap = visualMaps.find(map => map.id === activeId) || visualMaps[0]
  const allNodes = useMemo(() => [
    ...(activeMap.shared?.nodes || []),
    ...activeMap.stages.flatMap(stage => stage.nodes),
  ], [activeMap])
  const [selectedNodeId, setSelectedNodeId] = useState(allNodes[0].id)
  const selectedNode = allNodes.find(node => node.id === selectedNodeId) || allNodes[0]
  const selectedIndex = allNodes.findIndex(node => node.id === selectedNode.id)

  useEffect(() => {
    if (visualMaps.some(map => map.id === targetId)) setActiveId(targetId)
  }, [targetId])

  useEffect(() => {
    setSelectedNodeId(allNodes[0].id)
  }, [activeId, allNodes])

  const filteredMaps = category === 'all'
    ? visualMaps
    : visualMaps.filter(map => map.category === category)

  function selectMap(id) {
    setActiveId(id)
    onTargetChange?.(id)
    window.scrollTo(0, 0)
  }

  function moveFocus(offset) {
    const nextIndex = (selectedIndex + offset + allNodes.length) % allNodes.length
    setSelectedNodeId(allNodes[nextIndex].id)
  }

  function renderNode(node) {
    return (
      <button
        key={node.id}
        className="ocp-visuals__node"
        aria-pressed={selectedNode.id === node.id}
        onClick={() => setSelectedNodeId(node.id)}
      >
        <strong>{node.label}</strong>
        <span>{node.subtitle}</span>
      </button>
    )
  }

  return (
    <div className="ocp-visuals">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <h2 className="ocp-page-heading">Visual Maps</h2>
          <p className="ocp-page-sub">Build a mental model of OpenShift through architecture, topology, flows, ownership chains, and troubleshooting paths.</p>
          <p className="ocp-visuals__source-policy">Source-first visuals: use a suitable official diagram when one exists; otherwise build an original interactive synthesis and link the documentation behind it.</p>
        </Column>

        <Column lg={16} md={8} sm={4}>
          <div className="ocp-visuals__filters" aria-label="Filter visual maps">
            {CATEGORIES.map(([id, label]) => (
              <button key={id} aria-pressed={category === id} onClick={() => setCategory(id)}>{label}</button>
            ))}
          </div>
          <div className="ocp-visuals__map-picker">
            {filteredMaps.map(map => (
              <button key={map.id} aria-pressed={activeMap.id === map.id} onClick={() => selectMap(map.id)}>
                <span>{map.title}</span>
                <small>{map.summary}</small>
              </button>
            ))}
          </div>
        </Column>

        <Column lg={16} md={8} sm={4}>
          <section className="ocp-visuals__canvas" aria-labelledby="visual-map-title">
            <header className="ocp-visuals__canvas-header">
              <div>
                <Tag type="red" size="sm">{CATEGORIES.find(([id]) => id === activeMap.category)?.[1]}</Tag>
                <h3 id="visual-map-title">{activeMap.title}</h3>
                <p>{activeMap.summary}</p>
              </div>
              <div className="ocp-visuals__source">
                <span>{activeMap.sourceNote || 'Original interactive synthesis from official documentation.'}</span>
                <a href={activeMap.sourceUrl} target="_blank" rel="noopener noreferrer">{activeMap.sourceLabel || 'Official source'} <Launch size={14} /></a>
                {activeMap.secondarySourceUrl && (
                  <a href={activeMap.secondarySourceUrl} target="_blank" rel="noopener noreferrer">{activeMap.secondarySourceLabel || 'Additional source'} <Launch size={14} /></a>
                )}
              </div>
            </header>

            <div className="ocp-visuals__mental-model">
              <strong>Remember it like this:</strong> {activeMap.mentalModel}
            </div>

            {activeMap.layout === 'three-node' ? (
              <div className="ocp-visuals__topology" role="group" aria-label={`${activeMap.title} diagram`}>
                <div className="ocp-visuals__control-band">
                  <div className="ocp-visuals__band-label">{activeMap.shared.label}</div>
                  <div className="ocp-visuals__shared-nodes">{activeMap.shared.nodes.map(renderNode)}</div>
                </div>
                <div className="ocp-visuals__overlay-band" aria-label={activeMap.connectionLabel}>
                  <span>↕</span><strong>{activeMap.connectionLabel}</strong><span>↕</span>
                </div>
                <div className="ocp-visuals__three-node-grid">
                  {activeMap.stages.map((stage, stageIndex) => (
                    <div className="ocp-visuals__topology-node" key={stage.label}>
                      <div className="ocp-visuals__stage-label"><span>{stageIndex + 1}</span>{stage.label}</div>
                      <div className="ocp-visuals__nodes">{stage.nodes.map(renderNode)}</div>
                    </div>
                  ))}
                </div>
                <div className="ocp-visuals__external-band"><span>↕</span>{activeMap.externalLabel}<span>↕</span></div>
              </div>
            ) : (
              <div className="ocp-visuals__flow" role="group" aria-label={`${activeMap.title} diagram`}>
                {activeMap.stages.map((stage, stageIndex) => (
                  <div className="ocp-visuals__flow-segment" key={stage.label}>
                    {stageIndex > 0 && <div className="ocp-visuals__arrow" aria-hidden="true"><span>→</span></div>}
                    <div className="ocp-visuals__stage">
                      <div className="ocp-visuals__stage-label"><span>{stageIndex + 1}</span>{stage.label}</div>
                      <div className="ocp-visuals__nodes">{stage.nodes.map(renderNode)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="ocp-visuals__focus">
              <div className="ocp-visuals__focus-controls">
                <span>Node {selectedIndex + 1} of {allNodes.length}</span>
                <div>
                  <Button kind="ghost" size="sm" onClick={() => moveFocus(-1)}>← Previous</Button>
                  <Button kind="ghost" size="sm" onClick={() => moveFocus(1)}>Next →</Button>
                </div>
              </div>
              <div className="ocp-visuals__focus-content">
                <div>
                  <h4>{selectedNode.label}</h4>
                  <p>{selectedNode.detail}</p>
                </div>
                <code>{selectedNode.command}</code>
              </div>
            </div>

            {activeMap.topicId && (
              <Button kind="tertiary" size="sm" onClick={() => onNavigateToTopic?.(activeMap.topicId)}>
                Open related study topic
              </Button>
            )}
          </section>
        </Column>
      </Grid>
    </div>
  )
}
