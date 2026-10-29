import userEvent from '@testing-library/user-event'
import { StrictMode } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SnakeGame from '../page'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

const storeActions = vi.hoisted(() => ({
  setBestScore: vi.fn(),
  incrementGamesPlayed: vi.fn(),
  addFoodEaten: vi.fn(),
}))

vi.mock('../store', () => ({
  useSnakeGameStore: vi.fn(() => ({
    bestScore: 0,
    ...storeActions,
  })),
}))

function dispatchDirectionKey(key: string, repeat = false) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, repeat }))
  })
}

function getHeadTransform() {
  return screen.getByTestId('snake-head').getAttribute('transform') ?? ''
}

describe('SnakeGame keyboard start', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('starts the game when pressing an arrow key from the idle screen', () => {
    render(<SnakeGame />)

    expect(screen.getByRole('button', { name: '开始' })).toBeInTheDocument()

    dispatchDirectionKey('ArrowUp')

    expect(screen.getByRole('button', { name: '暂停' })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(getHeadTransform()).toContain('translate(10.5 9.5)')
  })

  it('starts the game when pressing WASD from the idle screen', () => {
    render(<SnakeGame />)

    dispatchDirectionKey('d')

    expect(screen.getByRole('button', { name: '暂停' })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(getHeadTransform()).toContain('translate(11.5 10.5)')
  })

  it('ignores the opposite direction on the first start move', () => {
    render(<SnakeGame />)

    dispatchDirectionKey('ArrowLeft')

    expect(screen.getByRole('button', { name: '暂停' })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(getHeadTransform()).toContain('translate(11.5 10.5)')
  })

  it('ignores repeated keydown events before the game starts', () => {
    render(<SnakeGame />)

    dispatchDirectionKey('ArrowUp', true)

    expect(screen.getByRole('button', { name: '开始' })).toBeInTheDocument()
  })

  it('still toggles pause with space during play', () => {
    render(<SnakeGame />)

    dispatchDirectionKey('ArrowUp')
    expect(screen.getByRole('button', { name: '暂停' })).toBeInTheDocument()

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
    })
    expect(screen.getByRole('button', { name: '开始' })).toBeInTheDocument()
  })

  it('still queues direction changes during play', () => {
    render(<SnakeGame />)

    dispatchDirectionKey('ArrowUp')

    act(() => {
      vi.advanceTimersByTime(200)
    })
    const afterUp = getHeadTransform()

    dispatchDirectionKey('ArrowRight')

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(getHeadTransform()).not.toBe(afterUp)
    expect(getHeadTransform()).toContain('translate(11.5')
  })
  it('does not toggle pause repeatedly when space is held', () => {
    render(<SnakeGame />)
    dispatchDirectionKey('ArrowUp')
    dispatchDirectionKey(' ', true)
    expect(screen.getByRole('button', { name: '暂停' })).toBeInTheDocument()
  })

  it('leaves focused buttons and fields in control of their keyboard events', () => {
    render(<SnakeGame />)
    const reset = screen.getByRole('button', { name: '重置' })
    fireEvent.keyDown(reset, { key: ' ' })
    expect(screen.getByRole('button', { name: '开始' })).toBeInTheDocument()
    const input = document.createElement('input')
    document.body.append(input)
    fireEvent.keyDown(input, { key: 'w' })
    expect(screen.getByRole('button', { name: '开始' })).toBeInTheDocument()
    input.remove()
  })

  it('validates rapid turns against the last queued direction', () => {
    render(<SnakeGame />)
    dispatchDirectionKey('ArrowRight')
    dispatchDirectionKey('ArrowUp')
    dispatchDirectionKey('ArrowLeft')
    act(() => vi.advanceTimersByTime(150))
    expect(getHeadTransform()).toContain('translate(10.5 9.5)')
    act(() => vi.advanceTimersByTime(150))
    expect(getHeadTransform()).toContain('translate(9.5 9.5)')
  })

  it('pauses on a hidden tab and requires an explicit start after returning', () => {
    render(<SnakeGame />)
    dispatchDirectionKey('ArrowUp')
    const head = getHeadTransform()
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(screen.getByRole('button', { name: '开始' })).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(5000))
    expect(getHeadTransform()).toBe(head)
    hidden.mockReturnValue(false)
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(screen.getByRole('button', { name: '开始' })).toBeInTheDocument()
  })

  it('starts from a board swipe beginning at zero coordinates', () => {
    const { container } = render(<SnakeGame />)
    const board = container.querySelector('[data-snake-board]')!
    fireEvent.touchStart(board, { touches: [{ clientX: 0, clientY: 0, identifier: 1 }] })
    fireEvent.touchEnd(board, { touches: [], changedTouches: [{ clientX: 0, clientY: 60, identifier: 1 }] })
    expect(screen.getByRole('button', { name: '暂停' })).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(150))
    expect(getHeadTransform()).toContain('translate(10.5 11.5)')
  })

  it('ignores swipes outside the board and cancelled touches', () => {
    const { container } = render(<SnakeGame />)
    const board = container.querySelector('[data-snake-board]')!
    fireEvent.touchStart(document.body, { touches: [{ clientX: 100, clientY: 100, identifier: 1 }] })
    fireEvent.touchEnd(document.body, { touches: [], changedTouches: [{ clientX: 100, clientY: 0, identifier: 1 }] })
    fireEvent.touchStart(board, { touches: [{ clientX: 100, clientY: 100, identifier: 1 }] })
    fireEvent.touchCancel(board)
    fireEvent.touchEnd(board, { touches: [], changedTouches: [{ clientX: 100, clientY: 0, identifier: 1 }] })
    expect(screen.getByRole('button', { name: '开始' })).toBeInTheDocument()
  })

  it('counts food once per tick when React StrictMode replays renders', () => {
    render(<StrictMode><SnakeGame /></StrictMode>)
    dispatchDirectionKey('ArrowRight')
    act(() => vi.advanceTimersByTime(750))
    dispatchDirectionKey('ArrowDown')
    act(() => vi.advanceTimersByTime(750))
    expect(getHeadTransform()).toContain('translate(15.5 15.5)')
    expect(storeActions.addFoodEaten).toHaveBeenCalledExactlyOnceWith(1)
    expect(storeActions.incrementGamesPlayed).not.toHaveBeenCalled()
  })

  it('records a collision once and stops future ticks in StrictMode', () => {
    render(<StrictMode><SnakeGame /></StrictMode>)
    dispatchDirectionKey('ArrowUp')
    act(() => vi.advanceTimersByTime(1800))
    expect(storeActions.incrementGamesPlayed).toHaveBeenCalledOnce()
    act(() => vi.advanceTimersByTime(5000))
    expect(storeActions.incrementGamesPlayed).toHaveBeenCalledOnce()
  })

  it('allows a turn into the cell vacated by the tail', () => {
    render(<SnakeGame />)
    dispatchDirectionKey('ArrowRight')
    act(() => vi.advanceTimersByTime(750))
    dispatchDirectionKey('ArrowDown')
    act(() => vi.advanceTimersByTime(750))
    // The food grows the snake to length four, enabling a tight square turn.
    dispatchDirectionKey('ArrowLeft')
    act(() => vi.advanceTimersByTime(150))
    dispatchDirectionKey('ArrowUp')
    act(() => vi.advanceTimersByTime(150))
    dispatchDirectionKey('ArrowRight')
    act(() => vi.advanceTimersByTime(150))
    expect(getHeadTransform()).toContain('translate(15.5 14.5)')
    expect(storeActions.incrementGamesPlayed).not.toHaveBeenCalled()
  })

  it('accepts movement keys after clicking Start while preserving native Space activation', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<SnakeGame />)
    await user.click(screen.getByRole('button', { name: '开始' }))
    await user.keyboard('{ArrowUp}')
    act(() => vi.advanceTimersByTime(150))
    expect(getHeadTransform()).toContain('translate(10.5 9.5)')
    await user.keyboard(' ')
    expect(screen.getByRole('button', { name: '开始' })).toBeInTheDocument()
  })

})
