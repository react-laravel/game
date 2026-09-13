/**
 * Indoor-range gun and target hits are synthesized with Web Audio.
 * Reusing one MP3 at different playback rates made every shot and impact sound
 * like the same clip, and allocating HTMLAudioElements on hit caused extra work.
 */

import { DEFAULT_SFX_VOLUME, normalizeSfxMuted, normalizeSfxVolume } from './sfxVolume'

type AudioContextWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext
  }

interface NoiseBurst {
  start: number
  duration: number
  volume: number
  highpass?: number
  lowpass?: number
  bandpass?: number
  q?: number
}

interface ToneBurst {
  type: OscillatorType
  frequency: number
  frequencyEnd?: number
  duration: number
  volume: number
  start: number
}

let audioContext: AudioContext | null = null
let noiseBuffer: AudioBuffer | null = null
let output: AudioNode | null = null
let sfxVolume = DEFAULT_SFX_VOLUME
let sfxMuted = false

export interface ShootingSfxSettings {
  volume: number
  muted: boolean
}

export function setShootingSfxSettings(settings: Partial<ShootingSfxSettings>) {
  if (settings.volume !== undefined) {
    sfxVolume = normalizeSfxVolume(settings.volume)
  }
  if (settings.muted !== undefined) {
    sfxMuted = normalizeSfxMuted(settings.muted)
  }
}

export function getShootingSfxSettings(): ShootingSfxSettings {
  return { volume: sfxVolume, muted: sfxMuted }
}

function getAudioContextConstructor() {
  if (typeof window === 'undefined') return undefined
  const audioWindow = window as AudioContextWindow
  return audioWindow.AudioContext ?? audioWindow.webkitAudioContext
}

function ensureContext() {
  const AudioContextConstructor = getAudioContextConstructor()
  if (!AudioContextConstructor) return null
  if (audioContext && audioContext.state !== 'closed') return audioContext

  audioContext = new AudioContextConstructor()
  output = createOutput(audioContext)
  noiseBuffer = null
  return audioContext
}

function createOutput(context: AudioContext) {
  const master = context.createGain()
  master.gain.value = 0.85

  if (typeof context.createDynamicsCompressor !== 'function') {
    master.connect(context.destination)
    return master
  }

  const compressor = context.createDynamicsCompressor()
  compressor.threshold.setValueAtTime(-14, context.currentTime)
  compressor.knee.setValueAtTime(10, context.currentTime)
  compressor.ratio.setValueAtTime(5, context.currentTime)
  compressor.attack.setValueAtTime(0.003, context.currentTime)
  compressor.release.setValueAtTime(0.09, context.currentTime)
  master.connect(compressor)
  compressor.connect(context.destination)
  return master
}

function ensureNoiseBuffer(context: AudioContext) {
  if (noiseBuffer && noiseBuffer.sampleRate === context.sampleRate) return noiseBuffer

  const duration = 0.2
  const length = Math.max(1, Math.floor(context.sampleRate * duration))
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < length; index += 1) {
    data[index] = Math.random() * 2 - 1
  }
  noiseBuffer = buffer
  return buffer
}

function jitter(value: number, amount = 0.1) {
  return value * (1 + (Math.random() - 0.5) * amount)
}

function playNoiseBurst(context: AudioContext, destination: AudioNode, burst: NoiseBurst) {
  const source = context.createBufferSource()
  source.buffer = ensureNoiseBuffer(context)

  const gain = context.createGain()
  const end = burst.start + burst.duration
  gain.gain.setValueAtTime(0.0001, burst.start)
  gain.gain.exponentialRampToValueAtTime(burst.volume, burst.start + 0.004)
  gain.gain.exponentialRampToValueAtTime(0.0001, end)

  let node: AudioNode = source
  const connectFilter = (type: BiquadFilterType, frequency: number, q?: number) => {
    const filter = context.createBiquadFilter()
    filter.type = type
    filter.frequency.setValueAtTime(frequency, burst.start)
    if (q !== undefined) filter.Q.setValueAtTime(q, burst.start)
    node.connect(filter)
    node = filter
  }

  if (burst.highpass) connectFilter('highpass', burst.highpass)
  if (burst.bandpass) connectFilter('bandpass', burst.bandpass, burst.q ?? 1)
  if (burst.lowpass) connectFilter('lowpass', burst.lowpass)

  node.connect(gain)
  gain.connect(destination)
  source.start(burst.start)
  source.stop(end + 0.02)
}

function playTone(context: AudioContext, destination: AudioNode, tone: ToneBurst) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const end = tone.start + tone.duration

  oscillator.type = tone.type
  oscillator.frequency.setValueAtTime(tone.frequency, tone.start)
  if (tone.frequencyEnd) {
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, tone.frequencyEnd), end)
  }

  gain.gain.setValueAtTime(0.0001, tone.start)
  gain.gain.exponentialRampToValueAtTime(tone.volume, tone.start + 0.003)
  gain.gain.exponentialRampToValueAtTime(0.0001, end)

  oscillator.connect(gain)
  gain.connect(destination)
  oscillator.start(tone.start)
  oscillator.stop(end + 0.02)
}

function withAudio(play: (context: AudioContext, destination: AudioNode, volumeScale: number) => void) {
  try {
    const context = ensureContext()
    if (!context || !output || sfxMuted) return
    if (context.state === 'suspended') void context.resume().catch(() => undefined)
    play(context, output, sfxVolume)
  } catch {
    // Audio is optional feedback and must never interrupt the render loop.
  }
}

export const resetShootingAudio = () => {
  const context = audioContext
  audioContext = null
  noiseBuffer = null
  output = null
  sfxVolume = DEFAULT_SFX_VOLUME
  sfxMuted = false
  if (context && context.state !== 'closed') void context.close().catch(() => undefined)
}

export const primeShootingAudio = () => {
  const context = ensureContext()
  if (!context) return
  ensureNoiseBuffer(context)
  if (context.state === 'suspended') void context.resume().catch(() => undefined)
}

/** Compact indoor carbine: noise crack, body, low thump, and a short room slap. */
export const playShotSound = () => {
  withAudio((context, destination, volumeScale) => {
    const start = context.currentTime
    const pitch = jitter(1, 0.08)

    playNoiseBurst(context, destination, {
      start,
      duration: 0.036,
      volume: 0.2 * volumeScale,
      highpass: 1100 * pitch,
      lowpass: 5400,
    })
    playNoiseBurst(context, destination, {
      start,
      duration: 0.08,
      volume: 0.11 * volumeScale,
      bandpass: 380 * pitch,
      q: 0.85,
      lowpass: 1400,
    })
    playTone(context, destination, {
      type: 'sine',
      frequency: 108 * pitch,
      frequencyEnd: 46,
      duration: 0.12,
      volume: 0.16 * volumeScale,
      start,
    })
    playTone(context, destination, {
      type: 'square',
      frequency: 1750 * pitch,
      duration: 0.011,
      volume: 0.03 * volumeScale,
      start,
    })
    playNoiseBurst(context, destination, {
      start: start + 0.03,
      duration: 0.08,
      volume: 0.028 * volumeScale,
      highpass: 180,
      lowpass: 520,
    })
  })
}

type HitConfirmZone = 'head' | 'body' | 'limb' | 'plate'

/** Target confirm: zone-tuned metallic tick — head is brighter/shorter, limb is softer. */
export const playHitSound = (zone: HitConfirmZone = 'plate') => {
  withAudio((context, destination, volumeScale) => {
    const start = context.currentTime
    const pitch =
      zone === 'head' ? jitter(1.18, 0.06) : zone === 'limb' ? jitter(0.82, 0.08) : jitter(1, 0.08)
    const baseFreq = zone === 'head' ? 3380 : zone === 'limb' ? 2280 : 2860
    const endFreq = zone === 'head' ? 2680 : zone === 'limb' ? 1780 : 2140
    const tickVolume = zone === 'head' ? 0.13 : zone === 'limb' ? 0.08 : 0.11
    const noiseVolume = zone === 'head' ? 0.085 : zone === 'limb' ? 0.05 : 0.07

    playNoiseBurst(context, destination, {
      start,
      duration: zone === 'head' ? 0.01 : 0.012,
      volume: noiseVolume * volumeScale,
      highpass: zone === 'head' ? 5200 : 4200,
      lowpass: zone === 'head' ? 13000 : 11000,
    })
    playTone(context, destination, {
      type: 'sine',
      frequency: baseFreq * pitch,
      frequencyEnd: endFreq * pitch,
      duration: zone === 'head' ? 0.048 : 0.055,
      volume: tickVolume * volumeScale,
      start,
    })
    playTone(context, destination, {
      type: 'triangle',
      frequency: (baseFreq + 1260) * pitch,
      frequencyEnd: (endFreq + 1040) * pitch,
      duration: 0.038,
      volume: (zone === 'head' ? 0.07 : 0.055) * volumeScale,
      start: start + 0.003,
    })
    if (zone === 'head') {
      playTone(context, destination, {
        type: 'square',
        frequency: 6200 * pitch,
        duration: 0.005,
        volume: 0.038 * volumeScale,
        start: start + 0.001,
      })
    } else {
      playTone(context, destination, {
        type: 'square',
        frequency: 5200 * pitch,
        duration: 0.006,
        volume: 0.028 * volumeScale,
        start: start + 0.0015,
      })
    }
  })
}

/** Soft wall miss — muted thud so hits feel distinct without clutter. */
export const playMissSound = () => {
  withAudio((context, destination, volumeScale) => {
    const start = context.currentTime
    const pitch = jitter(1, 0.06)

    playNoiseBurst(context, destination, {
      start,
      duration: 0.028,
      volume: 0.035 * volumeScale,
      bandpass: 420 * pitch,
      q: 0.7,
      lowpass: 900,
    })
    playTone(context, destination, {
      type: 'sine',
      frequency: 92 * pitch,
      frequencyEnd: 58,
      duration: 0.07,
      volume: 0.045 * volumeScale,
      start,
    })
  })
}

export const playExplosionSound = playHitSound
