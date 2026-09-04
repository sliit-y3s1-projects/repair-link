import { useState } from 'react'
import { RiArrowDownSLine, RiArrowRightSLine, RiShieldCheckFill } from '@remixicon/react'
import { Link } from 'react-router'
import { repairers } from './data'
import { MapPanel } from './components/MapPanel'
import { RepairerCard } from './components/RepairerCard'
import { SearchControls } from './components/SearchControls'

export function DiscoveryPage() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [savedRepairers, setSavedRepairers] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('Colombo, Sri Lanka')
  const [availability, setAvailability] = useState('any')
  const [minimumRating, setMinimumRating] = useState('any')

  function toggleFilter(filter: string) {
    setActiveFilter((current) => current === filter ? null : filter)
  }

  function toggleSaved(name: string) {
    setSavedRepairers((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name])
  }

  const visibleRepairers = repairers.filter((repairer) => {
    const searchable = `${repairer.name} ${repairer.specialty}`.toLowerCase()
    const matchesQuery = !query || searchable.includes(query.toLowerCase())
    const matchesLocation = !location || location.toLowerCase().includes('colombo')
    const matchesAvailability = availability !== 'today' || repairer.availableToday
    const matchesPill = activeFilter === 'Available today' ? repairer.availableToday : activeFilter === 'Top rated' ? Number(repairer.rating) >= 4.9 : activeFilter === 'Mobile service' ? repairer.mobileService : true
    const matchesRating = minimumRating === 'any' || Number(repairer.rating) >= Number(minimumRating)
    return matchesQuery && matchesLocation && matchesAvailability && matchesPill && matchesRating
  })

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#222222]">
      <SearchControls activeFilter={activeFilter} query={query} location={location} availability={availability} onFilterChange={toggleFilter} onQueryChange={setQuery} onLocationChange={setLocation} onAvailabilityChange={setAvailability} />
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[minmax(0,64%)_minmax(0,36%)]">
        <section id="discover" className="min-w-0 px-6 py-8 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[.13em] text-[#718077]">Repairers near you</p>
          <div className="mt-2 flex items-end justify-between gap-4"><div><h1 className="text-3xl font-semibold tracking-[-.035em] text-[#252c27] sm:text-[32px]">Choose a repairer with confidence.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#69756d]">Compare availability, repair experience, pricing, and verified customer feedback.</p></div><label className="hidden shrink-0 text-xs font-semibold text-[#667269] sm:block">Sort by<select className="mt-1 block rounded-lg border border-[#d9ded9] bg-white px-3 py-2 text-sm font-medium text-[#303833] outline-none"><option>Recommended</option><option>Top rated</option><option>Lowest price</option><option>Nearest</option></select></label></div>
          {activeFilter === 'Filters' && <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#ddd] bg-[#f7f7f7] p-4 text-sm"><span className="font-semibold">Minimum rating</span><select value={minimumRating} onChange={(event) => setMinimumRating(event.target.value)} className="rounded-lg border border-[#ddd] bg-white px-3 py-2"><option value="any">Any rating</option><option value="4.8">4.8 and up</option><option value="4.9">4.9 and up</option></select></div>}
          <div className="mt-6 flex items-center justify-between border-y border-[#edf0ed] py-3 text-sm"><span className="font-semibold text-[#303833]">{visibleRepairers.length} repairer{visibleRepairers.length === 1 ? '' : 's'} found</span><span className="text-[#718077]">Showing recommended matches</span></div>
          <div className="mt-6 grid gap-4 xl:grid-cols-2">{visibleRepairers.map((repairer) => <RepairerCard key={repairer.name} repairer={repairer} isSaved={savedRepairers.includes(repairer.name)} onSave={() => toggleSaved(repairer.name)} />)}</div>
          {visibleRepairers.length === 0 && <div className="mt-8 rounded-xl border border-dashed border-[#ccc] p-8 text-center text-sm text-[#717171]">No repairers match these filters. Try clearing the search or choosing a different availability.</div>}
          <div className="mt-7 rounded-xl border border-[#dce9e0] bg-[#f4faf6] p-5"><p className="flex items-center gap-2 text-sm font-semibold text-[#294936]"><RiShieldCheckFill className="size-5 text-[#157a5a]" /> Repair with confidence</p><p className="mt-2 text-sm leading-6 text-[#617067]">Every listed repairer has a public profile, ratings from completed repairs, and clear quote information.</p></div>
        </section>
        <MapPanel repairers={visibleRepairers} />
      </div>
      <section id="parts" className="border-t border-[#ebebeb] bg-[#f7f7f7]"><div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-10"><div><p className="text-sm font-semibold">Need a specific part?</p><p className="mt-1 text-sm text-[#717171]">Search verified sellers for new, compatible, and refurbished components.</p></div><Link to="/parts" className="flex w-fit items-center gap-2 rounded-lg border border-[#222] bg-white px-4 py-3 text-sm font-semibold hover:bg-[#222] hover:text-white">Browse spare parts <RiArrowRightSLine className="size-4" /></Link></div></section>
      <footer className="border-t border-[#ebebeb] px-6 py-6 text-center text-xs text-[#717171]">© 2026 Repair Link · Keep devices in use for longer <span className="mx-2">·</span><button className="inline-flex items-center">English <RiArrowDownSLine className="ml-1 size-3" /></button></footer>
    </main>
  )
}
