import { useState, useEffect, useRef } from "react";

const TIME_PERIODS = [
  { label: "All Time", value: "all" },
  { label: "Current Period", value: "current" },
  { label: "May 2026", value: "2026-05" },
  { label: "Apr 2026", value: "2026-04" },
  { label: "Mar 2026", value: "2026-03" },
  { label: "2025", value: "2025" },
  { label: "2024", value: "2024" },
  { label: "2023", value: "2023" },
]

const TABS = [
  { key: "profit", label: "Profit" },
  { key: "market", label: "Market" },
  { key: "operations", label: "Operations" },
  { key: "financialHealth", label: "Financial Health" },
] as const

type Tab = typeof TABS[number]["key"]

export default function AIAnalysis() {
  const [activeTab, setActiveTab] = useState<Tab>("profit")
  const [timePeriod, setTimePeriod] = useState("all")
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false)
  const periodDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(e.target as Node)) {
        setPeriodDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const selectedPeriod = TIME_PERIODS.find(p => p.value === timePeriod) ?? TIME_PERIODS[0]

  const Card = ({ label }: { label: string }) => (
    <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 min-h-[140px]">
      <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">{label}</p>
    </div>
  )

  return (
    <div className="bg-white h-full w-full p-8 overflow-y-auto">

      {/* Header */}
      <div className="flex justify-between items-start mb-6 gap-4">
        <div className="flex flex-col gap-[4px]">
          <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">
            Metrics 
          </h1>
          <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-[#475467]">
            View different categories of metrics related to Omatek's financial health.
          </p>
        </div>

        {/* Time period selector */}
        <div className="relative shrink-0" ref={periodDropdownRef}>
          <button
            onClick={() => setPeriodDropdownOpen(o => !o)}
            className="bg-white border-[#d0d5dd] border-[0.8px] border-solid h-[43px] rounded-[10px] px-6 flex items-center gap-2 hover:bg-gray-50 transition-colors min-w-[160px]"
          >
            <svg className="size-[18px] shrink-0 text-[#667085]" fill="none" viewBox="0 0 20 20">
              <path d="M6.667 1.667v2.5M13.333 1.667v2.5M2.5 7.5h15M4.167 3.333h11.666A1.667 1.667 0 0 1 17.5 5v11.667a1.667 1.667 0 0 1-1.667 1.666H4.167A1.667 1.667 0 0 1 2.5 16.667V5a1.667 1.667 0 0 1 1.667-1.667z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="flex-1 text-left font-['Figtree:Regular',sans-serif] font-normal text-[14px] text-[#344054] whitespace-nowrap">
              {selectedPeriod.label}
            </span>
            <svg className={`size-[18px] shrink-0 transition-transform text-[#667085] ${periodDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 20 20">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {periodDropdownOpen && (
            <div className="absolute top-[48px] right-0 z-50 bg-white border border-[#d0d5dd] rounded-[12px] shadow-xl min-w-[180px] overflow-hidden py-1">
              {TIME_PERIODS.map((p, i) => {
                const isYearDivider = i > 0 && p.value.length === 4 && TIME_PERIODS[i - 1].value.length !== 4
                return (
                  <div key={p.value}>
                    {isYearDivider && <div className="border-t border-[#eaecf0] my-1" />}
                    <button
                      onClick={() => { setTimePeriod(p.value); setPeriodDropdownOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 transition-colors ${
                        timePeriod === p.value ? "text-[#144430] font-medium bg-[#f0f9f4]" : "text-[#344054]"
                      }`}
                    >
                      {p.label}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main tab navigation */}
      <div className="border-b border-[#e8eef7] mb-6">
        <div className="flex gap-4">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`font-['Figtree:Medium',sans-serif] font-medium text-[14px] text-black pb-3 px-2 transition-colors ${
                activeTab === tab.key ? "border-b-[2.4px] border-black" : "text-[#667085]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="w-full">

        {activeTab === "profit" && (
          <div className="grid grid-cols-2 gap-5">
            <Card label="Revenue" />
            <Card label="Administrative Expenses" />
            <Card label="Taxes Owed" />
            <Card label="Revenue Trend" />
            <Card label="Expense Trend" />
          </div>
        )}

        {activeTab === "market" && (
          <div className="grid grid-cols-2 gap-5">
            <Card label="Market Cap" />
            <Card label="Share Price" />
          </div>
        )}

        {activeTab === "operations" && (
          <div className="grid grid-cols-2 gap-5">
            <Card label="Number of Employees" />
            <Card label="Salaries & Staff Costs" />
          </div>
        )}

        {activeTab === "financialHealth" && (
          <div className="grid grid-cols-2 gap-5">
            <Card label="Total Debt" />
            <Card label="Long-term Debt Paid Off" />
          </div>
        )}

      </div>
    </div>
  )
}
