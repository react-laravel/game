import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useMazeStore, type MazeCell } from '../store'

const createCorridor = (length = 4): MazeCell[][] => [
  Array.from({ length }, (_, x) => ({
    top: true,
    bottom: true,
    left: x === 0,
    right: x === length - 1,
  })),
]

const startCorridor = () => {
  useMazeStore.setState({ maze: createCorridor(), gameStarted: true })
}

describe('maze automatic movement lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useMazeStore.getState().resetGame()
    startCorridor()
  })

  afterEach(() => {
    useMazeStore.getState().resetGame()
    vi.useRealTimers()
  })

  it('stops all old movement after resetting and starting a new maze', () => {
    useMazeStore.getState().moveToPosition(3, 0)
    expect(useMazeStore.getState().ball.x).toBe(1)

    useMazeStore.getState().resetGame()
    startCorridor()
    vi.advanceTimersByTime(1000)

    expect(useMazeStore.getState().ball.x).toBe(0)
    expect(useMazeStore.getState().moves).toBe(0)
    expect(useMazeStore.getState().gameCompleted).toBe(false)
  })

  it('immediately yields to interruption and never takes a subsequent step', () => {
    useMazeStore.getState().moveToPosition(3, 0)
    useMazeStore.getState().interruptAutoMove()
    expect(useMazeStore.getState().isAutoMoving).toBe(false)

    vi.advanceTimersByTime(1000)
    expect(useMazeStore.getState().ball.x).toBe(1)
    expect(useMazeStore.getState().moves).toBe(1)
  })

  it('replaces a target immediately without delayed retries into the next round', () => {
    useMazeStore.getState().moveToPosition(3, 0)
    useMazeStore.getState().moveToPosition(0, 0)
    expect(useMazeStore.getState().ball.x).toBe(0)

    useMazeStore.getState().resetGame()
    startCorridor()
    vi.advanceTimersByTime(1000)
    expect(useMazeStore.getState().ball.x).toBe(0)
    expect(useMazeStore.getState().moves).toBe(0)
  })

  it('allows a manual move to replace the automatic route', () => {
    useMazeStore.getState().moveToPosition(3, 0)
    useMazeStore.getState().moveBall('left')
    vi.advanceTimersByTime(1000)

    expect(useMazeStore.getState().ball.x).toBe(0)
    expect(useMazeStore.getState().moves).toBe(2)
    expect(useMazeStore.getState().isAutoMoving).toBe(false)
  })

  it('marks completion as soon as the ball reaches the finish', () => {
    useMazeStore.getState().moveToPosition(3, 0)
    vi.advanceTimersByTime(400)

    expect(useMazeStore.getState().ball.x).toBe(3)
    expect(useMazeStore.getState().gameCompleted).toBe(true)
    expect(useMazeStore.getState().isAutoMoving).toBe(false)
    expect(useMazeStore.getState().moves).toBe(3)

    useMazeStore.getState().moveToPosition(0, 0)
    vi.advanceTimersByTime(1000)
    expect(useMazeStore.getState().ball.x).toBe(3)
    expect(useMazeStore.getState().moves).toBe(3)
  })
})
