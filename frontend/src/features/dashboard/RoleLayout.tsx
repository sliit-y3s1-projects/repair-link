import { type ReactNode } from 'react'
import { NavLink } from 'react-router'
import { RiAdminLine, RiBriefcaseLine, RiDashboardLine, RiLeafLine, RiMessage2Line, RiStore2Line, RiUserLine } from '@remixicon/react'
import { roleLabels, useAuth, type Role } from '@/features/auth/AuthContext'

const navigation: Record<Role, { label: string; to: string; icon: typeof RiDashboardLine }[]> = {
  consumer: [{ label: 'Overview', to: '/consumer/dashboard', icon: RiDashboardLine }, { label: 'My repairs', to: '/consumer/dashboard', icon: RiBriefcaseLine }, { label: 'Messages', to: '/messages', icon: RiMessage2Line }, { label: 'Impact', to: '/impact', icon: RiLeafLine }, { label: 'My profile', to: '/consumer/profile', icon: RiUserLine }],
  technician: [{ label: 'Overview', to: '/technician/dashboard', icon: RiDashboardLine }, { label: 'Repair leads', to: '/technician/dashboard', icon: RiBriefcaseLine }, { label: 'Messages', to: '/messages', icon: RiMessage2Line }, { label: 'My profile', to: '/technician/profile', icon: RiUserLine }],
  seller: [{ label: 'Overview', to: '/seller/dashboard', icon: RiDashboardLine }, { label: 'Storefront', to: '/seller/storefront', icon: RiStore2Line }, { label: 'Messages', to: '/messages', icon: RiMessage2Line }, { label: 'My profile', to: '/seller/profile', icon: RiUserLine }],
  admin: [{ label: 'Overview', to: '/admin/dashboard', icon: RiAdminLine }, { label: 'Moderation', to: '/admin/dashboard', icon: RiBriefcaseLine }, { label: 'Impact rules', to: '/admin/dashboard', icon: RiLeafLine }],
}

export function RoleLayout({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const { session } = useAuth()
  if (!session) return null
  const items = navigation[session.role]
  return <div className="min-h-[calc(100vh-80px)] bg-[#f7f7f7]"><div className="mx-auto grid max-w-[1440px] lg:grid-cols-[240px_1fr]"><aside className="border-b border-[#ebebeb] bg-white px-5 py-6 lg:min-h-[calc(100vh-80px)] lg:border-b-0 lg:border-r"><div className="flex items-center gap-3 border-b border-[#ebebeb] pb-5"><span className="grid size-10 place-items-center rounded-full bg-[#222] text-sm font-bold text-white">CS</span><div><p className="text-sm font-semibold">{session.name}</p><p className="text-xs text-[#717171]">{roleLabels[session.role]}</p></div></div><nav className="mt-5 flex gap-2 overflow-x-auto lg:flex-col">{items.map(({ label, to, icon: Icon }) => <NavLink key={label} to={to} className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-[#f1f1f1] text-[#222]' : 'text-[#717171] hover:bg-[#f7f7f7] hover:text-[#222]'}`}><Icon className="size-4" />{label}</NavLink>)}</nav></aside><section className="min-w-0 px-6 py-9 lg:px-10"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#717171]">{roleLabels[session.role]} workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.035em]">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#717171]">{description}</p><div className="mt-8">{children}</div></section></div></div>
}
