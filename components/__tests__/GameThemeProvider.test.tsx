import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GameThemeProvider, useGameTheme } from '../GameThemeProvider'

const readStorage = vi.mocked(window.localStorage.getItem).getMockImplementation()!
const writeStorage = vi.mocked(window.localStorage.setItem).getMockImplementation()!

function ThemeControls() {
  const { theme, toggleTheme } = useGameTheme()
  return <button onClick={toggleTheme}>{theme}</button>
}

describe('GameThemeProvider', () => {
  beforeEach(() => {
    vi.mocked(window.localStorage.getItem).mockImplementation(readStorage)
    vi.mocked(window.localStorage.setItem).mockImplementation(writeStorage)
    window.localStorage.clear()
    window.dispatchEvent(new StorageEvent('storage', { key: null }))
    document.documentElement.classList.remove('dark')
  })
  afterEach(() => vi.restoreAllMocks())

  it('uses system preference when storage cannot be read', () => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => { throw new Error('Blocked') })
    render(<GameThemeProvider><ThemeControls /></GameThemeProvider>)
    expect(screen.getByRole('button', { name: 'light' })).toBeInTheDocument()
  })

  it('updates and toggles the current theme when storage cannot be written', () => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => { throw new Error('Quota exceeded') })
    render(<GameThemeProvider><ThemeControls /></GameThemeProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'light' }))
    expect(screen.getByRole('button', { name: 'dark' })).toBeInTheDocument()
    expect(document.documentElement).toHaveClass('dark')
    fireEvent.click(screen.getByRole('button', { name: 'dark' }))
    expect(screen.getByRole('button', { name: 'light' })).toBeInTheDocument()
    expect(document.documentElement).not.toHaveClass('dark')
    vi.mocked(window.localStorage.setItem).mockImplementation(writeStorage)
    fireEvent.click(screen.getByRole('button', { name: 'light' }))
    expect(window.localStorage.getItem('game-theme-mode')).toBe('dark')
  })

  it('reacts to themes being cleared in another tab', () => {
    window.localStorage.setItem('game-theme-mode', 'dark')
    render(<GameThemeProvider><ThemeControls /></GameThemeProvider>)
    expect(screen.getByRole('button', { name: 'dark' })).toBeInTheDocument()
    act(() => {
      window.localStorage.clear()
      window.dispatchEvent(new StorageEvent('storage', { key: null }))
    })
    expect(screen.getByRole('button', { name: 'light' })).toBeInTheDocument()
  })
})
