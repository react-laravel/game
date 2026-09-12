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
  /** Soft secondary sun/sky bounce for outdoor depth. */
  rimLight?: { color: string; intensity: number; position: [number, number, number] }
}

export const mapConfigs: Record<ShootingMapId, MapConfig> = {
  indoor: {
    id: 'indoor',
    name: '室内靶场',
    description: '明亮均匀的室内射击道，适合基础瞄准',
    background: '#5a7a8e',
    fog: { color: '#6a8a9e', near: 42, far: 88 },
    hemisphere: { sky: '#f4faff', ground: '#5a7282', intensity: 1.95 },
    directional: { color: '#ffffff', intensity: 3.0, position: [5, 16, 6] },
    floor: { color: '#4a6272', metalness: 0.14, roughness: 0.74 },
    grid: [80, 40, '#5a9cb0', '#456878'],
    accent: '#9de8ff',
    fillLight: { color: '#eef8ff', intensity: 1.65, position: [0, 10, -20] },
  },
  outdoor: {
    id: 'outdoor',
    name: '户外靶场',
    description: '开阔草地与远山背景，自然光照变化更明显',
    background: '#87ceeb',
    fog: { color: '#a8d0e8', near: 65, far: 130 },
    hemisphere: { sky: '#e8f6ff', ground: '#5a8a52', intensity: 1.85 },
    directional: { color: '#fff6e8', intensity: 2.8, position: [14, 22, 8] },
    floor: { color: '#5a9458', metalness: 0.03, roughness: 0.93 },
    grid: [90, 45, '#4a7a4d', '#356338'],
    accent: '#c8e8ff',
    rimLight: { color: '#b8dcff', intensity: 0.55, position: [-10, 8, 12] },
  },
  warehouse: {
    id: 'warehouse',
    name: '工业仓库',
    description: '集装箱与钢梁结构，工业灯光氛围',
    background: '#4a4038',
    fog: { color: '#5a5048', near: 30, far: 74 },
    hemisphere: { sky: '#f5e8d0', ground: '#5a5048', intensity: 1.5 },
    directional: { color: '#ffe8c0', intensity: 2.55, position: [6, 16, -2] },
    floor: { color: '#5a5048', metalness: 0.2, roughness: 0.78 },
    grid: [70, 35, '#6b4f2e', '#3d3024'],
    accent: '#ffb347',
    fillLight: { color: '#ffe8c8', intensity: 1.55, position: [0, 9, -18] },
    rimLight: { color: '#ffd8a0', intensity: 0.35, position: [-8, 6, 10] },
  },
}

export const mapOptions = Object.values(mapConfigs)
