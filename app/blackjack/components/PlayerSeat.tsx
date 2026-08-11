'use client'

import { AnimatePresence, motion } from 'framer-motion'
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
  isActiveHand,
}: {
  hand: PlayerHand
  label?: string
  isActiveHand?: boolean
}) {
  const showCards = hand.cards.length > 0
  const totalText = showCards
    ? displayTotal(hand.cards, false, hand.fromSplit)
    : '—'
  const bust = hand.status === 'bust'
  const bj = hand.status === 'blackjack'

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-0.5 rounded-lg px-0.5',
        isActiveHand && 'ring-1 ring-amber-300/60 rounded-xl'
      )}
    >
      {label && (
        <span className="text-[9px] text-emerald-100/50">{label}</span>
      )}
      {hand.bet > 0 && (
        <ChipStack amount={hand.bet} size="xs" maxVisible={4} />
      )}
      <div className="flex min-h-11 items-end justify-center">
        {showCards ? (
          <CardFan cards={hand.cards} size="xs" />
        ) : (
          <span className="text-[10px] text-emerald-100/40">…</span>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-0.5">
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

export function PlayerSeat({ seat, isActive }: PlayerSeatProps) {
  const multi = seat.hands.length > 1
  const totalBet = seatTotalBet(seat)
  const anyBust = seat.hands.every(h => h.status === 'bust') && seat.hands.length > 0
  // 未发牌时 hands 可能只有 betting 空牌
  const waiting =
    seat.hands.length === 0 ||
    (seat.hands.length === 1 && seat.hands[0].cards.length === 0)

  return (
    <motion.div
      layout
      animate={
        anyBust
          ? { x: [0, -4, 4, -3, 3, 0], opacity: 0.8 }
          : isActive
            ? { scale: [1, 1.03, 1] }
            : { scale: 1, opacity: seat.chips < 5 && waiting ? 0.4 : 1 }
      }
      transition={
        anyBust
          ? { duration: 0.4 }
          : isActive
            ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.2 }
      }
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 transition-colors',
        isActive && 'bg-white/10 ring-1 ring-amber-300/70 shadow-[0_0_16px_rgba(251,191,36,0.2)]'
      )}
    >
      <div className="flex max-w-full items-center gap-0.5 text-[11px] leading-tight text-emerald-50/90">
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
      <div className="text-[10px] tabular-nums text-emerald-100/55">{seat.chips}</div>

      {waiting ? (
        <>
          <div className="flex min-h-8 items-end justify-center">
            <AnimatePresence mode="popLayout">
              {totalBet > 0 && (
                <motion.div
                  key={`bet-${totalBet}`}
                  initial={{ scale: 0, y: 8 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <ChipStack amount={totalBet} size="xs" maxVisible={5} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span className="text-[10px] text-emerald-100/40">
            {seat.chips < 5 && totalBet === 0 ? '观战' : '…'}
          </span>
        </>
      ) : (
        <div
          className={cn(
            'flex w-full items-start justify-center gap-1',
            multi && 'gap-1.5'
          )}
        >
          {seat.hands.map((hand, i) => (
            <HandBlock
              key={hand.id}
              hand={hand}
              label={multi ? `#${i + 1}` : undefined}
              isActiveHand={isActive && seat.activeHandIndex === i}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
