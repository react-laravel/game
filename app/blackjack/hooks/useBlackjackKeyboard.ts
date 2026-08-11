'use client'

import { useEffect } from 'react'
import {
  canDoubleDown,
  canSplit,
  getActiveHand,
  getHumanSeat,
  useBlackjackStore,
} from '../store'

/**
 * 桌面端快捷键：
 * H 要牌 · S 停牌 · D 加倍 · P 分牌
 * Enter 确认下注 / 下一局
 * A 切换托管 · M 静音由外层处理
 */
export function useBlackjackKeyboard(options?: { onToggleMute?: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 输入框 / 对话框内不抢键
      const t = e.target as HTMLElement | null
      if (
        t &&
        (t.tagName === 'INPUT' ||
          t.tagName === 'TEXTAREA' ||
          t.tagName === 'SELECT' ||
          t.isContentEditable)
      ) {
        return
      }
      // 打开对话框时不处理
      if (document.querySelector('[role="dialog"]')) return

      const key = e.key.toLowerCase()
      const st = useBlackjackStore.getState()
      const { phase, busy, config, autoPlay } = st

      if (key === 'm' && options?.onToggleMute) {
        e.preventDefault()
        options.onToggleMute()
        return
      }

      if (key === 'a' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        st.toggleAutoPlay()
        return
      }

      if (phase === 'setup') return

      // 确认下注 / 下一局
      if (key === 'enter') {
        if (phase === 'betting' && config.role === 'player' && !busy && !autoPlay.enabled) {
          e.preventDefault()
          st.placeHumanBet()
          return
        }
        if (phase === 'round_end' && !autoPlay.autoNextRound) {
          e.preventDefault()
          st.nextRound()
          return
        }
      }

      // 出牌快捷键
      if (phase !== 'player_turns' || config.role !== 'player' || busy || autoPlay.enabled) {
        return
      }

      const human = getHumanSeat(st.seats)
      const active = st.seats[st.activeSeatIndex]
      const hand = active ? getActiveHand(active) : undefined
      const canPlay = !!active?.isHuman && hand?.status === 'playing'
      if (!canPlay) return

      if (key === 'h') {
        e.preventDefault()
        st.hit()
      } else if (key === 's') {
        e.preventDefault()
        st.stand()
      } else if (key === 'd') {
        e.preventDefault()
        if (canDoubleDown(human ?? active)) st.doubleDown()
      } else if (key === 'p' || key === 'x') {
        e.preventDefault()
        if (canSplit(human ?? active)) st.split()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [options])
}
