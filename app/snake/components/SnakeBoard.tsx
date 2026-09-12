import { headAngle, toCellCenter, toPolylinePoints, type Direction, type Position } from '../utils/snakePath'

interface SnakeBoardProps {
  snake: Position[]
  food: Position
  direction: Direction
  boardSize: number
}

export function SnakeBoard({ snake, food, direction, boardSize }: SnakeBoardProps) {
  const points = toPolylinePoints(snake)
  const head = toCellCenter(snake[0] ?? { x: 0, y: 0 })
  const apple = toCellCenter(food)
  const angle = headAngle(snake, direction)
  const cellPercent = `${100 / boardSize}%`

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-950">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: [
            'linear-gradient(to right, rgb(255 255 255 / 0.045) 1px, transparent 1px)',
            'linear-gradient(to bottom, rgb(255 255 255 / 0.045) 1px, transparent 1px)',
          ].join(','),
          backgroundSize: `${cellPercent} ${cellPercent}`,
        }}
      />
      <svg
        viewBox={`0 0 ${boardSize} ${boardSize}`}
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden
      >
        <circle
          data-testid="snake-food"
          cx={apple.x}
          cy={apple.y}
          r="0.32"
          fill="#fb7185"
          className="drop-shadow-[0_0_0.18px_rgba(251,113,133,0.85)]"
        />
        <circle cx={apple.x - 0.08} cy={apple.y - 0.08} r="0.09" fill="#fda4af" />
        {snake.length >= 2 ? (
          <>
            <polyline
              data-testid="snake-path-outline"
              points={points}
              fill="none"
              stroke="#14532d"
              strokeWidth="0.92"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              data-testid="snake-path"
              points={points}
              fill="none"
              stroke="#4ade80"
              strokeWidth="0.78"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : null}
        <g
          data-testid="snake-head"
          data-heading={angle}
          transform={`translate(${head.x} ${head.y}) rotate(${angle})`}
        >
          <circle r="0.42" fill="#4ade80" stroke="#14532d" strokeWidth="0.07" />
          <circle cx="0.14" cy="-0.15" r="0.11" fill="white" />
          <circle cx="0.14" cy="0.15" r="0.11" fill="white" />
          <circle cx="0.2" cy="-0.15" r="0.055" fill="#111827" />
          <circle cx="0.2" cy="0.15" r="0.055" fill="#111827" />
        </g>
      </svg>
    </div>
  )
}
