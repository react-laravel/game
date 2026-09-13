'use client'

import { CircleHelp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { shootingHelpSections } from '../utils/shootingHelp'

interface ShootingHelpSheetProps {
  onClose: () => void
  variant?: 'overlay' | 'panel'
}

export function ShootingHelpSheet({ onClose, variant = 'overlay' }: ShootingHelpSheetProps) {
  const isOverlay = variant === 'overlay'

  return (
    <div
      className={
        isOverlay
          ? 'absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/78 p-4 backdrop-blur-sm'
          : 'w-full'
      }
      role="dialog"
      aria-modal={isOverlay}
      aria-labelledby="shooting-help-title"
    >
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-3xl border border-white/10 bg-slate-900/96 p-5 text-white shadow-2xl ${
          isOverlay ? 'max-w-md' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10 ring-1 ring-cyan-200/20">
              <CircleHelp className="h-5 w-5 text-cyan-200" />
            </div>
            <div>
              <div className="text-xs font-semibold tracking-[0.18em] text-cyan-200/70 uppercase">
                操作说明
              </div>
              <h2 id="shooting-help-title" className="mt-1 text-lg font-black">
                射击训练帮助
              </h2>
              <p className="mt-1 text-xs leading-5 text-white/50">
                按 <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px]">?</kbd>{' '}
                可随时打开此面板。
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 border border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
            onClick={onClose}
            aria-label="关闭帮助"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-5 space-y-4">
          {shootingHelpSections.map(section => (
            <section key={section.title} className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
              <h3 className="text-sm font-semibold text-amber-100/90">{section.title}</h3>
              <ul className="mt-2 space-y-1.5 text-xs leading-5 text-white/65">
                {section.items.map(item => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-300/70" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <Button
          className="mt-5 w-full bg-amber-400 font-bold text-slate-950 hover:bg-amber-300"
          onClick={onClose}
        >
          知道了
        </Button>
      </div>
    </div>
  )
}
