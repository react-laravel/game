import { describe, expect, it } from 'vitest'
import type { Card, Rank, Suit } from '../../types'
import { decideBotAction, decideBotBet } from '../bot'
import { MIN_BET } from '../../constants'

function c(rank: Rank, suit: Suit = 'hearts'): Card {
  return { rank, suit, id: rank + suit }
}

describe('decideBotAction', () => {
  it('硬 11 对庄家任意明牌加倍', () => {
    expect(decideBotAction([c('5'), c('6')], c('10'), 500, 50, true)).toBe('double')
  })

  it('硬 17 停牌', () => {
    expect(decideBotAction([c('10'), c('7')], c('A'), 500, 50, true)).toBe('stand')
  })

  it('硬 12 对庄家 7 要牌', () => {
    expect(decideBotAction([c('5'), c('7')], c('7'), 500, 50, true)).toBe('hit')
  })

  it('硬 13 对庄家 6 停牌', () => {
    expect(decideBotAction([c('6'), c('7')], c('6'), 500, 50, true)).toBe('stand')
  })

  it('软 18 对 10 要牌', () => {
    expect(decideBotAction([c('A'), c('7')], c('10'), 500, 50, false)).toBe('hit')
  })

  it('软 18 对 6 可加倍', () => {
    expect(decideBotAction([c('A'), c('7')], c('6'), 500, 50, true)).toBe('double')
  })

  it('不能加倍时硬 11 要牌', () => {
    expect(decideBotAction([c('5'), c('6')], c('9'), 10, 50, false)).toBe('hit')
  })
})

describe('decideBotBet', () => {
  it('筹码不足最小注返回 0', () => {
    expect(decideBotBet(5)).toBe(0)
  })

  it('下注在范围内且为 10 的倍数', () => {
    for (let i = 0; i < 20; i++) {
      const bet = decideBotBet(1000)
      expect(bet).toBeGreaterThanOrEqual(MIN_BET)
      expect(bet).toBeLessThanOrEqual(500)
      expect(bet % 10).toBe(0)
    }
  })

  it('不超过持有筹码', () => {
    const bet = decideBotBet(30)
    expect(bet).toBeLessThanOrEqual(30)
    expect(bet).toBeGreaterThanOrEqual(MIN_BET)
  })
})
