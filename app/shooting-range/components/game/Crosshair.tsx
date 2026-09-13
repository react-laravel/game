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
  miss?: boolean
  className?: string
}

const HIT_X_INSET = 14
const HIT_X_OUTSET = 30

export function Crosshair({ config, hit = false, miss = false, className = '' }: CrosshairProps) {
  const color = hit ? '#fff6d8' : miss ? '#ffb4b4' : config.color
  const opacity = hit || miss ? Math.min(1, config.opacity + 0.15) : config.opacity
  const segments = getCrosshairSegments(config)
  const circleRadius = getCrosshairCircleRadius(config)
  const center = getCrosshairViewboxSize() / 2
  const outlineWidth = config.thickness + 2
  const hitGapScale = hit ? 0.72 : 1

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-30 flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${getCrosshairViewboxSize()} ${getCrosshairViewboxSize()}`}
        className={`transition-transform duration-75 ease-out ${
          hit ? 'scale-[1.08]' : miss ? 'scale-[0.94]' : 'scale-100'
        }`}
        style={{
          width: `${config.size * 2.8}px`,
          height: `${config.size * 2.8}px`,
          opacity,
          filter: hit
            ? 'drop-shadow(0 0 6px rgba(255, 220, 120, 0.55))'
            : miss
              ? 'drop-shadow(0 0 5px rgba(255, 90, 90, 0.45))'
              : undefined,
        }}
      >
        {hit && (
          <circle
            cx={center}
            cy={center}
            r={circleRadius !== null ? circleRadius + 6 : 18}
            fill="none"
            stroke="#ffe9a8"
            strokeWidth={1.5}
            strokeOpacity={0.7}
          />
        )}

        {config.showOutline && circleRadius !== null && (
          <circle
            cx={center}
            cy={center}
            r={circleRadius * hitGapScale}
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
              x1={center + (segment.x1 - center) * hitGapScale}
              y1={center + (segment.y1 - center) * hitGapScale}
              x2={center + (segment.x2 - center) * hitGapScale}
              y2={center + (segment.y2 - center) * hitGapScale}
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
            r={circleRadius * hitGapScale}
            fill="none"
            stroke={color}
            strokeWidth={config.thickness}
          />
        )}

        {segments.map((segment, index) => (
          <line
            key={`line-${index}`}
            x1={center + (segment.x1 - center) * hitGapScale}
            y1={center + (segment.y1 - center) * hitGapScale}
            x2={center + (segment.x2 - center) * hitGapScale}
            y2={center + (segment.y2 - center) * hitGapScale}
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

        {miss && !hit && (
          <>
            <line
              x1={center - 10}
              y1={center}
              x2={center + 10}
              y2={center}
              stroke="#ff8a8a"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeOpacity={0.9}
            />
            <line
              x1={center}
              y1={center - 10}
              x2={center}
              y2={center + 10}
              stroke="#ff8a8a"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeOpacity={0.9}
            />
          </>
        )}

        {hit && (
          <>
            <line
              x1={HIT_X_INSET}
              y1={HIT_X_INSET}
              x2={HIT_X_OUTSET}
              y2={HIT_X_OUTSET}
              stroke="#ffe9a0"
              strokeWidth={2.4}
              strokeLinecap="round"
            />
            <line
              x1={64 - HIT_X_INSET}
              y1={HIT_X_INSET}
              x2={64 - HIT_X_OUTSET}
              y2={HIT_X_OUTSET}
              stroke="#ffe9a0"
              strokeWidth={2.4}
              strokeLinecap="round"
            />
            <line
              x1={HIT_X_INSET}
              y1={64 - HIT_X_INSET}
              x2={HIT_X_OUTSET}
              y2={64 - HIT_X_OUTSET}
              stroke="#ffe9a0"
              strokeWidth={2.4}
              strokeLinecap="round"
            />
            <line
              x1={64 - HIT_X_INSET}
              y1={64 - HIT_X_INSET}
              x2={64 - HIT_X_OUTSET}
              y2={64 - HIT_X_OUTSET}
              stroke="#ffe9a0"
              strokeWidth={2.4}
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </div>
  )
}
