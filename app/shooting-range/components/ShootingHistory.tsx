'use client'

import { useMemo } from 'react'
import { BarChart3, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  aggregateDailyRecords,
  aggregateMonthlyRecords,
  maxBucketValue,
  type ChartBucket,
} from '../utils/chartAggregation'
import { clearSessionHistory, loadSessionHistory } from '../utils/statsStorage'

interface ShootingHistoryProps {
  onClose: () => void
}

export function ShootingHistory({ onClose }: ShootingHistoryProps) {
  const history = useMemo(() => loadSessionHistory(), [])
  const daily = useMemo(() => aggregateDailyRecords(history), [history])
  const monthly = useMemo(() => aggregateMonthlyRecords(history), [history])

  const latest = history[0]

  return (
    <div className="flex w-full flex-1 items-center justify-center pb-10">
      <Card className="border-border/70 relative w-full max-w-4xl overflow-hidden p-0 shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-amber-400 to-cyan-400" />
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/10 ring-1 ring-cyan-200/20">
              <BarChart3 className="h-5 w-5 text-cyan-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold">训练记录</h2>
              <p className="text-muted-foreground text-sm">本地保存最近 {history.length} 场训练</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="关闭">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          {latest ? (
            <div className="grid gap-3 sm:grid-cols-4">
              <StatCard label="最近得分" value={`${latest.score}`} />
              <StatCard label="最近精准度" value={`${latest.accuracy}%`} />
              <StatCard label="最近射速" value={`${latest.shotsPerMinute}/分`} />
              <StatCard
                label="最近反应"
                value={latest.avgReactionMs !== null ? `${latest.avgReactionMs}ms` : '—'}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
              还没有训练记录。完成一场训练后会自动保存到本地。
            </div>
          )}

          <ChartPanel title="近 14 天精准度" buckets={daily} field="avgAccuracy" suffix="%" />
          <ChartPanel title="近 14 天得分" buckets={daily} field="avgScore" />
          <ChartPanel title="近 6 个月月度得分" buckets={monthly} field="avgScore" />

          {history.length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  clearSessionHistory()
                  onClose()
                }}
              >
                清空记录
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="mt-1 font-mono text-2xl font-bold tabular-nums">{value}</div>
    </div>
  )
}

function ChartPanel({
  title,
  buckets,
  field,
  suffix = '',
}: {
  title: string
  buckets: ChartBucket[]
  field: 'avgAccuracy' | 'avgScore' | 'totalShots'
  suffix?: string
}) {
  const max = Math.max(1, maxBucketValue(buckets, field))

  return (
    <div className="rounded-2xl border border-border/70 bg-card/50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-muted-foreground text-xs">共 {buckets.reduce((sum, bucket) => sum + bucket.sessions, 0)} 场</span>
      </div>
      <div className="flex h-36 items-end gap-1.5">
        {buckets.map(bucket => {
          const value = bucket[field] as number
          const height = bucket.sessions > 0 ? Math.max(8, (value / max) * 100) : 4
          return (
            <div key={bucket.key} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div className="flex h-28 w-full items-end">
                <div
                  className={`w-full rounded-t-md ${bucket.sessions > 0 ? 'bg-gradient-to-t from-cyan-500/80 to-amber-300/90' : 'bg-muted/50'}`}
                  style={{ height: `${height}%` }}
                  title={`${bucket.label}: ${value}${suffix}`}
                />
              </div>
              <span className="truncate text-[10px] text-muted-foreground">{bucket.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
