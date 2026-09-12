export const MIN_MAZE_SIZE = 5
export const MAX_MAZE_SIZE = 40
export const DEFAULT_MAZE_SIZE = 15
export const DEFAULT_MAZE_SHAPE = 'square' as const

/** A4 竖版 210mm × 297mm，格子按这个比例铺满纸面 */
export const A4_WIDTH_MM = 210
export const A4_HEIGHT_MM = 297

export type MazeShape = 'square' | 'a4'

export function clampMazeSize(size: number): number {
  if (!Number.isFinite(size)) {
    return DEFAULT_MAZE_SIZE
  }

  return Math.min(MAX_MAZE_SIZE, Math.max(MIN_MAZE_SIZE, Math.round(size)))
}

export function getMazeDimensions(
  shape: MazeShape,
  size: number
): { cols: number; rows: number } {
  const cols = clampMazeSize(size)
  if (shape === 'square') {
    return { cols, rows: cols }
  }

  const rows = Math.max(cols + 1, Math.round((cols * A4_HEIGHT_MM) / A4_WIDTH_MM))
  return { cols, rows }
}
