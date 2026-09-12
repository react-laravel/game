import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ShootingSetup } from '../ShootingSetup'

describe('ShootingSetup', () => {
  it('delegates difficulty, map, mode selection and starting to the page orchestrator', () => {
    const onDifficultyChange = vi.fn()
    const onMapChange = vi.fn()
    const onModeChange = vi.fn()
    const onStart = vi.fn()
    const onViewHistory = vi.fn()

    render(
      <ShootingSetup
        difficulty="easy"
        mapId="indoor"
        modeId="moving"
        onDifficultyChange={onDifficultyChange}
        onMapChange={onMapChange}
        onModeChange={onModeChange}
        onStart={onStart}
        onViewHistory={onViewHistory}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /专家/ }))
    expect(onDifficultyChange).toHaveBeenCalledWith('hard')

    fireEvent.click(screen.getByRole('button', { name: /户外靶场/ }))
    expect(onMapChange).toHaveBeenCalledWith('outdoor')

    fireEvent.click(screen.getByRole('button', { name: /^快速反应/ }))
    expect(onModeChange).toHaveBeenCalledWith('flick')

    fireEvent.click(screen.getByRole('button', { name: '进入射击场' }))
    expect(onStart).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: '查看训练记录' }))
    expect(onViewHistory).toHaveBeenCalledOnce()
  })
})
