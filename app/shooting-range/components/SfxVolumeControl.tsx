'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import {
  clampSfxVolume,
  MAX_SFX_VOLUME,
  MIN_SFX_VOLUME,
  SFX_VOLUME_PRESETS,
  sfxVolumeLabel,
  sfxVolumePercent,
} from '../utils/sfxVolume'

interface SfxVolumeControlProps {
  volume: number
  muted: boolean
  onVolumeChange: (value: number) => void
  onMutedChange: (muted: boolean) => void
  compact?: boolean
  variant?: 'default' | 'dark'
  hideHint?: boolean
}

export function SfxVolumeControl({
  volume,
  muted,
  onVolumeChange,
  onMutedChange,
  compact = false,
  variant = 'default',
  hideHint = false,
}: SfxVolumeControlProps) {
  const clamped = clampSfxVolume(volume)
  const onDark = variant === 'dark'
  const titleClass = onDark ? 'text-white' : 'text-foreground'
  const hintClass = onDark ? 'text-white/45' : 'text-muted-foreground'
  const metaClass = onDark ? 'text-white/55' : 'text-muted-foreground'
  const iconClass = onDark ? 'text-amber-200' : 'text-primary'
  const presetSelected = onDark
    ? 'border-amber-300/50 bg-amber-300/10 ring-1 ring-amber-200/25 text-white'
    : 'border-primary bg-primary/7 ring-1 ring-primary/20'
  const presetIdle = onDark
    ? 'border-white/12 text-white/75 hover:border-amber-200/35 hover:bg-white/5'
    : 'border-border hover:border-primary/40 hover:bg-muted/40'
  const muteActive = onDark
    ? 'border-rose-300/50 bg-rose-400/10 text-rose-100 ring-1 ring-rose-200/25'
    : 'border-destructive/40 bg-destructive/10 text-destructive ring-1 ring-destructive/20'
  const muteIdle = onDark
    ? 'border-white/12 text-white/75 hover:border-white/25 hover:bg-white/5'
    : 'border-border hover:border-primary/40 hover:bg-muted/40'

  return (
    <section className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {muted ? (
            <VolumeX className={`h-4 w-4 ${iconClass}`} />
          ) : (
            <Volume2 className={`h-4 w-4 ${iconClass}`} />
          )}
          <h3 className={`text-sm font-semibold ${titleClass}`}>音效音量</h3>
        </div>
        <span className={`text-xs font-medium ${metaClass}`}>
          {muted ? '已静音' : `${sfxVolumeLabel(clamped)} · ${sfxVolumePercent(clamped)}%`}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          aria-pressed={muted}
          onClick={() => onMutedChange(!muted)}
          className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
            muted ? muteActive : muteIdle
          }`}
        >
          {muted ? '取消静音' : '静音'}
        </button>
        {SFX_VOLUME_PRESETS.map(preset => (
          <button
            key={preset.id}
            type="button"
            aria-pressed={!muted && clamped === preset.value}
            disabled={muted}
            onClick={() => onVolumeChange(preset.value)}
            className={`flex-1 rounded-xl border px-2 py-2 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
              !muted && clamped === preset.value ? presetSelected : presetIdle
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <Slider
        min={MIN_SFX_VOLUME}
        max={MAX_SFX_VOLUME}
        step={0.05}
        value={[muted ? 0 : clamped]}
        onValueChange={([next]) => {
          if (muted) onMutedChange(false)
          onVolumeChange(next)
        }}
        aria-label="音效音量"
        disabled={muted}
      />
      {!hideHint && (
        <p className={`text-xs leading-5 ${hintClass}`}>
          控制开枪、命中与未命中提示音。设置会保存到本地，下次训练自动恢复。
        </p>
      )}
    </section>
  )
}
