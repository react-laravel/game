import { describe, expect, it, vi } from 'vitest'
import { clampMazeSize, DEFAULT_MAZE_SIZE, getMazeDimensions, MAX_MAZE_SIZE, MIN_MAZE_SIZE } from '../constants'
import { getPrintableMazeGeometry, printCurrentMaze } from '../printMaze'
import type { MazeCell } from '../store'

function closedCell(): MazeCell {
  return { top: true, right: true, bottom: true, left: true, visited: true }
}

describe('maze size constants', () => {
  it('clamps maze size into the printable range', () => {
    expect(clampMazeSize(MIN_MAZE_SIZE - 3)).toBe(MIN_MAZE_SIZE)
    expect(clampMazeSize(MAX_MAZE_SIZE + 9)).toBe(MAX_MAZE_SIZE)
    expect(clampMazeSize(18.6)).toBe(19)
    expect(clampMazeSize(Number.NaN)).toBe(DEFAULT_MAZE_SIZE)
  })

  it('maps slider size to a square or an A4 portrait rectangle', () => {
    expect(getMazeDimensions('square', 15)).toEqual({ cols: 15, rows: 15 })
    expect(getMazeDimensions('a4', 5)).toEqual({ cols: 5, rows: 7 })
    expect(getMazeDimensions('a4', 15)).toEqual({ cols: 15, rows: 21 })
    expect(getMazeDimensions('a4', 40)).toEqual({ cols: 40, rows: 57 })
  })
})

describe('printable maze geometry', () => {
  it('builds black-and-white wall lines with start and end labels', () => {
    const maze: MazeCell[][] = [
      [
        { top: true, right: false, bottom: true, left: true, visited: true },
        { top: true, right: true, bottom: false, left: false, visited: true },
      ],
      [
        { top: true, right: false, bottom: true, left: true, visited: true },
        { top: false, right: true, bottom: true, left: false, visited: true },
      ],
    ]

    const geometry = getPrintableMazeGeometry(maze)

    expect(geometry.start).toEqual({ x: 0.5, y: 0.5, label: '起' })
    expect(geometry.end).toEqual({ x: 1.5, y: 1.5, label: '终' })
    expect(geometry.labelSize).toBeGreaterThan(0)
    expect(geometry.lines.length).toBeGreaterThan(0)
    expect(geometry.lines).toEqual(
      expect.arrayContaining([
        { x1: 0, y1: 0, x2: 1, y2: 0 },
        { x1: 0, y1: 0, x2: 0, y2: 1 },
        { x1: 2, y1: 1, x2: 2, y2: 2 },
        { x1: 1, y1: 2, x2: 2, y2: 2 },
      ])
    )
    expect(geometry.lines).not.toEqual(
      expect.arrayContaining([{ x1: 1, y1: 0, x2: 1, y2: 1 }])
    )
  })

  it('does not duplicate shared walls', () => {
    const maze: MazeCell[][] = [
      [closedCell(), closedCell()],
      [closedCell(), closedCell()],
    ]

    const geometry = getPrintableMazeGeometry(maze)
    const keys = geometry.lines.map(line => `${line.x1},${line.y1}-${line.x2},${line.y2}`)

    expect(new Set(keys).size).toBe(keys.length)
  })

  it('places the end mark at the bottom-right of a rectangle', () => {
    const maze: MazeCell[][] = [
      [closedCell(), closedCell()],
      [closedCell(), closedCell()],
      [closedCell(), closedCell()],
    ]

    const geometry = getPrintableMazeGeometry(maze)

    expect(geometry.cols).toBe(2)
    expect(geometry.rows).toBe(3)
    expect(geometry.end).toEqual({ x: 1.5, y: 2.5, label: '终' })
  })
})

describe('printCurrentMaze', () => {
  it('opens the browser print dialog', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})

    printCurrentMaze()

    expect(print).toHaveBeenCalledOnce()
    print.mockRestore()
  })
})
