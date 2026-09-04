import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { RiCloseLine, RiRobot2Line, RiSendPlane2Line } from '@remixicon/react'
import { Link } from 'react-router'

type TechnicianMatch = {
  technicianId: string
  businessName: string
  serviceArea: string
  averageRating: number
  matchedSkills: string[]
}

type AssistantReply = {
  answer: string
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  safetyWarning: string | null
  followUpQuestions: string[]
  matchedTechnicians: TechnicianMatch[]
}

type ChatMessage =
  | { id: number; sender: 'user'; text: string }
  | { id: number; sender: 'assistant'; reply: AssistantReply }
  | { id: number; sender: 'error'; text: string }

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000').replace(/\/$/, '')

export function AiRepairChat() {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedQuestion = question.trim()
    if (trimmedQuestion.length < 5 || loading) return

    setMessages((current) => [...current, { id: Date.now(), sender: 'user', text: trimmedQuestion }])
    setQuestion('')
    setLoading(true)

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/ai-repair-assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmedQuestion }),
      })
      const payload = await response.json() as {
        message?: string
        data?: { assessment: Omit<AssistantReply, 'matchedTechnicians'>; matchedTechnicians: TechnicianMatch[] }
      }

      if (!response.ok || !payload.data) {
        throw new Error(payload.message ?? 'The assistant could not answer right now.')
      }
      const data = payload.data

      setMessages((current) => [
        ...current,
        {
          id: Date.now(),
          sender: 'assistant',
          reply: { ...data.assessment, matchedTechnicians: data.matchedTechnicians },
        },
      ])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The assistant could not answer right now.'
      setMessages((current) => [...current, { id: Date.now(), sender: 'error', text: message }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 sm:bottom-7 sm:right-7">
      {open && (
        <section
          className="mb-3 flex h-[min(620px,calc(100vh-7rem))] w-[min(390px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-[#dfe6e1] bg-white shadow-2xl"
          aria-label="RepairLink AI Repair Assistant"
        >
          <header className="flex items-center gap-3 bg-[#176b4d] px-4 py-3.5 text-white">
            <span className="relative grid size-10 place-items-center rounded-xl border border-white/20 bg-white/15 shadow-inner">
              <RiRobot2Line className="size-6" />
              <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[#176b4d] bg-[#f5c451]" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold">AI Repair Assistant</h2>
              <p className="text-[11px] text-white/75">Describe what is going wrong</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-full hover:bg-white/15" aria-label="Close assistant">
              <RiCloseLine className="size-5" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#f7f9f7] p-4" aria-live="polite">
            {messages.length === 0 && (
              <div className="rounded-xl border border-[#e2e8e3] bg-white p-4 text-sm leading-6 text-[#536058]">
                Tell me about the device and symptoms. For example: “My phone gets very hot and the battery is swelling.”
              </div>
            )}
            {messages.map((message) => {
              if (message.sender === 'user') {
                return <div key={message.id} className="ml-10 rounded-2xl rounded-br-sm bg-[#176b4d] px-4 py-3 text-sm leading-5 text-white">{message.text}</div>
              }
              if (message.sender === 'error') {
                return <div key={message.id} className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{message.text}</div>
              }

              return (
                <div key={message.id} className="space-y-3 rounded-2xl rounded-bl-sm border border-[#e1e7e2] bg-white p-4 text-sm text-[#354139] shadow-sm">
                  <p className="whitespace-pre-wrap leading-6">{message.reply.answer}</p>
                  {message.reply.safetyWarning && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                      <strong>Safety:</strong> {message.reply.safetyWarning}
                    </div>
                  )}
                  {message.reply.followUpQuestions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[#5b675f]">Helpful details to check</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-5 text-[#667168]">
                        {message.reply.followUpQuestions.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {message.reply.matchedTechnicians.length > 0 && (
                    <div className="border-t border-[#edf0ed] pt-3">
                      <p className="text-xs font-semibold">Matching repairers</p>
                      <div className="mt-2 space-y-2">
                        {message.reply.matchedTechnicians.map((technician) => (
                          <Link key={technician.technicianId} to={`/repairers/${technician.technicianId}`} onClick={() => setOpen(false)} className="block rounded-lg bg-[#f1f6f2] p-2.5 hover:bg-[#e8f1ea]">
                            <span className="block text-xs font-semibold text-[#24523b]">{technician.businessName}</span>
                            <span className="text-[11px] text-[#69756d]">{technician.serviceArea} · {technician.averageRating.toFixed(1)} ★</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {loading && <div className="w-fit rounded-2xl rounded-bl-sm border border-[#e1e7e2] bg-white px-4 py-3 text-sm text-[#69756d]">Thinking…</div>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={submitQuestion} className="border-t border-[#e3e8e4] bg-white p-3">
            <div className="flex items-end gap-2 rounded-xl border border-[#d9e1db] bg-[#fafbfa] p-2 focus-within:border-[#176b4d]">
              <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={2} maxLength={2000} placeholder="Ask about a repair problem…" className="max-h-24 min-h-10 flex-1 resize-none bg-transparent px-1 py-1 text-sm outline-none" />
              <button type="submit" disabled={question.trim().length < 5 || loading} className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#176b4d] text-white disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send question">
                <RiSendPlane2Line className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-[#879088]">AI guidance can be wrong. Use a qualified technician for diagnosis.</p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`group relative ml-auto flex h-16 items-center justify-center overflow-visible rounded-full border-2 border-white bg-[#176b4d] text-white shadow-[0_12px_35px_rgba(23,107,77,0.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#12583f] hover:shadow-[0_16px_40px_rgba(23,107,77,0.45)] focus:outline-none focus:ring-2 focus:ring-[#176b4d] focus:ring-offset-2 ${open ? 'w-16' : 'w-16 sm:w-auto sm:px-5'}`}
        aria-label={open ? 'Close AI Repair Assistant' : 'Open AI Repair Assistant'}
        aria-expanded={open}
      >
        {!open && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#2d9a70]/25 [animation-duration:2.4s]" />}
        {open ? (
          <RiCloseLine className="size-7" />
        ) : (
          <>
            <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-white/15">
              <RiRobot2Line className="size-7 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110" />
              <span className="absolute right-0 top-0 size-3 rounded-full border-2 border-[#176b4d] bg-[#f5c451]" />
            </span>
            <span className="ml-2 hidden text-left sm:block">
              <span className="block text-sm font-bold leading-tight">AI Repair Help</span>
              <span className="block text-[10px] font-medium text-white/75">Ask me anything</span>
            </span>
          </>
        )}
      </button>
    </div>
  )
}
