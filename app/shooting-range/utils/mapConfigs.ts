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
}

export const mapConfigs: Record<ShootingMapId, MapConfig> = {
  indoor: {
    id: 'indoor',
    name: '室内靶场',
    description: '标准室内射击道，灯光均匀，适合基础瞄准',
    background: '#07141e',
    fog: { color: '#07141e', near: 20, far: 58 },
    hemisphere: { sky: '#b9e7ff', ground: '#10202a', intensity: 1.15 },
    directional: { color: '#d9f3ff', intensity: 2.2, position: [6, 12, 2] },
    floor: { color: '#16232c', metalness: 0.15, roughness: 0.82 },
    grid: [80, 40, '#2b7688', '#24404b'],
    accent: '#7ce8ff',
  },
  outdoor: {
    id: 'outdoor',
    name: '户外靶场',
    description: '开阔草地与远山背景，自然光照变化更明显',
    background: '#5a8fb8',
    fog: { color: '#8eb4d4', near: 35, far: 90 },
    hemisphere: { sky: '#cfe9ff', ground: '#3d6b3f', intensity: 1.4 },
    directional: { color: '#fff4d6', intensity: 2.8, position: [12, 18, 6] },
    floor: { color: '#3f6b42', metalness: 0.05, roughness: 0.92 },
    grid: [90, 45, '#4a7a4d', '#356338'],
    accent: '#ffe08a',
  },
  warehouse: {
    id: 'warehouse',
    name: '工业仓库',
    description: '集装箱与钢梁结构，昏暗工业灯光',
    background: '#1a1410',
    fog: { color: '#2a2218', near: 18, far: 52 },
    hemisphere: { sky: '#c9b89a', ground: '#1f1812', intensity: 0.95 },
    directional: { color: '#ffcc88', intensity: 1.8, position: [4, 14, -4] },
    floor: { color: '#2a241c', metalness: 0.35, roughness: 0.78 },
    grid: [70, 35, '#6b4f2e', '#3d3024'],
    accent: '#ff9f43',
  },
}

export const mapOptions = Object.values(mapConfigs)
