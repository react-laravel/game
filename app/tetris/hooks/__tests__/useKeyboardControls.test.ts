import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardControls } from '../useKeyboardControls'

describe('useKeyboardControls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Clean up any event listeners added by the hook
  })

  it('should register keyboard event listener on mount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() =>
      useKeyboardControls({
        movePiece: vi.fn(),
        rotatePiece: vi.fn(),
        hardDrop: vi.fn(),
        togglePause: vi.fn(),
        gameOver: false,
      })
    )

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('should not register listener when enabled is false', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')

    renderHook(() =>
      useKeyboardControls({
        movePiece: vi.fn(),
        rotatePiece: vi.fn(),
        hardDrop: vi.fn(),
        togglePause: vi.fn(),
        gameOver: false,
        enabled: false,
      })
    )

    expect(addSpy).not.toHaveBeenCalled()
    addSpy.mockRestore()
  })

  it('should not move when gameOver is true', () => {
    const movePiece = vi.fn()

    renderHook(() =>
      useKeyboardControls({
        movePiece,
        rotatePiece: vi.fn(),
        hardDrop: vi.fn(),
        togglePause: vi.fn(),
        gameOver: true,
      })
    )

    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
    window.dispatchEvent(event)

    expect(movePiece).not.toHaveBeenCalled()
  })

  it('should call movePiece left on ArrowLeft', () => {
    const movePiece = vi.fn()

    renderHook(() =>
      useKeyboardControls({
        movePiece,
        rotatePiece: vi.fn(),
        hardDrop: vi.fn(),
        togglePause: vi.fn(),
        gameOver: false,
      })
    )

    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
    window.dispatchEvent(event)

    expect(movePiece).toHaveBeenCalledWith('left')
  })

  it('should call movePiece right on ArrowRight', () => {
    const movePiece = vi.fn()

    renderHook(() =>
      useKeyboardControls({
        movePiece,
        rotatePiece: vi.fn(),
        hardDrop: vi.fn(),
        togglePause: vi.fn(),
        gameOver: false,
      })
    )

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
    window.dispatchEvent(event)

    expect(movePiece).toHaveBeenCalledWith('right')
  })

  it('should call movePiece down on ArrowDown', () => {
    const movePiece = vi.fn()

    renderHook(() =>
      useKeyboardControls({
        movePiece,
        rotatePiece: vi.fn(),
        hardDrop: vi.fn(),
        togglePause: vi.fn(),
        gameOver: false,
      })
    )

    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
    window.dispatchEvent(event)

    expect(movePiece).toHaveBeenCalledWith('down')
  })

  it('should call rotatePiece on ArrowUp', () => {
    const rotatePiece = vi.fn()

    renderHook(() =>
      useKeyboardControls({
        movePiece: vi.fn(),
        rotatePiece,
        hardDrop: vi.fn(),
        togglePause: vi.fn(),
        gameOver: false,
      })
    )

    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
    window.dispatchEvent(event)

    expect(rotatePiece).toHaveBeenCalled()
  })

  it('should call rotatePiece on W key', () => {
    const rotatePiece = vi.fn()

    renderHook(() =>
      useKeyboardControls({
        movePiece: vi.fn(),
        rotatePiece,
        hardDrop: vi.fn(),
        togglePause: vi.fn(),
        gameOver: false,
      })
    )

    const event = new KeyboardEvent('keydown', { key: 'w' })
    window.dispatchEvent(event)

    expect(rotatePiece).toHaveBeenCalled()
  })

  it('should call hardDrop on Space', () => {
    const hardDrop = vi.fn()

    renderHook(() =>
      useKeyboardControls({
        movePiece: vi.fn(),
        rotatePiece: vi.fn(),
        hardDrop,
        togglePause: vi.fn(),
        gameOver: false,
      })
    )

    const event = new KeyboardEvent('keydown', { key: ' ' })
    window.dispatchEvent(event)

    expect(hardDrop).toHaveBeenCalled()
  })

  it('should call togglePause on P key', () => {
    const togglePause = vi.fn()

    renderHook(() =>
      useKeyboardControls({
        movePiece: vi.fn(),
        rotatePiece: vi.fn(),
        hardDrop: vi.fn(),
        togglePause,
        gameOver: false,
      })
    )

    const event = new KeyboardEvent('keydown', { key: 'p' })
    window.dispatchEvent(event)

    expect(togglePause).toHaveBeenCalled()
  })

  it('should call movePiece left on A key', () => {
    const movePiece = vi.fn()

    renderHook(() =>
      useKeyboardControls({
        movePiece,
        rotatePiece: vi.fn(),
        hardDrop: vi.fn(),
        togglePause: vi.fn(),
        gameOver: false,
      })
    )

    const event = new KeyboardEvent('keydown', { key: 'a' })
    window.dispatchEvent(event)

    expect(movePiece).toHaveBeenCalledWith('left')
  })

  it('should call movePiece right on D key', () => {
    const movePiece = vi.fn()

    renderHook(() =>
      useKeyboardControls({
        movePiece,
        rotatePiece: vi.fn(),
        hardDrop: vi.fn(),
        togglePause: vi.fn(),
        gameOver: false,
      })
    )

    const event = new KeyboardEvent('keydown', { key: 'd' })
    window.dispatchEvent(event)

    expect(movePiece).toHaveBeenCalledWith('right')
  })

  it('should call movePiece down on S key', () => {
    const movePiece = vi.fn()

    renderHook(() =>
      useKeyboardControls({
        movePiece,
        rotatePiece: vi.fn(),
        hardDrop: vi.fn(),
        togglePause: vi.fn(),
        gameOver: false,
      })
    )

    const event = new KeyboardEvent('keydown', { key: 's' })
    window.dispatchEvent(event)

    expect(movePiece).toHaveBeenCalledWith('down')
  })
  it.each(['input', 'textarea', 'select'])('leaves %s keyboard interaction to the focused control', tag => {
    const onMove = vi.fn()
    renderHook(() => useKeyboardControls({ movePiece: onMove, rotatePiece: onMove, hardDrop: onMove, togglePause: onMove, gameOver: false }))
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
    renderHook(() => useKeyboardControls({ movePiece: onMove, rotatePiece: onMove, hardDrop: onMove, togglePause: onMove, gameOver: false }))
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
    renderHook(() => useKeyboardControls({ movePiece: onMove, rotatePiece: onMove, hardDrop: onMove, togglePause: onMove, gameOver: false }))
    const dialog = document.createElement('div')
    dialog.setAttribute('role', 'dialog')
    const content = document.createElement('div')
    dialog.append(content)
    document.body.append(dialog)
    content.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    expect(onMove).not.toHaveBeenCalled()
    dialog.remove()
  })

  it('ignores repeated hard drop, rotation, and pause while allowing held movement', () => {
    const movePiece = vi.fn()
    const rotatePiece = vi.fn()
    const hardDrop = vi.fn()
    const togglePause = vi.fn()
    renderHook(() => useKeyboardControls({ movePiece, rotatePiece, hardDrop, togglePause, gameOver: false }))
    for (const key of [' ', 'p', 'w', 'ArrowUp']) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key, repeat: true }))
    }
    expect(rotatePiece).not.toHaveBeenCalled()
    expect(hardDrop).not.toHaveBeenCalled()
    expect(togglePause).not.toHaveBeenCalled()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', repeat: true }))
    expect(movePiece).toHaveBeenCalledWith('left')
  })

})
