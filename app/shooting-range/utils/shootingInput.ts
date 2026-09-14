/** Shot input is live only while the WebGL canvas holds pointer lock. */

export function shouldAcceptLockedShot(
  pointerLockElement: Element | null,
  canvas: Element | null,
  eventTarget: EventTarget | null = null
): boolean {
  if (!canvas || pointerLockElement !== canvas) return false
  if (
    eventTarget instanceof Element &&
    eventTarget !== canvas &&
    !canvas.contains(eventTarget)
  ) {
    return false
  }
  return true
}
