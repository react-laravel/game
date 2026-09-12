'use client'

import type { MouseEventHandler, ReactNode } from 'react'
import { GameRulesDialog } from '@/components/ui/game-rules-dialog'
import { cn } from '@/lib/helpers'

interface GameStageProps {
  title: string
  rules?: string[]
  rulesTitle?: string
  actions?: ReactNode
  children: ReactNode
  fill?: boolean
  className?: string
  contentClassName?: string
  onContextMenu?: MouseEventHandler<HTMLDivElement>
}

export function GameStage({
  title,
  rules,
  rulesTitle,
  actions,
  children,
  fill = false,
  className,
  contentClassName,
  onContextMenu,
}: GameStageProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden bg-background',
        fill ? 'h-dvh' : 'min-h-dvh',
        className
      )}
      onContextMenu={onContextMenu}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_46%)]"
      />
      <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 px-4 pt-4 pb-2">
        <h1 className="text-xl font-black tracking-tight">{title}</h1>
        <div className="flex items-center gap-1">
          {actions}
          {rules && rules.length > 0 ? (
            <GameRulesDialog title={rulesTitle ?? `${title}游戏规则`} rules={rules} />
          ) : null}
        </div>
      </header>
      <div
        className={cn(
          'relative z-10 flex min-h-0 flex-1 flex-col px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-4',
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function GameHud({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/60 bg-card/80 p-3 shadow-sm backdrop-blur-md',
        className
      )}
    >
      {children}
    </div>
  )
}

export function GameStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 text-center">
      <div className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </div>
      <div className="mt-0.5 text-xl font-black tabular-nums">{value}</div>
    </div>
  )
}

export function GameResultOverlay({
  open,
  eyebrow = 'Game over',
  title,
  children,
}: {
  open: boolean
  eyebrow?: string
  title: string
  children?: ReactNode
}) {
  if (!open) return null

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/65 px-4 backdrop-blur-[3px]">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-950 p-7 text-center text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-amber-200/80 uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight">{title}</h2>
        {children}
      </div>
    </div>
  )
}
