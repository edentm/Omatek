import { useState, useEffect, useRef } from "react";
import svgPaths from "../../imports/DocumentIntelligencePrototype/svg-9a8cfnzrn9";
import FilterButton from "../components/FilterButton";
import { Tooltip } from "../components/Tooltip";
import { getReports, getReport, editReport, finalizeReport, exportReportPresentation, fetchReportPresentationHTML, generateCustomReport, getDocuments } from "../../api";
import { useTokenLedger } from "../../contexts/TokenLedgerContext";
import { useChatPanel } from "../../contexts/ChatPanelContext";

export default function Reports() {
  const { isExhausted } = useTokenLedger();
  const { chatOpen, setSidePanelOpen } = useChatPanel();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reportContent, setReportContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const open = !!(selectedReport && isPanelExpanded);
    setSidePanelOpen(open);
    return () => setSidePanelOpen(false);
  }, [selectedReport, isPanelExpanded, setSidePanelOpen]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [fullReportData, setFullReportData] = useState<Record<string, unknown> | null>(null);

  // Per-report cache so switching between reports never re-calls the API for data already fetched
  const reportDataCache = useRef<Map<number, Record<string, unknown>>>(new Map());

  // Export modal
  const [showExportModal, setShowExportModal] = useState(false);
  const SECTION_OPTIONS = [
    { key: "cover",           label: "Cover Page" },
    { key: "summary",         label: "Executive Summary" },
    { key: "metrics",         label: "Key Metrics" },
    { key: "scorecard",       label: "Health Scorecard" },
    { key: "indicators",      label: "Performance Indicators" },
    { key: "anomalies",       label: "Anomalies Detected" },
    { key: "recommendations", label: "Recommendations" },
    { key: "cert",            label: "Report Certification" },
  ];
  const [selectedSections, setSelectedSections] = useState<string[]>(SECTION_OPTIONS.map(s => s.key));
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const availableMetricKeys: string[] = fullReportData?.keyMetrics
    ? Object.keys(fullReportData.keyMetrics as Record<string, unknown>)
    : [];

  const toggleSection = (key: string) =>
    setSelectedSections(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const toggleMetric = (key: string) =>
    setSelectedMetrics(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const openExportModal = () => {
    // Pre-select all available metrics
    setSelectedMetrics(availableMetricKeys);
    setShowExportModal(true);
  };

  const handleExport = async () => {
    if (!selectedReport || !selectedReport.apiId) return;
    setExportLoading(true);
    setPreviewLoading(true);
    try {
      const html = await fetchReportPresentationHTML(
        selectedReport.apiId,
        selectedSections,
        selectedMetrics.length > 0 ? selectedMetrics : undefined,
      );
      setPreviewHtml(html);
      setShowExportModal(false);
      setShowPreviewModal(true);
    } catch { /* silently fail */ }
    setExportLoading(false);
    setPreviewLoading(false);
  };

  // Filter state
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateCreatedFrom, setDateCreatedFrom] = useState("");
  const [dateCreatedTo, setDateCreatedTo] = useState("");
  const [dateFinalizedFrom, setDateFinalizedFrom] = useState("");
  const [dateFinalizedTo, setDateFinalizedTo] = useState("");

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
    setEditedSummary("");
    setEditSaveError(null);
    setFinalizeError(null);

    if (!report.apiId) {
      setReportContent("No report data. Use Generate Report with a real document.");
      setFullReportData(null);
      return;
    }

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

  const [editedSummary, setEditedSummary] = useState<string>("");
  const [editSaveError, setEditSaveError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);

  // Generate report modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateStep, setGenerateStep] = useState<'form' | 'generating' | 'complete'>('form');
  const [generateMetrics, setGenerateMetrics] = useState<string[]>([]);
  const [selectedDiscrepancyLevels, setSelectedDiscrepancyLevels] = useState<string[]>([]);
  const [reportTimeframeFrom, setReportTimeframeFrom] = useState('');
  const [reportTimeframeTo, setReportTimeframeTo] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [openModalFilter, setOpenModalFilter] = useState<string | null>(null);
  const [availableDocuments, setAvailableDocuments] = useState<{id: number; title: string}[]>([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<number[]>([]);
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [generateError, setGenerateError] = useState('');
  const [generatedReports, setGeneratedReports] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    getDocuments().then((data: unknown) => {
      const docs = (data as Record<string, unknown>[]).map((d) => ({
        id: d.id as number,
        title: (d.originalFilename ?? d.filename ?? `Document #${d.id}`) as string,
      }));
      setAvailableDocuments(docs);
    }).catch(() => {});
  }, []);

  const closeGenerateModal = () => {
    setShowGenerateModal(false);
    setGenerateStep('form');
    setGenerateMetrics([]);
    setSelectedDiscrepancyLevels([]);
    setReportTimeframeFrom('');
    setReportTimeframeTo('');
    setReportDescription('');
    setOpenModalFilter(null);
    setGenerateError('');
    setGeneratedReports([]);
    setSelectedDocumentIds([]);
    setDocSearchQuery('');
  };

  const handleGenerate = async () => {
    if (selectedDocumentIds.length === 0) return;
    if (isExhausted) { setGenerateError('API balance exhausted. Please recharge to use AI features.'); return; }
    setGenerateStep('generating');
    setGenerateError('');
    try {
      const parts: string[] = [];
      if (generateMetrics.length > 0) parts.push(`Focus on these metrics: ${generateMetrics.join(', ')}.`);
      if (selectedDiscrepancyLevels.length > 0) parts.push(`Highlight ${selectedDiscrepancyLevels.join(', ')} severity discrepancies.`);
      if (reportTimeframeFrom || reportTimeframeTo) parts.push(`Analysis period: ${reportTimeframeFrom || 'start'} to ${reportTimeframeTo || 'present'}.`);
      if (reportDescription) parts.push(reportDescription);
      const instructions = parts.join(' ') || 'Provide a comprehensive financial audit report.';

      const results: Record<string, unknown>[] = [];
      for (const docId of selectedDocumentIds) {
        const result = await generateCustomReport({
          documentId: docId,
          customInstructions: instructions,
          startPeriod: reportTimeframeFrom || undefined,
          endPeriod: reportTimeframeTo || undefined,
        }) as Record<string, unknown>;
        results.push(result);
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
      }
      setGeneratedReports(results);
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
          const finalizedAt = (r.signedAt ?? r.finalizedAt ?? r.signed_at ?? r.finalized_at ?? null) as string | null;
          const formatDate = (iso: string) => {
            const d = new Date(iso);
            if (isNaN(d.getTime())) return iso;
            return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) +
              " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
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
          <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-[#475467]">
            Generate reports from uploaded documents and cater their focus
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
                Date &amp; Time Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date &amp; Time Finalized
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(() => {
              const filtered = reports.filter(report => {
                if (debouncedSearch && ![report.title, report.status].some(f => f.toLowerCase().includes(debouncedSearch.toLowerCase()))) return false;
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
                return true;
              });

              if (!loadingReports && reports.length === 0) {
                return (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <svg className="size-12 text-[#d0d5dd]" fill="none" viewBox="0 0 48 48">
                          <rect x="8" y="6" width="32" height="36" rx="4" stroke="currentColor" strokeWidth="2"/>
                          <path d="M24 18v12M19 24l5-6 5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                          <p className="font-['Figtree:Medium',sans-serif] font-medium text-[16px] text-black mb-1">No reports yet</p>
                          <p className="text-[13px] text-[#667085]">Generate your first report by clicking Generate Report above.</p>
                        </div>
                        <button
                          onClick={() => setShowGenerateModal(true)}
                          className="h-[36px] px-4 bg-[#144430] rounded-[8px] text-[13px] text-white font-medium hover:bg-[#0f3324] transition-colors"
                        >
                          Generate Report
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              if (!loadingReports && reports.length > 0 && filtered.length === 0) {
                return (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <p className="text-[14px] text-[#667085]">No reports match your filters.{" "}
                        <button
                          onClick={() => {
                            setStatusFilter([]);
                            setDateCreatedFrom("");
                            setDateCreatedTo("");
                            setDateFinalizedFrom("");
                            setDateFinalizedTo("");
                            setSearchQuery("");
                          }}
                          className="text-[#144430] font-medium hover:underline"
                        >
                          Clear filters
                        </button>
                      </p>
                    </td>
                  </tr>
                );
              }

              return filtered.map((report, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 cursor-pointer ${selectedReport?.apiId === report.apiId ? "bg-gray-100" : ""}`}
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
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                    {report.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                    {report.finalizedDate ?? "—"}
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>

      {/* Side Panel */}
      {selectedReport && (
        <div 
          className={`fixed top-0 h-screen bg-white border-l border-[#eaecf0] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] transition-all duration-300 ${
            isPanelExpanded ? (isFullWidth ? '' : 'w-[500px]') : 'w-0'
          }`}
          style={{ zIndex: 1000, right: chatOpen ? 420 : 0, boxShadow: chatOpen ? '-12px 0 20px rgba(0,0,0,0.08)' : undefined, ...(isPanelExpanded && isFullWidth ? { width: `calc(100vw - 187px${chatOpen ? ' - 420px' : ''})` } : {}) }}
        >
          {isPanelExpanded && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="border-b border-[#eaecf0] px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Tooltip label={isFullWidth ? "Collapse panel" : "Expand panel"} position="bottom">
                    <button
                      onClick={() => setIsFullWidth(!isFullWidth)}
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
                  {selectedReport.apiId > 0 && (
                    <Tooltip label="Download as PDF" position="bottom">
                      <button
                        onClick={openExportModal}
                        className="flex items-center justify-center size-[32px] rounded-lg text-[#667085] hover:text-black hover:bg-gray-50 transition-colors"
                      >
                        <svg className="size-4 shrink-0" fill="none" viewBox="0 0 20 20">
                          <path d="M17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5M5.83333 8.33333L10 12.5M10 12.5L14.1667 8.33333M10 12.5V2.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </Tooltip>
                  )}
                </div>
                <Tooltip label="Close panel" position="bottom">
                  <button
                    onClick={() => { setSelectedReport(null); setIsFullWidth(false); setIsEditing(false); }}
                    className="flex items-center justify-center size-[32px] rounded-lg text-[#667085] hover:text-black hover:bg-gray-50 transition-colors"
                  >
                    <svg className="size-4 shrink-0" fill="none" viewBox="0 0 20 20">
                      <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </Tooltip>
              </div>

              {/* Content */}
              <div
                className={`flex-1 px-6 pt-6 pb-24 ${isEditing ? 'flex flex-col min-h-0' : 'overflow-y-auto'}`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Report title + status */}
                <div className="mb-5 shrink-0">
                  <h2 className="font-['Figtree:Medium',sans-serif] text-[20px] leading-[30px] text-black mb-2">
                    {selectedReport.title}
                  </h2>
                  <div className="flex gap-2 text-[12px] text-[#52565c] mb-3">
                    <span>Date Generated: {selectedReport.date}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-['Inter:Regular',sans-serif] ${selectedReport.status === "Finalized" ? "bg-[#ecfdf3] text-[#027a48]" : "bg-[#e8f0fe] text-[#1a56db]"}`}>
                      {selectedReport.status === "Finalized" ? "Finalized" : "Needs Approval"}
                    </span>
                  </div>
                </div>

                {/* Report content */}
                <div className={`flex flex-col gap-2 ${isEditing ? 'flex-1 min-h-0' : ''}`}>
                  {editSaveError && (
                    <div className="px-3 py-2 bg-[#fef3f2] border border-[#fca5a5] rounded-[8px] shrink-0">
                      <p className="text-[12px] text-[#b42318]">{editSaveError}</p>
                    </div>
                  )}
                  {(fullReportData?.executiveSummary || fullReportData?.executive_summary || isEditing) ? (
                    <div className={isEditing ? 'flex-1 flex flex-col min-h-0' : ''}>
                      {isEditing ? (
                        <textarea
                          value={editedSummary}
                          onChange={(e) => setEditedSummary(e.target.value)}
                          className="flex-1 min-h-0 w-full px-3 py-2.5 border border-[#144430] rounded-[8px] text-[13px] text-[#344054] leading-[22px] resize-none focus:outline-none focus:ring-1 focus:ring-[#144430]"
                        />
                      ) : (
                        <p className="text-[13px] text-[#475467] leading-[22px]">{String(fullReportData?.executiveSummary ?? fullReportData?.executive_summary ?? '')}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[13px] text-[#667085] italic">{reportContent || 'No content available.'}</p>
                  )}
                </div>
              </div>

              {/* Footer Buttons — hidden for approved reports */}
              {selectedReport.status !== "Finalized" && (
                <div className="absolute bottom-0 left-0 right-0 px-6 py-3 bg-white border-t-2 border-[#eaecf0]">
                  {finalizeError && (
                    <div className="mb-3 px-3 py-2 bg-[#fef3f2] border border-[#fca5a5] rounded-[8px] flex items-start gap-2">
                      <svg className="size-4 text-[#b42318] shrink-0 mt-0.5" fill="none" viewBox="0 0 16 16"><path d="M8 5v4M8 11h.01M2 8a6 6 0 1 0 12 0A6 6 0 0 0 2 8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      <p className="text-[11px] text-[#b42318] flex-1">{finalizeError}</p>
                      <button onClick={() => setFinalizeError(null)} className="text-[#b42318] shrink-0"><svg className="size-3" fill="none" viewBox="0 0 12 12"><path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg></button>
                    </div>
                  )}
                  <div className="flex gap-4 justify-center items-center">
                    {/* Edit / Save Button */}
                    <button
                      disabled={editSaving}
                      onClick={async () => {
                        if (isEditing) {
                          if (!selectedReport?.apiId) return;
                          setEditSaving(true);
                          setEditSaveError(null);
                          try {
                            const updated = await editReport(selectedReport.apiId, { executiveSummary: editedSummary }) as Record<string, unknown>;
                            const newData = { ...(fullReportData ?? {}), executiveSummary: editedSummary, executive_summary: editedSummary };
                            reportDataCache.current.set(selectedReport.apiId, newData);
                            setFullReportData(newData);
                            if (updated) {
                              reportDataCache.current.set(selectedReport.apiId, updated);
                              setFullReportData(updated);
                            }
                            setIsEditing(false);
                            setShowSaveConfirmation(true);
                          } catch (err) {
                            setEditSaveError(err instanceof Error ? err.message : 'Failed to save changes.');
                          } finally {
                            setEditSaving(false);
                          }
                        } else {
                          setEditedSummary(String(fullReportData?.executiveSummary ?? fullReportData?.executive_summary ?? ""));
                          setEditSaveError(null);
                          setIsEditing(true);
                        }
                      }}
                      className="h-10 px-4 w-[124px] border border-[#c9cdd6] rounded-[10px] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isEditing ? (
                        <>
                          <svg className="size-4" viewBox="0 0 20 20" fill="none">
                            <path d="M15.833 17.5H4.167A1.667 1.667 0 0 1 2.5 15.833V4.167A1.667 1.667 0 0 1 4.167 2.5h9.166L17.5 6.667v9.166A1.667 1.667 0 0 1 15.833 17.5Z" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14.167 17.5V10.833H5.833V17.5M5.833 2.5v4.167h6.667" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="font-['Figtree:Bold',sans-serif] text-[13px] text-black">Save</span>
                        </>
                      ) : (
                        <>
                          <svg className="size-4" viewBox="0 0 24 24" fill="none">
                            <path clipRule="evenodd" d={svgPaths.p3d4e8980} fill="#667085" fillRule="evenodd" />
                          </svg>
                          <span className="font-['Figtree:Bold',sans-serif] text-[13px] text-black">Edit</span>
                        </>
                      )}
                    </button>
                    {/* Sign Off Button */}
                    <button
                      onClick={async () => {
                        if (!selectedReport || selectedReport.apiId === 0) return;
                        setFinalizeError(null);
                        try {
                          await finalizeReport(selectedReport.apiId);
                          const now = new Date();
                          const today = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) +
                            " " + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                          setReports(prev => prev.map(r =>
                            r.apiId === selectedReport.apiId
                              ? { ...r, status: 'Finalized', finalizedDate: today }
                              : r
                          ));
                          setSelectedReport(prev => prev ? { ...prev, status: 'Finalized', finalizedDate: today } : prev);
                        } catch (err) {
                          setFinalizeError(err instanceof Error ? err.message : 'Failed to finalize report. Please try again.');
                        }
                      }}
                      className="h-10 px-4 w-[217px] bg-[#144430] rounded-[10px] flex items-center justify-center gap-2"
                    >
                      <svg className="size-4" viewBox="0 0 20 15" fill="none">
                        <path d="M18 2L7 13L2 8" stroke="#EAECF0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
                      </svg>
                      <span className="font-['Figtree:Bold',sans-serif] text-[13px] text-white">Finalize Report</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Export PDF Modal */}
      {showExportModal && selectedReport && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowExportModal(false)} />
          <div className="relative bg-white rounded-[16px] shadow-xl w-full max-w-[520px] mx-4 p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-['Figtree:Medium',sans-serif] font-medium text-[20px] text-black">Export as PDF</h2>
                <p className="text-[13px] text-[#667085] mt-1">Choose what to include in the report</p>
              </div>
              <button onClick={() => setShowExportModal(false)} className="text-[#667085] hover:text-black">
                <svg className="size-5" fill="none" viewBox="0 0 20 20"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            {/* Sections */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-[13px] font-['Figtree:Medium',sans-serif] font-medium text-[#344054]">Report Sections</p>
                <button
                  onClick={() => setSelectedSections(
                    selectedSections.length === SECTION_OPTIONS.length ? [] : SECTION_OPTIONS.map(s => s.key)
                  )}
                  className="text-[12px] text-[#144430] font-medium hover:underline"
                >
                  {selectedSections.length === SECTION_OPTIONS.length ? "Deselect all" : "Select all"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SECTION_OPTIONS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => toggleSection(key)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] border text-left transition-colors ${
                      selectedSections.includes(key)
                        ? "bg-[#f0f9f4] border-[#144430]"
                        : "bg-white border-[#d0d5dd] hover:bg-gray-50"
                    }`}
                  >
                    <div className={`size-4 rounded border flex items-center justify-center shrink-0 ${
                      selectedSections.includes(key) ? "bg-[#144430] border-[#144430]" : "border-[#d0d5dd]"
                    }`}>
                      {selectedSections.includes(key) && (
                        <svg className="size-2.5" viewBox="0 0 10 10" fill="none"><path d="M8 2L4 8L2 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      )}
                    </div>
                    <span className="text-[13px] text-[#344054]">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Metrics filter */}
            {availableMetricKeys.length > 0 && selectedSections.includes("metrics") && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[13px] font-['Figtree:Medium',sans-serif] font-medium text-[#344054]">Metrics to Include</p>
                  <button
                    onClick={() => setSelectedMetrics(
                      selectedMetrics.length === availableMetricKeys.length ? [] : [...availableMetricKeys]
                    )}
                    className="text-[12px] text-[#144430] font-medium hover:underline"
                  >
                    {selectedMetrics.length === availableMetricKeys.length ? "Deselect all" : "Select all"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto">
                  {availableMetricKeys.map(key => (
                    <button
                      key={key}
                      onClick={() => toggleMetric(key)}
                      className={`h-[28px] px-3 rounded-full border text-[12px] font-medium transition-colors ${
                        selectedMetrics.includes(key)
                          ? "bg-[#144430] border-[#144430] text-white"
                          : "bg-white border-[#d0d5dd] text-[#344054] hover:bg-gray-50"
                      }`}
                    >
                      {key.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowExportModal(false)} className="h-[40px] px-5 border border-[#d0d5dd] rounded-[10px] text-[14px] text-[#344054] hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={selectedSections.length === 0 || exportLoading}
                className="h-[40px] px-6 bg-[#144430] rounded-[10px] text-[14px] text-white font-medium hover:bg-[#0f3324] disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {exportLoading ? "Opening…" : "Generate & Download PDF"}
              </button>
            </div>
          </div>
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
          <div className="relative bg-white rounded-[16px] shadow-xl w-full max-w-[680px] mx-4 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 48px)' }}>

            {/* Header — fixed */}
            <div className="px-8 pt-8 pb-5 shrink-0">
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
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col gap-6">

            {/* ── FORM ── */}
            {generateStep === 'form' && (
              <>
                {/* Document selector */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[14px] font-['Figtree:Medium',sans-serif] font-medium text-black">
                      Documents to Analyze
                      {selectedDocumentIds.length > 0 && (
                        <span className="ml-2 text-[12px] font-normal text-[#667085]">{selectedDocumentIds.length} selected</span>
                      )}
                    </label>
                    {availableDocuments.length > 0 && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedDocumentIds(availableDocuments.map(d => d.id))}
                          className="text-[12px] text-[#144430] font-medium hover:underline"
                        >
                          Select all
                        </button>
                        {selectedDocumentIds.length > 0 && (
                          <button
                            onClick={() => setSelectedDocumentIds([])}
                            className="text-[12px] text-[#667085] font-medium hover:underline"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Search within doc list */}
                  {availableDocuments.length > 5 && (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search documents…"
                        value={docSearchQuery}
                        onChange={e => setDocSearchQuery(e.target.value)}
                        className="w-full h-[36px] px-3 pl-9 border border-[#d0d5dd] rounded-lg text-[13px] focus:outline-none focus:border-[#667085]"
                      />
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#98a2b3]" fill="none" viewBox="0 0 20 20">
                        <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}

                  {/* Scrollable checklist */}
                  <div className="border border-[#d0d5dd] rounded-lg overflow-hidden">
                    {availableDocuments.length === 0 ? (
                      <p className="px-4 py-3 text-[13px] text-[#667085] italic">No documents uploaded yet.</p>
                    ) : (
                      <div className="max-h-[160px] overflow-y-auto divide-y divide-[#f2f4f7]">
                        {availableDocuments
                          .filter(d => !docSearchQuery || d.title.toLowerCase().includes(docSearchQuery.toLowerCase()))
                          .map(doc => {
                            const checked = selectedDocumentIds.includes(doc.id);
                            return (
                              <button
                                key={doc.id}
                                type="button"
                                onClick={() =>
                                  setSelectedDocumentIds(prev =>
                                    checked ? prev.filter(id => id !== doc.id) : [...prev, doc.id]
                                  )
                                }
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${checked ? 'bg-[#f2f4f7]' : 'bg-white hover:bg-[#f9fafb]'}`}
                              >
                                <div className={`size-4 rounded border flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-[#144430] border-[#144430]' : 'border-[#d0d5dd]'}`}>
                                  {checked && (
                                    <svg className="size-2.5" viewBox="0 0 10 10" fill="none">
                                      <path d="M8 2L4 8L2 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                                <span className="text-[13px] text-[#344054] truncate">{doc.title}</span>
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
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
                      selected={generateMetrics}
                      onChange={setGenerateMetrics}
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
                    disabled={selectedDocumentIds.length === 0}
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
                  <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="none">
                    <path d="M16.667 5L7.5 14.167 3.333 10" stroke="#027a48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-['Figtree:Medium',sans-serif] font-medium text-[14px]">
                    {generatedReports.length === 1
                      ? 'Draft generated successfully! It has been added to your Reports list with "Needs Approval" status.'
                      : `${generatedReports.length} drafts generated successfully! Each has been added to your Reports list with "Needs Approval" status.`}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {generatedReports.map((r, i) => (
                    <div key={i} className="bg-[#f9fafb] border border-[#eaecf0] rounded-[10px] p-4 flex flex-col gap-1.5">
                      <p className="font-['Figtree:Medium',sans-serif] font-medium text-[13px] text-black truncate">
                        {String(r.title ?? r.documentName ?? `Report ${i + 1}`)}
                      </p>
                      {r.executiveSummary && (
                        <p className="text-[12px] text-[#475467] leading-[19px] line-clamp-2">
                          {String(r.executiveSummary).slice(0, 200)}{String(r.executiveSummary).length > 200 ? '…' : ''}
                        </p>
                      )}
                    </div>
                  ))}
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
                    <span className="font-['Figtree:Bold',sans-serif] text-[14px] text-white">
                      {generatedReports.length === 1 ? 'View Report' : 'View Reports'}
                    </span>
                  </button>
                </div>
              </>
            )}
            </div>{/* end scrollable body */}
          </div>{/* end modal card */}
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPreviewModal && previewHtml && selectedReport && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowPreviewModal(false)} />
          <div className="relative bg-white rounded-[16px] shadow-2xl w-full max-w-5xl mx-4 flex flex-col" style={{ maxHeight: 'calc(100vh - 48px)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#eaecf0] shrink-0">
              <h2 className="font-['Figtree:Medium',sans-serif] font-medium text-[18px] text-black">Report Preview</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-[#667085] hover:text-black transition-colors"
              >
                <svg className="size-5" fill="none" viewBox="0 0 20 20">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* iframe */}
            <div className="flex-1 overflow-hidden">
              <iframe
                srcDoc={previewHtml.replace(/window\.onload\s*=[\s\S]*?\};/, 'window.onload = function(){};')}
                style={{ width: '100%', height: 'calc(100vh - 200px)', border: 'none' }}
                title="Report Preview"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#eaecf0] shrink-0">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="h-[40px] px-5 border border-[#d0d5dd] rounded-[10px] text-[14px] text-[#344054] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await exportReportPresentation(
                      selectedReport.apiId,
                      selectedSections,
                      selectedMetrics.length > 0 ? selectedMetrics : undefined,
                    );
                  } catch { /* silently fail */ }
                  setShowPreviewModal(false);
                }}
                className="h-[40px] px-6 bg-[#144430] rounded-[10px] text-[14px] text-white font-medium hover:bg-[#0f3324] transition-colors flex items-center gap-2"
              >
                <svg className="size-4 shrink-0" fill="none" viewBox="0 0 20 20">
                  <path d="M17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5M5.83333 8.33333L10 12.5M10 12.5L14.1667 8.33333M10 12.5V2.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed panel indicator */}
      {selectedReport && !isPanelExpanded && (
        <button
          onClick={() => setIsPanelExpanded(true)}
          className="fixed top-1/2 -translate-y-1/2 bg-white border border-[#eaecf0] rounded-l-lg p-2 shadow-lg hover:bg-gray-50 transition-all duration-300"
          style={{ zIndex: 1000, right: chatOpen ? 420 : 0 }}
        >
          <svg className="size-5 text-[#667085]" fill="none" viewBox="0 0 16 16">
            <path d={svgPaths.p14ca9100} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </button>
      )}
    </div>
  );
}