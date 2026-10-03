import { useEffect, useState, type RefObject } from 'react'
import { isWeaponUiTarget, nextWeapon, weaponForKey, type WeaponId } from '../utils/weapons'

export function useWeaponControls(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  enabled: boolean,
  useFallbackControls: boolean
) {
  const [weaponId, setWeaponId] = useState<WeaponId>('pistol')
  const [aimHeld, setAimHeld] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let nextWheelAt = 0
    const ownsInput = () =>
      Boolean(
        canvasRef.current &&
          (useFallbackControls || document.pointerLockElement === canvasRef.current)
      )
    const selectWeapon = (weapon: WeaponId) => {
      setWeaponId(weapon)
      setAimHeld(false)
    }
    const stopAiming = () => setAimHeld(false)
    const keyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') stopAiming()
      if (
        !ownsInput() ||
        event.repeat ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        isWeaponUiTarget(event.target)
      )
        return
      const weapon = weaponForKey(event.code)
      if (weapon) {
        event.preventDefault()
        selectWeapon(weapon)
      }
    }
    const wheel = (event: WheelEvent) => {
      if (!ownsInput() || isWeaponUiTarget(event.target) || event.ctrlKey || event.deltaY === 0)
        return
      if (useFallbackControls && event.target !== canvasRef.current) return
      event.preventDefault()
      // A trackpad gesture produces many wheel events. Switch at most once per 200ms.
      if (performance.now() < nextWheelAt) return
      nextWheelAt = performance.now() + 200
      setWeaponId(nextWeapon)
      stopAiming()
    }
    const mouseDown = (event: MouseEvent) => {
      if (event.button !== 2 || !ownsInput() || event.target !== canvasRef.current) return
      event.preventDefault()
      setAimHeld(true)
    }
    const mouseUp = (event: MouseEvent) => {
      if (event.button === 2) stopAiming()
    }
    const lockChanged = () => {
      if (document.pointerLockElement !== canvasRef.current) stopAiming()
    }
    const contextMenu = (event: MouseEvent) => {
      if (event.target === canvasRef.current) event.preventDefault()
    }
    window.addEventListener('keydown', keyDown)
    window.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('mousedown', mouseDown)
    window.addEventListener('mouseup', mouseUp)
    window.addEventListener('blur', stopAiming)
    document.addEventListener('visibilitychange', stopAiming)
    document.addEventListener('pointerlockchange', lockChanged)
    document.addEventListener('contextmenu', contextMenu)
    return () => {
      stopAiming()
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('wheel', wheel)
      window.removeEventListener('mousedown', mouseDown)
      window.removeEventListener('mouseup', mouseUp)
      window.removeEventListener('blur', stopAiming)
      document.removeEventListener('visibilitychange', stopAiming)
      document.removeEventListener('pointerlockchange', lockChanged)
      document.removeEventListener('contextmenu', contextMenu)
    }
  }, [canvasRef, enabled, useFallbackControls])

  const isAiming = enabled && aimHeld
  return { weaponId, isAiming, isScoped: isAiming && weaponId === 'sniper' }
}
