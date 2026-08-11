'use client'

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import { subscribeBlackjackSfx, type BlackjackSfx } from '../utils/sfx'

interface SoundNote {
  frequency: number
  duration: number
  offset?: number
  type: OscillatorType
  volume: number
  /** 可选频率扫到 */
  frequencyEnd?: number
}

const SOUND_MUTED_STORAGE_KEY = 'blackjack-sound-muted'
const soundListeners = new Set<() => void>()

const PATTERNS: Record<BlackjackSfx, SoundNote[]> = {
  deal: [
    { frequency: 520, duration: 0.04, type: 'triangle', volume: 0.04 },
    { frequency: 280, duration: 0.06, offset: 0.02, type: 'sine', volume: 0.035, frequencyEnd: 180 },
  ],
  chip: [
    { frequency: 880, duration: 0.03, type: 'square', volume: 0.028 },
    { frequency: 660, duration: 0.04, offset: 0.025, type: 'triangle', volume: 0.03 },
  ],
  hit: [
    { frequency: 420, duration: 0.05, type: 'triangle', volume: 0.04 },
    { frequency: 300, duration: 0.07, offset: 0.03, type: 'sine', volume: 0.03, frequencyEnd: 200 },
  ],
  stand: [{ frequency: 240, duration: 0.08, type: 'sine', volume: 0.035 }],
  double: [
    { frequency: 360, duration: 0.05, type: 'triangle', volume: 0.04 },
    { frequency: 540, duration: 0.06, offset: 0.05, type: 'triangle', volume: 0.038 },
  ],
  bust: [
    { frequency: 220, duration: 0.1, type: 'sawtooth', volume: 0.035, frequencyEnd: 90 },
    { frequency: 120, duration: 0.14, offset: 0.08, type: 'triangle', volume: 0.04 },
  ],
  reveal: [
    { frequency: 400, duration: 0.06, type: 'triangle', volume: 0.04 },
    { frequency: 620, duration: 0.08, offset: 0.05, type: 'sine', volume: 0.035 },
  ],
  shuffle: [
    { frequency: 180, duration: 0.04, type: 'square', volume: 0.02 },
    { frequency: 260, duration: 0.04, offset: 0.04, type: 'square', volume: 0.018 },
    { frequency: 200, duration: 0.04, offset: 0.08, type: 'square', volume: 0.02 },
    { frequency: 300, duration: 0.05, offset: 0.12, type: 'triangle', volume: 0.022 },
  ],
  win: [
    { frequency: 523, duration: 0.09, type: 'triangle', volume: 0.05 },
    { frequency: 659, duration: 0.09, offset: 0.08, type: 'triangle', volume: 0.045 },
    { frequency: 784, duration: 0.14, offset: 0.16, type: 'triangle', volume: 0.05 },
  ],
  lose: [
    { frequency: 300, duration: 0.1, type: 'sawtooth', volume: 0.03, frequencyEnd: 180 },
    { frequency: 160, duration: 0.16, offset: 0.1, type: 'triangle', volume: 0.035 },
  ],
  push: [
    { frequency: 330, duration: 0.08, type: 'sine', volume: 0.035 },
    { frequency: 330, duration: 0.08, offset: 0.1, type: 'sine', volume: 0.03 },
  ],
  blackjack: [
    { frequency: 523, duration: 0.08, type: 'triangle', volume: 0.05 },
    { frequency: 659, duration: 0.08, offset: 0.07, type: 'triangle', volume: 0.048 },
    { frequency: 784, duration: 0.08, offset: 0.14, type: 'triangle', volume: 0.05 },
    { frequency: 1046, duration: 0.16, offset: 0.22, type: 'sine', volume: 0.045 },
  ],
  turn: [
    { frequency: 640, duration: 0.05, type: 'sine', volume: 0.03 },
    { frequency: 800, duration: 0.06, offset: 0.04, type: 'sine', volume: 0.028 },
  ],
  click: [{ frequency: 500, duration: 0.025, type: 'triangle', volume: 0.025 }],
}

type AudioContextWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext
  }

function getMutedSnapshot(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(SOUND_MUTED_STORAGE_KEY) === 'true'
}

function subscribeToMuted(listener: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === SOUND_MUTED_STORAGE_KEY) listener()
  }
  soundListeners.add(listener)
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage)
  }
  return () => {
    soundListeners.delete(listener)
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage)
    }
  }
}

function playPattern(context: AudioContext, notes: SoundNote[]) {
  const startTime = context.currentTime

  notes.forEach(note => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const noteStart = startTime + (note.offset ?? 0)
    const noteEnd = noteStart + note.duration

    oscillator.type = note.type
    if (note.frequencyEnd) {
      oscillator.frequency.setValueAtTime(note.frequency, noteStart)
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(40, note.frequencyEnd),
        noteEnd
      )
    } else {
      oscillator.frequency.setValueAtTime(note.frequency, noteStart)
    }

    gain.gain.setValueAtTime(0.0001, noteStart)
    gain.gain.exponentialRampToValueAtTime(note.volume, noteStart + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd)

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(noteStart)
    oscillator.stop(noteEnd + 0.02)
  })
}

export function useBlackjackSounds() {
  const muted = useSyncExternalStore(subscribeToMuted, getMutedSnapshot, () => false)
  const audioContextRef = useRef<AudioContext | null>(null)

  const playSound = useCallback(
    (sfx: BlackjackSfx) => {
      if (muted || typeof window === 'undefined') return

      const audioWindow = window as AudioContextWindow
      const AudioContextConstructor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext
      if (!AudioContextConstructor) return

      const context = audioContextRef.current ?? new AudioContextConstructor()
      audioContextRef.current = context

      const run = () => playPattern(context, PATTERNS[sfx])

      if (context.state === 'suspended') {
        void context.resume().then(run).catch(() => undefined)
        return
      }
      run()
    },
    [muted]
  )

  const toggleMuted = useCallback(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(SOUND_MUTED_STORAGE_KEY, String(!getMutedSnapshot()))
    soundListeners.forEach(listener => listener())
  }, [])

  // 订阅 store 音效事件
  useEffect(() => {
    return subscribeBlackjackSfx(sfx => {
      playSound(sfx)
    })
  }, [playSound])

  // 首次交互解锁 AudioContext
  useEffect(() => {
    if (typeof window === 'undefined') return
    const unlock = () => {
      const audioWindow = window as AudioContextWindow
      const Ctor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext
      if (!Ctor) return
      const ctx = audioContextRef.current ?? new Ctor()
      audioContextRef.current = ctx
      if (ctx.state === 'suspended') void ctx.resume()
    }
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  useEffect(
    () => () => {
      const context = audioContextRef.current
      audioContextRef.current = null
      if (context && context.state !== 'closed') void context.close()
    },
    []
  )

  return { muted, playSound, toggleMuted }
}
