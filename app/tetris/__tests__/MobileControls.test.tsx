import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MobileControls } from '../components/MobileControls'

function renderControls() {
  const callbacks = {
    movePiece: vi.fn(() => true),
    rotatePiece: vi.fn(),
    hardDrop: vi.fn(),
    startSoftDrop: vi.fn(),
    stopSoftDrop: vi.fn(),
  }
  render(<MobileControls {...callbacks} isSoftDropping={false} />)
  return callbacks
}

describe('MobileControls', () => {
  it('performs one action for a touch click and exposes accessible button names', () => {
    const callbacks = renderControls()
    const rotate = screen.getByRole('button', { name: '旋转方块' })
    fireEvent.touchStart(rotate)
    fireEvent.touchEnd(rotate)
    fireEvent.click(rotate)
    expect(callbacks.rotatePiece).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: '向左移动' }))
    expect(callbacks.movePiece).toHaveBeenCalledWith('left')
    fireEvent.click(screen.getByRole('button', { name: '硬降方块' }))
    expect(callbacks.hardDrop).toHaveBeenCalledOnce()
  })

  it('stops a held soft drop after a cancelled pointer', () => {
    const callbacks = renderControls()
    const softDrop = screen.getByRole('button', { name: '按住软降 ↓' })
    // jsdom has no PointerEvent constructor; define the properties React reads.
    const down = new Event('pointerdown', { bubbles: true })
    Object.defineProperties(down, { button: { value: 0 }, pointerId: { value: 1 } })
    fireEvent(softDrop, down)
    expect(callbacks.startSoftDrop).toHaveBeenCalledOnce()
    fireEvent.pointerCancel(softDrop)
    expect(callbacks.stopSoftDrop).toHaveBeenCalledOnce()
  })

  it('supports holding soft drop from the keyboard without repeating starts', () => {
    const callbacks = renderControls()
    const softDrop = screen.getByRole('button', { name: '按住软降 ↓' })
    fireEvent.keyDown(softDrop, { key: ' ' })
    fireEvent.keyDown(softDrop, { key: ' ', repeat: true })
    expect(callbacks.startSoftDrop).toHaveBeenCalledOnce()
    fireEvent.keyUp(softDrop, { key: ' ' })
    expect(callbacks.stopSoftDrop).toHaveBeenCalledOnce()
  })
})
