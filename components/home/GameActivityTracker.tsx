'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { GAME_BY_ID } from '@/lib/gameCatalog'
import { recordRecentGame } from '@/lib/gameHubStorage'

export function GameActivityTracker() {
  const pathname = usePathname()
  useEffect(() => {
    const id = pathname.slice(1)
    if (GAME_BY_ID.has(id)) recordRecentGame(id)
  }, [pathname])
  return null
}
