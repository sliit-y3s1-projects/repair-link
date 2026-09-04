import { RiHeart3Line, RiStarFill } from "@remixicon/react";
import type { Repairer } from "../types";

type RepairerCardProps = {
  repairer: Repairer;
  isSaved: boolean;
  onSave: () => void;
};

export function RepairerCard({ repairer, isSaved, onSave }: RepairerCardProps) {
  return (
    <article className="group cursor-pointer">
      <div className="relative aspect-[1.05] overflow-hidden rounded-xl bg-[#f2f1ed]">
        <div className={`absolute inset-0 ${repairer.color} opacity-85`} />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,.6),transparent_60%)]" />
        <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-xs font-bold">
          {repairer.tag}
        </span>
        <button
          onClick={onSave}
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white/90 text-[#222]"
          aria-label={`Save ${repairer.name}`}
        >
          <RiHeart3Line
            className={`size-5 ${isSaved ? "fill-[#ff385c] text-[#ff385c]" : ""}`}
          />
        </button>
        <div className="absolute bottom-4 left-4 grid size-14 place-items-center rounded-full border-2 border-white bg-[#3d3d3d] text-sm font-bold text-white shadow-md">
          {repairer.initials}
        </div>
      </div>
      <div className="pt-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[15px] font-semibold leading-5">
            {repairer.name}
          </h2>
          <span className="flex shrink-0 items-center gap-1 text-sm">
            <RiStarFill className="size-3.5" /> {repairer.rating}
          </span>
        </div>
        <p className="mt-1 text-sm text-[#717171]">{repairer.specialty}</p>
        <p className="mt-1 text-sm text-[#717171]">
          {repairer.distance} · {repairer.reviews} reviews
        </p>
        <p className="mt-2 text-sm">
          <span className="font-semibold">From {repairer.price}</span> per
          repair
        </p>
      </div>
    </article>
  );
}
