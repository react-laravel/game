import { describe, expect, it } from 'vitest'
import {
  applyTargetHit,
  generateRandomPosition,
  generateRandomDirection,
  generateWallPosition,
  difficultySettings,
  respawnTarget,
} from '../gameUtils'

describe('shooting-range gameUtils', () => {
  describe('generateWallPosition', () => {
    it('places static wall targets in readable tiers', () => {
      const first = generateWallPosition(0, 20)
      const second = generateWallPosition(1, 20)
      const fifth = generateWallPosition(4, 20)

      expect(first[1]).toBeGreaterThan(1.5)
      expect(second[0]).not.toBeCloseTo(first[0], 0)
      expect(fifth[1]).toBeGreaterThan(first[1])
      expect(fifth[2]).toBeLessThan(0)
    })
  })

  describe('generateRandomPosition', () => {
    it('should return a 3-tuple', () => {
      const pos = generateRandomPosition(20)
      expect(pos).toHaveLength(3)
    })

    it('should return numbers', () => {
      const pos = generateRandomPosition(20)
      expect(typeof pos[0]).toBe('number')
      expect(typeof pos[1]).toBe('number')
      expect(typeof pos[2]).toBe('number')
    })

    it('should generate positions within game area bounds', () => {
      const gameAreaSize = 20
      for (let i = 0; i < 100; i++) {
        const [x, y, z] = generateRandomPosition(gameAreaSize)
        expect(Math.abs(x)).toBeLessThanOrEqual(gameAreaSize / 2)
        expect(y).toBeGreaterThanOrEqual(-gameAreaSize / 4 + 2)
        expect(y).toBeLessThanOrEqual(gameAreaSize / 4 + 2)
      }
    })

    it('should scale with game area size', () => {
      const posSmall = generateRandomPosition(10)
      const posLarge = generateRandomPosition(40)

      // Both should have valid coordinates
      expect(posSmall.every(n => typeof n === 'number' && !isNaN(n))).toBe(true)
      expect(posLarge.every(n => typeof n === 'number' && !isNaN(n))).toBe(true)
    })
  })

  describe('generateRandomDirection', () => {
    it('should return a 3-tuple', () => {
      const dir = generateRandomDirection()
      expect(dir).toHaveLength(3)
    })

    it('should return normalized vector (length ≈ 1)', () => {
      for (let i = 0; i < 50; i++) {
        const [x, y, z] = generateRandomDirection()
        const length = Math.sqrt(x ** 2 + y ** 2 + z ** 2)
        expect(length).toBeCloseTo(1, 5)
      }
    })

    it('should return numbers', () => {
      const dir = generateRandomDirection()
      expect(typeof dir[0]).toBe('number')
      expect(typeof dir[1]).toBe('number')
      expect(typeof dir[2]).toBe('number')
    })
  })

  describe('target runtime', () => {
    it('marks a target as hit without replacing it', () => {
      const target = {
        userData: { hit: false },
        position: {
          x: 1,
          y: 2,
          z: 3,
          set(x: number, y: number, z: number) {
            this.x = x
            this.y = y
            this.z = z
          },
        },
      }

      applyTargetHit(target)

      expect(target.userData.hit).toBe(true)
      expect(target.position).toEqual(expect.objectContaining({ x: 1, y: 2, z: 3 }))
    })

    it('respawns a target at a new position and clears the hit flag', () => {
      const direction = {
        x: 1,
        y: 0,
        z: 0,
        set(x: number, y: number, z: number) {
          this.x = x
          this.y = y
          this.z = z
        },
      }
      const target = {
        userData: { hit: true, direction },
        position: {
          x: 1,
          y: 2,
          z: 3,
          set(x: number, y: number, z: number) {
            this.x = x
            this.y = y
            this.z = z
          },
        },
      }

      respawnTarget(target, 20)

      expect(target.userData.hit).toBe(false)
      expect(target.position.z).toBeLessThan(0)
      expect(Math.hypot(direction.x, direction.y, direction.z)).toBeCloseTo(1, 5)
    })
  })

  describe('difficultySettings', () => {
    it('should have easy, medium, and hard settings', () => {
      expect(difficultySettings.easy).toBeDefined()
      expect(difficultySettings.medium).toBeDefined()
      expect(difficultySettings.hard).toBeDefined()
    })

    it('should have correct easy settings', () => {
      expect(difficultySettings.easy.targetCount).toBe(8)
      expect(difficultySettings.easy.targetSpeed).toBe(0.01)
      expect(difficultySettings.easy.gameAreaSize).toBe(20)
    })

    it('should have correct medium settings', () => {
      expect(difficultySettings.medium.targetCount).toBe(12)
      expect(difficultySettings.medium.targetSpeed).toBe(0.02)
      expect(difficultySettings.medium.gameAreaSize).toBe(25)
    })

    it('should have correct hard settings', () => {
      expect(difficultySettings.hard.targetCount).toBe(16)
      expect(difficultySettings.hard.targetSpeed).toBe(0.05)
      expect(difficultySettings.hard.gameAreaSize).toBe(30)
    })

    it('should have increasing difficulty', () => {
      expect(difficultySettings.hard.targetCount).toBeGreaterThan(
        difficultySettings.medium.targetCount
      )
      expect(difficultySettings.medium.targetCount).toBeGreaterThan(
        difficultySettings.easy.targetCount
      )
      expect(difficultySettings.hard.targetSpeed).toBeGreaterThan(
        difficultySettings.medium.targetSpeed
      )
      expect(difficultySettings.medium.targetSpeed).toBeGreaterThan(
        difficultySettings.easy.targetSpeed
      )
      expect(difficultySettings.hard.gameAreaSize).toBeGreaterThan(
        difficultySettings.medium.gameAreaSize
      )
      expect(difficultySettings.medium.gameAreaSize).toBeGreaterThan(
        difficultySettings.easy.gameAreaSize
      )
    })
  })
})
