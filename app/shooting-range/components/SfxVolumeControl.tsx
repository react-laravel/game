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
  /** Card frame + level preview for pause settings tabs */
  framed?: boolean
}

const VOLUME_BAR_HEIGHTS = [0.35, 0.55, 0.75, 1, 0.8, 0.6, 0.9, 0.5, 0.7, 0.45]

export function SfxVolumeControl({
  volume,
  muted,
  onVolumeChange,
  onMutedChange,
  compact = false,
  variant = 'default',
  hideHint = false,
  framed = false,
}: SfxVolumeControlProps) {
  const clamped = clampSfxVolume(volume)
  const onDark = variant === 'dark'
  const titleClass = onDark ? 'text-white' : 'text-foreground'
  const hintClass = onDark ? 'text-white/45' : 'text-muted-foreground'
  const metaClass = onDark ? 'text-white/55' : 'text-muted-foreground'
  const iconClass = onDark ? 'text-amber-200' : 'text-primary'
  const labelClass = onDark
    ? 'text-[10px] font-semibold tracking-[0.14em] text-white/40 uppercase'
    : 'text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase'
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
  const level = muted ? 0 : clamped

  const content = (
    <>
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

      {framed && (
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-slate-950/55">
          <div className="relative flex h-28 items-end justify-center gap-1.5 bg-[radial-gradient(circle_at_center,#2a2418_0%,#0f1218_78%)] px-8 pb-8 pt-6">
            {VOLUME_BAR_HEIGHTS.map((height, index) => (
              <div
                key={index}
                className="w-2 rounded-full bg-gradient-to-t from-amber-500/25 to-amber-300/90 transition-all duration-300"
                style={{
                  height: `${Math.max(12, height * 72 * level)}px`,
                  opacity: muted ? 0.2 : 0.35 + level * 0.65,
                }}
                aria-hidden="true"
              />
            ))}
            <span className="pointer-events-none absolute bottom-2 left-3 text-[10px] text-white/40">
              {muted ? '静音中' : `开枪 / 命中 / 未命中 · ${sfxVolumePercent(clamped)}%`}
            </span>
          </div>
          <div className="border-t border-white/8 px-3 py-1.5 text-center text-[10px] tracking-[0.16em] text-white/40 uppercase">
            实时预览 · 音量幅度
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className={labelClass}>常用预设</div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-pressed={muted}
            onClick={() => onMutedChange(!muted)}
            className={`shrink-0 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-all ${
              muted ? muteActive : muteIdle
            }`}
          >
            <div>{muted ? '取消静音' : '静音'}</div>
            <div className={`mt-0.5 text-[10px] leading-4 ${onDark ? 'text-white/45' : 'text-muted-foreground'}`}>
              一键关闭
            </div>
          </button>
          {SFX_VOLUME_PRESETS.map(preset => (
            <button
              key={preset.id}
              type="button"
              aria-pressed={!muted && clamped === preset.value}
              disabled={muted}
              onClick={() => onVolumeChange(preset.value)}
              className={`flex-1 rounded-xl border px-2 py-2.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                !muted && clamped === preset.value ? presetSelected : presetIdle
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
          <span className={`font-mono ${metaClass}`}>
            {muted ? '—' : `${sfxVolumePercent(clamped)}%`}
          </span>
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
      </div>
      {!hideHint && (
        <p className={`text-xs leading-5 ${hintClass}`}>
          控制开枪、命中与未命中提示音。设置会保存到本地，下次训练自动恢复。
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
