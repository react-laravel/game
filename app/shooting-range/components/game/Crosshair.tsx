import {
  getCrosshairCircleRadius,
  getCrosshairSegments,
  getCrosshairViewboxSize,
  shouldRenderCenterDot,
  type CrosshairConfig,
} from '../../utils/crosshairConfig'

interface CrosshairProps {
  config: CrosshairConfig
  hit?: boolean
  className?: string
}

export function Crosshair({ config, hit = false, className = '' }: CrosshairProps) {
  const color = hit ? '#ffd166' : config.color
  const opacity = hit ? Math.min(1, config.opacity + 0.05) : config.opacity
  const segments = getCrosshairSegments(config)
  const circleRadius = getCrosshairCircleRadius(config)
  const center = getCrosshairViewboxSize() / 2
  const outlineWidth = config.thickness + 2

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-30 flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${getCrosshairViewboxSize()} ${getCrosshairViewboxSize()}`}
        className={`transition-transform duration-75 ${hit ? 'scale-110' : 'scale-100'}`}
        style={{
          width: `${config.size * 2.8}px`,
          height: `${config.size * 2.8}px`,
          opacity,
        }}
      >
        {config.showOutline && circleRadius !== null && (
          <circle
            cx={center}
            cy={center}
            r={circleRadius}
            fill="none"
            stroke="#041018"
            strokeWidth={outlineWidth}
            strokeOpacity={0.85}
          />
        )}
        {config.showOutline &&
          segments.map((segment, index) => (
            <line
              key={`outline-${index}`}
              x1={segment.x1}
              y1={segment.y1}
              x2={segment.x2}
              y2={segment.y2}
              stroke="#041018"
              strokeWidth={outlineWidth}
              strokeLinecap="round"
              strokeOpacity={0.85}
            />
          ))}

        {circleRadius !== null && (
          <circle
            cx={center}
            cy={center}
            r={circleRadius}
            fill="none"
            stroke={color}
            strokeWidth={config.thickness}
          />
        )}

        {segments.map((segment, index) => (
          <line
            key={`line-${index}`}
            x1={segment.x1}
            y1={segment.y1}
            x2={segment.x2}
            y2={segment.y2}
            stroke={color}
            strokeWidth={config.thickness}
            strokeLinecap="round"
          />
        ))}

        {shouldRenderCenterDot(config) && (
          <>
            {config.showOutline && (
              <circle
                cx={center}
                cy={center}
                r={config.style === 'dot' ? config.thickness + 2.2 : config.thickness + 1.2}
                fill="#041018"
                fillOpacity={0.85}
              />
            )}
            <circle
              cx={center}
              cy={center}
              r={config.style === 'dot' ? config.thickness + 1.1 : config.thickness * 0.75}
              fill={color}
            />
          </>
        )}

        {hit && (
          <>
            <line x1={18} y1={18} x2={28} y2={28} stroke="#ffe08a" strokeWidth={2} strokeLinecap="round" />
            <line x1={46} y1={18} x2={36} y2={28} stroke="#ffe08a" strokeWidth={2} strokeLinecap="round" />
            <line x1={18} y1={46} x2={28} y2={36} stroke="#ffe08a" strokeWidth={2} strokeLinecap="round" />
            <line x1={46} y1={46} x2={36} y2={36} stroke="#ffe08a" strokeWidth={2} strokeLinecap="round" />
          </>
        )}
      </svg>
    </div>
  )
}
