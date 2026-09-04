import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-[#ebebeb] bg-[#f7f7f7]">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[.14em] text-[#717171]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-.035em]">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
