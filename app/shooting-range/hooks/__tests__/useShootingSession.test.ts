import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useShootingSession } from '../useShootingSession'
import { loadSessionHistory } from '../../utils/statsStorage'

const baseConfig = {
  difficulty: 'easy' as const,
  mapId: 'indoor' as const,
  modeId: 'moving' as const,
}

describe('useShootingSession', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('owns score, shot, timer, restart, and settings transitions', () => {
    const onTrainingStateChange = vi.fn()
    const { result } = renderHook(() => useShootingSession(baseConfig, onTrainingStateChange))

    act(() => {
      result.current.beginTraining()
      result.current.recordShot(true, 240)
    })

    expect(result.current.gameStarted).toBe(true)
    expect(result.current.showStartOverlay).toBe(false)
    expect(result.current.sessionStats.score).toBe(10)
    expect(result.current.sessionStats.hits).toBe(1)
    expect(result.current.sessionStats.shots).toBe(1)
    expect(onTrainingStateChange).toHaveBeenCalledWith(true)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.timeLeft).toBe(59)

    act(() => {
      result.current.restartTraining()
    })
    expect(result.current.sessionStats.score).toBe(0)
    expect(result.current.sessionStats.shots).toBe(0)
    expect(result.current.timeLeft).toBe(60)
    expect(result.current.gameOver).toBe(false)

    act(() => {
      result.current.returnToSettings()
    })
    expect(result.current.gameStarted).toBe(false)
    expect(result.current.showStartOverlay).toBe(true)
    expect(onTrainingStateChange).toHaveBeenLastCalledWith(false)
  })

  it('tracks misses, streaks, and persists history on game over', () => {
    const { result } = renderHook(() =>
      useShootingSession({ ...baseConfig, modeId: 'timed' })
    )

    act(() => {
      result.current.beginTraining()
      result.current.recordShot(true, 200)
      result.current.recordShot(true, 180)
      result.current.recordShot(false)
    })

    expect(result.current.sessionStats.bestStreak).toBe(2)
    expect(result.current.sessionStats.misses).toBe(1)

    act(() => {
      vi.advanceTimersByTime(45_000)
    })

    expect(result.current.gameOver).toBe(true)
    expect(loadSessionHistory()).toHaveLength(1)
  })

  it('expires hit feedback without causing render-loop state updates', () => {
    const { result } = renderHook(() => useShootingSession(baseConfig))

    act(() => {
      result.current.showHitFeedback()
    })
    expect(result.current.hitMarker).toBe(true)

    act(() => {
      vi.advanceTimersByTime(85)
    })
    expect(result.current.hitMarker).toBe(false)
  })

  it('can end the session early for QA and persist results', () => {
    const { result } = renderHook(() => useShootingSession(baseConfig))

    act(() => {
      result.current.beginTraining()
      result.current.recordShot(true, 220)
      result.current.endSessionEarly()
    })

    expect(result.current.gameOver).toBe(true)
    expect(result.current.timeLeft).toBe(0)
    expect(loadSessionHistory()).toHaveLength(1)
  })
})
