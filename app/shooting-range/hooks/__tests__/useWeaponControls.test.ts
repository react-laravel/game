import { act, fireEvent, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useWeaponControls } from '../useWeaponControls'

describe('weapon controls', () => {
  let canvas: HTMLCanvasElement
  beforeEach(() => {
    canvas = document.createElement('canvas')
    document.body.append(canvas)
    Object.defineProperty(document, 'pointerLockElement', {
      configurable: true,
      writable: true,
      value: canvas,
    })
  })
  afterEach(() => {
    canvas.remove()
    vi.restoreAllMocks()
  })

  it('switches with 1/2 and wheel, and prevents a burst of trackpad events from cycling twice', () => {
    let now = 1000
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    const ref = { current: canvas }
    const { result } = renderHook(() => useWeaponControls(ref, true, false))
    fireEvent.keyDown(window, { code: 'Digit2' })
    expect(result.current.weaponId).toBe('sniper')
    fireEvent.keyDown(window, { code: 'Numpad1' })
    expect(result.current.weaponId).toBe('pistol')
    fireEvent.wheel(canvas, { deltaY: 100 })
    expect(result.current.weaponId).toBe('sniper')
    fireEvent.wheel(canvas, { deltaY: 100 })
    expect(result.current.weaponId).toBe('sniper')
    now += 201
    fireEvent.wheel(canvas, { deltaY: -100 })
    expect(result.current.weaponId).toBe('pistol')
  })

  it('aims only while right mouse is held, and clears aim on switch, blur, and pointer release', () => {
    const ref = { current: canvas }
    const { result } = renderHook(() => useWeaponControls(ref, true, false))
    fireEvent.keyDown(window, { code: 'Digit2' })
    fireEvent.mouseDown(canvas, { button: 2 })
    expect(result.current.isScoped).toBe(true)
    fireEvent.mouseUp(window, { button: 2 })
    expect(result.current.isAiming).toBe(false)
    fireEvent.mouseDown(canvas, { button: 2 })
    fireEvent.keyDown(window, { code: 'Digit1' })
    expect(result.current.isAiming).toBe(false)
    fireEvent.mouseDown(canvas, { button: 2 })
    fireEvent.blur(window)
    expect(result.current.isAiming).toBe(false)
    fireEvent.mouseDown(canvas, { button: 2 })
    act(() => {
      Object.defineProperty(document, 'pointerLockElement', { configurable: true, value: null })
      document.dispatchEvent(new Event('pointerlockchange'))
    })
    expect(result.current.isAiming).toBe(false)
  })

  it('does not carry held aim through a pause or intercept settings input', () => {
    const ref = { current: canvas }
    const { result, rerender } = renderHook(
      ({ enabled }) => useWeaponControls(ref, enabled, false),
      { initialProps: { enabled: true } }
    )
    fireEvent.mouseDown(canvas, { button: 2 })
    expect(result.current.isAiming).toBe(true)
    rerender({ enabled: false })
    fireEvent.keyDown(window, { code: 'Digit2' })
    expect(result.current.weaponId).toBe('pistol')
    expect(result.current.isAiming).toBe(false)
    rerender({ enabled: true })
    expect(result.current.isAiming).toBe(false)
    const input = document.createElement('input')
    document.body.append(input)
    fireEvent.keyDown(input, { code: 'Digit2' })
    fireEvent.wheel(input, { deltaY: 100 })
    expect(result.current.weaponId).toBe('pistol')
    input.remove()
  })

  it('supports fallback aiming only on the game canvas and suppresses the context menu', () => {
    Object.defineProperty(document, 'pointerLockElement', { configurable: true, value: null })
    const ref = { current: canvas }
    const { result } = renderHook(() => useWeaponControls(ref, true, true))
    fireEvent.mouseDown(document.body, { button: 2 })
    expect(result.current.isAiming).toBe(false)
    fireEvent.mouseDown(canvas, { button: 2 })
    expect(result.current.isAiming).toBe(true)
    expect(fireEvent.contextMenu(canvas)).toBe(false)
  })
})
