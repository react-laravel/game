'use client'

interface GameControlsProps {
  canThrow: boolean
  ballThrown: boolean
  isCharging: boolean
  chargePower: number
  currentAimAngle: number
  gyroEnabled: boolean
  onChargeStart: () => void
  onChargeEnd: () => void
}

export function GameControls({
  canThrow,
  ballThrown,
  isCharging,
  chargePower,
  currentAimAngle,
  gyroEnabled,
  onChargeStart,
  onChargeEnd,
}: GameControlsProps) {
  return (
    <>
      {canThrow && !ballThrown && (
        <>
          <div className="pointer-events-none absolute top-1/2 right-4 z-20 flex -translate-y-1/2 flex-col items-center gap-2">
            <div className="text-[10px] tracking-[0.18em] text-white/45 uppercase">力度</div>
            <div className="relative h-40 w-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="absolute inset-x-0 bottom-0 rounded-full"
                style={{
                  height: `${isCharging ? chargePower : 20}%`,
                  background:
                    chargePower < 35
                      ? 'linear-gradient(to top, #34d399, #6ee7b7)'
                      : chargePower < 75
                        ? 'linear-gradient(to top, #fbbf24, #f59e0b)'
                        : 'linear-gradient(to top, #fb7185, #ef4444)',
                }}
              />
            </div>
            <div className="font-mono text-xs text-white/70">
              {isCharging ? `${chargePower}` : gyroEnabled ? 'GYRO' : 'AIM'}
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-28 left-1/2 z-20 -translate-x-1/2 text-center">
            <div
              className="mx-auto h-24 w-px origin-bottom bg-gradient-to-t from-amber-300 to-transparent"
              style={{ transform: `rotate(${currentAimAngle}deg)` }}
            />
            <div className="mt-2 rounded-full bg-black/50 px-3 py-1 font-mono text-xs text-amber-100">
              {currentAimAngle.toFixed(0)}°
            </div>
          </div>
        </>
      )}

      {canThrow && !ballThrown && (
        <button
          type="button"
          className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-2xl border border-white/15 bg-amber-400 px-8 py-3 text-sm font-black text-zinc-950 shadow-[0_12px_40px_rgba(251,191,36,0.28)] active:scale-[0.98]"
          onMouseDown={onChargeStart}
          onMouseUp={onChargeEnd}
          onMouseLeave={onChargeEnd}
          onTouchStart={event => {
            event.preventDefault()
            onChargeStart()
          }}
          onTouchEnd={event => {
            event.preventDefault()
            onChargeEnd()
          }}
        >
          {isCharging ? `蓄力 ${chargePower}%` : '按住投球'}
        </button>
      )}

      {ballThrown && (
        <div className="pointer-events-none absolute top-24 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/55 px-4 py-2 text-xs tracking-[0.18em] text-white/70 uppercase">
          球在滚动
        </div>
      )}
    </>
  )
}
