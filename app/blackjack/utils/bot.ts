import type { Card } from '../types'
import { evaluateHand } from './hand'
import { MIN_BET, MAX_BET } from '../constants'

export type BotAction = 'hit' | 'stand' | 'double'

/**
 * 简化基本策略（相对庄家明牌）：
 * - 硬牌：<=11 要；12–16 庄家 7+ 要，否则停；>=17 停
 * - 软牌：<=17 要；18 庄家 9/10/A 要，否则停；>=19 停
 * - 仅两张且筹码足够时，硬 9–11 或软 13–18 可能加倍
 */
export function decideBotAction(
  cards: Card[],
  dealerUp: Card,
  chips: number,
  bet: number,
  canDouble: boolean
): BotAction {
  const hand = evaluateHand(cards)
  const dealerUpValue = dealerUpcardValue(dealerUp)

  if (hand.isBust || hand.isBlackjack) return 'stand'
  if (hand.total >= 21) return 'stand'

  // 加倍判断（仅首两张）
  if (canDouble && cards.length === 2 && chips >= bet) {
    if (!hand.soft) {
      // 硬 11 总是加倍；硬 10 对 2–9；硬 9 对 3–6
      if (hand.total === 11) return 'double'
      if (hand.total === 10 && dealerUpValue <= 9) return 'double'
      if (hand.total === 9 && dealerUpValue >= 3 && dealerUpValue <= 6) return 'double'
    } else {
      // 软加倍：A6/A7 对 3–6 等简化
      if (hand.total === 18 && dealerUpValue >= 3 && dealerUpValue <= 6) return 'double'
      if (hand.total === 17 && dealerUpValue >= 3 && dealerUpValue <= 6) return 'double'
    }
  }

  if (hand.soft) {
    if (hand.total <= 17) return 'hit'
    if (hand.total === 18 && (dealerUpValue === 9 || dealerUpValue === 10 || dealerUpValue === 11)) {
      return 'hit'
    }
    return 'stand'
  }

  // 硬牌
  if (hand.total <= 11) return 'hit'
  if (hand.total >= 17) return 'stand'
  // 12–16
  if (dealerUpValue >= 7) return 'hit'
  // 12 对 2–3 有时要，简化：12 对 2–3 要牌
  if (hand.total === 12 && dealerUpValue <= 3) return 'hit'
  return 'stand'
}

function dealerUpcardValue(card: Card): number {
  if (card.rank === 'A') return 11
  if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') return 10
  return Number(card.rank)
}

/**
 * 机器人下注：约 5%–15% 筹码，对齐到 5 的倍数，夹在 MIN/MAX 之间。
 */
export function decideBotBet(chips: number): number {
  if (chips < MIN_BET) return 0
  const ratio = 0.05 + Math.random() * 0.1
  let bet = Math.floor((chips * ratio) / 5) * 5
  bet = Math.max(MIN_BET, Math.min(MAX_BET, bet, chips))
  bet = Math.floor(bet / 5) * 5
  if (bet < MIN_BET) bet = Math.min(MIN_BET, chips)
  return Math.min(bet, chips)
}
