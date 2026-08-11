import { describe, expect, it } from 'vitest'
import type { Card, PlayerHand, Rank, Seat, Suit } from '../../types'
import { settleHand, settleSeat } from '../settle'

function c(rank: Rank, suit: Suit = 'clubs'): Card {
  return { rank, suit, id: `${rank}-${suit}` }
}

function hand(
  partial: Partial<PlayerHand> & Pick<PlayerHand, 'cards' | 'bet' | 'status'>
): PlayerHand {
  return {
    id: 'h1',
    result: null,
    resultAmount: 0,
    fromSplit: false,
    isSplitAces: false,
    ...partial,
  }
}

describe('settleHand', () => {
  it('闲家爆牌输掉赌注', () => {
    const r = settleHand(
      hand({ cards: [c('K'), c('Q'), c('5')], bet: 100, status: 'bust' }),
      [c('10'), c('7')]
    )
    expect(r.result).toBe('lose')
    expect(r.net).toBe(-100)
    expect(r.payout).toBe(0)
  })

  it('黑杰克赔 3:2', () => {
    const r = settleHand(
      hand({ cards: [c('A'), c('K')], bet: 100, status: 'blackjack' }),
      [c('10'), c('8')]
    )
    expect(r.result).toBe('blackjack')
    expect(r.net).toBe(150)
    expect(r.payout).toBe(250)
  })

  it('分牌后的 21 不按黑杰克赔', () => {
    const r = settleHand(
      hand({
        cards: [c('A'), c('K')],
        bet: 100,
        status: 'stand',
        fromSplit: true,
      }),
      [c('10'), c('8')]
    )
    expect(r.result).toBe('win')
    expect(r.net).toBe(100)
    expect(r.payout).toBe(200)
  })

  it('双方黑杰克平局', () => {
    const r = settleHand(
      hand({ cards: [c('A'), c('K')], bet: 100, status: 'blackjack' }),
      [c('A'), c('Q')]
    )
    expect(r.result).toBe('push')
    expect(r.net).toBe(0)
    expect(r.payout).toBe(100)
  })

  it('庄家爆牌闲家赢 1:1', () => {
    const r = settleHand(
      hand({ cards: [c('10'), c('8')], bet: 50, status: 'stand' }),
      [c('K'), c('6'), c('8')]
    )
    expect(r.result).toBe('win')
    expect(r.net).toBe(50)
    expect(r.payout).toBe(100)
  })

  it('比点闲家高赢', () => {
    const r = settleHand(
      hand({ cards: [c('10'), c('9')], bet: 20, status: 'stand' }),
      [c('10'), c('7')]
    )
    expect(r.result).toBe('win')
    expect(r.net).toBe(20)
  })

  it('比点相同平局', () => {
    const r = settleHand(
      hand({ cards: [c('10'), c('8')], bet: 20, status: 'stand' }),
      [c('9'), c('9')]
    )
    expect(r.result).toBe('push')
    expect(r.payout).toBe(20)
  })

  it('闲家点数低输', () => {
    const r = settleHand(
      hand({ cards: [c('10'), c('5')], bet: 30, status: 'stand' }),
      [c('10'), c('8')]
    )
    expect(r.result).toBe('lose')
    expect(r.net).toBe(-30)
  })
})

describe('settleSeat multi-hand', () => {
  it('汇总两手输赢', () => {
    const seat: Pick<Seat, 'id' | 'hands'> = {
      id: 's1',
      hands: [
        hand({ id: 'a', cards: [c('10'), c('9')], bet: 50, status: 'stand' }),
        hand({ id: 'b', cards: [c('5'), c('5'), c('5')], bet: 50, status: 'bust' }),
      ],
    }
    const r = settleSeat(seat, [c('10'), c('7')])
    expect(r.net).toBe(0) // +50 -50
    expect(r.hands).toHaveLength(2)
  })
})
