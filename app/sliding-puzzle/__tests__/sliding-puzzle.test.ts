import { describe, it, expect } from 'vitest'
import { checkSolvable, createBoard, createSolvedBoard, isSolved, isValidMove } from '../utils/board'

describe('sliding puzzle logic', () => {
  describe('checkSolvable', () => {
    it('accepts the 4x4 goal and legal horizontal and vertical blank moves', () => {
      const goal = createSolvedBoard(4)
      expect(checkSolvable(goal, 4)).toBe(true)
      const horizontal = [...goal]
      ;[horizontal[14], horizontal[15]] = [horizontal[15], horizontal[14]]
      expect(checkSolvable(horizontal, 4)).toBe(true)
      const vertical = [...goal]
      ;[vertical[11], vertical[15]] = [vertical[15], vertical[11]]
      expect(checkSolvable(vertical, 4)).toBe(true)
    })

    it('rejects malformed board dimensions and repeated tiles', () => {
      expect(checkSolvable([0, 1, 2], 3)).toBe(false)
      expect(checkSolvable(Array(9).fill(0), 3)).toBe(false)
      expect(checkSolvable([], 0)).toBe(false)
    })
    it('should return true for a solved 3x3 board', () => {
      const board = createSolvedBoard(3)
      expect(checkSolvable(board, 3)).toBe(true)
    })

    it('rejects a 4x4 goal with two numbered tiles swapped', () => {
      // Swapping only two numbered tiles changes the reachable parity.
      const board = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 14, 0]
      expect(checkSolvable(board, 4)).toBe(false)
    })

    it('should return false for unsolvable 3x3 board', () => {
      // Swap last two non-zero elements to make unsolvable
      // Use a known unsolvable 3x3: swap two elements from solved
      const solved = createSolvedBoard(3)
      const unsolvable = [...solved]
      // Swap positions 1 and 2 to create odd inversions
      ;[unsolvable[1], unsolvable[2]] = [unsolvable[2], unsolvable[1]]
      expect(checkSolvable(unsolvable, 3)).toBe(false)
    })

    it('should handle empty board', () => {
      expect(checkSolvable([0], 1)).toBe(true)
    })

    it('should handle 5x5 board', () => {
      const board = createSolvedBoard(5)
      expect(checkSolvable(board, 5)).toBe(true)
    })
  })

  describe('isValidMove', () => {
    const board3 = [1, 2, 3, 4, 5, 6, 7, 8, 0] // 3x3 solved

    it('should allow move left of empty space', () => {
      // empty is at index 8, left is index 7
      expect(isValidMove(7, board3, 3)).toBe(true)
    })

    it('should allow move above empty space', () => {
      // empty is at index 8, above is index 5
      expect(isValidMove(5, board3, 3)).toBe(true)
    })

    it('should not allow move far from empty space', () => {
      expect(isValidMove(0, board3, 3)).toBe(false)
    })

    it('should not allow move on occupied cell', () => {
      // empty is at 8, but 0 is far away
      expect(isValidMove(0, board3, 3)).toBe(false)
    })

    it('should work for 4x4 board', () => {
      const board4 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 15]
      // empty at 14, left is 13, above is 10
      expect(isValidMove(13, board4, 4)).toBe(true)
      expect(isValidMove(10, board4, 4)).toBe(true)
      expect(isValidMove(0, board4, 4)).toBe(false)
    })
  })

  describe('isSolved', () => {
    it('requires the blank at the end instead of accepting zero-based order', () => {
      expect(isSolved([0, 1, 2, 3, 4, 5, 6, 7, 8])).toBe(false)
    })
    it('should return true for solved 3x3 board', () => {
      expect(isSolved(createSolvedBoard(3))).toBe(true)
    })

    it('should return true for solved 4x4 board', () => {
      expect(isSolved(createSolvedBoard(4))).toBe(true)
    })

    it('should return false for unsolved board', () => {
      const unsolved = [2, 1, 3, 4, 5, 6, 7, 8, 0]
      expect(isSolved(unsolved)).toBe(false)
    })

    it('should return false for empty board', () => {
      expect(isSolved([])).toBe(false)
    })

    it('should return true for 1x1 board', () => {
      expect(isSolved([0])).toBe(true)
    })
  })

  describe('createSolvedBoard', () => {
    it('should create correct 3x3 board', () => {
      expect(createSolvedBoard(3)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 0])
    })

    it('should create correct 4x4 board', () => {
      expect(createSolvedBoard(4)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0])
    })

    it('should create correct 5x5 board', () => {
      const board = createSolvedBoard(5)
      expect(board).toHaveLength(25)
      expect(board[24]).toBe(0)
      expect(board[0]).toBe(1)
    })
  })

  describe('createBoard', () => {
    it.each([3, 4, 5])('always generates a solvable unfinished %sx%s game', size => {
      let seed = 17
      const random = () => {
        seed = (1664525 * seed + 1013904223) >>> 0
        return seed / 0x100000000
      }
      for (let attempt = 0; attempt < 100; attempt++) {
        const board = createBoard(size, random)
        expect([...board].sort((a, b) => a - b)).toEqual(
          Array.from({ length: size * size }, (_, index) => index)
        )
        expect(checkSolvable(board, size)).toBe(true)
        expect(isSolved(board)).toBe(false)
      }
    })

    it.each([3, 4, 5])('handles repeated random output without returning a goal or retrying', size => {
      for (const value of [0, 0.5, 0.999999]) {
        let calls = 0
        const board = createBoard(size, () => { calls++; return value })
        expect(checkSolvable(board, size)).toBe(true)
        expect(isSolved(board)).toBe(false)
        expect(calls).toBe(size * size - 1)
      }
    })
  })
})
