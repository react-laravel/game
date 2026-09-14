import { describe, expect, it } from 'vitest'
import { shootingHelpSections } from '../shootingHelp'
import { trainingModeOptions } from '../trainingModes'

describe('shootingHelp', () => {
  it('includes controls, pause tips, and every training mode', () => {
    const titles = shootingHelpSections.map(section => section.title)
    expect(titles).toContain('基本操作')
    expect(titles).toContain('暂停与设置')
    expect(titles).toContain('训练模式')

    const modeSection = shootingHelpSections.find(section => section.title === '训练模式')
    expect(modeSection?.items.length).toBe(trainingModeOptions.length)
    expect(modeSection?.items.some(item => item.includes('ESC'))).toBe(false)
    expect(
      shootingHelpSections.some(section =>
        section.items.some(item => item.includes('ESC') || item.includes('灵敏度'))
      )
    ).toBe(true)
    expect(
      shootingHelpSections.some(section =>
        section.items.some(item => item.includes('后坐力') && item.includes('向上'))
      )
    ).toBe(true)
    expect(
      shootingHelpSections.some(section =>
        section.items.some(item => item.includes('设置') && item.includes('不会开枪'))
      )
    ).toBe(true)
  })
})
