/** 筹码面额（大到小，用于拆分展示） */
export const CHIP_DENOMS = [200, 100, 50, 20, 10, 5] as const

export type ChipDenom = (typeof CHIP_DENOMS)[number]

export const CHIP_COLORS: Record<
  ChipDenom,
  { bg: string; ring: string; text: string; stripe: string }
> = {
  5: {
    bg: 'from-rose-500 to-rose-700',
    ring: 'ring-rose-300/80',
    text: 'text-white',
    stripe: 'border-rose-200/50',
  },
  10: {
    bg: 'from-sky-500 to-sky-700',
    ring: 'ring-sky-300/80',
    text: 'text-white',
    stripe: 'border-sky-200/50',
  },
  20: {
    bg: 'from-emerald-500 to-emerald-700',
    ring: 'ring-emerald-300/80',
    text: 'text-white',
    stripe: 'border-emerald-200/50',
  },
  50: {
    bg: 'from-orange-500 to-orange-700',
    ring: 'ring-orange-300/80',
    text: 'text-white',
    stripe: 'border-orange-200/50',
  },
  100: {
    bg: 'from-violet-500 to-violet-800',
    ring: 'ring-violet-300/80',
    text: 'text-white',
    stripe: 'border-violet-200/50',
  },
  200: {
    bg: 'from-amber-400 to-amber-600',
    ring: 'ring-amber-200/90',
    text: 'text-amber-950',
    stripe: 'border-amber-100/70',
  },
}

/** 将金额贪心拆成筹码列表（大面额优先） */
export function amountToChips(amount: number): ChipDenom[] {
  if (amount <= 0) return []
  let rest = Math.floor(amount)
  const chips: ChipDenom[] = []
  for (const d of CHIP_DENOMS) {
    while (rest >= d) {
      chips.push(d)
      rest -= d
      // 展示上限，避免过多叠层
      if (chips.length >= 12) return chips
    }
  }
  return chips
}

/** 对齐到最小筹码面额 5 */
export function snapToChip(amount: number): number {
  return Math.floor(amount / 5) * 5
}
