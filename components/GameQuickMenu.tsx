'use client'

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Gamepad2, Grip, House, Moon, Sun } from 'lucide-react'
import { useGameTheme } from '@/components/GameThemeProvider'

const POSITION_STORAGE_KEY = 'game-quick-menu-position'
const BUTTON_SIZE = 52
const VIEWPORT_MARGIN = 14

interface Position {
  x: number
  y: number
}

interface DragState {
  pointerId: number
  startX: number
  startY: number
  originX: number
  originY: number
  moved: boolean
}

function clampPosition(position: Position): Position {
  return {
    x: Math.min(
      Math.max(VIEWPORT_MARGIN, position.x),
      Math.max(VIEWPORT_MARGIN, window.innerWidth - BUTTON_SIZE - VIEWPORT_MARGIN)
    ),
    y: Math.min(
      Math.max(VIEWPORT_MARGIN, position.y),
      Math.max(VIEWPORT_MARGIN, window.innerHeight - BUTTON_SIZE - VIEWPORT_MARGIN)
    ),
  }
}

function defaultPosition(): Position {
  return clampPosition({
    x: window.innerWidth - BUTTON_SIZE - 22,
    y: window.innerHeight - BUTTON_SIZE - 28,
  })
}

function readStoredPosition(): Position {
  try {
    const stored = window.localStorage.getItem(POSITION_STORAGE_KEY)
    if (!stored) return defaultPosition()
    const parsed = JSON.parse(stored) as Partial<Position>
    if (typeof parsed.x !== 'number' || typeof parsed.y !== 'number') return defaultPosition()
    return clampPosition({ x: parsed.x, y: parsed.y })
  } catch {
    return defaultPosition()
  }
}

export function GameQuickMenu() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useGameTheme()
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)
  const positionRef = useRef<Position | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const nextPosition = readStoredPosition()
      positionRef.current = nextPosition
      setPosition(nextPosition)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      const nextPosition = clampPosition(positionRef.current ?? defaultPosition())
      positionRef.current = nextPosition
      setPosition(nextPosition)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (pathname === '/' || pathname.startsWith('/auth/callback')) return null

  const updatePosition = (nextPosition: Position) => {
    const clamped = clampPosition(nextPosition)
    positionRef.current = clamped
    setPosition(clamped)
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    const bounds = event.currentTarget.getBoundingClientRect()
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: bounds.left,
      originY: bounds.top,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const deltaX = event.clientX - drag.startX
    const deltaY = event.clientY - drag.startY
    if (!drag.moved && Math.hypot(deltaX, deltaY) > 5) {
      drag.moved = true
      setOpen(false)
    }
    if (drag.moved) updatePosition({ x: drag.originX + deltaX, y: drag.originY + deltaY })
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    event.currentTarget.releasePointerCapture(event.pointerId)
    dragRef.current = null

    if (drag.moved) {
      const currentPosition = positionRef.current
      if (currentPosition) {
        window.localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(currentPosition))
      }
    } else {
      setOpen(current => !current)
    }
  }

  const goHome = () => {
    document.exitPointerLock?.()
    setOpen(false)
    router.push('/')
  }

  const isOnRight = position ? position.x > window.innerWidth / 2 : true
  const wrapperStyle = position
    ? { left: position.x, top: position.y }
    : { right: 22, bottom: 28 }

  const actionButtonClass =
    'flex size-11 shrink-0 items-center justify-center rounded-full border border-border/80 bg-popover text-popover-foreground shadow-lg backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground'

  return (
    <div
      className="fixed z-[999]"
      style={wrapperStyle}
      data-testid="game-quick-menu"
      suppressHydrationWarning
    >
      {open && (
        <div
          className={`absolute top-1/2 flex -translate-y-1/2 items-center gap-2 ${
            isOnRight ? 'right-[calc(100%+0.6rem)] flex-row' : 'left-[calc(100%+0.6rem)] flex-row-reverse'
          }`}
          role="menu"
          aria-label="游戏快捷菜单"
        >
          <button
            type="button"
            className={actionButtonClass}
            onClick={goHome}
            aria-label="返回游戏中心"
            title="返回游戏中心"
            role="menuitem"
          >
            <House className="size-5" />
          </button>
          <button
            type="button"
            className={`${actionButtonClass} ${theme === 'light' ? 'ring-primary ring-2' : ''}`}
            onClick={() => setTheme('light')}
            aria-label="切换到浅色模式"
            title="浅色模式"
            role="menuitem"
          >
            <Sun className="size-5" />
          </button>
          <button
            type="button"
            className={`${actionButtonClass} ${theme === 'dark' ? 'ring-primary ring-2' : ''}`}
            onClick={() => setTheme('dark')}
            aria-label="切换到深色模式"
            title="深色模式"
            role="menuitem"
          >
            <Moon className="size-5" />
          </button>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        className={`group relative flex size-[52px] touch-none items-center justify-center rounded-full border border-white/15 bg-slate-950 text-white shadow-[0_10px_32px_rgba(0,0,0,0.35)] transition-shadow select-none hover:shadow-[0_12px_36px_rgba(0,0,0,0.45)] active:cursor-grabbing ${
          open ? 'ring-primary ring-2 ring-offset-2 ring-offset-background' : ''
        }`}
        aria-label={open ? '收起游戏快捷菜单' : '展开游戏快捷菜单'}
        aria-expanded={open}
        title="拖动位置，点击展开"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          dragRef.current = null
        }}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setOpen(current => !current)
          }
        }}
      >
        <Gamepad2 className="size-6 transition-transform group-hover:scale-105" />
        <Grip className="absolute right-1 bottom-1 size-3 text-white/45" />
      </button>
    </div>
  )
}
