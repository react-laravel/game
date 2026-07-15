import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GameThemeProvider } from '@/components/GameThemeProvider'
import { GAME_THEME_STORAGE_KEY } from '@/lib/theme'
import { MonopolyHeader } from '../components/MonopolyHeader'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={String(href)} {...props}>
      {children}
    </a>
  ),
}))

describe('MonopolyHeader', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = ''
  })

  it('provides a dedicated route back to the game center', () => {
    render(
      <GameThemeProvider>
        <MonopolyHeader />
      </GameThemeProvider>
    )

    expect(screen.getByRole('navigation', { name: '地产棋局导航' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '返回游戏中心' })).toHaveAttribute('href', '/')
  })

  it('keeps the board palette and selected theme on the same root class', async () => {
    render(
      <GameThemeProvider>
        <MonopolyHeader />
      </GameThemeProvider>
    )

    const toggle = await screen.findByRole('button', { name: '切换到深色模式' })
    fireEvent.click(toggle)

    expect(document.documentElement).toHaveClass('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(window.localStorage.getItem(GAME_THEME_STORAGE_KEY)).toBe('dark')
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '切换到浅色模式' })).toBeInTheDocument()
    )
  })
})
