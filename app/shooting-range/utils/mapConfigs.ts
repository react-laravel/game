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
    background: '#a0b6c4',
    fog: { color: '#92aab8', near: 44, far: 88 },
    hemisphere: { sky: '#f8fcff', ground: '#5a7282', intensity: 2.55 },
    directional: { color: '#ffffff', intensity: 3.35, position: [5, 16, 6] },
    floor: { color: '#4a6272', metalness: 0.14, roughness: 0.74 },
    grid: [80, 40, '#5a9cb0', '#456878'],
    accent: '#9de8ff',
    fillLight: { color: '#f4fcff', intensity: 3.05, position: [0, 7.75, -28] },
  },
  outdoor: {
    id: 'outdoor',
    name: '户外靶场',
    description: '开阔草地与远山背景，自然光照变化更明显',
    background: '#7aabcc',
    fog: { color: '#b8d0e0', near: 102, far: 185 },
    hemisphere: { sky: '#d8ecff', ground: '#4a7a48', intensity: 2.05 },
    directional: { color: '#fff0d8', intensity: 2.85, position: [14, 22, 8] },
    floor: { color: '#4a8448', metalness: 0.03, roughness: 0.94 },
    grid: [90, 45, '#4a7a4d', '#356338'],
    accent: '#c8e8ff',
    rimLight: { color: '#b8dcff', intensity: 0.72, position: [-10, 8, 12] },
  },
  warehouse: {
    id: 'warehouse',
    name: '工业仓库',
    description: '集装箱与钢梁结构，工业灯光氛围',
    background: '#524840',
    fog: { color: '#625850', near: 32, far: 78 },
    hemisphere: { sky: '#f8ecd8', ground: '#5a5048', intensity: 1.65 },
    directional: { color: '#ffe8c0', intensity: 2.75, position: [6, 16, -2] },
    floor: { color: '#5a5048', metalness: 0.2, roughness: 0.78 },
    grid: [70, 35, '#6b4f2e', '#3d3024'],
    accent: '#ffb347',
    fillLight: { color: '#ffe8c8', intensity: 1.85, position: [0, 9, -18] },
    rimLight: { color: '#ffd8a0', intensity: 0.48, position: [-8, 6, 10] },
  },
}

export const mapOptions = Object.values(mapConfigs)
