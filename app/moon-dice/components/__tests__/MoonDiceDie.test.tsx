import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MoonDiceDie } from '../MoonDiceDie'

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    className,
    ...props
  }: {
    src: string
    alt: string
    className?: string
  }) => <img src={src} alt={alt} className={className} {...props} />,
}))

describe('MoonDiceDie', () => {
  it('renders resting dice without blend tint or opaque cards', () => {
    render(<MoonDiceDie value={4} />)

    const frame = screen.getByTestId('moon-dice-die')
    const die = screen.getByRole('img', { name: '骰子 4' })
    expect(die).toHaveAttribute('src', expect.stringContaining('/mooncake/4.jpg'))
    expect(frame.className).toContain('overflow-hidden')
    expect(die.className).not.toContain('mix-blend-multiply')
    expect(die.className).not.toContain('bg-white')
  })

  it('uses animated gif sources while rolling', () => {
    render(<MoonDiceDie value={2} rolling />)

    const die = screen.getByRole('img', { name: '骰子 2' })
    expect(die).toHaveAttribute('src', expect.stringContaining('/mooncake/2.gif'))
  })
})
