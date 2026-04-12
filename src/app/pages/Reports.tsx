import { useState } from "react";
import svgPaths from "../../imports/DocumentIntelligencePrototype/svg-9a8cfnzrn9";
import FilterButton from "../components/FilterButton";

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reportContent, setReportContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

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

  const defaultContent = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nLorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.\n\nLorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.`;

  const openReport = (report: Report) => {
    setSelectedReport(report);
    setIsEditing(false);
    setReportContent(defaultContent);
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

  const closeGenerateModal = () => {
    setShowGenerateModal(false);
    setGenerateStep('form');
    setSelectedMetrics([]);
    setSelectedDiscrepancyLevels([]);
    setReportTimeframeFrom('');
    setReportTimeframeTo('');
    setReportDescription('');
    setOpenModalFilter(null);
  };

  const handleGenerate = () => {
    setGenerateStep('generating');
    setTimeout(() => setGenerateStep('complete'), 3500);
  };

  type Report = { title: string; id: string; type: string; category: string; date: string; status: string; finalizedDate?: string; aiConfidence: string };

  const [reports, setReports] = useState<Report[]>([
    { title: "Q1 2026 Financial Summary", id: "FR-0001-2026", type: "Quarterly Report", category: "Financial Overview", date: "03/31/2026", status: "Finalized", finalizedDate: "04/04/26", aiConfidence: "95%" },
    { title: "Annual Budget Forecast", id: "FR-0002-2026", type: "Budget Analysis", category: "Financial Planning", date: "03/28/2026", status: "Needs Approval", aiConfidence: "87%" },
    { title: "Expense Reconciliation Report", id: "FR-0003-2026", type: "Expense Report", category: "Accounting", date: "03/25/2026", status: "Finalized", finalizedDate: "04/04/26", aiConfidence: "92%" },
    { title: "Revenue Analysis - March", id: "FR-0004-2026", type: "Revenue Report", category: "Financial Analysis", date: "03/30/2026", status: "Needs Approval", aiConfidence: "78%" },
    { title: "Cash Flow Statement", id: "FR-0005-2026", type: "Financial Statement", category: "Treasury", date: "03/27/2026", status: "Finalized", finalizedDate: "04/04/26", aiConfidence: "98%" },
    { title: "Tax Compliance Review", id: "FR-0006-2026", type: "Compliance Report", category: "Tax & Legal", date: "03/26/2026", status: "Needs Approval", aiConfidence: "83%" },
    { title: "Profit & Loss Statement", id: "FR-0007-2026", type: "Financial Statement", category: "Accounting", date: "03/29/2026", status: "Finalized", finalizedDate: "04/04/26", aiConfidence: "91%" },
  ]);

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
              <div className="h-[68.8px] border-b border-[#eaecf0] px-6 flex items-center justify-between">
                <div className="flex gap-3">
                  {/* Double chevron expand/collapse button */}
                  <button
                    onClick={() => setIsFullWidth(!isFullWidth)}
                    className="size-5 text-[#667085] hover:text-gray-800"
                  >
                    <svg className="size-full" fill="none" viewBox="0 0 20 20">
                      {isFullWidth ? (
                        <>
                          {/* Double chevron right — collapse */}
                          <path d="M0 9.16667L4.16667 5L0 0.833333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" transform="translate(5, 5)"/>
                          <path d="M0 9.16667L4.16667 5L0 0.833333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" transform="translate(9, 5)"/>
                        </>
                      ) : (
                        <>
                          {/* Double chevron left — expand */}
                          <path d="M5 9.16667L0.833333 5L5 0.833333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" transform="translate(5, 5)"/>
                          <path d="M5 9.16667L0.833333 5L5 0.833333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" transform="translate(10, 5)"/>
                        </>
                      )}
                    </svg>
                  </button>
                  {/* Download button */}
                  <button className="size-5 text-[#667085] hover:text-gray-800">
                    <svg className="size-full" fill="none" viewBox="0 0 20 20">
                      <path d="M17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5M5.83333 8.33333L10 12.5M10 12.5L14.1667 8.33333M10 12.5V2.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                {/* Close button */}
                <button
                  onClick={() => { setSelectedReport(null); setIsFullWidth(false); setIsEditing(false); }}
                  className="size-5 text-[#667085] hover:text-gray-800"
                >
                  <svg className="size-full" fill="none" viewBox="0 0 20 20">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div
                className="flex-1 overflow-y-auto px-6 pt-6 pb-24"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Report Title and Status */}
                <div className="mb-6">
                  <h2 className="font-['Figtree:Medium',sans-serif] text-[20px] leading-[30px] text-black mb-2">
                    {selectedReport.title}
                  </h2>
                  <div className="flex gap-2 text-[12px] text-[#52565c] mb-3">
                    <span>Date Generated: {selectedReport.date}</span>
                    <span>Type: {selectedReport.type}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[12px] text-[#52565c]">AI Confidence:</span>
                    {(() => { const p = getConfidencePill(selectedReport.aiConfidence); return (
                      <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-['Inter:Regular',sans-serif] ${p.classes}`}>
                        {p.label}
                      </span>
                    ); })()}
                    <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-['Inter:Bold',sans-serif] font-bold ${
                      selectedReport.status === "Finalized"
                        ? "bg-[#ecfdf3] text-[#027a48]"
                        : "bg-[#e8f0fe] text-[#1a56db]"
                    }`}>
                      {selectedReport.status === "Finalized" ? "Finalized" : "Needs Approval"}
                    </span>
                    {selectedReport.status === "Finalized" && selectedReport.finalizedDate && (
                      <span className="text-[12px] text-[#027a48]">
                        Date Finalized: {selectedReport.finalizedDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body content */}
                {isEditing ? (
                  <textarea
                    value={reportContent}
                    onChange={(e) => setReportContent(e.target.value)}
                    className="w-full h-full min-h-[400px] text-[14px] text-[#475467] leading-[22.75px] border border-[#d0d5dd] rounded-lg px-4 py-3 resize-none focus:outline-none focus:border-[#667085] bg-[#f9fafb]"
                    style={{ height: 'calc(100vh - 320px)' }}
                  />
                ) : (
                  <div className="text-[14px] text-[#475467] space-y-4 leading-[22.75px]">
                    {reportContent.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
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
                    <button className="h-[53px] px-4 w-[217px] bg-[#144430] rounded-[10px] flex items-center justify-center gap-2">
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
                    disabled={(selectedMetrics.length === 0 && selectedDiscrepancyLevels.length === 0) || (!reportTimeframeFrom && !reportTimeframeTo)}
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
                    The AI has compiled a report covering
                    {selectedMetrics.length > 0 && <> <strong>{selectedMetrics.join(', ')}</strong></>}
                    {selectedMetrics.length > 0 && selectedDiscrepancyLevels.length > 0 && <> and</>}
                    {selectedDiscrepancyLevels.length > 0 && <> <strong>{selectedDiscrepancyLevels.join(', ')}</strong> discrepancies</>}
                    {(reportTimeframeFrom || reportTimeframeTo) && <> for the period {reportTimeframeFrom || '…'} – {reportTimeframeTo || '…'}</>}.
                    {' '}Financial performance indicators have been extracted from ingested documents, including revenue trends, expense breakdowns, and variance analysis.
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      const newId = `FR-${String(reports.length + 1).padStart(4, '0')}-2026`;
                      const hasMetrics = selectedMetrics.length > 0;
                      const hasDiscrepancies = selectedDiscrepancyLevels.length > 0;
                      const title = hasMetrics && hasDiscrepancies
                        ? `Custom Analysis Report`
                        : hasMetrics
                          ? `${selectedMetrics[0]}${selectedMetrics.length > 1 ? ' & More' : ''} Report`
                          : `${selectedDiscrepancyLevels.join('/')} Discrepancy Report`;
                      const newReport: Report = {
                        title,
                        id: newId,
                        type: hasMetrics && hasDiscrepancies ? 'Combined Report' : hasMetrics ? 'Key Metrics Report' : 'Discrepancy Report',
                        category: hasMetrics ? 'Financial Analysis' : 'Audit & Review',
                        date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
                        status: 'Needs Approval',
                        aiConfidence: '89%',
                      };
                      setReports(prev => [newReport, ...prev]);
                      closeGenerateModal();
                      openReport(newReport);
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