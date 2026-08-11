import { describe, expect, it } from 'vitest'
import { amountToChips, snapToChip } from '../chips'

describe('amountToChips', () => {
  it('贪心拆分常见金额', () => {
    expect(amountToChips(375)).toEqual([200, 100, 50, 20, 5])
    expect(amountToChips(15)).toEqual([10, 5])
    expect(amountToChips(200)).toEqual([200])
  })

  it('0 与负数为空', () => {
    expect(amountToChips(0)).toEqual([])
    expect(amountToChips(-10)).toEqual([])
  })
})

describe('snapToChip', () => {
  it('对齐到 5', () => {
    expect(snapToChip(23)).toBe(20)
    expect(snapToChip(5)).toBe(5)
  })
})
