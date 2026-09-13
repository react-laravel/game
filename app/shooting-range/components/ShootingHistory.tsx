'use client'

import { useMemo, useState } from 'react'
import { BarChart3, Trophy, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  aggregateDailyRecords,
  aggregateMonthlyRecords,
  maxBucketValue,
  type ChartBucket,
} from '../utils/chartAggregation'
import { summarizeByMode } from '../utils/sessionInsights'
import { clearSessionHistory, loadSessionHistory } from '../utils/statsStorage'
import type { TrainingModeId } from '../types'
import { trainingModes } from '../utils/trainingModes'

interface ShootingHistoryProps {
  onClose: () => void
}

type ChartPeriod = 'daily' | 'monthly'
type ChartMetric = 'avgAccuracy' | 'avgScore'

export function ShootingHistory({ onClose }: ShootingHistoryProps) {
  const history = useMemo(() => loadSessionHistory(), [])
  const daily = useMemo(() => aggregateDailyRecords(history), [history])
  const monthly = useMemo(() => aggregateMonthlyRecords(history), [history])
  const modeSummaries = useMemo(() => summarizeByMode(history), [history])
  const [modeFilter, setModeFilter] = useState<TrainingModeId | 'all'>('all')
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('daily')
  const [chartMetric, setChartMetric] = useState<ChartMetric>('avgAccuracy')

  const latest = history[0]
  const filteredHistory =
    modeFilter === 'all' ? history : history.filter(record => record.modeId === modeFilter)
  const recentSessions = filteredHistory.slice(0, 10)

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
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center">
              <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-medium text-foreground/80">还没有训练记录</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                完成一场训练后会自动保存到本地，并生成精准度与得分曲线。
              </p>
            </div>
          )}

          {history.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                <h3 className="font-semibold">各模式最佳</h3>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {modeSummaries
                  .filter(summary => summary.sessions > 0)
                  .map(summary => {
                    const mode = trainingModes[summary.modeId]
                    return (
                      <div
                        key={summary.modeId}
                        className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold">{mode.name}</span>
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                            {mode.focus}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-muted-foreground">最佳</div>
                            <div className="font-mono text-base font-bold tabular-nums">
                              {summary.bestScore}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">均准</div>
                            <div className="font-mono text-base font-bold tabular-nums">
                              {summary.avgAccuracy}%
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">场次</div>
                            <div className="font-mono text-base font-bold tabular-nums">
                              {summary.sessions}
                            </div>
                          </div>
                        </div>
                        {summary.bestReactionMs !== null && (
                          <div className="text-muted-foreground mt-1.5 text-[11px]">
                            最快反应 {summary.bestReactionMs}ms
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            </section>
          )}

          {history.length > 0 && (
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">最近场次</h3>
                <div className="flex flex-wrap gap-1">
                  <FilterChip
                    active={modeFilter === 'all'}
                    onClick={() => setModeFilter('all')}
                    label="全部"
                  />
                  {Object.values(trainingModes).map(mode => (
                    <FilterChip
                      key={mode.id}
                      active={modeFilter === mode.id}
                      onClick={() => setModeFilter(mode.id)}
                      label={mode.focus}
                    />
                  ))}
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-border/70">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 font-medium">日期</th>
                      <th className="px-4 py-2 font-medium">模式</th>
                      <th className="px-4 py-2 font-medium">得分</th>
                      <th className="hidden px-4 py-2 font-medium sm:table-cell">精准度</th>
                      <th className="hidden px-4 py-2 font-medium md:table-cell">射速</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSessions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-muted-foreground"
                        >
                          该模式下暂无记录
                        </td>
                      </tr>
                    ) : (
                      recentSessions.map(record => (
                        <tr
                          key={record.id}
                          className="border-t border-border/50 transition-colors hover:bg-muted/20"
                        >
                          <td className="px-4 py-2.5 font-mono text-xs tabular-nums">
                            {record.date}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="font-medium">
                              {trainingModes[record.modeId].name}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono font-bold tabular-nums">
                            {record.score}
                          </td>
                          <td className="hidden px-4 py-2.5 font-mono tabular-nums sm:table-cell">
                            {record.accuracy}%
                          </td>
                          <td className="hidden px-4 py-2.5 font-mono tabular-nums md:table-cell">
                            {record.shotsPerMinute}/分
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <TrendsChartSection
            daily={daily}
            monthly={monthly}
            period={chartPeriod}
            metric={chartMetric}
            onPeriodChange={setChartPeriod}
            onMetricChange={setChartMetric}
          />

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

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
        active
          ? 'bg-primary/15 text-primary ring-1 ring-primary/25'
          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
      }`}
    >
      {label}
    </button>
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

function TrendsChartSection({
  daily,
  monthly,
  period,
  metric,
  onPeriodChange,
  onMetricChange,
}: {
  daily: ChartBucket[]
  monthly: ChartBucket[]
  period: ChartPeriod
  metric: ChartMetric
  onPeriodChange: (period: ChartPeriod) => void
  onMetricChange: (metric: ChartMetric) => void
}) {
  const buckets = period === 'daily' ? daily : monthly
  const suffix = metric === 'avgAccuracy' ? '%' : ''
  const title =
    period === 'daily'
      ? metric === 'avgAccuracy'
        ? '近 14 天精准度趋势'
        : '近 14 天得分趋势'
      : metric === 'avgAccuracy'
        ? '近 6 个月月度精准度'
        : '近 6 个月月度得分'
  const emptyHint =
    period === 'daily'
      ? metric === 'avgAccuracy'
        ? '近两周暂无数据，完成训练后这里会显示每日精准度。'
        : '近两周暂无数据，完成训练后这里会显示每日平均得分。'
      : metric === 'avgAccuracy'
        ? '近半年暂无数据，完成训练后这里会显示月度精准度。'
        : '近半年暂无数据，完成训练后这里会显示月度得分。'

  return (
    <section className="rounded-2xl border border-border/70 bg-card/50 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            value={period}
            options={[
              { value: 'daily' as ChartPeriod, label: '14 天' },
              { value: 'monthly' as ChartPeriod, label: '6 个月' },
            ]}
            onChange={onPeriodChange}
          />
          <ToggleGroup
            value={metric}
            options={[
              { value: 'avgAccuracy' as ChartMetric, label: '精准度' },
              { value: 'avgScore' as ChartMetric, label: '得分' },
            ]}
            onChange={onMetricChange}
          />
        </div>
      </div>

      <ChartPanel buckets={buckets} field={metric} suffix={suffix} emptyHint={emptyHint} />
    </section>
  )
}

function ToggleGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (value: T) => void
}) {
  return (
    <div className="flex rounded-lg border border-border/70 bg-muted/30 p-0.5">
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
            value === option.value
              ? 'bg-background text-foreground shadow-sm ring-1 ring-border/60'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function ChartPanel({
  buckets,
  field,
  suffix = '',
  emptyHint,
}: {
  buckets: ChartBucket[]
  field: 'avgAccuracy' | 'avgScore'
  suffix?: string
  emptyHint?: string
}) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const max = Math.max(1, maxBucketValue(buckets, field))
  const totalSessions = buckets.reduce((sum, bucket) => sum + bucket.sessions, 0)
  const activeBuckets = buckets.filter(bucket => bucket.sessions > 0)
  const peakValue = maxBucketValue(activeBuckets, field)
  const hoveredBucket = buckets.find(bucket => bucket.key === hoveredKey) ?? null

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2 text-xs">
        <span className="text-foreground/75">
          {totalSessions > 0 ? `共 ${totalSessions} 场` : '暂无数据'}
        </span>
        {hoveredBucket && hoveredBucket.sessions > 0 ? (
          <span className="rounded-md bg-muted/60 px-2 py-0.5 font-mono text-[11px] tabular-nums text-foreground">
            {hoveredBucket.label} · {(hoveredBucket[field] as number)}{suffix} ·{' '}
            {hoveredBucket.sessions} 场
          </span>
        ) : peakValue > 0 ? (
          <span className="text-muted-foreground text-[11px]">
            峰值 <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">{peakValue}{suffix}</span>
          </span>
        ) : null}
      </div>

      {activeBuckets.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 text-center">
          <BarChart3 className="h-6 w-6 text-muted-foreground/50" />
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {emptyHint ?? '完成训练后这里会显示趋势。'}
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between">
            {[0, 0.5, 1].map(fraction => (
              <div
                key={fraction}
                className="border-t border-border/35"
                style={{ marginTop: fraction === 0 ? 0 : undefined }}
              />
            ))}
          </div>

          <div className="mb-1 flex items-center justify-between px-0.5 text-[10px] font-medium text-foreground/55">
            <span>0{suffix}</span>
            <span>{max}{suffix}</span>
          </div>

          <div className="flex h-40 items-end gap-1.5">
            {buckets.map(bucket => {
              const value = bucket[field] as number
              const height = bucket.sessions > 0 ? Math.max(12, (value / max) * 100) : 5
              const isPeak = bucket.sessions > 0 && value === peakValue
              const isHovered = hoveredKey === bucket.key

              return (
                <div
                  key={bucket.key}
                  className="flex min-w-0 flex-1 flex-col items-center gap-1"
                  onMouseEnter={() => setHoveredKey(bucket.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  onFocus={() => setHoveredKey(bucket.key)}
                  onBlur={() => setHoveredKey(null)}
                >
                  {bucket.sessions > 0 && (
                    <span
                      className={`font-mono text-[9px] tabular-nums ${
                        isPeak
                          ? 'font-bold text-amber-600 dark:text-amber-400'
                          : isHovered
                            ? 'font-semibold text-foreground'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {value}{suffix}
                    </span>
                  )}
                  <div className="flex h-32 w-full items-end">
                    <button
                      type="button"
                      aria-label={`${bucket.label}: ${value}${suffix}，${bucket.sessions} 场`}
                      className={`w-full rounded-t-md transition-[height,box-shadow,opacity] duration-300 focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:outline-none ${
                        bucket.sessions > 0
                          ? isPeak
                            ? 'bg-gradient-to-t from-cyan-600 to-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.45)]'
                            : isHovered
                              ? 'bg-gradient-to-t from-cyan-500 to-amber-300 opacity-100'
                              : 'bg-gradient-to-t from-cyan-500/85 to-amber-300/90'
                          : 'bg-muted/45'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span
                    className={`truncate text-[10px] ${
                      isHovered
                        ? 'font-medium text-foreground'
                        : bucket.sessions > 0
                          ? 'text-foreground/70'
                          : 'text-muted-foreground/55'
                    }`}
                  >
                    {bucket.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
