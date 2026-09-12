/**
 * 2048方向控制组件
 */
import { Button } from '@/components/ui/button'

type Direction = 'up' | 'down' | 'left' | 'right'

interface DirectionControlsProps {
  onMove: (direction: Direction) => void
  onRandomMove: () => void
  disabled: boolean
  showRandomDirection: Direction | null
}

const DIRECTION_SYMBOLS = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
} as const

export function DirectionControls({
  onMove,
  onRandomMove,
  disabled,
  showRandomDirection,
}: DirectionControlsProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col items-center space-y-2">
        <Button
          variant="outline"
          size="lg"
          className="h-12 w-24 rounded-xl p-0 text-xl"
          onClick={() => onMove('up')}
          disabled={disabled}
        >
          {DIRECTION_SYMBOLS.up}
        </Button>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-24 rounded-xl p-0 text-xl"
            onClick={() => onMove('left')}
            disabled={disabled}
          >
            {DIRECTION_SYMBOLS.left}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-12 w-12 rounded-xl p-0 text-lg"
            onClick={onRandomMove}
            disabled={disabled}
          >
            {showRandomDirection ? DIRECTION_SYMBOLS[showRandomDirection] : '🎲'}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-12 w-24 rounded-xl p-0 text-xl"
            onClick={() => onMove('right')}
            disabled={disabled}
          >
            {DIRECTION_SYMBOLS.right}
          </Button>
        </div>

        <Button
          variant="outline"
          size="lg"
          className="h-12 w-24 rounded-xl p-0 text-xl"
          onClick={() => onMove('down')}
          disabled={disabled}
        >
          {DIRECTION_SYMBOLS.down}
        </Button>
      </div>
    </div>
  )
}
