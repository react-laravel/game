'use client'

import { ArrowLeft, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CrosshairConfig } from '../utils/crosshairConfig'
import type { MotionPreference } from '../utils/motionPrefs'
import { shootingHelpSections } from '../utils/shootingHelp'
import { CrosshairSettings } from './CrosshairSettings'
import { LookSensitivityControl } from './LookSensitivityControl'
import { RecoilControl } from './RecoilControl'
import { ReducedMotionControl } from './ReducedMotionControl'
import { SfxVolumeControl } from './SfxVolumeControl'
import { TargetShapeControl } from './TargetShapeControl'
import { OutdoorTimeOfDayControl } from './OutdoorTimeOfDayControl'
import type { OutdoorTimeOfDay, ShootingMapId, TargetShape } from '../types'

const pauseSettingsTabTriggerClass =
  'rounded-lg px-3 py-1.5 text-xs font-medium text-white/45 transition-all hover:bg-white/5 hover:text-white/70 data-[state=active]:bg-amber-400/18 data-[state=active]:font-semibold data-[state=active]:text-amber-50 data-[state=active]:shadow-[inset_0_0_0_1px_rgba(251,191,36,0.38)] data-[state=active]:ring-1 data-[state=active]:ring-amber-400/30'

interface ShootingPauseSettingsPanelProps {
  drillLabel: string
  crosshairConfig: CrosshairConfig
  onCrosshairChange: (patch: Partial<CrosshairConfig>) => void
  onCrosshairReset: () => void
  lookSensitivity: number
  onSensitivityChange: (value: number) => void
  recoilEnabled: boolean
  onRecoilEnabledChange: (enabled: boolean) => void
  sfxVolume: number
  sfxMuted: boolean
  onSfxVolumeChange: (value: number) => void
  onSfxMutedChange: (muted: boolean) => void
  motionPreference: MotionPreference
  onMotionPreferenceChange: (value: MotionPreference) => void
  targetShape: TargetShape
  onTargetShapeChange: (value: TargetShape) => void
  mapId: ShootingMapId
  outdoorTimeOfDay: OutdoorTimeOfDay
  onOutdoorTimeOfDayChange: (value: OutdoorTimeOfDay) => void
  onChangeDrill?: () => void
  onBack: () => void
}

export function ShootingPauseSettingsPanel({
  drillLabel,
  crosshairConfig,
  onCrosshairChange,
  onCrosshairReset,
  lookSensitivity,
  onSensitivityChange,
  recoilEnabled,
  onRecoilEnabledChange,
  sfxVolume,
  sfxMuted,
  onSfxVolumeChange,
  onSfxMutedChange,
  motionPreference,
  onMotionPreferenceChange,
  targetShape,
  onTargetShapeChange,
  mapId,
  outdoorTimeOfDay,
  onOutdoorTimeOfDayChange,
  onChangeDrill,
  onBack,
}: ShootingPauseSettingsPanelProps) {
  return (
    <div
      className="flex max-h-[min(90vh,34rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/96 text-white shadow-2xl"
      data-testid="shooting-pause-settings"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shooting-pause-settings-title"
    >
      <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 border border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
          onClick={onBack}
          aria-label="返回暂停菜单"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h2 id="shooting-pause-settings-title" className="text-base font-black">
            设置
          </h2>
          <p className="truncate text-xs text-white/50">{drillLabel}</p>
        </div>
      </div>

      <Tabs defaultValue="crosshair" className="flex min-h-0 flex-1 flex-col gap-0">
        <TabsList className="mx-4 mt-3 grid h-auto w-auto shrink-0 grid-cols-4 gap-1.5 rounded-xl border border-white/8 bg-slate-950/55 p-1.5">
          <TabsTrigger value="crosshair" className={pauseSettingsTabTriggerClass}>
            准星
          </TabsTrigger>
          <TabsTrigger value="sensitivity" className={pauseSettingsTabTriggerClass}>
            灵敏度
          </TabsTrigger>
          <TabsTrigger value="volume" className={pauseSettingsTabTriggerClass}>
            音量
          </TabsTrigger>
          <TabsTrigger value="other" className={pauseSettingsTabTriggerClass}>
            其他
          </TabsTrigger>
        </TabsList>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <TabsContent value="crosshair" className="mt-0">
            <CrosshairSettings
              compact
              config={crosshairConfig}
              onChange={onCrosshairChange}
              onReset={onCrosshairReset}
            />
          </TabsContent>

          <TabsContent value="sensitivity" className="mt-0">
            <LookSensitivityControl
              compact
              framed
              variant="dark"
              value={lookSensitivity}
              onChange={onSensitivityChange}
            />
          </TabsContent>

          <TabsContent value="volume" className="mt-0">
            <SfxVolumeControl
              compact
              framed
              variant="dark"
              volume={sfxVolume}
              muted={sfxMuted}
              onVolumeChange={onSfxVolumeChange}
              onMutedChange={onSfxMutedChange}
            />
          </TabsContent>

          <TabsContent value="other" className="mt-0 space-y-4">
            <TargetShapeControl
              compact
              framed
              variant="dark"
              value={targetShape}
              onChange={onTargetShapeChange}
            />

            <RecoilControl
              compact
              framed
              variant="dark"
              enabled={recoilEnabled}
              onChange={onRecoilEnabledChange}
            />

            <OutdoorTimeOfDayControl
              compact
              framed
              variant="dark"
              value={outdoorTimeOfDay}
              onChange={onOutdoorTimeOfDayChange}
              disabled={mapId !== 'outdoor'}
            />

            <ReducedMotionControl
              compact
              framed
              variant="dark"
              value={motionPreference}
              onChange={onMotionPreferenceChange}
            />

            <div className="space-y-3 rounded-2xl border border-white/8 bg-slate-950/45 p-4">
              <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40 uppercase">
                操作说明
              </div>
              <h3 className="text-sm font-semibold text-amber-100/90">快速参考</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {shootingHelpSections.map(section => (
                  <section
                    key={section.title}
                    className="rounded-xl border border-white/6 bg-slate-900/40 px-3 py-2.5"
                  >
                    <h4 className="text-xs font-semibold text-white/80">{section.title}</h4>
                    <ul className="mt-1.5 space-y-1 text-xs leading-5 text-white/55">
                      {section.items.slice(0, 2).map(item => (
                        <li key={item} className="flex gap-1.5">
                          <span className="text-cyan-300/70">·</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>

            {onChangeDrill ? (
              <Button
                type="button"
                variant="outline"
                className="w-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={onChangeDrill}
              >
                <LogOut className="h-4 w-4" />
                换训练项
              </Button>
            ) : null}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
