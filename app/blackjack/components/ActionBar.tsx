'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { BET_PRESETS, MAX_BET, MIN_BET } from '../constants'
import { canDoubleDown, canSplit, getActiveHand, getHumanSeat, useBlackjackStore } from '../store'
import { emitBlackjackSfx } from '../utils/sfx'
import type { ChipDenom } from '../utils/chips'
import { Chip, ChipStack } from './Chip'
import { Loader2, RotateCcw } from 'lucide-react'

export function ActionBar() {
  const phase = useBlackjackStore(s => s.phase)
  const busy = useBlackjackStore(s => s.busy)
  const seats = useBlackjackStore(s => s.seats)
  const activeSeatIndex = useBlackjackStore(s => s.activeSeatIndex)
  const humanBetDraft = useBlackjackStore(s => s.humanBetDraft)
  const config = useBlackjackStore(s => s.config)
  const setHumanBetDraft = useBlackjackStore(s => s.setHumanBetDraft)
  const placeHumanBet = useBlackjackStore(s => s.placeHumanBet)
  const hit = useBlackjackStore(s => s.hit)
  const stand = useBlackjackStore(s => s.stand)
  const doubleDown = useBlackjackStore(s => s.doubleDown)
  const split = useBlackjackStore(s => s.split)
  const nextRound = useBlackjackStore(s => s.nextRound)
  const backToSetup = useBlackjackStore(s => s.backToSetup)

  const human = getHumanSeat(seats)
  const active = seats[activeSeatIndex]
  const activeHand = active ? getActiveHand(active) : undefined
  const isHumanTurn =
    phase === 'player_turns' &&
    !!active?.isHuman &&
    activeHand?.status === 'playing' &&
    !busy

  if (phase === 'setup') return null

  const shell =
    'shrink-0 border-t border-border/60 bg-background/95 px-3 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/80'

  const autoPlay = useBlackjackStore(s => s.autoPlay)

  if (phase === 'betting' && config.role === 'player') {
    if (autoPlay.enabled) {
      return (
        <div className={`${shell} flex items-center justify-center gap-2 text-xs`}>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-500" />
          <span className="text-muted-foreground">
            托管下注中（预设 {autoPlay.autoBet}）…
          </span>
          <Button
            size="sm"
            variant="outline"
            className="ml-2 h-7"
            onClick={() => useBlackjackStore.getState().setAutoPlay({ enabled: false })}
          >
            取消托管
          </Button>
        </div>
      )
    }

    const chipsLeft = human?.chips ?? 0
    const room = Math.max(0, Math.min(MAX_BET, chipsLeft) - humanBetDraft)

    const addChip = (value: ChipDenom) => {
      if (busy || !human) return
      if (value > room) return
      emitBlackjackSfx('chip')
      setHumanBetDraft(humanBetDraft + value)
    }

    const clearBet = () => {
      emitBlackjackSfx('click')
      setHumanBetDraft(0)
    }

    const maxBet = Math.min(MAX_BET, chipsLeft)
    // 全下：尽量用筹码面额凑满
    const allIn = () => {
      emitBlackjackSfx('chip')
      setHumanBetDraft(Math.floor(maxBet / 5) * 5)
    }

    return (
      <motion.div
        className={shell}
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      >
        <div className="mx-auto flex max-w-lg flex-col items-center gap-2">
          {/* 当前投注筹码堆 */}
          <div className="flex min-h-10 items-end justify-center gap-3">
            {humanBetDraft > 0 ? (
              <ChipStack amount={humanBetDraft} size="sm" maxVisible={8} />
            ) : (
              <span className="text-muted-foreground text-xs">点击筹码加入赌注</span>
            )}
          </div>

          {/* 筹码选择 */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {BET_PRESETS.map(value => (
              <Chip
                key={value}
                value={value}
                size="md"
                disabled={busy || !human || value > room || humanBetDraft + value > MAX_BET}
                onClick={() => addChip(value)}
              />
            ))}
          </div>

          <div className="flex w-full flex-wrap items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1"
              onClick={clearBet}
              disabled={busy || humanBetDraft <= 0}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              清空
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={allIn}
              disabled={busy || chipsLeft < MIN_BET}
            >
              全下
            </Button>
            <Button
              size="sm"
              className="min-w-28"
              onClick={placeHumanBet}
              disabled={busy || !human || humanBetDraft < MIN_BET || humanBetDraft > chipsLeft}
            >
              确认 {humanBetDraft > 0 ? humanBetDraft : ''}
            </Button>
            <Button size="sm" variant="ghost" onClick={backToSetup} disabled={busy}>
              离开
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  if (phase === 'player_turns' && config.role === 'player') {
    if (autoPlay.enabled && (isHumanTurn || (busy && active?.isHuman))) {
      return (
        <div className={`${shell} flex items-center justify-center gap-2 text-xs`}>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-500" />
          <span className="text-muted-foreground">
            托管出牌中（硬≥{autoPlay.hardStandAt}停 · 软≥{autoPlay.softStandAt}停）
          </span>
          <Button
            size="sm"
            variant="outline"
            className="ml-1 h-7"
            onClick={() => useBlackjackStore.getState().setAutoPlay({ enabled: false })}
          >
            接管
          </Button>
        </div>
      )
    }

    return (
      <motion.div
        className={shell}
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {busy && !isHumanTurn ? (
          <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            等待中…
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex flex-wrap justify-center gap-2">
              <motion.div whileTap={{ scale: 0.94 }}>
                <Button size="sm" className="min-w-16" onClick={hit} disabled={!isHumanTurn}>
                  要牌
                  <kbd className="text-primary-foreground/70 ml-1 hidden text-[10px] sm:inline">
                    H
                  </kbd>
                </Button>
              </motion.div>
              <motion.div whileTap={{ scale: 0.94 }}>
                <Button
                  size="sm"
                  className="min-w-16"
                  variant="secondary"
                  onClick={stand}
                  disabled={!isHumanTurn}
                >
                  停牌
                  <kbd className="ml-1 hidden text-[10px] opacity-70 sm:inline">S</kbd>
                </Button>
              </motion.div>
              <motion.div whileTap={{ scale: 0.94 }}>
                <Button
                  size="sm"
                  className="min-w-16"
                  variant="outline"
                  onClick={doubleDown}
                  disabled={!isHumanTurn || !canDoubleDown(human)}
                  title="加倍下注，只再拿一张牌后必须停牌"
                >
                  加倍
                  <kbd className="ml-1 hidden text-[10px] opacity-70 sm:inline">D</kbd>
                </Button>
              </motion.div>
              <motion.div whileTap={{ scale: 0.94 }}>
                <Button
                  size="sm"
                  className="min-w-16"
                  variant="outline"
                  onClick={split}
                  disabled={!isHumanTurn || !canSplit(human)}
                  title="对子可分牌，需等额筹码"
                >
                  分牌
                  <kbd className="ml-1 hidden text-[10px] opacity-70 sm:inline">P</kbd>
                </Button>
              </motion.div>
            </div>
            <p className="text-muted-foreground hidden text-[10px] sm:block">
              快捷键 H/S/D/P · Enter 确认 · A 托管 · M 静音
            </p>
          </div>
        )}
      </motion.div>
    )
  }

  if (phase === 'round_end') {
    return (
      <motion.div
        className={`${shell} flex justify-center gap-2`}
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {autoPlay.autoNextRound ? (
          <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-2 text-xs">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-500" />
            自动下一局…
            <Button size="sm" variant="outline" className="h-7" onClick={nextRound}>
              立即开始
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7"
              onClick={() =>
                useBlackjackStore.getState().setAutoPlay({ autoNextRound: false })
              }
            >
              关闭自动
            </Button>
          </div>
        ) : (
          <>
            <Button size="sm" className="min-w-24" onClick={nextRound}>
              下一局
            </Button>
            {config.role === 'dealer' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  useBlackjackStore.getState().setAutoPlay({ autoNextRound: true })
                }
              >
                自动下一局
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={backToSetup}>
              设置
            </Button>
          </>
        )}
      </motion.div>
    )
  }

  return (
    <div className={`${shell} flex items-center justify-center gap-2 text-xs`}>
      {busy ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span className="text-muted-foreground">进行中…</span>
        </>
      ) : (
        <span className="text-muted-foreground">请稍候</span>
      )}
      {config.role === 'dealer' && phase === 'betting' && (
        <Button variant="ghost" size="sm" onClick={backToSetup} className="ml-2 h-7">
          离开
        </Button>
      )}
    </div>
  )
}
