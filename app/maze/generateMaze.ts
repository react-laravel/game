import type { MazeCell } from './store'

export type RandomFn = () => number

interface Point {
  x: number
  y: number
}

const DIRECTIONS: Point[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
]

/**
 * Growing Tree：从随机格子生长，并在“最新格子 / 随机格子”之间切换。
 * 比从左上角 DFS 更爱分叉，假路更长，走着走着会进死胡同，而不是一条河贯穿全图。
 */
const NEWEST_CELL_CHANCE = 0.38

export function getMazeBounds(maze: MazeCell[][]): { cols: number; rows: number } {
  return {
    rows: maze.length,
    cols: maze[0]?.length ?? 0,
  }
}

export function getMazeRenderLayout(
  maze: MazeCell[][],
  canvasWidth: number,
  canvasHeight: number,
  fallback: { cols: number; rows: number } = { cols: 1, rows: 1 }
): {
  cols: number
  rows: number
  cellSize: number
  mazeRenderWidth: number
  mazeRenderHeight: number
  offsetX: number
  offsetY: number
} {
  const bounds = maze.length > 0 ? getMazeBounds(maze) : fallback
  const cols = Math.max(1, bounds.cols)
  const rows = Math.max(1, bounds.rows)
  const cellSize = Math.min(canvasWidth / cols, canvasHeight / rows)
  const mazeRenderWidth = cellSize * cols
  const mazeRenderHeight = cellSize * rows

  return {
    cols,
    rows,
    cellSize,
    mazeRenderWidth,
    mazeRenderHeight,
    offsetX: (canvasWidth - mazeRenderWidth) / 2,
    offsetY: (canvasHeight - mazeRenderHeight) / 2,
  }
}

export function createWalledGrid(cols: number, rows: number = cols): MazeCell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      top: true,
      right: true,
      bottom: true,
      left: true,
      visited: false,
    }))
  )
}

export function generateMazeGrid(
  size: number | { cols: number; rows: number },
  random: RandomFn = Math.random
): MazeCell[][] {
  const cols = typeof size === 'number' ? size : size.cols
  const rows = typeof size === 'number' ? size : size.rows
  const maze = createWalledGrid(cols, rows)
  const active: Point[] = []
  const origin = {
    x: Math.floor(random() * cols),
    y: Math.floor(random() * rows),
  }

  maze[origin.y][origin.x].visited = true
  active.push(origin)

  while (active.length > 0) {
    const index = random() < NEWEST_CELL_CHANCE ? active.length - 1 : Math.floor(random() * active.length)
    const current = active[index]
    const neighbors = getUnvisitedNeighbors(current, maze, cols, rows)

    if (neighbors.length === 0) {
      active.splice(index, 1)
      continue
    }

    const next = neighbors[Math.floor(random() * neighbors.length)]
    carvePassage(maze, current, next)
    maze[next.y][next.x].visited = true
    active.push(next)
  }

  for (const row of maze) {
    for (const cell of row) {
      cell.visited = true
    }
  }

  return maze
}

export function countOpenSides(cell: MazeCell): number {
  return Number(!cell.top) + Number(!cell.right) + Number(!cell.bottom) + Number(!cell.left)
}

export function countDeadEnds(maze: MazeCell[][]): number {
  return maze.flat().filter(cell => countOpenSides(cell) === 1).length
}

export function countReachableCells(maze: MazeCell[][]): number {
  if (maze.length === 0) return 0
  return breadthFirst(maze, { x: 0, y: 0 }).visited
}

export function getSolutionLength(maze: MazeCell[][]): number {
  if (maze.length === 0 || !maze[0]?.length) return 0
  const { cols, rows } = getMazeBounds(maze)
  return breadthFirst(maze, { x: 0, y: 0 }, { x: cols - 1, y: rows - 1 }).distance
}

function getUnvisitedNeighbors(
  point: Point,
  maze: MazeCell[][],
  cols: number,
  rows: number
): Point[] {
  const neighbors: Point[] = []

  for (const step of DIRECTIONS) {
    const x = point.x + step.x
    const y = point.y + step.y
    if (x < 0 || y < 0 || x >= cols || y >= rows) continue
    if (maze[y][x].visited) continue
    neighbors.push({ x, y })
  }

  return neighbors
}

function carvePassage(maze: MazeCell[][], current: Point, next: Point): void {
  if (next.x === current.x + 1) {
    maze[current.y][current.x].right = false
    maze[next.y][next.x].left = false
    return
  }
  if (next.x === current.x - 1) {
    maze[current.y][current.x].left = false
    maze[next.y][next.x].right = false
    return
  }
  if (next.y === current.y + 1) {
    maze[current.y][current.x].bottom = false
    maze[next.y][next.x].top = false
    return
  }
  if (next.y === current.y - 1) {
    maze[current.y][current.x].top = false
    maze[next.y][next.x].bottom = false
  }
}

function canLeave(cell: MazeCell, direction: Point): boolean {
  if (direction.x === 1) return !cell.right
  if (direction.x === -1) return !cell.left
  if (direction.y === 1) return !cell.bottom
  return !cell.top
}

function breadthFirst(
  maze: MazeCell[][],
  start: Point,
  goal?: Point
): { visited: number; distance: number } {
  const { cols, rows } = getMazeBounds(maze)
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false))
  const queue: Array<Point & { distance: number }> = [{ ...start, distance: 0 }]
  seen[start.y][start.x] = true
  let visited = 0
  let goalDistance = -1

  while (queue.length > 0) {
    const current = queue.shift()!
    visited += 1

    if (goal && current.x === goal.x && current.y === goal.y) {
      goalDistance = current.distance
    }

    const cell = maze[current.y][current.x]
    for (const step of DIRECTIONS) {
      if (!canLeave(cell, step)) continue
      const x = current.x + step.x
      const y = current.y + step.y
      if (x < 0 || y < 0 || x >= cols || y >= rows || seen[y][x]) continue
      seen[y][x] = true
      queue.push({ x, y, distance: current.distance + 1 })
    }
  }

  return { visited, distance: goalDistance }
}
