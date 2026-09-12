import { create } from 'zustand'
import {
  RESULT_DISPLAY_MS,
  TOTAL_FRAMES,
  applyThrow,
  emptyFrames,
  type ThrowKind,
} from './utils/scoring'

export interface GameState {
  isPlaying: boolean
  isPaused: boolean
  gameStarted: boolean
  gameFinished: boolean
  currentFrame: number
  currentThrow: number
  pinsStanding: number
  frames: number[][]
  totalScore: number
  cumulative: Array<number | null>
  pinResetVersion: number

  gyroSupported: boolean
  gyroPermission: boolean
  tiltX: number
  tiltY: number

  aimAngle: number
  power: number
  canThrow: boolean
  ballThrown: boolean

  lastKnockedDown: number
  lastResultKind: ThrowKind | null
  showingResult: boolean

  startGame: () => void
  resetGame: () => void
  throwBall: () => void
  processThrowResult: (knockedDownCount: number) => void

  requestGyroPermission: () => Promise<void>
  updateTilt: (x: number, y: number) => void
  setAimAngle: (angle: number) => void
  setPower: (power: number) => void
  detectGyroSupport: () => void
}

let resultTimer: ReturnType<typeof setTimeout> | null = null

function stopResultTimer() {
  if (resultTimer !== null) {
    clearTimeout(resultTimer)
    resultTimer = null
  }
}

const initialPlayState = {
  isPlaying: false,
  isPaused: false,
  gameStarted: false,
  gameFinished: false,
  currentFrame: 1,
  currentThrow: 1,
  pinsStanding: 10,
  frames: emptyFrames(),
  totalScore: 0,
  cumulative: Array.from({ length: TOTAL_FRAMES }, () => null as number | null),
  pinResetVersion: 0,
  canThrow: true,
  ballThrown: false,
  aimAngle: 0,
  lastKnockedDown: 0,
  lastResultKind: null as ThrowKind | null,
  showingResult: false,
}

export const useBowlingStore = create<GameState>((set, get) => ({
  ...initialPlayState,
  gyroSupported: false,
  gyroPermission: false,
  tiltX: 0,
  tiltY: 0,
  power: 50,

  startGame: () => {
    stopResultTimer()
    set({
      ...initialPlayState,
      frames: emptyFrames(),
      cumulative: Array.from({ length: TOTAL_FRAMES }, () => null),
      isPlaying: true,
      gameStarted: true,
    })
  },

  resetGame: () => {
    stopResultTimer()
    set({
      ...initialPlayState,
      frames: emptyFrames(),
      cumulative: Array.from({ length: TOTAL_FRAMES }, () => null),
    })
  },

  throwBall: () => {
    if (get().canThrow && !get().gameFinished) {
      set({ canThrow: false, ballThrown: true })
    }
  },

  processThrowResult: (knockedDownCount: number) => {
    const state = get()
    if (state.showingResult || state.gameFinished) return

    const outcome = applyThrow({
      frames: state.frames,
      currentFrame: state.currentFrame,
      currentThrow: state.currentThrow,
      pinsStanding: state.pinsStanding,
      knockedThisThrow: knockedDownCount,
    })

    set({
      showingResult: true,
      lastKnockedDown: outcome.frames[state.currentFrame - 1]?.at(-1) ?? 0,
      lastResultKind: outcome.kind,
    })

    stopResultTimer()
    resultTimer = setTimeout(() => {
      set({
        frames: outcome.frames,
        currentFrame: outcome.currentFrame,
        currentThrow: outcome.currentThrow,
        pinsStanding: outcome.pinsStanding,
        cumulative: outcome.cumulative,
        totalScore: outcome.totalScore,
        pinResetVersion: outcome.resetPins ? state.pinResetVersion + 1 : state.pinResetVersion,
        gameFinished: outcome.gameFinished,
        isPlaying: !outcome.gameFinished,
        showingResult: false,
        canThrow: !outcome.gameFinished,
        ballThrown: false,
      })
      resultTimer = null
    }, RESULT_DISPLAY_MS)
  },

  updateTilt: (x: number, y: number) => set({ tiltX: x, tiltY: y }),

  requestGyroPermission: async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isAndroid = /Android/i.test(navigator.userAgent)
    const isMobile = isIOS || isAndroid
    const hasDeviceOrientation = 'DeviceOrientationEvent' in window

    if (!hasDeviceOrientation) {
      set({ gyroSupported: false, gyroPermission: false })
      return
    }

    set({ gyroSupported: true })

    if (
      isIOS &&
      typeof DeviceOrientationEvent !== 'undefined' &&
      'requestPermission' in DeviceOrientationEvent
    ) {
      try {
        const permission = await (
          DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
        ).requestPermission()
        set({ gyroPermission: permission === 'granted' })
      } catch {
        set({ gyroPermission: false })
      }
      return
    }

    if (isMobile) {
      let testPassed = false
      const testHandler = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null || event.beta !== null || event.gamma !== null) {
          testPassed = true
        }
      }
      window.addEventListener('deviceorientation', testHandler)
      await new Promise(resolve => setTimeout(resolve, 100))
      window.removeEventListener('deviceorientation', testHandler)
      set({ gyroPermission: true })
      void testPassed
      return
    }

    set({ gyroPermission: false })
  },

  setAimAngle: (angle: number) => set({ aimAngle: Math.max(-30, Math.min(30, angle)) }),
  setPower: (power: number) => set({ power: Math.max(0, Math.min(100, power)) }),

  detectGyroSupport: () => {
    if (typeof window === 'undefined') return

    const hasDeviceOrientation = 'DeviceOrientationEvent' in window
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isMobile = isIOS || /Android/i.test(navigator.userAgent)

    if (hasDeviceOrientation && isMobile) {
      set({ gyroSupported: true, gyroPermission: !isIOS })
    } else {
      set({ gyroSupported: false, gyroPermission: false })
    }
  },
}))
