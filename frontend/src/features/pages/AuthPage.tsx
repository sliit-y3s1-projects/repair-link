import { useState } from 'react'
import { RiArrowRightLine, RiMailLine, RiShieldCheckLine } from '@remixicon/react'
import { useNavigate } from 'react-router'
import { roleDashboardPaths, useAuth, type Role } from '@/features/auth/AuthContext'
import { login, register } from '@/lib/api'
import { PageHeader } from './PageHeader'

export function AuthPage() {
  const [mode, setMode] = useState<'sign-in' | 'create' | 'recovery'>('sign-in')
  const [role, setRole] = useState<Role>('consumer')
  const [complete, setComplete] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { authenticate, signIn } = useAuth()
  const navigate = useNavigate()
  async function submit() {
    if (mode === 'recovery') { setComplete(true); return }
    setError('')
    setSubmitting(true)
    try {
      const result = mode === 'create'
        ? await register({ email, password, displayName, role: role as 'consumer' | 'technician' | 'seller' })
        : await login({ email, password })
      authenticate(result)
      navigate(roleDashboardPaths[result.user.role])
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to sign in') } finally { setSubmitting(false) }
  }
  if (complete) return <><PageHeader eyebrow="Account" title="Password recovery" /><section className="mx-auto max-w-md px-6 py-16 text-center"><RiMailLine className="mx-auto size-9 text-[#157a5a]" /><h2 className="mt-5 text-xl font-semibold">Password recovery is not configured yet.</h2><p className="mt-3 text-sm text-[#717171]">Registration and login are live; email-based password reset needs an email provider before release.</p></section></>
  return <><PageHeader eyebrow="Account" title={mode === 'recovery' ? 'Reset your password' : mode === 'create' ? 'Create your account' : 'Welcome back'} /><section className="mx-auto max-w-md px-6 py-10"><div className="rounded-xl border border-[#ddd] p-6">{mode === 'create' && <label className="text-sm font-semibold">Display name<input value={displayName} onChange={event => setDisplayName(event.target.value)} className="mt-2 w-full rounded-lg border border-[#ddd] p-3 font-normal" placeholder="Your name or business name" /></label>}<label className={`block text-sm font-semibold ${mode === 'create' ? 'mt-4' : ''}`}>Email address<input value={email} onChange={event => setEmail(event.target.value)} type="email" className="mt-2 w-full rounded-lg border border-[#ddd] p-3 font-normal" placeholder="you@example.com" /></label>{mode !== 'recovery' && <label className="mt-4 block text-sm font-semibold">Password<input value={password} onChange={event => setPassword(event.target.value)} type="password" className="mt-2 w-full rounded-lg border border-[#ddd] p-3 font-normal" placeholder="Minimum 8 characters" /></label>}{mode === 'create' && <><p className="mt-5 text-sm font-semibold">I’m joining as</p><div className="mt-3 grid grid-cols-3 gap-2">{([['consumer', 'Consumer'], ['technician', 'Repairer'], ['seller', 'Seller']] as const).map(([value, label]) => <button type="button" key={value} onClick={() => setRole(value)} className={`rounded-lg border p-3 text-xs font-semibold ${role === value ? 'border-[#222] bg-[#f7f7f7]' : 'border-[#ddd]'}`}>{label}</button>)}</div></>}{error && <p className="mt-4 rounded-lg bg-[#fff1ef] p-3 text-sm text-[#a03f35]">{error}</p>}<button disabled={submitting} onClick={() => void submit()} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#157a5a] py-3 text-sm font-semibold text-white disabled:opacity-50">{submitting ? 'Please wait…' : mode === 'recovery' ? 'Show recovery status' : mode === 'create' ? 'Create account' : 'Sign in'} <RiArrowRightLine className="size-4" /></button><button onClick={() => { setError(''); setMode(mode === 'sign-in' ? 'create' : 'sign-in') }} className="mt-4 w-full text-sm font-semibold underline">{mode === 'sign-in' ? 'Create an account' : 'Already have an account?'}</button><button onClick={() => setMode('recovery')} className="mt-3 flex w-full items-center justify-center gap-1 text-xs text-[#717171]"><RiShieldCheckLine className="size-3" /> Forgot password?</button></div><div className="mt-5 rounded-xl bg-[#f7f7f7] p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#717171]">Development role preview</p><div className="mt-3 flex flex-wrap gap-2">{(['consumer', 'technician', 'seller', 'admin'] as Role[]).map((previewRole) => <button key={previewRole} onClick={() => { signIn(previewRole); navigate(roleDashboardPaths[previewRole]) }} className="rounded-lg border border-[#ddd] bg-white px-3 py-2 text-xs font-semibold capitalize">Open {previewRole}</button>)}</div></div></section></>
}
