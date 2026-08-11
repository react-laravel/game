'use client'

import { motion } from 'framer-motion'
import { SUIT_COLOR, SUIT_SYMBOL } from '../constants'
import type { Card } from '../types'
import { cn } from '@/lib/helpers'

type CardSize = 'xs' | 'sm' | 'md'

interface PlayingCardProps {
  card?: Card
  /** 背面朝上 */
  faceDown?: boolean
  className?: string
  size?: CardSize
  /** 扇形叠放时的序号（用于轻微旋转） */
  fanIndex?: number
}

const SIZE: Record<CardSize, { box: string; rank: string; suit: string; center: string }> = {
  xs: {
    box: 'w-8 h-11',
    rank: 'text-[10px]',
    suit: 'text-[9px]',
    center: 'text-sm',
  },
  sm: {
    box: 'w-9 h-[3.25rem]',
    rank: 'text-[11px]',
    suit: 'text-[10px]',
    center: 'text-base',
  },
  md: {
    box: 'w-11 h-16',
    rank: 'text-xs',
    suit: 'text-[11px]',
    center: 'text-lg',
  },
}

export function PlayingCard({
  card,
  faceDown = false,
  className,
  size = 'sm',
  fanIndex = 0,
}: PlayingCardProps) {
  const s = SIZE[size]
  const rotate = fanIndex === 0 ? 0 : fanIndex % 2 === 1 ? 4 : -3

  if (faceDown || !card) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0, rotate }}
        className={cn(
          s.box,
          'shrink-0 overflow-hidden rounded-md border border-emerald-950/50',
          'bg-gradient-to-br from-emerald-700 to-emerald-950 shadow-sm',
          'flex items-center justify-center',
          className
        )}
      >
        <div className="h-[72%] w-[72%] rounded-[3px] border border-emerald-400/25 bg-[repeating-linear-gradient(135deg,rgba(52,211,153,0.18)_0_3px,transparent_3px_6px)]" />
      </motion.div>
    )
  }

  const isRed = SUIT_COLOR[card.suit] === 'red'
  const color = isRed ? 'text-red-600' : 'text-slate-800'
  const symbol = SUIT_SYMBOL[card.suit]
  // 「10」两字符，略缩
  const rankClass = card.rank === '10' ? 'tracking-tighter scale-90 origin-top-left' : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
      className={cn(
        s.box,
        'relative shrink-0 overflow-hidden rounded-md border border-black/10 bg-white shadow-sm',
        color,
        className
      )}
    >
      {/* 仅左上角：避免双角翻转在小尺寸下溢出 */}
      <div className={cn('absolute top-0.5 left-0.5 z-10 flex flex-col items-center leading-none font-bold', s.rank)}>
        <span className={rankClass}>{card.rank}</span>
        <span className={cn('font-normal', s.suit)}>{symbol}</span>
      </div>
      <div className={cn('absolute inset-0 flex items-center justify-center opacity-90', s.center)}>
        {symbol}
      </div>
    </motion.div>
  )
}

/** 重叠扇形牌组 */
export function CardFan({
  cards,
  hideHoleIndex,
  size = 'sm',
  className,
}: {
  cards: Card[]
  /** 该下标牌面朝下 */
  hideHoleIndex?: number
  size?: CardSize
  className?: string
}) {
  if (cards.length === 0) return null

  return (
    <div className={cn('flex items-end', className)}>
      {cards.map((card, i) => (
        <div
          key={card.id}
          className={cn(i > 0 && '-ml-3.5 sm:-ml-4')}
          style={{ zIndex: i + 1 }}
        >
          <PlayingCard
            card={card}
            faceDown={hideHoleIndex === i}
            size={size}
            fanIndex={i}
          />
        </div>
      ))}
    </div>
  )
}
