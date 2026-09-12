import { useCallback, useEffect, useRef, useState } from 'react'

const FPS_UI_INTERVAL_MS = 250

type FpsWindow = Window &
  typeof globalThis & {
    /** Headless screenshot capture injects a stable HUD FPS for PR docs. */
    __SHOOTING_QA_FPS__?: number
  }

export function useFpsMeter() {
  const fpsRef = useRef(60)
  const [displayFps, setDisplayFps] = useState(60)

  const reportFps = useCallback((fps: number) => {
    fpsRef.current = fps
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      const qaFps = (window as FpsWindow).__SHOOTING_QA_FPS__
      setDisplayFps(typeof qaFps === 'number' ? qaFps : Math.max(1, Math.round(fpsRef.current)))
    }, FPS_UI_INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [])

  return { displayFps, reportFps }
}
