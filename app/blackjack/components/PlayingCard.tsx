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

function CardBack() {
  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center overflow-hidden rounded-md border border-emerald-950/50',
        'bg-gradient-to-br from-emerald-700 to-emerald-950 shadow-sm',
        '[backface-visibility:hidden] [transform:rotateY(180deg)]'
      )}
    >
      <div className="h-[72%] w-[72%] rounded-[3px] border border-emerald-400/25 bg-[repeating-linear-gradient(135deg,rgba(52,211,153,0.18)_0_3px,transparent_3px_6px)]" />
    </div>
  )
}

function CardFace({
  card,
  rankClass,
  suitClass,
  centerClass,
}: {
  card: Card
  rankClass: string
  suitClass: string
  centerClass: string
}) {
  const isRed = SUIT_COLOR[card.suit] === 'red'
  const color = isRed ? 'text-red-600' : 'text-slate-800'
  const symbol = SUIT_SYMBOL[card.suit]
  const tenClass = card.rank === '10' ? 'tracking-tighter scale-90 origin-top-left' : ''

  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden rounded-md border border-black/10 bg-white shadow-sm',
        color,
        '[backface-visibility:hidden]'
      )}
    >
      <div
        className={cn(
          'absolute top-0.5 left-0.5 z-10 flex flex-col items-center leading-none font-bold',
          rankClass
        )}
      >
        <span className={tenClass}>{card.rank}</span>
        <span className={cn('font-normal', suitClass)}>{symbol}</span>
      </div>
      <div className={cn('absolute inset-0 flex items-center justify-center opacity-90', centerClass)}>
        {symbol}
      </div>
    </div>
  )
}

export function PlayingCard({
  card,
  faceDown = false,
  className,
  size = 'sm',
  fanIndex = 0,
}: PlayingCardProps) {
  const s = SIZE[size]
  const restRotate = fanIndex === 0 ? 0 : fanIndex % 2 === 1 ? 4 : -3

  // 仅背面占位（无牌数据）
  if (!card) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -36, scale: 0.75, rotate: -8 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: restRotate }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -48, scale: 0.7, rotate: -14 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: restRotate }}
      transition={{ type: 'spring', stiffness: 300, damping: 18, mass: 0.8 }}
      className={cn(s.box, 'relative shrink-0 [perspective:800px]', className)}
      style={{ zIndex: fanIndex + 1 }}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateY: faceDown ? 180 : 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <CardFace card={card} rankClass={s.rank} suitClass={s.suit} centerClass={s.center} />
        <CardBack />
      </motion.div>
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
        <div key={card.id} className={cn(i > 0 && '-ml-3.5 sm:-ml-4')} style={{ zIndex: i + 1 }}>
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
