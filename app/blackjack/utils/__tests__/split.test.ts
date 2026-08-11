import { describe, expect, it } from 'vitest'
import type { Card, Rank, Seat, Suit } from '../../types'
import { canSplitHand, createHand, isAcePair, isPair, shouldBotSplit } from '../split'

function c(rank: Rank, suit: Suit = 'hearts'): Card {
  return { rank, suit, id: rank + suit }
}

function seatWith(cards: Card[], chips = 500, bet = 50): Seat {
  return {
    id: 's1',
    name: '测',
    isHuman: true,
    chips,
    activeHandIndex: 0,
    hands: [createHand({ bet, cards, status: 'playing' })],
  }
}

describe('isPair', () => {
  it('同 rank 可分', () => {
    expect(isPair([c('8', 'hearts'), c('8', 'spades')])).toBe(true)
    expect(isPair([c('A', 'hearts'), c('A', 'clubs')])).toBe(true)
  })

  it('10 点牌互为对子', () => {
    expect(isPair([c('10'), c('J')])).toBe(true)
    expect(isPair([c('Q'), c('K')])).toBe(true)
  })

  it('不同点数不可分', () => {
    expect(isPair([c('8'), c('9')])).toBe(false)
    expect(isPair([c('A'), c('10')])).toBe(false)
  })
})

describe('canSplitHand', () => {
  it('一对且筹码足够可分', () => {
    expect(canSplitHand(seatWith([c('8'), c('8')]))).toBe(true)
  })

  it('筹码不足不可分', () => {
    expect(canSplitHand(seatWith([c('8'), c('8')], 10, 50))).toBe(false)
  })

  it('已有两手不可再分', () => {
    const s = seatWith([c('8'), c('8')])
    s.hands.push(createHand({ bet: 50, cards: [c('8', 'clubs')], status: 'playing' }))
    expect(canSplitHand(s)).toBe(false)
  })
})

describe('isAcePair / shouldBotSplit', () => {
  it('识别双 A', () => {
    expect(isAcePair([c('A'), c('A')])).toBe(true)
  })

  it('机器人必分 A 和 8', () => {
    expect(shouldBotSplit([c('A'), c('A')], c('10'))).toBe(true)
    expect(shouldBotSplit([c('8'), c('8')], c('K'))).toBe(true)
  })

  it('机器人不分 10 对', () => {
    expect(shouldBotSplit([c('10'), c('J')], c('6'))).toBe(false)
  })
})
