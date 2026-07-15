'use client'

import Link from 'next/link'
import { Building2, Gamepad2, Moon, Sun, SunMoon } from 'lucide-react'
import { useGameTheme } from '@/components/GameThemeProvider'

export function MonopolyHeader() {
  const { theme, toggleTheme } = useGameTheme()
  const themeLabel =
    theme === 'dark' ? '切换到浅色模式' : theme === 'light' ? '切换到深色模式' : '切换主题'

  return (
    <header className="border-border bg-background/95 z-50 shrink-0 border-b pt-[env(safe-area-inset-top)] backdrop-blur">
      <nav
        className="mx-auto grid h-13 w-full grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 sm:px-4"
        aria-label="地产棋局导航"
      >
        <div className="flex min-w-0 justify-start">
          <Link
            href="/"
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors"
            aria-label="返回游戏中心"
          >
            <Gamepad2 className="size-4" />
            <span className="hidden sm:inline">游戏中心</span>
          </Link>
        </div>

        <div className="flex min-w-0 items-center justify-center gap-2 font-semibold">
          <span className="bg-primary/12 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
            <Building2 className="size-4" />
          </span>
          <span className="truncate text-sm sm:text-base">地产棋局</span>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={toggleTheme}
            className="border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex size-9 items-center justify-center rounded-md border transition-colors"
            aria-label={themeLabel}
            title={themeLabel}
          >
            {theme === 'dark' ? (
              <Sun className="size-4" />
            ) : theme === 'light' ? (
              <Moon className="size-4" />
            ) : (
              <SunMoon className="size-4" />
            )}
          </button>
        </div>
      </nav>
    </header>
  )
}
