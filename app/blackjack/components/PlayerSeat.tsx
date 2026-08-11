'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Bot, User } from 'lucide-react'
import type { Seat } from '../types'
import { displayTotal } from '../utils/hand'
import { CardFan } from './PlayingCard'
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

export function PlayerSeat({ seat, isActive }: PlayerSeatProps) {
  const showCards = seat.cards.length > 0
  const totalText = showCards ? displayTotal(seat.cards) : '—'
  const bust = seat.status === 'bust'
  const bj = seat.status === 'blackjack'

  return (
    <motion.div
      layout
      animate={
        bust
          ? { x: [0, -4, 4, -3, 3, 0], opacity: 0.8 }
          : isActive
            ? { scale: [1, 1.03, 1] }
            : { scale: 1, opacity: seat.status === 'broke' ? 0.4 : 1 }
      }
      transition={
        bust
          ? { duration: 0.4 }
          : isActive
            ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.2 }
      }
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1.5 py-2 transition-colors',
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
      </div>
      <div className="text-[10px] tabular-nums text-emerald-100/55">{seat.chips}</div>

      <div className="flex min-h-12 items-end justify-center py-0.5">
        {showCards ? (
          <CardFan cards={seat.cards} size="xs" />
        ) : (
          <span className="text-[10px] text-emerald-100/40">
            {seat.status === 'broke' ? '观战' : '…'}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1">
        <motion.span
          key={totalText}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums',
            bust
              ? 'bg-red-500/25 text-red-200'
              : bj
                ? 'bg-amber-400/25 text-amber-100'
                : 'bg-black/25 text-emerald-50'
          )}
        >
          {totalText}
        </motion.span>

        <AnimatePresence>
          {seat.bet > 0 && (
            <motion.span
              key={`bet-${seat.bet}`}
              initial={{ scale: 0, y: 6 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 16 }}
              className="text-[10px] font-medium tabular-nums text-amber-300/90"
            >
              {seat.bet}
            </motion.span>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {seat.result && (
            <motion.span
              key={seat.result}
              initial={{ scale: 0, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 14 }}
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                seat.result === 'win' || seat.result === 'blackjack'
                  ? 'bg-emerald-400/25 text-emerald-100'
                  : seat.result === 'lose'
                    ? 'bg-red-500/25 text-red-200'
                    : 'bg-white/10 text-emerald-100/80'
              )}
            >
              {resultLabel[seat.result]}
              {seat.resultAmount !== 0
                ? ` ${seat.resultAmount > 0 ? '+' : ''}${seat.resultAmount}`
                : ''}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
