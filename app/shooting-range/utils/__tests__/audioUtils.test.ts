import { beforeEach, describe, expect, it, vi } from 'vitest'
import { playSound, playShotSound, playExplosionSound, playHitSound } from '../audioUtils'

describe('shooting-range audioUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('playSound', () => {
    it('should not throw when Audio constructor is available', () => {
      expect(() => {
        playSound('/sounds/test.mp3', 0.5)
      }).not.toThrow()
    })

    it('should accept custom volume', () => {
      expect(() => {
        playSound('/sounds/test.mp3', 0.8)
      }).not.toThrow()
    })

    it('should accept custom playback rate', () => {
      expect(() => {
        playSound('/sounds/test.mp3', 0.5, 1.5)
      }).not.toThrow()
    })

    it('should accept maxDuration', () => {
      expect(() => {
        playSound('/sounds/test.mp3', 0.5, 1.0, 1000)
      }).not.toThrow()
    })

    it('should use default parameters', () => {
      expect(() => {
        playSound('/sounds/test.mp3')
      }).not.toThrow()
    })
  })

  describe('playShotSound', () => {
    it('uses the valid shooting sound asset', () => {
      playShotSound()

      expect(window.Audio).toHaveBeenCalledWith('/sounds/shot.mp3')
    })
  })

  describe('playExplosionSound', () => {
    it('falls back to the valid shooting sound asset', () => {
      playExplosionSound()

      expect(window.Audio).toHaveBeenCalledWith('/sounds/shot.mp3')
      expect(window.Audio).not.toHaveBeenCalledWith('/sounds/explode.mp3')
    })
  })

  describe('playHitSound', () => {
    it('falls back to the valid shooting sound asset', () => {
      playHitSound()

      expect(window.Audio).toHaveBeenCalledWith('/sounds/shot.mp3')
      expect(window.Audio).not.toHaveBeenCalledWith('/sounds/explode.mp3')
    })
  })
})
