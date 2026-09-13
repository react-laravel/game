'use client'

import { CloudMoon, CloudSun, Moon, Sun } from 'lucide-react'
import type { OutdoorTimeOfDay } from '../types'
import { OUTDOOR_TIME_OPTIONS } from '../utils/outdoorTimeOfDay'

const ICONS: Record<OutdoorTimeOfDay, typeof Sun> = {
  day: CloudSun,
  noon: Sun,
  dusk: CloudMoon,
  night: Moon,
}

interface OutdoorTimeOfDayControlProps {
  value: OutdoorTimeOfDay
  onChange: (value: OutdoorTimeOfDay) => void
  compact?: boolean
  framed?: boolean
  variant?: 'light' | 'dark'
  disabled?: boolean
}

export function OutdoorTimeOfDayControl({
  value,
  onChange,
  compact = false,
  framed = false,
  variant = 'light',
  disabled = false,
}: OutdoorTimeOfDayControlProps) {
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
          户外时段
        </div>
        <h3 className={`mt-1 text-sm font-semibold ${isDark ? 'text-white' : ''}`}>光照与天空</h3>
        {!compact && (
          <p className={`mt-1 text-xs leading-5 ${isDark ? 'text-white/55' : 'text-muted-foreground'}`}>
            仅影响户外靶场的天空、雾效与地面色调；夜间会点亮靶场灯柱。
          </p>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {OUTDOOR_TIME_OPTIONS.map(option => {
          const Icon = ICONS[option.id]
          const selected = value === option.id
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onChange(option.id)}
              className={`rounded-xl border px-3 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-45 ${
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
                <span className="text-sm font-semibold">{option.label}</span>
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
