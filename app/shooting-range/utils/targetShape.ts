import type { TargetShape } from '../types'

export const DEFAULT_TARGET_SHAPE: TargetShape = 'circle'

export const TARGET_SHAPE_OPTIONS: Array<{
  id: TargetShape
  label: string
  hint: string
}> = [
  {
    id: 'circle',
    label: '圆形靶',
    hint: '经典环靶 · 适合甩枪与网格速点',
  },
  {
    id: 'humanoid',
    label: '人形靶',
    hint: '训练机器人 · 头/躯干/四肢分区计分',
  },
]

export function normalizeTargetShape(value: unknown): TargetShape {
  return value === 'humanoid' ? 'humanoid' : DEFAULT_TARGET_SHAPE
}

export function targetShapeLabel(shape: TargetShape): string {
  return shape === 'humanoid' ? '人形靶' : '圆形靶'
}
