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
  headshot?: boolean
  miss?: boolean
  className?: string
}

const HIT_X_INSET = 14
const HIT_X_OUTSET = 30
const HEADSHOT_X_INSET = 8
const HEADSHOT_X_OUTSET = 36

export function Crosshair({
  config,
  hit = false,
  headshot = false,
  miss = false,
  className = '',
}: CrosshairProps) {
  const confirmed = hit || headshot
  const color = headshot ? '#ffd0d8' : hit ? '#fff6d8' : miss ? '#ffb4b4' : config.color
  const opacity = confirmed || miss ? Math.min(1, config.opacity + 0.15) : config.opacity
  const segments = getCrosshairSegments(config)
  const circleRadius = getCrosshairCircleRadius(config)
  const center = getCrosshairViewboxSize() / 2
  const outlineWidth = config.thickness + 2
  const hitGapScale = confirmed ? (headshot ? 0.62 : 0.72) : 1
  const xInset = headshot ? HEADSHOT_X_INSET : HIT_X_INSET
  const xOutset = headshot ? HEADSHOT_X_OUTSET : HIT_X_OUTSET

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-30 flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${getCrosshairViewboxSize()} ${getCrosshairViewboxSize()}`}
        className={`transition-transform duration-75 ease-out ${
          headshot ? 'scale-[1.18]' : hit ? 'scale-[1.08]' : miss ? 'scale-[0.94]' : 'scale-100'
        }`}
        style={{
          width: `${config.size * 2.8}px`,
          height: `${config.size * 2.8}px`,
          opacity,
          filter: headshot
            ? 'drop-shadow(0 0 10px rgba(200, 90, 100, 0.55))'
            : hit
              ? 'drop-shadow(0 0 6px rgba(255, 220, 120, 0.55))'
              : miss
                ? 'drop-shadow(0 0 5px rgba(255, 90, 90, 0.45))'
                : undefined,
        }}
      >
        {confirmed && (
          <circle
            cx={center}
            cy={center}
            r={circleRadius !== null ? circleRadius + (headshot ? 10 : 6) : headshot ? 22 : 18}
            fill="none"
            stroke={headshot ? '#e8a0a8' : '#ffe9a8'}
            strokeWidth={headshot ? 2.6 : 1.5}
            strokeOpacity={headshot ? 0.92 : 0.7}
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

        {miss && !confirmed && (
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

        {confirmed && (
          <>
            <line
              x1={xInset}
              y1={xInset}
              x2={xOutset}
              y2={xOutset}
              stroke={headshot ? '#e8a8b0' : '#ffe9a0'}
              strokeWidth={headshot ? 3.6 : 2.4}
              strokeLinecap="round"
            />
            <line
              x1={64 - xInset}
              y1={xInset}
              x2={64 - xOutset}
              y2={xOutset}
              stroke={headshot ? '#e8a8b0' : '#ffe9a0'}
              strokeWidth={headshot ? 3.6 : 2.4}
              strokeLinecap="round"
            />
            <line
              x1={xInset}
              y1={64 - xInset}
              x2={xOutset}
              y2={64 - xOutset}
              stroke={headshot ? '#e8a8b0' : '#ffe9a0'}
              strokeWidth={headshot ? 3.6 : 2.4}
              strokeLinecap="round"
            />
            <line
              x1={64 - xInset}
              y1={64 - xInset}
              x2={64 - xOutset}
              y2={64 - xOutset}
              stroke={headshot ? '#e8a8b0' : '#ffe9a0'}
              strokeWidth={headshot ? 3.6 : 2.4}
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </div>
  )
}
