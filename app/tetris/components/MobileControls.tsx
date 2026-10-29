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
    const startHold = (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.currentTarget.setPointerCapture?.(e.pointerId)
      startSoftDrop()
    }

    return (
      <div className="mx-auto w-full max-w-md lg:hidden">
        {/* 旋转按钮 */}
        <div className="mb-4 flex justify-center">
          <Button
            type="button"
            aria-label="旋转方块"
            variant="outline"
            size="lg"
            className="h-12 w-16 border-white/20 bg-white/5 text-xl font-bold text-white hover:bg-white/10"
            onClick={rotatePiece}
          >
            ↻
          </Button>
        </div>

        {/* 左右移动和软降 */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <Button
            type="button"
            aria-label="向左移动"
            variant="outline"
            size="lg"
            className="h-12 w-full border-white/20 bg-white/5 text-xl font-bold text-white hover:bg-white/10"
            onClick={() => movePiece('left')}
          >
            ←
          </Button>
          <Button
            type="button"
            aria-pressed={isSoftDropping}
            variant="outline"
            className={`h-12 w-full border-white/20 bg-white/5 text-sm font-medium text-white hover:bg-white/10 ${
              isSoftDropping ? 'bg-amber-500/15 text-amber-200' : ''
            }`}
            style={{ touchAction: 'none' }}
            onPointerDown={startHold}
            onPointerUp={stopSoftDrop}
            onPointerCancel={stopSoftDrop}
            onLostPointerCapture={stopSoftDrop}
            onBlur={stopSoftDrop}
            onKeyDown={e => {
              if (e.key !== ' ' && e.key !== 'Enter') return
              e.preventDefault()
              if (!e.repeat) startSoftDrop()
            }}
            onKeyUp={e => {
              if (e.key !== ' ' && e.key !== 'Enter') return
              e.preventDefault()
              stopSoftDrop()
            }}
          >
            按住软降 ↓
          </Button>
          <Button
            type="button"
            aria-label="向右移动"
            variant="outline"
            size="lg"
            className="h-12 w-full border-white/20 bg-white/5 text-xl font-bold text-white hover:bg-white/10"
            onClick={() => movePiece('right')}
          >
            →
          </Button>
        </div>

        {/* 硬降 */}
        <div className="flex justify-center">
          <Button
            type="button"
            aria-label="硬降方块"
            variant="outline"
            size="lg"
            className="h-12 w-20 border-white/20 bg-white/5 text-xl font-bold text-white hover:bg-white/10"
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
