import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePointerLock } from '../usePointerLock'

describe('usePointerLock', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'pointerLockElement', {
      configurable: true,
      value: null,
    })
  })

  it('requests lock from the exact canvas and falls back after a browser error', () => {
    const requestPointerLock = vi.fn(() => Promise.resolve())
    const canvas = document.createElement('canvas')
    canvas.requestPointerLock = requestPointerLock
    const canvasRef = { current: canvas }
    const { result } = renderHook(() => usePointerLock(canvasRef))

    act(() => {
      result.current.requestPointerLock()
    })
    expect(requestPointerLock).toHaveBeenCalledOnce()
    expect(result.current.browserSupport.useFallback).toBe(false)

    act(() => {
      document.dispatchEvent(new Event('pointerlockerror'))
    })
    expect(result.current.pointerLockError).toBe('浏览器拒绝了鼠标锁定请求。')
    expect(result.current.browserSupport.useFallback).toBe(true)
  })

  it('can explicitly switch to click-target fallback controls', () => {
    const canvasRef = { current: document.createElement('canvas') }
    const { result } = renderHook(() => usePointerLock(canvasRef))

    act(() => {
      result.current.enableFallbackControls()
    })

    expect(result.current.pointerLockError).toBeNull()
    expect(result.current.browserSupport.useFallback).toBe(true)
  })
})
