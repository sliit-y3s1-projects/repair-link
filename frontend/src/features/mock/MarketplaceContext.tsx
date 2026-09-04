/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { acceptRepairQuote, archivePartListing, createPartListing, createRepairQuote, createRepairRequest, listParts, listRepairRequests, placePartOrder, updatePartListing, updatePartOrderStatus, updateRepairStatus as updateRepairStatusApi } from '@/lib/api'

export type RepairStatus = 'requested' | 'quoted' | 'booked' | 'in_progress' | 'waiting_for_parts' | 'completed' | 'cancelled' | 'disputed'
export type QuoteState = 'sent' | 'accepted' | 'rejected'

export type RepairRequest = {
  id: string
  title: string
  device: string
  issue: string
  location: string
  preferredTime: string
  method: string
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

export type Listing = {
  id: string
  name: string
  sku: string
  stock: number
  price: number
  condition: 'New' | 'Compatible' | 'Refurbished' | 'Used'
  active: boolean
}

const initialListings: Listing[] = [
  { id: 'listing-oled', name: 'iPhone 13 OLED display', sku: 'IP13-OLED-BLK', stock: 12, price: 8500, condition: 'Compatible', active: true },
  { id: 'listing-battery', name: 'MacBook Air M1 battery', sku: 'MBA-M1-BAT', stock: 4, price: 11900, condition: 'New', active: true },
  { id: 'listing-samsung-port', name: 'Samsung A54 USB-C charging port', sku: 'SA54-USBC', stock: 8, price: 2800, condition: 'New', active: true },
  { id: 'listing-dell-kbd', name: 'Dell Inspiron keyboard assembly', sku: 'DELL-KBD-INS', stock: 4, price: 6200, condition: 'Refurbished', active: true },
]

type MarketplaceContextValue = {
  requests: RepairRequest[]
  quotes: Quote[]
  orders: PartOrder[]
  notifications: Notification[]
  completedRepairs: number
  totalImpactPoints: number
  createRequest: (input: Omit<RepairRequest, 'id' | 'status' | 'createdAt'>) => Promise<string>
  deleteRequest: (id: string) => void
  cancelRequest: (id: string) => void
  acceptQuote: (quoteId: string) => void
  updateRepairStatus: (id: string, status: RepairStatus) => void
  createQuote: (requestId: string, amount: number) => void
  updateOrderStatus: (id: string, status: PartOrder['status']) => void
  createOrder: (part: string, total: number) => void
  markNotificationRead: (id: string) => void
  listings: Listing[]
  addListing: (listing: Omit<Listing, 'id'>) => void
  updateListingStock: (id: string, delta: number) => void
  toggleListingActive: (id: string) => void
  removeListing: (id: string) => void
  placeOrder: (listingId: string, quantity: number) => Promise<boolean>
}

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null)

const initialRequests: RepairRequest[] = [
  { id: 'repair-iphone', title: 'iPhone 13 cracked screen', device: 'Phone · iPhone 13', issue: 'Display flickers and has a crack in the top-right corner.', location: 'Colombo 03', preferredTime: 'Tomorrow morning', method: 'Shop visit', budget: 8000, status: 'booked', technician: 'Kamal\u2019s Device Care', scheduledFor: 'Tomorrow, 10:00 AM', createdAt: 'Today' },
  { id: 'repair-macbook', title: 'MacBook Air battery replacement', device: 'Laptop · MacBook Air', issue: 'Battery health is below 70% and the laptop shuts down unexpectedly.', location: 'Colombo 05', preferredTime: 'This weekend', method: 'Pickup', budget: 14000, status: 'quoted', createdAt: 'Yesterday' },
]

const initialQuotes: Quote[] = [
  { id: 'quote-kamal', requestId: 'repair-macbook', technician: 'Kamal\u2019s Device Care', rating: 4.91, amount: 12500, duration: '2\u20133 hours', message: 'Compatible battery with a 90-day service warranty. Same-day fitting available.', state: 'sent' },
  { id: 'quote-fixright', requestId: 'repair-macbook', technician: 'FixRight Electronics', rating: 4.86, amount: 10900, duration: '1 business day', message: 'Includes battery diagnostics and disposal of the old battery.', state: 'sent' },
]

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [requests, setRequests] = useState(initialRequests)
  const [quotes, setQuotes] = useState(initialQuotes)
  const [orders, setOrders] = useState<PartOrder[]>([{ id: 'order-1008', part: 'iPhone 13 OLED display', buyer: 'Kamal\u2019s Device Care', quantity: 1, total: 8500, status: 'new' }])
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 'note-quote', title: 'Two new quotes', body: 'Compare quotes for your MacBook battery request.', read: false, href: '/consumer/repairs/repair-macbook' },
    { id: 'note-booking', title: 'Booking confirmed', body: 'Your screen repair is tomorrow at 10:00 AM.', read: false, href: '/consumer/repairs/repair-iphone' },
  ])

  useEffect(() => {
    let active = true
    listParts().then(({ parts }) => {
      if (!active) return
      setListings(parts.map((part) => ({ id: part.id, name: part.name, sku: part.sku, stock: part.quantity, price: part.price, condition: part.condition[0].toUpperCase() + part.condition.slice(1) as Listing['condition'], active: part.isActive })))
    }).catch(() => { /* The prototype seed remains available while the API is offline. */ })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    listRepairRequests().then((rows) => {
      if (!active) return
      setRequests(rows.map((row) => ({ id: row.id, title: `${row.deviceModel ?? row.deviceBrand ?? 'Device'} repair request`, device: `${row.deviceBrand ?? 'Device'} · ${row.deviceModel ?? ''}`, issue: row.issueDescription, location: row.locationText, preferredTime: 'Scheduled with technician', method: row.preferredMethod, budget: Number(row.budgetAmount ?? 0), status: row.status, createdAt: 'From API' })))
    }).catch(() => { /* Prototype data remains available while the API is unavailable. */ })
    return () => { active = false }
  }, [])

  const value = useMemo<MarketplaceContextValue>(() => ({
    requests,
    quotes,
    orders,
    notifications,
    completedRepairs: requests.filter(r => r.status === 'completed').length,
    totalImpactPoints: requests.filter(r => r.status === 'completed').length * 120,
    createRequest: async (input) => {
      const id = `repair-${Date.now()}`
      const categoryId = input.device.toLowerCase().includes('laptop') ? '00000000-0000-4000-8000-000000000011' : '00000000-0000-4000-8000-000000000010'
      try {
        const created = await createRepairRequest({ categoryId, issueDescription: input.issue, preferredMethod: input.method.toLowerCase().includes('pickup') ? 'pickup_dropoff' : input.method.toLowerCase().includes('on-site') ? 'on_site' : 'shop_visit', locationText: input.location, budgetAmount: input.budget || undefined })
        return created.id
      } catch { /* Keep the prototype fallback when the API is unavailable. */ }
      setRequests((current) => [{ ...input, id, status: 'requested', createdAt: 'Just now' }, ...current])
      setNotifications((current) => [{ id: `note-${id}`, title: 'Request submitted', body: 'Matching repairers can now send you quotes.', read: false, href: `/consumer/repairs/${id}` }, ...current])
      return id
    },
    deleteRequest: (id) => setRequests((current) => current.filter(r => r.id !== id)),
    cancelRequest: (id) => setRequests((current) => current.map(r => r.id === id ? { ...r, status: 'cancelled' } : r)),
    acceptQuote: async (quoteId) => {
      const selected = quotes.find((quote) => quote.id === quoteId)
      if (!selected) return
      try { await acceptRepairQuote(selected.requestId, quoteId) } catch { return }
      setQuotes((current) => current.map((quote) => quote.requestId === selected.requestId ? { ...quote, state: quote.id === quoteId ? 'accepted' : 'rejected' } : quote))
      setRequests((current) => current.map((request) => request.id === selected.requestId ? { ...request, status: 'booked', technician: selected.technician, scheduledFor: 'Saturday, 11:00 AM' } : request))
      setNotifications((current) => [{ id: `note-booking-${selected.requestId}`, title: 'Booking confirmed', body: `Your booking with ${selected.technician} is confirmed.`, read: false, href: `/consumer/repairs/${selected.requestId}` }, ...current])
    },
    updateRepairStatus: async (id, status) => {
      try { await updateRepairStatusApi(id, status) } catch { return }
      setRequests((current) => current.map((request) => request.id === id ? { ...request, status } : request))
    },
    createQuote: async (requestId, amount) => {
      try { await createRepairQuote(requestId, amount) } catch { return }
      const id = `quote-${Date.now()}`
      setQuotes((current) => [{ id, requestId, technician: 'Kamal\u2019s Device Care', rating: 4.91, amount, duration: '2\u20133 hours', message: 'Quote sent from the technician workspace.', state: 'sent' }, ...current])
      setRequests((current) => current.map((request) => request.id === requestId ? { ...request, status: 'quoted' } : request))
    },
    updateOrderStatus: async (id, status) => {
      const apiStatus = status === 'new' ? 'confirmed' : status === 'packed' ? 'packed' : status === 'delivered' ? 'completed' : status
      try { await updatePartOrderStatus(id, apiStatus) } catch { return }
      setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order))
    },
    createOrder: (part, total) => {
      const id = `order-${Date.now()}`
      setOrders((current) => [{ id, part, buyer: 'Chamal Senarathna', quantity: 1, total, status: 'new' }, ...current])
      setNotifications((current) => [{ id: `note-${id}`, title: 'Parts order placed', body: `${part} has been added to your order history.`, read: false, href: '/consumer/dashboard' }, ...current])
    },
    markNotificationRead: (id) => setNotifications((current) => current.map((notification) => notification.id === id ? { ...notification, read: true } : notification)),
    listings,
    addListing: async (listing) => { try { const created = await createPartListing({ name: listing.name, sku: listing.sku, price: listing.price, quantity: listing.stock, condition: listing.condition }); setListings(current => [...current, { ...listing, id: created.id }]) } catch { return } },
    updateListingStock: async (id, delta) => { const item = listings.find(l => l.id === id); if (!item) return; try { await updatePartListing(id, { quantity: Math.max(0, item.stock + delta) }); setListings(current => current.map(l => l.id === id ? { ...l, stock: Math.max(0, l.stock + delta) } : l)) } catch { return } },
    toggleListingActive: async (id) => { const item = listings.find(l => l.id === id); if (!item) return; try { await updatePartListing(id, { isActive: !item.active }); setListings(current => current.map(l => l.id === id ? { ...l, active: !l.active } : l)) } catch { return } },
    removeListing: async (id) => { try { await archivePartListing(id); setListings(current => current.filter(l => l.id !== id)) } catch { return } },
    placeOrder: async (listingId, quantity) => {
      const listing = listings.find(l => l.id === listingId)
      if (!listing || listing.stock < quantity) return false
      try {
        await placePartOrder(listingId, quantity)
        setListings(current => current.map(l => l.id === listingId ? { ...l, stock: Math.max(0, l.stock - quantity) } : l))
        return true
      } catch { return false }
    },
  }), [listings, notifications, orders, quotes, requests])

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
