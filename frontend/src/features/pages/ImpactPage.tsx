import { RiLeafFill, RiMedalLine, RiRecycleLine, type RemixiconComponentType } from '@remixicon/react'
import { PageHeader } from './PageHeader'

const stats: { Icon: RemixiconComponentType; value: string; label: string }[] = [
  { Icon: RiMedalLine, value: '240', label: 'impact points' },
  { Icon: RiRecycleLine, value: '3', label: 'devices repaired' },
  { Icon: RiLeafFill, value: '8.4 kg', label: 'estimated e-waste avoided' },
]

export function ImpactPage() {
  return <><PageHeader eyebrow="Repair impact" title="Small repairs. Real impact."><p className="mt-3 text-sm text-[#717171]">Your verified repairs earn impact points and keep valuable materials in use.</p></PageHeader><section className="mx-auto max-w-6xl px-6 py-10 lg:px-10"><div className="grid gap-5 md:grid-cols-3">{stats.map(({ Icon, value, label }) => <article key={label} className="rounded-xl border border-[#ddd] p-6"><Icon className="size-6 text-[#008a05]" /><p className="mt-8 text-3xl font-semibold">{value}</p><p className="mt-1 text-sm text-[#717171]">{label}</p></article>)}</div><div className="mt-8 rounded-xl bg-[#e7f1e5] p-6"><h2 className="font-semibold">Next achievement: Repair regular</h2><p className="mt-2 text-sm text-[#526052]">One more verified repair unlocks your next profile badge.</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-white"><div className="h-full w-3/4 rounded-full bg-[#008a05]" /></div></div></section></>
}
