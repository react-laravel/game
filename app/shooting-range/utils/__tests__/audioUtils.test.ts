import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getShootingSfxSettings,
  playExplosionSound,
  playHitSound,
  playMissSound,
  playShotSound,
  primeShootingAudio,
  resetShootingAudio,
  setShootingSfxSettings,
} from '../audioUtils'

function createMockAudioContext() {
  const oscillators: Array<{ type: string; start: ReturnType<typeof vi.fn> }> = []
  const sources: Array<{ start: ReturnType<typeof vi.fn> }> = []
  const filters: Array<{ type: string }> = []

  class MockAudioContext {
    currentTime = 0
    sampleRate = 48000
    destination = {}
    state = 'running'
    close = vi.fn().mockResolvedValue(undefined)
    resume = vi.fn().mockResolvedValue(undefined)

    createGain = () => ({
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    })

    createOscillator = () => {
      const oscillator = {
        type: 'sine',
        frequency: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }
      oscillators.push(oscillator)
      return oscillator
    }

    createBuffer = (_channels: number, length: number, sampleRate: number) => ({
      sampleRate,
      length,
      getChannelData: () => new Float32Array(length),
    })

    createBufferSource = () => {
      const source = {
        buffer: null,
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }
      sources.push(source)
      return source
    }

    createBiquadFilter = () => {
      const filter = {
        type: 'lowpass',
        frequency: { setValueAtTime: vi.fn() },
        Q: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
      }
      filters.push(filter)
      return filter
    }

    createDynamicsCompressor = () => ({
      threshold: { setValueAtTime: vi.fn() },
      knee: { setValueAtTime: vi.fn() },
      ratio: { setValueAtTime: vi.fn() },
      attack: { setValueAtTime: vi.fn() },
      release: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
    })
  }

  return { MockAudioContext, oscillators, sources, filters }
}

describe('shooting-range audioUtils', () => {
  beforeEach(() => {
    resetShootingAudio()
    vi.clearAllMocks()
  })

  it('does not throw when Web Audio is unavailable', () => {
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: undefined,
    })

    expect(() => {
      primeShootingAudio()
      playShotSound()
      playHitSound()
    }).not.toThrow()
    expect(window.Audio).not.toHaveBeenCalled()
  })

  it('primes a reusable noise buffer instead of HTML audio files', () => {
    const { MockAudioContext } = createMockAudioContext()
    const Constructor = vi.fn().mockImplementation(function AudioContext() {
      return new MockAudioContext()
    })
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: Constructor,
    })

    primeShootingAudio()
    primeShootingAudio()

    expect(Constructor).toHaveBeenCalledOnce()
    expect(window.Audio).not.toHaveBeenCalled()
  })

  it('plays a layered gunshot through Web Audio, not shot.mp3', () => {
    const { MockAudioContext, oscillators, sources } = createMockAudioContext()
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: MockAudioContext,
    })

    playShotSound()

    expect(sources.length).toBeGreaterThanOrEqual(2)
    expect(oscillators.length).toBeGreaterThanOrEqual(2)
    expect(oscillators.some(oscillator => oscillator.type === 'sine')).toBe(true)
    expect(window.Audio).not.toHaveBeenCalledWith('/sounds/shot.mp3')
  })

  it('plays a bright metallic hit that is distinct from the gunshot', () => {
    const { MockAudioContext, oscillators, sources } = createMockAudioContext()
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: MockAudioContext,
    })

    playHitSound()

    expect(sources.length).toBe(1)
    expect(oscillators.some(oscillator => oscillator.type === 'sine')).toBe(true)
    expect(oscillators.some(oscillator => oscillator.type === 'triangle')).toBe(true)
    expect(window.Audio).not.toHaveBeenCalledWith('/sounds/explode.mp3')
    expect(window.Audio).not.toHaveBeenCalledWith('/sounds/shot.mp3')
  })

  it('plays a softer miss thud without mp3 fallbacks', () => {
    const { MockAudioContext, oscillators, sources } = createMockAudioContext()
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: MockAudioContext,
    })

    playMissSound()

    expect(sources.length).toBe(1)
    expect(oscillators.some(oscillator => oscillator.type === 'sine')).toBe(true)
    expect(window.Audio).not.toHaveBeenCalled()
  })

  it('skips playback when sfx is muted and scales burst volume', () => {
    const { MockAudioContext, sources } = createMockAudioContext()
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: MockAudioContext,
    })

    setShootingSfxSettings({ muted: true })
    playShotSound()
    expect(sources).toHaveLength(0)

    setShootingSfxSettings({ muted: false, volume: 0.5 })
    playShotSound()
    expect(sources.length).toBeGreaterThan(0)
    expect(getShootingSfxSettings()).toEqual({ volume: 0.5, muted: false })
  })

  it('keeps the explosion alias on the hit voice, not an mp3', () => {
    const { MockAudioContext, oscillators } = createMockAudioContext()
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: MockAudioContext,
    })

    playExplosionSound()

    expect(oscillators.some(oscillator => oscillator.type === 'triangle')).toBe(true)
    expect(window.Audio).not.toHaveBeenCalledWith('/sounds/explode.mp3')
  })
})
