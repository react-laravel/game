import { useCallback, useEffect, useRef, useState } from 'react'

const FPS_UI_INTERVAL_MS = 250

export function useFpsMeter() {
  const fpsRef = useRef(60)
  const [displayFps, setDisplayFps] = useState(60)

  const reportFps = useCallback((fps: number) => {
    fpsRef.current = fps
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDisplayFps(Math.round(fpsRef.current))
    }, FPS_UI_INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [])

  return { displayFps, reportFps }
}
