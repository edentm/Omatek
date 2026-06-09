import type { ReactNode } from "react";

export function Tooltip({ label, children, position = "bottom" }: { label: string; children: ReactNode; position?: "top" | "bottom" }) {
  return (
    <div className="relative group/tooltip">
      {children}
      <div
        className={`absolute left-1/2 -translate-x-1/2 z-[9999] pointer-events-none
          bg-[#1d2939] text-white text-[11px] font-medium rounded-[6px] px-2 py-1 whitespace-nowrap
          opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150
          ${position === "top" ? "bottom-full mb-2" : "top-full mt-2"}`}
      >
        {label}
        <div className={`absolute left-1/2 -translate-x-1/2 w-0 h-0
          border-l-[4px] border-r-[4px] border-l-transparent border-r-transparent
          ${position === "top"
            ? "top-full border-t-[4px] border-t-[#1d2939]"
            : "bottom-full border-b-[4px] border-b-[#1d2939]"}`}
        />
      </div>
    </div>
  );
}
