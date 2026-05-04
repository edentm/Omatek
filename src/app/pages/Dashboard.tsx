import { useState, useEffect, useRef } from "react";
import { getDashboardMetrics, getDashboardCharts, getDocuments, getReports, getReport, getStockData } from "../../api";
import { useDocumentContext } from "../../contexts/DocumentContext";

type PlatformMetrics = {
  totalDocuments?: number
  totalReports?: number
  anomalyCount?: number
  totalAnomaliesDetected?: number
}

type TrendPoint = { date: string; score: number; documentName: string }
type MetricPoint = { date: string; value: string; documentName: string }

// Data extracted from a specific selected document's report
type DocFinancials = {
  revenue: string | null
  expenses: string | null
  healthScore: number | null
  healthRating: string | null
  revenuePts: { label: string; value: number }[]
  expensePts: { label: string; value: number }[]
  healthPts: { label: string; value: number }[]
}

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

// Shown in every financial card when no document is selected
function SelectDocState({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-2 py-1">
      <div className="flex items-center gap-2">
        <svg className="size-5 text-[#d0d5dd] shrink-0" fill="none" viewBox="0 0 20 20">
          <path d="M4 6h12M4 10h12M4 14h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <p className="text-[22px] font-medium text-[#d0d5dd] leading-none">—</p>
      </div>
      <p className="text-[11px] text-[#98a2b3]">Select a document to load {label}</p>
    </div>
  )
}

// Shown when doc is selected but no data extracted
function NoDataState({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[22px] font-medium text-[#d0d5dd]">—</p>
      <p className="text-[11px] text-[#98a2b3]">{label} not found in report</p>
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
  if (points.length < 2) return null

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
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

  // Platform-level (always loaded, not document-specific)
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics>({})
  const [platformLoading, setPlatformLoading] = useState(true)
  const [stockData, setStockData] = useState<{ sharePrice: number | null; marketCap: number | null; source: string; timestamp: number | null }>({
    sharePrice: null, marketCap: null, source: "loading", timestamp: null
  })

  // Global chart data (for filtering by selected doc)
  const [allRevenueTrend, setAllRevenueTrend] = useState<MetricPoint[]>([])
  const [allExpenseTrend, setAllExpenseTrend] = useState<MetricPoint[]>([])
  const [allHealthTrend, setAllHealthTrend] = useState<TrendPoint[]>([])
  const [trendSummary, setTrendSummary] = useState<{ trend: string; averageHealthScore: number } | null>(null)

  // Document-specific financials (null = not yet loaded for this doc)
  const [docFinancials, setDocFinancials] = useState<DocFinancials | null>(null)
  const [docLoading, setDocLoading] = useState(false)

  // Document list for dropdown
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

  // Load platform data on mount (stock, global metrics, document list, chart data for later filtering)
  useEffect(() => {
    getDashboardMetrics()
      .then((m: unknown) => setPlatformMetrics(m as PlatformMetrics))
      .catch(() => {})
      .finally(() => setPlatformLoading(false))

    getDashboardCharts()
      .then((data: unknown) => {
        const d = data as Record<string, unknown>
        setAllHealthTrend((d.healthScores ?? []) as TrendPoint[])
        setAllRevenueTrend((d.revenueTrend ?? []) as MetricPoint[])
        setAllExpenseTrend((d.expenseTrend ?? []) as MetricPoint[])
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

  // When active document changes, load that document's full report data
  useEffect(() => {
    if (!activeDocument) {
      setDocFinancials(null)
      return
    }

    setDocLoading(true)
    setDocFinancials(null)

    // Step 1: find the report ID for this document from the list endpoint
    getReports()
      .then(async (data: unknown) => {
        const reports = data as Record<string, unknown>[]
        // camelCase middleware converts document_id → documentId
        const listItem = reports.find(
          r => Number(r.documentId ?? r.document_id) === activeDocument.id
        )

        if (!listItem) {
          setDocFinancials({
            revenue: null, expenses: null, healthScore: null, healthRating: null,
            revenuePts: [], expensePts: [], healthPts: [],
          })
          return
        }

        // Step 2: fetch full report to get keyMetrics (not in list response)
        const full = await getReport(Number(listItem.id)) as Record<string, unknown>

        // keyMetrics comes back camelCase from middleware: { totalRevenue, totalExpenses, ... }
        // but actual keys depend on what Claude extracted — try both cases
        const km = (full.keyMetrics ?? full.key_metrics ?? {}) as Record<string, unknown>
        const rev = km.totalRevenue ?? km.total_revenue ?? km.revenue ?? km.Revenue
          ?? km["Total Revenue"] ?? km["total revenue"]
        const exp = km.totalExpenses ?? km.total_expenses ?? km.expenses ?? km.Expenses
          ?? km["Total Expenses"] ?? km["total expenses"]

        const healthScore = full.healthScore != null ? Number(full.healthScore)
          : full.health_score != null ? Number(full.health_score) : null
        const healthRating = (full.healthRating ?? full.health_rating)
          ? String(full.healthRating ?? full.health_rating) : null

        // Filter global chart trend to only this document's points
        const docName = activeDocument.name
        const revPts = allRevenueTrend
          .filter(p => p.documentName === docName)
          .map(p => ({ label: p.date, value: parseVal(p.value) }))
        const expPts = allExpenseTrend
          .filter(p => p.documentName === docName)
          .map(p => ({ label: p.date, value: parseVal(p.value) }))
        const healthPts = allHealthTrend
          .filter(p => p.documentName === docName)
          .map(p => ({ label: p.date, value: p.score }))

        // Fall back to single-point from the report if no trend match
        const finalRevPts = revPts.length > 0 ? revPts
          : rev != null ? [{ label: docName, value: parseVal(String(rev)) }] : []
        const finalExpPts = expPts.length > 0 ? expPts
          : exp != null ? [{ label: docName, value: parseVal(String(exp)) }] : []
        const finalHealthPts = healthPts.length > 0 ? healthPts
          : healthScore != null ? [{ label: docName, value: healthScore }] : []

        setDocFinancials({
          revenue: rev != null ? String(rev) : null,
          expenses: exp != null ? String(exp) : null,
          healthScore,
          healthRating,
          revenuePts: finalRevPts,
          expensePts: finalExpPts,
          healthPts: finalHealthPts,
        })
      })
      .catch(() => {
        setDocFinancials({
          revenue: null, expenses: null, healthScore: null, healthRating: null,
          revenuePts: [], expensePts: [], healthPts: [],
        })
      })
      .finally(() => setDocLoading(false))
  }, [activeDocument, allRevenueTrend, allExpenseTrend, allHealthTrend])

  const stockTimestamp = stockData.timestamp
    ? new Date(stockData.timestamp * 1000).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : null

  const docSourceDate = activeDocument
    ? new Date(activeDocument.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : ""

  const healthColor = docFinancials?.healthScore != null
    ? (docFinancials.healthScore >= 70 ? "#027a48" : docFinancials.healthScore >= 40 ? "#dc6803" : "#b42318")
    : "#d0d5dd"

  const trendBadge = trendSummary?.trend === "improving"
    ? { label: "Improving", color: "#027a48", bg: "#ecfdf3" }
    : trendSummary?.trend === "declining"
    ? { label: "Declining", color: "#b42318", bg: "#fef3f2" }
    : { label: "Stable", color: "#344054", bg: "#f2f4f7" }

  return (
    <div className="bg-white h-full w-full p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 gap-4">
        <div className="flex flex-col gap-[4px]">
          <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">
            Welcome, {firstName}
          </h1>
          <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-[#475467]">
            Select a document to load its financial insights.
          </p>
        </div>

        {/* Document selector dropdown */}
        <div className="relative shrink-0" ref={docDropdownRef}>
          <button
            onClick={() => setDocDropdownOpen(o => !o)}
            disabled={documents.length === 0}
            className={`flex items-center gap-2 h-[40px] px-4 border rounded-[10px] text-[13px] transition-colors min-w-[240px] ${
              activeDocument
                ? "border-[#144430] bg-[#f0f9f4] text-[#144430]"
                : "border-[#d0d5dd] bg-white text-[#667085] hover:bg-gray-50"
            } disabled:opacity-50`}
          >
            <svg className="size-4 shrink-0" fill="none" viewBox="0 0 20 20">
              <path d="M4 6h12M4 10h12M4 14h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="flex-1 text-left truncate">
              {documents.length === 0
                ? "No documents uploaded"
                : activeDocument
                ? activeDocument.name
                : "Select a document…"}
            </span>
            {docLoading ? (
              <svg className="size-4 animate-spin shrink-0" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="25 50"/>
              </svg>
            ) : (
              <svg className={`size-4 shrink-0 transition-transform ${docDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 20 20">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          {docDropdownOpen && (
            <div className="absolute top-[44px] right-0 z-50 bg-white border border-[#d0d5dd] rounded-[12px] shadow-xl min-w-[300px] overflow-hidden">
              {activeDocument && (
                <div className="border-b border-[#eaecf0]">
                  <button
                    onClick={() => { setActiveDocument(null); setDocDropdownOpen(false) }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-left text-[12px] text-[#b42318]"
                  >
                    <svg className="size-3.5" fill="none" viewBox="0 0 16 16">
                      <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Clear selection
                  </button>
                </div>
              )}
              <div className="max-h-[260px] overflow-y-auto py-1">
                {documents.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setActiveDocument({ id: doc.id, name: doc.name, uploadedAt: doc.uploadedAt })
                      setDocDropdownOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left ${
                      activeDocument?.id === doc.id ? "bg-[#f0f9f4]" : ""
                    }`}
                  >
                    <div className={`size-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      activeDocument?.id === doc.id ? "border-[#144430] bg-[#144430]" : "border-[#d0d5dd]"
                    }`}>
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

      {/* No-document banner */}
      {!activeDocument && !docLoading && (
        <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-[#f9fafb] border border-[#eaecf0] rounded-[12px]">
          <svg className="size-5 text-[#667085] shrink-0" fill="none" viewBox="0 0 20 20">
            <path d="M10 18.333A8.333 8.333 0 1 0 10 1.667a8.333 8.333 0 0 0 0 16.666ZM10 6.667v3.333M10 13.333h.008" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-[13px] text-[#475467]">
            <span className="font-semibold text-[#344054]">No document selected.</span> Choose a document from the dropdown above — Revenue, Expenses, Health Score, and Trends will all populate from that document's analysis.
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">

        {/* Revenue */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-5 flex flex-col gap-3">
          <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Revenue</p>
          {!activeDocument ? (
            <SelectDocState label="revenue" />
          ) : docLoading ? (
            <div className="h-8 w-24 bg-[#f2f4f7] rounded animate-pulse" />
          ) : docFinancials?.revenue ? (
            <>
              <p className="font-['Figtree:Medium',sans-serif] font-medium text-[24px] text-black leading-tight">{docFinancials.revenue}</p>
              <div className="flex items-center gap-1">
                <svg className="size-3.5 shrink-0 text-[#027a48]" viewBox="0 0 14 14" fill="none">
                  <path d="M7 11V3M7 3L3 7M7 3L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-[12px] font-medium text-[#027a48]">From AI analysis</span>
              </div>
              <SourceTag name={activeDocument.name} date={docSourceDate} />
            </>
          ) : (
            <NoDataState label="Revenue" />
          )}
        </div>

        {/* Expenses */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-5 flex flex-col gap-3">
          <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Expenses</p>
          {!activeDocument ? (
            <SelectDocState label="expenses" />
          ) : docLoading ? (
            <div className="h-8 w-24 bg-[#f2f4f7] rounded animate-pulse" />
          ) : docFinancials?.expenses ? (
            <>
              <p className="font-['Figtree:Medium',sans-serif] font-medium text-[24px] text-black leading-tight">{docFinancials.expenses}</p>
              <div className="flex items-center gap-1">
                <svg className="size-3.5 shrink-0 text-[#b42318]" viewBox="0 0 14 14" fill="none">
                  <path d="M7 3V11M7 11L3 7M7 11L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-[12px] font-medium text-[#b42318]">From AI analysis</span>
              </div>
              <SourceTag name={activeDocument.name} date={docSourceDate} />
            </>
          ) : (
            <NoDataState label="Expenses" />
          )}
        </div>

        {/* Share Price — NGX live */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-5 flex flex-col gap-3">
          <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Share Price</p>
          {stockData.source === "loading" ? (
            <p className="text-[24px] font-medium text-[#d0d5dd]">…</p>
          ) : stockData.sharePrice != null ? (
            <>
              <p className="font-['Figtree:Medium',sans-serif] font-medium text-[24px] text-black leading-tight">₦{stockData.sharePrice.toFixed(2)}</p>
              <span className="text-[12px] font-medium text-[#027a48]">Live NGX price</span>
              {stockTimestamp && <SourceTag name="NGX (OMATEK)" date={stockTimestamp} />}
            </>
          ) : (
            <>
              <p className="text-[24px] font-medium text-[#d0d5dd]">—</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fff8e1] border border-[#f5c518] text-[10px] font-semibold text-[#b45309]">
                Trading Suspended · NGX
              </span>
            </>
          )}
        </div>

        {/* Market Cap — NGX live */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-5 flex flex-col gap-3">
          <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">Market Cap</p>
          {stockData.source === "loading" ? (
            <p className="text-[24px] font-medium text-[#d0d5dd]">…</p>
          ) : stockData.marketCap != null ? (
            <>
              <p className="font-['Figtree:Medium',sans-serif] font-medium text-[24px] text-black leading-tight">{fmt(stockData.marketCap)}</p>
              <span className="text-[12px] text-[#667085]">{platformMetrics.totalDocuments ?? 0} docs · {platformMetrics.totalReports ?? 0} reports</span>
              {stockTimestamp && <SourceTag name="NGX (OMATEK)" date={stockTimestamp} />}
            </>
          ) : (
            <>
              <p className="text-[24px] font-medium text-[#d0d5dd]">—</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fff8e1] border border-[#f5c518] text-[10px] font-semibold text-[#b45309]">
                Trading Suspended · NGX
              </span>
            </>
          )}
        </div>

      </div>

      {/* Row 2: Financial Health Chart + Platform Summary */}
      <div className="grid grid-cols-2 gap-6 mb-6">

        {/* Financial Health Score — document-gated */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <p className="font-['Figtree:Medium',sans-serif] font-medium text-[16px] text-black">Financial Health Score</p>
            {activeDocument && trendSummary && (
              <span className="text-[11px] font-semibold px-2 py-1 rounded-full" style={{ color: trendBadge.color, background: trendBadge.bg }}>
                {trendBadge.label}
              </span>
            )}
          </div>

          {!activeDocument ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <svg className="size-8 text-[#d0d5dd]" fill="none" viewBox="0 0 24 24">
                <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-[13px] text-[#98a2b3]">Select a document to view its health score</p>
            </div>
          ) : docLoading ? (
            <div className="flex flex-col gap-3 py-4">
              <div className="h-14 w-24 bg-[#f2f4f7] rounded animate-pulse" />
              <div className="h-2.5 w-full bg-[#f2f4f7] rounded animate-pulse" />
            </div>
          ) : docFinancials?.healthScore != null ? (
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-end gap-2">
                <span className="text-[56px] font-['Figtree:Medium',sans-serif] font-medium leading-none" style={{ color: healthColor }}>
                  {docFinancials.healthScore}
                </span>
                <span className="text-[18px] text-[#667085] mb-1">/100</span>
                {docFinancials.healthRating && (
                  <span className="text-[13px] font-semibold mb-1 ml-2" style={{ color: healthColor }}>{docFinancials.healthRating}</span>
                )}
              </div>
              <div className="w-full bg-[#eaecf0] rounded-full h-2.5">
                <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${docFinancials.healthScore}%`, background: healthColor }} />
              </div>
              <SourceTag name={activeDocument.name} date={docSourceDate} />
              {docFinancials.healthPts.length >= 2 ? (
                <div className="flex-1 min-h-[100px] mt-2">
                  <p className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider mb-2">Score History</p>
                  <MiniLineChart points={docFinancials.healthPts} color={healthColor} height={90} />
                </div>
              ) : (
                <p className="text-[12px] text-[#98a2b3]">Upload more documents to see score history</p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-[13px] text-[#98a2b3]">Health score not found in this document's report</p>
            </div>
          )}
        </div>

        {/* Platform Summary — always shown */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 flex flex-col gap-4">
          <p className="font-['Figtree:Medium',sans-serif] font-medium text-[16px] text-black">Platform Summary</p>
          {platformLoading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-[#f2f4f7] rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="flex flex-col gap-0 mt-2">
              {[
                { label: "Total Documents Uploaded", value: platformMetrics.totalDocuments ?? 0 },
                { label: "Total Reports Generated", value: platformMetrics.totalReports ?? 0 },
                { label: "Anomalies Flagged", value: platformMetrics.totalAnomaliesDetected ?? platformMetrics.anomalyCount ?? 0 },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-4 border-b border-[#eaecf0] last:border-0">
                  <span className="text-[14px] text-[#667085]">{item.label}</span>
                  <span className="text-[28px] font-['Figtree:Medium',sans-serif] font-medium text-black">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Revenue Trend + Expense Trend — document-gated */}
      <div className="grid grid-cols-2 gap-6">

        {/* Revenue Trend */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <p className="font-['Figtree:Medium',sans-serif] font-medium text-[16px] text-black">Revenue Trend</p>
            {docFinancials?.revenuePts && docFinancials.revenuePts.length > 0 && (
              <span className="text-[13px] font-semibold text-[#027a48]">
                {fmt(docFinancials.revenuePts[docFinancials.revenuePts.length - 1].value)}
              </span>
            )}
          </div>
          <div className="flex-1 min-h-[140px] flex flex-col justify-center">
            {!activeDocument ? (
              <div className="flex flex-col items-center justify-center gap-2 h-full">
                <svg className="size-7 text-[#d0d5dd]" fill="none" viewBox="0 0 24 24">
                  <path d="M3 17l4-8 4 4 4-6 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-[13px] text-[#98a2b3]">Select a document to view revenue trend</p>
              </div>
            ) : docLoading ? (
              <div className="h-[120px] bg-[#f2f4f7] rounded animate-pulse" />
            ) : (docFinancials?.revenuePts ?? []).length >= 2 ? (
              <>
                <MiniLineChart points={docFinancials!.revenuePts} color="#027a48" height={120} />
                <div className="flex justify-between mt-2">
                  {docFinancials!.revenuePts.map((p, i) => (
                    <div key={i} className="text-[9px] text-[#98a2b3] text-center truncate" style={{ flex: 1 }}>{p.label}</div>
                  ))}
                </div>
              </>
            ) : (docFinancials?.revenuePts ?? []).length === 1 ? (
              <div className="flex flex-col gap-2">
                <span className="text-[32px] font-['Figtree:Medium',sans-serif] font-medium text-black">
                  {fmt(docFinancials!.revenuePts[0].value)}
                </span>
                <SourceTag name={activeDocument!.name} date={docSourceDate} />
                <p className="text-[12px] text-[#667085]">Upload more documents to see trend over time</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-[13px] text-[#98a2b3]">No revenue data in this document's report</p>
              </div>
            )}
          </div>
        </div>

        {/* Expense Trend */}
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <p className="font-['Figtree:Medium',sans-serif] font-medium text-[16px] text-black">Expense Trend</p>
            {docFinancials?.expensePts && docFinancials.expensePts.length > 0 && (
              <span className="text-[13px] font-semibold text-[#b42318]">
                {fmt(docFinancials.expensePts[docFinancials.expensePts.length - 1].value)}
              </span>
            )}
          </div>
          <div className="flex-1 min-h-[140px] flex flex-col justify-center">
            {!activeDocument ? (
              <div className="flex flex-col items-center justify-center gap-2 h-full">
                <svg className="size-7 text-[#d0d5dd]" fill="none" viewBox="0 0 24 24">
                  <path d="M3 17l4-8 4 4 4-6 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-[13px] text-[#98a2b3]">Select a document to view expense trend</p>
              </div>
            ) : docLoading ? (
              <div className="h-[120px] bg-[#f2f4f7] rounded animate-pulse" />
            ) : (docFinancials?.expensePts ?? []).length >= 2 ? (
              <>
                <MiniLineChart points={docFinancials!.expensePts} color="#b42318" height={120} />
                <div className="flex justify-between mt-2">
                  {docFinancials!.expensePts.map((p, i) => (
                    <div key={i} className="text-[9px] text-[#98a2b3] text-center truncate" style={{ flex: 1 }}>{p.label}</div>
                  ))}
                </div>
              </>
            ) : (docFinancials?.expensePts ?? []).length === 1 ? (
              <div className="flex flex-col gap-2">
                <span className="text-[32px] font-['Figtree:Medium',sans-serif] font-medium text-black">
                  {fmt(docFinancials!.expensePts[0].value)}
                </span>
                <SourceTag name={activeDocument!.name} date={docSourceDate} />
                <p className="text-[12px] text-[#667085]">Upload more documents to see trend over time</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-[13px] text-[#98a2b3]">No expense data in this document's report</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
