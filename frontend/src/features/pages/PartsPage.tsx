import { useState } from "react";
import { RiAddLine, RiShoppingBagLine } from "@remixicon/react";
import { PageHeader } from "./PageHeader";

const parts = [
  {
    name: "iPhone 13 OLED display",
    seller: "TechParts LK",
    price: "Rs. 18,500",
    stock: "In stock",
  },
  {
    name: "MacBook Air M1 battery",
    seller: "Volt Store",
    price: "Rs. 14,200",
    stock: "Only 2 left",
  },
  {
    name: "Samsung A54 charging port",
    seller: "Genuine Fix",
    price: "Rs. 2,800",
    stock: "In stock",
  },
];

export function PartsPage() {
  const [cart, setCart] = useState<string[]>([]);
  return (
    <>
      <PageHeader
        eyebrow="Spare parts marketplace"
        title="Find the part. Finish the repair."
      >
        <p className="mt-3 text-sm text-[#717171]">
          New, compatible, and refurbished parts from trusted local sellers.
        </p>
      </PageHeader>
      <section className="mx-auto max-w-6xl px-6 py-9 lg:px-10">
        <div className="flex gap-3">
          <input
            className="w-full rounded-lg border border-[#ddd] px-4 py-3 text-sm"
            placeholder="Search by device, part name, or SKU"
          />
          <button className="rounded-lg bg-[#222] px-5 text-sm font-semibold text-white">
            Search
          </button>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {parts.map((part) => (
            <article
              key={part.name}
              className="rounded-xl border border-[#ddd] p-5"
            >
              <div className="grid aspect-video place-items-center rounded-lg bg-[#f3f2ee] text-sm font-semibold text-[#717171]">
                Product image
              </div>
              <p className="mt-4 text-sm font-semibold">{part.name}</p>
              <p className="mt-1 text-sm text-[#717171]">
                Sold by {part.seller}
              </p>
              <p className="mt-3 text-sm font-semibold">{part.price}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-[#008a05]">{part.stock}</span>
                <button
                  onClick={() => setCart((items) => [...items, part.name])}
                  className="flex items-center gap-1 rounded-lg border border-[#222] px-3 py-2 text-xs font-semibold"
                >
                  <RiAddLine className="size-4" /> Add
                </button>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-7 flex items-center gap-2 text-sm font-semibold">
          <RiShoppingBagLine className="size-5" /> {cart.length} item
          {cart.length === 1 ? "" : "s"} in your mock cart
        </p>
      </section>
    </>
  );
}
