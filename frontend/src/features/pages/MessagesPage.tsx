import { useState } from 'react'
import { RiSendPlaneFill } from '@remixicon/react'
import { RoleLayout } from '@/features/dashboard/RoleLayout'

const conversations = [
  {
    id: 'conv-kamal',
    name: "Kamal's Device Care",
    topic: 'Screen repair request',
    messages: ['Hi, can you confirm whether the screen is original?', 'Yes, I use a compatible OLED panel with a 90-day warranty.'],
  },
  {
    id: 'conv-fixright',
    name: 'FixRight Electronics',
    topic: 'MacBook battery request',
    messages: ['Do you have the battery in stock?', 'Yes, available for pickup or I can ship it.'],
  },
]

export function MessagesPage() {
  const [activeConvId, setActiveConvId] = useState('conv-kamal')
  const [threadMessages, setThreadMessages] = useState<Record<string, string[]>>(
    Object.fromEntries(conversations.map(c => [c.id, c.messages]))
  )
  const [draft, setDraft] = useState('')

  const activeConv = conversations.find(c => c.id === activeConvId)!

  function send() {
    if (draft.trim()) {
      setThreadMessages(current => ({
        ...current,
        [activeConvId]: [...current[activeConvId], draft.trim()],
      }))
      setDraft('')
    }
  }

  return (
    <RoleLayout title="Messages" description="Keep repair conversations, quotes, and job details together in one place.">
      <section className="grid min-h-[520px] overflow-hidden rounded-xl border border-[#dfe5e0] bg-white md:grid-cols-[250px_1fr]">
        <aside className="border-b border-[#e6ebe7] p-4 md:border-b-0 md:border-r">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={`w-full rounded-lg p-3 text-left text-sm ${
                conv.id === activeConvId
                  ? 'bg-[#edf5ef] font-semibold text-[#20583d]'
                  : 'text-[#717971] hover:bg-[#f7f9f7]'
              } ${conv.id !== conversations[0].id ? 'mt-3' : ''}`}
            >
              {conv.name}
            </button>
          ))}
        </aside>
        <div className="flex min-h-[440px] flex-col p-5">
          <div className="border-b border-[#e6ebe7] pb-4">
            <p className="font-semibold">{activeConv.name}</p>
            <p className="text-xs text-[#717971]">{activeConv.topic}</p>
          </div>
          <div className="flex flex-1 flex-col gap-3 py-5">
            {threadMessages[activeConvId].map((message, index) => (
              <p
                key={`${activeConvId}-${index}`}
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  index % 2 === 0
                    ? 'self-start bg-[#f1f4f1] text-[#344039]'
                    : 'self-end bg-[#176b4d] text-white'
                }`}
              >
                {message}
              </p>
            ))}
          </div>
          <div className="flex gap-2 border-t border-[#e6ebe7] pt-4">
            <input
              value={draft}
              onChange={event => setDraft(event.target.value)}
              onKeyDown={event => event.key === 'Enter' && send()}
              className="w-full rounded-lg border border-[#d6ded8] px-3 py-3 text-sm outline-none focus:border-[#176b4d] focus:ring-2 focus:ring-[#dceee2]"
              placeholder="Write a message"
            />
            <button
              onClick={send}
              className="grid size-11 shrink-0 place-items-center rounded-lg bg-[#157a5a] text-white hover:bg-[#0f5d42]"
              aria-label="Send"
            >
              <RiSendPlaneFill className="size-4" />
            </button>
          </div>
        </div>
      </section>
    </RoleLayout>
  )
}
