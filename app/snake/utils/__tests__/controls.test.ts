import { describe, expect, it } from 'vitest'
import {
  canChangeToDirection,
  directionFromKey,
  KEY_DIRECTION_MAP,
  OPPOSITE_DIRECTIONS,
} from '../controls'

describe('snake controls', () => {
  it('maps arrow keys and WASD to directions', () => {
    expect(directionFromKey('ArrowUp')).toBe('UP')
    expect(directionFromKey('ArrowDown')).toBe('DOWN')
    expect(directionFromKey('ArrowLeft')).toBe('LEFT')
    expect(directionFromKey('ArrowRight')).toBe('RIGHT')
    expect(directionFromKey('w')).toBe('UP')
    expect(directionFromKey('W')).toBe('UP')
    expect(directionFromKey('a')).toBe('LEFT')
    expect(directionFromKey('s')).toBe('DOWN')
    expect(directionFromKey('d')).toBe('RIGHT')
    expect(directionFromKey('x')).toBeNull()
  })

  it('exposes every mapped key in KEY_DIRECTION_MAP', () => {
    expect(Object.keys(KEY_DIRECTION_MAP)).toEqual([
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'w',
      'W',
      's',
      'S',
      'a',
      'A',
      'd',
      'D',
    ])
  })

  it('rejects opposite and duplicate directions', () => {
    expect(canChangeToDirection('RIGHT', 'LEFT')).toBe(false)
    expect(canChangeToDirection('RIGHT', 'RIGHT')).toBe(false)
    expect(canChangeToDirection('RIGHT', 'UP')).toBe(true)
    expect(canChangeToDirection('UP', OPPOSITE_DIRECTIONS.UP)).toBe(false)
  })
})
