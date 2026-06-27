import {
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
  SideNav,
  SideNavItems,
  SideNavMenuItem,
  Content,
} from '@carbon/react'
import { Asleep, Light } from '@carbon/icons-react'
import { useState } from 'react'

import HomePage from './pages/HomePage'
import LearnPage from './pages/LearnPage'
import FlashcardsPage from './pages/FlashcardsPage'
import WalkthroughsPage from './pages/WalkthroughsPage'
import GlossaryPage from './pages/GlossaryPage'
import TroubleshootingPage from './pages/TroubleshootingPage'

const PAGES = [
  { id: 'home',           label: 'Home' },
  { id: 'learn',          label: 'Learn' },
  { id: 'flashcards',     label: 'Flashcards' },
  { id: 'walkthroughs',   label: 'Walkthroughs' },
  { id: 'glossary',       label: 'Glossary' },
  { id: 'troubleshooting',label: 'Troubleshooting' },
]

const PAGE_COMPONENTS = (navigate) => ({
  home:           <HomePage onNavigate={navigate} />,
  learn:          <LearnPage />,
  flashcards:     <FlashcardsPage />,
  walkthroughs:   <WalkthroughsPage />,
  glossary:       <GlossaryPage />,
  troubleshooting:<TroubleshootingPage />,
})

export default function Shell({ theme, onToggleTheme }) {
  const [activePage, setActivePage] = useState('home')
  const [sideNavOpen, setSideNavOpen] = useState(false)

  const navigate = (id) => {
    setActivePage(id)
    setSideNavOpen(false)
    window.scrollTo(0, 0)
  }

  const isDark = theme === 'g100'

  return (
    <>
      <Header aria-label="OCP Mastery">
        <SkipToContent />

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
        {PAGE_COMPONENTS(navigate)[activePage]}
      </Content>
    </>
  )
}
