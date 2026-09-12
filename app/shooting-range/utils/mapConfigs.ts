import type { ShootingMapId } from '../types'

export interface MapConfig {
  id: ShootingMapId
  name: string
  description: string
  background: string
  fog: { color: string; near: number; far: number }
  hemisphere: { sky: string; ground: string; intensity: number }
  directional: { color: string; intensity: number; position: [number, number, number] }
  floor: { color: string; metalness: number; roughness: number }
  grid: [number, number, string, string]
  accent: string
  /** Optional fill light for enclosed ranges. */
  fillLight?: { color: string; intensity: number; position: [number, number, number] }
}

export const mapConfigs: Record<ShootingMapId, MapConfig> = {
  indoor: {
    id: 'indoor',
    name: '室内靶场',
    description: '明亮均匀的室内射击道，适合基础瞄准',
    background: '#1a2d3a',
    fog: { color: '#243746', near: 28, far: 72 },
    hemisphere: { sky: '#e8f4ff', ground: '#3a4f5c', intensity: 1.65 },
    directional: { color: '#f2fbff', intensity: 2.6, position: [5, 14, 4] },
    floor: { color: '#3a4f5c', metalness: 0.12, roughness: 0.78 },
    grid: [80, 40, '#4f8da0', '#3a5f6e'],
    accent: '#9de8ff',
    fillLight: { color: '#dff6ff', intensity: 1.35, position: [0, 9, -18] },
  },
  outdoor: {
    id: 'outdoor',
    name: '户外靶场',
    description: '开阔草地与远山背景，自然光照变化更明显',
    background: '#6fa3cf',
    fog: { color: '#9ec3e0', near: 40, far: 95 },
    hemisphere: { sky: '#d8eeff', ground: '#4f7f4a', intensity: 1.55 },
    directional: { color: '#fff8e8', intensity: 2.5, position: [12, 18, 6] },
    floor: { color: '#4a7d4d', metalness: 0.04, roughness: 0.94 },
    grid: [90, 45, '#4a7a4d', '#356338'],
    accent: '#c8e8ff',
  },
  warehouse: {
    id: 'warehouse',
    name: '工业仓库',
    description: '集装箱与钢梁结构，工业灯光氛围',
    background: '#2a2218',
    fog: { color: '#3a3024', near: 22, far: 58 },
    hemisphere: { sky: '#d9c9a8', ground: '#3a3024', intensity: 1.15 },
    directional: { color: '#ffddaa', intensity: 2.1, position: [4, 14, -4] },
    floor: { color: '#3d3428', metalness: 0.3, roughness: 0.76 },
    grid: [70, 35, '#6b4f2e', '#3d3024'],
    accent: '#ffb347',
    fillLight: { color: '#ffe2b8', intensity: 0.9, position: [0, 8, -16] },
  },
}

export const mapOptions = Object.values(mapConfigs)
