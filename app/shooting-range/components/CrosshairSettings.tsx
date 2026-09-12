'use client'

import type { ReactNode } from 'react'
import { Crosshair as CrosshairIcon, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  CROSSHAIR_COLOR_PRESETS,
  CROSSHAIR_STYLE_OPTIONS,
  type CrosshairConfig,
  type CrosshairStyle,
} from '../utils/crosshairConfig'
import { Crosshair } from './game/Crosshair'

interface CrosshairSettingsProps {
  config: CrosshairConfig
  onChange: (patch: Partial<CrosshairConfig>) => void
  onReset: () => void
  compact?: boolean
}

export function CrosshairSettings({
  config,
  onChange,
  onReset,
  compact = false,
}: CrosshairSettingsProps) {
  return (
    <section className={compact ? 'space-y-4' : 'mt-6 space-y-4'}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CrosshairIcon className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">准星设置</h3>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" />
          恢复默认
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-slate-950">
        <div className="relative flex h-36 items-center justify-center bg-[radial-gradient(circle_at_center,#1f3340_0%,#0b141c_72%)]">
          <Crosshair config={config} />
          <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[10px] tracking-[0.18em] text-white/35 uppercase">
            实时预览
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>样式</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CROSSHAIR_STYLE_OPTIONS.map(option => (
            <button
              key={option.id}
              type="button"
              aria-pressed={config.style === option.id}
              onClick={() => onChange({ style: option.id })}
              className={`rounded-xl border px-3 py-2 text-sm transition-all ${
                config.style === option.id
                  ? 'border-primary bg-primary/7 ring-1 ring-primary/20'
                  : 'border-border hover:border-primary/40 hover:bg-muted/40'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>颜色</Label>
        <div className="flex flex-wrap gap-2">
          {CROSSHAIR_COLOR_PRESETS.map(preset => (
            <button
              key={preset.id}
              type="button"
              aria-label={preset.label}
              aria-pressed={config.color.toLowerCase() === preset.color.toLowerCase()}
              onClick={() => onChange({ color: preset.color })}
              className={`h-8 w-8 rounded-full border-2 transition-transform ${
                config.color.toLowerCase() === preset.color.toLowerCase()
                  ? 'scale-110 border-primary'
                  : 'border-white/20'
              }`}
              style={{ backgroundColor: preset.color }}
            />
          ))}
          <label className="flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-xs">
            自定义
            <input
              type="color"
              value={config.color}
              onChange={event => onChange({ color: event.target.value })}
              className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
            />
          </label>
        </div>
      </div>

      <SliderField
        label="大小"
        value={config.size}
        min={8}
        max={28}
        onChange={value => onChange({ size: value })}
      />
      <SliderField
        label="粗细"
        value={config.thickness}
        min={1}
        max={6}
        onChange={value => onChange({ thickness: value })}
      />
      <SliderField
        label="间距"
        value={config.gap}
        min={0}
        max={14}
        onChange={value => onChange({ gap: value })}
      />
      <SliderField
        label="透明度"
        value={Math.round(config.opacity * 100)}
        min={35}
        max={100}
        suffix="%"
        onChange={value => onChange({ opacity: value / 100 })}
      />

      <div className="grid grid-cols-2 gap-2">
        <ToggleButton
          active={config.showCenterDot}
          onClick={() => onChange({ showCenterDot: !config.showCenterDot })}
          label="中心点"
        />
        <ToggleButton
          active={config.showOutline}
          onClick={() => onChange({ showOutline: !config.showOutline })}
          label="描边"
        />
      </div>
    </section>
  )
}

function Label({ children }: { children: ReactNode }) {
  return <div className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">{children}</div>
}

function SliderField({
  label,
  value,
  min,
  max,
  suffix = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  suffix?: string
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-mono text-muted-foreground">{value}{suffix}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={values => onChange(values[0] ?? value)}
      />
    </div>
  )
}

function ToggleButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-sm transition-all ${
        active
          ? 'border-primary bg-primary/7 ring-1 ring-primary/20'
          : 'border-border hover:border-primary/40 hover:bg-muted/40'
      }`}
    >
      {label}
    </button>
  )
}

export type { CrosshairStyle }
