import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePointerLock } from '../usePointerLock'

describe('usePointerLock', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'pointerLockElement', {
      configurable: true,
      writable: true,
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
    expect(result.current.isPointerLocked).toBe(false)
  })

  it('tracks pointer lock state across acquire and release cycles', async () => {
    const canvas = document.createElement('canvas')
    canvas.requestPointerLock = vi.fn(() => {
      Object.defineProperty(document, 'pointerLockElement', {
        configurable: true,
        writable: true,
        value: canvas,
      })
      document.dispatchEvent(new Event('pointerlockchange'))
      return Promise.resolve()
    })
    const canvasRef = { current: canvas }
    const { result } = renderHook(() => usePointerLock(canvasRef))

    await act(async () => {
      result.current.requestPointerLock()
    })
    expect(result.current.isPointerLocked).toBe(true)

    act(() => {
      Object.defineProperty(document, 'pointerLockElement', {
        configurable: true,
        writable: true,
        value: null,
      })
      document.dispatchEvent(new Event('pointerlockchange'))
    })
    expect(result.current.isPointerLocked).toBe(false)

    await act(async () => {
      result.current.requestPointerLock()
    })
    expect(result.current.isPointerLocked).toBe(true)
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
