'use client'

import { Sparkles } from 'lucide-react'
import type { MotionPreference } from '../utils/motionPrefs'

const OPTIONS: Array<{ id: MotionPreference; label: string; hint: string }> = [
  { id: 'auto', label: '跟随系统', hint: '自动读取系统「减少动态效果」' },
  { id: 'reduce', label: '减弱', hint: '减少飘字、连击与枪口闪光' },
  { id: 'full', label: '完整', hint: '显示全部动效反馈' },
]

interface ReducedMotionControlProps {
  value: MotionPreference
  onChange: (value: MotionPreference) => void
  compact?: boolean
  variant?: 'default' | 'dark'
  hideHint?: boolean
}

export function ReducedMotionControl({
  value,
  onChange,
  compact = false,
  variant = 'default',
  hideHint = false,
}: ReducedMotionControlProps) {
  const onDark = variant === 'dark'
  const titleClass = onDark ? 'text-white' : 'text-foreground'
  const hintClass = onDark ? 'text-white/45' : 'text-muted-foreground'
  const selected = onDark
    ? 'border-cyan-300/45 bg-cyan-300/10 ring-1 ring-cyan-200/20 text-white'
    : 'border-primary bg-primary/7 ring-1 ring-primary/20'
  const idle = onDark
    ? 'border-white/12 text-white/75 hover:border-cyan-200/35 hover:bg-white/5'
    : 'border-border hover:border-primary/40 hover:bg-muted/40'

  return (
    <div className={compact ? 'space-y-2.5' : 'space-y-3'}>
      <div className="flex items-start gap-2">
        <Sparkles className={`mt-0.5 h-4 w-4 shrink-0 ${onDark ? 'text-cyan-200' : 'text-primary'}`} />
        <div>
          <div className={`text-sm font-semibold ${titleClass}`}>动态效果</div>
          {!hideHint && (
            <p className={`mt-0.5 text-xs leading-5 ${hintClass}`}>
              减弱得分飘字、连击提示与枪口闪光强度，枪械功能不受影响。
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(option => (
          <button
            key={option.id}
            type="button"
            title={option.hint}
            className={`rounded-xl border px-2 py-2 text-center text-xs font-semibold transition-colors ${
              value === option.id ? selected : idle
            }`}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
