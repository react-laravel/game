'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_CROSSHAIR_CONFIG,
  normalizeCrosshairConfig,
  type CrosshairConfig,
} from '../utils/crosshairConfig'
import { loadCrosshairConfig, saveCrosshairConfig } from '../utils/crosshairStorage'

export function useCrosshairSettings() {
  const [config, setConfig] = useState<CrosshairConfig>(DEFAULT_CROSSHAIR_CONFIG)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage client bootstrap
    setConfig(loadCrosshairConfig())
  }, [])

  const updateConfig = useCallback((patch: Partial<CrosshairConfig>) => {
    setConfig(previous => {
      const next = normalizeCrosshairConfig({ ...previous, ...patch })
      saveCrosshairConfig(next)
      return next
    })
  }, [])

  const resetConfig = useCallback(() => {
    const next = saveCrosshairConfig(DEFAULT_CROSSHAIR_CONFIG)
    setConfig(next)
  }, [])

  const applyConfig = useCallback((nextConfig: CrosshairConfig) => {
    const next = saveCrosshairConfig(normalizeCrosshairConfig(nextConfig))
    setConfig(next)
  }, [])

  return { config, updateConfig, resetConfig, applyConfig }
}
