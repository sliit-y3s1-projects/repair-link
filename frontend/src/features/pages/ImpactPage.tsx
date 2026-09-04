import { RiLeafFill, RiMedalLine, RiRecycleLine, type RemixiconComponentType } from '@remixicon/react'
import { RoleLayout } from '@/features/dashboard/RoleLayout'
import { useMarketplace } from '@/features/mock/MarketplaceContext'

export function ImpactPage() {
  const { totalImpactPoints, completedRepairs } = useMarketplace()
  const eWasteKg = (completedRepairs * 2.8).toFixed(1)

  const stats: { Icon: RemixiconComponentType; value: string; label: string }[] = [
    { Icon: RiMedalLine, value: String(totalImpactPoints), label: 'impact points' },
    { Icon: RiRecycleLine, value: String(completedRepairs), label: 'devices repaired' },
    { Icon: RiLeafFill, value: `${eWasteKg} kg`, label: 'estimated e-waste avoided' },
  ]

  const nextTarget = Math.ceil((completedRepairs + 1) / 4) * 4
  const progressPercent = Math.min(100, Math.round((completedRepairs % 4) / 4 * 100))

  return (
    <RoleLayout title="Small repairs. Real impact." description="Your verified repairs earn impact points and keep valuable materials in use.">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(({ Icon, value, label }) => (
          <article key={label} className="rounded-xl border border-[#dfe6e0] bg-white p-6">
            <Icon className="size-6 text-[#157a5a]" />
            <p className="mt-8 text-3xl font-semibold tracking-[-.04em]">{value}</p>
            <p className="mt-1 text-sm text-[#6d7a72]">{label}</p>
          </article>
        ))}
      </div>
      <div className="mt-7 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <article className="rounded-xl bg-[#e7f1e5] p-6">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-[#5b8069]">Next achievement</p>
          <h2 className="mt-2 text-xl font-semibold">Repair regular</h2>
          <p className="mt-2 text-sm text-[#526a5c]">One more verified repair unlocks your next profile badge.</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-[#157a5a]" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="mt-3 text-xs font-semibold text-[#477154]">{completedRepairs} of {nextTarget} verified repairs</p>
        </article>
        <article className="rounded-xl border border-[#dfe6e0] bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-[#738178]">Latest award</p>
          <h2 className="mt-2 font-semibold">Phone repair completed</h2>
          <p className="mt-2 text-sm text-[#6c796f]">
            {completedRepairs > 0 ? '+120 points · 2.8 kg e-waste avoided' : 'No repairs completed yet'}
          </p>
        </article>
      </div>
    </RoleLayout>
  )
}
