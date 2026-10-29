import { useEffect } from 'react'

interface KeyboardControlsProps {
  movePiece: (direction: 'left' | 'right' | 'down') => boolean
  rotatePiece: () => void
  hardDrop: () => void
  togglePause: () => void
  gameOver: boolean
  enabled?: boolean
}

export function useKeyboardControls({
  movePiece,
  rotatePiece,
  hardDrop,
  togglePause,
  gameOver,
  enabled = true,
}: KeyboardControlsProps) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        gameOver || e.defaultPrevented || e.isComposing || e.ctrlKey || e.metaKey || e.altKey ||
        (e.target instanceof Element && e.target.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="dialog"], [role="alertdialog"], [role="slider"], [role="menu"], [role="listbox"], [role="combobox"]'
        )) ||
        ((e.key === ' ' || e.key === 'Enter') && e.target instanceof Element &&
          e.target.closest('button, a, [role="button"]'))
      ) return

      switch (e.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
          e.preventDefault()
          movePiece('left')
          break
        case 'arrowright':
        case 'd':
          e.preventDefault()
          movePiece('right')
          break
        case 'arrowdown':
        case 's':
          e.preventDefault()
          movePiece('down')
          break
        case 'arrowup':
        case 'w':
        case ' ':
          e.preventDefault()
          if (e.repeat) return
          if (e.key === ' ') {
            hardDrop()
          } else {
            rotatePiece()
          }
          break
        case 'p':
          e.preventDefault()
          if (e.repeat) return
          togglePause()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [movePiece, rotatePiece, hardDrop, togglePause, gameOver, enabled])
}
