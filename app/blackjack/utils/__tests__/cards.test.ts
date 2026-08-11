import { describe, expect, it } from 'vitest'
import { createShoe, drawCard, rankValue, shuffle } from '../cards'

describe('cards', () => {
  it('6 副牌共 312 张', () => {
    expect(createShoe(6)).toHaveLength(312)
  })

  it('drawCard 减少一张', () => {
    const shoe = createShoe(1)
    const { card, shoe: rest } = drawCard(shoe)
    expect(card).toBeDefined()
    expect(rest).toHaveLength(51)
  })

  it('rankValue 正确', () => {
    expect(rankValue('A')).toBe(11)
    expect(rankValue('K')).toBe(10)
    expect(rankValue('7')).toBe(7)
  })

  it('shuffle 保持长度与元素', () => {
    const arr = [1, 2, 3, 4, 5]
    const s = shuffle(arr)
    expect(s).toHaveLength(5)
    expect(s.sort()).toEqual([1, 2, 3, 4, 5])
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })
})
