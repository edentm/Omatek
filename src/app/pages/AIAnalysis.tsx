import { useState, useEffect, useRef } from "react";
import { useChatPanel } from "../../contexts/ChatPanelContext";
import { Tooltip } from "../components/Tooltip";
import { useCurrency } from "../../contexts/CurrencyContext";
import { CurrencyDropdown } from "../components/CurrencyDropdown";

function convertValue(s: string, fmtNGN: (n: number) => string): string {
  if (!s.startsWith("₦")) return s
  const rest = s.slice(1)
  let raw: number
  if (rest.endsWith("B"))      raw = parseFloat(rest) * 1e9
  else if (rest.endsWith("M")) raw = parseFloat(rest) * 1e6
  else if (rest.endsWith("K")) raw = parseFloat(rest) * 1e3
  else                         raw = parseFloat(rest)
  return isNaN(raw) ? s : fmtNGN(raw)
}

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

type SourceDoc = { name: string; date: string; confidence: number }
type TrendRow = { period: string; value: string; change?: string; positive?: boolean }

type MetricCard = {
  id: string
  label: string
  value: string
  unit?: string
  change: string
  positive: boolean
  sourceDocs: SourceDoc[]
  description: string
  trend: TrendRow[]
  extraction: string
  isMarketData?: boolean
}

// ── Sample data ──────────────────────────────────────────────────────────────

const PROFIT_METRICS: MetricCard[] = [
  {
    id: "revenue",
    label: "Revenue",
    value: "₦4.2B",
    change: "+12.3%",
    positive: true,
    description: "Total revenue recognised across all business segments for the selected period.",
    extraction: "Extracted from consolidated income statements. Includes product sales, service fees, and licensing income.",
    sourceDocs: [
      { name: "FY2025 Annual Report.pdf", date: "12 May 2026", confidence: 94 },
      { name: "Q4 2025 Financial Statements.pdf", date: "3 Apr 2026", confidence: 88 },
      { name: "Board Presentation Mar 2026.pdf", date: "28 Mar 2026", confidence: 72 },
    ],
    trend: [
      { period: "FY 2023", value: "₦3.1B", change: "+6.2%", positive: true },
      { period: "FY 2024", value: "₦3.7B", change: "+19.4%", positive: true },
      { period: "FY 2025", value: "₦4.2B", change: "+13.5%", positive: true },
      { period: "Q1 2026", value: "₦1.1B", change: "+8.1%", positive: true },
    ],
  },
  {
    id: "admin-expenses",
    label: "Administrative Expenses",
    value: "₦1.8B",
    change: "+5.1%",
    positive: false,
    description: "All overhead and administrative costs including office, legal, and management fees.",
    extraction: "Extracted from the operating expenses note in the income statement. Excludes COGS and depreciation.",
    sourceDocs: [
      { name: "FY2025 Annual Report.pdf", date: "12 May 2026", confidence: 91 },
      { name: "Management Accounts Dec 2025.pdf", date: "15 Jan 2026", confidence: 85 },
    ],
    trend: [
      { period: "FY 2023", value: "₦1.4B", change: "+3.0%", positive: false },
      { period: "FY 2024", value: "₦1.7B", change: "+21.4%", positive: false },
      { period: "FY 2025", value: "₦1.8B", change: "+5.9%", positive: false },
      { period: "Q1 2026", value: "₦0.48B", change: "+6.7%", positive: false },
    ],
  },
  {
    id: "taxes",
    label: "Taxes Owed",
    value: "₦320M",
    change: "-2.4%",
    positive: true,
    description: "Current and deferred tax liabilities as reported. Excludes prior-year adjustments.",
    extraction: "Extracted from the tax note in audited financial statements.",
    sourceDocs: [
      { name: "FY2025 Annual Report.pdf", date: "12 May 2026", confidence: 89 },
      { name: "Tax Computation 2025.pdf", date: "2 Feb 2026", confidence: 96 },
    ],
    trend: [
      { period: "FY 2023", value: "₦290M", change: "+2.1%", positive: false },
      { period: "FY 2024", value: "₦328M", change: "+13.1%", positive: false },
      { period: "FY 2025", value: "₦320M", change: "-2.4%", positive: true },
    ],
  },
  {
    id: "revenue-trend",
    label: "Revenue Trend",
    value: "+13.5%",
    change: "+7.3pp",
    positive: true,
    description: "Year-over-year revenue growth rate, showing the directional trajectory of top-line performance.",
    extraction: "Calculated from revenue figures across consecutive annual reports.",
    sourceDocs: [
      { name: "FY2025 Annual Report.pdf", date: "12 May 2026", confidence: 94 },
      { name: "Q4 2025 Financial Statements.pdf", date: "3 Apr 2026", confidence: 88 },
    ],
    trend: [
      { period: "FY 2022→23", value: "+6.2%", change: "—", positive: true },
      { period: "FY 2023→24", value: "+19.4%", change: "+13.2pp", positive: true },
      { period: "FY 2024→25", value: "+13.5%", change: "-5.9pp", positive: true },
    ],
  },
  {
    id: "expense-trend",
    label: "Expense Trend",
    value: "+5.9%",
    change: "-15.5pp",
    positive: true,
    description: "Year-over-year growth in administrative expenses. A declining trend indicates improving cost control.",
    extraction: "Calculated from operating expense figures across consecutive annual reports.",
    sourceDocs: [
      { name: "FY2025 Annual Report.pdf", date: "12 May 2026", confidence: 91 },
      { name: "Management Accounts Dec 2025.pdf", date: "15 Jan 2026", confidence: 85 },
    ],
    trend: [
      { period: "FY 2022→23", value: "+3.0%", change: "—", positive: true },
      { period: "FY 2023→24", value: "+21.4%", change: "+18.4pp", positive: false },
      { period: "FY 2024→25", value: "+5.9%", change: "-15.5pp", positive: true },
    ],
  },
]

const MARKET_METRICS: MetricCard[] = [
  {
    id: "market-cap",
    label: "Market Cap",
    value: "₦6.94B",
    change: "+8.9%",
    positive: true,
    isMarketData: true,
    description: "Total market capitalisation: shares outstanding × current NGX closing price.",
    extraction: "Sourced live from the Nigerian Exchange Group (NGX). Updated each trading day.",
    sourceDocs: [],
    trend: [
      { period: "FY 2023", value: "₦5.1B", change: "+5.2%", positive: true },
      { period: "FY 2024", value: "₦6.3B", change: "+23.5%", positive: true },
      { period: "FY 2025", value: "₦6.9B", change: "+9.5%", positive: true },
    ],
  },
  {
    id: "share-price",
    label: "Share Price",
    value: "₦2.47",
    change: "+8.91%",
    positive: true,
    isMarketData: true,
    description: "Closing price per ordinary share on the Nigerian Exchange Group (NGX).",
    extraction: "Sourced live from the NGX exchange feed (ticker: OMATEK). Updated each trading day.",
    sourceDocs: [],
    trend: [
      { period: "FY 2023", value: "₦1.82", change: "+2.8%", positive: true },
      { period: "FY 2024", value: "₦2.27", change: "+24.7%", positive: true },
      { period: "FY 2025", value: "₦2.47", change: "+8.8%", positive: true },
    ],
  },
]

const OPERATIONS_METRICS: MetricCard[] = [
  {
    id: "employees",
    label: "Number of Employees",
    value: "1,247",
    change: "+3.2%",
    positive: true,
    description: "Total headcount including full-time, part-time and contract staff at period end.",
    extraction: "Extracted from the human resources section of the annual report and HR summary addendum.",
    sourceDocs: [
      { name: "FY2025 Annual Report.pdf", date: "12 May 2026", confidence: 87 },
      { name: "HR Summary 2025.pdf", date: "20 Jan 2026", confidence: 95 },
    ],
    trend: [
      { period: "FY 2023", value: "1,102", change: "-1.2%", positive: false },
      { period: "FY 2024", value: "1,208", change: "+9.6%", positive: true },
      { period: "FY 2025", value: "1,247", change: "+3.2%", positive: true },
    ],
  },
  {
    id: "staff-costs",
    label: "Salaries & Staff Costs",
    value: "₦2.1B",
    change: "+7.8%",
    positive: false,
    description: "Total personnel expenses including salaries, bonuses, pension contributions and benefits.",
    extraction: "Extracted from the staff costs note in the audited financial statements.",
    sourceDocs: [
      { name: "FY2025 Annual Report.pdf", date: "12 May 2026", confidence: 92 },
      { name: "Management Accounts Dec 2025.pdf", date: "15 Jan 2026", confidence: 80 },
    ],
    trend: [
      { period: "FY 2023", value: "₦1.7B", change: "+4.2%", positive: false },
      { period: "FY 2024", value: "₦1.95B", change: "+14.7%", positive: false },
      { period: "FY 2025", value: "₦2.1B", change: "+7.7%", positive: false },
    ],
  },
]

const FINANCIAL_HEALTH_METRICS: MetricCard[] = [
  {
    id: "total-debt",
    label: "Total Debt",
    value: "₦8.3B",
    change: "-4.5%",
    positive: true,
    description: "Sum of all short-term and long-term borrowings as reported on the balance sheet.",
    extraction: "Aggregated from the borrowings note and balance sheet in the audited accounts.",
    sourceDocs: [
      { name: "FY2025 Annual Report.pdf", date: "12 May 2026", confidence: 96 },
      { name: "Loan Schedule Dec 2025.pdf", date: "10 Jan 2026", confidence: 99 },
    ],
    trend: [
      { period: "FY 2023", value: "₦9.4B", change: "+1.1%", positive: false },
      { period: "FY 2024", value: "₦8.7B", change: "-7.4%", positive: true },
      { period: "FY 2025", value: "₦8.3B", change: "-4.6%", positive: true },
    ],
  },
  {
    id: "lt-debt-paid",
    label: "Long-term Debt Paid Off",
    value: "₦1.2B",
    change: "+18.3%",
    positive: true,
    description: "Principal repayments made on long-term borrowings during the period.",
    extraction: "Extracted from the financing activities section of the cash flow statement.",
    sourceDocs: [
      { name: "FY2025 Annual Report.pdf", date: "12 May 2026", confidence: 93 },
      { name: "Loan Schedule Dec 2025.pdf", date: "10 Jan 2026", confidence: 97 },
    ],
    trend: [
      { period: "FY 2023", value: "₦0.7B", change: "—", positive: true },
      { period: "FY 2024", value: "₦1.0B", change: "+42.9%", positive: true },
      { period: "FY 2025", value: "₦1.2B", change: "+20.0%", positive: true },
    ],
  },
]

const TAB_METRICS: Record<Tab, MetricCard[]> = {
  profit: PROFIT_METRICS,
  market: MARKET_METRICS,
  operations: OPERATIONS_METRICS,
  financialHealth: FINANCIAL_HEALTH_METRICS,
}

// ── Confidence pill ───────────────────────────────────────────────────────────
function ConfidencePill({ score }: { score: number }) {
  if (score >= 90) return <span className="inline-block px-2 py-0.5 rounded-full text-[11px] bg-[#ecfdf3] text-[#027a48]">{score}% confidence</span>
  if (score >= 75) return <span className="inline-block px-2 py-0.5 rounded-full text-[11px] bg-[#fffaeb] text-[#b54708]">{score}% confidence</span>
  return <span className="inline-block px-2 py-0.5 rounded-full text-[11px] bg-[#fef3f2] text-[#b42318]">{score}% confidence</span>
}

// ── Metric Card ───────────────────────────────────────────────────────────────
function MetricCardTile({ metric, selected, onClick }: { metric: MetricCard; selected: boolean; onClick: () => void }) {
  const { fmtNGN } = useCurrency()
  return (
    <button
      onClick={onClick}
      className={`text-left bg-white border rounded-[12px] p-5 transition-all hover:shadow-md hover:border-[#b0c4b8] ${selected ? "border-[#144430] ring-2 ring-[#144430]/10 shadow-md" : "border-[#d0d5dd]"}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085] leading-tight">{metric.label}</p>
        <span className={`shrink-0 inline-flex items-center gap-1 text-[12px] font-medium px-2 py-0.5 rounded-full ${metric.positive ? "bg-[#ecfdf3] text-[#027a48]" : "bg-[#fef3f2] text-[#b42318]"}`}>
          {metric.positive ? (
            <svg className="size-3 shrink-0" fill="none" viewBox="0 0 12 12"><path d="M6 9V3M3 6l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
            <svg className="size-3 shrink-0" fill="none" viewBox="0 0 12 12"><path d="M6 3v6M3 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
          {metric.change}
        </span>
      </div>
      <p className="font-['Figtree:Medium',sans-serif] font-medium text-[28px] text-black leading-tight mb-3">{convertValue(metric.value, fmtNGN)}</p>
      {metric.isMarketData ? (
        <div className="flex items-center gap-1.5">
          <svg className="size-3.5 text-[#1a56db] shrink-0" fill="none" viewBox="0 0 16 16">
            <path d="M2 11l3.5-4 3 3L12 5l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[11px] text-[#1a56db] font-medium">Live market data · NGX</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <svg className="size-3.5 text-[#98a2b3] shrink-0" fill="none" viewBox="0 0 16 16">
            <path d="M8 1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L8 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 1v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[11px] text-[#98a2b3]">{metric.sourceDocs.length} source doc{metric.sourceDocs.length !== 1 ? "s" : ""}</span>
        </div>
      )}
    </button>
  )
}

// ── Side Panel ────────────────────────────────────────────────────────────────
function MetricSidePanel({
  metric,
  chatOpen,
  isFullWidth,
  onToggleFullWidth,
  onClose,
}: {
  metric: MetricCard
  chatOpen: boolean
  isFullWidth: boolean
  onToggleFullWidth: () => void
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "sources" | "trend">("overview")
  const { fmtNGN } = useCurrency()

  return (
    <div
      className="fixed top-0 h-screen bg-white border-l border-[#eaecf0] transition-all duration-300 flex flex-col"
      style={{
        zIndex: 1000,
        right: chatOpen ? 420 : 0,
        width: isFullWidth ? undefined : 500,
        boxShadow: chatOpen ? "-12px 0 20px rgba(0,0,0,0.08)" : "-4px 0 24px rgba(0,0,0,0.08)",
        ...(isFullWidth ? { left: 187, right: chatOpen ? 420 : 0 } : {}),
      }}
    >
      {/* Panel header */}
      <div className="border-b border-[#eaecf0] px-6 py-3 flex items-center justify-between shrink-0">
        <Tooltip label={isFullWidth ? "Collapse panel" : "Expand panel"} position="bottom">
          <button
            onClick={onToggleFullWidth}
            className="flex items-center justify-center size-[32px] rounded-lg text-[#667085] hover:text-black hover:bg-gray-50 transition-colors"
          >
            <svg className="size-4 shrink-0" fill="none" viewBox="0 0 20 20">
              {isFullWidth ? (
                <>
                  <path d="M0 9.16667L4.16667 5L0 0.833333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" transform="translate(5, 5)"/>
                  <path d="M0 9.16667L4.16667 5L0 0.833333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" transform="translate(9, 5)"/>
                </>
              ) : (
                <>
                  <path d="M5 9.16667L0.833333 5L5 0.833333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" transform="translate(5, 5)"/>
                  <path d="M5 9.16667L0.833333 5L5 0.833333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" transform="translate(10, 5)"/>
                </>
              )}
            </svg>
          </button>
        </Tooltip>
        <Tooltip label="Close panel" position="bottom">
          <button
            onClick={onClose}
            className="flex items-center justify-center size-[32px] rounded-lg text-[#667085] hover:text-black hover:bg-gray-50 transition-colors"
          >
            <svg className="size-4 shrink-0" fill="none" viewBox="0 0 20 20">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </Tooltip>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8" style={{ scrollbarWidth: "none" }}>

        {/* Metric title + value */}
        <div className="mb-5">
          <p className="text-[13px] text-[#667085] mb-1">{metric.label}</p>
          <div className="flex items-end gap-3 mb-2">
            <p className="font-['Figtree:Medium',sans-serif] font-medium text-[40px] text-black leading-none">{convertValue(metric.value, fmtNGN)}</p>
            <span className={`mb-1 inline-flex items-center gap-1 text-[13px] font-medium px-2.5 py-1 rounded-full ${metric.positive ? "bg-[#ecfdf3] text-[#027a48]" : "bg-[#fef3f2] text-[#b42318]"}`}>
              {metric.positive ? (
                <svg className="size-3.5" fill="none" viewBox="0 0 12 12"><path d="M6 9V3M3 6l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg className="size-3.5" fill="none" viewBox="0 0 12 12"><path d="M6 3v6M3 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
              {metric.change} vs prior period
            </span>
          </div>
          <p className="text-[13px] text-[#475467] leading-[21px]">{metric.description}</p>
        </div>

        {/* Sub-tabs */}
        <div className="border-b border-[#eaecf0] mb-5">
          <div className="flex gap-1">
            {(["overview", "sources", "trend"] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`text-[13px] px-3 py-2 font-['Figtree:Medium',sans-serif] capitalize transition-colors ${activeTab === t ? "border-b-2 border-black font-semibold text-black" : "text-[#667085] hover:text-black"}`}
              >
                {t === "sources" ? "Source Docs" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-5">
            {/* Extraction note */}
            <div className="bg-[#f9fafb] rounded-[10px] p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="size-4 text-[#667085] shrink-0" fill="none" viewBox="0 0 16 16">
                  <path d="M8 0C8.3 2.8 9.5 6.5 16 8C9.5 9.5 8.3 13.2 8 16C7.7 13.2 6.5 9.5 0 8C6.5 6.5 7.7 2.8 8 0Z" fill="currentColor"/>
                </svg>
                <p className="text-[12px] font-semibold text-[#344054]">AI Extraction Note</p>
              </div>
              <p className="text-[12px] text-[#475467] leading-[20px]">{metric.extraction}</p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              {metric.isMarketData ? (
                <>
                  <div className="bg-white border border-[#eaecf0] rounded-[10px] p-3.5">
                    <p className="text-[11px] text-[#98a2b3] mb-1">Data Source</p>
                    <p className="font-medium text-[14px] text-[#1a56db] leading-tight mt-1">NGX Exchange</p>
                  </div>
                  <div className="bg-white border border-[#eaecf0] rounded-[10px] p-3.5">
                    <p className="text-[11px] text-[#98a2b3] mb-1">Update Frequency</p>
                    <p className="font-medium text-[14px] text-black leading-tight mt-1">Daily (live)</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white border border-[#eaecf0] rounded-[10px] p-3.5">
                    <p className="text-[11px] text-[#98a2b3] mb-1">Source Documents</p>
                    <p className="font-medium text-[20px] text-black">{metric.sourceDocs.length}</p>
                  </div>
                  <div className="bg-white border border-[#eaecf0] rounded-[10px] p-3.5">
                    <p className="text-[11px] text-[#98a2b3] mb-1">Avg Confidence</p>
                    <p className="font-medium text-[20px] text-black">
                      {metric.sourceDocs.length > 0 ? Math.round(metric.sourceDocs.reduce((s, d) => s + d.confidence, 0) / metric.sourceDocs.length) : "—"}%
                    </p>
                  </div>
                </>
              )}
              <div className="bg-white border border-[#eaecf0] rounded-[10px] p-3.5">
                <p className="text-[11px] text-[#98a2b3] mb-1">Data Points</p>
                <p className="font-medium text-[20px] text-black">{metric.trend.length}</p>
              </div>
              <div className="bg-white border border-[#eaecf0] rounded-[10px] p-3.5">
                <p className="text-[11px] text-[#98a2b3] mb-1">Last Updated</p>
                <p className="font-medium text-[13px] text-black leading-tight mt-1">
                  {metric.isMarketData ? "Today" : (metric.sourceDocs[0]?.date ?? "—")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Source docs tab */}
        {activeTab === "sources" && (
          <div className="flex flex-col gap-3">
            {metric.isMarketData ? (
              <div className="border border-[#e8f0fe] bg-[#f0f5ff] rounded-[10px] p-4 flex items-start gap-3">
                <div className="shrink-0 size-9 bg-[#dbeafe] rounded-[8px] flex items-center justify-center">
                  <svg className="size-4 text-[#1a56db]" fill="none" viewBox="0 0 16 16">
                    <path d="M2 11l3.5-4 3 3L12 5l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1a56db] mb-1">Nigerian Exchange Group (NGX)</p>
                  <p className="text-[12px] text-[#475467] leading-[18px]">
                    This metric is sourced directly from live market data, not from uploaded documents. Values reflect the most recent trading session on the NGX.
                  </p>
                </div>
              </div>
            ) : (
              metric.sourceDocs.map((doc, i) => (
                <div key={i} className="border border-[#eaecf0] rounded-[10px] p-4 flex items-start gap-3">
                  <div className="shrink-0 size-9 bg-[#f2f4f7] rounded-[8px] flex items-center justify-center">
                    <svg className="size-4 text-[#667085]" fill="none" viewBox="0 0 16 16">
                      <path d="M9 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L9 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 1v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#344054] truncate mb-1">{doc.name}</p>
                    <p className="text-[11px] text-[#98a2b3] mb-2">Uploaded {doc.date}</p>
                    <ConfidencePill score={doc.confidence} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Trend tab */}
        {activeTab === "trend" && (
          <div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#eaecf0]">
                  <th className="pb-2 text-[11px] font-semibold text-[#98a2b3] uppercase tracking-wide">Period</th>
                  <th className="pb-2 text-[11px] font-semibold text-[#98a2b3] uppercase tracking-wide text-right">Value</th>
                  <th className="pb-2 text-[11px] font-semibold text-[#98a2b3] uppercase tracking-wide text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                {metric.trend.map((row, i) => (
                  <tr key={i} className="border-b border-[#f2f4f7] last:border-0">
                    <td className="py-3 text-[13px] text-[#344054]">{row.period}</td>
                    <td className="py-3 text-[13px] font-medium text-black text-right">{convertValue(row.value, fmtNGN)}</td>
                    <td className="py-3 text-right">
                      {row.change && row.change !== "—" ? (
                        <span className={`text-[12px] font-medium ${row.positive ? "text-[#027a48]" : "text-[#b42318]"}`}>
                          {row.change}
                        </span>
                      ) : (
                        <span className="text-[12px] text-[#98a2b3]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AIAnalysis() {
  const { chatOpen, setSidePanelOpen } = useChatPanel()
  const [activeTab, setActiveTab] = useState<Tab>("profit")
  const [timePeriod, setTimePeriod] = useState("all")
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<MetricCard | null>(null)
  const [isFullWidth, setIsFullWidth] = useState(false)
  const periodDropdownRef = useRef<HTMLDivElement>(null)

  const panelOpen = selectedMetric !== null

  useEffect(() => {
    setSidePanelOpen(panelOpen)
    return () => setSidePanelOpen(false)
  }, [panelOpen, setSidePanelOpen])

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
  const metrics = TAB_METRICS[activeTab]

  const closePanel = () => { setSelectedMetric(null); setIsFullWidth(false) }

  return (
    <div
      className="bg-white h-full overflow-y-auto"
      style={{ paddingRight: panelOpen && !isFullWidth ? (chatOpen ? "calc(500px + 420px)" : "500px") : undefined }}
    >
      <div className="p-8">

        {/* Header */}
        <div className="flex justify-between items-start mb-6 gap-4">
          <div className="flex flex-col gap-[4px]">
            <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">
              Metrics
            </h1>
            <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-[#475467]">
              View different categories of metrics extracted from documents related to Omatek's financial health.
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
        </div>

        {/* Tab navigation */}
        <div className="border-b border-[#e8eef7] mb-6">
          <div className="flex gap-4">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); closePanel() }}
                className={`font-['Figtree:Medium',sans-serif] font-medium text-[14px] pb-3 px-2 transition-colors ${
                  activeTab === tab.key ? "border-b-[2.4px] border-black text-black" : "text-[#667085] hover:text-black"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Metric cards grid */}
        <div className="grid grid-cols-2 gap-5">
          {metrics.map(metric => (
            <MetricCardTile
              key={metric.id}
              metric={metric}
              selected={selectedMetric?.id === metric.id}
              onClick={() => {
                if (selectedMetric?.id === metric.id) { closePanel() }
                else { setSelectedMetric(metric); setIsFullWidth(false) }
              }}
            />
          ))}
        </div>

      </div>

      {/* Side panel */}
      {selectedMetric && (
        <MetricSidePanel
          metric={selectedMetric}
          chatOpen={chatOpen}
          isFullWidth={isFullWidth}
          onToggleFullWidth={() => setIsFullWidth(w => !w)}
          onClose={closePanel}
        />
      )}
    </div>
  )
}
