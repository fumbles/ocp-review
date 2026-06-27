import { useState, useEffect } from 'react'
import { Theme } from '@carbon/react'
import Shell from './components/Shell'

function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('ocp-theme') || 'white'
  )

  useEffect(() => {
    localStorage.setItem('ocp-theme', theme)
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
