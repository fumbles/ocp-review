import { useState, useMemo } from 'react'
import { Grid, Column, Search, Accordion, AccordionItem, Tag, CodeSnippet, Modal } from '@carbon/react'
import { troubleshootingSections } from '../../data/troubleshooting'

const riskConfig = {
  'read-only': { label: 'Read-only', type: 'green' },
  'changes-workload': { label: 'Changes workload', type: 'blue' },
  'node-impacting': { label: 'Node-impacting', type: 'purple' },
  'high-risk': { label: 'High-risk', type: 'red' },
  'cluster-impacting': { label: 'Cluster-impacting', type: 'magenta' },
}

export default function TroubleshootingPage() {
  const [query, setQuery] = useState('')
  const [expandedCommand, setExpandedCommand] = useState(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return troubleshootingSections
    const q = query.toLowerCase()
    return troubleshootingSections
      .map(sec => {
        const basic = sec.basic.filter(r =>
          r.cmd.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q))
        const expert = sec.expert.filter(r =>
          r.cmd.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q))
        if (!basic.length && !expert.length &&
          !sec.label.toLowerCase().includes(q) && !sec.desc.toLowerCase().includes(q))
          return null
        return { ...sec, basic, expert }
      })
      .filter(Boolean)
  }, [query])

  return (
    <div className="ocp-ts">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <h2 className="ocp-page-heading">Troubleshooting Reference</h2>
          <p className="ocp-page-sub">
            OpenShift & Kubernetes command reference — from basic triage to expert-level debugging.
          </p>
        </Column>

        <Column lg={16} md={8} sm={4}>
          <Search
            id="ts-search"
            labelText="Search commands"
            placeholder="Search commands, descriptions…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onClear={() => setQuery('')}
          />
        </Column>

        <Column lg={16} md={8} sm={4}>
          <div className="ocp-ts__legend" aria-label="Command risk legend">
            {Object.entries(riskConfig).map(([key, value]) => (
              <span key={key} className="ocp-ts__legend-item">
                <Tag type={value.type} size="sm">{value.label}</Tag>
              </span>
            ))}
          </div>
        </Column>

        <Column lg={16} md={8} sm={4}>
          {filtered.length === 0 && (
            <p className="ocp-ts__empty">No commands match your search.</p>
          )}
          <Accordion>
            {filtered.map(sec => (
              <AccordionItem
                key={sec.id}
                open={!!query.trim()}
                title={
                  <span className="ocp-ts__sec-header">
                    <span className="ocp-ts__sec-icon">{sec.icon}</span>
                    <span className="ocp-ts__sec-title-wrap">
                      <span className="ocp-ts__sec-name">{sec.label.replace(/^\S+\s/, '')}</span>
                      <span className="ocp-ts__sec-desc">{sec.desc}</span>
                    </span>
                    <span className="ocp-ts__badges">
                      <Tag type="green" size="sm">{sec.basic.length} basic</Tag>
                      <Tag type="orange" size="sm">{sec.expert.length} expert</Tag>
                    </span>
                  </span>
                }
              >
                {/* Basic */}
                <div className="ocp-ts__subsection">
                  <div className="ocp-ts__sub-label ocp-ts__sub-label--basic">🟢 Basic Triage</div>
                  {sec.basic.length === 0
                    ? <p className="ocp-ts__empty">No basic commands match.</p>
                    : sec.basic.map((r, i) => <CmdRow key={i} r={r} onExpand={setExpandedCommand} />)
                  }
                </div>
                {/* Expert */}
                <div className="ocp-ts__subsection">
                  <div className="ocp-ts__sub-label ocp-ts__sub-label--expert">⚡ Expert Debugging</div>
                  {sec.expert.length === 0
                    ? <p className="ocp-ts__empty">No expert commands match.</p>
                    : sec.expert.map((r, i) => <CmdRow key={i} r={r} onExpand={setExpandedCommand} />)
                  }
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </Column>
      </Grid>

      <Modal
        open={!!expandedCommand}
        onRequestClose={() => setExpandedCommand(null)}
        modalHeading="Full command"
        passiveModal
        size="md"
      >
        {expandedCommand && (
          <div className="ocp-ts__modal-content">
            <div className="ocp-ts__cmd-copy">
              {expandedCommand.risk && (
                <Tag type={riskConfig[expandedCommand.risk].type} size="sm" className="ocp-ts__risk-tag">
                  {riskConfig[expandedCommand.risk].label}
                </Tag>
              )}
              <p className="ocp-ts__cmd-desc">{expandedCommand.desc}</p>
            </div>
            <CodeSnippet type="multi" feedback="Copied!" className="ocp-ts__modal-snippet">
              {expandedCommand.cmd}
            </CodeSnippet>
          </div>
        )}
      </Modal>
    </div>
  )
}

function CmdRow({ r, onExpand }) {
  return (
    <div className="ocp-ts__cmd-row">
      <div className="ocp-ts__cmd-meta">
        <div className="ocp-ts__cmd-copy">
          {r.risk && (
            <Tag type={riskConfig[r.risk].type} size="sm" className="ocp-ts__risk-tag">
              {riskConfig[r.risk].label}
            </Tag>
          )}
          <p className="ocp-ts__cmd-desc">{r.desc}</p>
        </div>
        <button type="button" className="ocp-ts__expand-btn" onClick={() => onExpand(r)}>
          View full command
        </button>
      </div>
      <CodeSnippet type="multi" feedback="Copied!" className="ocp-ts__snippet" wrapText={false}>
        {r.cmd}
      </CodeSnippet>
    </div>
  )
}
