import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
    mocks.pathname = '/2048'
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

  afterEach(() => vi.restoreAllMocks())

  it('expands theme and home actions from one button', async () => {
    render(<GameQuickMenu />)

    const trigger = screen.getByRole('button', { name: '展开游戏快捷菜单' })
    fireEvent.click(trigger)

    expect(screen.getByRole('menu', { name: '游戏快捷菜单' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('menuitemradio', { name: '切换到深色模式' }))
    expect(mocks.setTheme).toHaveBeenCalledWith('dark')

    fireEvent.click(screen.getByRole('menuitem', { name: '返回游戏中心' }))
    expect(mocks.push).toHaveBeenCalledWith('/')
  })

  it('opens with native keyboard activation and navigates without game shortcuts', async () => {
    const user = userEvent.setup()
    const gameKey = vi.fn()
    window.addEventListener('keydown', gameKey)
    render(<GameQuickMenu />)
    const trigger = screen.getByRole('button', { name: '展开游戏快捷菜单' })
    trigger.focus()

    await user.keyboard('{Enter}')
    expect(screen.getByRole('menuitem', { name: '返回游戏中心' })).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitemradio', { name: '切换到浅色模式' })).toHaveFocus()
    await user.keyboard('{End}')
    expect(screen.getByRole('menuitemradio', { name: '切换到深色模式' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(gameKey).not.toHaveBeenCalled()
    window.removeEventListener('keydown', gameKey)
  })

  it('closes on an outside press and route changes', () => {
    const { rerender } = render(<GameQuickMenu />)
    fireEvent.click(screen.getByRole('button', { name: '展开游戏快捷菜单' }))
    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '展开游戏快捷菜单' }))
    mocks.pathname = '/snake'
    rerender(<GameQuickMenu />)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('keeps actions inside the viewport at both horizontal edges', async () => {
    window.localStorage.setItem('game-quick-menu-position', JSON.stringify({ x: 14, y: 14 }))
    render(<GameQuickMenu />)
    await waitFor(() => expect(screen.getByTestId('game-quick-menu')).toHaveStyle({ left: '14px', top: '14px' }))
    fireEvent.click(screen.getByRole('button', { name: '展开游戏快捷菜单' }))
    expect(screen.getByRole('menu')).toHaveClass('left-1/2', 'flex-col', 'top-[calc(100%+0.6rem)]')
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
    // Browsers emit a click after pointerup; dragging must not open the menu.
    fireEvent.click(trigger)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('still allows dragging when persistent storage is blocked', () => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => { throw new Error('Storage blocked') })
    render(<GameQuickMenu />)
    const trigger = screen.getByRole('button', { name: '展开游戏快捷菜单' })
    fireEvent.pointerDown(trigger, { button: 0, pointerId: 1, clientX: 10, clientY: 10 })
    fireEvent.pointerMove(trigger, { pointerId: 1, clientX: 200, clientY: 240 })
    expect(() => fireEvent.pointerUp(trigger, { pointerId: 1 })).not.toThrow()
  })
})
