import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SlidingPuzzle from '../components/SlidingPuzzle'
import { createBoard } from '../utils/board'

vi.mock('../utils/board', async importOriginal => {
  const actual = await importOriginal<typeof import('../utils/board')>()
  return { ...actual, createBoard: vi.fn(() => [1, 2, 3, 4, 5, 6, 7, 0, 8]) }
})

describe('SlidingPuzzle interactions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-04T10:00:00Z'))
    vi.mocked(createBoard).mockClear()
    vi.mocked(createBoard).mockReturnValue([1, 2, 3, 4, 5, 6, 7, 0, 8])
  })

  afterEach(() => vi.useRealTimers())

  it('only shuffles once while movement and parent updates rerender the puzzle', () => {
    vi.mocked(createBoard).mockReturnValue([1, 2, 3, 4, 0, 5, 7, 8, 6])
    const onComplete = vi.fn()
    const { rerender } = render(<SlidingPuzzle size={3} onComplete={onComplete} />)
    fireEvent.click(screen.getByRole('button', { name: '移动方块 5' }))
    rerender(<SlidingPuzzle size={3} onComplete={() => onComplete()} />)

    expect(createBoard).toHaveBeenCalledTimes(1)
    expect(screen.getByText('移动次数').nextElementSibling).toHaveTextContent('1')
  })

  it('finishes once and freezes the elapsed time at the winning move', () => {
    const onComplete = vi.fn()
    render(<SlidingPuzzle size={3} onComplete={onComplete} />)
    act(() => vi.advanceTimersByTime(2500))
    fireEvent.click(screen.getByRole('button', { name: '移动方块 8' }))
    act(() => vi.advanceTimersByTime(10_000))

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(screen.getByText('00:02')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '移动方块 8' })).toBeDisabled()
  })

  it('cancels a pending victory notification when the puzzle is removed', () => {
    const onComplete = vi.fn()
    const { unmount } = render(<SlidingPuzzle size={3} onComplete={onComplete} />)
    fireEvent.click(screen.getByRole('button', { name: '移动方块 8' }))
    unmount()
    act(() => vi.advanceTimersByTime(1000))
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('uses arrow keys from the board and prevents scrolling during play', () => {
    render(<SlidingPuzzle size={3} onComplete={vi.fn()} />)
    const tile = screen.getByRole('button', { name: '移动方块 8' })
    tile.focus()
    expect(fireEvent.keyDown(tile, { key: 'ArrowLeft' })).toBe(false)
    expect(screen.getByText('移动次数').nextElementSibling).toHaveTextContent('1')
  })

  it('leaves typing and dialog keyboard interactions to their focused controls', () => {
    render(
      <>
        <SlidingPuzzle size={3} onComplete={vi.fn()} />
        <input aria-label="设置" />
        <div role="dialog"><span tabIndex={0}>对话框内容</span></div>
      </>
    )
    expect(fireEvent.keyDown(screen.getByRole('textbox'), { key: 'ArrowLeft' })).toBe(true)
    expect(fireEvent.keyDown(screen.getByText('对话框内容'), { key: 'ArrowLeft' })).toBe(true)
    expect(screen.getByText('移动次数').nextElementSibling).toHaveTextContent('0')
  })
})
