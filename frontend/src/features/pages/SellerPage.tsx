import { useState } from 'react'
import { RiAddLine, RiCheckboxCircleLine } from '@remixicon/react'
import { PageHeader } from './PageHeader'

export function SellerPage() {
  const [stock, setStock] = useState(12)
  return <><PageHeader eyebrow="Seller storefront" title="Your parts inventory"><p className="mt-3 text-sm text-[#717171]">Manage listings, stock levels, orders, and buyer enquiries.</p></PageHeader><section className="mx-auto max-w-6xl px-6 py-9 lg:px-10"><div className="flex justify-between"><h2 className="font-semibold">Active listings</h2><button className="flex items-center gap-1 rounded-lg bg-[#222] px-4 py-2 text-sm font-semibold text-white"><RiAddLine className="size-4" /> Add listing</button></div><div className="mt-5 overflow-hidden rounded-xl border border-[#ddd]"><div className="grid grid-cols-[1.5fr_.8fr_.7fr] gap-3 bg-[#f7f7f7] p-4 text-xs font-bold uppercase tracking-wide text-[#717171]"><span>Part</span><span>Stock</span><span>Status</span></div><div className="grid grid-cols-[1.5fr_.8fr_.7fr] items-center gap-3 p-4 text-sm"><span className="font-semibold">iPhone 13 OLED display</span><div className="flex items-center gap-2"><button onClick={() => setStock(Math.max(0, stock - 1))} className="size-7 rounded border">−</button><span>{stock}</span><button onClick={() => setStock(stock + 1)} className="size-7 rounded border">+</button></div><span className="flex items-center gap-1 text-[#008a05]"><RiCheckboxCircleLine className="size-4" /> Live</span></div></div></section></>
}
