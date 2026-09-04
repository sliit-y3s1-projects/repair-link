import { useState } from 'react'
import { RiArrowDownSLine, RiArrowRightSLine, RiShieldCheckFill } from '@remixicon/react'
import { repairers } from './data'
import { MapPanel } from './components/MapPanel'
import { RepairerCard } from './components/RepairerCard'
import { SearchControls } from './components/SearchControls'

export function DiscoveryPage() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [savedRepairers, setSavedRepairers] = useState<string[]>([])

  function toggleFilter(filter: string) {
    setActiveFilter((current) => current === filter ? null : filter)
  }

  function toggleSaved(name: string) {
    setSavedRepairers((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name])
  }

  return (
    <main className="min-h-screen bg-white text-[#222222]">
      <SearchControls activeFilter={activeFilter} onFilterChange={toggleFilter} />
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[56%_44%]">
        <section id="discover" className="px-6 py-9 lg:px-10">
          <p className="text-sm font-medium">Over 30 repairers in Colombo</p>
          <div className="mt-2 flex items-end justify-between gap-4"><h1 className="text-3xl font-semibold tracking-[-.035em] sm:text-[32px]">Find someone to fix it right.</h1><button className="hidden items-center gap-1 text-sm font-semibold underline sm:flex">Sort: Recommended <RiArrowDownSLine className="size-4" /></button></div>
          <p className="mt-3 max-w-xl text-[15px] leading-6 text-[#717171]">Compare skilled local repairers, their availability, pricing, and recent customer reviews.</p>
          <div className="mt-8 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">{repairers.map((repairer) => <RepairerCard key={repairer.name} repairer={repairer} isSaved={savedRepairers.includes(repairer.name)} onSave={() => toggleSaved(repairer.name)} />)}</div>
          <div className="mt-10 rounded-xl border border-[#ebebeb] bg-[#f7f7f7] p-5"><p className="flex items-center gap-2 text-sm font-semibold"><RiShieldCheckFill className="size-5 text-[#008a05]" /> Repair with confidence</p><p className="mt-2 text-sm leading-6 text-[#717171]">Every listed repairer is reviewed by customers. See clear prices before you choose who to contact.</p></div>
        </section>
        <MapPanel />
      </div>
      <section id="parts" className="border-t border-[#ebebeb] bg-[#f7f7f7]"><div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-10"><div><p className="text-sm font-semibold">Need a specific part?</p><p className="mt-1 text-sm text-[#717171]">Search verified sellers for new, compatible, and refurbished components.</p></div><button className="flex w-fit items-center gap-2 rounded-lg border border-[#222] bg-white px-4 py-3 text-sm font-semibold hover:bg-[#222] hover:text-white">Browse spare parts <RiArrowRightSLine className="size-4" /></button></div></section>
      <footer className="border-t border-[#ebebeb] px-6 py-6 text-center text-xs text-[#717171]">© 2026 Repair Link · Keep devices in use for longer <span className="mx-2">·</span><button className="inline-flex items-center">English <RiArrowDownSLine className="ml-1 size-3" /></button></footer>
    </main>
  )
}
