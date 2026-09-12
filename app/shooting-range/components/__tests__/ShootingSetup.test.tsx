import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CROSSHAIR_CONFIG } from '../../utils/crosshairConfig'
import { ShootingSetup } from '../ShootingSetup'

describe('ShootingSetup', () => {
  it('delegates quick-start, custom settings, and history navigation', () => {
    const onDifficultyChange = vi.fn()
    const onMapChange = vi.fn()
    const onModeChange = vi.fn()
    const onStart = vi.fn()
    const onQuickStart = vi.fn()
    const onViewHistory = vi.fn()
    const onCrosshairChange = vi.fn()
    const onCrosshairReset = vi.fn()

    render(
      <ShootingSetup
        difficulty="easy"
        mapId="indoor"
        modeId="moving"
        onDifficultyChange={onDifficultyChange}
        onMapChange={onMapChange}
        onModeChange={onModeChange}
        onStart={onStart}
        onQuickStart={onQuickStart}
        onViewHistory={onViewHistory}
        crosshairConfig={DEFAULT_CROSSHAIR_CONFIG}
        onCrosshairChange={onCrosshairChange}
        onCrosshairReset={onCrosshairReset}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /甩枪反应/ }))
    expect(onQuickStart).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'flick-reflex', modeId: 'flick' })
    )

    fireEvent.click(screen.getByRole('button', { name: /自定义场景与难度/ }))
    fireEvent.click(screen.getByRole('button', { name: /专家/ }))
    expect(onDifficultyChange).toHaveBeenCalledWith('hard')

    fireEvent.click(screen.getByRole('button', { name: /户外靶场/ }))
    expect(onMapChange).toHaveBeenCalledWith('outdoor')

    fireEvent.click(screen.getByRole('button', { name: /^甩枪反应/ }))
    expect(onModeChange).toHaveBeenCalledWith('flick')

    fireEvent.click(screen.getByRole('button', { name: /按当前设置开始/ }))
    expect(onStart).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: '训练记录与进步' }))
    expect(onViewHistory).toHaveBeenCalledOnce()
  })
})
