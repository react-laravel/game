import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useShootingSession } from '../useShootingSession'

describe('useShootingSession', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('owns score, shot, timer, restart, and settings transitions', () => {
    const onTrainingStateChange = vi.fn()
    const { result } = renderHook(() => useShootingSession(onTrainingStateChange))

    act(() => {
      result.current.beginTraining()
      result.current.addScore()
      result.current.recordShot()
    })

    expect(result.current.gameStarted).toBe(true)
    expect(result.current.showStartOverlay).toBe(false)
    expect(result.current.score).toBe(10)
    expect(result.current.shots).toBe(1)
    expect(onTrainingStateChange).toHaveBeenCalledWith(true)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.timeLeft).toBe(59)

    act(() => {
      result.current.restartTraining()
    })
    expect(result.current.score).toBe(0)
    expect(result.current.shots).toBe(0)
    expect(result.current.timeLeft).toBe(60)
    expect(result.current.gameOver).toBe(false)

    act(() => {
      result.current.returnToSettings()
    })
    expect(result.current.gameStarted).toBe(false)
    expect(result.current.showStartOverlay).toBe(true)
    expect(onTrainingStateChange).toHaveBeenLastCalledWith(false)
  })

  it('expires hit feedback without causing render-loop state updates', () => {
    const { result } = renderHook(() => useShootingSession())

    act(() => {
      result.current.showHitFeedback()
    })
    expect(result.current.hitMarker).toBe(true)

    act(() => {
      vi.advanceTimersByTime(110)
    })
    expect(result.current.hitMarker).toBe(false)
  })
})
