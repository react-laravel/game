import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { GameHub } from '../GameHub'
import { GameActivityTracker } from '../GameActivityTracker'
import { FAVORITES_KEY, RECENT_GAMES_KEY } from '@/lib/gameHubStorage'

const mocks = vi.hoisted(() => ({ pathname: '/', toggleTheme: vi.fn() }))
vi.mock('next/navigation', () => ({ usePathname: () => mocks.pathname }))
vi.mock('@/components/GameThemeProvider', () => ({
  useGameTheme: () => ({ theme: 'light', toggleTheme: mocks.toggleTheme }),
}))

describe('GameHub discovery and persistence', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.dispatchEvent(new StorageEvent('storage', { key: null }))
    mocks.pathname = '/'
    vi.clearAllMocks()
  })
  afterEach(() => { cleanup(); vi.restoreAllMocks() })

  it('combines category and English search, and resets an empty result', () => {
    render(<GameHub />)
    fireEvent.click(screen.getByRole('button', { name: '益智解谜' }))
    fireEvent.change(screen.getByRole('searchbox', { name: '搜索游戏' }), { target: { value: '  MINESWEEPER ' } })
    expect(within(screen.getByRole('list', { name: '游戏列表' })).getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByRole('link', { name: '游玩 扫雷' })).toHaveAttribute('href', '/minesweeper')
    fireEvent.click(screen.getByRole('button', { name: '经典街机' }))
    expect(screen.getByText('还没有找到合适的游戏')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '查看全部游戏' }))
    expect(within(screen.getByRole('list', { name: '游戏列表' })).getAllByRole('listitem')).toHaveLength(14)
    expect(screen.getByRole('searchbox')).toHaveValue('')
  })

  it('favorites do not navigate and persist after the hub remounts', () => {
    const { unmount } = render(<GameHub />)
    fireEvent.click(screen.getByRole('button', { name: '收藏 2048' }))
    expect(JSON.parse(window.localStorage.getItem(FAVORITES_KEY)!)).toEqual(['2048'])
    fireEvent.click(screen.getByRole('button', { name: /我的收藏/ }))
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(1)
    unmount()
    render(<GameHub />)
    expect(screen.getByRole('button', { name: '取消收藏 2048' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: /我的收藏/ }))
    fireEvent.click(screen.getByRole('button', { name: '取消收藏 2048' }))
    expect(screen.getByText('把喜欢的游戏留在这里')).toBeVisible()
  })

  it('removes stale favorites when storage is cleared in another tab', () => {
    render(<GameHub />)
    fireEvent.click(screen.getByRole('button', { name: '收藏 贪吃蛇' }))
    window.localStorage.clear()
    fireEvent(window, new StorageEvent('storage', { key: null }))
    expect(screen.getByRole('button', { name: '收藏 贪吃蛇' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('keeps favorites usable when browser persistence throws', () => {
    vi.spyOn(window.localStorage, 'setItem')
      .mockImplementationOnce(() => { throw new Error('blocked') })
      .mockImplementationOnce(() => { throw new Error('blocked') })
    render(<GameHub />)
    fireEvent.click(screen.getByRole('button', { name: '收藏 2048' }))
    expect(screen.getByRole('button', { name: '取消收藏 2048' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: '取消收藏 2048' }))
    expect(screen.getByRole('button', { name: '收藏 2048' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('records actual route visits once and excludes unknown paths', () => {
    mocks.pathname = '/snake'
    const { rerender } = render(<><GameActivityTracker /><GameHub /></>)
    expect(JSON.parse(window.localStorage.getItem(RECENT_GAMES_KEY)!)).toEqual(['snake'])
    expect(within(screen.getByRole('navigation', { name: '最近游玩' })).getByRole('link', { name: /贪吃蛇/ })).toHaveAttribute('href', '/snake')
    mocks.pathname = '/2048'
    rerender(<><GameActivityTracker /><GameHub /></>)
    expect(JSON.parse(window.localStorage.getItem(RECENT_GAMES_KEY)!)).toEqual(['2048', 'snake'])
    mocks.pathname = '/auth/callback'
    rerender(<><GameActivityTracker /><GameHub /></>)
    expect(JSON.parse(window.localStorage.getItem(RECENT_GAMES_KEY)!)).toEqual(['2048', 'snake'])
  })

  it('explains a desktop-only game on mobile without offering a broken launch', () => {
    render(<GameHub />)
    expect(screen.getByRole('heading', { name: '射击训练场' })).toBeVisible()
    expect(screen.queryByRole('link', { name: '游玩 射击训练场' })).not.toBeInTheDocument()
    expect(screen.getByText('请在电脑上使用键盘和鼠标游玩')).toBeVisible()
  })

  it('does not show an empty recent row for desktop-only mobile history', () => {
    window.localStorage.setItem(RECENT_GAMES_KEY, '["shooting-range"]')
    render(<GameHub />)
    expect(screen.queryByRole('navigation', { name: '最近游玩' })).not.toBeInTheDocument()
  })

  it('focuses search with / without hijacking text input', () => {
    render(<GameHub />)
    fireEvent.keyDown(window, { key: '/' })
    expect(screen.getByRole('searchbox')).toHaveFocus()
    const event = new KeyboardEvent('keydown', { key: '/', bubbles: true, cancelable: true })
    screen.getByRole('searchbox').dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: '切换到深色模式' }))
    expect(mocks.toggleTheme).toHaveBeenCalledOnce()
  })
})
