import { useState } from "react";
import { RiMenuLine } from "@remixicon/react";
import { Link, NavLink } from "react-router";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-[#ebebeb] bg-white">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 lg:px-10">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          aria-label="Repair Link home"
        >
<<<<<<< Updated upstream
          <img
            src="/favicon.svg"
            alt="Repair-Link logo"
            className="size-9 rounded-xl object-cover shadow-sm"
          />
=======
          <span className="grid size-9 place-items-center rounded-xl bg-[#157a5a] text-white">
            <RiToolsLine className="size-5" />
          </span>
          <span className="text-[21px] font-bold tracking-[-.05em] text-[#157a5a]">
            repairlink
          </span>
>>>>>>> Stashed changes
        </Link>
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 text-sm font-medium md:flex">
          <NavLink
            className={({ isActive }) =>
              `py-7 ${isActive ? "border-b-2 border-[#222]" : "text-[#6a6a6a] hover:text-[#222]"}`
            }
            to="/"
          >
            Find a repairer
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `py-7 ${isActive ? "border-b-2 border-[#222]" : "text-[#6a6a6a] hover:text-[#222]"}`
            }
            to="/parts"
          >
            Browse parts
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `py-7 ${isActive ? "border-b-2 border-[#222]" : "text-[#6a6a6a] hover:text-[#222]"}`
            }
            to="/technician"
          >
            Become a repairer
          </NavLink>
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <button className="rounded-full px-3 py-2 text-sm font-medium hover:bg-[#f7f7f7]">
            Help
          </button>
          <Link to="/dashboard" className="flex items-center gap-2 rounded-full border border-[#ddd] py-1.5 pl-3 pr-1.5 shadow-sm hover:shadow-md">
            <RiMenuLine className="size-4" />
            <span className="grid size-7 place-items-center rounded-full bg-[#717171] text-[10px] font-bold text-white">
              CS
            </span>
          </Link>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="grid size-10 place-items-center rounded-full border border-[#ddd] md:hidden"
          aria-label="Toggle menu"
        >
          <RiMenuLine className="size-5" />
        </button>
      </div>
      {menuOpen && (
        <nav className="border-t border-[#ebebeb] px-6 py-4 text-sm font-medium md:hidden">
          <div className="flex flex-col gap-4">
            <Link to="/">Find a repairer</Link>
            <Link to="/parts">Browse parts</Link>
            <Link to="/technician">Become a repairer</Link>
            <Link to="/dashboard">My repairs</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
