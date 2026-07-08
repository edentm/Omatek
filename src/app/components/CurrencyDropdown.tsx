import { useRef, useState, useEffect } from "react"
import { useCurrency, CURRENCIES } from "../../contexts/CurrencyContext"

export function CurrencyDropdown() {
  const { currency, setCurrency, currencyInfo } = useCurrency()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="bg-white border-[#d0d5dd] border-[0.8px] border-solid h-[43px] rounded-[10px] px-4 flex items-center gap-2 hover:bg-gray-50 transition-colors min-w-[120px]"
      >
        <span className="text-[17px] leading-none">{currencyInfo.flag}</span>
        <span className="flex-1 text-left font-['Figtree:Regular',sans-serif] font-normal text-[14px] text-[#344054] whitespace-nowrap">
          {currencyInfo.code}
        </span>
        <svg className={`size-[18px] shrink-0 transition-transform text-[#667085] ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 20 20">
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute top-[48px] right-0 z-50 bg-white border border-[#d0d5dd] rounded-[12px] shadow-xl min-w-[230px] overflow-hidden py-1">
          {CURRENCIES.map(c => (
            <button
              key={c.code}
              onClick={() => { setCurrency(c.code); setOpen(false) }}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                currency === c.code ? "bg-[#f0f9f4]" : ""
              }`}
            >
              <span className="text-[17px] leading-none shrink-0">{c.flag}</span>
              <span className={`text-[13px] ${currency === c.code ? "text-[#144430] font-medium" : "text-[#344054]"}`}>
                {c.code} · {c.fullName}
              </span>
              {currency === c.code && (
                <svg className="ml-auto size-3.5 text-[#144430] shrink-0" fill="none" viewBox="0 0 14 14">
                  <path d="M11.6667 3.5L5.25 9.91667L2.33333 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
