import { afterEach, describe, expect, it } from 'vitest'
import {
  ACCOUNT_INITIAL_CHIPS,
  applyAccountDelta,
  clampAccountChips,
  loadAccountChips,
  saveAccountChips,
} from '../wallet'

describe('wallet', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('clamp 仅保底 0，无上限', () => {
    expect(clampAccountChips(-10)).toBe(0)
    expect(clampAccountChips(50_000)).toBe(50_000)
    expect(clampAccountChips(1234.9)).toBe(1234)
  })

  it('首次加载发放固定初始筹码', () => {
    expect(loadAccountChips(42)).toBe(ACCOUNT_INITIAL_CHIPS)
    expect(localStorage.getItem('blackjack-wallet-v1:42')).toBe(String(ACCOUNT_INITIAL_CHIPS))
  })

  it('已有余额 0 不会重置', () => {
    saveAccountChips(7, 0)
    expect(loadAccountChips(7)).toBe(0)
  })

  it('可赢超过初始 10000', () => {
    saveAccountChips(1, ACCOUNT_INITIAL_CHIPS)
    expect(applyAccountDelta(1, ACCOUNT_INITIAL_CHIPS, 5000)).toBe(15_000)
  })

  it('输掉不会低于 0', () => {
    saveAccountChips(2, 30)
    expect(applyAccountDelta(2, 30, -100)).toBe(0)
  })
})
