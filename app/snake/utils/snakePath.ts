export type Position = { x: number; y: number }
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

export const DIRECTION_ANGLE: Record<Direction, number> = {
  RIGHT: 0,
  DOWN: 90,
  LEFT: 180,
  UP: 270,
}

/** 蛇头朝向：远离后一节身体，而不是对着身体。 */
export function headingFromSegments(
  head: Position,
  behind: Position | undefined,
  fallback: Direction
): Direction {
  if (!behind) return fallback

  const dx = head.x - behind.x
  const dy = head.y - behind.y

  if (dx > 0) return 'RIGHT'
  if (dx < 0) return 'LEFT'
  if (dy > 0) return 'DOWN'
  if (dy < 0) return 'UP'

  return fallback
}

export function toCellCenter(position: Position): Position {
  return { x: position.x + 0.5, y: position.y + 0.5 }
}

/** 格子中心折线，配合 round join 让转弯跟随路径角度。 */
export function toPolylinePoints(snake: Position[]): string {
  return snake
    .map(segment => {
      const { x, y } = toCellCenter(segment)
      return `${x},${y}`
    })
    .join(' ')
}

export function headAngle(snake: Position[], fallback: Direction): number {
  return DIRECTION_ANGLE[headingFromSegments(snake[0], snake[1], fallback)]
}
