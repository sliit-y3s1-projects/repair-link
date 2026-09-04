import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { RiArrowRightLine, RiCheckLine, RiClipboardLine, RiFlagLine, RiInboxLine, RiNotification3Line } from '@remixicon/react'
import { RoleLayout } from '@/features/dashboard/RoleLayout'
import { repairStatusLabel, type RepairStatus, useMarketplace } from '@/features/mock/MarketplaceContext'
import { createCategory, deleteCategory, listAdminReports, listCategories, resolveAdminReport, updateCategory, verifyTechnician, type ApiCategory } from '@/lib/api'

const statusStyles: Record<RepairStatus, string> = {
  requested: 'bg-[#f0f2f1] text-[#536057]', quoted: 'bg-[#eef5fb] text-[#2e6590]', booked: 'bg-[#eaf5ed] text-[#286343]', in_progress: 'bg-[#fff4e4] text-[#9a6518]', waiting_for_parts: 'bg-[#f5effb] text-[#704b98]', completed: 'bg-[#e8f5ed] text-[#277044]', cancelled: 'bg-[#f5eeee] text-[#994848]', disputed: 'bg-[#fbefeb] text-[#9a4e35]',
}

function StatusPill({ status }: { status: RepairStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyles[status]}`}>{repairStatusLabel[status]}</span>
}

export function ConsumerRepairsPage() {
  const { requests } = useMarketplace()
  return <RoleLayout title="Your repairs" description="Track requests, compare quotes, and stay up to date from booking to completion."><div className="flex items-center justify-between"><p className="text-sm text-[#718077]">{requests.length} repair requests</p><Link to="/request" className="rounded-lg bg-[#157a5a] px-4 py-2.5 text-sm font-semibold text-white">New repair request</Link></div><div className="mt-5 overflow-hidden rounded-xl border border-[#dfe6e0] bg-white"><div className="hidden grid-cols-[1.4fr_.9fr_.8fr_auto] gap-4 border-b border-[#e7ece8] bg-[#f8faf8] px-5 py-3 text-xs font-bold uppercase tracking-wide text-[#7a867e] md:grid"><span>Request</span><span>Repairer</span><span>Status</span><span /></div>{requests.map((request) => <Link key={request.id} to={`/consumer/repairs/${request.id}`} className="grid gap-3 border-b border-[#edf0ed] px-5 py-5 transition-colors last:border-0 hover:bg-[#fafcfb] md:grid-cols-[1.4fr_.9fr_.8fr_auto] md:items-center"><div><p className="font-semibold text-[#26352c]">{request.title}</p><p className="mt-1 text-xs text-[#758178]">{request.location} · {request.createdAt}</p></div><p className="text-sm text-[#617067]">{request.technician ?? 'Waiting for quotes'}</p><div><StatusPill status={request.status} /></div><RiArrowRightLine className="hidden size-5 text-[#829087] md:block" /></Link>)}</div></RoleLayout>
}

export function ConsumerRepairDetailPage() {
  const { repairId } = useParams()
  const { requests, quotes, acceptQuote } = useMarketplace()
  const request = requests.find((item) => item.id === repairId)
  const [reviewed, setReviewed] = useState(false)
  if (!request) return <RoleLayout title="Repair not found" description="This repair request is no longer available."><Link className="text-sm font-semibold text-[#157a5a]" to="/consumer/repairs">Back to repairs</Link></RoleLayout>
  const requestQuotes = quotes.filter((quote) => quote.requestId === request.id)
  const history: RepairStatus[] = request.status === 'completed' ? ['requested', 'quoted', 'booked', 'in_progress', 'completed'] : request.status === 'booked' ? ['requested', 'quoted', 'booked'] : request.status === 'quoted' ? ['requested', 'quoted'] : ['requested']
  return <RoleLayout title={request.title} description={`${request.device} · ${request.location} · ${request.preferredTime}`}><Link to="/consumer/repairs" className="text-sm font-semibold text-[#157a5a]">← All repairs</Link><div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,.75fr)]"><div className="space-y-6"><article className="rounded-xl border border-[#dfe6e0] bg-white p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#6b8876]">Repair progress</p><h2 className="mt-2 text-xl font-semibold">{repairStatusLabel[request.status]}</h2></div><StatusPill status={request.status} /></div><div className="mt-6 flex gap-1">{history.map((status, index) => <div key={status} className="flex flex-1 items-center gap-1"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#157a5a] text-xs font-bold text-white">{index + 1}</span>{index < history.length - 1 && <span className="h-0.5 flex-1 bg-[#157a5a]" />}</div>)}</div><div className="mt-3 flex justify-between text-[11px] font-semibold text-[#6c786f]"><span>Requested</span><span>{repairStatusLabel[request.status]}</span></div><p className="mt-7 rounded-lg bg-[#f6f8f6] p-4 text-sm leading-6 text-[#5c6a60]">{request.issue}</p></article>{requestQuotes.length > 0 && <section><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#6b8876]">Quotes</p><h2 className="mt-1 text-lg font-semibold">Compare repair options</h2></div><span className="text-sm text-[#6b786f]">{requestQuotes.length} received</span></div><div className="mt-4 space-y-3">{requestQuotes.map((quote) => <article key={quote.id} className={`rounded-xl border bg-white p-5 ${quote.state === 'accepted' ? 'border-[#8ec6a1] ring-1 ring-[#8ec6a1]' : 'border-[#dfe6e0]'}`}><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><h3 className="font-semibold">{quote.technician}</h3><span className="text-xs text-[#65736a]">★ {quote.rating}</span></div><p className="mt-1 text-sm text-[#66746b]">{quote.duration} · {quote.message}</p></div><p className="text-lg font-semibold">Rs. {quote.amount.toLocaleString()}</p></div>{quote.state === 'sent' && request.status === 'quoted' && <button onClick={() => acceptQuote(quote.id)} className="mt-4 rounded-lg bg-[#157a5a] px-4 py-2.5 text-sm font-semibold text-white">Accept quote</button>}{quote.state === 'accepted' && <p className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#287044]"><RiCheckLine className="size-4" /> Booking confirmed</p>}</article>)}</div></section>}</div><aside className="space-y-5"><article className="rounded-xl border border-[#dfe6e0] bg-white p-5"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#748178]">Appointment</p><p className="mt-3 font-semibold">{request.scheduledFor ?? 'Choose after accepting a quote'}</p><p className="mt-2 text-sm text-[#6d7a72]">{request.technician ?? 'A repairer will confirm your appointment.'}</p><Link to="/consumer/messages" className="mt-5 inline-flex text-sm font-semibold text-[#157a5a]">Message repairer <RiArrowRightLine className="ml-1 size-4" /></Link></article>{request.status === 'completed' && <article className="rounded-xl bg-[#e8f3ea] p-5"><p className="font-semibold">How did it go?</p><p className="mt-2 text-sm text-[#54705d]">Your review helps other customers choose confidently.</p><button onClick={() => setReviewed(true)} className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#246043]">{reviewed ? 'Review submitted' : 'Leave a review'}</button></article>}</aside></div></RoleLayout>
}

export function TechnicianLeadsPage() {
  const { requests, quotes, createQuote } = useMarketplace()
  const leads = requests.filter((request) => request.status === 'requested' || request.status === 'quoted')
  const [amounts, setAmounts] = useState<Record<string, string>>({})
  return (
    <RoleLayout title="Repair leads" description="Review eligible local requests and send clear quotes while the customer is active.">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#718077]">{leads.length} leads matching your services</p>
        <span className="rounded-full bg-[#e9f4ec] px-3 py-1.5 text-xs font-semibold text-[#287044]">Colombo service area</span>
      </div>
      <div className="mt-5 space-y-4">
        {leads.map((lead) => {
          const sent = quotes.some((quote) => quote.requestId === lead.id && quote.technician === 'Kamal’s Device Care')
          return (
            <article key={lead.id} className="rounded-xl border border-[#dfe6e0] bg-white p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{lead.title}</h2>
                    <StatusPill status={lead.status} />
                  </div>
                  <p className="mt-2 text-sm text-[#65736a]">{lead.location} · {lead.preferredTime} · Budget up to Rs. {lead.budget.toLocaleString()}</p>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-[#5c6a60]">{lead.issue}</p>
                </div>
                <div className="flex min-w-[260px] gap-2">
                  <label className="flex flex-1 items-center rounded-lg border border-[#d4ded6] px-3">
                    <span className="mr-1 text-sm text-[#77847b]">Rs.</span>
                    <input
                      value={amounts[lead.id] ?? ''}
                      onChange={(event) => setAmounts((current) => ({ ...current, [lead.id]: event.target.value }))}
                      className="min-w-0 flex-1 py-2.5 text-sm font-semibold outline-none"
                      placeholder="Quote"
                      inputMode="numeric"
                    />
                  </label>
                  <button
                    disabled={sent || !amounts[lead.id]}
                    onClick={() => createQuote(lead.id, Number(amounts[lead.id].replaceAll(',', '')))}
                    className="rounded-lg bg-[#157a5a] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sent ? 'View quote' : 'Send quote'}
                  </button>
                </div>
              </div>
              <div className="mt-4 border-t border-[#edf0ed] pt-3">
                <Link to={'/consumer/repairs/' + lead.id} className="text-sm font-semibold text-[#157a5a]">
                  View full request <RiArrowRightLine className="mb-0.5 inline size-4" />
                </Link>
              </div>
            </article>
          )
        })}
        {leads.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#cfdad1] bg-white p-10 text-center">
            <RiInboxLine className="mx-auto size-7 text-[#779083]" />
            <p className="mt-3 font-semibold">No leads need a quote right now</p>
            <p className="mt-1 text-sm text-[#718077]">New requests matching your profile will appear here.</p>
          </div>
        )}
      </div>
    </RoleLayout>
  )
}

export function TechnicianJobsPage() {
  const { requests, updateRepairStatus } = useMarketplace()
  const activeJobs = requests.filter((request) => ['booked', 'in_progress', 'waiting_for_parts'].includes(request.status))
  const doneJobs = requests.filter((request) => ['completed', 'cancelled'].includes(request.status))
  const hasAny = activeJobs.length > 0 || doneJobs.length > 0
  return (
    <RoleLayout title="Active jobs" description="Keep customers informed with timely progress updates and clear next steps.">
      {!hasAny && (
        <div className="rounded-xl border border-dashed border-[#cfdad1] bg-white p-10 text-center">
          <RiInboxLine className="mx-auto size-7 text-[#779083]" />
          <p className="mt-3 font-semibold">No jobs yet</p>
          <p className="mt-1 text-sm text-[#718077]">Accepted repair requests will appear here.</p>
        </div>
      )}
      {activeJobs.length > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[.12em] text-[#718077]">Active</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {activeJobs.map((job) => (
              <article key={job.id} className="rounded-xl border border-[#dfe6e0] bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{job.title}</h2>
                    <p className="mt-1 text-sm text-[#6d7a72]">{job.scheduledFor ?? 'Schedule to confirm'} · {job.location}</p>
                  </div>
                  <StatusPill status={job.status} />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {(['in_progress', 'waiting_for_parts', 'completed'] as RepairStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateRepairStatus(job.id, status)}
                      disabled={job.status === status}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                        job.status === status
                          ? 'border-[#157a5a] bg-[#eaf5ed] text-[#246043]'
                          : 'border-[#d8e0da] text-[#627068]'
                      }`}
                    >
                      {repairStatusLabel[status]}
                    </button>
                  ))}
                </div>
                <Link to="/technician/messages" className="mt-5 inline-flex text-sm font-semibold text-[#157a5a]">
                  Open conversation <RiArrowRightLine className="ml-1 size-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
      {doneJobs.length > 0 && (
        <section className={activeJobs.length > 0 ? 'mt-8' : ''}>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[.12em] text-[#718077]">Completed &amp; cancelled</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {doneJobs.map((job) => (
              <article key={job.id} className="rounded-xl border border-[#dfe6e0] bg-white p-5 opacity-80">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{job.title}</h2>
                    <p className="mt-1 text-sm text-[#6d7a72]">{job.scheduledFor ?? 'N/A'} · {job.location}</p>
                  </div>
                  <StatusPill status={job.status} />
                </div>
                <p className="mt-4 text-xs text-[#88958d]">
                  {job.status === 'completed' ? 'This repair has been completed.' : 'This job was cancelled.'}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </RoleLayout>
  )
}

export function SellerOrdersPage() {
  const { orders, updateOrderStatus } = useMarketplace()
  return <RoleLayout title="Orders" description="Prepare and fulfil parts orders while keeping buyers informed at each handoff."><div className="overflow-hidden rounded-xl border border-[#dfe6e0] bg-white"><div className="hidden grid-cols-[1.2fr_1fr_.6fr_.7fr] gap-4 border-b border-[#e8ede9] bg-[#f8faf8] px-5 py-3 text-xs font-bold uppercase tracking-wide text-[#77847c] md:grid"><span>Order</span><span>Buyer</span><span>Total</span><span>Status</span></div>{orders.map((order) => <article key={order.id} className="grid gap-3 border-b border-[#edf0ed] px-5 py-5 last:border-0 md:grid-cols-[1.2fr_1fr_.6fr_.7fr] md:items-center"><div><p className="font-semibold">{order.part}</p><p className="mt-1 text-xs text-[#748178]">{order.id} · {order.quantity} item</p></div><p className="text-sm text-[#65736a]">{order.buyer}</p><p className="font-semibold">Rs. {order.total.toLocaleString()}</p><select value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value as typeof order.status)} className="rounded-lg border border-[#d6ded8] bg-white px-3 py-2 text-sm font-semibold capitalize"><option value="new">New</option><option value="packed">Packed</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option></select></article>)}</div></RoleLayout>
}

export function AdminQueuesPage() {
  const [verified, setVerified] = useState(false)
  const [resolved, setResolved] = useState(false)
  const [reports, setReports] = useState<Array<{ id: string; status: string; reason: string; targetType: string; targetId: string }>>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [categoryName, setCategoryName] = useState('')
  const { requests, updateRepairStatus } = useMarketplace()
  const disputedRequests = requests.filter(r => r.status === 'disputed')
  useEffect(() => { listAdminReports().then(setReports).catch(() => undefined); listCategories().then(setCategories).catch(() => undefined) }, [])
  const addCategory = async () => { const name = categoryName.trim(); if (!name) return; try { const created = await createCategory({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }); setCategories(current => [...current, created]); setCategoryName('') } catch { return } }
  return (
    <RoleLayout title="Operations queue" description="Review verification, moderation, disputes, and actions that keep the marketplace trusted.">
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-[#dfe6e0] bg-white">
          <div className="border-b border-[#e8ede9] bg-[#f5faf6] px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[.12em] text-[#5c806a]">Verification</p>
            <h2 className="mt-1 flex items-center gap-2 font-semibold"><RiClipboardLine className="size-5 text-[#157a5a]" /> Technician profile review</h2>
          </div>
          <div className="p-5">
            <p className="font-semibold">Mobile Medic</p>
            <p className="mt-1 text-sm text-[#6c796f]">Apple & Android repairs · Colombo · Documents submitted</p>
            <button onClick={async () => { try { await verifyTechnician('00000000-0000-4000-8000-000000000002', 'verified'); setVerified(true) } catch { return } }} className="mt-5 rounded-lg bg-[#157a5a] px-4 py-2.5 text-sm font-semibold text-white">{verified ? 'Verified' : 'Verify profile'}</button>
          </div>
        </article>
        <article className="rounded-xl border border-[#eadfd9] bg-white">
          <div className="border-b border-[#f0e5df] bg-[#fdf7f3] px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[.12em] text-[#a07141]">Dispute</p>
            <h2 className="mt-1 flex items-center gap-2 font-semibold"><RiFlagLine className="size-5 text-[#a07141]" /> Quote changed after diagnosis</h2>
          </div>
          <div className="p-5">
            <p className="text-sm leading-6 text-[#6c706c]">Customer disputes repair R-1028 after a changed service amount.</p>
            <button onClick={() => setResolved(true)} className="mt-5 rounded-lg border border-[#c9d4cc] px-4 py-2.5 text-sm font-semibold">{resolved ? 'Marked resolved' : 'Open resolution'}</button>
          </div>
        </article>
        {disputedRequests.length > 0 && (
          <article className="rounded-xl border border-[#eadfd9] bg-white lg:col-span-2">
            <div className="border-b border-[#f0e5df] bg-[#fdf7f3] px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[.12em] text-[#a07141]">Disputed repairs</p>
              <h2 className="mt-1 font-semibold">Active disputes needing resolution</h2>
            </div>
            <div className="divide-y divide-[#f0e5df]">
              {disputedRequests.map(req => (
                <div key={req.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="font-semibold">{req.title}</p>
                    <p className="mt-1 text-sm text-[#7a6c65]">{req.location} · {req.device}</p>
                  </div>
                  <button
                    onClick={() => updateRepairStatus(req.id, 'completed')}
                    className="rounded-lg bg-[#157a5a] px-3 py-2 text-xs font-semibold text-white"
                  >
                    Mark resolved
                  </button>
                </div>
              ))}
            </div>
          </article>
        )}
        {reports.length > 0 && (
          <article className="rounded-xl border border-[#dfe6e0] bg-white lg:col-span-2">
            <div className="border-b border-[#e8ede9] bg-[#f8faf8] px-5 py-4"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#5c806a]">Reports</p><h2 className="mt-1 font-semibold">Community reports</h2></div>
            <div className="divide-y divide-[#edf0ed]">{reports.map(report => <div key={report.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><p className="font-semibold">{report.reason}</p><p className="mt-1 text-xs text-[#748178]">{report.targetType} · {report.targetId} · {report.status}</p></div>{report.status !== 'resolved' && report.status !== 'dismissed' && <button onClick={async () => { await resolveAdminReport(report.id, 'resolved', 'Reviewed by admin'); setReports(current => current.map(item => item.id === report.id ? { ...item, status: 'resolved' } : item)) }} className="rounded-lg bg-[#157a5a] px-3 py-2 text-xs font-semibold text-white">Resolve</button>}</div>)}</div>
          </article>
        )}
        <article className="rounded-xl border border-[#dfe6e0] bg-white lg:col-span-2">
          <div className="border-b border-[#e8ede9] bg-[#f8faf8] px-5 py-4"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#5c806a]">Catalog administration</p><h2 className="mt-1 font-semibold">Device categories</h2><p className="mt-1 text-sm text-[#748178]">Create, rename, activate, or remove categories used by repair requests.</p></div>
          <div className="p-5"><div className="flex gap-2"><input value={categoryName} onChange={event => setCategoryName(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); void addCategory() } }} placeholder="New category name" className="flex-1 rounded-lg border border-[#d6ded8] px-3 py-2.5 text-sm" /><button onClick={() => void addCategory()} className="rounded-lg bg-[#157a5a] px-4 py-2.5 text-sm font-semibold text-white">Create</button></div><div className="mt-4 divide-y divide-[#edf0ed]">{categories.map(category => <div key={category.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-semibold">{category.name}</p><p className="text-xs text-[#748178]">{category.slug} · {category.isActive ? 'Active' : 'Inactive'}</p></div><div className="flex gap-2"><button onClick={async () => { const name = window.prompt('Category name', category.name)?.trim(); if (!name || name === category.name) return; const updated = await updateCategory(category.id, { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }); setCategories(current => current.map(item => item.id === category.id ? updated : item)) }} className="rounded-lg border border-[#c9d4cc] px-3 py-2 text-xs font-semibold">Rename</button><button onClick={async () => { const next = !category.isActive; await updateCategory(category.id, { isActive: next }); setCategories(current => current.map(item => item.id === category.id ? { ...item, isActive: next } : item)) }} className="rounded-lg border border-[#c9d4cc] px-3 py-2 text-xs font-semibold">{category.isActive ? 'Deactivate' : 'Activate'}</button><button onClick={async () => { if (!window.confirm(`Delete ${category.name}?`)) return; await deleteCategory(category.id); setCategories(current => current.filter(item => item.id !== category.id)) }} className="rounded-lg border border-[#e4c7c1] px-3 py-2 text-xs font-semibold text-[#a04f43]">Delete</button></div></div>)}</div></div>
        </article>
        <article className="rounded-xl bg-[#183f2f] p-6 text-white lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-[#aed3ba]">Impact rules</p>
          <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-semibold">Laptop repair awards 120 impact points</h2>
              <p className="mt-2 text-sm text-[#c5ddcc]">Current rule version: 2026.1 · Last changed by admin.</p>
            </div>
            <button className="rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold">Manage rules</button>
          </div>
        </article>
      </div>
    </RoleLayout>
  )
}

export function NotificationsPage() {
  const { notifications, markNotificationRead } = useMarketplace()
  return <RoleLayout title="Notifications" description="Stay on top of the moments that need your attention."><div className="max-w-3xl overflow-hidden rounded-xl border border-[#dfe6e0] bg-white">{notifications.map((notification) => <Link key={notification.id} to={notification.href} onClick={() => markNotificationRead(notification.id)} className={`flex gap-4 border-b border-[#edf0ed] p-5 last:border-0 ${notification.read ? 'bg-white' : 'bg-[#f6faf7]'}`}><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e4f1e8] text-[#157a5a]"><RiNotification3Line className="size-5" /></span><span><span className="block font-semibold">{notification.title}</span><span className="mt-1 block text-sm text-[#6c796f]">{notification.body}</span></span></Link>)}</div></RoleLayout>
}
