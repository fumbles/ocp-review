import {
  Header,
  HeaderName,
  HeaderMenuButton,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
  SideNav,
  SideNavItems,
  SideNavMenuItem,
  Content,
  Modal,
  Search,
} from '@carbon/react'
import { Asleep, Light, Search as SearchIcon } from '@carbon/icons-react'
import { lazy, Suspense, useState, useCallback } from 'react'

import HomePage from './pages/HomePage'

const LearnPage = lazy(() => import('./pages/LearnPage'))
const FlashcardsPage = lazy(() => import('./pages/FlashcardsPage'))
const WalkthroughsPage = lazy(() => import('./pages/WalkthroughsPage'))
const GlossaryPage = lazy(() => import('./pages/GlossaryPage'))
const TroubleshootingPage = lazy(() => import('./pages/TroubleshootingPage'))
const PracticeExamsPage = lazy(() => import('./pages/PracticeExamsPage'))

import { useHashRouter } from '../hooks/useHashRouter'
import { useSearch } from '../hooks/useSearch'

const PAGES = [
  { id: 'home',           label: 'Home' },
  { id: 'learn',          label: 'Learn' },
  { id: 'flashcards',     label: 'Flashcards' },
  { id: 'walkthroughs',   label: 'Walkthroughs' },
  { id: 'glossary',       label: 'Glossary' },
  { id: 'troubleshooting',label: 'Troubleshooting' },
  { id: 'practice',       label: 'Practice' },
]

const PAGE_COMPONENTS = (navigate, onOpenSearch, targetId) => ({
  home:           <HomePage onNavigate={navigate} onOpenSearch={onOpenSearch} />,
  learn:          <LearnPage targetId={targetId} onTargetChange={id => navigate('learn', id)} />,
  flashcards:     <FlashcardsPage targetId={targetId} onTargetChange={id => navigate('flashcards', id)} />,
  walkthroughs:   <WalkthroughsPage targetId={targetId} onTargetChange={id => navigate('walkthroughs', id)} />,
  glossary:       <GlossaryPage targetId={targetId} />,
  troubleshooting:<TroubleshootingPage targetId={targetId} onTargetChange={id => navigate('troubleshooting', id)} />,
  practice:       <PracticeExamsPage targetId={targetId} onTargetChange={id => navigate('practice', id)} />,
})

// Group search results by page label
function groupResults(results) {
  const map = {}
  for (const r of results) {
    if (!map[r.pageLabel]) map[r.pageLabel] = []
    map[r.pageLabel].push(r)
  }
  return Object.entries(map)
}

export default function Shell({ theme, onToggleTheme }) {
  const { page: activePage, targetId, navigate: routerNavigate } = useHashRouter()
  const [sideNavOpen, setSideNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { results, isLoading: searchLoading } = useSearch(searchQuery)

  const navigate = useCallback((id, targetId = null) => {
    routerNavigate(id, targetId)
    setSideNavOpen(false)
  }, [routerNavigate])

  const openSearch = () => {
    setSearchQuery('')
    setSearchOpen(true)
  }

  const handleResultClick = (page, id) => {
    setSearchOpen(false)
    setSearchQuery('')
    navigate(page, id)
  }

  const isDark = theme === 'g100'
  const grouped = groupResults(results)

  return (
    <>
      <Header aria-label="OCP Mastery">
        <SkipToContent />

        <HeaderMenuButton
          aria-label={sideNavOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={sideNavOpen}
          isActive={sideNavOpen}
          onClick={() => setSideNavOpen(open => !open)}
        />

        <HeaderName prefix="" onClick={() => navigate('home')} style={{ cursor: 'pointer' }}>
          {/* Inline SVG OpenShift logo */}
          <svg
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{ width: 28, height: 28, marginRight: '0.5rem', flexShrink: 0 }}
          >
            <circle cx="32" cy="32" r="23" fill="none" stroke="#ee0000" strokeWidth="11"
              strokeDasharray="108 42" strokeLinecap="butt" transform="rotate(-18 32 32)" />
            <rect x="41" y="12" width="18" height="5.5" rx="2.75" fill="#b91c3b"
              transform="rotate(-21 50 14.75)" />
            <rect x="7" y="35" width="18" height="5.5" rx="2.75" fill="#b91c3b"
              transform="rotate(-21 16 37.75)" />
            <rect x="13" y="44" width="16" height="5" rx="2.5" fill="#b91c3b"
              transform="rotate(-24 21 46.5)" />
          </svg>
          OCP Mastery
        </HeaderName>

        {/* Desktop navigation */}
        <HeaderNavigation aria-label="Main navigation">
          {PAGES.filter(p => p.id !== 'home').map(p => (
            <HeaderMenuItem
              key={p.id}
              isCurrentPage={activePage === p.id}
              onClick={() => navigate(p.id)}
            >
              {p.label}
            </HeaderMenuItem>
          ))}
        </HeaderNavigation>

        <HeaderGlobalBar>
          <HeaderGlobalAction
            aria-label="Search all content"
            onClick={openSearch}
            tooltipAlignment="end"
          >
            <SearchIcon size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={onToggleTheme}
            tooltipAlignment="end"
          >
            {isDark ? <Light size={20} /> : <Asleep size={20} />}
          </HeaderGlobalAction>
        </HeaderGlobalBar>

        {/* Mobile side nav */}
        <SideNav
          aria-label="Side navigation"
          expanded={sideNavOpen}
          isPersistent={false}
          onOverlayClick={() => setSideNavOpen(false)}
        >
          <SideNavItems>
            {PAGES.map(p => (
              <SideNavMenuItem
                key={p.id}
                isActive={activePage === p.id}
                onClick={() => navigate(p.id)}
              >
                {p.label}
              </SideNavMenuItem>
            ))}
          </SideNavItems>
        </SideNav>
      </Header>

      <Content id="main-content">
        <Suspense fallback={<div className="ocp-page-loading" role="status">Loading study content…</div>}>
          {PAGE_COMPONENTS(navigate, openSearch, targetId)[activePage]}
        </Suspense>
      </Content>

      {/* ── Global search modal ── */}
      <Modal
        open={searchOpen}
        onRequestClose={() => setSearchOpen(false)}
        modalHeading="Search all content"
        passiveModal
        size="md"
        className="ocp-search-modal"
      >
        <Search
          id="global-search"
          labelText="Search"
          placeholder="Search topics, glossary, flashcards, walkthroughs…"
          size="lg"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          autoFocus
        />

        <div className="ocp-search-results">
          {searchQuery.trim().length < 2 && (
            <p className="ocp-search-hint">Type at least 2 characters to search across all content.</p>
          )}
          {searchQuery.trim().length >= 2 && results.length === 0 && (
            <p className="ocp-search-hint">
              {searchLoading ? 'Searching all study content…' : <>No results for <strong>{searchQuery}</strong>.</>}
            </p>
          )}
          {grouped.map(([pageLabel, items]) => (
            <div key={pageLabel} className="ocp-search-group">
              <div className="ocp-search-group__label">{pageLabel}</div>
              {items.map((r, index) => (
                <button
                  key={`${r.page}-${r.id}-${index}`}
                  className="ocp-search-result"
                  onClick={() => handleResultClick(r.page, r.id)}
                >
                  <span className="ocp-search-result__title">{r.title}</span>
                  <span className="ocp-search-result__excerpt">{r.excerpt}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}
