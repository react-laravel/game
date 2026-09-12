import { useCallback, useEffect, useRef } from 'react'

export type BowlingSound = 'throw' | 'pins' | 'strike' | 'spare' | 'gutter'

const SOUND_MUTED_STORAGE_KEY = 'bowling-sound-muted'

interface SoundNote {
  frequency: number
  duration: number
  offset?: number
  type: OscillatorType
  volume: number
}

const SOUND_PATTERNS: Record<BowlingSound, SoundNote[]> = {
  throw: [
    { frequency: 90, duration: 0.12, type: 'triangle', volume: 0.05 },
    { frequency: 140, duration: 0.16, offset: 0.04, type: 'sawtooth', volume: 0.03 },
  ],
  pins: [
    { frequency: 220, duration: 0.05, type: 'square', volume: 0.04 },
    { frequency: 160, duration: 0.08, offset: 0.03, type: 'triangle', volume: 0.045 },
    { frequency: 110, duration: 0.1, offset: 0.07, type: 'square', volume: 0.03 },
  ],
  strike: [
    { frequency: 392, duration: 0.1, type: 'triangle', volume: 0.06 },
    { frequency: 523, duration: 0.12, offset: 0.08, type: 'triangle', volume: 0.055 },
    { frequency: 784, duration: 0.16, offset: 0.16, type: 'triangle', volume: 0.05 },
  ],
  spare: [
    { frequency: 330, duration: 0.08, type: 'triangle', volume: 0.05 },
    { frequency: 440, duration: 0.12, offset: 0.07, type: 'triangle', volume: 0.045 },
  ],
  gutter: [{ frequency: 80, duration: 0.18, type: 'sawtooth', volume: 0.035 }],
}

type AudioContextWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext
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
    gain.gain.exponentialRampToValueAtTime(note.volume, noteStart + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(noteStart)
    oscillator.stop(noteEnd + 0.02)
  })
}

export function useBowlingSounds() {
  const contextRef = useRef<AudioContext | null>(null)
  const mutedRef = useRef(false)

  useEffect(() => {
    mutedRef.current = window.localStorage.getItem(SOUND_MUTED_STORAGE_KEY) === 'true'
  }, [])

  const ensureContext = useCallback(() => {
    if (contextRef.current) return contextRef.current
    const AudioContextClass =
      window.AudioContext || (window as AudioContextWindow).webkitAudioContext
    if (!AudioContextClass) return null
    contextRef.current = new AudioContextClass()
    return contextRef.current
  }, [])

  const play = useCallback(
    (sound: BowlingSound) => {
      if (mutedRef.current) return
      const context = ensureContext()
      if (!context) return
      if (context.state === 'suspended') void context.resume()
      playPattern(context, SOUND_PATTERNS[sound])
    },
    [ensureContext]
  )

  return { play }
}
