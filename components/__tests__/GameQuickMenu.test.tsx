import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GameQuickMenu } from '../GameQuickMenu'

const mocks = vi.hoisted(() => ({
  pathname: '/2048',
  push: vi.fn(),
  setTheme: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ push: mocks.push }),
}))

vi.mock('@/components/GameThemeProvider', () => ({
  useGameTheme: () => ({ theme: 'light', setTheme: mocks.setTheme }),
}))

describe('GameQuickMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
      configurable: true,
      value: vi.fn(),
    })
    Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
      configurable: true,
      value: vi.fn(),
    })
  })

  it('expands theme and home actions from one button', async () => {
    render(<GameQuickMenu />)

    const trigger = screen.getByRole('button', { name: '展开游戏快捷菜单' })
    fireEvent.keyDown(trigger, { key: 'Enter' })

    expect(screen.getByRole('menu', { name: '游戏快捷菜单' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('menuitem', { name: '切换到深色模式' }))
    expect(mocks.setTheme).toHaveBeenCalledWith('dark')

    fireEvent.click(screen.getByRole('menuitem', { name: '返回游戏中心' }))
    expect(mocks.push).toHaveBeenCalledWith('/')
  })

  it('stores the new position after dragging', async () => {
    render(<GameQuickMenu />)
    const trigger = screen.getByRole('button', { name: '展开游戏快捷菜单' })
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      x: 100,
      y: 100,
      left: 100,
      top: 100,
      right: 152,
      bottom: 152,
      width: 52,
      height: 52,
      toJSON: () => ({}),
    })

    fireEvent.pointerDown(trigger, { button: 0, pointerId: 1, clientX: 126, clientY: 126 })
    fireEvent.pointerMove(trigger, { pointerId: 1, clientX: 220, clientY: 260 })
    fireEvent.pointerUp(trigger, { pointerId: 1, clientX: 220, clientY: 260 })

    await waitFor(() => {
      expect(window.localStorage.getItem('game-quick-menu-position')).not.toBeNull()
    })
    expect(screen.queryByRole('menu', { name: '游戏快捷菜单' })).not.toBeInTheDocument()
  })
})
