import { useState, useEffect, useRef } from "react";
import svgPaths from "../../imports/DocumentIntelligencePrototype/svg-9a8cfnzrn9";
import FilterButton from "../components/FilterButton";
import { getReports, getReport, finalizeReport, exportReportCSV, exportReportPresentation, downloadReportPresentation, generateCustomReport, getDocuments, getScorecard, getFraudScore } from "../../api";

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reportContent, setReportContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [activeReportTab, setActiveReportTab] = useState<'summary' | 'scorecard' | 'fraud'>('summary');
  const [scorecard, setScorecard] = useState<Record<string, unknown> | null>(null);
  const [fraudScore, setFraudScore] = useState<Record<string, unknown> | null>(null);
  const [scorecardLoading, setScorecardLoading] = useState(false);
  const [fraudLoading, setFraudLoading] = useState(false);
  const [fullReportData, setFullReportData] = useState<Record<string, unknown> | null>(null);

  // Per-report cache so switching between reports never re-calls the API for data already fetched
  const reportDataCache = useRef<Map<number, Record<string, unknown>>>(new Map());
  const scorecardCache = useRef<Map<number, Record<string, unknown>>>(new Map());
  const fraudScoreCache = useRef<Map<number, Record<string, unknown>>>(new Map());

  // Filter state
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateCreatedFrom, setDateCreatedFrom] = useState("");
  const [dateCreatedTo, setDateCreatedTo] = useState("");
  const [dateFinalizedFrom, setDateFinalizedFrom] = useState("");
  const [dateFinalizedTo, setDateFinalizedTo] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState<string[]>([]);

  const toggleFilter = (name: string) => setOpenFilter(prev => prev === name ? null : name);

  const parseDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    return new Date(`${year}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`);
  };

  const openReport = async (report: Report) => {
    setSelectedReport(report);
    setIsEditing(false);
    setActiveReportTab('summary');

    if (!report.apiId) {
      setReportContent("No report data. Use Generate Report with a real document.");
      setFullReportData(null);
      setScorecard(null);
      setFraudScore(null);
      return;
    }

    // Restore cached scorecard/fraud for this report instantly
    setScorecard(scorecardCache.current.get(report.apiId) ?? null);
    setFraudScore(fraudScoreCache.current.get(report.apiId) ?? null);

    // Use cached full report data if available
    const cached = reportDataCache.current.get(report.apiId);
    if (cached) {
      setFullReportData(cached);
      setReportContent("");
      return;
    }

    setReportContent("Loading…");
    setFullReportData(null);
    try {
      const full = await getReport(report.apiId) as Record<string, unknown>;
      reportDataCache.current.set(report.apiId, full);
      setFullReportData(full);
      setReportContent("");
    } catch {
      setReportContent("Failed to load report content.");
    }
  };

  const loadScorecard = async () => {
    if (!selectedReport || !selectedReport.apiId) return;
    // Already loaded for this report
    if (scorecardCache.current.has(selectedReport.apiId)) {
      setScorecard(scorecardCache.current.get(selectedReport.apiId)!);
      return;
    }
    setScorecardLoading(true);
    try {
      const result = await getScorecard(selectedReport.apiId) as Record<string, unknown>;
      scorecardCache.current.set(selectedReport.apiId, result);
      setScorecard(result);
    } catch { /* silently fail */ } finally { setScorecardLoading(false); }
  };

  const loadFraudScore = async () => {
    if (!selectedReport || !selectedReport.apiId) return;
    // Already loaded for this report
    if (fraudScoreCache.current.has(selectedReport.apiId)) {
      setFraudScore(fraudScoreCache.current.get(selectedReport.apiId)!);
      return;
    }
    setFraudLoading(true);
    try {
      const result = await getFraudScore(selectedReport.apiId) as Record<string, unknown>;
      fraudScoreCache.current.set(selectedReport.apiId, result);
      setFraudScore(result);
    } catch { /* silently fail */ } finally { setFraudLoading(false); }
  };

  const getConfidencePill = (confidence: string) => {
    const value = parseInt(confidence);
    if (value >= 90) return { label: `${confidence} - Very High`, classes: "bg-[#ecfdf3] text-[#027a48]" };
    if (value >= 80) return { label: `${confidence} - High`, classes: "bg-[#e8f0fe] text-[#1a56db]" };
    if (value >= 60) return { label: `${confidence} - Moderate`, classes: "bg-[#fef0c7] text-[#dc6803]" };
    return { label: `${confidence} - Low`, classes: "bg-[#fef3f2] text-[#b42318]" };
  };

  // Generate report modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateStep, setGenerateStep] = useState<'form' | 'generating' | 'complete'>('form');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedDiscrepancyLevels, setSelectedDiscrepancyLevels] = useState<string[]>([]);
  const [reportTimeframeFrom, setReportTimeframeFrom] = useState('');
  const [reportTimeframeTo, setReportTimeframeTo] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [openModalFilter, setOpenModalFilter] = useState<string | null>(null);
  const [availableDocuments, setAvailableDocuments] = useState<{id: number; title: string}[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [generateError, setGenerateError] = useState('');
  const [generatedReport, setGeneratedReport] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    getDocuments().then((data: unknown) => {
      const docs = (data as Record<string, unknown>[]).map((d) => ({
        id: d.id as number,
        title: (d.originalFilename ?? d.filename ?? `Document #${d.id}`) as string,
      }));
      setAvailableDocuments(docs);
      if (docs.length > 0) setSelectedDocumentId(docs[0].id);
    }).catch(() => {});
  }, []);

  const closeGenerateModal = () => {
    setShowGenerateModal(false);
    setGenerateStep('form');
    setSelectedMetrics([]);
    setSelectedDiscrepancyLevels([]);
    setReportTimeframeFrom('');
    setReportTimeframeTo('');
    setReportDescription('');
    setOpenModalFilter(null);
    setGenerateError('');
    setGeneratedReport(null);
  };

  const handleGenerate = async () => {
    if (!selectedDocumentId) return;
    setGenerateStep('generating');
    setGenerateError('');
    try {
      const parts: string[] = [];
      if (selectedMetrics.length > 0) parts.push(`Focus on these metrics: ${selectedMetrics.join(', ')}.`);
      if (selectedDiscrepancyLevels.length > 0) parts.push(`Highlight ${selectedDiscrepancyLevels.join(', ')} severity discrepancies.`);
      if (reportTimeframeFrom || reportTimeframeTo) parts.push(`Analysis period: ${reportTimeframeFrom || 'start'} to ${reportTimeframeTo || 'present'}.`);
      if (reportDescription) parts.push(reportDescription);
      const instructions = parts.join(' ') || 'Provide a comprehensive financial audit report.';
      const result = await generateCustomReport({
        documentId: selectedDocumentId,
        customInstructions: instructions,
        startPeriod: reportTimeframeFrom || undefined,
        endPeriod: reportTimeframeTo || undefined,
      }) as Record<string, unknown>;
      setGeneratedReport(result);
      const newReport: Report = {
        apiId: result.id as number,
        title: (result.title ?? result.documentName ?? 'Custom Report') as string,
        id: `FR-${String((result.id as number) ?? 0).padStart(4, '0')}`,
        type: 'Custom Report',
        category: 'Financial Analysis',
        date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        status: 'Needs Approval',
        aiConfidence: result.confidenceScore != null ? `${Math.round(Number(result.confidenceScore) * (Number(result.confidenceScore) <= 1 ? 100 : 1))}%` : '—',
      };
      setReports(prev => [newReport, ...prev]);
      setGenerateStep('complete');
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Failed to generate report');
      setGenerateStep('form');
    }
  };

  type Report = { apiId: number; title: string; id: string; type: string; category: string; date: string; status: string; finalizedDate?: string; aiConfidence: string };

  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState("");

  useEffect(() => {
    getReports()
      .then((data: unknown[]) => {
        const mapped = (data as Record<string, unknown>[]).map((r, i) => {
          const isLocked = r.isLocked as boolean;
          const rawStatus = isLocked ? "Finalized" : "Needs Approval";
          const status = rawStatus;
          const confidence = r.confidenceScore as number | null;
          const confidenceStr = confidence != null ? `${Math.round(Number(confidence) * (Number(confidence) <= 1 ? 100 : 1))}%` : "—";
          const createdAt = (r.createdAt ?? "") as string;
          const finalizedAt = null;
          const formatDate = (iso: string) => {
            const d = new Date(iso);
            return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
          };
          return {
            apiId: r.id as number,
            title: (r.title ?? r.documentName ?? `Report #${i + 1}`) as string,
            id: r.report_number ? (r.report_number as string) : `FR-${String(i + 1).padStart(4, "0")}`,
            type: (r.report_type ?? r.type ?? "") as string,
            category: (r.category ?? "") as string,
            date: createdAt ? formatDate(createdAt as string) : "—",
            status,
            finalizedDate: finalizedAt ? formatDate(finalizedAt as string) : undefined,
            aiConfidence: confidenceStr,
          };
        });
        setReports(mapped);
      })
      .catch((err: Error) => setReportsError(err.message))
      .finally(() => setLoadingReports(false));
  }, []);

  return (
    <div className="bg-white h-full w-full p-8 relative">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-[8px]">
          <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">
            Reports
          </h1>
          <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-black">
            Instructions on report viewing and generation
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
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
            Generate Report
          </p>
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[44px] px-4 pl-10 border border-[#d0d5dd] rounded-lg text-[14px]"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" fill="none" viewBox="0 0 20 20">
            <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <FilterButton
          label="Status"
          type="checkbox"
          options={[
            { value: "Finalized", label: "Finalized" },
            { value: "Needs Approval", label: "Needs Approval" },
          ]}
          selected={statusFilter}
          onChange={setStatusFilter}
          isOpen={openFilter === "status"}
          onToggle={() => toggleFilter("status")}
          onClose={() => setOpenFilter(null)}
        />
        <FilterButton
          label="Date Created"
          type="daterange"
          from={dateCreatedFrom}
          to={dateCreatedTo}
          onFromChange={setDateCreatedFrom}
          onToChange={setDateCreatedTo}
          isOpen={openFilter === "dateCreated"}
          onToggle={() => toggleFilter("dateCreated")}
          onClose={() => setOpenFilter(null)}
        />
        <FilterButton
          label="Date Finalized"
          type="daterange"
          from={dateFinalizedFrom}
          to={dateFinalizedTo}
          onFromChange={setDateFinalizedFrom}
          onToChange={setDateFinalizedTo}
          isOpen={openFilter === "dateFinalized"}
          onToggle={() => toggleFilter("dateFinalized")}
          onClose={() => setOpenFilter(null)}
        />
        <FilterButton
          label="Initial AI Confidence"
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

      {loadingReports && <p className="text-[14px] text-[#667085] mb-4">Loading reports…</p>}
      {reportsError && <p className="text-[14px] text-[#b42318] mb-4">{reportsError}</p>}

      {/* Table */}
      <div className="border border-[#eaecf0] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Report Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Initial AI Confidence
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Finalized
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.filter(report => {
              if (searchQuery && ![report.title, report.status].some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
              if (statusFilter.length > 0 && !statusFilter.includes(report.status)) return false;
              if (dateCreatedFrom || dateCreatedTo) {
                const d = parseDate(report.date);
                if (d && dateCreatedFrom && d < new Date(dateCreatedFrom)) return false;
                if (d && dateCreatedTo && d > new Date(dateCreatedTo)) return false;
              }
              if (dateFinalizedFrom || dateFinalizedTo) {
                const d = report.finalizedDate ? parseDate(report.finalizedDate) : null;
                if (!d) return false;
                if (dateFinalizedFrom && d < new Date(dateFinalizedFrom)) return false;
                if (dateFinalizedTo && d > new Date(dateFinalizedTo)) return false;
              }
              if (confidenceFilter.length > 0) {
                const v = parseInt(report.aiConfidence);
                const band = v >= 90 ? "veryHigh" : v >= 80 ? "high" : v >= 60 ? "moderate" : "low";
                if (!confidenceFilter.includes(band)) return false;
              }
              return true;
            }).map((report, index) => (
              <tr 
                key={index} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => openReport(report)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-['Figtree:Medium',sans-serif] text-[14px] text-black">
                    {report.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-['Inter:Regular',sans-serif] ${
                    report.status === "Finalized"
                      ? "bg-[#ecfdf3] text-[#027a48]"
                      : "bg-[#e8f0fe] text-[#1a56db]"
                  }`}>
                    {report.status === "Finalized" ? "Finalized" : "Needs Approval"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(() => { const p = getConfidencePill(report.aiConfidence); return (
                    <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-['Inter:Regular',sans-serif] ${p.classes}`}>
                      {p.label}
                    </span>
                  ); })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                  {report.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                  {report.finalizedDate ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Side Panel */}
      {selectedReport && (
        <div 
          className={`fixed top-0 right-0 h-screen bg-white border-l border-[#eaecf0] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] transition-all duration-300 ${
            isPanelExpanded ? (isFullWidth ? 'w-[calc(100vw-187px)]' : 'w-[500px]') : 'w-0'
          }`}
          style={{ zIndex: 1000 }}
        >
          {isPanelExpanded && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="border-b border-[#eaecf0] px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Expand/collapse */}
                  <button
                    onClick={() => setIsFullWidth(!isFullWidth)}
                    title={isFullWidth ? "Collapse panel" : "Expand panel"}
                    className="flex items-center gap-1.5 h-[32px] px-3 border border-[#d0d5dd] rounded-lg text-[12px] text-[#344054] hover:bg-gray-50 transition-colors"
                  >
                    <svg className="size-3.5 shrink-0" fill="none" viewBox="0 0 20 20">
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
                    {isFullWidth ? "Collapse" : "Expand"}
                  </button>

                  {/* Action buttons — only for real reports */}
                  {selectedReport && selectedReport.apiId > 0 && (
                    <>
                      <button
                        onClick={() => exportReportCSV(selectedReport.apiId)}
                        className="flex items-center gap-1.5 h-[32px] px-3 border border-[#d0d5dd] rounded-lg text-[12px] text-[#344054] hover:bg-gray-50 transition-colors"
                      >
                        <svg className="size-3.5 shrink-0" fill="none" viewBox="0 0 20 20">
                          <path d="M17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5M5.83333 8.33333L10 12.5M10 12.5L14.1667 8.33333M10 12.5V2.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Download CSV
                      </button>
                      <button
                        onClick={() => exportReportPresentation(selectedReport.apiId)}
                        className="flex items-center gap-1.5 h-[32px] px-3 border border-[#d0d5dd] rounded-lg text-[12px] text-[#344054] hover:bg-gray-50 transition-colors"
                      >
                        <svg className="size-3.5 shrink-0" fill="none" viewBox="0 0 20 20">
                          <path d="M10 2.5C5.858 2.5 2.5 5.858 2.5 10s3.358 7.5 7.5 7.5 7.5-3.358 7.5-7.5S14.142 2.5 10 2.5zm0 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M10 6.667v6.666M7.5 10h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        View Online
                      </button>
                      <button
                        onClick={() => downloadReportPresentation(selectedReport.apiId)}
                        className="flex items-center gap-1.5 h-[32px] px-3 border border-[#d0d5dd] rounded-lg text-[12px] text-[#344054] hover:bg-gray-50 transition-colors"
                      >
                        <svg className="size-3.5 shrink-0" fill="none" viewBox="0 0 20 20">
                          <path d="M2.5 3.333h15M2.5 10h15M2.5 16.667h15" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round"/>
                        </svg>
                        Download Report
                      </button>
                    </>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={() => { setSelectedReport(null); setIsFullWidth(false); setIsEditing(false); }}
                  className="flex items-center gap-1.5 h-[32px] px-3 rounded-lg text-[12px] text-[#667085] hover:text-black hover:bg-gray-50 transition-colors"
                >
                  <svg className="size-3.5 shrink-0" fill="none" viewBox="0 0 20 20">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Close
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* Report Title and Status */}
                <div className="mb-4">
                  <h2 className="font-['Figtree:Medium',sans-serif] text-[20px] leading-[30px] text-black mb-2">
                    {selectedReport.title}
                  </h2>
                  <div className="flex gap-2 text-[12px] text-[#52565c] mb-3">
                    <span>Date Generated: {selectedReport.date}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap mb-4">
                    <span className="text-[12px] text-[#52565c]">AI Confidence:</span>
                    {(() => { const p = getConfidencePill(selectedReport.aiConfidence); return (
                      <span className={`inline-block px-2 py-1 rounded-full text-[12px] ${p.classes}`}>{p.label}</span>
                    ); })()}
                    <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-bold ${selectedReport.status === "Finalized" ? "bg-[#ecfdf3] text-[#027a48]" : "bg-[#e8f0fe] text-[#1a56db]"}`}>
                      {selectedReport.status === "Finalized" ? "Finalized" : "Needs Approval"}
                    </span>
                  </div>
                  {/* Health score badge */}
                  {fullReportData?.healthScore != null && (
                    <div className="flex items-center gap-3 bg-[#f9fafb] border border-[#eaecf0] rounded-[10px] p-4 mb-4">
                      <div className="text-[48px] font-['Figtree:Medium',sans-serif] font-medium leading-none" style={{
                        color: Number(fullReportData.healthScore) >= 70 ? '#027a48' : Number(fullReportData.healthScore) >= 40 ? '#dc6803' : '#b42318'
                      }}>{String(fullReportData.healthScore)}</div>
                      <div>
                        <div className="text-[11px] text-[#667085] uppercase tracking-wider font-semibold">Health Score</div>
                        <div className="text-[15px] font-semibold" style={{
                          color: Number(fullReportData.healthScore) >= 70 ? '#027a48' : Number(fullReportData.healthScore) >= 40 ? '#dc6803' : '#b42318'
                        }}>{String(fullReportData.healthRating ?? '')}</div>
                      </div>
                      <div className="flex-1 ml-2">
                        <div className="w-full bg-[#eaecf0] rounded-full h-2">
                          <div className="h-2 rounded-full transition-all" style={{
                            width: `${fullReportData.healthScore}%`,
                            background: Number(fullReportData.healthScore) >= 70 ? '#027a48' : Number(fullReportData.healthScore) >= 40 ? '#dc6803' : '#b42318'
                          }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tabs */}
                {selectedReport.apiId > 0 && (
                  <div className="border-b border-[#eaecf0] mb-4">
                    <div className="flex gap-1">
                      {([['summary','Summary'],['scorecard','Scorecard'],['fraud','Fraud Score']] as const).map(([tab, label]) => (
                        <button key={tab} onClick={() => {
                          setActiveReportTab(tab);
                          if (tab === 'scorecard') loadScorecard();
                          if (tab === 'fraud') loadFraudScore();
                        }} className={`text-[13px] px-3 py-2 font-['Figtree:Medium',sans-serif] ${activeReportTab === tab ? 'border-b-2 border-black font-semibold text-black' : 'text-[#667085]'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary tab */}
                {activeReportTab === 'summary' && (
                  <div className="flex flex-col gap-4">
                    {fullReportData?.executiveSummary && (
                      <div>
                        <div className="text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-2">Executive Summary</div>
                        <p className="text-[13px] text-[#475467] leading-[22px]">{String(fullReportData.executiveSummary)}</p>
                      </div>
                    )}
                    {fullReportData?.keyMetrics && Object.keys(fullReportData.keyMetrics as object).length > 0 && (
                      <div>
                        <div className="text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-2">Key Metrics</div>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(fullReportData.keyMetrics as Record<string, unknown>).map(([k, v]) => (
                            <div key={k} className="bg-[#f9fafb] border border-[#eaecf0] rounded-[8px] p-3">
                              <div className="text-[10px] text-[#667085] uppercase tracking-wider mb-1">{k.replace(/_/g,' ')}</div>
                              <div className="text-[13px] font-semibold text-black">{String(v)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {Array.isArray(fullReportData?.anomalies) && (fullReportData!.anomalies as unknown[]).length > 0 && (
                      <div>
                        <div className="text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-2">Anomalies ({(fullReportData!.anomalies as unknown[]).length})</div>
                        <div className="flex flex-col gap-2">
                          {(fullReportData!.anomalies as Record<string, unknown>[]).map((a, i) => {
                            const sev = String(a.severity ?? '').toLowerCase();
                            const colors = { high: 'bg-[#fef2f2] border-[#fca5a5] text-[#991b1b]', medium: 'bg-[#fffbeb] border-[#fcd34d] text-[#92400e]', low: 'bg-[#f9fafb] border-[#e5e7eb] text-[#374151]' };
                            const c = colors[sev as keyof typeof colors] ?? colors.low;
                            return (
                              <div key={i} className={`border rounded-[8px] p-3 ${c.split(' ').slice(0,2).join(' ')}`}>
                                <div className="flex justify-between items-start mb-1">
                                  <div className="text-[13px] font-semibold text-[#1d2939]">{String(a.title ?? '')}</div>
                                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${c}`}>{String(a.severity ?? '')}</span>
                                </div>
                                <div className="text-[12px] text-[#475467]">{String(a.description ?? '')}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {Array.isArray(fullReportData?.recommendations) && (fullReportData!.recommendations as unknown[]).length > 0 && (
                      <div>
                        <div className="text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-2">Recommendations</div>
                        <div className="flex flex-col gap-2">
                          {(fullReportData!.recommendations as Record<string, unknown>[]).map((r, i) => {
                            const pri = String(r.priority ?? '').toLowerCase();
                            const badge = { high: 'bg-[#fef2f2] text-[#991b1b]', medium: 'bg-[#fffbeb] text-[#92400e]', low: 'bg-[#f0fdf4] text-[#166534]' };
                            const b = badge[pri as keyof typeof badge] ?? badge.low;
                            return (
                              <div key={i} className="bg-white border border-[#eaecf0] rounded-[8px] p-3">
                                <div className="flex justify-between items-start mb-1">
                                  <div className="text-[13px] font-semibold text-[#1d2939]">{String(r.title ?? '')}</div>
                                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${b}`}>{pri}</span>
                                </div>
                                <div className="text-[12px] text-[#475467]">{String(r.description ?? '')}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {!fullReportData?.executiveSummary && (
                      <p className="text-[13px] text-[#667085] italic">{reportContent || 'No content available.'}</p>
                    )}
                  </div>
                )}

                {/* Scorecard tab */}
                {activeReportTab === 'scorecard' && (
                  <div>
                    {scorecardLoading && <p className="text-[13px] text-[#667085]">Generating scorecard… this may take a moment.</p>}
                    {!scorecardLoading && !scorecard && <p className="text-[13px] text-[#667085]">Click Scorecard tab to load.</p>}
                    {scorecard && (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 bg-[#f9fafb] border border-[#eaecf0] rounded-[10px] p-4">
                          <div className="text-[48px] font-['Figtree:Medium',sans-serif] leading-none" style={{color: Number(scorecard.overallScore ?? 0) >= 70 ? '#027a48' : Number(scorecard.overallScore ?? 0) >= 40 ? '#dc6803' : '#b42318'}}>
                            {String(scorecard.overallScore ?? '—')}
                          </div>
                          <div>
                            <div className="text-[11px] text-[#667085] uppercase tracking-wider">Overall Score</div>
                            <div className="text-[15px] font-semibold text-black">{String(scorecard.overallRating ?? '')}</div>
                            <div className="text-[12px] text-[#475467] mt-1 max-w-[240px]">{String(scorecard.overallSummary ?? '')}</div>
                          </div>
                        </div>
                        {scorecard.categories && Object.entries(scorecard.categories as Record<string, Record<string, unknown>>).map(([cat, data]) => (
                          <div key={cat} className="border border-[#eaecf0] rounded-[8px] p-3">
                            <div className="flex justify-between items-center mb-1">
                              <div className="text-[13px] font-semibold text-black capitalize">{cat.replace(/_/g,' ')}</div>
                              <div className="flex items-center gap-2">
                                <div className="text-[18px] font-bold" style={{color: Number(data.score ?? 0) >= 70 ? '#027a48' : Number(data.score ?? 0) >= 40 ? '#dc6803' : '#b42318'}}>{String(data.score ?? '—')}</div>
                                <span className="text-[10px] font-bold text-[#667085]">{String(data.rating ?? '')}</span>
                              </div>
                            </div>
                            <div className="w-full bg-[#eaecf0] rounded-full h-1.5 mb-2">
                              <div className="h-1.5 rounded-full" style={{width:`${data.score ?? 0}%`, background: Number(data.score ?? 0) >= 70 ? '#027a48' : Number(data.score ?? 0) >= 40 ? '#dc6803' : '#b42318'}} />
                            </div>
                            <div className="text-[12px] text-[#475467]">{String(data.explanation ?? '')}</div>
                            {data.recommendation && <div className="text-[11px] text-[#667085] mt-1 italic">→ {String(data.recommendation)}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Fraud Score tab */}
                {activeReportTab === 'fraud' && (
                  <div>
                    {fraudLoading && <p className="text-[13px] text-[#667085]">Analysing fraud indicators… this may take a moment.</p>}
                    {!fraudLoading && !fraudScore && <p className="text-[13px] text-[#667085]">Click Fraud Score tab to load.</p>}
                    {fraudScore && (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 bg-[#f9fafb] border border-[#eaecf0] rounded-[10px] p-4">
                          <div className="text-[48px] font-['Figtree:Medium',sans-serif] leading-none" style={{color: Number(fraudScore.overallFraudRiskScore ?? 0) >= 60 ? '#b42318' : Number(fraudScore.overallFraudRiskScore ?? 0) >= 30 ? '#dc6803' : '#027a48'}}>
                            {String(fraudScore.overallFraudRiskScore ?? '—')}
                          </div>
                          <div>
                            <div className="text-[11px] text-[#667085] uppercase tracking-wider">Fraud Risk Score</div>
                            <div className="text-[15px] font-semibold text-black">{String(fraudScore.riskLevel ?? '')}</div>
                            <div className="text-[12px] text-[#475467] mt-1 max-w-[240px]">{String(fraudScore.riskSummary ?? '')}</div>
                          </div>
                        </div>
                        {Array.isArray(fraudScore.riskFactors) && (fraudScore.riskFactors as Record<string, unknown>[]).map((f, i) => {
                          const ind = String(f.indicator ?? '');
                          const color = ind === 'red_flag' ? '#b42318' : ind === 'concerning' ? '#dc6803' : ind === 'suspicious' ? '#d97706' : '#027a48';
                          return (
                            <div key={i} className="border border-[#eaecf0] rounded-[8px] p-3">
                              <div className="flex justify-between items-center mb-1">
                                <div className="text-[13px] font-semibold text-black">{String(f.factor ?? '')}</div>
                                <span className="text-[10px] font-bold uppercase" style={{color}}>{ind.replace(/_/g,' ')}</span>
                              </div>
                              <div className="text-[12px] text-[#475467]">{String(f.finding ?? '')}</div>
                            </div>
                          );
                        })}
                        {Array.isArray(fraudScore.redFlags) && (fraudScore.redFlags as Record<string, unknown>[]).length > 0 && (
                          <div>
                            <div className="text-[11px] font-bold text-[#b42318] uppercase tracking-wider mb-2">Red Flags</div>
                            {(fraudScore.redFlags as Record<string, unknown>[]).map((f, i) => (
                              <div key={i} className="bg-[#fef2f2] border border-[#fca5a5] rounded-[8px] p-3 mb-2">
                                <div className="text-[13px] font-semibold text-[#991b1b] mb-1">{String(f.title ?? '')}</div>
                                <div className="text-[12px] text-[#7f1d1d]">{String(f.description ?? '')}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Buttons — hidden for approved reports */}
              {selectedReport.status !== "Finalized" && (
                <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-white border-t-2 border-[#eaecf0]">
                  <div className="flex gap-4 justify-center items-center">
                    {/* Edit / Save Button */}
                    <button
                      onClick={() => {
                        if (isEditing) {
                          setIsEditing(false);
                          setShowSaveConfirmation(true);
                        } else {
                          setIsEditing(true);
                        }
                      }}
                      className="h-[53px] px-4 w-[124px] border border-[#c9cdd6] rounded-[10px] flex items-center justify-center gap-2"
                    >
                      {isEditing ? (
                        <>
                          <svg className="size-5" viewBox="0 0 20 20" fill="none">
                            <path d="M15.833 17.5H4.167A1.667 1.667 0 0 1 2.5 15.833V4.167A1.667 1.667 0 0 1 4.167 2.5h9.166L17.5 6.667v9.166A1.667 1.667 0 0 1 15.833 17.5Z" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14.167 17.5V10.833H5.833V17.5M5.833 2.5v4.167h6.667" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="font-['Figtree:Bold',sans-serif] text-[16px] text-black">Save</span>
                        </>
                      ) : (
                        <>
                          <svg className="size-6" viewBox="0 0 24 24" fill="none">
                            <path clipRule="evenodd" d={svgPaths.p3d4e8980} fill="#667085" fillRule="evenodd" />
                          </svg>
                          <span className="font-['Figtree:Bold',sans-serif] text-[16px] text-black">Edit</span>
                        </>
                      )}
                    </button>
                    {/* Sign Off Button */}
                    <button
                      onClick={async () => {
                        if (!selectedReport || selectedReport.apiId === 0) return;
                        try {
                          await finalizeReport(selectedReport.apiId);
                          const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
                          setReports(prev => prev.map(r =>
                            r.apiId === selectedReport.apiId
                              ? { ...r, status: 'Finalized', finalizedDate: today }
                              : r
                          ));
                          setSelectedReport(prev => prev ? { ...prev, status: 'Finalized', finalizedDate: today } : prev);
                        } catch {
                          // silently fail — user can retry
                        }
                      }}
                      className="h-[53px] px-4 w-[217px] bg-[#144430] rounded-[10px] flex items-center justify-center gap-2"
                    >
                      <div className="flex items-center justify-center size-6">
                        <svg className="size-4" viewBox="0 0 20 15" fill="none">
                          <path d="M18 2L7 13L2 8" stroke="#EAECF0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
                        </svg>
                      </div>
                      <span className="font-['Figtree:Bold',sans-serif] text-[16px] text-white text-center">Finalize Report</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Save confirmation toast */}
      <div
        className={`fixed top-6 right-6 z-[2000] transition-all duration-300 ease-out ${
          showSaveConfirmation ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-[#ecfdf3] border border-[#a9efc5] rounded-[12px] shadow-lg px-5 py-4 flex items-start gap-4 min-w-[300px]">
          <div className="flex items-center justify-center size-9 bg-[#ecfdf3] rounded-full shrink-0 mt-0.5">
            <svg className="size-5" viewBox="0 0 20 20" fill="none">
              <path d="M16.667 5L7.5 14.167 3.333 10" stroke="#027a48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-['Figtree:Medium',sans-serif] font-medium text-[14px] text-black leading-[20px]">Changes saved</p>
            <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085] leading-[18px] mt-0.5">Your edits to the report have been saved successfully.</p>
          </div>
          <button
            onClick={() => setShowSaveConfirmation(false)}
            className="text-[#667085] hover:text-gray-900 shrink-0 mt-0.5"
          >
            <svg className="size-4" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={generateStep === 'generating' ? undefined : closeGenerateModal} />

          {/* Modal card */}
          <div className="relative bg-white rounded-[16px] shadow-xl w-full max-w-[680px] mx-4 p-8 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-['Figtree:Medium',sans-serif] font-medium text-[22px] text-black leading-tight">
                  Generate Report
                </h2>
                <p className="text-[14px] text-[#667085] mt-1">
                  AI will compile a report from your existing analysis data.
                </p>
              </div>
              {generateStep !== 'generating' && (
                <button onClick={closeGenerateModal} className="text-[#667085] hover:text-black ml-4 shrink-0">
                  <svg className="size-5" fill="none" viewBox="0 0 20 20">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>

            {/* ── FORM ── */}
            {generateStep === 'form' && (
              <>
                {/* Document selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-['Figtree:Medium',sans-serif] font-medium text-black">Document to Analyze</label>
                  <select
                    value={selectedDocumentId ?? ''}
                    onChange={(e) => setSelectedDocumentId(Number(e.target.value))}
                    className="w-full h-[36px] px-3 border border-[#d0d5dd] rounded-lg text-[14px] text-[#344054] focus:outline-none focus:border-[#667085] bg-white"
                  >
                    {availableDocuments.length === 0 && <option value="">No documents uploaded yet</option>}
                    {availableDocuments.map((doc) => (
                      <option key={doc.id} value={doc.id}>{doc.title}</option>
                    ))}
                  </select>
                </div>

                {generateError && (
                  <p className="text-[13px] text-[#b42318] bg-[#fef3f2] border border-[#fecdca] rounded-lg px-3 py-2">{generateError}</p>
                )}

                {/* Data source selectors */}
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-['Figtree:Medium',sans-serif] font-medium text-black">Data to Include</label>
                  <div className="flex gap-2 flex-wrap">
                    <FilterButton
                      label="Key Metrics"
                      type="checkbox"
                      options={[
                        { value: "Revenue", label: "Revenue" },
                        { value: "Administrative Expenses", label: "Administrative Expenses" },
                        { value: "Net Loss", label: "Net Loss" },
                        { value: "Market Cap", label: "Market Cap" },
                        { value: "Share Price", label: "Share Price" },
                        { value: "Number of Employees", label: "Number of Employees" },
                        { value: "Salaries & Staff Costs", label: "Salaries & Staff Costs" },
                        { value: "Total Debt", label: "Total Debt" },
                        { value: "Long-term Debt", label: "Long-term Debt" },
                        { value: "Trade & Other Payables", label: "Trade & Other Payables" },
                        { value: "Accrued Expenses", label: "Accrued Expenses" },
                      ]}
                      selected={selectedMetrics}
                      onChange={setSelectedMetrics}
                      isOpen={openModalFilter === 'metrics'}
                      onToggle={() => setOpenModalFilter(prev => prev === 'metrics' ? null : 'metrics')}
                      onClose={() => setOpenModalFilter(null)}
                    />
                    <FilterButton
                      label="Discrepancies"
                      type="checkbox"
                      options={[
                        { value: "High", label: "High" },
                        { value: "Medium", label: "Medium" },
                        { value: "Low", label: "Low" },
                      ]}
                      selected={selectedDiscrepancyLevels}
                      onChange={setSelectedDiscrepancyLevels}
                      isOpen={openModalFilter === 'discrepancies'}
                      onToggle={() => setOpenModalFilter(prev => prev === 'discrepancies' ? null : 'discrepancies')}
                      onClose={() => setOpenModalFilter(null)}
                    />
                  </div>
                </div>

                {/* Timeframe — date range matching FilterButton style */}
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-['Figtree:Medium',sans-serif] font-medium text-black">Timeframe</label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-[12px] text-[#667085] mb-1 block">From</label>
                      <input
                        type="date"
                        value={reportTimeframeFrom}
                        onChange={(e) => setReportTimeframeFrom(e.target.value)}
                        className="w-full h-[36px] px-3 border border-[#d0d5dd] rounded-lg text-[14px] focus:outline-none focus:border-[#667085]"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[12px] text-[#667085] mb-1 block">To</label>
                      <input
                        type="date"
                        value={reportTimeframeTo}
                        onChange={(e) => setReportTimeframeTo(e.target.value)}
                        className="w-full h-[36px] px-3 border border-[#d0d5dd] rounded-lg text-[14px] focus:outline-none focus:border-[#667085]"
                      />
                    </div>
                    {(reportTimeframeFrom || reportTimeframeTo) && (
                      <div className="flex items-end pb-0.5">
                        <button
                          onClick={() => { setReportTimeframeFrom(''); setReportTimeframeTo(''); }}
                          className="text-[12px] text-[#667085] hover:text-black whitespace-nowrap"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-['Figtree:Medium',sans-serif] font-medium text-black">
                    Additional Instructions <span className="text-[#98a2b3] font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="e.g. Focus on cost reduction trends, include variance analysis…"
                    rows={3}
                    className="px-3 py-2.5 border border-[#d0d5dd] rounded-[10px] text-[14px] text-[#344054] resize-none focus:outline-none focus:border-[#667085] placeholder:text-[#98a2b3]"
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleGenerate}
                    disabled={!selectedDocumentId || availableDocuments.length === 0}
                    className="h-[43px] px-6 bg-[#144430] rounded-[10px] flex items-center gap-2 hover:bg-[#0f3324] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 20 20">
                      <path d="M10 2.5L12.09 7.26L17.5 7.64L13.63 11L14.82 16.25L10 13.5L5.18 16.25L6.37 11L2.5 7.64L7.91 7.26L10 2.5Z" stroke="#EAECF0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="font-['Figtree:Bold',sans-serif] text-[14px] text-white">Generate Report</span>
                  </button>
                </div>
              </>
            )}

            {/* ── GENERATING ── */}
            {generateStep === 'generating' && (
              <div className="flex flex-col items-center gap-5 py-8">
                <div className="relative size-16">
                  <svg className="size-16 animate-spin" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="6"/>
                    <path d="M32 4a28 28 0 0 1 28 28" stroke="#144430" strokeWidth="6" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-['Figtree:Medium',sans-serif] font-medium text-[16px] text-black">Generating report…</p>
                  <p className="text-[13px] text-[#667085] mt-1">AI is compiling your report. This may take a moment.</p>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  {["Retrieving analysis data", "Structuring report sections", "Applying financial context", "Finalising draft"].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-[#f9fafb] rounded-lg">
                      <div className="size-4 rounded-full border-2 border-[#144430] border-t-transparent animate-spin shrink-0" style={{ animationDelay: `${i * 0.2}s` }} />
                      <span className="text-[13px] text-[#344054]">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── COMPLETE ── */}
            {generateStep === 'complete' && (
              <>
                <div className="flex items-center gap-2 text-[#027a48]">
                  <svg className="size-4 shrink-0" viewBox="0 0 40 40" fill="none">
                    <path d="M16.667 5L7.5 14.167 3.333 10" stroke="#027a48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-['Figtree:Medium',sans-serif] font-medium text-[14px]">Draft generated successfully! The draft has been added to your Reports list with "Needs Approval" status. Review the content to mark it as complete.</span>
                </div>

                <div className="bg-[#f9fafb] border border-[#eaecf0] rounded-[10px] p-5 flex flex-col gap-3">
                  <p className="font-['Figtree:Medium',sans-serif] font-medium text-[14px] text-black">Report Summary</p>
                  <p className="text-[13px] text-[#475467] leading-[20px]">
                    {generatedReport
                      ? String((generatedReport.executiveSummary as string) ?? '').slice(0, 300) + ((String(generatedReport.executiveSummary ?? '').length > 300) ? '…' : '')
                      : 'AI-generated report is ready for review.'
                    }
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      const top = reports[0];
                      closeGenerateModal();
                      if (top) openReport(top);
                    }}
                    className="h-[43px] px-5 bg-[#144430] rounded-[10px] flex items-center gap-2 hover:bg-[#0f3324] transition-colors"
                  >
                    <span className="font-['Figtree:Bold',sans-serif] text-[14px] text-white">View Report</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Collapsed panel indicator */}
      {selectedReport && !isPanelExpanded && (
        <button
          onClick={() => setIsPanelExpanded(true)}
          className="fixed top-1/2 right-0 -translate-y-1/2 bg-white border border-[#eaecf0] rounded-l-lg p-2 shadow-lg hover:bg-gray-50"
          style={{ zIndex: 1000 }}
        >
          <svg className="size-5 text-[#667085]" fill="none" viewBox="0 0 16 16">
            <path d={svgPaths.p14ca9100} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </button>
      )}
    </div>
  );
}