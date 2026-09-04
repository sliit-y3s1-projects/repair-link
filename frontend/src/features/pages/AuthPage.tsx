import { useState } from 'react'
import { RiArrowRightLine, RiMailLine, RiShieldCheckLine } from '@remixicon/react'
import { useNavigate } from 'react-router'
import { roleDashboardPaths, useAuth, type Role } from '@/features/auth/AuthContext'
import { PageHeader } from './PageHeader'

export function AuthPage() {
  const [mode, setMode] = useState<'sign-in' | 'create' | 'recovery'>('sign-in')
  const [role, setRole] = useState<Role>('consumer')
  const [complete, setComplete] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  function submit() {
    if (mode === 'recovery') { setComplete(true); return }
    signIn(role)
    navigate(roleDashboardPaths[role])
  }
  if (complete) return <><PageHeader eyebrow="Account" title="Check your inbox" /><section className="mx-auto max-w-md px-6 py-16 text-center"><RiMailLine className="mx-auto size-9 text-[#ff385c]" /><h2 className="mt-5 text-xl font-semibold">Your verification link is ready.</h2><p className="mt-3 text-sm text-[#717171]">This is a mock confirmation—no email was sent.</p></section></>
  return <><PageHeader eyebrow="Account" title={mode === 'recovery' ? 'Reset your password' : mode === 'create' ? 'Create your account' : 'Welcome back'} /><section className="mx-auto max-w-md px-6 py-10"><div className="rounded-xl border border-[#ddd] p-6"><label className="text-sm font-semibold">Email address<input className="mt-2 w-full rounded-lg border border-[#ddd] p-3 font-normal" placeholder="you@example.com" /></label>{mode !== 'recovery' && <label className="mt-4 block text-sm font-semibold">Password<input type="password" className="mt-2 w-full rounded-lg border border-[#ddd] p-3 font-normal" placeholder="••••••••" /></label>}{mode === 'create' && <><p className="mt-5 text-sm font-semibold">I’m joining as</p><div className="mt-3 grid grid-cols-3 gap-2">{([['consumer', 'Consumer'], ['technician', 'Repairer'], ['seller', 'Seller']] as const).map(([value, label]) => <button key={value} onClick={() => setRole(value)} className={`rounded-lg border p-3 text-xs font-semibold ${role === value ? 'border-[#222] bg-[#f7f7f7]' : 'border-[#ddd]'}`}>{label}</button>)}</div></>}<button onClick={submit} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff385c] py-3 text-sm font-semibold text-white">{mode === 'recovery' ? 'Send reset link' : mode === 'create' ? 'Create account' : 'Sign in'} <RiArrowRightLine className="size-4" /></button><button onClick={() => setMode(mode === 'sign-in' ? 'create' : 'sign-in')} className="mt-4 w-full text-sm font-semibold underline">{mode === 'sign-in' ? 'Create an account' : 'Already have an account?'}</button><button onClick={() => setMode('recovery')} className="mt-3 flex w-full items-center justify-center gap-1 text-xs text-[#717171]"><RiShieldCheckLine className="size-3" /> Forgot password?</button></div><div className="mt-5 rounded-xl bg-[#f7f7f7] p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#717171]">Prototype role preview</p><div className="mt-3 flex flex-wrap gap-2">{(['consumer', 'technician', 'seller', 'admin'] as Role[]).map((previewRole) => <button key={previewRole} onClick={() => { signIn(previewRole); navigate(roleDashboardPaths[previewRole]) }} className="rounded-lg border border-[#ddd] bg-white px-3 py-2 text-xs font-semibold capitalize">Open {previewRole}</button>)}</div></div></section></>
}
