'use client'

import { Badge } from '@/components/ui/badge'
import { GameRulesDialog } from '@/components/ui/game-rules-dialog'
import { Crown, Spade } from 'lucide-react'
import { GAME_RULES } from '../constants'
import { useBlackjackStore } from '../store'
import { displayTotal } from '../utils/hand'
import { ActionBar } from './ActionBar'
import { PlayerSeat } from './PlayerSeat'
import { CardFan } from './PlayingCard'
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
      <div className="space-y-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <Spade className="h-5 w-5" />
              21 点
            </h1>
            <p className="text-muted-foreground mt-0.5 text-xs">
              坐庄 / 闲家 · 空位机器人
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
  const latestLog = log[0]

  return (
    <div className="flex h-[calc(100dvh-var(--app-header-total-height,0px)-0.75rem)] max-h-[100dvh] flex-col overflow-hidden">
      {/* 顶栏：一行 */}
      <header className="flex shrink-0 items-center justify-between gap-2 pb-1.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <Spade className="h-4 w-4 shrink-0" />
          <span className="text-sm font-bold">21 点</span>
          <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
            {config.role === 'dealer' ? (
              <span className="flex items-center gap-0.5">
                <Crown className="h-3 w-3 text-amber-500" />
                庄
              </span>
            ) : (
              '闲'
            )}
          </Badge>
          {config.role === 'dealer' && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] tabular-nums">
              {bankChips}
            </Badge>
          )}
          <Badge variant="outline" className="text-muted-foreground h-5 px-1.5 text-[10px]">
            {phaseLabel(phase)}
          </Badge>
        </div>
        <GameRulesDialog title="21 点游戏规则" rules={[...GAME_RULES]} />
      </header>

      {/* 牌桌：占满剩余高度 */}
      <div
        className={cn(
          'relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem]',
          'border border-emerald-900/30 bg-gradient-to-b from-emerald-700 via-emerald-800 to-emerald-950',
          'shadow-inner'
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,255,255,0.12),transparent_60%)]" />

        {/* 庄家 */}
        <div className="relative flex shrink-0 flex-col items-center gap-1 pt-3 pb-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-emerald-50/80">
            <Crown className="h-3.5 w-3.5 text-amber-300" />
            庄家
            {config.role === 'dealer' && (
              <span className="rounded bg-amber-400/20 px-1 text-[9px] text-amber-100">你</span>
            )}
            {dealer.cards.length > 0 && (
              <span className="ml-1 rounded-full bg-black/25 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-emerald-50">
                {dealerTotal}
              </span>
            )}
          </div>
          <div className="flex min-h-16 items-end justify-center">
            {dealer.cards.length === 0 ? (
              <span className="text-xs text-emerald-100/40">等待发牌</span>
            ) : (
              <CardFan
                cards={dealer.cards}
                hideHoleIndex={hideHole ? 1 : undefined}
                size="md"
              />
            )}
          </div>
        </div>

        {/* 消息 */}
        <div className="relative mx-auto my-1.5 max-w-[90%] shrink-0 truncate rounded-full bg-black/25 px-3 py-1 text-center text-[11px] text-emerald-50/95">
          {message}
        </div>

        {/* 弹性空白，把闲家压到桌底弧形位置 */}
        <div className="min-h-2 flex-1" />

        {/* 闲家：横向一排，均分宽度 */}
        <div className="relative flex shrink-0 items-end justify-around gap-0.5 px-1 pb-2 sm:px-3">
          {seats.map((seat, i) => (
            <PlayerSeat
              key={seat.id}
              seat={seat}
              isActive={phase === 'player_turns' && activeSeatIndex === i}
            />
          ))}
        </div>

        {/* 最新一条日志（不占大块滚动区） */}
        {latestLog && (
          <div className="relative shrink-0 truncate border-t border-white/5 px-3 py-1 text-center text-[10px] text-emerald-100/45">
            {latestLog}
          </div>
        )}
      </div>

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
      return '行动'
    case 'dealer_turn':
      return '庄家'
    case 'settlement':
      return '结算'
    case 'round_end':
      return '结束'
    default:
      return phase
  }
}
