'use client'

import { useCallback, useEffect, useState } from 'react'
import { Crosshair, LogOut, MousePointer2, RotateCcw, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CrosshairConfig } from '../utils/crosshairConfig'
import type { MotionPreference } from '../utils/motionPrefs'
import type { OutdoorTimeOfDay, ShootingMapId, TargetShape } from '../types'
import { ShootingPauseSettingsPanel } from './ShootingPauseSettingsPanel'

export function UnsupportedShootingDevice({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-slate-950 p-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-7 text-center">
        <Crosshair className="mx-auto mb-4 h-10 w-10 text-amber-300" />
        <h2 className="text-xl font-bold">当前设备无法开始训练</h2>
        <p className="mt-3 text-sm text-white/60">{message}</p>
      </div>
    </div>
  )
}

interface ShootingReadyOverlayProps {
  onStart: () => void
  resume?: boolean
}

export function ShootingReadyOverlay({ onStart, resume = false }: ShootingReadyOverlayProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/48 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/95 p-7 text-center text-white shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 ring-1 ring-cyan-200/20">
          <Crosshair className="h-7 w-7 text-cyan-200" />
        </div>
        <div className="mt-5 text-xs font-semibold tracking-[0.22em] text-amber-300/80 uppercase">
          Tactical range
        </div>
        <h2 className="mt-2 text-2xl font-black">
          {resume ? '重新锁定鼠标' : '准备进入训练'}
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/55">
          {resume
            ? '按 ESC 后需要重新锁定鼠标才能转动视角。点击按钮或按 Enter / Space 继续瞄准。'
            : '锁定鼠标后移动瞄准，左键射击。按 ESC 可随时释放鼠标。'}
        </p>
        <Button
          className="mt-6 w-full bg-amber-400 py-5 font-bold text-slate-950 hover:bg-amber-300"
          onClick={onStart}
        >
          <MousePointer2 className="h-4 w-4" />
          {resume ? '重新锁定鼠标' : '锁定鼠标并开始'}
        </Button>
      </div>
    </div>
  )
}

interface ShootingPointerLockErrorProps {
  message: string
  onRetry: () => void
  onFallback: () => void
}

type PauseView = 'menu' | 'settings'

interface ShootingPauseOverlayProps {
  drillLabel: string
  lookSensitivity: number
  sfxVolume: number
  sfxMuted: boolean
  motionPreference: MotionPreference
  crosshairConfig: CrosshairConfig
  onCrosshairChange: (patch: Partial<CrosshairConfig>) => void
  onCrosshairReset: () => void
  onResume: () => void
  onRestart: () => void
  onExitTraining: () => void
  onChangeDrill?: () => void
  onSensitivityChange: (value: number) => void
  onSfxVolumeChange: (value: number) => void
  onSfxMutedChange: (muted: boolean) => void
  onMotionPreferenceChange: (value: MotionPreference) => void
  targetShape: TargetShape
  onTargetShapeChange: (value: TargetShape) => void
  mapId: ShootingMapId
  outdoorTimeOfDay: OutdoorTimeOfDay
  onOutdoorTimeOfDayChange: (value: OutdoorTimeOfDay) => void
}

export function ShootingPauseOverlay({
  drillLabel,
  lookSensitivity,
  sfxVolume,
  sfxMuted,
  motionPreference,
  crosshairConfig,
  onCrosshairChange,
  onCrosshairReset,
  onResume,
  onRestart,
  onExitTraining,
  onChangeDrill,
  onSensitivityChange,
  onSfxVolumeChange,
  onSfxMutedChange,
  onMotionPreferenceChange,
  targetShape,
  onTargetShapeChange,
  mapId,
  outdoorTimeOfDay,
  onOutdoorTimeOfDayChange,
}: ShootingPauseOverlayProps) {
  const [view, setView] = useState<PauseView>('menu')
  const resumeButtonId = 'shooting-pause-resume'

  const goBackToMenu = useCallback(() => {
    setView('menu')
    window.requestAnimationFrame(() => {
      document.getElementById(resumeButtonId)?.focus()
    })
  }, [resumeButtonId])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape' && view === 'settings') {
        event.preventDefault()
        event.stopPropagation()
        goBackToMenu()
        return
      }

      if (
        view === 'menu' &&
        (event.code === 'Enter' || event.code === 'Space') &&
        !event.repeat
      ) {
        event.preventDefault()
        onResume()
      }
    }

    window.addEventListener('keydown', handleKeyDown, { passive: false })
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goBackToMenu, onResume, view])

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]"
      data-testid="shooting-pause-overlay"
    >
      {view === 'menu' ? (
        <div
          className="w-full max-w-xs rounded-2xl border border-white/10 bg-slate-900/95 p-5 text-white shadow-2xl"
          data-testid="shooting-pause-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shooting-pause-title"
        >
          <div className="text-center">
            <div className="text-[10px] font-bold tracking-[0.22em] text-cyan-200/65 uppercase">
              训练暂停
            </div>
            <h2 id="shooting-pause-title" className="mt-1 text-lg font-black">
              已释放鼠标
            </h2>
            <p className="mt-1 text-xs leading-5 text-white/55">{drillLabel}</p>
          </div>

          <div className="mt-4 space-y-2">
            <Button
              id={resumeButtonId}
              className="w-full bg-amber-400 py-5 font-bold text-slate-950 hover:bg-amber-300"
              onPointerDown={event => {
                event.preventDefault()
                onResume()
              }}
            >
              <MousePointer2 className="h-4 w-4" />
              回到游戏
            </Button>
            <Button
              variant="outline"
              className="w-full border-white/15 bg-white/5 py-4 font-semibold text-white hover:bg-white/10 hover:text-white"
              onClick={() => setView('settings')}
            >
              <Settings2 className="h-4 w-4" />
              设置
            </Button>
            <Button
              variant="outline"
              className="w-full border-white/15 bg-transparent py-4 font-semibold text-white/90 hover:bg-white/10 hover:text-white"
              onClick={onExitTraining}
            >
              <LogOut className="h-4 w-4" />
              退出游戏
            </Button>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white/75"
              onClick={onRestart}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              重新开始
            </button>
          </div>

          <p className="mt-4 text-center text-[10px] leading-4 text-white/40">
            按 Enter / Space 回到游戏
          </p>
        </div>
      ) : (
        <ShootingPauseSettingsPanel
          drillLabel={drillLabel}
          crosshairConfig={crosshairConfig}
          onCrosshairChange={onCrosshairChange}
          onCrosshairReset={onCrosshairReset}
          lookSensitivity={lookSensitivity}
          onSensitivityChange={onSensitivityChange}
          sfxVolume={sfxVolume}
          sfxMuted={sfxMuted}
          onSfxVolumeChange={onSfxVolumeChange}
          onSfxMutedChange={onSfxMutedChange}
          motionPreference={motionPreference}
          onMotionPreferenceChange={onMotionPreferenceChange}
          targetShape={targetShape}
          onTargetShapeChange={onTargetShapeChange}
          mapId={mapId}
          outdoorTimeOfDay={outdoorTimeOfDay}
          onOutdoorTimeOfDayChange={onOutdoorTimeOfDayChange}
          onChangeDrill={onChangeDrill}
          onBack={goBackToMenu}
        />
      )}
    </div>
  )
}

export function ShootingPointerLockError({
  message,
  onRetry,
  onFallback,
}: ShootingPointerLockErrorProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-7 text-center text-white shadow-2xl">
        <h2 className="text-xl font-bold">无法锁定鼠标</h2>
        <p className="mt-2 text-sm text-white/55">{message}</p>
        <div className="mt-6 flex gap-3">
          <Button className="flex-1" onClick={onRetry}>
            重试
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
            onClick={onFallback}
          >
            点击目标模式
          </Button>
        </div>
      </div>
    </div>
  )
}
