import { useState } from 'react'
import { RiFlagLine, RiShieldCheckLine } from '@remixicon/react'
import { RoleLayout } from './RoleLayout'
import { useMarketplace } from '@/features/mock/MarketplaceContext'

export function AdminWorkspace() {
  const [resolved, setResolved] = useState(false)
  const { requests } = useMarketplace()
  const openDisputes = requests.filter(r => r.status === 'disputed').length
  const awaitingQuotes = requests.filter(r => r.status === 'requested').length
  const stats = [
    [String(Math.max(3, openDisputes)), 'Open reports', openDisputes > 0 ? `${openDisputes} active disputes` : '1 needs a response today'],
    ['18', 'Awaiting verification', '6 added in the last 24 hours'],
    [String(Math.max(12, awaitingQuotes)), 'Active disputes', awaitingQuotes > 0 ? `${awaitingQuotes} requests need quotes` : '4 are in resolution'],
  ] as const
  return (
    <RoleLayout title="Platform operations" description="Review moderation queues, verify marketplace participants, and govern the impact programme.">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(([value, label, detail]) => (
          <article key={label} className="rounded-xl border border-[#e0e6e1] bg-white p-5">
            <p className="text-2xl font-semibold tracking-[-.03em] text-[#1e2c23]">{value}</p>
            <p className="mt-1 text-sm font-semibold text-[#38473d]">{label}</p>
            <p className="mt-3 text-xs text-[#768278]">{detail}</p>
          </article>
        ))}
      </div>
      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <article className="overflow-hidden rounded-xl border border-[#dce5de] bg-white">
          <div className="border-b border-[#eaf0eb] bg-[#fdf7f3] px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[.12em] text-[#a07141]">Needs review</p>
            <h2 className="mt-1 flex items-center gap-2 font-semibold text-[#332b23]">
              <RiFlagLine className="size-5" /> Latest report
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm leading-6 text-[#657067]">Review dispute #R-1028: the customer says the quoted repair price changed after diagnosis.</p>
            <button onClick={() => setResolved(true)} className="mt-5 rounded-lg bg-[#1d3025] px-4 py-2.5 text-sm font-semibold text-white">
              {resolved ? 'Marked resolved' : 'Resolve report'}
            </button>
          </div>
        </article>
        <article className="rounded-xl bg-[#e7f1e5] p-6">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-[#5c806a]">Impact programme</p>
          <h2 className="mt-2 flex items-center gap-2 font-semibold">
            <RiShieldCheckLine className="size-5 text-[#157a5a]" /> Impact-point rule
          </h2>
          <p className="mt-4 text-sm text-[#526052]">Verified laptop repair: <strong>120 points</strong></p>
          <button className="mt-5 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#26563d] shadow-sm">Edit mock rule</button>
        </article>
        <article className="rounded-xl border border-[#dce5de] bg-white p-6 lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-[#5c806a]">Platform activity</p>
          <h2 className="mt-1 font-semibold">Repair request overview</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(['requested', 'quoted', 'booked', 'completed'] as const).map(status => (
              <div key={status} className="rounded-lg bg-[#f5faf6] p-3 text-center">
                <p className="text-xl font-semibold">{requests.filter(r => r.status === status).length}</p>
                <p className="mt-1 text-xs text-[#6d7a72] capitalize">{status.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </RoleLayout>
  )
}
