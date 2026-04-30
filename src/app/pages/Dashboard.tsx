import { useState, useEffect } from "react";
import { getDashboardMetrics, getDashboardCharts } from "../../api";

type Metrics = {
  revenue?: number
  expenses?: number
  newClients?: number
  sharePrice?: number
  marketCap?: number
  totalDocuments?: number
  totalReports?: number
  latestHealthScore?: number
  anomalyCount?: number
}

type TrendPoint = { date: string; score: number; documentName: string }
type MetricPoint = { date: string; value: string; documentName: string }

const fmt = (val?: number) => {
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

  // Filled area path
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
  const [metrics, setMetrics] = useState<Metrics>({})
  const [loading, setLoading] = useState(true)
  const [healthTrend, setHealthTrend] = useState<TrendPoint[]>([])
  const [revenueTrend, setRevenueTrend] = useState<MetricPoint[]>([])
  const [expenseTrend, setExpenseTrend] = useState<MetricPoint[]>([])
  const [trendSummary, setTrendSummary] = useState<{ trend: string; averageHealthScore: number } | null>(null)

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
  const firstName = storedUser?.name?.split(" ")[0] || "User"

  useEffect(() => {
    getDashboardMetrics()
      .then(setMetrics)
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
  }, [])

  const cards = [
    { label: "Revenue", value: fmt(metrics.revenue), subtext: "Latest period", change: metrics.revenue ? "From AI analysis" : "Upload a document", positive: true },
    { label: "Expenses", value: fmt(metrics.expenses), subtext: "Latest period", change: metrics.expenses ? "From AI analysis" : "Upload a document", positive: false },
    { label: "New Clients", value: metrics.newClients != null ? String(metrics.newClients) : "—", subtext: "From reports", change: metrics.newClients ? "Extracted by AI" : "Upload a document", positive: true },
    { label: "Share Price", value: metrics.sharePrice != null ? `₦${metrics.sharePrice}` : "—", subtext: "NGX", change: metrics.sharePrice ? "From AI analysis" : "Upload a document", positive: true, sourceUrl: "https://afx.kwayisi.org/ngx/omatek.html" },
    { label: "Market Cap", value: fmt(metrics.marketCap), subtext: "NGX", change: `${metrics.totalDocuments ?? 0} docs · ${metrics.totalReports ?? 0} reports`, positive: true, noArrow: true },
  ]

  const revenueChartPoints = revenueTrend.map(p => ({
    label: `${p.documentName} (${p.date})`,
    value: parseVal(p.value),
  }))

  const expenseChartPoints = expenseTrend.map(p => ({
    label: `${p.documentName} (${p.date})`,
    value: parseVal(p.value),
  }))

  const healthChartPoints = healthTrend.map(p => ({
    label: `${p.documentName} (${p.date})`,
    value: p.score,
  }))

  const trendBadge = trendSummary?.trend === "improving"
    ? { label: "Improving", color: "#027a48", bg: "#ecfdf3" }
    : trendSummary?.trend === "declining"
    ? { label: "Declining", color: "#b42318", bg: "#fef3f2" }
    : { label: "Stable", color: "#344054", bg: "#f2f4f7" }

  return (
    <div className="bg-white h-full w-full p-8 overflow-y-auto">
      <div className="flex flex-col gap-[8px] mb-8">
        <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">Welcome, {firstName}</h1>
        <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-black">View latest insights and complete needed tasks.</p>
      </div>

      {loading && <p className="text-[14px] text-[#667085] mb-4">Loading metrics…</p>}

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {cards.map((card: any) => (
          <div key={card.label} className="bg-white border border-[#d0d5dd] rounded-[10px] p-5 flex flex-col gap-3">
            <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">{card.label}</p>
            <p className="font-['Figtree:Medium',sans-serif] font-medium text-[24px] text-black leading-tight">{card.value}</p>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                {!card.noArrow && (
                  <svg className={`size-3.5 shrink-0 ${card.positive ? "text-[#027a48]" : "text-[#b42318]"}`} viewBox="0 0 14 14" fill="none">
                    {card.positive
                      ? <path d="M7 11V3M7 3L3 7M7 3L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      : <path d="M7 3V11M7 11L3 7M7 11L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>}
                  </svg>
                )}
                <span className={`text-[12px] font-['Figtree:Medium',sans-serif] font-medium ${card.noArrow ? "text-[#667085]" : card.positive ? "text-[#027a48]" : "text-[#b42318]"}`}>{card.change}</span>
              </div>
              {card.sourceUrl ? (
                <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#98a2b3] underline underline-offset-2 hover:text-[#667085] transition-colors">{card.subtext}</a>
              ) : (
                <p className="text-[11px] text-[#98a2b3]">{card.subtext}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Health Score + Platform Summary */}
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
                    <div key={i} className="text-[9px] text-[#98a2b3] text-center truncate" style={{ flex: 1 }}>
                      {p.date}
                    </div>
                  ))}
                </div>
              </>
            ) : revenueChartPoints.length === 1 ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-[32px] font-['Figtree:Medium',sans-serif] font-medium text-black">{fmt(revenueChartPoints[0].value)}</span>
                </div>
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
                    <div key={i} className="text-[9px] text-[#98a2b3] text-center truncate" style={{ flex: 1 }}>
                      {p.date}
                    </div>
                  ))}
                </div>
              </>
            ) : expenseChartPoints.length === 1 ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-[32px] font-['Figtree:Medium',sans-serif] font-medium text-black">{fmt(expenseChartPoints[0].value)}</span>
                </div>
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
