'use client'

import { useState, type ReactNode } from 'react'
import {
  CircleHelp,
  Crosshair,
  LogOut,
  MousePointer2,
  RotateCcw,
  Settings2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CrosshairConfig } from '../utils/crosshairConfig'
import { CrosshairSettings } from './CrosshairSettings'
import { LookSensitivityControl } from './LookSensitivityControl'
import { ReducedMotionControl } from './ReducedMotionControl'
import { SfxVolumeControl } from './SfxVolumeControl'
import { ShootingHelpSheet } from './ShootingHelpSheet'
import type { MotionPreference } from '../utils/motionPrefs'

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

type PausePanel = 'menu' | 'crosshair' | 'help'

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
}

function PauseMenuButton({
  active,
  onClick,
  icon: Icon,
  children,
  primary = false,
}: {
  active?: boolean
  onClick: () => void
  icon: typeof MousePointer2
  children: ReactNode
  primary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition-colors ${
        primary
          ? 'border-amber-300/35 bg-amber-400 text-slate-950 hover:bg-amber-300'
          : active
            ? 'border-cyan-300/35 bg-cyan-300/12 text-white'
            : 'border-white/10 bg-white/5 text-white/85 hover:border-white/20 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${primary ? 'text-slate-900' : 'text-cyan-200/80'}`} />
      <span>{children}</span>
    </button>
  )
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
}: ShootingPauseOverlayProps) {
  const [activePanel, setActivePanel] = useState<PausePanel>('menu')

  return (
    <div
      className="absolute inset-0 z-50 flex bg-slate-950/55 backdrop-blur-[2px]"
      data-testid="shooting-pause-overlay"
    >
      <aside
        className="flex h-full w-full max-w-[min(100%,20rem)] shrink-0 flex-col border-r border-white/10 bg-slate-950/92 shadow-2xl sm:max-w-[20.5rem]"
        data-testid="shooting-pause-menu"
      >
        <div className="border-b border-white/8 px-4 py-4 sm:px-5">
          <div className="text-[10px] font-bold tracking-[0.22em] text-cyan-200/65 uppercase">
            训练暂停
          </div>
          <h2 className="mt-1 text-lg font-black text-white">已释放鼠标</h2>
          <p className="mt-1 text-sm leading-5 text-white/55">{drillLabel}</p>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto overscroll-y-contain px-3 py-3 sm:px-4 sm:py-4">
          <PauseMenuButton primary icon={MousePointer2} onClick={onResume}>
            继续训练 · 重新锁定鼠标
          </PauseMenuButton>
          <PauseMenuButton icon={RotateCcw} onClick={onRestart}>
            重新开始
          </PauseMenuButton>
          {onChangeDrill ? (
            <PauseMenuButton icon={LogOut} onClick={onChangeDrill}>
              换训练项
            </PauseMenuButton>
          ) : null}
          <PauseMenuButton icon={LogOut} onClick={onExitTraining}>
            结束训练
          </PauseMenuButton>

          <div className="my-2 border-t border-white/8" />

          <PauseMenuButton
            icon={Settings2}
            active={activePanel === 'crosshair'}
            onClick={() => setActivePanel('crosshair')}
          >
            准星设置
          </PauseMenuButton>
          <PauseMenuButton
            icon={CircleHelp}
            active={activePanel === 'help'}
            onClick={() => setActivePanel('help')}
          >
            操作说明
          </PauseMenuButton>

          <div className="mt-2 space-y-3 rounded-2xl border border-white/10 bg-slate-900/55 p-3">
            <LookSensitivityControl
              compact
              variant="dark"
              value={lookSensitivity}
              onChange={onSensitivityChange}
            />
            <SfxVolumeControl
              compact
              variant="dark"
              volume={sfxVolume}
              muted={sfxMuted}
              onVolumeChange={onSfxVolumeChange}
              onMutedChange={onSfxMutedChange}
            />
            <ReducedMotionControl
              compact
              variant="dark"
              value={motionPreference}
              onChange={onMotionPreferenceChange}
            />
          </div>
        </div>

        <div className="border-t border-white/8 px-4 py-3 text-[11px] leading-5 text-white/40 sm:px-5">
          按 Enter / Space 继续瞄准 · ESC 已释放鼠标
        </div>
      </aside>

      <div className="hidden min-w-0 flex-1 overflow-y-auto p-4 sm:flex sm:p-6">
        {activePanel === 'crosshair' ? (
          <div className="my-auto w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/88 p-5 text-white shadow-xl">
            <CrosshairSettings
              compact
              config={crosshairConfig}
              onChange={onCrosshairChange}
              onReset={onCrosshairReset}
            />
          </div>
        ) : activePanel === 'help' ? (
          <div className="my-auto w-full max-w-xl">
            <ShootingHelpSheet variant="panel" onClose={() => setActivePanel('menu')} />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center px-6 text-center">
            <p className="max-w-sm text-sm leading-6 text-white/45">
              左侧菜单可继续训练、结束或调整设置。准星与操作说明会在此区域展开。
            </p>
          </div>
        )}
      </div>

      {activePanel === 'crosshair' && (
        <div className="absolute inset-x-0 bottom-0 top-[3.25rem] overflow-y-auto bg-slate-950/94 p-4 sm:hidden">
          <CrosshairSettings
            compact
            config={crosshairConfig}
            onChange={onCrosshairChange}
            onReset={onCrosshairReset}
          />
          <Button
            className="mt-4 w-full bg-amber-400 font-bold text-slate-950 hover:bg-amber-300"
            onClick={() => setActivePanel('menu')}
          >
            返回菜单
          </Button>
        </div>
      )}

      {activePanel === 'help' && (
        <div className="absolute inset-x-0 bottom-0 top-[3.25rem] overflow-y-auto bg-slate-950/94 p-4 sm:hidden">
          <ShootingHelpSheet variant="panel" onClose={() => setActivePanel('menu')} />
        </div>
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
