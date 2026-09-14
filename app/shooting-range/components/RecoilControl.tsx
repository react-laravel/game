'use client'

import { MoveUp } from 'lucide-react'

interface RecoilControlProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  compact?: boolean
  framed?: boolean
  variant?: 'default' | 'dark'
}

const OPTIONS = [
  { enabled: true, label: '开启', hint: '开火向上抬枪' },
  { enabled: false, label: '关闭', hint: '准星保持稳定' },
] as const

export function RecoilControl({
  enabled,
  onChange,
  compact = false,
  framed = false,
  variant = 'default',
}: RecoilControlProps) {
  const onDark = variant === 'dark'
  const titleClass = onDark ? 'text-white' : 'text-foreground'
  const hintClass = onDark ? 'text-white/45' : 'text-muted-foreground'
  const labelClass = onDark
    ? 'text-[10px] font-semibold tracking-[0.14em] text-white/40 uppercase'
    : 'text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase'
  const selected = onDark
    ? 'border-cyan-300/45 bg-cyan-300/10 ring-1 ring-cyan-200/20 text-white'
    : 'border-primary bg-primary/7 ring-1 ring-primary/20'
  const idle = onDark
    ? 'border-white/12 text-white/75 hover:border-cyan-200/35 hover:bg-white/5'
    : 'border-border hover:border-primary/40 hover:bg-muted/40'

  const content = (
    <>
      <div className="flex items-start gap-2">
        <MoveUp className={`mt-0.5 h-4 w-4 shrink-0 ${onDark ? 'text-cyan-200' : 'text-primary'}`} />
        <div>
          <div className={`text-sm font-semibold ${titleClass}`}>后坐力</div>
          {!compact && (
            <p className={`mt-0.5 text-xs leading-5 ${hintClass}`}>
              开火时准星只向上抬，然后回落。不会左右或向下乱跳。
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className={labelClass}>镜头反馈</div>
        <div className="grid grid-cols-2 gap-2">
          {OPTIONS.map(option => (
            <button
              key={option.label}
              type="button"
              aria-pressed={enabled === option.enabled}
              onClick={() => onChange(option.enabled)}
              className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                enabled === option.enabled ? selected : idle
              }`}
            >
              <div className="text-sm font-semibold">{option.label}</div>
              <div className={`mt-0.5 text-[10px] leading-4 ${hintClass}`}>{option.hint}</div>
            </button>
          ))}
        </div>
      </div>
    </>
  )

  return (
    <section
      className={
        framed
          ? 'space-y-4 rounded-2xl border border-white/8 bg-slate-950/45 p-4'
          : compact
            ? 'space-y-2.5'
            : 'space-y-3'
      }
    >
      {content}
    </section>
  )
}
