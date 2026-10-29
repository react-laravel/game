'use client'

import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Gamepad2, Grip, House, Moon, Sun } from 'lucide-react'
import { useGameTheme } from '@/components/GameThemeProvider'

const POSITION_STORAGE_KEY = 'game-quick-menu-position'
const BUTTON_SIZE = 52
const VIEWPORT_MARGIN = 14
const MENU_GAP = 10

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
    if (
      typeof parsed.x !== 'number' || typeof parsed.y !== 'number' ||
      !Number.isFinite(parsed.x) || !Number.isFinite(parsed.y)
    ) return defaultPosition()
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
  const [menuPathname, setMenuPathname] = useState(pathname)
  const [position, setPosition] = useState<Position | null>(null)
  const positionRef = useRef<Position | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const suppressClickRef = useRef(false)
  const menuId = useId()

  // Closing while rendering avoids briefly displaying an old route's menu.
  if (menuPathname !== pathname) {
    setMenuPathname(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    menuRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const closeOutside = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      buttonRef.current?.focus()
    }
    document.addEventListener('pointerdown', closeOutside)
    // Capture before game listeners so closing the menu does not pause/restart a game.
    window.addEventListener('keydown', closeOnEscape, true)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      window.removeEventListener('keydown', closeOnEscape, true)
    }
  }, [open])

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
    suppressClickRef.current = false
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
      suppressClickRef.current = true
      const currentPosition = positionRef.current
      if (currentPosition) {
        try {
          window.localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(currentPosition))
        } catch {
          // Dragging remains usable when storage is full or disabled.
        }
      }
    }
  }

  const goHome = () => {
    document.exitPointerLock?.()
    setOpen(false)
    router.push('/')
  }

  const isNearBottom = position ? position.y > window.innerHeight / 2 : true
  const menuMaxHeight = position
    ? Math.max(44, (isNearBottom ? position.y : window.innerHeight - position.y - BUTTON_SIZE) - VIEWPORT_MARGIN - MENU_GAP)
    : undefined
  const wrapperStyle = position
    ? { left: position.x, top: position.y }
    : { right: 22, bottom: 28 }

  const actionButtonClass =
    'flex size-11 shrink-0 items-center justify-center rounded-full border border-border/80 bg-popover text-popover-foreground shadow-lg backdrop-blur-md transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

  return (
    <div
      ref={wrapperRef}
      className="fixed z-[999] print:hidden"
      style={wrapperStyle}
      data-testid="game-quick-menu"
      suppressHydrationWarning
      onKeyDown={event => {
        // Game shortcuts must not run while a quick-menu control has focus.
        event.stopPropagation()
        if (!open || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
        event.preventDefault()
        const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])
        const index = items.indexOf(document.activeElement as HTMLButtonElement)
        const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1
          : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
        items[nextIndex]?.focus()
      }}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          className={`absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 overflow-y-auto p-1 ${
            isNearBottom ? 'bottom-[calc(100%+0.6rem)]' : 'top-[calc(100%+0.6rem)]'
          }`}
          style={{ maxHeight: menuMaxHeight }}
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
            role="menuitemradio"
            aria-checked={theme === 'light'}
          >
            <Sun className="size-5" />
          </button>
          <button
            type="button"
            className={`${actionButtonClass} ${theme === 'dark' ? 'ring-primary ring-2' : ''}`}
            onClick={() => setTheme('dark')}
            aria-label="切换到深色模式"
            title="深色模式"
            role="menuitemradio"
            aria-checked={theme === 'dark'}
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
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        title="拖动位置，点击展开"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          dragRef.current = null
          suppressClickRef.current = true
        }}
        onLostPointerCapture={() => {
          dragRef.current = null
        }}
        onClick={() => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false
            return
          }
          setOpen(current => !current)
        }}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            suppressClickRef.current = false
          } else if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault()
            setOpen(true)
          }
        }}
      >
        <Gamepad2 className="size-6 transition-transform group-hover:scale-105" />
        <Grip className="absolute right-1 bottom-1 size-3 text-white/45" />
      </button>
    </div>
  )
}
