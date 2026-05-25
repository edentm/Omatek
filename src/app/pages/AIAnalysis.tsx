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

  const getConfidencePill = (confidence: string) => {
    const value = parseInt(confidence)
    if (value >= 90) return { label: `${confidence} - Very High`, classes: "bg-[#ecfdf3] text-[#027a48]" }
    if (value >= 80) return { label: `${confidence} - High`, classes: "bg-[#e8f0fe] text-[#1a56db]" }
    if (value >= 60) return { label: `${confidence} - Moderate`, classes: "bg-[#fef0c7] text-[#dc6803]" }
    return { label: `${confidence} - Low`, classes: "bg-[#fef3f2] text-[#b42318]" }
  }

  return (
    <div className="bg-white h-full w-full p-8 overflow-y-auto">

      {/* Header */}
      <div className="flex justify-between items-start mb-6 gap-4">
        <div className="flex flex-col gap-[4px]">
          <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">
            Metrics Summary
          </h1>
          <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-[#475467]">
            Upload and analyze documents, flag issues
          </p>
        </div>

        {/* Time period selector */}
        <div className="relative shrink-0" ref={periodDropdownRef}>
          <button
            onClick={() => setPeriodDropdownOpen(o => !o)}
            className="bg-white border-[#d0d5dd] border-[0.8px] border-solid h-[43px] rounded-[10px] px-6 flex items-center gap-2 hover:bg-gray-50 transition-colors min-w-[160px]"
          >
            <span className="flex-1 text-left font-['Figtree:Regular',sans-serif] font-normal text-[14px] text-[#344054] whitespace-nowrap">
              {selectedPeriod.label.toUpperCase()}
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

        {/* Profit */}
        {activeTab === "profit" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-5 max-w-2xl">
              <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 flex flex-col gap-3">
                <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Revenue</p>
                <p className="font-['Figtree:Medium',sans-serif] font-medium text-[28px] text-black leading-tight">₦2.2M</p>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1">
                    <svg className="size-3.5 shrink-0 text-[#b42318]" viewBox="0 0 14 14" fill="none">
                      <path d="M7 3V11M7 11L3 7M7 11L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[12px] font-['Figtree:Medium',sans-serif] font-medium text-[#b42318]">−64.9% vs FY 2024</span>
                  </div>
                  <a href="https://doclib.ngxgroup.com/Financial_NewsDocs/45931_OMATEK_VENTURES_PLC-_YEAR_END_-_FINANCIAL_STATEMENT_FOR_2025_FINANCIAL_STATEMENTS_JANUARY_2026.pdf" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#98a2b3] underline underline-offset-2 hover:text-[#667085] transition-colors">FY 2025 · Unaudited financials</a>
                </div>
              </div>
              <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 flex flex-col gap-3">
                <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Administrative Expenses</p>
                <p className="font-['Figtree:Medium',sans-serif] font-medium text-[28px] text-black leading-tight">₦50.52M</p>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1">
                    <svg className="size-3.5 shrink-0 text-[#027a48]" viewBox="0 0 14 14" fill="none">
                      <path d="M7 11V3M7 3L3 7M7 3L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[12px] font-['Figtree:Medium',sans-serif] font-medium text-[#027a48]">−26.2% vs FY 2024</span>
                  </div>
                  <a href="https://doclib.ngxgroup.com/Financial_NewsDocs/45931_OMATEK_VENTURES_PLC-_YEAR_END_-_FINANCIAL_STATEMENT_FOR_2025_FINANCIAL_STATEMENTS_JANUARY_2026.pdf" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#98a2b3] underline underline-offset-2 hover:text-[#667085] transition-colors">FY 2025 · Unaudited financials</a>
                </div>
              </div>
            </div>
            <div className="border border-[#eaecf0] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Metric", "Extracted From", "AI Confidence", "Extraction Date"].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { metric: "Revenue (₦2.2M)", source: "Omatek FY 2025 Unaudited Financials", sourceUrl: "https://doclib.ngxgroup.com/Financial_NewsDocs/45931_OMATEK_VENTURES_PLC-_YEAR_END_-_FINANCIAL_STATEMENT_FOR_2025_FINANCIAL_STATEMENTS_JANUARY_2026.pdf", confidence: "94%", date: "01/2026" },
                    { metric: "Admin Expenses (₦50.52M)", source: "Omatek FY 2025 Unaudited Financials", sourceUrl: "https://doclib.ngxgroup.com/Financial_NewsDocs/45931_OMATEK_VENTURES_PLC-_YEAR_END_-_FINANCIAL_STATEMENT_FOR_2025_FINANCIAL_STATEMENTS_JANUARY_2026.pdf", confidence: "96%", date: "01/2026" },
                    { metric: "Net Loss (₦48.32M)", source: "Omatek FY 2025 Unaudited Financials", sourceUrl: "https://doclib.ngxgroup.com/Financial_NewsDocs/45931_OMATEK_VENTURES_PLC-_YEAR_END_-_FINANCIAL_STATEMENT_FOR_2025_FINANCIAL_STATEMENTS_JANUARY_2026.pdf", confidence: "95%", date: "01/2026" },
                    { metric: "Prior Year Revenue (₦6.27M)", source: "Omatek FY 2024 Financial Statements", sourceUrl: "https://doclib.ngxgroup.com/Financial_NewsDocs/45931_OMATEK_VENTURES_PLC-_YEAR_END_-_FINANCIAL_STATEMENT_FOR_2025_FINANCIAL_STATEMENTS_JANUARY_2026.pdf", confidence: "92%", date: "2024" },
                    { metric: "Admin Expenses FY 2024 (₦68.41M)", source: "Omatek FY 2024 Financial Statements", sourceUrl: "https://doclib.ngxgroup.com/Financial_NewsDocs/45931_OMATEK_VENTURES_PLC-_YEAR_END_-_FINANCIAL_STATEMENT_FOR_2025_FINANCIAL_STATEMENTS_JANUARY_2026.pdf", confidence: "93%", date: "2024" },
                  ].map((row, i) => {
                    const p = getConfidencePill(row.confidence)
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-[14px] text-black font-['Figtree:Medium',sans-serif]">{row.metric}</td>
                        <td className="px-6 py-4 text-[14px] text-gray-600"><a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-black transition-colors">{row.source}</a></td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-block px-2 py-1 rounded-full text-[12px] ${p.classes}`}>{p.label}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">{row.date}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Market */}
        {activeTab === "market" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-5 max-w-2xl">
              <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 flex flex-col gap-3">
                <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Market Cap</p>
                <p className="font-['Figtree:Medium',sans-serif] font-medium text-[28px] text-black leading-tight">₦6.94B</p>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[12px] font-['Figtree:Medium',sans-serif] font-medium text-[#667085]">Rank #125 on NGX</span>
                  <a href="https://stockanalysis.com/quote/ngx/OMATEK/statistics/" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#98a2b3] underline underline-offset-2 hover:text-[#667085] transition-colors">Stock Analysis · Apr 8, 2026</a>
                </div>
              </div>
              <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 flex flex-col gap-3">
                <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Share Price</p>
                <p className="font-['Figtree:Medium',sans-serif] font-medium text-[28px] text-black leading-tight">₦2.47</p>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1">
                    <svg className="size-3.5 shrink-0 text-[#027a48]" viewBox="0 0 14 14" fill="none">
                      <path d="M7 11V3M7 3L3 7M7 3L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[12px] font-['Figtree:Medium',sans-serif] font-medium text-[#027a48]">+8.91%</span>
                  </div>
                  <a href="https://afx.kwayisi.org/ngx/omatek.html" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#98a2b3] underline underline-offset-2 hover:text-[#667085] transition-colors">AFX NGX Quote · Apr 8, 2026</a>
                </div>
              </div>
            </div>
            <div className="border border-[#eaecf0] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Metric", "Extracted From", "AI Confidence", "Extraction Date"].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { metric: "Market Cap (₦6.94B)", source: "Stock Analysis / NGX", sourceUrl: "https://stockanalysis.com/quote/ngx/OMATEK/statistics/", confidence: "98%", date: "04/08/2026" },
                    { metric: "Share Price (₦2.47)", source: "AFX NGX Quote", sourceUrl: "https://afx.kwayisi.org/ngx/omatek.html", confidence: "99%", date: "04/08/2026" },
                    { metric: "24h Price Change (+8.91%)", source: "AFX NGX Quote", sourceUrl: "https://afx.kwayisi.org/ngx/omatek.html", confidence: "99%", date: "04/08/2026" },
                    { metric: "NGX Rank (#125)", source: "Stock Analysis / NGX", sourceUrl: "https://stockanalysis.com/quote/ngx/OMATEK/statistics/", confidence: "97%", date: "04/08/2026" },
                  ].map((row, i) => {
                    const p = getConfidencePill(row.confidence)
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-[14px] text-black font-['Figtree:Medium',sans-serif]">{row.metric}</td>
                        <td className="px-6 py-4 text-[14px] text-gray-600"><a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-black transition-colors">{row.source}</a></td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-block px-2 py-1 rounded-full text-[12px] ${p.classes}`}>{p.label}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">{row.date}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Operations */}
        {activeTab === "operations" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-5 max-w-2xl">
              <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 flex flex-col gap-3">
                <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Number of Employees</p>
                <p className="font-['Figtree:Medium',sans-serif] font-medium text-[28px] text-black leading-tight">~80</p>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[12px] font-['Figtree:Medium',sans-serif] font-medium text-[#667085]">Full-time staff</span>
                  <a href="https://www.african-markets.com/index.php/en/stock-markets/ngse/listed-companies/company?code=OMATEK" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#98a2b3] underline underline-offset-2 hover:text-[#667085] transition-colors">African Markets · FY 2024</a>
                </div>
              </div>
              <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 flex flex-col gap-3">
                <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Salaries & Staff Costs</p>
                <p className="font-['Figtree:Medium',sans-serif] font-medium text-[28px] text-black leading-tight">₦24.3M</p>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1">
                    <svg className="size-3.5 shrink-0 text-[#b42318]" viewBox="0 0 14 14" fill="none">
                      <path d="M7 3V11M7 11L3 7M7 11L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[12px] font-['Figtree:Medium',sans-serif] font-medium text-[#b42318]">+4.2% vs prior year</span>
                  </div>
                  <p className="text-[11px] text-[#98a2b3]">FY 2025 · Sample data</p>
                </div>
              </div>
            </div>
            <div className="border border-[#eaecf0] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Metric", "Extracted From", "AI Confidence", "Extraction Date"].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { metric: "Headcount (~80 employees)", source: "African Markets Profile", sourceUrl: "https://www.african-markets.com/index.php/en/stock-markets/ngse/listed-companies/company?code=OMATEK", confidence: "82%", date: "2024" },
                    { metric: "Admin Expenses FY 2025 (₦50.52M)", source: "Omatek FY 2025 Unaudited Financials", sourceUrl: "https://doclib.ngxgroup.com/Financial_NewsDocs/45931_OMATEK_VENTURES_PLC-_YEAR_END_-_FINANCIAL_STATEMENT_FOR_2025_FINANCIAL_STATEMENTS_JANUARY_2026.pdf", confidence: "91%", date: "01/2026" },
                    { metric: "Admin Expenses FY 2024 (₦68.41M)", source: "Omatek FY 2025 Unaudited Financials", sourceUrl: "https://doclib.ngxgroup.com/Financial_NewsDocs/45931_OMATEK_VENTURES_PLC-_YEAR_END_-_FINANCIAL_STATEMENT_FOR_2025_FINANCIAL_STATEMENTS_JANUARY_2026.pdf", confidence: "90%", date: "01/2026" },
                    { metric: "Admin Expenses FY 2023 (₦64.01M)", source: "Omatek FY 2025 Unaudited Financials", sourceUrl: "https://doclib.ngxgroup.com/Financial_NewsDocs/45931_OMATEK_VENTURES_PLC-_YEAR_END_-_FINANCIAL_STATEMENT_FOR_2025_FINANCIAL_STATEMENTS_JANUARY_2026.pdf", confidence: "88%", date: "01/2026" },
                  ].map((row, i) => {
                    const p = getConfidencePill(row.confidence)
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-[14px] text-black font-['Figtree:Medium',sans-serif]">{row.metric}</td>
                        <td className="px-6 py-4 text-[14px] text-gray-600"><a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-black transition-colors">{row.source}</a></td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-block px-2 py-1 rounded-full text-[12px] ${p.classes}`}>{p.label}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">{row.date}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Financial Health */}
        {activeTab === "financialHealth" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-5 max-w-2xl">
              <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 flex flex-col gap-3">
                <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Total Debt</p>
                <p className="font-['Figtree:Medium',sans-serif] font-medium text-[28px] text-black leading-tight">₦1.009B</p>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[12px] font-['Figtree:Medium',sans-serif] font-medium text-[#667085]">Short-term borrowings</span>
                  <a href="https://doclib.ngxgroup.com/Financial_NewsDocs/45931_OMATEK_VENTURES_PLC-_YEAR_END_-_FINANCIAL_STATEMENT_FOR_2025_FINANCIAL_STATEMENTS_JANUARY_2026.pdf" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#98a2b3] underline underline-offset-2 hover:text-[#667085] transition-colors">FY 2025 · Unaudited financials</a>
                </div>
              </div>
              <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 flex flex-col gap-3">
                <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Long-term Debt Paid Off</p>
                <p className="font-['Figtree:Medium',sans-serif] font-medium text-[28px] text-black leading-tight">₦0</p>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1">
                    <svg className="size-3.5 shrink-0 text-[#027a48]" viewBox="0 0 14 14" fill="none">
                      <path d="M7 11V3M7 3L3 7M7 3L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[12px] font-['Figtree:Medium',sans-serif] font-medium text-[#027a48]">Fully settled</span>
                  </div>
                  <a href="https://doclib.ngxgroup.com/Financial_NewsDocs/45931_OMATEK_VENTURES_PLC-_YEAR_END_-_FINANCIAL_STATEMENT_FOR_2025_FINANCIAL_STATEMENTS_JANUARY_2026.pdf" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#98a2b3] underline underline-offset-2 hover:text-[#667085] transition-colors">BOI & First Bank loans · FY 2025</a>
                </div>
              </div>
            </div>
            <div className="border border-[#eaecf0] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Metric", "Extracted From", "AI Confidence", "Extraction Date"].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { metric: "Short-term Borrowings (₦1.009B)", source: "Omatek FY 2025 Unaudited Financials", sourceUrl: "https://doclib.ngxgroup.com/Financial_NewsDocs/45931_OMATEK_VENTURES_PLC-_YEAR_END_-_FINANCIAL_STATEMENT_FOR_2025_FINANCIAL_STATEMENTS_JANUARY_2026.pdf", confidence: "95%", date: "01/2026" },
                    { metric: "Long-term Loans (₦0, fully settled)", source: "Omatek FY 2025 Unaudited Financials", sourceUrl: "https://doclib.ngxgroup.com/Financial_NewsDocs/45931_OMATEK_VENTURES_PLC-_YEAR_END_-_FINANCIAL_STATEMENT_FOR_2025_FINANCIAL_STATEMENTS_JANUARY_2026.pdf", confidence: "97%", date: "01/2026" },
                    { metric: "Trade & Other Payables (₦3.47B)", source: "Omatek FY 2025 Unaudited Financials", sourceUrl: "https://doclib.ngxgroup.com/Financial_NewsDocs/45931_OMATEK_VENTURES_PLC-_YEAR_END_-_FINANCIAL_STATEMENT_FOR_2025_FINANCIAL_STATEMENTS_JANUARY_2026.pdf", confidence: "93%", date: "01/2026" },
                    { metric: "Accrued Expenses (₦2.76B)", source: "Omatek FY 2025 Unaudited Financials", sourceUrl: "https://doclib.ngxgroup.com/Financial_NewsDocs/45931_OMATEK_VENTURES_PLC-_YEAR_END_-_FINANCIAL_STATEMENT_FOR_2025_FINANCIAL_STATEMENTS_JANUARY_2026.pdf", confidence: "92%", date: "01/2026" },
                    { metric: "Total Liabilities (₦5.1B)", source: "Omatek FY 2025 Unaudited Financials", sourceUrl: "https://doclib.ngxgroup.com/Financial_NewsDocs/45931_OMATEK_VENTURES_PLC-_YEAR_END_-_FINANCIAL_STATEMENT_FOR_2025_FINANCIAL_STATEMENTS_JANUARY_2026.pdf", confidence: "94%", date: "01/2026" },
                  ].map((row, i) => {
                    const p = getConfidencePill(row.confidence)
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-[14px] text-black font-['Figtree:Medium',sans-serif]">{row.metric}</td>
                        <td className="px-6 py-4 text-[14px] text-gray-600"><a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-black transition-colors">{row.source}</a></td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-block px-2 py-1 rounded-full text-[12px] ${p.classes}`}>{p.label}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">{row.date}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
