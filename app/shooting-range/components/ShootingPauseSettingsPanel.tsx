'use client'

import { ArrowLeft, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CrosshairConfig } from '../utils/crosshairConfig'
import type { MotionPreference } from '../utils/motionPrefs'
import { shootingHelpSections } from '../utils/shootingHelp'
import { CrosshairSettings } from './CrosshairSettings'
import { LookSensitivityControl } from './LookSensitivityControl'
import { ReducedMotionControl } from './ReducedMotionControl'
import { SfxVolumeControl } from './SfxVolumeControl'

interface ShootingPauseSettingsPanelProps {
  drillLabel: string
  crosshairConfig: CrosshairConfig
  onCrosshairChange: (patch: Partial<CrosshairConfig>) => void
  onCrosshairReset: () => void
  lookSensitivity: number
  onSensitivityChange: (value: number) => void
  sfxVolume: number
  sfxMuted: boolean
  onSfxVolumeChange: (value: number) => void
  onSfxMutedChange: (muted: boolean) => void
  motionPreference: MotionPreference
  onMotionPreferenceChange: (value: MotionPreference) => void
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
  sfxVolume,
  sfxMuted,
  onSfxVolumeChange,
  onSfxMutedChange,
  motionPreference,
  onMotionPreferenceChange,
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
        <TabsList className="mx-4 mt-3 h-auto w-auto shrink-0 flex-wrap justify-start gap-1 bg-white/5 p-1">
          <TabsTrigger
            value="crosshair"
            className="text-xs data-[state=active]:border-white/15 data-[state=active]:bg-white/10 data-[state=active]:text-white"
          >
            准星
          </TabsTrigger>
          <TabsTrigger
            value="sensitivity"
            className="text-xs data-[state=active]:border-white/15 data-[state=active]:bg-white/10 data-[state=active]:text-white"
          >
            灵敏度
          </TabsTrigger>
          <TabsTrigger
            value="volume"
            className="text-xs data-[state=active]:border-white/15 data-[state=active]:bg-white/10 data-[state=active]:text-white"
          >
            音量
          </TabsTrigger>
          <TabsTrigger
            value="other"
            className="text-xs data-[state=active]:border-white/15 data-[state=active]:bg-white/10 data-[state=active]:text-white"
          >
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
              variant="dark"
              value={lookSensitivity}
              onChange={onSensitivityChange}
            />
          </TabsContent>

          <TabsContent value="volume" className="mt-0">
            <SfxVolumeControl
              compact
              variant="dark"
              volume={sfxVolume}
              muted={sfxMuted}
              onVolumeChange={onSfxVolumeChange}
              onMutedChange={onSfxMutedChange}
            />
          </TabsContent>

          <TabsContent value="other" className="mt-0 space-y-4">
            <ReducedMotionControl
              compact
              variant="dark"
              value={motionPreference}
              onChange={onMotionPreferenceChange}
            />

            <div className="space-y-3 rounded-2xl border border-white/8 bg-slate-950/45 p-4">
              <h3 className="text-sm font-semibold text-amber-100/90">操作说明</h3>
              {shootingHelpSections.map(section => (
                <section key={section.title}>
                  <h4 className="text-xs font-semibold text-white/75">{section.title}</h4>
                  <ul className="mt-1.5 space-y-1 text-xs leading-5 text-white/55">
                    {section.items.slice(0, 2).map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ))}
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
