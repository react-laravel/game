import { useCallback, useEffect, useRef, useState } from 'react'

const TRAINING_DURATION_SECONDS = 60
const HIT_MARKER_DURATION_MS = 110

export function useShootingSession(onTrainingStateChange?: (started: boolean) => void) {
  const [score, setScore] = useState(0)
  const [shots, setShots] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TRAINING_DURATION_SECONDS)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [showStartOverlay, setShowStartOverlay] = useState(true)
  const [hitMarker, setHitMarker] = useState(false)
  const hitMarkerTimer = useRef<number | null>(null)

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

  const addScore = useCallback(() => setScore(previous => previous + 10), [])
  const recordShot = useCallback(() => setShots(previous => previous + 1), [])

  const showHitFeedback = useCallback(() => {
    if (hitMarkerTimer.current) window.clearTimeout(hitMarkerTimer.current)
    setHitMarker(true)
    hitMarkerTimer.current = window.setTimeout(
      () => setHitMarker(false),
      HIT_MARKER_DURATION_MS
    )
  }, [])

  const beginTraining = useCallback(() => {
    setShowStartOverlay(false)
    setGameStarted(true)
    onTrainingStateChange?.(true)
  }, [onTrainingStateChange])

  const restartTraining = useCallback(() => {
    setScore(0)
    setShots(0)
    setTimeLeft(TRAINING_DURATION_SECONDS)
    setGameOver(false)
    setGameStarted(true)
    onTrainingStateChange?.(true)
  }, [onTrainingStateChange])

  const returnToSettings = useCallback(() => {
    setGameStarted(false)
    setShowStartOverlay(true)
    onTrainingStateChange?.(false)
  }, [onTrainingStateChange])

  return {
    score,
    shots,
    timeLeft,
    gameOver,
    gameStarted,
    setGameStarted,
    showStartOverlay,
    hitMarker,
    addScore,
    recordShot,
    showHitFeedback,
    beginTraining,
    restartTraining,
    returnToSettings,
  }
}
