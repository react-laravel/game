'use client'

import { useState } from 'react'
import { Crosshair as CrosshairIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DEFAULT_CROSSHAIR_CONFIG,
  normalizeCrosshairConfig,
  type CrosshairConfig,
} from '../utils/crosshairConfig'
import { CrosshairSettings } from './CrosshairSettings'

interface CrosshairSettingsSheetProps {
  config: CrosshairConfig
  onApply: (config: CrosshairConfig) => void
  onClose: () => void
  /** setup = light card modal; in-game = dark overlay */
  variant?: 'setup' | 'ingame'
  applyLabel?: string
}

export function CrosshairSettingsSheet({
  config,
  onApply,
  onClose,
  variant = 'setup',
  applyLabel = '应用',
}: CrosshairSettingsSheetProps) {
  const isIngame = variant === 'ingame'
  const [draft, setDraft] = useState<CrosshairConfig>(() => normalizeCrosshairConfig(config))

  const handleApply = () => {
    onApply(draft)
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <div
      className={
        isIngame
          ? 'absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/78 p-4 backdrop-blur-sm'
          : 'fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm'
      }
      role="dialog"
      aria-modal="true"
      aria-labelledby="crosshair-settings-title"
    >
      <div
        className={`max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border p-5 shadow-2xl sm:p-6 ${
          isIngame
            ? 'border-white/10 bg-slate-900/96 text-white'
            : 'border-border/70 bg-card text-foreground'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${
                isIngame
                  ? 'bg-cyan-300/10 ring-cyan-200/20'
                  : 'bg-primary/10 ring-primary/20'
              }`}
            >
              <CrosshairIcon className={`h-5 w-5 ${isIngame ? 'text-cyan-200' : 'text-primary'}`} />
            </div>
            <div>
              <div
                className={`text-xs font-semibold tracking-[0.18em] uppercase ${
                  isIngame ? 'text-cyan-200/70' : 'text-primary'
                }`}
              >
                准星
              </div>
              <h2 id="crosshair-settings-title" className="mt-1 text-lg font-black">
                准星设置
              </h2>
              <p className={`mt-1 text-xs leading-5 ${isIngame ? 'text-white/50' : 'text-muted-foreground'}`}>
                调整样式、颜色与大小。应用后保存到本地，取消则丢弃未保存的更改。
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={
              isIngame
                ? 'shrink-0 border border-white/10 text-white/70 hover:bg-white/5 hover:text-white'
                : 'shrink-0'
            }
            onClick={handleCancel}
            aria-label="关闭准星设置"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <CrosshairSettings
          compact
          enhancedPreview
          config={draft}
          onChange={patch => setDraft(previous => normalizeCrosshairConfig({ ...previous, ...patch }))}
          onReset={() => setDraft(DEFAULT_CROSSHAIR_CONFIG)}
        />

        <div className="mt-6 flex gap-2">
          <Button
            type="button"
            variant="outline"
            className={`flex-1 font-semibold ${
              isIngame
                ? 'border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white'
                : ''
            }`}
            onClick={handleCancel}
          >
            取消
          </Button>
          <Button
            type="button"
            className={`flex-1 font-bold ${isIngame ? 'bg-amber-400 text-slate-950 hover:bg-amber-300' : ''}`}
            onClick={handleApply}
          >
            {applyLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
