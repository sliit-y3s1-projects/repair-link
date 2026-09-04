import {
  RiArrowDownSLine,
  RiFilter3Line,
  RiSearchLine,
} from "@remixicon/react";
import { filters } from "../data";

type SearchControlsProps = {
  activeFilter: string | null;
  onFilterChange: (filter: string) => void;
};

export function SearchControls({
  activeFilter,
  onFilterChange,
}: SearchControlsProps) {
  return (
    <section className="border-b border-[#ebebeb] bg-white">
      <div className="mx-auto max-w-[1440px] px-6 pb-5 pt-5 lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center rounded-full border border-[#ddd] p-1 shadow-sm lg:w-[680px]">
            <button className="min-w-0 flex-1 border-r border-[#ddd] px-5 py-2 text-left">
              <span className="block text-xs font-bold">
                What needs repairing?
              </span>
              <span className="mt-0.5 block truncate text-sm text-[#717171]">
                Phone, laptop, appliance...
              </span>
            </button>
            <button className="hidden flex-1 border-r border-[#ddd] px-5 py-2 text-left sm:block">
              <span className="block text-xs font-bold">Where</span>
              <span className="mt-0.5 block text-sm text-[#717171]">
                Colombo, Sri Lanka
              </span>
            </button>
            <button className="hidden px-5 py-2 text-left sm:block">
              <span className="block text-xs font-bold">When</span>
              <span className="mt-0.5 block text-sm text-[#717171]">
                Any time
              </span>
            </button>
            <button
              className="grid size-12 shrink-0 place-items-center rounded-full bg-[#ff385c] text-white"
              aria-label="Search"
            >
              <RiSearchLine className="size-5" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => onFilterChange(filter)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${activeFilter === filter ? "border-[#222] bg-[#222] text-white" : "border-[#ddd] bg-white hover:border-[#222]"}`}
              >
                {filter === "Filters" && <RiFilter3Line className="size-4" />}
                {filter}
                {filter === "Filters" && (
                  <RiArrowDownSLine className="size-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
