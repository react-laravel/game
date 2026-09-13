'use client'

import { Crosshair as CrosshairIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CrosshairConfig } from '../utils/crosshairConfig'
import { CrosshairSettings } from './CrosshairSettings'

interface CrosshairSettingsSheetProps {
  config: CrosshairConfig
  onChange: (patch: Partial<CrosshairConfig>) => void
  onReset: () => void
  onClose: () => void
  /** setup = light card modal; in-game = dark overlay */
  variant?: 'setup' | 'ingame'
  saveLabel?: string
}

export function CrosshairSettingsSheet({
  config,
  onChange,
  onReset,
  onClose,
  variant = 'setup',
  saveLabel = '完成',
}: CrosshairSettingsSheetProps) {
  const isIngame = variant === 'ingame'

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
                调整样式、颜色与大小，设置会保存到本地。
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
            onClick={onClose}
            aria-label="关闭准星设置"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <CrosshairSettings compact config={config} onChange={onChange} onReset={onReset} />

        <Button
          className={`mt-6 w-full font-bold ${isIngame ? 'bg-amber-400 text-slate-950 hover:bg-amber-300' : ''}`}
          onClick={onClose}
        >
          {saveLabel}
        </Button>
      </div>
    </div>
  )
}
