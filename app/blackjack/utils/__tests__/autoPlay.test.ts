import { describe, expect, it } from 'vitest'
import type { Card, Rank, Suit } from '../../types'
import { decideAutoPlayAction, DEFAULT_AUTO_PLAY } from '../autoPlay'

function c(rank: Rank, suit: Suit = 'spades'): Card {
  return { rank, suit, id: rank + suit }
}

const base = { ...DEFAULT_AUTO_PLAY, enabled: true }

describe('decideAutoPlayAction', () => {
  it('硬牌 16 对默认 17 要牌', () => {
    expect(
      decideAutoPlayAction([c('10'), c('6')], 500, 20, true, base)
    ).toBe('hit')
  })

  it('硬牌 17 停牌', () => {
    expect(
      decideAutoPlayAction([c('10'), c('7')], 500, 20, true, base)
    ).toBe('stand')
  })

  it('硬牌停牌点设为 16 时 16 停', () => {
    expect(
      decideAutoPlayAction([c('10'), c('6')], 500, 20, true, {
        ...base,
        hardStandAt: 16,
      })
    ).toBe('stand')
  })

  it('软 17 默认要牌（softStandAt 18）', () => {
    expect(
      decideAutoPlayAction([c('A'), c('6')], 500, 20, false, base)
    ).toBe('hit')
  })

  it('软 17 且 softStandAt=17 时停牌', () => {
    expect(
      decideAutoPlayAction([c('A'), c('6')], 500, 20, false, {
        ...base,
        softStandAt: 17,
      })
    ).toBe('stand')
  })

  it('硬 11 可加倍时加倍', () => {
    expect(
      decideAutoPlayAction([c('5'), c('6')], 500, 20, true, base)
    ).toBe('double')
  })

  it('关闭加倍时硬 11 要牌', () => {
    expect(
      decideAutoPlayAction([c('5'), c('6')], 500, 20, true, {
        ...base,
        allowDouble: false,
      })
    ).toBe('hit')
  })

  it('硬 12 且 hardStandAt=17 要牌', () => {
    expect(
      decideAutoPlayAction([c('5'), c('7')], 500, 20, false, base)
    ).toBe('hit')
  })
})
