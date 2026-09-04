import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet'
import type { Repairer } from '../types'

export function MapPanel({ repairers }: { repairers: Repairer[] }) {
  return <aside className="relative hidden min-w-0 self-start overflow-hidden border-l border-[#e6e9e5] bg-[#e7e8dd] lg:sticky lg:top-20 lg:block" aria-label="Repairers map"><MapContainer center={[6.9147, 79.8612]} zoom={13} scrollWheelZoom className="h-[min(560px,calc(100vh-14rem))] w-full"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{repairers.map((repairer) => <CircleMarker key={repairer.id} center={repairer.coordinates} radius={15} pathOptions={{ color: '#ffffff', fillColor: '#157a5a', fillOpacity: 1, weight: 3 }}><Tooltip direction="top" offset={[0, -18]} opacity={1}><strong>{repairer.name}</strong><br />From {repairer.price}</Tooltip></CircleMarker>)}</MapContainer>{repairers.length === 0 && <div className="absolute inset-0 grid place-items-center bg-white/80 text-sm font-semibold">No repairers match these filters.</div>}</aside>
}
