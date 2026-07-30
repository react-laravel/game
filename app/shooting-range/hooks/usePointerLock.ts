import { useCallback, useEffect, useState, type RefObject } from 'react'
import type { ShootingBrowserSupport } from '../types'

const POINTER_LOCK_ERROR_MESSAGE = '浏览器拒绝了鼠标锁定请求。'

function detectBrowserSupport(): ShootingBrowserSupport {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  if (isMobile) {
    return {
      supported: false,
      message: '射击游戏需要使用鼠标控制，暂不支持移动设备。',
      useFallback: false,
    }
  }

  if (!('pointerLockElement' in document)) {
    return {
      supported: false,
      message: '浏览器不支持鼠标锁定，已切换为点击目标模式。',
      useFallback: true,
    }
  }

  return { supported: true, message: '', useFallback: false }
}

export function usePointerLock(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const [pointerLockError, setPointerLockError] = useState<string | null>(null)
  const [browserSupport, setBrowserSupport] = useState(detectBrowserSupport)

  const handlePointerLockFailure = useCallback(() => {
    setPointerLockError(POINTER_LOCK_ERROR_MESSAGE)
    setBrowserSupport(previous => ({ ...previous, useFallback: true }))
  }, [])

  useEffect(() => {
    document.addEventListener('pointerlockerror', handlePointerLockFailure)
    return () => document.removeEventListener('pointerlockerror', handlePointerLockFailure)
  }, [handlePointerLockFailure])

  useEffect(
    () => () => {
      document.exitPointerLock?.()
    },
    []
  )

  const requestPointerLock = useCallback(() => {
    setPointerLockError(null)
    if (browserSupport.useFallback) return

    try {
      const lockResult = canvasRef.current?.requestPointerLock()
      if (!lockResult) return
      void lockResult.catch(handlePointerLockFailure)
    } catch {
      handlePointerLockFailure()
    }
  }, [browserSupport.useFallback, canvasRef, handlePointerLockFailure])

  const enableFallbackControls = useCallback(() => {
    setPointerLockError(null)
    setBrowserSupport(previous => ({ ...previous, useFallback: true }))
  }, [])

  const releasePointerLock = useCallback(() => {
    document.exitPointerLock?.()
  }, [])

  return {
    browserSupport,
    pointerLockError,
    requestPointerLock,
    enableFallbackControls,
    releasePointerLock,
  }
}
