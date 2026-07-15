import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTetrisSounds } from '../useTetrisSounds'

describe('useTetrisSounds', () => {
  beforeEach(() => {
    window.localStorage.removeItem('tetris-sound-muted')
  })

  it('persists the mute preference', () => {
    const { result } = renderHook(() => useTetrisSounds())

    expect(result.current.muted).toBe(false)
    act(() => result.current.toggleMuted())

    expect(result.current.muted).toBe(true)
    expect(window.localStorage.getItem('tetris-sound-muted')).toBe('true')
  })

  it('does not throw when Web Audio is unavailable', () => {
    const { result } = renderHook(() => useTetrisSounds())

    expect(() => result.current.playSound('drop')).not.toThrow()
  })

  it('schedules the requested sound pattern when audio is available', () => {
    const start = vi.fn()
    const stop = vi.fn()
    const close = vi.fn()

    class MockAudioContext {
      currentTime = 0
      destination = {}
      state = 'running'
      close = close
      resume = vi.fn().mockResolvedValue(undefined)
      createOscillator = () => ({
        type: 'sine',
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        start,
        stop,
      })
      createGain = () => ({
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      })
    }

    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: MockAudioContext,
    })

    const { result, unmount } = renderHook(() => useTetrisSounds())
    act(() => result.current.playSound('drop'))

    expect(start).toHaveBeenCalledTimes(2)
    expect(stop).toHaveBeenCalledTimes(2)
    unmount()
    expect(close).toHaveBeenCalledOnce()
  })
})
