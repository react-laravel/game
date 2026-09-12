export type CrosshairStyle = 'cross' | 'circle' | 'cross-circle' | 'dot' | 't-shape'

export interface CrosshairConfig {
  style: CrosshairStyle
  color: string
  size: number
  thickness: number
  gap: number
  opacity: number
  showCenterDot: boolean
  showOutline: boolean
}

export const CROSSHAIR_STORAGE_KEY = 'shooting-range-crosshair'

export const CROSSHAIR_COLOR_PRESETS = [
  { id: 'cyan', label: '青白', color: '#dff9ff' },
  { id: 'green', label: '荧光绿', color: '#57ffb0' },
  { id: 'yellow', label: '警戒黄', color: '#ffd84d' },
  { id: 'red', label: '亮红', color: '#ff5f6d' },
  { id: 'white', label: '纯白', color: '#ffffff' },
  { id: 'violet', label: '紫电', color: '#b48cff' },
] as const

export const CROSSHAIR_STYLE_OPTIONS: Array<{ id: CrosshairStyle; label: string }> = [
  { id: 'cross', label: '十字' },
  { id: 'circle', label: '圆环' },
  { id: 'cross-circle', label: '十字+圆' },
  { id: 'dot', label: '圆点' },
  { id: 't-shape', label: 'T 形' },
]

export const DEFAULT_CROSSHAIR_CONFIG: CrosshairConfig = {
  style: 'cross-circle',
  color: '#dff9ff',
  size: 14,
  thickness: 2,
  gap: 5,
  opacity: 0.95,
  showCenterDot: true,
  showOutline: true,
}

export function clampCrosshairValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function normalizeCrosshairConfig(value: Partial<CrosshairConfig>): CrosshairConfig {
  const style = CROSSHAIR_STYLE_OPTIONS.some(option => option.id === value.style)
    ? value.style!
    : DEFAULT_CROSSHAIR_CONFIG.style

  const color =
    typeof value.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(value.color)
      ? value.color
      : DEFAULT_CROSSHAIR_CONFIG.color

  return {
    style,
    color,
    size: clampCrosshairValue(Number(value.size ?? DEFAULT_CROSSHAIR_CONFIG.size), 8, 28),
    thickness: clampCrosshairValue(Number(value.thickness ?? DEFAULT_CROSSHAIR_CONFIG.thickness), 1, 6),
    gap: clampCrosshairValue(Number(value.gap ?? DEFAULT_CROSSHAIR_CONFIG.gap), 0, 14),
    opacity: clampCrosshairValue(Number(value.opacity ?? DEFAULT_CROSSHAIR_CONFIG.opacity), 0.35, 1),
    showCenterDot: value.showCenterDot ?? DEFAULT_CROSSHAIR_CONFIG.showCenterDot,
    showOutline: value.showOutline ?? DEFAULT_CROSSHAIR_CONFIG.showOutline,
  }
}

export type CrosshairArm = 'top' | 'bottom' | 'left' | 'right'

export interface CrosshairSegment {
  x1: number
  y1: number
  x2: number
  y2: number
}

const VIEWBOX_SIZE = 64
const CENTER = VIEWBOX_SIZE / 2

export function getCrosshairArms(style: CrosshairStyle): CrosshairArm[] {
  switch (style) {
    case 't-shape':
      return ['top', 'left', 'right']
    case 'dot':
      return []
    default:
      return ['top', 'bottom', 'left', 'right']
  }
}

export function getCrosshairSegments(config: CrosshairConfig): CrosshairSegment[] {
  const arms = getCrosshairArms(config.style)
  const outer = CENTER + config.size
  const inner = CENTER + config.gap

  return arms.map(arm => {
    switch (arm) {
      case 'top':
        return { x1: CENTER, y1: CENTER - outer, x2: CENTER, y2: CENTER - inner }
      case 'bottom':
        return { x1: CENTER, y1: CENTER + inner, x2: CENTER, y2: CENTER + outer }
      case 'left':
        return { x1: CENTER - outer, y1: CENTER, x2: CENTER - inner, y2: CENTER }
      case 'right':
        return { x1: CENTER + inner, y1: CENTER, x2: CENTER + outer, y2: CENTER }
    }
  })
}

export function getCrosshairCircleRadius(config: CrosshairConfig) {
  if (config.style !== 'circle' && config.style !== 'cross-circle') return null
  return config.size + config.gap * 0.35
}

export function shouldRenderCenterDot(config: CrosshairConfig) {
  if (config.style === 'dot') return true
  return config.showCenterDot
}

export function getCrosshairViewboxSize() {
  return VIEWBOX_SIZE
}
