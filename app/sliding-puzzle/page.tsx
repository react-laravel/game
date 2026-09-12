'use client'

import React, { useMemo, useState, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { GameHud, GameResultOverlay, GameStage } from '@/components/game'

const SlidingPuzzle = dynamic(() => import('./components/SlidingPuzzle'), {
  ssr: false,
  loading: () => <div className="p-4 text-center">加载游戏中...</div>,
})

const GAME_RULES = [
  '将打乱的数字方块移动到正确位置',
  '点击与空白方块相邻的方块可以移动它',
  '按照顺序排列所有数字即可获胜',
  '支持键盘方向键控制',
  '可以选择3×3、4×4、5×5三种难度',
  '移动次数越少分数越高',
]

function SlidingPuzzleGame() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const difficulty = useMemo(() => {
    const diffParam = searchParams.get('difficulty')
    if (!diffParam) return 3 as 3 | 4 | 5
    const level = parseInt(diffParam, 10) as 3 | 4 | 5
    return [3, 4, 5].includes(level) ? level : (3 as 3 | 4 | 5)
  }, [searchParams])
  const [gameKey, setGameKey] = useState(0)
  const [completionMessage, setCompletionMessage] = useState('')

  const updateUrlParams = (level: 3 | 4 | 5) => {
    const params = new URLSearchParams()
    params.set('difficulty', level.toString())
    router.replace(`?${params.toString()}`)
  }

  const startGame = (level: 3 | 4 | 5) => {
    setCompletionMessage('')
    setGameKey(prev => prev + 1)
    updateUrlParams(level)
  }

  const restartGame = () => {
    setCompletionMessage('')
    setGameKey(prev => prev + 1)
  }

  const handleGameComplete = () => {
    setCompletionMessage(`恭喜！你完成了 ${difficulty}×${difficulty} 的拼图！`)
  }

  return (
    <GameStage title="滑块拼图" rules={GAME_RULES} contentClassName="items-center">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <GameHud className="mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant={difficulty === 3 ? 'default' : 'outline'}
                size="sm"
                onClick={() => startGame(3)}
              >
                3×3
              </Button>
              <Button
                variant={difficulty === 4 ? 'default' : 'outline'}
                size="sm"
                onClick={() => startGame(4)}
              >
                4×4
              </Button>
              <Button
                variant={difficulty === 5 ? 'default' : 'outline'}
                size="sm"
                onClick={() => startGame(5)}
              >
                5×5
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={restartGame}>
              重新开始
            </Button>
          </div>
        </GameHud>

        <div className="relative">
          {completionMessage && (
            <p className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-300">
              {completionMessage}
            </p>
          )}

          <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/50 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-sm">
            <div key={`game-${difficulty}-${gameKey}`}>
              <SlidingPuzzle size={difficulty} onComplete={handleGameComplete} />
            </div>
          </div>

          <GameResultOverlay open={!!completionMessage} eyebrow="完成" title={completionMessage}>
            <Button
              className="mt-6 w-full bg-amber-400 py-5 font-bold text-zinc-950 hover:bg-amber-300"
              onClick={restartGame}
            >
              再玩一次
            </Button>
          </GameResultOverlay>
        </div>
      </div>
    </GameStage>
  )
}

export default function SlidingPuzzlePage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">加载中...</div>}>
      <SlidingPuzzleGame />
    </Suspense>
  )
}
