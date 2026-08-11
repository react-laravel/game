import type { Card, PlayerHand, Seat } from '../types'
import { rankValue } from './cards'

let handSeq = 0

export function createHand(partial: Partial<PlayerHand> & Pick<PlayerHand, 'bet'>): PlayerHand {
  return {
    id: `hand-${++handSeq}-${Date.now()}`,
    cards: [],
    status: 'waiting',
    result: null,
    resultAmount: 0,
    fromSplit: false,
    isSplitAces: false,
    ...partial,
  }
}

export function resetHandSeq() {
  handSeq = 0
}

/** 两张牌点数相同可分：同 rank，或同为 10 点牌（10/J/Q/K） */
export function isPair(cards: Card[]): boolean {
  if (cards.length !== 2) return false
  const [a, b] = cards
  if (a.rank === b.rank) return true
  return rankValue(a.rank) === 10 && rankValue(b.rank) === 10
}

export function isAcePair(cards: Card[]): boolean {
  return cards.length === 2 && cards[0].rank === 'A' && cards[1].rank === 'A'
}

/** 当前手是否可分牌：一对、未分过（最多 2 手）、筹码够补注 */
export function canSplitHand(seat: Seat, handIndex = seat.activeHandIndex): boolean {
  const hand = seat.hands[handIndex]
  if (!hand) return false
  if (seat.hands.length >= 2) return false // 简化：只允许分一次成两手
  if (hand.status !== 'playing') return false
  if (!isPair(hand.cards)) return false
  if (seat.chips < hand.bet) return false
  return true
}

export function seatTotalBet(seat: Seat): number {
  return seat.hands.reduce((sum, h) => sum + h.bet, 0)
}

export function getActiveHand(seat: Seat): PlayerHand | undefined {
  return seat.hands[seat.activeHandIndex]
}

/** 座位是否还有未完成的手（需继续行动） */
export function seatNeedsPlay(seat: Seat): boolean {
  return seat.hands.some(h => h.status === 'playing')
}

/** 座位主状态（展示用） */
export function seatPrimaryStatus(seat: Seat): PlayerHand['status'] {
  if (seat.hands.length === 0) return 'waiting'
  if (seat.hands.some(h => h.status === 'playing' || h.status === 'doubled')) return 'playing'
  if (seat.hands.every(h => h.status === 'blackjack')) return 'blackjack'
  if (seat.hands.every(h => h.status === 'bust')) return 'bust'
  if (seat.hands.some(h => h.status === 'broke')) return 'broke'
  if (seat.hands.every(h => h.status === 'settled')) return 'settled'
  if (seat.hands.some(h => h.status === 'betting')) return 'betting'
  return 'stand'
}

/**
 * 机器人/简化策略：是否分牌
 * - 必分 A、8
 * - 10 点对、5、4 不分
 * - 其余对：庄家明牌 2–6 分
 */
export function shouldBotSplit(cards: Card[], dealerUp: Card): boolean {
  if (!isPair(cards)) return false
  if (isAcePair(cards)) return true
  const v = rankValue(cards[0].rank)
  if (v === 8) return true
  if (v === 10 || v === 5 || v === 4) return false
  const up =
    dealerUp.rank === 'A'
      ? 11
      : dealerUp.rank === 'J' || dealerUp.rank === 'Q' || dealerUp.rank === 'K'
        ? 10
        : Number(dealerUp.rank)
  return up >= 2 && up <= 6
}
