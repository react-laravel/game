import type { Cell, CellState } from '../types'

export function createEmptyBoard(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      neighborCount: 0,
      state: 'hidden' as const,
    }))
  )
}

/** Classic Minesweeper: unmarked → flag → question → unmarked. */
export function cycleCellMark(state: CellState): CellState {
  if (state === 'hidden') return 'flagged'
  if (state === 'flagged') return 'questioned'
  if (state === 'questioned') return 'hidden'
  return state
}

export function remainingMinesDelta(from: CellState, to: CellState): number {
  const wasFlag = from === 'flagged' ? 1 : 0
  const isFlag = to === 'flagged' ? 1 : 0
  return wasFlag - isFlag
}

export function canRevealCell(state: CellState): boolean {
  return state === 'hidden' || state === 'questioned'
}
