import { createElement } from 'react'
import { fireEvent, render, renderHook } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { useSwipeControls } from '../useSwipeControls'

function createBoard() {
  const { container } = render(createElement('div', { 'data-game-board': true }, createElement('span')))
  return container.querySelector('[data-game-board]')!
}
function touch(x: number, y: number, identifier = 1) {
  return { clientX: x, clientY: y, identifier }
}

describe('useSwipeControls', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('recognizes swipes beginning at the screen edge and prevents board scrolling', () => {
    const onMove = vi.fn()
    const board = createBoard()
    renderHook(() => useSwipeControls({ onMove }))
    fireEvent.touchStart(board, { touches: [touch(0, 0)] })
    expect(fireEvent.touchMove(board, { touches: [touch(80, 0)] })).toBe(false)
    expect(onMove).toHaveBeenCalledExactlyOnceWith('right')
  })

  it('does not hijack touch scrolling outside the board', () => {
    const onMove = vi.fn()
    renderHook(() => useSwipeControls({ onMove }))
    fireEvent.touchStart(document.body, { touches: [touch(10, 10)] })
    expect(fireEvent.touchMove(document.body, { touches: [touch(10, 90)] })).toBe(true)
    expect(onMove).not.toHaveBeenCalled()
  })

  it('ignores short gestures and throttles repeated moves within a gesture', () => {
    const onMove = vi.fn()
    const board = createBoard()
    renderHook(() => useSwipeControls({ onMove }))
    fireEvent.touchStart(board, { touches: [touch(100, 100)] })
    fireEvent.touchMove(board, { touches: [touch(100, 80)] })
    expect(onMove).not.toHaveBeenCalled()
    fireEvent.touchMove(board, { touches: [touch(100, 50)] })
    fireEvent.touchMove(board, { touches: [touch(100, 0)] })
    expect(onMove).toHaveBeenCalledExactlyOnceWith('up')
    vi.advanceTimersByTime(200)
    fireEvent.touchMove(board, { touches: [touch(100, 0)] })
    expect(onMove).toHaveBeenCalledTimes(2)
  })

  it('clears cancelled gestures so later movement cannot make a move', () => {
    const onMove = vi.fn()
    const board = createBoard()
    renderHook(() => useSwipeControls({ onMove }))
    fireEvent.touchStart(board, { touches: [touch(100, 100)] })
    fireEvent.touchCancel(board)
    fireEvent.touchMove(board, { touches: [touch(0, 100)] })
    expect(onMove).not.toHaveBeenCalled()
  })

  it('cancels multitouch and ignores a replaced touch identifier', () => {
    const onMove = vi.fn()
    const board = createBoard()
    renderHook(() => useSwipeControls({ onMove }))
    fireEvent.touchStart(board, { touches: [touch(100, 100)] })
    fireEvent.touchMove(board, { touches: [touch(50, 100), touch(20, 20, 2)] })
    fireEvent.touchMove(board, { touches: [touch(0, 100)] })
    fireEvent.touchStart(board, { touches: [touch(100, 100)] })
    fireEvent.touchMove(board, { touches: [touch(0, 100, 2)] })
    expect(onMove).not.toHaveBeenCalled()
  })

  it('keeps a gesture across callback updates and invokes the latest move handler', () => {
    const firstOnMove = vi.fn()
    const nextOnMove = vi.fn()
    const board = createBoard()
    const { rerender } = renderHook(({ onMove }) => useSwipeControls({ onMove }), {
      initialProps: { onMove: firstOnMove },
    })
    fireEvent.touchStart(board, { touches: [touch(100, 100)] })
    rerender({ onMove: nextOnMove })
    fireEvent.touchMove(board, { touches: [touch(50, 100)] })
    expect(firstOnMove).not.toHaveBeenCalled()
    expect(nextOnMove).toHaveBeenCalledExactlyOnceWith('left')
  })

  it('requires a fresh gesture after disabling and reenabling controls', () => {
    const onMove = vi.fn()
    const board = createBoard()
    const { rerender } = renderHook(({ enabled }) => useSwipeControls({ onMove, enabled }), {
      initialProps: { enabled: true },
    })
    fireEvent.touchStart(board, { touches: [touch(100, 100)] })
    rerender({ enabled: false })
    rerender({ enabled: true })
    fireEvent.touchMove(board, { touches: [touch(0, 100)] })
    expect(onMove).not.toHaveBeenCalled()
  })

  it('accepts board selectors and distances and removes listeners on unmount', () => {
    const onMove = vi.fn()
    const { container } = render(createElement('div', { className: 'custom-board' }))
    const board = container.firstElementChild!
    const { unmount } = renderHook(() => useSwipeControls({ onMove, targetSelector: '.custom-board', minDistance: 80 }))
    fireEvent.touchStart(board, { touches: [touch(100, 100)] })
    fireEvent.touchMove(board, { touches: [touch(50, 100)] })
    expect(onMove).not.toHaveBeenCalled()
    fireEvent.touchMove(board, { touches: [touch(0, 100)] })
    expect(onMove).toHaveBeenCalledOnce()
    unmount()
    fireEvent.touchStart(board, { touches: [touch(100, 100)] })
    fireEvent.touchMove(board, { touches: [touch(0, 100)] })
    expect(onMove).toHaveBeenCalledOnce()
  })
})
