import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFpsMeter } from '../useFpsMeter'

describe('useFpsMeter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('throttles displayed fps while accepting live reports', () => {
    const { result } = renderHook(() => useFpsMeter())

    act(() => {
      result.current.reportFps(120)
    })
    expect(result.current.displayFps).toBe(60)

    act(() => {
      vi.advanceTimersByTime(250)
    })
    expect(result.current.displayFps).toBe(120)
  })
})
