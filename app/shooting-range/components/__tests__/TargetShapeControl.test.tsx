import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TargetShapeControl } from '../TargetShapeControl'

describe('TargetShapeControl', () => {
  it('renders circle and humanoid options in Chinese', () => {
    const onChange = vi.fn()
    render(<TargetShapeControl value="circle" onChange={onChange} />)

    expect(screen.getByRole('button', { name: /圆形靶/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /人形靶/ })).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(screen.getByRole('button', { name: /人形靶/ }))
    expect(onChange).toHaveBeenCalledWith('humanoid')
  })
})
