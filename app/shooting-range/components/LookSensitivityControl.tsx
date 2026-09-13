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
}

export function LookSensitivityControl({
  value,
  onChange,
  compact = false,
  variant = 'default',
}: LookSensitivityControlProps) {
  const clamped = clampLookSensitivity(value)
  const onDark = variant === 'dark'
  const titleClass = onDark ? 'text-white' : 'text-foreground'
  const hintClass = onDark ? 'text-white/45' : 'text-muted-foreground'
  const metaClass = onDark ? 'text-white/55' : 'text-muted-foreground'
  const iconClass = onDark ? 'text-cyan-200' : 'text-primary'
  const presetSelected = onDark
    ? 'border-cyan-300/50 bg-cyan-300/10 ring-1 ring-cyan-200/25 text-white'
    : 'border-primary bg-primary/7 ring-1 ring-primary/20'
  const presetIdle = onDark
    ? 'border-white/12 text-white/75 hover:border-cyan-200/35 hover:bg-white/5'
    : 'border-border hover:border-primary/40 hover:bg-muted/40'

  return (
    <section className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Gauge className={`h-4 w-4 ${iconClass}`} />
          <h3 className={`text-sm font-semibold ${titleClass}`}>鼠标灵敏度</h3>
        </div>
        <span className={`text-xs font-medium ${metaClass}`}>
          {lookSensitivityLabel(clamped)} · {clamped.toFixed(1)}×
        </span>
      </div>

      <div className="flex gap-2">
        {LOOK_SENSITIVITY_PRESETS.map(preset => (
          <button
            key={preset.id}
            type="button"
            aria-pressed={clamped === preset.value}
            onClick={() => onChange(preset.value)}
            className={`flex-1 rounded-xl border px-2 py-2 text-xs font-semibold transition-all ${
              clamped === preset.value ? presetSelected : presetIdle
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <Slider
        min={MIN_LOOK_SENSITIVITY}
        max={MAX_LOOK_SENSITIVITY}
        step={0.1}
        value={[clamped]}
        onValueChange={([next]) => onChange(next)}
        aria-label="鼠标灵敏度"
      />
      <p className={`text-xs leading-5 ${hintClass}`}>
        影响视角转动速度。设置会保存到本地，下次训练自动恢复。
      </p>
    </section>
  )
}
