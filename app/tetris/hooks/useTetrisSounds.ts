import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'

export type TetrisSound = 'move' | 'rotate' | 'lock' | 'drop' | 'clear' | 'gameOver'

interface SoundNote {
  frequency: number
  duration: number
  offset?: number
  type: OscillatorType
  volume: number
}

const SOUND_MUTED_STORAGE_KEY = 'tetris-sound-muted'
const soundListeners = new Set<() => void>()

const SOUND_PATTERNS: Record<TetrisSound, SoundNote[]> = {
  move: [{ frequency: 180, duration: 0.025, type: 'square', volume: 0.025 }],
  rotate: [
    { frequency: 260, duration: 0.035, type: 'triangle', volume: 0.035 },
    { frequency: 340, duration: 0.045, offset: 0.025, type: 'triangle', volume: 0.03 },
  ],
  lock: [{ frequency: 110, duration: 0.055, type: 'triangle', volume: 0.045 }],
  drop: [
    { frequency: 150, duration: 0.045, type: 'square', volume: 0.045 },
    { frequency: 80, duration: 0.08, offset: 0.035, type: 'triangle', volume: 0.05 },
  ],
  clear: [
    { frequency: 440, duration: 0.08, type: 'triangle', volume: 0.055 },
    { frequency: 660, duration: 0.08, offset: 0.065, type: 'triangle', volume: 0.05 },
    { frequency: 880, duration: 0.12, offset: 0.13, type: 'triangle', volume: 0.045 },
  ],
  gameOver: [
    { frequency: 330, duration: 0.12, type: 'sawtooth', volume: 0.04 },
    { frequency: 220, duration: 0.14, offset: 0.1, type: 'sawtooth', volume: 0.04 },
    { frequency: 110, duration: 0.22, offset: 0.22, type: 'sawtooth', volume: 0.035 },
  ],
}

type AudioContextWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext
  }

function getMutedSnapshot(): boolean {
  return window.localStorage.getItem(SOUND_MUTED_STORAGE_KEY) === 'true'
}

function subscribeToMuted(listener: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === SOUND_MUTED_STORAGE_KEY) listener()
  }

  soundListeners.add(listener)
  window.addEventListener('storage', handleStorage)

  return () => {
    soundListeners.delete(listener)
    window.removeEventListener('storage', handleStorage)
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
    oscillator.frequency.setValueAtTime(note.frequency, noteStart)
    gain.gain.setValueAtTime(0.0001, noteStart)
    gain.gain.exponentialRampToValueAtTime(note.volume, noteStart + 0.006)
    gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(noteStart)
    oscillator.stop(noteEnd + 0.02)
  })
}

export function useTetrisSounds() {
  const muted = useSyncExternalStore(subscribeToMuted, getMutedSnapshot, () => false)
  const audioContextRef = useRef<AudioContext | null>(null)

  const playSound = useCallback(
    (sound: TetrisSound) => {
      if (muted || typeof window === 'undefined') return

      const audioWindow = window as AudioContextWindow
      const AudioContextConstructor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext
      if (!AudioContextConstructor) return

      const context = audioContextRef.current ?? new AudioContextConstructor()
      audioContextRef.current = context

      if (context.state === 'suspended') {
        void context
          .resume()
          .then(() => playPattern(context, SOUND_PATTERNS[sound]))
          .catch(() => undefined)
        return
      }

      playPattern(context, SOUND_PATTERNS[sound])
    },
    [muted]
  )

  const toggleMuted = useCallback(() => {
    window.localStorage.setItem(SOUND_MUTED_STORAGE_KEY, String(!getMutedSnapshot()))
    soundListeners.forEach(listener => listener())
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
