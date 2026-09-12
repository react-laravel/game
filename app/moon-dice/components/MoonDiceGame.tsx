'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { GameHud } from '@/components/game'
import { cn } from '@/lib/helpers'
import { MoonDiceDie } from './MoonDiceDie'
import {
  compareMoonDiceRank,
  getMoonDiceRankMeta,
  type MoonDiceRank,
  type MoonDiceRankMeta,
} from '../utils/moonDiceRules'

type Player = 'A' | 'B'

interface RoundResult {
  round: number
  dice: number[]
  rank: MoonDiceRank
  meta: MoonDiceRankMeta
}

interface PlayerState {
  name: string
  rounds: RoundResult[]
  score: number
}

const DICE_COUNT = 6

const generateDice = () =>
  Array.from({ length: DICE_COUNT }, () => Math.floor(Math.random() * 6) + 1)

interface MoonDiceGameProps {
  showAddPanel?: boolean
  setShowAddPanel?: (v: boolean) => void
  toolView?: string
  setToolView?: (v: string) => void
}

export default function MoonDiceGame(_props: MoonDiceGameProps) {
  const [currentPlayer, setCurrentPlayer] = useState<Player>('A')
  const [playerA, setPlayerA] = useState<PlayerState>({
    name: '玩家一',
    rounds: [],
    score: 0,
  })
  const [playerB, setPlayerB] = useState<PlayerState>({
    name: '玩家二',
    rounds: [],
    score: 0,
  })
  const [dice, setDice] = useState<number[]>([])
  const [rolling, setRolling] = useState(false)
  const [message, setMessage] = useState<string>('点击 “摇骰子” 开始游戏')
  const timeoutsRef = useRef<number[]>([])

  const currentPlayerState = currentPlayer === 'A' ? playerA : playerB

  const currentRoundNumber = useMemo(() => {
    if (currentPlayer === 'A') return playerA.rounds.length + 1
    return Math.max(1, playerA.rounds.length)
  }, [currentPlayer, playerA.rounds.length])

  const clearTimers = () => {
    timeoutsRef.current.forEach(id => window.clearTimeout(id))
    timeoutsRef.current = []
  }

  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [])

  const schedule = (fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay)
    timeoutsRef.current.push(id)
  }

  const handleRoll = useCallback(() => {
    if (rolling) return

    setRolling(true)
    setMessage(`${currentPlayerState.name} 正在摇骰子…`)
    setDice([])
    clearTimers()

    const finalDice = generateDice()

    finalDice.forEach((value, index) => {
      schedule(() => {
        setDice(prev => {
          const next = [...prev]
          next[index] = value
          return next
        })
      }, index * 300)
    })

    schedule(
      () => {
        const meta = getMoonDiceRankMeta(finalDice)
        const roundResult: RoundResult = {
          round: currentRoundNumber,
          dice: finalDice,
          rank: meta.rank,
          meta,
        }

        if (currentPlayer === 'A') {
          setPlayerA(prev => ({
            ...prev,
            rounds: [...prev.rounds, roundResult],
            score: Number((prev.score + meta.money).toFixed(2)),
          }))
          setMessage(`${playerA.name} 本轮：${meta.name}（${meta.money}），轮到 ${playerB.name} 了`)
          setCurrentPlayer('B')
        } else {
          setPlayerB(prev => ({
            ...prev,
            rounds: [...prev.rounds, roundResult],
            score: Number((prev.score + meta.money).toFixed(2)),
          }))

          const lastARound = playerA.rounds[playerA.rounds.length - 1]
          const compareBase = lastARound ?? null
          let roundMsg = `${playerB.name} 本轮：${meta.name}（${meta.money}）`

          if (compareBase != null) {
            const cmp = compareMoonDiceRank(compareBase.rank, meta.rank)
            if (cmp > 0) {
              roundMsg += `，本轮 ${playerB.name} 赢 🎉`
            } else if (cmp < 0) {
              roundMsg += `，本轮 ${playerA.name} 赢 🎉`
            } else {
              roundMsg += '，本轮平局'
            }
          }

          setMessage(roundMsg)
          setCurrentPlayer('A')
        }

        setRolling(false)
      },
      DICE_COUNT * 300 + 400
    )
  }, [
    rolling,
    currentPlayer,
    currentPlayerState.name,
    currentRoundNumber,
    playerA.name,
    playerA.rounds,
    playerB.name,
  ])

  const handleReset = () => {
    clearTimers()
    setRolling(false)
    setDice([])
    setCurrentPlayer('A')
    setPlayerA({ name: '玩家一', rounds: [], score: 0 })
    setPlayerB({ name: '玩家二', rounds: [], score: 0 })
    setMessage('已重置，点击 “摇骰子” 开始新一局')
  }

  const leadingPlayer =
    playerA.score === 0 && playerB.score === 0
      ? null
      : playerA.score > playerB.score
        ? playerA.name
        : playerB.score > playerA.score
          ? playerB.name
          : '平局'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className={cn(
          'relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-emerald-900/25',
          'bg-gradient-to-b from-emerald-800 via-emerald-900 to-emerald-950 shadow-inner'
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(255,255,255,0.14),transparent_55%)]" />

        <div className="relative flex min-h-0 flex-1 flex-col gap-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="border-white/15 bg-black/20 text-emerald-50/80 hover:bg-black/30 hover:text-emerald-50"
            >
              重置
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={handleRoll}
              disabled={rolling}
              className="min-w-[12rem] px-6 text-base font-bold shadow-lg"
            >
              {rolling ? '摇骰子中…' : `轮到 ${currentPlayerState.name} 摇骰子`}
            </Button>
          </div>

          <p className="rounded-full bg-black/25 px-4 py-2 text-center text-sm text-emerald-50/95">
            {message}
          </p>

          <div className="flex flex-wrap justify-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-6">
            {Array.from({ length: DICE_COUNT }).map((_, index) => (
              <MoonDiceDie key={index} value={dice[index]} rolling={rolling} />
            ))}
          </div>

          <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-2">
            {[
              { key: 'A' as const, state: playerA },
              { key: 'B' as const, state: playerB },
            ].map(({ key, state }) => (
              <GameHud
                key={key}
                className={cn(
                  'flex min-h-0 flex-col border-white/10 bg-black/25 p-4',
                  currentPlayer === key && 'ring-2 ring-primary/50'
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold tracking-wide text-emerald-100/70 uppercase">
                      {key === 'A' ? '玩家一' : '玩家二'}
                    </span>
                    {currentPlayer === key && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                        当前出手
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-emerald-100/70">
                    总额：
                    <span className="font-bold tabular-nums text-emerald-50">{state.score}</span>
                  </div>
                </div>
                <div className="mt-3 max-h-40 min-h-0 space-y-1 overflow-y-auto text-xs">
                  {state.rounds.length === 0 ? (
                    <p className="text-emerald-100/50">暂时还没有记录</p>
                  ) : (
                    state.rounds
                      .slice()
                      .reverse()
                      .map(round => (
                        <div
                          key={`${state.name}-${round.round}`}
                          className="flex items-center justify-between gap-2 rounded-xl bg-black/20 px-2 py-1.5"
                        >
                          <span className="text-[11px] text-emerald-100/60">
                            第 {round.round} 轮
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs text-emerald-50">
                              {round.dice.join(' ')}
                            </span>
                            <span className="text-[11px] text-emerald-100/60">
                              {round.meta.name}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </GameHud>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 text-center text-xs text-emerald-100/70">
            {leadingPlayer == null ? (
              <span>还没有分出高下，多摇几轮试试～</span>
            ) : leadingPlayer === '平局' ? (
              <span>双方总分目前打平。</span>
            ) : (
              <span>
                目前整体更旺的是：
                <span className="font-semibold text-emerald-50">{leadingPlayer}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
