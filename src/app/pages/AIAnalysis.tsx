import { useState } from "react";
import FilterButton from "../components/FilterButton";

export default function AIAnalysis() {
  const [activeTab, setActiveTab] = useState<'keyMetrics' | 'discrepancies' | 'ingestion'>('discrepancies');
  const [activeMetricsTab, setActiveMetricsTab] = useState<'profit' | 'market' | 'operations' | 'debt'>('profit');

  // Filter state
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [issueLevelFilter, setIssueLevelFilter] = useState<string[]>([]);
  const [dateFlaggedFrom, setDateFlaggedFrom] = useState("");
  const [dateFlaggedTo, setDateFlaggedTo] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState<string[]>([]);

  const toggleFilter = (name: string) => setOpenFilter(prev => prev === name ? null : name);

  const parseDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    return new Date(`${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`);
  };

  const mockIssues = [
    { 
      title: "Q1 2026 Financial Summary", 
      id: "FR-0001-2026", 
      level: "High", 
      dateFlagged: "03/31/2026", 
      type: "Quarterly Report", 
      aiConfidence: "95%" 
    },
    { 
      title: "Annual Budget Forecast", 
      id: "FR-0002-2026", 
      level: "Warning", 
      dateFlagged: "03/28/2026", 
      type: "Budget Analysis", 
      aiConfidence: "87%" 
    },
    { 
      title: "Expense Reconciliation Report", 
      id: "FR-0003-2026", 
      level: "Warning", 
      dateFlagged: "03/25/2026", 
      type: "Expense Report", 
      aiConfidence: "92%" 
    },
    { 
      title: "Revenue Analysis - March", 
      id: "FR-0004-2026", 
      level: "High", 
      dateFlagged: "03/30/2026", 
      type: "Revenue Report", 
      aiConfidence: "98%" 
    },
  ];

  const getConfidencePill = (confidence: string) => {
    const value = parseInt(confidence);
    if (value >= 90) return { label: `${confidence} - Very High`, classes: "bg-[#ecfdf3] text-[#027a48]" };
    if (value >= 80) return { label: `${confidence} - High`, classes: "bg-[#e8f0fe] text-[#1a56db]" };
    if (value >= 60) return { label: `${confidence} - Moderate`, classes: "bg-[#fef0c7] text-[#dc6803]" };
    return { label: `${confidence} - Low`, classes: "bg-[#fef3f2] text-[#b42318]" };
  };

  const mockIngestionData = [
    {
      name: "Financial Report 2026",
      id: "DOC-0001",
      numberOfDocs: "12",
      uploadDate: "03/31/2026",
      uploadedBy: "Oladosu Teyibo",
      role: "Administrator"
    },
    {
      name: "Annual Budget Proposal",
      id: "DOC-0002",
      numberOfDocs: "8",
      uploadDate: "03/28/2026",
      uploadedBy: "Oladosu Teyibo",
      role: "Administrator"
    },
    {
      name: "Expense Report - March & April",
      id: "DOC-0003",
      numberOfDocs: "15",
      uploadDate: "03/25/2026",
      uploadedBy: "Oladosu Teyibo",
      role: "Administrator"
    },
    {
      name: "Initial Upload - All Existing Docs",
      id: "DOC-0004",
      numberOfDocs: "24",
      uploadDate: "03/30/2026",
      uploadedBy: "Oladosu Teyibo",
      role: "Administrator"
    },
   
  ];

  return (
    <div className="bg-white h-full w-full p-8">
      <div className="flex justify-between items-start mb-8">
        <div className="flex flex-col gap-[8px]">
          <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">
            AI Analysis
          </h1>
          <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-black">Extract key findings from uploaded documents with AI</p>
        </div>

        <button className="bg-white border-[#d0d5dd] border-[0.8px] border-solid h-[43px] rounded-[10px] px-6 flex items-center gap-2 hover:bg-gray-50 transition-colors">
          <svg className="size-5" fill="none" viewBox="0 0 20 20">
            <path
              d="M10 4.16667V15.8333M4.16667 10H15.8333"
              stroke="#344054"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="font-['Figtree:Regular',sans-serif] font-normal text-[14px] text-[#344054] whitespace-nowrap">
            Upload & Analyze Documents
          </p>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#e8eef7] mb-6">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('keyMetrics')}
            className={`font-['Public_Sans:Medium',sans-serif] font-medium text-[14px] text-black pb-3 px-2 ${
              activeTab === 'keyMetrics' ? 'border-b-[2.4px] border-black' : ''
            }`}
          >
            Key Metrics
          </button>
          <button 
            onClick={() => setActiveTab('discrepancies')}
            className={`font-['Public_Sans:Medium',sans-serif] font-medium text-[14px] text-black pb-3 px-2 ${
              activeTab === 'discrepancies' ? 'border-b-[2.4px] border-black' : ''
            }`}
          >
            Discrepancies/ Issues
          </button>
          <button 
            onClick={() => setActiveTab('ingestion')}
            className={`font-['Figtree:Medium',sans-serif] font-medium text-[14px] text-black pb-3 px-2 ${
              activeTab === 'ingestion' ? 'border-b-[2.4px] border-black' : ''
            }`}
          >
            Ingestion Log
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'discrepancies' ? (
        <div>
          {/* Filters */}
          <div className="flex gap-2 mb-6">
            <FilterButton
              label="Issue Level"
              type="checkbox"
              options={[
                { value: "High", label: "High" },
                { value: "Warning", label: "Warning" },
              ]}
              selected={issueLevelFilter}
              onChange={setIssueLevelFilter}
              isOpen={openFilter === "issueLevel"}
              onToggle={() => toggleFilter("issueLevel")}
              onClose={() => setOpenFilter(null)}
            />
            <FilterButton
              label="Date"
              type="daterange"
              from={dateFlaggedFrom}
              to={dateFlaggedTo}
              onFromChange={setDateFlaggedFrom}
              onToChange={setDateFlaggedTo}
              isOpen={openFilter === "date"}
              onToggle={() => toggleFilter("date")}
              onClose={() => setOpenFilter(null)}
            />
            <FilterButton
              label="AI Confidence"
              type="checkbox"
              options={[
                { value: "veryHigh", label: "Very High (90% - 100%)" },
                { value: "high", label: "High (80% - 89%)" },
                { value: "moderate", label: "Moderate (60% - 79%)" },
                { value: "low", label: "Low (Below 60%)" },
              ]}
              selected={confidenceFilter}
              onChange={setConfidenceFilter}
              isOpen={openFilter === "confidence"}
              onToggle={() => toggleFilter("confidence")}
              onClose={() => setOpenFilter(null)}
            />
          </div>

          {/* Table */}
          <div className="border border-[#eaecf0] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AI Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Flagged
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockIssues.filter(issue => {
                  if (issueLevelFilter.length > 0 && !issueLevelFilter.includes(issue.level)) return false;
                  if (dateFlaggedFrom || dateFlaggedTo) {
                    const d = parseDate(issue.dateFlagged);
                    if (d && dateFlaggedFrom && d < new Date(dateFlaggedFrom)) return false;
                    if (d && dateFlaggedTo && d > new Date(dateFlaggedTo)) return false;
                  }
                  if (confidenceFilter.length > 0) {
                    const v = parseInt(issue.aiConfidence);
                    const band = v >= 90 ? "veryHigh" : v >= 80 ? "high" : v >= 60 ? "moderate" : "low";
                    if (!confidenceFilter.includes(band)) return false;
                  }
                  return true;
                }).map((issue, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-['Figtree:Medium',sans-serif] text-[14px] text-black">
                        {issue.title}
                      </div>
                      
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-['Inter:Regular',sans-serif] ${
                        issue.level === "High"
                          ? "bg-[#fef3f2] text-[#b42318]"
                          : "bg-[#fef0c7] text-[#dc6803]"
                      }`}>
                        {issue.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => { const p = getConfidencePill(issue.aiConfidence); return (
                        <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-['Inter:Regular',sans-serif] ${p.classes}`}>
                          {p.label}
                        </span>
                      ); })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                      {issue.dateFlagged}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'ingestion' ? (
        <div>
          {/* Ingestion Log Table */}
          <div className="border border-[#eaecf0] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingestion Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Number of Docs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockIngestionData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-['Figtree:Medium',sans-serif] text-[14px] text-black">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                      {item.numberOfDocs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                      {item.uploadDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-['Figtree:Medium',sans-serif] text-[14px] text-black">
                        {item.uploadedBy}
                      </div>
                      <div className="text-[12px] text-gray-500">{item.role}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="w-full">
          {/* Sub-navigation */}
          <div className="border-b border-[#e8eef7] mb-6">
            <div className="flex gap-4">
              {(['profit', 'market', 'operations', 'debt'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveMetricsTab(tab)}
                  className={`font-['Figtree:Medium',sans-serif] font-medium text-[14px] text-black pb-3 px-2 capitalize ${
                    activeMetricsTab === tab ? 'border-b-[2.4px] border-black' : ''
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="w-full">

            {activeMetricsTab === 'profit' && (
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
                        {["Metric","Extracted From","AI Confidence","Extraction Date"].map(h => (
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
                        const p = getConfidencePill(row.confidence);
                        return (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-[14px] text-black font-['Figtree:Medium',sans-serif]">{row.metric}</td>
                            <td className="px-6 py-4 text-[14px] text-gray-600"><a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-black transition-colors">{row.source}</a></td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-block px-2 py-1 rounded-full text-[12px] ${p.classes}`}>{p.label}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">{row.date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeMetricsTab === 'market' && (
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
                        {["Metric","Extracted From","AI Confidence","Extraction Date"].map(h => (
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
                        const p = getConfidencePill(row.confidence);
                        return (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-[14px] text-black font-['Figtree:Medium',sans-serif]">{row.metric}</td>
                            <td className="px-6 py-4 text-[14px] text-gray-600"><a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-black transition-colors">{row.source}</a></td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-block px-2 py-1 rounded-full text-[12px] ${p.classes}`}>{p.label}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">{row.date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeMetricsTab === 'operations' && (
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
                        {["Metric","Extracted From","AI Confidence","Extraction Date"].map(h => (
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
                        const p = getConfidencePill(row.confidence);
                        return (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-[14px] text-black font-['Figtree:Medium',sans-serif]">{row.metric}</td>
                            <td className="px-6 py-4 text-[14px] text-gray-600"><a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-black transition-colors">{row.source}</a></td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-block px-2 py-1 rounded-full text-[12px] ${p.classes}`}>{p.label}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">{row.date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeMetricsTab === 'debt' && (
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
                        {["Metric","Extracted From","AI Confidence","Extraction Date"].map(h => (
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
                        const p = getConfidencePill(row.confidence);
                        return (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-[14px] text-black font-['Figtree:Medium',sans-serif]">{row.metric}</td>
                            <td className="px-6 py-4 text-[14px] text-gray-600"><a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-black transition-colors">{row.source}</a></td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-block px-2 py-1 rounded-full text-[12px] ${p.classes}`}>{p.label}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">{row.date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}