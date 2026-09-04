import { RiCalendarLine, RiFilter3Line, RiMapPin2Line, RiSearchLine } from '@remixicon/react'
import { filters } from '../data'

type SearchControlsProps = {
  activeFilter: string | null
  query: string
  location: string
  availability: string
  onFilterChange: (filter: string) => void
  onQueryChange: (value: string) => void
  onLocationChange: (value: string) => void
  onAvailabilityChange: (value: string) => void
}

export function SearchControls({ activeFilter, query, location, availability, onFilterChange, onQueryChange, onLocationChange, onAvailabilityChange }: SearchControlsProps) {
  return <section className="border-b border-[#e6e9e5] bg-white"><div className="mx-auto max-w-[1440px] px-6 py-4 lg:px-10"><form onSubmit={(event) => event.preventDefault()} className="grid overflow-hidden rounded-xl border border-[#d9ded9] bg-white shadow-[0_2px_10px_rgba(31,48,39,.06)] lg:grid-cols-[minmax(0,1.25fr)_minmax(210px,.8fr)_minmax(180px,.65fr)_auto]"><label className="flex min-w-0 items-center gap-3 border-b border-[#e6e9e5] px-4 py-3 lg:border-b-0 lg:border-r"><RiSearchLine className="size-5 shrink-0 text-[#157a5a]" /><span className="min-w-0"><span className="block text-xs font-semibold text-[#303833]">Repair or device</span><input value={query} onChange={(event) => onQueryChange(event.target.value)} className="mt-0.5 w-full bg-transparent text-sm text-[#4f5a52] outline-none placeholder:text-[#98a09a]" placeholder="e.g. iPhone screen, laptop battery" /></span></label><label className="flex min-w-0 items-center gap-3 border-b border-[#e6e9e5] px-4 py-3 lg:border-b-0 lg:border-r"><RiMapPin2Line className="size-5 shrink-0 text-[#157a5a]" /><span className="min-w-0"><span className="block text-xs font-semibold text-[#303833]">Location</span><input value={location} onChange={(event) => onLocationChange(event.target.value)} className="mt-0.5 w-full bg-transparent text-sm text-[#4f5a52] outline-none" /></span></label><label className="flex min-w-0 items-center gap-3 px-4 py-3"><RiCalendarLine className="size-5 shrink-0 text-[#157a5a]" /><span className="min-w-0"><span className="block text-xs font-semibold text-[#303833]">Availability</span><select value={availability} onChange={(event) => onAvailabilityChange(event.target.value)} className="mt-0.5 w-full bg-transparent text-sm text-[#4f5a52] outline-none"><option value="any">Any time</option><option value="today">Available today</option></select></span></label><button className="m-2 flex items-center justify-center gap-2 rounded-lg bg-[#157a5a] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f513d]"><RiSearchLine className="size-4" /><span className="hidden xl:inline">Search</span></button></form><div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1"><span className="mr-1 hidden text-xs font-semibold uppercase tracking-[.12em] text-[#7b857d] sm:inline">Refine</span>{filters.map((filter) => <button key={filter} onClick={() => onFilterChange(filter)} className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${activeFilter === filter ? 'border-[#d0e5da] bg-[#e9f4ee] text-[#0f513d]' : 'border-[#d9ded9] bg-white text-[#505b53] hover:border-[#94b6a3]'}`}>{filter === 'Filters' && <RiFilter3Line className="size-4" />}{filter}</button>)}</div></div></section>
}
