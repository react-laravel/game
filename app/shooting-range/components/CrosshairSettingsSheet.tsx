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
          : 'fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-3 backdrop-blur-[2px] sm:items-center sm:p-4'
      }
      role="dialog"
      aria-modal="true"
      aria-labelledby="crosshair-settings-title"
    >
      <div
        className={`flex max-h-[min(92dvh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-2xl sm:rounded-3xl ${
          isIngame
            ? 'border-white/10 bg-slate-900/96 text-white'
            : 'border-border/60 bg-card text-foreground'
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border/50 px-4 py-3.5 sm:px-5">
          <div className="flex items-start gap-2.5">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${
                isIngame
                  ? 'bg-cyan-300/10 ring-cyan-200/20'
                  : 'bg-primary/10 ring-primary/20'
              }`}
            >
              <CrosshairIcon className={`h-4 w-4 ${isIngame ? 'text-cyan-200' : 'text-primary'}`} />
            </div>
            <div>
              <h2 id="crosshair-settings-title" className="text-base font-black sm:text-lg">
                准星设置
              </h2>
              <p
                className={`mt-0.5 text-xs leading-5 ${
                  isIngame ? 'text-white/50' : 'text-muted-foreground'
                }`}
              >
                调整样式与颜色 · 取消不保存
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={
              isIngame
                ? 'h-8 w-8 shrink-0 border border-white/10 text-white/70 hover:bg-white/5 hover:text-white'
                : 'h-8 w-8 shrink-0'
            }
            onClick={handleCancel}
            aria-label="关闭准星设置"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <CrosshairSettings
            compact
            enhancedPreview
            config={draft}
            onChange={patch => setDraft(previous => normalizeCrosshairConfig({ ...previous, ...patch }))}
            onReset={() => setDraft(DEFAULT_CROSSHAIR_CONFIG)}
          />
        </div>

        <div
          className={`flex shrink-0 gap-2 border-t px-4 py-3 sm:px-5 ${
            isIngame ? 'border-white/8 bg-slate-950/40' : 'border-border/50 bg-muted/20'
          }`}
        >
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
