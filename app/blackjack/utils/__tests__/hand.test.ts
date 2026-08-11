import { describe, expect, it } from 'vitest'
import type { Card, Rank, Suit } from '../../types'
import { dealerMustHit, evaluateHand } from '../hand'

function c(rank: Rank, suit: Suit = 'spades', id = rank): Card {
  return { rank, suit, id }
}

describe('evaluateHand', () => {
  it('计算数字牌', () => {
    expect(evaluateHand([c('5'), c('7')]).total).toBe(12)
    expect(evaluateHand([c('10'), c('9')]).total).toBe(19)
  })

  it('花牌算 10', () => {
    expect(evaluateHand([c('J'), c('Q')]).total).toBe(20)
    expect(evaluateHand([c('K'), c('5')]).total).toBe(15)
  })

  it('A 可算 11', () => {
    const h = evaluateHand([c('A'), c('9')])
    expect(h.total).toBe(20)
    expect(h.soft).toBe(true)
    expect(h.isBlackjack).toBe(false)
  })

  it('A 爆牌时降为 1', () => {
    const h = evaluateHand([c('A'), c('9'), c('5')])
    expect(h.total).toBe(15)
    expect(h.soft).toBe(false)
  })

  it('识别黑杰克', () => {
    expect(evaluateHand([c('A'), c('K')]).isBlackjack).toBe(true)
    expect(evaluateHand([c('A'), c('10')]).isBlackjack).toBe(true)
    expect(evaluateHand([c('A'), c('9'), c('A')]).isBlackjack).toBe(false)
  })

  it('识别爆牌', () => {
    const h = evaluateHand([c('K'), c('Q'), c('5')])
    expect(h.isBust).toBe(true)
    expect(h.total).toBe(25)
  })

  it('两张 A 为软 12', () => {
    const h = evaluateHand([c('A', 'hearts'), c('A', 'spades')])
    expect(h.total).toBe(12)
    expect(h.soft).toBe(true)
  })
})

describe('dealerMustHit', () => {
  it('16 及以下必须要牌', () => {
    expect(dealerMustHit([c('10'), c('6')])).toBe(true)
    expect(dealerMustHit([c('5'), c('5'), c('5')])).toBe(true)
  })

  it('硬 17 停牌', () => {
    expect(dealerMustHit([c('10'), c('7')])).toBe(false)
  })

  it('软 17 停牌（S17）', () => {
    expect(dealerMustHit([c('A'), c('6')])).toBe(false)
  })

  it('软 16 要牌', () => {
    expect(dealerMustHit([c('A'), c('5')])).toBe(true)
  })
})
