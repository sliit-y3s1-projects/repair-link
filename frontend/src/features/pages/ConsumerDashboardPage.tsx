import { useState } from 'react'
import { RiChat1Line, RiStarLine } from '@remixicon/react'
import { PageHeader } from './PageHeader'

export function ConsumerDashboardPage() {
  const [reviewed, setReviewed] = useState(false)
  return <><PageHeader eyebrow="Consumer dashboard" title="Your repairs"><p className="mt-3 text-sm text-[#717171]">Track quotes, bookings, messages, and your repair impact.</p></PageHeader><section className="mx-auto max-w-6xl px-6 py-9 lg:px-10"><div className="grid gap-5 md:grid-cols-3">{[['Screen repair', 'Kamal’s Device Care', 'Booked · Tomorrow, 10:00 AM'], ['Laptop battery', 'FixRight Electronics', 'Quoted · 2 quotes to compare'], ['Microwave diagnosis', 'Mobile Medic', 'Completed · Review needed']].map(([job, repairer, status]) => <article key={job} className="rounded-xl border border-[#ddd] p-5"><p className="text-xs font-bold uppercase tracking-wide text-[#717171]">{status}</p><h2 className="mt-3 font-semibold">{job}</h2><p className="mt-1 text-sm text-[#717171]">{repairer}</p><div className="mt-5 flex gap-2"><button className="flex items-center gap-1 rounded-lg border border-[#ddd] px-3 py-2 text-xs font-semibold"><RiChat1Line className="size-4" /> Message</button>{status.includes('Review') && <button onClick={() => setReviewed(true)} className="flex items-center gap-1 rounded-lg border border-[#222] px-3 py-2 text-xs font-semibold"><RiStarLine className="size-4" /> {reviewed ? 'Reviewed' : 'Review'}</button>}</div></article>)}</div></section></>
}
