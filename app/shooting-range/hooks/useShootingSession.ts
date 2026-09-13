import { useCallback, useEffect, useRef, useState } from 'react'
import type { SessionStats, ShootingSetupConfig } from '../types'
import { HIT_MARKER_DURATION_MS } from '../utils/gunFeel'
import { trainingModes } from '../utils/trainingModes'
import { createSessionRecord, saveSessionRecord } from '../utils/statsStorage'

export const STREAK_MILESTONES = [3, 5, 8, 10, 15, 20] as const

export interface HitPulse {
  id: number
  points: number
  streak: number
}

export interface StreakToast {
  id: number
  streak: number
}

export function useShootingSession(
  config: ShootingSetupConfig,
  onTrainingStateChange?: (started: boolean) => void
) {
  const mode = trainingModes[config.modeId]
  const durationSeconds = mode.durationSeconds

  const [score, setScore] = useState(0)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [shots, setShots] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(durationSeconds)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [showStartOverlay, setShowStartOverlay] = useState(true)
  const [hitMarker, setHitMarker] = useState(false)
  const [hitPulse, setHitPulse] = useState<HitPulse | null>(null)
  const [streakToast, setStreakToast] = useState<StreakToast | null>(null)
  const [avgReactionMs, setAvgReactionMs] = useState<number | null>(null)

  const hitMarkerTimer = useRef<number | null>(null)
  const feedbackSeq = useRef(0)
  const currentStreakRef = useRef(0)
  const reactionSamplesRef = useRef<number[]>([])
  const sessionSavedRef = useRef(false)
  const scorePerHitRef = useRef(mode.scorePerHit)

  useEffect(() => {
    scorePerHitRef.current = mode.scorePerHit
  }, [mode.scorePerHit])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const timer = window.setInterval(() => {
      setTimeLeft(previous => {
        if (previous <= 1) {
          setGameOver(true)
          return 0
        }
        return previous - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [gameOver, gameStarted])

  useEffect(
    () => () => {
      if (hitMarkerTimer.current) window.clearTimeout(hitMarkerTimer.current)
    },
    []
  )

  const buildSessionStats = useCallback((): SessionStats => {
    const elapsedSeconds = Math.max(1, durationSeconds - timeLeft)
    const accuracy = shots > 0 ? Math.round((hits / shots) * 100) : 0
    const shotsPerMinute = Math.round((shots / elapsedSeconds) * 60)

    return {
      score,
      hits,
      misses,
      shots,
      accuracy,
      shotsPerMinute,
      bestStreak,
      avgReactionMs,
    }
  }, [avgReactionMs, bestStreak, durationSeconds, hits, misses, score, shots, timeLeft])

  useEffect(() => {
    if (!gameOver || sessionSavedRef.current) return

    const stats = buildSessionStats()
    saveSessionRecord(createSessionRecord(config, stats, durationSeconds))
    sessionSavedRef.current = true
  }, [buildSessionStats, config, durationSeconds, gameOver])

  const recordReactionSample = useCallback((reactionMs: number) => {
    reactionSamplesRef.current.push(reactionMs)
    const samples = reactionSamplesRef.current
    setAvgReactionMs(Math.round(samples.reduce((sum, value) => sum + value, 0) / samples.length))
  }, [])

  const recordHit = useCallback(
    (reactionMs?: number) => {
      const points = scorePerHitRef.current
      const nextStreak = currentStreakRef.current + 1
      currentStreakRef.current = nextStreak

      setScore(previous => previous + points)
      setHits(previous => previous + 1)
      setCurrentStreak(nextStreak)
      setBestStreak(currentBest => Math.max(currentBest, nextStreak))

      feedbackSeq.current += 1
      setHitPulse({ id: feedbackSeq.current, points, streak: nextStreak })
      if ((STREAK_MILESTONES as readonly number[]).includes(nextStreak)) {
        feedbackSeq.current += 1
        setStreakToast({ id: feedbackSeq.current, streak: nextStreak })
      }

      if (typeof reactionMs === 'number' && reactionMs > 0 && reactionMs < 5000) {
        recordReactionSample(reactionMs)
      }
    },
    [recordReactionSample]
  )

  const recordShot = useCallback((didHit: boolean, reactionMs?: number) => {
    setShots(previous => previous + 1)
    if (didHit) recordHit(reactionMs)
    else {
      setMisses(previous => previous + 1)
      currentStreakRef.current = 0
      setCurrentStreak(0)
    }
  }, [recordHit])

  const showHitFeedback = useCallback(() => {
    if (hitMarkerTimer.current) window.clearTimeout(hitMarkerTimer.current)
    setHitMarker(true)
    hitMarkerTimer.current = window.setTimeout(
      () => setHitMarker(false),
      HIT_MARKER_DURATION_MS
    )
  }, [])

  const resetSessionState = useCallback(() => {
    setScore(0)
    setHits(0)
    setMisses(0)
    setShots(0)
    currentStreakRef.current = 0
    setCurrentStreak(0)
    setBestStreak(0)
    setTimeLeft(durationSeconds)
    setGameOver(false)
    setAvgReactionMs(null)
    reactionSamplesRef.current = []
    sessionSavedRef.current = false
  }, [durationSeconds])

  const beginTraining = useCallback(() => {
    resetSessionState()
    setShowStartOverlay(false)
    setGameStarted(true)
    onTrainingStateChange?.(true)
  }, [onTrainingStateChange, resetSessionState])

  const restartTraining = useCallback(() => {
    resetSessionState()
    setGameStarted(true)
    onTrainingStateChange?.(true)
  }, [onTrainingStateChange, resetSessionState])

  const returnToSettings = useCallback(() => {
    setGameStarted(false)
    setShowStartOverlay(true)
    onTrainingStateChange?.(false)
  }, [onTrainingStateChange])

  const endSessionEarly = useCallback(() => {
    setTimeLeft(0)
    setGameOver(true)
  }, [])

  const injectSessionStats = useCallback((patch: Partial<SessionStats>) => {
    if (patch.score !== undefined) setScore(patch.score)
    if (patch.hits !== undefined) setHits(patch.hits)
    if (patch.misses !== undefined) setMisses(patch.misses)
    if (patch.shots !== undefined) setShots(patch.shots)
    if (patch.bestStreak !== undefined) setBestStreak(patch.bestStreak)
    if (patch.avgReactionMs !== undefined) setAvgReactionMs(patch.avgReactionMs)
  }, [])

  const sessionStats = buildSessionStats()

  return {
    score,
    hits,
    misses,
    shots,
    bestStreak,
    currentStreak,
    timeLeft,
    durationSeconds,
    gameOver,
    gameStarted,
    setGameStarted,
    showStartOverlay,
    hitMarker,
    hitPulse,
    streakToast,
    avgReactionMs,
    sessionStats,
    recordShot,
    showHitFeedback,
    beginTraining,
    restartTraining,
    returnToSettings,
    endSessionEarly,
    injectSessionStats,
  }
}
