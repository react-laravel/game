import { describe, expect, it } from 'vitest'
import type { Card, Rank, Suit } from '../../types'
import {
  canEnableAutoPlay,
  decideAutoPlayAction,
  DEFAULT_AUTO_PLAY,
  normalizeAutoPlayForRole,
} from '../autoPlay'

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

describe('坐庄不能托管', () => {
  it('仅闲家可开启托管', () => {
    expect(canEnableAutoPlay('player')).toBe(true)
    expect(canEnableAutoPlay('dealer')).toBe(false)
  })

  it('坐庄时关掉托管，保留自动下一局', () => {
    const next = normalizeAutoPlayForRole(
      { ...DEFAULT_AUTO_PLAY, enabled: true, autoNextRound: true },
      'dealer'
    )
    expect(next.enabled).toBe(false)
    expect(next.autoNextRound).toBe(true)
  })

  it('闲家保持托管开启', () => {
    const next = normalizeAutoPlayForRole(
      { ...DEFAULT_AUTO_PLAY, enabled: true },
      'player'
    )
    expect(next.enabled).toBe(true)
  })
})
