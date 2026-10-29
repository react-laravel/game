import { StrictMode, useState } from 'react'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { usePuzzleActions } from '../usePuzzleActions'
import { initializePuzzlePieces, initializePuzzleSlots, isGameComplete } from '../../utils/puzzleUtils'

const useRealPuzzle = (onComplete: () => void) => {
  const [pieces, setPieces] = useState(() => initializePuzzlePieces(2, '/example.jpg', 200))
  const [slots, setSlots] = useState(() => initializePuzzleSlots(2))
  const [wronglyPlacedPieces, setWronglyPlacedPieces] = useState(new Set<number>())
  const [lastWronglyPlacedPiece, setLastWronglyPlacedPiece] = useState<number | null>(null)
  const actions = usePuzzleActions({
    pieces, slots, setPieces, setSlots,
    wronglyPlacedPieces, setWronglyPlacedPieces,
    lastWronglyPlacedPiece, setLastWronglyPlacedPiece, onComplete,
  })
  return { ...actions, pieces, slots, setPieces, setSlots }
}

describe('jigsaw completion with committed puzzle state', () => {
  it('completes immediately after the last correct placement, once in StrictMode', () => {
    const onComplete = vi.fn()
    const { result, rerender } = renderHook(() => useRealPuzzle(onComplete), {
      wrapper: ({ children }) => <StrictMode>{children}</StrictMode>,
    })
    for (let id = 0; id < 4; id++) {
      act(() => result.current.placePieceInSlot(id, id))
      expect(onComplete).toHaveBeenCalledTimes(id === 3 ? 1 : 0)
    }
    expect(isGameComplete(result.current.pieces, result.current.slots)).toBe(true)
    rerender()
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('completes a full puzzle when the last two incorrectly placed pieces are swapped', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useRealPuzzle(onComplete))
    for (const [piece, slot] of [[0, 1], [1, 0], [2, 2], [3, 3]]) {
      act(() => result.current.placePieceInSlot(piece, slot))
    }
    expect(onComplete).not.toHaveBeenCalled()
    act(() => result.current.swapPieces(0, 1))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('supports a second completed round after resetting the board', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useRealPuzzle(onComplete))
    for (let id = 0; id < 4; id++) act(() => result.current.placePieceInSlot(id, id))
    expect(onComplete).toHaveBeenCalledTimes(1)
    act(() => {
      result.current.setPieces(initializePuzzlePieces(2, '/example.jpg', 200))
      result.current.setSlots(initializePuzzleSlots(2))
    })
    for (let id = 0; id < 4; id++) act(() => result.current.placePieceInSlot(id, id))
    expect(onComplete).toHaveBeenCalledTimes(2)
  })

  it('does not treat an empty loading board as completed', () => {
    const onComplete = vi.fn()
    renderHook(() => usePuzzleActions({
      pieces: [], slots: [], setPieces: vi.fn(), setSlots: vi.fn(),
      wronglyPlacedPieces: new Set(), setWronglyPlacedPieces: vi.fn(),
      lastWronglyPlacedPiece: null, setLastWronglyPlacedPiece: vi.fn(), onComplete,
    }))
    expect(onComplete).not.toHaveBeenCalled()
  })
})
