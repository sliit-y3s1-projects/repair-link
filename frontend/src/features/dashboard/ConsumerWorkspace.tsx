import { useState } from 'react'
import { Link } from 'react-router'
import { RiArrowRightLine, RiChat1Line, RiLeafLine, RiStarLine, RiTimeLine } from '@remixicon/react'
import { RoleLayout } from './RoleLayout'
import { useMarketplace } from '@/features/mock/MarketplaceContext'

const statusSteps = ['requested', 'quoted', 'booked'] as const

export function ConsumerWorkspace() {
  const [reviewed, setReviewed] = useState(false)
  const { requests, totalImpactPoints } = useMarketplace()

  const activeRepairs = requests.filter(r => ['booked', 'in_progress', 'waiting_for_parts'].includes(r.status))
  const quotesReady = requests.filter(r => r.status === 'quoted')

  const stats = [
    [String(activeRepairs.length), 'Active repairs', activeRepairs[0] ? activeRepairs[0].title : 'No active repairs'],
    [String(quotesReady.length), 'Quotes to compare', quotesReady[0] ? `${quotesReady[0].title}` : 'No new quotes'],
    [String(totalImpactPoints), 'Impact points', `${requests.filter(r => r.status === 'completed').length} repairs completed`],
  ]

  const activeRepair = activeRepairs[0] ?? null
  const activeStatusIndex = activeRepair ? statusSteps.indexOf(activeRepair.status as typeof statusSteps[number]) : -1

  return (
    <RoleLayout title="Good afternoon, Chamal" description="Manage your repair requests, compare quotes, and follow every job from booking through completion.">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(([value, label, detail]) => (
          <article key={label} className="rounded-xl border border-[#e0e6e1] bg-white p-5 shadow-[0_1px_1px_rgba(24,63,47,.02)]">
            <p className="text-2xl font-semibold tracking-[-.03em] text-[#1e2c23]">{value}</p>
            <p className="mt-1 text-sm font-semibold text-[#38473d]">{label}</p>
            <p className="mt-3 text-xs text-[#768278]">{detail}</p>
          </article>
        ))}
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(290px,.65fr)]">
        {activeRepair ? (
          <article className="overflow-hidden rounded-xl border border-[#dce5de] bg-white">
            <div className="flex items-center justify-between border-b border-[#eaf0eb] bg-[#f5faf6] px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.12em] text-[#5c806a]">Active repair</p>
                <h2 className="mt-1 font-semibold text-[#233127]">Your booking is confirmed</h2>
              </div>
              <span className="rounded-full bg-[#e5f3e9] px-3 py-1.5 text-xs font-semibold text-[#216a48]">
                {activeRepair.status.charAt(0).toUpperCase() + activeRepair.status.slice(1).replace(/_/g, ' ')}
              </span>
            </div>
            <div className="p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row">
                <div>
                  <h3 className="text-xl font-semibold tracking-[-.02em]">{activeRepair.title}</h3>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-[#66736a]">
                    <RiTimeLine className="size-4 text-[#157a5a]" />
                    {activeRepair.scheduledFor ?? 'TBC'} · {activeRepair.technician ?? 'Awaiting booking'}
                  </p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
                {statusSteps.map((s, i) => (
                  <p
                    key={s}
                    className={`rounded-lg p-3 font-semibold ${i <= activeStatusIndex ? 'bg-[#176b4d] text-white' : 'bg-[#f2f5f2] text-[#647168]'}`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </p>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link to="/messages" className="flex items-center gap-2 rounded-lg bg-[#157a5a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f513d]">
                  <RiChat1Line className="size-4" /> Message repairer
                </Link>
                <Link to="/request" className="flex items-center gap-1 text-sm font-semibold text-[#176b4d]">
                  New request <RiArrowRightLine className="size-4" />
                </Link>
              </div>
            </div>
          </article>
        ) : (
          <article className="overflow-hidden rounded-xl border border-[#dce5de] bg-white">
            <div className="flex items-center justify-between border-b border-[#eaf0eb] bg-[#f5faf6] px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.12em] text-[#5c806a]">Active repair</p>
                <h2 className="mt-1 font-semibold text-[#233127]">No active repairs</h2>
              </div>
            </div>
            <div className="flex flex-col items-start gap-4 p-5">
              <p className="text-sm text-[#66736a]">You have no ongoing repairs at the moment.</p>
              <Link to="/request" className="flex items-center gap-2 rounded-lg bg-[#157a5a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f513d]">
                New request <RiArrowRightLine className="size-4" />
              </Link>
            </div>
          </article>
        )}

        <aside className="rounded-xl bg-[#e7f1e5] p-6">
          <RiLeafLine className="size-5 text-[#157a5a]" />
          <h2 className="mt-5 font-semibold">Repair with confidence</h2>
          <p className="mt-2 text-sm leading-6 text-[#526a5c]">Leave a review after your repair and receive verified impact points.</p>
          <button
            onClick={() => setReviewed(true)}
            className="mt-6 flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#26563d] shadow-sm"
          >
            <RiStarLine className="size-4" /> {reviewed ? 'Review submitted' : 'Leave a review'}
          </button>
        </aside>
      </div>
    </RoleLayout>
  )
}
