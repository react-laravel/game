'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { BET_PRESETS, MAX_BET, MIN_BET } from '../constants'
import { canDoubleDown, getHumanSeat, useBlackjackStore } from '../store'
import { emitBlackjackSfx } from '../utils/sfx'
import { Loader2 } from 'lucide-react'

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
  const nextRound = useBlackjackStore(s => s.nextRound)
  const backToSetup = useBlackjackStore(s => s.backToSetup)

  const human = getHumanSeat(seats)
  const active = seats[activeSeatIndex]
  const isHumanTurn =
    phase === 'player_turns' && !!active?.isHuman && active.status === 'playing' && !busy

  if (phase === 'setup') return null

  const shell =
    'shrink-0 border-t border-border/60 bg-background/95 px-3 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/80'

  if (phase === 'betting' && config.role === 'player') {
    const maxBet = human ? Math.min(MAX_BET, human.chips) : MIN_BET
    return (
      <motion.div
        className={shell}
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      >
        <div className="mx-auto flex max-w-lg flex-col items-center gap-2">
          <div className="flex flex-wrap justify-center gap-1.5">
            {BET_PRESETS.filter(p => p <= maxBet).map(p => (
              <Button
                key={p}
                size="sm"
                className="h-8 px-2.5"
                variant={humanBetDraft === p ? 'default' : 'outline'}
                onClick={() => {
                  emitBlackjackSfx('click')
                  setHumanBetDraft(p)
                }}
                disabled={busy || !human || human.chips < p}
              >
                {p}
              </Button>
            ))}
            {human && human.chips >= MIN_BET && (
              <Button
                size="sm"
                className="h-8 px-2.5"
                variant="outline"
                onClick={() => {
                  emitBlackjackSfx('click')
                  setHumanBetDraft(Math.floor(Math.min(maxBet, human.chips) / 10) * 10)
                }}
                disabled={busy}
              >
                全下
              </Button>
            )}
          </div>
          <div className="flex w-full justify-center gap-2">
            <Button
              size="sm"
              className="min-w-28"
              onClick={placeHumanBet}
              disabled={busy || !human || human.chips < MIN_BET}
            >
              下注 {humanBetDraft}
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
          <div className="flex justify-center gap-2">
            <motion.div whileTap={{ scale: 0.94 }}>
              <Button size="sm" className="min-w-20" onClick={hit} disabled={!isHumanTurn}>
                要牌
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.94 }}>
              <Button
                size="sm"
                className="min-w-20"
                variant="secondary"
                onClick={stand}
                disabled={!isHumanTurn}
              >
                停牌
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.94 }}>
              <Button
                size="sm"
                className="min-w-20"
                variant="outline"
                onClick={doubleDown}
                disabled={!isHumanTurn || !canDoubleDown(human)}
              >
                加倍
              </Button>
            </motion.div>
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
        <Button size="sm" className="min-w-24" onClick={nextRound}>
          下一局
        </Button>
        <Button size="sm" variant="ghost" onClick={backToSetup}>
          设置
        </Button>
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
