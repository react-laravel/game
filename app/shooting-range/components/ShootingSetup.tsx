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
  Target,
  Trees,
} from 'lucide-react'
import styles from './ShootingSetup.module.css'
import { Button } from '@/components/ui/button'
import type { CrosshairConfig } from '../utils/crosshairConfig'
import { CrosshairSettingsSheet } from './CrosshairSettingsSheet'
import { LookSensitivityControl } from './LookSensitivityControl'
import { RecoilControl } from './RecoilControl'
import { SfxVolumeControl } from './SfxVolumeControl'
import { sfxVolumePercent } from '../utils/sfxVolume'
import type { DrillPreset } from '../utils/drillPresets'
import { drillMetaForPreset, drillPresets } from '../utils/drillPresets'
import { loadLastConfig } from '../utils/lastConfigStorage'
import { loadSessionHistory } from '../utils/statsStorage'
import type {
  OutdoorTimeOfDay,
  ShootingDifficulty,
  ShootingMapId,
  TargetShape,
  TrainingModeId,
} from '../types'
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
  const [sessionCount] = useState(() => loadSessionHistory().length)

  const selectedMode = trainingModes[modeId]
  const selectedDifficulty =
    DIFFICULTIES.find((option) => option.id === difficulty) ?? DIFFICULTIES[1]
  const selectedMap = mapOptions.find((option) => option.id === mapId)

  return (
    <div className={styles.lobby}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Crosshair size={24} />
          <span>
            RANGE<span className={styles.brandSuffix}> / 射击训练</span>
          </span>
        </div>
        <div className={styles.tools}>
          <button type="button" onClick={onViewHistory} aria-label="训练记录与进步">
            <BarChart3 size={16} />
            <span>训练记录</span>
            {sessionCount > 0 && <b>{sessionCount}</b>}
          </button>
          <button type="button" onClick={() => setShowCrosshairPanel(true)} aria-label="准星设置">
            <Crosshair size={16} />
            <span>准星设置</span>
          </button>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span /> PRECISION IS A PRACTICE
          </p>
          <h1>
            专注这一刻。
            <br />
            <span>让准星更有把握。</span>
          </h1>
          <p className={styles.intro}>
            战术射击场 / 从第一眼定位，到流畅跟枪。
            <br />
            选一项训练，在一分钟里找到自己的节奏。
          </p>
          <button
            type="button"
            className={styles.primary}
            onClick={() => onQuickStart(drillPresets[0])}
          >
            <Play size={16} fill="currentColor" />
            开始快速训练<span>60s ↗</span>
          </button>
        </div>
        <div className={styles.heroVisual} aria-hidden="true">
          <svg viewBox="0 0 640 340" fill="none">
            <path
              d="M0 40 220 136H420L640 40M0 340 220 218H420L640 340M220 136V218M420 136V218"
              stroke="currentColor"
              strokeWidth="1"
            />
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M${i * 28} ${40 + i * 19}V${340 - i * 23}M${640 - i * 28} ${40 + i * 19}V${340 - i * 23}`}
                stroke="currentColor"
                opacity=".45"
              />
            ))}
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${206 + i * 117}, ${180 + (i === 1 ? -22 : 12)})`}>
                <circle r={i === 1 ? 61 : 34} fill="#263333" stroke="#53645f" strokeWidth="7" />
                <circle r={i === 1 ? 47 : 25} fill="#e4e3d8" />
                <circle r={i === 1 ? 30 : 16} fill="#40504b" />
                <circle r={i === 1 ? 13 : 7} fill="#e99554" />
              </g>
            ))}
            <path
              d="M324 98V120M324 198V219M264 158H286M362 158H384"
              stroke="#e99554"
              strokeWidth="1.5"
            />
            <rect x="18" y="275" width="80" height="29" fill="#283633" />
            <text x="30" y="294" fill="#c0c9c1" fontSize="11" fontFamily="monospace">
              01 / FOCUS
            </text>
            <text x="484" y="297" fill="#72857b" fontSize="10" fontFamily="monospace">
              ACQUIRE. TRACK. HIT.
            </text>
          </svg>
          <span className={styles.visualLabel}>
            THE TRAINING ROOM <span>01 — 03</span>
          </span>
        </div>
      </section>

      <section className={styles.drills}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>CHOOSE YOUR PRACTICE</p>
            <h2>选择训练项目</h2>
          </div>
          <span>
            点击卡片，即刻进入训练 <span>↗</span>
          </span>
        </div>
        <div className={styles.drillGrid}>
          {drillPresets.map((preset, index) => {
            const meta = drillMetaForPreset(preset)
            return (
              <button
                key={preset.id}
                type="button"
                className={styles.drillCard}
                onClick={() => onQuickStart(preset)}
              >
                <div className={styles.cardTop}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <span>{preset.tag.toUpperCase()}</span>
                  <Play size={14} />
                </div>
                <div className={styles.drillArt} aria-hidden="true">
                  <svg viewBox="0 0 180 72" fill="none">
                    {preset.focus === 'humanoid' ? (
                      <g stroke="currentColor" strokeWidth="2">
                        <circle cx="90" cy="16" r="9" />
                        <path d="M70 65V42L64 49 58 43 70 28H110L122 43 116 49 110 42V65M83 65V47H97V65" />
                      </g>
                    ) : preset.focus === 'precision' ? (
                      [0, 1, 2].flatMap((x) =>
                        [0, 1].map((y) => (
                          <circle
                            key={`${x}-${y}`}
                            cx={65 + x * 25}
                            cy={24 + y * 25}
                            r={x === 1 && y === 0 ? 8 : 5}
                            stroke="currentColor"
                            fill={x === 1 && y === 0 ? 'currentColor' : 'none'}
                          />
                        ))
                      )
                    ) : (
                      <g stroke="currentColor">
                        <ellipse
                          cx="90"
                          cy="36"
                          rx={preset.focus === 'tracking' ? 55 : 36}
                          ry="24"
                          strokeDasharray="3 5"
                          opacity=".5"
                        />
                        <circle
                          cx={preset.focus === 'speed' ? 113 : 90}
                          cy="36"
                          r="16"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx={preset.focus === 'speed' ? 113 : 90}
                          cy="36"
                          r="5"
                          fill="currentColor"
                        />
                        <path d="M25 36H49M131 36H155" opacity=".5" />
                      </g>
                    )}
                  </svg>
                </div>
                <h3>
                  {preset.name}
                  <span>↗</span>
                </h3>
                <p>{preset.subtitle}</p>
                <footer>
                  <span>
                    {MAP_META[preset.mapId].badge} · {meta.difficulty}
                  </span>
                  <span>{meta.duration} 秒</span>
                </footer>
              </button>
            )
          })}
          <button
            type="button"
            className={styles.customCard}
            onClick={() => setShowCustom((value) => !value)}
            aria-expanded={showCustom}
          >
            <MousePointer2 size={23} />
            <h3>自定义场景与难度</h3>
            <p>你的场景、模式与手感。</p>
            <span>{showCustom ? '收起设置 −' : '配置训练 ＋'}</span>
          </button>
        </div>
      </section>
      <div className={styles.customSettings}>
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
                {DIFFICULTIES.map((option) => (
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

            <LookSensitivityControl value={lookSensitivity} onChange={onLookSensitivityChange} />

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
                {trainingModeOptions.map((option) => (
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
                {mapOptions.map((option) => {
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
      </div>
      <footer className={styles.bottomBar}>
        <div>
          <span className={styles.statusDot} />
          <span>
            {selectedMap?.name} / {selectedMode.name}
          </span>
          <span className={styles.lastConfig}>{lastConfig ? '已载入上次设置' : '准备就绪'}</span>
        </div>
        <Button onClick={onStart} className="bg-[#d98647] text-white hover:bg-[#c8783e]">
          按当前设置开始 · {selectedMode.name}
          <Play size={13} />
        </Button>
      </footer>
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

function SectionLabel({ icon: Icon, title }: { icon: typeof MapPinned; title: string }) {
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
