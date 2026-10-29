import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MazeGame from '../components/MazeGame'
import { useMazeStore } from '../store'

vi.mock('../components/MazeCanvas', () => ({ default: () => <canvas /> }))

describe('MazeGame keyboard takeover', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useMazeStore.getState().resetGame()
    useMazeStore.setState({
      gameStarted: true,
      maze: [Array.from({ length: 4 }, (_, x) => ({
        top: true, bottom: true, left: x === 0, right: x === 3,
      }))],
    })
  })

  afterEach(() => {
    useMazeStore.getState().resetGame()
    vi.useRealTimers()
  })

  it('immediately replaces an automatic route with a keyboard move', () => {
    render(<MazeGame />)
    act(() => useMazeStore.getState().moveToPosition(3, 0))
    expect(fireEvent.keyDown(window, { key: 'ArrowLeft' })).toBe(false)
    expect(useMazeStore.getState().ball.x).toBe(0)

    act(() => vi.advanceTimersByTime(1000))
    expect(useMazeStore.getState().ball.x).toBe(0)
    expect(useMazeStore.getState().moves).toBe(2)
  })

  it('keeps an automatic route running when unrelated keys or focused controls are used', () => {
    render(<MazeGame />)
    act(() => useMazeStore.getState().moveToPosition(3, 0))
    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.keyDown(screen.getByRole('slider', { name: '迷宫大小' }), { key: 'ArrowLeft' })
    expect(useMazeStore.getState().isAutoMoving).toBe(true)

    act(() => vi.advanceTimersByTime(200))
    expect(useMazeStore.getState().ball.x).toBe(2)
  })

  it('cancels the active route when navigating away', () => {
    const { unmount } = render(<MazeGame />)
    act(() => useMazeStore.getState().moveToPosition(3, 0))
    unmount()
    act(() => vi.advanceTimersByTime(1000))
    expect(useMazeStore.getState().ball.x).toBe(1)
    expect(useMazeStore.getState().isAutoMoving).toBe(false)
  })
})
