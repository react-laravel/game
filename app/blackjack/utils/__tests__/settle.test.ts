import { describe, expect, it } from 'vitest'
import type { Card, Rank, Seat, Suit } from '../../types'
import { settleSeat } from '../settle'

function c(rank: Rank, suit: Suit = 'clubs'): Card {
  return { rank, suit, id: `${rank}-${suit}` }
}

function seat(partial: Partial<Seat> & Pick<Seat, 'cards' | 'bet' | 'status'>): Seat {
  return {
    id: 's1',
    name: '测试',
    isHuman: true,
    chips: 1000,
    result: null,
    resultAmount: 0,
    ...partial,
  }
}

describe('settleSeat', () => {
  it('闲家爆牌输掉赌注', () => {
    const r = settleSeat(
      seat({
        cards: [c('K'), c('Q'), c('5')],
        bet: 100,
        status: 'bust',
      }),
      [c('10'), c('7')]
    )
    expect(r.result).toBe('lose')
    expect(r.net).toBe(-100)
    expect(r.payout).toBe(0)
  })

  it('黑杰克赔 3:2', () => {
    const r = settleSeat(
      seat({ cards: [c('A'), c('K')], bet: 100, status: 'blackjack' }),
      [c('10'), c('8')]
    )
    expect(r.result).toBe('blackjack')
    expect(r.net).toBe(150)
    expect(r.payout).toBe(250)
  })

  it('双方黑杰克平局', () => {
    const r = settleSeat(
      seat({ cards: [c('A'), c('K')], bet: 100, status: 'blackjack' }),
      [c('A'), c('Q')]
    )
    expect(r.result).toBe('push')
    expect(r.net).toBe(0)
    expect(r.payout).toBe(100)
  })

  it('庄家爆牌闲家赢 1:1', () => {
    const r = settleSeat(
      seat({ cards: [c('10'), c('8')], bet: 50, status: 'stand' }),
      [c('K'), c('6'), c('8')]
    )
    expect(r.result).toBe('win')
    expect(r.net).toBe(50)
    expect(r.payout).toBe(100)
  })

  it('比点闲家高赢', () => {
    const r = settleSeat(
      seat({ cards: [c('10'), c('9')], bet: 20, status: 'stand' }),
      [c('10'), c('7')]
    )
    expect(r.result).toBe('win')
    expect(r.net).toBe(20)
  })

  it('比点相同平局', () => {
    const r = settleSeat(
      seat({ cards: [c('10'), c('8')], bet: 20, status: 'stand' }),
      [c('9'), c('9')]
    )
    expect(r.result).toBe('push')
    expect(r.payout).toBe(20)
  })

  it('闲家点数低输', () => {
    const r = settleSeat(
      seat({ cards: [c('10'), c('5')], bet: 30, status: 'stand' }),
      [c('10'), c('8')]
    )
    expect(r.result).toBe('lose')
    expect(r.net).toBe(-30)
  })

  it('庄家黑杰克击败普通 21', () => {
    const r = settleSeat(
      seat({ cards: [c('7'), c('7'), c('7')], bet: 40, status: 'stand' }),
      [c('A'), c('K')]
    )
    expect(r.result).toBe('lose')
    expect(r.net).toBe(-40)
  })
})
