import { Crosshair, MousePointer2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

export function ShootingReadyOverlay({ onStart }: { onStart: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/48 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/95 p-7 text-center text-white shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 ring-1 ring-cyan-200/20">
          <Crosshair className="h-7 w-7 text-cyan-200" />
        </div>
        <div className="mt-5 text-xs font-semibold tracking-[0.22em] text-amber-300/80 uppercase">
          Tactical range
        </div>
        <h2 className="mt-2 text-2xl font-black">准备进入训练</h2>
        <p className="mt-2 text-sm leading-6 text-white/55">
          锁定鼠标后移动瞄准，左键射击。按 ESC 可随时释放鼠标。
        </p>
        <Button
          className="mt-6 w-full bg-amber-400 py-5 font-bold text-slate-950 hover:bg-amber-300"
          onClick={onStart}
        >
          <MousePointer2 className="h-4 w-4" />
          锁定鼠标并开始
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
