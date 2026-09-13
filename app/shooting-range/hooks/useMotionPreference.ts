'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  loadMotionPreference,
  resolveReducedMotion,
  saveMotionPreference,
  systemPrefersReducedMotion,
  type MotionPreference,
} from '../utils/motionPrefs'

function readInitialMotionPreference(): MotionPreference {
  if (typeof window === 'undefined') return 'auto'
  return loadMotionPreference()
}

export function useMotionPreference() {
  const [preference, setPreference] = useState<MotionPreference>(readInitialMotionPreference)
  const [reducedMotion, setReducedMotion] = useState(() =>
    resolveReducedMotion(readInitialMotionPreference())
  )

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => {
      if (preference === 'auto') {
        setReducedMotion(systemPrefersReducedMotion())
      }
    }
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [preference])

  const updatePreference = useCallback((next: MotionPreference) => {
    setPreference(next)
    saveMotionPreference(next)
    setReducedMotion(resolveReducedMotion(next))
  }, [])

  return { preference, reducedMotion, setPreference: updatePreference }
}
