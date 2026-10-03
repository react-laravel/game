export type GridPosition = [number, number, number]

export const GRID_TARGET_SCALE = 0.58
export const GRID_DEPTH = -16

/** A flat 3×3 rack; row spacing shrinks together rather than collapsing top cells. */
export function getGridPositions(maxY = 9): GridPosition[] {
  const baseY = Math.min(1.4, maxY)
  const rowSpacing = Math.min(2.1, Math.max(0, (maxY - baseY) / 2))
  return Array.from({ length: 9 }, (_, index) => [
    (index % 3 - 1) * 3.4,
    baseY + Math.floor(index / 3) * rowSpacing,
    GRID_DEPTH,
  ])
}

/** One allocator per scene. Hit timers reserve replacements synchronously, so they cannot overlap. */
export function createGridCycle(maxY = 9, random: () => number = Math.random) {
  const positions = getGridPositions(maxY)
  const occupied = new Map<number, number>()
  return {
    next(targetId: number): GridPosition {
      const reserved = new Set(occupied.values())
      const free = positions
        .map((_, index) => index)
        .filter(index => !reserved.has(index))
      if (free.length === 0) throw new Error('No free grid target slot')
      const cell = free[Math.min(free.length - 1, Math.floor(random() * free.length))]
      occupied.set(targetId, cell)
      return [...positions[cell]]
    },
    reserve(targetId: number, position: GridPosition) {
      const cell = positions.findIndex(candidate =>
        candidate.every((value, index) => Math.abs(value - position[index]) < 0.0001)
      )
      if (cell < 0) throw new Error('Target position is outside the grid')
      occupied.set(targetId, cell)
    },
    release(targetId: number) {
      occupied.delete(targetId)
    },
  }
}
