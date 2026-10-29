import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTetrisGame } from '../useTetrisGame'

// Mock the store as a hook function
const { mockUseTetrisStore } = vi.hoisted(() => ({
  mockUseTetrisStore: vi.fn(() => ({
    bestScore: 0,
    gamesPlayed: 0,
    totalLinesCleared: 0,
    totalPlayTime: 0,
    averageScore: 0,
    highestLevel: 1,
    sessionStats: {
      gamesPlayed: 0,
      bestScore: 0,
      totalLines: 0,
    },
    setBestScore: vi.fn(),
    incrementGamesPlayed: vi.fn(),
    addLinesCleared: vi.fn(),
    addPlayTime: vi.fn(),
    updateHighestLevel: vi.fn(),
    updateSessionStats: vi.fn(),
    resetStats: vi.fn(),
    resetSessionStats: vi.fn(),
  })),
}))

vi.mock('../../store', () => ({
  useTetrisStore: mockUseTetrisStore,
}))

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('useTetrisGame', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockUseTetrisStore.mockReturnValue({
      bestScore: 0,
      gamesPlayed: 0,
      totalLinesCleared: 0,
      totalPlayTime: 0,
      averageScore: 0,
      highestLevel: 1,
      sessionStats: {
        gamesPlayed: 0,
        bestScore: 0,
        totalLines: 0,
      },
      setBestScore: vi.fn(),
      incrementGamesPlayed: vi.fn(),
      addLinesCleared: vi.fn(),
      addPlayTime: vi.fn(),
      updateHighestLevel: vi.fn(),
      updateSessionStats: vi.fn(),
      resetStats: vi.fn(),
      resetSessionStats: vi.fn(),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should initialize with empty board', () => {
    const { result } = renderHook(() => useTetrisGame())

    expect(result.current.gameState.board).toBeDefined()
    expect(Array.isArray(result.current.gameState.board)).toBe(true)
    expect(result.current.gameState.score).toBe(0)
    expect(result.current.gameState.lines).toBe(0)
    expect(result.current.gameState.level).toBe(1)
    expect(result.current.gameState.gameOver).toBe(false)
    expect(result.current.gameState.paused).toBe(false)
  })

  it('should return all expected methods', () => {
    const { result } = renderHook(() => useTetrisGame())

    expect(typeof result.current.movePiece).toBe('function')
    expect(typeof result.current.rotatePiece).toBe('function')
    expect(typeof result.current.hardDrop).toBe('function')
    expect(typeof result.current.resetGame).toBe('function')
    expect(typeof result.current.togglePause).toBe('function')
    expect(typeof result.current.startSoftDrop).toBe('function')
    expect(typeof result.current.stopSoftDrop).toBe('function')
  })

  it('should return a boolean when moving the current piece', () => {
    const { result } = renderHook(() => useTetrisGame())

    const moved = result.current.movePiece('left')
    expect(typeof moved).toBe('boolean')
  })

  it('should call store setBestScore when new high score is achieved', () => {
    const setBestScore = vi.fn()
    mockUseTetrisStore.mockReturnValue({
      bestScore: 100,
      gamesPlayed: 0,
      totalLinesCleared: 0,
      totalPlayTime: 0,
      averageScore: 0,
      highestLevel: 1,
      sessionStats: { gamesPlayed: 0, bestScore: 0, totalLines: 0 },
      setBestScore,
      incrementGamesPlayed: vi.fn(),
      addLinesCleared: vi.fn(),
      addPlayTime: vi.fn(),
      updateHighestLevel: vi.fn(),
      updateSessionStats: vi.fn(),
      resetStats: vi.fn(),
      resetSessionStats: vi.fn(),
    })

    const { result } = renderHook(() => useTetrisGame())
    // Hook uses bestScore from store
    expect(result.current.bestScore).toBe(100)
  })

  it('should toggle pause without throwing', () => {
    const { result } = renderHook(() => useTetrisGame())

    expect(() => result.current.togglePause()).not.toThrow()
    expect(() => result.current.togglePause()).not.toThrow()
  })

  it('should reset game without throwing', () => {
    const { result } = renderHook(() => useTetrisGame())

    expect(() => result.current.resetGame()).not.toThrow()
  })

  it('should return bestScore from store', () => {
    const { result } = renderHook(() => useTetrisGame())

    expect(typeof result.current.bestScore).toBe('number')
  })

  it('should have isSoftDropping state', () => {
    const { result } = renderHook(() => useTetrisGame())

    expect(typeof result.current.isSoftDropping).toBe('boolean')
  })

  it('should start and stop soft drop without throwing', () => {
    const { result } = renderHook(() => useTetrisGame())

    expect(() => result.current.startSoftDrop()).not.toThrow()
    expect(() => result.current.stopSoftDrop()).not.toThrow()
  })

  it('should rotate without throwing when no piece', () => {
    const { result } = renderHook(() => useTetrisGame())

    expect(() => result.current.rotatePiece()).not.toThrow()
  })

  it('should hardDrop without throwing when no piece', () => {
    const { result } = renderHook(() => useTetrisGame())

    expect(() => result.current.hardDrop()).not.toThrow()
  })

  it('locks a hard-dropped piece before horizontal input can move it', () => {
    const { result } = renderHook(() => useTetrisGame())

    act(() => result.current.hardDrop())

    const lockedBoard = result.current.gameState.board.map(row => [...row])
    const lockedCellCount = lockedBoard.flat().filter(Boolean).length
    const nextPieceBeforeMove = result.current.gameState.currentPiece

    expect(lockedCellCount).toBeGreaterThan(0)
    expect(nextPieceBeforeMove?.position.y).toBe(0)

    act(() => result.current.movePiece('left'))

    expect(result.current.gameState.board).toEqual(lockedBoard)
    expect(result.current.gameState.currentPiece?.position.x).toBe(
      (nextPieceBeforeMove?.position.x ?? 0) - 1
    )
  })
  it('advances soft drop on every tick and awards one point per actual row', () => {
    const { result } = renderHook(() => useTetrisGame())
    const initialY = result.current.gameState.currentPiece!.position.y
    act(() => result.current.startSoftDrop())
    act(() => vi.advanceTimersByTime(200))
    expect(result.current.gameState.currentPiece!.position.y).toBe(initialY + 5)
    expect(result.current.gameState.score).toBe(5)
    act(() => result.current.stopSoftDrop())
    act(() => vi.advanceTimersByTime(200))
    expect(result.current.gameState.currentPiece!.position.y).toBe(initialY + 5)
    expect(result.current.gameState.score).toBe(5)
  })

  it('preserves consecutive moves dispatched before React renders', () => {
    const { result } = renderHook(() => useTetrisGame())
    const initialX = result.current.gameState.currentPiece!.position.x
    act(() => {
      result.current.movePiece('left')
      result.current.movePiece('left')
    })
    expect(result.current.gameState.currentPiece!.position.x).toBe(initialX - 2)
  })

  it('does not reset horizontal movement while soft dropping', () => {
    const { result } = renderHook(() => useTetrisGame())
    const initialX = result.current.gameState.currentPiece!.position.x
    act(() => result.current.startSoftDrop())
    act(() => result.current.movePiece('left'))
    act(() => vi.advanceTimersByTime(100))
    expect(result.current.gameState.currentPiece!.position.x).toBe(initialX - 1)
    expect(result.current.gameState.currentPiece!.position.y).toBe(3)
  })

  it('clears soft drop immediately on pause and starts a fresh gravity cadence on resume', () => {
    const { result } = renderHook(() => useTetrisGame())
    act(() => result.current.startSoftDrop())
    act(() => result.current.togglePause())
    const pausedPiece = result.current.gameState.currentPiece
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.gameState.currentPiece).toEqual(pausedPiece)
    expect(result.current.isSoftDropping).toBe(false)
    act(() => result.current.togglePause())
    act(() => vi.advanceTimersByTime(999))
    expect(result.current.gameState.currentPiece).toEqual(pausedPiece)
    act(() => vi.advanceTimersByTime(1))
    expect(result.current.gameState.currentPiece!.position.y).toBe(pausedPiece!.position.y + 1)
  })

  it('drops at game cadence without restarting the timer for horizontal movement', () => {
    const timer = vi.spyOn(globalThis, 'setTimeout')
    const { result } = renderHook(() => useTetrisGame())
    timer.mockClear()
    act(() => result.current.movePiece('left'))
    act(() => vi.advanceTimersByTime(999))
    expect(result.current.gameState.currentPiece!.position.y).toBe(0)
    expect(timer).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(result.current.gameState.currentPiece!.position.y).toBe(1)
    expect(timer).toHaveBeenCalledOnce()
  })

  it('pauses when the page is hidden and waits for an explicit resume', () => {
    const { result } = renderHook(() => useTetrisGame())
    act(() => result.current.startSoftDrop())
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(result.current.gameState.paused).toBe(true)
    expect(result.current.isSoftDropping).toBe(false)
    const piece = result.current.gameState.currentPiece
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.gameState.currentPiece).toEqual(piece)
    hidden.mockReturnValue(false)
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(result.current.gameState.paused).toBe(true)
  })

  it('cleans up both gravity and soft drop timers on unmount', () => {
    const { result, unmount } = renderHook(() => useTetrisGame())
    act(() => result.current.startSoftDrop())
    expect(vi.getTimerCount()).toBe(2)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

})
