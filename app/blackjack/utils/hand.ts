import type { Card, HandValue } from '../types'
import { rankValue } from './cards'

/**
 * 计算手牌最优点数：A 尽量按 11，爆牌时降为 1。
 */
export function evaluateHand(cards: Card[]): HandValue {
  if (cards.length === 0) {
    return { total: 0, soft: false, isBlackjack: false, isBust: false }
  }

  let total = 0
  let aces = 0

  for (const card of cards) {
    const v = rankValue(card.rank)
    total += v
    if (card.rank === 'A') aces += 1
  }

  // 爆牌时把 A 从 11 降为 1
  while (total > 21 && aces > 0) {
    total -= 10
    aces -= 1
  }

  const soft = aces > 0 && total <= 21
  const isBlackjack = cards.length === 2 && total === 21
  const isBust = total > 21

  return { total, soft, isBlackjack, isBust }
}

/** 庄家是否必须继续要牌：未达 17 要牌，软/硬 17 均停（S17） */
export function dealerMustHit(cards: Card[]): boolean {
  const { total, isBust } = evaluateHand(cards)
  if (isBust) return false
  return total < 17
}

/**
 * 可见点数文案：软牌显示「软 X / 硬 Y」可选，这里统一显示最优 total。
 * 未翻开暗牌时只算明牌。
 */
export function displayTotal(cards: Card[], hideHole = false): string {
  const visible = hideHole && cards.length >= 2 ? [cards[0]] : cards
  if (visible.length === 0) return '—'
  const { total, soft, isBlackjack, isBust } = evaluateHand(visible)
  if (isBust) return `爆牌 ${total}`
  if (isBlackjack) return '黑杰克'
  if (soft && total <= 21) return `软 ${total}`
  return String(total)
}
