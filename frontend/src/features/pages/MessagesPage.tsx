import { useState } from 'react'
import { RiSendPlaneFill } from '@remixicon/react'
import { PageHeader } from './PageHeader'

export function MessagesPage() {
  const [messages, setMessages] = useState(['Hi, can you confirm whether the screen is original?', 'Yes, I use a compatible OLED panel with a 90-day warranty.'])
  const [draft, setDraft] = useState('')
  function send() { if (draft.trim()) { setMessages((current) => [...current, draft.trim()]); setDraft('') } }
  return <><PageHeader eyebrow="Messages" title="Repair conversations" /><section className="mx-auto grid max-w-5xl min-h-[520px] border-x border-[#ebebeb] md:grid-cols-[250px_1fr]"><aside className="border-b border-[#ebebeb] p-4 md:border-b-0 md:border-r"><p className="rounded-lg bg-[#f7f7f7] p-3 text-sm font-semibold">Kamal’s Device Care</p><p className="mt-3 p-3 text-sm text-[#717171]">FixRight Electronics</p></aside><div className="flex flex-col p-5"><div className="border-b border-[#ebebeb] pb-4"><p className="font-semibold">Kamal’s Device Care</p><p className="text-xs text-[#717171]">Screen repair request</p></div><div className="flex flex-1 flex-col gap-3 py-5">{messages.map((message, index) => <p key={`${message}-${index}`} className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${index % 2 === 0 ? 'self-start bg-[#f1f1f1]' : 'self-end bg-[#222] text-white'}`}>{message}</p>)}</div><div className="flex gap-2"><input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && send()} className="w-full rounded-lg border border-[#ddd] px-3 py-3 text-sm" placeholder="Write a message" /><button onClick={send} className="grid size-11 place-items-center rounded-lg bg-[#ff385c] text-white" aria-label="Send"><RiSendPlaneFill className="size-4" /></button></div></div></section></>
}
