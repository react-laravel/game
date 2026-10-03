import { WEAPONS, zoomSensitivityScale, type WeaponId } from '../../utils/weapons'

const TICKS = Array.from({ length: 17 }, (_, i) => i - 8).filter((i) => i !== 0)

/** Clear circular aperture over the real zoomed camera; its center is the raycast center. */
export function ScopeOverlay({ hit = false }: { hit?: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1000] overflow-hidden"
      data-testid="sniper-scope"
      aria-hidden="true"
    >
      {/* The draggable navigation can be anywhere, including inside the clear aperture. */}
      <style>{'[data-testid="game-quick-menu"] { visibility: hidden; }'}</style>
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-[5px] border-[#1d2c31]"
        style={{
          width: '88vmin',
          height: '88vmin',
          boxShadow: '0 0 0 100vmax #020507, inset 0 0 28px 6px #02050780',
        }}
      >
        <svg className="absolute inset-0 size-full" viewBox="0 0 1000 1000">
          <circle
            cx="500"
            cy="500"
            r="487"
            fill="none"
            stroke="#8cb2bb"
            strokeOpacity=".5"
            strokeWidth="1.5"
          />
          {[4, 1.2].map((width, layer) => (
            <g
              key={layer}
              stroke={layer === 0 ? '#071319' : '#bdd1d7'}
              strokeWidth={width}
              fill="none"
            >
              <path d="M18 500H489M511 500H982M500 18V489M500 511V982" />
              {TICKS.map((tick) => {
                const p = 500 + tick * 47
                const length = tick % 2 === 0 ? 13 : 7
                return (
                  <g key={tick}>
                    <path
                      d={`M${p} ${500 - length}v${length * 2}M${500 - length} ${p}h${length * 2}`}
                    />
                  </g>
                )
              })}
            </g>
          ))}
          {[-6, -4, -2, 2, 4, 6].map((tick) => (
            <g
              key={tick}
              fill="#c6d7dc"
              stroke="#071319"
              strokeWidth="2"
              paintOrder="stroke"
              fontFamily="monospace"
              fontSize="15"
            >
              <text x={500 + tick * 47} y="531" textAnchor="middle">
                {Math.abs(tick / 2)}
              </text>
              <text x="524" y={506 + tick * 47}>
                {Math.abs(tick / 2)}
              </text>
            </g>
          ))}
          <circle cx="500" cy="500" r="3.2" fill={hit ? '#fff0d2' : '#ee8f78'} />
          {hit && (
            <path
              d="M480 480l12 12m16 16 12 12m0-40-12 12m-16 16-12 12"
              stroke="#fff0d2"
              strokeWidth="3"
            />
          )}
          <text
            x="500"
            y="124"
            textAnchor="middle"
            fill="#bdd1d7"
            fontFamily="monospace"
            fontSize="13"
            letterSpacing="6"
          >
            PRECISION OPTIC
          </text>
          <text
            x="500"
            y="879"
            textAnchor="middle"
            fill="#bdd1d7"
            fontFamily="monospace"
            fontSize="15"
          >
            {(1 / zoomSensitivityScale(WEAPONS.sniper.aimFov)).toFixed(1)}×
          </text>
        </svg>
      </div>
      <div className="absolute bottom-3 inset-x-0 text-center text-[10px] tracking-widest text-slate-400">
        松开右键退出瞄准镜
      </div>
    </div>
  )
}

export function WeaponStatus({ weaponId, isAiming }: { weaponId: WeaponId; isAiming: boolean }) {
  return (
    <div
      className="pointer-events-none absolute bottom-6 right-24 z-30 rounded-md border border-white/15 bg-[#192825]/90 px-4 py-2 text-white"
      data-testid="weapon-status"
    >
      <div className="flex gap-4 text-xs">
        {(['pistol', 'sniper'] as const).map((id) => (
          <span
            key={id}
            className={weaponId === id ? 'font-semibold text-[#e9bc8b]' : 'text-white/40'}
          >
            <span className="mr-1.5 font-mono">{WEAPONS[id].key}</span>
            {WEAPONS[id].name}
          </span>
        ))}
      </div>
      <div className="mt-1 text-[9px] text-white/45">
        {isAiming ? '瞄准中 · 松开右键恢复' : '滚轮 / 1、2 切枪 · 按住右键瞄准'}
      </div>
    </div>
  )
}
