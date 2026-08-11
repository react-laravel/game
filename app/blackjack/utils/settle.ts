import { BLACKJACK_PAYOUT } from '../constants'
import type { Card, PlayerHand, RoundResult, Seat } from '../types'
import { evaluateHand } from './hand'

export interface HandSettlement {
  handId: string
  result: RoundResult
  net: number
  payout: number
}

export interface SeatSettlement {
  seatId: string
  hands: HandSettlement[]
  /** 座位总净盈亏 */
  net: number
  /** 座位总退回筹码 */
  payout: number
  /** 主展示结果（有 BJ 优先，否则按净盈亏） */
  result: RoundResult
}

/**
 * 结算单手相对庄家。
 * 分牌后的 21（fromSplit）不按黑杰克 3:2，按普通 21 的 1:1。
 */
export function settleHand(
  hand: Pick<PlayerHand, 'id' | 'bet' | 'cards' | 'status' | 'fromSplit'>,
  dealerCards: Card[]
): HandSettlement {
  const bet = hand.bet
  const player = evaluateHand(hand.cards)
  const dealer = evaluateHand(dealerCards)

  if (hand.status === 'bust' || player.isBust) {
    return { handId: hand.id, result: 'lose', net: -bet, payout: 0 }
  }

  // 天然黑杰克：仅非分牌的首两张 A+10
  const playerBj = player.isBlackjack && !hand.fromSplit
  const dealerBj = dealer.isBlackjack

  if (playerBj && dealerBj) {
    return { handId: hand.id, result: 'push', net: 0, payout: bet }
  }
  if (playerBj) {
    const win = Math.floor(bet * BLACKJACK_PAYOUT)
    return { handId: hand.id, result: 'blackjack', net: win, payout: bet + win }
  }
  if (dealerBj) {
    return { handId: hand.id, result: 'lose', net: -bet, payout: 0 }
  }

  if (dealer.isBust) {
    return { handId: hand.id, result: 'win', net: bet, payout: bet * 2 }
  }

  if (player.total > dealer.total) {
    return { handId: hand.id, result: 'win', net: bet, payout: bet * 2 }
  }
  if (player.total < dealer.total) {
    return { handId: hand.id, result: 'lose', net: -bet, payout: 0 }
  }
  return { handId: hand.id, result: 'push', net: 0, payout: bet }
}

export function settleSeat(
  seat: Pick<Seat, 'id' | 'hands'>,
  dealerCards: Card[]
): SeatSettlement {
  // 无手或未下注
  const activeHands = seat.hands.filter(h => h.bet > 0 || h.cards.length > 0)
  if (activeHands.length === 0) {
    return { seatId: seat.id, hands: [], net: 0, payout: 0, result: null }
  }

  const hands = activeHands.map(h => settleHand(h, dealerCards))
  const net = hands.reduce((s, h) => s + h.net, 0)
  const payout = hands.reduce((s, h) => s + h.payout, 0)

  let result: RoundResult = null
  if (hands.some(h => h.result === 'blackjack')) result = 'blackjack'
  else if (net > 0) result = 'win'
  else if (net < 0) result = 'lose'
  else if (hands.length > 0) result = 'push'

  return { seatId: seat.id, hands, net, payout, result }
}

export function settleAllSeats(
  seats: Pick<Seat, 'id' | 'hands'>[],
  dealerCards: Card[]
): SeatSettlement[] {
  return seats.map(s => settleSeat(s, dealerCards))
}
