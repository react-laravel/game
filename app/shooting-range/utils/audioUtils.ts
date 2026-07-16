/**
 * Small reusable audio pools keep hit feedback off the render-critical path.
 * Creating a new HTMLAudioElement for every impact can trigger decoding and GC
 * exactly when the frame is busiest.
 */

const POOL_SIZE = 4
const audioPools = new Map<string, HTMLAudioElement[]>()
const poolIndexes = new Map<string, number>()
const stopTimers = new WeakMap<HTMLAudioElement, ReturnType<typeof setTimeout>>()

function poolKey(soundPath: string, playbackRate: number) {
  return `${soundPath}@${playbackRate}`
}

function createPool(soundPath: string, playbackRate: number) {
  const pool = Array.from({ length: POOL_SIZE }, () => {
    const audio = new Audio(soundPath)
    audio.preload = 'auto'
    audio.playbackRate = playbackRate
    return audio
  })

  audioPools.set(poolKey(soundPath, playbackRate), pool)
  return pool
}

function getAudio(soundPath: string, playbackRate: number) {
  const key = poolKey(soundPath, playbackRate)
  const pool = audioPools.get(key) ?? createPool(soundPath, playbackRate)
  const available = pool.find(audio => audio.paused || audio.ended)

  if (available) return available

  const nextIndex = (poolIndexes.get(key) ?? 0) % pool.length
  poolIndexes.set(key, nextIndex + 1)
  return pool[nextIndex]
}

export const primeShootingAudio = () => {
  if (typeof Audio === 'undefined') return
  if (!audioPools.has(poolKey('/sounds/shot.mp3', 0.8))) createPool('/sounds/shot.mp3', 0.8)
  if (!audioPools.has(poolKey('/sounds/shot.mp3', 1.35))) createPool('/sounds/shot.mp3', 1.35)
}

export const playSound = (
  soundPath: string,
  volume: number = 0.2,
  playbackRate: number = 1,
  maxDuration?: number
) => {
  try {
    const audio = getAudio(soundPath, playbackRate)
    const previousTimer = stopTimers.get(audio)
    if (previousTimer) clearTimeout(previousTimer)

    audio.pause()
    audio.currentTime = 0
    audio.volume = volume
    audio.playbackRate = playbackRate

    if (maxDuration) {
      const timer = setTimeout(() => {
        audio.pause()
        audio.currentTime = 0
        stopTimers.delete(audio)
      }, maxDuration)
      stopTimers.set(audio, timer)
    }

    void audio.play().catch(() => {
      // Browsers may reject audio before the first user gesture. Gameplay can continue silently.
    })
  } catch {
    // Audio is optional feedback and must never interrupt the render loop.
  }
}

export const playShotSound = () => {
  playSound('/sounds/shot.mp3', 0.14, 0.8, 380)
}

export const playExplosionSound = () => {
  playSound('/sounds/shot.mp3', 0.3, 1.45, 180)
}

export const playHitSound = () => {
  playSound('/sounds/shot.mp3', 0.3, 1.35, 180)
}
