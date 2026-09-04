import { RiMapPin2Fill } from "@remixicon/react";

const pins = [
  [28, 30, "Rs. 4,500"],
  [61, 24, "Rs. 3,000"],
  [43, 53, "Rs. 5,000"],
  [75, 69, "Rs. 3,800"],
  [17, 75, "Rs. 6,200"],
];

export function MapPanel() {
  return (
    <aside
      className="relative hidden min-h-[780px] border-l border-[#ebebeb] bg-[#e7e8dd] lg:block"
      aria-label="Repairers map"
    >
      <div className="absolute inset-0 bg-[linear-gradient(25deg,transparent_48%,rgba(255,255,255,.7)_49%,transparent_50%),linear-gradient(-45deg,transparent_47%,rgba(255,255,255,.6)_48%,transparent_49%),radial-gradient(circle_at_20%_70%,#d1dfc4_0_16%,transparent_16.2%),radial-gradient(circle_at_85%_24%,#d3e2d4_0_18%,transparent_18.2%)]" />
      <p className="absolute left-[11%] top-[18%] text-xs font-semibold tracking-[.14em] text-[#899080]">
        COLOMBO
      </p>
      <p className="absolute right-[16%] top-[62%] text-xs font-semibold tracking-[.12em] text-[#899080]">
        DEHIWALA
      </p>
      {pins.map(([top, left, price]) => (
        <button
          key={`${top}-${left}`}
          style={{ top: `${top}%`, left: `${left}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ddd] bg-white px-3 py-2 text-xs font-bold shadow-md hover:scale-105 hover:border-[#222]"
        >
          {price}
        </button>
      ))}
      <button className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#222] px-5 py-3 text-sm font-semibold text-white shadow-lg">
        <RiMapPin2Fill className="size-4" /> Search this area
      </button>
      <div className="absolute right-6 top-6 grid overflow-hidden rounded-lg border border-[#ddd] bg-white shadow-sm">
        <button className="grid size-10 place-items-center border-b border-[#ddd] text-xl">
          +
        </button>
        <button className="grid size-10 place-items-center text-xl">−</button>
      </div>
    </aside>
  );
}
