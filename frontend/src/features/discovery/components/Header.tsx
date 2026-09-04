import { useState } from "react";
import { RiMenuLine } from "@remixicon/react";
import { Link, NavLink } from "react-router";
import { useAuth, roleDashboardPaths, roleLabels } from "@/features/auth/AuthContext";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { session } = useAuth();

  const initials = session
    ? session.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('')
    : null;

  return (
    <header className="sticky top-0 z-30 border-b border-[#ebebeb] bg-white">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 lg:px-10">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          aria-label="Repair Link home"
        >
          <img
            src="/logo.svg"
            alt="Repair-Link logo"
            className="size-9 rounded-xl object-cover shadow-sm"
          />
          <span className="text-[21px] font-bold tracking-[-.05em] text-[#157a5a]">
            repairlink
          </span>
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
          {session ? (
            <Link
              to={roleDashboardPaths[session.role]}
              className="flex items-center gap-2 rounded-full border border-[#ddd] py-1.5 pl-3 pr-1.5 shadow-sm hover:shadow-md"
            >
              <RiMenuLine className="size-4" />
              <span className="flex items-center gap-1.5">
                <span
                  className="grid size-7 place-items-center rounded-full bg-[#717171] text-[10px] font-bold text-white"
                  title={roleLabels[session.role]}
                >
                  {initials}
                </span>
                <span className="pr-1 text-[10px] font-semibold text-[#6a6a6a]">
                  {roleLabels[session.role]}
                </span>
              </span>
            </Link>
          ) : (
            <>
              <button className="rounded-full px-3 py-2 text-sm font-medium hover:bg-[#f7f7f7]">
                Help
              </button>
              <Link
                to="/auth"
                className="rounded-full border border-[#ddd] px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md"
              >
                Sign in
              </Link>
            </>
          )}
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
            {session ? (
              <Link to={roleDashboardPaths[session.role]}>My workspace</Link>
            ) : (
              <Link to="/auth">Sign in</Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
