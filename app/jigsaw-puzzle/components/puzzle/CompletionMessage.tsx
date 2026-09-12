import React, { memo } from 'react'
import { Button } from '@/components/ui/button'

interface CompletionMessageProps {
  startTime: Date
  bestTime: number
  onReset: () => void
}

export const CompletionMessage = memo<CompletionMessageProps>(
  ({ startTime, bestTime, onReset }) => {
    const completionTime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
    const isNewRecord = bestTime > 0 && bestTime === completionTime

    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 px-4 backdrop-blur-[3px]">
        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-950 p-7 text-center text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-amber-200/80 uppercase">
            完成
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight">🎉 恭喜完成！</h2>
          <div className="mt-3 text-sm text-white/70">
            <p>用时 {completionTime} 秒</p>
            {isNewRecord && (
              <p className="mt-1 font-medium text-amber-200">⚡ 新的最佳时间记录！</p>
            )}
          </div>
          <Button
            onClick={onReset}
            className="mt-6 w-full bg-amber-400 py-5 font-bold text-zinc-950 hover:bg-amber-300"
          >
            再玩一次
          </Button>
        </div>
      </div>
    )
  }
)

CompletionMessage.displayName = 'CompletionMessage'
