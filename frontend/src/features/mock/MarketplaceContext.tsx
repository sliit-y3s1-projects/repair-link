import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type RepairStatus = 'requested' | 'quoted' | 'booked' | 'in_progress' | 'waiting_for_parts' | 'completed' | 'cancelled' | 'disputed'
export type QuoteState = 'sent' | 'accepted' | 'rejected'

export type RepairRequest = {
  id: string
  title: string
  device: string
  issue: string
  location: string
  preferredTime: string
  budget: number
  status: RepairStatus
  technician?: string
  scheduledFor?: string
  createdAt: string
}

export type Quote = {
  id: string
  requestId: string
  technician: string
  rating: number
  amount: number
  duration: string
  message: string
  state: QuoteState
}

export type PartOrder = {
  id: string
  part: string
  buyer: string
  quantity: number
  total: number
  status: 'new' | 'packed' | 'shipped' | 'delivered'
}

export type Notification = { id: string; title: string; body: string; read: boolean; href: string }

type MarketplaceContextValue = {
  requests: RepairRequest[]
  quotes: Quote[]
  orders: PartOrder[]
  notifications: Notification[]
  createRequest: (input: Omit<RepairRequest, 'id' | 'status' | 'createdAt'>) => string
  acceptQuote: (quoteId: string) => void
  updateRepairStatus: (id: string, status: RepairStatus) => void
  createQuote: (requestId: string, amount: number) => void
  updateOrderStatus: (id: string, status: PartOrder['status']) => void
  createOrder: (part: string, total: number) => void
  markNotificationRead: (id: string) => void
}

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null)

const initialRequests: RepairRequest[] = [
  { id: 'repair-iphone', title: 'iPhone 13 cracked screen', device: 'Phone · iPhone 13', issue: 'Display flickers and has a crack in the top-right corner.', location: 'Colombo 03', preferredTime: 'Tomorrow morning', budget: 8000, status: 'booked', technician: 'Kamal’s Device Care', scheduledFor: 'Tomorrow, 10:00 AM', createdAt: 'Today' },
  { id: 'repair-macbook', title: 'MacBook Air battery replacement', device: 'Laptop · MacBook Air', issue: 'Battery health is below 70% and the laptop shuts down unexpectedly.', location: 'Colombo 05', preferredTime: 'This weekend', budget: 14000, status: 'quoted', createdAt: 'Yesterday' },
]

const initialQuotes: Quote[] = [
  { id: 'quote-kamal', requestId: 'repair-macbook', technician: 'Kamal’s Device Care', rating: 4.91, amount: 12500, duration: '2–3 hours', message: 'Compatible battery with a 90-day service warranty. Same-day fitting available.', state: 'sent' },
  { id: 'quote-fixright', requestId: 'repair-macbook', technician: 'FixRight Electronics', rating: 4.86, amount: 10900, duration: '1 business day', message: 'Includes battery diagnostics and disposal of the old battery.', state: 'sent' },
]

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState(initialRequests)
  const [quotes, setQuotes] = useState(initialQuotes)
  const [orders, setOrders] = useState<PartOrder[]>([{ id: 'order-1008', part: 'iPhone 13 OLED display', buyer: 'Kamal’s Device Care', quantity: 1, total: 8500, status: 'new' }])
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 'note-quote', title: 'Two new quotes', body: 'Compare quotes for your MacBook battery request.', read: false, href: '/consumer/repairs/repair-macbook' },
    { id: 'note-booking', title: 'Booking confirmed', body: 'Your screen repair is tomorrow at 10:00 AM.', read: false, href: '/consumer/repairs/repair-iphone' },
  ])

  const value = useMemo<MarketplaceContextValue>(() => ({
    requests,
    quotes,
    orders,
    notifications,
    createRequest: (input) => {
      const id = `repair-${Date.now()}`
      setRequests((current) => [{ ...input, id, status: 'requested', createdAt: 'Just now' }, ...current])
      setNotifications((current) => [{ id: `note-${id}`, title: 'Request submitted', body: 'Matching repairers can now send you quotes.', read: false, href: `/consumer/repairs/${id}` }, ...current])
      return id
    },
    acceptQuote: (quoteId) => {
      const selected = quotes.find((quote) => quote.id === quoteId)
      if (!selected) return
      setQuotes((current) => current.map((quote) => quote.requestId === selected.requestId ? { ...quote, state: quote.id === quoteId ? 'accepted' : 'rejected' } : quote))
      setRequests((current) => current.map((request) => request.id === selected.requestId ? { ...request, status: 'booked', technician: selected.technician, scheduledFor: 'Saturday, 11:00 AM' } : request))
      setNotifications((current) => [{ id: `note-booking-${selected.requestId}`, title: 'Booking confirmed', body: `Your booking with ${selected.technician} is confirmed.`, read: false, href: `/consumer/repairs/${selected.requestId}` }, ...current])
    },
    updateRepairStatus: (id, status) => setRequests((current) => current.map((request) => request.id === id ? { ...request, status } : request)),
    createQuote: (requestId, amount) => {
      const id = `quote-${Date.now()}`
      setQuotes((current) => [{ id, requestId, technician: 'Kamal’s Device Care', rating: 4.91, amount, duration: '2–3 hours', message: 'Quote sent from the technician workspace.', state: 'sent' }, ...current])
      setRequests((current) => current.map((request) => request.id === requestId ? { ...request, status: 'quoted' } : request))
    },
    updateOrderStatus: (id, status) => setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order)),
    createOrder: (part, total) => {
      const id = `order-${Date.now()}`
      setOrders((current) => [{ id, part, buyer: 'Chamal Senarathna', quantity: 1, total, status: 'new' }, ...current])
      setNotifications((current) => [{ id: `note-${id}`, title: 'Parts order placed', body: `${part} has been added to your order history.`, read: false, href: '/consumer/dashboard' }, ...current])
    },
    markNotificationRead: (id) => setNotifications((current) => current.map((notification) => notification.id === id ? { ...notification, read: true } : notification)),
  }), [notifications, orders, quotes, requests])

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext)
  if (!context) throw new Error('useMarketplace must be used within MarketplaceProvider')
  return context
}

export const repairStatusLabel: Record<RepairStatus, string> = {
  requested: 'Requested', quoted: 'Quotes ready', booked: 'Booked', in_progress: 'In progress', waiting_for_parts: 'Waiting for parts', completed: 'Completed', cancelled: 'Cancelled', disputed: 'Disputed',
}
