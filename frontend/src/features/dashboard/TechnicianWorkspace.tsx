import { useState } from 'react'
import { Link } from 'react-router'
import { RiArrowRightLine, RiCalendarCheckLine, RiCheckLine, RiMapPin2Line, RiMessage2Line, RiSendPlaneLine, RiStarFill, RiTimeLine } from '@remixicon/react'
import { RoleLayout } from './RoleLayout'
import { useMarketplace } from '@/features/mock/MarketplaceContext'

const TECH_NAME = 'Kamal\u2019s Device Care'

export function TechnicianWorkspace() {
  const { requests, quotes, createQuote } = useMarketplace()
  const [amount, setAmount] = useState('6,500')

  const leads = requests.filter(r => r.status === 'requested' || r.status === 'quoted')
  const activeJobs = requests.filter(
    r => ['booked', 'in_progress', 'waiting_for_parts'].includes(r.status) && r.technician === TECH_NAME,
  )

  const metrics = [
    {
      value: String(leads.length),
      label: 'New repair leads',
      detail: leads.length > 0 ? `${leads.length} open near your area` : 'No new leads right now',
    },
    {
      value: String(activeJobs.length),
      label: 'Jobs scheduled',
      detail: activeJobs.length > 0
        ? `${activeJobs.filter(j => j.status === 'booked').length} need an update`
        : 'No scheduled jobs',
    },
    { value: '4.91', label: 'Public rating', detail: '124 completed reviews' },
  ]

  const priorityLead = leads.length > 0 ? leads[0] : null
  const alreadySent = priorityLead
    ? quotes.some(q => q.requestId === priorityLead.id && q.technician === TECH_NAME)
    : false

  const scheduleJobs = activeJobs.slice(0, 2)

  const statusPillClass = (status: string) => {
    if (status === 'booked') return 'rounded-full bg-[#edf7ef] px-2 py-1 text-[11px] font-semibold text-[#38744f]'
    if (status === 'in_progress') return 'rounded-full bg-[#fff5e6] px-2 py-1 text-[11px] font-semibold text-[#9a6616]'
    if (status === 'waiting_for_parts') return 'rounded-full bg-[#f5effb] px-2 py-1 text-[11px] font-semibold text-[#704b98]'
    return 'rounded-full bg-[#f0f2f1] px-2 py-1 text-[11px] font-semibold text-[#536057]'
  }

  const statusLabel: Record<string, string> = {
    booked: 'Booked',
    in_progress: 'In progress',
    waiting_for_parts: 'Waiting for parts',
  }

  return (
    <RoleLayout
      title="Good afternoon, Chamal"
      description="Here is what needs your attention today—new leads, active jobs, and the health of your repair business."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-xl border border-[#e0e6e1] bg-white p-5">
            <p className="text-2xl font-semibold tracking-[-.03em] text-[#1e2c23]">{metric.value}</p>
            <p className="mt-1 text-sm font-semibold text-[#38473d]">{metric.label}</p>
            <p className="mt-3 text-xs text-[#768278]">{metric.detail}</p>
          </article>
        ))}
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(330px,.75fr)]">
        <div className="space-y-6">
          {priorityLead ? (
            <article className="overflow-hidden rounded-xl border border-[#dce5de] bg-white">
              <div className="flex flex-col gap-4 border-b border-[#eaf0eb] bg-[#f5faf6] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-[#5c806a]">Priority lead</p>
                  <h2 className="mt-1 font-semibold text-[#233127]">Respond while the customer is active</h2>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-[#407356]">
                  <RiTimeLine className="size-4" /> 32 min ago
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold tracking-[-.02em]">{priorityLead.title}</h3>
                    <p className="mt-2 flex items-center gap-1 text-sm text-[#66736a]">
                      <RiMapPin2Line className="size-4 text-[#157a5a]" />
                      {priorityLead.location} · {priorityLead.preferredTime}
                    </p>
                  </div>
                  <span className="rounded-full border border-[#d9e9dd] bg-[#f2faf4] px-3 py-1.5 text-xs font-semibold text-[#286040]">
                    Budget Rs. {priorityLead.budget.toLocaleString()}
                  </span>
                </div>
                <p className="mt-5 rounded-lg bg-[#f7f8f7] p-4 text-sm leading-6 text-[#5e6c62]">
                  "{priorityLead.issue}"
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <label className="flex min-w-0 flex-1 items-center rounded-lg border border-[#cfd9d1] bg-white px-3">
                    <span className="mr-2 text-sm text-[#6b766e]">Rs.</span>
                    <input
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      className="w-full py-3 text-sm font-semibold outline-none"
                      inputMode="numeric"
                    />
                  </label>
                  <button
                    disabled={alreadySent}
                    onClick={() => createQuote(priorityLead.id, Number(amount.replaceAll(',', '')))}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#157a5a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0f513d] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RiSendPlaneLine className="size-4" />
                    {alreadySent ? 'Quote sent' : 'Send quote'}
                  </button>
                  <button
                    className="grid size-11 place-items-center rounded-lg border border-[#d3ddd5] text-[#405147]"
                    aria-label="Message customer"
                  >
                    <RiMessage2Line className="size-5" />
                  </button>
                </div>
                {alreadySent && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#2f7450]">
                    <RiCheckLine className="size-4" /> Your quote was sent to the customer.
                  </p>
                )}
              </div>
            </article>
          ) : (
            <article className="overflow-hidden rounded-xl border border-dashed border-[#cfdad1] bg-white p-10 text-center">
              <RiTimeLine className="mx-auto size-7 text-[#779083]" />
              <p className="mt-3 font-semibold text-[#2a3b2e]">No priority leads right now</p>
              <p className="mt-1 text-sm text-[#718077]">New repair requests matching your profile will appear here.</p>
              <Link to="/technician/leads" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#157a5a]">
                Browse all leads <RiArrowRightLine className="size-4" />
              </Link>
            </article>
          )}

          <article className="rounded-xl border border-[#e0e6e1] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.12em] text-[#728077]">Business health</p>
                <h2 className="mt-1 font-semibold">Your profile is 86% complete</h2>
              </div>
              <button className="flex items-center gap-1 text-sm font-semibold text-[#157a5a]">
                Complete profile <RiArrowRightLine className="size-4" />
              </button>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e8eee9]">
              <div className="h-full w-[86%] rounded-full bg-[#157a5a]" />
            </div>
            <p className="mt-3 text-sm text-[#6b786f]">
              Add service pricing and your Saturday availability to improve lead matching.
            </p>
          </article>
        </div>

        <aside className="space-y-6">
          <article className="rounded-xl border border-[#e0e6e1] bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <RiCalendarCheckLine className="size-5 text-[#157a5a]" /> Today's schedule
              </h2>
              <button className="text-xs font-semibold text-[#157a5a]">Calendar</button>
            </div>
            {scheduleJobs.length > 0 ? (
              <div className="mt-5 space-y-0">
                {scheduleJobs.map((job, index) => (
                  <div
                    key={job.id}
                    className={`flex gap-4 py-4 ${index < scheduleJobs.length - 1 ? 'border-b border-[#edf0ed]' : ''}`}
                  >
                    <span className="w-11 shrink-0 text-sm font-semibold text-[#3d4d42]">
                      {job.scheduledFor ?? 'TBC'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{job.title}</p>
                      <p className="mt-1 text-xs text-[#738077]">{job.location}</p>
                    </div>
                    <span className={statusPillClass(job.status)}>
                      {statusLabel[job.status] ?? job.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-[#718077]">No scheduled jobs today.</p>
            )}
          </article>

          <article className="rounded-xl bg-[#183f2f] p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-[.12em] text-[#a4c9b2]">Reputation</p>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-3xl font-semibold">
                  4.91 <RiStarFill className="mb-1 inline size-5 text-[#e2b55b]" />
                </p>
                <p className="mt-1 text-sm text-[#c7ddcf]">from 124 verified reviews</p>
              </div>
              <button className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold">View reviews</button>
            </div>
          </article>
        </aside>
      </div>
    </RoleLayout>
  )
}
