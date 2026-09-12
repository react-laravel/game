import { describe, expect, it } from 'vitest'
import {
  DIRECTION_ANGLE,
  headingFromSegments,
  headAngle,
  toCellCenter,
  toPolylinePoints,
} from '../snakePath'

describe('headingFromSegments', () => {
  it('单节时使用当前前进方向', () => {
    expect(headingFromSegments({ x: 4, y: 4 }, undefined, 'UP')).toBe('UP')
  })

  it('头在身体右侧时朝右，而不是对着身体', () => {
    expect(headingFromSegments({ x: 5, y: 4 }, { x: 4, y: 4 }, 'LEFT')).toBe('RIGHT')
  })

  it('头在身体左侧时朝左', () => {
    expect(headingFromSegments({ x: 3, y: 4 }, { x: 4, y: 4 }, 'RIGHT')).toBe('LEFT')
  })

  it('头在身体下方时朝下', () => {
    expect(headingFromSegments({ x: 4, y: 5 }, { x: 4, y: 4 }, 'UP')).toBe('DOWN')
  })

  it('头在身体上方时朝上', () => {
    expect(headingFromSegments({ x: 4, y: 3 }, { x: 4, y: 4 }, 'DOWN')).toBe('UP')
  })
})

describe('toPolylinePoints', () => {
  it('把格子坐标转成单元格中心，供圆角折线跟随转弯', () => {
    expect(toPolylinePoints([{ x: 2, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 2 }])).toBe(
      '2.5,1.5 2.5,2.5 3.5,2.5'
    )
  })
})

describe('headAngle', () => {
  it('右转路径上蛇头旋转 0 度', () => {
    expect(headAngle([{ x: 3, y: 2 }, { x: 2, y: 2 }], 'RIGHT')).toBe(DIRECTION_ANGLE.RIGHT)
  })

  it('向下转弯后蛇头旋转 90 度', () => {
    expect(headAngle([{ x: 3, y: 3 }, { x: 3, y: 2 }, { x: 2, y: 2 }], 'DOWN')).toBe(
      DIRECTION_ANGLE.DOWN
    )
  })
})

describe('toCellCenter', () => {
  it('把格子左上角映射到中心点', () => {
    expect(toCellCenter({ x: 0, y: 7 })).toEqual({ x: 0.5, y: 7.5 })
  })
})
