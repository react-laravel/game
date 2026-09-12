import { describe, expect, it } from 'vitest'
import {
  countDeadEnds,
  countReachableCells,
  generateMazeGrid,
  getSolutionLength,
} from '../generateMaze'

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('generateMazeGrid', () => {
  it('creates a connected maze of the requested size', () => {
    const maze = generateMazeGrid(11, mulberry32(7))

    expect(maze).toHaveLength(11)
    expect(maze[0]).toHaveLength(11)
    expect(countReachableCells(maze)).toBe(11 * 11)
    expect(getSolutionLength(maze)).toBeGreaterThan(0)
  })

  it('keeps matching walls on both sides of a passage', () => {
    const maze = generateMazeGrid(9, mulberry32(21))

    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (x < 8) {
          expect(maze[y][x].right).toBe(maze[y][x + 1].left)
        }
        if (y < 8) {
          expect(maze[y][x].bottom).toBe(maze[y + 1][x].top)
        }
      }
    }
  })

  it('produces enough dead ends that a solver cannot just follow one river', () => {
    const samples = [3, 11, 29, 41, 88].map(seed => {
      const maze = generateMazeGrid(15, mulberry32(seed))
      return {
        deadEnds: countDeadEnds(maze),
        solution: getSolutionLength(maze),
      }
    })

    const averageDeadEnds = samples.reduce((sum, sample) => sum + sample.deadEnds, 0) / samples.length
    const averageSolution = samples.reduce((sum, sample) => sum + sample.solution, 0) / samples.length

    expect(averageDeadEnds).toBeGreaterThan(30)
    expect(Math.min(...samples.map(sample => sample.deadEnds))).toBeGreaterThan(18)
    expect(averageSolution).toBeLessThan(15 * 15 * 0.55)
    expect(Math.max(...samples.map(sample => sample.solution))).toBeLessThan(15 * 15 * 0.72)
  })

  it('creates a connected A4 rectangle when given columns and rows', () => {
    const maze = generateMazeGrid({ cols: 15, rows: 21 }, mulberry32(17))

    expect(maze).toHaveLength(21)
    expect(maze[0]).toHaveLength(15)
    expect(countReachableCells(maze)).toBe(15 * 21)
    expect(getSolutionLength(maze)).toBeGreaterThan(0)
    expect(countDeadEnds(maze)).toBeGreaterThan(18)
  })
})
