import { useEffect } from 'react'
import type { Direction } from '../utils/gameEngine'

export interface UseKeyboardControlsOptions {
  onMove: (direction: Direction) => void
  enabled?: boolean
}

/**
 * Hook for keyboard control in 2048
 * Maps arrow keys to game directions
 *
 * Usage:
 * ```tsx
 * useKeyboardControls({
 *   onMove: handleMove,
 *   enabled: !gameOver,
 * })
 * ```
 */
export function useKeyboardControls({ onMove, enabled = true }: UseKeyboardControlsOptions) {
  useEffect(() => {
    if (!enabled) return

    const handler = (e: KeyboardEvent) => {
      if (
        e.defaultPrevented || e.isComposing || e.ctrlKey || e.metaKey || e.altKey ||
        (e.target instanceof Element && e.target.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="dialog"], [role="alertdialog"], [role="slider"], [role="menu"], [role="listbox"], [role="combobox"]'
        )) ||
        ((e.key === ' ' || e.key === 'Enter') && e.target instanceof Element &&
          e.target.closest('button, a, [role="button"]'))
      ) return

      const directionMap: Record<string, Direction> = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
      }

      const direction = directionMap[e.key]
      if (direction) {
        e.preventDefault()
        onMove(direction)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onMove, enabled])
}
