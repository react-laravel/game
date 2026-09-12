import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SnakeGame from '../page'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock('../store', () => ({
  useSnakeGameStore: vi.fn(() => ({
    bestScore: 0,
    setBestScore: vi.fn(),
    incrementGamesPlayed: vi.fn(),
    addFoodEaten: vi.fn(),
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
})
