
import { useState, useEffect } from "react";
import { getDiscrepancies, getIngestionLog } from "../../api";
import FilterButton from "../components/FilterButton";

export default function AIAnalysis() {
  const [activeTab, setActiveTab] = useState<'keyMetrics' | 'discrepancies' | 'ingestion'>('keyMetrics');
  const [activeMetricsTab, setActiveMetricsTab] = useState<'profit' | 'market' | 'operations' | 'debt'>('profit');
  const [discrepancies, setDiscrepancies] = useState<Record<string, unknown>[]>([]);
  const [ingestionLog, setIngestionLog] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    Promise.all([
      getDiscrepancies().catch(() => []),
      getIngestionLog().catch(() => []),
    ]).then(([disc, log]) => {
      setDiscrepancies(disc as Record<string, unknown>[]);
      setIngestionLog(log as Record<string, unknown>[]);
    });
  }, []);


  // Modal + confirmation state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [modalStep, setModalStep] = useState<'idle' | 'analyzing' | 'complete'>('idle');

  const closeModal = () => {
    setShowUploadModal(false);
    setUploadedFiles([]);
    setModalStep('idle');
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const incoming = Array.from(e.dataTransfer.files);
    setUploadedFiles(prev => [...prev, ...incoming].slice(0, 20));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...incoming].slice(0, 20));
  };

  const handleUpload = () => {
    setModalStep('analyzing');
    setTimeout(() => setModalStep('complete'), 3000);
  };

  const handleSave = () => {
    closeModal();
  };

  useEffect(() => {
    if (!showUploadModal) setModalStep('idle');
  }, [showUploadModal]);

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

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-white border-[#d0d5dd] border-[0.8px] border-solid h-[43px] rounded-[10px] px-6 flex items-center gap-2 hover:bg-gray-50 transition-colors"
        >
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
                {(discrepancies.length > 0 ? discrepancies.map((d) => ({
                  title: (d.description ?? d.title ?? "Anomaly") as string,
                  id: d.id as string,
                  level: ((d.severity ?? d.level ?? "medium") as string).charAt(0).toUpperCase() + ((d.severity ?? d.level ?? "medium") as string).slice(1),
                  dateFlagged: d.createdAt ? new Date(d.createdAt as string).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "—",
                  type: "",
                  aiConfidence: d.confidenceScore != null ? `${Math.round(Number(d.confidenceScore) * (Number(d.confidenceScore) <= 1 ? 100 : 1))}%` : "—",
                })) : mockIssues).filter(issue => {
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
                {(ingestionLog.length > 0 ? ingestionLog.map((d) => ({
                  name: (d.fileName ?? d.name ?? "Document") as string,
                  numberOfDocs: String(d.numberOfDocs ?? 1),
                  uploadDate: (d.uploadDate ?? "—") as string,
                  uploadedBy: (d.uploadedBy ?? "Admin") as string,
                  role: "Administrator",
                })) : mockIngestionData).map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-['Figtree:Medium',sans-serif] text-[14px] text-black">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                      {String(item.numberOfDocs ?? 1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                      {(item.uploadDate ?? "—") as string}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-['Figtree:Medium',sans-serif] text-[14px] text-black">
                     {(item.uploadedBy ?? "—") as string}
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
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowUploadModal(false)}
          />

          {/* Modal card */}
          <div className="relative bg-white rounded-[16px] shadow-xl w-full max-w-[680px] mx-4 p-8 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-['Figtree:Medium',sans-serif] font-medium text-[22px] text-black leading-tight">
                  Upload & Analyze Documents
                </h2>
                <p className="text-[14px] text-[#667085] mt-1">
                  AI will extract key metrics and flag discrepancies from your documents.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-[#667085] hover:text-black ml-4 shrink-0"
              >
                <svg className="size-5" fill="none" viewBox="0 0 20 20">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* ── IDLE: drop zone + file list + upload button ── */}
            {modalStep === 'idle' && (
              <>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-[12px] px-6 py-10 flex flex-col items-center gap-3 transition-colors ${
                    isDragging ? "border-black bg-gray-50" : "border-[#d0d5dd] bg-[#f9fafb]"
                  }`}
                >
                  <div className="size-12 bg-white border border-[#d0d5dd] rounded-full flex items-center justify-center shadow-sm">
                    <svg className="size-5 text-[#667085]" fill="none" viewBox="0 0 20 20">
                      <path d="M10 13.333V3.333M10 3.333L6.667 6.667M10 3.333L13.333 6.667" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.333 13.333v1.334A2.333 2.333 0 0 0 5.667 17h8.666a2.333 2.333 0 0 0 2.334-2.333v-1.334" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] text-black font-['Figtree:Medium',sans-serif]">Drag and drop files here</p>
                    <p className="text-[13px] text-[#667085] mt-0.5">or</p>
                  </div>
                  <label className="cursor-pointer h-[36px] px-5 border border-[#d0d5dd] rounded-lg text-[14px] text-[#344054] bg-white hover:bg-gray-50 transition-colors flex items-center">
                    Browse files
                    <input type="file" multiple accept=".pdf,.xlsx,.xls,.doc,.docx,.csv" className="hidden" onChange={handleFileInput} />
                  </label>
                  <p className="text-[12px] text-[#98a2b3]">PDF, Excel, Word, CSV · Max 20 documents</p>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto">
                    <p className="text-[12px] text-[#667085]">{uploadedFiles.length} / 20 files selected</p>
                    {uploadedFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#f9fafb] border border-[#eaecf0] rounded-lg">
                        <span className="text-[13px] text-black truncate">{file.name}</span>
                        <button onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-[#98a2b3] hover:text-[#b42318] ml-3 shrink-0">
                          <svg className="size-4" fill="none" viewBox="0 0 16 16"><path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-center">
                  <button onClick={handleUpload} className="h-[43px] px-6 bg-[#144430] rounded-[10px] flex items-center gap-2 hover:bg-[#0f3324] transition-colors">
                    <svg className="size-4" fill="none" viewBox="0 0 20 20">
                      <path d="M10 13.333V3.333M10 3.333L6.667 6.667M10 3.333L13.333 6.667" stroke="#EAECF0" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.333 13.333v1.334A2.333 2.333 0 0 0 5.667 17h8.666a2.333 2.333 0 0 0 2.334-2.333v-1.334" stroke="#EAECF0" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="font-['Figtree:Bold',sans-serif] text-[14px] text-white">Upload & Analyze</span>
                  </button>
                </div>
              </>
            )}

            {/* ── ANALYZING: loading spinner ── */}
            {modalStep === 'analyzing' && (
              <div className="flex flex-col items-center gap-5 py-8">
                <div className="relative size-16">
                  <svg className="size-16 animate-spin" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="6"/>
                    <path d="M32 4a28 28 0 0 1 28 28" stroke="#144430" strokeWidth="6" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-['Figtree:Medium',sans-serif] font-medium text-[16px] text-black">Analyzing documents…</p>
                  <p className="text-[13px] text-[#667085] mt-1">AI is extracting key metrics and flagging discrepancies. This may take a moment.</p>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  {["Parsing document structure", "Extracting financial metrics", "Identifying discrepancies", "Generating summary"].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-[#f9fafb] rounded-lg">
                      <div className="size-4 rounded-full border-2 border-[#144430] border-t-transparent animate-spin shrink-0" style={{ animationDelay: `${i * 0.2}s` }} />
                      <span className="text-[13px] text-[#344054]">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── COMPLETE: analysis results + Save button ── */}
            {modalStep === 'complete' && (
              <>
                <div className="flex items-center gap-2 text-[#027a48]">
                  <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="none">
                    <path d="M16.667 5L7.5 14.167 3.333 10" stroke="#027a48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-['Figtree:Medium',sans-serif] font-medium text-[14px]">Analysis complete. Extracted metrics and any flagged disprecpanices will appear in their respective tabs.</span>
                </div>

                <div className="bg-[#f9fafb] border border-[#eaecf0] rounded-[10px] p-5 flex flex-col gap-4">
                  <p className="font-['Figtree:Medium',sans-serif] font-medium text-[14px] text-black">Key Findings</p>
                  <p className="text-[13px] text-[#475467] leading-[20px]">
                    The AI identified several critical financial metrics across the uploaded documents. Revenue for FY 2025 stands at ₦2.2M — a significant decline of 64.9% compared to the ₦6.27M recorded in FY 2024. Administrative expenses decreased by 26.2% to ₦50.52M, suggesting ongoing cost-reduction measures. Net loss for the period is ₦48.32M. Market cap is currently ₦6.94B with a share price of ₦2.47 on the NGX, reflecting a recent 8.91% uptick.
                  </p>
                  <p className="text-[13px] text-[#475467] leading-[20px]">
                    Three high-confidence discrepancies were flagged for review. A ₦1.9B gap was detected between reported short-term borrowings and reconciled payables across two documents, consistent with previously reported accounting inconsistencies. Additionally, accrued expenses of ₦2.76B appear understated relative to prior period adjustments, and one revenue line item could not be cross-referenced to a supporting invoice. These findings have been surfaced in the Discrepancies tab for further action.
                  </p>
                </div>

                <div className="flex justify-center">
                  <button onClick={handleSave} className="h-[43px] px-6 bg-[#144430] rounded-[10px] flex items-center gap-2 hover:bg-[#0f3324] transition-colors">
                    <svg className="size-4" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="7.5" stroke="#EAECF0" strokeWidth="1.5"/>
                      <path d="M6.5 10L9 12.5L13.5 7.5" stroke="#EAECF0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="font-['Figtree:Bold',sans-serif] text-[14px] text-white">Complete Analysis</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}


    </div>
  );
}