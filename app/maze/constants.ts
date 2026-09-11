export const MIN_MAZE_SIZE = 5
export const MAX_MAZE_SIZE = 40
export const DEFAULT_MAZE_SIZE = 15

export function clampMazeSize(size: number): number {
  if (!Number.isFinite(size)) {
    return DEFAULT_MAZE_SIZE
  }

  return Math.min(MAX_MAZE_SIZE, Math.max(MIN_MAZE_SIZE, Math.round(size)))
}
