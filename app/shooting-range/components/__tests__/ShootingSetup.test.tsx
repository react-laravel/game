import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ShootingSetup } from '../ShootingSetup'

describe('ShootingSetup', () => {
  it('delegates difficulty selection and starting to the page orchestrator', () => {
    const onDifficultyChange = vi.fn()
    const onStart = vi.fn()

    render(
      <ShootingSetup
        difficulty="easy"
        onDifficultyChange={onDifficultyChange}
        onStart={onStart}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /专家/ }))
    expect(onDifficultyChange).toHaveBeenCalledWith('hard')

    fireEvent.click(screen.getByRole('button', { name: '进入射击场' }))
    expect(onStart).toHaveBeenCalledOnce()
  })
})
