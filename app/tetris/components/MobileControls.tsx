import React, { memo } from 'react'
import { Button } from '@/components/ui/button'

interface MobileControlsProps {
  movePiece: (direction: 'left' | 'right' | 'down') => boolean
  rotatePiece: () => void
  hardDrop: () => void
  startSoftDrop: () => void
  stopSoftDrop: () => void
  isSoftDropping: boolean
}

export const MobileControls = memo<MobileControlsProps>(
  ({ movePiece, rotatePiece, hardDrop, startSoftDrop, stopSoftDrop, isSoftDropping }) => {
    const handleTouchStart = (callback: () => void) => (e: React.TouchEvent) => {
      e.preventDefault()
      callback()
    }

    const handleTouchEnd = (callback: () => void) => (e: React.TouchEvent) => {
      e.preventDefault()
      callback()
    }

    return (
      <div className="mx-auto w-full max-w-md lg:hidden">
        {/* 旋转按钮 */}
        <div className="mb-4 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-16 border-white/20 bg-white/5 text-xl font-bold text-white hover:bg-white/10"
            onTouchStart={handleTouchStart(rotatePiece)}
            onClick={rotatePiece}
          >
            ↻
          </Button>
        </div>

        {/* 左右移动和软降 */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full border-white/20 bg-white/5 text-xl font-bold text-white hover:bg-white/10"
            onTouchStart={handleTouchStart(() => movePiece('left'))}
            onClick={() => movePiece('left')}
          >
            ←
          </Button>
          <Button
            variant="outline"
            className={`h-12 w-full border-white/20 bg-white/5 text-sm font-medium text-white hover:bg-white/10 ${
              isSoftDropping ? 'bg-amber-500/15 text-amber-200' : ''
            }`}
            onTouchStart={handleTouchStart(startSoftDrop)}
            onTouchEnd={handleTouchEnd(stopSoftDrop)}
            onMouseDown={startSoftDrop}
            onMouseUp={stopSoftDrop}
            onMouseLeave={stopSoftDrop}
          >
            按住软降 ↓
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full border-white/20 bg-white/5 text-xl font-bold text-white hover:bg-white/10"
            onTouchStart={handleTouchStart(() => movePiece('right'))}
            onClick={() => movePiece('right')}
          >
            →
          </Button>
        </div>

        {/* 硬降 */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-20 border-white/20 bg-white/5 text-xl font-bold text-white hover:bg-white/10"
            onTouchStart={handleTouchStart(hardDrop)}
            onClick={hardDrop}
          >
            ⬇
          </Button>
        </div>
      </div>
    )
  }
)

MobileControls.displayName = 'MobileControls'
