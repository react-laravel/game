'use client'

import { motion } from 'framer-motion'
import { amountToChips, CHIP_COLORS, type ChipDenom } from '../utils/chips'
import { cn } from '@/lib/helpers'

type ChipSize = 'xs' | 'sm' | 'md'

const SIZE: Record<ChipSize, string> = {
  xs: 'h-6 w-6 text-[8px]',
  sm: 'h-9 w-9 text-[10px]',
  md: 'h-11 w-11 text-xs',
}

interface ChipProps {
  value: ChipDenom
  size?: ChipSize
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
  /** 叠放时的垂直偏移索引 */
  stackIndex?: number
}

export function Chip({
  value,
  size = 'md',
  selected,
  disabled,
  onClick,
  className,
  stackIndex,
}: ChipProps) {
  const colors = CHIP_COLORS[value]
  const interactive = Boolean(onClick)

  const body = (
    <div
      className={cn(
        SIZE[size],
        'relative flex shrink-0 items-center justify-center rounded-full',
        'bg-gradient-to-b font-black tabular-nums shadow-md',
        'ring-2 ring-inset',
        colors.bg,
        colors.ring,
        colors.text,
        selected && 'outline outline-2 outline-offset-2 outline-white/90',
        disabled && 'opacity-35 grayscale',
        interactive && !disabled && 'cursor-pointer hover:brightness-110 active:scale-95',
        className
      )}
      style={
        stackIndex !== undefined
          ? { transform: `translateY(${-stackIndex * 3}px)`, zIndex: stackIndex + 1 }
          : undefined
      }
    >
      {/* 边缘齿纹感 */}
      <div
        className={cn(
          'pointer-events-none absolute inset-[3px] rounded-full border border-dashed',
          colors.stripe
        )}
      />
      <span className="relative z-[1] drop-shadow-sm">{value}</span>
    </div>
  )

  if (!interactive) return body

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      whileHover={disabled ? undefined : { y: -2 }}
      className="rounded-full bg-transparent p-0"
      aria-label={`筹码 ${value}`}
    >
      {body}
    </motion.button>
  )
}

/** 把金额拆成一摞筹码展示 */
export function ChipStack({
  amount,
  size = 'xs',
  className,
  maxVisible = 6,
}: {
  amount: number
  size?: ChipSize
  className?: string
  maxVisible?: number
}) {
  const chips = amountToChips(amount).slice(0, maxVisible)
  if (chips.length === 0 || amount <= 0) return null

  // 反向：底部大面额
  const stack = [...chips].reverse()

  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      <div
        className="relative"
        style={{ height: size === 'xs' ? 24 + (stack.length - 1) * 3 : 36 + (stack.length - 1) * 3 }}
      >
        {stack.map((v, i) => (
          <div
            key={`${v}-${i}`}
            className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: i * 3, zIndex: i + 1 }}
          >
            <Chip value={v} size={size} />
          </div>
        ))}
      </div>
      <span className="mt-0.5 text-[9px] font-semibold tabular-nums text-amber-200/95">{amount}</span>
    </div>
  )
}
