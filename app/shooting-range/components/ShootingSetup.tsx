'use client'

import { useState, type ReactNode } from 'react'
import {
  BarChart3,
  Building2,
  ChevronDown,
  Crosshair,
  Factory,
  Gauge,
  MapPinned,
  MousePointer2,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trees,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { CrosshairConfig } from '../utils/crosshairConfig'
import { CrosshairSettingsSheet } from './CrosshairSettingsSheet'
import { LookSensitivityControl } from './LookSensitivityControl'
import { RecoilControl } from './RecoilControl'
import { SfxVolumeControl } from './SfxVolumeControl'
import { sfxVolumePercent } from '../utils/sfxVolume'
import type { DrillPreset } from '../utils/drillPresets'
import {
  drillMetaForPreset,
  drillPresets,
  isRecommendedEntryDrill,
} from '../utils/drillPresets'
import { loadLastDrillId, loadLastConfig } from '../utils/lastConfigStorage'
import { loadSessionHistory } from '../utils/statsStorage'
import type { OutdoorTimeOfDay, ShootingDifficulty, ShootingMapId, TargetShape, TrainingModeId } from '../types'
import { TargetShapeControl } from './TargetShapeControl'
import { OutdoorTimeOfDayControl } from './OutdoorTimeOfDayControl'
import { targetShapeLabel } from '../utils/targetShape'
import { outdoorTimeLabel } from '../utils/outdoorTimeOfDay'
import { mapOptions } from '../utils/mapConfigs'
import { trainingModeOptions, trainingModes } from '../utils/trainingModes'

const DIFFICULTIES: Array<{
  id: ShootingDifficulty
  name: string
  label: string
}> = [
  { id: 'easy', name: '新兵', label: '8 靶' },
  { id: 'medium', name: '精英', label: '12 靶' },
  { id: 'hard', name: '专家', label: '16 靶' },
]

const FOCUS_COLORS: Record<string, string> = {
  Flick: 'from-rose-500/20 to-orange-500/10 text-rose-200',
  Grid: 'from-cyan-500/20 to-blue-500/10 text-cyan-200',
  Track: 'from-violet-500/20 to-purple-500/10 text-violet-200',
  Strafe: 'from-amber-500/20 to-yellow-500/10 text-amber-200',
  Speed: 'from-emerald-500/20 to-green-500/10 text-emerald-200',
  Aim: 'from-sky-500/20 to-cyan-500/10 text-sky-200',
  Precision: 'from-sky-500/20 to-cyan-500/10 text-sky-200',
  Human: 'from-rose-500/20 to-fuchsia-500/10 text-rose-200',
}

const MAP_META: Record<
  ShootingMapId,
  { icon: typeof Building2; badge: string; ring: string; chip: string }
> = {
  indoor: {
    icon: Building2,
    badge: '室内',
    ring: 'ring-cyan-400/35',
    chip: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-200',
  },
  outdoor: {
    icon: Trees,
    badge: '户外',
    ring: 'ring-emerald-400/35',
    chip: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200',
  },
  warehouse: {
    icon: Factory,
    badge: '仓库',
    ring: 'ring-amber-400/35',
    chip: 'bg-amber-500/15 text-amber-700 dark:text-amber-200',
  },
}

interface ShootingSetupProps {
  difficulty: ShootingDifficulty
  mapId: ShootingMapId
  modeId: TrainingModeId
  lookSensitivity: number
  recoilEnabled: boolean
  sfxVolume: number
  sfxMuted: boolean
  onDifficultyChange: (difficulty: ShootingDifficulty) => void
  onMapChange: (mapId: ShootingMapId) => void
  onModeChange: (modeId: TrainingModeId) => void
  onLookSensitivityChange: (value: number) => void
  onRecoilEnabledChange: (enabled: boolean) => void
  onSfxVolumeChange: (value: number) => void
  onSfxMutedChange: (muted: boolean) => void
  targetShape: TargetShape
  onTargetShapeChange: (value: TargetShape) => void
  outdoorTimeOfDay: OutdoorTimeOfDay
  onOutdoorTimeOfDayChange: (value: OutdoorTimeOfDay) => void
  onStart: () => void
  onQuickStart: (preset: DrillPreset) => void
  onViewHistory: () => void
  crosshairConfig: CrosshairConfig
  onCrosshairApply: (config: CrosshairConfig) => void
}

export function ShootingSetup({
  difficulty,
  mapId,
  modeId,
  lookSensitivity,
  recoilEnabled,
  sfxVolume,
  sfxMuted,
  onDifficultyChange,
  onMapChange,
  onModeChange,
  onLookSensitivityChange,
  onRecoilEnabledChange,
  onSfxVolumeChange,
  onSfxMutedChange,
  targetShape,
  onTargetShapeChange,
  outdoorTimeOfDay,
  onOutdoorTimeOfDayChange,
  onStart,
  onQuickStart,
  onViewHistory,
  crosshairConfig,
  onCrosshairApply,
}: ShootingSetupProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [showCrosshairPanel, setShowCrosshairPanel] = useState(false)
  const [lastConfig] = useState(() => loadLastConfig())
  const [lastDrill] = useState<DrillPreset | null>(() => {
    const drillId = loadLastDrillId()
    return drillId ? (drillPresets.find(p => p.id === drillId) ?? null) : null
  })
  const [sessionCount] = useState(() => loadSessionHistory().length)

  const selectedMode = trainingModes[modeId]
  const selectedDifficulty = DIFFICULTIES.find(option => option.id === difficulty) ?? DIFFICULTIES[1]
  const selectedMap = mapOptions.find(option => option.id === mapId)

  return (
    <div className="flex w-full flex-1 items-center justify-center pb-6 sm:pb-10">
      <Card className="border-border/70 relative max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto overflow-x-hidden p-0 shadow-2xl sm:max-h-[calc(100dvh-2rem)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-amber-400 to-cyan-400" />
        <div className="grid lg:grid-cols-[0.75fr_1.65fr]">
          <div className="relative overflow-hidden bg-slate-950 p-7 text-white sm:p-8">
            <div className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 ring-1 ring-cyan-200/20">
                <Crosshair className="h-7 w-7 text-cyan-200" />
              </div>
              <p className="mt-6 text-xs font-bold tracking-[0.24em] text-amber-300 uppercase">
                Aim trainer
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">战术射击场</h1>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                一键开始专项训练，或自定义场景与难度。每场结束后自动记录成绩与进步曲线。
              </p>
              <div className="mt-7 space-y-2.5 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4 text-amber-300" />
                  快速开始 · 7 种专项训练
                </div>
                <div className="flex items-center gap-3">
                  <Gauge className="h-4 w-4 text-cyan-300" />
                  实时 FPS、精准度、反应时间
                </div>
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                  本地成绩评级与历史曲线
                </div>
              </div>
              <div className="mt-7 flex flex-col gap-2">
                {lastDrill && (
                  <Button
                    className="justify-start bg-amber-400/90 font-bold text-slate-950 hover:bg-amber-300"
                    onClick={() => onQuickStart(lastDrill)}
                  >
                    <RotateCcw className="h-4 w-4" />
                    再来一局 · {lastDrill.name}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="justify-start border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  onClick={onViewHistory}
                >
                  <BarChart3 className="h-4 w-4" />
                  训练记录与进步
                </Button>
                <Button
                  variant="outline"
                  className="justify-start border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  onClick={() => setShowCrosshairPanel(true)}
                >
                  <Crosshair className="h-4 w-4" />
                  准星设置
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-primary text-xs font-bold tracking-[0.18em] uppercase">
                  Quick start
                </p>
                <h2 className="mt-1 text-2xl font-bold">选择训练项目</h2>
              </div>
              <span className="text-muted-foreground text-xs">点击即开始</span>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {drillPresets.map(preset => {
                const mapMeta = MAP_META[preset.mapId]
                const MapIcon = mapMeta.icon
                const meta = drillMetaForPreset(preset)
                const recommended = isRecommendedEntryDrill(preset, sessionCount)
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onQuickStart(preset)}
                    className={`group rounded-2xl border border-border bg-gradient-to-br from-muted/30 to-transparent p-3.5 text-left transition-all hover:border-primary/50 hover:shadow-md hover:ring-1 ${mapMeta.ring} ${
                      recommended ? 'ring-1 ring-amber-400/40' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {recommended && (
                          <span className="rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-200">
                            推荐入门
                          </span>
                        )}
                        <span
                          className={`rounded-lg bg-gradient-to-br px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${FOCUS_COLORS[preset.tag] ?? 'bg-muted text-muted-foreground'}`}
                        >
                          {preset.tag}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${mapMeta.chip}`}
                        >
                          <MapIcon className="h-3 w-3" />
                          {mapMeta.badge}
                        </span>
                      </div>
                      <Play className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <div className="mt-2 font-bold">{preset.name}</div>
                    <div className="text-muted-foreground mt-0.5 text-xs leading-5">
                      {preset.subtitle}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-md bg-muted/70 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {meta.duration}s
                      </span>
                      <span className="rounded-md bg-muted/70 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {meta.difficulty}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              className="mt-5 flex w-full items-center justify-between rounded-xl border border-border/80 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted/40"
              onClick={() => setShowCustom(value => !value)}
              aria-expanded={showCustom}
            >
              <span className="flex items-center gap-2">
                <MousePointer2 className="h-4 w-4 text-primary" />
                自定义场景与难度
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${showCustom ? 'rotate-180' : ''}`}
              />
            </button>

            {showCustom && (
              <div className="mt-4 space-y-5 border-t border-border/60 pt-5">
                <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3">
                  <div className="text-[10px] font-bold tracking-[0.18em] text-primary uppercase">
                    当前自定义配置
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {selectedMode.name} · {selectedMap?.name} · {selectedDifficulty.name}
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs leading-5">
                    {selectedDifficulty.label} · {targetShapeLabel(targetShape)}
                    {mapId === 'outdoor' ? ` · ${outdoorTimeLabel(outdoorTimeOfDay)}` : ''} · 灵敏度{' '}
                    {lookSensitivity.toFixed(1)}× · 后坐力 {recoilEnabled ? '开启' : '关闭'} · 音效{' '}
                    {sfxMuted ? '静音' : `${sfxVolumePercent(sfxVolume)}%`}
                  </div>
                </div>

                <section>
                  <SectionLabel icon={Gauge} title="难度" />
                  <p className="text-muted-foreground mt-1 text-xs leading-5">
                    难度决定同屏靶位数量与移动速度，越高越考验跟枪与切换。
                  </p>
                  <div className="mt-2 flex gap-2">
                    {DIFFICULTIES.map(option => (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={difficulty === option.id}
                        onClick={() => onDifficultyChange(option.id)}
                        className={`flex-1 rounded-xl border px-3 py-3 text-center transition-all ${
                          difficulty === option.id
                            ? 'border-primary bg-primary/7 ring-1 ring-primary/20'
                            : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <div className="font-bold text-sm">{option.name}</div>
                        <div className="text-muted-foreground text-[10px]">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </section>

                <LookSensitivityControl
                  value={lookSensitivity}
                  onChange={onLookSensitivityChange}
                />

                <RecoilControl enabled={recoilEnabled} onChange={onRecoilEnabledChange} />

                <SfxVolumeControl
                  volume={sfxVolume}
                  muted={sfxMuted}
                  onVolumeChange={onSfxVolumeChange}
                  onMutedChange={onSfxMutedChange}
                />

                <TargetShapeControl value={targetShape} onChange={onTargetShapeChange} />

                <section>
                  <SectionLabel icon={Target} title="训练模式" />
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {trainingModeOptions.map(option => (
                      <OptionCard
                        key={option.id}
                        selected={modeId === option.id}
                        title={option.name}
                        badge={option.focus}
                        detail={option.description}
                        onClick={() => onModeChange(option.id)}
                      />
                    ))}
                  </div>
                </section>

                <section>
                  <SectionLabel icon={MapPinned} title="场景" />
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {mapOptions.map(option => {
                      const mapMeta = MAP_META[option.id]
                      const MapIcon = mapMeta.icon
                      return (
                        <OptionCard
                          key={option.id}
                          selected={mapId === option.id}
                          title={option.name}
                          badge={mapMeta.badge}
                          detail={option.description}
                          icon={<MapIcon className="h-4 w-4" />}
                          accentClass={mapMeta.chip}
                          onClick={() => onMapChange(option.id)}
                        />
                      )
                    })}
                  </div>
                </section>

                <OutdoorTimeOfDayControl
                  value={outdoorTimeOfDay}
                  onChange={onOutdoorTimeOfDayChange}
                  disabled={mapId !== 'outdoor'}
                />

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-border/80 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted/40"
                  onClick={() => setShowCrosshairPanel(true)}
                >
                  <span className="flex items-center gap-2">
                    <Crosshair className="h-4 w-4 text-primary" />
                    准星设置
                  </span>
                  <span className="text-muted-foreground text-xs">打开面板</span>
                </button>
              </div>
            )}

            <Button className="mt-5 w-full py-5 text-base font-bold" onClick={onStart}>
              按当前设置开始 · {selectedMode.name}
            </Button>
            {lastConfig && !showCustom && (
              <p className="text-muted-foreground mt-2 text-center text-xs">
                上次：{trainingModes[lastConfig.modeId].name} ·{' '}
                {mapOptions.find(m => m.id === lastConfig.mapId)?.name}
              </p>
            )}
          </div>
        </div>
      </Card>

      {showCrosshairPanel && (
        <CrosshairSettingsSheet
          config={crosshairConfig}
          onApply={onCrosshairApply}
          onClose={() => setShowCrosshairPanel(false)}
          applyLabel="应用并关闭"
        />
      )}
    </div>
  )
}

function SectionLabel({
  icon: Icon,
  title,
}: {
  icon: typeof MapPinned
  title: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
  )
}

function OptionCard({
  selected,
  title,
  badge,
  detail,
  icon,
  accentClass,
  onClick,
}: {
  selected: boolean
  title: string
  badge?: string
  detail: string
  icon?: ReactNode
  accentClass?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-2xl border p-3 text-left transition-all ${
        selected
          ? 'border-primary bg-primary/7 ring-1 ring-primary/20'
          : 'border-border hover:border-primary/40 hover:bg-muted/40'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {icon && (
          <span
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accentClass ?? 'bg-muted text-muted-foreground'}`}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold">{title}</span>
            {badge && (
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${accentClass ?? 'bg-muted text-muted-foreground'}`}
              >
                {badge}
              </span>
            )}
          </div>
          <div className="text-muted-foreground mt-1 text-xs leading-5">{detail}</div>
        </div>
      </div>
    </button>
  )
}
