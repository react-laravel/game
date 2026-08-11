'use client'

import { Button } from '@/components/ui/button'
import { BET_PRESETS, MAX_BET, MIN_BET } from '../constants'
import { canDoubleDown, getHumanSeat, useBlackjackStore } from '../store'
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

  if (phase === 'betting' && config.role === 'player') {
    const maxBet = human ? Math.min(MAX_BET, human.chips) : MIN_BET
    return (
      <div className="bg-card/95 sticky bottom-0 z-10 space-y-3 rounded-t-2xl border p-4 shadow-lg backdrop-blur">
        <p className="text-center text-sm font-medium">选择下注金额</p>
        <div className="flex flex-wrap justify-center gap-2">
          {BET_PRESETS.filter(p => p <= maxBet).map(p => (
            <Button
              key={p}
              size="sm"
              variant={humanBetDraft === p ? 'default' : 'outline'}
              onClick={() => setHumanBetDraft(p)}
              disabled={busy || !human || human.chips < p}
            >
              {p}
            </Button>
          ))}
          {human && human.chips >= MIN_BET && (
            <Button
              size="sm"
              variant={humanBetDraft === Math.min(maxBet, human.chips) ? 'default' : 'outline'}
              onClick={() => setHumanBetDraft(Math.floor(Math.min(maxBet, human.chips) / 10) * 10)}
              disabled={busy}
            >
              全下
            </Button>
          )}
        </div>
        <div className="flex justify-center gap-3">
          <Button onClick={placeHumanBet} disabled={busy || !human || human.chips < MIN_BET}>
            确认下注 {humanBetDraft}
          </Button>
          <Button variant="outline" onClick={backToSetup} disabled={busy}>
            离开牌桌
          </Button>
        </div>
      </div>
    )
  }

  if (phase === 'player_turns' && config.role === 'player') {
    return (
      <div className="bg-card/95 sticky bottom-0 z-10 space-y-3 rounded-t-2xl border p-4 shadow-lg backdrop-blur">
        {busy && !isHumanTurn ? (
          <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            等待其他玩家 / 发牌…
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={hit} disabled={!isHumanTurn}>
              要牌
            </Button>
            <Button variant="secondary" onClick={stand} disabled={!isHumanTurn}>
              停牌
            </Button>
            <Button
              variant="outline"
              onClick={doubleDown}
              disabled={!isHumanTurn || !canDoubleDown(human)}
            >
              加倍
            </Button>
          </div>
        )}
      </div>
    )
  }

  if (phase === 'round_end') {
    return (
      <div className="bg-card/95 sticky bottom-0 z-10 flex flex-wrap justify-center gap-3 rounded-t-2xl border p-4 shadow-lg backdrop-blur">
        <Button onClick={nextRound}>下一局</Button>
        <Button variant="outline" onClick={backToSetup}>
          返回设置
        </Button>
      </div>
    )
  }

  // 发牌 / 庄家回合 / 坐庄时的下注等待
  return (
    <div className="bg-card/95 sticky bottom-0 z-10 flex items-center justify-center gap-2 rounded-t-2xl border p-4 text-sm shadow-lg backdrop-blur">
      {busy ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-muted-foreground">进行中…</span>
        </>
      ) : (
        <span className="text-muted-foreground">请稍候</span>
      )}
      {config.role === 'dealer' && phase === 'betting' && (
        <Button variant="outline" size="sm" onClick={backToSetup} className="ml-4">
          离开
        </Button>
      )}
    </div>
  )
}
