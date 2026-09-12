import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from '@testing-library/react'
import { RESULT_DISPLAY_MS } from '../utils/scoring'
import { useBowlingStore } from '../store'

describe('bowling store', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useBowlingStore.getState().resetGame()
  })

  afterEach(() => {
    useBowlingStore.getState().resetGame()
    vi.useRealTimers()
  })

  it('starts a ten-frame game', () => {
    act(() => {
      useBowlingStore.getState().startGame()
    })

    const state = useBowlingStore.getState()
    expect(state.gameStarted).toBe(true)
    expect(state.frames).toHaveLength(10)
    expect(state.currentFrame).toBe(1)
    expect(state.canThrow).toBe(true)
  })

  it('records a strike and advances after the result delay', () => {
    act(() => {
      useBowlingStore.getState().startGame()
      useBowlingStore.getState().processThrowResult(10)
    })

    expect(useBowlingStore.getState().showingResult).toBe(true)
    expect(useBowlingStore.getState().lastResultKind).toBe('strike')

    act(() => {
      vi.advanceTimersByTime(RESULT_DISPLAY_MS)
    })

    const state = useBowlingStore.getState()
    expect(state.currentFrame).toBe(2)
    expect(state.currentThrow).toBe(1)
    expect(state.frames[0]).toEqual([10])
    expect(state.canThrow).toBe(true)
  })

  it('keeps standing pins for a second throw', () => {
    act(() => {
      useBowlingStore.getState().startGame()
      useBowlingStore.getState().processThrowResult(6)
      vi.advanceTimersByTime(RESULT_DISPLAY_MS)
    })

    const state = useBowlingStore.getState()
    expect(state.currentThrow).toBe(2)
    expect(state.pinsStanding).toBe(4)
    expect(state.frames[0]).toEqual([6])
  })

  it('finishes the game after the tenth open frame', () => {
    act(() => {
      useBowlingStore.getState().startGame()
    })

    for (let frame = 0; frame < 10; frame++) {
      act(() => {
        useBowlingStore.getState().processThrowResult(3)
        vi.advanceTimersByTime(RESULT_DISPLAY_MS)
        useBowlingStore.getState().processThrowResult(6)
        vi.advanceTimersByTime(RESULT_DISPLAY_MS)
      })
    }

    const state = useBowlingStore.getState()
    expect(state.gameFinished).toBe(true)
    expect(state.totalScore).toBe(90)
    expect(state.canThrow).toBe(false)
  })
})
