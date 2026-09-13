import { useCallback, useEffect, useState, type RefObject } from 'react'
import type { ShootingBrowserSupport } from '../types'

const POINTER_LOCK_ERROR_MESSAGE = '浏览器拒绝了鼠标锁定请求。'

function detectBrowserSupport(): ShootingBrowserSupport {
  if (
    typeof window !== 'undefined' &&
    (window as Window & { __SHOOTING_FORCE_FALLBACK__?: boolean }).__SHOOTING_FORCE_FALLBACK__
  ) {
    return { supported: true, message: '', useFallback: true }
  }

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

function isCanvasLocked(canvas: HTMLCanvasElement | null) {
  return Boolean(canvas && document.pointerLockElement === canvas)
}

function requestCanvasPointerLock(canvas: HTMLCanvasElement) {
  const lockOptions = { unadjustedMovement: true } as PointerLockOptions
  try {
    return canvas.requestPointerLock(lockOptions)
  } catch {
    return canvas.requestPointerLock()
  }
}

export function usePointerLock(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const [pointerLockError, setPointerLockError] = useState<string | null>(null)
  const [browserSupport, setBrowserSupport] = useState(detectBrowserSupport)
  const [isPointerLocked, setIsPointerLocked] = useState(false)

  const syncLockState = useCallback(() => {
    setIsPointerLocked(isCanvasLocked(canvasRef.current))
  }, [canvasRef])

  const handlePointerLockFailure = useCallback(() => {
    setPointerLockError(POINTER_LOCK_ERROR_MESSAGE)
    setBrowserSupport(previous => ({ ...previous, useFallback: true }))
    setIsPointerLocked(false)
  }, [])

  useEffect(() => {
    document.addEventListener('pointerlockerror', handlePointerLockFailure)
    return () => document.removeEventListener('pointerlockerror', handlePointerLockFailure)
  }, [handlePointerLockFailure])

  useEffect(() => {
    const handlePointerLockChange = () => {
      syncLockState()
      if (isCanvasLocked(canvasRef.current)) {
        setPointerLockError(null)
      }
    }

    document.addEventListener('pointerlockchange', handlePointerLockChange)
    document.addEventListener('mozpointerlockchange', handlePointerLockChange)
    document.addEventListener('webkitpointerlockchange', handlePointerLockChange)
    syncLockState()

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      document.removeEventListener('mozpointerlockchange', handlePointerLockChange)
      document.removeEventListener('webkitpointerlockchange', handlePointerLockChange)
    }
  }, [canvasRef, syncLockState])

  useEffect(
    () => () => {
      document.exitPointerLock?.()
    },
    []
  )

  const requestPointerLock = useCallback(() => {
    setPointerLockError(null)
    if (browserSupport.useFallback) return

    const attemptLock = (retry = false) => {
      try {
        const canvas = canvasRef.current
        if (!canvas) {
          syncLockState()
          return
        }

        canvas.focus?.()

        const lockResult = requestCanvasPointerLock(canvas)
        if (!lockResult) {
          syncLockState()
          return
        }

        void lockResult
          .then(() => {
            syncLockState()
            if (!isCanvasLocked(canvas) && !retry) {
              window.requestAnimationFrame(() => attemptLock(true))
            }
          })
          .catch(handlePointerLockFailure)
      } catch {
        handlePointerLockFailure()
      }
    }

    attemptLock()
  }, [browserSupport.useFallback, canvasRef, handlePointerLockFailure, syncLockState])

  const enableFallbackControls = useCallback(() => {
    setPointerLockError(null)
    setBrowserSupport(previous => ({ ...previous, useFallback: true }))
    setIsPointerLocked(false)
  }, [])

  const releasePointerLock = useCallback(() => {
    document.exitPointerLock?.()
    setIsPointerLocked(false)
  }, [])

  return {
    browserSupport,
    pointerLockError,
    isPointerLocked,
    requestPointerLock,
    enableFallbackControls,
    releasePointerLock,
  }
}
