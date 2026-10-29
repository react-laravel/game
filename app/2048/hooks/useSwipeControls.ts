import { useEffect, useEffectEvent } from 'react'
import type { Direction } from '../utils/gameEngine'

export interface UseSwipeControlsOptions {
  onMove: (direction: Direction) => void
  enabled?: boolean
  minDistance?: number
  throttleMs?: number
  targetSelector?: string
}

const DEFAULT_MIN_DISTANCE = 30
const DEFAULT_THROTTLE_MS = 200

/** Track a single touch on the board; ignore page scrolls and cancelled gestures. */
export function useSwipeControls({
  onMove,
  enabled = true,
  minDistance = DEFAULT_MIN_DISTANCE,
  throttleMs = DEFAULT_THROTTLE_MS,
  targetSelector = '[data-game-board]',
}: UseSwipeControlsOptions) {
  const move = useEffectEvent(onMove)

  useEffect(() => {
    if (!enabled) return

    let touch: { id: number; x: number; y: number } | null = null
    let lastMoveTime: number | null = null
    const reset = () => {
      touch = null
      lastMoveTime = null
    }
    const onStart = (e: TouchEvent) => {
      reset()
      if (e.touches.length !== 1 || !(e.target instanceof Element) || !e.target.closest(targetSelector)) return

      const started = e.touches[0]
      touch = { id: started.identifier, x: started.clientX, y: started.clientY }
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!touch) return
      if (e.touches.length !== 1 || e.touches[0].identifier !== touch.id) {
        reset()
        return
      }
      if (e.cancelable) e.preventDefault()

      const now = Date.now()
      if (lastMoveTime !== null && now - lastMoveTime < throttleMs) return

      const current = e.touches[0]
      const diffX = touch.x - current.clientX
      const diffY = touch.y - current.clientY
      if (Math.max(Math.abs(diffX), Math.abs(diffY)) <= minDistance) return

      const direction: Direction = Math.abs(diffX) > Math.abs(diffY)
        ? diffX > 0 ? 'left' : 'right'
        : diffY > 0 ? 'up' : 'down'
      touch = { id: touch.id, x: current.clientX, y: current.clientY }
      lastMoveTime = now
      move(direction)
    }

    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', reset)
    document.addEventListener('touchcancel', reset)
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', reset)
      document.removeEventListener('touchcancel', reset)
      reset()
    }
  }, [enabled, minDistance, throttleMs, targetSelector])
}
