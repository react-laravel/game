'use client'

import { Gauge } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import {
  clampLookSensitivity,
  LOOK_SENSITIVITY_PRESETS,
  lookSensitivityLabel,
  MAX_LOOK_SENSITIVITY,
  MIN_LOOK_SENSITIVITY,
} from '../utils/lookSensitivity'

interface LookSensitivityControlProps {
  value: number
  onChange: (value: number) => void
  compact?: boolean
  variant?: 'default' | 'dark'
  hideHint?: boolean
  /** Card frame + turn-speed preview for pause settings tabs */
  framed?: boolean
}

export function LookSensitivityControl({
  value,
  onChange,
  compact = false,
  variant = 'default',
  hideHint = false,
  framed = false,
}: LookSensitivityControlProps) {
  const clamped = clampLookSensitivity(value)
  const onDark = variant === 'dark'
  const titleClass = onDark ? 'text-white' : 'text-foreground'
  const hintClass = onDark ? 'text-white/45' : 'text-muted-foreground'
  const metaClass = onDark ? 'text-white/55' : 'text-muted-foreground'
  const iconClass = onDark ? 'text-cyan-200' : 'text-primary'
  const labelClass = onDark
    ? 'text-[10px] font-semibold tracking-[0.14em] text-white/40 uppercase'
    : 'text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase'
  const presetSelected = onDark
    ? 'border-cyan-300/50 bg-cyan-300/10 ring-1 ring-cyan-200/25 text-white'
    : 'border-primary bg-primary/7 ring-1 ring-primary/20'
  const presetIdle = onDark
    ? 'border-white/12 text-white/75 hover:border-cyan-200/35 hover:bg-white/5'
    : 'border-border hover:border-primary/40 hover:bg-muted/40'
  const turnDegrees = Math.round(18 + clamped * 42)

  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Gauge className={`h-4 w-4 ${iconClass}`} />
          <h3 className={`text-sm font-semibold ${titleClass}`}>鼠标灵敏度</h3>
        </div>
        <span className={`text-xs font-medium ${metaClass}`}>
          {lookSensitivityLabel(clamped)} · {clamped.toFixed(1)}×
        </span>
      </div>

      {framed && (
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-slate-950/55">
          <div className="relative flex h-28 items-center justify-center bg-[radial-gradient(circle_at_center,#1a2a38_0%,#0b141c_78%)]">
            <div
              className="absolute h-16 w-16 rounded-full border border-cyan-300/20"
              aria-hidden="true"
            />
            <div
              className="absolute h-1 w-10 origin-left rounded-full bg-gradient-to-r from-cyan-300/90 to-cyan-200/30 transition-transform duration-300"
              style={{ transform: `rotate(${-turnDegrees}deg)` }}
              aria-hidden="true"
            />
            <span className="pointer-events-none absolute bottom-2 left-3 text-[10px] text-white/40">
              约 {turnDegrees}° / 鼠标小幅移动
            </span>
          </div>
          <div className="border-t border-white/8 px-3 py-1.5 text-center text-[10px] tracking-[0.16em] text-white/40 uppercase">
            实时预览 · 转向幅度
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className={labelClass}>常用预设</div>
        <div className="grid grid-cols-3 gap-2">
          {LOOK_SENSITIVITY_PRESETS.map(preset => (
            <button
              key={preset.id}
              type="button"
              aria-pressed={clamped === preset.value}
              onClick={() => onChange(preset.value)}
              className={`rounded-xl border px-2 py-2.5 text-left transition-all ${
                clamped === preset.value ? presetSelected : presetIdle
              }`}
            >
              <div className="text-sm font-semibold">{preset.label}</div>
              <div
                className={`mt-0.5 text-[10px] leading-4 ${
                  onDark ? 'text-white/45' : 'text-muted-foreground'
                }`}
              >
                {preset.hint}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className={`font-medium ${titleClass}`}>精细调节</span>
          <span className={`font-mono ${metaClass}`}>{clamped.toFixed(1)}×</span>
        </div>
        <Slider
          min={MIN_LOOK_SENSITIVITY}
          max={MAX_LOOK_SENSITIVITY}
          step={0.1}
          value={[clamped]}
          onValueChange={([next]) => onChange(next)}
          aria-label="鼠标灵敏度"
        />
      </div>
      {!hideHint && (
        <p className={`text-xs leading-5 ${hintClass}`}>
          影响视角转动速度。设置会保存到本地，下次训练自动恢复。
        </p>
      )}
    </>
  )

  return (
    <section
      className={
        framed
          ? 'space-y-4 rounded-2xl border border-white/8 bg-slate-950/45 p-4'
          : compact
            ? 'space-y-3'
            : 'space-y-4'
      }
    >
      {content}
    </section>
  )
}
