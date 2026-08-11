'use client'

import { Badge } from '@/components/ui/badge'
import { Bot, User, Crown } from 'lucide-react'
import type { Seat } from '../types'
import { displayTotal } from '../utils/hand'
import { PlayingCard } from './PlayingCard'
import { cn } from '@/lib/helpers'

interface PlayerSeatProps {
  seat: Seat
  isActive?: boolean
  compact?: boolean
}

const resultLabel: Record<string, string> = {
  win: '赢',
  lose: '输',
  push: '平',
  blackjack: '黑杰克',
}

const resultClass: Record<string, string> = {
  win: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  lose: 'bg-red-500/15 text-red-700 dark:text-red-300',
  push: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  blackjack: 'bg-yellow-500/20 text-yellow-800 dark:text-yellow-200',
}

export function PlayerSeat({ seat, isActive, compact }: PlayerSeatProps) {
  const showCards = seat.cards.length > 0
  const totalText = showCards ? displayTotal(seat.cards) : '—'

  return (
    <div
      className={cn(
        'rounded-xl border bg-card/80 p-3 shadow-sm backdrop-blur transition',
        isActive && 'ring-2 ring-primary shadow-md',
        seat.status === 'bust' && 'opacity-80',
        seat.status === 'broke' && 'opacity-50'
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-semibold">
          {seat.isHuman ? (
            <User className="text-primary h-4 w-4" />
          ) : (
            <Bot className="text-muted-foreground h-4 w-4" />
          )}
          <span className="truncate">{seat.name}</span>
          {seat.isHuman && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              你
            </Badge>
          )}
        </div>
        <div className="text-muted-foreground text-xs tabular-nums">
          筹码 <span className="text-foreground font-medium">{seat.chips}</span>
        </div>
      </div>

      {seat.bet > 0 && (
        <div className="mb-2 text-xs">
          赌注 <span className="font-semibold text-amber-600 dark:text-amber-400">{seat.bet}</span>
        </div>
      )}

      <div className={cn('flex min-h-[5rem] flex-wrap gap-1', compact && 'min-h-[4rem]')}>
        {showCards ? (
          seat.cards.map(c => <PlayingCard key={c.id} card={c} small={compact} />)
        ) : (
          <div className="text-muted-foreground flex items-center text-sm">
            {seat.status === 'broke' ? '观战' : '等待发牌'}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium tabular-nums">{totalText}</span>
        {seat.result && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              resultClass[seat.result]
            )}
          >
            {resultLabel[seat.result]}
            {seat.resultAmount !== 0 && (
              <span className="ml-1">
                {seat.resultAmount > 0 ? '+' : ''}
                {seat.resultAmount}
              </span>
            )}
          </span>
        )}
        {seat.status === 'bust' && !seat.result && (
          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-700 dark:text-red-300">
            爆牌
          </span>
        )}
        {seat.status === 'blackjack' && !seat.result && (
          <span className="flex items-center gap-0.5 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-800 dark:text-yellow-200">
            <Crown className="h-3 w-3" />
            黑杰克
          </span>
        )}
      </div>
    </div>
  )
}
