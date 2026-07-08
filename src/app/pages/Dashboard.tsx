import { useState, useEffect, useRef } from "react";
import { getDashboardMetrics, getStockData } from "../../api";
import { useCurrency } from "../../contexts/CurrencyContext";
import { CurrencyDropdown } from "../components/CurrencyDropdown";

type PlatformMetrics = {
  totalDocuments?: number
  totalReports?: number
  anomalyCount?: number
  totalAnomaliesDetected?: number
}


const TIME_PERIODS = [
  { label: "All Time", value: "current" },
  { label: "May 2026", value: "2026-05" },
  { label: "Apr 2026", value: "2026-04" },
  { label: "Mar 2026", value: "2026-03" },
  { label: "Feb 2026", value: "2026-02" },
  { label: "Jan 2026", value: "2026-01" },
  { label: "2025", value: "2025" },
  { label: "2024", value: "2024" },
  { label: "2023", value: "2023" },
]

export default function Dashboard() {
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics>({})
  const [stockData, setStockData] = useState<{
    sharePrice: number | null
    marketCap: number | null
    source: string
    timestamp: number | null
    previousClose: number | null
    changePercent: number | null
    sourceUrl: string | null
    rank: number | null
  }>({
    sharePrice: null, marketCap: null, source: "loading", timestamp: null,
    previousClose: null, changePercent: null, sourceUrl: null, rank: null,
  })

  const [timePeriod, setTimePeriod] = useState("current")
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false)
  const periodDropdownRef = useRef<HTMLDivElement>(null)

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
  const firstName = storedUser?.name?.split(" ")[0] || "User"

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(e.target as Node)) {
        setPeriodDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    getDashboardMetrics()
      .then((m: unknown) => setPlatformMetrics(m as PlatformMetrics))
      .catch(() => {})

    getStockData()
      .then((s: unknown) => {
        const sd = s as Record<string, unknown>
        const sharePrice = sd.sharePrice != null ? Number(sd.sharePrice) : null
        const previousClose = sd.previousClose != null ? Number(sd.previousClose) : null
        const changePercent = sd.changePercent != null
          ? Number(sd.changePercent)
          : sharePrice != null && previousClose != null && previousClose !== 0
            ? ((sharePrice - previousClose) / previousClose) * 100
            : null
        setStockData({
          sharePrice,
          marketCap: sd.marketCap != null ? Number(sd.marketCap) : null,
          source: String(sd.source ?? "unavailable"),
          timestamp: sd.timestamp != null ? Number(sd.timestamp) : null,
          previousClose,
          changePercent,
          sourceUrl: sd.sourceUrl != null ? String(sd.sourceUrl) : null,
          rank: sd.rank != null ? Number(sd.rank) : null,
        })
      })
      .catch(() => {})
  }, [])

  const stockTimestamp = stockData.timestamp
    ? new Date(stockData.timestamp * 1000).toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : null

  const { fmtNGN } = useCurrency()
  const selectedPeriod = TIME_PERIODS.find(p => p.value === timePeriod) ?? TIME_PERIODS[0]

  return (
    <div className="bg-white h-full w-full p-8 flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex justify-between items-start mb-6 gap-4 shrink-0">
        <div className="flex flex-col gap-[4px]">
          <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">
            Welcome, {firstName}
          </h1>
          <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-[#475467]">
            View Omatek's latest trends.
          </p>
        </div>

        {/* Currency + Time period selectors */}
        <div className="flex items-center gap-2 shrink-0">
        <CurrencyDropdown />
        <div className="relative" ref={periodDropdownRef}>
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
            <div className="absolute top-[44px] right-0 z-50 bg-white border border-[#d0d5dd] rounded-[12px] shadow-xl min-w-[180px] overflow-hidden py-1">
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
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8 shrink-0">

        {/* Revenue */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-5 flex flex-col gap-3">
          <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Revenue</p>
          <p className="font-['Figtree:Medium',sans-serif] font-medium text-[24px] text-black leading-tight">{fmtNGN(4_200_000_000)}</p>
          <span className="text-[12px] text-[#667085]">All finalized reports</span>
        </div>

        {/* Expenses */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-5 flex flex-col gap-3">
          <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Expenses</p>
          <p className="font-['Figtree:Medium',sans-serif] font-medium text-[24px] text-black leading-tight">{fmtNGN(3_100_000_000)}</p>
          <span className="text-[12px] text-[#667085]">All finalized reports</span>
        </div>

        {/* Share Price */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-5 flex flex-col gap-3">
          <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Share Price</p>
          {stockData.source === "loading" ? (
            <p className="text-[24px] font-medium text-[#d0d5dd]">…</p>
          ) : stockData.sharePrice != null ? (
            <>
              <p className="font-['Figtree:Medium',sans-serif] font-medium text-[24px] text-black leading-tight">
                {fmtNGN(stockData.sharePrice)}
              </p>
              {stockData.changePercent != null && (
                <div className="flex items-center gap-1">
                  {stockData.changePercent >= 0 ? (
                    <svg className="size-3.5 shrink-0 text-[#027a48]" viewBox="0 0 14 14" fill="none">
                      <path d="M7 11V3M7 3L3 7M7 3L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg className="size-3.5 shrink-0 text-[#b42318]" viewBox="0 0 14 14" fill="none">
                      <path d="M7 3V11M7 11L3 7M7 11L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  <span className={`text-[12px] font-medium ${stockData.changePercent >= 0 ? "text-[#027a48]" : "text-[#b42318]"}`}>
                    {stockData.changePercent >= 0 ? "+" : ""}{stockData.changePercent.toFixed(2)}%
                  </span>
                </div>
              )}
              {stockTimestamp && (
                stockData.sourceUrl ? (
                  <a href={stockData.sourceUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] text-[#667085] hover:text-[#144430] hover:underline transition-colors">
                    {stockData.source} · {stockTimestamp}
                  </a>
                ) : (
                  <span className="text-[11px] text-[#98a2b3]">{stockData.source} · {stockTimestamp}</span>
                )
              )}
            </>
          ) : (
            <>
              <p className="font-['Figtree:Medium',sans-serif] font-medium text-[24px] text-black leading-tight">{fmtNGN(2.47)}</p>
              <div className="flex items-center gap-1">
                <svg className="size-3.5 shrink-0 text-[#027a48]" viewBox="0 0 14 14" fill="none">
                  <path d="M7 11V3M7 3L3 7M7 3L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-[12px] font-medium text-[#027a48]">+8.91%</span>
              </div>
              <span className="text-[11px] text-[#98a2b3]">AFX NGX Quote</span>
            </>
          )}
        </div>

        {/* Market Cap */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-5 flex flex-col gap-3">
          <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Market Cap</p>
          {stockData.source === "loading" ? (
            <p className="text-[24px] font-medium text-[#d0d5dd]">…</p>
          ) : stockData.marketCap != null ? (
            <>
              <p className="font-['Figtree:Medium',sans-serif] font-medium text-[24px] text-black leading-tight">
                {fmtNGN(stockData.marketCap!)}
              </p>
              {stockData.rank != null && (
                <span className="text-[12px] text-[#667085]">Rank #{stockData.rank} on NGX</span>
              )}
              {stockTimestamp && (
                stockData.sourceUrl ? (
                  <a href={stockData.sourceUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] text-[#667085] hover:text-[#144430] hover:underline transition-colors">
                    {stockData.source} · {stockTimestamp}
                  </a>
                ) : (
                  <span className="text-[11px] text-[#98a2b3]">{stockData.source} · {stockTimestamp}</span>
                )
              )}
            </>
          ) : (
            <>
              <p className="font-['Figtree:Medium',sans-serif] font-medium text-[24px] text-black leading-tight">{fmtNGN(6_940_000_000)}</p>
              <span className="text-[12px] text-[#667085]">Rank #125 on NGX</span>
              <span className="text-[11px] text-[#98a2b3]">Stock Analysis</span>
            </>
          )}
        </div>

      </div>

      {/* Revenue Trend + Expense Trend */}
      <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">

        {/* Revenue Trend */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 flex flex-col gap-4">
          <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Revenue Trend</p>
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <svg className="size-8 text-[#d0d5dd]" fill="none" viewBox="0 0 24 24">
              <path d="M3 17l4-8 4 4 4-6 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-[13px] text-[#98a2b3] max-w-[220px]">
              Finalize reports on the AI Analysis page to view revenue trend
            </p>
          </div>
        </div>

        {/* Expense Trend */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 flex flex-col gap-4">
          <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Expense Trend</p>
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <svg className="size-8 text-[#d0d5dd]" fill="none" viewBox="0 0 24 24">
              <path d="M3 17l4-8 4 4 4-6 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-[13px] text-[#98a2b3] max-w-[220px]">
              Finalize reports on the AI Analysis page to view expense trend
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
