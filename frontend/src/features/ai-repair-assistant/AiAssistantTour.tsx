import { useEffect, useState } from 'react'
import { RiCloseLine, RiRobot2Line } from '@remixicon/react'

const tourStorageKey = 'repairlink-ai-tour-completed-v1'

export function AiAssistantTour() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.localStorage.getItem(tourStorageKey)) return

    const timer = window.setTimeout(() => setVisible(true), 700)
    return () => window.clearTimeout(timer)
  }, [])

  function completeTour(openAssistant = false) {
    window.localStorage.setItem(tourStorageKey, 'true')
    setVisible(false)

    if (openAssistant) {
      window.dispatchEvent(new CustomEvent('repairlink:open-ai-chat'))
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[60] bg-[#12271d]/45" role="dialog" aria-modal="true" aria-labelledby="ai-tour-title">
      <button type="button" className="absolute inset-0 cursor-default" onClick={() => completeTour()} aria-label="Close tour" />

      <div className="absolute bottom-28 right-5 w-[min(330px,calc(100vw-2.5rem))] rounded-2xl border border-[#dfe7e1] bg-white p-5 shadow-2xl sm:bottom-32 sm:right-7">
        <span className="absolute -bottom-2 right-6 size-4 rotate-45 border-b border-r border-[#dfe7e1] bg-white" />
        <button type="button" onClick={() => completeTour()} className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-[#78827b] hover:bg-[#f1f4f2]" aria-label="Skip tour">
          <RiCloseLine className="size-4" />
        </button>

        <span className="grid size-11 place-items-center rounded-xl bg-[#e8f3ec] text-[#176b4d]">
          <RiRobot2Line className="size-6" />
        </span>
        <h2 id="ai-tour-title" className="mt-4 text-lg font-bold tracking-[-.03em] text-[#233128]">Need repair help?</h2>
        <p className="mt-2 text-sm leading-6 text-[#667168]">
          Ask the RepairLink assistant about a device problem and get guidance, safety advice, and matching repairers.
        </p>
        <button type="button" onClick={() => completeTour(true)} className="mt-4 w-full rounded-xl bg-[#176b4d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#12583f]">
          Try the AI assistant
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-[18px] right-[18px] size-[76px] animate-pulse rounded-full border-4 border-[#f5c451] shadow-[0_0_0_8px_rgba(245,196,81,0.3)] sm:bottom-[26px] sm:right-[26px]" />
    </div>
  )
}
