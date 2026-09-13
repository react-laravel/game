import { Crosshair, LogOut, MousePointer2, RotateCcw, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LookSensitivityControl } from './LookSensitivityControl'
import { SfxVolumeControl } from './SfxVolumeControl'

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

interface ShootingPauseOverlayProps {
  drillLabel: string
  lookSensitivity: number
  sfxVolume: number
  sfxMuted: boolean
  onResume: () => void
  onRestart: () => void
  onChangeDrill?: () => void
  onCrosshairSettings?: () => void
  onSensitivityChange: (value: number) => void
  onSfxVolumeChange: (value: number) => void
  onSfxMutedChange: (muted: boolean) => void
}

export function ShootingPauseOverlay({
  drillLabel,
  lookSensitivity,
  sfxVolume,
  sfxMuted,
  onResume,
  onRestart,
  onChangeDrill,
  onCrosshairSettings,
  onSensitivityChange,
  onSfxVolumeChange,
  onSfxMutedChange,
}: ShootingPauseOverlayProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/72 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-slate-900/96 p-6 text-white shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-300/10 ring-1 ring-amber-200/20">
            <Crosshair className="h-6 w-6 text-amber-200" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-[0.2em] text-cyan-200/70 uppercase">
              训练暂停
            </div>
            <h2 className="mt-1 text-xl font-black">已释放鼠标</h2>
            <p className="mt-1 text-sm leading-6 text-white/55">{drillLabel}</p>
            <p className="mt-2 text-xs leading-5 text-white/45">
              按 ESC 或点击「继续训练」可重新锁定鼠标。下方可调整灵敏度或返回设置。
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <Button
            className="w-full bg-amber-400 py-5 font-bold text-slate-950 hover:bg-amber-300"
            onClick={onResume}
          >
            <MousePointer2 className="h-4 w-4" />
            继续训练
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              onClick={onRestart}
            >
              <RotateCcw className="h-4 w-4" />
              重新开始
            </Button>
            {onChangeDrill ? (
              <Button
                variant="outline"
                className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                onClick={onChangeDrill}
              >
                <LogOut className="h-4 w-4" />
                换训练项
              </Button>
            ) : (
              <Button
                variant="outline"
                className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                onClick={onCrosshairSettings}
              >
                <Settings2 className="h-4 w-4" />
                准星设置
              </Button>
            )}
          </div>
          {onChangeDrill && onCrosshairSettings && (
            <Button
              variant="ghost"
              className="w-full border border-white/10 text-white/75 hover:bg-white/5 hover:text-white"
              onClick={onCrosshairSettings}
            >
              <Settings2 className="h-4 w-4" />
              准星设置
            </Button>
          )}
        </div>

        <div className="mt-5 space-y-4 rounded-2xl border border-white/10 bg-slate-950/55 p-4">
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
        </div>
      </div>
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
