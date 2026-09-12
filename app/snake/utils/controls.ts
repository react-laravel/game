import type { Direction } from './snakePath'

export const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
}

export const KEY_DIRECTION_MAP: Record<string, Direction> = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  w: 'UP',
  W: 'UP',
  s: 'DOWN',
  S: 'DOWN',
  a: 'LEFT',
  A: 'LEFT',
  d: 'RIGHT',
  D: 'RIGHT',
}

export function directionFromKey(key: string): Direction | null {
  return KEY_DIRECTION_MAP[key] ?? null
}

/** Whether a direction change is allowed (not opposite and not the same). */
export function canChangeToDirection(current: Direction, next: Direction): boolean {
  return OPPOSITE_DIRECTIONS[current] !== next && current !== next
}
