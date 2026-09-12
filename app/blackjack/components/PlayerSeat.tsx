'use client'

import { Bot, User } from 'lucide-react'
import type { PlayerHand, Seat } from '../types'
import { displayTotal } from '../utils/hand'
import { seatTotalBet } from '../utils/split'
import { CardFan } from './PlayingCard'
import { ChipStack } from './Chip'
import { cn } from '@/lib/helpers'

interface PlayerSeatProps {
  seat: Seat
  isActive?: boolean
  /** 真人座位：牌桌正中，略突出 */
  featured?: boolean
}

const resultLabel: Record<string, string> = {
  win: '赢',
  lose: '输',
  push: '平',
  blackjack: 'BJ',
}

function HandBlock({
  hand,
  label,
}: {
  hand: PlayerHand
  label?: string
}) {
  const showCards = hand.cards.length > 0
  const totalText = showCards
    ? displayTotal(hand.cards, false, hand.fromSplit)
    : '—'
  const bust = hand.status === 'bust'
  const bj = hand.status === 'blackjack'
  const doubled = hand.status === 'doubled'

  return (
    <div className="flex flex-col items-center gap-0.5 rounded-lg px-0.5">
      {label && (
        <span className="text-[9px] text-emerald-100/50">{label}</span>
      )}
      {doubled && (
        <span className="rounded bg-orange-500/30 px-1 text-[9px] font-semibold text-orange-100">
          加倍×2
        </span>
      )}
      <div className="flex h-11 items-end justify-center">
        {showCards ? (
          <CardFan cards={hand.cards} size="xs" />
        ) : (
          <span className="text-[10px] text-emerald-100/40">…</span>
        )}
      </div>
      <div className="flex h-5 flex-wrap items-center justify-center gap-0.5">
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
            bust
              ? 'bg-red-500/25 text-red-200'
              : bj
                ? 'bg-amber-400/25 text-amber-100'
                : 'bg-black/25 text-emerald-50'
          )}
        >
          {totalText}
        </span>
        {hand.result && (
          <span
            className={cn(
              'rounded-full px-1 py-0.5 text-[9px] font-semibold',
              hand.result === 'win' || hand.result === 'blackjack'
                ? 'bg-emerald-400/25 text-emerald-100'
                : hand.result === 'lose'
                  ? 'bg-red-500/25 text-red-200'
                  : 'bg-white/10 text-emerald-100/80'
            )}
          >
            {resultLabel[hand.result]}
            {hand.resultAmount !== 0
              ? `${hand.resultAmount > 0 ? '+' : ''}${hand.resultAmount}`
              : ''}
          </span>
        )}
      </div>
    </div>
  )
}

export function PlayerSeat({ seat, isActive, featured }: PlayerSeatProps) {
  const multi = seat.hands.length > 1
  const totalBet = seatTotalBet(seat)
  // 未发牌时 hands 可能只有 betting 空牌
  const waiting =
    seat.hands.length === 0 ||
    (seat.hands.length === 1 && seat.hands[0].cards.length === 0)
  const spectating = seat.chips < 5 && waiting && totalBet === 0

  return (
    <div
      className={cn(
        'flex w-[4.75rem] shrink-0 flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 sm:w-24',
        featured && 'w-[5.5rem] sm:w-28',
        isActive && 'bg-white/10 ring-1 ring-amber-300/70 shadow-[0_0_16px_rgba(251,191,36,0.25)]',
        spectating && 'opacity-40'
      )}
    >
      {totalBet > 0 && (
        <div className="flex min-h-8 items-center justify-center">
          <ChipStack amount={totalBet} size="xs" maxVisible={featured ? 6 : 5} />
        </div>
      )}
      <div className="flex h-4 max-w-full items-center gap-0.5 text-[11px] leading-tight text-emerald-50/90">
        {seat.isHuman ? (
          <User className="h-3 w-3 shrink-0 text-amber-300" />
        ) : (
          <Bot className="h-3 w-3 shrink-0 text-emerald-200/70" />
        )}
        <span className="truncate font-medium">{seat.name}</span>
        {multi && (
          <span className="rounded bg-white/10 px-1 text-[9px] text-emerald-100/70">分</span>
        )}
      </div>
      <div className="h-4 text-[10px] tabular-nums text-emerald-100/55">{seat.chips}</div>

      {waiting ? (
        <div className="flex h-[4.75rem] flex-col items-center justify-center">
          <span className="h-4 text-[10px] text-emerald-100/40">
            {spectating ? '观战' : '…'}
          </span>
        </div>
      ) : (
        <div
          className={cn(
            'flex min-h-[4.75rem] w-full items-end justify-center gap-1',
            multi && 'gap-1.5'
          )}
        >
          {seat.hands.map((hand, i) => (
            <HandBlock
              key={hand.id}
              hand={hand}
              label={multi ? `#${i + 1}` : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
