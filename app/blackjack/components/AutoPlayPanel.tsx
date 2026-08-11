'use client'

import { useState } from 'react'
import { Bot, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { BET_PRESETS } from '../constants'
import { useBlackjackStore } from '../store'
import { describeAutoPlayRules, type AutoPlayConfig } from '../utils/autoPlay'
import { emitBlackjackSfx } from '../utils/sfx'
import { cn } from '@/lib/helpers'

const POINT_OPTIONS = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21] as const

export function AutoPlayPanel({ compact }: { compact?: boolean }) {
  const autoPlay = useBlackjackStore(s => s.autoPlay)
  const setAutoPlay = useBlackjackStore(s => s.setAutoPlay)
  const toggleAutoPlay = useBlackjackStore(s => s.toggleAutoPlay)
  const [open, setOpen] = useState(false)

  const patch = (partial: Partial<AutoPlayConfig>) => {
    emitBlackjackSfx('click')
    setAutoPlay(partial)
  }

  return (
    <div className="flex items-center gap-0.5">
      <Button
        type="button"
        size={compact ? 'sm' : 'default'}
        variant={autoPlay.enabled ? 'default' : 'outline'}
        className={cn(compact && 'h-8 gap-1 px-2 text-xs')}
        onClick={() => {
          emitBlackjackSfx('click')
          toggleAutoPlay()
        }}
        title={autoPlay.enabled ? '关闭托管' : '开启托管'}
      >
        <Bot className={cn('h-4 w-4', compact && 'h-3.5 w-3.5')} />
        {autoPlay.enabled ? '托管中' : '托管'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(compact ? 'h-8 w-8' : 'h-9 w-9')}
            title="托管规则"
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85dvh] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              托管规则
            </DialogTitle>
          </DialogHeader>

          <p className="text-muted-foreground text-xs leading-relaxed">
            {describeAutoPlayRules(autoPlay)}
          </p>

          <div className="space-y-4 pt-1">
            <ToggleRow
              label="启用托管"
              description="自动下注与出牌，可随时关闭"
              checked={autoPlay.enabled}
              onChange={v => patch({ enabled: v })}
            />

            <PointRow
              label="硬牌停牌点"
              hint={`点数 ≥ ${autoPlay.hardStandAt} 不加牌；低于则要牌`}
              value={autoPlay.hardStandAt}
              onChange={v => patch({ hardStandAt: v })}
            />

            <PointRow
              label="软牌停牌点"
              hint={`软牌（含 A）≥ ${autoPlay.softStandAt} 停；低于则要。设 17 则软 17 也不加`}
              value={autoPlay.softStandAt}
              onChange={v => patch({ softStandAt: v })}
            />

            <ToggleRow
              label="允许加倍"
              description={`硬牌 ${autoPlay.doubleHardMin}–${autoPlay.doubleHardMax} 点时加倍`}
              checked={autoPlay.allowDouble}
              onChange={v => patch({ allowDouble: v })}
            />

            {autoPlay.allowDouble && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1.5 text-sm font-medium">加倍下限</p>
                  <div className="flex flex-wrap gap-1">
                    {[9, 10, 11].map(n => (
                      <Button
                        key={n}
                        type="button"
                        size="sm"
                        variant={autoPlay.doubleHardMin === n ? 'default' : 'outline'}
                        className="h-8 w-10 px-0"
                        onClick={() =>
                          patch({
                            doubleHardMin: n,
                            doubleHardMax: Math.max(n, autoPlay.doubleHardMax),
                          })
                        }
                      >
                        {n}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-medium">加倍上限</p>
                  <div className="flex flex-wrap gap-1">
                    {[9, 10, 11].map(n => (
                      <Button
                        key={n}
                        type="button"
                        size="sm"
                        variant={autoPlay.doubleHardMax === n ? 'default' : 'outline'}
                        className="h-8 w-10 px-0"
                        onClick={() =>
                          patch({
                            doubleHardMax: n,
                            doubleHardMin: Math.min(n, autoPlay.doubleHardMin),
                          })
                        }
                      >
                        {n}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className="mb-1.5 text-sm font-medium">自动下注</p>
              <p className="text-muted-foreground mb-2 text-xs">托管时每局固定押注</p>
              <div className="flex flex-wrap gap-1.5">
                {BET_PRESETS.map(n => (
                  <Button
                    key={n}
                    type="button"
                    size="sm"
                    variant={autoPlay.autoBet === n ? 'default' : 'outline'}
                    className="h-8 min-w-11"
                    onClick={() => patch({ autoBet: n })}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>

            <ToggleRow
              label="自动下一局"
              description="结算后短暂停留，自动开下一局"
              checked={autoPlay.autoNextRound}
              onChange={v => patch({ autoNextRound: v })}
            />

            <div className="bg-muted/50 rounded-lg p-3 text-xs leading-relaxed">
              <p className="mb-1 font-medium">示例（当前规则）</p>
              <ul className="text-muted-foreground list-inside list-disc space-y-0.5">
                <li>硬 16 → 要牌；硬 {autoPlay.hardStandAt} → 停牌</li>
                <li>
                  软 17（A+6）→{' '}
                  {autoPlay.softStandAt > 17 ? '要牌' : '停牌'}
                </li>
                <li>
                  硬 11 →{' '}
                  {autoPlay.allowDouble &&
                  autoPlay.doubleHardMin <= 11 &&
                  autoPlay.doubleHardMax >= 11
                    ? '加倍'
                    : autoPlay.hardStandAt > 11
                      ? '要牌'
                      : '停牌'}
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <Button
        type="button"
        size="sm"
        variant={checked ? 'default' : 'outline'}
        className="shrink-0"
        onClick={() => onChange(!checked)}
      >
        {checked ? '开' : '关'}
      </Button>
    </div>
  )
}

function PointRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <p className="mb-0.5 text-sm font-medium">{label}</p>
      <p className="text-muted-foreground mb-2 text-xs">{hint}</p>
      <div className="flex flex-wrap gap-1">
        {POINT_OPTIONS.map(n => (
          <Button
            key={n}
            type="button"
            size="sm"
            variant={value === n ? 'default' : 'outline'}
            className="h-8 w-9 px-0"
            onClick={() => onChange(n)}
          >
            {n}
          </Button>
        ))}
      </div>
    </div>
  )
}
