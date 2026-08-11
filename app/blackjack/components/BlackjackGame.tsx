'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GameRulesDialog } from '@/components/ui/game-rules-dialog'
import { Crown, Spade } from 'lucide-react'
import { GAME_RULES } from '../constants'
import { useBlackjackStore } from '../store'
import { displayTotal } from '../utils/hand'
import { ActionBar } from './ActionBar'
import { PlayerSeat } from './PlayerSeat'
import { PlayingCard } from './PlayingCard'
import { SetupScreen } from './SetupScreen'
import { cn } from '@/lib/helpers'

export default function BlackjackGame() {
  const phase = useBlackjackStore(s => s.phase)
  const seats = useBlackjackStore(s => s.seats)
  const dealer = useBlackjackStore(s => s.dealer)
  const bankChips = useBlackjackStore(s => s.bankChips)
  const config = useBlackjackStore(s => s.config)
  const message = useBlackjackStore(s => s.message)
  const log = useBlackjackStore(s => s.log)
  const activeSeatIndex = useBlackjackStore(s => s.activeSeatIndex)

  if (phase === 'setup') {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Spade className="h-6 w-6" />
              21 点
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              标准赌场规则 · 可选坐庄或闲家 · 空位机器人补齐
            </p>
          </div>
          <GameRulesDialog title="21 点游戏规则" rules={[...GAME_RULES]} />
        </div>
        <SetupScreen />
      </div>
    )
  }

  const hideHole = !dealer.holeRevealed && dealer.cards.length >= 2
  const dealerTotal = displayTotal(dealer.cards, hideHole)

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col gap-4 pb-28">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Spade className="h-6 w-6" />
            21 点
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {config.role === 'dealer' ? (
                <>
                  <Crown className="mr-1 h-3 w-3 text-amber-500" />
                  你坐庄
                </>
              ) : (
                '你是闲家'
              )}
            </Badge>
            {config.role === 'dealer' && (
              <Badge variant="secondary" className="tabular-nums">
                庄家筹码 {bankChips}
              </Badge>
            )}
            <Badge variant="outline" className="text-muted-foreground">
              {phaseLabel(phase)}
            </Badge>
          </div>
        </div>
        <GameRulesDialog title="21 点游戏规则" rules={[...GAME_RULES]} />
      </div>

      {/* 牌桌 */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-900/20 bg-gradient-to-b from-emerald-800 to-emerald-950 p-4 shadow-inner sm:p-6">
        <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15),transparent_65%)]" />

        {/* 庄家区 */}
        <div className="relative mb-6">
          <div className="mb-2 flex items-center justify-between text-emerald-50/90">
            <span className="flex items-center gap-1.5 text-sm font-semibold tracking-wide">
              <Crown className="h-4 w-4 text-amber-300" />
              庄家
              {config.role === 'dealer' && (
                <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] text-amber-100">
                  你
                </span>
              )}
            </span>
            <span className="text-sm tabular-nums text-emerald-100/90">{dealerTotal}</span>
          </div>
          <div className="flex min-h-[5.5rem] flex-wrap gap-1.5">
            {dealer.cards.length === 0 ? (
              <span className="text-sm text-emerald-100/50">等待发牌</span>
            ) : (
              dealer.cards.map((c, i) => (
                <PlayingCard
                  key={c.id}
                  card={c}
                  faceDown={hideHole && i === 1}
                />
              ))
            )}
          </div>
        </div>

        {/* 桌面消息 */}
        <div
          className={cn(
            'relative mb-6 rounded-lg border border-emerald-400/20 bg-black/20 px-3 py-2 text-center text-sm text-emerald-50',
            'backdrop-blur-sm'
          )}
        >
          {message}
        </div>

        {/* 闲家区 */}
        <div
          className={cn(
            'relative grid gap-3',
            seats.length === 1 && 'grid-cols-1 max-w-sm mx-auto',
            seats.length === 2 && 'grid-cols-1 sm:grid-cols-2',
            seats.length >= 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'
          )}
        >
          {seats.map((seat, i) => (
            <PlayerSeat
              key={seat.id}
              seat={seat}
              isActive={phase === 'player_turns' && activeSeatIndex === i}
              compact={seats.length >= 3}
            />
          ))}
        </div>
      </div>

      {/* 日志 */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">牌局记录</CardTitle>
        </CardHeader>
        <CardContent className="max-h-36 space-y-1 overflow-y-auto pt-0 text-sm">
          {log.length === 0 ? (
            <p className="text-muted-foreground">暂无记录</p>
          ) : (
            log.map((line, i) => (
              <p key={`${i}-${line}`} className="text-muted-foreground">
                {line}
              </p>
            ))
          )}
        </CardContent>
      </Card>

      <ActionBar />
    </div>
  )
}

function phaseLabel(phase: string): string {
  switch (phase) {
    case 'betting':
      return '下注'
    case 'dealing':
      return '发牌'
    case 'player_turns':
      return '闲家行动'
    case 'dealer_turn':
      return '庄家行动'
    case 'settlement':
      return '结算'
    case 'round_end':
      return '本局结束'
    default:
      return phase
  }
}
