interface CrosshairProps {
  hit?: boolean
}

export function Crosshair({ hit = false }: CrosshairProps = {}) {
  const color = hit ? 'bg-amber-300' : 'bg-cyan-100'

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      <div
        className={`relative h-12 w-12 transition-transform duration-75 ${hit ? 'scale-110' : 'scale-100'}`}
        aria-hidden="true"
      >
        <div
          className={`absolute inset-2 rounded-full border transition-colors ${
            hit ? 'border-amber-300/90' : 'border-cyan-100/45'
          }`}
        />
        <div className={`absolute top-0 left-1/2 h-3 w-0.5 -translate-x-1/2 ${color}`} />
        <div className={`absolute bottom-0 left-1/2 h-3 w-0.5 -translate-x-1/2 ${color}`} />
        <div className={`absolute top-1/2 left-0 h-0.5 w-3 -translate-y-1/2 ${color}`} />
        <div className={`absolute top-1/2 right-0 h-0.5 w-3 -translate-y-1/2 ${color}`} />
        <div className={`absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-1/2 rounded-full ${color}`} />

        {hit && (
          <>
            <div className="absolute top-2 left-2 h-0.5 w-3 rotate-45 bg-amber-200" />
            <div className="absolute top-2 right-2 h-0.5 w-3 -rotate-45 bg-amber-200" />
            <div className="absolute bottom-2 left-2 h-0.5 w-3 -rotate-45 bg-amber-200" />
            <div className="absolute right-2 bottom-2 h-0.5 w-3 rotate-45 bg-amber-200" />
          </>
        )}
      </div>
    </div>
  )
}
