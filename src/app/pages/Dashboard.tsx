import { useState, useEffect, useRef } from "react";
import { getDashboardMetrics, getDashboardCharts, getDocuments, getReports, getStockData } from "../../api";
import { useDocumentContext } from "../../contexts/DocumentContext";

type Metrics = {
  totalDocuments?: number
  totalReports?: number
  latestHealthScore?: number
  anomalyCount?: number
}

type TrendPoint = { date: string; score: number; documentName: string }
type MetricPoint = { date: string; value: string; documentName: string }

const fmt = (val?: number | null) => {
  if (val == null) return "—"
  if (val >= 1_000_000_000) return `₦${(val / 1_000_000_000).toFixed(2)}B`
  if (val >= 1_000_000) return `₦${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `₦${(val / 1_000).toFixed(0)}K`
  return `₦${val}`
}

const parseVal = (v: string): number => {
  const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ""))
  return isNaN(n) ? 0 : n
}

function SourceTag({ name, date }: { name: string; date: string }) {
  return (
    <div className="flex items-center gap-1 mt-1">
      <svg className="size-3 text-[#98a2b3] shrink-0" fill="none" viewBox="0 0 12 12">
        <path d="M2 2h8v8H2zM4 4h4M4 6h4M4 8h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
      <span className="text-[10px] text-[#98a2b3] truncate" title={`${name} · ${date}`}>
        {name.length > 18 ? name.slice(0, 18) + "…" : name} · {date}
      </span>
    </div>
  )
}

function PendingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[24px] font-['Figtree:Medium',sans-serif] font-medium text-[#d0d5dd]">—</p>
      <p className="text-[11px] text-[#98a2b3]">Pending Source Selection</p>
      <p className="text-[10px] text-[#c4c9d4]">Select a document above to load {label}</p>
    </div>
  )
}

function MiniLineChart({
  points,
  color,
  height = 80,
}: {
  points: { label: string; value: number }[]
  color: string
  height?: number
}) {
  if (points.length < 2) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[13px] text-[#98a2b3]">Not enough data points yet</p>
      </div>
    )
  }

  const vals = points.map(p => p.value)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const W = 300
  const H = height
  const pad = 12

  const x = (i: number) => pad + (i / (points.length - 1)) * (W - pad * 2)
  const y = (v: number) => H - pad - ((v - min) / range) * (H - pad * 2)

  const polyline = points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ")

  const areaPath = `M${x(0)},${y(points[0].value)} ` +
    points.slice(1).map((p, i) => `L${x(i + 1)},${y(p.value)}`).join(" ") +
    ` L${x(points.length - 1)},${H - pad} L${x(0)},${H - pad} Z`

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-${color.replace('#','')})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.value)} r="3.5" fill={color} />
          <title>{p.label}: {fmt(p.value)}</title>
        </g>
      ))}
    </svg>
  )
}

export default function Dashboard() {
  const { activeDocument, setActiveDocument } = useDocumentContext()
  const [metrics, setMetrics] = useState<Metrics>({})
  const [loading, setLoading] = useState(true)
  const [healthTrend, setHealthTrend] = useState<TrendPoint[]>([])
  const [revenueTrend, setRevenueTrend] = useState<MetricPoint[]>([])
  const [expenseTrend, setExpenseTrend] = useState<MetricPoint[]>([])
  const [trendSummary, setTrendSummary] = useState<{ trend: string; averageHealthScore: number } | null>(null)

  // Document-specific financials (null = not selected yet)
  const [docRevenue, setDocRevenue] = useState<string | null>(null)
  const [docExpenses, setDocExpenses] = useState<string | null>(null)

  // Stock data from Yahoo Finance
  const [stockData, setStockData] = useState<{ sharePrice: number | null; marketCap: number | null; source: string; timestamp: number | null }>({
    sharePrice: null, marketCap: null, source: "loading", timestamp: null
  })

  // Document selector
  const [documents, setDocuments] = useState<{ id: number; name: string; uploadedAt: string }[]>([])
  const [docDropdownOpen, setDocDropdownOpen] = useState(false)
  const docDropdownRef = useRef<HTMLDivElement>(null)

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
  const firstName = storedUser?.name?.split(" ")[0] || "User"

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (docDropdownRef.current && !docDropdownRef.current.contains(e.target as Node)) {
        setDocDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Load platform-level metrics + charts + stock on mount
  useEffect(() => {
    getDashboardMetrics()
      .then((m: unknown) => setMetrics(m as Metrics))
      .catch(() => {})
      .finally(() => setLoading(false))

    getDashboardCharts()
      .then((data: unknown) => {
        const d = data as Record<string, unknown>
        setHealthTrend((d.healthScores ?? []) as TrendPoint[])
        setRevenueTrend((d.revenueTrend ?? []) as MetricPoint[])
        setExpenseTrend((d.expenseTrend ?? []) as MetricPoint[])
        if (d.summary) {
          const s = d.summary as Record<string, unknown>
          setTrendSummary({
            trend: String(s.trend ?? "stable"),
            averageHealthScore: Number(s.averageHealthScore ?? 0),
          })
        }
      })
      .catch(() => {})

    getDocuments()
      .then((data: unknown) => {
        const docs = (data as Record<string, unknown>[]).map(d => ({
          id: d.id as number,
          name: (d.originalFilename ?? d.filename ?? `Document #${d.id}`) as string,
          uploadedAt: (d.uploadedAt ?? d.createdAt ?? "") as string,
        }))
        setDocuments(docs)
      })
      .catch(() => {})

    getStockData()
      .then((s: unknown) => {
        const sd = s as Record<string, unknown>
        setStockData({
          sharePrice: sd.sharePrice != null ? Number(sd.sharePrice) : null,
          marketCap: sd.marketCap != null ? Number(sd.marketCap) : null,
          source: String(sd.source ?? "unavailable"),
          timestamp: sd.timestamp != null ? Number(sd.timestamp) : null,
        })
      })
      .catch(() => {})
  }, [])

  // When active document changes, load its report's financials
  useEffect(() => {
    if (!activeDocument) {
      setDocRevenue(null)
      setDocExpenses(null)
      return
    }
    getReports()
      .then((data: unknown) => {
        const reports = (data as Record<string, unknown>[])
        const report = reports.find(r => r.documentId === activeDocument.id || r.document_id === activeDocument.id)
        if (report && typeof report.keyMetrics === "object" && report.keyMetrics) {
          const km = report.keyMetrics as Record<string, unknown>
          const rev = km.totalRevenue ?? km.total_revenue ?? km.revenue ?? km.Revenue
          const exp = km.totalExpenses ?? km.total_expenses ?? km.expenses ?? km.Expenses
          setDocRevenue(rev != null ? String(rev) : null)
          setDocExpenses(exp != null ? String(exp) : null)
        } else {
          setDocRevenue(null)
          setDocExpenses(null)
        }
      })
      .catch(() => {})
  }, [activeDocument])

  const stockTimestamp = stockData.timestamp
    ? new Date(stockData.timestamp * 1000).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : null

  const healthChartPoints = healthTrend.map(p => ({ label: `${p.documentName} (${p.date})`, value: p.score }))
  const revenueChartPoints = revenueTrend.map(p => ({ label: `${p.documentName} (${p.date})`, value: parseVal(p.value) }))
  const expenseChartPoints = expenseTrend.map(p => ({ label: `${p.documentName} (${p.date})`, value: parseVal(p.value) }))

  const trendBadge = trendSummary?.trend === "improving"
    ? { label: "Improving", color: "#027a48", bg: "#ecfdf3" }
    : trendSummary?.trend === "declining"
    ? { label: "Declining", color: "#b42318", bg: "#fef3f2" }
    : { label: "Stable", color: "#344054", bg: "#f2f4f7" }

  const docSourceDate = activeDocument
    ? new Date(activeDocument.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : ""

  return (
    <div className="bg-white h-full w-full p-8 overflow-y-auto">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-[4px]">
          <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">Welcome, {firstName}</h1>
          <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-black">View latest insights and complete needed tasks.</p>
        </div>

        {/* Document selector */}
        <div className="relative" ref={docDropdownRef}>
          <button
            onClick={() => setDocDropdownOpen(o => !o)}
            disabled={documents.length === 0}
            className={`flex items-center gap-2 h-[40px] px-4 border rounded-[10px] text-[13px] transition-colors min-w-[220px] ${
              activeDocument
                ? "border-[#144430] bg-[#f0f9f4] text-[#144430]"
                : "border-[#d0d5dd] bg-white text-[#667085] hover:bg-gray-50"
            } disabled:opacity-50`}
          >
            <svg className="size-4 shrink-0" fill="none" viewBox="0 0 20 20">
              <path d="M4 6h12M4 10h12M4 14h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="flex-1 text-left truncate">
              {documents.length === 0 ? "No documents" : activeDocument ? activeDocument.name : "Select source document…"}
            </span>
            <svg className={`size-4 shrink-0 transition-transform ${docDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 20 20">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {docDropdownOpen && (
            <div className="absolute top-[44px] right-0 z-50 bg-white border border-[#d0d5dd] rounded-[12px] shadow-xl min-w-[280px] overflow-hidden">
              {activeDocument && (
                <div className="border-b border-[#eaecf0]">
                  <button
                    onClick={() => { setActiveDocument(null); setDocDropdownOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left text-[12px] text-[#b42318]"
                  >
                    Clear selection (show all-time data)
                  </button>
                </div>
              )}
              <div className="max-h-[240px] overflow-y-auto py-1">
                {documents.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => { setActiveDocument({ id: doc.id, name: doc.name, uploadedAt: doc.uploadedAt }); setDocDropdownOpen(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left ${activeDocument?.id === doc.id ? "bg-[#f0f9f4]" : ""}`}
                  >
                    <div className={`size-4 rounded-full border-2 shrink-0 flex items-center justify-center ${activeDocument?.id === doc.id ? "border-[#144430] bg-[#144430]" : "border-[#d0d5dd]"}`}>
                      {activeDocument?.id === doc.id && <div className="size-1.5 rounded-full bg-white" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] text-[#344054] truncate">{doc.name}</span>
                      {doc.uploadedAt && (
                        <span className="text-[10px] text-[#98a2b3]">
                          {new Date(doc.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && <p className="text-[14px] text-[#667085] mb-4">Loading metrics…</p>}

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {/* Revenue — document-gated */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-5 flex flex-col gap-3">
          <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Revenue</p>
          {activeDocument ? (
            docRevenue ? (
              <>
                <p className="font-['Figtree:Medium',sans-serif] font-medium text-[24px] text-black leading-tight">{docRevenue}</p>
                <div className="flex items-center gap-1">
                  <svg className="size-3.5 shrink-0 text-[#027a48]" viewBox="0 0 14 14" fill="none">
                    <path d="M7 11V3M7 3L3 7M7 3L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[12px] font-medium text-[#027a48]">From AI analysis</span>
                </div>
                <SourceTag name={activeDocument.name} date={docSourceDate} />
              </>
            ) : (
              <>
                <p className="text-[24px] font-medium text-[#d0d5dd]">—</p>
                <p className="text-[11px] text-[#98a2b3]">Not found in report</p>
                <SourceTag name={activeDocument.name} date={docSourceDate} />
              </>
            )
          ) : (
            <PendingState label="revenue" />
          )}
        </div>

        {/* Expenses — document-gated */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-5 flex flex-col gap-3">
          <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Expenses</p>
          {activeDocument ? (
            docExpenses ? (
              <>
                <p className="font-['Figtree:Medium',sans-serif] font-medium text-[24px] text-black leading-tight">{docExpenses}</p>
                <div className="flex items-center gap-1">
                  <svg className="size-3.5 shrink-0 text-[#b42318]" viewBox="0 0 14 14" fill="none">
                    <path d="M7 3V11M7 11L3 7M7 11L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[12px] font-medium text-[#b42318]">From AI analysis</span>
                </div>
                <SourceTag name={activeDocument.name} date={docSourceDate} />
              </>
            ) : (
              <>
                <p className="text-[24px] font-medium text-[#d0d5dd]">—</p>
                <p className="text-[11px] text-[#98a2b3]">Not found in report</p>
                <SourceTag name={activeDocument.name} date={docSourceDate} />
              </>
            )
          ) : (
            <PendingState label="expenses" />
          )}
        </div>

        {/* Share Price — live from Yahoo Finance */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-5 flex flex-col gap-3">
          <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Share Price</p>
          {stockData.source === "loading" ? (
            <p className="text-[24px] font-medium text-[#d0d5dd]">…</p>
          ) : stockData.sharePrice != null ? (
            <>
              <p className="font-['Figtree:Medium',sans-serif] font-medium text-[24px] text-black leading-tight">₦{stockData.sharePrice.toFixed(2)}</p>
              <span className="text-[12px] font-medium text-[#027a48]">Live market price</span>
              {stockTimestamp && <SourceTag name="Yahoo Finance (OMATEK.LG)" date={stockTimestamp} />}
            </>
          ) : (
            <>
              <p className="text-[24px] font-medium text-[#d0d5dd]">—</p>
              <a href="https://afx.kwayisi.org/ngx/omatek.html" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#98a2b3] underline hover:text-[#667085]">NGX</a>
              <p className="text-[10px] text-[#c4c9d4]">Market data unavailable</p>
            </>
          )}
        </div>

        {/* Market Cap — live from Yahoo Finance */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-5 flex flex-col gap-3">
          <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Market Cap</p>
          {stockData.source === "loading" ? (
            <p className="text-[24px] font-medium text-[#d0d5dd]">…</p>
          ) : stockData.marketCap != null ? (
            <>
              <p className="font-['Figtree:Medium',sans-serif] font-medium text-[24px] text-black leading-tight">{fmt(stockData.marketCap)}</p>
              <span className="text-[12px] text-[#667085]">{metrics.totalDocuments ?? 0} docs · {metrics.totalReports ?? 0} reports</span>
              {stockTimestamp && <SourceTag name="Yahoo Finance (OMATEK.LG)" date={stockTimestamp} />}
            </>
          ) : (
            <>
              <p className="text-[24px] font-medium text-[#d0d5dd]">—</p>
              <span className="text-[12px] text-[#667085]">{metrics.totalDocuments ?? 0} docs · {metrics.totalReports ?? 0} reports</span>
              <p className="text-[10px] text-[#c4c9d4]">Market data unavailable</p>
            </>
          )}
        </div>

        {/* Financial Health */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-5 flex flex-col gap-3">
          <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Health Score</p>
          {metrics.latestHealthScore != null ? (
            <>
              <p className="font-['Figtree:Medium',sans-serif] font-medium text-[24px] text-black leading-tight">{metrics.latestHealthScore}<span className="text-[14px] text-[#667085]">/100</span></p>
              <div className="w-full bg-[#eaecf0] rounded-full h-1.5">
                <div className="h-1.5 rounded-full" style={{
                  width: `${metrics.latestHealthScore}%`,
                  background: metrics.latestHealthScore >= 70 ? "#027a48" : metrics.latestHealthScore >= 40 ? "#dc6803" : "#b42318"
                }} />
              </div>
              <p className="text-[11px] text-[#98a2b3]">Latest report</p>
            </>
          ) : (
            <PendingState label="health score" />
          )}
        </div>
      </div>

      {/* Row 1: Health Score chart + Platform Summary */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Financial Health Score */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <p className="font-['Figtree:Medium',sans-serif] font-medium text-[16px] text-black">Financial Health Score</p>
            {trendSummary && (
              <span className="text-[11px] font-semibold px-2 py-1 rounded-full" style={{ color: trendBadge.color, background: trendBadge.bg }}>
                {trendBadge.label}
              </span>
            )}
          </div>
          {metrics.latestHealthScore != null ? (
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-end gap-2">
                <span className="text-[56px] font-['Figtree:Medium',sans-serif] font-medium leading-none text-black">{metrics.latestHealthScore}</span>
                <span className="text-[18px] text-[#667085] mb-1">/100</span>
                {trendSummary && (
                  <span className="text-[13px] text-[#667085] mb-1 ml-2">avg {trendSummary.averageHealthScore.toFixed(0)}</span>
                )}
              </div>
              <div className="w-full bg-[#eaecf0] rounded-full h-2.5">
                <div className="h-2.5 rounded-full transition-all duration-700" style={{
                  width: `${metrics.latestHealthScore}%`,
                  background: metrics.latestHealthScore >= 70 ? "#027a48" : metrics.latestHealthScore >= 40 ? "#dc6803" : "#b42318"
                }} />
              </div>
              {healthChartPoints.length > 1 ? (
                <div className="flex-1 min-h-[100px]">
                  <p className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider mb-2">Score History</p>
                  <MiniLineChart
                    points={healthChartPoints}
                    color={metrics.latestHealthScore >= 70 ? "#027a48" : metrics.latestHealthScore >= 40 ? "#dc6803" : "#b42318"}
                    height={90}
                  />
                  <div className="flex justify-between mt-1">
                    {healthChartPoints.map((p, i) => (
                      <div key={i} className="text-[9px] text-[#98a2b3] text-center" style={{ flex: 1 }}>
                        {new Date(healthTrend[i]?.date ?? "").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-[#667085]">Upload more documents to see score history</p>
              )}
            </div>
          ) : (
            <p className="text-[14px] text-[#667085] mt-4">Upload a document to see health score</p>
          )}
        </div>

        {/* Platform Summary */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 flex flex-col gap-4">
          <p className="font-['Figtree:Medium',sans-serif] font-medium text-[16px] text-black">Platform Summary</p>
          <div className="flex flex-col gap-0 mt-2">
            {[
              { label: "Total Documents Uploaded", value: metrics.totalDocuments ?? 0 },
              { label: "Total Reports Generated", value: metrics.totalReports ?? 0 },
              { label: "Anomalies Flagged", value: metrics.anomalyCount ?? 0 },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-4 border-b border-[#eaecf0] last:border-0">
                <span className="text-[14px] text-[#667085]">{item.label}</span>
                <span className="text-[28px] font-['Figtree:Medium',sans-serif] font-medium text-black">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Revenue Trend + Expense Trend */}
      <div className="grid grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <p className="font-['Figtree:Medium',sans-serif] font-medium text-[16px] text-black">Revenue Trend</p>
            {revenueChartPoints.length > 0 && (
              <span className="text-[13px] font-semibold text-[#027a48]">
                {fmt(revenueChartPoints[revenueChartPoints.length - 1].value)}
              </span>
            )}
          </div>
          <div className="flex-1 min-h-[140px] flex flex-col justify-center">
            {revenueChartPoints.length >= 2 ? (
              <>
                <MiniLineChart points={revenueChartPoints} color="#027a48" height={120} />
                <div className="flex justify-between mt-2">
                  {revenueTrend.map((p, i) => (
                    <div key={i} className="text-[9px] text-[#98a2b3] text-center truncate" style={{ flex: 1 }}>{p.date}</div>
                  ))}
                </div>
              </>
            ) : revenueChartPoints.length === 1 ? (
              <div className="flex flex-col gap-2">
                <span className="text-[32px] font-['Figtree:Medium',sans-serif] font-medium text-black">{fmt(revenueChartPoints[0].value)}</span>
                <p className="text-[12px] text-[#98a2b3]">From {revenueTrend[0]?.documentName}</p>
                <p className="text-[12px] text-[#667085]">Upload more documents to see trend</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-[13px] text-[#98a2b3]">No revenue data extracted yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Expense Trend */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <p className="font-['Figtree:Medium',sans-serif] font-medium text-[16px] text-black">Expense Trend</p>
            {expenseChartPoints.length > 0 && (
              <span className="text-[13px] font-semibold text-[#b42318]">
                {fmt(expenseChartPoints[expenseChartPoints.length - 1].value)}
              </span>
            )}
          </div>
          <div className="flex-1 min-h-[140px] flex flex-col justify-center">
            {expenseChartPoints.length >= 2 ? (
              <>
                <MiniLineChart points={expenseChartPoints} color="#b42318" height={120} />
                <div className="flex justify-between mt-2">
                  {expenseTrend.map((p, i) => (
                    <div key={i} className="text-[9px] text-[#98a2b3] text-center truncate" style={{ flex: 1 }}>{p.date}</div>
                  ))}
                </div>
              </>
            ) : expenseChartPoints.length === 1 ? (
              <div className="flex flex-col gap-2">
                <span className="text-[32px] font-['Figtree:Medium',sans-serif] font-medium text-black">{fmt(expenseChartPoints[0].value)}</span>
                <p className="text-[12px] text-[#98a2b3]">From {expenseTrend[0]?.documentName}</p>
                <p className="text-[12px] text-[#667085]">Upload more documents to see trend</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-[13px] text-[#98a2b3]">No expense data extracted yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
