'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { GAME_THEME_STORAGE_KEY, isGameTheme, type GameTheme } from '@/lib/theme'

interface GameThemeContextValue {
  theme: GameTheme | null
  setTheme: (theme: GameTheme) => void
  toggleTheme: () => void
}

const GameThemeContext = createContext<GameThemeContextValue | null>(null)
const themeListeners = new Set<() => void>()

function getStoredTheme(): GameTheme | null {
  const storedTheme = window.localStorage.getItem(GAME_THEME_STORAGE_KEY)
  return isGameTheme(storedTheme) ? storedTheme : null
}

function getSystemTheme(): GameTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: GameTheme) {
  const root = document.documentElement
  const isDark = theme === 'dark'
  const backgroundColor = isDark ? '#0a0a0a' : '#ffffff'

  root.classList.toggle('dark', isDark)
  root.style.colorScheme = theme
  root.style.backgroundColor = backgroundColor
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', backgroundColor)
}

function getThemeSnapshot(): GameTheme {
  return getStoredTheme() ?? getSystemTheme()
}

function emitThemeChange() {
  const nextTheme = getThemeSnapshot()
  applyTheme(nextTheme)
  themeListeners.forEach(listener => listener())
}

function subscribeToTheme(listener: () => void) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemThemeChange = () => {
    if (!getStoredTheme()) emitThemeChange()
  }
  const handleStorage = (event: StorageEvent) => {
    if (event.key === GAME_THEME_STORAGE_KEY) emitThemeChange()
  }

  themeListeners.add(listener)
  mediaQuery.addEventListener('change', handleSystemThemeChange)
  window.addEventListener('storage', handleStorage)

  return () => {
    themeListeners.delete(listener)
    mediaQuery.removeEventListener('change', handleSystemThemeChange)
    window.removeEventListener('storage', handleStorage)
  }
}

export function GameThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore<GameTheme | null>(
    subscribeToTheme,
    getThemeSnapshot,
    () => null
  )

  useEffect(() => {
    if (!theme) return

    applyTheme(theme)
  }, [theme])

  const setTheme = useCallback((nextTheme: GameTheme) => {
    window.localStorage.setItem(GAME_THEME_STORAGE_KEY, nextTheme)
    applyTheme(nextTheme)
    themeListeners.forEach(listener => listener())
  }, [])

  const toggleTheme = useCallback(() => {
    const currentTheme =
      theme ?? (document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    setTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }, [setTheme, theme])

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [setTheme, theme, toggleTheme])

  return <GameThemeContext.Provider value={value}>{children}</GameThemeContext.Provider>
}

export function useGameTheme() {
  const context = useContext(GameThemeContext)
  if (!context) throw new Error('useGameTheme must be used inside GameThemeProvider')
  return context
}
