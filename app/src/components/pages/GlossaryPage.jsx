import { useState, useMemo } from 'react'
import { Grid, Column, Search, Accordion, AccordionItem, Tag } from '@carbon/react'
import { glossaryTerms } from '../../data/glossary'

const GL_CATS = {
  all: 'All', core: 'K8s Core', ocp: 'OpenShift', operators: 'Operators & OLM',
  networking: 'Networking', storage: 'Storage', security: 'Security',
  monitoring: 'Monitoring', builds: 'Builds & CI/CD', advanced: 'Advanced / Platform',
  odf: 'Data Foundation (ODF)', backup: 'Backup & Restore', virt: 'Virtualization',
  multicluster: 'Multi-Cluster (ACM)', acronym: 'Acronyms',
}

export default function GlossaryPage() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = useMemo(() => {
    let terms = glossaryTerms
    if (activeFilter !== 'all') terms = terms.filter(t => t.cat === activeFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      terms = terms.filter(t =>
        t.term.toLowerCase().includes(q) ||
        (t.abbr && t.abbr.toLowerCase().includes(q)) ||
        t.def.toLowerCase().includes(q)
      )
    }
    return [...terms].sort((a, b) => a.term.localeCompare(b.term))
  }, [query, activeFilter])

  // Group by first letter
  const byLetter = useMemo(() => {
    const map = {}
    filtered.forEach(t => {
      const l = t.term[0].toUpperCase()
      ;(map[l] = map[l] || []).push(t)
    })
    return map
  }, [filtered])

  return (
    <div className="ocp-gl">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <h2 className="ocp-page-heading">OCP & Kubernetes Glossary</h2>
          <p className="ocp-page-sub">Every object, acronym, and concept — from basic to SME level.</p>
        </Column>

        {/* ── Search + filters (sticky) ── */}
        <Column lg={16} md={8} sm={4}>
          <div className="ocp-gl__sticky">
            <Search
              id="glossary-search"
              labelText="Search glossary"
              placeholder="Search terms, acronyms, definitions…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onClear={() => setQuery('')}
            />
            <div className="ocp-gl__filters">
              {Object.entries(GL_CATS).map(([k, v]) => (
                <button
                  key={k}
                  className={`ocp-gl__filter-btn${activeFilter === k ? ' ocp-gl__filter-btn--active' : ''}`}
                  onClick={() => setActiveFilter(k)}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="ocp-gl__count">{filtered.length} terms</div>
          </div>
        </Column>

        {/* ── Terms ── */}
        <Column lg={12} md={8} sm={4}>
          {filtered.length === 0 && (
            <p className="ocp-gl__empty">No terms match your search.</p>
          )}
          {Object.keys(byLetter).sort().map(letter => (
            <div key={letter} className="ocp-gl__letter-group" id={`gl-letter-${letter}`}>
              <div className="ocp-gl__letter">{letter}</div>
              <Accordion>
                {byLetter[letter].map(t => (
                  <AccordionItem
                    key={t.term}
                    title={
                      <span className="ocp-gl__entry-header">
                        <span className="ocp-gl__term">{t.term}</span>
                        {t.abbr && t.abbr !== t.term && (
                          <span className="ocp-gl__abbr">{t.abbr}</span>
                        )}
                        <Tag type="cool-gray" size="sm" className="ocp-gl__cat-tag">
                          {GL_CATS[t.cat] ?? t.cat}
                        </Tag>
                      </span>
                    }
                  >
                    <p className="ocp-gl__def">{t.def}</p>
                    {t.doc && (
                      <a className="ocp-gl__doc-link" href={t.doc} target="_blank" rel="noopener noreferrer">
                        📖 View documentation ↗
                      </a>
                    )}
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </Column>

        {/* ── A–Z sidebar ── */}
        <Column lg={2} md={0} sm={0}>
          <nav className="ocp-gl__az-nav" aria-label="Jump to letter">
            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => {
              const has = !!byLetter[l]
              return (
                <a
                  key={l}
                  href={`#gl-letter-${l}`}
                  className={`ocp-gl__az-link${has ? ' ocp-gl__az-link--active' : ' ocp-gl__az-link--inactive'}`}
                  onClick={e => {
                    if (!has) { e.preventDefault(); return }
                    e.preventDefault()
                    document.getElementById(`gl-letter-${l}`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  {l}
                </a>
              )
            })}
          </nav>
        </Column>
      </Grid>
    </div>
  )
}
