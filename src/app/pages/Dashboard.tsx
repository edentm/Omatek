import { useState, useEffect } from "react";
import { getDashboardMetrics } from "../../api";

type Metrics = {
  revenue?: number;
  expenses?: number;
  newClients?: number;
  sharePrice?: number;
  marketCap?: number;
  totalDocuments?: number;
  totalReports?: number;
  latestHealthScore?: number;
  anomalyCount?: number;
};

const fmt = (val?: number) => {
  if (val == null) return "—";
  if (val >= 1_000_000_000) return `₦${(val / 1_000_000_000).toFixed(2)}B`;
  if (val >= 1_000_000) return `₦${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `₦${(val / 1_000).toFixed(0)}K`;
  return `₦${val}`;
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics>({});
  const [loading, setLoading] = useState(true);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const firstName = storedUser?.name?.split(" ")[0] || "User";

  useEffect(() => {
    getDashboardMetrics()
      .then(setMetrics)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: "Revenue",
      value: fmt(metrics.revenue),
      subtext: "Latest period",
      change: metrics.revenue ? "From AI analysis" : "Upload a document",
      positive: true,
    },
    {
      label: "Expenses",
      value: fmt(metrics.expenses),
      subtext: "Latest period",
      change: metrics.expenses ? "From AI analysis" : "Upload a document",
      positive: false,
    },
    {
      label: "New Clients",
      value: metrics.newClients != null ? String(metrics.newClients) : "—",
      subtext: "From reports",
      change: metrics.newClients ? "Extracted by AI" : "Upload a document",
      positive: true,
    },
    {
      label: "Share Price",
      value: metrics.sharePrice != null ? `₦${metrics.sharePrice}` : "—",
      subtext: "NGX",
      change: metrics.sharePrice ? "From AI analysis" : "Upload a document",
      positive: true,
      sourceUrl: "https://afx.kwayisi.org/ngx/omatek.html",
    },
    {
      label: "Market Cap",
      value: fmt(metrics.marketCap),
      subtext: "NGX",
      change: `${metrics.totalDocuments ?? 0} docs · ${metrics.totalReports ?? 0} reports`,
      positive: true,
      noArrow: true,
    },
  ];

  return (
    <div className="bg-white h-full w-full p-8">
      <div className="flex flex-col gap-[8px] mb-8">
        <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">
          Welcome, {firstName}
        </h1>
        <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-black">
          View latest insights and complete needed tasks.
        </p>
      </div>

      {loading && (
        <p className="text-[14px] text-[#667085] mb-4">Loading metrics…</p>
      )}

      <div className="grid grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-[#d0d5dd] rounded-[10px] p-5 flex flex-col gap-3">
            <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">{card.label}</p>
            <p className="font-['Figtree:Medium',sans-serif] font-medium text-[24px] text-black leading-tight">{card.value}</p>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                {!card.noArrow && (
                  <svg className={`size-3.5 shrink-0 ${card.positive ? "text-[#027a48]" : "text-[#b42318]"}`} viewBox="0 0 14 14" fill="none">
                    {card.positive
                      ? <path d="M7 11V3M7 3L3 7M7 3L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      : <path d="M7 3V11M7 11L3 7M7 11L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    }
                  </svg>
                )}
                <span className={`text-[12px] font-['Figtree:Medium',sans-serif] font-medium ${card.noArrow ? "text-[#667085]" : card.positive ? "text-[#027a48]" : "text-[#b42318]"}`}>
                  {card.change}
                </span>
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

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 h-[420px] flex flex-col gap-4">
          <p className="font-['Figtree:Medium',sans-serif] font-medium text-[16px] text-black">Financial Health Score</p>
          {metrics.latestHealthScore != null ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-end gap-2">
                <span className="text-[64px] font-['Figtree:Medium',sans-serif] font-medium leading-none text-black">{metrics.latestHealthScore}</span>
                <span className="text-[20px] text-[#667085] mb-2">/100</span>
              </div>
              <div className="w-full bg-[#eaecf0] rounded-full h-3">
                <div className="h-3 rounded-full transition-all duration-700"
                  style={{
                    width: `${metrics.latestHealthScore}%`,
                    background: metrics.latestHealthScore >= 70 ? "#027a48" : metrics.latestHealthScore >= 40 ? "#dc6803" : "#b42318"
                  }}
                />
              </div>
              <p className="text-[13px] text-[#667085]">Based on latest AI analysis</p>
            </div>
          ) : (
            <p className="text-[14px] text-[#667085] mt-4">Upload a document to see health score</p>
          )}
        </div>

        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6 h-[420px] flex flex-col gap-4">
          <p className="font-['Figtree:Medium',sans-serif] font-medium text-[16px] text-black">Platform Summary</p>
          <div className="flex flex-col gap-2 mt-2">
            {[
              { label: "Total Documents Uploaded", value: metrics.totalDocuments ?? 0 },
              { label: "Total Reports Generated", value: metrics.totalReports ?? 0 },
              { label: "Anomalies Flagged", value: metrics.anomalyCount ?? 0 },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-4 border-b border-[#eaecf0]">
                <span className="text-[14px] text-[#667085]">{item.label}</span>
                <span className="text-[24px] font-['Figtree:Medium',sans-serif] font-medium text-black">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}