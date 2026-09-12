'use client'

import Image from 'next/image'
import { getMoonDiceAssetSrc, MOON_DICE_DIE_CLASS } from '../utils/moonDiceAssets'

interface MoonDiceDieProps {
  value?: number
  rolling?: boolean
}

export function MoonDiceDie({ value, rolling = false }: MoonDiceDieProps) {
  const src = getMoonDiceAssetSrc(value, rolling)
  const isAnimated = rolling && value !== undefined

  return (
    <Image
      data-testid="moon-dice-die"
      src={src}
      alt={value ? `骰子 ${value}` : '骰子'}
      width={64}
      height={64}
      unoptimized={isAnimated}
      className={MOON_DICE_DIE_CLASS}
    />
  )
}
