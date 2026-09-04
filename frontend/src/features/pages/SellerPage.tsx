import { useState } from 'react'
import { RiAddLine, RiCheckboxCircleLine, RiCloseLine, RiEditLine } from '@remixicon/react'
import { RoleLayout } from '@/features/dashboard/RoleLayout'

type Listing = { id: string; name: string; sku: string; stock: number; price: number; active: boolean }

export function SellerPage() {
  const [listings, setListings] = useState<Listing[]>([
    { id: 'listing-oled', name: 'iPhone 13 OLED display', sku: 'IP13-OLED-BLK', stock: 12, price: 8500, active: true },
    { id: 'listing-battery', name: 'MacBook Air M1 battery', sku: 'MBA-M1-BAT', stock: 4, price: 11900, active: true },
  ])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  function addListing() {
    if (!name.trim() || !price.trim()) return
    setListings((current) => [...current, { id: `listing-${Date.now()}`, name: name.trim(), sku: `NEW-${current.length + 1}`, stock: 1, price: Number(price), active: true }])
    setName('')
    setPrice('')
    setShowForm(false)
  }

  function updateStock(id: string, amount: number) {
    setListings((current) => current.map((listing) => listing.id === id ? { ...listing, stock: Math.max(0, listing.stock + amount) } : listing))
  }

  return <RoleLayout title="Your parts inventory" description="Manage listings, stock levels, orders, and buyer enquiries."><section className="overflow-hidden rounded-xl border border-[#dce5de] bg-white"><div className="flex flex-col gap-4 border-b border-[#eaf0eb] bg-[#f5faf6] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#5c806a]">Seller storefront</p><h2 className="mt-1 font-semibold text-[#233127]">Active listings</h2></div><button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-1 rounded-lg bg-[#157a5a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f513d]"><RiAddLine className="size-4" /> Add listing</button></div>{showForm && <form onSubmit={(event) => { event.preventDefault(); addListing() }} className="grid gap-3 border-b border-[#e6ece7] bg-white px-5 py-5 md:grid-cols-[1fr_.5fr_auto]"><label className="text-sm font-semibold">Part name<input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-lg border border-[#d4ddd6] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#157a5a]" placeholder="e.g. Samsung A54 display" autoFocus /></label><label className="text-sm font-semibold">Price<input value={price} onChange={(event) => setPrice(event.target.value)} className="mt-2 w-full rounded-lg border border-[#d4ddd6] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#157a5a]" placeholder="Rs." inputMode="numeric" /></label><div className="flex items-end gap-2"><button className="rounded-lg bg-[#157a5a] px-4 py-2.5 text-sm font-semibold text-white">Save listing</button><button type="button" onClick={() => setShowForm(false)} className="grid size-10 place-items-center rounded-lg border border-[#d4ddd6]" aria-label="Close listing form"><RiCloseLine className="size-5" /></button></div></form>}<div className="overflow-x-auto"><div className="min-w-[720px]"><div className="grid grid-cols-[1.5fr_.7fr_.7fr_.6fr] gap-3 border-b border-[#e6ece7] bg-[#fafcfb] px-5 py-3 text-xs font-bold uppercase tracking-wide text-[#758178]"><span>Part</span><span>Stock</span><span>Status</span><span>Price</span></div>{listings.map((listing) => <div key={listing.id} className="grid grid-cols-[1.5fr_.7fr_.7fr_.6fr] items-center gap-3 border-b border-[#edf0ed] px-5 py-5 last:border-0"><div><p className="font-semibold text-[#29382f]">{listing.name}</p><p className="mt-1 text-xs text-[#77837a]">{listing.sku}</p></div><div className="flex items-center gap-2"><button onClick={() => updateStock(listing.id, -1)} className="grid size-8 place-items-center rounded-md border border-[#d4ddd6]">−</button><span className="w-6 text-center font-semibold">{listing.stock}</span><button onClick={() => updateStock(listing.id, 1)} className="grid size-8 place-items-center rounded-md border border-[#d4ddd6]">+</button></div><button onClick={() => setListings((current) => current.map((item) => item.id === listing.id ? { ...item, active: !item.active } : item))} className={`flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${listing.active ? 'bg-[#edf7ef] text-[#38744f]' : 'bg-[#f1f2f1] text-[#667168]'}`}>{listing.active ? <RiCheckboxCircleLine className="size-4" /> : <RiEditLine className="size-4" />}{listing.active ? 'Live' : 'Archived'}</button><p className="font-semibold">Rs. {listing.price.toLocaleString()}</p></div>)}</div></div></section></RoleLayout>
}
