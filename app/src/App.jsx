import { useState, useEffect } from 'react'
import { Theme } from '@carbon/react'
import Shell from './components/Shell'

function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('ocp-theme') || 'white'
    document.documentElement.setAttribute('data-carbon-theme', saved)
    return saved
  })

  useEffect(() => {
    localStorage.setItem('ocp-theme', theme)
    document.documentElement.setAttribute('data-carbon-theme', theme)
  }, [theme])

  const toggleTheme = () =>
    setTheme(t => (t === 'g100' ? 'white' : 'g100'))

  return (
    <Theme theme={theme}>
      <Shell theme={theme} onToggleTheme={toggleTheme} />
    </Theme>
  )
}

export default App
