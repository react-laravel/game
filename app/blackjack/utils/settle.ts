import { BLACKJACK_PAYOUT } from '../constants'
import type { Card, RoundResult, Seat } from '../types'
import { evaluateHand } from './hand'

export interface SeatSettlement {
  seatId: string
  result: RoundResult
  /** 相对赌注的净盈亏（不含本金退回的会计：赢为正，输为负） */
  net: number
  /** 结算后应退还给玩家的筹码（含本金+赢利，或 0） */
  payout: number
}

/**
 * 结算单个闲家相对庄家的输赢。
 * - 闲家爆牌：净亏 -bet
 * - 闲家黑杰克且庄家非 BJ：净赚 bet * 1.5，退还 bet + 1.5*bet
 * - 双方 BJ 或同点：push，退还 bet
 * - 庄家爆牌且闲家未爆：净赚 bet
 * - 比点：高者赢 1:1
 */
export function settleSeat(
  seat: Pick<Seat, 'id' | 'bet' | 'cards' | 'status'>,
  dealerCards: Card[]
): SeatSettlement {
  const bet = seat.bet
  const player = evaluateHand(seat.cards)
  const dealer = evaluateHand(dealerCards)

  // 已在游戏中判定爆牌
  if (seat.status === 'bust' || player.isBust) {
    return { seatId: seat.id, result: 'lose', net: -bet, payout: 0 }
  }

  const playerBj = player.isBlackjack
  const dealerBj = dealer.isBlackjack

  if (playerBj && dealerBj) {
    return { seatId: seat.id, result: 'push', net: 0, payout: bet }
  }
  if (playerBj) {
    const win = Math.floor(bet * BLACKJACK_PAYOUT)
    return { seatId: seat.id, result: 'blackjack', net: win, payout: bet + win }
  }
  if (dealerBj) {
    return { seatId: seat.id, result: 'lose', net: -bet, payout: 0 }
  }

  if (dealer.isBust) {
    return { seatId: seat.id, result: 'win', net: bet, payout: bet * 2 }
  }

  if (player.total > dealer.total) {
    return { seatId: seat.id, result: 'win', net: bet, payout: bet * 2 }
  }
  if (player.total < dealer.total) {
    return { seatId: seat.id, result: 'lose', net: -bet, payout: 0 }
  }
  return { seatId: seat.id, result: 'push', net: 0, payout: bet }
}

export function settleAllSeats(
  seats: Pick<Seat, 'id' | 'bet' | 'cards' | 'status'>[],
  dealerCards: Card[]
): SeatSettlement[] {
  return seats.map(s => settleSeat(s, dealerCards))
}
