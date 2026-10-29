import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGameStore } from '../game-store'

describe('tic-tac-toe AI turn ownership', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useGameStore.getState().resetGame()
    useGameStore.getState().resetScores()
    useGameStore.getState().setGameMode('ai')
    useGameStore.getState().setDifficulty('hard')
  })

  afterEach(() => {
    useGameStore.getState().resetGame()
    vi.useRealTimers()
  })

  it('locks the entire AI turn immediately and prevents human moves for O', () => {
    useGameStore.getState().makeMove(0)
    expect(useGameStore.getState().isAiThinking).toBe(true)

    useGameStore.getState().makeMove(1)
    expect(useGameStore.getState().board).toEqual(['X', ...Array(8).fill(null)])

    vi.advanceTimersByTime(800)
    expect(useGameStore.getState().board.filter(cell => cell === 'O')).toHaveLength(1)
    expect(useGameStore.getState().currentPlayer).toBe('X')
    expect(useGameStore.getState().isAiThinking).toBe(false)
  })

  it('cancels an old response when a new round has already reached its own AI turn', () => {
    useGameStore.getState().makeMove(0)
    vi.advanceTimersByTime(600)
    useGameStore.getState().resetGame()
    useGameStore.getState().makeMove(8)

    vi.advanceTimersByTime(200)
    expect(useGameStore.getState().board).toEqual([...Array(8).fill(null), 'X'])
    expect(useGameStore.getState().isAiThinking).toBe(true)

    vi.advanceTimersByTime(600)
    expect(useGameStore.getState().board[8]).toBe('X')
    expect(useGameStore.getState().board.filter(cell => cell === 'O')).toHaveLength(1)
    expect(useGameStore.getState().board.filter(cell => cell === 'X')).toHaveLength(1)
  })

  it('does not inject a queued AI response into a new two-player round', () => {
    useGameStore.getState().makeMove(0)
    vi.advanceTimersByTime(600)
    useGameStore.getState().setGameMode('pvp')
    useGameStore.getState().makeMove(8)
    vi.advanceTimersByTime(1000)

    expect(useGameStore.getState().board).toEqual([...Array(8).fill(null), 'X'])
    expect(useGameStore.getState().currentPlayer).toBe('O')
    expect(useGameStore.getState().isAiThinking).toBe(false)
  })

  it('schedules only one response when the AI action is requested repeatedly', () => {
    useGameStore.getState().makeMove(0)
    useGameStore.getState().makeAiMove()
    useGameStore.getState().makeAiMove()
    vi.advanceTimersByTime(800)

    expect(useGameStore.getState().board.filter(cell => cell === 'O')).toHaveLength(1)
    expect(useGameStore.getState().board.filter(cell => cell === 'X')).toHaveLength(1)
    expect(useGameStore.getState().currentPlayer).toBe('X')
  })

  it.each([-1, 9, 1.5, Number.NaN])('ignores invalid tile index %s', index => {
    useGameStore.getState().makeMove(index)
    expect(useGameStore.getState().board).toEqual(Array(9).fill(null))
    expect(useGameStore.getState().currentPlayer).toBe('X')
  })
})
