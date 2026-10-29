import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardControls } from '../useKeyboardControls'

describe('useKeyboardControls (2048)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not register listener when disabled', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')

    renderHook(() =>
      useKeyboardControls({
        onMove: vi.fn(),
        enabled: false,
      })
    )

    expect(addSpy).not.toHaveBeenCalled()
    addSpy.mockRestore()
  })

  it('should register listener when enabled', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')

    renderHook(() =>
      useKeyboardControls({
        onMove: vi.fn(),
        enabled: true,
      })
    )

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    addSpy.mockRestore()
  })

  it('should call onMove with left direction on ArrowLeft', () => {
    const onMove = vi.fn()

    renderHook(() =>
      useKeyboardControls({
        onMove,
        enabled: true,
      })
    )

    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
    window.dispatchEvent(event)

    expect(onMove).toHaveBeenCalledWith('left')
  })

  it('should call onMove with right direction on ArrowRight', () => {
    const onMove = vi.fn()

    renderHook(() =>
      useKeyboardControls({
        onMove,
        enabled: true,
      })
    )

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
    window.dispatchEvent(event)

    expect(onMove).toHaveBeenCalledWith('right')
  })

  it('should call onMove with up direction on ArrowUp', () => {
    const onMove = vi.fn()

    renderHook(() =>
      useKeyboardControls({
        onMove,
        enabled: true,
      })
    )

    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
    window.dispatchEvent(event)

    expect(onMove).toHaveBeenCalledWith('up')
  })

  it('should call onMove with down direction on ArrowDown', () => {
    const onMove = vi.fn()

    renderHook(() =>
      useKeyboardControls({
        onMove,
        enabled: true,
      })
    )

    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
    window.dispatchEvent(event)

    expect(onMove).toHaveBeenCalledWith('down')
  })

  it('should not call onMove for non-arrow keys', () => {
    const onMove = vi.fn()

    renderHook(() =>
      useKeyboardControls({
        onMove,
        enabled: true,
      })
    )

    const event = new KeyboardEvent('keydown', { key: 'a' })
    window.dispatchEvent(event)

    expect(onMove).not.toHaveBeenCalled()
  })

  it('should remove event listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() =>
      useKeyboardControls({
        onMove: vi.fn(),
        enabled: true,
      })
    )

    unmount()
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    removeSpy.mockRestore()
  })
  it.each(['input', 'textarea', 'select'])('leaves %s keyboard interaction to the focused control', tag => {
    const onMove = vi.fn()
    renderHook(() => useKeyboardControls({ onMove }))
    const control = document.createElement(tag)
    document.body.append(control)
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true })
    control.dispatchEvent(event)
    expect(onMove).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
    control.remove()
  })

  it('ignores shortcuts, composition, and keys handled by another control', () => {
    const onMove = vi.fn()
    renderHook(() => useKeyboardControls({ onMove }))
    for (const options of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }, { isComposing: true }]) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', ...options }))
    }
    const handled = new KeyboardEvent('keydown', { key: 'ArrowLeft', cancelable: true })
    handled.preventDefault()
    window.dispatchEvent(handled)
    expect(onMove).not.toHaveBeenCalled()
  })

  it('does not move while a dialog owns keyboard focus', () => {
    const onMove = vi.fn()
    renderHook(() => useKeyboardControls({ onMove }))
    const dialog = document.createElement('div')
    dialog.setAttribute('role', 'dialog')
    const content = document.createElement('div')
    dialog.append(content)
    document.body.append(dialog)
    content.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    expect(onMove).not.toHaveBeenCalled()
    dialog.remove()
  })

})
