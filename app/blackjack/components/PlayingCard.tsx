'use client'

import { motion } from 'framer-motion'
import { SUIT_COLOR, SUIT_SYMBOL } from '../constants'
import type { Card } from '../types'
import { cn } from '@/lib/helpers'

interface PlayingCardProps {
  card?: Card
  /** 背面朝上 */
  faceDown?: boolean
  className?: string
  small?: boolean
}

export function PlayingCard({ card, faceDown = false, className, small }: PlayingCardProps) {
  const w = small ? 'w-11 h-16 sm:w-12 sm:h-[4.5rem]' : 'w-14 h-20 sm:w-16 sm:h-24'
  const text = small ? 'text-sm' : 'text-base sm:text-lg'

  if (faceDown || !card) {
    return (
      <motion.div
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        className={cn(
          w,
          'rounded-lg border-2 border-emerald-900/40 bg-gradient-to-br from-emerald-800 to-emerald-950 shadow-md',
          'flex items-center justify-center',
          className
        )}
      >
        <div className="h-[70%] w-[70%] rounded-md border border-emerald-500/30 bg-[repeating-linear-gradient(45deg,rgba(16,185,129,0.15)_0_4px,transparent_4px_8px)]" />
      </motion.div>
    )
  }

  const color = SUIT_COLOR[card.suit] === 'red' ? 'text-red-600' : 'text-slate-900'
  const symbol = SUIT_SYMBOL[card.suit]

  return (
    <motion.div
      initial={{ y: -24, opacity: 0, rotate: -6 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={cn(
        w,
        'relative flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-1 shadow-md',
        color,
        className
      )}
    >
      <div className={cn('leading-none font-bold', text)}>
        <div>{card.rank}</div>
        <div className="text-xs sm:text-sm">{symbol}</div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center text-xl opacity-90 sm:text-2xl">
        {symbol}
      </div>
      <div className={cn('self-end leading-none font-bold rotate-180', text)}>
        <div>{card.rank}</div>
        <div className="text-xs sm:text-sm">{symbol}</div>
      </div>
    </motion.div>
  )
}
