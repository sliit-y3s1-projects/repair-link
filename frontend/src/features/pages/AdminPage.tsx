import { useState } from 'react'
import { RiFlagLine, RiShieldCheckLine } from '@remixicon/react'
import { PageHeader } from './PageHeader'

export function AdminPage() {
  const [resolved, setResolved] = useState(false)
  return <><PageHeader eyebrow="Admin workspace" title="Platform operations"><p className="mt-3 text-sm text-[#717171]">Moderation, disputes, categories, and impact rules.</p></PageHeader><section className="mx-auto grid max-w-6xl gap-5 px-6 py-9 md:grid-cols-3 lg:px-10"><article className="rounded-xl border border-[#ddd] p-5"><RiFlagLine className="size-5" /><p className="mt-5 text-2xl font-semibold">3</p><p className="text-sm text-[#717171]">Open reports</p><button onClick={() => setResolved(true)} className="mt-4 rounded-lg border border-[#222] px-3 py-2 text-xs font-semibold">{resolved ? 'Report resolved' : 'Review latest report'}</button></article><article className="rounded-xl border border-[#ddd] p-5"><RiShieldCheckLine className="size-5 text-[#008a05]" /><p className="mt-5 text-2xl font-semibold">18</p><p className="text-sm text-[#717171]">Repairers awaiting review</p></article><article className="rounded-xl border border-[#ddd] p-5"><p className="text-2xl font-semibold">120</p><p className="mt-1 text-sm text-[#717171]">Points per verified laptop repair</p><button className="mt-4 text-xs font-semibold underline">Edit point rules</button></article></section></>
}
