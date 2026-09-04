import type { Repairer } from '../types'

const bounds = {
  minLatitude: 6.895,
  maxLatitude: 6.935,
  minLongitude: 79.85,
  maxLongitude: 79.88,
}

function markerPosition([latitude, longitude]: Repairer['coordinates']) {
  const left = ((longitude - bounds.minLongitude) / (bounds.maxLongitude - bounds.minLongitude)) * 100
  const top = ((bounds.maxLatitude - latitude) / (bounds.maxLatitude - bounds.minLatitude)) * 100

  return {
    left: `${Math.min(94, Math.max(6, left))}%`,
    top: `${Math.min(92, Math.max(8, top))}%`,
  }
}

export function MapPanel({ repairers }: { repairers: Repairer[] }) {
  return (
    <aside
      className="relative hidden h-[min(560px,calc(100vh-14rem))] min-w-0 self-start overflow-hidden border-l border-[#e6e9e5] bg-[#e8ebe2] lg:sticky lg:top-20 lg:block"
      aria-label="Repairers map"
    >
      <div className="absolute inset-0 opacity-70" aria-hidden="true">
        <div className="absolute -left-16 top-20 h-12 w-[130%] rotate-6 border-y-4 border-white bg-[#d8ddd2]" />
        <div className="absolute -left-12 top-[62%] h-9 w-[125%] -rotate-12 border-y-4 border-white bg-[#d8ddd2]" />
        <div className="absolute left-[28%] -top-12 h-[125%] w-10 rotate-[8deg] border-x-4 border-white bg-[#d8ddd2]" />
        <div className="absolute right-[20%] -top-12 h-[125%] w-8 -rotate-6 border-x-4 border-white bg-[#d8ddd2]" />
        <div className="absolute left-[46%] top-[34%] size-36 rounded-full bg-[#cddfc8]" />
      </div>

      {repairers.map((repairer) => (
        <div
          key={repairer.id}
          className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={markerPosition(repairer.coordinates)}
        >
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full border-[3px] border-white bg-[#157a5a] text-[10px] font-bold text-white shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#157a5a] focus:ring-offset-2"
            aria-label={`${repairer.name}, from ${repairer.price}`}
          >
            {repairer.initials}
          </button>
          <div className="pointer-events-none absolute bottom-12 left-1/2 hidden min-w-40 -translate-x-1/2 rounded-lg bg-white px-3 py-2 text-xs shadow-xl group-hover:block group-focus-within:block">
            <strong className="block text-[#242b26]">{repairer.name}</strong>
            <span className="text-[#69736c]">From {repairer.price}</span>
          </div>
        </div>
      ))}

      {repairers.length === 0 && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-white/80 text-sm font-semibold">
          No repairers match these filters.
        </div>
      )}
    </aside>
  )
}
