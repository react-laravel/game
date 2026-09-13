'use client'

import { Circle, UserRound } from 'lucide-react'
import type { TargetShape } from '../types'
import { TARGET_SHAPE_OPTIONS } from '../utils/targetShape'

const ICONS: Record<TargetShape, typeof Circle> = {
  circle: Circle,
  humanoid: UserRound,
}

interface TargetShapeControlProps {
  value: TargetShape
  onChange: (value: TargetShape) => void
  compact?: boolean
  framed?: boolean
  variant?: 'light' | 'dark'
}

export function TargetShapeControl({
  value,
  onChange,
  compact = false,
  framed = false,
  variant = 'light',
}: TargetShapeControlProps) {
  const isDark = variant === 'dark'

  return (
    <div
      className={
        framed
          ? `space-y-3 rounded-2xl border p-4 ${
              isDark ? 'border-white/8 bg-slate-950/45' : 'border-border/80 bg-muted/20'
            }`
          : 'space-y-3'
      }
    >
      <div>
        <div
          className={`text-[10px] font-semibold tracking-[0.14em] uppercase ${
            isDark ? 'text-white/40' : 'text-muted-foreground'
          }`}
        >
          靶型
        </div>
        <h3 className={`mt-1 text-sm font-semibold ${isDark ? 'text-white' : ''}`}>目标外观</h3>
        {!compact && (
          <p className={`mt-1 text-xs leading-5 ${isDark ? 'text-white/55' : 'text-muted-foreground'}`}>
            人形靶按头部 / 躯干 / 四肢分区计分，适合跟枪与爆头练习。
          </p>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {TARGET_SHAPE_OPTIONS.map(option => {
          const Icon = ICONS[option.id]
          const selected = value === option.id
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.id)}
              className={`rounded-xl border px-3 py-3 text-left transition-all ${
                selected
                  ? isDark
                    ? 'border-amber-400/35 bg-amber-400/10 ring-1 ring-amber-400/25'
                    : 'border-primary bg-primary/7 ring-1 ring-primary/20'
                  : isDark
                    ? 'border-white/10 bg-slate-900/40 hover:border-white/20'
                    : 'border-border hover:border-primary/40 hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${selected ? 'text-amber-300' : 'text-muted-foreground'}`} />
                <span className="font-semibold text-sm">{option.label}</span>
              </div>
              <p className={`mt-1 text-xs leading-5 ${isDark ? 'text-white/50' : 'text-muted-foreground'}`}>
                {option.hint}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
