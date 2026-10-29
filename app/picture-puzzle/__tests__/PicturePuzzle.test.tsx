import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PicturePuzzle from '../components/PicturePuzzle'
import { checkSolvable, isSolved } from '../../sliding-puzzle/utils/board'

vi.mock('../hooks/useGameSounds', () => ({
  useGameSounds: () => ({ playMoveSound: vi.fn(), playCompleteSound: vi.fn() }),
}))
vi.mock('../hooks/useGameStats', () => ({
  useGameStats: () => ({
    stats: { gamesPlayed: 0, bestTime: null, bestMoves: null }, updateStats: vi.fn(),
  }),
}))

// Recover the actual image-piece order from its CSS crop, with the blank as 0.
const readBoard = (size: number): number[] => {
  const board = screen.getByRole('group', { name: '图片滑块拼图' })
  return Array.from(board.children, element => {
    const style = (element as HTMLElement).style
    if (!style.backgroundImage) return 0
    const [left, top] = style.backgroundPosition.split(' ').map(parseFloat)
    const column = Math.round(-left / (320 / size))
    const row = Math.round(-top / (320 / size))
    return row * size + column + 1
  })
}

describe('PicturePuzzle initial board', () => {
  beforeEach(() => {
    vi.stubGlobal('Image', class {
      onload: (() => void) | null = null
      set src(_value: string) { queueMicrotask(() => this.onload?.()) }
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it.each([3, 4, 5] as const)('starts a solvable unfinished %s×%s puzzle using the real blank', async size => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999999)
    render(<PicturePuzzle imageUrl="/example.jpg" size={size} onComplete={vi.fn()} />)
    await waitFor(() => expect(screen.getByRole('group', { name: '图片滑块拼图' })).toBeInTheDocument())

    const board = readBoard(size)
    expect(board).toHaveLength(size * size)
    expect(checkSolvable(board, size)).toBe(true)
    expect(isSolved(board)).toBe(false)
    expect([...board].sort((a, b) => a - b)).toEqual(Array.from({ length: size * size }, (_, index) => index))
  })
})
