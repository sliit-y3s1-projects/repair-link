import { RiAddLine, RiShoppingBagLine } from '@remixicon/react'
import { RoleLayout } from './RoleLayout'
import { useMarketplace } from '@/features/mock/MarketplaceContext'

export function SellerWorkspace() {
  const { listings, orders, updateListingStock } = useMarketplace()
  const liveListings = listings.filter(l => l.active)
  const lowStock = listings.filter(l => l.stock <= 2 && l.active)
  const newOrders = orders.filter(o => o.status === 'new')

  const stats: [string, string, string][] = [
    [String(liveListings.length), 'Live listings', lowStock.length > 0 ? `${lowStock.length} low on stock` : 'All stock levels good'],
    [String(newOrders.length), 'New orders', newOrders.length > 0 ? `${newOrders.length} need fulfilment` : 'All orders processed'],
    ['96%', 'Response rate', 'Above marketplace average'],
  ]

  const firstListing = listings[0]

  return <RoleLayout title="Your seller workspace" description="Manage your listings, keep stock accurate, and respond to the repair community quickly."><div className="grid gap-4 md:grid-cols-3">{stats.map(([value, label, detail]) => <article key={label} className="rounded-xl border border-[#e0e6e1] bg-white p-5"><p className="text-2xl font-semibold tracking-[-.03em] text-[#1e2c23]">{value}</p><p className="mt-1 text-sm font-semibold text-[#38473d]">{label}</p><p className="mt-3 text-xs text-[#768278]">{detail}</p></article>)}</div><article className="mt-7 overflow-hidden rounded-xl border border-[#dce5de] bg-white"><div className="flex items-center justify-between border-b border-[#eaf0eb] bg-[#f5faf6] px-5 py-4"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#5c806a]">Inventory snapshot</p><h2 className="mt-1 font-semibold text-[#233127]">Stock that needs attention</h2></div><button className="flex items-center gap-1 rounded-lg bg-[#157a5a] px-3 py-2 text-xs font-semibold text-white"><RiAddLine className="size-4" /> Add listing</button></div><div className="p-5">{firstListing == null ? <p className="text-sm text-[#748077]">No listings yet. Add your first listing from the Storefront page.</p> : <div className="flex flex-col gap-4 rounded-lg border border-[#e1e7e2] p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{firstListing.name}</p><p className="mt-1 text-xs text-[#748077]">SKU {firstListing.sku} · Last updated today</p></div><span className="flex items-center gap-2"><button onClick={() => updateListingStock(firstListing.id, -1)} className="grid size-8 place-items-center rounded-md border border-[#d5ddd6]">−</button><strong className="w-7 text-center">{firstListing.stock}</strong><button onClick={() => updateListingStock(firstListing.id, 1)} className="grid size-8 place-items-center rounded-md border border-[#d5ddd6]">+</button></span>{firstListing.stock === 0 ? <span className="flex items-center gap-1 rounded-full bg-[#fef2f2] px-3 py-1.5 text-xs font-semibold text-red-600"><RiShoppingBagLine className="size-4" /> Out of stock</span> : <span className="flex items-center gap-1 rounded-full bg-[#edf7ef] px-3 py-1.5 text-xs font-semibold text-[#38744f]"><RiShoppingBagLine className="size-4" /> In stock</span>}</div>}</div></article></RoleLayout>
}
