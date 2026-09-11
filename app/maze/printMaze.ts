import type { MazeCell } from './store'

export interface MazeWallLine {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface PrintableMazeGeometry {
  mazeSize: number
  strokeWidth: number
  labelSize: number
  lines: MazeWallLine[]
  start: { x: number; y: number; label: '起' }
  end: { x: number; y: number; label: '终' }
}

export function getPrintableMazeGeometry(
  maze: MazeCell[][],
  mazeSize: number
): PrintableMazeGeometry {
  const lines: MazeWallLine[] = []
  const seen = new Set<string>()

  const addLine = (x1: number, y1: number, x2: number, y2: number) => {
    const key = `${x1},${y1},${x2},${y2}`
    const reverseKey = `${x2},${y2},${x1},${y1}`
    if (seen.has(key) || seen.has(reverseKey)) {
      return
    }
    seen.add(key)
    lines.push({ x1, y1, x2, y2 })
  }

  for (let y = 0; y < mazeSize; y++) {
    for (let x = 0; x < mazeSize; x++) {
      const cell = maze[y]?.[x]
      if (!cell) {
        continue
      }

      if (cell.top) {
        addLine(x, y, x + 1, y)
      }
      if (cell.right) {
        addLine(x + 1, y, x + 1, y + 1)
      }
      if (cell.bottom) {
        addLine(x, y + 1, x + 1, y + 1)
      }
      if (cell.left) {
        addLine(x, y, x, y + 1)
      }
    }
  }

  return {
    mazeSize,
    strokeWidth: Math.min(0.16, Math.max(0.07, 2.2 / mazeSize)),
    labelSize: Math.max(0.55, mazeSize * 0.04),
    lines,
    start: { x: 0.5, y: 0.5, label: '起' },
    end: { x: mazeSize - 0.5, y: mazeSize - 0.5, label: '终' },
  }
}

export function printCurrentMaze(): void {
  window.print()
}
