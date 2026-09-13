import { describe, expect, it } from 'vitest'
import {
  defaultDrillPreset,
  drillLabelForConfig,
  drillMetaForPreset,
  drillPresets,
  findDrillPreset,
  isRecommendedEntryDrill,
} from '../drillPresets'

describe('drillPresets', () => {
  it('exposes seven distinct quick-start drills', () => {
    expect(drillPresets).toHaveLength(7)
    expect(new Set(drillPresets.map(p => p.id)).size).toBe(7)
  })

  it('includes a humanoid quick-start drill', () => {
    const humanoid = findDrillPreset('humanoid-strafe')
    expect(humanoid?.targetShape).toBe('humanoid')
    expect(humanoid?.modeId).toBe('moving')
  })

  it('defaults to flick reflex drill', () => {
    expect(defaultDrillPreset.id).toBe('flick-reflex')
    expect(defaultDrillPreset.modeId).toBe('flick')
  })

  it('finds preset by id and labels matching configs', () => {
    expect(findDrillPreset('grid-speed')?.name).toBe('网格速点')
    expect(
      drillLabelForConfig('precision', 'indoor', 'medium')
    ).toBe('网格速点')
  })

  it('labels custom configs with Chinese mode and map names', () => {
    expect(drillLabelForConfig('moving', 'indoor', 'medium')).toBe(
      '动态追踪 · 室内靶场'
    )
  })

  it('only labels humanoid drill when target shape is humanoid', () => {
    expect(drillLabelForConfig('moving', 'warehouse', 'medium')).toBe(
      '动态追踪 · 工业仓库'
    )
    expect(drillLabelForConfig('moving', 'warehouse', 'medium', 'humanoid')).toBe(
      '人形靶追踪'
    )
    expect(drillLabelForConfig('moving', 'warehouse', 'hard')).toBe('乱战移动')
  })

  it('exposes duration and difficulty meta for quick-start cards', () => {
    const preset = findDrillPreset('speed-burst')
    expect(preset).toBeDefined()
    expect(drillMetaForPreset(preset!)).toEqual({ duration: 45, difficulty: '专家' })
    expect(isRecommendedEntryDrill(defaultDrillPreset, 0)).toBe(true)
    expect(isRecommendedEntryDrill(defaultDrillPreset, 1)).toBe(false)
  })
})
