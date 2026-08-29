import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'agency-theme'

function getInitialTheme() {
  const saved = window.localStorage.getItem(STORAGE_KEY)
  return ['light', 'dark', 'system'].includes(saved) ? saved : 'system'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const activeTheme = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme
      root.dataset.theme = activeTheme
      root.style.colorScheme = activeTheme
    }
    apply()
    window.localStorage.setItem(STORAGE_KEY, theme)
    if (theme === 'system') media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeContext)
}
